// A2-03-L3 — irregular participles (A2-03-O3). Every participle is its own skill with its own
// 10-task bank (2 supported, 4 independent, 2 delayed, 2 transfer; one choice task each), so a
// difficulty with one form never stands in for another. Each task targets exactly one participle.
import { choice, es, esTable, ex, exact, lesson, step, uk, ukList } from './lib.mjs';

const L = 'A2-03-L3';
const INSTR = 'Впишіть дієприкметник дієслова в дужках.';

const AFTER_HABER = (p) => `Після haber дієприкметник не змінюється і завжди закінчується на -o: ${p}.`;
const GERUND = (g, p) => `${g} — герундій, він іде після estar. Після haber потрібен дієприкметник: ${p}.`;

/**
 * One participle bank. rows: [num, role, family, sentence (with ___ and "(infinitive)" for gaps), fullUk, choice?]
 * Gap rows produce closed single-target exact-variants tasks; choice rows produce a choice task whose
 * options are the participle plus the listed wrong forms.
 */
const BANKS = [
  {
    skill: 'participle.hecho', inf: 'hacer', part: 'hecho',
    rule: 'Hacer має особливий дієприкметник hecho (не *hacido). Пишемо з h.',
    model: ['¿Qué has hecho hoy? (hacer)', 'Що ти сьогодні робив(-ла)?'],
    errors: [['hacido', 'Форми *hacido немає: hacer має особливий дієприкметник hecho.'], ['haciendo', GERUND('Haciendo', 'hecho')], ['echo', 'Hecho пишемо з h: hecho.'], ['hecha', AFTER_HABER('hecho')]],
    rows: [
      [1, 'supported', 'home', '¿Qué has ___ (hacer) hoy?', 'Що ти сьогодні робив(-ла)?'],
      [2, 'supported', 'leisure', 'Hoy hemos ___ (hacer) deporte en el parque.', 'Сьогодні ми займалися спортом у парку.'],
      [3, 'independent', 'home', 'Hoy mi padre ha ___ (hacer) la comida.', 'Сьогодні мій тато приготував обід.'],
      [4, 'independent', 'leisure', 'Hoy los niños han ___ (hacer) muchas fotos.', 'Сьогодні діти зробили багато фото.'],
      [5, 'independent', 'home', '¿Habéis ___ (hacer) la cena?', 'Ви приготували вечерю?'],
      [6, 'independent', 'leisure', '¿Qué has ___ este fin de semana?', 'Що ти робив(-ла) в ці вихідні?', ['hacido', 'haciendo', 'hecha']],
      [7, 'delayed', 'home', 'Hoy (yo) he ___ (hacer) la compra en el supermercado.', 'Сьогодні я купив(-ла) продукти в супермаркеті.'],
      [8, 'delayed', 'leisure', 'Hoy mi hermana ha ___ (hacer) fotos en la playa.', 'Сьогодні моя сестра фотографувала на пляжі.'],
      [9, 'transfer', 'work-study', 'Hoy los estudiantes han ___ (hacer) un examen.', 'Сьогодні студенти писали іспит.'],
      [10, 'transfer', 'messages', 'Hola, Luis: ¿has ___ (hacer) la compra?', 'Привіт, Луїсе! Ти купив продукти?'],
    ],
  },
  {
    skill: 'participle.dicho', inf: 'decir', part: 'dicho',
    rule: 'Decir має особливий дієприкметник dicho (не *decido).',
    model: ['Ana me ha dicho que viene. (decir)', 'Ана сказала мені, що прийде.'],
    errors: [['decido', 'Від decir дієприкметник — dicho. (Decido — інша форма, «я вирішую».)'], ['diciendo', GERUND('Diciendo', 'dicho')], ['dicha', AFTER_HABER('dicho')]],
    rows: [
      [11, 'supported', 'home', '¿Qué te ha ___ (decir) tu madre?', 'Що тобі сказала мама?'],
      [12, 'supported', 'work-study', 'El profesor nos ha ___ (decir) la fecha del examen.', 'Викладач сказав нам дату іспиту.'],
      [13, 'independent', 'home', 'Mi hermana me ha ___ (decir) que viene mañana.', 'Сестра сказала мені, що приїде завтра.'],
      [14, 'independent', 'work-study', '¿Qué os han ___ (decir) en la oficina?', 'Що вам сказали в офісі?'],
      [15, 'independent', 'home', 'Mis padres no me han ___ (decir) nada.', 'Батьки мені нічого не сказали.'],
      [16, 'independent', 'work-study', 'Luis ha ___ que no puede venir hoy.', 'Луїс сказав, що сьогодні не може прийти.', ['decido', 'diciendo', 'dicha']],
      [17, 'delayed', 'home', 'Hoy Ana me ha ___ (decir) que está cansada.', 'Сьогодні Ана сказала мені, що вона втомилася.'],
      [18, 'delayed', 'work-study', 'En la oficina me han ___ (decir) que mañana no hay reunión.', 'В офісі мені сказали, що завтра наради не буде.'],
      [19, 'transfer', 'messages', 'Hola, Pedro: Marta me ha ___ (decir) que estás enfermo.', 'Привіт, Педро! Марта сказала мені, що ти хворієш.'],
      [20, 'transfer', 'shopping', 'En la tienda me han ___ (decir) el precio.', 'У магазині мені сказали ціну.'],
    ],
  },
  {
    skill: 'participle.escrito', inf: 'escribir', part: 'escrito',
    rule: 'Escribir має особливий дієприкметник escrito (не *escribido).',
    model: ['He escrito un mensaje. (escribir)', 'Я написав(-ла) повідомлення.'],
    errors: [['escribido', 'Форми *escribido немає: escribir має особливий дієприкметник escrito.'], ['escribiendo', GERUND('Escribiendo', 'escrito')], ['escrita', AFTER_HABER('escrito')]],
    rows: [
      [21, 'supported', 'work-study', '¿Has ___ (escribir) el correo electrónico?', 'Ти написав(-ла) електронний лист?'],
      [22, 'supported', 'home', 'Ana me ha ___ (escribir) un mensaje muy bonito.', 'Ана написала мені дуже гарне повідомлення.'],
      [23, 'independent', 'work-study', 'Hoy los estudiantes han ___ (escribir) mucho en clase.', 'Сьогодні студенти багато писали на занятті.'],
      [24, 'independent', 'home', '¿Habéis ___ (escribir) a vuestros padres?', 'Ви написали своїм батькам?'],
      [25, 'independent', 'work-study', 'Hoy (yo) he ___ (escribir) tres correos electrónicos.', 'Сьогодні я написав(-ла) три електронні листи.'],
      [26, 'independent', 'home', 'Mi hermano ha ___ un libro.', 'Мій брат написав книжку.', ['escribido', 'escribiendo', 'escrita']],
      [27, 'delayed', 'home', 'Hoy mis padres me han ___ (escribir) un mensaje.', 'Сьогодні батьки написали мені повідомлення.'],
      [28, 'delayed', 'work-study', 'Hoy he ___ (escribir) mi nombre y mi apellido en el examen.', 'Сьогодні я написав(-ла) на іспиті своє ім’я та прізвище.'],
      [29, 'transfer', 'messages', 'Hola, Ana: te he ___ (escribir) un correo electrónico.', 'Привіт, Ано! Я написав(-ла) тобі електронного листа.'],
      [30, 'transfer', 'travel', 'En el hotel he ___ (escribir) mi nombre y mi número de teléfono.', 'У готелі я написав(-ла) своє ім’я і номер телефону.'],
    ],
  },
  {
    skill: 'participle.visto', inf: 'ver', part: 'visto',
    rule: 'Ver має особливий дієприкметник visto (не *veído).',
    model: ['¿Has visto la película? (ver)', 'Ти бачив(-ла) фільм?'],
    errors: [['veído', 'Форми *veído немає: ver має особливий дієприкметник visto.'], ['veido', 'Форми *veido немає: ver має особливий дієприкметник visto.'], ['viendo', GERUND('Viendo', 'visto')], ['vista', AFTER_HABER('visto')]],
    rows: [
      [31, 'supported', 'leisure', 'Hoy los niños han ___ (ver) un perro muy grande en el parque.', 'Сьогодні діти бачили в парку дуже великого собаку.'],
      [32, 'supported', 'home', 'Hoy no hemos ___ (ver) a Ana.', 'Сьогодні ми не бачили Ану.'],
      [33, 'independent', 'leisure', '¿Habéis ___ (ver) la película?', 'Ви бачили фільм?'],
      [34, 'independent', 'home', '¿Has ___ (ver) mis gafas?', 'Ти не бачив(-ла) моїх окулярів?'],
      [35, 'independent', 'leisure', 'Hoy he ___ (ver) a tus padres en el parque.', 'Сьогодні я бачив(-ла) твоїх батьків у парку.'],
      [36, 'independent', 'home', 'Esta mañana mi madre ha ___ a Luis en el autobús.', 'Сьогодні вранці мама бачила Луїса в автобусі.', ['veído', 'viendo', 'vista']],
      [37, 'delayed', 'home', 'Hoy mis hermanos no han ___ (ver) a nadie.', 'Сьогодні мої брати нікого не бачили.'],
      [38, 'delayed', 'leisure', 'Hoy (yo) he ___ (ver) una película muy interesante.', 'Сьогодні я подивився(-лася) дуже цікавий фільм.'],
      [39, 'transfer', 'messages', 'Hola, Marta: ¿has ___ (ver) mi mensaje?', 'Привіт, Марто! Ти бачила моє повідомлення?'],
      [40, 'transfer', 'housing', '¿Has ___ (ver) el anuncio del piso?', 'Ти бачив(-ла) оголошення про квартиру?'],
    ],
  },
  {
    skill: 'participle.puesto', inf: 'poner', part: 'puesto',
    rule: 'Poner має особливий дієприкметник puesto (не *ponido): в основі з’являється ue.',
    model: ['He puesto las llaves en la mesa. (poner)', 'Я поклав(-ла) ключі на стіл.'],
    errors: [['ponido', 'Форми *ponido немає: poner має особливий дієприкметник puesto.'], ['poniendo', GERUND('Poniendo', 'puesto')], ['puesta', AFTER_HABER('puesto')], ['puestas', AFTER_HABER('puesto')]],
    rows: [
      [41, 'supported', 'home', '¿Dónde has ___ (poner) mi mochila?', 'Куди ти поклав(-ла) мій рюкзак?'],
      [42, 'supported', 'work-study', 'En la oficina han ___ (poner) un ordenador nuevo.', 'В офісі поставили новий комп’ютер.'],
      [43, 'independent', 'home', 'Hemos ___ (poner) la leche en la nevera.', 'Ми поставили молоко в холодильник.'],
      [44, 'independent', 'work-study', 'Hoy he ___ (poner) los libros en la mochila.', 'Сьогодні я поклав(-ла) книжки в рюкзак.'],
      [45, 'independent', 'home', 'Mi madre ha ___ (poner) las flores en la ventana.', 'Мама поставила квіти на вікно.'],
      [46, 'independent', 'home', '¿Dónde habéis ___ las llaves?', 'Куди ви поклали ключі?', ['ponido', 'poniendo', 'puestas']],
      [47, 'delayed', 'home', 'Ana ha ___ (poner) el pan en la mesa.', 'Ана поклала хліб на стіл.'],
      [48, 'delayed', 'work-study', 'El profesor ha ___ (poner) un examen muy fácil.', 'Викладач дав дуже легкий іспит.'],
      [49, 'transfer', 'messages', 'Hola, Luis: he ___ (poner) tus llaves encima de la nevera.', 'Привіт, Луїсе! Я поклав(-ла) твої ключі на холодильник.'],
      [50, 'transfer', 'leisure', 'En el bar han ___ (poner) música.', 'У барі ввімкнули музику.'],
    ],
  },
  {
    skill: 'participle.vuelto', inf: 'volver', part: 'vuelto',
    rule: 'Volver має особливий дієприкметник vuelto (не *volvido): в основі з’являється ue.',
    model: ['Ana ha vuelto a casa. (volver)', 'Ана повернулася додому.'],
    errors: [['volvido', 'Форми *volvido немає: volver має особливий дієприкметник vuelto.'], ['volviendo', GERUND('Volviendo', 'vuelto')], ['vuelta', AFTER_HABER('vuelto')], ['vueltos', AFTER_HABER('vuelto')]],
    rows: [
      [51, 'supported', 'home', 'Hoy mis padres han ___ (volver) muy tarde.', 'Сьогодні мої батьки повернулися дуже пізно.'],
      [52, 'supported', 'work-study', 'Hoy he ___ (volver) del trabajo a las seis.', 'Сьогодні я повернувся(-лася) з роботи о шостій.'],
      [53, 'independent', 'home', '¿A qué hora has ___ (volver) a casa?', 'О котрій ти повернувся(-лася) додому?'],
      [54, 'independent', 'work-study', 'Hoy mi hermana ha ___ (volver) de la universidad a las ocho.', 'Сьогодні сестра повернулася з університету о восьмій.'],
      [55, 'independent', 'home', 'Hoy los niños han ___ (volver) de la escuela muy cansados.', 'Сьогодні діти повернулися зі школи дуже втомлені.'],
      [56, 'independent', 'work-study', 'Hoy (nosotros) hemos ___ de la oficina en autobús.', 'Сьогодні ми повернулися з офісу автобусом.', ['volvido', 'volviendo', 'vueltos']],
      [57, 'delayed', 'home', 'Hoy mi madre ha ___ (volver) a casa en bicicleta.', 'Сьогодні мама повернулася додому на велосипеді.'],
      [58, 'delayed', 'work-study', 'Hoy los estudiantes han ___ (volver) a clase después de comer.', 'Сьогодні студенти повернулися на заняття після обіду.'],
      [59, 'transfer', 'messages', 'Hola, Luis: Marta y yo hemos ___ (volver) de Valencia.', 'Привіт, Луїсе! Ми з Мартою повернулися з Валенсії.'],
      [60, 'transfer', 'travel', '¿Habéis ___ (volver) de vacaciones?', 'Ви повернулися з відпустки?'],
    ],
  },
  {
    skill: 'participle.abierto', inf: 'abrir', part: 'abierto',
    rule: 'Abrir має особливий дієприкметник abierto (не *abrido): в основі з’являється ie.',
    model: ['He abierto la ventana. (abrir)', 'Я відчинив(-ла) вікно.'],
    errors: [['abrido', 'Форми *abrido немає: abrir має особливий дієприкметник abierto.'], ['abriendo', GERUND('Abriendo', 'abierto')], ['abierta', `${AFTER_HABER('abierto')} (La puerta está abierta — інша конструкція, з estar.)`], ['abiertos', AFTER_HABER('abierto')]],
    rows: [
      [61, 'supported', 'home', 'Ana ha ___ (abrir) la puerta.', 'Ана відчинила двері.'],
      [62, 'supported', 'shopping', 'Hoy el banco ha ___ (abrir) a las nueve.', 'Сьогодні банк відчинився о дев’ятій.'],
      [63, 'independent', 'home', 'Los niños han ___ (abrir) los regalos.', 'Діти відкрили подарунки.'],
      [64, 'independent', 'shopping', 'Hoy han ___ (abrir) un restaurante nuevo en mi calle.', 'Сьогодні на моїй вулиці відкрили новий ресторан.'],
      [65, 'independent', 'home', 'Hemos ___ (abrir) una botella de agua.', 'Ми відкрили пляшку води.'],
      [66, 'independent', 'shopping', '¿Han ___ la farmacia?', 'Аптеку відчинили?', ['abrido', 'abriendo', 'abierta']],
      [67, 'delayed', 'home', 'He ___ (abrir) la ventana de mi habitación.', 'Я відчинив(-ла) вікно у своїй кімнаті.'],
      [68, 'delayed', 'shopping', 'Hoy no han ___ (abrir) el supermercado.', 'Сьогодні супермаркет не відчинили.'],
      [69, 'transfer', 'messages', 'Hola, Pedro: ¿has ___ (abrir) mi correo electrónico?', 'Привіт, Педро! Ти відкрив мій електронний лист?'],
      [70, 'transfer', 'work-study', 'Hoy el profesor ha ___ (abrir) la puerta de la clase.', 'Сьогодні викладач відчинив двері класу.'],
    ],
  },
  {
    skill: 'participle.roto', inf: 'romper', part: 'roto',
    rule: 'Romper має особливий дієприкметник roto (не *rompido).',
    model: ['He roto las gafas. (romper)', 'Я зламав(-ла) окуляри.'],
    errors: [['rompido', 'Форми *rompido немає: romper має особливий дієприкметник roto.'], ['rompiendo', GERUND('Rompiendo', 'roto')], ['rota', AFTER_HABER('roto')], ['rotos', AFTER_HABER('roto')]],
    rows: [
      [71, 'supported', 'home', 'El niño ha ___ (romper) un vaso.', 'Хлопчик розбив склянку.'],
      [72, 'supported', 'work-study', 'En la oficina alguien ha ___ (romper) la ventana.', 'В офісі хтось розбив вікно.'],
      [73, 'independent', 'home', '¿Quién ha ___ (romper) la ventana de la cocina?', 'Хто розбив вікно на кухні?'],
      [74, 'independent', 'work-study', 'Hoy un estudiante ha ___ (romper) una silla.', 'Сьогодні один студент зламав стілець.'],
      [75, 'independent', 'home', 'El perro ha ___ (romper) mi libro.', 'Собака порвав мою книжку.'],
      [76, 'independent', 'home', 'Mi hermano ha ___ mi móvil.', 'Мій брат зламав мій мобільний.', ['rompido', 'rompiendo', 'rota']],
      [77, 'delayed', 'home', 'Los niños han ___ (romper) dos vasos.', 'Діти розбили дві склянки.'],
      [78, 'delayed', 'work-study', 'Hoy (yo) he ___ (romper) mi móvil en la oficina.', 'Сьогодні я зламав(-ла) свій мобільний в офісі.'],
      [79, 'transfer', 'messages', 'Hola, Ana: lo siento, he ___ (romper) tu bolígrafo.', 'Привіт, Ано! Вибач, я зламав(-ла) твою ручку.'],
      [80, 'transfer', 'shopping', 'En el supermercado un niño ha ___ (romper) una botella.', 'У супермаркеті хлопчик розбив пляшку.'],
    ],
  },
  {
    skill: 'participle.muerto', inf: 'morir', part: 'muerto',
    rule: 'Morir має особливий дієприкметник muerto (не *morido): в основі з’являється ue.',
    model: ['Mi planta ha muerto. (morir)', 'Моя рослина загинула.'],
    errors: [['morido', 'Форми *morido немає: morir має особливий дієприкметник muerto.'], ['muriendo', GERUND('Muriendo', 'muerto')], ['muerta', AFTER_HABER('muerto')], ['muertas', AFTER_HABER('muerto')]],
    rows: [
      [81, 'supported', 'home', 'Las plantas de mi madre han ___ (morir).', 'Мамині рослини загинули.'],
      [82, 'supported', 'garden', 'Las flores del jardín han ___ (morir).', 'Квіти в саду загинули.'],
      [83, 'independent', 'home', '¿Han ___ (morir) tus plantas?', 'Твої рослини загинули?'],
      [84, 'independent', 'garden', 'Las plantas de la terraza han ___ (morir).', 'Рослини на терасі загинули.'],
      [85, 'independent', 'home', 'Mi planta ha ___ (morir).', 'Моя рослина загинула.'],
      [86, 'independent', 'garden', 'Las flores del parque han ___.', 'Квіти в парку загинули.', ['morido', 'muriendo', 'muertas']],
      [87, 'delayed', 'home', 'Dos plantas de la cocina han ___ (morir).', 'Дві рослини на кухні загинули.'],
      [88, 'delayed', 'garden', 'Este verano han ___ (morir) muchas flores del jardín.', 'Цього літа в саду загинуло багато квітів.'],
      [89, 'transfer', 'messages', 'Hola, mamá: lo siento, tu planta ha ___ (morir).', 'Привіт, мамо! Вибач, твоя рослина загинула.'],
      [90, 'transfer', 'weather', 'Con el frío han ___ (morir) muchas plantas.', 'Через холод загинуло багато рослин.'],
    ],
  },
];

const fill = (sentence, part) => sentence.replace(/___ \([^)]*\)/, part).replace('___', part);
const num = (n) => `T${String(n).padStart(2, '0')}`;

function bankTasks(b) {
  const target = [b.skill, 'written-form'];
  const uniqueErrors = b.errors.filter(([text, fb], i) => fb && b.errors.findIndex((e) => e[0] === text) === i);
  return b.rows.map(([n, role, family, sentence, fullUk, wrong]) => {
    const full = fill(sentence, b.part);
    const common = {
      id: num(n), lesson: L, role, family, target, rule: b.rule, full, fullUk,
      ok: `Правильно: ${b.part}.`,
      bad: `Від ${b.inf} дієприкметник — ${b.part}: ${full}`,
    };
    if (wrong) {
      const fb = new Map(uniqueErrors);
      return choice({
        ...common,
        prompt: [uk(`Оберіть правильний дієприкметник дієслова ${b.inf}.`), es(sentence)],
        options: [[b.part, true], ...wrong.map((w) => [w, false, fb.get(w) ?? `Від ${b.inf} дієприкметник — ${b.part}.`])],
      });
    }
    const supported = role === 'supported';
    const isMessage = family === 'messages';
    const instr = `${isMessage ? 'Повідомлення. ' : ''}${INSTR}${supported ? ' Зразок нижче.' : ''}`;
    return exact({
      ...common,
      prompt: [uk(instr), ...(supported ? [ex(...b.model)] : []), es(sentence)],
      answers: [b.part], closed: true, errors: uniqueErrors,
    });
  });
}

const tasks = BANKS.flatMap(bankTasks);
const byRole = (skills, roles) => tasks.filter((t) => skills.includes(t.targets[0].skillId) && roles.includes(t.role)).map((t) => t.id);
const GROUP_A = ['participle.hecho', 'participle.dicho', 'participle.escrito', 'participle.visto'];
const GROUP_B = ['participle.puesto', 'participle.vuelto', 'participle.abierto', 'participle.roto', 'participle.muerto'];

export default {
  lesson: lesson({
    id: L,
    titleUk: 'Особливі дієприкметники: hecho, dicho, escrito, visto та інші',
    termEs: 'participios irregulares',
    summaryUk:
      'Дев’ять частих дієслів мають особливий дієприкметник, який треба запам’ятати: hecho, dicho, escrito, visto, puesto, vuelto, abierto, roto, muerto. Тренуємо кожну форму окремо, у двох групах.',
    objectives: ['A2-03-O3'],
    situations: ['routine-study-leisure', 'people-family-home', 'food-shopping', 'personal-messages'],
    estimatedMinutes: 20,
    introduces: [...GROUP_A, ...GROUP_B],
    revisits: ['perfecto.haber-forms', 'participle.regular-er-ir', 'present.hacer', 'present.decir', 'present.ver', 'present.yo-g', 'present.stem-o-ue'],
    steps: [
      step('s1', 'explanation', 'Група 1: hecho, dicho, escrito, visto', true, {
        blocks: [
          uk('Деякі часті дієслова мають особливий дієприкметник — правило -ado / -ido до них не застосовуємо. Ці форми треба запам’ятати: кажемо hecho, а не *hacido.'),
          esTable(['infinitivo', 'participio'], [['hacer', 'hecho'], ['decir', 'dicho'], ['escribir', 'escrito'], ['ver', 'visto']]),
          ex('¿Qué has hecho hoy? — He hecho la compra.', 'Що ти сьогодні робив(-ла)? — Я купив(-ла) продукти.'),
          ex('Ana me ha dicho que viene mañana.', 'Ана сказала мені, що прийде завтра.'),
          ex('He escrito un mensaje a Pablo.', 'Я написав(-ла) повідомлення Пабло.'),
          ex('¿Has visto la película?', 'Ти бачив(-ла) фільм?'),
          uk('Hecho пишемо з h. Hacer fotos — «фотографувати», hacer la comida — «готувати обід».'),
          uk('Після haber ці дієприкметники теж не змінюються: Ana ha hecho la compra, mis padres han escrito un mensaje.'),
        ],
      }),
      step('s2', 'supported-practice', 'Група 1: практика зі зразком', true, { taskIds: byRole(GROUP_A, ['supported']) }),
      step('s3', 'independent-practice', 'Група 1: самостійна практика', true, { taskIds: byRole(GROUP_A, ['independent']) }),
      step('s4', 'explanation', 'Група 2: puesto, vuelto, abierto, roto, muerto', true, {
        blocks: [
          uk('Ще п’ять дієслів з особливим дієприкметником:'),
          esTable(['infinitivo', 'participio'], [['poner', 'puesto'], ['volver', 'vuelto'], ['abrir', 'abierto'], ['romper', 'roto'], ['morir', 'muerto']]),
          uk('Нові слова: romper — «розбивати, ламати»; morir — «помирати; гинути (про рослини)»; la planta — «рослина».'),
          ex('He puesto las llaves en la mesa.', 'Я поклав(-ла) ключі на стіл.'),
          ex('Ana ha vuelto a casa.', 'Ана повернулася додому.'),
          ex('¿Han abierto la tienda?', 'Магазин відчинили?'),
          ex('He roto las gafas.', 'Я зламав(-ла) окуляри.'),
          ex('Las plantas han muerto.', 'Рослини загинули.'),
          uk('Зверніть увагу на основу: у puesto, vuelto і muerto з’являється ue, в abierto — ie.'),
        ],
      }),
      step('s5', 'supported-practice', 'Група 2: практика зі зразком', true, { taskIds: byRole(GROUP_B, ['supported']) }),
      step('s6', 'independent-practice', 'Група 2: самостійна практика', true, { taskIds: byRole(GROUP_B, ['independent']) }),
      step('s7', 'summary', 'Підсумок', true, {
        blocks: [
          esTable(['infinitivo', 'participio'], [
            ['hacer', 'hecho'], ['decir', 'dicho'], ['escribir', 'escrito'], ['ver', 'visto'], ['poner', 'puesto'],
            ['volver', 'vuelto'], ['abrir', 'abierto'], ['romper', 'roto'], ['morir', 'muerto'],
          ]),
          ukList([
            'Ці форми не утворюються за правилом -ado / -ido: не *hacido, *escribido, *abrido.',
            'Після haber вони теж не змінюються: han escrito, ha abierto.',
            'Кожну форму тренуємо окремо: помилка в одній не означає, що ви не знаєте інших.',
          ]),
        ],
      }),
    ],
  }),
  tasks,
};
