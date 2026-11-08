// A1-04-L1 — regular -ar present forms (singular and plural persons) and «con» (CV-03).
import { Kit, S, ex, hRule, hTr, hTranscript, plink, tableEs, ul, uk, vgap, vslot, DICTATION } from '../lib.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-04-L1', RULES);

const AR = 'present.regular-ar/written-form';
const ARC = 'present.regular-ar/context-choice';
const ARP = 'present.regular-ar.plural/written-form';
const ARPC = 'present.regular-ar.plural/context-choice';
const CONW = 'prep.con.company/written-form';
const CONU = 'prep.con.company/construction-use';
const LM = 'listening.daily-actions/listening-meaning';
const LD = 'listening.daily-actions/dictation';

// ---- supported: -ar singular / plural
vgap(k, { n: 1, role: 'supported', fam: 'a104.home', t: [AR], verb: 'desayunar', person: 0, model: 'hablar → yo hablo', s: 'Yo ___ en casa. (desayunar)', tr: 'Я снідаю вдома.' });
vgap(k, { n: 2, role: 'supported', fam: 'a104.work', t: [AR], verb: 'trabajar', person: 2, model: 'hablar → ella habla', s: 'Ana ___ en un hotel. (trabajar)', tr: 'Ана працює в готелі.' });
vgap(k, { n: 3, role: 'supported', fam: 'a104.home', t: [ARP], verb: 'cenar', person: 3, model: 'hablar → nosotros hablamos', s: 'Nosotros ___ en casa. (cenar)', tr: 'Ми вечеряємо вдома.' });
vgap(k, { n: 4, role: 'supported', fam: 'a104.study', t: [ARP], verb: 'estudiar', person: 4, model: 'hablar → vosotros habláis (зі знаком наголосу)', s: '¿Vosotros ___ español? (estudiar)', tr: 'Ви вивчаєте іспанську?' });

// ---- independent: -ar singular / plural
vgap(k, { n: 5, role: 'independent', fam: 'a104.study', t: [AR], verb: 'estudiar', person: 1, s: '¿Tú ___ inglés? (estudiar)', tr: 'Ти вивчаєш англійську?' });
vgap(k, { n: 6, role: 'independent', fam: 'a104.food', t: [AR], verb: 'comprar', person: 2, s: 'Mi padre ___ pan en el supermercado. (comprar)', tr: 'Мій тато купує хліб у супермаркеті.' });
vgap(k, { n: 7, role: 'independent', fam: 'a104.work', t: [ARP], verb: 'trabajar', person: 5, s: 'Mis hermanos ___ en un banco. (trabajar)', tr: 'Мої брати працюють у банку.' });
vgap(k, { n: 8, role: 'independent', fam: 'a104.food', t: [ARP], verb: 'tomar', person: 4, s: 'Vosotros ___ un café. (tomar)', tr: 'Ви п’єте каву.' });
k.slots({
  n: 9,
  role: 'independent',
  fam: 'a104.friends',
  t: [AR, ARP],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслова escuchar.',
  p: ['Yo ___ música y mis amigos ___ la radio. (escuchar)'],
  tpl: ['Yo ', S('s1'), ' música y mis amigos ', S('s2'), ' la radio.'],
  slots: [vslot('s1', AR, 'escuchar', 0), vslot('s2', ARP, 'escuchar', 5)],
  tr: 'Я слухаю музику, а мої друзі слухають радіо.',
});
k.slots({
  n: 10,
  role: 'independent',
  fam: 'a104.home',
  t: [AR, ARP],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслів у дужках.',
  p: ['Tú ___ y nosotros ___ en casa. (cocinar, cenar)'],
  tpl: ['Tú ', S('s1'), ' y nosotros ', S('s2'), ' en casa.'],
  slots: [vslot('s1', AR, 'cocinar', 1), vslot('s2', ARP, 'cenar', 3)],
  tr: 'Ти готуєш, а ми вечеряємо вдома.',
});

// ---- held-out (delayed / transfer): not shown in lesson steps
vgap(k, { n: 11, role: 'delayed', fam: 'a104.work', t: [AR], verb: 'trabajar', person: 2, s: '¿Usted ___ en una oficina? (trabajar)', tr: 'Ви працюєте в офісі?' });
vgap(k, { n: 12, role: 'delayed', fam: 'a104.home', t: [ARP], verb: 'cocinar', person: 5, s: '¿Ustedes ___ en casa? (cocinar)', tr: 'Ви (кілька людей, ввічливо) готуєте вдома?' });
k.slots({
  n: 13,
  role: 'delayed',
  fam: 'a104.study',
  t: [AR, ARP],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслова hablar.',
  p: ['Mi hermana ___ inglés y mis padres ___ ucraniano. (hablar)'],
  tpl: ['Mi hermana ', S('s1'), ' inglés y mis padres ', S('s2'), ' ucraniano.'],
  slots: [vslot('s1', AR, 'hablar', 2), vslot('s2', ARP, 'hablar', 5)],
  tr: 'Моя сестра розмовляє англійською, а мої батьки — українською.',
});
k.slots({
  n: 14,
  role: 'transfer',
  fam: 'a104.leisure',
  t: [AR, ARP],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслів у дужках.',
  p: ['Yo ___ con mi perro y vosotros ___ en el parque. (pasear, descansar)'],
  tpl: ['Yo ', S('s1'), ' con mi perro y vosotros ', S('s2'), ' en el parque.'],
  slots: [vslot('s1', AR, 'pasear', 0), vslot('s2', ARP, 'descansar', 4)],
  tr: 'Я гуляю зі своїм собакою, а ви відпочиваєте в парку.',
});
k.slots({
  n: 15,
  role: 'transfer',
  fam: 'a104.shop',
  t: [AR, ARP],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслова comprar.',
  p: ['En la tienda, Ana ___ leche y nosotros ___ pan. (comprar)'],
  tpl: ['En la tienda, Ana ', S('s1'), ' leche y nosotros ', S('s2'), ' pan.'],
  slots: [vslot('s1', AR, 'comprar', 2), vslot('s2', ARP, 'comprar', 3)],
  tr: 'У крамниці Ана купує молоко, а ми купуємо хліб.',
});

// ---- context-choice: which person form fits the subject
k.choice({
  n: 16,
  role: 'independent',
  fam: 'a104.work',
  t: [ARC],
  ins: 'Обери форму, яка підходить до підмета.',
  p: ['Pablo ___ en un banco.'],
  o: [
    ['trabajas', ARC, '«Trabajas» — форма для tú. Pablo — це él.'],
    ['trabaja', true],
    ['trabajo', ARC, '«Trabajo» — форма для yo. Pablo — це él.'],
  ],
  tr: 'Пабло працює в банку.',
});
k.choice({
  n: 17,
  role: 'independent',
  fam: 'a104.friends',
  t: [ARPC],
  ins: 'Обери форму, яка підходить до підмета.',
  p: ['Ana y yo ___ en un restaurante.'],
  o: [
    ['cenan', ARPC, '«Cenan» — форма для ellos / ellas / ustedes. «Ana y yo» — це nosotros.'],
    ['cenáis', ARPC, '«Cenáis» — форма для vosotros. «Ana y yo» — це nosotros.'],
    ['cenamos', true],
  ],
  tr: 'Ми з Аною вечеряємо в ресторані.',
});
k.choice({
  n: 18,
  role: 'delayed',
  fam: 'a104.study',
  t: [ARC],
  ins: 'Обери форму, яка підходить до підмета.',
  p: ['¿Usted ___ ucraniano?'],
  o: [
    ['habla', true],
    ['hablas', ARC, '«Hablas» — форма для tú. Usted уживає форму 3-ї особи, як él / ella.'],
    ['hablo', ARC, '«Hablo» — форма для yo.'],
  ],
  tr: 'Ви розмовляєте українською?',
});
k.choice({
  n: 19,
  role: 'delayed',
  fam: 'a104.leisure',
  t: [ARPC],
  ins: 'Обери форму, яка підходить до підмета.',
  p: ['¿Vosotros ___ con el perro?'],
  o: [
    ['paseamos', ARPC, '«Paseamos» — форма для nosotros.'],
    ['pasean', ARPC, '«Pasean» — форма для ellos / ellas / ustedes. Для vosotros — закінчення -áis.'],
    ['paseáis', true],
    ['paseas', ARPC, '«Paseas» — форма для tú (одна людина).'],
  ],
  tr: 'Ви гуляєте із собакою?',
});

// ---- con (CV-03)
const conErr: Array<[string, string]> = [
  ['en', '«En» означає місце («у, в, на»). «Разом із кимось» — con.'],
  ['de', '«De» означає належність чи походження. «Разом із кимось» — con.'],
];
k.exact({ n: 20, role: 'supported', fam: 'a104.home', t: [CONW], ins: 'Впиши слово, яке означає «разом із». Зразок: Hablo con mi madre.', p: ['Ceno ___ mi familia.'], acc: ['con'], err: conErr, tr: 'Я вечеряю зі своєю сім’єю.' });
k.exact({
  n: 21,
  role: 'supported',
  fam: 'a104.friends',
  t: [CONU],
  ins: 'Склади речення з поданих слів. Зразок: Ceno con mi familia.',
  p: ['con · hablo · Ana'],
  acc: ['Hablo con Ana.', 'Yo hablo con Ana.'],
  err: [['Hablo Ana.', 'Бракує con: «розмовляти з кимось» — hablar con + людина.']],
  tr: 'Я розмовляю з Аною.',
});
k.exact({
  n: 22,
  role: 'independent',
  fam: 'a104.home',
  t: [CONU],
  ins: 'Переклади іспанською: «Я снідаю зі своїм татом».',
  acc: ['Desayuno con mi padre.', 'Yo desayuno con mi padre.'],
  err: [
    ['Desayuno mi padre.', 'Бракує con: «з кимось» — con + людина.'],
    ['Desayuno en mi padre.', '«En» означає місце. «Разом із кимось» — con.'],
  ],
});
k.exact({
  n: 23,
  role: 'independent',
  fam: 'a104.work',
  t: [CONU],
  ins: 'Переклади іспанською: «Я працюю з Мартою».',
  acc: ['Trabajo con Marta.', 'Yo trabajo con Marta.'],
  err: [['Trabajo Marta.', 'Бракує con: «з кимось» — con + людина.']],
});
k.exact({ n: 24, role: 'independent', fam: 'a104.study', t: [CONW], ins: 'Впиши слово, якого бракує, щоб речення означало «Я вивчаю іспанську разом зі своїми друзями».', p: ['Estudio español ___ mis amigos.'], acc: ['con'], err: conErr, tr: 'Я вивчаю іспанську зі своїми друзями.' });
k.exact({
  n: 25,
  role: 'independent',
  fam: 'a104.leisure',
  t: [CONU],
  ins: 'Переклади іспанською: «Ми гуляємо з нашим собакою».',
  acc: ['Paseamos con nuestro perro.', 'Nosotros paseamos con nuestro perro.', 'Nosotras paseamos con nuestro perro.'],
  hints: [hTr('Слова: paseamos — «ми гуляємо» (форма nosotros: закінчення -amos, див. крок «Множина»); nuestro perro — «наш собака» (nuestro — «наш», тема A1-02).')],
});
k.exact({
  n: 26,
  role: 'delayed',
  fam: 'a104.home',
  t: [CONU],
  ins: 'Переклади іспанською: «Ти вечеряєш зі своєю сестрою?»',
  acc: ['¿Cenas con tu hermana?', '¿Tú cenas con tu hermana?', '¿Cenas tú con tu hermana?'],
  err: [['¿Cenas tu hermana?', 'Бракує con: «з кимось» — con + людина.']],
});
k.slots({
  n: 27,
  role: 'delayed',
  fam: 'a104.work',
  t: [CONW],
  ins: 'Перепиши речення повністю, вставивши слово, якого бракує, щоб воно означало «Пабло працює разом зі своїм братом».',
  p: ['Pablo trabaja ___ su hermano.'],
  tpl: ['Pablo trabaja ', S('s1'), ' su hermano.'],
  slots: [{ id: 's1', t: CONW, acc: ['con'], err: conErr }],
  tr: 'Пабло працює зі своїм братом.',
});
k.exact({
  n: 28,
  role: 'transfer',
  fam: 'a104.shop',
  t: [CONU],
  ins: 'Переклади іспанською: «Я купую хліб разом зі своєю мамою».',
  acc: ['Compro pan con mi madre.', 'Yo compro pan con mi madre.'],
  err: [['Compro pan mi madre.', 'Бракує con: «разом із кимось» — con + людина.']],
});
k.exact({
  n: 29,
  role: 'transfer',
  fam: 'a104.cafe',
  t: [CONU],
  ins: 'Переклади іспанською: «Ми п’ємо каву з нашими друзями».',
  acc: [
    'Tomamos un café con nuestros amigos.',
    'Tomamos café con nuestros amigos.',
    'Nosotros tomamos un café con nuestros amigos.',
    'Nosotros tomamos café con nuestros amigos.',
    'Nosotras tomamos un café con nuestros amigos.',
    'Nosotras tomamos café con nuestros amigos.',
  ],
  err: [['Tomamos un café nuestros amigos.', 'Бракує con: «з кимось» — con + людина.']],
  hints: [hTr('Слова: tomamos — «ми п’ємо» (форма nosotros: закінчення -amos, див. крок «Множина»); nuestros amigos — «наші друзі» (nuestro — «наш», у множині nuestros; тема A1-02).')],
});

// ---- listening: daily actions (≥2 distinct clips, a meaning task per clip, optional dictation)
const c1 = k.clip({
  id: 'clip.a1-04.daily-actions.oficina',
  kind: 'sentence',
  es: 'Trabajo en una oficina y estudio español.',
  uk: 'Я працюю в офісі й вивчаю іспанську.',
  t: [LM, LD],
  fam: 'a104.l1.work',
});
const c2 = k.clip({
  id: 'clip.a1-04.daily-actions.cena',
  kind: 'sentence',
  es: 'Mis padres cenan en casa con mi hermana.',
  uk: 'Мої батьки вечеряють удома з моєю сестрою.',
  t: [LM],
  fam: 'a104.l1.dinner',
});
k.choice({
  n: 30,
  role: 'independent',
  fam: 'a104.l1.work',
  t: [LM],
  clips: [c1],
  ins: 'Послухай запис. Що робить ця людина?',
  o: [
    ['Працює в банку й вивчає англійську.', false],
    ['Працює в офісі й вивчає іспанську.', true],
    ['Вивчає іспанську вдома.', false],
  ],
  hints: [hTranscript([LM], 'Trabajo en una oficina y estudio español.')],
});
k.choice({
  n: 31,
  role: 'independent',
  fam: 'a104.l1.dinner',
  t: [LM],
  clips: [c2],
  ins: 'Послухай запис. Хто вечеряє вдома?',
  o: [
    ['Сестра з друзями.', false],
    ['Батьки з братом.', false],
    ['Батьки із сестрою.', true],
  ],
  hints: [hTr('Слово: con — «з, разом із» (див. крок «З ким: con»).'), hTranscript([LM], 'Mis padres cenan en casa con mi hermana.')],
});
k.exact({
  n: 32,
  role: 'independent',
  fam: 'a104.l1.work',
  t: [LD],
  clips: [c1],
  ins: 'Необов’язковий диктант: послухай і запиши речення іспанською. Великі літери й крапка в кінці не оцінюються.',
  acc: ['Trabajo en una oficina y estudio español.'],
  pol: DICTATION,
  noRule: true,
  bad: 'Поки що ні. Порівняй свій запис зі зразком у підказці «Показати відповідь»: зверни увагу на кожне слово й на знаки наголосу.',
  hints: [hRule([LD], 'Пиши так, як чуєш. Орфографічна помилка тут не означає, що ти не зрозумів запис: розуміння перевіряє окреме завдання.')],
});

k.material({
  id: 'material.a1-04.present-ar',
  topic: 'A1-04-L1',
  title: 'Теперішній час дієслів на -ar: таблиця закінчень',
  blocks: [
    uk('Відкинь -ar від інфінітива й додай закінчення особи. У формі vosotros завжди є знак наголосу.'),
    tableEs(
      ['persona', 'terminación', 'hablar', 'trabajar'],
      [
        ['yo', '-o', 'hablo', 'trabajo'],
        ['tú', '-as', 'hablas', 'trabajas'],
        ['él / ella / usted', '-a', 'habla', 'trabaja'],
        ['nosotros / nosotras', '-amos', 'hablamos', 'trabajamos'],
        ['vosotros / vosotras', '-áis', 'habláis', 'trabajáis'],
        ['ellos / ellas / ustedes', '-an', 'hablan', 'trabajan'],
      ],
    ),
    ex('Ceno con mi familia.', 'Я вечеряю зі своєю сім’єю.'),
    plink('Потренувати форми на -ar', [AR, ARP], 'written', 10),
  ],
  linked: [AR, ARP, CONU],
});

export default k.build({
  title: 'Дієслова на -ar: хто що робить',
  termEs: 'presente de los verbos regulares en -ar',
  summary: 'Утворюємо форми теперішнього часу правильних дієслів на -ar для всіх шести осіб і кажемо, з ким виконуємо дію (con).',
  objectives: ['A1-04-O1'],
  cv: ['CV-03'],
  situations: ['routine-study-leisure'],
  minutes: 18,
  introduces: ['present.regular-ar', 'present.regular-ar.plural', 'prep.con.company', 'listening.daily-actions'],
  revisits: ['pron.subject', 'pron.subject.plural', 'pron.person-mapping', 'pron.subject-omission', 'neg.no-before-verb', 'question.yes-no', 'prep.en.location', 'poss.mi-tu-su', 'poss.nuestro-vuestro'],
  steps: [
    {
      kind: 'explanation',
      title: 'Основа + закінчення: однина',
      blocks: [
        uk('У словнику дієслово має форму інфінітива: hablar — «говорити». Щоб сказати, хто виконує дію, відкинь -ar і додай закінчення особи.'),
        tableEs(
          ['persona', 'hablar', 'trabajar', 'estudiar'],
          [
            ['yo', 'hablo', 'trabajo', 'estudio'],
            ['tú', 'hablas', 'trabajas', 'estudias'],
            ['él / ella / usted', 'habla', 'trabaja', 'estudia'],
          ],
        ),
        uk('Usted — ввічливе «Ви» до однієї людини — уживає ту саму форму, що й él / ella: ¿Usted habla inglés?'),
        uk('Займенники yo, tú часто пропускають, бо закінчення вже показує особу: Trabajo en una oficina = Yo trabajo en una oficina.'),
        ex('Hablo español.', 'Я розмовляю іспанською.'),
        ex('¿Trabajas en casa?', 'Ти працюєш удома?'),
        ex('Ana estudia inglés.', 'Ана вивчає англійську.'),
      ],
    },
    {
      kind: 'explanation',
      title: 'Множина: nosotros, vosotros, ellos / ustedes',
      blocks: [
        uk('У множині закінчення такі: nosotros -amos, vosotros -áis, ellos / ellas / ustedes -an.'),
        tableEs(
          ['persona', 'hablar', 'trabajar', 'cenar'],
          [
            ['nosotros / nosotras', 'hablamos', 'trabajamos', 'cenamos'],
            ['vosotros / vosotras', 'habláis', 'trabajáis', 'cenáis'],
            ['ellos / ellas / ustedes', 'hablan', 'trabajan', 'cenan'],
          ],
        ),
        uk('У формі vosotros завжди пишемо знак наголосу: habláis, trabajáis. В Іспанії до кількох знайомих людей звертаються vosotros: ¿Habláis inglés?'),
        uk('Ustedes — ввічливе «Ви» до кількох людей — уживає форму на -an, як ellos: ¿Ustedes cenan en casa?'),
        ex('Cenamos en casa.', 'Ми вечеряємо вдома.'),
        ex('¿Trabajáis en Madrid?', 'Ви працюєте в Мадриді?'),
        ex('Mis padres hablan ucraniano.', 'Мої батьки розмовляють українською.'),
      ],
    },
    {
      kind: 'examples',
      title: 'З ким: con',
      blocks: [
        uk('Щоб сказати «разом із кимось», уживаємо con. Після con іменник чи ім’я не змінюється.'),
        ex('Ceno con mi familia.', 'Я вечеряю зі своєю сім’єю.'),
        ex('Hablo con mi madre.', 'Я розмовляю з мамою.'),
        ex('Ana estudia con sus amigos.', 'Ана навчається зі своїми друзями.'),
      ],
    },
    { kind: 'supported-practice', title: 'Практика зі зразком', tasks: [k.id(1), k.id(2), k.id(3), k.id(4), k.id(20), k.id(21)] },
    {
      kind: 'independent-practice',
      title: 'Самостійна практика',
      tasks: [k.id(16), k.id(5), k.id(6), k.id(17), k.id(7), k.id(8), k.id(9), k.id(10), k.id(22), k.id(23), k.id(24), k.id(25)],
    },
    { kind: 'listening', title: 'Послухай: хто що робить', required: false, clips: [c1, c2], tasks: [k.id(30), k.id(31), k.id(32)] },
    {
      kind: 'summary',
      title: 'Підсумок',
      blocks: [
        ul(
          'Форма = основа + закінчення: habl-ar → habl-o.',
          'Однина: -o, -as, -a. Множина: -amos, -áis, -an.',
          'Vosotros — зі знаком наголосу: habláis. Usted / ustedes — форми 3-ї особи.',
          '«Разом із кимось» — con: Ceno con mi familia.',
        ),
      ],
    },
  ],
});
