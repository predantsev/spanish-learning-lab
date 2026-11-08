// A2-04-L3 — spelling-preserving yo forms (-qué, -gué, -cé) and the written accent that separates
// hablo / habló (A2-04-O3). Every spelling task targets only the yo form; the accent tasks test the
// meaning-bearing mark in both directions (present without, past with).
import { choice, es, esTable, ex, exact, lesson, step, uk, ukList } from './lib.mjs';

const L = 'A2-04-L3';
const INSTR = 'Впишіть дієслово в дужках у простому минулому часі (форма yo).';
const num = (n) => `T${String(n).padStart(2, '0')}`;
/** Full sentence: the gap and its "(cue)" (before or after the gap) replaced by the form. */
const capFirst = (s) => s.replace(/^([¿¡]?)(\p{Ll})/u, (_m, a, b) => a + b.toUpperCase());
const fillRaw = (sentence, form) => {
  if (/___ \([^)]*\)/.test(sentence)) return sentence.replace(/___ \([^)]*\)/, form);
  if (/\([^)]*\) ___/.test(sentence)) return sentence.replace(/\([^)]*\) ___/, form);
  return sentence.replace('___', form);
};

const BANKS = [
  {
    skill: 'indefinido.spelling-car', letter: 'c → qu',
    rule: 'У формі yo перед закінченням -é буква c змінюється на qu, щоб зберегти звук [к]: buscar → busqué, sacar → saqué, tocar → toqué, explicar → expliqué. В інших формах лишається c: buscaste, buscó.',
    table: esTable(['infinitivo', 'yo'], [['buscar', 'busqué'], ['sacar', 'saqué'], ['tocar', 'toqué'], ['explicar', 'expliqué']]),
    rows: [
      [1, 'supported', 'shopping', 'Ayer (yo, sacar) ___ dinero del banco.', 'saqué', 'Учора я зняв(-ла) гроші в банку.', [['sacé', 'Перед e пишемо qu, щоб зберегти звук [к]: saqué.'], ['saque', 'Майже: у формі yo потрібен знак наголосу — saqué.'], ['sacó', 'Sacó — форма él / ella / usted. Для yo — saqué.']]],
      [2, 'supported', 'leisure', 'Anoche (yo, tocar) ___ la guitarra con mis amigos.', 'toqué', 'Учора ввечері я грав(-ла) на гітарі з друзями.', [['tocé', 'Перед e пишемо qu, щоб зберегти звук [к]: toqué.'], ['toque', 'Майже: у формі yo потрібен знак наголосу — toqué.'], ['tocó', 'Tocó — форма él / ella / usted. Для yo — toqué.']]],
      [3, 'independent', 'home', 'Ayer (yo, buscar) ___ mis gafas en casa.', 'busqué', 'Учора я шукав(-ла) свої окуляри вдома.', [['buscé', 'Перед e пишемо qu, щоб зберегти звук [к]: busqué.'], ['busque', 'Майже: у формі yo потрібен знак наголосу — busqué.']]],
      [4, 'independent', 'work-study', 'Ayer (yo, explicar) ___ el problema a mi profesor.', 'expliqué', 'Учора я пояснив(-ла) проблему своєму викладачеві.', [['explicé', 'Перед e пишемо qu, щоб зберегти звук [к]: expliqué.'], ['explique', 'Майже: у формі yo потрібен знак наголосу — expliqué.']]],
      [5, 'independent', 'shopping', 'El sábado (yo, sacar) ___ cien euros del banco.', 'saqué', 'У суботу я зняв(-ла) у банку сто євро.', [['sacé', 'Перед e пишемо qu, щоб зберегти звук [к]: saqué.'], ['saque', 'Майже: у формі yo потрібен знак наголосу — saqué.']]],
      [6, 'independent', 'leisure', 'Ayer ___ (sacar, yo) muchas fotos en la playa.', 'saqué', 'Учора я зробив(-ла) багато фото на пляжі.', null, ['sacé', 'saque', 'sacó']],
      [7, 'delayed', 'home', 'Anteayer (yo, buscar) ___ un piso nuevo.', 'busqué', 'Позавчора я шукав(-ла) нову квартиру.', [['buscé', 'Перед e пишемо qu, щоб зберегти звук [к]: busqué.'], ['busque', 'Майже: у формі yo потрібен знак наголосу — busqué.']]],
      [8, 'delayed', 'work-study', 'La semana pasada (yo, explicar) ___ el plan a mis padres.', 'expliqué', 'Минулого тижня я пояснив(-ла) батькам свій план.', [['explicé', 'Перед e пишемо qu, щоб зберегти звук [к]: expliqué.'], ['explique', 'Майже: у формі yo потрібен знак наголосу — expliqué.']]],
      [9, 'transfer', 'messages', '¡Hola, Ana! Ayer (yo, buscar) ___ tu libro, pero no está en mi casa.', 'busqué', 'Привіт, Ано! Учора я шукав(-ла) твою книжку, але в мене вдома її немає.', [['buscé', 'Перед e пишемо qu, щоб зберегти звук [к]: busqué.'], ['busque', 'Майже: у формі yo потрібен знак наголосу — busqué.']]],
      [10, 'transfer', 'travel', 'En la estación (yo, sacar) ___ dos billetes de tren.', 'saqué', 'На вокзалі я купив(-ла) два квитки на потяг.', [['sacé', 'Перед e пишемо qu, щоб зберегти звук [к]: saqué.'], ['saque', 'Майже: у формі yo потрібен знак наголосу — saqué.']]],
    ],
    choiceFb: { 'sacé': 'Перед e пишемо qu, щоб зберегти звук [к]: saqué.', 'saque': 'Майже: у формі yo потрібен знак наголосу — saqué.', 'sacó': 'Sacó — форма él / ella / usted. Для yo — saqué.' },
  },
  {
    skill: 'indefinido.spelling-gar', letter: 'g → gu',
    rule: 'У формі yo перед закінченням -é буква g змінюється на gu, щоб зберегти звук [ґ]: llegar → llegué, pagar → pagué, jugar → jugué. В інших формах лишається g: llegaste, llegó.',
    table: esTable(['infinitivo', 'yo'], [['llegar', 'llegué'], ['pagar', 'pagué'], ['jugar', 'jugué']]),
    rows: [
      [11, 'supported', 'travel', 'Ayer (yo, llegar) ___ tarde a la estación.', 'llegué', 'Учора я спізнився(-лася) на вокзал.', [['llegé', 'Перед e пишемо gu, щоб зберегти звук [ґ]: llegué.'], ['llegue', 'Майже: у формі yo потрібен знак наголосу — llegué.'], ['llegó', 'Llegó — форма él / ella / usted. Для yo — llegué.']]],
      [12, 'supported', 'shopping', 'En la tienda (yo, pagar) ___ con tarjeta.', 'pagué', 'У магазині я заплатив(-ла) карткою.', [['pagé', 'Перед e пишемо gu, щоб зберегти звук [ґ]: pagué.'], ['pague', 'Майже: у формі yo потрібен знак наголосу — pagué.'], ['pagó', 'Pagó — форма él / ella / usted. Для yo — pagué.']]],
      [13, 'independent', 'leisure', 'El domingo (yo, jugar) ___ al fútbol con mis amigos.', 'jugué', 'У неділю я грав(-ла) у футбол із друзями.', [['jugé', 'Перед e пишемо gu, щоб зберегти звук [ґ]: jugué.'], ['juegué', 'У простому минулому чергування ue немає: jugué.'], ['jugue', 'Майже: у формі yo потрібен знак наголосу — jugué.']]],
      [14, 'independent', 'shopping', 'Anoche (yo, pagar) ___ la cena en el restaurante.', 'pagué', 'Учора ввечері я заплатив(-ла) за вечерю в ресторані.', [['pagé', 'Перед e пишемо gu, щоб зберегти звук [ґ]: pagué.'], ['pague', 'Майже: у формі yo потрібен знак наголосу — pagué.']]],
      [15, 'independent', 'work-study', 'Ayer (yo, llegar) ___ a la oficina a las nueve.', 'llegué', 'Учора я прийшов(-ла) в офіс о дев’ятій.', [['llegé', 'Перед e пишемо gu, щоб зберегти звук [ґ]: llegué.'], ['llegue', 'Майже: у формі yo потрібен знак наголосу — llegué.']]],
      [16, 'independent', 'leisure', 'El sábado pasado ___ (jugar, yo) al fútbol en el parque.', 'jugué', 'Минулої суботи я грав(-ла) у футбол у парку.', null, ['jugé', 'juegué', 'jugó']],
      [17, 'delayed', 'travel', 'Anteayer (yo, llegar) ___ a Madrid en tren.', 'llegué', 'Позавчора я приїхав(-ла) до Мадрида потягом.', [['llegé', 'Перед e пишемо gu, щоб зберегти звук [ґ]: llegué.'], ['llegue', 'Майже: у формі yo потрібен знак наголосу — llegué.']]],
      [18, 'delayed', 'shopping', 'Ayer (yo, pagar) ___ cinco euros en el bar.', 'pagué', 'Учора я заплатив(-ла) в барі п’ять євро.', [['pagé', 'Перед e пишемо gu, щоб зберегти звук [ґ]: pagué.'], ['pague', 'Майже: у формі yo потрібен знак наголосу — pagué.']]],
      [19, 'transfer', 'messages', '¡Hola, mamá! Ayer (yo, llegar) ___ muy tarde a casa.', 'llegué', 'Привіт, мамо! Учора я прийшов(-ла) додому дуже пізно.', [['llegé', 'Перед e пишемо gu, щоб зберегти звук [ґ]: llegué.'], ['llegue', 'Майже: у формі yo потрібен знак наголосу — llegué.']]],
      [20, 'transfer', 'home', 'El año pasado (yo, jugar) ___ mucho con mi perro.', 'jugué', 'Минулого року я багато грався(-лася) зі своїм собакою.', [['jugé', 'Перед e пишемо gu, щоб зберегти звук [ґ]: jugué.'], ['juegué', 'У простому минулому чергування ue немає: jugué.']]],
    ],
    choiceFb: { 'jugé': 'Перед e пишемо gu, щоб зберегти звук [ґ]: jugué.', 'juegué': 'У простому минулому чергування ue немає: jugué.', 'jugó': 'Jugó — форма él / ella / usted. Для yo — jugué.' },
  },
  {
    skill: 'indefinido.spelling-zar', letter: 'z → c',
    rule: 'У формі yo перед закінченням -é буква z змінюється на c: empezar → empecé, comenzar → comencé, cruzar → crucé. Вимова не змінюється. Чергування ie з теперішнього часу тут немає.',
    table: esTable(['infinitivo', 'yo'], [['empezar', 'empecé'], ['comenzar', 'comencé'], ['cruzar', 'crucé']]),
    rows: [
      [21, 'supported', 'work-study', 'Ayer (yo, empezar) ___ a trabajar a las ocho.', 'empecé', 'Учора я почав(-ла) працювати о восьмій.', [['empezé', 'Перед e пишемо c замість z: empecé.'], ['empiecé', 'У простому минулому чергування ie немає: empecé.'], ['empece', 'Майже: у формі yo потрібен знак наголосу — empecé.'], ['empezó', 'Empezó — форма él / ella / usted. Для yo — empecé.']]],
      [22, 'supported', 'travel', 'Ayer (yo, cruzar) ___ la plaza en bicicleta.', 'crucé', 'Учора я перетнув(-ла) площу на велосипеді.', [['cruzé', 'Перед e пишемо c замість z: crucé.'], ['cruce', 'Майже: у формі yo потрібен знак наголосу — crucé.'], ['cruzó', 'Cruzó — форма él / ella / usted. Для yo — crucé.']]],
      [23, 'independent', 'work-study', 'La semana pasada (yo, comenzar) ___ las clases de inglés.', 'comencé', 'Минулого тижня я почав(-ла) заняття з англійської.', [['comenzé', 'Перед e пишемо c замість z: comencé.'], ['comiencé', 'У простому минулому чергування ie немає: comencé.'], ['comence', 'Майже: у формі yo потрібен знак наголосу — comencé.']]],
      [24, 'independent', 'travel', 'El verano pasado (yo, cruzar) ___ España en tren.', 'crucé', 'Минулого літа я перетнув(-ла) Іспанію потягом.', [['cruzé', 'Перед e пишемо c замість z: crucé.'], ['cruce', 'Майже: у формі yo потрібен знак наголосу — crucé.']]],
      [25, 'independent', 'home', 'Anteayer (yo, empezar) ___ a leer un libro nuevo.', 'empecé', 'Позавчора я почав(-ла) читати нову книжку.', [['empezé', 'Перед e пишемо c замість z: empecé.'], ['empiecé', 'У простому минулому чергування ie немає: empecé.']]],
      [26, 'independent', 'work-study', 'El lunes pasado ___ (comenzar, yo) un trabajo nuevo.', 'comencé', 'Минулого понеділка я почав(-ла) нову роботу.', null, ['comenzé', 'comiencé', 'comenzó']],
      [27, 'delayed', 'work-study', 'Ayer (yo, empezar) ___ el examen a las diez.', 'empecé', 'Учора я почав(-ла) писати іспит о десятій.', [['empezé', 'Перед e пишемо c замість z: empecé.'], ['empiecé', 'У простому минулому чергування ie немає: empecé.']]],
      [28, 'delayed', 'travel', 'El sábado (yo, cruzar) ___ la ciudad en autobús.', 'crucé', 'У суботу я проїхав(-ла) автобусом через усе місто.', [['cruzé', 'Перед e пишемо c замість z: crucé.'], ['cruce', 'Майже: у формі yo потрібен знак наголосу — crucé.']]],
      [29, 'transfer', 'messages', '¡Hola, Luis! El lunes (yo, empezar) ___ las clases en la universidad.', 'empecé', 'Привіт, Луїсе! У понеділок я почав(-ла) заняття в університеті.', [['empezé', 'Перед e пишемо c замість z: empecé.'], ['empiecé', 'У простому минулому чергування ie немає: empecé.']]],
      [30, 'transfer', 'leisure', 'El año pasado (yo, comenzar) ___ a bailar.', 'comencé', 'Минулого року я почав(-ла) танцювати.', [['comenzé', 'Перед e пишемо c замість z: comencé.'], ['comiencé', 'У простому минулому чергування ie немає: comencé.']]],
    ],
    choiceFb: { 'comenzé': 'Перед e пишемо c замість z: comencé.', 'comiencé': 'У простому минулому чергування ie немає: comencé.', 'comenzó': 'Comenzó — форма él / ella / usted. Для yo — comencé.' },
  },
];

function spellingTasks(b) {
  const target = [b.skill, 'written-form'];
  return b.rows.map(([n, role, family, sentence, form, fullUk, errors, choiceWrong]) => {
    const full = fill(sentence, form);
    const common = { id: num(n), lesson: L, role, family, target, rule: b.rule, full, fullUk, ok: `Правильно: ${form}.`, bad: `Правильна форма — ${form}: ${full}` };
    if (choiceWrong) {
      return choice({
        ...common,
        prompt: [uk('Оберіть правильно написану форму yo.'), es(sentence)],
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

// ---------- ortho.indefinido-accent ----------
const ACC_W = ['ortho.indefinido-accent', 'written-form'];
const ACC_C = ['ortho.indefinido-accent', 'context-choice'];
const ACC_RULE = 'У правильних дієсловах форми yo і él / ella / usted простого минулого часу мають знак наголосу: hablé, habló, comí, comió. Він розрізняє значення: hablo — «я говорю» (теперішній час), habló — «він (вона) говорив(-ла)».';
const ACC_MODEL = ex('Hoy trabajo en casa. — Ayer Ana trabajó en casa.', 'Сьогодні я працюю вдома. — Учора Ана працювала вдома.');

function accGap(n, role, family, sentence, form, wrong, wrongFb, fullUk, supported = false) {
  const full = fill(sentence, form);
  return exact({
    id: num(n), lesson: L, role, family, target: ACC_W,
    prompt: [uk(`${family === 'messages' ? 'Повідомлення. ' : ''}Впишіть дієслово в дужках у формі, яка підходить до контексту: теперішній чи простий минулий час. Стежте за знаком наголосу.${supported ? ' Зразок нижче.' : ''}`), ...(supported ? [ACC_MODEL] : []), es(sentence)],
    answers: [form], closed: true, errors: [[wrong, wrongFb]],
    rule: ACC_RULE, full, fullUk, ok: `Правильно: ${form}.`, bad: `Тут потрібно ${form}: ${full}`,
  });
}

function accPick(n, role, family, sentence, right, wrong, wrongFb, fullUk) {
  const full = fill(sentence, right);
  return choice({
    id: num(n), lesson: L, role, family, target: ACC_C,
    prompt: [uk('Оберіть форму, яка підходить до контексту.'), es(sentence)],
    options: [[right, true], [wrong, false, wrongFb]],
    rule: ACC_RULE, full, fullUk, ok: `Правильно: ${right}.`, bad: `Тут потрібно ${right}: ${full}`,
  });
}

const tasks = [
  ...BANKS.flatMap(spellingTasks),
  accGap(31, 'supported', 'routine', 'Ayer Luis (comprar) ___ pan.', 'compró', 'compro', 'Compro — «я купую» (теперішній час). Для Luis у минулому — compró, зі знаком наголосу.', 'Учора Луїс купив хліб.', true),
  accGap(32, 'supported', 'home', 'Normalmente (yo, cocinar) ___ en casa.', 'cocino', 'cocinó', 'Cocinó — «він (вона) готував(-ла)». Normalmente — звичка, тому теперішній час: cocino.', 'Зазвичай я готую вдома.', true),
  accGap(33, 'independent', 'routine', 'Ayer mi madre (llegar) ___ a las diez.', 'llegó', 'llego', 'Llego — «я приходжу» (теперішній час). Для mi madre в минулому — llegó.', 'Учора мама прийшла о десятій.'),
  accGap(34, 'independent', 'work-study', 'Todos los días (yo, trabajar) ___ en una oficina.', 'trabajo', 'trabajó', 'Trabajó — «він (вона) працював(-ла)». Todos los días — звичка, тому теперішній час: trabajo.', 'Я щодня працюю в офісі.'),
  accGap(35, 'delayed', 'home', 'Anoche Pedro (cenar) ___ con nosotros.', 'cenó', 'ceno', 'Ceno — «я вечеряю» (теперішній час). Для Pedro в минулому — cenó.', 'Учора ввечері Педро вечеряв з нами.'),
  accGap(36, 'transfer', 'messages', '¡Hola, Ana! Ayer tu hermano me (ayudar) ___ mucho.', 'ayudó', 'ayudo', 'Ayudo — «я допомагаю» (теперішній час). Для tu hermano в минулому — ayudó.', 'Привіт, Ано! Учора твій брат мені дуже допоміг.'),
  accPick(37, 'independent', 'routine', 'Ayer Marta ___ con el profesor.', 'habló', 'hablo', 'Hablo — «я говорю». Ayer і Marta вимагають минулого часу для él / ella: habló.', 'Учора Марта говорила з викладачем.'),
  accPick(38, 'independent', 'work-study', 'Normalmente ___ con mis padres los domingos.', 'hablo', 'habló', 'Habló — «він (вона) говорив(-ла)». Normalmente — звичка, і йдеться про «я»: hablo.', 'Зазвичай я розмовляю з батьками в неділю.'),
  accPick(39, 'delayed', 'home', 'Anoche mi hermano ___ muy tarde a casa.', 'llegó', 'llego', 'Llego — «я приходжу». Anoche і mi hermano вимагають минулого часу для él: llegó.', 'Учора ввечері мій брат прийшов додому дуже пізно.'),
  accPick(40, 'transfer', 'shopping', 'Siempre ___ la fruta en esta tienda.', 'compro', 'compró', 'Compró — «він (вона) купив(-ла)». Siempre — звичка, тож теперішній час: compro.', 'Я завжди купую фрукти в цьому магазині.'),
];

const byRole = (skills, roles) => tasks.filter((t) => skills.includes(t.targets[0].skillId) && roles.includes(t.role)).map((t) => t.id);
const ALL = ['indefinido.spelling-car', 'indefinido.spelling-gar', 'indefinido.spelling-zar', 'ortho.indefinido-accent'];

export default {
  lesson: lesson({
    id: L,
    titleUk: 'Правопис у простому минулому: busqué, llegué, empecé; hablo чи habló',
    termEs: 'pretérito indefinido: cambios ortográficos y tilde',
    summaryUk:
      'Чому у формі yo пишемо busqué, llegué, empecé (а не *buscé, *llegé, *empezé) і як знак наголосу розрізняє hablo («я говорю») та habló («він говорив»).',
    objectives: ['A2-04-O3'],
    situations: ['food-shopping', 'time-appointments-transport', 'routine-study-leisure'],
    estimatedMinutes: 18,
    introduces: ALL,
    revisits: ['indefinido.regular-ar', 'indefinido.regular-er-ir', 'time.past-markers', 'ortho.written-accent.familiar-words', 'present.jugar', 'present.stem-e-ie'],
    steps: [
      step('s1', 'explanation', 'c → qu, g → gu, z → c у формі yo', true, {
        blocks: [
          uk('Закінчення yo в простому минулому — -é. Перед e деякі букви читалися б інакше, тому в цій формі змінюється написання, а звук лишається той самий.'),
          esTable(['infinitivo', 'yo', 'él / ella'], [
            ['buscar', 'busqué', 'buscó'], ['sacar', 'saqué', 'sacó'], ['tocar', 'toqué', 'tocó'],
            ['llegar', 'llegué', 'llegó'], ['pagar', 'pagué', 'pagó'], ['jugar', 'jugué', 'jugó'],
            ['empezar', 'empecé', 'empezó'], ['comenzar', 'comencé', 'comenzó'], ['cruzar', 'crucé', 'cruzó'],
          ]),
          ukList([
            'c → qu: щоб лишився звук [к] (busqué, а не *buscé).',
            'g → gu: щоб лишився звук [ґ] (llegué, а не *llegé).',
            'z → c: перед e пишемо c (empecé, а не *empezé); вимова та сама.',
          ]),
          uk('Змінюється лише форма yo. Решта форм пишеться, як в інфінітиві: buscaste, llegó, empezamos. Чергування з теперішнього часу (juego, empiezo) у простому минулому немає: jugué, empecé.'),
          uk('Нові дієслова: sacar — «виймати; знімати (гроші); робити (фото); купувати (квитки)», tocar — «торкатися; грати (на інструменті)», pagar — «платити», comenzar — «починати», cruzar — «переходити, перетинати».'),
        ],
      }),
      step('s2', 'explanation', 'Hablo чи habló', true, {
        blocks: [
          uk('У правильних дієсловах форми yo і él / ella / usted простого минулого часу мають знак наголосу на останньому складі. Без нього слово означає інше:'),
          ex('Hablo con Ana. — Ana habló con Luis.', 'Я говорю з Аною. — Ана говорила з Луїсом.'),
          ex('Compro pan. — Ayer Luis compró pan.', 'Я купую хліб. — Учора Луїс купив хліб.'),
          uk('Тому знак наголосу тут — не дрібниця: він показує і час, і особу.'),
        ],
      }),
      step('s3', 'examples', 'Приклади', true, {
        blocks: [
          ex('Ayer busqué las llaves y no las encontré.', 'Учора я шукав(-ла) ключі й не знайшов(-ла) їх.'),
          ex('Llegué a casa a las diez.', 'Я прийшов(-ла) додому о десятій.'),
          ex('Pagué la cena con tarjeta.', 'Я заплатив(-ла) за вечерю карткою.'),
          ex('El lunes empecé las clases.', 'У понеділок я почав(-ла) заняття.'),
          ex('Mi hermano llegó tarde y pagó la cena.', 'Мій брат прийшов пізно й заплатив за вечерю.'),
        ],
      }),
      step('s4', 'supported-practice', 'Практика з таблицею', true, { taskIds: byRole(ALL, ['supported']) }),
      step('s5', 'independent-practice', 'Самостійна практика', true, { taskIds: byRole(ALL, ['independent']) }),
      step('s6', 'summary', 'Підсумок', true, {
        blocks: [
          ukList([
            'yo: busqué, saqué, toqué, expliqué; llegué, pagué, jugué; empecé, comencé, crucé.',
            'Решта форм — без змін: buscó, llegaste, empezamos.',
            'Знак наголосу розрізняє: hablo (я говорю) — habló (він / вона говорив(-ла)).',
          ]),
        ],
      }),
    ],
  }),
  tasks,
};
