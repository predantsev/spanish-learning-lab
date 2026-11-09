// A1-06-L1 — likes and dislikes with gustar: pronouns (me/te/le, nos/os/les), gusta/gustan,
// infinitive, article with nouns, a + person + le, negation, encantar, degree, short responses,
// listening to preferences (O1, CV-02, CV-05).
import { Kit, S, ex, hClue, hRule, hTranscript, plink, tableEs, tableUk, ul, uk, DICTATION } from '../lib.ts';
import type { Hint, TaskRole } from '../../../content/types.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-06-L1', RULES);

const P = 'gustar.pronouns/written-form';
const PC = 'gustar.pronouns/context-choice';
const PP = 'gustar.pronouns.plural/written-form';
const PPC = 'gustar.pronouns.plural/context-choice';
const AG = 'gustar.agreement/written-form';
const AGC = 'gustar.agreement/context-choice';
const IN = 'gustar.infinitive/construction-use';
const INW = 'gustar.infinitive/written-form';
const NA = 'gustar.noun-with-article/written-form';
const NAC = 'gustar.noun-with-article/context-choice';
const AL = 'gustar.a-noun-le/construction-use';
const ALW = 'gustar.a-noun-le/written-form';
const NG = 'gustar.negation/written-form';
const NGU = 'gustar.negation/construction-use';
const EN = 'gustar.encantar/written-form';
const ENC = 'gustar.encantar/context-choice';
const ENU = 'gustar.encantar/construction-use';
const DG = 'gustar.degree/construction-use';
const DGC = 'gustar.degree/context-choice';
const RS = 'gustar.responses/construction-use';
const RSC = 'gustar.responses/context-choice';
const LP = 'listening.preferences/listening-meaning';
const LPD = 'listening.preferences/dictation';

type E = Array<[string, string]>;

/** Exact-variants task with an optional Spanish prompt line and Ukrainian translation hint. */
function x(n: number, role: TaskRole, fam: string, t: string, ins: string, acc: string[], err: E = [], p?: string, tr?: string, hints?: Hint[]): string {
  return k.exact({ n, role, fam, t: [t], ins, acc, ...(err.length > 0 ? { err } : {}), ...(p ? { p: [p] } : {}), ...(tr ? { tr } : {}), ...(hints ? { hints } : {}) });
}
/** Construction clues for full-sentence tasks whose sentence needs a construction taught in another step. */
const ART = (t: string): Hint[] => [hClue([t], 'Про річ, що подобається загалом, — іменник з означеним артиклем: Me gusta el café. Me gustan los libros.')];
const INF = (t: string): Hint[] => [hClue([t], 'Про дію, що подобається, — gusta + інфінітив: Me gusta leer. Nos gusta nadar.')];
const ANL = (t: string): Hint[] => [hClue([t], 'Про конкретну людину — a + людина + le: A Ana le gusta el té. A mi padre le encanta leer.')];

/** Single-slot rewrite task: the learner retypes the whole sentence with the gap filled. */
function one(n: number, role: TaskRole, fam: string, t: string, ins: string, before: string, after: string, acc: string[], err: E = [], tr?: string): string {
  return k.slots({
    n,
    role,
    fam,
    t: [t],
    ins,
    p: [`${before}___${after}`],
    tpl: [...(before ? [before] : []), S('s1'), ...(after ? [after] : [])],
    slots: [{ id: 's1', t, acc, ...(err.length > 0 ? { err } : {}) }],
    ...(tr ? { tr } : {}),
  });
}

const yoErr = (w: string): [string, string] => [w, `З gustar людину позначає займенник (me, te, le…), а не ${w}: як «мені подобається», а не «я подобаю».`];
const pronIns = (meaning: string, model?: string): string => `Впиши займенник, щоб речення означало ${meaning}.${model ? ` Зразок: ${model}.` : ''}`;
const gustIns = (model?: string): string => `Впиши gusta або gustan.${model ? ` Зразок: ${model}.` : ''}`;
const oneThing = (v: string): [string, string] => [`${v}n`, `Подобається одна річ, тож ${v}.`];
const manyThings = (v: string): [string, string] => [v.slice(0, -1), `Подобається кілька речей (множина), тож ${v}.`];

// ======================= 1. me / te / le
x(1, 'supported', 'a106.music', P, pronIns('«Мені подобається музика»', 'Te gusta el café — «Тобі подобається кава»'), ['Me'], [yoErr('Yo'), ['Te', 'Te — «тобі». «Мені» — me.'], ['Le', 'Le — «йому, їй, Вам». «Мені» — me.']], '___ gusta la música.');
x(2, 'supported', 'a106.drinks', P, pronIns('«Тобі подобається чай?»', 'Me gusta el café — «Мені подобається кава»'), ['Te'], [yoErr('Tú'), ['Me', 'Me — «мені». «Тобі» — te.']], '¿___ gusta el té?');
x(3, 'independent', 'a106.sport', P, pronIns('«Йому подобається футбол»'), ['Le'], [yoErr('Él'), ['Se', 'З gustar для «йому, їй» — le.'], ['Me', 'Me — «мені». «Йому» — le.']], '___ gusta el fútbol.');
x(4, 'independent', 'a106.sweets', P, 'Переклади іспанською: «Мені подобається шоколад».', ['Me gusta el chocolate.', 'A mí me gusta el chocolate.'], [['Yo gusta el chocolate.', yoErr('Yo')[1]]], undefined, undefined, ART(P));
x(5, 'independent', 'a106.city', P, 'Запитай іспанською ввічливо одну людину: «Вам подобається Мадрид?»', ['¿Le gusta Madrid?', '¿A usted le gusta Madrid?', '¿Le gusta a usted Madrid?'], [['¿Usted gusta Madrid?', 'Людину позначає займенник: ¿Le gusta…? (le — також для usted).'], ['¿Te gusta Madrid?', 'Te — на «ти». Ввічливо одній людині — le.']]);
one(6, 'independent', 'a106.reading', P, 'Перепиши питання повністю, вставивши займенник, щоб воно означало «Тобі подобається читати?»', '¿', ' gusta leer?', ['Te'], [yoErr('Tú')]);
x(7, 'delayed', 'a106.cinema', P, pronIns('«Їй подобається кіно»'), ['Le'], [yoErr('Ella'), ['La', 'З gustar для «їй» — le (так само, як для «йому»).']], '___ gusta el cine.');
x(8, 'delayed', 'a106.beach', P, 'Переклади іспанською: «Тобі подобається пляж?»', ['¿Te gusta la playa?', '¿A ti te gusta la playa?'], [['¿Tú gustas la playa?', yoErr('Tú')[1]]], undefined, undefined, ART(P));
x(9, 'transfer', 'a106.travel-chat', P, 'Друг питає, як тобі Валенсія. Напиши іспанською: «Мені подобається Валенсія».', ['Me gusta Valencia.', 'A mí me gusta Valencia.'], [['Yo gusto Valencia.', yoErr('Yo')[1]]]);
one(10, 'transfer', 'a106.kitchen-t', P, 'Перепиши речення повністю, вставивши займенник, щоб воно означало «Йому подобається готувати».', '', ' gusta cocinar.', ['Le'], [yoErr('Él')]);
k.choice({ n: 11, role: 'independent', fam: 'a106.music', t: [PC], ins: 'Обери речення зі значенням «Мені подобається музика».', o: [['Yo gusta la música.', PC, yoErr('Yo')[1]], ['Me gusta la música.', true], ['Le gusta la música.', PC, 'Le — «йому, їй». «Мені» — me.']] });
k.choice({ n: 12, role: 'delayed', fam: 'a106.sport', t: [PC], ins: 'Обери займенник зі значенням «тобі».', p: ['¿___ gusta el fútbol?'], o: [['Te', true], ['Tú', PC, yoErr('Tú')[1]], ['Me', PC, 'Me — «мені».']] });

// ======================= 2. nos / os / les
x(13, 'supported', 'a106.cinema', PP, pronIns('«Нам подобається кіно»', 'Me gusta el cine → Nos gusta el cine'), ['Nos'], [yoErr('Nosotros'), ['Les', 'Les — «їм». «Нам» — nos.']], '___ gusta el cine.');
x(14, 'supported', 'a106.music', PP, pronIns('«Вам (кільком друзям, на «ти») подобається музика?»', 'Nos gusta la música'), ['Os'], [yoErr('Vosotros'), ['Les', 'Les — «їм» або формальне «вам». Друзям на «ти» в Іспанії — os.']], '¿___ gusta la música?');
x(15, 'independent', 'a106.beach', PP, pronIns('«Їм подобається пляж»'), ['Les'], [yoErr('Ellos'), ['Se', 'З gustar для «їм» — les.'], ['Nos', 'Nos — «нам». «Їм» — les.']], '___ gusta la playa.');
x(16, 'independent', 'a106.travel', PP, 'Переклади іспанською: «Нам подобається подорожувати».', ['Nos gusta viajar.', 'A nosotros nos gusta viajar.', 'A nosotras nos gusta viajar.'], [['Nosotros gustamos viajar.', yoErr('Nosotros')[1]]], undefined, undefined, INF(PP));
x(17, 'independent', 'a106.hotel', PP, pronIns('«Вам (кільком людям, формально) подобається готель?»'), ['Les'], [['Os', 'Os — кільком людям на «ти». Формально (ustedes) — les.'], yoErr('Ustedes')], '¿___ gusta el hotel?');
one(18, 'independent', 'a106.kitchen', PP, 'Перепиши питання повністю, вставивши займенник, щоб воно означало «Вам (друзі, на «ти») подобається готувати?»', '¿', ' gusta cocinar?', ['Os'], [yoErr('Vosotros')]);
x(19, 'delayed', 'a106.sport', PP, pronIns('«Нам подобається футбол»'), ['Nos'], [yoErr('Nosotros')], '___ gusta el fútbol.');
x(20, 'delayed', 'a106.dance', PP, 'Переклади іспанською: «Їм подобається танцювати».', ['Les gusta bailar.', 'A ellos les gusta bailar.', 'A ellas les gusta bailar.'], [['Ellos gustan bailar.', yoErr('Ellos')[1]]], undefined, undefined, INF(PP));
x(21, 'transfer', 'a106.visit-t', PP, 'Друзі (vosotros) приїхали до тебе в Мадрид. Запитай іспанською: «Вам подобається Мадрид?»', ['¿Os gusta Madrid?', '¿A vosotros os gusta Madrid?', '¿A vosotras os gusta Madrid?'], [['¿Les gusta Madrid?', 'Les — формально (ustedes). Друзям на «ти» — os.']]);
one(22, 'transfer', 'a106.park-t', PP, 'Перепиши речення повністю, вставивши займенник, щоб воно означало «Нам подобається гуляти в парку».', '', ' gusta pasear por el parque.', ['Nos'], [yoErr('Nosotros')]);
k.choice({ n: 23, role: 'independent', fam: 'a106.travel', t: [PPC], ins: 'Обери займенник зі значенням «їм».', p: ['___ gusta viajar.'], o: [['Nos', PPC, 'Nos — «нам».'], ['Les', true], ['Os', PPC, 'Os — «вам» (vosotros).']] });
k.choice({ n: 24, role: 'delayed', fam: 'a106.cinema', t: [PPC], ins: 'Ти питаєш двох друзів на «ти». Обери займенник.', p: ['¿___ gusta el teatro?'], o: [['Os', true], ['Nos', PPC, 'Nos — «нам».'], ['Vosotros', PPC, yoErr('Vosotros')[1]]] });

// ======================= 3. gusta / gustan
x(25, 'supported', 'a106.drinks', AG, gustIns('Me gustan los libros'), ['gusta'], [oneThing('gusta')], 'Me ___ el café.', 'Мені подобається кава.');
x(26, 'supported', 'a106.cinema', AG, gustIns('Me gusta el té'), ['gustan'], [manyThings('gustan')], 'Nos ___ las películas.', 'Нам подобаються фільми.');
x(27, 'independent', 'a106.pets', AG, gustIns(), ['gustan'], [manyThings('gustan')], '¿Te ___ los gatos?', 'Тобі подобаються коти?');
x(28, 'independent', 'a106.music', AG, gustIns(), ['gusta'], [oneThing('gusta')], 'Le ___ la música.', 'Їй подобається музика.');
x(29, 'independent', 'a106.fruit', AG, gustIns(), ['gustan'], [manyThings('gustan')], 'Me ___ las manzanas.', 'Мені подобаються яблука.');
x(30, 'independent', 'a106.pets', AG, 'Переклади іспанською: «Тобі подобаються собаки?»', ['¿Te gustan los perros?', '¿A ti te gustan los perros?'], [['¿Te gusta los perros?', manyThings('gustan')[1]]]);
x(31, 'delayed', 'a106.sweets', AG, gustIns(), ['gusta'], [oneThing('gusta')], 'Nos ___ el chocolate.', 'Нам подобається шоколад.');
k.slots({
  n: 32,
  role: 'delayed',
  fam: 'a106.market',
  t: [AG],
  ins: 'Перепиши речення повністю, вставивши gusta або gustan: «Мені подобаються помідори й подобається сир».',
  p: ['Me ___ los tomates y me ___ el queso.'],
  tpl: ['Me ', S('s1'), ' los tomates y me ', S('s2'), ' el queso.'],
  slots: [
    { id: 's1', t: AG, acc: ['gustan'], err: [manyThings('gustan')] },
    { id: 's2', t: AG, acc: ['gusta'], err: [oneThing('gusta')] },
  ],
});
x(33, 'transfer', 'a106.films-t', AG, 'Переклади іспанською: «Мені подобаються іспанські фільми».', ['Me gustan las películas españolas.', 'A mí me gustan las películas españolas.'], [['Me gusta las películas españolas.', manyThings('gustan')[1]]]);
x(34, 'transfer', 'a106.flowers-t', AG, gustIns(), ['gustan'], [manyThings('gustan')], 'A Ana le ___ las flores.', 'Ані подобаються квіти.');
k.choice({ n: 35, role: 'independent', fam: 'a106.books', t: [AGC], ins: 'Обери форму.', p: ['Me ___ los libros.'], o: [['gusta', AGC, manyThings('gustan')[1]], ['gustan', true]], tr: 'Мені подобаються книжки.' });
k.choice({ n: 36, role: 'delayed', fam: 'a106.music', t: [AGC], ins: 'Обери форму.', p: ['Nos ___ la música.'], o: [['gusta', true], ['gustan', AGC, 'Музика — одна річ (однина): gusta. «Нам» не впливає на форму дієслова.']], tr: 'Нам подобається музика.' });

// ======================= 4. gusta + infinitive
const infErr = (form: string, inf: string): [string, string] => [form, `Після gusta ставимо інфінітив (словникову форму): ${inf}.`];
x(37, 'supported', 'a106.reading', INW, 'Впиши дієслово leer у потрібній формі: «Мені подобається читати». Зразок: Me gusta cocinar.', ['leer'], [infErr('leo', 'leer')], 'Me gusta ___.');
x(38, 'supported', 'a106.kitchen', IN, 'Переклади іспанською: «Нам подобається готувати». Зразок: Me gusta leer.', ['Nos gusta cocinar.', 'A nosotros nos gusta cocinar.', 'A nosotras nos gusta cocinar.'], [['Nos gusta cocinamos.', infErr('cocinamos', 'cocinar')[1]]]);
x(39, 'independent', 'a106.dance', INW, 'Впиши дієслово bailar у потрібній формі: «Їй подобається танцювати».', ['bailar'], [infErr('baila', 'bailar')], 'Le gusta ___.');
x(40, 'independent', 'a106.swim', IN, 'Переклади іспанською: «Мені подобається плавати».', ['Me gusta nadar.', 'A mí me gusta nadar.'], [['Me gusta nado.', infErr('nado', 'nadar')[1]]]);
x(41, 'independent', 'a106.travel', IN, 'Переклади іспанською: «Тобі подобається подорожувати?»', ['¿Te gusta viajar?', '¿A ti te gusta viajar?'], [['¿Te gustan viajar?', 'З інфінітивом — завжди gusta: ¿Te gusta viajar?'], ['¿Te gusta viajas?', infErr('viajas', 'viajar')[1]]]);
one(42, 'independent', 'a106.reading', INW, 'Перепиши речення повністю, вставивши gusta або gustan: «Мені подобається читати й писати».', 'Me ', ' leer y escribir.', ['gusta'], [['gustan', 'З інфінітивом — завжди gusta, навіть із кількома діями.']]);
x(43, 'delayed', 'a106.run', IN, 'Переклади іспанською: «Їм подобається бігати в парку».', ['Les gusta correr en el parque.', 'A ellos les gusta correr en el parque.', 'A ellas les gusta correr en el parque.'], [['Les gusta corren en el parque.', infErr('corren', 'correr')[1]]], undefined, undefined, [hClue([IN], 'Кільком людям (ellos, ellas) — les: Les gusta leer. Нам — nos: Nos gusta nadar.')]);
x(44, 'delayed', 'a106.kitchen', INW, 'Впиши дієслово cocinar у потрібній формі: «Тобі подобається готувати?»', ['cocinar'], [infErr('cocinas', 'cocinar')], '¿Te gusta ___?');
x(45, 'transfer', 'a106.dog-t', IN, 'Переклади іспанською: «Мені подобається гуляти зі своїм собакою».', ['Me gusta pasear con mi perro.', 'A mí me gusta pasear con mi perro.'], [['Me gusta paseo con mi perro.', infErr('paseo', 'pasear')[1]]]);
x(46, 'transfer', 'a106.sport-t', IN, 'Переклади іспанською: «Нам подобається плавати й бігати».', ['Nos gusta nadar y correr.', 'A nosotros nos gusta nadar y correr.', 'A nosotras nos gusta nadar y correr.'], [['Nos gustan nadar y correr.', 'З інфінітивами — завжди gusta, навіть із кількома діями.']]);

// ======================= 5. article with the liked noun
const artIns = (model?: string): string => `Впиши означений артикль (el, la, los, las): ідеться про те, що подобається загалом.${model ? ` Зразок: ${model}.` : ''}`;
const indef = (a: string, right: string): [string, string] => [a, `Про те, що подобається загалом, кажемо з означеним артиклем: ${right}.`];
x(47, 'supported', 'a106.sweets', NA, artIns('Me gusta el té'), ['el'], [indef('un', 'el')], 'Me gusta ___ chocolate.');
x(48, 'supported', 'a106.pets', NA, artIns('Me gustan los perros'), ['los'], [indef('unos', 'los')], 'Me gustan ___ gatos.');
x(49, 'independent', 'a106.fruit', NA, artIns(), ['la'], [indef('una', 'la')], '¿Te gusta ___ fruta?', 'Тобі подобаються фрукти?');
x(50, 'independent', 'a106.flowers', NA, artIns(), ['las'], [indef('unas', 'las')], 'Nos gustan ___ flores.', 'Нам подобаються квіти.');
x(51, 'independent', 'a106.drinks', NA, 'Переклади іспанською: «Мені подобається кава».', ['Me gusta el café.', 'A mí me gusta el café.'], [['Me gusta café.', 'Перед іменником потрібен артикль: Me gusta el café.']]);
x(52, 'independent', 'a106.food', NA, 'Переклади іспанською: «Йому подобається риба».', ['Le gusta el pescado.', 'A él le gusta el pescado.'], [['Le gusta pescado.', 'Перед іменником потрібен артикль: Le gusta el pescado.']]);
x(53, 'delayed', 'a106.music', NA, artIns(), ['la'], [indef('una', 'la')], 'Le gusta ___ música.');
x(54, 'delayed', 'a106.market', NA, 'Переклади іспанською: «Нам подобаються помідори».', ['Nos gustan los tomates.', 'A nosotros nos gustan los tomates.', 'A nosotras nos gustan los tomates.'], [['Nos gustan tomates.', 'Перед іменником потрібен артикль: los tomates.']]);
x(55, 'transfer', 'a106.cheese-t', NA, 'Ти пригощаєш друга. Запитай іспанською: «Тобі подобається сир?»', ['¿Te gusta el queso?', '¿A ti te gusta el queso?'], [['¿Te gusta queso?', 'Перед іменником потрібен артикль: el queso.']]);
k.slots({
  n: 56,
  role: 'transfer',
  fam: 'a106.breakfast-t',
  t: [NA],
  ins: 'Перепиши речення повністю, вставивши артиклі. Йдеться про те, що тобі подобається загалом: «Мені подобається чай і подобаються яблука».',
  p: ['Me gusta ___ té y me gustan ___ manzanas.'],
  tpl: ['Me gusta ', S('s1'), ' té y me gustan ', S('s2'), ' manzanas.'],
  slots: [
    { id: 's1', t: NA, acc: ['el'], err: [indef('un', 'el')] },
    { id: 's2', t: NA, acc: ['las'], err: [indef('unas', 'las')] },
  ],
});
k.choice({ n: 57, role: 'independent', fam: 'a106.drinks', t: [NAC], ins: 'Обери правильне речення.', o: [['Me gusta té.', NAC, 'Перед іменником потрібен артикль: el té.'], ['Me gusta el té.', true]] });
k.choice({ n: 58, role: 'delayed', fam: 'a106.pets', t: [NAC], ins: 'Обери правильне речення про те, що тобі подобаються собаки загалом.', o: [['Me gustan los perros.', true], ['Me gustan perros.', NAC, 'Перед іменником потрібен артикль: los perros.'], ['Me gustan unos perros.', NAC, 'Про те, що подобається загалом, — означений артикль: los perros.']] });

// ======================= 6. a + person + le / les
const noLe = (s: string, pron: string): [string, string] => [s, `Бракує займенника: навіть коли людину названо, ${pron} лишається.`];
x(59, 'supported', 'a106.drinks', ALW, 'Впиши займенник. Зразок: A Pablo le gusta el café.', ['le'], [['la', 'З gustar для однієї людини — le (і для жінки теж).'], ['se', 'З gustar для однієї людини — le.']], 'A Ana ___ gusta el té.', 'Ані подобається чай.');
x(60, 'supported', 'a106.cinema', AL, 'Переклади іспанською: «Марті подобається кіно». Зразок: A Pablo le gusta el café.', ['A Marta le gusta el cine.', 'Le gusta el cine a Marta.'], [noLe('A Marta gusta el cine.', 'le')]);
x(61, 'independent', 'a106.travel', ALW, 'Впиши займенник.', ['les'], [['le', 'Mis padres — кілька людей, тож les.']], 'A mis padres ___ gusta viajar.', 'Моїм батькам подобається подорожувати.');
x(62, 'independent', 'a106.pets', AL, 'Переклади іспанською: «Луїсу подобаються собаки».', ['A Luis le gustan los perros.'], [noLe('A Luis gustan los perros.', 'le')]);
x(63, 'independent', 'a106.dance', AL, 'Переклади іспанською: «Моїй сестрі подобається танцювати».', ['A mi hermana le gusta bailar.'], [noLe('A mi hermana gusta bailar.', 'le')]);
one(64, 'independent', 'a106.sport', ALW, 'Перепиши речення повністю, вставивши займенник: «Моїм друзям подобається футбол».', 'A mis amigos ', ' gusta el fútbol.', ['les'], [['le', 'Mis amigos — кілька людей, тож les.']]);
x(65, 'delayed', 'a106.pets', AL, 'Переклади іспанською: «Твоєму братові подобаються коти?»', ['¿A tu hermano le gustan los gatos?', '¿Le gustan los gatos a tu hermano?'], [noLe('¿A tu hermano gustan los gatos?', 'le')]);
x(66, 'delayed', 'a106.run', ALW, 'Впиши займенник.', ['le'], [['les', 'Carmen — одна людина, тож le.']], 'A Carmen ___ gusta correr.', 'Кармен подобається бігати.');
x(67, 'transfer', 'a106.family-t', AL, 'Розкажи іспанською про родину: «Моїм батькам подобається готувати».', ['A mis padres les gusta cocinar.'], [noLe('A mis padres gusta cocinar.', 'les')]);
x(68, 'transfer', 'a106.gift-t', AL, 'Ти обираєш подарунок. Напиши іспанською: «Ані подобаються книжки».', ['A Ana le gustan los libros.'], [noLe('A Ana gustan los libros.', 'le')]);

// ======================= 7. negation
const meNo = (s: string): [string, string] => [s, 'No стоїть перед займенником: No me gusta…, а не «me no gusta».'];
x(69, 'supported', 'a106.sport', NG, 'Перепиши речення із запереченням. Зразок: Me gusta el cine. → No me gusta el cine.', ['No me gusta el fútbol.'], [meNo('Me no gusta el fútbol.')], 'Me gusta el fútbol.');
x(70, 'supported', 'a106.drinks', NGU, 'Переклади іспанською: «Мені не подобається чай». Зразок: No me gusta el cine.', ['No me gusta el té.', 'A mí no me gusta el té.'], [meNo('Me no gusta el té.')]);
x(71, 'independent', 'a106.cinema', NG, 'Перепиши речення із запереченням.', ['No nos gustan las películas.'], [meNo('Nos no gustan las películas.')], 'Nos gustan las películas.');
x(72, 'independent', 'a106.food', NGU, 'Переклади іспанською: «Йому не подобається риба».', ['No le gusta el pescado.', 'A él no le gusta el pescado.'], [meNo('Le no gusta el pescado.')]);
x(73, 'independent', 'a106.drinks', NGU, 'Запитай іспанською: «Тобі не подобається кава?»', ['¿No te gusta el café?', '¿A ti no te gusta el café?'], [meNo('¿Te no gusta el café?')]);
x(74, 'independent', 'a106.dance', NG, 'Перепиши речення із запереченням.', ['No le gusta bailar.'], [meNo('Le no gusta bailar.')], 'Le gusta bailar.');
x(75, 'delayed', 'a106.beach', NGU, 'Переклади іспанською: «Нам не подобається пляж».', ['No nos gusta la playa.', 'A nosotros no nos gusta la playa.', 'A nosotras no nos gusta la playa.'], [meNo('Nos no gusta la playa.')]);
x(76, 'delayed', 'a106.pets', NG, 'Перепиши речення із запереченням.', ['No me gustan los gatos.'], [meNo('Me no gustan los gatos.')], 'Me gustan los gatos.');
x(77, 'transfer', 'a106.friends-t', NGU, 'Переклади іспанською: «Моїм друзям не подобається футбол».', ['A mis amigos no les gusta el fútbol.'], [['A mis amigos les no gusta el fútbol.', 'No стоїть перед займенником: no les gusta.']], undefined, undefined, ANL(NGU));
x(78, 'transfer', 'a106.kitchen-t', NGU, 'Друг пропонує приготувати вечерю разом. Скажи іспанською: «Мені не подобається готувати».', ['No me gusta cocinar.', 'A mí no me gusta cocinar.'], [meNo('Me no gusta cocinar.')], undefined, undefined, INF(NGU));

// ======================= 8. encantar
const muyErr = (s: string): [string, string] => [s, 'Encantar уже означає «дуже подобається», тому muy з ним не вживають.'];
x(79, 'supported', 'a106.sweets', EN, 'Впиши encanta або encantan. Зразок: Me encantan las playas.', ['encanta'], [['encantan', 'Шоколад — одна річ, тож encanta.']], 'Me ___ el chocolate.', 'Я обожнюю шоколад.');
x(80, 'supported', 'a106.dance', ENU, 'Переклади іспанською з encantar: «Я обожнюю танцювати». Зразок: Le encanta nadar.', ['Me encanta bailar.', 'A mí me encanta bailar.'], [muyErr('Me encanta muy bailar.'), muyErr('Me muy encanta bailar.')]);
x(81, 'independent', 'a106.cinema', EN, 'Впиши encanta або encantan.', ['encantan'], [['encanta', 'Películas — множина, тож encantan.']], 'Nos ___ las películas.', 'Ми обожнюємо фільми.');
x(82, 'independent', 'a106.travel', EN, 'Впиши encanta або encantan.', ['encanta'], [['encantan', 'З інфінітивом — завжди encanta.']], '¿Te ___ viajar?', 'Ти обожнюєш подорожувати?');
x(83, 'independent', 'a106.music', ENU, 'Переклади іспанською з encantar: «Вона обожнює музику».', ['Le encanta la música.', 'A ella le encanta la música.'], [muyErr('Le encanta muy la música.')]);
x(84, 'independent', 'a106.pets', ENU, 'Переклади іспанською з encantar: «Ми обожнюємо котів».', ['Nos encantan los gatos.', 'A nosotros nos encantan los gatos.', 'A nosotras nos encantan los gatos.'], [['Nos encanta los gatos.', 'Gatos — множина, тож encantan.']]);
x(85, 'delayed', 'a106.cinema', EN, 'Впиши encanta або encantan.', ['encanta'], [['encantan', 'Cine — одна річ, тож encanta (форма не залежить від mis padres).']], 'A mis padres les ___ el cine.', 'Мої батьки обожнюють кіно.');
x(86, 'delayed', 'a106.city', ENU, 'Переклади іспанською з encantar: «Я обожнюю Мадрид».', ['Me encanta Madrid.', 'A mí me encanta Madrid.'], [muyErr('Me encanta muy Madrid.')]);
x(87, 'transfer', 'a106.brother-t', ENU, 'Розкажи іспанською про брата з encantar: «Мій брат обожнює футбол».', ['A mi hermano le encanta el fútbol.'], [['A mi hermano encanta el fútbol.', 'Бракує займенника: a mi hermano le encanta.']], undefined, undefined, ANL(ENU));
k.slots({
  n: 88,
  role: 'transfer',
  fam: 'a106.cafe-books-t',
  t: [EN],
  ins: 'Перепиши речення повністю, вставивши encanta або encantan: «Я обожнюю каву й обожнюю книжки».',
  p: ['Me ___ el café y me ___ los libros.'],
  tpl: ['Me ', S('s1'), ' el café y me ', S('s2'), ' los libros.'],
  slots: [
    { id: 's1', t: EN, acc: ['encanta'], err: [['encantan', 'Café — одна річ, тож encanta.']] },
    { id: 's2', t: EN, acc: ['encantan'], err: [['encanta', 'Libros — множина, тож encantan.']] },
  ],
});
k.choice({ n: 89, role: 'independent', fam: 'a106.sweets', t: [ENC], ins: 'Обери правильне речення.', o: [['Me encanta muy el chocolate.', ENC, muyErr('')[1]], ['Me encanta el chocolate.', true]] });
k.choice({ n: 90, role: 'delayed', fam: 'a106.beach', t: [ENC], ins: 'Обери форму.', p: ['Nos ___ las playas.'], o: [['encanta', ENC, 'Playas — множина, тож encantan.'], ['encantan', true]] });

// ======================= 9. degree: mucho, nada
const muyMucho = (s: string): [string, string] => [s, 'Після дієслова — mucho, а не muy: me gusta mucho.'];
x(91, 'supported', 'a106.drinks', DG, 'Скажи іспанською, що тобі дуже подобається кава (з mucho). Зразок: Me gusta mucho el té.', ['Me gusta mucho el café.', 'El café me gusta mucho.', 'A mí me gusta mucho el café.'], [muyMucho('Me gusta muy el café.')]);
x(92, 'supported', 'a106.food', DG, 'Скажи іспанською, що тобі зовсім не подобається риба. Зразок: No me gusta nada el té.', ['No me gusta nada el pescado.', 'El pescado no me gusta nada.', 'A mí no me gusta nada el pescado.'], [['Me gusta nada el pescado.', 'Перед займенником потрібне no: No me gusta nada.']]);
x(93, 'independent', 'a106.sport', DG, 'Переклади іспанською: «Мені не дуже подобається футбол».', ['No me gusta mucho el fútbol.', 'El fútbol no me gusta mucho.', 'A mí no me gusta mucho el fútbol.'], [['No me gusta muy el fútbol.', muyMucho('')[1]]]);
x(94, 'independent', 'a106.reading', DG, 'Переклади іспанською з mucho: «Нам дуже подобається читати».', ['Nos gusta mucho leer.', 'A nosotros nos gusta mucho leer.', 'A nosotras nos gusta mucho leer.'], [muyMucho('Nos gusta muy leer.')]);
x(95, 'independent', 'a106.kitchen', DG, 'Переклади іспанською: «Йому зовсім не подобається готувати».', ['No le gusta nada cocinar.', 'A él no le gusta nada cocinar.'], [['Le gusta nada cocinar.', 'Перед займенником потрібне no: No le gusta nada.']]);
x(96, 'independent', 'a106.pets', DG, 'Переклади іспанською з mucho: «Мені дуже подобаються коти».', ['Me gustan mucho los gatos.', 'Los gatos me gustan mucho.', 'A mí me gustan mucho los gatos.'], [['Me gustan muchos los gatos.', 'Mucho після дієслова не змінюється: me gustan mucho.']]);
x(97, 'delayed', 'a106.drinks', DG, 'Запитай іспанською: «Тобі не дуже подобається чай?»', ['¿No te gusta mucho el té?', '¿A ti no te gusta mucho el té?'], [['¿No te gusta muy el té?', muyMucho('')[1]]]);
x(98, 'delayed', 'a106.run', DG, 'Переклади іспанською: «Мені зовсім не подобається бігати».', ['No me gusta nada correr.', 'A mí no me gusta nada correr.'], [['Me gusta nada correr.', 'Перед займенником потрібне no: No me gusta nada.']]);
x(99, 'transfer', 'a106.mother-t', DG, 'Розкажи іспанською про маму (з mucho): «Моїй мамі дуже подобається танцювати».', ['A mi madre le gusta mucho bailar.'], [muyMucho('A mi madre le gusta muy bailar.')], undefined, undefined, ANL(DG));
x(100, 'transfer', 'a106.holiday-t', DG, 'Друг кличе тебе на пляж. Скажи іспанською: «Нам зовсім не подобається пляж».', ['No nos gusta nada la playa.', 'A nosotros no nos gusta nada la playa.', 'A nosotras no nos gusta nada la playa.'], [['Nos gusta nada la playa.', 'Перед займенником потрібне no: No nos gusta nada.']]);
k.choice({ n: 101, role: 'independent', fam: 'a106.scale', t: [DGC], ins: 'Яке речення означає найсильніше вподобання?', o: [['Me gusta.', DGC, 'Це просто «подобається».'], ['Me gusta mucho.', DGC, 'Сильно, але encanta — ще сильніше.'], ['Me encanta.', true]] });
k.choice({ n: 102, role: 'delayed', fam: 'a106.scale', t: [DGC], ins: 'Яке речення означає «зовсім не подобається»?', o: [['No me gusta mucho.', DGC, 'Це «не дуже подобається».'], ['No me gusta nada.', true], ['Me gusta.', DGC, 'Це «подобається».']] });

// ======================= 10. short responses
const yoTam = (w: string): [string, string] => [`Yo ${w}.`, `На речення з gustar відповідаємо через «мені»: A mí ${w}.`];
const accMi = (w: string): [string, string] => [`A mi ${w}.`, 'У відповіді mí пишеться зі знаком наголосу: A mí …'];
const respIns = (what: string, model?: string): string => `Відповідай іспанською коротко: ${what}.${model ? ` Зразок: ${model}.` : ''}`;
x(103, 'supported', 'a106.drinks', RS, respIns('тобі теж подобається', '—Me gusta el té. —A mí también'), ['A mí también.'], [yoTam('también'), accMi('también')], '—Me gusta el café.');
x(104, 'supported', 'a106.drinks', RS, respIns('тобі теж не подобається', '—No me gusta el café. —A mí tampoco'), ['A mí tampoco.'], [['A mí también.', 'На заперечення погоджуємося через tampoco: A mí tampoco.'], yoTam('tampoco'), accMi('tampoco')], '—No me gusta el té.');
x(105, 'independent', 'a106.sport', RS, respIns('тобі це не подобається'), ['A mí no.'], [['A mí tampoco.', 'Tampoco — щоб погодитися з запереченням. Тут ти не погоджуєшся зі ствердженням: A mí no.'], accMi('no')], '—Me gusta el fútbol.');
x(106, 'independent', 'a106.run', RS, respIns('а тобі подобається'), ['A mí sí.'], [['A mí también.', 'También — щоб погодитися. Ти не погоджуєшся із запереченням: A mí sí.'], accMi('sí')], '—No me gusta correr.');
x(107, 'independent', 'a106.pets', RS, respIns('тобі теж подобаються'), ['A mí también.'], [yoTam('también'), accMi('también')], '—Me gustan los perros.');
x(108, 'independent', 'a106.food', RS, respIns('тобі теж не подобається'), ['A mí tampoco.'], [['A mí también.', 'На заперечення погоджуємося через tampoco: A mí tampoco.'], yoTam('tampoco')], '—No me gusta el pescado.');
x(109, 'delayed', 'a106.dance', RS, respIns('ти теж обожнюєш'), ['A mí también.'], [yoTam('también')], '—Me encanta bailar.');
x(110, 'delayed', 'a106.cinema', RS, respIns('а тобі подобаються'), ['A mí sí.'], [['A mí también.', 'También — щоб погодитися. Ти не погоджуєшся із запереченням: A mí sí.']], '—No me gustan las películas.');
x(111, 'transfer', 'a106.chat-t', RS, 'У чаті друг пише про футбол. Погодься коротко іспанською (тобі теж зовсім не подобається).', ['A mí tampoco.'], [['A mí también.', 'На заперечення погоджуємося через tampoco: A mí tampoco.'], yoTam('tampoco')], '—No me gusta nada el fútbol.');
x(112, 'transfer', 'a106.travel-t', RS, 'Колега розповідає про подорожі. Не погодься коротко іспанською (тобі не подобається).', ['A mí no.'], [['A mí tampoco.', 'Tampoco — щоб погодитися з запереченням. Тут ти не погоджуєшся: A mí no.']], '—Me gusta mucho viajar.');
k.choice({ n: 113, role: 'independent', fam: 'a106.drinks', t: [RSC], ins: '—Me gusta el té. Ти погоджуєшся. Обери відповідь.', o: [['Yo también.', RSC, yoTam('también')[1]], ['A mí también.', true], ['A mí tampoco.', RSC, 'Tampoco — для згоди із запереченням.']] });
k.choice({ n: 114, role: 'delayed', fam: 'a106.sport', t: [RSC], ins: '—No me gusta el fútbol. Тобі футбол подобається. Обери відповідь.', o: [['A mí sí.', true], ['A mí no.', RSC, 'A mí no — щоб не погодитися зі ствердженням.'], ['A mí tampoco.', RSC, 'A mí tampoco означає, що тобі теж не подобається.']] });

// ======================= listening: likes and dislikes
const L1 = 'Me gusta mucho el cine y no me gusta nada el teatro.';
const L2 = 'A mi hermano le encanta nadar, y a mí también.';
const l1 = k.clip({ id: 'clip.a1-06.preferences.cine', kind: 'sentence', es: L1, uk: 'Мені дуже подобається кіно, а театр мені зовсім не подобається.', t: [LP, LPD], fam: 'a106.l-cinema' });
const l2 = k.clip({ id: 'clip.a1-06.preferences.nadar', kind: 'sentence', es: L2, uk: 'Мій брат обожнює плавати, і я теж.', t: [LP], fam: 'a106.l-swim' });
k.choice({ n: 115, role: 'independent', fam: 'a106.l-cinema', t: [LP], clips: [l1], ins: 'Послухай. Що подобається цій людині?', o: [['Театр.', false], ['Кіно.', true], ['І кіно, і театр.', false]], hints: [hTranscript([LP], L1)] });
k.choice({ n: 116, role: 'independent', fam: 'a106.l-swim', t: [LP], clips: [l2], ins: 'Послухай. Кому подобається плавати?', o: [['Лише братові.', false], ['І братові, і тому, хто говорить.', true], ['Нікому.', false]], hints: [hTranscript([LP], L2)] });
k.exact({
  n: 117,
  role: 'independent',
  fam: 'a106.l-cinema',
  t: [LPD],
  clips: [l1],
  ins: 'Необов’язковий диктант: послухай і запиши речення. Великі літери й крапка в кінці не оцінюються.',
  acc: [L1],
  pol: DICTATION,
  noRule: true,
  bad: 'Поки що ні. Порівняй свій запис зі зразком у підказці «Показати відповідь»: зверни увагу на кожне слово.',
  hints: [hRule([LPD], 'Пиши так, як чуєш. Орфографічна помилка тут не означає, що ти не зрозумів запис: розуміння перевіряє окреме завдання.')],
});

k.material({
  id: 'material.a1-06.gustar',
  topic: 'A1-06-L1',
  title: 'Gustar і encantar: кому що подобається',
  blocks: [
    tableEs(
      ['a quién', 'una cosa / infinitivo', 'varias cosas'],
      [
        ['(a mí) me', 'gusta el café', 'gustan los libros'],
        ['(a ti) te', 'gusta leer', 'gustan los gatos'],
        ['(a él / ella / usted) le', 'gusta la música', 'gustan las flores'],
        ['(a nosotros) nos', 'gusta viajar', 'gustan las películas'],
        ['(a vosotros) os', 'gusta el cine', 'gustan los perros'],
        ['(a ellos / ustedes) les', 'gusta bailar', 'gustan las playas'],
      ],
    ),
    uk('Заперечення: No me gusta. Сила: Me encanta → Me gusta mucho → No me gusta nada. Відповіді: A mí también / A mí tampoco / A mí no / A mí sí.'),
    plink('Потренувати gustar', [P, PP, AG, NA, NG], 'written', 12),
  ],
  linked: [P, PP, AG, IN, NA, AL, NG, EN, DG, RS],
});

export default k.build({
  title: 'Що мені подобається: gustar',
  termEs: 'el verbo gustar',
  summary:
    'Кажемо, що подобається й що ні: me / te / le, nos / os / les gusta, gusta чи gustan, артикль та інфінітив після gustar, a Ana le gusta, no me gusta, encantar, mucho / nada і короткі відповіді (a mí también). Урок поділено на чотири кроки, до яких можна повертатися окремо.',
  objectives: ['A1-06-O1'],
  cv: ['CV-02', 'CV-05'],
  situations: ['routine-study-leisure', 'food-shopping'],
  minutes: 20,
  introduces: [
    'gustar.pronouns',
    'gustar.pronouns.plural',
    'gustar.agreement',
    'gustar.infinitive',
    'gustar.noun-with-article',
    'gustar.a-noun-le',
    'gustar.negation',
    'gustar.encantar',
    'gustar.degree',
    'gustar.responses',
    'listening.preferences',
  ],
  revisits: ['pron.subject', 'pron.subject.plural', 'article.definite', 'article.plural', 'article.definite-indefinite', 'neg.no-before-verb', 'quant.mucho', 'poss.mi-tu-su', 'question.yes-no'],
  steps: [
    {
      kind: 'explanation',
      title: 'Крок 1. Кому подобається: me, te, le, nos, os, les',
      blocks: [
        uk('Gustar будується як українське «мені подобається»: людину позначає займенник перед дієсловом, а те, що подобається, — підмет. Не «yo gusto», а me gusta.'),
        tableUk(
          ['особа', 'займенник', 'приклад'],
          [
            ['yo → «мені»', 'me', 'Me gusta el té.'],
            ['tú → «тобі»', 'te', '¿Te gusta el café?'],
            ['él / ella / usted', 'le', 'Le gusta la playa.'],
            ['nosotros → «нам»', 'nos', 'Nos gusta el teatro.'],
            ['vosotros → «вам» (на «ти»)', 'os', '¿Os gusta el chocolate?'],
            ['ellos / ellas / ustedes', 'les', 'Les gusta la música.'],
          ],
        ),
        uk('Le — і «йому», і «їй», і ввічливе «Вам» до однієї людини. Les — «їм» або формальне «вам» до кількох (ustedes).'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 1: практика зі зразком', tasks: [k.id(1), k.id(2), k.id(13), k.id(14)] },
    { kind: 'independent-practice', title: 'Крок 1: самостійно', tasks: [k.id(11), k.id(3), k.id(5), k.id(23), k.id(15), k.id(17)] },
    {
      kind: 'explanation',
      title: 'Крок 2. Gusta чи gustan; артикль та інфінітив',
      blocks: [
        uk('Форма дієслова залежить від того, що подобається: одна річ — gusta, кілька — gustan. Те, кому подобається, на форму не впливає.'),
        uk('Перед іменником ставимо означений артикль (подобається «взагалі»): Me gusta el café, не «me gusta café».'),
        uk('Що подобається робити — gusta + інфінітив. Навіть із кількома діями — gusta.'),
        ex('Me gustan los libros.', 'Мені подобаються книжки.'),
        ex('¿Te gusta la fruta? — Sí, me gustan las manzanas.', 'Тобі подобаються фрукти? — Так, мені подобаються яблука.'),
        ex('Nos gusta leer y escribir.', 'Нам подобається читати й писати.'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 2: практика зі зразком', tasks: [k.id(25), k.id(26), k.id(47), k.id(48), k.id(37), k.id(38)] },
    { kind: 'independent-practice', title: 'Крок 2: самостійно', tasks: [k.id(35), k.id(27), k.id(28), k.id(57), k.id(49), k.id(51), k.id(39), k.id(40), k.id(41), k.id(16)] },
    {
      kind: 'explanation',
      title: 'Крок 3. A Ana le gusta; заперечення; encantar, mucho / nada, короткі відповіді',
      blocks: [
        uk('Якщо називаємо людину, на початку ставимо a + людина, а займенник le / les лишається: A Pablo le gusta el café. A mis hermanos les gusta el teatro.'),
        uk('У запереченні no стоїть перед займенником: No me gusta el cine. Неправильно — «me no gusta».'),
        ex('A Pablo le gusta el café.', 'Пабло подобається кава.'),
        ex('A mis amigos les gusta pasear.', 'Моїм друзям подобається гуляти.'),
        ex('No me gusta el cine.', 'Мені не подобається кіно.'),
        uk('Encantar будується так само, як gustar, і означає «дуже подобається, обожнюю». Muy з ним не вживаємо.'),
        uk('Сила вподобання: Me encanta → Me gusta mucho → Me gusta → No me gusta mucho → No me gusta nada. Mucho і nada стоять після дієслова.'),
        uk('Короткі відповіді: погодитися — A mí también (на ствердження), A mí tampoco (на заперечення); не погодитися — A mí no, A mí sí. З gustar кажемо a mí, не yo.'),
        ex('Le encanta nadar.', 'Він обожнює плавати.'),
        ex('Me gusta mucho el té.', 'Мені дуже подобається чай.'),
        ex('—Me gusta el teatro. —A mí también.', '— Мені подобається театр. — Мені теж.'),
        ex('—No me gusta el café. —A mí tampoco.', '— Мені не подобається кава. — Мені теж ні.'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 3: практика зі зразком', tasks: [k.id(59), k.id(60), k.id(69), k.id(70)] },
    { kind: 'independent-practice', title: 'Крок 3: самостійно', tasks: [k.id(61), k.id(62), k.id(63), k.id(71), k.id(72), k.id(73)] },
    { kind: 'supported-practice', title: 'Крок 3: encantar і відповіді — зі зразком', tasks: [k.id(79), k.id(80), k.id(91), k.id(92), k.id(103), k.id(104)] },
    { kind: 'independent-practice', title: 'Крок 3: encantar і відповіді — самостійно', tasks: [k.id(89), k.id(81), k.id(83), k.id(101), k.id(93), k.id(94), k.id(113), k.id(105), k.id(106)] },
    { kind: 'listening', title: 'Послухай: що подобається?', required: false, clips: [l1, l2], tasks: [k.id(115), k.id(116), k.id(117)] },
    {
      kind: 'independent-practice',
      title: 'Додаткова практика',
      required: false,
      tasks: [k.id(4), k.id(6), k.id(18), k.id(29), k.id(30), k.id(42), k.id(50), k.id(52), k.id(64), k.id(74), k.id(82), k.id(84), k.id(95), k.id(96), k.id(107), k.id(108)],
    },
    {
      kind: 'summary',
      title: 'Підсумок',
      blocks: [
        ul(
          'Me / te / le / nos / os / les + gusta: «мені / тобі … подобається».',
          'Одна річ або дія — gusta, кілька речей — gustan. Перед іменником — артикль: el café.',
          'A Ana le gusta…: le лишається. No me gusta…: no перед займенником.',
          'Me encanta (без muy); me gusta mucho; no me gusta nada.',
          'A mí también / tampoco / no / sí.',
        ),
      ],
    },
  ],
});
