// A1-04-L3 — irregular ir and hacer, ir a + place (CV-03) and the contraction al (CV-03).
import { Kit, S, el, ex, hTranscript, plink, tableEs, ul, uk, vgap, vslot } from '../lib.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-04-L3', RULES);

const IR = 'present.ir/written-form';
const IRC = 'present.ir/context-choice';
const HA = 'present.hacer/written-form';
const HAC = 'present.hacer/context-choice';
const ADW = 'prep.a.destination/written-form';
const ADU = 'prep.a.destination/construction-use';
const ADC = 'prep.a.destination/context-choice';
const AL = 'article.contraction-al/written-form';
const ALC = 'article.contraction-al/context-choice';
const LM = 'listening.daily-actions/listening-meaning';

const IR_TABLE = 'ir: voy, vas, va, vamos, vais, van';
const vaisAccent: Array<[string, string]> = [['váis', 'Форма vais пишеться без знака наголосу.']];
const hagoRegular: Array<[string, string]> = [
  ['haco', 'Форма yo в дієслова hacer неправильна: її не утворюють за звичайним правилом, її треба запам’ятати.'],
  ['hazo', 'Форма yo в дієслова hacer неправильна: її не утворюють за звичайним правилом, її треба запам’ятати.'],
];

// ======================= ir
vgap(k, { n: 1, role: 'supported', fam: 'a104.leisure', t: [IR], verb: 'ir', person: 0, model: IR_TABLE, s: 'Yo ___ al cine. (ir)', tr: 'Я йду в кіно.' });
vgap(k, { n: 2, role: 'supported', fam: 'a104.leisure', t: [IR], verb: 'ir', person: 3, model: IR_TABLE, s: 'Nosotros ___ a la playa. (ir)', tr: 'Ми йдемо на пляж.' });
vgap(k, { n: 3, role: 'independent', fam: 'a104.sport', t: [IR], verb: 'ir', person: 1, s: '¿Tú ___ al gimnasio? (ir)', tr: 'Ти ходиш у спортзал?' });
vgap(k, { n: 4, role: 'independent', fam: 'a104.leisure', t: [IR], verb: 'ir', person: 5, s: 'Mis amigos ___ al museo. (ir)', tr: 'Мої друзі йдуть у музей.' });
vgap(k, { n: 5, role: 'independent', fam: 'a104.study', t: [IR], verb: 'ir', person: 4, s: 'Vosotros ___ a la universidad. (ir)', tr: 'Ви йдете до університету.', extra: vaisAccent });
vgap(k, { n: 6, role: 'independent', fam: 'a104.work', t: [IR], verb: 'ir', person: 2, s: 'Ana ___ al trabajo. (ir)', tr: 'Ана йде на роботу.' });
vgap(k, { n: 7, role: 'delayed', fam: 'a104.work', t: [IR], verb: 'ir', person: 2, s: '¿Usted ___ al banco? (ir)', tr: 'Ви йдете в банк?' });
vgap(k, { n: 8, role: 'delayed', fam: 'a104.city', t: [IR], verb: 'ir', person: 5, s: '¿Ustedes ___ a Madrid? (ir)', tr: 'Ви (кілька людей, ввічливо) їдете в Мадрид?' });
k.slots({
  n: 9,
  role: 'transfer',
  fam: 'a104.errands',
  t: [IR],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслова ir.',
  p: ['Yo ___ al supermercado y mis padres ___ a la farmacia. (ir)'],
  tpl: ['Yo ', S('s1'), ' al supermercado y mis padres ', S('s2'), ' a la farmacia.'],
  slots: [vslot('s1', IR, 'ir', 0), vslot('s2', IR, 'ir', 5)],
  tr: 'Я йду в супермаркет, а мої батьки — в аптеку.',
});
k.slots({
  n: 10,
  role: 'transfer',
  fam: 'a104.travel',
  t: [IR],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслова ir.',
  p: ['Mi hermano ___ a Valencia y yo ___ a Sevilla. (ir)'],
  tpl: ['Mi hermano ', S('s1'), ' a Valencia y yo ', S('s2'), ' a Sevilla.'],
  slots: [vslot('s1', IR, 'ir', 2), vslot('s2', IR, 'ir', 0)],
  tr: 'Мій брат їде до Валенсії, а я — до Севільї.',
});

// ======================= hacer
vgap(k, { n: 11, role: 'supported', fam: 'a104.sport', t: [HA], verb: 'hacer', person: 0, model: 'hacer → yo hago (неправильна форма), tú haces, él hace', s: 'Yo ___ deporte. (hacer)', tr: 'Я займаюся спортом.', extra: hagoRegular });
vgap(k, { n: 12, role: 'supported', fam: 'a104.errands', t: [HA], verb: 'hacer', person: 3, model: 'comer → nosotros comemos; hacer → nosotros hacemos', s: 'Nosotros ___ la compra. (hacer)', tr: 'Ми купуємо продукти.' });
vgap(k, { n: 13, role: 'independent', fam: 'a104.friends', t: [HA], verb: 'hacer', person: 1, s: '¿Qué ___ tú? (hacer)', tr: 'Що ти робиш?' });
vgap(k, { n: 14, role: 'independent', fam: 'a104.errands', t: [HA], verb: 'hacer', person: 2, s: 'Mi madre ___ la compra en el supermercado. (hacer)', tr: 'Моя мама купує продукти в супермаркеті.' });
vgap(k, { n: 15, role: 'independent', fam: 'a104.sport', t: [HA], verb: 'hacer', person: 4, s: '¿Vosotros ___ deporte? (hacer)', tr: 'Ви займаєтеся спортом?' });
k.slots({
  n: 16,
  role: 'independent',
  fam: 'a104.home',
  t: [HA],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслова hacer.',
  p: ['Yo ___ deporte y mi hermano ___ la compra. (hacer)'],
  tpl: ['Yo ', S('s1'), ' deporte y mi hermano ', S('s2'), ' la compra.'],
  slots: [vslot('s1', HA, 'hacer', 0, hagoRegular), vslot('s2', HA, 'hacer', 2)],
  tr: 'Я займаюся спортом, а мій брат купує продукти.',
});
vgap(k, { n: 17, role: 'delayed', fam: 'a104.work', t: [HA], verb: 'hacer', person: 2, s: '¿Qué ___ usted? (hacer)', tr: 'Що Ви робите?' });
vgap(k, { n: 18, role: 'delayed', fam: 'a104.sport', t: [HA], verb: 'hacer', person: 5, s: 'Mis hermanos ___ deporte en el gimnasio. (hacer)', tr: 'Мої брати займаються спортом у спортзалі.' });
k.slots({
  n: 19,
  role: 'transfer',
  fam: 'a104.housework',
  t: [HA],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслова hacer.',
  p: ['En casa, yo ___ la cena y vosotros ___ la compra. (hacer)'],
  tpl: ['En casa, yo ', S('s1'), ' la cena y vosotros ', S('s2'), ' la compra.'],
  slots: [vslot('s1', HA, 'hacer', 0, hagoRegular), vslot('s2', HA, 'hacer', 4)],
  tr: 'Удома я готую вечерю, а ви купуєте продукти.',
});
k.exact({
  n: 20,
  role: 'transfer',
  fam: 'a104.park',
  t: [HA],
  ins: 'Переклади іспанською: «Що ви робите в парку?» (питаєш кількох друзів).',
  acc: ['¿Qué hacéis en el parque?', '¿Qué hacéis vosotros en el parque?', '¿Qué hacéis vosotras en el parque?'],
  err: [
    [
      '¿Qué hacen en el parque?',
      'У більшій частині Іспанії до кількох друзів звертаються vosotros: ¿Qué hacéis…? Форму ustedes (hacen) у такій ситуації вживають на Канарах і в частині Андалусії, тож тут вона не рахується помилкою, але очікувана відповідь — hacéis.',
      { [HA]: 'unresolved' },
    ],
    ['¿Qué haceis en el parque?', 'Майже: форма vosotros пишеться зі знаком наголосу — hacéis.'],
  ],
});

// ======================= ir a + place
const enForA: [string, string] = ['en', 'En означає, де ти є (estar en). Куди рухаєшся — ir a.'];
k.exact({ n: 21, role: 'supported', fam: 'a104.city', t: [ADW], ins: 'Впиши прийменник. Зразок: Voy a casa. — «Я йду додому».', p: ['Voy ___ Madrid.'], acc: ['a'], err: [enForA, ['al', 'Перед назвою міста артикля немає, тож злиття al не потрібне — просто a.']], tr: 'Я їду в Мадрид.' });
k.exact({
  n: 22,
  role: 'supported',
  fam: 'a104.home',
  t: [ADU],
  ins: 'Склади речення з поданих слів. Зразок: Voy a Madrid.',
  p: ['casa · a · vamos'],
  acc: ['Vamos a casa.', 'Nosotros vamos a casa.', 'Nosotras vamos a casa.'],
  err: [['Vamos en casa.', 'En casa — де ми є. Куди йдемо — a casa.']],
  tr: 'Ми йдемо додому.',
});
k.exact({ n: 23, role: 'independent', fam: 'a104.study', t: [ADW], ins: 'Впиши прийменник, щоб речення означало «Ана йде до університету».', p: ['Ana va ___ la universidad.'], acc: ['a'], err: [enForA], tr: 'Ана йде до університету.' });
k.exact({
  n: 24,
  role: 'independent',
  fam: 'a104.home',
  t: [ADU],
  ins: 'Переклади іспанською: «Я йду додому».',
  acc: ['Voy a casa.', 'Yo voy a casa.'],
  err: [['Voy en casa.', 'En casa — де ти є. Куди йдеш — a casa.']],
});
k.exact({
  n: 25,
  role: 'independent',
  fam: 'a104.city',
  t: [ADU],
  ins: 'Переклади іспанською: «Ми їдемо в Мадрид».',
  acc: ['Vamos a Madrid.', 'Nosotros vamos a Madrid.', 'Nosotras vamos a Madrid.'],
  err: [['Vamos en Madrid.', 'En Madrid — де ми є. Куди їдемо — a Madrid.']],
});
k.slots({
  n: 26,
  role: 'independent',
  fam: 'a104.city',
  t: [ADW],
  ins: 'Перепиши речення повністю, вставивши прийменник, щоб воно означало «Мої батьки їдуть до Севільї».',
  p: ['Mis padres van ___ Sevilla.'],
  tpl: ['Mis padres van ', S('s1'), ' Sevilla.'],
  slots: [{ id: 's1', t: ADW, acc: ['a'], err: [enForA] }],
  tr: 'Мої батьки їдуть до Севільї.',
});
k.exact({
  n: 27,
  role: 'delayed',
  fam: 'a104.leisure',
  t: [ADU],
  ins: 'Переклади іспанською: «Ти йдеш на пляж?»',
  acc: ['¿Vas a la playa?', '¿Tú vas a la playa?', '¿Vas tú a la playa?'],
  err: [['¿Vas en la playa?', 'En la playa — де ти є. Куди йдеш — a la playa.']],
});
k.exact({ n: 28, role: 'delayed', fam: 'a104.work', t: [ADW], ins: 'Впиши прийменник, щоб речення означало «Ми йдемо в офіс».', p: ['Vamos ___ la oficina.'], acc: ['a'], err: [enForA], tr: 'Ми йдемо в офіс.' });
k.exact({
  n: 29,
  role: 'transfer',
  fam: 'a104.travel',
  t: [ADU],
  ins: 'Переклади іспанською: «Мої друзі їдуть до Валенсії».',
  acc: ['Mis amigos van a Valencia.'],
  err: [['Mis amigos van en Valencia.', 'En Valencia — де вони є. Куди їдуть — a Valencia.']],
});
k.exact({
  n: 30,
  role: 'transfer',
  fam: 'a104.errands',
  t: [ADU],
  ins: 'Переклади іспанською: «Я йду в аптеку».',
  acc: ['Voy a la farmacia.', 'Yo voy a la farmacia.'],
  err: [['Voy en la farmacia.', 'En la farmacia — де ти є. Куди йдеш — a la farmacia.']],
});

// ======================= a + el = al
const alErr: Array<[string, string]> = [
  ['a el', 'A + el завжди зливаються в одне слово: al.'],
  ['a', 'Тут перед іменником стоїть артикль el, тож потрібне злиття a + el = al.'],
  ['a la', 'Цей іменник чоловічого роду (el …), тож a + el = al.'],
];
const alaErr: Array<[string, string]> = [
  ['al', 'Цей іменник жіночого роду (la …). З la злиття немає: a la.'],
  ['a el', 'Цей іменник жіночого роду (la …), тож потрібно a la.'],
];
k.exact({ n: 31, role: 'supported', fam: 'a104.leisure', t: [AL], ins: 'Впиши a + артикль. Зразок: el parque → Voy al parque.', p: ['Voy ___ cine. (el cine)'], acc: ['al'], err: alErr, tr: 'Я йду в кіно.' });
k.exact({ n: 32, role: 'supported', fam: 'a104.errands', t: [AL], ins: 'Впиши a + артикль. Зразок: el parque → Voy al parque.', p: ['Vamos ___ supermercado. (el supermercado)'], acc: ['al'], err: alErr, tr: 'Ми йдемо в супермаркет.' });
k.exact({ n: 33, role: 'independent', fam: 'a104.sport', t: [AL], ins: 'Впиши a з потрібним артиклем (злиття, якщо воно потрібне).', p: ['¿Vas ___ gimnasio?'], acc: ['al'], err: alErr, tr: 'Ти йдеш у спортзал?' });
k.exact({ n: 34, role: 'independent', fam: 'a104.leisure', t: [AL], ins: 'Впиши a з потрібним артиклем (злиття, якщо воно потрібне).', p: ['Ana va ___ playa.'], acc: ['a la'], err: alaErr, tr: 'Ана йде на пляж.' });
k.slots({
  n: 35,
  role: 'independent',
  fam: 'a104.study',
  t: [AL],
  ins: 'Перепиши речення повністю: встав a з потрібним артиклем.',
  p: ['Pablo va ___ museo y Ana va ___ universidad.'],
  tpl: ['Pablo va ', S('s1'), ' museo y Ana va ', S('s2'), ' universidad.'],
  slots: [
    { id: 's1', t: AL, acc: ['al'], err: alErr },
    { id: 's2', t: AL, acc: ['a la'], err: alaErr },
  ],
  tr: 'Пабло йде в музей, а Ана — до університету.',
});
k.exact({
  n: 36,
  role: 'independent',
  fam: 'a104.leisure',
  t: [AL],
  ins: 'Переклади іспанською: «Я йду в парк».',
  acc: ['Voy al parque.', 'Yo voy al parque.'],
  err: [
    ['Voy a el parque.', 'A + el завжди зливаються: al parque.'],
    ['Yo voy a el parque.', 'A + el завжди зливаються: al parque.'],
  ],
});
k.exact({ n: 37, role: 'delayed', fam: 'a104.leisure', t: [AL], ins: 'Впиши a з потрібним артиклем (злиття, якщо воно потрібне).', p: ['Mis padres van ___ restaurante.'], acc: ['al'], err: alErr, tr: 'Мої батьки йдуть у ресторан.' });
k.exact({
  n: 38,
  role: 'delayed',
  fam: 'a104.work',
  t: [AL],
  ins: 'Переклади іспанською: «Ти йдеш на роботу?» (мається на увазі місце роботи — el trabajo).',
  acc: ['¿Vas al trabajo?', '¿Tú vas al trabajo?', '¿Vas tú al trabajo?'],
  err: [['¿Vas a el trabajo?', 'A + el завжди зливаються: al trabajo.']],
});
k.slots({
  n: 39,
  role: 'transfer',
  fam: 'a104.sightseeing',
  t: [AL],
  ins: 'Перепиши речення повністю: встав a з потрібним артиклем.',
  p: ['En Madrid, voy ___ museo y ___ estación.'],
  tpl: ['En Madrid, voy ', S('s1'), ' museo y ', S('s2'), ' estación.'],
  slots: [
    { id: 's1', t: AL, acc: ['al'], err: alErr },
    { id: 's2', t: AL, acc: ['a la'], err: alaErr },
  ],
  tr: 'У Мадриді я йду в музей і на вокзал.',
});
k.exact({
  n: 40,
  role: 'transfer',
  fam: 'a104.workday',
  t: [AL],
  ins: 'Переклади іспанською: «Мій тато йде в банк».',
  acc: ['Mi padre va al banco.'],
  err: [['Mi padre va a el banco.', 'A + el завжди зливаються: al banco.']],
});

// ======================= context-choice
k.choice({
  n: 41,
  role: 'independent',
  fam: 'a104.leisure',
  t: [IRC],
  ins: 'Обери форму ir, яка підходить до підмета.',
  p: ['Mis amigos y yo ___ al cine.'],
  o: [
    ['van', IRC, '«Van» — форма для ellos. «Mis amigos y yo» — це nosotros.'],
    ['vamos', true],
    ['vais', IRC, '«Vais» — форма для vosotros. «Mis amigos y yo» — це nosotros.'],
  ],
  tr: 'Ми з друзями йдемо в кіно.',
});
k.choice({
  n: 42,
  role: 'independent',
  fam: 'a104.work',
  t: [IRC],
  ins: 'Обери форму ir, яка підходить до підмета.',
  p: ['¿Usted ___ a la oficina?'],
  o: [
    ['vas', IRC, '«Vas» — форма для tú. Usted уживає форму 3-ї особи, як él / ella.'],
    ['va', true],
    ['voy', IRC, '«Voy» — форма для yo.'],
  ],
  tr: 'Ви йдете в офіс?',
});
k.choice({
  n: 43,
  role: 'independent',
  fam: 'a104.errands',
  t: [HAC],
  ins: 'Обери відповідь, у якій людина говорить про себе.',
  p: ['—¿Qué haces? —___ la compra.'],
  o: [
    ['Haces', HAC, '«Haces» — форма для tú. Відповідаючи про себе, кажемо форму yo.'],
    ['Hace', HAC, '«Hace» — форма для él / ella / usted. Відповідаючи про себе, кажемо форму yo.'],
    ['Hago', true],
  ],
  tr: '— Що ти робиш? — Купую продукти.',
});
k.choice({
  n: 44,
  role: 'delayed',
  fam: 'a104.sport',
  t: [HAC],
  ins: 'Обери форму hacer, яка підходить до підмета.',
  p: ['Ana y Pablo ___ deporte.'],
  o: [
    ['hacemos', HAC, '«Hacemos» — форма для nosotros. «Ana y Pablo» — це ellos.'],
    ['hacen', true],
    ['hacéis', HAC, '«Hacéis» — форма для vosotros. «Ana y Pablo» — це ellos.'],
  ],
  tr: 'Ана й Пабло займаються спортом.',
});
k.choice({
  n: 45,
  role: 'independent',
  fam: 'a104.home',
  t: [ADC],
  ins: 'Обери прийменник: людина рухається кудись чи вже перебуває десь?',
  p: ['Voy ___ casa.'],
  o: [
    ['a', true],
    ['en', ADC, 'En — де ти вже є: Estoy en casa. Куди рухаєшся — a: Voy a casa.'],
  ],
  tr: 'Я йду додому.',
});
k.choice({
  n: 46,
  role: 'delayed',
  fam: 'a104.city',
  t: [ADC],
  ins: 'Обери прийменник: людина рухається кудись чи вже перебуває десь?',
  p: ['Mis padres están ___ Madrid.'],
  o: [
    ['a', ADC, 'A вказує напрямок руху (ir a). Тут estar — де батьки перебувають, тож en.'],
    ['en', true],
  ],
  tr: 'Мої батьки в Мадриді.',
});
k.choice({
  n: 47,
  role: 'independent',
  fam: 'a104.leisure',
  t: [ALC],
  ins: 'Обери правильний варіант.',
  p: ['Voy ___ museo.'],
  o: [
    ['a el', ALC, 'A + el завжди зливаються: al.'],
    ['al', true],
    ['a la', ALC, 'Museo — чоловічого роду: el museo, тож al.'],
  ],
  tr: 'Я йду в музей.',
});
k.choice({
  n: 48,
  role: 'independent',
  fam: 'a104.travel',
  t: [ALC],
  ins: 'Обери правильний варіант.',
  p: ['Vamos ___ estación.'],
  o: [
    ['al', ALC, 'Estación — жіночого роду: la estación. З la злиття немає: a la.'],
    ['a la', true],
  ],
  tr: 'Ми йдемо на вокзал.',
});
k.choice({
  n: 49,
  role: 'delayed',
  fam: 'a104.leisure',
  t: [ALC],
  ins: 'Обери правильний варіант.',
  p: ['¿Vais ___ parque?'],
  o: [
    ['al', true],
    ['a el', ALC, 'A + el завжди зливаються: al.'],
    ['a la', ALC, 'Parque — чоловічого роду: el parque, тож al.'],
  ],
  tr: 'Ви йдете в парк?',
});

// ======================= listening practice for listening.daily-actions
const c4 = k.clip({
  id: 'clip.a1-04.daily-actions.escuela',
  kind: 'sentence',
  es: 'Los niños van a la escuela y yo voy al trabajo.',
  uk: 'Діти йдуть до школи, а я йду на роботу.',
  t: [LM],
  fam: 'a104.l3.school',
});
k.choice({
  n: 50,
  role: 'independent',
  fam: 'a104.l3.school',
  t: [LM],
  clips: [c4],
  ins: 'Послухай запис. Куди йде людина, яка говорить?',
  o: [
    ['До школи.', false],
    ['На роботу.', true],
    ['У спортзал.', false],
  ],
  hints: [hTranscript([LM], 'Los niños van a la escuela y yo voy al trabajo.')],
});

k.material({
  id: 'material.a1-04.ir-hacer-al',
  topic: 'A1-04-L3',
  title: 'Ir і hacer; куди: a, al, a la',
  blocks: [
    tableEs(
      ['persona', 'ir', 'hacer'],
      [
        ['yo', 'voy', 'hago'],
        ['tú', 'vas', 'haces'],
        ['él / ella / usted', 'va', 'hace'],
        ['nosotros / nosotras', 'vamos', 'hacemos'],
        ['vosotros / vosotras', 'vais', 'hacéis'],
        ['ellos / ellas / ustedes', 'van', 'hacen'],
      ],
    ),
    el('a + el = al: Voy al cine.', 'a + la: Voy a la playa.', 'a + ciudad: Voy a Madrid.', 'estar en: Estoy en casa.'),
    plink('Потренувати ir, hacer і al', [IR, HA, ADW, AL], 'written', 10),
  ],
  linked: [IR, HA, ADW, ADU, AL],
});

export default k.build({
  title: 'Ir і hacer: куди йдемо і що робимо',
  termEs: 'presente de ir y hacer; ir a + lugar',
  summary: 'Запам’ятовуємо форми двох корисних неправильних дієслів — ir і hacer, кажемо, куди йдемо (ir a + місце), і вчимося зливати a + el = al.',
  objectives: ['A1-04-O4'],
  cv: ['CV-03'],
  situations: ['routine-study-leisure'],
  minutes: 18,
  introduces: ['present.ir', 'present.hacer', 'prep.a.destination', 'article.contraction-al'],
  revisits: ['present.regular-er', 'present.regular-ar', 'prep.en.location', 'estar.location', 'article.definite', 'noun.gender.o-a', 'pron.person-mapping', 'question.word.que', 'prep.con.company'],
  steps: [
    {
      kind: 'explanation',
      title: 'Ir — «іти, їхати»: форми напам’ять',
      blocks: [
        uk('Ir означає «іти, їхати, ходити». Його форми зовсім не схожі на інфінітив, тож їх треба запам’ятати.'),
        tableEs(
          ['persona', 'ir'],
          [
            ['yo', 'voy'],
            ['tú', 'vas'],
            ['él / ella / usted', 'va'],
            ['nosotros / nosotras', 'vamos'],
            ['vosotros / vosotras', 'vais'],
            ['ellos / ellas / ustedes', 'van'],
          ],
        ),
        uk('Форма vais пишеться без знака наголосу.'),
        ex('Voy a Madrid.', 'Я їду в Мадрид.'),
        ex('¿Vas al cine?', 'Ти йдеш у кіно?'),
        ex('Mis amigos van a la playa.', 'Мої друзі йдуть на пляж.'),
      ],
    },
    {
      kind: 'explanation',
      title: 'Куди: a + місце, a + el = al',
      blocks: [
        uk('Куди ти йдеш чи їдеш — ir a + місце: Voy a casa. Vamos a Madrid. А де ти перебуваєш — estar en: Estoy en casa.'),
        uk('Прийменник a й артикль el зливаються в одне слово al: Voy al cine (el cine). З la, los, las злиття немає.'),
        el('a + el = al: Voy al cine.', 'a + la: Voy a la playa.', 'a + los: Vamos a los museos.', 'a + ciudad: Voy a Madrid.'),
        ex('Voy al trabajo.', 'Я йду на роботу.'),
        ex('Ana va a la universidad.', 'Ана йде до університету.'),
        ex('Estoy en casa. Voy a casa.', 'Я вдома. Я йду додому.'),
      ],
    },
    {
      kind: 'explanation',
      title: 'Hacer — «робити»: yo hago',
      blocks: [
        uk('Hacer відмінюється як правильне дієслово на -er, крім форми «я»: yo hago.'),
        tableEs(
          ['persona', 'hacer'],
          [
            ['yo', 'hago'],
            ['tú', 'haces'],
            ['él / ella / usted', 'hace'],
            ['nosotros / nosotras', 'hacemos'],
            ['vosotros / vosotras', 'hacéis'],
            ['ellos / ellas / ustedes', 'hacen'],
          ],
        ),
        uk('Корисні вирази: hacer deporte — займатися спортом, hacer la compra — купувати продукти. ¿Qué haces? — «Що ти робиш?»'),
        ex('Hago deporte.', 'Я займаюся спортом.'),
        ex('¿Qué haces?', 'Що ти робиш?'),
        ex('Hacemos la compra en el supermercado.', 'Ми купуємо продукти в супермаркеті.'),
      ],
    },
    { kind: 'supported-practice', title: 'Практика зі зразком', tasks: [k.id(1), k.id(2), k.id(21), k.id(22), k.id(31), k.id(32), k.id(11), k.id(12)] },
    {
      kind: 'independent-practice',
      title: 'Самостійна практика',
      tasks: [k.id(41), k.id(3), k.id(4), k.id(45), k.id(23), k.id(24), k.id(47), k.id(33), k.id(34), k.id(13), k.id(14)],
    },
    {
      kind: 'independent-practice',
      title: 'Додаткова практика',
      required: false,
      tasks: [k.id(42), k.id(5), k.id(6), k.id(25), k.id(26), k.id(48), k.id(35), k.id(36), k.id(43), k.id(15), k.id(16)],
    },
    { kind: 'listening', title: 'Послухай: хто куди йде', required: false, clips: [c4], tasks: [k.id(50)] },
    {
      kind: 'summary',
      title: 'Підсумок',
      blocks: [
        ul(
          'Ir: voy, vas, va, vamos, vais, van.',
          'Hacer: неправильна лише форма yo — hago.',
          'Куди — ir a + місце; де — estar en.',
          'a + el = al (al cine); з la злиття немає (a la playa).',
        ),
      ],
    },
  ],
});
