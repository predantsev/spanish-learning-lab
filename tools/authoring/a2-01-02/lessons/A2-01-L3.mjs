// A2-01-L3 — gerund formation: regular -ando / -iendo, -yendo, e → i, dormir → durmiendo.
import { EX, LINK, LIST_UK, TABLE_ES, UK, gap, lesson as mkLesson, material, slots, step } from '../lib.mjs';

const L = 'A2-01-L3';
const AR = 'progressive.gerund-regular-ar/written-form';
const ER = 'progressive.gerund-regular-er-ir/written-form';
const YE = 'progressive.gerund-yendo/written-form';
const EI = 'progressive.gerund-e-i/written-form';
const OU = 'progressive.gerund-o-u/written-form';

const R = {
  ar: 'Герундій дієслів на -ar: основа інфінітива + -ando: hablar → hablando. Чергування теперішнього часу сюди не переходить: jugar → jugando, pensar → pensando.',
  er: 'Герундій дієслів на -er та -ir: основа + -iendo: comer → comiendo, vivir → viviendo. Дифтонги теперішнього часу (ie, ue) не переходять: volver → volviendo.',
  ye: 'Якщо основа закінчується на голосну, замість -iendo пишемо -yendo: leer → leyendo, traer → trayendo, oír → oyendo. Від ir — yendo.',
  ei: 'У частини дієслів на -ir голосна e основи в герундії стає i: pedir → pidiendo, decir → diciendo, venir → viniendo.',
  ou: 'Dormir у герундії змінює o на u: durmiendo. Інші дієслова з чергуванням o → ue мають регулярний герундій: volviendo, encontrando.',
};
const ASK = 'Напишіть герундій (форму на -ando / -iendo) дієслова.';
const ASK_S = 'Подивіться на зразок і напишіть герундій дієслова.';
const ASK_SENT = 'Впишіть герундій дієслова з дужок (estar + герундій — дія, що відбувається зараз).';
const noChange = (f) => `Чергування теперішнього часу в герундій не переходить: ${f}.`;
const endAr = (f) => `Дієслова на -ar мають закінчення -ando: ${f}.`;
const endEr = (f) => `Дієслова на -er та -ir мають закінчення -iendo: ${f}.`;
const ye = (f) => `Після голосної основи пишемо -yendo: ${f}.`;
const ei = (f) => `У цьому дієслові на -ir e основи в герундії стає i: ${f}.`;

const single = (id, role, family, t, verb, form, err, rule, extra = {}) =>
  gap(L, { id, role, family, t, ask: extra.ask ?? ASK, model: extra.model, es: `${verb} → ___`, full: `${verb} → ${form}`, a: form, err, rule });
const sentence = (id, role, t, es, uk, form, err, rule) => gap(L, { id, role, family: 'sentence', t, ask: ASK_SENT, es, uk, a: form, err, rule });
const pair = (id, role, v1, f1, t1, e1, v2, f2, t2, e2, rules) =>
  slots(L, {
    id,
    role,
    family: 'paradigm',
    ask: `Напишіть увесь рядок, вставивши герундії: «${v1} — …, ${v2} — …».`,
    es: `${v1} — ___, ${v2} — ___.`,
    tpl: [`${v1} — `, { s: 'form1', t: t1, a: [f1], err: e1 }, `, ${v2} — `, { s: 'form2', t: t2, a: [f2], err: e2 }, '.'],
    rule: rules,
    full: `${v1} — ${f1}, ${v2} — ${f2}.`,
  });

export const tasks = [
  // -ar
  single('T01', 'supported', 'verb-list', AR, 'trabajar', 'trabajando', [['trabajiendo', endAr('trabajando')]], R.ar, { ask: ASK_S, model: [['hablar → hablando', 'говорити → говорячи']] }),
  single('T02', 'supported', 'verb-list', AR, 'estudiar', 'estudiando', [['estudiendo', endAr('estudiando')]], R.ar, { ask: ASK_S, model: [['escuchar → escuchando', 'слухати → слухаючи']] }),
  single('T03', 'independent', 'verb-list', AR, 'jugar', 'jugando', [['juegando', noChange('jugando')]], R.ar),
  single('T04', 'independent', 'verb-list', AR, 'pensar', 'pensando', [['piensando', noChange('pensando')]], R.ar),
  single('T05', 'independent', 'verb-list', AR, 'cocinar', 'cocinando', [['cociniendo', endAr('cocinando')]], R.ar),
  single('T06', 'delayed', 'verb-list', AR, 'encontrar', 'encontrando', [['encuentrando', noChange('encontrando')]], R.ar),
  sentence('T07', 'transfer', AR, '—¿Dónde está Ana? —Está ___ (trabajar) en la oficina.', '— Де Ана? — Вона зараз працює в офісі.', 'trabajando', [['trabajiendo', endAr('trabajando')]], R.ar),
  sentence('T08', 'transfer', AR, 'Los niños están ___ (jugar) en el parque.', 'Діти зараз граються в парку.', 'jugando', [['juegando', noChange('jugando')]], R.ar),

  // -er / -ir
  single('T11', 'supported', 'verb-list', ER, 'beber', 'bebiendo', [['bebando', endEr('bebiendo')], ['bebendo', endEr('bebiendo')]], R.er, { ask: ASK_S, model: [['comer → comiendo', 'їсти → їдячи']] }),
  single('T12', 'supported', 'verb-list', ER, 'escribir', 'escribiendo', [['escribando', endEr('escribiendo')]], R.er, { ask: ASK_S, model: [['vivir → viviendo', 'жити → живучи']] }),
  single('T13', 'delayed', 'verb-list', ER, 'entender', 'entendiendo', [['entiendiendo', noChange('entendiendo')]], R.er),
  sentence('T14', 'transfer', ER, 'Mi hermano está ___ (escribir) un mensaje.', 'Мій брат зараз пише повідомлення.', 'escribiendo', [['escribendo', endEr('escribiendo')]], R.er),
  sentence('T15', 'transfer', ER, '—¿Qué hacéis? —Estamos ___ (comer).', '— Що ви робите? — Ми зараз їмо.', 'comiendo', [['comendo', endEr('comiendo')], ['comando', endEr('comiendo')]], R.er),

  // -yendo
  single('T21', 'supported', 'verb-list', YE, 'traer', 'trayendo', [['traiendo', ye('trayendo')]], R.ye, { ask: ASK_S, model: [['leer → leyendo', 'читати → читаючи']] }),
  single('T22', 'supported', 'verb-list', YE, 'oír', 'oyendo', [['oiendo', ye('oyendo')]], R.ye, { ask: ASK_S, model: [['creer → creyendo', 'вірити → вірячи']] }),
  single('T23', 'independent', 'verb-list', YE, 'leer', 'leyendo', [['leiendo', ye('leyendo')]], R.ye),
  single('T24', 'independent', 'verb-list', YE, 'ir', 'yendo', [['iendo', 'Від ir герундій — yendo.'], ['iyendo', 'Від ir герундій — yendo.']], R.ye),
  single('T25', 'independent', 'verb-list', YE, 'caer', 'cayendo', [['caiendo', ye('cayendo')]], R.ye),
  single('T26', 'delayed', 'verb-list', YE, 'creer', 'creyendo', [['creiendo', ye('creyendo')]], R.ye),
  sentence('T27', 'transfer', YE, 'Pablo está ___ (leer) el periódico en el sofá.', 'Пабло зараз читає газету на дивані.', 'leyendo', [['leiendo', ye('leyendo')]], R.ye),
  sentence('T28', 'transfer', YE, 'Mis padres están ___ (traer) la comida.', 'Мої батьки зараз несуть їжу.', 'trayendo', [['traiendo', ye('trayendo')]], R.ye),

  // e → i
  single('T31', 'supported', 'verb-list', EI, 'decir', 'diciendo', [['deciendo', ei('diciendo')]], R.ei, { ask: ASK_S, model: [['pedir → pidiendo', 'просити → просячи']] }),
  single('T32', 'supported', 'verb-list', EI, 'servir', 'sirviendo', [['serviendo', ei('sirviendo')]], R.ei, { ask: ASK_S, model: [['repetir → repitiendo', 'повторювати → повторюючи']] }),
  single('T33', 'independent', 'verb-list', EI, 'preferir', 'prefiriendo', [['preferiendo', ei('prefiriendo')], ['prefieriendo', ei('prefiriendo')]], R.ei),
  single('T34', 'independent', 'verb-list', EI, 'repetir', 'repitiendo', [['repetiendo', ei('repitiendo')]], R.ei),
  single('T35', 'independent', 'verb-list', EI, 'pedir', 'pidiendo', [['pediendo', ei('pidiendo')]], R.ei),
  single('T36', 'delayed', 'verb-list', EI, 'venir', 'viniendo', [['veniendo', ei('viniendo')], ['viendo', 'Viendo — герундій від ver. Від venir: viniendo.']], R.ei),
  sentence('T37', 'transfer', EI, 'El camarero está ___ (servir) el café.', 'Офіціант зараз подає каву.', 'sirviendo', [['serviendo', ei('sirviendo')]], R.ei),
  sentence('T38', 'transfer', EI, '¿Qué estás ___ (decir)? No entiendo.', 'Що ти зараз кажеш? Я не розумію.', 'diciendo', [['deciendo', ei('diciendo')]], R.ei),

  // dormir → durmiendo (justified small bank)
  single('T41', 'supported', 'verb-list', OU, 'dormir', 'durmiendo', [['dormiendo', 'Dormir у герундії змінює o на u: durmiendo.'], ['duermiendo', 'Дифтонг ue в герундій не переходить; dormir має u: durmiendo.']], R.ou, { ask: ASK_S, model: [['pedir → pidiendo', 'просити → просячи']] }),
  sentence('T42', 'transfer', OU, 'Hablamos más tarde: mi hijo está ___ (dormir).', 'Поговоримо пізніше: мій син зараз спить.', 'durmiendo', [['dormiendo', 'Dormir у герундії змінює o на u: durmiendo.'], ['duermiendo', 'Дифтонг ue в герундій не переходить; dormir має u: durmiendo.']], R.ou),
  pair('T43', 'delayed', 'dormir', 'durmiendo', OU, [['dormiendo', 'Dormir у герундії змінює o на u: durmiendo.'], ['duermiendo', 'Дифтонг ue в герундій не переходить; dormir має u: durmiendo.']], 'encontrar', 'encontrando', AR, [['encuentrando', noChange('encontrando')]], [R.ou, R.ar]),
  sentence('T44', 'delayed', OU, 'Los niños están ___ (dormir) en el sofá.', 'Діти зараз сплять на дивані.', 'durmiendo', [['dormiendo', 'Dormir у герундії змінює o на u: durmiendo.']], R.ou),

  // pairs (two targets, separate slots)
  pair('T51', 'independent', 'hablar', 'hablando', AR, [['hablendo', endAr('hablando')]], 'comer', 'comiendo', ER, [['comando', endEr('comiendo')]], [R.ar, R.er]),
  pair('T52', 'delayed', 'jugar', 'jugando', AR, [['juegando', noChange('jugando')]], 'volver', 'volviendo', ER, [['vuelviendo', noChange('volviendo')]], [R.ar, R.er]),
  pair('T53', 'independent', 'leer', 'leyendo', YE, [['leiendo', ye('leyendo')]], 'escribir', 'escribiendo', ER, [['escribendo', endEr('escribiendo')]], [R.ye, R.er]),
  pair('T54', 'independent', 'pedir', 'pidiendo', EI, [['pediendo', ei('pidiendo')]], 'beber', 'bebiendo', ER, [['bebendo', endEr('bebiendo')]], [R.ei, R.er]),
  pair('T55', 'independent', 'dormir', 'durmiendo', OU, [['dormiendo', 'Dormir у герундії змінює o на u: durmiendo.']], 'volver', 'volviendo', ER, [['vuelviendo', noChange('volviendo')]], [R.ou, R.er]),
  pair('T56', 'delayed', 'venir', 'viniendo', EI, [['veniendo', ei('viniendo')]], 'ir', 'yendo', YE, [['iendo', 'Від ir герундій — yendo.']], [R.ei, R.ye]),
];

const T_GER = TABLE_ES(['infinitivo', 'gerundio'], [
  ['hablar', 'hablando'], ['trabajar', 'trabajando'], ['jugar', 'jugando'],
  ['comer', 'comiendo'], ['vivir', 'viviendo'], ['volver', 'volviendo'],
  ['leer', 'leyendo'], ['traer', 'trayendo'], ['oír', 'oyendo'], ['ir', 'yendo'],
  ['pedir', 'pidiendo'], ['decir', 'diciendo'], ['venir', 'viniendo'], ['preferir', 'prefiriendo'],
  ['dormir', 'durmiendo'],
]);

const s = (id, kind, title, required, opts = {}) => step(id, kind, title, required, { ...opts, lessonId: L });

export const lesson = mkLesson({
  id: L,
  titleUk: 'Герундій: правильні форми й кілька винятків',
  termEs: 'el gerundio',
  summaryUk: 'Утворюємо герундій (форму на -ando / -iendo): hablando, comiendo, а також винятки leyendo, yendo, pidiendo, diciendo, viniendo і durmiendo.',
  objectives: ['A2-01-O3'],
  situations: ['routine-study-leisure', 'people-family-home'],
  estimatedMinutes: 12,
  introduces: ['progressive.gerund-regular-ar', 'progressive.gerund-regular-er-ir', 'progressive.gerund-yendo', 'progressive.gerund-e-i', 'progressive.gerund-o-u'],
  revisits: ['present.regular-ar', 'present.regular-er', 'present.regular-ir', 'present.stem-e-ie', 'present.stem-o-ue', 'present.stem-e-i', 'present.jugar', 'present.estar'],
  steps: [
    s('s1', 'explanation', 'Що таке герундій і як його утворити', true, {
      blocks: [
        UK('Герундій (el gerundio) — незмінна форма дієслова на -ando або -iendo. Вона не змінюється ні за особою, ні за родом, ні за числом.'),
        UK('Дієслова на -ar: основа + -ando (hablar → hablando). Дієслова на -er та -ir: основа + -iendo (comer → comiendo, vivir → viviendo).'),
        UK('Чергування теперішнього часу (juego, pienso, vuelvo) у герундій не переходить: jugando, pensando, volviendo.'),
        UK('Найчастіше герундій уживаємо з estar, щоб сказати, що відбувається зараз. Детально цю конструкцію розберемо в наступному уроці.'),
        EX('Estoy trabajando.', 'Я зараз працюю.'),
      ],
    }),
    s('s2', 'supported-practice', 'Крок 1. -ando та -iendo за зразком', true, { tasks: ['T01', 'T02', 'T11', 'T12'] }),
    s('s3', 'explanation', 'Винятки: -yendo, e → i, durmiendo', true, {
      blocks: [
        UK('Якщо основа закінчується на голосну, замість -iendo пишемо -yendo: leer → leyendo, traer → trayendo, oír → oyendo, caer → cayendo, creer → creyendo. Від ir — yendo.'),
        UK('У частини дієслів на -ir e основи стає i: pedir → pidiendo, decir → diciendo, repetir → repitiendo, servir → sirviendo, venir → viniendo, preferir → prefiriendo. Дієслова на -ar та -er з чергуванням мають звичайний герундій: pensando, entendiendo.'),
        UK('Dormir змінює o на u: durmiendo.'),
        T_GER,
        EX('Pablo está leyendo el periódico.', 'Пабло зараз читає газету.'),
        EX('El niño está durmiendo.', 'Дитина зараз спить.'),
      ],
    }),
    s('s4', 'supported-practice', 'Крок 2. Винятки за зразком', true, { tasks: ['T21', 'T22', 'T31', 'T32', 'T41'] }),
    s('s5', 'independent-practice', 'Самостійно: герундій без зразка', true, { tasks: ['T03', 'T51', 'T23', 'T33', 'T55'] }),
    s('s6', 'independent-practice', 'Додаткова практика', false, { tasks: ['T04', 'T05', 'T24', 'T25', 'T34', 'T35', 'T53', 'T54'] }),
    s('s7', 'summary', 'Підсумок', true, {
      blocks: [
        LIST_UK([
          '-ar → -ando: trabajando, jugando, pensando (без чергування).',
          '-er / -ir → -iendo: comiendo, viviendo, volviendo (без чергування).',
          'Голосна перед закінченням → -yendo: leyendo, trayendo, oyendo; ir → yendo.',
          'e → i у дієсловах на -ir: pidiendo, diciendo, viniendo, prefiriendo; dormir → durmiendo.',
        ]),
        LINK('Потренувати герундій', [AR, ER, YE, EI, OU], 'written', 10),
      ],
    }),
  ],
});

export const materials = [
  material({
    id: 'material.a2-01.gerund',
    topicId: L,
    titleUk: 'Таблиця: герундій',
    blocks: [
      UK('-ar → -ando; -er / -ir → -iendo; після голосної → -yendo; e → i у частині дієслів на -ir; dormir → durmiendo.'),
      T_GER,
      LINK('Практика: герундій', [AR, ER, YE, EI, OU], 'written', 10),
    ],
    linkedTargets: [AR, ER, YE, EI, OU],
  }),
];
