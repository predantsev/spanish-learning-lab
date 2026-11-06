# Local API and assistant skill contract v1

This is a planned interface, not a running service. [OpenAPI](openapi.json) and [schemas](schemas.json) are normative wire definitions; [domain semantics](../DOMAIN-SPEC.md) add cross-field/transaction constraints. JSON Schema draft2020-12; OpenAPI3.1.0. A shape passing schema does not establish content truth, authorization or valid domain references.

## Boundary and authentication

Threat boundary: protect against unrelated web origins, unscoped agents, malformed imported data and accidental conflicting writes. The owner account/privileged local review tool and an explicitly trusted replacement-profile source are data authorities. This does not claim protection against a compromised same-user Mac process reading private files. No host security setting is changed by the project.

Base URL is discovered from private `runtime/runtime.json`, never guessed from a port or Chrome tab. Bind127.0.0.1, exact canonical Host+port allowlist; reject DNS-rebinding Host variants, unexpected Origin and forwarded-host headers. Proxy trust disabled. Health permits exact loopback Host without exposing profile/private state. No wildcard CORS/LAN binding. Default body64KiB, answer/draft8,000chars, material20,000chars via≤40 bounded blocks, query100chars, pagination≤100, rate600requests/min/client with mutation burst20/10sec. Imports have their own streamed size limits, not an unlimited JSON exemption. Normalize paths once and reject unsupported content types/additional properties; Ajv coercion/defaults/removal disabled, allErrorsfalse. Compile only application-owned schemas.

Owner browser: launcher creates a256-bit one-use nonce (60sec TTL), places it in URL fragment, UI immediately removes fragment with history.replaceState, exchanges via `POST /auth/exchange`. Nonce never in query/log/referrer. Session cookie HttpOnly, SameSiteStrict, Path=/,8h sliding expiration (24h absolute); local HTTP cannot honestly promise a Secure cookie/TLS. Exact Origin and CSRF token required for cookie mutations; CSRF token returned by exchange, kept in memory and refreshed through authenticated session read. Invalid/expired nonces never destroy an existing valid session. Opening another tab with a valid cookie consumes its nonce but reuses the same session/CSRF token; it does not rotate them. On session expiry or CSRF mismatch, preserve drafts, refresh session through the launcher/auth read and retry the same operation ID only after authentication. Session.revision is the session revision; profileId/profileRevision explicitly identify the profile used for owner settings/token/recovery If-Match. Session reads never extend an expired session. GET /profile returns owner-only settings/profile revision and optional completed restore operation. GET /auth/tokens returns owner-only IDs/labels/scopes/expiry/revoked metadata and profileRevision, never plaintext secrets. Read-only responses use no-store where private. Responses have nosniff and restrictive CSP: self-only scripts/styles/media/connect, no object/frame/eval/unsafe-inline, base-uri none, frame-ancestors none; permit only the minimum build hashes if bundler requires them. No remote content fetching from supplied URLs. Clipboard/export initiated visibly.

Owner Settings creates a per-agent random256-bit token, displayed once; local skill credentials0600 outside repo. DB stores token hash/scopes, expiry7days default, maximum30days; revoke immediately and rotate without dropping command deduplication. Token creation is a secret-delivery exception: store only hash/metadata and operation receipt, never the secret in receipts/exports. If its response is lost, same-key retry returns409 TOKEN_ALREADY_CREATED with createdEntityId, no second token or recovered secret. Owner UI revokes that ID and reissues under a new operation after refreshing profileRevision. Other writes retain ordinary receipt replay. Agent uses `Authorization: Bearer`, never cookie fallback; no Origin is acceptable for this local CLI bearer client, a supplied foreign Origin is rejected. Tokens are capabilities, not trusted content signatures. Scopes:

| Scope | Allowed operations |
|---|---|
| `context:read` | context list/selected detail; no unrelated answers |
| `course:read` | catalog/ready metadata/materials/selected task context |
| `draft:write` | phrase.capture, material.draft, review.submit, collection.create/patch within private profile |
| `help:write` | support prepare/confirm/cancel for explicit current context |
| `practice:write` | practice.create from installed reviewed IDs within requested scope |
| `preference:write` | preference.set for explicit targets; reversible, no grade manipulation |

Default skill token: context/course/draft/help/practice; preference optional owner-enabled scope. No agent grant for attempt submission, arbitrary live answer editing, raw SQL, file access, host commands, content promotion, review validation, export/restore, token creation or profile deletion. Browser-only operations require session+CSRF; privileged local review/promotion CLI uses a distinct filesystem capability and the review gate, not an agent token. Do not put a privileged token in SKILL.md or runtime.json. First-run authorization UI is necessary during execution; planning creates no token/account.

## Read endpoints and responses

All private envelopes include `apiVersion`, requestId, profileEpoch and resource revision where applicable. `GET /health` is minimal public status only. `GET /capabilities` authenticates, returns supported schema/command versions, current pack hash, instanceId and granted scopes. Reads never mutate activity/scheduling. `GET /contexts` returns at most20 metadata records sorted by last meaningful activity, not full draft text. `GET /contexts/{id}` returns only selected context/task prompt/current saved draft, support state and result references. `GET /catalog` accepts bounded query and optional block/situation/mode, page cursor. `GET /resources/{resourceType}/{id}` returns a typed entity allowed by scope; task answer keys are not exposed by generic reads. `GET /operations/{operationId}` returns an authorized receipt, allowing a lost-write response to be recovered. `GET /media/{sha256}` authenticates browser, supports bounded Range and verifies installed MIME/hash; no remote proxy. A ready material containing a model answer is served through an explicit assistance action when used by the current task.

Opaque cursors bind filter/resource revision, expire15min; stale cursor409 `STALE_CURSOR`. Error envelope: code, Ukrainian display key, requestId, retryable, currentRevision if relevant; no stack/SQL/raw private answer. Statuses400 malformed,401 auth/expired,403 capability/origin/CSRF,404 missing/inaccessible,409 stale/epoch/idempotency/conflict,413 size,422 shape/reference/readiness,429 limit,503 unavailable/save failed. Empty success is never returned for a failed write.

## Commands and concurrency

`POST /commands` accepts `Command`, returns `Receipt`. Every mutation uses Idempotency-Key matching operationId, X-Profile-Epoch matching body, and If-Match matching expectedRevision. For entity creation expectedRevision=0; for existing entities it is their revision. SubjectId identifies that entity. Active-context commands (support.prepare/observe, draft.save, attempt.submit, context.activity) also require contextId/contextRevision and contextSnapshot. GET context issues a random256-bit base64url snapshotToken; the server stores only its hash in a60sec issuance record bound to instanceId, client/session-or-token ID, profileEpoch and contextId/revision. Supply the response snapshotToken as the command contextSnapshot; server validates that lease, not a client timestamp. UI can renew it with a read that does not count as activity. Context close requires revision but no lease. Support confirm/cancel bind the immutable reservation and original context identifiers; they do not require a live-context lease or current context revision. `profileEpoch` is not a bearer secret. Receipt contains operationId, kind, eventSeq, entity references/new revisions, and a typed outcome/entity-reference list; read the referenced resource for its full typed body. Command/schema versions change explicitly; no arbitrary JSON patches or undocumented extra fields.

| Kind | Subject / authority | Payload and domain checks |
|---|---|---|
| `session.start` | new session / browser | lesson/practice-set sourceId or recommended queue, explicit targets/mode/5–20min/maxItems; creates durable queue snapshot. SourceId required for named source, forbidden for recommended. Returns session/task IDs. |
| `session.finish` | session / browser | flush active draft, record actual summary and finished state; may stop early with no fabricated completion. |
| `lesson.progress` | lesson-progress / browser | sessionId, stepId, visit/finish. A lesson is completed only after all required teaching steps were visited and required tasks attempted (unresolved allowed); optional check/perfect score never locks navigation. |
| `context.open` | new context / browser | sessionId, taskRevisionId; task ready and in session. Returns context/draft. |
| `context.activity` | context / browser | activity typing/navigation/submission and active draft revision; service timestamps it. Coalesce typing activity to once/5sec; successful draft.save/submission already count as meaningful activity. Task/draft binding or answer changes increment context revision; read/poll/focus and timestamp-only activity do not. Polling/focus alone never makes it recent. |
| `context.close` | context / browser | no text; marks closed, retains draft. |
| `draft.save` | draft / browser | text, cursor, taskRevisionId; revision conflict preserves both drafts. |
| `attempt.submit` | new attempt / browser | draftId/revision, taskRevisionId, response (text or optionID); exact task/draft/support snapshot. Domain transaction commits before grade response. |
| `support.observe` | context / browser | neutral interface-help/replay/speed-change or learner-reported-help, exact target mappings and detail key; targeted reported help requires≥1 target, never fabricates a grade. |
| `support.prepare` | new reservation / help | selected targetIDs/kind/content blocks, context/task revision; returns supportId and body hash,5min TTL. No verdict/scheduler change yet. |
| `support.request` | new reservation / browser | taskRevisionId, kind rule/targeted-clue/translation/transcript/reveal, hintIndex of the task's reviewed course help; the service copies the reviewed help blocks into a Support reservation (`deliveryRoute` app) and returns its contentHash. Readable through `GET /resources/support/{id}`; the UI confirms actual render with `support.confirm`. An app reservation never rendered before submit is recorded confirmed-undelivered (neutral). Added 2026-11-06 (#111) so course help is never shown without a recorded delivery. |
| `support.confirm` | reservation / help | delivered contentHash, deliveryId, targetIDs, reportedDeliveredAt and before/after-submit/unknown phase; actual delivery only. Reservation/context binding cannot change. Late acknowledgment allowed after close/expiry; actual reported time/provenance stays distinct from server recording time. |
| `support.cancel` | reservation / help | confirmed-undelivered or delivery-unknown and reason; unknown blocks independent credit, not a failure. |
| `practice.create` | new set / practice | targetIDs/mode/maxItems≤30/ready phrase IDs; only reviewed installed items, no generated key. Returns set and UI route. |
| `phrase.capture` | new draft or source link / draft | source=course/spanish/uk-intent; sourceRevisionId for course, text and meaning otherwise; reuse existing reference only for exact ready source. Edits are draft. |
| `phrase.archive` | phrase / browser | archived true/false. Archiving keeps the phrase identity, history and collection memberships readable and pauses new automatic practice; `archived:false` is the recoverable undo. No physical deletion. Added 2026-11-06 (#111). |
| `material.draft` | new revision / draft | title, topicID, typed blocks, optional parentRevisionId; no HTML/code/remote media. |
| `collection.create` | new collection / draft | name, ready/draft phrase IDs; title uniqueness is not phrase identity. |
| `collection.patch` | collection / draft | add/remove phrase IDs, optional name; no phrase deletion. |
| `preference.set` | target group / preference or browser | explicit targetIDs, frequency and/or paused flag; exact UI effect reported. |
| `review.submit` | new review draft / draft | attemptId and pinned revisions, ReviewReport; no promotion/verdict change before validation. |
| `review.validate` | review / privileged local CLI | reviewer report/reference verification and evidenceHash; cross-provider/reference gate; append adjudication or remain unresolved. |
| `content.promote` | content revision / privileged local CLI | expected digest and review/audio/rights/coverage receipt IDs; all gates enforced in service. No `ready:true` shortcut. |
| `profile.timezone-preview` | profile / browser | validates IANA zone, returns timezone-preview ID/revision retaining old dueDate labels,5min lease bound to current epoch/profileRevision. |
| `profile.settings` | profile / browser | reviewTimezone, audioSpeed1/0.85, theme system/light/dark; timezone preview acknowledgment. Locale fixed uk initially. |

`review.validate`/`content.promote` are internal command schemas for the local content tool; HTTP rejects them for ordinary browser/agent credentials. They are not an escalation to shell or arbitrary database mutation. Content-review tool executes provider jobs or verifies their trusted transport records, then emits an ExecutionReceipt (keyId, job/provider/model/effort, artifact/report hashes, verifier version, timestamp, hex HMAC-SHA256 signature over canonical UTF-8 sorted-key receipt fields (excluding signature) under a0600 local key excluded from exports). Distinct author/reviewer jobs and opposite providers are checked for Ready. Unverifiable pasted provider labels stay draft; review.validate consumes executionReceiptIds and content.promote consumes validated service receipt IDs. Source-only adjudication requires an actual verified passage receipt, not an agent assertion. Content-review tool validates source evidence/signatures and records the actual verifier; an ordinary submitted report cannot create its own validation receipt.

## Context selection and help delivery

The skill workflow must be implemented in `skills/spanish-learning-lab/SKILL.md` with copyable HTTP examples, exact private paths, capability/scope checks, operation UUID rules, errors and post-write verification. Use the local Codex host first; it must be able to execute authenticated HTTP to loopback and read only the configured private runtime/token files. A skill is instructions, not a permission bypass. A missing token/permission gives a bounded setup message. No MCP initially, no need to read all browser tabs/chats or infer the foreground app.

1. Read runtime metadata, health and capabilities; verify instance/epoch/version. Explicit user contextId/task link wins.
2. Otherwise list metadata. Candidates are open, meaningful activity within30min. Use the only candidate or uniquely most recent if the next is >120sec older. State the assumption. If tied/competing within120sec, ask which task **during the future help session**; do not select by tab order/polling. If none, offer selected topic/context, no stale write.
3. Fetch selected detail; explain what is being used, keep scope to that task. Request exact scopes only when needed.
4. Before external language help, call support.prepare with the exact planned blocks/targetIDs and capture reservation/hash. Deliver the same content to learner, then confirm actual delivery with the hash/deliveryID. On inability to confirm, do not say the evidence was saved; retry the same operation or get receipt. A5min reservation expiry prevents starting a new app display; app-route never rendered is confirmed-undelivered, while external delivery that cannot be established is unknown. Acknowledging actual past delivery remains possible after expiry/context close against the reservation revision/hash, not the old60sec context lease. If submit captured pending/unknown support, late confirmation may clarify supported/uncertain evidence but never auto-awards independent credit. Help delivered after checking is review, not retroactive pre-answer support. Prepared reservation expires as unknown only where delivery cannot be established; explicit no-delivery cancellation is neutral. Never use preparation as proof of help or a failure.
5. If assistant output streaming/tool ordering makes a delivery receipt impossible, use the UI-mediated route: store prepared help and ask app to display it when the learner opens it; UI records actual render as delivery. External oral/uninstrumented help remains learner-report/unknown. Capability probe must choose this route rather than fake delivery.
6. Draft addition/practice creation returns entity revision and relative route. Read back the exact resource and verify persisted fields before claiming success. Browser reload/list refresh shows a new optional item; no forced navigation, no loss of current draft.
7. Stale409: read new state, inspect differences, then create a new operation only if still applicable; never blind replay against a changed context. Lost response: reuse original key/body or GET operation first, except token-secret delivery and successful restore as specified here. Never repeat a successful logical action with a new UUID merely to clear an error.

Agent help is preparation-time assistance and never an always-on runtime judge. Learner chooses when to involve it. Private answer export to a remote provider requires the learner-visible selected packet, not blanket automatic upload. Generated material remains a draft; valid old ready material stays active while a revision is reviewed. The local review gate may require separate author/reviewer jobs with authorized tools, but cannot silently start paid accounts.

## Backup/auth control routes

Owner-only `POST /auth/tokens` creates scoped TTL token; `DELETE /auth/tokens/{id}` revokes; exchange/session/logout use dedicated exact schemas in OpenAPI. Owner-only `POST /recovery/export` returns a local download artifact ID; `POST /recovery/restore-preview` accepts a previously bounded uploaded archive ID; `POST /recovery/restore-confirm` consumes its hash/eventSeq/epoch-bound confirmation. All use CSRF/idempotency/epoch/revision protections; binary upload uses owner-authenticated streamed `POST /recovery/uploads` with limits from DOMAIN-SPEC. Never let an agent supply a filesystem path. Ready pack installation is the privileged local CLI with its manifest/hash gate, not arbitrary HTTP fetch.

Recovery of a lost successful restore response is not a replay under old credentials. Persist lastRestoreOperationId/archiveHash/newEpoch in the shadow profile and crash journal before switch. Launcher reads only the private outcome marker, obtains fresh owner authentication and verifies the completed restore operation in the new profile; it never repeats replacement from an old confirmation. If no completed marker exists, follow journal recovery before accepting writes. Downloads/uploads/previews expire after15min (preview confirmation5min), are owner-only, hash-bound and removed after expiry; active exports/backups are not confused with temporary upload files.

Cross-field constraints enforced by the service: target IDs belong to selected ready task/scope; table row widths equal column count; total material≤20,000chars and body≤64KiB; preference.set has frequency or paused; profile.settings has at least one setting and timezone changes require its matching unexpired preview; sourceId consistency for session.start; support targets/hash/phase/reservation binding. All private resource reads require object-level scope: course:read reads ready course data; context:read reads selected context and its attempts/support only; draft:write reads its created draft/phrase/material/collection/review records; practice:write its created sets; preference:write explicit authorized targets. Browser owner may read the profile. No global private-answer listing for a course-only token.

A practice-link block contains only a Ukrainian label, reviewed target IDs, mode and≤30 item cap. Opening it starts the normal explicit scoped-practice flow, not a remote URL or hidden executable action. Draft/unready links are disabled with a status explanation. Viewing a link is interface navigation; seeing a rule/model in the same material records only the actual targeted assistance.

Portable review provenance: HMAC keys stay in the private key store, identified by keyId, and never enter exports. Restore with the original key verifies those historical receipts; another computer cannot. Preview reports unverifiedHistoricalReceiptCount/requiresSourceTrust. For unknown-key historical records, confirmation must explicitly set trustImportedProvenance=true after showing the archive hash/source warning; agents cannot confirm. Import validates structure/hashes/references and emits a local import attestation that preserves old review/Ready status as **imported historical evidence**, without claiming a fresh provider job or verified original HMAC. Existing phrases/history remain usable; newly edited/promoted revisions require normal local review receipts. Imported evidence cannot masquerade as a fresh execution receipt or certify changed content/public publication. Reject malformed/mismatched records; preserve provenance and any unknown signer status.

## Browser view read models (contract extension 2026-11-06, #111)

Owner-session-only `GET /views/home`, `/views/lessons/{lessonId}`, `/views/exercises/{taskRevisionId}`, `/views/progress`, `/views/phrases`, `/views/materials/{topicId}`, `/views/listening`, `/views/catalog-meta` and `/views/attempts/{attemptId}` return the typed read models `HomeView`, `LessonView`, `ExerciseView`, `ProgressView`, `PhraseLibraryView`, `MaterialsView`, `ListeningView`, `CatalogMetaView` and `AttemptResultView` (`viewsVersion` 1) used by the Ukrainian UI. They are reads: they never mutate activity or scheduling, never expose answer keys or unrequested help/reference answers, and are not granted to agent tokens. Agents keep using the scoped endpoints above. The extension was generated by `docs/tools/build_contracts.py`; schema version stays 1 because existing wire shapes are unchanged.

Contract v1 clarifications (2026-11-06, #111): `LessonView.progress` carries the lesson-progress `id`/`revision` once a record exists (a first `lesson.progress` uses a new subjectId with expectedRevision 0; a concurrent duplicate gets 409 and re-reads). `preference.set` appends a new preference record each time (new subjectId, expectedRevision 0). `PhraseLibraryView` phrases carry their `phrase-recall` targets for `practice.create`. `AttemptResultView` resolves per-target Ukrainian feedback from the pinned task revision and shows the reference answer after checking, labelled as an example when alternatives are possible. `Support.targets` may be empty only for help that supports no assessed target (vocabulary gloss); it then has no evidence effect. `Content`/`CatalogEntry` states include `reviewed` (opposite-provider review receipt exists, local validation pending).

## Error codes (implementation reference, 2026-11-06, #111)

Every error is the `Error` envelope: `apiVersion`, `requestId`, `code`, `messageKey` (`error.<camelCase code>`, e.g. `STALE_REVISION` → `error.staleRevision`), `retryable`, optional `currentRevision`/`createdEntityId`. No stack, SQL or answer text. The UI maps `code` to Ukrainian text and falls back to a status-level message for unknown codes. `retryable` is false unless stated. Derived from the string literals in `apps/server/src`; a new code needs a row here.

| Status | Code | Meaning |
|---|---|---|
| 400 | `BAD_REQUEST` | Unparseable request (generic framework rejection). |
| 400 | `MALFORMED_JSON` | Body is not valid JSON. |
| 400 | `UNSUPPORTED_CONTENT_TYPE` | Content type not accepted (JSON for API, `application/zip` for recovery upload). |
| 400 | `BODY_REQUIRED` | Mutation without a body. |
| 400 | `WRITE_HEADERS_REQUIRED` | Missing Idempotency-Key, X-Profile-Epoch or If-Match. |
| 400 | `IDEMPOTENCY_KEY_MISMATCH` | Idempotency-Key ≠ body operationId. |
| 400 | `EPOCH_HEADER_MISMATCH` | X-Profile-Epoch ≠ body profileEpoch. |
| 400 | `IF_MATCH_MISMATCH` | If-Match ≠ body expectedRevision. |
| 401 | `AUTH_REQUIRED` | No credentials (403 only as a defensive guard when a route is reached without a principal). |
| 401 | `AUTH_INVALID` | Unknown cookie or token. |
| 401 | `SESSION_EXPIRED` | Browser session past sliding/absolute expiry; drafts are kept, re-authenticate via the launcher. |
| 401 | `TOKEN_EXPIRED` / `TOKEN_REVOKED` | Agent token expired or revoked. |
| 401 | `NONCE_INVALID` | Launcher nonce unknown, expired or already used; an existing session is untouched. |
| 403 | `HOST_FORBIDDEN` / `FORWARDED_FORBIDDEN` | Host not the canonical loopback host:port, or forwarded-host headers present. |
| 403 | `ORIGIN_FORBIDDEN` / `ORIGIN_REQUIRED` | Foreign Origin, or cookie mutation without Origin. |
| 403 | `CSRF_INVALID` | Cookie mutation with missing or wrong CSRF token. |
| 403 | `MIXED_CREDENTIALS` | Cookie and bearer token in one request. |
| 403 | `OWNER_ONLY` | Browser-owner-only route called with an agent token. |
| 403 | `SCOPE_FORBIDDEN` | Agent token lacks the required scope or object access. |
| 403 | `AGENT_ONLY` | Owner session ran a command reserved for agent credentials. |
| 403 | `PRIVILEGED_COMMAND` | `review.validate` / `content.promote` over HTTP (local CLI only). |
| 404 | `NOT_FOUND` | Unknown route, resource, artifact or object not visible to this principal. |
| 404 | `ATTEMPT_NOT_FOUND`, `COLLECTION_NOT_FOUND`, `CONTEXT_NOT_FOUND`, `DRAFT_NOT_FOUND`, `LESSON_NOT_FOUND`, `PHRASE_NOT_FOUND`, `SESSION_NOT_FOUND`, `SUPPORT_NOT_FOUND`, `TASK_NOT_FOUND`, `TOPIC_NOT_FOUND` | Named subject does not exist. |
| 404 | `MEDIA_CORRUPT` | Installed media file missing or failing its hash check. |
| 409 | `IDEMPOTENCY_CONFLICT` | Operation ID reused with a different body or kind. |
| 409 | `IDEMPOTENCY_REPLAY_UNAVAILABLE` | Replay of a restore preview, which is not replayable; read state and start a new operation. |
| 409 | `EPOCH_MISMATCH` | Profile epoch changed (restore); re-read before writing. |
| 409 | `STALE_REVISION` | expectedRevision ≠ current; carries `currentRevision` (and `createdEntityId` for a duplicate lesson-progress create). |
| 409 | `SNAPSHOT_INVALID` | Context snapshot lease missing, expired (60 s) or bound to another instance/principal/revision. |
| 409 | `STALE_CURSOR` | Catalog cursor expired or no longer matches the filter. |
| 409 | `TOKEN_ALREADY_CREATED` | Retry of a token creation; carries `createdEntityId`, the secret is never re-sent. |
| 409 | `RESERVATION_EXPIRED` | App-route help reported delivered after its reservation expired. |
| 409 | `ALREADY_DELIVERED` | Cancel of a support reservation already confirmed delivered. |
| 409 | `ARTIFACT_EXPIRED` | Recovery download/upload artifact expired (15 min). |
| 413 | `BODY_TOO_LARGE` | Body over 64 KiB (uploads have their own limits). |
| 416 | `RANGE_NOT_SATISFIABLE` | Media Range outside the file. |
| 422 | `INVALID_SHAPE` / `INVALID_QUERY` / `INVALID_RESOURCE_TYPE` | Body, query or resource type fails its schema. |
| 422 | `CONTEXT_REQUIRED` / `CONTEXT_MISMATCH` / `CONTEXT_CLOSED` | Active-context command without context ids, with ids for another context, or on a closed context. |
| 422 | `SESSION_FINISHED` / `NOT_A_LESSON_SESSION` | Session already finished, or lesson progress in a non-lesson session. |
| 422 | `SOURCE_ID_REQUIRED` / `SOURCE_ID_FORBIDDEN` / `UNKNOWN_SOURCE` / `SOURCE_NOT_READY` | session.start/phrase source missing, not allowed, unknown, or quarantined/retired. |
| 422 | `QUEUE_EMPTY` / `NO_READY_ITEMS` | Nothing due or no ready items in the requested scope. |
| 422 | `UNKNOWN_STEP` / `UNKNOWN_TASK` / `TASK_NOT_IN_SESSION` / `TASK_NOT_READY` / `TASK_MISMATCH` | Step or task not in the lesson/session, not usable, or not the task the draft belongs to. |
| 422 | `DRAFT_CONTEXT_MISMATCH` / `DRAFT_IS_RECOVERED` / `CURSOR_OUT_OF_RANGE` | Draft from another context, a recovered conflict copy, or cursor beyond the text. |
| 422 | `INVALID_RESPONSE` | Option ID not offered by the task. |
| 422 | `HINT_NOT_FOUND` / `TARGET_NOT_IN_TASK` / `TARGETS_REQUIRED` / `BINDING_MISMATCH` / `INVALID_TIME` / `SUPPORT_TOO_LONG` | Support request/confirm with an unknown hint, foreign targets, reported help without targets, changed context binding, bad time, or oversize blocks. |
| 422 | `UNKNOWN_PHRASE` / `PHRASE_NOT_READY` / `COURSE_COLLECTION_READONLY` | Phrase unknown, not ready/archived for practice, or a course collection edited. |
| 422 | `UNKNOWN_TOPIC` / `UNKNOWN_PARENT` / `MATERIAL_TOO_LONG` / `TABLE_WIDTH` / `UNKNOWN_TARGET` | Material draft with an unknown topic/parent/target, over 20,000 chars, or ragged table rows. |
| 422 | `UNKNOWN_ATTEMPT` / `PINNED_REVISION_MISMATCH` / `ANSWER_HASH_MISMATCH` / `TARGET_NOT_IN_ATTEMPT` | review.submit not matching the attempt it reviews. |
| 422 | `PREFERENCE_EMPTY` / `SETTINGS_EMPTY` / `SUBJECT_MISMATCH` / `INVALID_TIMEZONE` / `TIMEZONE_PREVIEW_REQUIRED` | Empty preference/settings, wrong profile id, invalid IANA zone, or zone change without a matching unexpired preview. |
| 429 | `RATE_LIMITED` | 600/min or 20 mutations/10 s exceeded; retryable, with `Retry-After`. |
| 503 | `MAINTENANCE` | Restore/backup holds the write gate; retryable. |
| 503 | `STORAGE_UNAVAILABLE` | SQLite busy/full/IO/corrupt or store closed; transaction rolled back; retryable. |
| 503 | `INTERNAL_ERROR` | Unexpected failure; not retryable. |
| 503 | `RECOVERY_UNAVAILABLE` | Recovery module not wired in this instance; not retryable. |

Recovery routes pass recovery-module errors through with their own status and `retryable` flag (disk-full, timeout and transient backup/export/restore failures are retryable; integrity failures are not):

| Status | Codes |
|---|---|
| 400 | `BACKUP_KIND_UNSUPPORTED`, `INVALID_OPERATION_ID`, `UPLOAD_FAILED` |
| 409 | `LIVE_STATE_CHANGED` (state changed since preview), `NO_PROFILE`, `RESTORE_CONFIRMATION_MISMATCH`, `RESTORE_PREVIEW_EXPIRED`, `RESTORE_PREVIEW_UNKNOWN` |
| 413 | `UPLOAD_TOO_LARGE`, `ARCHIVE_TOO_LARGE`, `ARCHIVE_TOO_MANY_ENTRIES`, `ARCHIVE_LINE_TOO_LONG` |
| 422 | Archive structure: `ARCHIVE_NOT_ZIP`, `ARCHIVE_MALFORMED`, `ARCHIVE_UNSUPPORTED_FORMAT`, `ARCHIVE_UNSUPPORTED_COMPRESSION`, `ARCHIVE_ENCRYPTED_ENTRY`, `ARCHIVE_SYMLINK`, `ARCHIVE_SPECIAL_ENTRY`, `ARCHIVE_EXECUTABLE_ENTRY`, `ARCHIVE_UNSAFE_PATH`, `ARCHIVE_PATH_TOO_LONG`, `ARCHIVE_CASE_COLLISION`, `ARCHIVE_DUPLICATE_ENTRY`, `ARCHIVE_UNKNOWN_ENTRY`, `ARCHIVE_MISSING_ENTRY`, `ARCHIVE_MISSING_MANIFEST`, `ARCHIVE_MANIFEST_INVALID`, `ARCHIVE_MISSING_TABLE`, `ARCHIVE_SIZE_MISMATCH`, `ARCHIVE_DIGEST_MISMATCH`, `ARCHIVE_ROW_INVALID`, `ARCHIVE_FOREIGN_KEY`, `ARCHIVE_INTEGRITY`, `ARCHIVE_PROFILE_MISMATCH`, `ARCHIVE_PACK_INCOMPLETE`, `MISSING_PACK`, `UNSUPPORTED_SCHEMA`, `UNSUPPORTED_FUTURE_SCHEMA`, `PROJECTION_REBUILD_FAILED`; restore: `UNKNOWN_UPLOAD`, `UPLOAD_CHANGED`, `SOURCE_TRUST_REQUIRED`, `EPOCH_OVERFLOW` |
| 503 | `BACKUP_FAILED`, `BACKUP_DISK_FULL`, `BACKUP_TIMEOUT`, `BACKUP_VERIFY_FAILED`, `EXPORT_FAILED`, `EXPORT_DISK_FULL`, `EXPORT_PACK_MISSING`, `EXPORT_PACK_INVALID`, `EXPORT_UNCLASSIFIED_TABLE`, `EXPORT_VALUE_UNSUPPORTED`, `UPLOAD_DISK_FULL`, `PRE_RESTORE_BACKUP_FAILED`, `RESTORE_FAILED`, `RESTORE_DISK_FULL`, `RESTORE_VERIFY_FAILED`, `RESTORE_ROLLBACK_FAILED`, `RESTORE_JOURNAL_CORRUPT`, `RESTORE_RECOVERY_FAILED` |

Not HTTP: launcher IPC errors (`IPC_UNAUTHORIZED` 401, `IPC_UNKNOWN_VERB`/`IPC_BAD_ARGS`/`IPC_PROTOCOL` 400, `INTERNAL` 500), service start (`PROFILE_LOCKED`, `START_FAILED`), and the pack CLI (`SERVICE_RUNNING` exit 3; `INSTALL_FAILED` wrapping `MANIFEST_*`, `ENTITY_*`, `MEDIA_MIME`, `MEDIA_MISMATCH`, `MISSING_FILE`, `MISSING_MEDIA`, `UNLISTED_FILE`, `HASH_MISMATCH`, `SIZE_MISMATCH`, `PACK_*`, `NOT_READY`, `PREVIEW_NOT_ALLOWED`, `REFERENCE`, `VERSION_CONFLICT`, `REVISION_CONFLICT`).
