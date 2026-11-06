// Same-origin client for the local service (/api/v1). Owner browser authentication: HttpOnly
// session cookie + CSRF token kept in memory only (never in storage). Every mutation carries
// Idempotency-Key (= operationId), X-Profile-Epoch, If-Match: "<revision>" and X-CSRF-Token.
// A 401 or CSRF 403 refreshes the session once and resends the *same* operation and body.
import { ApiRequestError, needsSessionRefresh } from './errors.ts';
import type {
  ApiErrorBody,
  Artifact,
  Command,
  Envelope,
  Health,
  OwnerWriteBase,
  Receipt,
  ResourceType,
  Session,
} from './types.ts';

export type Transport = (url: string, init: RequestInit) => Promise<Response>;

export interface ApiClientEvents {
  onSession?: (session: Session) => void;
  /** The session cannot be refreshed: the learner must reopen the app through the launcher. */
  onAuthLost?: () => void;
  /** The service reports another profile epoch (a restore replaced the profile). */
  onEpochChanged?: (serviceEpoch: number) => void;
  /** A request failed at the network level (service stopped or unreachable). */
  onNetworkFailure?: () => void;
}

interface RequestOptions {
  readonly method: 'GET' | 'POST' | 'DELETE';
  readonly body?: BodyInit;
  readonly headers?: Readonly<Record<string, string>>;
  /** Refresh the session and retry once on 401 / CSRF 403. */
  readonly refreshOnAuth: boolean;
  readonly signal?: AbortSignal;
}

export function mutationHeaders(operationId: string, profileEpoch: number, expectedRevision: number): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Idempotency-Key': operationId,
    'X-Profile-Epoch': String(profileEpoch),
    'If-Match': `"${expectedRevision}"`,
  };
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  if (!value || typeof value !== 'object') return false;
  const body = value as Record<string, unknown>;
  return typeof body['code'] === 'string' && typeof body['messageKey'] === 'string' && typeof body['retryable'] === 'boolean';
}

async function readErrorBody(response: Response): Promise<ApiErrorBody | undefined> {
  try {
    const json: unknown = await response.json();
    return isErrorBody(json) ? json : undefined;
  } catch {
    return undefined;
  }
}

function isEnvelope(value: unknown): value is Envelope<unknown> {
  if (!value || typeof value !== 'object') return false;
  const env = value as Record<string, unknown>;
  return env['apiVersion'] === '1' && typeof env['profileEpoch'] === 'number' && 'data' in env;
}

export class ApiClient {
  readonly base: string;
  private readonly transport: Transport;
  private csrfToken: string | null = null;
  private currentSession: Session | null = null;
  private refreshing: Promise<Session> | null = null;
  events: ApiClientEvents = {};

  constructor(options: { base?: string; transport?: Transport } = {}) {
    this.base = options.base ?? '/api/v1';
    this.transport = options.transport ?? ((url, init) => fetch(url, init));
  }

  get session(): Session | null {
    return this.currentSession;
  }

  /** Epoch of the authenticated profile; required by every write. */
  get profileEpoch(): number {
    if (!this.currentSession) throw new ApiRequestError('http', 401);
    return this.currentSession.profileEpoch;
  }

  mediaUrl(sha256: string): string {
    return `${this.base}/media/${encodeURIComponent(sha256)}`;
  }

  /** Download routes may be given relative to the API base or as absolute same-origin paths. */
  downloadUrl(route: string): string | null {
    if (!route.startsWith('/') || route.startsWith('//')) return null;
    return route.startsWith(`${this.base}/`) ? route : `${this.base}${route}`;
  }

  private setSession(session: Session): void {
    const previous = this.currentSession;
    this.currentSession = session;
    this.csrfToken = session.csrfToken;
    if (previous && previous.profileEpoch !== session.profileEpoch) this.events.onEpochChanged?.(session.profileEpoch);
    this.events.onSession?.(session);
  }

  private async rawFetch(path: string, options: RequestOptions): Promise<Response> {
    const headers: Record<string, string> = { Accept: 'application/json', ...options.headers };
    if (options.method !== 'GET' && this.csrfToken) headers['X-CSRF-Token'] = this.csrfToken;
    try {
      return await this.transport(`${this.base}${path}`, {
        method: options.method,
        headers,
        body: options.body,
        credentials: 'same-origin',
        cache: 'no-store',
        redirect: 'error',
        referrerPolicy: 'no-referrer',
        signal: options.signal,
      });
    } catch (error) {
      if (options.signal?.aborted) throw error;
      this.events.onNetworkFailure?.();
      throw new ApiRequestError('network', 0, undefined, error instanceof Error ? error.message : 'network');
    }
  }

  private async request(path: string, options: RequestOptions): Promise<Response> {
    const response = await this.rawFetch(path, options);
    if (!options.refreshOnAuth || response.ok || (response.status !== 401 && response.status !== 403)) return response;
    const body = await readErrorBody(response.clone());
    if (!needsSessionRefresh(response.status, body)) return response;
    try {
      await this.readSession();
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) this.events.onAuthLost?.();
      throw new ApiRequestError('http', response.status, body);
    }
    // Same operation, same body, refreshed CSRF token.
    return this.rawFetch(path, options);
  }

  private async failure(response: Response): Promise<ApiRequestError> {
    return new ApiRequestError('http', response.status, await readErrorBody(response));
  }

  private async json<T>(response: Response): Promise<T> {
    try {
      return (await response.json()) as T;
    } catch {
      throw new ApiRequestError('invalid-response', response.status);
    }
  }

  private checkEpoch(epoch: number): void {
    if (this.currentSession && epoch !== this.currentSession.profileEpoch) this.events.onEpochChanged?.(epoch);
  }

  async health(signal?: AbortSignal): Promise<Health> {
    const response = await this.rawFetch('/health', { method: 'GET', refreshOnAuth: false, signal });
    if (!response.ok) throw await this.failure(response);
    const health = await this.json<Health>(response);
    if (!health || health.apiVersion !== '1') throw new ApiRequestError('invalid-response', response.status);
    return health;
  }

  /** Exchanges the one-use launcher nonce for the session cookie + in-memory CSRF token. */
  async exchange(nonce: string): Promise<Session> {
    const response = await this.rawFetch('/auth/exchange', {
      method: 'POST',
      refreshOnAuth: false,
      body: JSON.stringify({ nonce }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw await this.failure(response);
    const envelope = await this.json<Envelope<Session>>(response);
    if (!isEnvelope(envelope)) throw new ApiRequestError('invalid-response', response.status);
    this.setSession(envelope.data);
    return envelope.data;
  }

  /** Authenticated session read (refreshes the CSRF token; never extends an expired session). */
  readSession(): Promise<Session> {
    if (!this.refreshing) {
      this.refreshing = (async () => {
        try {
          const response = await this.rawFetch('/auth/session', { method: 'GET', refreshOnAuth: false });
          if (!response.ok) throw await this.failure(response);
          const envelope = await this.json<Envelope<Session>>(response);
          if (!isEnvelope(envelope)) throw new ApiRequestError('invalid-response', response.status);
          this.setSession(envelope.data);
          return envelope.data;
        } finally {
          this.refreshing = null;
        }
      })();
    }
    return this.refreshing;
  }

  async get<T>(path: string, signal?: AbortSignal): Promise<Envelope<T>> {
    const response = await this.request(path, { method: 'GET', refreshOnAuth: true, signal });
    if (!response.ok) throw await this.failure(response);
    const envelope = await this.json<Envelope<T>>(response);
    if (!isEnvelope(envelope)) throw new ApiRequestError('invalid-response', response.status);
    this.checkEpoch(envelope.profileEpoch);
    return envelope;
  }

  async resource<T>(type: ResourceType, id: string, signal?: AbortSignal): Promise<T> {
    const envelope = await this.get<T>(`/resources/${type}/${encodeURIComponent(id)}`, signal);
    return envelope.data;
  }

  /** POST /commands. Resending the same Command object reuses its operationId and identical body. */
  async command(command: Command, signal?: AbortSignal): Promise<Receipt> {
    const response = await this.request('/commands', {
      method: 'POST',
      refreshOnAuth: true,
      body: JSON.stringify(command),
      headers: mutationHeaders(command.operationId, command.profileEpoch, command.expectedRevision),
      signal,
    });
    if (!response.ok) throw await this.failure(response);
    const receipt = await this.json<Receipt>(response);
    if (!receipt || receipt.apiVersion !== '1' || receipt.operationId !== command.operationId) {
      throw new ApiRequestError('invalid-response', response.status);
    }
    return receipt;
  }

  /** Owner-only control writes (tokens, recovery, logout) with the same idempotency headers. */
  async ownerWrite<T, B extends OwnerWriteBase = OwnerWriteBase>(method: 'POST' | 'DELETE', path: string, body: B): Promise<T> {
    const response = await this.request(path, {
      method,
      refreshOnAuth: true,
      body: JSON.stringify(body),
      headers: mutationHeaders(body.operationId, body.profileEpoch, body.expectedRevision),
    });
    if (!response.ok) throw await this.failure(response);
    return this.json<T>(response);
  }

  /** Streams a recovery archive (application/zip) to the owner-only upload route. */
  async uploadArchive(file: Blob, write: OwnerWriteBase): Promise<Artifact> {
    const response = await this.request('/recovery/uploads', {
      method: 'POST',
      refreshOnAuth: true,
      body: file,
      headers: { ...mutationHeaders(write.operationId, write.profileEpoch, write.expectedRevision), 'Content-Type': 'application/zip' },
    });
    if (!response.ok) throw await this.failure(response);
    const envelope = await this.json<Envelope<Artifact>>(response);
    if (!isEnvelope(envelope)) throw new ApiRequestError('invalid-response', response.status);
    return envelope.data;
  }

  /** Recovers the receipt of a write whose response was lost; null when the operation is unknown. */
  async operation(operationId: string): Promise<Receipt | null> {
    const response = await this.request(`/operations/${encodeURIComponent(operationId)}`, { method: 'GET', refreshOnAuth: true });
    if (response.status === 404) return null;
    if (!response.ok) throw await this.failure(response);
    return this.json<Receipt>(response);
  }
}
