"""Validate source identity, planning counts and local Markdown links. No app tests."""
import hashlib,json,re
from pathlib import Path
root=Path(__file__).resolve().parents[2]
docs=root/'docs'
ledger=json.loads((docs/'contracts/curriculum-ledger.json').read_text())
src=root/ledger['source']
assert hashlib.sha256(src.read_bytes()).hexdigest()==ledger['sourceSha256'], 'Curriculum digest changed; regenerate and inspect ledger'
found=[]
for n,line in enumerate(src.read_text().splitlines(),1):
    m=re.match(r'^\| (A[12]-\d\d-([OLC])\d+)\s*\|',line)
    if m: found.append((m[1],n))
assert len(found)==len(set(i for i,n in found))==210
assert found==[(r['id'],r['sourceLine']) for r in ledger['rows']]
assert ledger['counts']=={'objective':107,'lesson':89,'optional-check':14}
assert len(set(r['blockId'] for r in ledger['rows']))==14
for x in ['CV-01','CV-02','CV-03','CV-04','CV-05','CV-06']:assert re.search(r'^\| '+x+r'\s*\|',src.read_text(),re.M),x
plan=(docs/'IMPLEMENTATION-PLAN.md').read_text()
assert re.findall(r'^\| (D-\d{3}) \|',plan,re.M)==[f'D-{n:03}' for n in range(1,32)]
accept=(docs/'ACCEPTANCE.md').read_text()
assert re.findall(r'^\| (A-\d{2}) \|',accept,re.M)==[f'A-{n:02}' for n in range(1,33)]
files=[root/'README.md',*docs.rglob('*.md')]
links=0
for file in files:
    for target in re.findall(r'\]\(([^)]+)\)',file.read_text()):
        if re.match(r'^(https?://|#|mailto:)',target):continue
        path=target.split('#')[0]
        assert (file.parent/path).exists(),f'Broken local link {file.relative_to(root)} -> {target}'
        links+=1
print(f'PASS: 14 blocks / 107 objectives / 89 lessons / 14 checks; source lines+hash; 6 CV allocations; 31 decisions; 32 acceptance cases; {links} local Markdown links.')
print('Planning structure only; no claim of atomic curriculum coverage or runtime readiness.')
