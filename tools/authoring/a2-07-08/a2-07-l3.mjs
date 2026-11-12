// A2-07-L3 — regular affirmative instructions for tú and vosotros (O3); addressee recognition.
import { ex, table, ul, uk } from './lib.mjs';
import { kit, withPF } from './kit.mjs';

const L = 'A2-07-L3';
const TR = 'imperative.tu.regular/written-form';
const TS = 'imperative.tu.stem-change/written-form';
const TV = 'imperative.vosotros.regular/written-form';
const AD = 'imperative.addressee/reading-meaning';

const D = {
  [TR]: {
    rule: 'Наказ для tú дорівнює формі él/ella теперішнього часу: hablar → habla, comer → come, escribir → escribe.',
    ok: 'Правильно! Наказ для tú = форма él.',
    bad: 'Ще ні. Візьміть форму él теперішнього часу: habla, come, escribe.',
    unres: 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком.',
  },
  [TS]: {
    rule: 'Якщо в теперішньому часі корінь змінюється (él cierra, él vuelve, él pide), наказ для tú має ту саму зміну: cierra, vuelve, pide.',
    ok: 'Правильно! Чергування в корені збережено.',
    bad: 'Ще ні. Пригадайте форму él: cierra, vuelve, pide — наказ для tú такий самий.',
    unres: 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком.',
  },
  [TV]: {
    rule: 'Наказ для vosotros: кінцеве -r інфінітива замінюємо на -d: hablar → hablad, comer → comed, escribir → escribid. Чергування кореня немає (cerrad, volved). У формах цього уроку (hablad, comed, escribid, cerrad…) знак наголосу не потрібен.',
    ok: 'Правильно! Форма для vosotros на -d.',
    bad: 'Ще ні. Замініть -r інфінітива на -d: hablad, comed, escribid.',
    unres: 'Цю відповідь не вдалося перевірити автоматично. Порівняйте її зі зразком.',
  },
  [AD]: {
    rule: 'Habla, cierra — до однієї людини на «ти»; hablad, cerrad (закінчення -d) — до кількох людей, з якими на «ти» (vosotros).',
    ok: 'Правильно! Ви визначили адресата за формою.',
    bad: 'Ні. Подивіться на закінчення: -d — це vosotros, без -d — одна людина на «ти».',
  },
};

const k = kit(L, D);
const ONE = 'Напишіть лише пропущене слово.';
const err = (pairs) => pairs.map(([text, fb]) => [text, fb]);

const tasks = [
  // ---- imperative.tu.regular ----
  k.ch(1, 'supported', 'fam.home', TR, {
    instr: 'Ви просите брата прочитати повідомлення від Ани. Оберіть наказ для tú.',
    pre: uk('Нагадування: наказ для tú = форма él теперішнього часу: leer → lee.'),
    es: 'Pablo, ___ el mensaje de Ana.',
    opts: [
      ['lee', 'c'],
      ['lees', 'x', 'Lees — «ти читаєш». Наказ для tú дорівнює формі él: lee.'],
      ['leed', 'x', 'Leed — до кількох людей (vosotros). До одного брата: lee.'],
    ],
  }),
  k.ev(2, 'supported', 'fam.home', TR, {
    instr: `Утворіть наказ для tú від дієслова в дужках. ${ONE}`,
    model: ['Come la fruta. (comer → come)', 'Їж фрукти.'],
    es: '___ a tu madre. (escribir)',
    acc: ['Escribe'],
    closed: true,
    err: err([
      ['Escribes', 'Escribes — «ти пишеш». Наказ для tú: escribe.'],
      ['Escribid', 'Escribid — до кількох людей (vosotros).'],
      ['Escriba', 'Escriba — форма для usted (урок 5). Для tú: escribe.'],
    ]),
    tr: 'Напиши мамі.',
  }),
  k.ev(3, 'independent', 'fam.home', TR, {
    instr: `Утворіть наказ для tú. ${ONE}`,
    es: '___ el pan, por favor. (comprar)',
    acc: ['Compra'],
    closed: true,
    err: err([
      ['Compras', 'Compras — «ти купуєш». Наказ для tú: compra.'],
      ['Comprad', 'Comprad — до кількох людей (vosotros).'],
      ['Compre', 'Compre — форма для usted. Для tú: compra.'],
    ]),
    tr: 'Купи хліб, будь ласка.',
  }),
  k.ev(4, 'independent', 'fam.class', TR, {
    instr: `Утворіть наказ для tú. ${ONE}`,
    es: '___ el texto, por favor. (leer)',
    acc: ['Lee'],
    closed: true,
    err: err([
      ['Lees', 'Lees — «ти читаєш». Наказ для tú: lee.'],
      ['Leed', 'Leed — до кількох людей (vosotros).'],
      ['Lea', 'Lea — форма для usted. Для tú: lee.'],
    ]),
    tr: 'Прочитай текст, будь ласка.',
  }),
  k.ev(5, 'independent', 'fam.home', TR, {
    instr: `Утворіть наказ для tú. ${ONE}`,
    es: '___ un momento, por favor. (esperar)',
    acc: ['Espera'],
    closed: true,
    err: err([
      ['Esperas', 'Esperas — «ти чекаєш». Наказ для tú: espera.'],
      ['Esperad', 'Esperad — до кількох людей (vosotros).'],
      ['Espere', 'Espere — форма для usted. Для tú: espera.'],
    ]),
    tr: 'Зачекай хвилинку, будь ласка.',
  }),
  k.ev(6, 'independent', 'fam.class', TR, {
    instr: 'Перетворіть прохання на коротку інструкцію для tú (наказ). Por favor можна залишити.',
    es: '¿Puedes abrir el libro?',
    acc: withPF('Abre el libro.'),
    err: err([
      ['Abres el libro.', 'Abres — «ти відкриваєш». Наказ для tú: abre.'],
      ['Abrid el libro.', 'Abrid — до кількох людей (vosotros).'],
    ]),
    tr: 'Відкрий книжку.',
  }),
  k.ev(7, 'delayed', 'fam.home', TR, {
    instr: `Утворіть наказ для tú. ${ONE}`,
    es: '___ la luz, por favor. (apagar)',
    acc: ['Apaga'],
    closed: true,
    err: err([
      ['Apagas', 'Apagas — «ти вимикаєш». Наказ для tú: apaga.'],
      ['Apagad', 'Apagad — до кількох людей (vosotros).'],
      ['Apague', 'Apague — форма для usted. Для tú: apaga.'],
    ]),
    tr: 'Вимкни світло, будь ласка.',
  }),
  k.ev(8, 'delayed', 'fam.class', TR, {
    instr: `Утворіть наказ для tú. ${ONE}`,
    es: '___ tu nombre aquí. (escribir)',
    acc: ['Escribe'],
    closed: true,
    err: err([
      ['Escribes', 'Escribes — «ти пишеш». Наказ для tú: escribe.'],
      ['Escribid', 'Escribid — до кількох людей (vosotros).'],
    ]),
    tr: 'Напиши тут своє ім’я.',
  }),
  k.ev(9, 'transfer', 'fam.phone', TR, {
    instr: `Утворіть наказ для tú. ${ONE}`,
    es: '___ a tu hermano esta noche. (llamar)',
    acc: ['Llama'],
    closed: true,
    err: err([
      ['Llamas', 'Llamas — «ти телефонуєш». Наказ для tú: llama.'],
      ['Llamad', 'Llamad — до кількох людей (vosotros).'],
      ['Llame', 'Llame — форма для usted. Для tú: llama.'],
    ]),
    tr: 'Подзвони братові сьогодні ввечері.',
  }),
  k.ev(10, 'transfer', 'fam.phone', TR, {
    instr: 'Перетворіть прохання на коротку інструкцію для tú (наказ). Por favor можна залишити.',
    es: '¿Puedes llamar a Marta mañana?',
    acc: withPF('Llama a Marta mañana.'),
    err: err([
      ['Llamas a Marta mañana.', 'Llamas — «ти телефонуєш». Наказ для tú: llama.'],
      ['Llamad a Marta mañana.', 'Llamad — до кількох людей (vosotros).'],
    ]),
    tr: 'Подзвони Марті завтра.',
  }),

  // ---- imperative.tu.stem-change ----
  k.ch(11, 'supported', 'fam.home', TS, {
    instr: 'Оберіть наказ для tú від cerrar.',
    pre: uk('Нагадування: él cierra → наказ для tú: cierra.'),
    es: '___ la ventana, hace frío.',
    opts: [
      ['Cierra', 'c'],
      ['Cerra', 'x', 'У cerrar наголошене e стає ie, як в él cierra: cierra.'],
      ['Cerrad', 'x', 'Cerrad — до кількох людей (vosotros).'],
    ],
    tr: 'Зачини вікно, холодно.',
  }),
  k.ev(12, 'supported', 'fam.home', TS, {
    instr: `Утворіть наказ для tú за зразком. ${ONE}`,
    model: ['Vuelve pronto. (volver → vuelve)', 'Повертайся швидше.'],
    es: '___ bien, mañana tienes un examen. (dormir)',
    acc: ['Duerme'],
    closed: true,
    err: err([
      ['Dorme', 'У dormir наголошене o стає ue, як в él duerme: duerme.'],
      ['Duermes', 'Duermes — «ти спиш». Наказ для tú: duerme.'],
      ['Dormid', 'Dormid — до кількох людей (vosotros).'],
    ]),
    tr: 'Добре виспись, завтра в тебе іспит.',
  }),
  k.ev(13, 'independent', 'fam.home', TS, {
    instr: `Утворіть наказ для tú. ${ONE}`,
    es: '___ la luz, no veo nada. (encender)',
    acc: ['Enciende'],
    closed: true,
    err: err([
      ['Encende', 'У encender наголошене e стає ie: enciende.'],
      ['Enciendes', 'Enciendes — «ти вмикаєш». Наказ для tú: enciende.'],
      ['Encended', 'Encended — до кількох людей (vosotros).'],
    ]),
    tr: 'Увімкни світло, я нічого не бачу.',
  }),
  k.ev(14, 'independent', 'fam.class', TS, {
    instr: `Утворіть наказ для tú. ${ONE}`,
    es: '___ el número, por favor. (repetir)',
    acc: ['Repite'],
    closed: true,
    err: err([
      ['Repete', 'У repetir e стає i, як в él repite: repite.'],
      ['Repites', 'Repites — «ти повторюєш». Наказ для tú: repite.'],
      ['Repetid', 'Repetid — до кількох людей (vosotros).'],
    ]),
    tr: 'Повтори номер, будь ласка.',
  }),
  k.ev(15, 'independent', 'fam.class', TS, {
    instr: `Утворіть наказ для tú. ${ONE}`,
    es: '___ ahora, tenemos poco tiempo. (empezar)',
    acc: ['Empieza'],
    closed: true,
    err: err([
      ['Empeza', 'У empezar наголошене e стає ie: empieza.'],
      ['Empiezas', 'Empiezas — «ти починаєш». Наказ для tú: empieza.'],
      ['Empezad', 'Empezad — до кількох людей (vosotros).'],
    ]),
    tr: 'Починай зараз, у нас мало часу.',
  }),
  k.ev(16, 'independent', 'fam.home', TS, {
    instr: 'Перетворіть прохання на коротку інструкцію для tú (наказ). Por favor можна залишити.',
    es: '¿Puedes volver a las ocho?',
    acc: withPF('Vuelve a las ocho.'),
    err: err([
      ['Volve a las ocho.', 'У volver наголошене o стає ue: vuelve.'],
      ['Vuelves a las ocho.', 'Vuelves — «ти повертаєшся». Наказ для tú: vuelve.'],
    ]),
    tr: 'Повертайся о восьмій.',
  }),
  k.ev(17, 'delayed', 'fam.home', TS, {
    instr: `Утворіть наказ для tú. ${ONE}`,
    es: '___ bien antes de comprar. (pensar)',
    acc: ['Piensa'],
    closed: true,
    err: err([
      ['Pensa', 'У pensar наголошене e стає ie: piensa.'],
      ['Piensas', 'Piensas — «ти думаєш». Наказ для tú: piensa.'],
    ]),
    tr: 'Добре подумай, перш ніж купувати.',
  }),
  k.ev(18, 'delayed', 'fam.class', TS, {
    instr: `Утворіть наказ для tú. ${ONE}`,
    es: '___ un café para todos. (pedir)',
    acc: ['Pide'],
    closed: true,
    err: err([
      ['Pede', 'У pedir e стає i: pide.'],
      ['Pides', 'Pides — «ти замовляєш». Наказ для tú: pide.'],
      ['Pedid', 'Pedid — до кількох людей (vosotros).'],
    ]),
    tr: 'Замов каву для всіх.',
  }),
  k.ev(19, 'transfer', 'fam.street', TS, {
    instr: `Утворіть наказ для tú. ${ONE}`,
    es: '___ hasta la plaza y allí está el banco. (seguir)',
    acc: ['Sigue'],
    closed: true,
    err: err([
      ['Segue', 'У seguir e стає i: sigue.'],
      ['Sigues', 'Sigues — «ти йдеш далі». Наказ для tú: sigue.'],
      ['Seguid', 'Seguid — до кількох людей (vosotros).'],
    ]),
    tr: 'Іди далі до площі, і там буде банк.',
  }),
  k.ev(20, 'transfer', 'fam.street', TS, {
    instr: `Утворіть наказ для tú. ${ONE}`,
    es: '___ el número de la casa: es el doce. (recordar)',
    acc: ['Recuerda'],
    closed: true,
    err: err([
      ['Recorda', 'У recordar наголошене o стає ue: recuerda.'],
      ['Recuerdas', 'Recuerdas — «ти пам’ятаєш». Наказ для tú: recuerda.'],
    ]),
    tr: 'Запам’ятай номер будинку: дванадцятий.',
  }),

  // ---- imperative.vosotros.regular ----
  k.ch(21, 'supported', 'fam.class', TV, {
    instr: 'Викладачка звертається до всієї групи. Оберіть форму для vosotros.',
    pre: uk('Нагадування: для vosotros -r інфінітива замінюємо на -d: abrir → abrid.'),
    es: 'Chicos, ___ el libro, por favor.',
    opts: [
      ['abrid', 'c'],
      ['abre', 'x', 'Abre — до однієї людини на «ти». До групи: abrid.'],
      ['abrir', 'x', 'У розмовній мові Іспанії так часто кажуть, але норма для vosotros — abrid.'],
    ],
  }),
  k.ev(22, 'supported', 'fam.home', TV, {
    instr: `Утворіть наказ для vosotros за зразком. ${ONE}`,
    model: ['Escuchad, por favor. (escuchar → escuchad)', 'Послухайте, будь ласка (до кількох).'],
    es: 'Niños, ___ la fruta. (comer)',
    acc: ['comed'],
    closed: true,
    err: err([
      ['come', 'Come — до однієї людини. До кількох дітей: comed.'],
      ['comer', 'У розмовній мові так часто кажуть, але норма для vosotros — comed.'],
      ['coméd', 'Comed пишеться без знака наголосу: наголос на останньому складі, слово закінчується на -d.'],
    ]),
    tr: 'Діти, їжте фрукти.',
  }),
  k.ev(23, 'independent', 'fam.home', TV, {
    instr: `Утворіть наказ для vosotros. ${ONE}`,
    es: 'Chicos, ___ la puerta, por favor. (cerrar)',
    acc: ['cerrad'],
    closed: true,
    err: err([
      ['cierrad', 'У формі vosotros чергування немає: cerrad.'],
      ['cierra', 'Cierra — до однієї людини. До кількох: cerrad.'],
      ['cerrar', 'У розмовній мові так часто кажуть, але норма для vosotros — cerrad.'],
    ]),
    tr: 'Хлопці, зачиніть двері, будь ласка.',
  }),
  k.ev(24, 'independent', 'fam.class', TV, {
    instr: `Утворіть наказ для vosotros. ${ONE}`,
    es: 'Chicos, ___ vuestro nombre aquí. (escribir)',
    acc: ['escribid'],
    closed: true,
    err: err([
      ['escribe', 'Escribe — до однієї людини. До кількох: escribid.'],
      ['escribir', 'У розмовній мові так часто кажуть, але норма для vosotros — escribid.'],
      ['escribís', 'Escribís — «ви пишете». Наказ для vosotros: escribid.'],
    ]),
    tr: 'Хлопці, напишіть тут свої імена.',
  }),
  k.ev(25, 'independent', 'fam.home', TV, {
    instr: `Утворіть наказ для vosotros. ${ONE}`,
    es: 'Niños, ___ a casa a las ocho. (volver)',
    acc: ['volved'],
    closed: true,
    err: err([
      ['vuelved', 'У формі vosotros чергування немає: volved.'],
      ['vuelve', 'Vuelve — до однієї людини. До кількох: volved.'],
      ['volver', 'У розмовній мові так часто кажуть, але норма для vosotros — volved.'],
    ]),
    tr: 'Діти, поверніться додому о восьмій.',
  }),
  k.ev(26, 'independent', 'fam.friends', TV, {
    instr: 'Перетворіть прохання на коротку інструкцію для vosotros (наказ). Por favor можна залишити.',
    es: '¿Podéis esperar un momento?',
    acc: withPF('Esperad un momento.'),
    err: err([
      ['Esperar un momento.', 'У розмовній мові так часто кажуть, але норма для vosotros — esperad.'],
      ['Espera un momento.', 'Espera — до однієї людини. До кількох: esperad.'],
    ]),
    tr: 'Зачекайте хвилинку.',
  }),
  k.ev(27, 'delayed', 'fam.home', TV, {
    instr: `Утворіть наказ для vosotros. ${ONE}`,
    es: 'Chicos, ___ la tele, es tarde. (apagar)',
    acc: ['apagad'],
    closed: true,
    err: err([
      ['apaga', 'Apaga — до однієї людини. До кількох: apagad.'],
      ['apagar', 'У розмовній мові так часто кажуть, але норма для vosotros — apagad.'],
    ]),
    tr: 'Хлопці, вимкніть телевізор, уже пізно.',
  }),
  k.ev(28, 'delayed', 'fam.class', TV, {
    instr: `Утворіть наказ для vosotros. ${ONE}`,
    es: 'Chicos, ___ los deberes en casa. (hacer)',
    acc: ['haced'],
    closed: true,
    err: err([
      ['hacer', 'У розмовній мові так часто кажуть, але норма для vosotros — haced.'],
      ['hacéis', 'Hacéis — «ви робите». Наказ для vosotros: haced.'],
      ['haz', 'Haz — наказ для однієї людини. До кількох: haced.'],
    ]),
    tr: 'Хлопці, зробіть домашнє завдання вдома.',
  }),
  k.ev(29, 'transfer', 'fam.trip', TV, {
    instr: `Утворіть наказ для vosotros. ${ONE}`,
    es: 'Amigos, ___ al parque a las cinco. (ir)',
    acc: ['id'],
    closed: true,
    err: err([
      ['ir', 'У розмовній мові так часто кажуть, але норма для vosotros — id.'],
      ['vais', 'Vais — «ви йдете». Наказ для vosotros: id.'],
    ]),
    tr: 'Друзі, ідіть у парк о п’ятій.',
  }),
  k.ev(30, 'transfer', 'fam.trip', TV, {
    instr: 'Перетворіть прохання на коротку інструкцію для vosotros (наказ). Por favor можна залишити.',
    es: '¿Podéis traer agua y fruta?',
    acc: withPF('Traed agua y fruta.'),
    err: err([
      ['Traer agua y fruta.', 'У розмовній мові так часто кажуть, але норма для vosotros — traed.'],
      ['Trae agua y fruta.', 'Trae — до однієї людини. До кількох: traed.'],
    ]),
    tr: 'Принесіть воду й фрукти.',
  }),

  // ---- imperative.addressee ----
  k.ch(31, 'supported', 'fam.class', AD, {
    instr: 'Прочитайте інструкцію. Кому вона адресована?',
    pre: uk('Нагадування: закінчення -d (cerrad) — до кількох людей на «ти» (vosotros).'),
    es: 'Cerrad las ventanas, por favor.',
    opts: [
      ['кільком людям, з якими на «ти» (vosotros)', 'c'],
      ['одній людині на «ти» (tú)', 'x', 'Закінчення -d (cerrad) показує vosotros. Одній людині: cierra.'],
    ],
  }),
  k.ch(32, 'independent', 'fam.home', AD, {
    instr: 'Прочитайте інструкцію. Кому вона адресована?',
    es: 'Lee el mensaje de Pablo.',
    opts: [
      ['одній людині на «ти» (tú)', 'c'],
      ['кільком людям (vosotros)', 'x', 'Для кількох людей було б leed. Lee — до однієї людини.'],
    ],
  }),
  k.ch(33, 'independent', 'fam.friends', AD, {
    instr: 'Прочитайте інструкцію. Кому вона адресована?',
    es: 'Ana, mira esto.',
    opts: [
      ['одній людині на «ти» (tú)', 'c'],
      ['кільком людям (vosotros)', 'x', 'Для кількох людей було б mirad. Mira — до однієї людини.'],
    ],
  }),
  k.ch(34, 'delayed', 'fam.class', AD, {
    instr: 'Прочитайте інструкцію. Кому вона адресована?',
    es: 'Niños, escuchad: mañana no hay clase.',
    opts: [
      ['кільком людям (vosotros)', 'c'],
      ['одній людині на «ти» (tú)', 'x', 'Закінчення -d (escuchad) показує vosotros.'],
    ],
  }),
  k.ch(35, 'transfer', 'fam.office', AD, {
    instr: 'Прочитайте записку колезі. Кому вона адресована?',
    es: 'Elena, enciende el ordenador de la sala, por favor.',
    opts: [
      ['одній людині на «ти» (tú)', 'c'],
      ['кільком людям (vosotros)', 'x', 'Для кількох людей було б encended. Enciende — до однієї людини.'],
    ],
  }),
];

const lesson = {
  schemaVersion: 1,
  id: L,
  kind: 'lesson',
  blockId: 'A2-07',
  titleUk: 'Інструкції для tú і vosotros',
  termEs: 'imperativo afirmativo: tú y vosotros',
  summaryUk: 'Як дати коротку інструкцію одній людині на «ти» (habla, come, escribe; cierra, vuelve, pide) і кільком людям (hablad, comed, escribid) — лише ствердний наказ.',
  objectives: ['A2-07-O3'],
  situations: ['people-family-home', 'instructions-notices', 'routine-study-leisure'],
  estimatedMinutes: 18,
  introduces: ['imperative.tu.regular', 'imperative.tu.stem-change', 'imperative.vosotros.regular', 'imperative.addressee'],
  revisits: ['present.regular-ar', 'present.regular-er', 'present.regular-ir', 'present.stem-e-ie', 'present.stem-o-ue', 'present.stem-e-i', 'pron.subject', 'formula.request-puedes'],
  steps: [
    {
      id: 's1',
      kind: 'explanation',
      titleUk: 'Наказ для tú: як форма él',
      required: true,
      blocks: [
        uk('Щоб дати інструкцію чи попросити одну людину, з якою ви на «ти», беремо форму él/ella теперішнього часу: él habla → ¡Habla!, él come → ¡Come!, él escribe → ¡Escribe!'),
        table(
          ['infinitivo', 'él (presente)', 'tú (imperativo)'],
          [
            ['hablar', 'habla', 'habla'],
            ['mirar', 'mira', 'mira'],
            ['comer', 'come', 'come'],
            ['leer', 'lee', 'lee'],
            ['escribir', 'escribe', 'escribe'],
            ['abrir', 'abre', 'abre'],
          ],
        ),
        uk('Це лише ствердний наказ («зроби»). Заперечні накази («не роби») мають інші форми, їх ми поки не вивчаємо, тому не додавайте до цих форм no. З por favor наказ звучить як звичайне прохання.'),
        ex('Mira, es Ana.', 'Подивися, це Ана.'),
        ex('Espera un momento, por favor.', 'Зачекай хвилинку, будь ласка.'),
        ex('Llama a tu hermano.', 'Подзвони братові.'),
        ex('Apaga la luz y avisa a Ana.', 'Вимкни світло й попередь Ану.'),
      ],
    },
    {
      id: 's2',
      kind: 'explanation',
      titleUk: 'Чергування в корені: cierra, vuelve, pide',
      required: true,
      blocks: [
        uk('Якщо в теперішньому часі корінь змінюється (él cierra, él vuelve, él pide), наказ для tú має ту саму зміну.'),
        table(
          ['infinitivo', 'él (presente)', 'tú (imperativo)'],
          [
            ['cerrar', 'cierra', 'cierra'],
            ['empezar', 'empieza', 'empieza'],
            ['encender', 'enciende', 'enciende'],
            ['volver', 'vuelve', 'vuelve'],
            ['dormir', 'duerme', 'duerme'],
            ['pedir', 'pide', 'pide'],
            ['repetir', 'repite', 'repite'],
            ['seguir', 'sigue', 'sigue'],
          ],
        ),
        ex('Cierra la ventana, hace frío.', 'Зачини вікно, холодно.'),
        ex('Vuelve pronto.', 'Повертайся швидше.'),
        ex('Enciende la luz, por favor.', 'Увімкни світло, будь ласка.'),
        ex('Sigue hasta la plaza.', 'Іди далі до площі.'),
      ],
    },
    {
      id: 's3',
      kind: 'explanation',
      titleUk: 'Наказ для vosotros: -ad, -ed, -id',
      required: true,
      blocks: [
        uk('До кількох людей, з якими ви на «ти», в Іспанії звертаються на vosotros. Наказ утворюємо, замінивши кінцеве -r інфінітива на -d: hablar → hablad, comer → comed, escribir → escribid. Чергування кореня тут немає (cerrar → cerrad, volver → volved). У формах цього уроку знак наголосу не потрібен: hablad, comed, escribid.'),
        table(
          ['infinitivo', 'vosotros (imperativo)'],
          [
            ['hablar', 'hablad'],
            ['comer', 'comed'],
            ['escribir', 'escribid'],
            ['cerrar', 'cerrad'],
            ['volver', 'volved'],
            ['hacer', 'haced'],
            ['ir', 'id'],
          ],
        ),
        uk('У розмовній мові Іспанії замість форми на -d часто чують інфінітив (¡Mirar esto!), але нормою це не є. У завданнях на форму пишіть -d.'),
        ex('Chicos, abrid el libro.', 'Хлопці, відкрийте книжку.'),
        ex('Escuchad, por favor.', 'Послухайте, будь ласка.'),
        ex('Volved a casa a las ocho.', 'Поверніться додому о восьмій.'),
      ],
    },
    {
      id: 's4',
      kind: 'explanation',
      titleUk: 'Кому інструкція?',
      required: true,
      blocks: [
        uk('За формою видно адресата: habla, cierra — одна людина на «ти»; hablad, cerrad — кілька людей на «ти» (vosotros). Форми для usted і ustedes вивчатимемо в уроці 5.'),
        ex('Pablo, cierra la puerta.', 'Пабло, зачини двері.'),
        ex('Chicos, cerrad la puerta.', 'Хлопці, зачиніть двері.'),
      ],
    },
    { id: 's5', kind: 'supported-practice', titleUk: 'Практика зі зразком', required: true, taskIds: ['A2-07-L3-T01', 'A2-07-L3-T02', 'A2-07-L3-T11', 'A2-07-L3-T12', 'A2-07-L3-T21', 'A2-07-L3-T22', 'A2-07-L3-T31'] },
    { id: 's6', kind: 'independent-practice', titleUk: 'Самостійна практика', required: true, taskIds: ['A2-07-L3-T03', 'A2-07-L3-T04', 'A2-07-L3-T13', 'A2-07-L3-T14', 'A2-07-L3-T23', 'A2-07-L3-T24', 'A2-07-L3-T32', 'A2-07-L3-T33'] },
    { id: 's7', kind: 'independent-practice', titleUk: 'Додаткова практика (за бажанням)', required: false, taskIds: ['A2-07-L3-T05', 'A2-07-L3-T06', 'A2-07-L3-T15', 'A2-07-L3-T16', 'A2-07-L3-T25', 'A2-07-L3-T26'] },
    {
      id: 's8',
      kind: 'summary',
      titleUk: 'Підсумок',
      required: true,
      blocks: [
        ul([
          'Tú: наказ = форма él теперішнього часу (habla, come, escribe).',
          'Чергування кореня зберігається: cierra, vuelve, pide, sigue.',
          'Vosotros: -r → -d (hablad, comed, escribid), без чергування; у цих формах знак наголосу не потрібен.',
          'Лише ствердний наказ; заперечних наказів поки не вивчаємо.',
        ]),
      ],
    },
  ],
  reviewStatus: 'draft',
};

export default { lesson, tasks };
