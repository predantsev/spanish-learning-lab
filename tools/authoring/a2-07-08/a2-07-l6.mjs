// A2-07-L6 — one taught object pronoun attached to an affirmative instruction (O6).
// Every task assesses placement and the written accent as separate targets.
import { table, ul, uk, ex } from './lib.mjs';
import { kit, withPF } from './kit.mjs';

const L = 'A2-07-L6';
const PL = 'imperative.pronoun-placement/construction-use';
const PA = 'imperative.pronoun-accent/written-form';
const BOTH = [PL, PA];

const D = {
  [PL]: {
    rule: 'У ствердному наказі займенник-додаток стоїть після дієслова й пишеться з ним разом: Llama a Ana → Llámala. Compra el pan → Cómpralo. (В інших реченнях — перед дієсловом: La llamo.)',
    ok: 'Правильно! Займенник приєднано до наказу, знак наголосу на місці.',
    bad: 'Ще ні. Займенник пишемо після наказу разом із ним і перевіряємо знак наголосу.',
    unres: 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком.',
  },
};
D[PA] = D[PL];

const k = kit(L, D);
const ACC_RULE = 'Наголос у дієслові не переміщується. Якщо після приєднання займенника наголошений склад стає третім від кінця, пишемо знак наголосу: cóm-pra-lo, llá-ma-me, dí-ga-me. Dime, hazlo, ponlo знака не потребують.';
const extra = [{ kind: 'rule', targets: [PA], blocks: [uk(ACC_RULE)] }];
const INSTR = 'Замініть виділене займенником і запишіть наказ одним словом разом із займенником (решту речення залиште).';

const multi = (n, role, fam, o) =>
  k.ev(n, role, fam, BOTH, {
    instr: o.instr ?? INSTR,
    model: o.model,
    es: o.es,
    acc: o.acc,
    err: o.err,
    tr: o.tr,
    ruleKeys: [PL],
    rule: D[PL].rule,
    extraHints: extra,
  });

const placeX = { [PL]: 'incorrect' };
const accentX = { [PL]: 'correct', [PA]: 'incorrect' };
const roleX = { [PL]: 'unresolved', [PA]: 'correct' };

const tasks = [
  k.ch(1, 'supported', 'fam.home', BOTH, {
    instr: 'Замініть el pan займенником. Оберіть правильно написаний наказ.',
    pre: uk('Нагадування: займенник — після наказу й разом із ним; com-pra → cóm-pra-lo (знак наголосу).'),
    es: 'Compra el pan.',
    opts: [
      ['Cómpralo.', 'c'],
      ['Compralo.', accentX, 'Займенник на місці, але наголос на com- тепер третій від кінця: пишемо знак — cómpralo.'],
      ['Lo compra.', placeX, 'Lo compra — «він його купує». У ствердному наказі займенник після дієслова: cómpralo.'],
    ],
    ruleKeys: [PL],
    extraHints: extra,
    tr: 'Купи хліб. → Купи його.',
  }),
  multi(2, 'supported', 'fam.friends', {
    model: ['Compra la fruta. → Cómprala.', 'Купи фрукти. → Купи їх.'],
    es: 'Llama a Ana.',
    acc: withPF('Llámala.'),
    err: [
      ['Llamala.', 'Займенник на місці, але треба знак наголосу: llá-ma-la.', accentX],
      ['La llama.', 'La llama — «він їй телефонує». У наказі займенник після дієслова: llámala.', placeX],
      ['Llama la.', 'Займенник пишемо разом із дієсловом: llámala.', { [PL]: 'incorrect' }],
      ['Llámale.', 'Ана — жінка, тому la: llámala.', roleX],
    ],
    tr: 'Подзвони Ані. → Подзвони їй.',
  }),
  multi(3, 'independent', 'fam.home', {
    es: 'Lee el mensaje.',
    acc: withPF('Léelo.'),
    err: [
      ['Leelo.', 'Займенник на місці, але треба знак наголосу: lé-e-lo.', accentX],
      ['Lo lee.', 'Lo lee — «він його читає». У наказі займенник після дієслова: léelo.', placeX],
      ['Léela.', 'El mensaje — чоловічого роду, тому lo: léelo.', roleX],
    ],
    tr: 'Прочитай повідомлення. → Прочитай його.',
  }),
  multi(4, 'independent', 'fam.home', {
    es: 'Haz la cena.',
    acc: withPF('Hazla.'),
    err: [
      ['Házla.', 'Hazla — два склади, наголос на першому (HAZ-la): знак не потрібен.', accentX],
      ['La haz.', 'У ствердному наказі займенник після дієслова: hazla.', placeX],
      ['Hazlo.', 'La cena — жіночого роду, тому la: hazla.', roleX],
    ],
    tr: 'Приготуй вечерю. → Приготуй її.',
  }),
  k.ch(5, 'independent', 'fam.office', BOTH, {
    instr: 'Замініть a la señora García займенником. Оберіть правильно написаний наказ для usted.',
    es: 'Llame a la señora García.',
    opts: [
      ['Llámela.', 'c'],
      ['Llamela.', accentX, 'Займенник на місці, але треба знак наголосу: llá-me-la.'],
      ['La llame.', placeX, 'У ствердному наказі займенник стоїть після дієслова: llámela.'],
    ],
    ruleKeys: [PL],
    extraHints: extra,
    tr: 'Зателефонуйте пані Гарсії. → Зателефонуйте їй.',
  }),
  multi(6, 'independent', 'fam.home', {
    es: 'Ayuda a tu hermana.',
    acc: withPF('Ayúdala.'),
    err: [
      ['Ayudala.', 'Займенник на місці, але треба знак наголосу: a-yú-da-la.', accentX],
      ['La ayuda.', 'La ayuda — «він їй допомагає». У наказі займенник після дієслова: ayúdala.', placeX],
      ['Ayúdale.', 'Ayudar — кого? Сестра — жіночого роду, тому la: ayúdala.', roleX],
    ],
    tr: 'Допоможи сестрі. → Допоможи їй.',
  }),
  multi(7, 'independent', 'fam.home', {
    es: 'Pon el vaso en la mesa.',
    acc: withPF('Ponlo en la mesa.'),
    err: [
      ['Pónlo en la mesa.', 'Ponlo — два склади, наголос на першому (PON-lo): знак не потрібен.', accentX],
      ['Lo pon en la mesa.', 'У ствердному наказі займенник після дієслова: ponlo.', placeX],
      ['Ponla en la mesa.', 'El vaso — чоловічого роду, тому lo: ponlo.', roleX],
    ],
    tr: 'Постав склянку на стіл. → Постав її на стіл.',
  }),
  multi(8, 'delayed', 'fam.friends', {
    es: 'Llama a Pablo.',
    acc: [...withPF('Llámalo.'), ...withPF('Llámale.')],
    err: [
      ['Llamalo.', 'Займенник на місці, але треба знак наголосу: llá-ma-lo.', accentX],
      ['Lo llama.', 'Lo llama — «він йому телефонує». У наказі займенник після дієслова: llámalo.', placeX],
      ['Llámala.', 'Пабло — чоловік, тому lo (або поширене в Іспанії le): llámalo.', roleX],
    ],
    tr: 'Подзвони Пабло. → Подзвони йому.',
  }),
  multi(9, 'delayed', 'fam.office', {
    instr: 'Замініть el DNI займенником і запишіть наказ для usted (решту речення залиште).',
    es: 'Ponga el DNI aquí.',
    acc: withPF('Póngalo aquí.'),
    err: [
      ['Pongalo aquí.', 'Займенник на місці, але треба знак наголосу: pón-ga-lo.', accentX],
      ['Lo ponga aquí.', 'У ствердному наказі займенник після дієслова: póngalo.', placeX],
      ['Póngala aquí.', 'El DNI — чоловічого роду, тому lo: póngalo.', roleX],
    ],
    tr: 'Покладіть посвідчення сюди. → Покладіть його сюди.',
  }),
  multi(10, 'transfer', 'fam.phone', {
    instr: 'Вам телефонують на роботу. Попросіть співрозмовника (usted) говорити: приєднайте me до наказу diga й запишіть одним словом.',
    es: 'diga + me',
    acc: ['Dígame.', '¿Dígame?'],
    err: [
      ['Digame.', 'Займенник на місці, але треба знак наголосу: dí-ga-me.', accentX],
      ['Me diga.', 'У ствердному наказі займенник після дієслова: dígame.', placeX],
    ],
    tr: 'Слухаю вас.',
  }),
  multi(11, 'transfer', 'fam.phone', {
    instr: 'Перетворіть питання на наказ для tú з займенником: «Скажи мені свій номер».',
    es: '¿Me dices tu número?',
    acc: withPF('Dime tu número.'),
    err: [
      ['Díme tu número.', 'Dime — два склади, наголос на першому (DI-me): знак не потрібен.', accentX],
      ['Me di tu número.', 'У ствердному наказі займенник після дієслова: dime.', placeX],
      ['Me dice tu número.', 'Наказ для tú від decir — di, а займенник після нього: dime.', placeX],
    ],
    tr: 'Скажи мені свій номер.',
  }),
];

const T = (n) => `${L}-T${String(n).padStart(2, '0')}`;

const lesson = {
  schemaVersion: 1,
  id: L,
  kind: 'lesson',
  blockId: 'A2-07',
  titleUk: 'Займенник разом із наказом',
  termEs: 'imperativo con pronombre',
  summaryUk: 'У ствердному наказі займенник-додаток стоїть після дієслова й пишеться з ним разом: cómpralo, llámala, dígame. Знак наголосу з’являється, коли наголошений склад стає третім від кінця.',
  objectives: ['A2-07-O6'],
  situations: ['people-family-home', 'personal-messages'],
  estimatedMinutes: 12,
  introduces: ['imperative.pronoun-placement', 'imperative.pronoun-accent'],
  revisits: ['object-pron.direct-3', 'object-pron.direct-1-2', 'object-pron.indirect-forms', 'object-pron.placement-finite', 'object-pron.placement-infinitive', 'imperative.tu.regular', 'imperative.usted.regular', 'imperative.tu.decir', 'imperative.tu.hacer', 'imperative.tu.poner', 'imperative.usted.yo-g', 'ortho.stress-awareness'],
  steps: [
    {
      id: 's1',
      kind: 'explanation',
      titleUk: 'Займенник після ствердного наказу',
      required: true,
      blocks: [
        uk('У звичайному реченні займенник-додаток стоїть перед дієсловом: La llamo. Lo compro. У ствердному наказі він стоїть після дієслова й пишеться з ним в одне слово: Llámala. Cómpralo.'),
        uk('Який займенник обрати, ви вже знаєте: lo — його (чоловічий рід), la — її, le — йому, їй (кому?), me — мене, мені. Для особи чоловічого роду в Іспанії поширене й допустиме le: Llámale = Llámalo.'),
        ex('Compra el pan. → Cómpralo.', 'Купи хліб. → Купи його.'),
        ex('Llama a Ana. → Llámala.', 'Подзвони Ані. → Подзвони їй.'),
        ex('Escribe a Pablo. → Escríbele.', 'Напиши Пабло. → Напиши йому.'),
        ex('Ayúdame, por favor.', 'Допоможи мені, будь ласка.'),
        ex('Llame a la señora García. → Llámela.', 'Зателефонуйте пані Гарсії. → Зателефонуйте їй.'),
      ],
    },
    {
      id: 's2',
      kind: 'explanation',
      titleUk: 'Знак наголосу: cómpralo, llámame, dígame',
      required: true,
      blocks: [
        uk('Коли додаємо займенник, наголос у дієслові не переміщується: COM-pra → CÓM-pra-lo. Якщо наголошений склад стає третім від кінця, пишемо знак наголосу. Dime, hazlo, ponlo знака не потребують: наголос на передостанньому складі (DI-me, HAZ-lo).'),
        table(
          ['imperativo', '+ pronombre'],
          [
            ['compra', 'cómpralo'],
            ['llama', 'llámame'],
            ['escribe', 'escríbeme'],
            ['lee', 'léelo'],
            ['diga', 'dígame'],
            ['ponga', 'póngalo'],
            ['di', 'dime'],
            ['haz', 'hazlo'],
            ['pon', 'ponlo'],
          ],
        ),
        uk('Помилка в знаку наголосу — це помилка правопису, а не місця займенника: ми оцінюємо їх окремо.'),
      ],
    },
    { id: 's3', kind: 'supported-practice', titleUk: 'Практика зі зразком', required: true, taskIds: [1, 2].map(T) },
    { id: 's4', kind: 'independent-practice', titleUk: 'Самостійна практика', required: true, taskIds: [3, 4, 5, 6].map(T) },
    { id: 's5', kind: 'independent-practice', titleUk: 'Ще вправа (за бажанням)', required: false, taskIds: [7].map(T) },
    {
      id: 's6',
      kind: 'summary',
      titleUk: 'Підсумок',
      required: true,
      blocks: [
        ul([
          'Ствердний наказ + займенник = одне слово: cómpralo, llámala, dígame.',
          'Наголос не переміщується; третій склад від кінця → знак наголосу.',
          'Dime, hazlo, ponlo — без знака наголосу.',
          'Le для особи чоловічого роду теж допустиме: llámale.',
        ]),
      ],
    },
  ],
  reviewStatus: 'draft',
};

export default { lesson, tasks };
