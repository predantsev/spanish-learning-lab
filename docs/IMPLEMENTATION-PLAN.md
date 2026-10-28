# Developer handoff — first complete A1–A2 release

Planning baseline: 2026-10-28, issue #109. This is a build specification, not an implementation or release certificate. C-084 delegates reversible planning choices; it does not authorize building, purchases, host changes, deployment or merging. The next execution phase starts only on a subsequent explicit owner instruction. A developer may execute the work packages below without reopening routine product choices.

## Read order and authority

1. `../AGENTS.md`, `STATUS.md`, then this document.
2. `COURSE-DESIGN.md`: owner intent and dated decisions C-001–C-084, including visual directions and their verification limits.
3. `CURRICULUM-A1-A2.md`: stable curriculum IDs, accepted groupings, CV-01–CV-06 and the B1/B2 roadmap.
4. [Domain specification](DOMAIN-SPEC.md), [API contract](contracts/API.md), [JSON schemas](contracts/schemas.json), [OpenAPI](contracts/openapi.json).
5. [Content production plan](CONTENT-PLAN.md), [coverage ledger](contracts/curriculum-ledger.json), [acceptance gates](ACCEPTANCE.md), [research/version evidence](evidence/RESEARCH.md).

Owner requirements win over delegated defaults. This handoff resolves earlier technical “open/undecided” proposals; historical discussions remain evidence of how the design evolved. Never reinterpret a past proposal as direct owner approval. A conflict between this handoff and a confirmed requirement is a defect to fix, not permission to drop the requirement.

## Release boundary

Deliver one local browser application with the complete reviewed A1–A2 corpus: 14 blocks, 107 broad objectives, 89 lessons and 14 optional checks, plus the accepted six supporting allocations. These are source-definition counts, not card/audio counts or proof of full CEFR coverage. Provide written learning/practice, reading, listening, personal phrases/collections, granular repetition, persistent progress/recovery, and API plus repository skill. Ukrainian interface, instructions and feedback; Spanish of Spain; no speaking, microphone or conversation requirement. B1/B2 are future content increments using the same histories and contracts.

The owner begins learning/testing only after all release gates pass. A developer-only vertical slice is useful internally and must not be presented as the first owner handoff. Runtime AI, a paid subscription, external internet and an external agent are unnecessary for ordinary installed practice. Unknown free answers remain unresolved and can be reviewed later.

Deferred: hosted accounts/authentication, cloud sync, remote phone access/tunnel, PWA/service worker, native mobile app, MCP, conversational practice, C1, public distribution licensing and purchases. The responsive iPhone interface is required now; continuous independent phone access is not. Preserve a migration route through versioned export/API, without building a hosting platform.

## Architecture and local delivery

Use TypeScript, React/Vite, Fastify and SQLite/better-sqlite3. One Node process serves built static assets and `/api/v1` on the same origin. No Docker requirement, CDN, remote fonts, remote audio fetch or runtime model calls. Domain grading/scheduling is a pure package with an injected clock and seeded deterministic selector. Browser storage is recovery support; the server database is authoritative.

Intended repository layout:

```text
apps/web/                 React, Ukrainian UI and local recovery outbox
apps/server/              HTTP, authentication, commands, SQLite repositories
packages/domain/          grading, evidence, scheduler, selection
packages/contracts/       generated types from docs/contracts; no divergent schemas
content/source/           original reviewed text and coverage/review manifests
content/packs/            immutable release manifests; media only when rights permit
skills/spanish-learning-lab/SKILL.md
bin/sll.mjs               project-contained launcher
tests/{domain,contract,integration,e2e,fixtures}/
docs/                     this planning source of truth
```

Pin Node 24.22.1 LTS and npm 11.19.1; exact proposed package versions and registry metadata are in `evidence/package-versions.json`. Use React/React DOM 19.3.1, Vite 8.3.5, TypeScript 7.0.2, Fastify 5.12.7, better-sqlite3 13.0.3, Ajv 8.20.0, i18next 26.5.11/react-i18next 17.1.9, Vitest 5.0.5 and Playwright 1.64.1. Do not install the probe's optional testing-library entry without its peers; use domain Vitest and browser Playwright initially. WP-01 pins all required build/type plugins and transitive dependencies in `package-lock.json`, checks compatibility/security and native SQLite support. Metadata is not a successful build. If a pinned version is incompatible, document the smallest compatible replacement and rerun the gates; do not silently use “latest.”

Provide a self-contained Darwin arm64 release folder with the selected Node binary, application, full activated content/audio pack, third-party notices, README and `Start.command`. Development may use `npm ci`, `npm run dev`, `npm run build`; owner use is `Start.command` or `node bin/sll.mjs start --open`, without a global Node change. `status`, `open`, `stop`, `backup`, `export` and `restore --preview` are explicit launcher commands. An actual restore needs a confirmation token from its preview. No launchd, login item, shell profile, `/etc/hosts` or global PATH edits by default. If macOS asks for an OS approval, explain the exact artifact and let the owner approve; never bypass Gatekeeper silently.

Bind only `127.0.0.1`. The shared PORTS.md has no unallocated product block at this planning snapshot; choose port `0`, record the allocated port privately, and use `http://spanish-learning-lab.localhost:<port>`. On restart, try the prior port first, then allocate another if occupied. Register this explicit dynamic-port exception in the implementation bootstrap PR rather than claiming an existing project's port. No port occupant may be killed. Actual Chrome `.localhost` resolution is a gate; CLI `--resolve` alone is insufficient. If resolution fails, use the explicit loopback origin with the same Host/Origin safeguards and document the fallback; do not edit DNS/hosts automatically.

Use an exclusive profile lock, verified instance ID and PID/start identity. A second launcher opens the proven existing instance. `runtime.json` has schema version, instanceId, URL, PID/start identity, profileEpoch and startup time; no token. Reject a stale/mismatching instance and offer diagnostics. Stop through authenticated own-instance IPC; kill only the exact process this launcher started after checking executable identity. Browser closure does not stop the service. The launcher detaches only its own child and captures its PID; an explicit foreground mode aids diagnosis.

Private root on this Mac: `~/Library/Application Support/Spanish Learning Lab/`; `profile.sqlite`, `assets/`, `backups/`, `exports/`, `runtime/`, `keys/`, `logs/`. Directories 0700, data files 0600; private files never in Git. FileVault state is unconfirmed and must not be changed by this project. Logs contain request IDs/status/operation kinds, never answers, drafts, auth headers, tokens or imported text; rotate at 5 MiB × 3. Release artifacts exclude real profiles and tokens. No telemetry or automatic update network request.

## Product behavior to implement

| Area | Selected behavior and required states |
|---|---|
| Home | One focus: recommended review first, Resume and Choose topic, concise separate coverage/evidence. First use: Start course plus manual choice. Nothing due: Continue. Saved work: Resume. Empty/error/loading states explain the next action. |
| Catalog | List and details; topics/situations resolve to shared IDs/history. Ukrainian labels with Spanish terms; accent-aware search plus explicit aliases such as hecho → participle target. Rule, Learn, Practice and selected skill/exception/mode choices. Never silently expand a manually selected scope. |
| Exercise | Focus, contextual reference collapsed on left on desktop and a dismissible sheet on phone. Rule/hint/reveal available before answering; closing it does not erase support. Preserve input/focus/scroll. Short response Enter checks; multiline Cmd+Enter on Mac, Ctrl+Enter elsewhere; IME composition never submits. Visible shortcut text plus button. No character strip. Checking freezes committed response; explicit Next, no timer/automatic advance. |
| New lesson | Concise explanation → supported practice → independent attempts → saved summary/later checks. Optional foundation self-check and manual navigation; no perfect-score locks. Each supporting construction taught before an assessment depends on it. |
| Listening | Listening focus, explicit user-initiated playback, meaning first, separate optional dictation. Replay/speed controls alone are neutral; transcript/translation help affects the targeted listening evidence. Separate drafts per mode. Audio error: retry and explicit written alternative; no fabricated listening completion. No autoplay or microphone permission. |
| Phrases | Library and collections; save reviewed course expression, enter existing Spanish, or Ukrainian intent. Last two and edited entries start as private drafts. One shared phrase/history across collections; exact recall and reviewed variations, personal priority. Drafts searchable but excluded from correct-answer models. Eight prepared collections use shared ready references. |
| Materials | Materials in topic: explanation/table/examples/linked practice. Reviewed active revision remains while edits are drafts. Never auto-open a newly inserted material. Return preserves current answer. Supported data blocks only; no arbitrary HTML or injected UI buttons. |
| Unresolved | In the exercise: preserve answer, explain uncertainty, show reference as an example rather than a unique verdict, let learner edit/retry, skip, save for external review, or see linked rule. No pass/fail or automatic weakness. Review result/history is an append-only correction. |
| Progress | Separate visited/completed lessons from independent recall, supported work, uncertain evidence and listening. Show specific reason and date, not a global mastery percentage. Session summary with actual help and optional next action. No streak pressure, notifications or mandatory daily quota. |
| Recovery/settings | Review preferences, private export/backup/restore, agent access, locale foundation, accessibility and audio defaults. Dangerous replacement has preview and confirmation. Theme: light default, system dark respected, system font; no theme editor. |

Use all selected visual directions recorded in COURSE-DESIGN; the prototypes are references, not tested runtime components. At WP-06 produce one coherent design-token set and real responsive screens, then verify all states in ACCEPTANCE. Defaults: 8 px spacing scale, 16 px base text, readable max width 72rem, exercise text column 44rem; desktop navigation/optional reference, <768px bottom navigation and separate detail routes, no hover-only controls. Full keyboard use, visible focus, accessible names/live status, non-color evidence, reduced-motion support, ≥44×44px touch targets. Label every learner-operated feature with contextual `?` help explaining what/how and whether it counts as language support. Avoid tool/provider/DB details in learning screens.

UI text uses locale keys with Ukrainian complete; Spanish examples tagged `lang=es-ES`, instruction language `uk`. Content blocks carry language fields; do not concatenate translated sentence fragments or put grammar text in component source. Additional locales remain drafts until completeness/linguistic gates pass. Agent translation access creates data, not executable templates.

## Work packages and execution order

Every package produces a focused issue/PR, cites this baseline, tests its changed boundary and updates STATUS. Implementation issues are created when execution is authorized, not by this planning run. No worker may waive another package's gate. Integrator owns contracts, profile safety and release evidence.

| WP | Deliverable | Dependencies | Completion/rollback |
|---|---|---|---|
| 01 | Lock runtime/dependencies, skeleton, build/release launcher and private-root/port behavior; CI for type/domain/contract/build. | execution authorization | Clean checkout builds under pinned Node; no host configuration. Remove only own build/release artifacts to roll back. |
| 02 | SQLite schema/migrations, versioned content repository, transactions, autosave/idempotency, backup/export/restore. | 01, contracts | Fault/restore gates A-01–A-08 pass on synthetic data; verified pre-migration rollback. |
| 03 | Pure checker, append-only evidence/projections, scheduler/preferences/queue selector. | 01, DOMAIN-SPEC | A-09–A-16 reproducible clock fixtures pass; projection rebuild identical. |
| 04 | Complete atomic curriculum/lexical ledger and 40-case review calibration. | contracts/content plan | Every source objective/CV allocation mapped; pilot passes before bulk. Failure repairs workflow, never reduces coverage. |
| 05 | Full reviewed lesson/task/phrase/collection corpus and actual audio pack. | 04; may parallel 02/03/06 | All ledger/material/media gates, no unresolved key or missing required clip. Prior active pack retained on failure. |
| 06 | Unified UI and browser integration for all product states above. | 01; use synthetic contracts until 02/03 | A-17–A-23 and keyboard/accessibility states; no mock correctness presented as real. |
| 07 | Local auth/API, bounded draft/help/practice operations, skill and integration examples. | 02/03/06 | A-24–A-30 with a real local Codex client and visible persisted result. Revoke tokens to roll back access. |
| 08 | Assemble complete app/corpus, package offline assets, real Chrome/iPhone checks and release report. | 02–07 | All release gates with exact revisions/build/device versions, no missing block/audio/API. Prior release+profile snapshot retained. |

Safe parallel ownership: domain vs UI vs content production against frozen contracts; migrations/auth integration remains one writer. A contract change first updates schemas/examples/tests and increments the applicable version. A content worker may not edit grading code to make a disputed key pass. A reviewer is fresh-context/opposite-provider for language; application code review may use an independent agent with recorded evidence. Reviewers report defects and actual checks, not an unqualified “approved.”

Expected implementation commands (must be implemented by WP-01, not commands available today): `npm run typecheck`, `npm test` (domain + HTTP integration), `npm run test:contracts`, `npm run content:validate`, `npm run content:coverage`, `npm run test:e2e`, `npm run build`, `npm run release:check`. Avoid redundant runs once relevant checks pass unless the artifact changes. Real device/audio checks remain separate from CI.

## Decision log — delegated choices under C-084

All entries below are planning selections, not claims of owner testing. Defaults can be changed after seeing the app; alternatives are intentionally retained. A red escalation is a specific action the executing developer cannot safely authorize, not a reason to ask routine design questions now.

| ID | Selected recommendation / rationale | Alternatives retained | Revisit trigger |
|---|---|---|---|
| D-001 | Unresolved feedback stays In the exercise; draft/context remain visible. | Separate review inbox as primary; modal. | Feedback crowds phone/task; add inbox as secondary. |
| D-002 | Local Node/browser monolith; minimum operations. | Electron/Tauri; Docker; cloud-first. | Installation friction exceeds one-folder launcher. |
| D-003 | React/TS/Fastify/SQLite pinned above; shared types and deterministic domain. | Vanilla UI; Next; Postgres; embedded desktop. | Measured incompatibility or hosted multi-user requirement. |
| D-004 | Project-contained Node/launcher; no login service. | Global Node/launchd; desktop package. | Owner explicitly wants login startup/native install. |
| D-005 | Dynamic loopback port with prior-port reuse and private discovery. | Reserved block; fixed conflicting port. | Shared canon allocates a dedicated product block. |
| D-006 | One private profile, server DB authoritative; no cloud account. | Browser-only storage; hosted profile. | Explicit multi-user/sync phase. |
| D-007 | WAL/FULL, append-only evidence, immutable revisions and durable ACK. | Mutable grades; WAL/NORMAL. | Measured latency requires reviewed durability tradeoff; never silently weaken. |
| D-008 | IndexedDB recovery outbox; no first-release service worker. | PWA with remote offline sync. | Server-independent phone access required. |
| D-009 | Full versioned text/audio pack preinstalled; no lazy internet lessons. | Download per module; runtime generation. | Later optional packs; full A1–A2 remains installable. |
| D-010 | Exact variants/per-target rules; unresolved free meaning answers. | Runtime AI judge; fuzzy semantic pass. | A separately evaluated optional judge meets evidence/privacy gates. |
| D-011 | Per-target/modality ladder and deterministic fair queue, stable label after three qualifying delayed checks over ≥7 days. | SM-2/FSRS; one score per topic. | Real usage/evaluation shows poor intervals or queue burden. |
| D-012 | Pause precedence, 7-day repeat cap, honest Known preference. | Known = mastered; hard reset on errors. | Owner experience requests different controls; preserve old events. |
| D-013 | Local calendar days, profile Europe/Madrid, no automatic travel-timezone changes. | UTC rolling hours; OS timezone follows travel. | Explicit timezone change, see DOMAIN-SPEC. |
| D-014 | 7 daily/4 weekly + bounded pre-change snapshots, logical portable restore. | Raw live DB copies; unlimited backups; cloud sync. | Disk pressure/external storage request. |
| D-015 | API plus local repository skill, no MCP initially. | MCP adapter; UI automation. | A supported client cannot use authenticated HTTP. |
| D-016 | Local Codex HTTP client first; explicit context beats recent-activity heuristic. | Cloud agent; current Chrome tab inferred. | New host capability/security review; ambiguity requires task selection. |
| D-017 | Scoped expiring tokens, same-origin session, Host/Origin/CSRF guards. | Anonymous localhost; LAN exposure; wildcard CORS. | Hosting is separately designed and authorized. |
| D-018 | Structured blocks only, draft→reviewed→ready; agent cannot self-certify. | HTML upload/remote iframe/raw SQL; automatic Ready. | A new typed block has a real learner need and tests. |
| D-019 | Two-phase actual help recording; pending/unknown delivery cannot earn independent credit. | Prepared help automatically counted; honor-system boolean. | Client supports stronger delivery receipts; keep provenance. |
| D-020 | Source ledger + independent cross-provider language review/calibration. | Same-model reread; translation tool as referee; hired human. | Human becomes available or calibration fails. |
| D-021 | Sol high → Opus medium; reverse Opus medium → Sol xhigh; raise effort for disputes. | Maximum effort everywhere; same-provider fallback. | Measured defect/latency/cost findings; gate retained. |
| D-022 | Eleven multilingual v2 Spain voice candidate; pregen/cache/actual-file QA. | Piper es_ES; licensed human clips; another measured TTS. | Voice/cost/rights benchmark fails; no unsupported audio release. |
| D-023 | First audio batch target $5–10, no commissioned recordings or subscriptions by default. | Per-request TTS; recurring plan; larger budget. | Actual authorized total exceeds cap or new recurring billing: red owner step. |
| D-024 | Gemini 3.8 Flash actual-file QA candidate plus ASR/alignment, not transcript-only validation. | Another audio-capable verified model; human review. | Account/capability/calibration unavailable; release gate remains blocked. |
| D-025 | Ten reviewed task instances per small productive grammar target, held-out contexts; minimum two distinct clips per listening target. | Fixed count per broad objective; infinite templates. | Calibration exposes overload/insufficient variety; justify ledger exception. |
| D-026 | Eight prepared collections of 12 ready phrase references; shared phrase/history. | No starter packs; duplicate phrase copies. | Content review exposes overlap; merge references, keep coverage. |
| D-027 | Ukrainian i18next keys, content locales; no other initial language. | Hardcoded UI; multiple translations now. | A new locale is actually requested and reviewed. |
| D-028 | Responsive Chrome macOS + real iPhone Safari, light/system-dark; keyboard/help defaults above. | Phone app; Safari desktop-first; rich customization. | Device testing exposes a usability issue. |
| D-029 | App/corpus all ready before owner handoff; internal slice for developers only. | Owner module-by-module beta. | Only an explicit later owner scope change. |
| D-030 | Local owner-use package first, preserve separate code/text/media rights records. No license grant added in planning. | MIT code + CC text; all-rights-reserved distribution. | Before public artifact distribution choose owner-approved license and clear every asset. Public repo is not a license. |
| D-031 | Stop at completed plan; open stacked documentation PR, no merge. | Collapse/merge planning stack now. | Explicit merge authorization and verified current bases/checks. |

## Critical boundaries for execution

Ask only when a concrete required action crosses an unresolved authorization boundary: destructive replacement of real data, reading/exporting private records to another provider, OS trust/credentials, new billing/over-cap/recurrence, changing machine/network settings, public distribution rights, deployment, or merge. Complete safe preparation and show the exact action/data/price/rollback first. No password entry, trust bypass, broad process kill, silent upload or public learner records. Optional unresolved extras stay deferred without holding up unrelated work. Missing mandatory language/audio/device validation is reported as a release blocker; it is never converted into a passed gate or silently omitted.

## Plan completion versus application completion

This handoff fixes behavior, contracts, defaults, production workflow and tests. It intentionally does not claim a finished corpus, successful native package build, working API, actual-device usability, linguistic correctness or learning effectiveness. The implementation release report must record those checks against exact artifact hashes. Issue #109 concerns this documentation only.
