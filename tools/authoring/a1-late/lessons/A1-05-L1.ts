// A1-05-L1 — numbers and quantities in small steps: 0–1000, un/una, ordinals, age (CV-04),
// mucho/poco and muy/mucho (CV-02), containers, ¿cuánto…?, listening to amounts.
import { Kit, S, ex, hTranscript, plink, tableEs, ul, uk, DICTATION } from '../lib.ts';
import type { SlotSpec } from '../lib.ts';
import type { TaskRole } from '../../../content/types.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-05-L1', RULES);

const N015 = 'number.0-15/written-form';
const N015R = 'number.0-15/reading-meaning';
const N1629 = 'number.16-29/written-form';
const N1629R = 'number.16-29/reading-meaning';
const N3099 = 'number.30-99/written-form';
const N3099R = 'number.30-99/reading-meaning';
const N100 = 'number.100-1000/written-form';
const N100R = 'number.100-1000/reading-meaning';
const UNO = 'number.uno-un-una/written-form';
const UNOC = 'number.uno-un-una/context-choice';
const ORD = 'number.ordinal/written-form';
const ORDC = 'number.ordinal/context-choice';
const ORDR = 'number.ordinal/reading-meaning';
const APO = 'number.ordinal.apocope/written-form';
const APOC = 'number.ordinal.apocope/context-choice';
const LA = 'listening.amounts/listening-meaning';
const LAD = 'listening.amounts/dictation';
const MU = 'quant.mucho/written-form';
const MUC = 'quant.mucho/context-choice';
const MM = 'contrast.muy-mucho/written-form';
const MMC = 'contrast.muy-mucho/context-choice';
const COU = 'quant.containers/construction-use';
const COW = 'quant.containers/written-form';
const COR = 'quant.containers/reading-meaning';
const AGEU = 'tener.age/construction-use';
const AGEW = 'tener.age/written-form';
const AGEC = 'tener.age/context-choice';
const CU = 'question.word.cuanto/written-form';
const CUC = 'question.word.cuanto/context-choice';

type E = Array<[string, string]>;

/** "Write the number in words" (optionally inside a Spanish context sentence). */
function nw(n: number, role: TaskRole, fam: string, t: string, digits: string, word: string, err: E = [], model?: string, ctx?: string, tr?: string): string {
  const ins = ctx ? 'Впиши число словами.' : `Напиши число словами: ${digits}.`;
  return k.exact({ n, role, fam, t: [t], ins: model ? `${ins} Зразок: ${model}.` : ins, ...(ctx ? { p: [ctx] } : {}), acc: [word], err, ...(tr ? { tr } : {}) });
}
const slot = (id: string, t: string, acc: string[], err: E = []): SlotSpec => ({ id, t, acc, err });
function readNum(n: number, role: TaskRole, fam: string, t: string, word: string, options: Array<[string, boolean]>): string {
  return k.choice({ n, role, fam, t: [t], ins: 'Прочитай число й обери, як його записують цифрами.', p: [word], o: options.map(([l, ok]) => [l, ok] as [string, boolean]) });
}

// ======================= Step 1–2: 0–29
nw(1, 'supported', 'a105.count', N015, '7', 'siete', [['sete', 'Siete пишеться з ie: siete.']], '5 → cinco');
nw(2, 'supported', 'a105.count', N015, '12', 'doce', [['dose', 'Doce пишеться з c: doce.']], '11 → once');
nw(3, 'independent', 'a105.count', N015, '14', 'catorce', [['catorse', 'Catorce пишеться з c: catorce.'], ['cuatorce', 'Catorce пишеться без u: catorce.']]);
nw(4, 'independent', 'a105.class', N015, '11', 'once', [['onse', 'Once пишеться з c: once.']], undefined, 'En mi clase hay ___ chicos. (11)', 'У моєму класі одинадцять хлопців.');
k.slots({
  n: 5,
  role: 'independent',
  fam: 'a105.class',
  t: [N015, N1629],
  ins: 'Перепиши речення повністю, записавши числа словами.',
  p: ['En la clase hay ___ chicos y ___ chicas. (15, 17)'],
  tpl: ['En la clase hay ', S('s1'), ' chicos y ', S('s2'), ' chicas.'],
  slots: [slot('s1', N015, ['quince'], [['quinse', 'Quince пишеться з c: quince.'], ['cinco', 'Cinco — це 5. 15 — quince.']]), slot('s2', N1629, ['diecisiete'], [['diez y siete', 'Від 16 до 19 — одним словом: diecisiete.']])],
  tr: 'У класі п’ятнадцять хлопців і сімнадцять дівчат.',
});
k.slots({
  n: 6,
  role: 'independent',
  fam: 'a105.home',
  t: [N015, N1629],
  ins: 'Перепиши речення повністю, записавши числа словами.',
  p: ['En el piso hay ___ ventanas y ___ libros. (6, 24)'],
  tpl: ['En el piso hay ', S('s1'), ' ventanas y ', S('s2'), ' libros.'],
  slots: [slot('s1', N015, ['seis']), slot('s2', N1629, ['veinticuatro'], [['veinte y cuatro', 'Від 21 до 29 — одним словом: veinticuatro.']])],
  tr: 'У квартирі шість вікон і двадцять чотири книжки.',
});
nw(7, 'delayed', 'a105.count', N015, '13', 'trece', [['trese', 'Trece пишеться з c: trece.']]);
k.slots({
  n: 8,
  role: 'delayed',
  fam: 'a105.shop',
  t: [N015, N1629],
  ins: 'Перепиши речення повністю, записавши числа словами.',
  p: ['La tienda tiene ___ bolsos y ___ mochilas. (8, 19)'],
  tpl: ['La tienda tiene ', S('s1'), ' bolsos y ', S('s2'), ' mochilas.'],
  slots: [slot('s1', N015, ['ocho']), slot('s2', N1629, ['diecinueve'], [['diez y nueve', 'Від 16 до 19 — одним словом: diecinueve.']])],
  tr: 'У крамниці вісім сумок і дев’ятнадцять рюкзаків.',
});
nw(9, 'transfer', 'a105.bus', N015, '15', 'quince', [['quinse', 'Quince пишеться з c: quince.'], ['cinco', 'Cinco — це 5. 15 — quince.']], undefined, 'En el autobús hay ___ personas. (15)', 'В автобусі п’ятнадцять людей.');
nw(10, 'transfer', 'a105.friends', N015, '5', 'cinco', [], undefined, 'Tengo ___ amigos en Madrid. (5)', 'У мене п’ятеро друзів у Мадриді.');

nw(11, 'supported', 'a105.count', N1629, '16', 'dieciséis', [['dieciseis', 'Майже: dieciséis пишеться зі знаком наголосу.']], '17 → diecisiete');
nw(12, 'supported', 'a105.count', N1629, '22', 'veintidós', [['veintidos', 'Майже: veintidós пишеться зі знаком наголосу.'], ['veinte y dos', 'Від 21 до 29 — одним словом: veintidós.']], '21 → veintiuno');
nw(13, 'independent', 'a105.count', N1629, '18', 'dieciocho');
nw(14, 'independent', 'a105.count', N1629, '26', 'veintiséis', [['veintiseis', 'Майже: veintiséis пишеться зі знаком наголосу.']]);
nw(15, 'delayed', 'a105.count', N1629, '29', 'veintinueve', [['veinte y nueve', 'Від 21 до 29 — одним словом: veintinueve.']]);
nw(16, 'transfer', 'a105.hotel', N1629, '23', 'veintitrés', [['veintitres', 'Майже: veintitrés пишеться зі знаком наголосу.']], undefined, 'El hotel tiene ___ habitaciones. (23)', 'У готелі двадцять три кімнати.');
nw(17, 'transfer', 'a105.books', N1629, '27', 'veintisiete', [], undefined, 'Mi hermana tiene ___ libros de inglés. (27)', 'У моєї сестри двадцять сім книжок англійською.');

readNum(18, 'independent', 'a105.count', N015R, 'catorce', [['4', false], ['14', true], ['40', false]]);
readNum(19, 'independent', 'a105.count', N1629R, 'diecisiete', [['17', true], ['7', false], ['70', false], ['16', false]]);

// ======================= Step 3: 30–1000
nw(20, 'supported', 'a105.count', N3099, '30', 'treinta', [['trenta', 'Treinta пишеться з ei: treinta.']], '40 → cuarenta');
nw(21, 'supported', 'a105.count', N3099, '45', 'cuarenta y cinco', [['cuarentaycinco', 'Від 31 пишемо трьома словами: cuarenta y cinco.'], ['cuarenta cinco', 'Між десятками й одиницями потрібне y: cuarenta y cinco.']], '31 → treinta y uno');
nw(22, 'independent', 'a105.count', N3099, '50', 'cincuenta', [['cinquenta', 'Cincuenta пишеться з c: cincuenta.']]);
nw(23, 'independent', 'a105.count', N3099, '67', 'sesenta y siete', [['setenta y siete', 'Setenta — це 70. 60 — sesenta.'], ['sesenta siete', 'Між десятками й одиницями потрібне y.']]);
k.slots({
  n: 24,
  role: 'independent',
  fam: 'a105.campus',
  t: [N3099, N100],
  ins: 'Перепиши речення повністю, записавши числа словами.',
  p: ['En la universidad hay ___ profesores y ___ estudiantes. (80, 500)'],
  tpl: ['En la universidad hay ', S('s1'), ' profesores y ', S('s2'), ' estudiantes.'],
  slots: [slot('s1', N3099, ['ochenta']), slot('s2', N100, ['quinientos'], [['cincocientos', 'Неправильна форма: 500 — quinientos.'], ['cinco cientos', 'Неправильна форма: 500 — quinientos.']])],
  tr: 'В університеті вісімдесят викладачів і п’ятсот студентів.',
});
k.slots({
  n: 25,
  role: 'independent',
  fam: 'a105.museum',
  t: [N3099, N100],
  ins: 'Перепиши речення повністю, записавши числа словами. Зверни увагу на рід іменника.',
  p: ['En el museo hay ___ fotos y ___ mapas. (200, 35)'],
  tpl: ['En el museo hay ', S('s1'), ' fotos y ', S('s2'), ' mapas.'],
  slots: [slot('s1', N100, ['doscientas'], [['doscientos', 'Foto — жіночого роду (la foto), тож doscientas.'], ['dos cientas', 'Сотні пишуться одним словом: doscientas.']]), slot('s2', N3099, ['treinta y cinco'], [['treintaycinco', 'Від 31 пишемо трьома словами: treinta y cinco.']])],
  tr: 'У музеї двісті фотографій і тридцять п’ять мап.',
});
nw(26, 'delayed', 'a105.count', N3099, '73', 'setenta y tres', [['sesenta y tres', 'Sesenta — це 60. 70 — setenta.']]);
k.slots({
  n: 27,
  role: 'delayed',
  fam: 'a105.street',
  t: [N3099, N100],
  ins: 'Перепиши речення повністю, записавши числа словами.',
  p: ['En la calle hay ___ coches y ___ bicicletas. (44, 100)'],
  tpl: ['En la calle hay ', S('s1'), ' coches y ', S('s2'), ' bicicletas.'],
  slots: [slot('s1', N3099, ['cuarenta y cuatro']), slot('s2', N100, ['cien'], [['ciento', 'Рівно 100 — cien. Ciento — лише в складених числах: ciento uno.']])],
  tr: 'На вулиці сорок чотири машини й сто велосипедів.',
});
nw(28, 'transfer', 'a105.square', N3099, '38', 'treinta y ocho', [], undefined, 'En la plaza hay ___ personas. (38)', 'На площі тридцять вісім людей.');
nw(29, 'transfer', 'a105.hotel', N3099, '92', 'noventa y dos', [['nueventa y dos', 'Дев’яносто — noventa.']], undefined, 'El hotel tiene ___ habitaciones. (92)', 'У готелі дев’яносто дві кімнати.');

nw(30, 'supported', 'a105.count', N100, '100', 'cien', [['ciento', 'Рівно 100 — cien. Ciento — лише в складених числах: ciento uno.']], '200 → doscientos');
nw(31, 'supported', 'a105.count', N100, '600', 'seiscientos', [['seis cientos', 'Сотні пишуться одним словом: seiscientos.']], '300 → trescientos');
nw(32, 'independent', 'a105.count', N100, '120', 'ciento veinte', [['cien veinte', 'У складених числах — ciento: ciento veinte.']]);
nw(33, 'independent', 'a105.count', N100, '700', 'setecientos', [['sietecientos', 'Неправильна форма: 700 — setecientos.']]);
nw(34, 'delayed', 'a105.count', N100, '900', 'novecientos', [['nuevecientos', 'Неправильна форма: 900 — novecientos.']]);
nw(35, 'transfer', 'a105.city', N100, '1000', 'mil', [['un mil', '1000 — просто mil, без un.']], undefined, 'La universidad tiene ___ estudiantes. (1000)', 'В університеті тисяча студентів.');
nw(36, 'transfer', 'a105.bikes', N100, '2000', 'dos mil', [['dos miles', 'Mil не змінюється: dos mil.']], undefined, 'En la ciudad hay ___ bicicletas. (2000)', 'У місті дві тисячі велосипедів.');

readNum(37, 'independent', 'a105.count', N3099R, 'cincuenta y nueve', [['95', false], ['59', true], ['69', false]]);
readNum(38, 'independent', 'a105.count', N100R, 'quinientos', [['500', true], ['50', false], ['5000', false]]);
readNum(39, 'delayed', 'a105.count', N100R, 'setecientos', [['70', false], ['600', false], ['700', true]]);

// ======================= Step 4: un / una, age, ¿cuántos…?
const unErr: E = [
  ['uno', 'Перед іменником uno скорочується: un + іменник чоловічого роду.'],
  ['una', 'Це іменник чоловічого роду, тож un.'],
];
k.exact({ n: 40, role: 'supported', fam: 'a105.home', t: [UNO], ins: 'Впиши число 1 у потрібній формі. Зразок: un coche, una casa.', p: ['Hay ___ libro en la mesa. (1)'], acc: ['un'], err: unErr, tr: 'На столі одна книжка.' });
k.exact({
  n: 41,
  role: 'independent',
  fam: 'a105.age',
  t: [UNO],
  ins: 'Впиши число 21 у потрібній формі.',
  p: ['Tengo ___ años. (21)'],
  acc: ['veintiún'],
  err: [
    ['veintiuno', 'Перед іменником veintiuno скорочується: veintiún años.'],
    ['veintiun', 'Майже: veintiún пишеться зі знаком наголосу.'],
  ],
  tr: 'Мені двадцять один рік.',
});
k.exact({ n: 42, role: 'independent', fam: 'a105.class', t: [UNO], ins: 'Впиши число 31 у потрібній формі.', p: ['En la clase hay ___ chicos. (31)'], acc: ['treinta y un'], err: [['treinta y uno', 'Перед іменником uno скорочується: treinta y un chicos.']], tr: 'У класі тридцять один хлопець.' });
k.slots({ n: 43, role: 'delayed', fam: 'a105.family', t: [UNO], ins: 'Перепиши речення повністю, записавши число 1 у потрібній формі.', p: ['Tengo ___ hermana. (1)'], tpl: ['Tengo ', S('s1'), ' hermana.'], slots: [slot('s1', UNO, ['una'], [['un', 'Hermana — жіночого роду, тож una.'], ['uno', 'Перед іменником жіночого роду — una.']])], tr: 'У мене одна сестра.' });
k.exact({ n: 44, role: 'transfer', fam: 'a105.age-family', t: [UNO], ins: 'Впиши число 51 у потрібній формі.', p: ['Mi padre tiene ___ años. (51)'], acc: ['cincuenta y un'], err: [['cincuenta y uno', 'Перед іменником uno скорочується: cincuenta y un años.']], tr: 'Моєму батькові п’ятдесят один рік.' });
k.exact({ n: 45, role: 'transfer', fam: 'a105.shopping', t: [UNO], ins: 'Впиши число 1 у потрібній формі.', p: ['Compro ___ bolígrafo. (1)'], acc: ['un'], err: unErr, tr: 'Я купую одну ручку.' });
k.choice({
  n: 46,
  role: 'independent',
  fam: 'a105.family',
  t: [UNOC],
  ins: 'Обери правильну форму.',
  p: ['Tengo ___ hermano.'],
  o: [
    ['uno', UNOC, 'Перед іменником uno скорочується до un.'],
    ['un', true],
    ['una', UNOC, 'Hermano — чоловічого роду, тож un.'],
  ],
  tr: 'У мене один брат.',
});
k.choice({
  n: 47,
  role: 'delayed',
  fam: 'a105.car',
  t: [UNOC],
  ins: 'Обери правильну коротку відповідь (без іменника після числа).',
  p: ['—¿Cuántos coches tienes? —___.'],
  o: [
    ['Uno', true],
    ['Un', UNOC, 'Без іменника після числа кажемо повну форму: uno.'],
  ],
  tr: '— Скільки в тебе машин? — Одна.',
});

const soyAge: [string, string] = ['Soy veinte años.', 'Вік в іспанській «мають»: tengo … años.'];
k.exact({
  n: 48,
  role: 'supported',
  fam: 'a105.age',
  t: [AGEU],
  ins: 'Переклади іспанською: «Мені 20 років». Зразок: Tengo treinta años. — «Мені тридцять років».',
  acc: ['Tengo veinte años.', 'Yo tengo veinte años.'],
  err: [soyAge],
});
k.exact({
  n: 49,
  role: 'supported',
  fam: 'a105.family',
  t: [AGEW],
  ins: 'Впиши дієслово. Зразок: Mi hermano tiene doce años.',
  p: ['Mi hermana ___ quince años.'],
  acc: ['tiene'],
  err: [
    ['es', 'Вік виражаємо з tener: tiene … años.'],
    ['está', 'Вік виражаємо з tener: tiene … años.'],
  ],
  tr: 'Моїй сестрі п’ятнадцять років.',
});
k.exact({
  n: 50,
  role: 'independent',
  fam: 'a105.family',
  t: [AGEU],
  ins: 'Переклади іспанською: «Моєму братові 12 років».',
  acc: ['Mi hermano tiene doce años.'],
  err: [['Mi hermano es doce años.', 'Вік виражаємо з tener: tiene … años.']],
});
k.exact({
  n: 51,
  role: 'independent',
  fam: 'a105.age',
  t: [AGEU],
  ins: 'Запитай друга іспанською, скільки йому років.',
  acc: ['¿Cuántos años tienes?', '¿Cuántos años tienes tú?'],
  err: [['¿Cuántos años eres?', 'Вік — з tener: ¿Cuántos años tienes?']],
});
k.exact({
  n: 52,
  role: 'independent',
  fam: 'a105.family',
  t: [AGEU],
  ins: 'Переклади іспанською: «Моїй мамі 45 років».',
  acc: ['Mi madre tiene cuarenta y cinco años.'],
  err: [['Mi madre es cuarenta y cinco años.', 'Вік виражаємо з tener: tiene … años.']],
});
k.exact({
  n: 53,
  role: 'independent',
  fam: 'a105.age',
  t: [AGEW],
  ins: 'Впиши дієслово (ввічливе запитання).',
  p: ['¿Cuántos años ___ usted?'],
  acc: ['tiene'],
  err: [
    ['tienes', '«Tienes» — форма для tú. Usted уживає форму 3-ї особи: tiene.'],
    ['es', 'Вік виражаємо з tener: ¿Cuántos años tiene usted?'],
  ],
  tr: 'Скільки Вам років?',
});
k.exact({ n: 54, role: 'delayed', fam: 'a105.age', t: [AGEU], ins: 'Переклади іспанською: «Мені 34 роки».', acc: ['Tengo treinta y cuatro años.', 'Yo tengo treinta y cuatro años.'], err: [['Soy treinta y cuatro años.', 'Вік в іспанській «мають»: tengo … años.']] });
k.exact({ n: 55, role: 'delayed', fam: 'a105.family', t: [AGEU], ins: 'Переклади іспанською: «Скільки років твоєму батькові?»', acc: ['¿Cuántos años tiene tu padre?'], err: [['¿Cuántos años es tu padre?', 'Вік — з tener: ¿Cuántos años tiene…?']] });
k.slots({
  n: 56,
  role: 'transfer',
  fam: 'a105.profile',
  t: [AGEW],
  ins: 'Перепиши речення повністю, вставивши дієслово.',
  p: ['Ana ___ dieciocho años y es estudiante.'],
  tpl: ['Ana ', S('s1'), ' dieciocho años y es estudiante.'],
  slots: [slot('s1', AGEW, ['tiene'], [['es', 'Вік виражаємо з tener: tiene … años.']])],
  tr: 'Ані вісімнадцять років, і вона студентка.',
});
k.exact({ n: 57, role: 'transfer', fam: 'a105.pet', t: [AGEU], ins: 'Переклади іспанською: «Моєму собаці три роки».', acc: ['Mi perro tiene tres años.'], err: [['Mi perro es tres años.', 'Вік виражаємо з tener: tiene … años.']] });
k.choice({
  n: 58,
  role: 'independent',
  fam: 'a105.family',
  t: [AGEC],
  ins: 'Обери дієслово.',
  p: ['Mi hijo ___ un año.'],
  o: [
    ['es', AGEC, 'Вік виражаємо з tener.'],
    ['tiene', true],
    ['está', AGEC, 'Вік виражаємо з tener.'],
  ],
  tr: 'Моєму синові рік.',
});

const cuAcc = (word: string): [string, string] => [word.replace(/á/, 'a'), `Питальне слово пишеться зі знаком наголосу: ${word.toLowerCase()}.`];
k.exact({ n: 59, role: 'supported', fam: 'a105.age', t: [CU], ins: 'Впиши питальне слово зі значенням «скільки». Зразок: ¿Cuántas personas hay?', p: ['¿___ años tienes?'], acc: ['Cuántos'], err: [cuAcc('Cuántos'), ['Cuántas', 'Años — чоловічого роду, множина: cuántos.'], ['Cuánto', 'Años — множина: cuántos.']], tr: 'Скільки тобі років?' });
k.exact({ n: 60, role: 'supported', fam: 'a105.class', t: [CU], ins: 'Впиши питальне слово зі значенням «скільки». Зразок: ¿Cuántos años tienes?', p: ['¿___ personas hay?'], acc: ['Cuántas'], err: [cuAcc('Cuántas'), ['Cuántos', 'Personas — жіночого роду: cuántas.']], tr: 'Скільки людей?' });
k.exact({ n: 61, role: 'independent', fam: 'a105.money', t: [CU], ins: 'Впиши питальне слово зі значенням «скільки».', p: ['¿___ dinero tienes?'], acc: ['Cuánto'], err: [cuAcc('Cuánto'), ['Cuántos', 'Dinero — чоловічого роду, однина: cuánto.']], tr: 'Скільки в тебе грошей?' });
k.exact({ n: 62, role: 'independent', fam: 'a105.drink', t: [CU], ins: 'Впиши питальне слово зі значенням «скільки».', p: ['¿___ agua bebes?'], acc: ['Cuánta'], err: [cuAcc('Cuánta'), ['Cuánto', 'Agua — жіночого роду (хоч і з артиклем el): cuánta agua.']], tr: 'Скільки води ти п’єш?' });
k.exact({ n: 63, role: 'independent', fam: 'a105.family', t: [CU], ins: 'Переклади іспанською: «Скільки в тебе братів?»', acc: ['¿Cuántos hermanos tienes?', '¿Cuántos hermanos tienes tú?'], err: [['¿Cuantos hermanos tienes?', 'Питальне слово пишеться зі знаком наголосу: cuántos.']] });
k.exact({ n: 64, role: 'independent', fam: 'a105.class', t: [CU], ins: 'Переклади іспанською: «Скільки людей у класі?»', acc: ['¿Cuántas personas hay en la clase?'], err: [['¿Cuántos personas hay en la clase?', 'Personas — жіночого роду: cuántas.']] });
k.exact({ n: 65, role: 'delayed', fam: 'a105.home', t: [CU], ins: 'Впиши питальне слово зі значенням «скільки».', p: ['¿___ libros tienes?'], acc: ['Cuántos'], err: [cuAcc('Cuántos'), ['Cuántas', 'Libros — чоловічого роду: cuántos.']], tr: 'Скільки в тебе книжок?' });
k.slots({ n: 66, role: 'delayed', fam: 'a105.drink', t: [CU], ins: 'Перепиши питання повністю, вставивши питальне слово зі значенням «скільки».', p: ['¿___ botellas de agua hay?'], tpl: ['¿', S('s1'), ' botellas de agua hay?'], slots: [slot('s1', CU, ['Cuántas'], [cuAcc('Cuántas'), ['Cuántos', 'Botellas — жіночого роду: cuántas.']])], tr: 'Скільки пляшок води є?' });
k.exact({ n: 67, role: 'transfer', fam: 'a105.time', t: [CU], ins: 'Переклади іспанською: «Скільки в тебе часу?»', acc: ['¿Cuánto tiempo tienes?', '¿Cuánto tiempo tienes tú?'], err: [['¿Cuánta tiempo tienes?', 'Tiempo — чоловічого роду: cuánto.']] });
k.exact({ n: 68, role: 'transfer', fam: 'a105.kitchen', t: [CU], ins: 'Переклади іспанською: «Скільки яєць є вдома?»', acc: ['¿Cuántos huevos hay en casa?'], err: [['¿Cuántas huevos hay en casa?', 'Huevos — чоловічого роду: cuántos.']] });
k.choice({
  n: 69,
  role: 'independent',
  fam: 'a105.class',
  t: [CUC],
  ins: 'Обери питальне слово зі значенням «скільки».',
  p: ['¿___ sillas hay?'],
  o: [
    ['Cuántos', CUC, 'Sillas — жіночого роду, множина: cuántas.'],
    ['Cuántas', true],
    ['Cuánta', CUC, 'Sillas — множина: cuántas.'],
  ],
  tr: 'Скільки стільців?',
});

// ======================= Step 5: ordinals
const ordIns = 'Впиши порядкове число словами.';
k.exact({ n: 70, role: 'supported', fam: 'a105.building', t: [ORD], ins: `${ordIns} Зразок: 2.º → segundo, 2.ª → segunda.`, p: ['Vivo en el ___ piso. (5.º)'], acc: ['quinto'], err: [['quinta', 'Piso — чоловічого роду: quinto.'], ['cinco', 'Cinco — кількісне число. «П’ятий» — quinto.']], tr: 'Я живу на п’ятому поверсі.' });
k.exact({ n: 71, role: 'supported', fam: 'a105.street', t: [ORD], ins: `${ordIns} Зразок: 4.º → cuarto, 4.ª → cuarta.`, p: ['Es la ___ calle. (2.ª)'], acc: ['segunda'], err: [['segundo', 'Calle — жіночого роду: segunda.'], ['dos', 'Dos — кількісне число. «Друга» — segunda.']], tr: 'Це друга вулиця.' });
k.exact({ n: 72, role: 'independent', fam: 'a105.building', t: [ORD], ins: ordIns, p: ['Mi hermano vive en el ___ piso. (4.º)'], acc: ['cuarto'], err: [['cuarta', 'Piso — чоловічого роду: cuarto.']], tr: 'Мій брат живе на четвертому поверсі.' });
k.exact({ n: 73, role: 'independent', fam: 'a105.home', t: [ORD], ins: ordIns, p: ['La ___ puerta es la cocina. (3.ª)'], acc: ['tercera'], err: [['tercer', 'Скорочене tercer — лише перед іменником чоловічого роду. Puerta — жіночого: tercera.'], ['tercero', 'Puerta — жіночого роду: tercera.']], tr: 'Треті двері — це кухня.' });
k.exact({ n: 74, role: 'independent', fam: 'a105.study', t: [ORD], ins: ordIns, p: ['Es mi ___ clase de español. (2.ª)'], acc: ['segunda'], err: [['segundo', 'Clase — жіночого роду: segunda.']], tr: 'Це моє друге заняття з іспанської.' });
k.slots({
  n: 75,
  role: 'independent',
  fam: 'a105.building',
  t: [ORD],
  ins: 'Перепиши речення повністю, записавши порядкові числа словами.',
  p: ['Ana vive en el ___ piso y Pablo en el ___. (6.º, 7.º)'],
  tpl: ['Ana vive en el ', S('s1'), ' piso y Pablo en el ', S('s2'), '.'],
  slots: [slot('s1', ORD, ['sexto'], [['seis', 'Seis — кількісне число. «Шостий» — sexto.']]), slot('s2', ORD, ['séptimo'], [['septimo', 'Майже: séptimo пишеться зі знаком наголосу.']])],
  tr: 'Ана живе на шостому поверсі, а Пабло — на сьомому.',
});
k.exact({ n: 76, role: 'delayed', fam: 'a105.building', t: [ORD], ins: ordIns, p: ['La oficina está en el ___ piso. (8.º)'], acc: ['octavo'], err: [['ocho', 'Ocho — кількісне число. «Восьмий» — octavo.']], tr: 'Офіс на восьмому поверсі.' });
k.exact({ n: 77, role: 'delayed', fam: 'a105.city', t: [ORD], ins: ordIns, p: ['Es mi ___ año en Madrid. (2.º)'], acc: ['segundo'], err: [['segunda', 'Año — чоловічого роду: segundo.']], tr: 'Це мій другий рік у Мадриді.' });
k.exact({ n: 78, role: 'transfer', fam: 'a105.hotel-floor', t: [ORD], ins: ordIns, p: ['En el hotel, nuestra habitación está en el ___ piso. (5.º)'], acc: ['quinto'], err: [['quinta', 'Piso — чоловічого роду: quinto.']], tr: 'У готелі наша кімната на п’ятому поверсі.' });
k.exact({ n: 79, role: 'transfer', fam: 'a105.reading', t: [ORD], ins: ordIns, p: ['Es mi ___ libro en español. (10.º)'], acc: ['décimo'], err: [['decimo', 'Майже: décimo пишеться зі знаком наголосу.'], ['diez', 'Diez — кількісне число. «Десятий» — décimo.']], tr: 'Це моя десята книжка іспанською.' });
k.choice({ n: 80, role: 'independent', fam: 'a105.building', t: [ORDR], ins: 'Прочитай табличку в ліфті. Що означає «2.ª planta» (planta — поверх)?', p: ['2.ª planta'], o: [['Другий поверх.', true], ['Два поверхи.', false], ['Дванадцятий поверх.', false]] });
k.choice({
  n: 81,
  role: 'delayed',
  fam: 'a105.building',
  t: [ORDC],
  ins: 'Обери правильну форму (5.º).',
  p: ['Vivo en el ___ piso.'],
  o: [
    ['quinta', ORDC, 'Piso — чоловічого роду: quinto.'],
    ['quinto', true],
  ],
  tr: 'Я живу на п’ятому поверсі.',
});

k.exact({ n: 82, role: 'supported', fam: 'a105.building', t: [APO], ins: 'Впиши порядкове число (1.º). Зразок: el tercer día, la primera calle.', p: ['Vivo en el ___ piso.'], acc: ['primer'], err: [['primero', 'Перед іменником чоловічого роду в однині primero скорочується: primer.'], ['primera', 'Piso — чоловічого роду: primer.']], tr: 'Я живу на першому поверсі.' });
k.exact({ n: 83, role: 'independent', fam: 'a105.study', t: [APO], ins: 'Впиши порядкове число (3.º).', p: ['Es el ___ día de clase.'], acc: ['tercer'], err: [['tercero', 'Перед іменником чоловічого роду в однині tercero скорочується: tercer.']], tr: 'Це третій день занять.' });
k.exact({ n: 84, role: 'independent', fam: 'a105.street', t: [APO], ins: 'Впиши порядкове число (1.ª).', p: ['Es la ___ calle.'], acc: ['primera'], err: [['primer', 'Скорочення — лише перед чоловічим родом. Calle — жіночого: primera.']], tr: 'Це перша вулиця.' });
k.slots({ n: 85, role: 'delayed', fam: 'a105.city', t: [APO], ins: 'Перепиши речення повністю, записавши порядкове число (1.º) словом.', p: ['Es mi ___ año en Madrid.'], tpl: ['Es mi ', S('s1'), ' año en Madrid.'], slots: [slot('s1', APO, ['primer'], [['primero', 'Перед іменником чоловічого роду в однині — primer.']])], tr: 'Це мій перший рік у Мадриді.' });
k.exact({ n: 86, role: 'transfer', fam: 'a105.office-floor', t: [APO], ins: 'Впиши порядкове число (3.ª). Planta — поверх.', p: ['La oficina está en la ___ planta.'], acc: ['tercera'], err: [['tercer', 'Скорочення — лише перед чоловічим родом. Planta — жіночого: tercera.']], tr: 'Офіс на третьому поверсі.' });
k.exact({ n: 87, role: 'transfer', fam: 'a105.museum-visit', t: [APO], ins: 'Впиши порядкове число (1.º).', p: ['Es el ___ museo de la ciudad.'], acc: ['primer'], err: [['primero', 'Перед іменником чоловічого роду в однині — primer.']], tr: 'Це перший музей міста.' });
k.choice({ n: 88, role: 'independent', fam: 'a105.study', t: [APOC], ins: 'Обери правильну форму.', p: ['Es el ___ día de clase.'], o: [['primero', APOC, 'Перед іменником чоловічого роду в однині — primer.'], ['primer', true]], tr: 'Це перший день занять.' });
k.choice({ n: 89, role: 'delayed', fam: 'a105.home', t: [APOC], ins: 'Обери правильну форму.', p: ['Es la ___ casa de la calle.'], o: [['tercer', APOC, 'Скорочення — лише перед чоловічим родом: la tercera casa.'], ['tercera', true]], tr: 'Це третій будинок на вулиці.' });

// ======================= Step 6: mucho / poco, muy / mucho
const muIns = 'Впиши mucho / poco у потрібній формі.';
k.exact({ n: 90, role: 'supported', fam: 'a105.drink', t: [MU], ins: `${muIns} Зразок: mucho dinero, muchas personas. Значення: багато.`, p: ['Hay ___ agua.'], acc: ['mucha'], err: [['mucho', 'Agua — жіночого роду (хоч і з артиклем el): mucha agua.'], ['muy', 'Muy — перед прикметником. Перед іменником — mucho / mucha.']], tr: 'Є багато води.' });
k.exact({ n: 91, role: 'supported', fam: 'a105.home', t: [MU], ins: `${muIns} Зразок: mucha agua, poco tiempo. Значення: багато.`, p: ['Tengo ___ libros.'], acc: ['muchos'], err: [['mucho', 'Libros — множина чоловічого роду: muchos.'], ['muchas', 'Libros — чоловічого роду: muchos.']], tr: 'У мене багато книжок.' });
k.exact({ n: 92, role: 'independent', fam: 'a105.square', t: [MU], ins: `${muIns} Значення: багато.`, p: ['Hay ___ personas en la plaza.'], acc: ['muchas'], err: [['muchos', 'Personas — жіночого роду: muchas.'], ['mucho', 'Personas — множина жіночого роду: muchas.']], tr: 'На площі багато людей.' });
k.exact({ n: 93, role: 'independent', fam: 'a105.time', t: [MU], ins: `${muIns} Значення: мало.`, p: ['Tengo ___ tiempo.'], acc: ['poco'], err: [['poca', 'Tiempo — чоловічого роду: poco.']], tr: 'У мене мало часу.' });
k.exact({ n: 94, role: 'independent', fam: 'a105.class', t: [MU], ins: `${muIns} Значення: мало.`, p: ['Hay ___ sillas en la clase.'], acc: ['pocas'], err: [['pocos', 'Sillas — жіночого роду: pocas.'], ['poco', 'Sillas — множина жіночого роду: pocas.']], tr: 'У класі мало стільців.' });
k.exact({ n: 95, role: 'independent', fam: 'a105.work', t: [MU], ins: `${muIns} Значення: багато (після дієслова).`, p: ['Ana trabaja ___.'], acc: ['mucho'], err: [['mucha', 'Після дієслова mucho не змінюється: trabaja mucho.'], ['muy', 'Після дієслова — mucho: trabaja mucho.']], tr: 'Ана багато працює.' });
k.exact({ n: 96, role: 'delayed', fam: 'a105.drink', t: [MU], ins: `${muIns} Значення: багато.`, p: ['Bebo ___ agua.'], acc: ['mucha'], err: [['mucho', 'Agua — жіночого роду: mucha agua.']], tr: 'Я п’ю багато води.' });
k.slots({ n: 97, role: 'delayed', fam: 'a105.family', t: [MU], ins: 'Перепиши речення повністю, вставивши mucho у потрібній формі (багато).', p: ['Mis padres tienen ___ amigos.'], tpl: ['Mis padres tienen ', S('s1'), ' amigos.'], slots: [slot('s1', MU, ['muchos'], [['mucho', 'Amigos — множина чоловічого роду: muchos.']])], tr: 'У моїх батьків багато друзів.' });
k.exact({ n: 98, role: 'transfer', fam: 'a105.market', t: [MU], ins: `${muIns} Значення: багато.`, p: ['En el supermercado hay ___ tomates.'], acc: ['muchos'], err: [['muchas', 'Tomates — чоловічого роду: muchos.']], tr: 'У супермаркеті багато помідорів.' });
k.exact({ n: 99, role: 'transfer', fam: 'a105.diet', t: [MU], ins: `${muIns} Значення: мало (після дієслова).`, p: ['Mi hermano come ___.'], acc: ['poco'], err: [['poca', 'Після дієслова poco не змінюється: come poco.']], tr: 'Мій брат мало їсть.' });
k.choice({ n: 100, role: 'independent', fam: 'a105.square', t: [MUC], ins: 'Обери правильну форму (багато).', p: ['Hay ___ personas.'], o: [['mucho', MUC, 'Personas — множина жіночого роду: muchas.'], ['muchas', true], ['muy', MUC, 'Muy — перед прикметником, не перед іменником.']], tr: 'Є багато людей.' });

const mmIns = 'Впиши muy або mucho (у потрібній формі).';
const muyErr: E = [['mucho', 'Перед прикметником чи прислівником — muy.'], ['mucha', 'Перед прикметником чи прислівником — muy.']];
const muchoErr: E = [['muy', 'Перед іменником або після дієслова — mucho.']];
k.exact({ n: 101, role: 'supported', fam: 'a105.home', t: [MM], ins: `${mmIns} Зразок: muy caro — mucho dinero.`, p: ['La casa es ___ grande.'], acc: ['muy'], err: muyErr, tr: 'Будинок дуже великий.' });
k.exact({ n: 102, role: 'supported', fam: 'a105.work', t: [MM], ins: `${mmIns} Зразок: muy bien — mucho trabajo.`, p: ['Tengo ___ trabajo.'], acc: ['mucho'], err: muchoErr, tr: 'У мене багато роботи.' });
k.exact({ n: 103, role: 'independent', fam: 'a105.work', t: [MM], ins: mmIns, p: ['Estoy ___ cansado.'], acc: ['muy'], err: muyErr, tr: 'Я дуже втомлений.' });
k.exact({ n: 104, role: 'independent', fam: 'a105.study', t: [MM], ins: mmIns, p: ['Ana estudia ___.'], acc: ['mucho'], err: muchoErr, tr: 'Ана багато вчиться.' });
k.exact({ n: 105, role: 'independent', fam: 'a105.home', t: [MM], ins: mmIns, p: ['El piso es ___ pequeño.'], acc: ['muy'], err: muyErr, tr: 'Квартира дуже маленька.' });
k.slots({
  n: 106,
  role: 'independent',
  fam: 'a105.friends',
  t: [MM],
  ins: 'Перепиши речення повністю, вставивши muy або mucho (у потрібній формі).',
  p: ['Pablo es ___ simpático y tiene ___ amigos.'],
  tpl: ['Pablo es ', S('s1'), ' simpático y tiene ', S('s2'), ' amigos.'],
  slots: [slot('s1', MM, ['muy'], muyErr), slot('s2', MM, ['muchos'], [['muy', 'Перед іменником — mucho (тут muchos).']])],
  tr: 'Пабло дуже приємний, і в нього багато друзів.',
});
k.exact({ n: 107, role: 'delayed', fam: 'a105.study', t: [MM], ins: mmIns, p: ['El examen es ___ fácil.'], acc: ['muy'], err: muyErr, tr: 'Іспит дуже легкий.' });
k.exact({ n: 108, role: 'delayed', fam: 'a105.work', t: [MM], ins: mmIns, p: ['Mi padre trabaja ___.'], acc: ['mucho'], err: muchoErr, tr: 'Мій тато багато працює.' });
k.exact({ n: 109, role: 'transfer', fam: 'a105.hotel-desc', t: [MM], ins: mmIns, p: ['El hotel es ___ bonito.'], acc: ['muy'], err: muyErr, tr: 'Готель дуже гарний.' });
k.exact({ n: 110, role: 'transfer', fam: 'a105.chat', t: [MM], ins: mmIns, p: ['Mis amigos hablan ___.'], acc: ['mucho'], err: muchoErr, tr: 'Мої друзі багато говорять.' });
k.choice({ n: 111, role: 'independent', fam: 'a105.study', t: [MMC], ins: 'Обери muy або mucho.', p: ['El libro es ___ interesante.'], o: [['muy', true], ['mucho', MMC, 'Перед прикметником — muy.']], tr: 'Книжка дуже цікава.' });

// ======================= Step 7: containers
const coIns = 'Напиши іспанською кількість товару.';
const deErr = (phrase: string, noDe: string, withArt: string): E => [
  [noDe, 'Між мірою і товаром потрібне de.'],
  [withArt, 'Після міри — de і іменник без артикля.'],
];
k.exact({ n: 112, role: 'supported', fam: 'a105.shop-list', t: [COU], ins: `${coIns} Зразок: una botella de agua — «пляшка води». Завдання: «кілограм помідорів».`, acc: ['un kilo de tomates'], err: deErr('un kilo de tomates', 'un kilo tomates', 'un kilo de los tomates') });
k.exact({ n: 113, role: 'supported', fam: 'a105.shop-list', t: [COW], ins: 'Впиши слово, якого бракує. Зразок: un kilo de tomates.', p: ['un litro ___ leche'], acc: ['de'], err: [['del', 'Після міри — de без артикля: un litro de leche.']], tr: 'літр молока' });
k.exact({ n: 114, role: 'independent', fam: 'a105.shop-list', t: [COU], ins: `${coIns} «Пачка кави».`, acc: ['un paquete de café'], err: deErr('', 'un paquete café', 'un paquete del café') });
k.exact({ n: 115, role: 'independent', fam: 'a105.shop-list', t: [COU], ins: `${coIns} «Пляшка води».`, acc: ['una botella de agua'], err: [['un botella de agua', 'Botella — жіночого роду: una botella.'], ...deErr('', 'una botella agua', 'una botella del agua')] });
k.exact({ n: 116, role: 'independent', fam: 'a105.shop-list', t: [COU], ins: `${coIns} «Десяток (дюжина) яєць».`, acc: ['una docena de huevos'], err: deErr('', 'una docena huevos', 'una docena de los huevos') });
k.exact({ n: 117, role: 'independent', fam: 'a105.deli', t: [COU], ins: `${coIns} «Пів кілограма сиру».`, acc: ['medio kilo de queso'], err: [['media kilo de queso', 'Kilo — чоловічого роду: medio kilo.'], ['medio kilo queso', 'Між мірою і товаром потрібне de.']] });
k.exact({ n: 118, role: 'delayed', fam: 'a105.shop-list', t: [COW], ins: 'Впиши слово, якого бракує.', p: ['una lata ___ atún'], acc: ['de'], err: [['del', 'Після міри — de без артикля: una lata de atún.']], tr: 'бляшанка тунця' });
k.slots({ n: 119, role: 'delayed', fam: 'a105.deli', t: [COU], ins: 'Напиши в списку покупок «два кілограми помідорів», доповнивши запис.', p: ['___ de tomates'], tpl: [S('s1'), ' de tomates'], slots: [slot('s1', COU, ['dos kilos'], [['dos kilo', 'Після числа більше за один — множина: dos kilos.']])], ref: 'dos kilos de tomates' });
k.exact({ n: 120, role: 'transfer', fam: 'a105.list-milk', t: [COU], ins: `${coIns} Список покупок: «дві пляшки молока».`, acc: ['dos botellas de leche'], err: [['dos botella de leche', 'Після числа більше за один — множина: dos botellas.'], ['dos botellas leche', 'Між мірою і товаром потрібне de.']] });
k.exact({ n: 121, role: 'transfer', fam: 'a105.eggs', t: [COU], ins: `${coIns} «Пів десятка (півдюжини) яєць».`, acc: ['media docena de huevos'], err: [['medio docena de huevos', 'Docena — жіночого роду: media docena.']] });
k.choice({ n: 122, role: 'independent', fam: 'a105.deli', t: [COR], ins: 'Прочитай запис у списку покупок. Скільки сиру потрібно купити?', p: ['medio kilo de queso'], o: [['500 г.', true], ['1 кг.', false], ['2 кг.', false]] });

// ======================= listening: amounts
const A1 = k.clip({ id: 'clip.a1-05.amounts.edad', kind: 'sentence', es: 'Tengo treinta y dos años.', uk: 'Мені тридцять два роки.', t: [LA], fam: 'a105.l-age' });
const A2 = k.clip({ id: 'clip.a1-05.amounts.clase', kind: 'sentence', es: 'En mi clase hay quince estudiantes.', uk: 'У моєму класі п’ятнадцять студентів.', t: [LA, LAD], fam: 'a105.l-class' });
const A3 = k.clip({ id: 'clip.a1-05.amounts.compra', kind: 'sentence', es: 'Un kilo de tomates y una docena de huevos, por favor.', uk: 'Кілограм помідорів і десяток яєць, будь ласка.', t: [LA], fam: 'a105.l-shop' });
k.choice({ n: 123, role: 'independent', fam: 'a105.l-age', t: [LA], clips: [A1], ins: 'Послухай запис. Скільки років людині?', o: [['23', false], ['32', true], ['42', false]], hints: [hTranscript([LA], 'Tengo treinta y dos años.')] });
k.choice({ n: 124, role: 'independent', fam: 'a105.l-class', t: [LA], clips: [A2], ins: 'Послухай запис. Скільки студентів у класі?', o: [['5', false], ['50', false], ['15', true]], hints: [hTranscript([LA], 'En mi clase hay quince estudiantes.')] });
k.choice({ n: 125, role: 'independent', fam: 'a105.l-shop', t: [LA], clips: [A3], ins: 'Послухай запис. Що просить людина?', o: [['Кілограм помідорів і десяток яєць.', true], ['Два кілограми помідорів.', false], ['Пляшку води й десяток яєць.', false]], hints: [hTranscript([LA], 'Un kilo de tomates y una docena de huevos, por favor.')] });
k.exact({
  n: 126,
  role: 'independent',
  fam: 'a105.l-class',
  t: [LAD],
  clips: [A2],
  ins: 'Необов’язковий диктант: послухай і запиши речення іспанською. Число можна записати словом. Великі літери й крапка в кінці не оцінюються.',
  acc: ['En mi clase hay quince estudiantes.', 'En mi clase hay 15 estudiantes.'],
  pol: DICTATION,
});

k.material({
  id: 'material.a1-05.numbers',
  topic: 'A1-05-L1',
  title: 'Числа 0–1000',
  blocks: [
    tableEs(
      ['0–15', '16–29', '30–99', '100–1000'],
      [
        ['cero, uno, dos, tres', 'dieciséis, diecisiete', 'treinta, treinta y uno', 'cien, ciento uno'],
        ['cuatro, cinco, seis, siete', 'dieciocho, diecinueve', 'cuarenta, cincuenta', 'doscientos / doscientas'],
        ['ocho, nueve, diez', 'veinte, veintiuno', 'sesenta, setenta', 'quinientos, setecientos'],
        ['once, doce, trece', 'veintidós, veintitrés', 'ochenta, noventa', 'novecientos'],
        ['catorce, quince', 'veintiséis, veintinueve', 'noventa y nueve', 'mil, dos mil'],
      ],
    ),
    uk('Перед іменником: un libro, una casa, veintiún años. Порядкові: primero (primer piso), segundo, tercero (tercer día), cuarto, quinto.'),
    plink('Потренувати числа', [N015, N1629, N3099, N100], 'written', 12),
  ],
  linked: [N015, N1629, N3099, N100, UNO, ORD],
});
k.material({
  id: 'material.a1-05.quantity',
  topic: 'A1-05-L1',
  title: 'Скільки: mucho, poco, muy чи mucho, міри товару',
  blocks: [
    ul(
      'mucho dinero, mucha agua, muchos libros, muchas personas; poco tiempo, pocas sillas.',
      'muy + прикметник: muy grande; mucho + іменник / після дієслова: mucho trabajo, estudia mucho.',
      'un kilo de tomates, una botella de agua, un paquete de café, medio kilo de queso.',
      '¿Cuántos años tienes? — Tengo veinte años.',
    ),
    plink('Потренувати кількість', [MU, MM, COU, AGEU, CU], 'written', 10),
  ],
  linked: [MU, MM, COU, AGEU, CU],
});

export default k.build({
  title: 'Числа й кількість крок за кроком',
  termEs: 'los números, la edad y las cantidades',
  summary:
    'Вчимо числа від 0 до 1000 невеликими кроками, порядкові числа, вік (tener … años), кількість (mucho, poco, muy чи mucho), міри товару й питання ¿cuánto…? Урок поділено на сім кроків, до яких можна повертатися окремо.',
  objectives: ['A1-05-O1'],
  cv: ['CV-02', 'CV-04'],
  situations: ['food-shopping', 'greetings-introductions', 'people-family-home'],
  minutes: 20,
  introduces: [
    'number.0-15',
    'number.16-29',
    'number.30-99',
    'number.100-1000',
    'number.uno-un-una',
    'number.ordinal',
    'number.ordinal.apocope',
    'listening.amounts',
    'quant.mucho',
    'contrast.muy-mucho',
    'quant.containers',
    'tener.age',
    'question.word.cuanto',
  ],
  revisits: ['present.tener', 'hay.existence', 'article.indefinite', 'adj.agreement.o-a', 'quant.muy', 'ortho.interrogative-accent', 'noun.plural.s', 'estar.location'],
  steps: [
    {
      kind: 'supported-practice',
      title: 'Крок 1. Числа 0–15',
      blocks: [
        uk('Числа від 0 до 15 — окремі слова, їх треба запам’ятати.'),
        tableEs(['0–7', '8–15'], [['cero, uno, dos, tres', 'ocho, nueve, diez, once'], ['cuatro, cinco, seis, siete', 'doce, trece, catorce, quince']]),
      ],
      tasks: [k.id(1), k.id(2)],
    },
    {
      kind: 'supported-practice',
      title: 'Крок 2. Числа 16–29',
      blocks: [
        uk('Від 16 до 29 числа пишуться одним словом: dieci- + одиниці, veinti- + одиниці. Знак наголосу мають dieciséis, veintidós, veintitrés, veintiséis.'),
        tableEs(['16–19', '20–29'], [['dieciséis, diecisiete', 'veinte, veintiuno, veintidós'], ['dieciocho, diecinueve', 'veintitrés … veintinueve']]),
      ],
      tasks: [k.id(11), k.id(12)],
    },
    { kind: 'independent-practice', title: 'Кроки 1–2: самостійно', tasks: [k.id(18), k.id(3), k.id(4), k.id(19), k.id(13), k.id(14)] },
    {
      kind: 'supported-practice',
      title: 'Крок 3. Десятки, сотні й тисяча',
      blocks: [
        uk('Десятки: treinta, cuarenta, cincuenta, sesenta, setenta, ochenta, noventa. Від 31 до 99 — три слова з y: treinta y uno, cuarenta y cinco.'),
        uk('Рівно 100 — cien; 101–199 — ciento + решта: ciento veinte. Сотні: doscientos, trescientos, cuatrocientos, quinientos, seiscientos, setecientos, ochocientos, novecientos; перед жіночим родом — -as: doscientas fotos. 1000 — mil, 2000 — dos mil.'),
      ],
      tasks: [k.id(20), k.id(21), k.id(30), k.id(31)],
    },
    { kind: 'independent-practice', title: 'Крок 3: самостійно', tasks: [k.id(37), k.id(22), k.id(23), k.id(38), k.id(32), k.id(33)] },
    {
      kind: 'supported-practice',
      title: 'Крок 4. Un, una; вік; ¿cuántos…?',
      blocks: [
        uk('Рахуючи, кажемо uno; перед іменником — un або una: un libro, una casa, veintiún años, treinta y un chicos.'),
        uk('Вік в іспанській «мають»: Tengo veinte años — «мені двадцять років». ¿Cuántos años tienes? — «Скільки тобі років?»'),
        uk('Cuánto узгоджується з іменником: ¿Cuánto dinero? ¿Cuánta agua? ¿Cuántos años? ¿Cuántas personas? Усі форми — зі знаком наголосу.'),
        ex('Mi hijo tiene un año.', 'Моєму синові рік.'),
      ],
      tasks: [k.id(40), k.id(48), k.id(49), k.id(59), k.id(60)],
    },
    { kind: 'independent-practice', title: 'Крок 4: самостійно', tasks: [k.id(46), k.id(41), k.id(42), k.id(58), k.id(50), k.id(51), k.id(69), k.id(61), k.id(62)] },
    {
      kind: 'supported-practice',
      title: 'Крок 5. Порядкові числа',
      blocks: [
        uk('Порядкові числа змінюються, як прикметники на -o: primero / primera, segundo / segunda, tercero, cuarto, quinto, sexto, séptimo, octavo, noveno, décimo.'),
        uk('Перед іменником чоловічого роду в однині primero і tercero втрачають -o: el primer piso, el tercer día. Але: la primera calle.'),
        uk('На табличках пишуть 1.º, 2.ª: 2.ª planta — «другий поверх».'),
      ],
      tasks: [k.id(70), k.id(71), k.id(82)],
    },
    {
      kind: 'supported-practice',
      title: 'Крок 6. Mucho, poco; muy чи mucho',
      blocks: [
        uk('Mucho («багато») і poco («мало») перед іменником узгоджуються з ним: mucho dinero, mucha agua, muchos libros, muchas personas. Після дієслова — незмінні: Trabaja mucho.'),
        uk('Muy — перед прикметником або прислівником: muy grande, muy bien. Mucho — перед іменником або після дієслова.'),
        ex('Es muy caro. / Tengo mucho trabajo.', 'Це дуже дорого. / У мене багато роботи.'),
      ],
      tasks: [k.id(90), k.id(91), k.id(101), k.id(102)],
    },
    {
      kind: 'supported-practice',
      title: 'Крок 7. Кількість товару',
      blocks: [
        uk('Міра + de + іменник без артикля: un kilo de tomates, un litro de leche, una botella de agua, un paquete de café, una docena de huevos, una lata de atún. Половина: medio kilo, media docena.'),
      ],
      tasks: [k.id(112), k.id(113)],
    },
    {
      kind: 'independent-practice',
      title: 'Кроки 5–7: самостійно',
      tasks: [k.id(80), k.id(72), k.id(73), k.id(88), k.id(83), k.id(84), k.id(100), k.id(92), k.id(93), k.id(111), k.id(103), k.id(104), k.id(122), k.id(114), k.id(115)],
    },
    {
      kind: 'independent-practice',
      title: 'Додаткова практика',
      required: false,
      tasks: [
        k.id(5),
        k.id(6),
        k.id(24),
        k.id(25),
        k.id(52),
        k.id(53),
        k.id(63),
        k.id(64),
        k.id(74),
        k.id(75),
        k.id(94),
        k.id(95),
        k.id(105),
        k.id(106),
        k.id(116),
        k.id(117),
      ],
    },
    { kind: 'listening', title: 'Послухай: числа й кількість', required: false, clips: [A1, A2, A3], tasks: [k.id(123), k.id(124), k.id(125), k.id(126)] },
    {
      kind: 'summary',
      title: 'Підсумок',
      blocks: [
        ul(
          '16–29 — одним словом (veintidós); 31–99 — з y (treinta y uno); 100 — cien, 101 — ciento uno.',
          'Перед іменником: un / una, veintiún; primer, tercer — перед чоловічим родом.',
          'Вік: tengo … años. Кількість: mucho / poco узгоджуються з іменником; muy — перед прикметником.',
          'Міра + de + іменник: un kilo de tomates.',
        ),
      ],
    },
  ],
});
