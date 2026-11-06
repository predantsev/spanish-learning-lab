#!/usr/bin/env python3
"""Authoring generator for blocks A2-05 and A2-06 (issue #111, WP-05 brief 09, range a2-05-06).

The committed JSON under content/source is canonical; this script only produces it from the
compact lesson data in a2_05.py / a2_06.py. Nothing is generated at runtime.

Re-running is safe after review: an item (lesson, task, clip, material) whose body without
`reviewStatus` is unchanged keeps the status already on disk; a changed or new item is written as
`draft`. Files are written as 2-space JSON with a trailing newline (the format of tools/review).

Usage: python3 tools/authoring/a2-05-06/build.py [--only A2-05-L1,A2-05-L2] [--dry-run]
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
SRC = os.path.join(ROOT, 'content', 'source')

# --------------------------------------------------------------------------------------------
# Blocks (content.schema.json $defs/Block)
# --------------------------------------------------------------------------------------------


def P(text: str) -> dict:
    """Ukrainian paragraph."""
    return {'type': 'paragraph', 'language': 'uk', 'text': text}


def PE(text: str) -> dict:
    """Spanish (Spain) paragraph."""
    return {'type': 'paragraph', 'language': 'es-ES', 'text': text}


def EX(es: str, uk: str) -> dict:
    return {'type': 'example', 'spanish': es, 'ukrainian': uk}


def BL(items: list[str], lang: str = 'uk') -> dict:
    return {'type': 'bullet-list', 'language': lang, 'items': items}


def TB(columns: list[str], rows: list[list[str]], lang: str = 'es-ES') -> dict:
    return {'type': 'table', 'language': lang, 'columns': columns, 'rows': rows}


def LINK(label: str, keys: list[str], mode: str, max_items: int) -> dict:
    return {'type': 'practice-link', 'labelUk': label, 'targets': [tgt(k) for k in keys], 'mode': mode, 'maxItems': max_items}


def tgt(key: str) -> dict:
    skill, modality = key.rsplit('/', 1)
    return {'skillId': skill, 'modality': modality}


POL_WORD = {'case': 'insensitive', 'terminalPunctuation': 'optional'}
POL_SENT = {'case': 'insensitive', 'terminalPunctuation': 'optional'}
POL_DICT = {'case': 'insensitive', 'terminalPunctuation': 'optional'}

CODE = {'c': 'correct', 'i': 'incorrect', 'u': 'unresolved'}


def outcomes(keys: list[str], codes: str) -> dict:
    if len(codes) != len(keys):
        raise ValueError(f'outcome codes {codes!r} do not match targets {keys}')
    return {k: CODE[c] for k, c in zip(keys, codes)}


# --------------------------------------------------------------------------------------------
# Task builder
# --------------------------------------------------------------------------------------------


class LessonTasks:
    """Collects the tasks of one lesson/check; ids are assigned in order (T01, T02, …)."""

    def __init__(self, lesson_id: str):
        self.lesson_id = lesson_id
        self.tasks: list[dict] = []

    def _next_id(self) -> str:
        return f'{self.lesson_id}-T{len(self.tasks) + 1:02d}'

    def _base(self, role, family, mode, keys, prompt, inp) -> dict:
        assert role in ('supported', 'independent', 'delayed', 'transfer'), role
        return {
            'id': self._next_id(),
            'lessonId': self.lesson_id,
            'role': role,
            'family': family,
            'mode': mode,
            'targets': [tgt(k) for k in keys],
            'prompt': prompt,
            'input': inp,
        }

    def _finish(self, task, hints, fb, ref, clips=None) -> str:
        if clips:
            task['clipIds'] = clips
        if hints:
            task['hints'] = [{'kind': kind, 'targets': list(tk), 'blocks': blocks} for kind, tk, blocks in hints]
        if ref is not None:
            task['referenceAnswer'] = ref
        feedback = {'correctUk': fb[0], 'incorrectUk': fb[1]}
        if len(fb) > 2 and fb[2]:
            feedback['unresolvedUk'] = fb[2]
        task['feedback'] = feedback
        task['reviewStatus'] = 'draft'
        self.tasks.append(task)
        return task['id']

    def exact(self, role, family, keys, prompt, accepted, errors, hints, fb, ref, *, closed=False,
              policy=None, inp='short', clips=None) -> str:
        task = self._base(role, family, 'exact-variants', keys, prompt, inp)
        acc = []
        for i, a in enumerate(accepted, 1):
            text, note = (a, None) if isinstance(a, str) else a
            v = {'id': f'v{i}', 'text': text}
            if note:
                v['noteUk'] = note
            acc.append(v)
        task['accepted'] = acc
        if errors:
            task['errors'] = [
                {'id': f'e{i}', 'text': text, 'outcomes': outcomes(keys, codes), 'feedbackUk': fbk}
                for i, (text, codes, fbk) in enumerate(errors, 1)
            ]
        if closed:
            task['closed'] = True
        task['policy'] = policy or POL_WORD
        return self._finish(task, hints, fb, ref, clips)

    def choice(self, role, family, keys, prompt, options, hints, fb, *, ref=None, clips=None) -> str:
        task = self._base(role, family, 'choice', keys, prompt, 'options')
        opts = []
        for i, (label, codes, fbk) in enumerate(options):
            o = {'id': 'abcdefgh'[i], 'label': label, 'outcomes': outcomes(keys, codes)}
            if fbk:
                o['feedbackUk'] = fbk
            opts.append(o)
        task['options'] = opts
        return self._finish(task, hints, fb, ref, clips)

    def slots(self, role, family, keys, prompt, template, slot_defs, hints, fb, ref, *, policy=None,
              inp='short', clips=None) -> str:
        """template: 'Antes yo {a} en casa y mi padre {b} la cena.'; slot_defs: {id: (key, accepted, errors)}."""
        task = self._base(role, family, 'finite-slots', keys, prompt, inp)
        task['policy'] = policy or POL_SENT
        parts: list = []
        pos = 0
        for m in re.finditer(r'\{([a-z0-9]+)\}', template):
            if m.start() > pos:
                parts.append(template[pos:m.start()])
            parts.append({'slot': f'gap-{m.group(1)}'})
            pos = m.end()
        if pos < len(template):
            parts.append(template[pos:])
        task['template'] = parts
        slots = []
        for sid, (key, acc, errs) in slot_defs.items():
            s = {'id': f'gap-{sid}', 'target': key, 'accepted': list(acc)}
            if errs:
                s['errors'] = [{'text': t, 'feedbackUk': f} for t, f in errs]
            s['closed'] = False
            slots.append(s)
        task['slots'] = slots
        return self._finish(task, hints, fb, ref, clips)

    def rubric(self, role, family, keys, prompt, criteria, exemplars, hints, fb, ref, *, policy=None,
               inp='multiline', clips=None) -> str:
        task = self._base(role, family, 'rubric-review', keys, prompt, inp)
        task['policy'] = policy or POL_SENT
        task['rubric'] = {
            'criteriaUk': criteria,
            'exemplars': [{'id': f'x{i}', 'text': t} for i, t in enumerate(exemplars, 1)],
        }
        return self._finish(task, hints, fb, ref, clips)


def reveal(keys: list[str], answer_es: str) -> tuple:
    return ('reveal', keys, [P('Правильна відповідь:'), PE(answer_es)])


def rule(keys: list[str], text_uk: str, *extra: dict) -> tuple:
    return ('rule', keys, [P(text_uk), *extra])


def gloss(text_uk: str) -> tuple:
    """Vocabulary support: no grammar target."""
    return ('translation', [], [P(text_uk)])


# --------------------------------------------------------------------------------------------
# Lesson assembly
# --------------------------------------------------------------------------------------------


def step(sid, kind, title, required, *, blocks=None, tasks=None, clips=None) -> dict:
    s = {'id': sid, 'kind': kind, 'titleUk': title, 'required': required}
    if blocks:
        s['blocks'] = blocks
    if tasks:
        s['taskIds'] = tasks
    if clips:
        s['clipIds'] = clips
    return s


def lesson(lid, kind, block, title, term, summary, objectives, cv, situations, minutes, introduces,
           revisits, steps, *, skippable=None) -> dict:
    body = {
        'schemaVersion': 1,
        'id': lid,
        'kind': kind,
        'blockId': block,
        'titleUk': title,
    }
    if term:
        body['termEs'] = term
    body.update({
        'summaryUk': summary,
        'objectives': objectives,
    })
    if cv:
        body['cv'] = cv
    body.update({
        'situations': situations,
        'estimatedMinutes': minutes,
    })
    if skippable is not None:
        body['skippableFoundation'] = skippable
    body.update({
        'introduces': introduces,
        'revisits': revisits,
        'steps': steps,
        'reviewStatus': 'draft',
    })
    return body


def clip(cid, lesson_id, kind, transcript, translation, keys, family, note=None) -> dict:
    c = {
        'id': cid,
        'lessonId': lesson_id,
        'kind': kind,
        'transcript': transcript,
        'translationUk': translation,
        'targets': [tgt(k) for k in keys],
        'family': family,
    }
    if note:
        c['pronunciationNoteUk'] = note
    c['reviewStatus'] = 'draft'
    return c


def material(mid, topic, title, blocks, linked) -> dict:
    return {'id': mid, 'topicId': topic, 'titleUk': title, 'blocks': blocks, 'linkedTargets': linked, 'reviewStatus': 'draft'}


# --------------------------------------------------------------------------------------------
# Writing with review-status preservation
# --------------------------------------------------------------------------------------------


def canon(obj) -> str:
    body = {k: v for k, v in obj.items() if k != 'reviewStatus'}
    return json.dumps(body, ensure_ascii=False, sort_keys=True, separators=(',', ':'))


def keep_status(new: dict, old: dict | None) -> dict:
    if old is not None and canon(old) == canon(new) and 'reviewStatus' in old:
        new = dict(new)
        new['reviewStatus'] = old['reviewStatus']
    return new


def load_json(path):
    if not os.path.exists(path):
        return None
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def dump(path, obj, dry):
    text = json.dumps(obj, ensure_ascii=False, indent=2) + '\n'
    old = open(path, encoding='utf-8').read() if os.path.exists(path) else None
    if old == text:
        return False
    if not dry:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(text)
    return True


def write_lesson(lesson_body, tasks, dry):
    lid = lesson_body['id']
    lpath = os.path.join(SRC, 'lessons', f'{lid}.json')
    tpath = os.path.join(SRC, 'tasks', f'{lid}.json')
    changed = []
    if dump(lpath, keep_status(lesson_body, load_json(lpath)), dry):
        changed.append(lpath)
    old_tasks = {t['id']: t for t in (load_json(tpath) or {}).get('tasks', [])}
    out = [keep_status(t, old_tasks.get(t['id'])) for t in tasks]
    if dump(tpath, {'schemaVersion': 1, 'lessonId': lid, 'tasks': out}, dry):
        changed.append(tpath)
    return changed


def write_block_list(kind_dir, block, key, items, dry):
    path = os.path.join(SRC, kind_dir, f'{block}.json')
    if not items and not os.path.exists(path):
        return []
    old = {x['id']: x for x in (load_json(path) or {}).get(key, [])}
    out = [keep_status(x, old.get(x['id'])) for x in items]
    if dump(path, {'schemaVersion': 1, 'blockId': block, key: out}, dry):
        return [path]
    return []


# --------------------------------------------------------------------------------------------
# Skill / lexicon patches (owned files; IDs never change)
# --------------------------------------------------------------------------------------------


def patch_skills(block, patches: dict, dry):
    """patches: skillId -> {field: value}. A content change resets that skill to draft."""
    path = os.path.join(SRC, 'skills', f'{block}.json')
    data = load_json(path)
    for s in data['skills']:
        p = patches.get(s['skillId'])
        if not p:
            continue
        before = canon(s)
        for k, v in p.items():
            if k == 'scope':
                s['scope'].update(v)
            else:
                s[k] = v
        if canon(s) != before:
            s['reviewStatus'] = 'draft'
    missing = set(patches) - {s['skillId'] for s in data['skills']}
    if missing:
        raise SystemExit(f'unknown skills in patch: {sorted(missing)}')
    return [path] if dump(path, data, dry) else []


def patch_lexicon(block, updates: dict, additions: list, dry):
    """updates: id -> {field: value}; additions: new items appended once (by id)."""
    path = os.path.join(SRC, 'lexicon', f'{block}.json')
    data = load_json(path)
    items = data['items']
    by_id = {x['id']: x for x in items}
    for lid, fields in updates.items():
        item = by_id[lid]
        before = canon(item)
        item.update(fields)
        if canon(item) != before and item.get('reviewStatus') not in (None, 'draft'):
            item['reviewStatus'] = 'draft'
    for add in additions:
        if add['id'] in by_id:
            existing = by_id[add['id']]
            before = canon(existing)
            existing.update(add)
            if canon(existing) != before and existing.get('reviewStatus') not in (None, 'draft'):
                existing['reviewStatus'] = 'draft'
        else:
            items.append(dict(add))
            by_id[add['id']] = items[-1]
    return [path] if dump(path, data, dry) else []


# --------------------------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------------------------


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', default='', help='comma-separated lesson ids to (re)write; default: all authored')
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()
    sys.path.insert(0, HERE)
    import a2_05  # noqa: E402
    blocks = [a2_05]
    try:
        import a2_06  # noqa: E402
        blocks.append(a2_06)
    except ModuleNotFoundError:
        pass
    only = {x for x in args.only.split(',') if x}
    changed: list[str] = []
    for mod in blocks:
        built = mod.build()
        if only and not any(lb['id'] in only for lb, _ in built['lessons']):
            continue
        for lesson_body, tasks in built['lessons']:
            if only and lesson_body['id'] not in only:
                continue
            changed += write_lesson(lesson_body, tasks, args.dry_run)
        block = built['block']
        changed += write_block_list('audio', block, 'clips', built['clips'], args.dry_run)
        changed += write_block_list('materials', block, 'materials', built['materials'], args.dry_run)
        if built.get('skill_patches'):
            changed += patch_skills(block, built['skill_patches'], args.dry_run)
        if built.get('lexicon_updates') or built.get('lexicon_additions'):
            changed += patch_lexicon(block, built.get('lexicon_updates', {}), built.get('lexicon_additions', []), args.dry_run)
    for path in changed:
        print(('would write ' if args.dry_run else 'wrote ') + os.path.relpath(path, ROOT))
    if not changed:
        print('no changes')


if __name__ == '__main__':
    main()
