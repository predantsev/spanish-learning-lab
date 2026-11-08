// Course phrase identities (content/source/phrases.json) and the eight prepared collections
// (content/source/collections.json). Every phrase is taken from (or is a direct instance of) the
// scope.forms of the skill(s) listed, and firstLesson is the latest of those skills' firstLesson and
// the firstLesson of its words in the merged lexicon.
const G = 'greetings-introductions';
const HOME = 'people-family-home';
const ROUT = 'routine-study-leisure';
const FOOD = 'food-shopping';
const TIME = 'time-appointments-transport';
const PLACE = 'places-accommodation';
const PROB = 'conditions-weather-problems';
const MSG = 'personal-messages';
const NOTE = 'instructions-notices';

// [slug, spanish, ukrainian, firstLesson, skills, situations, extra recall variants, noteUk]
const P = [
  // greetings and social formulas
  ['hola-que-tal', 'Hola, ¿qué tal?', 'Привіт, як справи?', 'A1-01-L3', ['formula.greeting'], [G], ['Hola. ¿Qué tal?', '¡Hola! ¿Qué tal?']],
  ['buenos-dias', 'Buenos días.', 'Доброго ранку! / Добрий день!', 'A1-01-L3', ['formula.greeting'], [G], ['¡Buenos días!'], 'В Іспанії так вітаються зранку і до обіду.'],
  ['buenas-tardes', 'Buenas tardes.', 'Добрий день! / Добрий вечір!', 'A1-01-L3', ['formula.greeting'], [G], ['¡Buenas tardes!'], 'Після обіду і до темряви.'],
  ['buenas-noches', 'Buenas noches.', 'Добрий вечір! / На добраніч!', 'A1-01-L3', ['formula.greeting', 'formula.leave-taking'], [G], ['¡Buenas noches!'], 'Увечері, коли вже темно: і як привітання, і як прощання.'],
  ['como-estas', '¿Cómo estás?', 'Як ти? / Як у тебе справи?', 'A1-03-L3', ['estar.state'], [G], []],
  ['como-te-llamas', '¿Cómo te llamas?', 'Як тебе звати?', 'A1-03-L2', ['formula.introduction'], [G], []],
  ['mucho-gusto', 'Mucho gusto.', 'Дуже приємно.', 'A1-03-L2', ['formula.introduction'], [G], ['¡Mucho gusto!'], 'Кажуть при знайомстві.'],
  ['encantado', 'Encantado.', 'Дуже приємно (познайомитися).', 'A1-03-L2', ['formula.introduction'], [G], ['¡Encantado!', 'Encantada.', '¡Encantada!'], 'Чоловік каже encantado, жінка — encantada.'],
  ['muchas-gracias', 'Muchas gracias.', 'Дуже дякую.', 'A1-01-L3', ['formula.please-thanks'], [G], ['¡Muchas gracias!']],
  ['de-nada', 'De nada.', 'Нема за що.', 'A1-01-L3', ['formula.please-thanks'], [G], []],
  ['por-favor', 'Por favor.', 'Будь ласка (у проханні).', 'A1-01-L3', ['formula.please-thanks'], [G], []],
  ['lo-siento', 'Lo siento.', 'Мені шкода. / Перепрошую.', 'A1-01-L3', ['formula.apology'], [G], []],
  ['perdon', 'Perdón.', 'Вибачте! / Перепрошую!', 'A1-01-L3', ['formula.apology'], [G], ['¡Perdón!']],
  ['hasta-luego', 'Hasta luego.', 'До зустрічі! / Бувай!', 'A1-01-L3', ['formula.leave-taking'], [G], ['¡Hasta luego!']],
  ['adios', 'Adiós.', 'До побачення! / Бувай!', 'A1-01-L3', ['formula.leave-taking'], [G], ['¡Adiós!']],
  ['hasta-manana', 'Hasta mañana.', 'До завтра!', 'A1-01-L3', ['formula.leave-taking'], [G], ['¡Hasta mañana!']],
  ['hasta-pronto', '¡Hasta pronto!', 'До скорого!', 'A1-06-L6', ['formula.message-opening-closing'], [G, MSG], ['Hasta pronto.']],
  ['nos-vemos', 'Nos vemos.', 'Побачимося!', 'A1-06-L6', ['formula.message-opening-closing'], [G, MSG], ['¡Nos vemos!']],
  ['vale', 'Vale.', 'Гаразд. / Домовились.', 'A1-06-L4', ['formula.invitation'], [G, MSG], ['¡Vale!'], 'Дуже поширене в Іспанії слово згоди.'],
  ['quieres-ir-al-cine', '¿Quieres ir al cine el sábado?', 'Хочеш піти в кіно в суботу?', 'A1-06-L4', ['formula.invitation'], [MSG, ROUT], []],
  ['el-sabado-trabajo', 'Lo siento, el sábado trabajo.', 'Вибач, у суботу я працюю.', 'A1-06-L4', ['formula.invitation'], [MSG], []],

  // shop and food
  ['que-desea', '¿Qué desea?', 'Що бажаєте?', 'A1-05-L2', ['formula.shop'], [FOOD], [], 'Так питає продавець, звертаючись на usted.'],
  ['me-pone-un-cafe', '¿Me pone un café, por favor?', 'Можна мені каву, будь ласка?', 'A1-05-L2', ['formula.shop'], [FOOD], ['Por favor, ¿me pone un café?'], 'Звичайне замовлення в барі в Іспанії: poner у формі usted.'],
  ['un-kilo-de-tomates', 'Un kilo de tomates, por favor.', 'Кілограм помідорів, будь ласка.', 'A1-05-L2', ['formula.shop', 'quant.containers'], [FOOD], []],
  ['algo-mas', '¿Algo más?', 'Щось іще?', 'A1-05-L2', ['formula.shop'], [FOOD], []],
  ['nada-mas-gracias', 'Nada más, gracias.', 'Більше нічого, дякую.', 'A1-05-L2', ['formula.shop'], [FOOD], ['Nada más. Gracias.']],
  ['aqui-tiene', 'Aquí tiene.', 'Ось, прошу.', 'A1-05-L2', ['formula.shop'], [FOOD], [], 'Кажуть, коли подають покупку, гроші чи решту (звертаючись на usted).'],
  ['cuanto-es', '¿Cuánto es?', 'Скільки з мене?', 'A1-05-L2', ['price.ask-answer'], [FOOD], []],
  ['cuanto-cuesta-el-pan', '¿Cuánto cuesta el pan?', 'Скільки коштує хліб?', 'A1-05-L2', ['price.ask-answer'], [FOOD], []],
  ['efectivo-o-tarjeta', '¿En efectivo o con tarjeta?', 'Готівкою чи карткою?', 'A1-05-L2', ['formula.shop'], [FOOD], []],
  ['con-tarjeta', 'Con tarjeta, por favor.', 'Карткою, будь ласка.', 'A1-05-L2', ['formula.shop'], [FOOD], []],
  ['la-cuenta', 'La cuenta, por favor.', 'Рахунок, будь ласка.', 'A1-05-L2', ['formula.shop'], [FOOD], []],
  ['queria-dos-barras', 'Quería dos barras de pan.', 'Я хотів би (хотіла б) два багети.', 'A2-07-L1', ['formula.request-queria'], [FOOD], [], 'Quería — ввічлива форма прохання, яка стосується теперішнього бажання.'],
  ['me-pasas-el-pan', '¿Me pasas el pan?', 'Передаси мені хліб?', 'A2-07-L1', ['formula.request-object'], [FOOD, HOME], []],
  ['puedo-pagar-con-tarjeta', '¿Puedo pagar con tarjeta?', 'Можна заплатити карткою?', 'A2-07-L2', ['formula.permission-puedo'], [FOOD], []],

  // transport and time
  ['que-hora-es', '¿Qué hora es?', 'Котра година?', 'A1-05-L3', ['time.clock.hours'], [TIME], []],
  ['a-que-hora-sale-el-tren', '¿A qué hora sale el tren?', 'О котрій відходить потяг?', 'A1-05-L3', ['time.event.a-las'], [TIME], []],
  ['el-tren-sale', 'El tren sale a las diez y media.', 'Потяг відходить о пів на одинадцяту (о 10:30).', 'A1-05-L3', ['time.event.a-las', 'time.clock.minutes'], [TIME], []],
  ['que-dia-es-hoy', '¿Qué día es hoy?', 'Який сьогодні день?', 'A1-05-L4', ['date.full-date'], [TIME], []],
  ['donde-esta-la-estacion', '¿Dónde está la estación?', 'Де вокзал?', 'A1-03-L6', ['question.word.donde', 'estar.location'], [TIME, PLACE], [], 'Estación — і залізничний вокзал, і станція (метро, автобусів).'],
  ['queria-un-billete', 'Quería un billete para Toledo.', 'Я хотів би (хотіла б) квиток до Толедо.', 'A2-07-L1', ['formula.request-queria'], [TIME], []],
  ['sigue-todo-recto', 'Sigue todo recto.', 'Іди весь час прямо.', 'A2-07-L7', ['formula.directions', 'imperative.tu.stem-change'], [PLACE, TIME], [], 'Звертання на «ти».'],
  ['siga-todo-recto', 'Siga todo recto.', 'Ідіть весь час прямо.', 'A2-07-L7', ['formula.directions', 'imperative.usted.stem-change'], [PLACE, TIME], [], 'Звертання на usted.'],
  ['gira-a-la-derecha', 'Gira a la derecha.', 'Поверни праворуч.', 'A2-07-L7', ['formula.directions', 'imperative.tu.regular'], [PLACE, TIME], [], 'Звертання на «ти».'],
  ['gire-a-la-izquierda', 'Gire a la izquierda.', 'Поверніть ліворуч.', 'A2-07-L7', ['formula.directions', 'imperative.usted.regular'], [PLACE, TIME], [], 'Звертання на usted.'],
  ['tenemos-que-salir', 'Tenemos que salir a las ocho.', 'Нам треба вийти о восьмій.', 'A2-01-L6', ['obligation.tener-que'], [TIME], []],
  ['hay-que-llegar-antes', 'Hay que llegar diez minutos antes.', 'Треба прийти на десять хвилин раніше.', 'A2-07-L7', ['obligation.hay-que'], [TIME, NOTE], []],

  // appointments
  ['tengo-una-cita', 'Tengo una cita con el médico.', 'У мене запис до лікаря.', 'A1-05-L4', ['date.appointment'], [TIME], []],
  ['cuando-es-la-cita', '¿Cuándo es la cita?', 'Коли прийом?', 'A1-05-L4', ['date.appointment', 'question.word.cuando'], [TIME], []],
  ['la-cita-es-el-martes', 'La cita es el martes a las diez.', 'Прийом у вівторок о десятій.', 'A1-05-L4', ['date.appointment'], [TIME], []],
  ['queria-cambiar-la-cita', 'Quería cambiar la cita.', 'Я хотів би (хотіла б) перенести запис.', 'A2-07-L1', ['formula.request-queria'], [TIME], [], 'Cambiar la cita — змінити час запису, перенести прийом чи зустріч.'],
  ['puede-repetir', '¿Puede repetir, por favor?', 'Можете повторити, будь ласка?', 'A2-07-L1', ['formula.request-puedes'], [TIME, G], ['Por favor, ¿puede repetir?']],
  ['puedes-venir-el-sabado', '¿Puedes venir el sábado?', 'Можеш прийти в суботу?', 'A2-01-L6', ['ability.poder-inf'], [MSG], []],
  ['hoy-no-puedo-salir', 'Hoy no puedo salir.', 'Сьогодні я не можу кудись піти.', 'A2-01-L6', ['ability.poder-inf'], [MSG], []],
  ['lo-siento-ahora-no-puedo', 'Lo siento, pero ahora no puedo.', 'Вибач, але зараз я не можу.', 'A2-07-L2', ['formula.response-refuse-reason'], [MSG, G], []],
  ['te-escribo-para-cambiar', 'Te escribo para cambiar la cita.', 'Пишу тобі, щоб перенести зустріч.', 'A2-07-L8', ['prep.para-purpose'], [MSG, TIME], []],
  ['quedamos-el-sabado', '¿Quedamos el sábado?', 'Зустрінемося в суботу?', 'A2-08-L2', ['question.yes-no', 'date.el-lunes'], [MSG, TIME], [], 'Quedar — домовлятися про зустріч, зустрічатися.'],

  // home and accommodation
  ['el-piso-es-pequeno', 'El piso es pequeño.', 'Квартира маленька.', 'A1-03-L2', ['ser.description'], [HOME, PLACE], []],
  ['donde-esta-el-hotel', '¿Dónde está el hotel?', 'Де готель?', 'A1-03-L3', ['estar.location'], [PLACE], []],
  ['hay-un-hotel-aqui', '¿Hay un hotel aquí?', 'Тут є готель?', 'A1-03-L4', ['hay.existence'], [PLACE], []],
  ['en-mi-calle-hay-una-tienda', 'En mi calle hay una tienda.', 'На моїй вулиці є магазин.', 'A1-03-L4', ['hay.existence'], [HOME, PLACE], []],
  ['las-llaves-estan-encima', 'Las llaves están encima de la mesa.', 'Ключі лежать на столі.', 'A1-05-L5', ['prep.spatial.object', 'estar.location'], [HOME], []],
  ['piso-pequeno-pero-luminoso', 'Es un piso pequeño, pero muy luminoso.', 'Це маленька, але дуже світла квартира.', 'A2-02-L7', ['writing.description-detail'], [PLACE, HOME], []],
  ['este-piso-es-mas-caro', 'Este piso es más caro que ese.', 'Ця квартира дорожча за ту.', 'A2-02-L6', ['compare.mas-menos-que'], [PLACE], []],
  ['cuanto-cuesta-el-alquiler', '¿Cuánto cuesta el alquiler?', 'Скільки коштує оренда?', 'A2-02-L6', ['price.ask-answer'], [PLACE], []],
  ['se-alquila-piso', 'Se alquila piso', 'Здається квартира', 'A2-07-L7', ['formula.notice-se'], [PLACE, NOTE], ['Se alquila piso.'], 'Напис на оголошенні.'],
  ['puedo-abrir-la-ventana', '¿Puedo abrir la ventana?', 'Можна відчинити вікно?', 'A2-07-L2', ['formula.permission-puedo'], [HOME], []],
  ['puedes-cerrar-la-ventana', '¿Puedes cerrar la ventana?', 'Можеш зачинити вікно?', 'A2-07-L1', ['formula.request-puedes'], [HOME], ['¿Me puedes cerrar la ventana?']],
  ['la-calefaccion-no-funciona', 'La calefacción no funciona.', 'Опалення не працює.', 'A2-07-L8', ['neg.no-before-verb', 'writing.practical-message-reason'], [PROB, PLACE], []],

  // routine, study and work
  ['me-levanto-temprano', 'Me levanto temprano.', 'Я встаю рано.', 'A1-04-L4', ['reflexive.placement'], [ROUT], []],
  ['trabajo-en-una-oficina', 'Trabajo en una oficina.', 'Я працюю в офісі.', 'A1-04-L1', ['present.regular-ar'], [ROUT], []],
  ['que-haces', '¿Qué haces?', 'Що ти робиш?', 'A1-04-L3', ['present.hacer'], [ROUT], []],
  ['los-lunes-trabajo-en-casa', 'Los lunes trabajo en casa.', 'По понеділках я працюю вдома.', 'A1-05-L4', ['date.el-lunes'], [ROUT], []],
  ['estudio-espanol-porque', 'Estudio español porque quiero vivir en Madrid.', 'Я вивчаю іспанську, бо хочу жити в Мадриді.', 'A1-06-L5', ['link.porque'], [ROUT], []],
  ['despues-del-trabajo', 'Después del trabajo voy al gimnasio.', 'Після роботи я йду в спортзал.', 'A1-06-L5', ['link.sequence.antes-despues-de'], [ROUT], []],
  ['manana-trabajo-en-casa', 'Mañana trabajo en casa.', 'Завтра я працюю вдома.', 'A1-06-L4', ['time.plan.present-for-future'], [ROUT], []],
  ['estoy-trabajando', 'Estoy trabajando.', 'Я зараз працюю.', 'A2-01-L4', ['progressive.estar-gerund'], [ROUT], []],
  ['tengo-que-trabajar', 'Tengo que trabajar.', 'Мені треба працювати.', 'A2-01-L6', ['obligation.tener-que'], [ROUT], []],
  ['empiezo-a-trabajar', 'Empiezo a trabajar a las nueve.', 'Я починаю працювати о дев’ятій.', 'A2-01-L6', ['perifrasis.empezar-a'], [ROUT], []],
  ['acabo-de-llegar', 'Acabo de llegar.', 'Я щойно прийшов (прийшла).', 'A2-01-L6', ['perifrasis.acabar-de'], [ROUT], []],
  ['hoy-he-trabajado-mucho', 'Hoy he trabajado mucho.', 'Сьогодні я багато працював (працювала).', 'A2-03-L6', ['perfecto.use-current-period'], [ROUT], []],

  // requests and simple problems
  ['puedes-ayudarme', '¿Puedes ayudarme?', 'Можеш мені допомогти?', 'A2-07-L1', ['formula.request-puedes'], [HOME, MSG], ['¿Me puedes ayudar?']],
  ['me-das-un-vaso-de-agua', '¿Me das un vaso de agua?', 'Даси мені склянку води?', 'A2-07-L1', ['formula.request-object'], [HOME, FOOD], []],
  ['me-dejas-tu-boli', '¿Me dejas tu boli?', 'Позичиш мені свою ручку?', 'A2-07-L1', ['formula.request-object'], [HOME, ROUT], []],
  ['puedo-usar-tu-cargador', '¿Puedo usar tu cargador?', 'Можна скористатися твоїм зарядним?', 'A2-07-L2', ['formula.permission-puedo'], [HOME], []],
  ['si-claro', 'Sí, claro.', 'Так, звісно.', 'A2-07-L2', ['formula.response-accept'], [G, MSG], ['¡Sí, claro!']],
  ['por-supuesto', 'Por supuesto.', 'Звісно. / Безперечно.', 'A2-07-L2', ['formula.response-accept'], [G, MSG], ['¡Por supuesto!']],
  ['sin-problema', 'Sin problema.', 'Без проблем.', 'A2-07-L2', ['formula.response-accept'], [G, MSG], ['¡Sin problema!']],
  ['es-que-no-tengo-coche', 'Lo siento, es que no tengo coche.', 'Вибач, просто в мене немає машини.', 'A2-07-L2', ['formula.response-refuse-reason'], [MSG], [], 'Es que ≈ «справа в тому, що», «просто»: так м’яко пояснюють причину відмови.'],
  ['espera-un-momento', 'Espera un momento, por favor.', 'Зачекай хвилинку, будь ласка.', 'A2-07-L3', ['imperative.tu.regular'], [HOME, G], []],
  ['ten-cuidado', 'Ten cuidado.', 'Будь обережний (обережна)!', 'A2-07-L4', ['imperative.tu.tener'], [HOME], ['¡Ten cuidado!']],
  ['digame', '¿Dígame?', 'Алло, слухаю!', 'A2-07-L6', ['imperative.usted.yo-g', 'imperative.pronoun-placement'], [G], ['Dígame.'], 'Так в Іспанії часто відповідають на телефонний дзвінок.'],

  // experiences and past messages
  ['has-estado-alguna-vez', '¿Has estado alguna vez en Sevilla?', 'Ти колись бував (бувала) в Севільї?', 'A2-03-L6', ['perfecto.use-experience'], [ROUT, MSG], []],
  ['nunca-he-estado', 'No, nunca he estado en Sevilla.', 'Ні, я ніколи не був (не була) в Севільї.', 'A2-03-L6', ['perfecto.use-experience'], [ROUT, MSG], []],
  ['ya-he-terminado', 'Ya he terminado.', 'Я вже закінчив (закінчила).', 'A2-03-L6', ['perfecto.use-experience'], [ROUT], []],
  ['todavia-no-he-comido', 'Todavía no he comido.', 'Я ще не їв (не їла).', 'A2-03-L6', ['perfecto.use-experience'], [ROUT, FOOD], []],
  ['he-ido-al-cine', 'Esta semana he ido al cine dos veces.', 'Цього тижня я двічі ходив (ходила) в кіно.', 'A2-03-L6', ['perfecto.use-current-period'], [ROUT], []],
  ['ayer-fui-al-medico', 'Ayer fui al médico.', 'Учора я ходив (ходила) до лікаря.', 'A2-04-L7', ['indefinido.use-completed-event'], [ROUT, TIME], []],
  ['el-sabado-pasado-comimos', 'El sábado pasado comimos en casa de Ana.', 'Минулої суботи ми обідали в Ани.', 'A2-04-L7', ['indefinido.use-completed-event'], [ROUT, HOME], []],
  ['llegue-hace-dos-dias', 'Llegué hace dos días.', 'Я приїхав (приїхала) два дні тому.', 'A2-04-L7', ['time.hace-ago'], [TIME, MSG], []],
  ['primero-desayune', 'Primero desayuné y después salí de casa.', 'Спочатку я поснідав (поснідала), а потім вийшов (вийшла) з дому.', 'A2-04-L8', ['link.past-sequence'], [ROUT], []],
  ['al-dia-siguiente-volvi', 'Al día siguiente volví a casa.', 'Наступного дня я повернувся (повернулася) додому.', 'A2-04-L8', ['link.past-sequence'], [ROUT, TIME], []],
  ['de-pequeno-iba-a-la-playa', 'De pequeño iba a la playa todos los veranos.', 'У дитинстві я щоліта їздив (їздила) на море.', 'A2-06-L3', ['contrast.indefinido-imperfecto.habit-event'], [ROUT], ['De pequeña iba a la playa todos los veranos.'], 'Жінка каже: De pequeña…'],
  ['el-verano-pasado-fui', 'El verano pasado fui a la playa.', 'Минулого літа я їздив (їздила) на море.', 'A2-06-L3', ['contrast.indefinido-imperfecto.habit-event'], [ROUT], []],
];

// Construction-variation tasks (A2-08-L6) that reuse a phrase identity, by phrase slug.
export const VARIATION_TASKS = {};

export function buildPhrases() {
  return P.map(([slug, spanish, ukrainian, firstLesson, skills, situations, extra, noteUk]) => {
    const variants = [spanish, ...extra];
    const phrase = {
      id: `phrase.${slug}`,
      spanish,
      ukrainian,
      ...(noteUk ? { noteUk } : {}),
      firstLesson,
      skills,
      situations,
      recall: {
        accepted: variants.map((text, i) => ({ id: `r${i + 1}`, text })),
        policy: { case: 'insensitive', terminalPunctuation: 'optional' },
      },
      ...(VARIATION_TASKS[slug] ? { variationTaskIds: VARIATION_TASKS[slug] } : {}),
      reviewStatus: 'draft',
    };
    return phrase;
  });
}

const C = [
  [
    'greetings-social',
    'Привітання та ввічливі формули',
    'Привітатися, познайомитися, подякувати, вибачитися й попрощатися — готові фрази на кожен день.',
    ['hola-que-tal', 'buenos-dias', 'buenas-tardes', 'buenas-noches', 'como-estas', 'como-te-llamas', 'mucho-gusto', 'encantado', 'muchas-gracias', 'de-nada', 'lo-siento', 'hasta-luego'],
  ],
  [
    'shop-food',
    'Магазин і їжа',
    'Замовити в барі, купити на ринку, запитати ціну й заплатити.',
    ['que-desea', 'me-pone-un-cafe', 'un-kilo-de-tomates', 'algo-mas', 'nada-mas-gracias', 'aqui-tiene', 'cuanto-es', 'cuanto-cuesta-el-pan', 'efectivo-o-tarjeta', 'la-cuenta', 'queria-dos-barras', 'puedo-pagar-con-tarjeta'],
  ],
  [
    'transport-time',
    'Транспорт і час',
    'Котра година, коли відходить потяг, як купити квиток і як пройти.',
    ['que-hora-es', 'a-que-hora-sale-el-tren', 'el-tren-sale', 'que-dia-es-hoy', 'donde-esta-la-estacion', 'queria-un-billete', 'sigue-todo-recto', 'siga-todo-recto', 'gira-a-la-derecha', 'gire-a-la-izquierda', 'tenemos-que-salir', 'hay-que-llegar-antes'],
  ],
  [
    'appointments',
    'Запис і зустрічі',
    'Домовитися про прийом чи зустріч, перенести її, перепитати й відмовитися з причиною.',
    ['tengo-una-cita', 'cuando-es-la-cita', 'la-cita-es-el-martes', 'queria-cambiar-la-cita', 'puede-repetir', 'puedes-venir-el-sabado', 'hoy-no-puedo-salir', 'el-sabado-trabajo', 'lo-siento-ahora-no-puedo', 'te-escribo-para-cambiar', 'quedamos-el-sabado', 'hay-que-llegar-antes'],
  ],
  [
    'home-accommodation',
    'Дім і житло',
    'Описати квартиру, знайти щось удома чи поруч, запитати про оренду й повідомити про несправність.',
    ['el-piso-es-pequeno', 'donde-esta-el-hotel', 'hay-un-hotel-aqui', 'en-mi-calle-hay-una-tienda', 'las-llaves-estan-encima', 'piso-pequeno-pero-luminoso', 'este-piso-es-mas-caro', 'cuanto-cuesta-el-alquiler', 'se-alquila-piso', 'puedo-abrir-la-ventana', 'puedes-cerrar-la-ventana', 'la-calefaccion-no-funciona'],
  ],
  [
    'routine-study-work',
    'Розпорядок, навчання й робота',
    'Розповісти, що ви робите щодня, що треба зробити, що відбувається зараз і що щойно сталося.',
    ['me-levanto-temprano', 'trabajo-en-una-oficina', 'que-haces', 'los-lunes-trabajo-en-casa', 'estudio-espanol-porque', 'despues-del-trabajo', 'manana-trabajo-en-casa', 'estoy-trabajando', 'tengo-que-trabajar', 'empiezo-a-trabajar', 'acabo-de-llegar', 'hoy-he-trabajado-mucho'],
  ],
  [
    'requests-problems',
    'Прохання і прості проблеми',
    'Попросити про допомогу чи річ, погодитися, ввічливо відмовити й повідомити про проблему.',
    ['puedes-ayudarme', 'puede-repetir', 'me-das-un-vaso-de-agua', 'me-dejas-tu-boli', 'puedo-usar-tu-cargador', 'si-claro', 'por-supuesto', 'sin-problema', 'es-que-no-tengo-coche', 'espera-un-momento', 'ten-cuidado', 'la-calefaccion-no-funciona'],
  ],
  [
    'experiences-past',
    'Досвід і минулі події',
    'Розповісти, де ви вже бували, що зробили сьогодні та що сталося раніше.',
    ['has-estado-alguna-vez', 'nunca-he-estado', 'ya-he-terminado', 'todavia-no-he-comido', 'he-ido-al-cine', 'ayer-fui-al-medico', 'el-sabado-pasado-comimos', 'llegue-hace-dos-dias', 'primero-desayune', 'al-dia-siguiente-volvi', 'de-pequeno-iba-a-la-playa', 'el-verano-pasado-fui'],
  ],
];

export function buildCollections() {
  return C.map(([slug, titleUk, descriptionUk, slugs]) => ({
    id: `collection.${slug}`,
    titleUk,
    descriptionUk,
    phraseIds: slugs.map((s) => `phrase.${s}`),
    reviewStatus: 'draft',
  }));
}
