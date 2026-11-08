// A2-03-L6 — when the perfecto fits (A2-03-O7): current period, life experience (ya, todavía no,
// alguna vez, nunca) and an unlabelled choice among present / perfecto / ir a + infinitive.
// Contexts are written so that only one option is defensible; present-for-future and other
// alternatives that would also be valid are never offered as distractors.
import { SENTENCE, choice, es, ex, exact, lesson, step, uk, ukList } from './lib.mjs';

const L = 'A2-03-L6';
const CP_R = ['perfecto.use-current-period', 'reading-meaning'];
const CP_C = ['perfecto.use-current-period', 'construction-use'];
const EX_R = ['perfecto.use-experience', 'reading-meaning'];
const EX_C = ['perfecto.use-experience', 'construction-use'];
const CH = ['perfecto.choice-context', 'context-choice'];

const CP_RULE = 'Perfecto описує завершені дії в періоді, який ще триває або включає «зараз»: hoy, esta mañana, esta semana, este año, últimamente. Слово часу — лише підказка: дивіться на весь контекст.';
const EX_RULE = 'Perfecto описує досвід у житті до цього моменту, без точної дати: ¿Has estado alguna vez en Sevilla? Ya — «вже», todavía no — «ще не», nunca — «ніколи». Ya і todavía no стоять перед haber або після дієприкметника.';
const CH_RULE = 'Звичка або те, що є зараз, — теперішній час (Normalmente como en casa); дія триває саме зараз — estar + герундій; уже відбулося в періоді, що триває, — perfecto (Hoy he comido en un restaurante); план — ir a + інфінітив (Mañana voy a comer con Ana).';
const UNRES = 'Такого варіанта немає серед перевірених відповідей, тому автоматично ми його не оцінюємо. Порівняйте зі зразком.';

function read(id, role, family, target, rule, instr, text, question, options, revealUk, extra = {}) {
  return choice({
    id, lesson: L, role, family, target,
    prompt: [uk(instr), ...(extra.model ? [ex(...extra.model)] : []), es(text), uk(question)],
    options, rule, full: text, fullUk: revealUk,
    ok: 'Правильно.', bad: `Ні. ${revealUk}`,
  });
}

function write(id, role, family, target, rule, instr, sentence, answers, errors, full, fullUk, extra = {}) {
  return exact({
    id, lesson: L, role, family, target, policy: SENTENCE,
    prompt: [uk(instr), ...(extra.model ? [ex(...extra.model)] : []), ...(sentence ? [es(sentence)] : [])],
    answers, errors, closed: false, rule, glosses: extra.glosses,
    full, fullUk,
    ok: `Правильно: ${full}`, bad: `Тут потрібен perfecto: ${full}`,
    unresolved: UNRES,
  });
}

function pick(id, role, family, sentence, options, full, fullUk, extra = {}) {
  return choice({
    id, lesson: L, role, family, target: CH,
    prompt: [uk(extra.model ? 'Оберіть форму, яка підходить до контексту. Зразок нижче.' : 'Оберіть форму, яка підходить до контексту.'), ...(extra.model ? [ex(...extra.model)] : []), es(sentence)],
    options, rule: CH_RULE, full, fullUk,
    ok: `Правильно: ${full}`, bad: `Контекст підказує інше: ${full}`,
  });
}

const CH_MODEL = ['Normalmente como en casa. Hoy he comido en un restaurante. Mañana voy a comer con Ana.', 'Зазвичай я обідаю вдома. Сьогодні я обідав(-ла) в ресторані. Завтра я обідатиму з Аною.'];

const tasks = [
  // ---------- perfecto.use-current-period: reading ----------
  read('T01', 'supported', 'routine', CP_R, CP_RULE, 'Прочитайте речення і дайте відповідь. Підказка: esta semana — «цього тижня».',
    'Esta semana he ido al gimnasio tres veces.', 'Про який час ідеться?',
    [['Про цей тиждень, який ще не закінчився.', true], ['Про минулий тиждень.', false, 'Esta semana — «цього тижня»: період ще триває.'], ['Про наступний тиждень.', false, 'He ido — дія вже відбулася, а не запланована.']],
    'Цього тижня я тричі ходив(-ла) у спортзал — тиждень ще триває.'),
  read('T02', 'independent', 'work-study', CP_R, CP_RULE, 'Прочитайте речення і дайте відповідь.',
    'Hoy he trabajado mucho y ahora estoy muy cansada.', 'Що ми дізналися?',
    [['Сьогодні вона багато працювала, і тепер утомлена.', true], ['Вона збирається сьогодні багато працювати.', false], ['Вона щодня багато працює.', false]],
    'Сьогодні вона багато працювала, і тепер дуже втомлена.'),
  read('T03', 'delayed', 'leisure', CP_R, CP_RULE, 'Прочитайте речення і дайте відповідь.',
    'Este año mis padres han viajado mucho.', 'Що означає речення?',
    [['Цього року батьки багато подорожували, і рік ще не закінчився.', true], ['Батьки планують багато подорожувати.', false], ['Батьки завжди багато подорожують.', false]],
    'Цього року мої батьки багато подорожували.'),
  read('T04', 'transfer', 'messages', CP_R, CP_RULE, 'Прочитайте повідомлення і дайте відповідь.',
    '¡Hola, Ana! Últimamente he dormido muy poco y estoy cansado.', 'Що пише автор повідомлення?',
    [['Останнім часом він мало спав.', true], ['Він завжди мало спить.', false], ['Цієї ночі він спатиме мало.', false]],
    'Привіт, Ано! Останнім часом я дуже мало спав і втомився.'),
  // ---------- perfecto.use-current-period: construction ----------
  write('T05', 'supported', 'routine', CP_C, CP_RULE, 'Впишіть дієслово в дужках у формі, яка підходить до контексту. Зразок нижче.',
    '—¿Qué tal el día? —Muy bien. Hoy (nosotros, comer) ___ en un restaurante.',
    ['hemos comido', 'nosotros hemos comido'],
    [['comemos', 'Comemos — теперішній час. Вас питають, як минув день, тобто обід уже відбувся: hemos comido.'], ['vamos a comer', 'Vamos a comer — план. Обід уже відбувся: hemos comido.']],
    '—¿Qué tal el día? —Muy bien. Hoy hemos comido en un restaurante.', '—Як минув день? —Дуже добре. Сьогодні ми обідали в ресторані.',
    { model: ['—¿Qué tal el día? —Bien. Esta mañana he desayunado en casa.', '—Як минув день? —Добре. Сьогодні вранці я снідав(-ла) вдома.'] }),
  write('T06', 'independent', 'work-study', CP_C, CP_RULE, 'Впишіть дієслово в дужках у формі, яка підходить до контексту.',
    '—¿Qué has hecho esta mañana? —(yo, escribir) ___ dos correos electrónicos.',
    ['he escrito', 'yo he escrito'],
    [['escribo', 'Escribo — теперішній час. Питають про ранок, який уже минув: he escrito.'], ['voy a escribir', 'Voy a escribir — план. Питають про те, що вже зроблено: he escrito.']],
    '—¿Qué has hecho esta mañana? —He escrito dos correos electrónicos.', '—Що ти робив(-ла) сьогодні вранці? —Написав(-ла) два електронні листи.'),
  write('T07', 'delayed', 'routine', CP_C, CP_RULE, 'Впишіть дієслово в дужках у формі, яка підходить до контексту.',
    'Hoy estoy cansado: esta mañana (yo, levantarse) ___ a las seis.',
    ['me he levantado', 'yo me he levantado'],
    [['me levanto', 'Me levanto — теперішній час (звичка). Ідеться про сьогоднішній ранок, який уже минув: me he levantado.']],
    'Hoy estoy cansado: esta mañana me he levantado a las seis.', 'Сьогодні я втомлений: зранку я встав о шостій.'),
  write('T08', 'transfer', 'messages', CP_C, CP_RULE, 'Повідомлення. Впишіть дієслово в дужках у формі, яка підходить до контексту.',
    '¡Hola, Luis! Hoy (yo, recibir) ___ tu regalo. ¡Muchas gracias!',
    ['he recibido', 'yo he recibido'],
    [['recibo', 'Recibo — теперішній час. Подарунок уже отримано сьогодні: he recibido.'], ['voy a recibir', 'Voy a recibir — план. За подарунок дякують, отже, його вже отримали: he recibido.']],
    '¡Hola, Luis! Hoy he recibido tu regalo. ¡Muchas gracias!', 'Привіт, Луїсе! Сьогодні я отримав(-ла) твій подарунок. Щиро дякую!'),

  // ---------- perfecto.use-experience: reading ----------
  read('T09', 'supported', 'travel', EX_R, EX_RULE, 'Прочитайте діалог і дайте відповідь. Підказка: nunca — «ніколи», alguna vez — «колись, хоч раз».',
    '—¿Has estado alguna vez en Sevilla? —No, nunca he estado allí.', 'Чи бувала ця людина в Севільї?',
    [['Ні, ніколи не бувала.', true], ['Так, один раз.', false], ['Так, і скоро поїде туди знову.', false]],
    '—Ти колись бував(-ла) у Севільї? —Ні, я ніколи там не був(-ла).'),
  read('T10', 'independent', 'leisure', EX_R, EX_RULE, 'Прочитайте діалог і дайте відповідь.',
    '—¿Vamos a ver esta película? —No, gracias: ya la he visto.', 'Чому людина не хоче йти?',
    [['Вона вже бачила цей фільм.', true], ['Вона ще не бачила цього фільму.', false], ['Вона ніколи не ходить у кіно.', false]],
    '—Подивимося цей фільм? —Ні, дякую: я його вже бачив(-ла).'),
  read('T11', 'delayed', 'home', EX_R, EX_RULE, 'Прочитайте діалог і дайте відповідь.',
    '—¿Comemos? —Sí, por favor: todavía no he comido.', 'Що ми дізналися?',
    [['Людина ще не обідала.', true], ['Людина вже пообідала.', false], ['Людина ніколи не обідає.', false]],
    '—Пообідаємо? —Так, будь ласка: я ще не обідав(-ла).'),
  read('T12', 'transfer', 'work-study', EX_R, EX_RULE, 'Прочитайте питання і дайте відповідь.',
    '¿Has trabajado alguna vez en una oficina?', 'Про що питають?',
    [['Чи працювала ця людина в офісі хоч раз у житті.', true], ['Чи працює вона в офісі зараз.', false], ['Чи працюватиме вона в офісі.', false]],
    'Ти колись працював(-ла) в офісі?'),
  // ---------- perfecto.use-experience: construction ----------
  write('T13', 'supported', 'travel', EX_C, EX_RULE, 'Дайте заперечну відповідь з nunca: впишіть пропущені слова. Зразок нижче.',
    '—¿Has estado alguna vez en Toledo? —No, ___ en Toledo.',
    ['nunca he estado', 'no he estado nunca'],
    [['he nunca estado', 'Між haber і дієприкметником нічого не ставимо: nunca he estado.'], ['nunca estoy', 'Nunca estoy — теперішній час. Питають про досвід у житті: nunca he estado.']],
    '—¿Has estado alguna vez en Toledo? —No, nunca he estado en Toledo.', '—Ти колись бував(-ла) у Толедо? —Ні, я ніколи не був(-ла) у Толедо.',
    { model: ['—¿Has estado alguna vez en Sevilla? —No, nunca he estado en Sevilla.', '—Ти колись бував(-ла) у Севільї? —Ні, я ніколи не був(-ла) у Севільї.'] }),
  write('T14', 'independent', 'home', EX_C, EX_RULE, 'Перекладіть іспанською, використайте todavía: «Я ще не обідав(-ла)».',
    null,
    ['Todavía no he comido.', 'No he comido todavía.', 'Yo todavía no he comido.'],
    [['Todavía he no comido.', 'Між haber і дієприкметником нічого не ставимо: Todavía no he comido.'], ['Ya he comido.', 'Ya — «вже». «Ще не» — todavía no: Todavía no he comido.']],
    'Todavía no he comido.', 'Я ще не обідав(-ла).'),
  write('T15', 'delayed', 'work-study', EX_C, EX_RULE, 'Дайте ствердну відповідь з ya: впишіть пропущені слова.',
    '—¿Has terminado el trabajo? —Sí, ___',
    ['ya lo he terminado.', 'ya he terminado.', 'lo he terminado ya.', 'he terminado ya.'],
    [['he ya terminado.', 'Між haber і дієприкметником нічого не ставимо: ya he terminado.']],
    '—¿Has terminado el trabajo? —Sí, ya lo he terminado.', '—Ти закінчив(-ла) роботу? —Так, я вже її закінчив(-ла).'),
  write('T16', 'transfer', 'messages', EX_C, EX_RULE, 'Повідомлення. Впишіть дієслово в дужках у потрібній формі.',
    '¡Hola, Ana! ¿(tú, ver) ___ alguna vez una película española?',
    ['has visto', 'tú has visto'],
    [['vas a ver', 'Vas a ver — план. Питають про досвід у житті: has visto.']],
    '¡Hola, Ana! ¿Has visto alguna vez una película española?', 'Привіт, Ано! Ти колись дивилася іспанський фільм?'),

  // ---------- perfecto.choice-context ----------
  pick('T17', 'supported', 'home', '—¿Qué tal la comida con Luis? —Muy bien. Hoy ___ en un restaurante muy bonito.',
    [['hemos comido', true], ['comemos', false, 'Comemos описує звичку або те, що відбувається зараз. Обід уже був: hemos comido.'], ['vamos a comer', false, 'Vamos a comer — план. Вас питають, як пройшов обід, отже, він уже відбувся: hemos comido.']],
    '—¿Qué tal la comida con Luis? —Muy bien. Hoy hemos comido en un restaurante muy bonito.', '—Як пройшов обід із Луїсом? —Дуже добре. Сьогодні ми обідали в дуже гарному ресторані.',
    { model: CH_MODEL }),
  pick('T18', 'supported', 'work-study', 'Normalmente ___ a las nueve, pero hoy he empezado a las diez.',
    [['empiezo', true], ['he empezado', false, 'Normalmente — «зазвичай»: це звичка, тому теперішній час empiezo.'], ['voy a empezar', false, 'Voy a empezar — план. Normalmente описує звичку: empiezo.']],
    'Normalmente empiezo a las nueve, pero hoy he empezado a las diez.', 'Зазвичай я починаю о дев’ятій, але сьогодні почав(-ла) о десятій.',
    { model: CH_MODEL }),
  pick('T19', 'independent', 'home', 'Ahora mismo ___ la cena: no puedo hablar.',
    [['estoy haciendo', true], ['he hecho', false, 'Ahora mismo — «просто зараз»: дія триває, тому estoy haciendo.']],
    'Ahora mismo estoy haciendo la cena: no puedo hablar.', 'Просто зараз я готую вечерю: не можу говорити.'),
  pick('T20', 'independent', 'work-study', '—¿Dónde están las llaves de la oficina? —No sé, hoy no las ___.',
    [['he visto', true], ['voy a ver', false, 'Voy a ver — план. Людина пояснює, що сьогодні ключів не бачила: no las he visto.']],
    '—¿Dónde están las llaves de la oficina? —No sé, hoy no las he visto.', '—Де ключі від офісу? —Не знаю, сьогодні я їх не бачив(-ла).'),
  pick('T21', 'independent', 'leisure', 'El sábado que viene ___ a la playa con mis amigos.',
    [['voy a ir', true], ['he ido', false, 'El sábado que viene — «наступної суботи»: це план, тому voy a ir.']],
    'El sábado que viene voy a ir a la playa con mis amigos.', 'Наступної суботи я поїду на пляж із друзями.'),
  pick('T22', 'delayed', 'home', 'Los domingos siempre ___ con mi familia.',
    [['como', true], ['he comido', false, 'Los domingos siempre — звичка, яка повторюється: теперішній час como.']],
    'Los domingos siempre como con mi familia.', 'По неділях я завжди обідаю з родиною.'),
  pick('T23', 'delayed', 'work-study', '—¿Por qué estás tan cansado? —Porque hoy ___ diez horas.',
    [['he trabajado', true], ['voy a trabajar', false, 'Утома пояснюється тим, що вже відбулося сьогодні: he trabajado.']],
    '—¿Por qué estás tan cansado? —Porque hoy he trabajado diez horas.', '—Чому ти такий утомлений? —Бо сьогодні я працював десять годин.'),
  pick('T24', 'transfer', 'messages', '¡Hola, Ana! Son las ocho de la tarde y estoy en casa. Esta mañana ___ a tu hermano en el autobús.',
    [['he visto', true], ['voy a ver', false, 'Зараз вечір, тож ранок уже минув: he visto.']],
    '¡Hola, Ana! Son las ocho de la tarde y estoy en casa. Esta mañana he visto a tu hermano en el autobús.', 'Привіт, Ано! Зараз восьма вечора, я вдома. Сьогодні вранці я бачив(-ла) твого брата в автобусі.'),
];

const ids = (...n) => n.map((x) => `${L}-T${String(x).padStart(2, '0')}`);

export default {
  lesson: lesson({
    id: L,
    titleUk: 'Коли вживаємо pretérito perfecto compuesto',
    termEs: 'usos del pretérito perfecto compuesto',
    summaryUk:
      'Perfecto описує завершені дії в періоді, який ще триває (hoy, esta semana, este año), і досвід у житті без точної дати (alguna vez, nunca, ya, todavía no). Як обрати між perfecto, теперішнім часом та ir a + інфінітив.',
    objectives: ['A2-03-O7'],
    situations: ['routine-study-leisure', 'time-appointments-transport', 'places-accommodation'],
    estimatedMinutes: 18,
    introduces: ['perfecto.use-current-period', 'perfecto.use-experience', 'perfecto.choice-context'],
    revisits: ['perfecto.word-order', 'perfecto.pronoun-placement', 'participle.regular-ar', 'participle.visto', 'participle.hecho', 'participle.escrito', 'neg.nunca', 'contrast.routine-now-plan', 'future-ir.ir-a-inf', 'progressive.estar-gerund'],
    steps: [
      step('s1', 'explanation', 'Період, який ще триває', true, {
        blocks: [
          uk('У мовленні більшої частини Іспанії perfecto вживаємо для завершених дій у періоді, який ще не закінчився або включає «зараз»: hoy, esta mañana, esta semana, este mes, este año, últimamente («останнім часом»).'),
          ex('Hoy he trabajado mucho.', 'Сьогодні я багато працював(-ла).'),
          ex('Esta semana he ido al cine dos veces.', 'Цього тижня я двічі ходив(-ла) в кіно.'),
          ex('Últimamente he dormido poco.', 'Останнім часом я мало спав(-ла).'),
          uk('Слово часу — підказка, а не автоматичне правило: важливо, що період ще триває або що результат важливий зараз.'),
          uk('На північному заході Іспанії, на Канарських островах і в Латинській Америці в таких реченнях часто вживають простий минулий час (він буде в наступному блоці). У цьому курсі моделлю для таких речень є perfecto.'),
        ],
      }),
      step('s2', 'explanation', 'Досвід: alguna vez, nunca, ya, todavía no', true, {
        blocks: [
          uk('Perfecto також описує досвід у житті до цього моменту, без точної дати.'),
          ex('¿Has estado alguna vez en Sevilla?', 'Ти колись бував(-ла) у Севільї?'),
          ex('No, nunca he estado en Sevilla.', 'Ні, я ніколи не був(-ла) у Севільї.'),
          ex('Ya he terminado.', 'Я вже закінчив(-ла).'),
          ex('Todavía no he comido.', 'Я ще не обідав(-ла).'),
          uk('Нові слова: ya — «вже»; todavía — «ще», todavía no — «ще не»; alguna vez — «колись, хоч раз»; últimamente — «останнім часом».'),
          uk('Ya і todavía no ставимо перед haber або після дієприкметника: Ya he comido / He comido ya; Todavía no he comido / No he comido todavía. Nunca — перед haber (Nunca he estado) або після дієприкметника, і тоді перед haber ставимо no (No he estado nunca).'),
        ],
      }),
      step('s3', 'explanation', 'Perfecto, теперішній час чи ir a', true, {
        blocks: [
          uk('Порівняйте:'),
          ex('Normalmente como en casa.', 'Зазвичай я обідаю вдома. (звичка — теперішній час)'),
          ex('Hoy he comido en un restaurante.', 'Сьогодні я обідав(-ла) в ресторані. (уже відбулося — perfecto)'),
          ex('Mañana voy a comer con Ana.', 'Завтра я обідатиму з Аною. (план — ir a + інфінітив)'),
          ex('Ahora mismo estoy comiendo.', 'Просто зараз я їм. (дія триває — estar + герундій)'),
          uk('Обираючи форму, дивіться на весь контекст: що вже відбулося, що повторюється, що триває зараз, а що ще попереду.'),
        ],
      }),
      step('s4', 'supported-practice', 'Практика з підказкою', true, { taskIds: ids(1, 5, 9, 13, 17, 18) }),
      step('s5', 'independent-practice', 'Самостійна практика', true, { taskIds: ids(2, 6, 10, 14, 19, 20, 21) }),
      step('s6', 'summary', 'Підсумок', true, {
        blocks: [
          ukList([
            'Perfecto: дія вже відбулася в період, що ще триває (hoy, esta semana, este año).',
            'Perfecto: досвід у житті — alguna vez, nunca, ya, todavía no.',
            'Звичка — теперішній час; план — ir a + інфінітив; дія зараз — estar + герундій.',
            'Одне слово часу не вирішує: дивіться на весь контекст.',
          ]),
        ],
      }),
    ],
  }),
  tasks,
};
