// A1-06-L3 — what is needed: necesitar + noun and necesitar + infinitive (O3). Need is kept
// distinct from liking (gustar).
import { Kit, ex, plink, ul, uk } from '../lib.ts';
import type { TaskRole } from '../../../content/types.ts';
import { RULES } from './rules.ts';

const k = new Kit('A1-06-L3', RULES);

const NN = 'necesitar.noun/construction-use';
const NNC = 'necesitar.noun/context-choice';
const NI = 'necesitar.infinitive/construction-use';
const NIW = 'necesitar.infinitive/written-form';

type E = Array<[string, string]>;
function x(n: number, role: TaskRole, fam: string, t: string, ins: string, acc: string[], err: E = [], p?: string, tr?: string): string {
  return k.exact({ n, role, fam, t: [t], ins, acc, ...(err.length > 0 ? { err } : {}), ...(p ? { p: [p] } : {}), ...(tr ? { tr } : {}) });
}
const meNec = (s: string, right: string, ukm = 'мені потрібно', pron = 'me'): [string, string] => [s, `Людина — підмет: «${ukm}» = ${right}, без займенника ${pron}.`];
const infErr = (s: string, inf: string): [string, string] => [s, `Після necesitar — інфінітив (словникова форма): ${inf}.`];

// ======================= necesitar + noun
x(1, 'supported', 'a106.rain', NN, 'Переклади іспанською: «Мені потрібна парасолька». Зразок: Necesito un bolígrafo.', ['Necesito un paraguas.', 'Yo necesito un paraguas.'], [meNec('Me necesita un paraguas.', 'necesito')]);
x(2, 'supported', 'a106.shopping', NN, 'Впиши форму necesitar: «Нам потрібне молоко». Зразок: yo → necesito.', ['necesitamos'], [['necesito', 'Necesito — «мені». «Нам» — necesitamos.'], ['necesitar', 'Потрібна форма для nosotros: necesitamos.']], 'Nosotros ___ leche.');
x(3, 'independent', 'a106.help', NN, 'Запитай друга іспанською: «Тобі щось потрібно?»', ['¿Necesitas algo?', '¿Tú necesitas algo?', '¿Necesitas tú algo?'], [meNec('¿Te necesita algo?', 'necesitas', 'тобі потрібно', 'te')]);
x(4, 'independent', 'a106.school', NN, 'Переклади іспанською: «Ані потрібен рюкзак».', ['Ana necesita una mochila.'], [['A Ana le necesita una mochila.', 'Necesitar — не як gustar: людина — підмет, Ana necesita.']]);
x(5, 'independent', 'a106.shopping', NN, 'Переклади іспанською: «Нам потрібен хліб».', ['Necesitamos pan.', 'Nosotros necesitamos pan.', 'Nosotras necesitamos pan.'], [meNec('Nos necesita pan.', 'necesitamos', 'нам потрібно', 'nos')]);
x(6, 'independent', 'a106.money', NN, 'Переклади іспанською: «Мені потрібні гроші».', ['Necesito dinero.', 'Yo necesito dinero.'], [meNec('Me necesita dinero.', 'necesito')]);
x(7, 'delayed', 'a106.car', NN, 'Переклади іспанською: «Моїм батькам потрібна машина».', ['Mis padres necesitan un coche.'], [['A mis padres les necesita un coche.', 'Necesitar — не як gustar: mis padres necesitan.']]);
x(8, 'delayed', 'a106.help', NN, 'Продавець питає ввічливо (usted). Як він скаже: «Вам щось потрібно?»', ['¿Necesita algo?', '¿Usted necesita algo?', '¿Necesita usted algo?'], [meNec('¿Le necesita algo?', 'necesita', 'вам потрібно' + ' (usted)', 'le')]);
x(9, 'transfer', 'a106.market-t', NN, 'Продавець на ринку питає: «¿Qué necesita?» Скажи іспанською: «Мені потрібен кілограм помідорів».', ['Necesito un kilo de tomates.', 'Yo necesito un kilo de tomates.'], [meNec('Me necesita un kilo de tomates.', 'necesito')]);
x(10, 'transfer', 'a106.station-t', NN, 'На вокзалі. Скажи іспанською: «Нам потрібні два квитки».', ['Necesitamos dos billetes.', 'Nosotros necesitamos dos billetes.', 'Nosotras necesitamos dos billetes.'], [meNec('Nos necesita dos billetes.', 'necesitamos', 'нам потрібно', 'nos')]);
k.choice({
  n: 11,
  role: 'independent',
  fam: 'a106.rain',
  t: [NNC],
  ins: 'Іде дощ, а в тебе немає парасольки. Що скажеш?',
  o: [
    ['Necesito un paraguas.', true],
    ['Me gusta el paraguas.', NNC, 'Me gusta — «мені подобається». Тут ідеться про потребу: necesito.'],
    ['Me necesita un paraguas.', NNC, meNec('', 'necesito')[1]],
  ],
});
k.choice({
  n: 12,
  role: 'delayed',
  fam: 'a106.money',
  t: [NNC],
  ins: 'У тебе немає грошей, а треба купити квиток. Обери речення.',
  o: [
    ['Me gusta el dinero.', NNC, 'Me gusta — «мені подобається». Тут ідеться про потребу: necesito.'],
    ['Necesito dinero.', true],
  ],
});

// ======================= necesitar + infinitive
x(13, 'supported', 'a106.shopping', NIW, 'Впиши дієслово comprar у потрібній формі: «Мені треба купити хліб». Зразок: Necesito estudiar.', ['comprar'], [infErr('compro', 'comprar')], 'Necesito ___ pan.');
x(14, 'supported', 'a106.exam', NI, 'Переклади іспанською: «Нам треба вчитися». Зразок: Necesito descansar.', ['Necesitamos estudiar.', 'Nosotros necesitamos estudiar.', 'Nosotras necesitamos estudiar.'], [infErr('Necesitamos estudiamos.', 'estudiar')]);
x(15, 'independent', 'a106.rest', NIW, 'Впиши дієслово descansar у потрібній формі: «Тобі треба відпочити?»', ['descansar'], [infErr('descansas', 'descansar')], '¿Necesitas ___?');
x(16, 'independent', 'a106.work', NI, 'Переклади іспанською: «Сьогодні мені треба працювати».', ['Hoy necesito trabajar.', 'Necesito trabajar hoy.', 'Hoy yo necesito trabajar.'], [infErr('Hoy necesito trabajo.', 'trabajar')]);
x(17, 'independent', 'a106.exam', NI, 'Переклади іспанською: «Ані треба вчити англійську».', ['Ana necesita estudiar inglés.'], [infErr('Ana necesita estudia inglés.', 'estudiar')]);
k.slots({
  n: 18,
  role: 'independent',
  fam: 'a106.kitchen',
  t: [NIW],
  ins: 'Перепиши речення повністю, вставивши дієслово cocinar у потрібній формі: «Моїм братам треба готувати вдома».',
  p: ['Mis hermanos necesitan ___ en casa.'],
  tpl: ['Mis hermanos necesitan ', { slot: 's1' }, ' en casa.'],
  slots: [{ id: 's1', t: NIW, acc: ['cocinar'], err: [infErr('cocinan', 'cocinar')] }],
});
x(19, 'delayed', 'a106.rest', NI, 'Переклади іспанською: «Тобі треба відпочивати».', ['Necesitas descansar.', 'Tú necesitas descansar.'], [infErr('Necesitas descansas.', 'descansar')]);
x(20, 'delayed', 'a106.train', NIW, 'Впиши дієслово tomar у потрібній формі: «Нам треба сісти на потяг о восьмій».', ['tomar'], [infErr('tomamos', 'tomar')], 'Necesitamos ___ el tren de las ocho.');
x(21, 'transfer', 'a106.pharmacy-t', NI, 'Ти погано почуваєшся. Скажи іспанською: «Мені треба піти в аптеку».', ['Necesito ir a la farmacia.', 'Yo necesito ir a la farmacia.'], [infErr('Necesito voy a la farmacia.', 'ir')]);
x(22, 'transfer', 'a106.meeting-t', NI, 'Напиши колегам іспанською: «Нам треба прийти о дев’ятій».', ['Necesitamos llegar a las nueve.', 'Nosotros necesitamos llegar a las nueve.', 'Nosotras necesitamos llegar a las nueve.'], [infErr('Necesitamos llegamos a las nueve.', 'llegar')]);

k.material({
  id: 'material.a1-06.necesitar',
  topic: 'A1-06-L3',
  title: 'Necesitar: що потрібно і що треба зробити',
  blocks: [
    uk('Necesito + іменник: Necesito un paraguas. Necesito + інфінітив: Necesito comprar pan. Людина — підмет: necesito, necesitas, necesita, necesitamos, necesitáis, necesitan.'),
    plink('Потренувати necesitar', [NN, NI], 'written', 10),
  ],
  linked: [NN, NI],
});

export default k.build({
  title: 'Що мені потрібно: necesitar',
  termEs: 'el verbo necesitar',
  summary: 'Кажемо, що потрібно (necesito un paraguas) і що треба зробити (necesito comprar pan); не плутаємо потребу з «подобається».',
  objectives: ['A1-06-O3'],
  situations: ['food-shopping', 'routine-study-leisure'],
  minutes: 12,
  introduces: ['necesitar.noun', 'necesitar.infinitive'],
  revisits: ['present.regular-ar', 'present.regular-ar.plural', 'article.definite-indefinite', 'gustar.infinitive', 'gustar.pronouns', 'quant.containers'],
  steps: [
    {
      kind: 'explanation',
      title: 'Necesito + річ або дія',
      blocks: [
        uk('Українське «мені потрібно» іспанською — necesito: людина тут підмет, як у звичайних дієсловах на -ar (necesito, necesitas, necesita, necesitamos, necesitáis, necesitan). Не як gustar: не «me necesita».'),
        uk('Після necesito — річ або дія в інфінітиві. Одна будь-яка річ — з un / una (Necesito un bolígrafo); конкретна, уже відома річ — з el / la (Necesito el bolígrafo); невизначена кількість — без артикля (Necesito pan).'),
        ex('Necesito un bolígrafo.', 'Мені потрібна ручка.'),
        ex('Necesitamos agua.', 'Нам потрібна вода.'),
        ex('Necesito descansar.', 'Мені треба відпочити.'),
        uk('Не плутай: Me gusta el café — «мені подобається кава»; Necesito un café — «мені потрібна кава».'),
      ],
    },
    { kind: 'supported-practice', title: 'Практика зі зразком', tasks: [k.id(1), k.id(2), k.id(13), k.id(14)] },
    { kind: 'independent-practice', title: 'Самостійна практика', tasks: [k.id(11), k.id(3), k.id(4), k.id(5), k.id(6), k.id(15), k.id(16), k.id(17), k.id(18)] },
    { kind: 'summary', title: 'Підсумок', blocks: [ul('Necesito + річ: Necesito un paraguas.', 'Necesito + інфінітив: Necesito comprar pan.', 'Людина — підмет: necesito, necesitas… (не «me necesita»).')] },
  ],
});
