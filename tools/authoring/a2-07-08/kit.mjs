// Compact task builders with per-skill default hints/feedback. Each lesson module calls
// kit(lessonId, DEFAULTS) where DEFAULTS maps a target key to { rule, ok, bad, unres }.
import { LOOSE, es, ex, hClue, hReveal, hRule, hTr, hTranscript, makeTask, uk } from './lib.mjs';

/** Adds "por favor" variants: ¿X? → ¿X, por favor? / Por favor, ¿x?; X. → X, por favor. */
export function withPF(text) {
  const out = [text];
  const last = text.at(-1);
  if (last === '?' && text.startsWith('¿')) {
    out.push(`${text.slice(0, -1)}, por favor?`);
    out.push(`Por favor, ¿${text[1].toLowerCase()}${text.slice(2)}`);
  } else if (last === '.') {
    out.push(`${text.slice(0, -1)}, por favor.`);
  }
  return out;
}

/** Deterministic option rotation so the correct option is not always first. */
function rotate(list, n) {
  const k = n % list.length;
  return [...list.slice(k), ...list.slice(0, k)];
}

export function kit(lessonId, D) {
  const d = (keys) => {
    const v = D[keys[0]];
    if (!v) throw new Error(`${lessonId}: no defaults for ${keys[0]}`);
    return v;
  };
  const feedback = (keys, o) => ({
    correctUk: o.ok ?? d(keys).ok,
    incorrectUk: o.bad ?? d(keys).bad,
    ...((o.unres ?? d(keys).unres) ? { unresolvedUk: o.unres ?? d(keys).unres } : {}),
  });
  const hints = (keys, o, revealText) => {
    const h = [];
    if (o.rule !== false) h.push(hRule(o.ruleKeys ?? keys, o.rule ?? d(keys).rule));
    if (o.clue) h.push(hClue(o.clueKeys ?? keys, o.clue));
    if (o.tr) h.push(hTr(o.tr));
    if (o.extraHints) h.push(...o.extraHints);
    if (revealText && o.reveal !== false) h.push(hReveal(keys, revealText));
    return h;
  };
  const prompt = (o) => [
    uk(o.instr),
    ...[].concat(o.pre ?? []),
    ...(o.model ? [ex(o.model[0], o.model[1])] : []),
    ...[].concat(o.es ?? []).map((t) => (typeof t === 'string' ? es(t) : t)),
  ];
  return {
    /** exact-variants. o: instr, es, model, acc[], err[[text, fb, out?]], closed, policy, input, ref. */
    ev(n, role, fam, keys, o) {
      keys = [].concat(keys);
      const accepted = o.acc;
      const errors = (o.err ?? []).map(([text, fb, out]) => ({ text, fb, out: out ?? 'x' }));
      const ref = o.ref ?? (typeof accepted[0] === 'string' ? accepted[0] : accepted[0].text);
      return makeTask(lessonId, {
        n,
        role,
        fam,
        targets: keys,
        mode: 'exact-variants',
        prompt: prompt(o),
        input: o.input ?? 'short',
        accepted,
        errors,
        closed: o.closed,
        policy: o.policy ?? LOOSE,
        hints: hints(keys, o, ref),
        ref,
        feedback: feedback(keys, o),
        clips: o.clips,
      });
    },
    /** choice. o: instr, es, opts[[label, out('c'|'x'|{…}), fb?]], keepOrder. */
    ch(n, role, fam, keys, o) {
      keys = [].concat(keys);
      let options = o.opts.map(([label, out, fb]) => ({ label, out, fb }));
      if (!o.keepOrder) options = rotate(options, n);
      const correct = options.find((x) => x.out === 'c' || (typeof x.out === 'object' && keys.every((k) => x.out[k] === 'correct')));
      return makeTask(lessonId, {
        n,
        role,
        fam,
        targets: keys,
        mode: 'choice',
        prompt: prompt(o),
        options,
        hints: hints(keys, o, o.revealText ?? (o.reveal === false ? undefined : correct?.label)),
        ref: o.ref ?? correct?.label,
        feedback: feedback(keys, o),
        clips: o.clips,
      });
    },
    /** Listening meaning question (choice) on one clip, with the transcript as help. */
    lm(n, role, clip, keys, o) {
      return this.ch(n, role, clip.family, keys, { ...o, clips: [clip.id], extraHints: [...(o.extraHints ?? []), hTranscript([].concat(keys), clip.transcript)] });
    },
    /** Dictation of one line of a clip (exact-variants; closed only for one exact text). */
    dict(n, role, clip, keys, o) {
      return this.ev(n, role, clip.family, keys, { ...o, clips: [clip.id], closed: o.closed ?? true });
    },
    /** rubric-review free writing. o: instr, es, criteria[], exemplars[], ref. */
    rb(n, role, fam, keys, o) {
      keys = [].concat(keys);
      return makeTask(lessonId, {
        n,
        role,
        fam,
        targets: keys,
        mode: 'rubric-review',
        prompt: prompt(o),
        input: 'multiline',
        rubric: { criteria: o.criteria, exemplars: o.exemplars },
        policy: o.policy ?? { case: 'sensitive', terminalPunctuation: 'optional' },
        hints: hints(keys, { ...o, reveal: false }, undefined).concat(o.revealText !== false ? [hReveal(keys, o.ref ?? o.exemplars[0])] : []),
        ref: o.ref ?? o.exemplars[0],
        feedback: feedback(keys, o),
        clips: o.clips,
      });
    },
  };
}
