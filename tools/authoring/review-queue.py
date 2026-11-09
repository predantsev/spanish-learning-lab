#!/usr/bin/env python3
"""Sequential opposite-provider review queue for issue #111 (integrator tool).

Walks lessons in course order. For each lesson whose own record, tasks or clips are still `draft`,
builds one review batch (an --items batch of the draft entities when they fit in 25, otherwise the
whole lesson), runs the calibrated Codex reviewer, applies the verdicts and commits the batch.
Entities in `draft` and `needs-review` are included (run it only after the repair pass, so the
remaining needs-review ones are disputed findings); `quarantined` is skipped.

Stops with exit 10 when the reviewer reports a usage limit (the failed run record is committed,
nothing is applied), exit 1 on any other tool failure. Run from the repository root with the
project Node on PATH and SLL_REVIEW_KEYS_DIR set (see work/briefs/GATE-calibration.md).

  python3 tools/authoring/review-queue.py [--dry-run] [--only A1-01-L2,A1-02-L1] [--max N]
"""
import argparse
import glob
import json
import os
import re
import subprocess
import sys

SRC = 'content/source'
REVIEWS = 'content/reviews'
MAX_ITEMS = 25
# needs-review entities still pending after the repair pass are disputed or context-only findings:
# they are re-reviewed as they are (repaired ones are already draft again).
PENDING = ('draft', 'needs-review')
LIMIT_RE = re.compile(r'usage limit|hit your usage|rate limit', re.I)


def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def order_key(lesson_id):
    m = re.match(r'^A([12])-0([1-8])-(?:L(\d+)|(C1))$', lesson_id)
    return (int(m[1]), int(m[2]), 99 if m[4] else int(m[3])) if m else (9, 9, 999)


def draft_scope(lesson_id):
    items = []
    lesson = load(f'{SRC}/lessons/{lesson_id}.json')
    if lesson.get('reviewStatus', 'draft') in PENDING:
        items.append(f'lesson:{lesson_id}')
    tpath = f'{SRC}/tasks/{lesson_id}.json'
    if os.path.exists(tpath):
        for t in load(tpath)['tasks']:
            if t.get('reviewStatus', 'draft') in PENDING:
                items.append(f"task:{t['id']}")
    block = lesson['blockId']
    apath = f'{SRC}/audio/{block}.json'
    if os.path.exists(apath):
        for c in load(apath)['clips']:
            if c.get('lessonId') == lesson_id and c.get('reviewStatus', 'draft') in PENDING:
                items.append(f"clip:{c['id']}")
    return items


def next_batch_id(lesson_id):
    n = 1
    while os.path.exists(f'{REVIEWS}/{lesson_id}.r{n}'):
        n += 1
    return f'{lesson_id}.r{n}'


def sh(args, check=True):
    print('$', ' '.join(args), flush=True)
    p = subprocess.run(args, capture_output=True, text=True)
    out = (p.stdout or '') + (p.stderr or '')
    print(out[-2000:], flush=True)
    if check and p.returncode != 0:
        return p.returncode, out
    return p.returncode, out


def commit(message):
    subprocess.run(['git', 'add', 'content'], check=True)
    if subprocess.run(['git', 'diff', '--cached', '--quiet']).returncode != 0:
        subprocess.run(['git', 'commit', '-q', '-m', message], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--only', default='')
    ap.add_argument('--max', type=int, default=0)
    a = ap.parse_args()
    lessons = sorted((os.path.basename(p)[:-5] for p in glob.glob(f'{SRC}/lessons/*.json')), key=order_key)
    if a.only:
        wanted = set(a.only.split(','))
        lessons = [l for l in lessons if l in wanted]
    done = 0
    for lid in lessons:
        items = draft_scope(lid)
        if not items:
            continue
        batch = next_batch_id(lid)
        scope = ['--items', ','.join(items)] if len(items) <= MAX_ITEMS else ['--lesson', lid]
        print(f'== {batch}: {len(items)} draft entities, scope {scope[0]}', flush=True)
        base = ['node', 'tools/review/review.ts']
        rc, out = sh(base + ['packet', *scope, '--author-provider', 'anthropic', '--author-model', 'claude-opus-5-5',
                             '--batch-id', batch] + (['--dry-run'] if a.dry_run else []))
        if rc != 0:
            print(f'!! packet failed for {batch}', flush=True)
            return 1
        if a.dry_run:
            done += 1
            if a.max and done >= a.max:
                break
            continue
        rc, out = sh(base + ['run-codex', '--batch', batch])
        for f in glob.glob(f'{REVIEWS}/{batch}/runs/*/stderr.txt'):
            with open(f, encoding='utf-8', errors='replace') as fh:
                out += fh.read()[-4000:]
        if LIMIT_RE.search(out):
            commit(f'chore(content): #111 record {batch} review run stopped by reviewer usage limit')
            print(f'!! USAGE LIMIT at {batch}', flush=True)
            return 10
        if rc != 0:
            commit(f'chore(content): #111 record failed review run {batch}')
            print(f'!! run-codex failed for {batch}', flush=True)
            return 1
        rc, out = sh(base + ['apply', '--batch', batch])
        if rc != 0:
            commit(f'chore(content): #111 record review {batch} (apply failed)')
            print(f'!! apply failed for {batch}', flush=True)
            return 1
        commit(f'chore(content): #111 record opposite-provider review {batch}')
        done += 1
        if a.max and done >= a.max:
            break
    print(f'queue finished: {done} batch(es)', flush=True)
    return 0


if __name__ == '__main__':
    sys.exit(main())
