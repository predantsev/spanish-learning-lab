---
name: spanish-learning-lab
description: Help the learner inside the local Spanish Learning Lab app through its authenticated loopback HTTP API — read the selected task context, deliver and record targeted help, create reviewed practice sets, capture phrase/material drafts, and verify every saved result. Use when the learner asks for help with their current Spanish exercise, wants extra practice on specific skills, or wants to save a phrase or note into the app.
---

# Spanish Learning Lab — assistant skill (API v1)

This skill is instructions, not a permission. It works only through the app's local HTTP API with a
scoped token the learner created in **Налаштування → Агенти**. It never reads browser tabs, chats,
the database file, or any file other than the two private files named below. No MCP is involved.

## Private files (read-only for you)

| File | Content |
|---|---|
| `~/Library/Application Support/Spanish Learning Lab/runtime/runtime.json` | `url`, `instanceId`, `profileEpoch`, `pid` of the running app (no secrets) |
| `$SLL_AGENT_TOKEN_FILE` (default `~/Library/Application Support/Spanish Learning Lab/agent/token`, mode 0600) | the bearer token, one line |

If `SLL_HOME` is set, replace `~/Library/Application Support/Spanish Learning Lab` with it. Never print
the token, never put it in a command line that is logged, never write it anywhere.

If runtime.json is missing or `/health` fails: say "Застосунок не запущено — запустіть Start.command"
and stop. If the token file is missing or the API answers 401: say the learner must create an agent
token in Налаштування → Агенти and save it to the token file; stop.

## Setup in a shell (copyable)

```sh
SLL_ROOT="${SLL_HOME:-$HOME/Library/Application Support/Spanish Learning Lab}"
SLL_URL="$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["url"])' "$SLL_ROOT/runtime/runtime.json")"
SLL_API="$SLL_URL/api/v1"
TOKEN_FILE="${SLL_AGENT_TOKEN_FILE:-$SLL_ROOT/agent/token}"
sll() { curl -sS --fail-with-body -H "Authorization: Bearer $(cat "$TOKEN_FILE")" -H 'Accept: application/json' "$@"; }
```

`SLL_URL` is `http://spanish-learning-lab.localhost:<port>` or `http://127.0.0.1:<port>`; if curl cannot
resolve the `.localhost` name, use `--resolve spanish-learning-lab.localhost:<port>:127.0.0.1`. Do not
send an `Origin` header; never use cookies.

## Workflow

1. **Verify the instance.** `curl -sS "$SLL_API/health"` → `status` must be `ok` and `instanceId` must
   equal runtime.json. Then `sll "$SLL_API/capabilities"` → note `scopes`, `profileEpoch`,
   `commandKinds`, `packHash`. Request only the scopes the job needs; if a needed scope is missing, tell
   the learner which scope to grant and stop.
2. **Select the context.** If the learner gave a context id or task link, use it. Otherwise
   `sll "$SLL_API/contexts"` (metadata only, ≤20, newest meaningful activity first). Candidates are
   `open: true` with activity within 30 min. Use the only candidate, or the newest one when the next is
   more than 120 s older, and **state the assumption** ("Працюю із завданням «…», відкритим о …").
   If two candidates are within 120 s, ask which task — do not guess from tab order. If none, offer to
   pick a topic instead; never write to a stale context.
3. **Read only that task.** `sll "$SLL_API/contexts/<id>"` → `task` (prompt, targets, mode), saved
   `draft`, `supportState`, `snapshotToken` (valid 60 s) and `metadata.revision`. Say what you are using.
   Never ask for or read other answers.
4. **Before giving language help** (rule, targeted clue, translation, transcript, reveal, anything that
   could change the learner's answer) **reserve it**:

   ```sh
   OP=$(uuidgen | tr 'A-Z' 'a-z'); SUP=$(uuidgen | tr 'A-Z' 'a-z')
   sll -X POST "$SLL_API/commands" -H 'Content-Type: application/json' \
     -H "Idempotency-Key: $OP" -H "X-Profile-Epoch: $EPOCH" -H 'If-Match: "0"' \
     -d '{"operationId":"'$OP'","profileEpoch":'$EPOCH',"subjectId":"'$SUP'","expectedRevision":0,
          "kind":"support.prepare","contextId":"'$CTX'","contextRevision":'$CTXREV',
          "contextSnapshot":"'$SNAP'","payload":{"targets":[{"skillId":"<skill>","modality":"<modality>"}],
          "kind":"targeted-clue","blocks":[{"type":"paragraph","language":"uk","text":"<exact help text>"}],
          "taskRevisionId":"'$TASK'","deliveryRoute":"external"}}'
   ```

   The receipt returns the reservation (`entities[0]`) and `contentHash`. Targets must be exactly the
   skills the help explains (a vocabulary gloss is not a conjugation target). Then show the learner
   **exactly** those blocks, and confirm delivery:

   ```sh
   OP2=$(uuidgen | tr 'A-Z' 'a-z'); DEL=$(uuidgen | tr 'A-Z' 'a-z')
   sll -X POST "$SLL_API/commands" -H 'Content-Type: application/json' \
     -H "Idempotency-Key: $OP2" -H "X-Profile-Epoch: $EPOCH" -H "If-Match: \"$SUPREV\"" \
     -d '{"operationId":"'$OP2'","profileEpoch":'$EPOCH',"subjectId":"'$SUP'","expectedRevision":'$SUPREV',
          "kind":"support.confirm","contextId":"'$CTX'","contextRevision":'$CTXREV',
          "payload":{"contentHash":"'$HASH'","deliveryId":"'$DEL'","reportedDeliveredAt":"<UTC now>",
          "phase":"before-submit","targets":[...same targets...]}}'
   ```

   If you decide not to deliver: `support.cancel` with `"delivery":"confirmed-undelivered"` (neutral).
   If you cannot tell whether the learner saw it: `"delivery":"delivery-unknown"` — this blocks
   independent credit but is not an error. If your output may reach the learner before you can confirm
   (streaming), use `"deliveryRoute":"app"` instead and tell the learner to open the help in the app;
   the app records the actual render. Help given after the learner checked the answer is review, not
   pre-answer support: use `"phase":"after-submit"`. Preparation alone is never evidence.
5. **Practice and drafts.** `practice.create` (installed reviewed targets only, `maxItems` ≤ 30) returns a
   set and a relative `route`; `phrase.capture` (`source` `course` with `sourceRevisionId`, or
   `spanish` / `uk-intent` with `text` + `meaning`) creates a private **draft**; `material.draft` accepts
   only typed blocks (`paragraph`, `bullet-list`, `example`, `table`, `practice-link`) — no HTML, code
   or remote media; `collection.create` / `collection.patch` never delete phrases. New items are drafts:
   never tell the learner a draft is checked or ready.
6. **Verify every write.** A write is saved only when the receipt arrived. Then read the entity back
   (`sll "$SLL_API/resources/<type>/<id>"`) and compare the persisted fields with what you sent before
   saying "збережено". Tell the learner where it appears (route) — the app never navigates by itself and
   their current draft stays intact.
7. **Errors.**
   - Lost response / timeout: repeat the **same** request (same `Idempotency-Key`, same body) or
     `sll "$SLL_API/operations/<operationId>"`. Never retry a successful action with a new UUID.
   - `409 STALE_REVISION` / `STALE_CONTEXT` / `EPOCH_MISMATCH`: re-read the resource/context, compare,
     and create a **new** operation only if it still applies. Never blind-replay against changed state.
   - `409 IDEMPOTENCY_CONFLICT`: you reused an operation id with a different body — generate a new id
     only after confirming the first operation's outcome.
   - `401`: token expired/revoked → stop and ask the learner for a new token. `403`: missing scope or
     forbidden operation → explain; never try another route. `422`: your payload is invalid — fix it,
     do not strip fields silently. `429`: wait and retry later. `503`: the app is saving/maintaining —
     retry the same operation later.

## Never

- Submit answers, grade, change due dates, mark anything ready/reviewed, promote content, export or
  restore profiles, create tokens, delete data, run SQL or shell commands against the app files.
- Send the learner's answers or drafts to any other service unless the learner explicitly selected
  that exact packet for external review.
- Present a model judgement as a verdict: uncertain answers stay unresolved; say what is uncertain.
