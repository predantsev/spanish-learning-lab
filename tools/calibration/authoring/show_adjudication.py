#!/usr/bin/env python3
"""Side-by-side view for adjudication: hidden label vs reviewer output, per case.

Usage: python3 -I show_adjudication.py <run-dir> [caseId ...]
"""
import json
import sys
from pathlib import Path

L = Path(__file__).resolve().parent
import os
labels = {l["caseId"]: l for l in json.load(open(L / os.environ.get("LABELS", "labels.json")))["labels"]}
run = Path(sys.argv[1])
reviews = {c["caseId"]: c for c in json.load(open(run / "parsed.json"))["cases"]}
only = set(sys.argv[2:])
for cid, l in labels.items():
    if only and cid not in only:
        continue
    r = reviews[cid]
    mark = ""
    if l["class"] == "flawed" and r["verdict"] != "flawed":
        mark = "  <<< NOT FLAGGED FLAWED"
    if l["class"] == "valid" and r["verdict"] != "valid":
        mark = f"  <<< VALID CONTROL -> {r['verdict']}"
    if l["class"] == "ambiguous" and r["verdict"] != "uncertain":
        mark = f"  <<< AMBIGUOUS -> {r['verdict']}"
    print(f"## {cid} [{l['authoringKey']}] label={l['class']}/{l['defectType']} blocking={l['releaseBlocking']} | reviewer={r['verdict']}/{r['blocking']}{mark}")
    if l["wrongElement"]:
        print(f"   LABEL element: {l['wrongElement']}")
    print(f"   REV answer:  {r['reviewerAnswer']}")
    if r["element"]:
        print(f"   REV element: {r['element']}")
    if r["defect"]:
        print(f"   REV defect:  {r['defect']}")
    if r["sources"]:
        print(f"   REV sources: {' || '.join(r['sources'])}")
    if r["notes"]:
        print(f"   REV notes:   {r['notes']}")
