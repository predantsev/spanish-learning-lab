// A1-05-L2 — prices and amounts: understanding a price, saying it, asking for it; shop and café
// formulas (CV-01) and synthetic price labels / menus (CV-06).
import { Kit, S, el, es, ex, hTranscript, plink, ul, uk, DICTATION } from '../lib.ts';
import type { TaskRole } from '../../../content/types.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-05-L2', RULES);

const PCR = 'price.amount-comprehension/reading-meaning';
const PCC = 'price.amount-comprehension/context-choice';
const PW = 'price.amount-wording/written-form';
const PWC = 'price.amount-wording/context-choice';
const PAU = 'price.ask-answer/construction-use';
const PAW = 'price.ask-answer/written-form';
const PAC = 'price.ask-answer/context-choice';
const FSP = 'formula.shop/phrase-recall';
const FSR = 'formula.shop/reading-meaning';
const FSL = 'formula.shop/listening-meaning';
const FSD = 'formula.shop/dictation';
const RL = 'reading.price-label/reading-meaning';
const LA = 'listening.amounts/listening-meaning';

/** Reviewed spoken variants of a price: «tres euros con cincuenta (céntimos)», «tres euros cincuenta», «tres cincuenta». */
function price(euros: string, cents?: string): string[] {
  if (!cents) return [euros];
  const num = euros.replace(/ euros?$/, '');
  const short = num === 'un' ? 'uno' : num;
  return [`${euros} con ${cents}`, `${euros} con ${cents} céntimos`, `${euros} ${cents}`, `${short} ${cents}`];
}
const digitsErr = (digits: string): [string, string, Record<string, 'unresolved'>] => [
  digits,
  'Цифри тут не зараховуються: це завдання саме на запис ціни словами.',
  { [PW]: 'unresolved' },
];
function pw(n: number, role: TaskRole, fam: string, label: string, acc: string[], extra: Array<[string, string]> = [], model?: string, tr?: string): string {
  const digits = label.replace(/\s*€$/, '');
  return k.exact({
    n,
    role,
    fam,
    t: [PW],
    ins: `Напиши ціну словами так, як її кажуть: ${label}${model ? `. Зразок: ${model}` : ''}.`,
    acc,
    err: [digitsErr(digits), ...extra],
    ...(tr ? { tr } : {}),
  });
}

// ======================= saying a price
pw(1, 'supported', 'a105.shop-price', '3,50 €', price('tres euros', 'cincuenta'), [['tres euro con cincuenta', 'Після числа більше за один — euros.']], '2,50 € → dos euros con cincuenta');
pw(2, 'supported', 'a105.shop-price', '1 €', ['un euro'], [['uno euro', 'Перед іменником uno скорочується: un euro.'], ['una euro', 'Euro — чоловічого роду: un euro.']], '2 € → dos euros');
pw(3, 'independent', 'a105.shop-price', '12,99 €', price('doce euros', 'noventa y nueve'));
pw(4, 'independent', 'a105.shop-price', '0,80 €', ['ochenta céntimos'], [['ochenta euros', 'Euros — це цілі євро. Менше за євро — céntimos.']]);
pw(5, 'independent', 'a105.shop-price', '21 €', ['veintiún euros'], [['veintiuno euros', 'Перед іменником veintiuno скорочується: veintiún euros.'], ['veintiun euros', 'Майже: veintiún пишеться зі знаком наголосу.']]);
k.slots({
  n: 6,
  role: 'independent',
  fam: 'a105.cafe-price',
  t: [PW],
  ins: 'Перепиши речення повністю, записавши ціни словами.',
  p: ['El café cuesta ___ y el zumo ___. (1,20 €; 2,50 €)'],
  tpl: ['El café cuesta ', S('s1'), ' y el zumo ', S('s2'), '.'],
  slots: [
    { id: 's1', t: PW, acc: price('un euro', 'veinte'), err: [['uno euro con veinte', 'Перед іменником uno скорочується: un euro.']] },
    { id: 's2', t: PW, acc: price('dos euros', 'cincuenta'), err: [['dos euro con cincuenta', 'Після числа більше за один — euros.']] },
  ],
  tr: 'Кава коштує 1,20 €, а сік — 2,50 €.',
});
pw(7, 'delayed', 'a105.shop-price', '4,75 €', price('cuatro euros', 'setenta y cinco'));
pw(8, 'delayed', 'a105.shop-price', '15 €', ['quince euros'], [['quince euro', 'Після числа більше за один — euros.']]);
k.exact({ n: 9, role: 'transfer', fam: 'a105.bar-board', t: [PW], ins: 'Ти читаєш другові вголос дошку в барі. Напиши словами ціну кави з молоком так, як її кажуть.', p: ['Café con leche 1,80 €'], acc: price('un euro', 'ochenta'), err: [digitsErr('1,80')] });
k.exact({ n: 10, role: 'transfer', fam: 'a105.menu-board', t: [PW], ins: 'Біля ресторану стоїть табличка. Напиши словами, скільки коштує комплексний обід.', p: ['Menú del día 12 €'], acc: ['doce euros'], err: [digitsErr('12')] });
k.choice({
  n: 11,
  role: 'independent',
  fam: 'a105.shop-price',
  t: [PWC],
  ins: 'Як правильно сказати ціну 1 €?',
  o: [
    ['uno euro', PWC, 'Перед іменником uno скорочується: un euro.'],
    ['un euro', true],
    ['una euro', PWC, 'Euro — чоловічого роду: un euro.'],
  ],
});

// ======================= understanding a price
k.choice({ n: 12, role: 'independent', fam: 'a105.bar-board', t: [PCR], ins: 'Прочитай цінник. Скільки коштує кава з молоком?', p: ['Café con leche 1,80 €'], o: [['18 євро.', false], ['1 євро 80 центів.', true], ['80 центів.', false]] });
k.choice({ n: 13, role: 'supported', fam: 'a105.shop-price', t: [PCC], ins: 'На іспанських цінниках десяткову частину відокремлює кома. Що означає кома в записі «3,50 €»?', o: [['Відокремлює центи: 3 євро 50 центів.', true], ['Відокремлює тисячі: 3500 євро.', false]] });
k.choice({ n: 14, role: 'delayed', fam: 'a105.bike-shop', t: [PCR], ins: 'Прочитай цінник велосипеда. Скільки він коштує?', p: ['Bicicleta: 1.200 €'], o: [['1,2 євро.', false], ['120 євро.', false], ['Тисяча двісті євро.', true]] });

// ======================= asking for a price and answering
const qPrice = (thing: string): string[] => [`¿Cuánto cuesta ${thing}?`, `¿Cuánto vale ${thing}?`, `¿Qué precio tiene ${thing}?`];
const qPrices = (thing: string): string[] => [`¿Cuánto cuestan ${thing}?`, `¿Cuánto valen ${thing}?`, `¿Qué precio tienen ${thing}?`];
k.exact({
  n: 15,
  role: 'supported',
  fam: 'a105.bakery',
  t: [PAU],
  ins: 'Запитай іспанською, скільки коштує хліб. Зразок: ¿Cuánto cuesta el café?',
  acc: qPrice('el pan'),
  err: [['¿Cuánto cuestan el pan?', 'Pan — одна річ: cuesta.']],
});
k.exact({
  n: 16,
  role: 'supported',
  fam: 'a105.fruit',
  t: [PAW],
  ins: 'Впиши форму дієслова costar. Зразок: ¿Cuánto cuesta el pan?',
  p: ['¿Cuánto ___ los tomates?'],
  acc: ['cuestan'],
  err: [
    ['cuesta', 'Tomates — кілька речей: cuestan.'],
    ['costan', 'У формі cuestan основа змінюється: o → ue.'],
  ],
  tr: 'Скільки коштують помідори?',
});
k.exact({
  n: 17,
  role: 'independent',
  fam: 'a105.fruit',
  t: [PAU],
  ins: 'Запитай іспанською, скільки коштують яблука.',
  acc: qPrices('las manzanas'),
  err: [['¿Cuánto cuesta las manzanas?', 'Manzanas — кілька речей: cuestan.']],
});
k.exact({
  n: 18,
  role: 'independent',
  fam: 'a105.bar-pay',
  t: [PAU],
  ins: 'У кав’ярні ти хочеш дізнатися загальну суму. Запитай іспанською: «Скільки з мене?»',
  acc: ['¿Cuánto es?'],
});
k.exact({
  n: 19,
  role: 'independent',
  fam: 'a105.dairy',
  t: [PAW],
  ins: 'Впиши форму дієслова costar.',
  p: ['La leche ___ un euro.'],
  acc: ['cuesta'],
  err: [['cuestan', 'Leche — одна річ: cuesta.'], ['costa', 'У формі cuesta основа змінюється: o → ue.']],
  tr: 'Молоко коштує один євро.',
});
k.exact({
  n: 20,
  role: 'independent',
  fam: 'a105.fruit',
  t: [PAU],
  ins: 'Ти продавець. Відповідай покупцеві іспанською: помідори коштують три євро за кілограм.',
  acc: ['Cuestan tres euros el kilo.', 'Los tomates cuestan tres euros el kilo.'],
  err: [['Cuesta tres euros el kilo.', 'Tomates — множина: cuestan.']],
});
k.exact({ n: 21, role: 'delayed', fam: 'a105.deli', t: [PAU], ins: 'Запитай іспанською, скільки коштує сир.', acc: qPrice('el queso'), err: [['¿Cuánto cuestan el queso?', 'Queso — одна річ: cuesta.']] });
k.slots({
  n: 22,
  role: 'delayed',
  fam: 'a105.fruit',
  t: [PAW],
  ins: 'Перепиши речення повністю, вставивши форму дієслова costar.',
  p: ['Las patatas ___ dos euros el kilo.'],
  tpl: ['Las patatas ', S('s1'), ' dos euros el kilo.'],
  slots: [{ id: 's1', t: PAW, acc: ['cuestan'], err: [['cuesta', 'Patatas — множина: cuestan.']] }],
  tr: 'Картопля коштує два євро за кілограм.',
});
k.exact({
  n: 23,
  role: 'transfer',
  fam: 'a105.cashier',
  t: [PAU],
  ins: 'Ти касир. Скажи покупцеві іспанською: «Разом п’ять євро».',
  acc: ['Son cinco euros.'],
  err: [['Es cinco euros.', 'Про суму в кілька євро кажемо son: Son cinco euros.']],
});
k.exact({ n: 24, role: 'transfer', fam: 'a105.juice-bar', t: [PAU], ins: 'Запитай іспанською, скільки коштує сік.', acc: qPrice('el zumo'), err: [['¿Cuánto cuestan el zumo?', 'Zumo — одна річ: cuesta.']] });
k.choice({
  n: 25,
  role: 'independent',
  fam: 'a105.fruit',
  t: [PAC],
  ins: 'Обери форму дієслова.',
  p: ['¿Cuánto ___ las manzanas?'],
  o: [
    ['cuesta', PAC, 'Manzanas — кілька речей: cuestan.'],
    ['cuestan', true],
  ],
  tr: 'Скільки коштують яблука?',
});
k.choice({
  n: 26,
  role: 'delayed',
  fam: 'a105.bar-pay',
  t: [PAC],
  ins: 'Ти поїв у кафе й хочеш дізнатися загальну суму. Що скажеш?',
  o: [
    ['¿Cuánto cuesta el pan?', PAC, 'Це питання про ціну хліба, а не про загальну суму.'],
    ['¿Cuántos años tienes?', PAC, 'Це питання про вік.'],
    ['¿Cuánto es?', true],
  ],
});

// ======================= shop and café formulas (CV-01)
k.exact({ n: 27, role: 'supported', fam: 'a105.cafe', t: [FSP], ins: 'Скажи іспанською в кафе: «Рахунок, будь ласка». Зразок: Un café, por favor.', acc: ['La cuenta, por favor.'] });
k.exact({ n: 28, role: 'independent', fam: 'a105.market-stall', t: [FSP], ins: 'Продавець питає: «¿Algo más?». Відповідай іспанською: «Більше нічого, дякую».', acc: ['Nada más, gracias.', 'No, nada más, gracias.'] });
k.exact({
  n: 29,
  role: 'independent',
  fam: 'a105.cafe',
  t: [FSP],
  ins: 'Попроси в барі каву ввічливо — так, як зазвичай кажуть в Іспанії.',
  acc: ['¿Me pone un café, por favor?', 'Un café, por favor.', '¿Me da un café, por favor?'],
  err: [['Un café.', 'Без por favor фраза граматично правильна, але завдання саме на ввічливе прохання: додай por favor.', { [FSP]: 'unresolved' }]],
});
k.exact({ n: 30, role: 'delayed', fam: 'a105.market-stall', t: [FSP], ins: 'Ти продавець. Запитай іспанською покупця: «Що бажаєте?»', acc: ['¿Qué desea?', '¿Qué le pongo?'] });
k.exact({
  n: 31,
  role: 'transfer',
  fam: 'a105.pay-card',
  t: [FSP],
  ins: 'Касир питає: «¿En efectivo o con tarjeta?». Ти платиш карткою. Відповідай ввічливо.',
  acc: ['Con tarjeta, por favor.'],
  err: [['Con tarjeta.', 'Граматично правильно, але завдання саме на ввічливу відповідь: додай por favor.', { [FSP]: 'unresolved' }]],
});
k.exact({ n: 32, role: 'delayed', fam: 'a105.cafe', t: [FSP], ins: 'Ти подаєш покупцеві решту. Скажи іспанською: «Ось, будь ласка».', acc: ['Aquí tiene.'] });
k.choice({ n: 33, role: 'independent', fam: 'a105.market-stall', t: [FSR], ins: 'Що означає фраза продавця?', p: ['¿Algo más?'], o: [['Скільки це коштує?', false], ['Щось іще?', true], ['Готівкою чи карткою?', false]] });
k.choice({ n: 34, role: 'supported', fam: 'a105.cafe', t: [FSR], ins: 'Офіціант ставить на стіл каву й каже: «Aquí tiene». Що це означає?', o: [['Ось, будь ласка.', true], ['Тут зайнято.', false], ['Рахунок, будь ласка.', false]] });
k.choice({ n: 35, role: 'delayed', fam: 'a105.pay-card', t: [FSR], ins: 'Про що питає касир?', p: ['¿En efectivo o con tarjeta?'], o: [['Чи потрібен пакет.', false], ['Скільки товару ти береш.', false], ['Як ти платитимеш: готівкою чи карткою.', true]] });

// ======================= listening: shop formulas and an amount
const SH1 = 'Buenos días. ¿Qué le pongo?';
const SH2 = 'Un kilo de tomates y una barra de pan, por favor.';
const SH3 = 'Son cinco euros. ¿En efectivo o con tarjeta?';
const s1 = k.clip({ id: 'clip.a1-05.shop.que-le-pongo', kind: 'dialogue-line', es: SH1, uk: 'Добрий день. Що вам дати?', t: [FSL], fam: 'a105.l-shop-greet' });
const s2 = k.clip({ id: 'clip.a1-05.shop.pedido', kind: 'dialogue-line', es: SH2, uk: 'Кілограм помідорів і батон, будь ласка.', t: [FSL], fam: 'a105.l-shop-order' });
const s3 = k.clip({ id: 'clip.a1-05.shop.pago', kind: 'dialogue-line', es: SH3, uk: 'З вас п’ять євро. Готівкою чи карткою?', t: [FSL, FSD, LA], fam: 'a105.l-shop-pay' });
k.choice({ n: 36, role: 'independent', fam: 'a105.l-shop-greet', t: [FSL], clips: [s1], ins: 'Послухай продавця. Що він питає?', o: [['Що вам дати?', true], ['Скільки вам років?', false], ['Готівкою чи карткою?', false]], hints: [hTranscript([FSL], SH1)] });
k.choice({ n: 37, role: 'independent', fam: 'a105.l-shop-order', t: [FSL], clips: [s2], ins: 'Послухай покупця. Що він просить?', o: [['Пляшку води й батон.', false], ['Кілограм помідорів і батон.', true], ['Два кілограми помідорів.', false]], hints: [hTranscript([FSL], SH2)] });
k.choice({ n: 38, role: 'independent', fam: 'a105.l-shop-pay', t: [FSL], clips: [s3], ins: 'Послухай касира. Про що він питає наприкінці?', o: [['Чи потрібно ще щось.', false], ['Як ти платитимеш: готівкою чи карткою.', true], ['Чи є в тебе пакет.', false]], hints: [hTranscript([FSL], SH3)] });
k.choice({ n: 39, role: 'independent', fam: 'a105.l-shop-pay', t: [LA], clips: [s3], ins: 'Послухай касира. Скільки треба заплатити?', o: [['15 €.', false], ['5 €.', true], ['50 €.', false]], hints: [hTranscript([LA], SH3)] });
k.exact({
  n: 40,
  role: 'independent',
  fam: 'a105.l-shop-pay',
  t: [FSD],
  clips: [s3],
  ins: 'Необов’язковий диктант: послухай і запиши, що каже касир. Великі літери й знаки в кінці речень не оцінюються.',
  acc: ['Son cinco euros. ¿En efectivo o con tarjeta?', 'Son 5 euros. ¿En efectivo o con tarjeta?'],
  pol: DICTATION,
});

// ======================= reading: price labels and menus (CV-06)
const LABEL_1 = 'Tomates 2,30 €/kg · Patatas 1,20 €/kg · Manzanas 1,95 €/kg · Oferta: 2 x 1 en zumos';
const LABEL_2 = 'BAR SOL — Café 1,30 € · Café con leche 1,60 € · Té 1,40 € · Zumo 2,50 € · Caña 2 €';
const LABEL_3 = 'MENÚ DEL DÍA 12,50 € · Café 1 €';
const LABEL_4 = 'Leche 0,95 € · Pan 1,10 € · Huevos (docena) 2,40 €';
const rl = (n: number, role: TaskRole, fam: string, text: string, q: string, o: Array<[string, boolean]>): string => k.choice({ n, role, fam, t: [RL], ins: `Прочитай. ${q}`, p: [text], o });
rl(41, 'independent', 'a105.label-fruit', LABEL_1, 'Скільки коштує кілограм картоплі?', [['1,95 €.', false], ['1,20 €.', true], ['2,30 €.', false]]);
rl(42, 'independent', 'a105.label-fruit', LABEL_1, 'На що діє акція «2 x 1» (два за ціною одного)?', [['На соки.', true], ['На помідори.', false], ['На яблука.', false]]);
rl(43, 'independent', 'a105.label-bar', LABEL_2, 'Скільки коштує чай?', [['1,30 €.', false], ['2,50 €.', false], ['1,40 €.', true]]);
rl(44, 'independent', 'a105.label-bar', LABEL_2, 'Що в цьому барі найдешевше?', [['Кава.', true], ['Келих пива (caña).', false], ['Сік.', false]]);
rl(45, 'independent', 'a105.label-menu', LABEL_3, 'Скільки коштує комплексний обід (menú del día)?', [['12,50 €.', true], ['1 €.', false], ['15 €.', false]]);
rl(46, 'independent', 'a105.label-menu', LABEL_3, 'Скільки коштує кава окремо?', [['12,50 €.', false], ['Один євро.', true], ['Вона безкоштовна.', false]]);
rl(47, 'delayed', 'a105.label-super', LABEL_4, 'Скільки коштує десяток яєць?', [['0,95 €.', false], ['1,10 €.', false], ['2,40 €.', true]]);
rl(48, 'delayed', 'a105.label-super', LABEL_4, 'Що коштує менше за один євро?', [['Молоко.', true], ['Хліб.', false], ['Яйця.', false]]);

k.material({
  id: 'material.a1-05.prices-shop',
  topic: 'A1-05-L2',
  title: 'Ціни та фрази в магазині',
  blocks: [
    el(
      '3,50 € — tres euros con cincuenta / tres euros cincuenta / tres cincuenta.',
      '0,80 € — ochenta céntimos; 1 € — un euro; 21 € — veintiún euros.',
      '¿Cuánto cuesta el pan? — Cuesta un euro. ¿Cuánto cuestan los tomates? — Cuestan tres euros el kilo.',
      '¿Cuánto es? — Son cinco euros.',
    ),
    ex('¿Me pone un café, por favor?', 'Можна мені каву, будь ласка?'),
    ex('Nada más, gracias.', 'Більше нічого, дякую.'),
    ex('La cuenta, por favor.', 'Рахунок, будь ласка.'),
    plink('Потренувати ціни', [PW, PAU, FSP], 'written', 10),
  ],
  linked: [PW, PAU, PAW, FSP, PCR],
});

export default k.build({
  title: 'Ціни: скільки коштує?',
  termEs: 'los precios: ¿cuánto cuesta?',
  summary: 'Розуміємо ціни на цінниках і в меню, називаємо суму словами, питаємо й відповідаємо про ціну та вчимо типові фрази магазину й кафе в Іспанії.',
  objectives: ['A1-05-O2'],
  cv: ['CV-01', 'CV-06'],
  situations: ['food-shopping'],
  minutes: 20,
  introduces: ['price.amount-comprehension', 'price.amount-wording', 'price.ask-answer', 'formula.shop', 'reading.price-label'],
  revisits: ['number.0-15', 'number.16-29', 'number.30-99', 'number.100-1000', 'number.uno-un-una', 'question.word.cuanto', 'quant.containers', 'quant.mucho', 'contrast.muy-mucho', 'formula.please-thanks', 'listening.amounts'],
  steps: [
    {
      kind: 'explanation',
      title: 'Ціна на цінику і словами',
      blocks: [
        uk('На іспанських цінниках десяткову частину відокремлює кома, а знак € зазвичай стоїть після суми: 3,50 € — три євро п’ятдесят центів.'),
        uk('Словами ціну кажуть так: tres euros con cincuenta (céntimos). У розмові коротше: tres euros cincuenta або просто tres cincuenta. Менше за євро — céntimos: ochenta céntimos. Один євро — un euro.'),
        ex('Cuesta tres euros con cincuenta.', 'Коштує три євро п’ятдесят.'),
        ex('Son ochenta céntimos.', 'З вас вісімдесят центів.'),
      ],
    },
    { kind: 'supported-practice', title: 'Практика зі зразком: ціни', tasks: [k.id(13), k.id(1), k.id(2)] },
    {
      kind: 'explanation',
      title: 'Скільки коштує? ¿Cuánto cuesta…?',
      blocks: [
        uk('Ціну однієї речі питаємо ¿Cuánto cuesta…?, кількох — ¿Cuánto cuestan…? Cuesta / cuestan — форми дієслова costar, поки що запам’ятовуємо їх як готові.'),
        uk('Можна також сказати ¿Cuánto vale…? або ¿Qué precio tiene…? Загальну суму в кафе чи на касі питаємо ¿Cuánto es? — Son cinco euros.'),
        ex('¿Cuánto cuesta el pan? — Cuesta un euro.', 'Скільки коштує хліб? — Один євро.'),
        ex('¿Cuánto cuestan los tomates? — Cuestan tres euros el kilo.', 'Скільки коштують помідори? — Три євро за кілограм.'),
      ],
    },
    { kind: 'supported-practice', title: 'Практика зі зразком: питаємо про ціну', tasks: [k.id(15), k.id(16)] },
    { kind: 'independent-practice', title: 'Самостійна практика', tasks: [k.id(12), k.id(11), k.id(3), k.id(4), k.id(25), k.id(17), k.id(18), k.id(19)] },
    {
      kind: 'examples',
      title: 'У магазині та кафе',
      blocks: [
        uk('Ці фрази вчимо цілими, без розбору граматики всередині.'),
        ex('¿Qué desea? / ¿Qué le pongo?', 'Що бажаєте? / Що вам дати?'),
        ex('¿Me pone un café, por favor?', 'Можна мені каву, будь ласка? (типово для бару в Іспанії)'),
        ex('¿Algo más? — Nada más, gracias.', 'Щось іще? — Більше нічого, дякую.'),
        ex('Aquí tiene.', 'Ось, будь ласка (коли щось подають).'),
        ex('¿En efectivo o con tarjeta? — Con tarjeta, por favor.', 'Готівкою чи карткою? — Карткою, будь ласка.'),
        ex('La cuenta, por favor.', 'Рахунок, будь ласка.'),
      ],
    },
    { kind: 'supported-practice', title: 'Практика: фрази', tasks: [k.id(34), k.id(27), k.id(33), k.id(28), k.id(29)] },
    { kind: 'reading', title: 'Читаємо цінники й меню', blocks: [es(LABEL_1), es(LABEL_2), es(LABEL_3)], tasks: [k.id(41), k.id(42), k.id(43), k.id(44), k.id(45), k.id(46)] },
    { kind: 'listening', title: 'Послухай: у магазині', required: false, clips: [s1, s2, s3], tasks: [k.id(36), k.id(37), k.id(38), k.id(39), k.id(40)] },
    { kind: 'independent-practice', title: 'Додаткова практика', required: false, tasks: [k.id(5), k.id(6), k.id(20)] },
    {
      kind: 'summary',
      title: 'Підсумок',
      blocks: [
        ul(
          '3,50 € — кома відокремлює центи; кажемо tres euros con cincuenta.',
          '¿Cuánto cuesta…? (одна річ) / ¿Cuánto cuestan…? (кілька) / ¿Cuánto es? (загальна сума).',
          '¿Me pone…, por favor? — Nada más, gracias. — La cuenta, por favor.',
        ),
      ],
    },
  ],
});
