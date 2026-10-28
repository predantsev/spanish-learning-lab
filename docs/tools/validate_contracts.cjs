// Documentation-only validation; install the pinned validators outside this repository.
const path = require('node:path');
const fs = require('node:fs');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const SwaggerParser = require('@apidevtools/swagger-parser');
const root = path.resolve(__dirname, '..', 'contracts');
const openapi = JSON.parse(fs.readFileSync(path.join(root, 'openapi.json'), 'utf8'));
const operations = Object.values(openapi.paths).flatMap(p => Object.values(p)).map(o => o.operationId);
if (new Set(operations).size !== operations.length) throw new Error('Duplicate OpenAPI operationId');
for (const [p,m] of [['/profile','get'],['/auth/tokens','get'],['/contexts/{id}','get'],['/commands','post'],['/recovery/restore-preview','post'],['/recovery/restore-confirm','post']]) if (!openapi.paths[p]?.[m]) throw new Error(`Missing lifecycle/read route ${m} ${p}`);
const schemas = JSON.parse(fs.readFileSync(path.join(root, 'schemas.json'), 'utf8'));
const examples = JSON.parse(fs.readFileSync(path.join(root, 'examples.json'), 'utf8'));
const ajv = new Ajv2020({ strict: true, allErrors: true, coerceTypes: false, useDefaults: false, removeAdditional: false });
addFormats(ajv);
ajv.addSchema(schemas);
for (const name of Object.keys(schemas.$defs)) ajv.getSchema(`${schemas.$id}#/$defs/${name}`);
const kinds = schemas.$defs.Command.oneOf.map(s => s.properties.kind.const);
const prose = fs.readFileSync(path.join(root, 'API.md'), 'utf8');
const proseKinds = [...prose.matchAll(/^\| `([a-z]+\.[a-z-]+)` \|/gm)].map(m => m[1]);
if (JSON.stringify([...kinds].sort()) !== JSON.stringify([...proseKinds].sort())) throw new Error('API command table/schema mismatch');
const covered = new Set(examples.valid.filter(e => e.schema === 'Command').map(e => e.value.kind));
if (kinds.some(k => !covered.has(k))) throw new Error('Missing positive command example');
let count = 0;
for (const [label, items] of [['valid', examples.valid], ['invalid', examples.invalid]]) {
  for (const item of items) {
    const check = ajv.getSchema(`${schemas.$id}#/$defs/${item.schema}`);
    const passed = check(item.value);
    if (passed !== (label === 'valid')) throw new Error(`${label} example for ${item.schema}: ${JSON.stringify(check.errors)}`);
    count++;
  }
}
(async () => {
  await SwaggerParser.validate(path.join(root, 'openapi.json'));
  console.log(`PASS: ${Object.keys(schemas.$defs).length} strict JSON Schema definitions; ${count} positive/negative examples; unique operations/read routes, all command shapes and OpenAPI 3.1 structure/references.`);
  console.log('No application, language, media, API runtime, browser or device check was performed.');
})().catch(e => { console.error(e.message); process.exitCode = 1; });
