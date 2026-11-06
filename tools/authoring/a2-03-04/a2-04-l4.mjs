// A2-04-L4 — person-specific vowel changes in selected -ir verbs (pidió, durmió), the boundary
// that -ar/-er stem-changing verbs do not change in the past (pensó, volvió), and the y forms of
// leer/creer/oír/caer (A2-04-O4/O5). Each pattern is its own skill and its own small step; each task
// targets exactly one of them. Person-restriction items (pedí, dormí, dormimos) belong to the
// pattern they restrict.
import { choice, es, esTable, ex, exact, lesson, step, uk, ukList } from './lib.mjs';

const L = 'A2-04-L4';
const INSTR = 'Впишіть дієслово в дужках у простому минулому часі (pretérito indefinido).';
const num = (n) => `T${String(n).padStart(2, '0')}`;
const capFirst = (s) => s.replace(/^([¿¡]?)(\p{Ll})/u, (_m, a, b) => a + b.toUpperCase());
const fillRaw = (sentence, form) => {
  if (/___ \([^)]*\)/.test(sentence)) return sentence.replace(/___ \([^)]*\)/, form);
  if (/\([^)]*\) ___/.test(sentence)) return sentence.replace(/\([^)]*\) ___/, form);
  return sentence.replace('___', form);
};

const BANKS = [
  {
    skill: 'indefinido.stem-e-i',
    rule: 'Деякі дієслова на -ir із чергуванням у теперішньому часі (pedir — pido, servir — sirvo, repetir — repito, preferir — prefiero) у простому минулому мають i замість e лише в 3-й особі однини й множини: pidió, pidieron, sirvió, prefirieron. Інші особи без змін: pedí, pediste, pedimos, pedisteis.',
    table: esTable(['sujeto', 'pedir'], [['yo', 'pedí'], ['tú', 'pediste'], ['él / ella / usted', 'pidió'], ['nosotros / nosotras', 'pedimos'], ['vosotros / vosotras', 'pedisteis'], ['ellos / ellas / ustedes', 'pidieron']]),
    rows: [
      [1, 'supported', 'restaurant', 'Ayer Ana (pedir) ___ un café con leche.', 'pidió', 'Учора Ана замовила каву з молоком.', [['pedió', 'У 3-й особі e змінюється на i: pidió.'], ['pidio', 'Майже: потрібен знак наголосу — pidió.'], ['pide', 'Pide — теперішній час. Ayer — «учора»: pidió.']]],
      [2, 'supported', 'restaurant', 'Anoche los niños (pedir) ___ pescado.', 'pidieron', 'Учора ввечері діти замовили рибу.', [['pedieron', 'У 3-й особі множини e змінюється на i: pidieron.'], ['piden', 'Piden — теперішній час. Anoche — «учора ввечері»: pidieron.']]],
      [3, 'independent', 'restaurant', 'En el restaurante el camarero (servir) ___ la comida a las dos.', 'sirvió', 'У ресторані офіціант подав обід о другій.', [['servió', 'У 3-й особі e змінюється на i: sirvió.'], ['sirve', 'Sirve — теперішній час. Ідеться про минуле: sirvió.']]],
      [4, 'independent', 'restaurant', 'Anoche (yo, pedir) ___ pescado en el restaurante.', 'pedí', 'Учора ввечері я замовив(-ла) в ресторані рибу.', [['pidí', 'У формі yo чергування немає: pedí. E → i лише в 3-й особі.'], ['pedi', 'Майже: потрібен знак наголосу — pedí.']]],
      [5, 'independent', 'home', 'El sábado mis padres (preferir) ___ cenar en casa.', 'prefirieron', 'У суботу мої батьки воліли повечеряти вдома.', [['preferieron', 'У 3-й особі множини e змінюється на i: prefirieron.'], ['prefierieron', 'У простому минулому -ie- немає: prefirieron.'], ['prefieren', 'Prefieren — теперішній час. El sábado (минулої суботи) — prefirieron.']]],
      [6, 'independent', 'work-study', 'Ayer el profesor ___ (repetir) la fecha del examen dos veces.', 'repitió', 'Учора викладач двічі повторив дату іспиту.', null, ['repetió', 'repite', 'repetí']],
      [7, 'delayed', 'restaurant', '¿Qué (pedir) ___ tus amigos en el bar?', 'pidieron', 'Що твої друзі замовили в барі?', [['pedieron', 'У 3-й особі множини e змінюється на i: pidieron.'], ['piden', 'Piden — теперішній час. Ідеться про минуле: pidieron.']]],
      [8, 'delayed', 'work-study', 'Ayer los estudiantes (repetir) ___ el examen.', 'repitieron', 'Учора студенти перескладали іспит.', [['repetieron', 'У 3-й особі множини e змінюється на i: repitieron.'], ['repiten', 'Repiten — теперішній час. Ayer — «учора»: repitieron.']]],
      [9, 'transfer', 'messages', '¡Hola, Luis! Ayer Marta (preferir) ___ no salir.', 'prefirió', 'Привіт, Луїсе! Учора Марта воліла нікуди не йти.', [['preferió', 'У 3-й особі e змінюється на i: prefirió.'], ['prefiere', 'Prefiere — теперішній час. Ayer — «учора»: prefirió.']]],
      [10, 'transfer', 'travel', 'En el tren nos (servir) ___ un café.', 'sirvieron', 'У потязі нам подали каву.', [['servieron', 'У 3-й особі множини e змінюється на i: sirvieron.'], ['sirven', 'Sirven — теперішній час. Ідеться про минулу поїздку: sirvieron.']]],
    ],
    choiceFb: { 'repetió': 'У 3-й особі e змінюється на i: repitió.', 'repite': 'Repite — теперішній час. Ayer — «учора»: repitió.', 'repetí': 'Repetí — форма yo. El profesor — «він»: repitió.' },
  },
  {
    skill: 'indefinido.stem-o-u',
    rule: 'Dormir і morir у простому минулому змінюють o на u лише в 3-й особі однини й множини: durmió, durmieron; murió, murieron. Інші особи без змін: dormí, dormiste, dormimos, dormisteis.',
    table: esTable(['sujeto', 'dormir'], [['yo', 'dormí'], ['tú', 'dormiste'], ['él / ella / usted', 'durmió'], ['nosotros / nosotras', 'dormimos'], ['vosotros / vosotras', 'dormisteis'], ['ellos / ellas / ustedes', 'durmieron']]),
    rows: [
      [11, 'supported', 'home', 'Anoche el niño (dormir) ___ diez horas.', 'durmió', 'Учора вночі хлопчик спав десять годин.', [['dormió', 'У 3-й особі o змінюється на u: durmió.'], ['durmio', 'Майже: потрібен знак наголосу — durmió.'], ['duerme', 'Duerme — теперішній час. Anoche — «минулої ночі»: durmió.']]],
      [12, 'supported', 'travel', 'En el tren mis padres (dormir) ___ un poco.', 'durmieron', 'У потязі мої батьки трохи поспали.', [['dormieron', 'У 3-й особі множини o змінюється на u: durmieron.'], ['duermen', 'Duermen — теперішній час. Ідеться про минулу поїздку: durmieron.']]],
      [13, 'independent', 'home', 'Anoche (yo, dormir) ___ muy mal.', 'dormí', 'Минулої ночі я дуже погано спав(-ла).', [['durmí', 'У формі yo чергування немає: dormí. O → u лише в 3-й особі.'], ['dormi', 'Майже: потрібен знак наголосу — dormí.']]],
      [14, 'independent', 'garden', 'El verano pasado (morir) ___ muchas plantas del jardín.', 'murieron', 'Минулого літа в саду загинуло багато рослин.', [['morieron', 'У 3-й особі множини o змінюється на u: murieron.'], ['mueren', 'Mueren — теперішній час. El verano pasado — «минулого літа»: murieron.']]],
      [15, 'independent', 'travel', '¿(tú, dormir) ___ bien en el hotel?', 'dormiste', 'Ти добре спав(-ла) у готелі?', [['durmiste', 'У формі tú чергування немає: dormiste.'], ['dormistes', 'Для tú — dormiste, без -s у кінці.']]],
      [16, 'independent', 'home', 'Ayer mi hermana ___ (dormir) en casa de una amiga.', 'durmió', 'Учора моя сестра ночувала в подруги.', null, ['dormió', 'duermió', 'durmio']],
      [17, 'delayed', 'home', 'Anoche los niños (dormir) ___ muy bien.', 'durmieron', 'Минулої ночі діти дуже добре спали.', [['dormieron', 'У 3-й особі множини o змінюється на u: durmieron.'], ['duermen', 'Duermen — теперішній час. Anoche — «минулої ночі»: durmieron.']]],
      [18, 'delayed', 'garden', 'Con el frío (morir) ___ mi planta.', 'murió', 'Через холод загинула моя рослина.', [['morió', 'У 3-й особі o змінюється на u: murió.'], ['muere', 'Muere — теперішній час. Ідеться про минуле: murió.']]],
      [19, 'transfer', 'messages', '¡Hola, Ana! Anoche Pablo (dormir) ___ en mi casa.', 'durmió', 'Привіт, Ано! Учора Пабло ночував у мене.', [['dormió', 'У 3-й особі o змінюється на u: durmió.'], ['durmio', 'Майже: потрібен знак наголосу — durmió.']]],
      [20, 'transfer', 'leisure', 'El sábado (nosotros, dormir) ___ en la playa.', 'dormimos', 'У суботу ми ночували на пляжі.', [['durmimos', 'У формі nosotros чергування немає: dormimos.']]],
    ],
    choiceFb: { 'dormió': 'У 3-й особі o змінюється на u: durmió.', 'duermió': 'У простому минулому -ue- немає: durmió.', 'durmio': 'Майже: потрібен знак наголосу — durmió.' },
  },
  {
    skill: 'indefinido.stem-change-boundary',
    rule: 'Чергування e → ie та o → ue з теперішнього часу в простий минулий не переходить: pensó, volvió, entendió, encontró, cerró, costó, jugó, empezó. Змінюються лише деякі дієслова на -ir, і тільки в 3-й особі: pidió, durmió.',
    table: esTable(['infinitivo', 'presente', 'pretérito indefinido'], [['pensar', 'pienso', 'pensé, pensó'], ['volver', 'vuelvo', 'volví, volvió'], ['entender', 'entiendo', 'entendí, entendió'], ['jugar', 'juego', 'jugué, jugó']]),
    rows: [
      [21, 'supported', 'home', 'Ayer Ana (volver) ___ a casa muy tarde.', 'volvió', 'Учора Ана повернулася додому дуже пізно.', [['vuelvió', 'Чергування o → ue в простому минулому немає: volvió.'], ['volvio', 'Майже: потрібен знак наголосу — volvió.'], ['vuelve', 'Vuelve — теперішній час. Ayer — «учора»: volvió.']]],
      [22, 'supported', 'work-study', 'Ayer (yo, entender) ___ el problema.', 'entendí', 'Учора я зрозумів(-ла) проблему.', [['entiendí', 'Чергування e → ie в простому минулому немає: entendí.'], ['entendi', 'Майже: потрібен знак наголосу — entendí.']]],
      [23, 'independent', 'shopping', 'El billete de tren (costar) ___ veinte euros.', 'costó', 'Квиток на потяг коштував двадцять євро.', [['cuestó', 'Чергування o → ue в простому минулому немає: costó.'], ['cuesta', 'Cuesta — теперішній час. Ідеться про минулу покупку: costó.']]],
      [24, 'independent', 'home', 'Anoche mi padre (cerrar) ___ la puerta de la casa.', 'cerró', 'Учора ввечері мій тато зачинив двері будинку.', [['cierró', 'Чергування e → ie в простому минулому немає: cerró.'], ['cierra', 'Cierra — теперішній час. Anoche — «учора ввечері»: cerró.']]],
      [25, 'independent', 'leisure', 'El domingo mi hermano (jugar) ___ al fútbol.', 'jugó', 'У неділю мій брат грав у футбол.', [['juegó', 'Чергування u → ue в простому минулому немає: jugó.'], ['juega', 'Juega — теперішній час. Ідеться про минулу неділю: jugó.']]],
      [26, 'independent', 'work-study', 'Ayer la clase ___ (empezar) a las nueve.', 'empezó', 'Учора заняття почалося о дев’ятій.', null, ['empiezó', 'empieza', 'empecé']],
      [27, 'delayed', 'home', '¿(tú, encontrar) ___ las llaves?', 'encontraste', 'Ти знайшов(-ла) ключі?', [['encuentraste', 'Чергування o → ue в простому минулому немає: encontraste.'], ['encuentras', 'Encuentras — теперішній час. Питають про те, що вже сталося: encontraste.']]],
      [28, 'delayed', 'work-study', 'Ayer Luis (recordar) ___ tu cumpleaños.', 'recordó', 'Учора Луїс згадав про твій день народження.', [['recuerdó', 'Чергування o → ue в простому минулому немає: recordó.'], ['recuerda', 'Recuerda — теперішній час. Ayer — «учора»: recordó.']]],
      [29, 'transfer', 'messages', '¡Hola, Marta! ¿(tú, volver) ___ tarde anoche?', 'volviste', 'Привіт, Марто! Ти пізно повернулася вчора ввечері?', [['vuelviste', 'Чергування o → ue в простому минулому немає: volviste.'], ['vuelves', 'Vuelves — теперішній час. Anoche — «учора ввечері»: volviste.']]],
      [30, 'transfer', 'travel', 'El año pasado mis padres (volver) ___ a Ucrania.', 'volvieron', 'Минулого року мої батьки повернулися в Україну.', [['vuelvieron', 'Чергування o → ue в простому минулому немає: volvieron.'], ['vuelven', 'Vuelven — теперішній час. El año pasado — «минулого року»: volvieron.']]],
    ],
    choiceFb: { 'empiezó': 'Чергування e → ie в простому минулому немає: empezó.', 'empieza': 'Empieza — теперішній час. Ayer — «учора»: empezó.', 'empecé': 'Empecé — форма yo. La clase — «вона»: empezó.' },
  },
  {
    skill: 'indefinido.y-alternation',
    rule: 'Якщо основа закінчується на голосну (le-er, cre-er, o-ír, ca-er), у 3-й особі замість -ió, -ieron пишемо -yó, -yeron: leyó, leyeron, creyó, oyó, cayeron. В інших особах над i ставимо знак наголосу: leí, leíste, leímos, leísteis.',
    table: esTable(['sujeto', 'leer'], [['yo', 'leí'], ['tú', 'leíste'], ['él / ella / usted', 'leyó'], ['nosotros / nosotras', 'leímos'], ['vosotros / vosotras', 'leísteis'], ['ellos / ellas / ustedes', 'leyeron']]),
    rows: [
      [31, 'supported', 'home', 'Ayer mi padre (leer) ___ el periódico.', 'leyó', 'Учора мій тато читав газету.', [['leió', 'Між двома голосними пишемо y: leyó.'], ['leyo', 'Майже: потрібен знак наголосу — leyó.'], ['lee', 'Lee — теперішній час. Ayer — «учора»: leyó.']]],
      [32, 'supported', 'work-study', 'La semana pasada los estudiantes (leer) ___ un libro.', 'leyeron', 'Минулого тижня студенти прочитали книжку.', [['leieron', 'Між двома голосними пишемо y: leyeron.'], ['leen', 'Leen — теперішній час. La semana pasada — «минулого тижня»: leyeron.']]],
      [33, 'independent', 'home', 'Anoche (yo, leer) ___ tu mensaje.', 'leí', 'Учора ввечері я прочитав(-ла) твоє повідомлення.', [['lei', 'У формі yo над i пишемо знак наголосу: leí.'], ['leyí', 'У формі yo y немає: leí.']]],
      [34, 'independent', 'home', '¿(tú, oír) ___ el móvil?', 'oíste', 'Ти почув(-ла) мобільний?', [['oiste', 'Над i пишемо знак наголосу: oíste.'], ['oyiste', 'У формі tú y немає: oíste.']]],
      [35, 'independent', 'work-study', 'Nadie (creer) ___ a Pedro.', 'creyó', 'Ніхто не повірив Педро.', [['creió', 'Між двома голосними пишемо y: creyó.'], ['cree', 'Cree — теперішній час. Ідеться про минуле: creyó.']]],
      [36, 'independent', 'home', 'Ayer el niño se ___ en el parque.', 'cayó', 'Учора хлопчик упав у парку.', null, ['caió', 'cayo', 'cae']],
      [37, 'delayed', 'home', 'Ayer mis padres (oír) ___ la música de los vecinos.', 'oyeron', 'Учора мої батьки чули музику сусідів.', [['oieron', 'Між двома голосними пишемо y: oyeron.'], ['oyen', 'Oyen — теперішній час. Ayer — «учора»: oyeron.']]],
      [38, 'delayed', 'work-study', '¿(vosotros, leer) ___ el anuncio?', 'leísteis', 'Ви прочитали оголошення?', [['leisteis', 'Над i пишемо знак наголосу: leísteis.'], ['leyisteis', 'У формі vosotros y немає: leísteis.']]],
      [39, 'transfer', 'messages', '¡Hola, Ana! Ayer (nosotros, leer) ___ tu correo electrónico.', 'leímos', 'Привіт, Ано! Учора ми прочитали твій електронний лист.', [['leimos', 'Над i пишемо знак наголосу: leímos.'], ['leyimos', 'У формі nosotros y немає: leímos.']]],
      [40, 'transfer', 'shopping', 'En el supermercado se (caer) ___ dos botellas.', 'cayeron', 'У супермаркеті впали дві пляшки.', [['caieron', 'Між двома голосними пишемо y: cayeron.'], ['caen', 'Caen — теперішній час. Ідеться про минуле: cayeron.']]],
    ],
    choiceFb: { 'caió': 'Між двома голосними пишемо y: cayó.', 'cayo': 'Майже: потрібен знак наголосу — cayó.', 'cae': 'Cae — теперішній час. Ayer — «учора»: cayó.' },
  },
];

function bankTasks(b) {
  const target = [b.skill, 'written-form'];
  return b.rows.map(([n, role, family, sentence, form, fullUk, errors, choiceWrong]) => {
    const full = fill(sentence, form);
    const glosses = /caer|cayó|cayeron/.test(sentence + form) ? ['caerse — падати.'] : undefined;
    const common = { id: num(n), lesson: L, role, family, target, rule: b.rule, full, fullUk, glosses, ok: `Правильно: ${form}.`, bad: `Правильна форма — ${form}: ${full}` };
    if (choiceWrong) {
      return choice({
        ...common,
        prompt: [uk('Оберіть правильну форму простого минулого часу.'), es(sentence)],
        options: [[form, true], ...choiceWrong.map((w) => [w, false, b.choiceFb[w]])],
      });
    }
    const supported = role === 'supported';
    return exact({
      ...common,
      prompt: [uk(`${family === 'messages' ? 'Повідомлення. ' : ''}${INSTR}${supported ? ' Скористайтеся таблицею.' : ''}`), ...(supported ? [b.table] : []), es(sentence)],
      answers: [form], closed: true, errors,
    });
  });
}
const fill = (sentence, form) => capFirst(fillRaw(sentence, form));

const tasks = BANKS.flatMap(bankTasks);
const by = (skill, roles) => tasks.filter((t) => t.targets[0].skillId === skill && roles.includes(t.role)).map((t) => t.id);

export default {
  lesson: lesson({
    id: L,
    titleUk: 'Зміни в основі: pidió, durmió, leyó — і де їх немає',
    termEs: 'pretérito indefinido: cambios vocálicos y formas con y',
    summaryUk:
      'Деякі дієслова на -ir змінюють голосну лише в 3-й особі (pidió, durmió); інші дієслова з чергуванням у теперішньому часі в минулому його не мають (pensó, volvió); leer, creer, oír, caer пишуться з y (leyó, oyeron). Кожен тип — окремим кроком.',
    objectives: ['A2-04-O4', 'A2-04-O5'],
    situations: ['food-shopping', 'routine-study-leisure', 'people-family-home'],
    estimatedMinutes: 20,
    introduces: ['indefinido.stem-e-i', 'indefinido.stem-o-u', 'indefinido.stem-change-boundary', 'indefinido.y-alternation'],
    revisits: ['indefinido.regular-er-ir', 'indefinido.regular-ar', 'present.stem-e-i', 'present.stem-e-ie', 'present.stem-o-ue', 'present.jugar', 'participle.ido-accent'],
    steps: [
      step('s1', 'explanation', 'Крок 1: e → i, o → u лише в 3-й особі', true, {
        blocks: [
          uk('Кілька дієслів на -ir змінюють голосну основи в простому минулому, але тільки в 3-й особі однини й множини (él / ella / usted, ellos / ellas / ustedes).'),
          esTable(['sujeto', 'pedir', 'dormir'], [
            ['yo', 'pedí', 'dormí'], ['tú', 'pediste', 'dormiste'], ['él / ella / usted', 'pidió', 'durmió'],
            ['nosotros / nosotras', 'pedimos', 'dormimos'], ['vosotros / vosotras', 'pedisteis', 'dormisteis'], ['ellos / ellas / ustedes', 'pidieron', 'durmieron'],
          ]),
          uk('Так само: servir → sirvió, sirvieron; repetir → repitió, repitieron; preferir → prefirió, prefirieron; morir → murió, murieron.'),
          ex('Ana pidió un café. — Yo pedí un té.', 'Ана замовила каву. — Я замовив(-ла) чай.'),
          ex('Los niños durmieron bien. — Yo dormí mal.', 'Діти добре спали. — Я погано спав(-ла).'),
        ],
      }),
      step('s2', 'supported-practice', 'Крок 1: практика з таблицею', true, { taskIds: [...by('indefinido.stem-e-i', ['supported']), ...by('indefinido.stem-o-u', ['supported'])] }),
      step('s3', 'independent-practice', 'Крок 1: самостійна практика', true, { taskIds: [...by('indefinido.stem-e-i', ['independent']), ...by('indefinido.stem-o-u', ['independent'])] }),
      step('s4', 'explanation', 'Крок 2: без чергування — pensó, volvió', true, {
        blocks: [
          uk('Дієслова на -ar та -er, що мають чергування в теперішньому часі (pienso, vuelvo, entiendo, juego), у простому минулому його не мають: основа — як в інфінітиві.'),
          esTable(['infinitivo', 'presente', 'pretérito indefinido'], [
            ['pensar', 'pienso', 'pensé, pensó'], ['volver', 'vuelvo', 'volví, volvió'], ['entender', 'entiendo', 'entendí, entendió'],
            ['encontrar', 'encuentro', 'encontré, encontró'], ['jugar', 'juego', 'jugué, jugó'], ['empezar', 'empiezo', 'empecé, empezó'],
          ]),
          uk('Типова помилка — переносити pienso, vuelvo в минулий час (*piensó, *vuelvió).'),
        ],
      }),
      step('s5', 'supported-practice', 'Крок 2: практика з таблицею', true, { taskIds: by('indefinido.stem-change-boundary', ['supported']) }),
      step('s6', 'independent-practice', 'Крок 2: самостійна практика', true, { taskIds: by('indefinido.stem-change-boundary', ['independent']) }),
      step('s7', 'explanation', 'Крок 3: leyó, oyeron — y між голосними', true, {
        blocks: [
          uk('У leer, creer, oír, caer основа закінчується на голосну. У 3-й особі між голосними пишемо y: leyó, leyeron, creyó, oyó, oyeron, cayó, cayeron. В інших особах над i ставимо знак наголосу (як у leído).'),
          esTable(['sujeto', 'leer', 'oír'], [
            ['yo', 'leí', 'oí'], ['tú', 'leíste', 'oíste'], ['él / ella / usted', 'leyó', 'oyó'],
            ['nosotros / nosotras', 'leímos', 'oímos'], ['vosotros / vosotras', 'leísteis', 'oísteis'], ['ellos / ellas / ustedes', 'leyeron', 'oyeron'],
          ]),
          ex('Ayer leí el periódico. Mi padre también lo leyó.', 'Учора я прочитав(-ла) газету. Мій тато теж її прочитав.'),
          uk('Caerse — «падати»: El niño se cayó. Las botellas se cayeron.'),
        ],
      }),
      step('s8', 'supported-practice', 'Крок 3: практика з таблицею', true, { taskIds: by('indefinido.y-alternation', ['supported']) }),
      step('s9', 'independent-practice', 'Крок 3: самостійна практика', true, { taskIds: by('indefinido.y-alternation', ['independent']) }),
      step('s10', 'summary', 'Підсумок', true, {
        blocks: [
          ukList([
            'pedir, servir, repetir, preferir: e → i лише в 3-й особі — pidió, pidieron.',
            'dormir, morir: o → u лише в 3-й особі — durmió, murieron.',
            'pensar, volver, entender, jugar: у минулому без чергування — pensó, volvió.',
            'leer, creer, oír, caer: leyó, leyeron; leí, leíste, leímos — зі знаком наголосу.',
          ]),
        ],
      }),
    ],
  }),
  tasks,
};
