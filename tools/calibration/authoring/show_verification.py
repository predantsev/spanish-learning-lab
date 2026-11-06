#!/usr/bin/env python3
"""Print each hidden label's expected finding beside its retrieved source passages (manual semantic check)."""
import json
import sys
from pathlib import Path

L = Path(__file__).resolve().parent
sv = json.load(open(L / "source-verification.json"))
lab = {l["caseId"]: l for l in json.load(open(L / "labels.json"))["labels"]}
src = {s["sourceId"]: s for s in sv["sources"]}
only = set(sys.argv[1:])
for l in sv["labels"]:
    if only and l["caseId"] not in only:
        continue
    lb = lab[l["caseId"]]
    print(f"## {l['caseId']} [{lb['authoringKey']}] {lb['class']} {lb['defectType'] or ''} blocking={lb['releaseBlocking']}")
    print(f"   finding: {lb['expectedFinding']}")
    for sid in l["sourceRefs"]:
        for p in src[sid]["passages"]:
            print(f"   [{sid}] {p['passage']}")
