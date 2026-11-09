// A1-06-L5 — connect ideas: y (and e), pero, porque, ¿por qué?, porque vs por qué,
// yo también / yo tampoco, nada / nadie short answers, antes de / después de (O6, CV-02, CV-04).
import { Kit, S, combos, ex, plink, ul, uk } from '../lib.ts';
import type { Outcome, TaskRole } from '../../../content/types.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-06-L5', RULES);

const Y = 'link.y/construction-use';
const YC = 'link.y/context-choice';
const YE = 'link.y-e/written-form';
const YEC = 'link.y-e/context-choice';
const PE = 'link.pero/construction-use';
const PEC = 'link.pero/context-choice';
const PQ = 'link.porque/construction-use';
const PQC = 'link.porque/context-choice';
const QW = 'question.por-que/written-form';
const QWC = 'question.por-que/context-choice';
const OP = 'ortho.porque-por-que/written-form';
const OPC = 'ortho.porque-por-que/context-choice';
const TT = 'neg.tambien-tampoco/construction-use';
const TTC = 'neg.tambien-tampoco/context-choice';
const NN = 'neg.short-answer.nada-nadie/context-choice';
const NNR = 'neg.short-answer.nada-nadie/reading-meaning';
const AD = 'link.sequence.antes-despues-de/construction-use';
const ADC = 'link.sequence.antes-despues-de/context-choice';

type E = Array<[string, string] | [string, string, Record<string, Outcome>]>;
function x(n: number, role: TaskRole, fam: string, t: string, ins: string, acc: string[], err: E = [], p?: string, tr?: string): string {
  return k.exact({ n, role, fam, t: [t], ins, acc, ...(err.length > 0 ? { err } : {}), ...(p ? { p: [p] } : {}), ...(tr ? { tr } : {}) });
}
/** «A, pero B» with and without the comma (punctuation is not assessed in these tasks). */
const comma = (a: string, b: string): string[] => [`${a}, ${b}`, `${a} ${b}`];
const dot = (s: string): string => (/[.?!]$/.test(s) ? s : `${s}.`);
const joinIns = (word: string, model?: string): string => `З’єднай два речення в одне словом ${word}.${model ? ` Зразок: ${dot(model)}` : ''}`;
const porqueAcc = (s: string): [string, string] => [s, 'У відповіді, коли пояснюємо причину, — одне слово без знака: porque.'];
const porQueErr = (wrong: string): [string, string] => [wrong, 'У питанні «чому?» — два слова, qué зі знаком наголосу: Por qué.'];
const infAfterDe = (s: string): [string, string] => [s, 'Після antes de / después de — інфінітив або іменник, а не особова форма дієслова.'];

// ======================= y
x(1, 'supported', 'a106.routine', Y, joinIns('y', 'Leo. Escucho música. → Leo y escucho música'), ['Trabajo en casa y estudio por la tarde.'], [], 'Trabajo en casa. Estudio por la tarde.');
x(2, 'supported', 'a106.hobbies', Y, joinIns('y', 'Me gusta nadar. Me gusta correr. → Me gusta nadar y correr'), ['Me gusta leer y cocinar.', 'Me gusta leer y me gusta cocinar.'], [], 'Me gusta leer. Me gusta cocinar.');
x(3, 'independent', 'a106.routine', Y, 'Переклади іспанською: «Я снідаю і йду на роботу».', ['Desayuno y voy al trabajo.', 'Yo desayuno y voy al trabajo.']);
x(4, 'independent', 'a106.study', Y, joinIns('y'), ['Ana estudia y trabaja.'], [], 'Ana estudia. Ana trabaja.');
x(5, 'independent', 'a106.shopping', Y, 'Переклади іспанською: «Мені потрібні хліб і молоко».', ['Necesito pan y leche.', 'Yo necesito pan y leche.']);
x(6, 'independent', 'a106.weekend', Y, 'Переклади іспанською: «Ми гуляємо в парку й обідаємо вдома».', ['Paseamos por el parque y comemos en casa.', 'Paseamos en el parque y comemos en casa.', 'Nosotros paseamos por el parque y comemos en casa.']);
x(7, 'delayed', 'a106.hobbies', Y, 'Переклади іспанською: «Моя сестра читає і слухає музику».', ['Mi hermana lee y escucha música.']);
x(8, 'delayed', 'a106.routine', Y, joinIns('y'), [...comma('Por la mañana trabajo', 'y por la tarde descanso.')], [], 'Por la mañana trabajo. Por la tarde descanso.');
x(9, 'transfer', 'a106.profile-t', Y, 'Напиши про себе в профілі іспанською: «Я живу в Мадриді й працюю в банку».', ['Vivo en Madrid y trabajo en un banco.', 'Yo vivo en Madrid y trabajo en un banco.']);
x(10, 'transfer', 'a106.saturday-t', Y, 'Напиши другові іспанською: «У суботу я йду в кіно і вечеряю з друзями».', ['El sábado voy al cine y ceno con mis amigos.', 'Voy al cine y ceno con mis amigos el sábado.']);
k.choice({ n: 11, role: 'independent', fam: 'a106.drinks', t: [YC], ins: 'Тобі подобаються обидва напої. Обери слово.', p: ['Me gusta el té ___ el café.'], o: [['y', true], ['pero', YC, 'Pero — «але», для протиставлення.'], ['porque', YC, 'Porque — «бо», для причини.']] });
k.choice({ n: 12, role: 'delayed', fam: 'a106.routine', t: [YC], ins: 'Обидві дії відбуваються одна за одною. Обери слово.', p: ['Me levanto ___ desayuno.'], o: [['porque', YC, 'Porque — «бо», для причини.'], ['y', true]] });

// ======================= y → e
const eIns = (model?: string): string => `Впиши y або e.${model ? ` Зразок: ${model}.` : ''}`;
x(13, 'supported', 'a106.languages', YE, eIns('padres e hijos'), ['e'], [['y', 'Перед словом на i- y змінюється на e: español e inglés.']], 'Hablo español ___ inglés.');
x(14, 'independent', 'a106.friends', YE, eIns(), ['e'], [['y', 'Isabel починається зі звуку [i], тож e: Ana e Isabel.']], 'Ana ___ Isabel son amigas.');
x(15, 'independent', 'a106.friends', YE, eIns(), ['y'], [['e', 'E вживаємо лише перед звуком [i]. Pablo починається з p, тож y.']], 'Ana ___ Pablo son amigos.');
x(16, 'delayed', 'a106.friends', YE, eIns(), ['e'], [['y', 'Isabel починається зі звуку [i], тож e.']], 'Javier ___ Isabel viven en Sevilla.');
x(17, 'transfer', 'a106.languages-t', YE, eIns(), ['e'], [['y', 'Inglés починається зі звуку [i], тож e: ucraniano e inglés.']], 'En casa hablamos ucraniano ___ inglés.');
k.choice({ n: 18, role: 'independent', fam: 'a106.family', t: [YEC], ins: 'Обери слово.', p: ['padres ___ hijos'], o: [['y', YEC, 'Hijos починається зі звуку [i] (h не вимовляється), тож e.'], ['e', true]] });

// ======================= pero
x(19, 'supported', 'a106.drinks', PE, joinIns('pero', 'Quiero ir. Mañana trabajo. → Quiero ir, pero mañana trabajo'), comma('Me gusta el café', 'pero no me gusta el té.'), [], 'Me gusta el café. No me gusta el té.');
x(20, 'supported', 'a106.pets', PE, joinIns('pero', 'Me gusta el té. No me gusta el café. → Me gusta el té, pero no me gusta el café'), comma('Tengo un perro', 'pero no tengo gato.'), [], 'Tengo un perro. No tengo gato.');
x(21, 'independent', 'a106.city', PE, 'Переклади іспанською: «Мені подобається Мадрид, але він дуже великий».', comma('Me gusta Madrid', 'pero es muy grande.'), [['Me gusta Madrid, porque es muy grande.', 'Porque — «бо». Тут протиставлення: pero.']]);
x(22, 'independent', 'a106.beach', PE, 'Переклади іспанською: «Я хочу піти на пляж, але в мене немає часу».', comma('Quiero ir a la playa', 'pero no tengo tiempo.'));
x(23, 'independent', 'a106.languages', PE, 'Переклади іспанською: «Ана говорить англійською, але не говорить французькою».', comma('Ana habla inglés', 'pero no habla francés.'));
x(24, 'independent', 'a106.hotel', PE, joinIns('pero'), comma('El hotel es caro', 'pero está cerca del centro.'), [], 'El hotel es caro. Está cerca del centro.');
x(25, 'delayed', 'a106.work', PE, 'Переклади іспанською: «Я втомлений, але працюю».', [...comma('Estoy cansado', 'pero trabajo.')]);
x(26, 'delayed', 'a106.car', PE, joinIns('pero'), comma('Necesito un coche', 'pero no tengo dinero.'), [], 'Necesito un coche. No tengo dinero.');
x(27, 'transfer', 'a106.invite-reply-t', PE, 'Друг кличе тебе на вечірку в суботу. Відповідай іспанською: «Я хочу, але в суботу я працюю».', [...comma('Quiero', 'pero el sábado trabajo.'), ...comma('Quiero ir', 'pero el sábado trabajo.')]);
x(28, 'transfer', 'a106.flat-t', PE, 'Опиши квартиру іспанською: «Квартира маленька, але вона в центрі».', [...comma('El piso es pequeño', 'pero está en el centro.'), ...comma('Mi piso es pequeño', 'pero está en el centro.')]);
k.choice({ n: 29, role: 'independent', fam: 'a106.drinks', t: [PEC], ins: 'Протистав дві думки: обери слово.', p: ['Me gusta el té, ___ no me gusta el café.'], o: [['pero', true], ['y', PEC, 'Тут протиставлення (подобається — не подобається): pero.'], ['porque', PEC, 'Porque — «бо», для причини.']] });
k.choice({ n: 30, role: 'delayed', fam: 'a106.work', t: [PEC], ins: 'Обери слово.', p: ['Quiero ir al cine, ___ no tengo tiempo.'], o: [['porque', PEC, 'Тут протиставлення (хочу — але не маю часу): pero.'], ['pero', true]] });

// ======================= porque
x(31, 'supported', 'a106.cinema', PQ, joinIns('porque', 'Estudio español. Quiero vivir en Madrid. → Estudio español porque quiero vivir en Madrid'), ['No voy al cine porque estoy cansado.'], [porqueAcc('No voy al cine por qué estoy cansado.')], 'No voy al cine. Estoy cansado.');
x(32, 'supported', 'a106.study', PQ, joinIns('porque', 'No voy al cine. Estoy cansado. → No voy al cine porque estoy cansado'), ['Estudio español porque quiero vivir en Madrid.'], [porqueAcc('Estudio español por qué quiero vivir en Madrid.')], 'Estudio español. Quiero vivir en Madrid.');
x(33, 'independent', 'a106.cafe', PQ, 'Переклади іспанською: «Я п’ю каву, бо я втомлений».', ['Tomo un café porque estoy cansado.', 'Tomo café porque estoy cansado.', 'Bebo café porque estoy cansado.'], [porqueAcc('Tomo un café por qué estoy cansado.')]);
x(34, 'independent', 'a106.dinner', PQ, 'Переклади іспанською: «Ми вечеряємо вдома, бо ресторан зачинений».', ['Cenamos en casa porque el restaurante está cerrado.'], [porqueAcc('Cenamos en casa por qué el restaurante está cerrado.')]);
x(35, 'independent', 'a106.food', PQ, joinIns('porque'), ['Ana no come carne porque no le gusta.'], [['Ana no come carne pero no le gusta.', 'Pero — «але». Тут причина: porque.']], 'Ana no come carne. No le gusta.');
x(36, 'independent', 'a106.study', PQ, 'Переклади іспанською: «Я вчу іспанську, бо хочу подорожувати».', ['Estudio español porque quiero viajar.', 'Aprendo español porque quiero viajar.'], [porqueAcc('Estudio español por qué quiero viajar.')]);
x(37, 'delayed', 'a106.beach', PQ, 'Переклади іспанською: «Я не йду на пляж, бо в мене немає часу».', ['No voy a la playa porque no tengo tiempo.'], [porqueAcc('No voy a la playa por qué no tengo tiempo.')]);
x(38, 'delayed', 'a106.sport', PQ, joinIns('porque'), ['Voy al gimnasio porque me gusta el deporte.'], [], 'Voy al gimnasio. Me gusta el deporte.');
x(39, 'transfer', 'a106.party-t', PQ, 'Друг кличе тебе в кіно сьогодні ввечері. Відповідай іспанською: «Я не йду, бо маю іспит».', ['No voy porque tengo un examen.', 'No voy porque tengo examen.', 'Lo siento, no voy porque tengo un examen.'], [porqueAcc('No voy por qué tengo un examen.')]);
x(40, 'transfer', 'a106.errand-t', PQ, 'Напиши сусідці іспанською: «Я йду в супермаркет, бо мені потрібне молоко».', ['Voy al supermercado porque necesito leche.'], [porqueAcc('Voy al supermercado por qué necesito leche.')]);
k.choice({ n: 41, role: 'independent', fam: 'a106.cinema', t: [PQC], ins: 'Поясни причину: обери слово.', p: ['No voy al cine ___ estoy cansado.'], o: [['pero', PQC, 'Тут причина: porque.'], ['porque', true], ['y', PQC, 'Тут причина: porque.']] });
k.choice({ n: 42, role: 'delayed', fam: 'a106.study', t: [PQC], ins: 'Обери слово.', p: ['Estudio mucho ___ tengo un examen.'], o: [['porque', true], ['pero', PQC, 'Тут причина: porque.']] });

// ======================= ¿por qué?
const pqIns = (model?: string): string => `Впиши питальне слово «чому».${model ? ` Зразок: ${dot(model)}` : ''}`;
const pqErrs: E = [porQueErr('Porque'), porQueErr('Por que'), porQueErr('Porqué')];
x(43, 'supported', 'a106.study', QW, pqIns('¿Por qué no vas al cine?'), ['Por qué'], pqErrs, '¿___ estudias español?');
x(44, 'supported', 'a106.work', QW, pqIns('¿Por qué estudias español?'), ['Por qué'], pqErrs, '¿___ estás cansado?');
x(45, 'independent', 'a106.food', QW, 'Запитай іспанською: «Чому ти не їси м’ясо?»', ['¿Por qué no comes carne?'], [porQueErr('¿Porque no comes carne?'), porQueErr('¿Por que no comes carne?')]);
x(46, 'independent', 'a106.city', QW, 'Запитай іспанською: «Чому Ана в Мадриді?»', ['¿Por qué está Ana en Madrid?', '¿Por qué Ana está en Madrid?'], [porQueErr('¿Porque está Ana en Madrid?')]);
k.slots({ n: 47, role: 'independent', fam: 'a106.sport', t: [QW], ins: 'Перепиши питання повністю, вставивши «чому».', p: ['¿___ vas al gimnasio?'], tpl: ['¿', S('s1'), ' vas al gimnasio?'], slots: [{ id: 's1', t: QW, acc: ['Por qué'], err: [porQueErr('Porque'), porQueErr('Por que')] }] });
x(48, 'independent', 'a106.city', QW, 'Запитай друга іспанською: «Чому тобі подобається Мадрид?»', ['¿Por qué te gusta Madrid?', '¿A ti por qué te gusta Madrid?'], [porQueErr('¿Porque te gusta Madrid?')]);
x(49, 'delayed', 'a106.beach', QW, 'Запитай іспанською: «Чому ти не йдеш на пляж?»', ['¿Por qué no vas a la playa?'], [porQueErr('¿Porque no vas a la playa?')]);
x(50, 'delayed', 'a106.work', QW, pqIns(), ['Por qué'], pqErrs, '¿___ trabajas el sábado?');
x(51, 'transfer', 'a106.shop-closed-t', QW, 'Ти бачиш зачинену крамницю. Запитай перехожого іспанською: «Чому крамниця зачинена?»', ['¿Por qué está cerrada la tienda?', '¿Por qué la tienda está cerrada?'], [porQueErr('¿Porque está cerrada la tienda?')]);
x(52, 'transfer', 'a106.interview-t', QW, 'Запитай нову колегу іспанською: «Чому ти хочеш жити в Іспанії?»', ['¿Por qué quieres vivir en España?'], [porQueErr('¿Porque quieres vivir en España?')]);
k.choice({ n: 53, role: 'independent', fam: 'a106.food', t: [QWC], ins: 'Ти хочеш запитати друга: «Чому ти не їси?» Обери правильне написання.', p: ['¿___ no comes?'], o: [['Porque', QWC, porQueErr('')[1]], ['Por qué', true], ['Por que', QWC, porQueErr('')[1]]] });

// ======================= porque vs por qué
k.slots({
  n: 54,
  role: 'supported',
  fam: 'a106.qa',
  t: [OP],
  ins: 'Перепиши діалог повністю, вставивши por qué або porque. Зразок: ¿Por qué estudias? — Porque quiero viajar.',
  p: ['¿___ no vas? — ___ estoy cansado.'],
  tpl: ['¿', S('s1'), ' no vas? — ', S('s2'), ' estoy cansado.'],
  slots: [
    { id: 's1', t: OP, acc: ['Por qué'], err: [porQueErr('Porque')] },
    { id: 's2', t: OP, acc: ['Porque'], err: [porqueAcc('Por qué')] },
  ],
});
x(55, 'independent', 'a106.study', OP, 'Впиши porque або por qué.', ['porque'], [porqueAcc('por qué')], 'Estudio mucho ___ tengo un examen.');
x(56, 'independent', 'a106.drinks', OP, 'Ти питаєш подругу: «Чому тобі не подобається чай?» Впиши porque або por qué.', ['Por qué'], [porQueErr('Porque')], '¿___ no te gusta el té?');
k.slots({
  n: 57,
  role: 'delayed',
  fam: 'a106.qa',
  t: [OP],
  ins: 'Перепиши діалог повністю, вставивши por qué або porque.',
  p: ['¿___ estudias español? — ___ quiero viajar.'],
  tpl: ['¿', S('s1'), ' estudias español? — ', S('s2'), ' quiero viajar.'],
  slots: [
    { id: 's1', t: OP, acc: ['Por qué'], err: [porQueErr('Porque')] },
    { id: 's2', t: OP, acc: ['Porque'], err: [porqueAcc('Por qué')] },
  ],
});
x(58, 'transfer', 'a106.why-spain-t', OP, 'Тебе питають: «¿Por qué estudias español?» Відповідай іспанською: «Бо мені подобається Іспанія».', ['Porque me gusta España.'], [porqueAcc('Por qué me gusta España.')]);
x(59, 'delayed', 'a106.food', OP, 'Впиши porque або por qué.', ['porque'], [porqueAcc('por qué')], 'No como carne ___ no me gusta.');
k.choice({ n: 60, role: 'independent', fam: 'a106.qa', t: [OPC], ins: 'Обери правильне написання відповіді.', p: ['—¿Por qué no comes? —___ no tengo hambre.'], o: [['Por qué', OPC, porqueAcc('')[1]], ['Porque', true]] });

// ======================= yo también / yo tampoco
const aMi = (s: string): [string, string] => [s, 'A mí también / A mí tampoco — для gustar, encantar. Зі звичайним дієсловом відповідаємо через yo.'];
const tIns = (what: string, model?: string): string => `Відповідай іспанською коротко: ${what}.${model ? ` Зразок: ${dot(model)}` : ''}`;
x(61, 'supported', 'a106.work', TT, tIns('ти теж', '—Hablo inglés. —Yo también'), ['Yo también.'], [aMi('A mí también.')], '—Trabajo en casa.');
x(62, 'supported', 'a106.car', TT, tIns('у тебе теж немає', '—No como carne. —Yo tampoco'), ['Yo tampoco.'], [['Yo también.', 'На заперечення погоджуємося через tampoco: Yo tampoco.'], aMi('A mí tampoco.')], '—No tengo coche.');
x(63, 'independent', 'a106.work', TT, tIns('ти не втомлений'), ['Yo no.'], [['Yo tampoco.', 'Tampoco — щоб погодитися із запереченням. Тут ти не погоджуєшся зі ствердженням: Yo no.']], '—Estoy cansado.');
x(64, 'independent', 'a106.languages', TT, tIns('а ти говориш'), ['Yo sí.'], [['Yo también.', 'También — щоб погодитися. Ти не погоджуєшся із запереченням: Yo sí.']], '—No hablo inglés.');
x(65, 'independent', 'a106.city', TT, tIns('ти теж'), ['Yo también.'], [aMi('A mí también.')], '—Vivo en Madrid.');
x(66, 'independent', 'a106.food', TT, tIns('ти теж не їси'), ['Yo tampoco.'], [['Yo también.', 'На заперечення погоджуємося через tampoco: Yo tampoco.']], '—No como carne.');
x(67, 'delayed', 'a106.study', TT, tIns('ти теж'), ['Yo también.'], [aMi('A mí también.')], '—Estudio español.');
x(68, 'delayed', 'a106.work', TT, tIns('а ти працюєш'), ['Yo sí.'], [['Yo también.', 'También — щоб погодитися. Ти не погоджуєшся із запереченням: Yo sí.']], '—No trabajo el sábado.');
x(69, 'transfer', 'a106.busy-t', TT, 'Колега пише в чаті. Погодься коротко іспанською (у тебе теж немає).', ['Yo tampoco.'], [['Yo también.', 'На заперечення погоджуємося через tampoco: Yo tampoco.']], '—No tengo tiempo esta semana.');
x(70, 'transfer', 'a106.beach-plan-t', TT, 'Друг пише про плани. Не погодься коротко іспанською (ти не йдеш).', ['Yo no.'], [['Yo tampoco.', 'Tampoco — щоб погодитися із запереченням. Тут ствердження, і ти не погоджуєшся: Yo no.']], '—Mañana voy a la playa.');
k.choice({ n: 71, role: 'independent', fam: 'a106.languages', t: [TTC], ins: '—Hablo ucraniano. Ти теж. Обери відповідь.', o: [['Yo también.', true], ['A mí también.', TTC, aMi('')[1]], ['Yo tampoco.', TTC, 'Tampoco — для згоди із запереченням.']] });
k.choice({ n: 72, role: 'delayed', fam: 'a106.car', t: [TTC], ins: '—No tengo coche. У тебе теж немає. Обери відповідь.', o: [['Yo también.', TTC, 'На заперечення погоджуємося через tampoco.'], ['Yo tampoco.', true], ['Yo sí.', TTC, 'Yo sí — означає, що в тебе є.']] });

// ======================= nada / nadie (recognition)
k.choice({ n: 73, role: 'independent', fam: 'a106.shop-help', t: [NN], ins: '—¿Necesitas algo? Тобі нічого не потрібно. Обери відповідь.', o: [['Nada, gracias.', true], ['Nadie, gracias.', NN, 'Nadie — «ніхто». «Нічого» — nada.'], ['Algo, gracias.', NN, 'Algo — «щось».']] });
k.choice({ n: 74, role: 'independent', fam: 'a106.home-who', t: [NN], ins: '—¿Quién está en casa? Удома нікого немає. Обери відповідь.', o: [['Nada.', NN, 'Nada — «нічого». «Ніхто» — nadie.'], ['Nadie.', true]] });
k.choice({ n: 75, role: 'independent', fam: 'a106.r-shop', t: [NNR], ins: 'Прочитай діалог у магазині. Що відповідає покупець?', p: ['—¿Algo más? —Nada más, gracias.'], o: [['Що хоче ще щось.', false], ['Що більше нічого не треба.', true], ['Що нікого немає.', false]] });
k.choice({ n: 76, role: 'delayed', fam: 'a106.shop-help', t: [NN], ins: '—¿Qué quieres? Ти нічого не хочеш. Обери відповідь.', o: [['Nadie.', NN, 'Nadie — «ніхто».'], ['Nada.', true]] });
k.choice({ n: 77, role: 'delayed', fam: 'a106.r-class', t: [NNR], ins: 'Прочитай. Що означає відповідь?', p: ['—¿Quién habla francés? —Nadie.'], o: [['Ніхто не говорить французькою.', true], ['Усі говорять французькою.', false], ['Нічого не відомо.', false]] });

// ======================= antes de / después de
x(78, 'supported', 'a106.evening', AD, 'Переклади іспанською: «Після вечері я читаю». Зразок: Antes de la clase, tomo un café.', [...combos(['Después de cenar', 'Después de la cena'], [', leo.', ' leo.']), 'Leo después de cenar.', 'Leo después de la cena.'], [infAfterDe('Después de ceno, leo.')]);
k.slots({
  n: 79,
  role: 'supported',
  fam: 'a106.after-work',
  t: [AD],
  ins: 'Перепиши речення повністю, щоб воно означало «Після роботи я йду в спортзал». Зразок: Después del desayuno leo.',
  p: ['Después ___ trabajo voy al gimnasio.'],
  tpl: ['Después ', S('s1'), ' trabajo voy al gimnasio.'],
  slots: [{ id: 's1', t: AD, acc: ['del'], err: [['de el', 'De + el зливаються: del trabajo.'], ['de', 'У цьому реченні кажемо з артиклем: después del trabajo (de + el = del).']] }],
});
x(80, 'independent', 'a106.class', AD, 'Переклади іспанською: «Перед заняттям я п’ю каву».', [...combos(['Antes de la clase'], [', tomo un café.', ' tomo un café.', ', tomo café.', ' tomo café.']), 'Tomo un café antes de la clase.', 'Tomo café antes de la clase.']);
x(81, 'independent', 'a106.morning', AD, 'Переклади іспанською: «Після сніданку я йду на роботу».', [...combos(['Después de desayunar', 'Después del desayuno'], [', voy al trabajo.', ' voy al trabajo.']), 'Voy al trabajo después de desayunar.', 'Voy al trabajo después del desayuno.'], [['Después de desayuno voy al trabajo.', 'Тут або інфінітив — después de desayunar, або іменник з артиклем — después del desayuno.']]);
x(82, 'independent', 'a106.evening', AD, 'Переклади іспанською: «Перед вечерею ми гуляємо».', [...combos(['Antes de cenar', 'Antes de la cena'], [', paseamos.', ' paseamos.']), 'Paseamos antes de cenar.', 'Paseamos antes de la cena.'], [infAfterDe('Antes de cenamos, paseamos.')]);
k.slots({
  n: 83,
  role: 'independent',
  fam: 'a106.class',
  t: [AD],
  ins: 'Перепиши речення повністю, щоб воно означало «Після заняття я йду додому».',
  p: ['Después ___ clase voy a casa.'],
  tpl: ['Después ', S('s1'), ' clase voy a casa.'],
  slots: [{ id: 's1', t: AD, acc: ['de la'], err: [['del', 'Clase — жіночого роду: de la clase (злиття лише з el).']] }],
});
x(84, 'delayed', 'a106.after-work', AD, 'Переклади іспанською: «Після роботи я відпочиваю».', [...combos(['Después del trabajo', 'Después de trabajar'], [', descanso.', ' descanso.']), 'Descanso después del trabajo.', 'Descanso después de trabajar.'], [['Después de el trabajo descanso.', 'De + el зливаються: del trabajo.']]);
x(85, 'delayed', 'a106.exam', AD, 'Переклади іспанською: «Перед іспитом я багато вчуся».', [...combos(['Antes del examen'], [', estudio mucho.', ' estudio mucho.']), 'Estudio mucho antes del examen.'], [['Antes de el examen estudio mucho.', 'De + el зливаються: del examen.']]);
x(86, 'transfer', 'a106.after-class-t', AD, 'Напиши одногрупникам іспанською: «Після заняття ми йдемо в бар».', [...combos(['Después de la clase'], [', vamos al bar.', ' vamos al bar.', ', vamos a un bar.', ' vamos a un bar.']), 'Vamos al bar después de la clase.'], [['Después del clase vamos al bar.', 'Clase — жіночого роду: de la clase.']]);
x(87, 'transfer', 'a106.trip-t', AD, 'Напиши іспанською: «Перед тим як подорожувати, я купую квиток».', [...combos(['Antes de viajar'], [', compro un billete.', ' compro un billete.', ', compro el billete.', ' compro el billete.']), 'Compro un billete antes de viajar.', 'Compro el billete antes de viajar.'], [infAfterDe('Antes de viajo, compro un billete.')]);
k.choice({ n: 88, role: 'independent', fam: 'a106.evening', t: [ADC], ins: 'Обери правильний варіант.', p: ['Después de ___, leo.'], o: [['ceno', ADC, infAfterDe('')[1]], ['cenar', true]] });
k.choice({ n: 89, role: 'delayed', fam: 'a106.after-work', t: [ADC], ins: 'Обери правильний варіант.', p: ['Antes ___ trabajo, desayuno.'], o: [['del', true], ['de el', ADC, 'De + el зливаються: del.'], ['de la', ADC, 'Trabajo — чоловічого роду: del trabajo.']] });

k.material({
  id: 'material.a1-06.links',
  topic: 'A1-06-L5',
  title: 'Зв’язки: y, pero, porque; ¿por qué?; también / tampoco',
  blocks: [
    ul(
      'y — «і» (e перед голосним звуком [i]: español e inglés; але agua y hielo)',
      'pero — «але» (зазвичай з комою перед ним)',
      'porque — «бо» (одне слово, без знака); ¿por qué? — «чому?»',
      'Yo también / Yo tampoco / Yo no / Yo sí',
      'nada — «нічого», nadie — «ніхто»',
      'antes de / después de + інфінітив або іменник: después de cenar, antes del examen',
    ),
    plink('Потренувати зв’язки', [Y, PE, PQ, QW, TT, AD], 'written', 12),
  ],
  linked: [Y, YE, PE, PQ, QW, OP, TT, AD],
});

export default k.build({
  title: 'І, але, бо: зв’язуємо думки',
  termEs: 'y, pero, porque',
  summary:
    'З’єднуємо думки словами y (e), pero, porque; питаємо ¿por qué? і розрізняємо porque / por qué; погоджуємося й не погоджуємося (yo también, yo tampoco), коротко відповідаємо nada / nadie і кажемо, що робимо до чи після (antes de, después de). Урок поділено на три кроки.',
  objectives: ['A1-06-O6'],
  cv: ['CV-02', 'CV-04'],
  situations: ['routine-study-leisure'],
  minutes: 20,
  introduces: [
    'link.y',
    'link.y-e',
    'link.pero',
    'link.porque',
    'question.por-que',
    'ortho.porque-por-que',
    'neg.tambien-tampoco',
    'neg.short-answer.nada-nadie',
    'link.sequence.antes-despues-de',
  ],
  revisits: ['writing.short-statement', 'neg.no-before-verb', 'ortho.interrogative-accent', 'gustar.responses', 'formula.shop', 'link.sequence', 'article.contraction-del', 'gustar.infinitive'],
  steps: [
    {
      kind: 'explanation',
      title: 'Крок 1. Y, e, pero',
      blocks: [
        uk('Y — «і»: з’єднує схожі або послідовні думки. Перед словом, що починається з голосного звуку [i] (i-, hi-), y змінюється на e: español e inglés, padres e hijos. Перед hie-, hia- (там звук [j]) лишається y: agua y hielo («вода й лід»).'),
        uk('Pero — «але»: протиставлення. Перед pero зазвичай ставимо кому.'),
        ex('Me gusta nadar y correr.', 'Мені подобається плавати й бігати.'),
        ex('Hablo francés e inglés.', 'Я говорю французькою й англійською.'),
        ex('Me gusta el té, pero no me gusta el café.', 'Мені подобається чай, але не подобається кава.'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 1: практика зі зразком', tasks: [k.id(1), k.id(2), k.id(13), k.id(19), k.id(20)] },
    { kind: 'independent-practice', title: 'Крок 1: самостійно', tasks: [k.id(11), k.id(3), k.id(4), k.id(18), k.id(14), k.id(15), k.id(29), k.id(21), k.id(22), k.id(24)] },
    {
      kind: 'explanation',
      title: 'Крок 2. Porque і ¿por qué?',
      blocks: [
        uk('Porque — «бо, тому що»: пояснює причину. Одне слово, без знака наголосу.'),
        uk('¿Por qué? — «чому?»: два слова, qué зі знаком наголосу. На ¿Por qué…? відповідаємо Porque…'),
        ex('—¿Por qué no vas al cine? —Porque tengo un examen.', '— Чому ти не йдеш у кіно? — Бо в мене іспит.'),
        ex('Aprendo español porque me gusta.', 'Я вчу іспанську, бо мені подобається.'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 2: практика зі зразком', tasks: [k.id(31), k.id(32), k.id(43), k.id(44), k.id(54)] },
    { kind: 'independent-practice', title: 'Крок 2: самостійно', tasks: [k.id(41), k.id(33), k.id(34), k.id(35), k.id(53), k.id(45), k.id(46), k.id(55), k.id(56), k.id(60)] },
    {
      kind: 'explanation',
      title: 'Крок 3. Yo también / tampoco; nada, nadie; antes de, después de',
      blocks: [
        uk('Погодитися: зі ствердженням — Yo también, із запереченням — Yo tampoco («я теж ні»). Не погодитися: Yo no / Yo sí. З gustar — через a mí: A mí también.'),
        uk('Короткі відповіді: nada — «нічого», nadie — «ніхто». У магазині: Nada más, gracias.'),
        uk('Antes de — «перед», después de — «після». Після них — інфінітив (antes de cenar) або іменник: часто з артиклем (después del trabajo, de + el = del), але буває й без нього або з присвійним словом (antes de clase, después de mi clase).'),
        ex('—Hablo inglés. —Yo también.', '— Я говорю англійською. — Я теж.'),
        ex('—No como carne. —Yo tampoco.', '— Я не їм м’яса. — Я теж ні.'),
        ex('Después del desayuno leo el periódico.', 'Після сніданку я читаю газету.'),
      ],
    },
    { kind: 'supported-practice', title: 'Крок 3: практика зі зразком', tasks: [k.id(61), k.id(62), k.id(78), k.id(79)] },
    { kind: 'independent-practice', title: 'Крок 3: самостійно', tasks: [k.id(71), k.id(63), k.id(64), k.id(65), k.id(73), k.id(74), k.id(75), k.id(88), k.id(80), k.id(81), k.id(83)] },
    {
      kind: 'independent-practice',
      title: 'Додаткова практика',
      required: false,
      tasks: [k.id(5), k.id(6), k.id(23), k.id(36), k.id(47), k.id(48), k.id(66), k.id(82)],
    },
    {
      kind: 'summary',
      title: 'Підсумок',
      blocks: [
        ul(
          'Y — «і» (e перед голосним звуком [i]); pero — «але»; porque — «бо».',
          '¿Por qué? — питання; porque — відповідь.',
          'Yo también / Yo tampoco; з gustar — a mí también.',
          'Nada — нічого, nadie — ніхто.',
          'Antes de / después de + інфінітив або іменник (з артиклем чи без).',
        ),
      ],
    },
  ],
});
