// A1-06-L2 — preferences between familiar options: preferir forms (e → ie) and the choice frame
// ¿Qué prefieres, X o Y? — Prefiero X (O2). No comparison structure is required.
import { Kit, S, ex, plink, tableEs, ul, uk, vgap, vslot } from '../lib.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-06-L2', RULES);

const PF = 'present.preferir/written-form';
const PFC = 'present.preferir/context-choice';
const CH = 'preferir.choice/construction-use';
const CHC = 'preferir.choice/context-choice';

const ieErr = (s: string, right: string): [string, string] => [s, `У preferir основа змінюється: prefier- (e → ie), крім nosotros і vosotros. Тут: ${right}.`];

// ======================= preferir forms
vgap(k, { n: 1, role: 'supported', fam: 'a106.drinks', t: [PF], verb: 'preferir', person: 0, model: 'preferir → tú prefieres', s: 'Yo ___ el té. (preferir)', tr: 'Я вибираю чай.', extra: [ieErr('prefero', 'prefiero')] });
vgap(k, { n: 2, role: 'supported', fam: 'a106.home', t: [PF], verb: 'preferir', person: 3, model: 'preferir → nosotros preferimos (без зміни основи)', s: 'Nosotros ___ comer en casa. (preferir)', tr: 'Ми воліємо їсти вдома.', extra: [['prefieremos', 'У формі nosotros основа не змінюється: preferimos.']] });
vgap(k, { n: 3, role: 'independent', fam: 'a106.drinks', t: [PF], verb: 'preferir', person: 1, s: '¿Tú ___ el café o el té? (preferir)', tr: 'Ти віддаєш перевагу каві чи чаю?', extra: [ieErr('preferes', 'prefieres')] });
vgap(k, { n: 4, role: 'independent', fam: 'a106.beach', t: [PF], verb: 'preferir', person: 2, s: 'Ana ___ la playa. (preferir)', tr: 'Ана віддає перевагу пляжу.', extra: [ieErr('prefere', 'prefiere')] });
vgap(k, { n: 5, role: 'independent', fam: 'a106.cinema', t: [PF], verb: 'preferir', person: 4, s: '¿Vosotros ___ el cine o el teatro? (preferir)', tr: 'Ви віддаєте перевагу кіно чи театру?', extra: [['prefieréis', 'У формі vosotros основа не змінюється: preferís.']] });
vgap(k, { n: 6, role: 'independent', fam: 'a106.travel', t: [PF], verb: 'preferir', person: 5, s: 'Mis padres ___ viajar en tren. (preferir)', tr: 'Мої батьки воліють подорожувати потягом.', extra: [ieErr('preferen', 'prefieren')] });
vgap(k, { n: 7, role: 'delayed', fam: 'a106.drinks', t: [PF], verb: 'preferir', person: 2, s: '¿Usted ___ té o café? (preferir)', tr: 'Ви віддаєте перевагу чаю чи каві?', extra: [ieErr('prefere', 'prefiere')] });
vgap(k, { n: 8, role: 'delayed', fam: 'a106.music', t: [PF], verb: 'preferir', person: 3, s: 'Nosotras ___ la música española. (preferir)', tr: 'Ми віддаємо перевагу іспанській музиці.', extra: [['prefieremos', 'У формі nosotros основа не змінюється: preferimos.']] });
vgap(k, { n: 9, role: 'transfer', fam: 'a106.kids-t', t: [PF], verb: 'preferir', person: 5, s: 'Los niños ___ el chocolate. (preferir)', tr: 'Діти віддають перевагу шоколаду.', extra: [ieErr('preferen', 'prefieren')] });
k.slots({
  n: 10,
  role: 'transfer',
  fam: 'a106.family-drinks-t',
  t: [PF],
  ins: 'Перепиши речення повністю, вставивши форми preferir: «Я вибираю чай, а моя сестра — каву».',
  p: ['Yo ___ el té y mi hermana ___ el café. (preferir)'],
  tpl: ['Yo ', S('s1'), ' el té y mi hermana ', S('s2'), ' el café.'],
  slots: [vslot('s1', PF, 'preferir', 0, [ieErr('prefero', 'prefiero')]), vslot('s2', PF, 'preferir', 2, [ieErr('prefere', 'prefiere')])],
});
k.choice({
  n: 11,
  role: 'independent',
  fam: 'a106.travel',
  t: [PFC],
  ins: 'Обери правильну форму.',
  p: ['Nosotros ___ el tren.'],
  o: [
    ['prefieremos', PFC, 'У формі nosotros основа не змінюється: preferimos.'],
    ['preferimos', true],
    ['prefieren', PFC, 'Prefieren — форма для ellos / ellas / ustedes.'],
  ],
  tr: 'Ми віддаємо перевагу потягу.',
});
k.choice({
  n: 12,
  role: 'delayed',
  fam: 'a106.reading',
  t: [PFC],
  ins: 'Обери правильну форму.',
  p: ['Ella ___ leer.'],
  o: [
    ['prefere', PFC, 'Основа змінюється: e → ie, prefiere.'],
    ['prefiere', true],
    ['prefieres', PFC, 'Prefieres — форма для tú.'],
  ],
  tr: 'Вона воліє читати.',
});

// ======================= the choice frame
const meErr = (s: string): [string, string] => [s, 'Preferir — звичайне дієслово з підметом: prefiero, без займенника me.'];
k.exact({
  n: 13,
  role: 'supported',
  fam: 'a106.drinks',
  t: [CH],
  ins: 'Тебе питають: «¿Qué prefieres, té o café?» Ти вибираєш чай. Відповідай реченням іспанською. Зразок: Prefiero el café.',
  acc: ['Prefiero el té.', 'Prefiero té.', 'Yo prefiero el té.', 'Yo prefiero té.'],
  err: [meErr('Me prefiero el té.'), ['Prefiere el té.', 'Prefiere — він / вона. Про себе — prefiero.']],
});
k.exact({
  n: 14,
  role: 'supported',
  fam: 'a106.cinema',
  t: [CH],
  ins: 'Запитай друга іспанською, що він вибирає — кіно чи театр. Зразок: ¿Qué prefieres, té o café?',
  acc: ['¿Qué prefieres, el cine o el teatro?', '¿Qué prefieres, cine o teatro?', '¿Prefieres el cine o el teatro?'],
  err: [['¿Qué prefieres, el cine y el teatro?', 'Між варіантами вибору — o («чи, або»).']],
});
k.exact({
  n: 15,
  role: 'independent',
  fam: 'a106.home',
  t: [CH],
  ins: 'Переклади іспанською: «Я волію їсти вдома».',
  acc: ['Prefiero comer en casa.', 'Yo prefiero comer en casa.'],
  err: [['Prefiero como en casa.', 'Після prefiero — інфінітив: comer.']],
});
k.exact({
  n: 16,
  role: 'independent',
  fam: 'a106.city',
  t: [CH],
  ins: 'Тебе питають: «¿Prefieres la playa o la ciudad?» Ти вибираєш місто. Відповідай реченням іспанською.',
  acc: ['Prefiero la ciudad.', 'Yo prefiero la ciudad.'],
  err: [meErr('Me prefiero la ciudad.')],
});
k.exact({
  n: 17,
  role: 'independent',
  fam: 'a106.drinks',
  t: [CH],
  ins: 'Запитай ввічливо (usted) іспанською, що людина вибирає — чай чи каву.',
  acc: ['¿Qué prefiere, té o café?', '¿Qué prefiere usted, té o café?', '¿Qué prefiere, el té o el café?', '¿Qué prefiere usted, el té o el café?', '¿Prefiere té o café?', '¿Prefiere el té o el café?'],
  err: [['¿Qué prefieres, té o café?', 'Prefieres — на «ти». Ввічливо (usted) — prefiere.']],
});
k.exact({
  n: 18,
  role: 'independent',
  fam: 'a106.travel',
  t: [CH],
  ins: 'Переклади іспанською: «Ми воліємо подорожувати потягом».',
  acc: ['Preferimos viajar en tren.', 'Nosotros preferimos viajar en tren.', 'Nosotras preferimos viajar en tren.'],
  err: [['Prefieremos viajar en tren.', 'У формі nosotros основа не змінюється: preferimos.']],
});
k.exact({
  n: 19,
  role: 'delayed',
  fam: 'a106.reading',
  t: [CH],
  ins: 'Тебе питають: «¿Qué prefieres, leer o escribir?» Ти вибираєш читати. Відповідай реченням іспанською.',
  acc: ['Prefiero leer.', 'Yo prefiero leer.'],
  err: [['Prefiero leo.', 'Після prefiero — інфінітив: leer.']],
});
k.exact({
  n: 20,
  role: 'delayed',
  fam: 'a106.sport',
  t: [CH],
  ins: 'Переклади іспанською: «Мої друзі віддають перевагу футболу».',
  acc: ['Mis amigos prefieren el fútbol.'],
  err: [['Mis amigos preferen el fútbol.', 'Основа змінюється: e → ie, prefieren.']],
});
k.exact({
  n: 21,
  role: 'transfer',
  fam: 'a106.cafe-t',
  t: [CH],
  ins: 'У кафе офіціант питає: «¿Agua o zumo?» Ти вибираєш сік. Відповідай реченням із preferir.',
  acc: ['Prefiero zumo.', 'Prefiero un zumo.', 'Prefiero el zumo.', 'Prefiero zumo, por favor.', 'Prefiero un zumo, por favor.'],
  err: [meErr('Me prefiero zumo.')],
});
k.exact({
  n: 22,
  role: 'transfer',
  fam: 'a106.holiday-t',
  t: [CH],
  ins: 'Ви з друзями плануєте відпустку. Запитай друзів (vosotros) іспанською, що вони вибирають — пляж чи місто.',
  acc: ['¿Qué preferís, la playa o la ciudad?', '¿Qué preferís, playa o ciudad?', '¿Preferís la playa o la ciudad?'],
  err: [['¿Qué prefieréis, la playa o la ciudad?', 'У формі vosotros основа не змінюється: preferís.']],
});
k.choice({
  n: 23,
  role: 'independent',
  fam: 'a106.drinks',
  t: [CHC],
  ins: '—¿Qué prefieres, té o café? Ти вибираєш каву. Обери відповідь.',
  o: [
    ['Prefiero el café.', true],
    ['Me prefiero el café.', CHC, meErr('')[1]],
    ['Prefiere el café.', CHC, 'Prefiere — він / вона. Про себе — prefiero.'],
  ],
});
k.choice({
  n: 24,
  role: 'delayed',
  fam: 'a106.cinema',
  t: [CHC],
  ins: 'Яке питання підходить, щоб дізнатися, що друг вибирає?',
  o: [
    ['¿Qué prefieres, el cine o el teatro?', true],
    ['¿Te prefiere el cine o el teatro?', CHC, 'Preferir — звичайне дієслово з підметом: питаємо друга — prefieres, без займенника te: ¿Qué prefieres…?'],
    ['¿Qué prefieres, el cine y el teatro?', CHC, 'Між варіантами вибору — o («чи, або»).'],
  ],
});

k.material({
  id: 'material.a1-06.preferir',
  topic: 'A1-06-L2',
  title: 'Preferir: що я вибираю',
  blocks: [
    tableEs(['persona', 'preferir'], [['yo', 'prefiero'], ['tú', 'prefieres'], ['él / ella / usted', 'prefiere'], ['nosotros / nosotras', 'preferimos'], ['vosotros / vosotras', 'preferís'], ['ellos / ellas / ustedes', 'prefieren']]),
    uk('¿Qué prefieres, X o Y? — Prefiero X. Після preferir може стояти інфінітив.'),
    plink('Потренувати preferir', [PF, CH], 'written', 10),
  ],
  linked: [PF, CH],
});

export default k.build({
  title: 'Що я вибираю: preferir',
  termEs: 'el verbo preferir',
  summary: 'Змінюємо preferir за особами (e → ie: prefiero, але preferimos) і питаємо та відповідаємо про вибір між двома варіантами: ¿Qué prefieres, té o café? — Prefiero el té.',
  objectives: ['A1-06-O2'],
  situations: ['food-shopping', 'routine-study-leisure'],
  minutes: 12,
  introduces: ['present.preferir', 'preferir.choice'],
  revisits: ['present.regular-ir', 'present.regular-ir.plural', 'gustar.infinitive', 'gustar.noun-with-article', 'question.word.que'],
  steps: [
    {
      kind: 'explanation',
      title: 'Дієслово preferir: e → ie',
      blocks: [
        uk('Preferir — «воліти, віддавати перевагу, вибирати». Закінчення як у дієслів на -ir, але в основі e змінюється на ie: prefiero, prefieres, prefiere, prefieren. У nosotros і vosotros зміни немає: preferimos, preferís.'),
        tableEs(['persona', 'preferir'], [['yo', 'prefiero'], ['tú', 'prefieres'], ['él / ella / usted', 'prefiere'], ['nosotros / nosotras', 'preferimos'], ['vosotros / vosotras', 'preferís'], ['ellos / ellas / ustedes', 'prefieren']]),
        ex('Prefiero el café.', 'Я віддаю перевагу каві.'),
        ex('Preferimos el teatro.', 'Ми віддаємо перевагу театру.'),
      ],
    },
    {
      kind: 'examples',
      title: 'Вибір між двома варіантами',
      blocks: [
        uk('Питання про вибір: ¿Qué prefieres, X o Y? Між варіантами — o («чи, або»). Відповідь: Prefiero + варіант. Після preferir може стояти й інфінітив.'),
        ex('¿Qué prefieres, la carne o el pescado? — Prefiero el pescado.', 'Що ти вибираєш, м’ясо чи рибу? — Я вибираю рибу.'),
        ex('Prefiero cocinar en casa.', 'Я волію готувати вдома.'),
      ],
    },
    { kind: 'supported-practice', title: 'Практика зі зразком', tasks: [k.id(1), k.id(2), k.id(13), k.id(14)] },
    { kind: 'independent-practice', title: 'Самостійна практика', tasks: [k.id(11), k.id(3), k.id(4), k.id(5), k.id(6), k.id(23), k.id(15), k.id(16), k.id(17), k.id(18)] },
    {
      kind: 'summary',
      title: 'Підсумок',
      blocks: [ul('Prefiero, prefieres, prefiere, prefieren — з ie; preferimos, preferís — без зміни.', '¿Qué prefieres, X o Y? — Prefiero X.', 'Prefiero + інфінітив: Prefiero comer en casa.')],
    },
  ],
});
