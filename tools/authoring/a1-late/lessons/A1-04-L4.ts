// A1-04-L4 — daily-routine pronominal verbs: pronoun selection and placement (O5).
import { Kit, S, ex, hTranscript, plink, tableEs, ul, uk, WHO } from '../lib.ts';
import type { Person, SlotSpec } from '../lib.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-04-L4', RULES);

const RP = 'reflexive.pronouns/written-form';
const RPC = 'reflexive.pronouns/context-choice';
const PLW = 'reflexive.placement/written-form';
const PLU = 'reflexive.placement/construction-use';
const LM = 'listening.daily-actions/listening-meaning';

const PRON = ['me', 'te', 'se', 'nos', 'os', 'se'];
const PRON_WHO: Record<string, string> = { me: 'yo', te: 'tú', nos: 'nosotros', os: 'vosotros', se: 'él / ella / usted і ellos / ellas / ustedes' };

/** Wrong reflexive pronouns for a person, with feedback naming whose pronoun it is. */
function pronErr(p: Person): Array<[string, string]> {
  const correct = PRON[p] ?? '';
  return ['me', 'te', 'se', 'nos', 'os']
    .filter((x) => x !== correct)
    .map((x) => [x, `«${x}» — займенник для ${PRON_WHO[x] ?? ''}. Тут підмет — ${WHO[p]}.`]);
}

function pgap(n: number, role: 'supported' | 'independent' | 'delayed' | 'transfer', fam: string, p: Person, s: string, tr: string, model?: string): string {
  return k.exact({
    n,
    role,
    fam,
    t: [RP],
    ins: model ? `Впиши займенник, що відповідає підмету. Зразок: ${model}.` : 'Впиши займенник, що відповідає підмету.',
    p: [s],
    acc: [PRON[p] ?? ''],
    err: pronErr(p),
    tr,
  });
}

const pslot = (id: string, p: Person): SlotSpec => ({ id, t: RP, acc: [PRON[p] ?? ''], err: pronErr(p) });

const MODEL = 'me levanto, te levantas, se levanta, nos levantamos, os levantáis, se levantan';

// ======================= reflexive pronouns
pgap(1, 'supported', 'a104.morning', 0, '(yo) ___ levanto temprano.', 'Я встаю рано.', MODEL);
pgap(2, 'supported', 'a104.bathroom', 2, 'Ana ___ ducha.', 'Ана приймає душ.', MODEL);
pgap(3, 'independent', 'a104.morning', 1, '¿Tú ___ levantas tarde?', 'Ти встаєш пізно?');
pgap(4, 'independent', 'a104.bathroom', 3, 'Nosotros ___ lavamos los dientes.', 'Ми чистимо зуби.');
pgap(5, 'independent', 'a104.bathroom', 4, 'Vosotras ___ peináis.', 'Ви зачісуєтеся.');
k.slots({
  n: 6,
  role: 'independent',
  fam: 'a104.bathroom',
  t: [RP],
  ins: 'Перепиши речення повністю, вставивши займенники, що відповідають підметам.',
  p: ['Yo ___ ducho y mis hermanos ___ lavan los dientes.'],
  tpl: ['Yo ', S('s1'), ' ducho y mis hermanos ', S('s2'), ' lavan los dientes.'],
  slots: [pslot('s1', 0), pslot('s2', 5)],
  tr: 'Я приймаю душ, а мої брати чистять зуби.',
});
pgap(7, 'delayed', 'a104.morning', 2, '¿Usted ___ levanta temprano?', 'Ви встаєте рано?');
pgap(8, 'delayed', 'a104.morning', 5, 'Mis padres ___ levantan tarde.', 'Мої батьки встають пізно.');
k.slots({
  n: 9,
  role: 'transfer',
  fam: 'a104.gym',
  t: [RP],
  ins: 'Перепиши речення повністю, вставивши займенники, що відповідають підметам.',
  p: ['En el gimnasio, yo ___ ducho y vosotros ___ ducháis.'],
  tpl: ['En el gimnasio, yo ', S('s1'), ' ducho y vosotros ', S('s2'), ' ducháis.'],
  slots: [pslot('s1', 0), pslot('s2', 4)],
  tr: 'У спортзалі я приймаю душ, і ви теж приймаєте душ.',
});
pgap(10, 'transfer', 'a104.trip', 4, 'En el hotel, ¿vosotros ___ levantáis temprano?', 'У готелі ви встаєте рано?');

// ======================= placement and dictionary form
const before = 'Займенник стоїть окремим словом перед дієсловом в особовій формі.';
k.exact({
  n: 11,
  role: 'supported',
  fam: 'a104.morning',
  t: [PLU],
  ins: 'Склади речення з поданих слів. Зразок: Ana se ducha.',
  p: ['me · temprano · levanto'],
  acc: ['Me levanto temprano.', 'Yo me levanto temprano.'],
  err: [['Levanto me temprano.', before]],
  tr: 'Я встаю рано.',
});
k.exact({
  n: 12,
  role: 'supported',
  fam: 'a104.morning',
  t: [PLW],
  ins: 'Перепиши речення із запереченням no. Зразок: Me levanto tarde. → No me levanto tarde.',
  p: ['Me ducho en casa.'],
  acc: ['No me ducho en casa.', 'Yo no me ducho en casa.'],
  err: [['Me no ducho en casa.', 'No стоїть перед займенником: No me ducho…']],
  tr: 'Я (не) приймаю душ удома.',
});
k.exact({
  n: 13,
  role: 'independent',
  fam: 'a104.bathroom',
  t: [PLU],
  ins: 'Переклади іспанською: «Я приймаю душ».',
  acc: ['Me ducho.', 'Yo me ducho.'],
  err: [
    ['Ducho me.', before],
    ['Yo ducho.', 'Бракує займенника: «приймати душ» — ducharse, отже me ducho.'],
  ],
});
k.exact({
  n: 14,
  role: 'independent',
  fam: 'a104.bathroom',
  t: [PLW],
  ins: 'Напиши словникову форму (інфінітив) дієслова з форми «me ducho».',
  acc: ['ducharse'],
  err: [
    ['duchar', 'Duchar — «мити когось під душем». «Приймати душ» — зворотне дієслово, у словнику з -se: ducharse.'],
    ['ducharme', 'Словникова форма закінчується на -se, а не на займенник особи: ducharse.'],
  ],
});
k.exact({
  n: 15,
  role: 'independent',
  fam: 'a104.bathroom',
  t: [PLU],
  ins: 'Переклади іспанською: «Ми вмиваємося».',
  acc: ['Nos lavamos.', 'Nosotros nos lavamos.', 'Nosotras nos lavamos.'],
  err: [['Lavamos nos.', before]],
});
k.exact({
  n: 16,
  role: 'independent',
  fam: 'a104.morning',
  t: [PLW],
  ins: 'Перепиши речення із запереченням no.',
  p: ['Te levantas temprano.'],
  acc: ['No te levantas temprano.', 'Tú no te levantas temprano.'],
  err: [['Te no levantas temprano.', 'No стоїть перед займенником: No te levantas…']],
  tr: 'Ти (не) встаєш рано.',
});
k.slots({
  n: 17,
  role: 'delayed',
  fam: 'a104.bathroom',
  t: [PLU],
  ins: 'Перепиши речення повністю: встав дієслово peinarse у потрібній формі — із займенником на правильному місці.',
  p: ['Ana ___. (peinarse)'],
  tpl: ['Ana ', S('s1'), '.'],
  slots: [{ id: 's1', t: PLU, acc: ['se peina'], err: [['peina se', before], ['peinarse', 'Це словникова форма. У реченні потрібна особова форма із займенником перед дієсловом.']] }],
  ref: 'Ana se peina.',
  tr: 'Ана зачісується.',
});
k.exact({
  n: 18,
  role: 'delayed',
  fam: 'a104.morning',
  t: [PLW],
  ins: 'Напиши словникову форму (інфінітив) дієслова з форми «nos levantamos».',
  acc: ['levantarse'],
  err: [
    ['levantar', 'Levantar — «піднімати щось». «Вставати» — зворотне дієслово, у словнику з -se: levantarse.'],
    ['levantarnos', 'Словникова форма закінчується на -se, а не на займенник особи: levantarse.'],
  ],
});
k.exact({
  n: 19,
  role: 'transfer',
  fam: 'a104.family-morning',
  t: [PLU],
  ins: 'Переклади іспанською: «Мої брати не встають рано».',
  acc: ['Mis hermanos no se levantan temprano.'],
  err: [
    ['Mis hermanos se no levantan temprano.', 'No стоїть перед займенником: no se levantan.'],
    ['Mis hermanos no levantan se temprano.', before],
  ],
});
k.exact({
  n: 20,
  role: 'transfer',
  fam: 'a104.gym',
  t: [PLU],
  ins: 'Переклади іспанською: «Ви приймаєте душ у спортзалі?» (питаєш кількох друзів).',
  acc: ['¿Os ducháis en el gimnasio?', '¿Vosotros os ducháis en el gimnasio?', '¿Vosotras os ducháis en el gimnasio?'],
  err: [['¿Ducháis os en el gimnasio?', before]],
});

// ======================= context-choice: pronoun selection
k.choice({
  n: 21,
  role: 'independent',
  fam: 'a104.bathroom',
  t: [RPC],
  ins: 'Обери займенник, що відповідає підмету.',
  p: ['Nosotros ___ duchamos.'],
  o: [
    ['os', RPC, '«Os» — займенник для vosotros.'],
    ['nos', true],
    ['se', RPC, '«Se» — займенник для él / ella / usted і ellos / ustedes.'],
  ],
  tr: 'Ми приймаємо душ.',
});
k.choice({
  n: 22,
  role: 'independent',
  fam: 'a104.morning',
  t: [RPC],
  ins: 'Обери займенник, що відповідає підмету.',
  p: ['¿Vosotros ___ levantáis temprano?'],
  o: [
    ['os', true],
    ['nos', RPC, '«Nos» — займенник для nosotros.'],
    ['se', RPC, '«Se» — займенник для él / ella / usted і ellos / ustedes.'],
  ],
  tr: 'Ви встаєте рано?',
});
k.choice({
  n: 23,
  role: 'delayed',
  fam: 'a104.bathroom',
  t: [RPC],
  ins: 'Обери займенник, що відповідає підмету.',
  p: ['Mis amigos ___ peinan.'],
  o: [
    ['nos', RPC, '«Nos» — займенник для nosotros.'],
    ['os', RPC, '«Os» — займенник для vosotros.'],
    ['se', true],
  ],
  tr: 'Мої друзі зачісуються.',
});

// ======================= listening practice
const c5 = k.clip({
  id: 'clip.a1-04.daily-actions.ducha',
  kind: 'sentence',
  es: 'Me levanto temprano y me ducho.',
  uk: 'Я встаю рано й приймаю душ.',
  t: [LM],
  fam: 'a104.l4.morning',
});
k.choice({
  n: 24,
  role: 'independent',
  fam: 'a104.l4.morning',
  t: [LM],
  clips: [c5],
  ins: 'Послухай запис. Що робить людина?',
  o: [
    ['Встає пізно й снідає.', false],
    ['Встає рано й приймає душ.', true],
    ['Рано йде на роботу.', false],
  ],
  hints: [hTranscript([LM], 'Me levanto temprano y me ducho.')],
});

k.material({
  id: 'material.a1-04.reflexive',
  topic: 'A1-04-L4',
  title: 'Дієслова із займенником: me levanto, te duchas…',
  blocks: [
    tableEs(
      ['persona', 'pronombre', 'levantarse'],
      [
        ['yo', 'me', 'me levanto'],
        ['tú', 'te', 'te levantas'],
        ['él / ella / usted', 'se', 'se levanta'],
        ['nosotros / nosotras', 'nos', 'nos levantamos'],
        ['vosotros / vosotras', 'os', 'os levantáis'],
        ['ellos / ellas / ustedes', 'se', 'se levantan'],
      ],
    ),
    uk('Займенник стоїть перед дієсловом; no — перед займенником: No me levanto tarde.'),
    plink('Потренувати займенники', [RP, PLU], 'written', 10),
  ],
  linked: [RP, RPC, PLW, PLU],
});

export default k.build({
  title: 'Мій ранок: me levanto, me ducho',
  termEs: 'verbos pronominales: levantarse, ducharse',
  summary: 'Вчимося говорити про ранкові дії зі зворотними дієсловами: обираємо займенник за особою і ставимо його перед дієсловом.',
  objectives: ['A1-04-O5'],
  situations: ['routine-study-leisure'],
  minutes: 14,
  introduces: ['reflexive.pronouns', 'reflexive.placement'],
  revisits: ['present.regular-ar', 'present.regular-ar.plural', 'pron.subject', 'pron.subject.plural', 'neg.no-before-verb', 'question.yes-no'],
  steps: [
    {
      kind: 'explanation',
      title: 'Дієслова із займенником',
      blocks: [
        uk('Деякі дієслова вживаються із займенником, який відповідає підмету: (yo) me levanto — «я встаю». У словнику такі дієслова мають -se в кінці: levantarse, ducharse, lavarse, peinarse.'),
        tableEs(
          ['persona', 'levantarse', 'ducharse'],
          [
            ['yo', 'me levanto', 'me ducho'],
            ['tú', 'te levantas', 'te duchas'],
            ['él / ella / usted', 'se levanta', 'se ducha'],
            ['nosotros / nosotras', 'nos levantamos', 'nos duchamos'],
            ['vosotros / vosotras', 'os levantáis', 'os ducháis'],
            ['ellos / ellas / ustedes', 'se levantan', 'se duchan'],
          ],
        ),
        uk('Дієслово змінюється за особами як звичайне дієслово на -ar: levant-o, levant-as… Окремо треба вибрати займенник за особою.'),
        uk('Українською такі дієслова часто мають -ся (вмиваюся, зачісуюся), але не завжди: levantarse — «вставати», ducharse — «приймати душ».'),
      ],
    },
    {
      kind: 'explanation',
      title: 'Де стоїть займенник',
      blocks: [
        uk('Займенник стоїть перед дієсловом в особовій формі і пишеться окремо. У запереченні no стоїть перед займенником.'),
        ex('Me levanto temprano.', 'Я встаю рано.'),
        ex('Ana se ducha.', 'Ана приймає душ.'),
        ex('Nos lavamos los dientes.', 'Ми чистимо зуби.'),
        ex('No me levanto tarde.', 'Я не встаю пізно.'),
        uk('Lavarse los dientes — «чистити зуби» (дослівно «мити собі зуби»).'),
      ],
    },
    { kind: 'supported-practice', title: 'Практика зі зразком', tasks: [k.id(1), k.id(2), k.id(11), k.id(12)] },
    { kind: 'independent-practice', title: 'Самостійна практика', tasks: [k.id(21), k.id(3), k.id(4), k.id(5), k.id(13), k.id(14), k.id(15), k.id(16)] },
    { kind: 'independent-practice', title: 'Додаткова практика', required: false, tasks: [k.id(22), k.id(6)] },
    { kind: 'listening', title: 'Послухай: ранок', required: false, clips: [c5], tasks: [k.id(24)] },
    {
      kind: 'summary',
      title: 'Підсумок',
      blocks: [
        ul(
          'Займенники: me, te, se, nos, os, se.',
          'Займенник — перед дієсловом: Me levanto. No — перед займенником: No me levanto.',
          'У словнику: levantarse, ducharse, lavarse, peinarse.',
        ),
      ],
    },
  ],
});
