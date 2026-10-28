# Documentation validation

These tools validate the handoff, not the future application. Standard-library `python3 docs/tools/validate_plan.py` checks the curriculum source ledger, counts/IDs, decision/case coverage and local links. `python3 docs/tools/build_contracts.py` deterministically regenerates wire schemas/OpenAPI/examples and the curriculum source index; inspect diffs after edits.

To validate wire documents, install only the documentation validators in an isolated temporary directory, with lifecycle scripts disabled:

```sh
npm install --prefix /tmp/sll-plan-validators --ignore-scripts --no-audit --no-fund --save-exact ajv@8.20.0 ajv-formats@3.0.1 @apidevtools/swagger-parser@13.1.0
NODE_PATH=/tmp/sll-plan-validators/node_modules node docs/tools/validate_contracts.cjs
```

This does not install the proposed application or modify the global runtime. No server, database, provider, browser or media job is started. A schema-compatible payload can still be unauthorized or semantically invalid; API.md/DOMAIN-SPEC cross-field/domain rules require implementation tests in ACCEPTANCE.md.
