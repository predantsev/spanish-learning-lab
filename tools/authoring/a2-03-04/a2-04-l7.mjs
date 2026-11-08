// A2-04-L7 — when the event is framed as completed (A2-04-O8): the completed-event use of the
// indefinido, hace + period («тому») and a first, bounded contrast with the known perfecto.
// Each dual-modality skill has 8 tasks (per modality: supported, independent, delayed, transfer),
// as in A2-03-L6. Every context closes the period explicitly (ayer, anoche, la semana pasada, en 2019,
// hace…) or keeps it open (hoy, esta semana, alguna vez); no imperfecto is needed or offered. The
// perfecto/indefinido choice states that the model is the usage of most of Spain, because the
// indefinido for «today» is regional (skill variantPolicyUk).
import { SENTENCE, choice, es, ex, exact, lesson, step, uk, ukList } from './lib.mjs';

const L = 'A2-04-L7';
const CE_R = ['indefinido.use-completed-event', 'reading-meaning'];
const CE_C = ['indefinido.use-completed-event', 'construction-use'];
const HA_C = ['time.hace-ago', 'construction-use'];
const HA_R = ['time.hace-ago', 'reading-meaning'];
const PI_C = ['contrast.perfecto-indefinido', 'context-choice'];
const PI_R = ['contrast.perfecto-indefinido', 'reading-meaning'];
const num = (n) => `T${String(n).padStart(2, '0')}`;

const CE_RULE = 'Простий минулий час (indefinido) описує завершену подію в минулому моменті або періоді, який уже закінчився: ayer, anoche, el sábado pasado, en 2020. Слово часу допомагає, але дивимося на весь контекст.';
const HA_RULE = 'Hace + проміжок часу означає «тому»: hace dos días — «два дні тому». Hace тут не змінюється (не *hacen), а вираз стоїть у кінці або на початку речення.';
const PI_RULE = 'У мовленні більшої частини Іспанії: період ще триває (hoy, esta semana, este año) або досвід без дати (alguna vez, nunca) — perfecto: he trabajado. Період уже закінчився або є точний минулий час (ayer, la semana pasada, en 2019) — indefinido: trabajé.';
const PI_INSTR = 'Оберіть форму, природну для мовлення більшої частини Іспанії.';
const UNRES = 'Такого варіанта немає серед перевірених відповідей, тому автоматично ми його не оцінюємо. Порівняйте зі зразком.';

function read(n, role, family, target, rule, text, question, options, revealUk) {
  return choice({
    id: num(n), lesson: L, role, family, target,
    prompt: [uk(`${family === 'messages' ? 'Прочитайте повідомлення' : 'Прочитайте'} і дайте відповідь.`), es(text), uk(question)],
    options, rule, full: text, fullUk: revealUk,
    ok: 'Правильно.', bad: `Ні. ${revealUk}`,
  });
}

function write(n, role, family, target, rule, instr, sentence, answers, errors, full, fullUk, extra = {}) {
  return exact({
    id: num(n), lesson: L, role, family, target, policy: SENTENCE,
    prompt: [uk(instr), ...(extra.model ? [ex(...extra.model)] : []), es(sentence)],
    answers, errors, closed: false, rule, glosses: extra.glosses,
    full, fullUk,
    ok: `Правильно: ${full}`, bad: `Порівняйте: ${full}`,
    unresolved: UNRES,
  });
}

function pick(n, role, family, sentence, options, full, fullUk, extra = {}) {
  return choice({
    id: num(n), lesson: L, role, family, target: PI_C,
    prompt: [uk(`${family === 'messages' ? 'Повідомлення. ' : ''}${PI_INSTR}${extra.model ? ' Зразок нижче.' : ''}`), ...(extra.model ? [ex(...extra.model)] : []), es(sentence)],
    options, rule: PI_RULE, full, fullUk,
    ok: `Правильно: ${full}`, bad: `Контекст підказує інше: ${full}`,
  });
}

const CE_INSTR = 'Впишіть дієслово в дужках у формі, яка підходить до контексту.';
const AYER_PERF = (f) => `Про період, який уже закінчився, у мовленні більшої частини Іспанії вживаємо простий минулий час: ${f}.`;
const HA_INSTR = (ukPhrase) => `Впишіть вираз з hace, що означає «${ukPhrase}».`;

const tasks = [
  // ---------- indefinido.use-completed-event: reading ----------
  read(1, 'supported', 'home', CE_R, CE_RULE, 'En 2020 viví en Valencia. Ahora vivo en Madrid.', 'Що ми дізналися? Підказка: viví — минулий час, vivo — теперішній.',
    [['У 2020 році людина жила у Валенсії, а тепер живе в Мадриді.', true],
      ['Людина й тепер живе у Валенсії.', false, 'Ahora vivo en Madrid — тепер вона живе в Мадриді.'],
      ['Людина переїде до Валенсії.', false, 'Viví — завершена подія в минулому (у 2020 році), а не план.']],
    'У 2020 році я жив(-ла) у Валенсії. Тепер живу в Мадриді.'),
  read(2, 'independent', 'routine', CE_R, CE_RULE, 'Ayer Ana comió con sus padres y después volvió a casa.', 'Що зробила Ана вчора?',
    [['Пообідала з батьками й повернулася додому.', true],
      ['Вона щодня обідає з батьками.', false, 'Ayer, comió — одна завершена подія вчора, а не звичка.'],
      ['Завтра вона обідатиме з батьками.', false, 'Ayer — «учора»: подія вже відбулася.']],
    'Учора Ана пообідала з батьками, а потім повернулася додому.'),
  read(3, 'delayed', 'leisure', CE_R, CE_RULE, '—¿Qué hiciste el domingo? —Nada: me levanté tarde y vi una película en casa.', 'Що людина робила в неділю?',
    [['Пізно встала й подивилася фільм удома.', true],
      ['Вона завжди пізно встає в неділю.', false, 'Me levanté, vi — події минулої неділі, а не звичка.'],
      ['Вона ще не дивилася цього фільму.', false, 'Vi una película — фільм уже переглянуто.']],
    '—Що ти робив(-ла) в неділю? —Нічого особливого: пізно встав(-ла) і подивився(-лася) фільм удома.'),
  read(4, 'transfer', 'messages', CE_R, CE_RULE, '¡Hola, Pablo! El sábado pasado estuve en Toledo con Marta. Comimos en un restaurante muy bonito y volvimos a casa en tren.', 'Як вони повернулися додому?',
    [['Потягом.', true], ['Автобусом.', false], ['Вони ще не повернулися.', false, 'Volvimos — вони вже повернулися.']],
    'Привіт, Пабло! Минулої суботи ми з Мартою були в Толедо. Пообідали в дуже гарному ресторані й повернулися додому потягом.'),

  // ---------- indefinido.use-completed-event: construction ----------
  write(5, 'supported', 'work-study', CE_C, CE_RULE, `${CE_INSTR} Зразок нижче.`, 'Ayer (yo, trabajar) ___ diez horas.',
    ['trabajé', 'yo trabajé'],
    [['trabajo', 'Trabajo — теперішній час. Ayer — «учора»: trabajé.'], ['he trabajado', AYER_PERF('trabajé')], ['trabaje', 'Майже: у формі yo обов’язковий знак наголосу — trabajé.']],
    'Ayer trabajé diez horas.', 'Учора я працював(-ла) десять годин.',
    { model: ['Ayer comí en casa de Ana.', 'Учора я обідав(-ла) в Ани.'] }),
  write(6, 'independent', 'work-study', CE_C, CE_RULE, CE_INSTR, 'El año pasado mi hermana (terminar) ___ la universidad.',
    ['terminó', 'mi hermana terminó'],
    [['termina', 'Termina — теперішній час. El año pasado — «минулого року»: terminó.'], ['ha terminado', AYER_PERF('terminó')], ['termino', 'Termino — теперішній час (yo). Потрібно terminó: зі знаком наголосу, для ella.']],
    'El año pasado mi hermana terminó la universidad.', 'Минулого року моя сестра закінчила університет.'),
  write(7, 'delayed', 'home', CE_C, CE_RULE, CE_INSTR, 'Anoche (nosotros, cenar) ___ en casa de Ana.',
    ['cenamos', 'nosotros cenamos'],
    [['hemos cenado', AYER_PERF('cenamos')], ['vamos a cenar', 'Vamos a cenar — план. Anoche — «учора ввечері»: cenamos.']],
    'Anoche cenamos en casa de Ana.', 'Учора ввечері ми вечеряли в Ани.'),
  write(8, 'transfer', 'messages', CE_C, CE_RULE, `Повідомлення. ${CE_INSTR}`, '¡Hola, Luis! Anteayer (yo, recibir) ___ tu regalo. ¡Muchas gracias!',
    ['recibí', 'yo recibí'],
    [['recibo', 'Recibo — теперішній час. Anteayer — «позавчора»: recibí.'], ['he recibido', AYER_PERF('recibí')], ['recibi', 'Майже: у формі yo обов’язковий знак наголосу — recibí.']],
    '¡Hola, Luis! Anteayer recibí tu regalo. ¡Muchas gracias!', 'Привіт, Луїсе! Позавчора я отримав(-ла) твій подарунок. Щиро дякую!'),

  // ---------- time.hace-ago: construction ----------
  write(9, 'supported', 'travel', HA_C, HA_RULE, `${HA_INSTR('три дні тому')} Зразок нижче.`, 'Llegué a Madrid ___.',
    ['hace tres días'],
    [['hacen tres días', 'Hace у цьому виразі не змінюється: hace tres días.'], ['tres días hace', 'Hace стоїть перед проміжком часу: hace tres días.']],
    'Llegué a Madrid hace tres días.', 'Я приїхав(-ла) до Мадрида три дні тому.',
    { model: ['Llegué a Valencia hace dos días.', 'Я приїхав(-ла) до Валенсії два дні тому.'] }),
  write(10, 'independent', 'leisure', HA_C, HA_RULE, HA_INSTR('тиждень тому'), 'Vimos a Ana ___.',
    ['hace una semana'],
    [['hace un semana', 'Semana — жіночого роду: hace una semana.'], ['hacen una semana', 'Hace у цьому виразі не змінюється: hace una semana.']],
    'Vimos a Ana hace una semana.', 'Ми бачили Ану тиждень тому.'),
  write(11, 'delayed', 'family', HA_C, HA_RULE, HA_INSTR('два роки тому'), 'Mis padres llegaron a España ___.',
    ['hace dos años'],
    [['hacen dos años', 'Hace у цьому виразі не змінюється: hace dos años.'], ['hace dos anos', 'У слові años пишемо ñ.']],
    'Mis padres llegaron a España hace dos años.', 'Мої батьки приїхали до Іспанії два роки тому.'),
  write(12, 'transfer', 'messages', HA_C, HA_RULE, `Повідомлення. ${HA_INSTR('п’ять днів тому')}`, '¡Hola, Marta! Te mandé un mensaje ___. ¿Lo has visto?',
    ['hace cinco días'],
    [['hacen cinco días', 'Hace у цьому виразі не змінюється: hace cinco días.'], ['cinco días hace', 'Hace стоїть перед проміжком часу: hace cinco días.']],
    '¡Hola, Marta! Te mandé un mensaje hace cinco días. ¿Lo has visto?', 'Привіт, Марто! Я надіслав(-ла) тобі повідомлення п’ять днів тому. Ти його бачила?'),

  // ---------- time.hace-ago: reading ----------
  read(13, 'supported', 'travel', HA_R, HA_RULE, 'Pablo llegó hace dos horas.', 'Коли приїхав Пабло? Підказка: hace + проміжок часу — «тому».',
    [['Дві години тому.', true], ['Через дві години.', false, 'Llegó — він уже приїхав; hace dos horas — «дві години тому».'], ['О другій годині.', false, 'О другій — a las dos. Hace dos horas — «дві години тому».']],
    'Пабло приїхав дві години тому.'),
  read(14, 'independent', 'travel', HA_R, HA_RULE, 'Hace tres años estuve en Valencia.', 'Що означає речення?',
    [['Три роки тому я був(-ла) у Валенсії.', true],
      ['Я прожив(-ла) у Валенсії три роки.', false, 'Hace tres años — «три роки тому», а не «протягом трьох років».'],
      ['Через три роки я поїду до Валенсії.', false, 'Estuve — минулий час: це вже було.']],
    'Три роки тому я був(-ла) у Валенсії.'),
  choice({
    id: num(15), lesson: L, role: 'delayed', family: 'weather-vs-time', target: HA_R,
    prompt: [uk('У якому реченні hace означає «тому»?')],
    options: [
      ['Llegué hace una semana.', true],
      ['Hoy hace mucho calor.', false, 'Hace calor — про погоду: «спекотно».'],
      ['Mi hermano hace la cena.', false, 'Тут hace — від hacer: «готує (вечерю)».'],
    ],
    rule: HA_RULE, full: 'Llegué hace una semana.', fullUk: 'Я приїхав(-ла) тиждень тому.',
    ok: 'Правильно: hace una semana — «тиждень тому».', bad: 'Ні. «Тому» — це hace + проміжок часу: Llegué hace una semana.',
  }),
  read(16, 'transfer', 'messages', HA_R, HA_RULE, '¡Hola, Ana! Terminé el examen hace una hora y ahora estoy en casa.', 'Коли автор повідомлення закінчив іспит?',
    [['Годину тому.', true], ['Через годину.', false, 'Terminé — уже закінчив; hace una hora — «годину тому».'], ['О першій годині.', false, 'О першій — a la una. Hace una hora — «годину тому».']],
    'Привіт, Ано! Я закінчив(-ла) іспит годину тому, і тепер я вдома.'),

  // ---------- contrast.perfecto-indefinido: context-choice ----------
  pick(17, 'supported', 'leisure', 'La semana pasada ___ al cine dos veces.',
    [['fui', true], ['he ido', false, 'La semana pasada — період уже закінчився: fui.']],
    'La semana pasada fui al cine dos veces.', 'Минулого тижня я двічі ходив(-ла) в кіно.',
    { model: ['Esta semana he trabajado mucho. La semana pasada trabajé mucho.', 'Цього тижня я багато працював(-ла). Минулого тижня я багато працював(-ла).'] }),
  pick(18, 'independent', 'work-study', 'Hoy ___ mucho y ahora estoy muy cansado.',
    [['he trabajado', true], ['trabajé', false, 'Hoy — день ще триває: у більшій частині Іспанії тут кажуть he trabajado. Trabajé з hoy уживають в інших регіонах.']],
    'Hoy he trabajado mucho y ahora estoy muy cansado.', 'Сьогодні я багато працював і тепер дуже втомлений.'),
  pick(19, 'delayed', 'travel', '—¿Has estado alguna vez en Sevilla? —Sí, ___ allí en 2019.',
    [['estuve', true], ['he estado', false, 'En 2019 — точний минулий час: estuve. Питання з alguna vez — про досвід, тому там he estado.']],
    '—¿Has estado alguna vez en Sevilla? —Sí, estuve allí en 2019.', '—Ти колись бував(-ла) у Севільї? —Так, я був(-ла) там у 2019 році.'),
  pick(20, 'transfer', 'messages', '¡Hola, Luis! Ayer ___ tu mensaje, pero no pude escribir.',
    [['recibí', true], ['he recibido', false, 'Ayer — день уже минув: recibí.']],
    '¡Hola, Luis! Ayer recibí tu mensaje, pero no pude escribir.', 'Привіт, Луїсе! Учора я отримав(-ла) твоє повідомлення, але не зміг (не змогла) написати.'),

  // ---------- contrast.perfecto-indefinido: reading ----------
  read(21, 'supported', 'leisure', PI_R, PI_RULE, 'Esta semana he ido al gimnasio dos veces. La semana pasada no fui.', 'Коли людина не ходила в спортзал? Підказка: esta semana — «цього тижня», la semana pasada — «минулого тижня».',
    [['Минулого тижня.', true], ['Цього тижня.', false, 'Esta semana he ido… dos veces — цього тижня вона ходила двічі.']],
    'Цього тижня я двічі ходив(-ла) у спортзал. Минулого тижня не ходив(-ла).'),
  read(22, 'independent', 'leisure', PI_R, PI_RULE, '—¿Has visto la película? —Sí, la vi el sábado.', 'Що ми дізналися?',
    [['Людина вже бачила фільм — у суботу.', true],
      ['Людина ще не бачила фільму.', false, 'Sí, la vi — так, бачила.'],
      ['Людина подивиться фільм у суботу.', false, 'Vi — минулий час: фільм уже переглянуто.']],
    '—Ти бачив(-ла) фільм? —Так, я подивився(-лася) його в суботу.'),
  read(23, 'delayed', 'travel', PI_R, PI_RULE, 'Este año he viajado poco, pero el año pasado viajé mucho.', 'Що ми дізналися?',
    [['Минулого року людина подорожувала багато, а цього року — мало.', true],
      ['Цього року людина подорожувала багато, а минулого — мало.', false, 'Навпаки: este año he viajado poco — цього року мало.'],
      ['Людина ніколи не подорожувала.', false, 'El año pasado viajé mucho — минулого року вона багато подорожувала.']],
    'Цього року я мало подорожував(-ла), а минулого року — багато.'),
  read(24, 'transfer', 'messages', PI_R, PI_RULE, '¡Hola, Ana! Hoy he estado en casa y he descansado. Ayer estuve en la oficina diez horas.', 'Де автор повідомлення був сьогодні?',
    [['Удома.', true], ['В офісі.', false, 'В офісі він був учора: ayer estuve en la oficina.']],
    'Привіт, Ано! Сьогодні я був(-ла) удома й відпочивав(-ла). Учора я був(-ла) в офісі десять годин.'),
];

const ids = (...n) => n.map((x) => `${L}-${num(x)}`);

export default {
  lesson: lesson({
    id: L,
    titleUk: 'Завершена подія: простий минулий час, hace і перше порівняння з perfecto',
    termEs: 'usos del pretérito indefinido; hace + tiempo',
    summaryUk:
      'Коли вживаємо простий минулий час: завершена подія в минулому моменті або періоді (ayer, la semana pasada, en 2020). Вираз hace + проміжок часу — «тому». Перше порівняння з perfecto: період, що триває, чи період, що закінчився.',
    objectives: ['A2-04-O8'],
    situations: ['routine-study-leisure', 'time-appointments-transport', 'places-accommodation'],
    estimatedMinutes: 18,
    introduces: ['indefinido.use-completed-event', 'time.hace-ago', 'contrast.perfecto-indefinido'],
    revisits: ['indefinido.regular-ar', 'indefinido.regular-er-ir', 'indefinido.ser-ir', 'indefinido.estar', 'indefinido.ver', 'time.past-markers', 'perfecto.choice-context', 'perfecto.use-current-period', 'perfecto.use-experience', 'formula.weather-hace', 'number.0-15'],
    steps: [
      step('s1', 'explanation', 'Завершена подія в минулому', true, {
        blocks: [
          uk('Простий минулий час описує подію, яка завершилася в минулому моменті або в періоді, що вже закінчився: ayer, anoche, anteayer, el sábado pasado, la semana pasada, en 2020.'),
          ex('Ayer fui al médico.', 'Учора я ходив(-ла) до лікаря.'),
          ex('En 2020 viví en Valencia.', 'У 2020 році я жив(-ла) у Валенсії.'),
          ex('El sábado pasado comimos en casa de Ana.', 'Минулої суботи ми обідали в Ани.'),
          uk('Слово часу допомагає, але вирішує весь контекст: чи період уже закінчився.'),
        ],
      }),
      step('s2', 'explanation', 'Hace + проміжок часу: «тому»', true, {
        blocks: [
          uk('Щоб сказати «два дні тому», вживаємо hace + проміжок часу: hace dos días, hace una semana, hace tres años. Hace тут не змінюється.'),
          ex('Llegué hace dos días.', 'Я приїхав(-ла) два дні тому.'),
          ex('Hace un año estuve en Sevilla.', 'Рік тому я був(-ла) у Севільї.'),
          uk('Не плутайте з погодою: Hoy hace calor — «сьогодні спекотно».'),
        ],
      }),
      step('s3', 'explanation', 'Perfecto чи простий минулий час', true, {
        blocks: [
          uk('Порівняйте. У мовленні більшої частини Іспанії:'),
          ex('Esta semana he trabajado mucho.', 'Цього тижня я багато працював(-ла). (тиждень ще триває — perfecto)'),
          ex('La semana pasada trabajé mucho.', 'Минулого тижня я багато працював(-ла). (тиждень закінчився — простий минулий)'),
          ex('¿Has estado alguna vez en Sevilla?', 'Ти колись бував(-ла) у Севільї? (досвід без дати — perfecto)'),
          ex('Estuve en Sevilla en 2019.', 'Я був(-ла) у Севільї у 2019 році. (точна дата — простий минулий)'),
          uk('На північному заході Іспанії, на Канарських островах і в Латинській Америці простий минулий час часто вживають і про «сьогодні»: Hoy trabajé mucho. У завданнях цього курсу моделлю є мовлення більшої частини Іспанії.'),
        ],
      }),
      step('s4', 'supported-practice', 'Практика з підказкою', true, { taskIds: ids(1, 5, 9, 13, 17, 21) }),
      step('s5', 'independent-practice', 'Самостійна практика', true, { taskIds: ids(2, 6, 10, 14, 18, 22) }),
      step('s6', 'summary', 'Підсумок', true, {
        blocks: [
          ukList([
            'Простий минулий час: завершена подія в періоді, що вже закінчився (ayer, la semana pasada, en 2020).',
            'Hace + проміжок часу — «тому»: hace dos días.',
            'Perfecto: період ще триває (hoy, esta semana) або досвід без дати (alguna vez).',
            'Вирішує весь контекст, а не одне слово.',
          ]),
        ],
      }),
    ],
  }),
  tasks,
};
