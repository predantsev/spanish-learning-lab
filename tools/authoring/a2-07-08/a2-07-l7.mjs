// A2-07-L7 — understand short instructions, directions and notices, and their order (O7);
// impersonal hay que (CV-05); fixed notice wording (CV-05/CV-06); listening to directions.
import { es, ex, ul, uk } from './lib.mjs';
import { kit, withPF } from './kit.mjs';

const L = 'A2-07-L7';
const RO = 'reading.instructions-order/reading-meaning';
const DR = 'formula.directions/reading-meaning';
const DC = 'formula.directions/construction-use';
const HC = 'obligation.hay-que/construction-use';
const HX = 'obligation.hay-que/context-choice';
const HR = 'obligation.hay-que/reading-meaning';
const NP = 'formula.notice-prohibido/reading-meaning';
const NI = 'formula.notice-infinitive/reading-meaning';
const NS = 'formula.notice-se/reading-meaning';
const LM = 'listening.directions-instructions/listening-meaning';
const DI = 'listening.directions-instructions/dictation';

const unres = 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком.';
const readOk = { ok: 'Правильно! Ви зрозуміли інструкцію.', bad: 'Ні. Прочитайте ще раз і знайдіть слова порядку та дієслова дії.' };
const D = {
  [RO]: { rule: 'Шукайте дієслова дії (наказ або інфінітив), до кого вони звернені, і слова порядку: primero, luego, después, a continuación, por último.', ...readOk },
  [DR]: { rule: 'Маршрут: seguir todo recto — іти прямо; girar a la derecha / a la izquierda — повернути праворуч / ліворуч; coger la primera — звернути на першу вулицю; cruzar — перейти.', ...readOk },
  [DC]: {
    rule: 'Пояснюючи дорогу, вживаємо наказ і напрямок: Sigue todo recto, gira a la derecha, coge la primera a la izquierda, cruza la plaza. До незнайомих людей — usted: Siga todo recto y gire a la izquierda.',
    ok: 'Правильно! Зрозуміла вказівка, як пройти.',
    bad: 'Ще ні. Наказ у потрібній формі + напрямок: Sigue / Siga todo recto, Gira / Gire a la derecha…',
    unres,
  },
  [HC]: {
    rule: 'Hay que + інфінітив — «треба» взагалі, без указівки, хто саме: Hay que reservar mesa. Hay не змінюється. No hay que… — «не потрібно».',
    ok: 'Правильно! Це загальне правило з hay que.',
    bad: 'Ще ні. Загальне правило: Hay que + інфінітив.',
    unres,
  },
  [HX]: {
    rule: 'Hay que — загальне правило без указівки, хто має діяти. Tener que — обов’язок конкретної особи: Tengo que trabajar.',
    ok: 'Правильно! Ви обрали потрібну конструкцію.',
    bad: 'Ні. Подумайте: це загальне правило (hay que) чи обов’язок конкретної людини (tener que)?',
  },
  [HR]: {
    rule: 'Hay que — «треба». No hay que — «не потрібно» (а не «заборонено»).',
    ...readOk,
  },
  [NP]: { rule: 'Prohibido + інфінітив або іменник — заборона: Prohibido fumar — палити заборонено; Prohibido el paso — прохід заборонено.', ...readOk },
  [NI]: { rule: 'На табличках і в рецептах інструкцію часто дають інфінітивом: Empujar — від себе, Tirar — до себе, Pulsar el botón — натисніть кнопку, No tocar — не торкатися.', ...readOk },
  [NS]: { rule: 'Se + дієслово в оголошеннях: Se alquila — здається, Se vende — продається, Se busca — шукаємо (когось).', ...readOk },
  [LM]: {
    rule: 'Слухаючи маршрут чи інструкцію, відзначайте кроки по порядку: куди йти, де повернути, що зробити спочатку і що потім.',
    ok: 'Правильно! Ви зрозуміли інструкцію.',
    bad: 'Ні. Послухайте ще раз; за потреби відкрийте текст запису.',
  },
  [DI]: { rule: 'Запишіть фразу так, як чуєте: зі знаками наголосу.', ok: 'Правильно записано!', bad: 'Є помилка в написанні. Порівняйте із записом.' },
};

const k = kit(L, D);

// ---- reading texts ----
const TEXT_A = 'Hola, Laura: Primero, abre la puerta con la llave grande. Luego, enciende la luz: está a la derecha. A continuación, cierra la ventana de la cocina, por favor. Por último, deja la llave encima de la mesa. ¡Hasta luego! Marta';
const TEXT_B = 'Revuelto de cebolla. Primero, cortar la cebolla. Después, poner la cebolla en la sartén. A continuación, añadir cuatro huevos y mezclar. Por último, servir con pan.';
const TEXT_C = 'Chicos: mañana vamos al museo. Primero, id a la estación a las ocho. Luego, esperad en la entrada. A continuación, comprad el billete en la ventanilla. Por último, coged el tren de las ocho y media.';
const TEXT_D = 'Instrucciones: Primero, coja número. Luego, espere su turno. A continuación, vaya a la ventanilla. Por último, firme el formulario.';

// ---- clips ----
const CLIPS = [
  {
    id: 'clip.a2-07.farmacia-route',
    lessonId: L,
    kind: 'text',
    transcript: '¿La farmacia? Sí, está muy cerca. Siga todo recto hasta el semáforo. Allí, gire a la izquierda. La farmacia está en la esquina, al lado del banco.',
    translationUk: 'Аптека? Так, вона зовсім близько. Ідіть весь час прямо до світлофора. Там поверніть ліворуч. Аптека на розі, поруч із банком.',
    targets: [
      { skillId: 'listening.directions-instructions', modality: 'listening-meaning' },
      { skillId: 'listening.directions-instructions', modality: 'dictation' },
    ],
    family: 'fam.clip-farmacia',
    reviewStatus: 'draft',
  },
  {
    id: 'clip.a2-07.madre-instructions',
    lessonId: L,
    kind: 'text',
    transcript: 'Hola, Pablo, soy mamá. Esta tarde llego tarde a casa. Primero, saca la cena de la nevera. Luego, pon la mesa y llama a tu hermana. Por último, cierra la puerta con llave. ¡Gracias, hijo!',
    translationUk: 'Привіт, Пабло, це мама. Сьогодні ввечері я прийду додому пізно. Спочатку дістань вечерю з холодильника. Потім накрий на стіл і поклич сестру. Наостанок зачини двері на ключ. Дякую, синку!',
    targets: [{ skillId: 'listening.directions-instructions', modality: 'listening-meaning' }],
    family: 'fam.clip-madre',
    reviewStatus: 'draft',
  },
  {
    id: 'clip.a2-07.museo-group',
    lessonId: L,
    kind: 'text',
    transcript: 'Buenos días a todos. Primero, dejen las mochilas en la entrada. Luego, cojan un mapa del museo. A continuación, vayan a la sala uno y esperen allí. Hay que apagar los móviles. ¡Gracias!',
    translationUk: 'Доброго ранку всім. Спочатку залиште рюкзаки на вході. Потім візьміть мапу музею. Далі пройдіть до зали номер один і чекайте там. Треба вимкнути мобільні телефони. Дякуємо!',
    targets: [
      { skillId: 'listening.directions-instructions', modality: 'listening-meaning' },
      { skillId: 'listening.directions-instructions', modality: 'dictation' },
    ],
    family: 'fam.clip-museo',
    reviewStatus: 'draft',
  },
];
const [cF, cM, cU] = CLIPS;

const tasks = [
  // ---- reading.instructions-order (T01–T05) ----
  k.ch(1, 'supported', 'fam.note-home', RO, {
    instr: 'Прочитайте записку. Що Лаура має зробити спочатку?',
    pre: uk('Підказка: шукайте слово primero.'),
    es: TEXT_A,
    opts: [
      ['відчинити двері великим ключем', 'c'],
      ['увімкнути світло', 'x', 'Це другий крок (luego).'],
      ['залишити ключ на столі', 'x', 'Це останній крок (por último).'],
    ],
  }),
  k.ch(2, 'independent', 'fam.note-home', RO, {
    instr: 'Прочитайте записку ще раз. Що Лаура має зробити наприкінці?',
    es: TEXT_A,
    opts: [
      ['залишити ключ на столі', 'c'],
      ['зачинити вікно на кухні', 'x', 'Це третій крок (a continuación).'],
      ['увімкнути світло', 'x', 'Це другий крок (luego).'],
    ],
  }),
  k.ch(3, 'independent', 'fam.recipe', RO, {
    instr: 'Прочитайте рецепт яєчні з цибулею (revuelto de cebolla). Що треба зробити, коли цибуля вже в сковорідці?',
    es: TEXT_B,
    opts: [
      ['додати чотири яйця й перемішати', 'c'],
      ['нарізати цибулю', 'x', 'Це перший крок (primero).'],
      ['подати з хлібом', 'x', 'Це останній крок (por último).'],
    ],
  }),
  k.ch(4, 'delayed', 'fam.note-class', RO, {
    instr: 'Прочитайте записку вчительки. Кому вона адресована і що треба зробити спочатку?',
    es: TEXT_C,
    opts: [
      ['кільком учням: прийти на вокзал о восьмій', 'c'],
      ['одному учневі: купити квиток у касі', 'x', 'Форми id, esperad, comprad — для кількох людей (vosotros), і квиток купують на третьому кроці.'],
      ['кільком учням: сісти на потяг о 8:30', 'x', 'Це останній крок (por último).'],
    ],
  }),
  k.ch(5, 'transfer', 'fam.office-sign', RO, {
    instr: 'Прочитайте інструкцію в установі. Що треба зробити, перш ніж підійти до віконця?',
    es: TEXT_D,
    opts: [
      ['взяти номерок і дочекатися своєї черги', 'c'],
      ['підписати бланк', 'x', 'Бланк підписують наприкінці (por último).'],
      ['одразу підійти до віконця', 'x', 'Спочатку треба взяти номерок (primero) і чекати черги (luego).'],
    ],
  }),

  // ---- formula.directions reading (T06–T08) ----
  k.ch(6, 'independent', 'fam.street', DR, {
    instr: 'Прочитайте, як пройти до музею. Що треба зробити біля площі?',
    es: '¿El museo? Siga todo recto hasta la plaza y gire a la derecha. El museo está al lado del banco.',
    opts: [
      ['повернути праворуч', 'c'],
      ['повернути ліворуч', 'x', 'Gire a la derecha — поверніть праворуч.'],
      ['перейти площу', 'x', 'Про перехід площі тут не йдеться: біля площі треба повернути.'],
    ],
  }),
  k.ch(7, 'delayed', 'fam.street', DR, {
    instr: 'Прочитайте, як пройти до готелю. Що треба перейти?',
    es: 'Coge la primera calle a la izquierda y cruza el parque. El hotel está enfrente.',
    opts: [
      ['парк', 'c'],
      ['площу', 'x', 'Cruza el parque — перейди парк.'],
      ['вулицю', 'x', 'На першу вулицю треба звернути (coge), а перейти — парк.'],
    ],
  }),
  k.ch(8, 'transfer', 'fam.station', DR, {
    instr: 'Прочитайте, як пройти до вокзалу. Де треба перейти вулицю?',
    es: 'Sigue todo recto, cruza la calle en el semáforo y la estación está a la izquierda.',
    opts: [
      ['біля світлофора', 'c'],
      ['на розі', 'x', 'En el semáforo — біля світлофора.'],
      ['біля вокзалу', 'x', 'Вокзал буде ліворуч уже після переходу.'],
    ],
  }),

  // ---- formula.directions construction-use (T09–T18) ----
  k.ch(9, 'supported', 'fam.street', DC, {
    instr: 'Поясніть подрузі дорогу: «Поверни праворуч». Оберіть правильну вказівку.',
    pre: uk('Нагадування: girar → наказ для tú: gira.'),
    opts: [
      ['Gira a la derecha.', 'c'],
      ['Giras a la derecha.', 'x', 'Giras — «ти повертаєш». Наказ для tú: gira.'],
      ['Gire a la derecha.', 'x', 'Gire — для usted. До подруги: gira.'],
    ],
  }),
  k.ev(10, 'supported', 'fam.street', DC, {
    instr: 'За зразком скажіть другові: «Перейди площу» (cruzar la plaza).',
    model: ['Sigue todo recto.', 'Іди весь час прямо.'],
    acc: withPF('Cruza la plaza.'),
    err: [
      ['Cruzas la plaza.', 'Cruzas — «ти переходиш». Наказ для tú: cruza.'],
      ['Cruce la plaza.', 'Cruce — для usted. До друга: cruza.'],
    ],
  }),
  k.ev(11, 'independent', 'fam.street', DC, {
    instr: 'Скажіть незнайомій пані (usted): «Ідіть весь час прямо».',
    acc: [...withPF('Siga todo recto.'), ...withPF('Vaya todo recto.')],
    err: [
      ['Sigue todo recto.', 'Sigue — для tú. До незнайомої пані: siga.'],
      ['Sega todo recto.', 'Від yo sigo: siga.'],
    ],
  }),
  k.ev(12, 'independent', 'fam.street', DC, {
    instr: 'Скажіть другові: «Зверни на першу вулицю ліворуч» (coger).',
    acc: ['Coge la primera a la izquierda.', 'Coge la primera calle a la izquierda.', 'Coge la primera a la izquierda, por favor.'],
    err: [
      ['Coges la primera a la izquierda.', 'Coges — «ти звертаєш». Наказ для tú: coge.'],
      ['Coja la primera a la izquierda.', 'Coja — для usted. До друга: coge.'],
      ['Coge la primera a la derecha.', 'Ліворуч — a la izquierda.'],
    ],
  }),
  k.ev(13, 'independent', 'fam.street', DC, {
    instr: 'Скажіть другові: «Біля світлофора поверни ліворуч».',
    acc: ['En el semáforo, gira a la izquierda.', 'En el semáforo gira a la izquierda.', 'Gira a la izquierda en el semáforo.'],
    err: [
      ['En el semáforo, giras a la izquierda.', 'Giras — «ти повертаєш». Наказ для tú: gira.'],
      ['En el semáforo, gira a la derecha.', 'Ліворуч — a la izquierda.'],
    ],
  }),
  k.ev(14, 'independent', 'fam.street', DC, {
    instr: 'Скажіть незнайомому чоловікові (usted): «Перейдіть вулицю й поверніть праворуч».',
    acc: ['Cruce la calle y gire a la derecha.'],
    err: [
      ['Cruza la calle y gira a la derecha.', 'Це форми для tú. До незнайомого чоловіка: cruce, gire.'],
      ['Cruze la calle y gire a la derecha.', 'Перед e пишемо c: cruce.'],
    ],
  }),
  k.ev(15, 'delayed', 'fam.street', DC, {
    instr: 'Поясніть другові: «Іди прямо до площі».',
    acc: ['Sigue todo recto hasta la plaza.', 'Sigue recto hasta la plaza.', 'Ve todo recto hasta la plaza.'],
    err: [
      ['Sigues todo recto hasta la plaza.', 'Sigues — «ти йдеш далі». Наказ для tú: sigue.'],
      ['Siga todo recto hasta la plaza.', 'Siga — для usted. До друга: sigue.'],
    ],
  }),
  k.ev(16, 'delayed', 'fam.street', DC, {
    instr: 'Скажіть туристці (usted): «На розі поверніть праворуч».',
    acc: ['En la esquina, gire a la derecha.', 'En la esquina gire a la derecha.', 'Gire a la derecha en la esquina.'],
    err: [
      ['En la esquina, gira a la derecha.', 'Gira — для tú. До туристки: gire.'],
      ['En la esquina, gire a la izquierda.', 'Праворуч — a la derecha.'],
    ],
  }),
  k.ev(17, 'transfer', 'fam.station', DC, {
    instr: 'Поясніть другові, як доїхати: «Сідай на автобус номер два» (coger).',
    acc: ['Coge el autobús número dos.', 'Coge el autobús dos.', 'Coge el dos.'],
    err: [
      ['Coges el autobús número dos.', 'Coges — «ти сідаєш». Наказ для tú: coge.'],
      ['Coja el autobús número dos.', 'Coja — для usted. До друга: coge.'],
    ],
  }),
  k.ev(18, 'transfer', 'fam.station', DC, {
    instr: 'Поясніть туристові (usted): «Сідайте на автобус номер п’ять і їдьте до площі».',
    acc: ['Coja el autobús número cinco y vaya hasta la plaza.', 'Coja el autobús cinco y vaya hasta la plaza.', 'Coja el autobús número cinco y vaya a la plaza.'],
    err: [
      ['Coge el autobús número cinco y ve hasta la plaza.', 'Це форми для tú. До туриста: coja, vaya.'],
      ['Coga el autobús número cinco y vaya hasta la plaza.', 'Від yo cojo: coja (з j).'],
    ],
  }),

  // ---- obligation.hay-que construction-use (T19–T28) ----
  k.ch(19, 'supported', 'fam.restaurant', HC, {
    instr: 'У ресторані висить правило: треба бронювати столик. Оберіть правильне речення.',
    pre: uk('Нагадування: hay que + інфінітив.'),
    opts: [
      ['Hay que reservar mesa.', 'c'],
      ['Hay reservar mesa.', 'x', 'Після hay потрібне que: hay que + інфінітив.'],
      ['Hay que reserva mesa.', 'x', 'Після hay que ставимо інфінітив: reservar.'],
    ],
    tr: 'reservar mesa — забронювати столик',
  }),
  k.ev(20, 'supported', 'fam.museum', HC, {
    instr: 'За зразком напишіть загальне правило музею: «Треба платити на вході» (pagar en la entrada).',
    model: ['Hay que llegar diez minutos antes.', 'Треба прийти на десять хвилин раніше.'],
    acc: ['Hay que pagar en la entrada.'],
    err: [
      ['Hay pagar en la entrada.', 'Після hay потрібне que: hay que pagar.'],
      ['Tengo que pagar en la entrada.', 'Tengo que — мій особистий обов’язок. Загальне правило: hay que.'],
    ],
  }),
  k.ev(21, 'independent', 'fam.station', HC, {
    instr: 'Напишіть загальне правило: «Треба купити квиток заздалегідь (antes)».',
    acc: ['Hay que comprar el billete antes.', 'Hay que comprar los billetes antes.', 'Hay que comprar antes el billete.'],
    err: [
      ['Hay que compra el billete antes.', 'Після hay que ставимо інфінітив: comprar.'],
      ['Hay comprar el billete antes.', 'Після hay потрібне que.'],
    ],
  }),
  k.ev(22, 'independent', 'fam.museum', HC, {
    instr: 'Напишіть загальне правило: «Треба говорити тихо» (hablar bajo).',
    acc: ['Hay que hablar bajo.'],
    err: [
      ['Hay que habla bajo.', 'Після hay que ставимо інфінітив: hablar.'],
      ['Tienes que hablar bajo.', 'Tienes que — обов’язок конкретної людини. Загальне правило: hay que.'],
    ],
  }),
  k.ev(23, 'independent', 'fam.pool', HC, {
    instr: 'Напишіть правило басейну: «Треба прийняти душ перед купанням» (ducharse antes).',
    acc: ['Hay que ducharse antes.', 'Antes hay que ducharse.'],
    err: [
      ['Hay que se duchar antes.', 'Займенник se приєднуємо до інфінітива: ducharse.'],
      ['Hay que duchar antes.', 'Дієслово зворотне: ducharse.'],
    ],
  }),
  k.ev(24, 'independent', 'fam.station', HC, {
    instr: 'Напишіть загальне правило: «Треба бути на вокзалі о сьомій» (estar en la estación).',
    acc: ['Hay que estar en la estación a las siete.', 'A las siete hay que estar en la estación.'],
    err: [['Hay que está en la estación a las siete.', 'Після hay que ставимо інфінітив: estar.']],
  }),
  k.ev(25, 'delayed', 'fam.museum', HC, {
    instr: 'Напишіть правило: «Тут не потрібно платити».',
    acc: ['No hay que pagar.', 'Aquí no hay que pagar.', 'No hay que pagar aquí.'],
    err: [
      ['Hay que no pagar.', 'Заперечення no ставимо перед hay: no hay que pagar.'],
      ['No hay pagar.', 'Після hay потрібне que: no hay que pagar.'],
    ],
  }),
  k.ev(26, 'delayed', 'fam.restaurant', HC, {
    instr: 'Напишіть загальне правило: «Треба вимикати світло» (apagar la luz).',
    acc: ['Hay que apagar la luz.'],
    err: [['Hay que apaga la luz.', 'Після hay que ставимо інфінітив: apagar.']],
  }),
  k.ev(27, 'transfer', 'fam.clinic', HC, {
    instr: 'У поліклініці: напишіть загальне правило «Треба записатися на прийом» (pedir cita).',
    acc: ['Hay que pedir cita.', 'Hay que pedir una cita.'],
    err: [
      ['Hay que pide cita.', 'Після hay que ставимо інфінітив: pedir.'],
      ['Hay pedir cita.', 'Після hay потрібне que.'],
    ],
  }),
  k.ev(28, 'transfer', 'fam.clinic', HC, {
    instr: 'У поліклініці: напишіть загальне правило «Треба мати із собою посвідчення особи» (traer el DNI).',
    acc: ['Hay que traer el DNI.'],
    err: [
      ['Hay que trae el DNI.', 'Після hay que ставимо інфінітив: traer.'],
      ['Tengo que traer el DNI.', 'Tengo que — мій особистий обов’язок. Загальне правило: hay que.'],
    ],
  }),

  // ---- obligation.hay-que context-choice / reading (T29–T33) ----
  k.ch(29, 'supported', 'fam.home', HX, {
    instr: 'Ви кажете про себе: завтра вам треба працювати. Оберіть речення.',
    pre: uk('Нагадування: обов’язок конкретної особи — tener que; загальне правило — hay que.'),
    opts: [
      ['Tengo que trabajar mañana.', 'c'],
      ['Hay que trabajar mañana.', 'x', 'Hay que — загальне правило без указівки, хто. Про себе: tengo que.'],
    ],
  }),
  k.ch(30, 'independent', 'fam.restaurant', HX, {
    instr: 'Табличка в ресторані повідомляє загальне правило для всіх гостей. Оберіть речення.',
    opts: [
      ['Hay que reservar mesa.', 'c'],
      ['Tengo que reservar mesa.', 'x', 'Tengo que — обов’язок того, хто говорить. Правило для всіх: hay que.'],
    ],
  }),
  k.ch(31, 'delayed', 'fam.home', HX, {
    instr: 'Сестра питає, чому ви не йдете в кіно: вам треба вчитися. Оберіть відповідь.',
    opts: [
      ['Tengo que estudiar.', 'c'],
      ['Hay que estudiar.', 'x', 'Ідеться про ваш особистий обов’язок: tengo que.'],
    ],
  }),
  k.ch(32, 'independent', 'fam.museum', HR, {
    instr: 'Прочитайте правило на вході до музею. Що воно означає?',
    es: 'Los martes no hay que pagar.',
    opts: [
      ['У вівторок платити не потрібно.', 'c'],
      ['У вівторок платити заборонено.', 'x', 'No hay que — «не потрібно», а не «заборонено».'],
      ['У вівторок треба заплатити.', 'x', 'No hay que — «не потрібно».'],
    ],
  }),
  k.ch(33, 'delayed', 'fam.clinic', HR, {
    instr: 'Прочитайте повідомлення поліклініки. Що треба зробити?',
    es: 'Hay que llegar diez minutos antes de la cita.',
    opts: [
      ['прийти на десять хвилин раніше', 'c'],
      ['можна прийти на десять хвилин пізніше', 'x', 'Antes — «раніше».'],
      ['подзвонити за десять хвилин до прийому', 'x', 'Llegar — «прийти», а не «подзвонити».'],
    ],
  }),

  // ---- notices (T34–T43) ----
  k.ch(34, 'independent', 'fam.sign', NP, {
    instr: 'Що означає табличка?',
    es: 'Prohibido fumar',
    opts: [
      ['Палити заборонено.', 'c'],
      ['Тут можна палити.', 'x', 'Prohibido — «заборонено».'],
      ['Тут продають цигарки.', 'x', 'Fumar — «палити»; prohibido — «заборонено».'],
    ],
  }),
  k.ch(35, 'delayed', 'fam.sign', NP, {
    instr: 'Що означає табличка на дверях?',
    es: 'Prohibido el paso',
    opts: [
      ['Прохід заборонено.', 'c'],
      ['Вихід тут.', 'x', 'Вихід — salida. Prohibido el paso — прохід заборонено.'],
      ['Обережно, сходинка.', 'x', 'Prohibido — «заборонено».'],
    ],
  }),
  k.ch(36, 'transfer', 'fam.street-sign', NP, {
    instr: 'Що означає табличка біля гаража?',
    es: 'Prohibido aparcar',
    opts: [
      ['Паркуватися заборонено.', 'c'],
      ['Тут платна парковка.', 'x', 'Prohibido — «заборонено».'],
      ['Тут можна паркуватися.', 'x', 'Prohibido — «заборонено».'],
    ],
  }),
  k.ch(37, 'independent', 'fam.sign', NI, {
    instr: 'На дверях магазину написано так. Що треба зробити?',
    es: 'Empujar',
    opts: [
      ['штовхнути двері від себе', 'c'],
      ['потягнути двері до себе', 'x', 'До себе — tirar. Empujar — від себе.'],
    ],
  }),
  k.ch(38, 'independent', 'fam.sign', NI, {
    instr: 'На дверях кафе написано так. Що треба зробити?',
    es: 'Tirar',
    opts: [
      ['потягнути двері до себе', 'c'],
      ['штовхнути двері від себе', 'x', 'Від себе — empujar. Tirar — до себе.'],
    ],
  }),
  k.ch(39, 'delayed', 'fam.sign', NI, {
    instr: 'Табличка біля дверей у під’їзді. Що треба зробити?',
    es: 'Pulsar el botón',
    opts: [
      ['натиснути кнопку', 'c'],
      ['не торкатися кнопки', 'x', 'Pulsar — «натискати».'],
      ['подзвонити по телефону', 'x', 'Pulsar el botón — натиснути кнопку.'],
    ],
  }),
  k.ch(40, 'transfer', 'fam.museum-sign', NI, {
    instr: 'Табличка в музеї. Що вона означає?',
    es: 'No tocar',
    opts: [
      ['Не торкатися.', 'c'],
      ['Торкніться тут.', 'x', 'No tocar — «не торкатися».'],
      ['Не фотографувати.', 'x', 'Tocar — «торкатися».'],
    ],
  }),
  k.ch(41, 'independent', 'fam.advert', NS, {
    instr: 'Оголошення на балконі. Що воно означає?',
    es: 'Se alquila piso',
    opts: [
      ['Здається квартира.', 'c'],
      ['Продається квартира.', 'x', 'Продається — se vende. Se alquila — здається.'],
      ['Шукаємо квартиру.', 'x', 'Шукаємо — se busca.'],
    ],
  }),
  k.ch(42, 'delayed', 'fam.advert', NS, {
    instr: 'Оголошення в під’їзді. Що воно означає?',
    es: 'Se vende bicicleta',
    opts: [
      ['Продається велосипед.', 'c'],
      ['Здається велосипед.', 'x', 'Здається — se alquila. Se vende — продається.'],
      ['Шукаємо велосипед.', 'x', 'Шукаємо — se busca.'],
    ],
  }),
  k.ch(43, 'transfer', 'fam.shop-window', NS, {
    instr: 'Оголошення на вітрині бару. Що воно означає?',
    es: 'Se busca camarero',
    opts: [
      ['Шукаємо офіціанта.', 'c'],
      ['Офіціант шукає роботу.', 'x', 'Se busca — «шукаємо (когось)»: бар шукає офіціанта.'],
      ['Офіціанта немає.', 'x', 'Se busca — «шукаємо».'],
    ],
  }),

  // ---- listening (T44–T51) ----
  k.lm(44, 'independent', cF, LM, {
    instr: 'Прослухайте, як пройти до аптеки. Куди треба повернути біля світлофора?',
    opts: [
      ['ліворуч', 'c'],
      ['праворуч', 'x', 'Gire a la izquierda — поверніть ліворуч.'],
      ['ніде, іти прямо', 'x', 'Прямо треба йти до світлофора, а там повернути.'],
    ],
  }),
  k.lm(45, 'independent', cF, LM, {
    instr: 'Прослухайте ще раз. Де аптека?',
    opts: [
      ['на розі, поруч із банком', 'c'],
      ['навпроти світлофора', 'x', 'У записі: en la esquina, al lado del banco — на розі, поруч із банком.'],
      ['за банком', 'x', 'Al lado del banco — поруч із банком.'],
    ],
  }),
  k.lm(46, 'independent', cM, LM, {
    instr: 'Прослухайте повідомлення мами. Що Пабло має зробити спочатку?',
    opts: [
      ['дістати вечерю з холодильника', 'c'],
      ['накрити на стіл', 'x', 'Це другий крок (luego).'],
      ['зачинити двері на ключ', 'x', 'Це останній крок (por último).'],
    ],
  }),
  k.lm(47, 'independent', cM, LM, {
    instr: 'Прослухайте повідомлення ще раз. Що Пабло має зробити наостанок?',
    opts: [
      ['зачинити двері на ключ', 'c'],
      ['подзвонити сестрі', 'x', 'Це частина другого кроку (luego).'],
      ['прийти пізно додому', 'x', 'Пізно прийде мама.'],
    ],
  }),
  k.lm(48, 'delayed', cU, LM, {
    instr: 'Прослухайте звернення в музеї. Що відвідувачі мають зробити спочатку?',
    opts: [
      ['залишити рюкзаки на вході', 'c'],
      ['взяти мапу музею', 'x', 'Це другий крок (luego).'],
      ['пройти до зали номер один', 'x', 'Це третій крок (a continuación).'],
    ],
  }),
  k.lm(49, 'delayed', cU, LM, {
    instr: 'Прослухайте звернення ще раз. Що треба зробити з мобільними телефонами?',
    opts: [
      ['вимкнути', 'c'],
      ['залишити на вході', 'x', 'На вході залишають рюкзаки. Hay que apagar los móviles — треба вимкнути.'],
      ['увімкнути', 'x', 'Apagar — «вимикати».'],
    ],
  }),
  k.dict(50, 'independent', cF, DI, {
    instr: 'Прослухайте пояснення ще раз і запишіть речення, яке починається з Siga.',
    acc: ['Siga todo recto hasta el semáforo.'],
    err: [['Siga todo recto hasta el semaforo.', 'Semáforo пишеться зі знаком наголосу: se-MÁ-fo-ro.']],
  }),
  k.dict(51, 'delayed', cU, DI, {
    instr: 'Прослухайте звернення в музеї й запишіть речення про мобільні телефони.',
    acc: ['Hay que apagar los móviles.'],
    err: [
      ['Hay que apagar los moviles.', 'Móviles пишеться зі знаком наголосу: MÓ-vi-les.'],
      ['Ay que apagar los móviles.', 'Hay пишеться з h.'],
    ],
  }),
];

const T = (n) => `${L}-T${String(n).padStart(2, '0')}`;

const lesson = {
  schemaVersion: 1,
  id: L,
  kind: 'lesson',
  blockId: 'A2-07',
  titleUk: 'Інструкції, маршрути й написи: що зробити і в якому порядку',
  termEs: 'instrucciones, indicaciones y carteles',
  summaryUk: 'Розуміємо короткі інструкції, рецепт і маршрут: хто має діяти, які кроки і в якому порядку. Вчимося пояснювати дорогу, вживати hay que + інфінітив і розуміти написи Prohibido…, Empujar / Tirar, Se alquila.',
  objectives: ['A2-07-O7', 'A2-07-O8'],
  cv: ['CV-05', 'CV-06'],
  situations: ['instructions-notices', 'places-accommodation', 'time-appointments-transport', 'food-shopping', 'people-family-home'],
  estimatedMinutes: 20,
  introduces: ['reading.instructions-order', 'formula.directions', 'obligation.hay-que', 'formula.notice-prohibido', 'formula.notice-infinitive', 'formula.notice-se', 'listening.directions-instructions'],
  revisits: ['imperative.tu.regular', 'imperative.tu.stem-change', 'imperative.usted.regular', 'imperative.usted.stem-change', 'imperative.usted.spelling', 'imperative.vosotros.regular', 'imperative.addressee', 'link.sequence', 'obligation.tener-que', 'hay.existence', 'prep.spatial.place', 'prep.spatial.object'],
  steps: [
    {
      id: 's1',
      kind: 'explanation',
      titleUk: 'Як пройти: sigue todo recto, gira a la derecha',
      required: true,
      blocks: [
        uk('Пояснюючи дорогу, вживаємо знайомі накази і слова напрямку: seguir todo recto — іти весь час прямо; girar a la derecha / a la izquierda — повернути праворуч / ліворуч; coger la primera (calle) a la izquierda — звернути на першу (вулицю) ліворуч; cruzar la plaza — перейти площу. До незнайомої людини часто звертаються на usted.'),
        uk('В Іспанії coger — звичайне слово: «взяти», «звернути (на вулицю)», «сісти (на автобус)».'),
        ex('Sigue todo recto hasta el semáforo.', 'Іди весь час прямо до світлофора.'),
        ex('Gira a la derecha en la esquina.', 'На розі поверни праворуч.'),
        ex('Coge la primera a la izquierda.', 'Зверни на першу вулицю ліворуч.'),
        ex('Cruza la plaza: el banco está enfrente.', 'Перейди площу: банк навпроти.'),
        ex('Siga todo recto y gire a la izquierda.', 'Ідіть весь час прямо й поверніть ліворуч.'),
      ],
    },
    {
      id: 's2',
      kind: 'explanation',
      titleUk: 'Кроки по порядку і рецепт',
      required: true,
      blocks: [
        uk('В інструкції чи рецепті кроки позначають словами порядку: primero — спочатку, luego / después — потім, a continuación — далі, por último — наостанок. У рецептах замість наказу часто пишуть інфінітив: Cortar la cebolla — «Наріжте цибулю».'),
        ex('Primero, corta la cebolla. Luego, pon la cebolla en la sartén.', 'Спочатку наріж цибулю. Потім поклади її на сковорідку.'),
        ex('A continuación, añade los huevos y mezcla.', 'Далі додай яйця й перемішай.'),
        ex('Cortar la cebolla. Añadir los huevos. Mezclar.', 'Нарізати цибулю. Додати яйця. Перемішати.'),
      ],
    },
    {
      id: 's3',
      kind: 'explanation',
      titleUk: 'Hay que + інфінітив: «треба» для всіх',
      required: true,
      blocks: [
        uk('Hay que + інфінітив означає, що щось треба зробити взагалі, без указівки, хто саме. Hay не змінюється і не має підмета. Коли обов’язок має конкретна особа, вживаємо tener que: Tengo que reservar mesa. No hay que… означає «не потрібно», а не «заборонено».'),
        ex('Hay que reservar mesa.', 'Треба забронювати столик.'),
        ex('Hay que llegar diez minutos antes.', 'Треба прийти на десять хвилин раніше.'),
        ex('No hay que pagar.', 'Платити не потрібно.'),
        ex('Es obligatorio reservar mesa.', 'Столик обов’язково треба забронювати.'),
        ex('Mañana tengo que trabajar.', 'Завтра мені треба працювати.'),
      ],
    },
    {
      id: 's4',
      kind: 'explanation',
      titleUk: 'Написи й оголошення',
      required: true,
      blocks: [
        uk('На табличках інструкцію часто дають інфінітивом, а заборону — словами Prohibido або No + інфінітив. Ці написи ми лише розуміємо; заперечних наказів не вивчаємо. Se + дієслово в оголошеннях означає, що щось здається, продається чи когось шукають.'),
        ex('Prohibido fumar', 'Палити заборонено'),
        ex('Prohibido el paso', 'Прохід заборонено'),
        ex('Empujar / Tirar', 'Від себе / До себе (на дверях)'),
        ex('Pulsar el botón', 'Натисніть кнопку'),
        ex('No tocar', 'Не торкатися'),
        ex('Se alquila piso', 'Здається квартира'),
        ex('Se vende bicicleta', 'Продається велосипед'),
        ex('Se busca camarero', 'Шукаємо офіціанта'),
      ],
    },
    {
      id: 's5',
      kind: 'reading',
      titleUk: 'Читаємо записку',
      required: true,
      blocks: [uk('Прочитайте записку Марти для Лаури й відповідайте на питання.'), es(TEXT_A)],
      taskIds: [1, 2].map(T),
    },
    { id: 's6', kind: 'supported-practice', titleUk: 'Практика зі зразком', required: true, taskIds: [9, 10, 19, 20, 29].map(T) },
    { id: 's7', kind: 'independent-practice', titleUk: 'Самостійна практика', required: true, taskIds: [3, 6, 11, 12, 21, 22, 30, 32, 34, 37, 41].map(T) },
    {
      id: 's8',
      kind: 'listening',
      titleUk: 'Слухаємо: маршрут і інструкції',
      required: true,
      blocks: [uk('Прослухайте пояснення дороги до аптеки і голосове повідомлення мами для Пабло. Спершу відповідайте без тексту; текст запису можна відкрити як підказку.')],
      clipIds: ['clip.a2-07.farmacia-route', 'clip.a2-07.madre-instructions'],
      taskIds: [44, 45, 46, 47].map(T),
    },
    { id: 's9', kind: 'independent-practice', titleUk: 'Додаткова практика і диктант (за бажанням)', required: false, taskIds: [13, 14, 23, 24, 38, 50].map(T) },
    {
      id: 's10',
      kind: 'summary',
      titleUk: 'Підсумок',
      required: true,
      blocks: [
        ul([
          'Маршрут: Sigue / Siga todo recto, Gira / Gire a la derecha, Coge / Coja la primera a la izquierda, Cruza / Cruce la plaza.',
          'Порядок: primero, luego, después, a continuación, por último.',
          'Hay que + інфінітив — «треба» для всіх; no hay que — «не потрібно»; tener que — обов’язок конкретної особи.',
          'Написи: Prohibido…, No tocar, Empujar / Tirar, Pulsar el botón, Se alquila / Se vende / Se busca.',
        ]),
      ],
    },
  ],
  reviewStatus: 'draft',
};

export default { lesson, tasks, clips: CLIPS };
