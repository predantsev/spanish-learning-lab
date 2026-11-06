// A2-03-L2 — regular participles -ado / -ido (A2-03-O2) and the gerund/participle boundary.
// Only regular participles of verbs taught in A1/A2-01 are assessed; hecho/escrito/visto… (L3) and
// leído/oído… (L4) are mentioned as exceptions but never used as answers here.
import { choice, es, esTable, ex, exact, lesson, step, uk, ukList } from './lib.mjs';

const L = 'A2-03-L2';
const AR = ['participle.regular-ar', 'written-form'];
const ERIR = ['participle.regular-er-ir', 'written-form'];
const GP_W = ['contrast.gerund-participle', 'written-form'];
const GP_C = ['contrast.gerund-participle', 'context-choice'];

const AR_RULE = 'Дієслова на -ar: відкидаємо -ar і додаємо -ado: hablar → hablado, jugar → jugado, estar → estado. Після haber дієприкметник завжди закінчується на -o.';
const ERIR_RULE = 'Дієслова на -er та -ir: відкидаємо -er / -ir і додаємо -ido: comer → comido, vivir → vivido, ser → sido, ir → ido. Після haber дієприкметник завжди закінчується на -o.';
const GP_RULE = 'Estar + герундій (-ando, -iendo) — дія відбувається зараз: Estoy comiendo. Haber + дієприкметник (-ado, -ido) — дія вже відбулася: He comido.';
const INSTR = 'Впишіть дієприкметник дієслова в дужках.';
const GP_INSTR = 'Впишіть герундій або дієприкметник дієслова в дужках. Подивіться на допоміжне дієслово: estar чи haber.';

const GERUND = (g, p) => `${g} — герундій, він іде після estar. Після haber потрібен дієприкметник: ${p}.`;
const AGREE = (p) => `Після haber дієприкметник не змінюється і завжди закінчується на -o: ${p}.`;
const WRONG_END = (verbType, p) => `${verbType}: ${p}.`;

function gap(id, role, family, target, rule, sentence, answer, errors, full, fullUk, extra = {}) {
  const prompt = [uk(extra.instr ?? (extra.model ? `${INSTR} Зразок нижче.` : INSTR))];
  if (extra.model) prompt.push(ex(...extra.model));
  prompt.push(es(sentence));
  return exact({
    id, lesson: L, role, family, target, prompt, answers: [answer], closed: true, errors,
    rule, clue: extra.clue, glosses: extra.glosses, full, fullUk,
    ok: extra.ok ?? `Правильно: ${answer}.`,
    bad: extra.bad ?? `Правильна форма — ${answer}: ${full}`,
  });
}

function pick(id, role, family, target, rule, sentence, options, full, fullUk, extra = {}) {
  const answer = options.find((o) => o[1] === true)[0];
  return choice({
    id, lesson: L, role, family, target,
    prompt: [uk(extra.instr ?? 'Оберіть правильний варіант.'), es(sentence)],
    options, rule, clue: extra.clue, glosses: extra.glosses, full, fullUk,
    ok: extra.ok ?? `Правильно: ${answer}.`,
    bad: extra.bad ?? `Правильний варіант — ${answer}: ${full}`,
  });
}

const tasks = [
  // ---------- participle.regular-ar ----------
  gap('T01', 'supported', 'home', AR, AR_RULE, 'Hoy Ana ha ___ (cocinar) en casa.', 'cocinado',
    [['cocinando', GERUND('Cocinando', 'cocinado')], ['cocinada', AGREE('cocinado')], ['cocinido', WRONG_END('Cocinar — дієслово на -ar, тому -ado', 'cocinado')]],
    'Hoy Ana ha cocinado en casa.', 'Сьогодні Ана готувала вдома.',
    { model: ['Hoy he trabajado en casa. (trabajar)', 'Сьогодні я працював(-ла) вдома.'], clue: 'Cocinar закінчується на -ar.' }),
  gap('T02', 'supported', 'work-study', AR, AR_RULE, 'Hoy los estudiantes han ___ (escuchar) al profesor.', 'escuchado',
    [['escuchando', GERUND('Escuchando', 'escuchado')], ['escuchados', AGREE('escuchado')], ['escuchido', WRONG_END('Escuchar — дієслово на -ar, тому -ado', 'escuchado')]],
    'Hoy los estudiantes han escuchado al profesor.', 'Сьогодні студенти слухали викладача.',
    { model: ['Hoy he estudiado mucho. (estudiar)', 'Сьогодні я багато вчився(-лася).'], clue: 'Escuchar закінчується на -ar.' }),
  gap('T03', 'independent', 'home', AR, AR_RULE, 'Hoy (yo) he ___ (desayunar) con mi familia.', 'desayunado',
    [['desayunando', GERUND('Desayunando', 'desayunado')], ['desayunido', WRONG_END('Desayunar — дієслово на -ar, тому -ado', 'desayunado')]],
    'Hoy he desayunado con mi familia.', 'Сьогодні я снідав(-ла) з родиною.'),
  gap('T04', 'independent', 'work-study', AR, AR_RULE, '¿Has ___ (terminar) el trabajo?', 'terminado',
    [['terminando', GERUND('Terminando', 'terminado')], ['terminido', WRONG_END('Terminar — дієслово на -ar, тому -ado', 'terminado')]],
    '¿Has terminado el trabajo?', 'Ти закінчив(-ла) роботу?',
    { glosses: ['terminar — закінчувати.'] }),
  gap('T05', 'independent', 'home', AR, AR_RULE, 'Hoy mis hermanos han ___ (jugar) en el parque.', 'jugado',
    [['juegado', 'Дієприкметник утворюємо від інфінітива: jug- + -ado = jugado, без -ue- з теперішнього часу.'], ['jugando', GERUND('Jugando', 'jugado')], ['jugados', AGREE('jugado')]],
    'Hoy mis hermanos han jugado en el parque.', 'Сьогодні мої брати гралися в парку.'),
  pick('T06', 'independent', 'work-study', AR, AR_RULE, 'Hoy el tren ha ___ (llegar) tarde.',
    [['llegado', true], ['llegando', false, GERUND('Llegando', 'llegado')], ['llegada', false, AGREE('llegado')], ['llegido', false, 'Llegar — дієслово на -ar, тому -ado: llegado.']],
    'Hoy el tren ha llegado tarde.', 'Сьогодні потяг прибув із запізненням.'),
  gap('T07', 'delayed', 'home', AR, AR_RULE, 'Hoy (nosotros) hemos ___ (cenar) en casa de Ana.', 'cenado',
    [['cenando', GERUND('Cenando', 'cenado')], ['cenido', WRONG_END('Cenar — дієслово на -ar, тому -ado', 'cenado')]],
    'Hoy hemos cenado en casa de Ana.', 'Сьогодні ми вечеряли в Ани вдома.'),
  gap('T08', 'delayed', 'work-study', AR, AR_RULE, 'Hoy Marta ha ___ (estar) en la universidad.', 'estado',
    [['estando', GERUND('Estando', 'estado')], ['estada', AGREE('estado')], ['estido', WRONG_END('Estar — дієслово на -ar, тому -ado', 'estado')]],
    'Hoy Marta ha estado en la universidad.', 'Сьогодні Марта була в університеті.'),
  gap('T09', 'transfer', 'messages', AR, AR_RULE, 'Hola, mamá: hoy he ___ (comprar) pan y leche.', 'comprado',
    [['comprando', GERUND('Comprando', 'comprado')], ['comprido', WRONG_END('Comprar — дієслово на -ar, тому -ado', 'comprado')]],
    'Hola, mamá: hoy he comprado pan y leche.', 'Привіт, мамо! Сьогодні я купив(-ла) хліб і молоко.',
    { instr: `Повідомлення мамі. ${INSTR}`, glosses: ['mamá — мама (розмовне слово і звертання).'] }),
  pick('T10', 'transfer', 'messages', AR, AR_RULE, 'Hola, Ana: ¿has ___ (hablar) hoy con Luis?',
    [['hablado', true], ['hablando', false, GERUND('Hablando', 'hablado')], ['hablada', false, AGREE('hablado')], ['hablido', false, 'Hablar — дієслово на -ar, тому -ado: hablado.']],
    'Hola, Ana: ¿has hablado hoy con Luis?', 'Привіт, Ано! Ти сьогодні говорила з Луїсом?',
    { instr: 'Повідомлення подрузі. Оберіть правильний варіант.' }),

  // ---------- participle.regular-er-ir ----------
  gap('T11', 'supported', 'home', ERIR, ERIR_RULE, 'Hoy los niños han ___ (beber) mucha agua.', 'bebido',
    [['bebiendo', GERUND('Bebiendo', 'bebido')], ['bebado', WRONG_END('Beber — дієслово на -er, тому -ido', 'bebido')], ['bebida', `${AGREE('bebido')} (Bebida — іменник «напій».)`]],
    'Hoy los niños han bebido mucha agua.', 'Сьогодні діти випили багато води.',
    { model: ['Hoy he comido en casa. (comer)', 'Сьогодні я обідав(-ла) вдома.'], clue: 'Beber закінчується на -er.' }),
  gap('T12', 'supported', 'work-study', ERIR, ERIR_RULE, 'Hoy Pablo ha ___ (salir) muy tarde de la oficina.', 'salido',
    [['saliendo', GERUND('Saliendo', 'salido')], ['salado', 'Salir — дієслово на -ir, тому -ido: salido. (Salado означає «солоний».)'], ['salida', `${AGREE('salido')} (Salida — іменник «вихід».)`]],
    'Hoy Pablo ha salido muy tarde de la oficina.', 'Сьогодні Пабло вийшов з офісу дуже пізно.',
    { model: ['Hoy he aprendido mucho. (aprender)', 'Сьогодні я багато чого навчився(-лася).'], clue: 'Salir закінчується на -ir.' }),
  gap('T13', 'independent', 'home', ERIR, ERIR_RULE, 'Hoy (yo) he ___ (recibir) un regalo de mi hermana.', 'recibido',
    [['recibiendo', GERUND('Recibiendo', 'recibido')], ['recibado', WRONG_END('Recibir — дієслово на -ir, тому -ido', 'recibido')]],
    'Hoy he recibido un regalo de mi hermana.', 'Сьогодні я отримав(-ла) подарунок від сестри.'),
  gap('T14', 'independent', 'work-study', ERIR, ERIR_RULE, '¿Has ___ (entender) el problema?', 'entendido',
    [['entiendido', 'Дієприкметник утворюємо від інфінітива: entend- + -ido = entendido, без -ie- з теперішнього часу.'], ['entendiendo', GERUND('Entendiendo', 'entendido')], ['entendado', WRONG_END('Entender — дієслово на -er, тому -ido', 'entendido')]],
    '¿Has entendido el problema?', 'Ти зрозумів(-ла) проблему?'),
  gap('T15', 'independent', 'home', ERIR, ERIR_RULE, 'Hoy Luis y Ana han ___ (venir) a cenar.', 'venido',
    [['viniendo', GERUND('Viniendo', 'venido')], ['vinido', 'Дієприкметник утворюємо від інфінітива: ven- + -ido = venido.'], ['venado', WRONG_END('Venir — дієслово на -ir, тому -ido', 'venido')]],
    'Hoy Luis y Ana han venido a cenar.', 'Сьогодні Луїс і Ана прийшли на вечерю.'),
  pick('T16', 'independent', 'work-study', ERIR, ERIR_RULE, 'Hoy (yo) he ___ (tener) mucho trabajo.',
    [['tenido', true], ['teniendo', false, GERUND('Teniendo', 'tenido')], ['tenado', false, 'Tener — дієслово на -er, тому -ido: tenido.'], ['tenida', false, AGREE('tenido')]],
    'Hoy he tenido mucho trabajo.', 'Сьогодні в мене було багато роботи.'),
  gap('T17', 'delayed', 'home', ERIR, ERIR_RULE, 'Hoy (nosotros) hemos ___ (dormir) muy bien.', 'dormido',
    [['durmiendo', GERUND('Durmiendo', 'dormido')], ['duermido', 'Дієприкметник утворюємо від інфінітива: dorm- + -ido = dormido, без -ue-.']],
    'Hoy hemos dormido muy bien.', 'Сьогодні ми дуже добре спали.'),
  gap('T18', 'delayed', 'work-study', ERIR, ERIR_RULE, 'Hoy ha ___ (ser) un día muy bonito.', 'sido',
    [['siendo', GERUND('Siendo', 'sido')], ['serido', 'Від ser дієприкметник — sido: s- + -ido.']],
    'Hoy ha sido un día muy bonito.', 'Сьогодні був дуже гарний день.'),
  pick('T19', 'transfer', 'messages', ERIR, ERIR_RULE, 'Hola, Marta: ¿has ___ (ir) hoy al médico?',
    [['ido', true], ['yendo', false, GERUND('Yendo', 'ido')], ['ído', false, 'Ido пишемо без знака наголосу.']],
    'Hola, Marta: ¿has ido hoy al médico?', 'Привіт, Марто! Ти сьогодні ходила до лікаря?',
    { instr: 'Повідомлення подрузі. Оберіть правильний варіант.' }),
  gap('T20', 'transfer', 'messages', ERIR, ERIR_RULE, 'Hola, Pedro: hoy Ana y yo hemos ___ (aprender) mucho en clase.', 'aprendido',
    [['aprendiendo', GERUND('Aprendiendo', 'aprendido')], ['aprendado', WRONG_END('Aprender — дієслово на -er, тому -ido', 'aprendido')]],
    'Hola, Pedro: hoy Ana y yo hemos aprendido mucho en clase.', 'Привіт, Педро! Сьогодні ми з Аною багато чого навчилися на занятті.',
    { instr: `Повідомлення другові. ${INSTR}` }),

  // ---------- contrast.gerund-participle: written ----------
  gap('T21', 'supported', 'home', GP_W, GP_RULE, 'Ahora Ana está ___ (cocinar).', 'cocinando',
    [['cocinado', 'Перед пропуском — está (estar): дія відбувається зараз, потрібен герундій cocinando.']],
    'Ahora Ana está cocinando.', 'Зараз Ана готує.',
    { instr: `${GP_INSTR} Зразки нижче.`, model: ['Ahora estoy comiendo. — Hoy he comido en casa.', 'Зараз я їм. — Сьогодні я обідав(-ла) вдома.'], clue: 'Перед пропуском — está.' }),
  gap('T22', 'supported', 'work-study', GP_W, GP_RULE, 'Hoy Pablo ha ___ (trabajar) en casa.', 'trabajado',
    [['trabajando', 'Перед пропуском — ha (haber): потрібен дієприкметник trabajado.']],
    'Hoy Pablo ha trabajado en casa.', 'Сьогодні Пабло працював удома.',
    { instr: `${GP_INSTR} Зразки нижче.`, model: ['Ahora estoy comiendo. — Hoy he comido en casa.', 'Зараз я їм. — Сьогодні я обідав(-ла) вдома.'], clue: 'Перед пропуском — ha.' }),
  gap('T23', 'independent', 'home', GP_W, GP_RULE, 'Ahora mis padres están ___ (cenar).', 'cenando',
    [['cenado', 'Перед пропуском — están (estar): потрібен герундій cenando.']],
    'Ahora mis padres están cenando.', 'Зараз мої батьки вечеряють.', { instr: GP_INSTR }),
  gap('T24', 'independent', 'work-study', GP_W, GP_RULE, '¿Has ___ (aprender) mucho hoy?', 'aprendido',
    [['aprendiendo', 'Перед пропуском — has (haber): потрібен дієприкметник aprendido.']],
    '¿Has aprendido mucho hoy?', 'Ти багато чого навчився(-лася) сьогодні?', { instr: GP_INSTR }),
  gap('T25', 'delayed', 'home', GP_W, GP_RULE, 'Hoy los niños han ___ (dormir) poco.', 'dormido',
    [['durmiendo', 'Перед пропуском — han (haber): потрібен дієприкметник dormido.']],
    'Hoy los niños han dormido poco.', 'Сьогодні діти мало спали.', { instr: GP_INSTR }),
  gap('T26', 'transfer', 'leisure', GP_W, GP_RULE, 'Ahora estamos ___ (escuchar) música.', 'escuchando',
    [['escuchado', 'Перед пропуском — estamos (estar): потрібен герундій escuchando.']],
    'Ahora estamos escuchando música.', 'Зараз ми слухаємо музику.', { instr: GP_INSTR }),

  // ---------- contrast.gerund-participle: choice in context ----------
  pick('T27', 'independent', 'home', GP_C, GP_RULE, 'Ahora Luis está ___ en la cocina.',
    [['comiendo', true], ['comido', false, 'Comido — дієприкметник, він іде після haber. Після está — герундій: está comiendo.']],
    'Ahora Luis está comiendo en la cocina.', 'Зараз Луїс їсть на кухні.'),
  pick('T28', 'independent', 'work-study', GP_C, GP_RULE, 'Hoy hemos ___ mucho en clase.',
    [['hablado', true], ['hablando', false, 'Hablando — герундій, він іде після estar. Після hemos — дієприкметник: hemos hablado.']],
    'Hoy hemos hablado mucho en clase.', 'Сьогодні ми багато розмовляли на занятті.'),
  pick('T29', 'delayed', 'work-study', GP_C, GP_RULE, 'Ahora mi hermano está ___ en su habitación.',
    [['estudiando', true], ['estudiado', false, 'Estudiado — дієприкметник, він іде після haber. Після está — герундій: está estudiando.']],
    'Ahora mi hermano está estudiando en su habitación.', 'Зараз мій брат навчається у своїй кімнаті.'),
  pick('T30', 'transfer', 'leisure', GP_C, GP_RULE, 'Hoy hemos ___ en la playa.',
    [['nadado', true], ['nadando', false, 'Nadando — герундій, він іде після estar. Після hemos — дієприкметник: hemos nadado.']],
    'Hoy hemos nadado en la playa.', 'Сьогодні ми плавали на пляжі.'),
];

const ids = (...n) => n.map((x) => `${L}-T${String(x).padStart(2, '0')}`);

export default {
  lesson: lesson({
    id: L,
    titleUk: 'Правильні дієприкметники на -ado та -ido',
    termEs: 'participio regular',
    summaryUk:
      'Як утворити дієприкметник від дієслів на -ar (-ado) та на -er / -ir (-ido) і поставити його після haber. Чим дієприкметник (he comido) відрізняється від герундія (estoy comiendo).',
    objectives: ['A2-03-O2'],
    situations: ['routine-study-leisure', 'people-family-home'],
    estimatedMinutes: 16,
    introduces: ['participle.regular-ar', 'participle.regular-er-ir', 'contrast.gerund-participle'],
    revisits: ['perfecto.haber-forms', 'present.regular-ar', 'present.regular-er', 'present.regular-ir', 'progressive.estar-gerund', 'progressive.gerund-regular-ar', 'progressive.gerund-regular-er-ir'],
    steps: [
      step('s1', 'explanation', 'Дієслова на -ar → -ado', true, {
        blocks: [
          uk('Дієприкметник дієслова на -ar утворюємо так: відкидаємо -ar і додаємо -ado.'),
          esTable(['infinitivo', 'participio'], [
            ['hablar', 'hablado'], ['trabajar', 'trabajado'], ['comprar', 'comprado'], ['terminar', 'terminado'], ['estar', 'estado'], ['jugar', 'jugado'],
          ]),
          uk('Estar → estado і jugar → jugado теж утворюються за правилом, хоча в теперішньому часі ці дієслова мають особливі форми (estoy, juego). Нове дієслово: terminar — «закінчувати».'),
        ],
      }),
      step('s2', 'explanation', 'Дієслова на -er та -ir → -ido', true, {
        blocks: [
          uk('Дієприкметник дієслова на -er або -ir утворюємо так: відкидаємо -er / -ir і додаємо -ido.'),
          esTable(['infinitivo', 'participio'], [
            ['comer', 'comido'], ['beber', 'bebido'], ['aprender', 'aprendido'], ['tener', 'tenido'], ['vivir', 'vivido'], ['salir', 'salido'], ['venir', 'venido'], ['ser', 'sido'], ['ir', 'ido'],
          ]),
          uk('Основу беремо з інфінітива, а не з теперішнього часу: dormir → dormido (не *duermido), venir → venido.'),
          uk('Увага: не всі дієслова на -er / -ir так утворюють дієприкметник. Hacer → hecho, escribir → escrito, ver → visto — особливі форми, їх вивчаємо в уроці 3. У leído, oído над i ставимо знак наголосу — це урок 4.'),
          uk('Після haber дієприкметник не змінюється і завжди закінчується на -o: Ana ha comido, mis padres han comido.'),
        ],
      }),
      step('s3', 'explanation', 'Дієприкметник чи герундій', true, {
        blocks: [
          uk('Не плутайте дієприкметник із герундієм, який ви вже знаєте з estar. Estar + герундій (-ando, -iendo) — дія відбувається зараз. Haber + дієприкметник (-ado, -ido) — дія вже відбулася.'),
          ex('Ahora estoy comiendo.', 'Зараз я їм.'),
          ex('Hoy he comido en casa.', 'Сьогодні я обідав(-ла) вдома.'),
          esTable(['infinitivo', 'gerundio', 'participio'], [
            ['hablar', 'hablando', 'hablado'], ['comer', 'comiendo', 'comido'], ['vivir', 'viviendo', 'vivido'],
          ]),
        ],
      }),
      step('s4', 'examples', 'Приклади', true, {
        blocks: [
          ex('Hoy he hablado con mi madre.', 'Сьогодні я говорив(-ла) з мамою.'),
          ex('¿Has terminado el trabajo?', 'Ти закінчив(-ла) роботу?'),
          ex('Hoy los niños han jugado en el parque.', 'Сьогодні діти гралися в парку.'),
          ex('Hoy Ana ha salido temprano de casa.', 'Сьогодні Ана рано вийшла з дому.'),
          ex('Hoy he tenido mucho trabajo.', 'Сьогодні в мене було багато роботи.'),
          ex('Hoy ha sido un día interesante.', 'Сьогодні був цікавий день.'),
          ex('Hoy hemos ido al cine.', 'Сьогодні ми ходили в кіно.'),
        ],
      }),
      step('s5', 'supported-practice', 'Практика зі зразком', true, { taskIds: ids(1, 2, 11, 12, 21, 22) }),
      step('s6', 'independent-practice', 'Самостійна практика', true, { taskIds: ids(3, 4, 5, 6, 13, 14, 15, 16, 23, 24, 27, 28) }),
      step('s7', 'summary', 'Підсумок', true, {
        blocks: [
          ukList([
            '-ar → -ado: hablar → hablado, estar → estado.',
            '-er / -ir → -ido: comer → comido, vivir → vivido, ser → sido, ir → ido.',
            'Основа — з інфінітива: dormir → dormido, jugar → jugado.',
            'Після haber дієприкметник завжди на -o: Ana ha comido.',
            'Estoy comiendo (зараз) ≠ he comido (уже відбулося).',
          ]),
        ],
      }),
    ],
  }),
  tasks,
};
