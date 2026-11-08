// A1-04-L2 — regular -er and -ir present forms in two short steps, then the nosotros/vosotros contrast.
import { Kit, S, ex, family, form, hTr, hTranscript, plink, tableEs, ul, uk, verbErrors, vgap, vslot } from '../lib.ts';
import type { Person, SlotSpec } from '../lib.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-04-L2', RULES);

const ERS = 'present.regular-er/written-form';
const ERSC = 'present.regular-er/context-choice';
const ERP = 'present.regular-er.plural/written-form';
const ERPC = 'present.regular-er.plural/context-choice';
const IRS = 'present.regular-ir/written-form';
const IRSC = 'present.regular-ir/context-choice';
const IRP = 'present.regular-ir.plural/written-form';
const IRPC = 'present.regular-ir.plural/context-choice';
const CW = 'contrast.er-ir-endings/written-form';
const CC = 'contrast.er-ir-endings/context-choice';
const LM = 'listening.daily-actions/listening-meaning';

/** The nosotros/vosotros ending of the other family (vivemos, coméis → comís …) with feedback. */
function cross(verb: string, p: 3 | 4): [string, string] {
  const stem = verb.slice(0, -2);
  if (family(verb) === 'ir') {
    return p === 3
      ? [`${stem}emos`, 'Дієслова на -ir у формі nosotros мають закінчення -imos, а не -emos.']
      : [`${stem}éis`, 'Дієслова на -ir у формі vosotros мають закінчення -ís, а не -éis.'];
  }
  return p === 3
    ? [`${stem}imos`, 'Дієслова на -er у формі nosotros мають закінчення -emos, а не -imos.']
    : [`${stem}ís`, 'Дієслова на -er у формі vosotros мають закінчення -éis, а не -ís.'];
}

const plural = (p: Person): p is 3 | 4 => p === 3 || p === 4;
const extra = (verb: string, p: Person): Array<[string, string]> => (plural(p) ? [cross(verb, p)] : []);
const slot = (id: string, t: string, verb: string, p: Person): SlotSpec => vslot(id, t, verb, p, extra(verb, p));

// ======================= Step 1: -er
vgap(k, { n: 1, role: 'supported', fam: 'a104.food', t: [ERS], verb: 'comer', person: 0, model: 'beber → yo bebo', s: 'Yo ___ fruta. (comer)', tr: 'Я їм фрукти.' });
vgap(k, { n: 2, role: 'supported', fam: 'a104.home', t: [ERS], verb: 'leer', person: 2, model: 'comer → ella come', s: 'Ana ___ el periódico. (leer)', tr: 'Ана читає газету.' });
vgap(k, { n: 3, role: 'supported', fam: 'a104.food', t: [ERP], verb: 'beber', person: 3, model: 'comer → nosotros comemos', s: 'Nosotros ___ agua. (beber)', tr: 'Ми п’ємо воду.', extra: [cross('beber', 3)] });
vgap(k, { n: 4, role: 'supported', fam: 'a104.food', t: [ERP], verb: 'comer', person: 4, model: 'beber → vosotros bebéis (зі знаком наголосу)', s: '¿Vosotros ___ pescado? (comer)', tr: 'Ви їсте рибу?', extra: [cross('comer', 4)] });
vgap(k, { n: 5, role: 'independent', fam: 'a104.food', t: [ERS], verb: 'beber', person: 1, s: '¿Tú ___ café? (beber)', tr: 'Ти п’єш каву?' });
vgap(k, { n: 6, role: 'independent', fam: 'a104.leisure', t: [ERS], verb: 'correr', person: 2, s: 'Mi hermano ___ en el parque. (correr)', tr: 'Мій брат бігає в парку.' });
vgap(k, { n: 7, role: 'independent', fam: 'a104.food', t: [ERP], verb: 'comer', person: 5, s: 'Mis padres ___ carne. (comer)', tr: 'Мої батьки їдять м’ясо.' });
vgap(k, { n: 8, role: 'independent', fam: 'a104.study', t: [ERP], verb: 'aprender', person: 5, s: '¿Ustedes ___ español? (aprender)', tr: 'Ви (кілька людей, ввічливо) вивчаєте іспанську?' });
k.slots({
  n: 9,
  role: 'independent',
  fam: 'a104.home',
  t: [ERS, ERP],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслова leer.',
  p: ['Yo ___ un libro y mis amigos ___ el periódico. (leer)'],
  tpl: ['Yo ', S('s1'), ' un libro y mis amigos ', S('s2'), ' el periódico.'],
  slots: [slot('s1', ERS, 'leer', 0), slot('s2', ERP, 'leer', 5)],
  tr: 'Я читаю книжку, а мої друзі читають газету.',
});
k.slots({
  n: 10,
  role: 'independent',
  fam: 'a104.food',
  t: [ERS, ERP],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслова beber.',
  p: ['Tú ___ agua y vosotros ___ leche. (beber)'],
  tpl: ['Tú ', S('s1'), ' agua y vosotros ', S('s2'), ' leche.'],
  slots: [slot('s1', ERS, 'beber', 1), slot('s2', ERP, 'beber', 4)],
  tr: 'Ти п’єш воду, а ви п’єте молоко.',
});
vgap(k, { n: 11, role: 'delayed', fam: 'a104.food', t: [ERS], verb: 'comer', person: 2, s: '¿Usted ___ carne? (comer)', tr: 'Ви їсте м’ясо?' });
vgap(k, { n: 12, role: 'delayed', fam: 'a104.study', t: [ERP], verb: 'aprender', person: 3, s: 'Nosotras ___ inglés. (aprender)', tr: 'Ми вивчаємо англійську.', extra: [cross('aprender', 3)] });
k.slots({
  n: 13,
  role: 'delayed',
  fam: 'a104.food',
  t: [ERS, ERP],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслова comer.',
  p: ['Mi madre ___ fruta y nosotros ___ pescado. (comer)'],
  tpl: ['Mi madre ', S('s1'), ' fruta y nosotros ', S('s2'), ' pescado.'],
  slots: [slot('s1', ERS, 'comer', 2), slot('s2', ERP, 'comer', 3)],
  tr: 'Моя мама їсть фрукти, а ми їмо рибу.',
});
k.slots({
  n: 14,
  role: 'transfer',
  fam: 'a104.park',
  t: [ERS, ERP],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслова correr.',
  p: ['En el parque, yo ___ con mi perro y vosotros ___ con vuestros amigos. (correr)'],
  tpl: ['En el parque, yo ', S('s1'), ' con mi perro y vosotros ', S('s2'), ' con vuestros amigos.'],
  slots: [slot('s1', ERS, 'correr', 0), slot('s2', ERP, 'correr', 4)],
  tr: 'У парку я бігаю зі своїм собакою, а ви бігаєте зі своїми друзями.',
});
k.slots({
  n: 15,
  role: 'transfer',
  fam: 'a104.visit',
  t: [ERS, ERP],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслова leer.',
  p: ['En casa de Ana, Pablo ___ el periódico y nosotros ___ un libro. (leer)'],
  tpl: ['En casa de Ana, Pablo ', S('s1'), ' el periódico y nosotros ', S('s2'), ' un libro.'],
  slots: [slot('s1', ERS, 'leer', 2), slot('s2', ERP, 'leer', 3)],
  tr: 'У гостях в Ани Пабло читає газету, а ми читаємо книжку.',
});

// ======================= Step 2: -ir
vgap(k, { n: 16, role: 'supported', fam: 'a104.city', t: [IRS], verb: 'vivir', person: 0, model: 'escribir → yo escribo', s: 'Yo ___ en Madrid. (vivir)', tr: 'Я живу в Мадриді.' });
vgap(k, { n: 17, role: 'supported', fam: 'a104.study', t: [IRS], verb: 'escribir', person: 2, model: 'vivir → ella vive', s: 'Ana ___ un mensaje. (escribir)', tr: 'Ана пише повідомлення.' });
vgap(k, { n: 18, role: 'supported', fam: 'a104.city', t: [IRP], verb: 'vivir', person: 3, model: 'escribir → nosotros escribimos', s: 'Nosotros ___ en Valencia. (vivir)', tr: 'Ми живемо у Валенсії.', extra: [cross('vivir', 3)] });
vgap(k, { n: 19, role: 'supported', fam: 'a104.home', t: [IRP], verb: 'abrir', person: 4, model: 'vivir → vosotros vivís (зі знаком наголосу)', s: '¿Vosotros ___ la ventana? (abrir)', tr: 'Ви відчиняєте вікно?', extra: [cross('abrir', 4)] });
vgap(k, { n: 20, role: 'independent', fam: 'a104.city', t: [IRS], verb: 'vivir', person: 1, s: '¿Dónde ___ tú? (vivir)', tr: 'Де ти живеш?' });
vgap(k, { n: 21, role: 'independent', fam: 'a104.study', t: [IRS], verb: 'abrir', person: 2, s: 'Mi profesora ___ la puerta. (abrir)', tr: 'Моя викладачка відчиняє двері.' });
vgap(k, { n: 22, role: 'independent', fam: 'a104.city', t: [IRP], verb: 'vivir', person: 5, s: 'Mis padres ___ en una ciudad pequeña. (vivir)', tr: 'Мої батьки живуть у маленькому місті.' });
vgap(k, { n: 23, role: 'independent', fam: 'a104.study', t: [IRP], verb: 'recibir', person: 5, s: '¿Ustedes ___ mensajes en el móvil? (recibir)', tr: 'Ви (кілька людей, ввічливо) отримуєте повідомлення на мобільний?' });
k.slots({
  n: 24,
  role: 'independent',
  fam: 'a104.study',
  t: [IRS, IRP],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслова escribir.',
  p: ['Yo ___ en español y mis amigos ___ en inglés. (escribir)'],
  tpl: ['Yo ', S('s1'), ' en español y mis amigos ', S('s2'), ' en inglés.'],
  slots: [slot('s1', IRS, 'escribir', 0), slot('s2', IRP, 'escribir', 5)],
  tr: 'Я пишу іспанською, а мої друзі пишуть англійською.',
});
k.slots({
  n: 25,
  role: 'independent',
  fam: 'a104.home',
  t: [IRS, IRP],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслова abrir.',
  p: ['Tú ___ la ventana y nosotros ___ la puerta. (abrir)'],
  tpl: ['Tú ', S('s1'), ' la ventana y nosotros ', S('s2'), ' la puerta.'],
  slots: [slot('s1', IRS, 'abrir', 1), slot('s2', IRP, 'abrir', 3)],
  tr: 'Ти відчиняєш вікно, а ми відчиняємо двері.',
});
vgap(k, { n: 26, role: 'delayed', fam: 'a104.city', t: [IRS], verb: 'vivir', person: 2, s: '¿Usted ___ en Valencia? (vivir)', tr: 'Ви живете у Валенсії?' });
vgap(k, { n: 27, role: 'delayed', fam: 'a104.study', t: [IRP], verb: 'recibir', person: 4, s: 'Vosotras ___ un mensaje. (recibir)', tr: 'Ви отримуєте повідомлення.', extra: [cross('recibir', 4)] });
k.slots({
  n: 28,
  role: 'delayed',
  fam: 'a104.city',
  t: [IRS, IRP],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслова vivir.',
  p: ['Mi hermano ___ en Madrid y mis padres ___ en Sevilla. (vivir)'],
  tpl: ['Mi hermano ', S('s1'), ' en Madrid y mis padres ', S('s2'), ' en Sevilla.'],
  slots: [slot('s1', IRS, 'vivir', 2), slot('s2', IRP, 'vivir', 5)],
  tr: 'Мій брат живе в Мадриді, а мої батьки живуть у Севільї.',
});
k.slots({
  n: 29,
  role: 'transfer',
  fam: 'a104.office',
  t: [IRS, IRP],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслова escribir.',
  p: ['En la oficina, yo ___ un mensaje y vosotros ___ un correo electrónico. (escribir)'],
  tpl: ['En la oficina, yo ', S('s1'), ' un mensaje y vosotros ', S('s2'), ' un correo electrónico.'],
  slots: [slot('s1', IRS, 'escribir', 0), slot('s2', IRP, 'escribir', 4)],
  tr: 'В офісі я пишу повідомлення, а ви пишете електронного листа.',
});
k.slots({
  n: 30,
  role: 'transfer',
  fam: 'a104.hotel',
  t: [IRS, IRP],
  ins: 'Перепиши речення повністю, вставивши правильні форми дієслова recibir.',
  p: ['En el hotel, Ana ___ la llave y sus amigos ___ un mapa de la ciudad. (recibir)'],
  tpl: ['En el hotel, Ana ', S('s1'), ' la llave y sus amigos ', S('s2'), ' un mapa de la ciudad.'],
  slots: [slot('s1', IRS, 'recibir', 2), slot('s2', IRP, 'recibir', 5)],
  tr: 'У готелі Ана отримує ключ, а її друзі — мапу міста.',
});

// ======================= Step 3: -er vs -ir (nosotros / vosotros)
const model = 'comer → comemos, coméis; vivir → vivimos, vivís';
const cslot = (id: string, verb: string, p: 3 | 4): SlotSpec => ({ id, t: CW, acc: [form(verb, p)], err: [cross(verb, p), ...verbErrors(verb, p)] });
k.slots({
  n: 31,
  role: 'supported',
  fam: 'a104.home',
  t: [CW],
  ins: `Перепиши речення повністю з правильними формами дієслів у дужках. Зразок: ${model}.`,
  p: ['Nosotros ___ en Madrid y ___ en casa. (vivir, comer)'],
  tpl: ['Nosotros ', S('s1'), ' en Madrid y ', S('s2'), ' en casa.'],
  slots: [cslot('s1', 'vivir', 3), cslot('s2', 'comer', 3)],
  tr: 'Ми живемо в Мадриді й обідаємо вдома.',
});
k.slots({
  n: 32,
  role: 'supported',
  fam: 'a104.study',
  t: [CW],
  ins: `Перепиши речення повністю з правильними формами дієслів у дужках. Зразок: ${model}.`,
  p: ['Vosotros ___ un libro y ___ un mensaje. (leer, escribir)'],
  tpl: ['Vosotros ', S('s1'), ' un libro y ', S('s2'), ' un mensaje.'],
  slots: [cslot('s1', 'leer', 4), cslot('s2', 'escribir', 4)],
  tr: 'Ви читаєте книжку й пишете повідомлення.',
});
const cgap = (n: number, role: 'independent' | 'delayed', fam: string, verb: string, p: 3 | 4, s: string, tr: string): string =>
  vgap(k, { n, role, fam, t: [CW], verb, person: p, s, tr, extra: [cross(verb, p)] });
cgap(33, 'independent', 'a104.study', 'escribir', 3, 'Nosotros ___ en español. (escribir)', 'Ми пишемо іспанською.');
cgap(34, 'independent', 'a104.food', 'beber', 4, '¿Vosotros ___ leche? (beber)', 'Ви п’єте молоко?');
cgap(35, 'independent', 'a104.home', 'abrir', 3, 'Nosotros ___ la ventana. (abrir)', 'Ми відчиняємо вікно.');
k.slots({
  n: 36,
  role: 'independent',
  fam: 'a104.city',
  t: [CW],
  ins: 'Перепиши речення повністю з правильними формами дієслів у дужках.',
  p: ['¿Vosotros ___ en Madrid y ___ español? (vivir, aprender)'],
  tpl: ['¿Vosotros ', S('s1'), ' en Madrid y ', S('s2'), ' español?'],
  slots: [cslot('s1', 'vivir', 4), cslot('s2', 'aprender', 4)],
  tr: 'Ви живете в Мадриді й вивчаєте іспанську?',
});
cgap(37, 'delayed', 'a104.study', 'recibir', 3, 'Nosotros ___ mensajes. (recibir)', 'Ми отримуємо повідомлення.');
cgap(38, 'delayed', 'a104.leisure', 'correr', 4, '¿Vosotros ___ en el parque? (correr)', 'Ви бігаєте в парку?');
k.slots({
  n: 39,
  role: 'transfer',
  fam: 'a104.family',
  t: [CW],
  ins: 'Перепиши речення повністю з правильними формами дієслів у дужках.',
  p: ['Mi hermana y yo ___ en una ciudad pequeña y ___ en un restaurante. (vivir, comer)'],
  tpl: ['Mi hermana y yo ', S('s1'), ' en una ciudad pequeña y ', S('s2'), ' en un restaurante.'],
  slots: [cslot('s1', 'vivir', 3), cslot('s2', 'comer', 3)],
  tr: 'Ми з сестрою живемо в маленькому місті й обідаємо в ресторані.',
});
k.slots({
  n: 40,
  role: 'transfer',
  fam: 'a104.office',
  t: [CW],
  ins: 'Перепиши речення повністю з правильними формами дієслів у дужках.',
  p: ['Vosotros ___ un correo electrónico y ___ el periódico. (escribir, leer)'],
  tpl: ['Vosotros ', S('s1'), ' un correo electrónico y ', S('s2'), ' el periódico.'],
  slots: [cslot('s1', 'escribir', 4), cslot('s2', 'leer', 4)],
  tr: 'Ви пишете електронного листа й читаєте газету.',
});

// ======================= context-choice
k.choice({
  n: 41,
  role: 'independent',
  fam: 'a104.home',
  t: [ERSC],
  ins: 'Обери форму, яка підходить до підмета.',
  p: ['Mi hermana ___ el periódico.'],
  o: [
    ['lees', ERSC, '«Lees» — форма для tú. «Mi hermana» — це ella.'],
    ['lee', true],
    ['leo', ERSC, '«Leo» — форма для yo.'],
  ],
  tr: 'Моя сестра читає газету.',
});
k.choice({
  n: 42,
  role: 'independent',
  fam: 'a104.food',
  t: [ERPC],
  ins: 'Обери форму, яка підходить до підмета.',
  p: ['Ana y Pablo ___ en casa.'],
  o: [
    ['comemos', ERPC, '«Comemos» — форма для nosotros. «Ana y Pablo» — це ellos.'],
    ['comen', true],
    ['coméis', ERPC, '«Coméis» — форма для vosotros. «Ana y Pablo» — це ellos.'],
  ],
  tr: 'Ана й Пабло обідають удома.',
});
k.choice({
  n: 43,
  role: 'independent',
  fam: 'a104.city',
  t: [IRSC],
  ins: 'Обери форму, яка підходить до підмета.',
  p: ['¿Dónde ___ usted?'],
  o: [
    ['vives', IRSC, '«Vives» — форма для tú. Usted уживає форму 3-ї особи, як él / ella.'],
    ['vivo', IRSC, '«Vivo» — форма для yo.'],
    ['vive', true],
  ],
  tr: 'Де Ви живете?',
});
k.choice({
  n: 44,
  role: 'independent',
  fam: 'a104.city',
  t: [IRPC],
  ins: 'Обери форму, яка підходить до підмета.',
  p: ['Ana y yo ___ en Madrid.'],
  o: [
    ['vivimos', true],
    ['viven', IRPC, '«Viven» — форма для ellos / ellas / ustedes. «Ana y yo» — це nosotros.'],
    ['vivís', IRPC, '«Vivís» — форма для vosotros. «Ana y yo» — це nosotros.'],
  ],
  tr: 'Ми з Аною живемо в Мадриді.',
});
k.choice({
  n: 45,
  role: 'independent',
  fam: 'a104.study',
  t: [CC],
  ins: 'Обери правильну форму дієслова escribir для nosotros.',
  p: ['Nosotros ___ un mensaje.'],
  o: [
    ['escribemos', CC, 'Escribir закінчується на -ir, тож для nosotros потрібне -imos.'],
    ['escribimos', true],
  ],
  tr: 'Ми пишемо повідомлення.',
});
k.choice({
  n: 46,
  role: 'independent',
  fam: 'a104.food',
  t: [CC],
  ins: 'Обери правильну форму дієслова beber для vosotros.',
  p: ['¿Vosotros ___ agua?'],
  o: [
    ['bebéis', true],
    ['bebís', CC, 'Beber закінчується на -er, тож для vosotros потрібне -éis.'],
  ],
  tr: 'Ви п’єте воду?',
});
k.choice({
  n: 47,
  role: 'delayed',
  fam: 'a104.city',
  t: [CC],
  ins: 'Обери правильну форму дієслова vivir для nosotros.',
  p: ['Nosotros ___ en Valencia.'],
  o: [
    ['vivemos', CC, 'Vivir закінчується на -ir, тож для nosotros потрібне -imos.'],
    ['vivimos', true],
  ],
  tr: 'Ми живемо у Валенсії.',
});

// ======================= listening (extra clip for listening.daily-actions)
const c3 = k.clip({
  id: 'clip.a1-04.daily-actions.hermana',
  kind: 'sentence',
  es: 'Mi hermana vive en Madrid y escribe en español.',
  uk: 'Моя сестра живе в Мадриді й пише іспанською.',
  t: [LM],
  fam: 'a104.l2.sister',
});
k.choice({
  n: 48,
  role: 'independent',
  fam: 'a104.l2.sister',
  t: [LM],
  clips: [c3],
  ins: 'Послухай запис. Що ти дізнаєшся про сестру?',
  o: [
    ['Живе у Валенсії й читає іспанською.', false],
    ['Живе в Мадриді й пише іспанською.', true],
    ['Живе в Мадриді й вивчає англійську.', false],
  ],
  hints: [hTr('Слова: vive — «живе», escribe — «пише» (форми él / ella дієслів vivir, escribir; див. крок про -ir).'), hTranscript([LM], 'Mi hermana vive en Madrid y escribe en español.')],
});

k.material({
  id: 'material.a1-04.present-er-ir',
  topic: 'A1-04-L2',
  title: 'Теперішній час дієслів на -er і -ir',
  blocks: [
    uk('Дієслова на -er і -ir мають однакові закінчення в усіх особах, крім nosotros і vosotros.'),
    tableEs(
      ['persona', 'comer (-er)', 'vivir (-ir)'],
      [
        ['yo', 'como', 'vivo'],
        ['tú', 'comes', 'vives'],
        ['él / ella / usted', 'come', 'vive'],
        ['nosotros / nosotras', 'comemos', 'vivimos'],
        ['vosotros / vosotras', 'coméis', 'vivís'],
        ['ellos / ellas / ustedes', 'comen', 'viven'],
      ],
    ),
    plink('Потренувати -er та -ir', [ERS, ERP, IRS, IRP, CW], 'written', 10),
  ],
  linked: [ERS, ERP, IRS, IRP, CW, CC],
});

export default k.build({
  title: 'Дієслова на -er і -ir: два кроки й порівняння',
  termEs: 'presente de los verbos regulares en -er y en -ir',
  summary: 'Спершу вчимо форми дієслів на -er, потім на -ir, а наприкінці порівнюємо дві форми, де вони відрізняються: nosotros і vosotros.',
  objectives: ['A1-04-O2', 'A1-04-O3'],
  situations: ['routine-study-leisure'],
  minutes: 20,
  introduces: ['present.regular-er', 'present.regular-er.plural', 'present.regular-ir', 'present.regular-ir.plural', 'contrast.er-ir-endings'],
  revisits: ['present.regular-ar', 'present.regular-ar.plural', 'pron.person-mapping', 'question.word.donde', 'poss.mi-tu-su', 'poss.nuestro-vuestro', 'prep.de.possession', 'question.yes-no'],
  steps: [
    {
      kind: 'explanation',
      title: 'Крок 1. Дієслова на -er',
      blocks: [
        uk('Дієслова на -er утворюють форми так само, як -ar: відкинь -er і додай закінчення. Але в більшості закінчень тут голосна -e-: comes, come, comemos; форма yo, як і в -ar, закінчується на -o: como.'),
        tableEs(
          ['persona', 'comer', 'beber', 'leer'],
          [
            ['yo', 'como', 'bebo', 'leo'],
            ['tú', 'comes', 'bebes', 'lees'],
            ['él / ella / usted', 'come', 'bebe', 'lee'],
            ['nosotros / nosotras', 'comemos', 'bebemos', 'leemos'],
            ['vosotros / vosotras', 'coméis', 'bebéis', 'leéis'],
            ['ellos / ellas / ustedes', 'comen', 'beben', 'leen'],
          ],
        ),
        uk('Порівняй з -ar: hablas — comes, habla — come, hablan — comen. Форма vosotros знову має знак наголосу: coméis.'),
        uk('В Іспанії comer означає також «обідати»: ¿Comes en casa? — «Ти обідаєш удома?»'),
        ex('Como fruta.', 'Я їм фрукти.'),
        ex('¿Bebes café?', 'Ти п’єш каву?'),
        ex('Mis padres leen el periódico.', 'Мої батьки читають газету.'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 1: практика зі зразком', tasks: [k.id(1), k.id(2), k.id(3), k.id(4)] },
    { kind: 'independent-practice', title: 'Крок 1: самостійна практика', tasks: [k.id(41), k.id(5), k.id(6), k.id(7), k.id(8)] },
    {
      kind: 'explanation',
      title: 'Крок 2. Дієслова на -ir',
      blocks: [
        uk('Дієслова на -ir в однині та у формі ellos мають ті самі закінчення, що й -er: vivo, vives, vive, viven. Інакше пишуться лише форми nosotros і vosotros: vivimos, vivís.'),
        tableEs(
          ['persona', 'vivir', 'escribir', 'abrir'],
          [
            ['yo', 'vivo', 'escribo', 'abro'],
            ['tú', 'vives', 'escribes', 'abres'],
            ['él / ella / usted', 'vive', 'escribe', 'abre'],
            ['nosotros / nosotras', 'vivimos', 'escribimos', 'abrimos'],
            ['vosotros / vosotras', 'vivís', 'escribís', 'abrís'],
            ['ellos / ellas / ustedes', 'viven', 'escriben', 'abren'],
          ],
        ),
        ex('Vivo en Madrid.', 'Я живу в Мадриді.'),
        ex('Ana escribe un mensaje.', 'Ана пише повідомлення.'),
        ex('¿Abrís la ventana?', 'Ви відчиняєте вікно?'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 2: практика зі зразком', tasks: [k.id(16), k.id(17), k.id(18), k.id(19)] },
    { kind: 'independent-practice', title: 'Крок 2: самостійна практика', tasks: [k.id(43), k.id(20), k.id(21), k.id(22), k.id(23)] },
    {
      kind: 'explanation',
      title: 'Крок 3. -er чи -ir: nosotros і vosotros',
      blocks: [
        uk('Голосна інфінітива підказує закінчення форм nosotros і vosotros: comer → comemos, coméis; vivir → vivimos, vivís. В усіх інших особах закінчення однакові.'),
        tableEs(
          ['persona', 'comer (-er)', 'vivir (-ir)'],
          [
            ['nosotros / nosotras', 'comemos', 'vivimos'],
            ['vosotros / vosotras', 'coméis', 'vivís'],
          ],
        ),
        ex('Comemos en casa y vivimos en Madrid.', 'Ми обідаємо вдома й живемо в Мадриді.'),
        ex('Leéis el periódico y escribís mensajes.', 'Ви читаєте газету й пишете повідомлення.'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 3: практика зі зразком', tasks: [k.id(31), k.id(32)] },
    { kind: 'independent-practice', title: 'Крок 3: самостійна практика', tasks: [k.id(45), k.id(33), k.id(34), k.id(35), k.id(36)] },
    {
      kind: 'independent-practice',
      title: 'Додаткова практика: усе разом',
      required: false,
      tasks: [k.id(42), k.id(44), k.id(46), k.id(9), k.id(10), k.id(24), k.id(25)],
    },
    { kind: 'listening', title: 'Послухай: хто що робить', required: false, clips: [c3], tasks: [k.id(48)] },
    {
      kind: 'summary',
      title: 'Підсумок',
      blocks: [
        ul(
          '-er: como, comes, come, comemos, coméis, comen.',
          '-ir: vivo, vives, vive, vivimos, vivís, viven.',
          'Різниця між -er і -ir — лише nosotros (-emos / -imos) і vosotros (-éis / -ís).',
          'Форма vosotros завжди має знак наголосу: coméis, vivís.',
        ),
      ],
    },
  ],
});
