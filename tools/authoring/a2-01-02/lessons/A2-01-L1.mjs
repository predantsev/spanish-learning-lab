// A2-01-L1 — present stem changes e → ie, o → ue, u → ue (jugar), e → i; unchanged nosotros/vosotros.
import { EX, LINK, LIST_UK, TABLE_ES, UK, gap, lesson as mkLesson, material, slots, step } from '../lib.mjs';

const L = 'A2-01-L1';
const EIE = 'present.stem-e-ie/written-form';
const OUE = 'present.stem-o-ue/written-form';
const JUG = 'present.jugar/written-form';
const EI = 'present.stem-e-i/written-form';
const UNCH = 'present.stem-unchanged-1p-2p/written-form';

const R = {
  eie: 'Під наголосом e в основі змінюється на ie: pensar → pienso, piensas, piensa, piensan. Закінчення — як у правильних дієсловах.',
  oue: 'Під наголосом o в основі змінюється на ue: poder → puedo, puedes, puede, pueden. Закінчення — як у правильних дієсловах.',
  jug: 'Jugar змінює u на ue, коли наголос падає на основу: juego, juegas, juega, juegan. Але: jugamos, jugáis.',
  ei: 'У дієсловах pedir, repetir, servir наголошене e основи змінюється на i: pido, pides, pide, piden.',
  unch: 'У формах nosotros і vosotros наголос падає на закінчення, тому основа не змінюється: pensamos, podéis, pedimos.',
};
const WHY = {
  eie: 'Під наголосом e в основі стає ie.',
  oue: 'Під наголосом o в основі стає ue.',
  jug: 'У jugar під наголосом u стає ue.',
  ei: 'У цих дієсловах на -ir наголошене e стає i.',
  unch: 'У формах nosotros і vosotros основа не змінюється.',
};
const diph = (form, change) => `Основа тут наголошена, тому потрібне чергування ${change}: ${form}.`;
const person = (wrong, right, who) => `${wrong} — форма іншої особи. Для «${who}» потрібна форма ${right}.`;
const noChange = (form) => `У формах nosotros і vosotros наголос падає на закінчення, тому основа не змінюється: ${form}.`;
const accent = (form) => `Цю форму пишемо зі знаком наголосу: ${form}.`;

const ASK = 'Впишіть правильну форму дієслова з дужок.';
const ASK_S = 'Подивіться на зразок і впишіть правильну форму дієслова з дужок.';
const ASK_MSG = 'Допишіть повідомлення: впишіть правильну форму дієслова з дужок.';
const pairAsk = (verb, a, b) => `Напишіть увесь рядок, вставивши дві форми дієслова ${verb}: «${a} …, ${b} …».`;

function pair(id, role, verb, p1, f1, t1, e1, p2, f2, e2) {
  return slots(L, {
    id,
    role,
    family: 'paradigm',
    ask: pairAsk(verb, p1, p2),
    es: `${p1} ___, ${p2} ___. (${verb})`,
    tpl: [`${p1} `, { s: 'form1', t: t1, a: [f1], err: e1 }, `, ${p2} `, { s: 'form2', t: UNCH, a: [f2], err: e2 }, '.'],
    rule: [R[t1 === EIE ? 'eie' : t1 === OUE ? 'oue' : t1 === JUG ? 'jug' : 'ei'], R.unch],
    full: `${p1} ${f1}, ${p2} ${f2}.`,
    ok: `Правильно: ${p1} ${f1}, ${p2} ${f2}. Наголошена основа змінюється, а в ${p2} — ні.`,
    no: `Правильна відповідь: ${p1} ${f1}, ${p2} ${f2}. Чергування є лише там, де наголос падає на основу.`,
  });
}

export const tasks = [
  // e → ie
  gap(L, { id: 'T01', role: 'supported', family: 'routine', t: EIE, ask: ASK_S, model: [['Mi hermano piensa mucho en sus vacaciones.', 'Мій брат багато думає про свою відпустку.']], es: 'La clase ___ (empezar) a las nueve.', uk: 'Заняття починається о дев’ятій.', a: 'empieza', err: [['empeza', diph('empieza', 'e → ie')], ['empiezo', person('Empiezo', 'empieza', 'la clase')]], rule: R.eie, why: WHY.eie }),
  gap(L, { id: 'T02', role: 'supported', family: 'food-cafe', t: EIE, ask: ASK_S, model: [['Quiero un café con leche.', 'Я хочу каву з молоком.']], es: 'Perdón, no ___ (entender, yo) la cuenta.', uk: 'Перепрошую, я не розумію рахунку.', a: 'entiendo', err: [['entendo', diph('entiendo', 'e → ie')]], rule: R.eie, why: WHY.eie }),
  gap(L, { id: 'T03', role: 'independent', family: 'family-home', t: EIE, ask: ASK, es: 'Mis padres ___ (cerrar) la tienda a las ocho.', uk: 'Мої батьки зачиняють крамницю о восьмій.', a: 'cierran', err: [['cerran', diph('cierran', 'e → ie')], ['cierra', person('Cierra', 'cierran', 'mis padres')]], rule: R.eie, why: WHY.eie }),
  gap(L, { id: 'T04', role: 'independent', family: 'routine', t: EIE, ask: ASK, es: '¿En qué ___ (pensar, tú)?', uk: 'Про що ти думаєш?', a: 'piensas', err: [['pensas', diph('piensas', 'e → ie')]], rule: R.eie, why: WHY.eie }),
  gap(L, { id: 'T05', role: 'independent', family: 'food-cafe', t: EIE, ask: ASK, es: '¿Usted ___ (preferir) té o café?', uk: 'Ви віддаєте перевагу чаю чи каві?', a: 'prefiere', err: [['prefere', diph('prefiere', 'e → ie')], ['prefieres', person('Prefieres', 'prefiere', 'usted')]], rule: R.eie, why: `${WHY.eie} Usted вживає форму 3-ї особи однини.` }),
  gap(L, { id: 'T06', role: 'delayed', family: 'routine', t: EIE, ask: ASK, es: 'Las clases ___ (empezar) en septiembre.', uk: 'Заняття починаються у вересні.', a: 'empiezan', err: [['empezan', diph('empiezan', 'e → ie')], ['empieza', person('Empieza', 'empiezan', 'las clases')]], rule: R.eie, why: WHY.eie }),
  gap(L, { id: 'T07', role: 'transfer', family: 'messages', t: EIE, ask: ASK_MSG, es: 'Hola, Pablo: ¿___ (querer, tú) ir al cine esta noche?', uk: 'Привіт, Пабло! Хочеш сьогодні ввечері піти в кіно?', a: 'quieres', err: [['queres', diph('quieres', 'e → ie')]], rule: R.eie, why: WHY.eie }),
  gap(L, { id: 'T08', role: 'transfer', family: 'travel', t: EIE, ask: ASK, es: 'En el hotel siempre ___ (cerrar, yo) la puerta con llave.', uk: 'У готелі я завжди замикаю двері на ключ.', a: 'cierro', err: [['cerro', diph('cierro', 'e → ie')]], rule: R.eie, why: WHY.eie }),

  // o → ue
  gap(L, { id: 'T11', role: 'supported', family: 'routine', t: OUE, ask: ASK_S, model: [['Mi hermano vuelve a casa a las seis.', 'Мій брат повертається додому о шостій.']], es: 'Los niños ___ (dormir) diez horas.', uk: 'Діти сплять десять годин.', a: 'duermen', err: [['dormen', diph('duermen', 'o → ue')], ['duerme', person('Duerme', 'duermen', 'los niños')]], rule: R.oue, why: WHY.oue }),
  gap(L, { id: 'T12', role: 'supported', family: 'shop', t: OUE, ask: ASK_S, model: [['¿Cuánto cuesta el pan?', 'Скільки коштує хліб?']], es: '¿Cuánto ___ (costar) los tomates?', uk: 'Скільки коштують помідори?', a: 'cuestan', err: [['costan', diph('cuestan', 'o → ue')], ['cuesta', 'Los tomates — множина, тому cuestan.']], rule: R.oue, why: WHY.oue }),
  gap(L, { id: 'T13', role: 'independent', family: 'routine', t: OUE, ask: ASK, es: 'No ___ (encontrar, yo) mis llaves.', uk: 'Не можу знайти свої ключі.', a: 'encuentro', err: [['encontro', diph('encuentro', 'o → ue')]], rule: R.oue, why: WHY.oue }),
  gap(L, { id: 'T14', role: 'independent', family: 'family-home', t: OUE, ask: ASK, es: 'Mi madre no ___ (recordar) mi número de móvil.', uk: 'Моя мама не пам’ятає мого номера мобільного.', a: 'recuerda', err: [['recorda', diph('recuerda', 'o → ue')]], rule: R.oue, why: WHY.oue }),
  gap(L, { id: 'T15', role: 'independent', family: 'free-time', t: OUE, ask: ASK, es: 'Hoy no ___ (poder, yo), lo siento.', uk: 'Сьогодні я не можу, вибач.', a: 'puedo', err: [['podo', diph('puedo', 'o → ue')], ['puede', person('Puede', 'puedo', 'yo')]], rule: R.oue, why: WHY.oue }),
  gap(L, { id: 'T16', role: 'delayed', family: 'routine', t: OUE, ask: ASK, es: '¿___ (dormir, tú) bien?', uk: 'Ти добре спиш?', a: 'duermes', err: [['dormes', diph('duermes', 'o → ue')]], rule: R.oue, why: WHY.oue }),
  gap(L, { id: 'T17', role: 'transfer', family: 'messages', t: OUE, ask: ASK_MSG, es: 'Hola, Ana: mis padres ___ (volver) el domingo por la noche.', uk: 'Привіт, Ано! Мої батьки повертаються в неділю ввечері.', a: 'vuelven', err: [['volven', diph('vuelven', 'o → ue')], ['vuelve', person('Vuelve', 'vuelven', 'mis padres')]], rule: R.oue, why: WHY.oue }),
  gap(L, { id: 'T18', role: 'transfer', family: 'travel', t: OUE, ask: ASK, es: 'Perdón, no ___ (recordar, yo) el número de mi habitación.', uk: 'Перепрошую, я не пам’ятаю номера своєї кімнати.', a: 'recuerdo', err: [['recordo', diph('recuerdo', 'o → ue')]], rule: R.oue, why: WHY.oue }),

  // jugar
  gap(L, { id: 'T21', role: 'supported', family: 'free-time', t: JUG, ask: ASK_S, model: [['Mi hermano juega al fútbol los sábados.', 'Мій брат грає у футбол по суботах.']], es: 'Yo también ___ (jugar) al fútbol.', uk: 'Я теж граю у футбол.', a: 'juego', err: [['jugo', diph('juego', 'u → ue')]], rule: R.jug, why: WHY.jug }),
  gap(L, { id: 'T22', role: 'supported', family: 'family-home', t: JUG, ask: ASK_S, model: [['Mi hija juega con el gato.', 'Моя донька грається з котом.']], es: 'Los niños ___ (jugar) en el parque.', uk: 'Діти граються в парку.', a: 'juegan', err: [['jugan', diph('juegan', 'u → ue')]], rule: R.jug, why: WHY.jug }),
  gap(L, { id: 'T23', role: 'independent', family: 'free-time', t: JUG, ask: ASK, es: '¿___ (jugar, tú) al fútbol los domingos?', uk: 'Ти граєш у футбол по неділях?', a: 'juegas', err: [['jugas', diph('juegas', 'u → ue')]], rule: R.jug, why: WHY.jug }),
  gap(L, { id: 'T24', role: 'independent', family: 'family-home', t: JUG, ask: ASK, es: 'Mi hijo ___ (jugar) con el perro.', uk: 'Мій син грається із собакою.', a: 'juega', err: [['juga', diph('juega', 'u → ue')]], rule: R.jug, why: WHY.jug }),
  gap(L, { id: 'T25', role: 'independent', family: 'free-time', t: JUG, ask: ASK, es: 'Mis amigos ___ (jugar) al fútbol en la playa.', uk: 'Мої друзі грають у футбол на пляжі.', a: 'juegan', err: [['jugan', diph('juegan', 'u → ue')], ['juega', person('Juega', 'juegan', 'mis amigos')]], rule: R.jug, why: WHY.jug }),
  gap(L, { id: 'T26', role: 'delayed', family: 'free-time', t: JUG, ask: ASK, es: '¿Con quién ___ (jugar, tú) los sábados?', uk: 'З ким ти граєш по суботах?', a: 'juegas', err: [['jugas', diph('juegas', 'u → ue')]], rule: R.jug, why: WHY.jug }),
  gap(L, { id: 'T27', role: 'transfer', family: 'messages', t: JUG, ask: ASK_MSG, es: 'Hola, Marta: el sábado no ___ (jugar, yo) al fútbol, estoy enfermo.', uk: 'Привіт, Марто! У суботу я не граю у футбол: я хворий.', a: 'juego', err: [['jugo', diph('juego', 'u → ue')]], rule: R.jug, why: WHY.jug }),
  gap(L, { id: 'T28', role: 'transfer', family: 'school', t: JUG, ask: ASK, es: 'En la escuela, los niños ___ (jugar) a las once.', uk: 'У школі діти граються об одинадцятій.', a: 'juegan', err: [['jugan', diph('juegan', 'u → ue')]], rule: R.jug, why: WHY.jug }),

  // e → i
  gap(L, { id: 'T31', role: 'supported', family: 'food-cafe', t: EI, ask: ASK_S, model: [['En el bar siempre pido un café con leche.', 'У барі я завжди замовляю каву з молоком.']], es: '¿Qué ___ (pedir, tú)?', uk: 'Що ти замовляєш?', a: 'pides', err: [['pedes', diph('pides', 'e → i')]], rule: R.ei, why: WHY.ei }),
  gap(L, { id: 'T32', role: 'supported', family: 'work-study', t: EI, ask: ASK_S, model: [['Repito el número de teléfono.', 'Я повторюю номер телефону.']], es: 'Perdón, no entiendo. ¿___ (repetir, usted) el número, por favor?', uk: 'Перепрошую, я не розумію. Повторіть, будь ласка, номер.', a: 'repite', err: [['repete', diph('repite', 'e → i')], ['repites', person('Repites', 'repite', 'usted')]], rule: R.ei, why: `${WHY.ei} Usted вживає форму 3-ї особи однини.` }),
  gap(L, { id: 'T33', role: 'independent', family: 'food-cafe', t: EI, ask: ASK, es: 'El camarero ___ (servir) el café.', uk: 'Офіціант подає каву.', a: 'sirve', err: [['serve', diph('sirve', 'e → i')]], rule: R.ei, why: WHY.ei }),
  gap(L, { id: 'T34', role: 'independent', family: 'work-study', t: EI, ask: ASK, es: 'Mi hijo ___ (repetir) el examen en septiembre.', uk: 'Мій син перескладає іспит у вересні.', a: 'repite', err: [['repete', diph('repite', 'e → i')]], rule: R.ei, why: WHY.ei }),
  gap(L, { id: 'T35', role: 'independent', family: 'food-cafe', t: EI, ask: ASK, es: 'Mis amigos siempre ___ (pedir) pescado.', uk: 'Мої друзі завжди замовляють рибу.', a: 'piden', err: [['peden', diph('piden', 'e → i')], ['pide', person('Pide', 'piden', 'mis amigos')]], rule: R.ei, why: WHY.ei }),
  gap(L, { id: 'T36', role: 'delayed', family: 'food-cafe', t: EI, ask: ASK, es: 'En el restaurante de mi calle ___ (servir, ellos) un menú del día muy barato.', uk: 'У ресторані на моїй вулиці подають дуже дешевий комплексний обід.', a: 'sirven', err: [['serven', diph('sirven', 'e → i')]], rule: R.ei, why: WHY.ei }),
  gap(L, { id: 'T37', role: 'transfer', family: 'messages', t: EI, ask: ASK_MSG, es: 'Ana, esta noche yo ___ (pedir) la cena y tú compras el pan, ¿vale?', uk: 'Ано, сьогодні ввечері я замовляю вечерю, а ти купуєш хліб, гаразд?', a: 'pido', err: [['pedo', diph('pido', 'e → i')]], rule: R.ei, why: WHY.ei }),
  gap(L, { id: 'T38', role: 'transfer', family: 'family-home', t: EI, ask: ASK, es: 'En casa, mi padre ___ (servir) la comida.', uk: 'Удома обід подає мій тато.', a: 'sirve', err: [['serve', diph('sirve', 'e → i')]], rule: R.ei, why: WHY.ei }),

  // nosotros / vosotros without change
  gap(L, { id: 'T41', role: 'supported', family: 'routine', t: UNCH, ask: ASK_S, model: [['Normalmente volvemos a casa a las siete.', 'Зазвичай ми повертаємося додому о сьомій.']], es: 'Los sábados ___ (dormir, nosotros) mucho.', uk: 'По суботах ми довго спимо.', a: 'dormimos', err: [['duermimos', noChange('dormimos')], ['duermemos', noChange('dormimos')]], rule: R.unch, why: WHY.unch }),
  gap(L, { id: 'T42', role: 'supported', family: 'food-cafe', t: UNCH, ask: ASK_S, model: [['¿Qué pedís, chicos?', 'Що ви замовляєте, хлопці?']], es: '¿___ (querer, vosotros) agua?', uk: 'Хочете води?', a: 'queréis', err: [['quieréis', noChange('queréis')], ['quereis', accent('queréis')]], rule: R.unch, why: WHY.unch }),

  // pairs: stressed stem vs nosotros / vosotros
  pair('T51', 'independent', 'pensar', 'yo', 'pienso', EIE, [['penso', diph('pienso', 'e → ie')]], 'nosotros', 'pensamos', [['piensamos', noChange('pensamos')]]),
  pair('T52', 'delayed', 'empezar', 'tú', 'empiezas', EIE, [['empezas', diph('empiezas', 'e → ie')]], 'vosotros', 'empezáis', [['empiezáis', noChange('empezáis')], ['empezais', accent('empezáis')]]),
  pair('T53', 'independent', 'poder', 'yo', 'puedo', OUE, [['podo', diph('puedo', 'o → ue')]], 'nosotros', 'podemos', [['puedemos', noChange('podemos')]]),
  pair('T54', 'delayed', 'dormir', 'tú', 'duermes', OUE, [['dormes', diph('duermes', 'o → ue')]], 'vosotros', 'dormís', [['duermís', noChange('dormís')], ['dormis', accent('dormís')]]),
  pair('T55', 'independent', 'jugar', 'yo', 'juego', JUG, [['jugo', diph('juego', 'u → ue')]], 'nosotros', 'jugamos', [['juegamos', noChange('jugamos')]]),
  pair('T56', 'delayed', 'jugar', 'tú', 'juegas', JUG, [['jugas', diph('juegas', 'u → ue')]], 'vosotros', 'jugáis', [['juegáis', noChange('jugáis')], ['jugais', accent('jugáis')]]),
  pair('T57', 'independent', 'pedir', 'yo', 'pido', EI, [['pedo', diph('pido', 'e → i')]], 'nosotros', 'pedimos', [['pidimos', noChange('pedimos')]]),
  pair('T58', 'delayed', 'repetir', 'tú', 'repites', EI, [['repetes', diph('repites', 'e → i')]], 'vosotros', 'repetís', [['repitís', noChange('repetís')], ['repetis', accent('repetís')]]),
];

const PARADIGM_ROWS = (a, b, c) => [
  ['yo', a[0], b[0], c[0]],
  ['tú', a[1], b[1], c[1]],
  ['él / ella / usted', a[2], b[2], c[2]],
  ['nosotros / nosotras', a[3], b[3], c[3]],
  ['vosotros / vosotras', a[4], b[4], c[4]],
  ['ellos / ellas / ustedes', a[5], b[5], c[5]],
];
const T_EIE = TABLE_ES(['persona', 'pensar', 'entender', 'preferir'], PARADIGM_ROWS(
  ['pienso', 'piensas', 'piensa', 'pensamos', 'pensáis', 'piensan'],
  ['entiendo', 'entiendes', 'entiende', 'entendemos', 'entendéis', 'entienden'],
  ['prefiero', 'prefieres', 'prefiere', 'preferimos', 'preferís', 'prefieren'],
));
const T_OUE = TABLE_ES(['persona', 'poder', 'volver', 'dormir'], PARADIGM_ROWS(
  ['puedo', 'puedes', 'puede', 'podemos', 'podéis', 'pueden'],
  ['vuelvo', 'vuelves', 'vuelve', 'volvemos', 'volvéis', 'vuelven'],
  ['duermo', 'duermes', 'duerme', 'dormimos', 'dormís', 'duermen'],
));
const T_EI = TABLE_ES(['persona', 'pedir', 'repetir', 'servir'], PARADIGM_ROWS(
  ['pido', 'pides', 'pide', 'pedimos', 'pedís', 'piden'],
  ['repito', 'repites', 'repite', 'repetimos', 'repetís', 'repiten'],
  ['sirvo', 'sirves', 'sirve', 'servimos', 'servís', 'sirven'],
));
const T_JUG = TABLE_ES(['persona', 'jugar'], [
  ['yo', 'juego'], ['tú', 'juegas'], ['él / ella / usted', 'juega'], ['nosotros / nosotras', 'jugamos'], ['vosotros / vosotras', 'jugáis'], ['ellos / ellas / ustedes', 'juegan'],
]);

const s = (id, kind, title, required, opts = {}) => step(id, kind, title, required, { ...opts, lessonId: L });

export const lesson = mkLesson({
  id: L,
  titleUk: 'Теперішній час: чергування голосних в основі',
  termEs: 'presente: verbos con cambio vocálico',
  summaryUk:
    'Відмінюємо дієслова, у яких наголошена голосна основи змінюється: e → ie (pienso), o → ue (puedo), u → ue (juego), e → i (pido). Бачимо, чому форми nosotros і vosotros лишаються без змін.',
  objectives: ['A2-01-O1'],
  situations: ['routine-study-leisure', 'food-shopping', 'personal-messages'],
  estimatedMinutes: 20,
  introduces: ['present.stem-e-ie', 'present.stem-o-ue', 'present.jugar', 'present.stem-e-i', 'present.stem-unchanged-1p-2p'],
  revisits: ['present.regular-ar', 'present.regular-er', 'present.regular-ir', 'present.querer', 'present.preferir', 'price.ask-answer', 'article.contraction-al'],
  steps: [
    s('s1', 'explanation', 'Наголос змінює основу: e → ie', true, {
      blocks: [
        UK('У деяких дієсловах голосна основи змінюється, коли на неї падає наголос. Закінчення лишаються такими самими, як у правильних дієсловах на -ar, -er та -ir.'),
        UK('Наголос падає на основу у формах yo, tú, él / ella / usted та ellos / ellas / ustedes. У формах nosotros і vosotros наголос падає на закінчення, тому там основа не змінюється.'),
        T_EIE,
        UK('Так само змінюються empezar (empiezo), cerrar (cierro) і querer (quiero). Querer і preferir ви вже знаєте: тепер видно, що вони належать до однієї групи.'),
        EX('La película empieza a las diez.', 'Фільм починається о десятій.'),
        EX('¿Cierras la ventana, por favor?', 'Зачиниш вікно, будь ласка?'),
      ],
    }),
    s('s2', 'supported-practice', 'Крок 1. e → ie за зразком', true, { tasks: ['T01', 'T02'] }),
    s('s3', 'explanation', 'o → ue і особливе дієслово jugar', true, {
      blocks: [
        UK('Друга група: наголошене o змінюється на ue. Так відмінюються poder, volver, dormir, encontrar, recordar, а також costar — про ціни вживаємо лише cuesta і cuestan.'),
        T_OUE,
        UK('Jugar — особливе дієслово: у ньому під наголосом u змінюється на ue. Гру чи вид спорту приєднуємо через a + артикль: juego al fútbol (a + el = al).'),
        T_JUG,
        EX('Hoy no puedo, lo siento.', 'Сьогодні я не можу, вибач.'),
        EX('¿A qué hora vuelves a casa?', 'О котрій ти повертаєшся додому?'),
        EX('Los domingos juego al fútbol con mis amigos.', 'По неділях я граю у футбол із друзями.'),
      ],
    }),
    s('s4', 'supported-practice', 'Крок 2. o → ue і jugar за зразком', true, { tasks: ['T11', 'T12', 'T21', 'T22'] }),
    s('s5', 'explanation', 'e → i: лише дієслова на -ir', true, {
      blocks: [
        UK('Третя група — лише дієслова на -ir: наголошене e змінюється на i. Так відмінюються pedir, repetir і servir.'),
        T_EI,
        UK('Pedir означає «просити, замовляти»: pido un café. «Запитувати» — це інше дієслово.'),
        EX('¿Qué pides?', 'Що ти замовляєш?'),
        EX('El camarero sirve el café.', 'Офіціант подає каву.'),
      ],
    }),
    s('s6', 'supported-practice', 'Крок 3. e → i за зразком', true, { tasks: ['T31', 'T32'] }),
    s('s7', 'explanation', 'nosotros і vosotros — без змін', true, {
      blocks: [
        UK('У формах nosotros і vosotros наголос падає на закінчення, тому основа така сама, як в інфінітиві: podemos, podéis, pedimos, pedís, jugamos, jugáis. Форми *puedemos чи *pidimos — помилкові.'),
        UK('Vosotros — звичайна форма множини 2-ї особи в Іспанії. Ustedes (ввічливо) має форму 3-ї особи множини, тобто з чергуванням: pueden, piden.'),
        EX('¿Jugáis al fútbol los sábados?', 'Ви граєте у футбол по суботах?'),
        EX('Normalmente volvemos a casa a las siete.', 'Зазвичай ми повертаємося додому о сьомій.'),
      ],
    }),
    s('s8', 'supported-practice', 'Крок 4. nosotros і vosotros за зразком', true, { tasks: ['T41', 'T42'] }),
    s('s9', 'independent-practice', 'Самостійно: усі групи разом', true, { tasks: ['T03', 'T13', 'T23', 'T33', 'T51'] }),
    s('s10', 'independent-practice', 'Додаткова практика', false, { tasks: ['T04', 'T05', 'T14', 'T15', 'T24', 'T25', 'T34', 'T35', 'T53', 'T55', 'T57'] }),
    s('s11', 'summary', 'Підсумок', true, {
      blocks: [
        LIST_UK([
          'e → ie: pensar, empezar, cerrar, entender, querer, preferir — pienso, empieza, cierran.',
          'o → ue: poder, volver, dormir, encontrar, recordar, costar — puedo, vuelves, duerme, cuestan.',
          'u → ue: лише jugar — juego, juegas, juega, juegan; jugar al fútbol.',
          'e → i (лише дієслова на -ir): pedir, repetir, servir — pido, repites, sirve.',
          'nosotros і vosotros — без змін: pensamos, podéis, jugamos, pedís.',
        ]),
        LINK('Потренувати форми з чергуванням', [EIE, OUE, JUG, EI, UNCH], 'written', 10),
      ],
    }),
  ],
});

export const materials = [
  material({
    id: 'material.a2-01.stem-changes',
    topicId: L,
    titleUk: 'Таблиця: дієслова з чергуванням у теперішньому часі',
    blocks: [
      UK('Чергування відбувається лише під наголосом: у формах yo, tú, él / ella / usted та ellos / ellas / ustedes. Форми nosotros і vosotros не змінюються.'),
      T_EIE,
      T_OUE,
      T_EI,
      T_JUG,
      UK('Інші дієслова цих груп: empezar, cerrar, querer (e → ie); encontrar, recordar, costar (o → ue).'),
      LINK('Практика: форми з чергуванням', [EIE, OUE, JUG, EI, UNCH], 'written', 10),
    ],
    linkedTargets: [EIE, OUE, JUG, EI, UNCH],
  }),
];
