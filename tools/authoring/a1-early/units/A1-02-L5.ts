// A1-02-L5 — possession: mi/tu/su, mis/tus/sus, nuestro/vuestro, the reference of su, and de + owner (CV-03).
import { ex, tableUk, uk, ulUk, es } from '../lib.ts';
import type { OutcomeSpec, Unit } from '../lib.ts';
import { pick, typed } from '../common.ts';

const MTS_W = 'poss.mi-tu-su/written-form';
const MTS_C = 'poss.mi-tu-su/context-choice';
const MTS_R = 'poss.mi-tu-su/reading-meaning';
const NUM_W = 'poss.number-agreement/written-form';
const NUM_C = 'poss.number-agreement/context-choice';
const NV_W = 'poss.nuestro-vuestro/written-form';
const NV_C = 'poss.nuestro-vuestro/context-choice';
const NV_R = 'poss.nuestro-vuestro/reading-meaning';
const SU_R = 'poss.su-reference/reading-meaning';
const SU_C = 'poss.su-reference/context-choice';
const DE_U = 'prep.de.possession/construction-use';
const DE_W = 'prep.de.possession/written-form';
const DE_R = 'prep.de.possession/reading-meaning';

const R_MTS = 'Mi — «мій, моя», tu — «твій, твоя», su — «його, її, їхній» або ввічливе «Ваш». Вони стоять перед іменником без артикля: mi casa. Окремого слова «свій» немає: форму вибираємо за власником — якщо власник «я», це mi.';
const R_NUM = 'Mi, tu, su мають множину mis, tus, sus. Форма залежить від кількості предметів, а не власників: mis libros — «мої книжки»; su coche — «їхня машина» (одна).';
const R_NV = 'Nuestro — «наш», vuestro — «ваш» (до кількох людей на «ти», як кажуть в Іспанії). Вони змінюються за родом і числом того, що належить: nuestro coche, nuestra casa, nuestros amigos, nuestras mesas. Ввічливе «Ваш» — su.';
const R_SU = 'Su (sus) може означати «його», «її», «їхній» або ввічливе «Ваш». Хто власник, видно з контексту: Ana y su hermano — «Ана та її брат».';
const R_DE = 'Щоб сказати, чия річ, спочатку називаємо те, що належить, потім de і власника: el libro de Ana — «книжка Ани», la casa de mi madre — «дім моєї мами».';
const NO_ART = 'Перед mi, tu, su артикль не ставимо';
const SPAIN_PLURAL = 'Su — це ввічливе «Ваш». До кількох друзів на «ти» в Іспанії кажуть vuestro / vuestra; su в такому значенні — норма Латинської Америки, тому відповідь не оцінено';

type Err = [string, OutcomeSpec, string];

function ruleFor(targets: string[]): Array<[string[], string]> {
  const out: Array<[string[], string]> = [];
  if (targets.includes(MTS_W)) out.push([[MTS_W], R_MTS]);
  if (targets.includes(NUM_W)) out.push([[NUM_W], R_NUM]);
  if (targets.includes(NV_W)) out.push([[NV_W], R_NV]);
  if (targets.includes(DE_U)) out.push([[DE_U], R_DE]);
  if (targets.includes(DE_W)) out.push([[DE_W], R_DE]);
  return out;
}

function poss(n: number, role: 'supported' | 'independent' | 'delayed' | 'transfer', family: string, targets: string[], prompt: string, answer: string, errors: Err[], why: string, support?: string, also?: Array<string | [string, string]>) {
  return typed({ n, role, family, targets, prompt: [...(support ? [uk(support)] : []), uk(prompt)], answer, errors, rules: ruleFor(targets), why, ...(also ? { also } : {}) });
}

export const unit: Unit = {
  lesson: {
    id: 'A1-02-L5',
    titleUk: 'Присвійні слова і належність з de',
    termEs: 'los posesivos y la posesión con de',
    summaryUk: 'Навчишся казати, чия річ: mi, tu, su та їхня множина, nuestro і vuestro, а також конструкція el libro de Ana. Дізнаєшся, як зрозуміти, кому належить su.',
    objectives: ['A1-02-O5'],
    cv: ['CV-03'],
    situations: ['people-family-home'],
    estimatedMinutes: 18,
    skippableFoundation: true,
    introduces: ['poss.mi-tu-su', 'poss.number-agreement', 'poss.nuestro-vuestro', 'poss.su-reference', 'prep.de.possession'],
    revisits: ['article.definite', 'noun.gender.people', 'noun.plural.s', 'adj.agreement.o-a'],
    steps: [
      {
        kind: 'explanation',
        title: 'Мій, твій, його: mi, tu, su',
        blocks: [
          uk('Mi — «мій, моя», tu — «твій, твоя», su — «його, її, їхній» або ввічливе «Ваш». Ці слова не змінюються за родом (mi libro, mi casa) і стоять перед іменником без артикля: mi casa, а не la mi casa.'),
          uk('Окремого слова «свій» в іспанській немає: форму вибираємо за власником. Якщо власник «я», це mi: «Я показую свою кімнату» — mi habitación.'),
          uk('Присвійне tu пишеться без знака наголосу. Слово tú зі знаком — інше слово, ми вивчимо його в наступному блоці.'),
        ],
      },
      {
        kind: 'explanation',
        title: 'Множина: mis, tus, sus',
        blocks: [
          uk('Mi, tu, su мають множину mis, tus, sus. Форма залежить від кількості предметів, а не власників: mis libros — «мої книжки» (власник один, книжок багато); su coche — «їхня машина» (власників двоє, машина одна).'),
        ],
      },
      {
        kind: 'explanation',
        title: 'Наш і ваш: nuestro, vuestro',
        blocks: [
          uk('Nuestro — «наш». Vuestro — «ваш», коли звертаєшся до кількох людей, з якими ти на «ти»: так говорять в Іспанії. На відміну від mi, tu, su, ці слова змінюються за родом і числом того, що належить:'),
          tableUk(['Що належить', 'Наш', 'Ваш (кільком на «ти»)'], [
            ['чол. рід, однина', 'nuestro coche', 'vuestro coche'],
            ['жін. рід, однина', 'nuestra casa', 'vuestra casa'],
            ['чол. рід, множина', 'nuestros amigos', 'vuestros amigos'],
            ['жін. рід, множина', 'nuestras mesas', 'vuestras mesas'],
          ]),
          uk('Ввічливе «Ваш» (до однієї чи кількох людей на «Ви») — це su: su casa.'),
        ],
      },
      {
        kind: 'explanation',
        title: 'Su: чий саме?',
        blocks: [
          uk('Su (sus) може означати «його», «її», «їхній» або ввічливе «Ваш». Хто власник, видно з контексту: Ana y su hermano — «Ана та її брат»; Pablo y su perro — «Пабло та його собака».'),
        ],
      },
      {
        kind: 'explanation',
        title: 'Чия річ: de',
        blocks: [
          uk('В іспанській немає форм на кшталт «Анина книжка» чи англійського ’s. Спочатку називаємо те, що належить, потім de і власника: el libro de Ana — «книжка Ани», la casa de mi madre — «дім моєї мами», los amigos de Pablo — «друзі Пабло».'),
        ],
      },
      {
        kind: 'examples',
        title: 'Приклади',
        blocks: [
          ex('mi madre y mi padre', 'моя мама і мій тато'),
          ex('tus hermanos', 'твої брати (або брати й сестри)'),
          ex('su perro', 'його / її / їхній / Ваш собака'),
          ex('nuestra familia', 'наша сім’я'),
          ex('vuestros hijos', 'ваші діти (кільком друзям)'),
          ex('el gato de Ana', 'кіт Ани'),
        ],
      },
      { kind: 'supported-practice', title: 'Тренування з підказкою', tasks: [1, 2, 11, 16, 17, 41, 26, 27] },
      { kind: 'independent-practice', title: 'Самостійно', tasks: [36, 3, 37, 4, 12, 38, 5, 6, 13, 39, 18, 19, 40, 20, 21, 44, 42, 45, 28, 29, 30, 31] },
      {
        kind: 'summary',
        title: 'Підсумок',
        blocks: [
          ulUk(
            'Mi, tu, su — перед іменником без артикля; у множині mis, tus, sus — за кількістю предметів.',
            'Nuestro, vuestro змінюються за родом і числом: nuestra casa, vuestros amigos; ввічливе «Ваш» — su.',
            'Su — «його, її, їхній, Ваш»: власника видно з контексту.',
            'Чия річ: el libro de Ana — спершу річ, потім de і власник.',
          ),
        ],
      },
    ],
  },
  tasks: [
    // ---------- mi / tu / su (+ number) ----------
    poss(1, 'supported', 'possessive', [MTS_W], 'Напиши іспанською: «моя мама».', 'mi madre', [
      ['la mi madre.', 'x', `${NO_ART}: mi madre.`],
      ['tu madre.', 'x', 'Tu — «твоя»; «моя» — mi.'],
      ['mí madre.', 'u', 'Присвійне mi пишеться без знака наголосу: mi madre.'],
    ], 'Моя — mi', 'Пам’ятай: mi — «мій, моя», tu — «твій, твоя», su — «його, її, їхній, Ваш»; без артикля.'),
    poss(2, 'supported', 'possessive', [MTS_W, NUM_W], 'Напиши іспанською: «мої книжки».', 'mis libros', [
      ['mi libros.', { [NUM_W]: 'x', [MTS_W]: 'c' }, 'Книжок кілька, тому mis.'],
      ['tus libros.', { [MTS_W]: 'x', [NUM_W]: 'c' }, 'Tus — «твої»; «мої» — mis.'],
      ['los mis libros.', { [MTS_W]: 'x', [NUM_W]: 'c' }, `${NO_ART}: mis libros.`],
    ], 'Мої (кілька) — mis', 'Пам’ятай: коли предметів кілька — mis, tus, sus.'),
    poss(3, 'independent', 'possessive', [MTS_W], 'Напиши іспанською: «твій телефон».', 'tu teléfono', [
      ['el tu teléfono.', 'x', `${NO_ART}: tu teléfono.`],
      ['mi teléfono.', 'x', 'Mi — «мій»; «твій» — tu.'],
      ['tú teléfono.', 'u', 'Присвійне tu пишеться без знака наголосу; tú зі знаком — інше слово.'],
      ['tu telefono.', 'u', 'Присвійне правильне, але teléfono пишеться зі знаком наголосу.'],
    ], 'Твій — tu'),
    poss(4, 'independent', 'possessive', [MTS_W, NUM_W], 'Напиши іспанською: «твої друзі».', 'tus amigos', [
      ['tu amigos.', { [NUM_W]: 'x', [MTS_W]: 'c' }, 'Друзів кілька, тому tus.'],
      ['mis amigos.', { [MTS_W]: 'x', [NUM_W]: 'c' }, 'Mis — «мої»; «твої» — tus.'],
      ['los tus amigos.', { [MTS_W]: 'x', [NUM_W]: 'c' }, `${NO_ART}: tus amigos.`],
    ], 'Твої — tus'),
    poss(5, 'independent', 'polite', [MTS_W], 'Ти ввічливо, на «Ви», звертаєшся до пані Гарсії. Напиши іспанською: «Ваша сумка» (bolso).', 'su bolso', [
      ['tu bolso.', 'x', 'До пані Гарсії на «Ви», тому su, а не tu.'],
      ['el su bolso.', 'x', `${NO_ART}: su bolso.`],
    ], 'Ввічливе «Ваш» — su'),
    poss(6, 'independent', 'possessive', [MTS_W, NUM_W], 'Ана показує фото своїх котів. Напиши іспанською: «її коти».', 'sus gatos', [
      ['su gatos.', { [NUM_W]: 'x', [MTS_W]: 'c' }, 'Котів кілька, тому sus.'],
      ['mis gatos.', { [MTS_W]: 'x', [NUM_W]: 'c' }, 'Власниця — Ана (вона), тому sus, а не mis.'],
      ['tus gatos.', { [MTS_W]: 'x', [NUM_W]: 'c' }, 'Власниця — Ана (вона), тому sus.'],
    ], 'Її коти — sus gatos'),
    poss(7, 'delayed', 'possessive', [MTS_W, NUM_W], 'Напиши іспанською: «мої батьки» (мама й тато).', 'mis padres', [
      ['mi padres.', { [NUM_W]: 'x', [MTS_W]: 'c' }, 'Padres — множина, тому mis.'],
      ['los mis padres.', { [MTS_W]: 'x', [NUM_W]: 'c' }, `${NO_ART}: mis padres.`],
    ], 'Мої батьки — mis padres'),
    poss(8, 'delayed', 'possessive', [MTS_W], 'Пабло гуляє зі своїм собакою. Напиши іспанською: «його собака».', 'su perro', [
      ['tu perro.', 'x', 'Tu — «твій»; «його» — su.'],
      ['el su perro.', 'x', `${NO_ART}: su perro.`],
      ['mi perro.', 'x', 'Власник — Пабло (він), тому su.'],
    ], 'Його — su'),
    poss(9, 'transfer', 'album', [MTS_W, NUM_W], 'Ти підписуєш альбом, який даруєш подрузі. Напиши іспанською: «Твої фото».', 'Tus fotos', [
      ['Tu fotos.', { [NUM_W]: 'x', [MTS_W]: 'c' }, 'Фото кілька, тому tus.'],
      ['Mis fotos.', { [MTS_W]: 'x', [NUM_W]: 'c' }, 'Mis — «мої»; «твої» — tus.'],
    ], 'Твої фото — tus fotos'),
    poss(10, 'transfer', 'album', [MTS_W], 'Ти підписуєш сімейне фото. Напиши іспанською: «Мій брат і моя сестра».', 'Mi hermano y mi hermana', [
      ['El mi hermano y la mi hermana.', 'x', `${NO_ART}: mi hermano y mi hermana.`],
      ['Mi hermano y su hermana.', 'x', 'Su — «його, її»; «моя» — mi.'],
    ], 'Мій, моя — mi'),
    poss(11, 'supported', 'to-plural', [NUM_W], 'Зміни на множину: mi llave → ?', 'mis llaves', [
      ['mi llaves.', 'x', 'Ключів кілька, тому mis.'],
    ], 'Кілька предметів — mis', 'Пам’ятай: коли предметів кілька — mis, tus, sus.'),
    poss(12, 'independent', 'to-plural', [NUM_W], 'Зміни на множину: tu libro → ?', 'tus libros', [
      ['tu libros.', 'x', 'Книжок кілька, тому tus.'],
      ['tús libros.', 'u', 'Присвійне tus пишеться без знака наголосу.'],
    ], 'Кілька предметів — tus'),
    poss(13, 'independent', 'fix', [NUM_W], 'Ана і Пабло мають одну машину на двох. Виправ помилку: sus coche.', 'su coche', [
      ['sus coche.', 'x', 'Машина одна, тому su — навіть якщо власників двоє.'],
      ['sus coches.', 'x', 'Машина одна, тому su coche: форма залежить від кількості предметів.'],
    ], 'Одна машина — su'),
    poss(14, 'delayed', 'to-plural', [NUM_W], 'Зміни на множину: su hermana → ?', 'sus hermanas', [
      ['su hermanas.', 'x', 'Сестер кілька, тому sus.'],
    ], 'Кілька предметів — sus'),
    poss(15, 'transfer', 'contacts', [NUM_W], 'Ти створюєш у телефоні групу контактів «Мої друзі». Напиши назву групи іспанською.', 'Mis amigos', [
      ['Mi amigos.', 'x', 'Друзів кілька, тому mis.'],
    ], 'Мої друзі — mis amigos'),
    // ---------- nuestro / vuestro ----------
    poss(16, 'supported', 'possessive', [NV_W], 'Напиши іспанською: «наша квартира» (piso).', 'nuestro piso', [
      ['nuestra piso.', 'x', 'Piso — чоловічого роду, тому nuestro.'],
      ['nuestros piso.', 'x', 'Квартира одна, тому nuestro.'],
    ], 'Piso — чоловічого роду', 'Пам’ятай: nuestro, nuestra, nuestros, nuestras — за родом і числом того, що належить.'),
    poss(17, 'supported', 'friends', [NV_W], 'Ти питаєш двох друзів про їхню кімнату. Напиши іспанською: «ваша кімната».', 'vuestra habitación', [
      ['vuestro habitación.', 'x', 'Habitación — жіночого роду, тому vuestra.'],
      ['su habitación.', 'u', SPAIN_PLURAL],
      ['vuestra habitacion.', 'u', 'Форма правильна, але habitación пишеться зі знаком наголосу.'],
    ], 'Кільком друзям — vuestra', 'Пам’ятай: vuestro, vuestra… — «ваш», коли звертаєшся до кількох людей на «ти».'),
    poss(18, 'independent', 'possessive', [NV_W], 'Напиши іспанською: «наші друзі».', 'nuestros amigos', [
      ['nuestro amigos.', 'x', 'Друзів кілька, тому nuestros.'],
      ['nuestras amigos.', 'x', 'Amigos — чоловічого роду, тому nuestros.'],
    ], 'Наші друзі — nuestros'),
    poss(19, 'independent', 'possessive', [NV_W], 'Напиши іспанською: «наші квіти».', 'nuestras flores', [
      ['nuestros flores.', 'x', 'Flores — жіночого роду, тому nuestras.'],
      ['nuestra flores.', 'x', 'Квітів кілька, тому nuestras.'],
    ], 'Наші квіти — nuestras'),
    poss(20, 'independent', 'friends', [NV_W], 'Ти питаєш друзів про місто, звідки вони приїхали. Напиши іспанською: «ваше місто».', 'vuestra ciudad', [
      ['vuestro ciudad.', 'x', 'Ciudad — жіночого роду, тому vuestra.'],
      ['su ciudad.', 'u', SPAIN_PLURAL],
    ], 'Кільком друзям — vuestra ciudad'),
    poss(21, 'independent', 'possessive', [NV_W], 'Напиши іспанською: «наш собака».', 'nuestro perro', [
      ['nuestra perro.', 'x', 'Perro — чоловічого роду, тому nuestro.'],
    ], 'Наш собака — nuestro'),
    poss(22, 'delayed', 'friends', [NV_W], 'Ти питаєш друзів про їхні ключі. Напиши іспанською: «ваші ключі».', 'vuestras llaves', [
      ['vuestros llaves.', 'x', 'Llaves — жіночого роду, тому vuestras.'],
      ['vuestra llaves.', 'x', 'Ключів кілька, тому vuestras.'],
      ['sus llaves.', 'u', SPAIN_PLURAL],
    ], 'Ваші ключі — vuestras'),
    poss(23, 'delayed', 'possessive', [NV_W], 'Напиши іспанською: «наша сім’я».', 'nuestra familia', [
      ['nuestro familia.', 'x', 'Familia — жіночого роду, тому nuestra.'],
    ], 'Наша сім’я — nuestra'),
    poss(24, 'transfer', 'invitation', [NV_W], 'Ти пишеш друзям запрошення в гості. Напиши іспанською лише: «наш новий будинок» (casa).', 'nuestra casa nueva', [
      ['nuestro casa nueva.', 'x', 'Casa — жіночого роду, тому nuestra.'],
    ], 'Casa — жіночого роду', undefined, [['nuestra nueva casa.', 'Прикметник nueva перед іменником тут теж природний.']]),
    poss(25, 'transfer', 'group-chat', [NV_W], 'Ти пишеш друзям у груповому чаті. Напиши іспанською: «ваші фото».', 'vuestras fotos', [
      ['vuestros fotos.', 'x', 'Foto — жіночого роду (la foto), тому vuestras.'],
      ['sus fotos.', 'u', SPAIN_PLURAL],
    ], 'Foto — жіночого роду'),
    // ---------- de + owner ----------
    poss(26, 'supported', 'whose', [DE_U], 'Напиши іспанською: «книжка Ани».', 'el libro de Ana', [
      ['Ana libro.', 'x', 'Спершу те, що належить, потім de і власник: el libro de Ana.'],
      ['el libro Ana.', 'x', 'Між річчю і власником потрібен de: el libro de Ana.'],
      ['el Ana libro.', 'x', 'Спершу річ, потім de і власник: el libro de Ana.'],
    ], 'Річ + de + власник', 'Пам’ятай: спершу те, що належить, потім de і власник.'),
    poss(27, 'supported', 'whose', [DE_U], 'Напиши іспанською: «дім моєї мами» (casa).', 'la casa de mi madre', [
      ['mi madre casa.', 'x', 'Спершу те, що належить, потім de і власник: la casa de mi madre.'],
      ['la casa mi madre.', 'x', 'Між річчю і власником потрібен de.'],
      ['la casa de la mi madre.', 'u', 'Конструкція з de правильна, але перед mi артикль не ставимо: de mi madre.'],
    ], 'Річ + de + власник', 'Пам’ятай: спершу те, що належить, потім de і власник.'),
    poss(28, 'independent', 'whose', [DE_U], 'Напиши іспанською: «собака Пабло».', 'el perro de Pablo', [
      ['Pablo perro.', 'x', 'Спершу те, що належить, потім de і власник.'],
      ['el perro Pablo.', 'x', 'Між річчю і власником потрібен de.'],
    ], 'Річ + de + власник'),
    poss(29, 'independent', 'whose', [DE_U], 'Напиши іспанською: «машина мого брата».', 'el coche de mi hermano', [
      ['mi hermano coche.', 'x', 'Спершу те, що належить, потім de і власник.'],
      ['el coche mi hermano.', 'x', 'Між річчю і власником потрібен de.'],
    ], 'Річ + de + власник'),
    poss(30, 'independent', 'whose', [DE_U], 'Напиши іспанською: «друзі Ани».', 'los amigos de Ana', [
      ['Ana amigos.', 'x', 'Спершу ті, хто належить, потім de і власник.'],
      ['los amigos Ana.', 'x', 'Між іменником і власником потрібен de.'],
    ], 'Іменник + de + власник'),
    poss(31, 'independent', 'whose', [DE_U], 'Напиши іспанською: «кімната моєї сестри».', 'la habitación de mi hermana', [
      ['mi hermana habitación.', 'x', 'Спершу те, що належить, потім de і власник.'],
      ['la habitación mi hermana.', 'x', 'Між річчю і власником потрібен de.'],
      ['la habitacion de mi hermana.', 'u', 'Конструкція правильна, але habitación пишеться зі знаком наголосу.'],
    ], 'Річ + de + власник'),
    poss(32, 'delayed', 'whose', [DE_U], 'Напиши іспанською: «квартира Пабло».', 'el piso de Pablo', [
      ['Pablo piso.', 'x', 'Спершу те, що належить, потім de і власник.'],
      ['el piso Pablo.', 'x', 'Між річчю і власником потрібен de.'],
    ], 'Річ + de + власник'),
    poss(33, 'delayed', 'whose', [DE_U], 'Напиши іспанською: «ключі мого тата».', 'las llaves de mi padre', [
      ['mi padre llaves.', 'x', 'Спершу те, що належить, потім de і власник.'],
      ['las llaves mi padre.', 'x', 'Між річчю і власником потрібен de.'],
    ], 'Річ + de + власник'),
    poss(34, 'transfer', 'album', [DE_U], 'Ти підписуєш фото в сімейному альбомі. Напиши іспанською: «Кіт моєї сестри».', 'El gato de mi hermana', [
      ['El gato mi hermana.', 'x', 'Між твариною і власником потрібен de.'],
      ['Mi hermana gato.', 'x', 'Спершу той, хто належить, потім de і власник.'],
    ], 'Іменник + de + власник'),
    poss(35, 'transfer', 'box-label', [DE_W], 'Ти пакуєш речі під час переїзду й підписуєш коробку. Напиши іспанською: «Книжки Пабло».', 'Los libros de Pablo', [
      ['Los libros Pablo.', 'x', 'Між річчю і власником потрібен de.'],
      ['Pablo libros.', 'x', 'Спершу те, що належить, потім de і власник.'],
    ], 'Річ + de + власник'),
    // ---------- choice and reading ----------
    pick({
      n: 36, role: 'independent', family: 'choose', targets: [MTS_C],
      prompt: [uk('Ти розповідаєш про свою машину. Вибери присвійне слово: ___ coche.')],
      options: [['mi', 'c'], ['tu', 'x', 'Tu — «твій»; про свою річ кажемо mi.'], ['su', 'x', 'Su — «його, її, їхній, Ваш»; про свою річ кажемо mi.']],
      rules: [[[MTS_C], R_MTS]],
      ok: 'Так: mi coche — «моя машина».',
      bad: 'Ні. Власник — «я», тому mi coche.',
    }),
    pick({
      n: 37, role: 'independent', family: 'meaning', targets: [MTS_R],
      prompt: [uk('Що означає це словосполучення?'), es('tu libro')],
      options: [['твоя книжка', 'c'], ['моя книжка', 'x', 'Моя — mi.'], ['їхня книжка', 'x', 'Їхня — su.']],
      rules: [[[MTS_R], R_MTS]],
      ok: 'Так: tu libro — «твоя книжка».',
      bad: 'Ні. Tu libro — «твоя книжка».',
    }),
    pick({
      n: 38, role: 'independent', family: 'choose', targets: [NUM_C],
      prompt: [uk('Ти розповідаєш про своїх братів. Вибери: ___ hermanos.')],
      options: [['mis', 'c'], ['mi', 'x', 'Братів кілька, тому mis.']],
      rules: [[[NUM_C], R_NUM]],
      ok: 'Так: mis hermanos.',
      bad: 'Ні. Братів кілька, тому mis hermanos.',
    }),
    pick({
      n: 39, role: 'independent', family: 'choose', targets: [NV_C],
      prompt: [uk('Ти кажеш про свій з родиною дім: «наш дім». Вибери: ___ casa.')],
      options: [['nuestra', 'c'], ['nuestro', 'x', 'Casa — жіночого роду.'], ['nuestras', 'x', 'Дім один.']],
      rules: [[[NV_C], R_NV]],
      ok: 'Так: nuestra casa.',
      bad: 'Ні. Правильно: nuestra casa.',
    }),
    pick({
      n: 40, role: 'independent', family: 'meaning', targets: [NV_R],
      prompt: [uk('Ти кажеш:'), es('vuestro piso'), uk('До кого ти звертаєшся?')],
      options: [
        ['до кількох друзів, з якими ти на «ти»', 'c'],
        ['до одного друга', 'x', 'Одному другові кажуть tu piso.'],
        ['ввічливо до пані Гарсії', 'x', 'Ввічливо кажуть su piso.'],
      ],
      rules: [[[NV_R], R_NV]],
      ok: 'Так: vuestro — «ваш» до кількох людей на «ти».',
      bad: 'Ні. Vuestro — «ваш», коли звертаєшся до кількох людей на «ти».',
    }),
    pick({
      n: 41, role: 'supported', family: 'meaning', targets: [SU_R],
      prompt: [uk('Пам’ятай: su — «його, її, їхній» або «Ваш»; власника видно з контексту.'), uk('Що означає підпис під фото?'), es('Ana y su hermano')],
      options: [['Ана та її брат', 'c'], ['Ана та мій брат', 'x', 'Мій — mi.'], ['Ана та твій брат', 'x', 'Твій — tu.']],
      rules: [[[SU_R], R_SU]],
      ok: 'Так: su тут — «її» (брат Ани).',
      bad: 'Ні. Ana y su hermano — «Ана та її брат».',
    }),
    pick({
      n: 42, role: 'independent', family: 'meaning', targets: [SU_R],
      prompt: [uk('На фото — пан і пані Гарсія з дітьми. Підпис:'), es('Los señores García y sus hijos'), uk('Чиї це діти?')],
      options: [['пана й пані Гарсія', 'c'], ['твої', 'x', '«Твої» — tus; тут su вказує на власників із контексту.'], ['мої', 'x', '«Мої» — mis.']],
      rules: [[[SU_R], R_SU]],
      ok: 'Так: sus hijos — «їхні діти», пана й пані Гарсія.',
      bad: 'Ні. Sus hijos тут — «їхні діти»: власники — пан і пані Гарсія.',
    }),
    pick({
      n: 43, role: 'delayed', family: 'choose', targets: [SU_C],
      prompt: [uk('Ти ввічливо, на «Ви», звертаєшся до пана Гарсії: «Ваш телефон, будь ласка». Вибери: ___ teléfono, por favor.')],
      options: [['Su', 'c'], ['Tu', 'x', 'Tu — до того, з ким ти на «ти»; ввічливо — su.'], ['Vuestro', 'x', 'Vuestro — до кількох людей на «ти».']],
      rules: [[[SU_C], R_SU]],
      ok: 'Так: Su teléfono, por favor.',
      bad: 'Ні. Ввічливе «Ваш» — su.',
    }),
    pick({
      n: 44, role: 'independent', family: 'choose', targets: [SU_C],
      prompt: [uk('Ана показує фото й каже про брата «mi hermano». Ти переказуєш подрузі: «її брат». Вибери.')],
      options: [['su hermano', 'c'], ['mi hermano', 'x', 'Mi — коли власник «я»; тут власниця — Ана.'], ['tu hermano', 'x', 'Tu — «твій».']],
      rules: [[[SU_C], R_SU]],
      ok: 'Так: su hermano — «її брат».',
      bad: 'Ні. Власниця — Ана, тому su hermano.',
    }),
    pick({
      n: 45, role: 'independent', family: 'meaning', targets: [DE_R],
      prompt: [uk('Що означає це словосполучення?'), es('la casa de Ana')],
      options: [['дім Ани', 'c'], ['Ана і дім', 'x', 'De показує, чия річ: «дім Ани».'], ['Анин друг', 'x', 'Тут ідеться про дім: casa.']],
      rules: [[[DE_R], R_DE]],
      ok: 'Так: la casa de Ana — «дім Ани».',
      bad: 'Ні. La casa de Ana — «дім Ани».',
    }),
  ],
};
