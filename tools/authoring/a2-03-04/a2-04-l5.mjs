// A2-04-L5 — frequent irregular indefinido forms (A2-04-O6). The shared strong endings are one skill
// (tasks give the stem, so the evidence is about the ending and the missing accent); every verb is
// its own skill with its own 10-task bank (2 supported, 4 independent incl. one choice, 2 delayed,
// 2 transfer). Taught in three labelled groups inside the lesson.
import { choice, es, esTable, ex, exact, lesson, step, uk, ukList } from './lib.mjs';

const L = 'A2-04-L5';
const INSTR = 'Впишіть дієслово в дужках у простому минулому часі (pretérito indefinido).';
const num = (n) => `T${String(n).padStart(2, '0')}`;
const capFirst = (s) => s.replace(/^([¿¡]?)(\p{Ll})/u, (_m, a, b) => a + b.toUpperCase());
const fill = (sentence, form) => {
  let r;
  if (/___ \([^)]*\)/.test(sentence)) r = sentence.replace(/___ \([^)]*\)/, form);
  else if (/\([^)]*\) ___/.test(sentence)) r = sentence.replace(/\([^)]*\) ___/, form);
  else r = sentence.replace('___', form);
  return capFirst(r);
};
const paradigm = (verb, forms) => esTable(['sujeto', verb], [
  ['yo', forms[0]], ['tú', forms[1]], ['él / ella / usted', forms[2]],
  ['nosotros / nosotras', forms[3]], ['vosotros / vosotras', forms[4]], ['ellos / ellas / ustedes', forms[5]],
]);
const NO_ACC = (f) => `Ці форми пишемо без знака наголосу: ${f}.`;
const PRES = (w, f) => `${w} — теперішній час. Ідеться про минуле: ${f}.`;
const PERSON = (w, f) => `${w} — форма іншої особи. Тут потрібно ${f}.`;

/** rows: [n, role, family, sentence, form, fullUk, errors | null, choiceWrong?] */
const BANKS = [
  {
    skill: 'indefinido.strong-endings', group: 'A',
    rule: 'Дієслова з особливою основою мають закінчення -e, -iste, -o, -imos, -isteis, -ieron, а форми yo та él / ella / usted пишуться без знака наголосу: tuve, tuvo (не *tuvé, *tuvó).',
    table: esTable(['sujeto', 'terminación', 'estar → estuv-'], [['yo', '-e', 'estuve'], ['tú', '-iste', 'estuviste'], ['él / ella / usted', '-o', 'estuvo'], ['nosotros / nosotras', '-imos', 'estuvimos'], ['vosotros / vosotras', '-isteis', 'estuvisteis'], ['ellos / ellas / ustedes', '-ieron', 'estuvieron']].map((r) => r)),
    instr: 'Основу вже дано. Додайте закінчення і впишіть форму повністю.',
    rows: [
      [1, 'supported', 'routine', 'Ayer (yo; estar → estuv-) ___ en casa.', 'estuve', 'Учора я був(-ла) вдома.', [['estuvé', NO_ACC('estuve')], ['estuví', 'Закінчення yo в цих дієсловах — -e: estuve.']]],
      [2, 'supported', 'home', 'Anoche Ana (tener → tuv-) ___ mucho sueño.', 'tuvo', 'Учора ввечері Ана дуже хотіла спати.', [['tuvó', NO_ACC('tuvo')], ['tuvió', 'Закінчення él / ella — -o: tuvo.']]],
      [3, 'independent', 'routine', 'El sábado (nosotros; poner → pus-) ___ música en casa.', 'pusimos', 'У суботу ми ввімкнули вдома музику.', [['pusemos', 'Закінчення nosotros — -imos: pusimos.']]],
      [4, 'independent', 'work-study', 'Ayer mis amigos no (poder → pud-) ___ venir.', 'pudieron', 'Учора мої друзі не змогли прийти.', [['puderon', 'Закінчення ellos — -ieron: pudieron.']]],
      [5, 'independent', 'home', '¿(tú; venir → vin-) ___ en autobús?', 'viniste', 'Ти приїхав(-ла) автобусом?', [['vinistes', 'Для tú — viniste, без -s у кінці.'], ].filter((e) => e[1])],
      [6, 'independent', 'routine', 'Ayer mi hermano (querer → quis-) ___ salir.', 'quiso', 'Учора мій брат хотів вийти.', null, ['quisó', 'quisio', 'quise']],
      [7, 'delayed', 'routine', '¿(vosotros; estar → estuv-) ___ en Toledo?', 'estuvisteis', 'Ви були в Толедо?', [['estuvistes', 'Для vosotros — estuvisteis.']]],
      [8, 'delayed', 'home', 'Anoche (yo; hacer → hic-) ___ la cena.', 'hice', 'Учора ввечері я приготував(-ла) вечерю.', [['hicé', NO_ACC('hice')]]],
      [9, 'transfer', 'messages', '¡Hola, Pedro! Ayer (nosotros; tener → tuv-) ___ un problema con el coche.', 'tuvimos', 'Привіт, Педро! Учора в нас була проблема з машиною.', [['tuvemos', 'Закінчення nosotros — -imos: tuvimos.']]],
      [10, 'transfer', 'travel', 'El año pasado mis padres (estar → estuv-) ___ en Sevilla.', 'estuvieron', 'Минулого року мої батьки були в Севільї.', [['estuveron', 'Закінчення ellos — -ieron: estuvieron.']]],
    ],
    choiceFb: { 'quisó': NO_ACC('quiso'), 'quisio': 'Закінчення él / ella — -o: quiso.', 'quise': PERSON('Quise (yo)', 'quiso') },
  },
  {
    skill: 'indefinido.tener', group: 'A', inf: 'tener',
    rule: 'Tener у простому минулому: tuve, tuviste, tuvo, tuvimos, tuvisteis, tuvieron (основа tuv-, без знака наголосу).',
    table: paradigm('tener', ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron']),
    rows: [
      [11, 'supported', 'work-study', 'Ayer (yo, tener) ___ una reunión muy larga.', 'tuve', 'Учора в мене була дуже довга нарада.', [['tuvé', NO_ACC('tuve')], ['tení', 'Tener має особливу основу tuv-: tuve.'], ['tengo', PRES('Tengo', 'tuve')]]],
      [12, 'supported', 'home', 'La semana pasada mi hermana (tener) ___ un examen.', 'tuvo', 'Минулого тижня в моєї сестри був іспит.', [['tuvó', NO_ACC('tuvo')], ['tenió', 'Tener має особливу основу tuv-: tuvo.'], ['tiene', PRES('Tiene', 'tuvo')]]],
      [13, 'independent', 'home', '¿(tú, tener) ___ frío anoche?', 'tuviste', 'Тобі було холодно вчора вночі?', [['tuvistes', 'Для tú — tuviste, без -s.'], ['teniste', 'Tener має особливу основу tuv-: tuviste.']]],
      [14, 'independent', 'work-study', 'El lunes (nosotros, tener) ___ clase a las nueve.', 'tuvimos', 'У понеділок у нас було заняття о дев’ятій.', [['tenimos', 'Tener має особливу основу tuv-: tuvimos.'], ['tenemos', PRES('Tenemos', 'tuvimos')]]],
      [15, 'independent', 'home', 'El sábado mis padres (tener) ___ un problema con el coche.', 'tuvieron', 'У суботу в моїх батьків була проблема з машиною.', [['tenieron', 'Tener має особливу основу tuv-: tuvieron.'], ['tuvo', PERSON('Tuvo (él / ella)', 'tuvieron')]]],
      [16, 'independent', 'work-study', 'Ayer Luis ___ (tener) mucho trabajo.', 'tuvo', 'Учора в Луїса було багато роботи.', null, ['tuvó', 'tenió', 'tiene']],
      [17, 'delayed', 'home', 'Anoche (yo, tener) ___ mucha hambre.', 'tuve', 'Учора ввечері я був(-ла) дуже голодний(-на).', [['tuvé', NO_ACC('tuve')], ['tení', 'Tener має особливу основу tuv-: tuve.']]],
      [18, 'delayed', 'work-study', '¿(vosotros, tener) ___ vacaciones en agosto?', 'tuvisteis', 'У вас була відпустка в серпні?', [['tuvistes', 'Для vosotros — tuvisteis.'], ['tenisteis', 'Tener має особливу основу tuv-: tuvisteis.']]],
      [19, 'transfer', 'messages', '¡Hola, Ana! ¿Qué tal? Ayer (yo, tener) ___ un día muy largo.', 'tuve', 'Привіт, Ано! Як справи? Учора в мене був дуже довгий день.', [['tuvé', NO_ACC('tuve')]]],
      [20, 'transfer', 'travel', 'Ayer el tren de Madrid (tener) ___ un problema.', 'tuvo', 'Учора з мадридським потягом сталася проблема.', [['tuvó', NO_ACC('tuvo')], ['tenió', 'Tener має особливу основу tuv-: tuvo.']]],
    ],
    choiceFb: { 'tuvó': NO_ACC('tuvo'), 'tenió': 'Tener має особливу основу tuv-: tuvo.', 'tiene': PRES('Tiene', 'tuvo') },
  },
  {
    skill: 'indefinido.estar', group: 'A', inf: 'estar',
    rule: 'Estar у простому минулому: estuve, estuviste, estuvo, estuvimos, estuvisteis, estuvieron (основа estuv-, без знака наголосу).',
    table: paradigm('estar', ['estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvisteis', 'estuvieron']),
    rows: [
      [21, 'supported', 'travel', 'El verano pasado (yo, estar) ___ en Valencia.', 'estuve', 'Минулого літа я був(-ла) у Валенсії.', [['estuvé', NO_ACC('estuve')], ['esté', 'Estar має особливу основу estuv-: estuve.'], ['estoy', PRES('Estoy', 'estuve')]]],
      [22, 'supported', 'home', 'Ayer Ana (estar) ___ enferma.', 'estuvo', 'Учора Ана хворіла.', [['estuvó', NO_ACC('estuvo')], ['estó', 'Estar має особливу основу estuv-: estuvo.'], ['está', PRES('Está', 'estuvo')]]],
      [23, 'independent', 'travel', 'El año pasado (nosotros, estar) ___ en Sevilla.', 'estuvimos', 'Минулого року ми були в Севільї.', [['estamos', PRES('Estamos', 'estuvimos')], ['estuvemos', 'Закінчення nosotros — -imos: estuvimos.']]],
      [24, 'independent', 'home', '¿Dónde (tú, estar) ___ ayer por la tarde?', 'estuviste', 'Де ти був(-ла) вчора по обіді?', [['estuvistes', 'Для tú — estuviste, без -s.'], ['estaste', 'Estar має особливу основу estuv-: estuviste.']]],
      [25, 'independent', 'work-study', 'Ayer mis padres (estar) ___ en la oficina por la tarde.', 'estuvieron', 'Учора мої батьки були в офісі після обіду.', [['estaron', 'Estar має особливу основу estuv-: estuvieron.'], ['estuvo', PERSON('Estuvo (él / ella)', 'estuvieron')]]],
      [26, 'independent', 'travel', 'El fin de semana pasado Luis ___ (estar) en Toledo.', 'estuvo', 'Минулих вихідних Луїс був у Толедо.', null, ['estuvó', 'estó', 'está']],
      [27, 'delayed', 'home', 'Anteayer (yo, estar) ___ en casa de mis padres.', 'estuve', 'Позавчора я був(-ла) у батьків.', [['estuvé', NO_ACC('estuve')]]],
      [28, 'delayed', 'travel', '¿(vosotros, estar) ___ en la playa el domingo?', 'estuvisteis', 'Ви були на пляжі в неділю?', [['estuvistes', 'Для vosotros — estuvisteis.']]],
      [29, 'transfer', 'messages', '¡Hola, Marta! Ayer no te vi. ¿(tú, estar) ___ enferma?', 'estuviste', 'Привіт, Марто! Учора я тебе не бачив(-ла). Ти хворіла?', [['estuvistes', 'Для tú — estuviste, без -s.']]],
      [30, 'transfer', 'meetings', 'La reunión (estar) ___ muy bien.', 'estuvo', 'Нарада пройшла дуже добре.', [['estuvó', NO_ACC('estuvo')]]],
    ],
    choiceFb: { 'estuvó': NO_ACC('estuvo'), 'estó': 'Estar має особливу основу estuv-: estuvo.', 'está': PRES('Está', 'estuvo') },
  },
  {
    skill: 'indefinido.poder', group: 'A', inf: 'poder',
    rule: 'Poder у простому минулому: pude, pudiste, pudo, pudimos, pudisteis, pudieron (основа pud-, без знака наголосу). No pude venir — «я не зміг (не змогла) прийти».',
    table: paradigm('poder', ['pude', 'pudiste', 'pudo', 'pudimos', 'pudisteis', 'pudieron']),
    rows: [
      [31, 'supported', 'work-study', 'Ayer (yo) no (poder) ___ ir a clase.', 'pude', 'Учора я не зміг (не змогла) піти на заняття.', [['pudé', NO_ACC('pude')], ['podí', 'Poder має особливу основу pud-: pude.'], ['puedo', PRES('Puedo', 'pude')]]],
      [32, 'supported', 'home', 'Anoche Ana no (poder) ___ dormir.', 'pudo', 'Учора вночі Ана не могла заснути.', [['pudó', NO_ACC('pudo')], ['podió', 'Poder має особливу основу pud-: pudo.'], ['puede', PRES('Puede', 'pudo')]]],
      [33, 'independent', 'work-study', '¿(tú, poder) ___ hablar con el profesor?', 'pudiste', 'Тобі вдалося поговорити з викладачем?', [['pudistes', 'Для tú — pudiste, без -s.'], ['podiste', 'Poder має особливу основу pud-: pudiste.']]],
      [34, 'independent', 'home', 'El domingo (nosotros) no (poder) ___ salir de casa.', 'pudimos', 'У неділю ми не змогли вийти з дому.', [['podimos', 'Poder має особливу основу pud-: pudimos.'], ['podemos', PRES('Podemos', 'pudimos')]]],
      [35, 'independent', 'work-study', 'Ayer los estudiantes no (poder) ___ terminar el examen.', 'pudieron', 'Учора студенти не змогли закінчити іспит.', [['podieron', 'Poder має особливу основу pud-: pudieron.'], ['pudo', PERSON('Pudo (él / ella)', 'pudieron')]]],
      [36, 'independent', 'home', 'Ayer Luis no ___ (poder) venir a cenar.', 'pudo', 'Учора Луїс не зміг прийти на вечерю.', null, ['pudó', 'podió', 'puede']],
      [37, 'delayed', 'home', 'Anoche (yo) no (poder) ___ ver la película.', 'pude', 'Учора ввечері я не зміг (не змогла) подивитися фільм.', [['pudé', NO_ACC('pude')], ['podí', 'Poder має особливу основу pud-: pude.']]],
      [38, 'delayed', 'work-study', '¿(vosotros, poder) ___ hablar con la profesora?', 'pudisteis', 'Вам вдалося поговорити з викладачкою?', [['pudistes', 'Для vosotros — pudisteis.'], ['podisteis', 'Poder має особливу основу pud-: pudisteis.']]],
      [39, 'transfer', 'messages', '¡Hola, Pablo! Lo siento, ayer no (poder) ___ ir a tu cumpleaños.', 'pude', 'Привіт, Пабло! Вибач, учора я не зміг (не змогла) прийти на твій день народження.', [['pudé', NO_ACC('pude')]]],
      [40, 'transfer', 'travel', 'El sábado mis padres no (poder) ___ coger el tren.', 'pudieron', 'У суботу мої батьки не встигли на потяг.', [['podieron', 'Poder має особливу основу pud-: pudieron.']]],
    ],
    choiceFb: { 'pudó': NO_ACC('pudo'), 'podió': 'Poder має особливу основу pud-: pudo.', 'puede': PRES('Puede', 'pudo') },
  },
  {
    skill: 'indefinido.poner', group: 'A', inf: 'poner',
    rule: 'Poner у простому минулому: puse, pusiste, puso, pusimos, pusisteis, pusieron (основа pus-, без знака наголосу).',
    table: paradigm('poner', ['puse', 'pusiste', 'puso', 'pusimos', 'pusisteis', 'pusieron']),
    rows: [
      [41, 'supported', 'home', 'Ayer (yo, poner) ___ las llaves en la mesa.', 'puse', 'Учора я поклав(-ла) ключі на стіл.', [['pusé', NO_ACC('puse')], ['poní', 'Poner має особливу основу pus-: puse.'], ['pongo', PRES('Pongo', 'puse')]]],
      [42, 'supported', 'work-study', 'Ayer el profesor (poner) ___ un examen muy fácil.', 'puso', 'Учора викладач дав дуже легкий іспит.', [['pusó', NO_ACC('puso')], ['ponió', 'Poner має особливу основу pus-: puso.'], ['pone', PRES('Pone', 'puso')]]],
      [43, 'independent', 'home', '¿Dónde (tú, poner) ___ mi libro?', 'pusiste', 'Куди ти поклав(-ла) мою книжку?', [['pusistes', 'Для tú — pusiste, без -s.'], ['poniste', 'Poner має особливу основу pus-: pusiste.']]],
      [44, 'independent', 'home', 'Anoche (nosotros, poner) ___ la leche en la nevera.', 'pusimos', 'Учора ввечері ми поставили молоко в холодильник.', [['ponimos', 'Poner має особливу основу pus-: pusimos.'], ['ponemos', PRES('Ponemos', 'pusimos')]]],
      [45, 'independent', 'work-study', 'La semana pasada (ellos, poner) ___ ordenadores nuevos en la oficina.', 'pusieron', 'Минулого тижня в офісі поставили нові комп’ютери.', [['ponieron', 'Poner має особливу основу pus-: pusieron.'], ['puso', PERSON('Puso (él / ella)', 'pusieron')]]],
      [46, 'independent', 'home', 'Ayer mi madre ___ (poner) flores en la mesa.', 'puso', 'Учора мама поставила квіти на стіл.', null, ['pusó', 'ponió', 'pone']],
      [47, 'delayed', 'home', 'Anoche (yo, poner) ___ el móvil encima de la mesa.', 'puse', 'Учора ввечері я поклав(-ла) мобільний на стіл.', [['pusé', NO_ACC('puse')], ['poní', 'Poner має особливу основу pus-: puse.']]],
      [48, 'delayed', 'work-study', '¿(vosotros, poner) ___ los libros en la mochila?', 'pusisteis', 'Ви поклали книжки в рюкзак?', [['pusistes', 'Для vosotros — pusisteis.'], ['ponisteis', 'Poner має особливу основу pus-: pusisteis.']]],
      [49, 'transfer', 'messages', '¡Hola, Luis! Ayer (yo, poner) ___ tus gafas en tu mochila.', 'puse', 'Привіт, Луїсе! Учора я поклав(-ла) твої окуляри в твій рюкзак.', [['pusé', NO_ACC('puse')]]],
      [50, 'transfer', 'leisure', 'Anoche en el bar (ellos, poner) ___ música.', 'pusieron', 'Учора ввечері в барі ввімкнули музику.', [['ponieron', 'Poner має особливу основу pus-: pusieron.']]],
    ],
    choiceFb: { 'pusó': NO_ACC('puso'), 'ponió': 'Poner має особливу основу pus-: puso.', 'pone': PRES('Pone', 'puso') },
  },
  {
    skill: 'indefinido.hacer', group: 'B', inf: 'hacer',
    rule: 'Hacer у простому минулому: hice, hiciste, hizo, hicimos, hicisteis, hicieron (основа hic-; у 3-й особі однини — hizo, з z). Без знака наголосу.',
    table: paradigm('hacer', ['hice', 'hiciste', 'hizo', 'hicimos', 'hicisteis', 'hicieron']),
    rows: [
      [51, 'supported', 'home', 'Ayer (yo, hacer) ___ la compra.', 'hice', 'Учора я купив(-ла) продукти.', [['hicé', NO_ACC('hice')], ['hací', 'Hacer має особливу основу hic-: hice.'], ['hago', PRES('Hago', 'hice')]]],
      [52, 'supported', 'leisure', 'El sábado Ana (hacer) ___ muchas fotos.', 'hizo', 'У суботу Ана зробила багато фото.', [['hico', 'У 3-й особі однини c змінюється на z: hizo.'], ['hizó', NO_ACC('hizo')], ['hace', PRES('Hace', 'hizo')]]],
      [53, 'independent', 'home', '¿Qué (tú, hacer) ___ ayer por la tarde?', 'hiciste', 'Що ти робив(-ла) вчора по обіді?', [['hicistes', 'Для tú — hiciste, без -s.'], ['haciste', 'Hacer має особливу основу hic-: hiciste.']]],
      [54, 'independent', 'leisure', 'El domingo (nosotros, hacer) ___ deporte en el parque.', 'hicimos', 'У неділю ми займалися спортом у парку.', [['hacimos', 'Hacer має особливу основу hic-: hicimos.'], ['hacemos', PRES('Hacemos', 'hicimos')]]],
      [55, 'independent', 'home', 'Anoche mis hermanos (hacer) ___ la cena.', 'hicieron', 'Учора ввечері мої брати приготували вечерю.', [['hacieron', 'Hacer має особливу основу hic-: hicieron.'], ['hizo', PERSON('Hizo (él / ella)', 'hicieron')]]],
      [56, 'independent', 'leisure', 'El verano pasado mi padre ___ (hacer) muchas fotos en Sevilla.', 'hizo', 'Минулого літа мій тато зробив багато фото в Севільї.', null, ['hico', 'hizó', 'hace']],
      [57, 'delayed', 'home', 'Anteayer (yo, hacer) ___ la comida.', 'hice', 'Позавчора я приготував(-ла) обід.', [['hicé', NO_ACC('hice')], ['hací', 'Hacer має особливу основу hic-: hice.']]],
      [58, 'delayed', 'leisure', '¿Qué (vosotros, hacer) ___ el fin de semana pasado?', 'hicisteis', 'Що ви робили минулих вихідних?', [['hicistes', 'Для vosotros — hicisteis.'], ['hacisteis', 'Hacer має особливу основу hic-: hicisteis.']]],
      [59, 'transfer', 'messages', '¡Hola, Marta! ¿Qué (tú, hacer) ___ el sábado?', 'hiciste', 'Привіт, Марто! Що ти робила в суботу?', [['hicistes', 'Для tú — hiciste, без -s.']]],
      [60, 'transfer', 'weather', 'Ayer (hacer) ___ mucho calor en Madrid.', 'hizo', 'Учора в Мадриді було дуже спекотно.', [['hico', 'У 3-й особі однини c змінюється на z: hizo.'], ['hizó', NO_ACC('hizo')]]],
    ],
    choiceFb: { 'hico': 'У 3-й особі однини c змінюється на z: hizo.', 'hizó': NO_ACC('hizo'), 'hace': PRES('Hace', 'hizo') },
  },
  {
    skill: 'indefinido.venir', group: 'B', inf: 'venir',
    rule: 'Venir у простому минулому: vine, viniste, vino, vinimos, vinisteis, vinieron (основа vin-, без знака наголосу). Vino — і «прийшов», і «вино»: розрізняємо за контекстом.',
    table: paradigm('venir', ['vine', 'viniste', 'vino', 'vinimos', 'vinisteis', 'vinieron']),
    rows: [
      [61, 'supported', 'work-study', 'Ayer (yo, venir) ___ a la oficina en autobús.', 'vine', 'Учора я приїхав(-ла) в офіс автобусом.', [['viné', NO_ACC('vine')], ['vení', 'Venir має особливу основу vin-: vine.'], ['vengo', PRES('Vengo', 'vine')]]],
      [62, 'supported', 'home', 'El sábado mis padres (venir) ___ a cenar.', 'vinieron', 'У суботу мої батьки прийшли на вечерю.', [['venieron', 'Venir має особливу основу vin-: vinieron.'], ['vienen', PRES('Vienen', 'vinieron')]]],
      [63, 'independent', 'home', '¿Por qué no (tú, venir) ___ a la cena de Ana?', 'viniste', 'Чому ти не прийшов(-ла) на вечерю до Ани?', [['vinistes', 'Для tú — viniste, без -s.'], ['veniste', 'Venir має особливу основу vin-: viniste.']]],
      [64, 'independent', 'work-study', 'Ayer el profesor (venir) ___ tarde a clase.', 'vino', 'Учора викладач запізнився на заняття.', [['vinó', NO_ACC('vino')], ['venió', 'Venir має особливу основу vin-: vino.'], ['viene', PRES('Viene', 'vino')]]],
      [65, 'independent', 'travel', 'El año pasado (nosotros, venir) ___ a España en verano.', 'vinimos', 'Минулого року ми приїхали до Іспанії влітку.', [['venimos', 'Venimos — теперішній час. У минулому основа vin-: vinimos.']]],
      [66, 'independent', 'home', 'Anoche Pedro ___ (venir) a casa muy tarde.', 'vino', 'Учора ввечері Педро прийшов додому дуже пізно.', null, ['vinó', 'venió', 'viene']],
      [67, 'delayed', 'home', 'Anteayer (yo, venir) ___ a casa a las diez.', 'vine', 'Позавчора я прийшов(-ла) додому о десятій.', [['viné', NO_ACC('vine')], ['vení', 'Venir має особливу основу vin-: vine.']]],
      [68, 'delayed', 'work-study', '¿Cómo (vosotros, venir) ___ a la universidad?', 'vinisteis', 'Як ви добралися до університету?', [['vinistes', 'Для vosotros — vinisteis.'], ['venisteis', 'Venir має особливу основу vin-: vinisteis.']]],
      [69, 'transfer', 'messages', '¡Hola, Ana! Ayer tus amigos (venir) ___ a mi casa.', 'vinieron', 'Привіт, Ано! Учора твої друзі приходили до мене додому.', [['venieron', 'Venir має особливу основу vin-: vinieron.']]],
      [70, 'transfer', 'transport', 'El tren de Valencia (venir) ___ muy tarde.', 'vino', 'Потяг із Валенсії прибув дуже пізно.', [['vinó', NO_ACC('vino')], ['venió', 'Venir має особливу основу vin-: vino.']]],
    ],
    choiceFb: { 'vinó': NO_ACC('vino'), 'venió': 'Venir має особливу основу vin-: vino.', 'viene': PRES('Viene', 'vino') },
  },
  {
    skill: 'indefinido.querer', group: 'B', inf: 'querer',
    rule: 'Querer у простому минулому: quise, quisiste, quiso, quisimos, quisisteis, quisieron (основа quis-, без знака наголосу).',
    table: paradigm('querer', ['quise', 'quisiste', 'quiso', 'quisimos', 'quisisteis', 'quisieron']),
    rows: [
      [71, 'supported', 'shopping', 'Ayer (yo, querer) ___ comprar pan, pero no pude.', 'quise', 'Учора я хотів(-ла) купити хліб, але не зміг (не змогла).', [['quisé', NO_ACC('quise')], ['querí', 'Querer має особливу основу quis-: quise.'], ['quiero', PRES('Quiero', 'quise')]]],
      [72, 'supported', 'home', 'Anoche el niño no (querer) ___ cenar.', 'quiso', 'Учора ввечері хлопчик не захотів вечеряти.', [['quisó', NO_ACC('quiso')], ['querió', 'Querer має особливу основу quis-: quiso.'], ['quiere', PRES('Quiere', 'quiso')]]],
      [73, 'independent', 'leisure', 'El sábado (nosotros, querer) ___ ir a la playa.', 'quisimos', 'У суботу ми хотіли поїхати на пляж.', [['querimos', 'Querer має особливу основу quis-: quisimos.'], ['queremos', PRES('Queremos', 'quisimos')]]],
      [74, 'independent', 'home', '¿Por qué no (tú, querer) ___ venir?', 'quisiste', 'Чому ти не захотів(-ла) прийти?', [['quisistes', 'Для tú — quisiste, без -s.'], ['quereste', 'Querer має особливу основу quis-: quisiste.']]],
      [75, 'independent', 'leisure', 'Mis amigos no (querer) ___ ver la película.', 'quisieron', 'Мої друзі не захотіли дивитися фільм.', [['querieron', 'Querer має особливу основу quis-: quisieron.'], ['quiso', PERSON('Quiso (él / ella)', 'quisieron')]]],
      [76, 'independent', 'home', 'Ayer Ana no ___ (querer) salir de casa.', 'quiso', 'Учора Ана не захотіла виходити з дому.', null, ['quisó', 'querió', 'quiere']],
      [77, 'delayed', 'leisure', 'El verano pasado (yo, querer) ___ viajar a Sevilla.', 'quise', 'Минулого літа я хотів(-ла) поїхати до Севільї.', [['quisé', NO_ACC('quise')], ['querí', 'Querer має особливу основу quis-: quise.']]],
      [78, 'delayed', 'home', '¿(vosotros, querer) ___ cenar en casa?', 'quisisteis', 'Ви захотіли повечеряти вдома?', [['quisistes', 'Для vosotros — quisisteis.'], ['queristeis', 'Querer має особливу основу quis-: quisisteis.']]],
      [79, 'transfer', 'messages', '¡Hola, Luis! Ayer (yo, querer) ___ escribirte, pero no pude.', 'quise', 'Привіт, Луїсе! Учора я хотів(-ла) тобі написати, але не зміг (не змогла).', [['quisé', NO_ACC('quise')]]],
      [80, 'transfer', 'work-study', 'Los estudiantes (querer) ___ hablar con el profesor.', 'quisieron', 'Студенти захотіли поговорити з викладачем.', [['querieron', 'Querer має особливу основу quis-: quisieron.']]],
    ],
    choiceFb: { 'quisó': NO_ACC('quiso'), 'querió': 'Querer має особливу основу quis-: quiso.', 'quiere': PRES('Quiere', 'quiso') },
  },
  {
    skill: 'indefinido.decir', group: 'B', inf: 'decir',
    rule: 'Decir у простому минулому: dije, dijiste, dijo, dijimos, dijisteis, dijeron (основа dij-; після j у 3-й особі множини — -eron, не *dijieron). Без знака наголосу.',
    table: paradigm('decir', ['dije', 'dijiste', 'dijo', 'dijimos', 'dijisteis', 'dijeron']),
    rows: [
      [81, 'supported', 'home', '¿Qué te (decir) ___ Ana ayer?', 'dijo', 'Що тобі вчора сказала Ана?', [['dijó', NO_ACC('dijo')], ['deció', 'Decir має особливу основу dij-: dijo.'], ['dice', PRES('Dice', 'dijo')]]],
      [82, 'supported', 'work-study', 'Ayer en la oficina me (decir) ___ que mañana no hay reunión.', 'dijeron', 'Учора в офісі мені сказали, що завтра наради не буде.', [['dijieron', 'Після j пишемо -eron: dijeron.'], ['decieron', 'Decir має особливу основу dij-: dijeron.']]],
      [83, 'independent', 'home', 'Anoche (yo) le (decir) ___ a mi madre que voy a cenar en casa.', 'dije', 'Учора ввечері я сказав(-ла) мамі, що вечерятиму вдома.', [['dijé', NO_ACC('dije')], ['decí', 'Decir має особливу основу dij-: dije.']]],
      [84, 'independent', 'work-study', '¿Qué (tú, decir) ___ en la reunión?', 'dijiste', 'Що ти сказав(-ла) на нараді?', [['dijistes', 'Для tú — dijiste, без -s.'], ['deciste', 'Decir має особливу основу dij-: dijiste.']]],
      [85, 'independent', 'home', 'Mis padres no me (decir) ___ nada.', 'dijeron', 'Батьки мені нічого не сказали.', [['dijieron', 'Після j пишемо -eron: dijeron.'], ['dijo', PERSON('Dijo (él / ella)', 'dijeron')]]],
      [86, 'independent', 'work-study', 'El profesor nos ___ (decir) la fecha del examen.', 'dijo', 'Викладач сказав нам дату іспиту.', null, ['dijó', 'deció', 'dice']],
      [87, 'delayed', 'home', 'Ayer (nosotros) le (decir) ___ a Luis que sí.', 'dijimos', 'Учора ми сказали Луїсу «так».', [['decimos', 'Decimos — теперішній час. У минулому основа dij-: dijimos.']]],
      [88, 'delayed', 'work-study', 'En la oficina me (decir) ___ que el profesor no está.', 'dijeron', 'В офісі мені сказали, що викладача немає.', [['dijieron', 'Після j пишемо -eron: dijeron.']]],
      [89, 'transfer', 'messages', '¡Hola, Pedro! ¿Qué te (decir) ___ el médico?', 'dijo', 'Привіт, Педро! Що тобі сказав лікар?', [['dijó', NO_ACC('dijo')], ['deció', 'Decir має особливу основу dij-: dijo.']]],
      [90, 'transfer', 'shopping', 'En la tienda me (decir) ___ el precio.', 'dijeron', 'У магазині мені сказали ціну.', [['dijieron', 'Після j пишемо -eron: dijeron.']]],
    ],
    choiceFb: { 'dijó': NO_ACC('dijo'), 'deció': 'Decir має особливу основу dij-: dijo.', 'dice': PRES('Dice', 'dijo') },
  },
  {
    skill: 'indefinido.dar', group: 'C', inf: 'dar',
    rule: 'Dar, хоч і на -ar, у простому минулому має закінчення дієслів на -er / -ir: di, diste, dio, dimos, disteis, dieron. Di і dio — односкладові, тому без знака наголосу.',
    table: paradigm('dar', ['di', 'diste', 'dio', 'dimos', 'disteis', 'dieron']),
    rows: [
      [91, 'supported', 'home', 'Ayer (yo) le (dar) ___ un regalo a mi hermana.', 'di', 'Учора я подарував(-ла) сестрі подарунок.', [['dí', 'Di — односкладова форма, без знака наголосу.'], ['dé', 'Dar має закінчення -er / -ir: di.'], ['doy', PRES('Doy', 'di')]]],
      [92, 'supported', 'shopping', 'El camarero me (dar) ___ la cuenta.', 'dio', 'Офіціант дав мені рахунок.', [['dió', 'Dio — односкладова форма, без знака наголосу.'], ['dó', 'Dar має закінчення -er / -ir: dio.'], ['da', PRES('Da', 'dio')]]],
      [93, 'independent', 'home', '¿Qué te (dar) ___ tus padres en tu cumpleaños?', 'dieron', 'Що тобі подарували батьки на день народження?', [['daron', 'Dar має закінчення -er / -ir: dieron.'], ['dan', PRES('Dan', 'dieron')]]],
      [94, 'independent', 'work-study', 'Ayer el profesor nos (dar) ___ mucha tarea.', 'dio', 'Учора викладач дав нам багато завдань.', [['dió', 'Dio — односкладова форма, без знака наголосу.'], ['dieron', PERSON('Dieron (ellos)', 'dio')]]],
      [95, 'independent', 'home', '¿(tú) le (dar) ___ las llaves a Luis?', 'diste', 'Ти віддав(-ла) ключі Луїсу?', [['distes', 'Для tú — diste, без -s.'], ['daste', 'Dar має закінчення -er / -ir: diste.']]],
      [96, 'independent', 'shopping', 'En la tienda me ___ (dar) el precio.', 'dieron', 'У магазині мені назвали ціну.', null, ['daron', 'dio', 'dan']],
      [97, 'delayed', 'home', 'El sábado (nosotros) le (dar) ___ flores a nuestra madre.', 'dimos', 'У суботу ми подарували мамі квіти.', [['damos', 'Damos — теперішній час. У минулому: dimos.']]],
      [98, 'delayed', 'work-study', 'Ayer Ana me (dar) ___ su número de teléfono.', 'dio', 'Учора Ана дала мені свій номер телефону.', [['dió', 'Dio — односкладова форма, без знака наголосу.']]],
      [99, 'transfer', 'messages', '¡Hola, Marta! ¿Qué libro me (dar) ___ ayer?', 'diste', 'Привіт, Марто! Яку книжку ти мені вчора дала?', [['distes', 'Для tú — diste, без -s.'], ['daste', 'Dar має закінчення -er / -ir: diste.']]],
      [100, 'transfer', 'travel', 'En el hotel nos (dar) ___ una habitación muy bonita.', 'dieron', 'У готелі нам дали дуже гарний номер.', [['daron', 'Dar має закінчення -er / -ir: dieron.']]],
    ],
    choiceFb: { 'daron': 'Dar має закінчення -er / -ir: dieron.', 'dio': PERSON('Dio (él / ella)', 'dieron'), 'dan': PRES('Dan', 'dieron') },
  },
  {
    skill: 'indefinido.ver', group: 'C', inf: 'ver',
    rule: 'Ver у простому минулому: vi, viste, vio, vimos, visteis, vieron. Vi і vio — односкладові, тому без знака наголосу.',
    table: paradigm('ver', ['vi', 'viste', 'vio', 'vimos', 'visteis', 'vieron']),
    rows: [
      [101, 'supported', 'leisure', 'Anoche (yo, ver) ___ una película muy interesante.', 'vi', 'Учора ввечері я подивився(-лася) дуже цікавий фільм.', [['ví', 'Vi — односкладова форма, без знака наголосу.'], ['veo', PRES('Veo', 'vi')]]],
      [102, 'supported', 'home', 'Ayer Ana (ver) ___ a tus padres en el parque.', 'vio', 'Учора Ана бачила твоїх батьків у парку.', [['vió', 'Vio — односкладова форма, без знака наголосу.'], ['ve', PRES('Ve', 'vio')]]],
      [103, 'independent', 'leisure', '¿(tú, ver) ___ la película de anoche?', 'viste', 'Ти дивився(-лася) вчорашній фільм?', [['vistes', 'Для tú — viste, без -s.'], ['veíste', 'Від ver правильно viste.']]],
      [104, 'independent', 'home', 'El domingo (nosotros, ver) ___ a Luis en la plaza.', 'vimos', 'У неділю ми бачили Луїса на площі.', [['vemos', 'Vemos — теперішній час. У минулому: vimos.']]],
      [105, 'independent', 'leisure', 'Mis amigos (ver) ___ el concierto en la plaza.', 'vieron', 'Мої друзі дивилися концерт на площі.', [['veieron', 'Від ver правильно vieron.'], ['vio', PERSON('Vio (él / ella)', 'vieron')]]],
      [106, 'independent', 'home', 'Ayer mi hermano ___ (ver) un perro muy grande.', 'vio', 'Учора мій брат бачив дуже великого собаку.', null, ['vió', 'veyó', 've']],
      [107, 'delayed', 'leisure', 'El sábado (yo, ver) ___ a Marta en el cine.', 'vi', 'У суботу я бачив(-ла) Марту в кіно.', [['ví', 'Vi — односкладова форма, без знака наголосу.']]],
      [108, 'delayed', 'home', '¿(vosotros, ver) ___ mis gafas?', 'visteis', 'Ви бачили мої окуляри?', [['vistéis', 'Visteis пишемо без знака наголосу.'], ['vistes', 'Для vosotros — visteis.']]],
      [109, 'transfer', 'messages', '¡Hola, Pablo! ¿(tú, ver) ___ mi mensaje de ayer?', 'viste', 'Привіт, Пабло! Ти бачив моє вчорашнє повідомлення?', [['vistes', 'Для tú — viste, без -s.']]],
      [110, 'transfer', 'travel', 'El verano pasado (nosotros, ver) ___ a mis padres en Valencia.', 'vimos', 'Минулого літа ми бачилися з моїми батьками у Валенсії.', [['vemos', 'Vemos — теперішній час. У минулому: vimos.']]],
    ],
    choiceFb: { 'vió': 'Vio — односкладова форма, без знака наголосу.', 'veyó': 'Від ver правильно vio.', 've': PRES('Ve', 'vio') },
  },
];

function bankTasks(b) {
  const target = [b.skill, 'written-form'];
  return b.rows.map(([n, role, family, sentence, form, fullUk, errors, choiceWrong]) => {
    const full = fill(sentence.replace(/\(([^;)]*); [^)]*\)/, '($1)'), form);
    const common = { id: num(n), lesson: L, role, family, target, rule: b.rule, full, fullUk, ok: `Правильно: ${form}.`, bad: `Правильна форма — ${form}: ${full}` };
    if (choiceWrong) {
      return choice({
        ...common,
        prompt: [uk('Оберіть правильну форму простого минулого часу.'), es(sentence)],
        options: [[form, true], ...choiceWrong.map((w) => [w, false, b.choiceFb[w]])],
      });
    }
    const supported = role === 'supported';
    return exact({
      ...common,
      prompt: [uk(`${family === 'messages' ? 'Повідомлення. ' : ''}${b.instr ?? INSTR}${supported ? ' Скористайтеся таблицею.' : ''}`), ...(supported ? [b.table] : []), es(sentence)],
      answers: [form], closed: true, errors,
    });
  });
}

export const BANKS_L5 = BANKS;
const tasks = BANKS.flatMap(bankTasks);
const by = (group, role) => tasks.filter((t) => BANKS.find((b) => b.skill === t.targets[0].skillId).group === group && t.role === role).map((t) => t.id);

export default {
  lesson: lesson({
    id: L,
    titleUk: 'Особливі форми простого минулого: tuve, hice, dije, di, vi',
    termEs: 'pretérito indefinido: verbos irregulares',
    summaryUk:
      'Десять частих дієслів з особливою основою або формами: tener, estar, poder, poner, hacer, venir, querer, decir, dar, ver. Спільні закінчення -e, -iste, -o… без знака наголосу; кожне дієслово тренуємо окремо, у трьох групах.',
    objectives: ['A2-04-O6'],
    situations: ['routine-study-leisure', 'people-family-home', 'personal-messages', 'food-shopping'],
    estimatedMinutes: 20,
    introduces: BANKS.map((b) => b.skill),
    revisits: ['indefinido.regular-ar', 'indefinido.regular-er-ir', 'ortho.indefinido-accent', 'present.tener', 'present.estar', 'present.hacer', 'present.yo-g', 'present.venir', 'present.decir', 'present.querer', 'present.dar', 'present.ver'],
    steps: [
      step('s1', 'explanation', 'Група 1: спільні закінчення; tener, estar, poder, poner', true, {
        blocks: [
          uk('Кілька частих дієслів мають у простому минулому особливу основу. Закінчення в них спільні: -e, -iste, -o, -imos, -isteis, -ieron, і форми yo та él / ella / usted пишуться без знака наголосу.'),
          esTable(['infinitivo', 'raíz', 'yo', 'él / ella'], [['tener', 'tuv-', 'tuve', 'tuvo'], ['estar', 'estuv-', 'estuve', 'estuvo'], ['poder', 'pud-', 'pude', 'pudo'], ['poner', 'pus-', 'puse', 'puso']]),
          ex('Ayer tuve una reunión.', 'Учора в мене була нарада.'),
          ex('El año pasado estuvimos en Sevilla.', 'Минулого року ми були в Севільї.'),
          ex('No pude venir.', 'Я не зміг (не змогла) прийти.'),
          ex('¿Dónde pusiste las llaves?', 'Куди ти поклав(-ла) ключі?'),
        ],
      }),
      step('s2', 'supported-practice', 'Група 1: практика з таблицею', true, { taskIds: by('A', 'supported') }),
      step('s3', 'independent-practice', 'Група 1: самостійна практика', true, { taskIds: by('A', 'independent') }),
      step('s4', 'explanation', 'Група 2: hacer, venir, querer, decir', true, {
        blocks: [
          esTable(['infinitivo', 'raíz', 'yo', 'él / ella', 'ellos'], [['hacer', 'hic-', 'hice', 'hizo', 'hicieron'], ['venir', 'vin-', 'vine', 'vino', 'vinieron'], ['querer', 'quis-', 'quise', 'quiso', 'quisieron'], ['decir', 'dij-', 'dije', 'dijo', 'dijeron']]),
          uk('Hizo пишемо з z: так зберігається вимова. Після j у decir — dijeron (не *dijieron). Vino — і «прийшов», і «вино».'),
          ex('¿Qué hiciste ayer?', 'Що ти робив(-ла) вчора?'),
          ex('Mis padres vinieron a cenar.', 'Мої батьки прийшли на вечерю.'),
          ex('Ana no quiso salir.', 'Ана не захотіла виходити.'),
          ex('¿Qué te dijo el médico?', 'Що тобі сказав лікар?'),
        ],
      }),
      step('s5', 'supported-practice', 'Група 2: практика з таблицею', true, { taskIds: by('B', 'supported') }),
      step('s6', 'independent-practice', 'Група 2: самостійна практика', true, { taskIds: by('B', 'independent') }),
      step('s7', 'explanation', 'Група 3: dar і ver', true, {
        blocks: [
          esTable(['sujeto', 'dar', 'ver'], [['yo', 'di', 'vi'], ['tú', 'diste', 'viste'], ['él / ella / usted', 'dio', 'vio'], ['nosotros / nosotras', 'dimos', 'vimos'], ['vosotros / vosotras', 'disteis', 'visteis'], ['ellos / ellas / ustedes', 'dieron', 'vieron']]),
          uk('Dar, хоч і на -ar, має закінчення дієслів на -er / -ir. Di, dio, vi, vio — односкладові, тому без знака наголосу.'),
          ex('Le di un regalo a Ana.', 'Я подарував(-ла) Ані подарунок.'),
          ex('Anoche vimos una película.', 'Учора ввечері ми дивилися фільм.'),
        ],
      }),
      step('s8', 'supported-practice', 'Група 3: практика з таблицею', true, { taskIds: by('C', 'supported') }),
      step('s9', 'independent-practice', 'Група 3: самостійна практика', true, { taskIds: by('C', 'independent') }),
      step('s10', 'summary', 'Підсумок', true, {
        blocks: [
          ukList([
            'tuve, estuve, pude, puse, hice (hizo), vine, quise, dije (dijeron) — закінчення -e, -iste, -o, -imos, -isteis, -ieron.',
            'Ці форми — без знака наголосу: tuvo, hizo, dijo.',
            'di, dio, vi, vio — теж без знака наголосу.',
            'Кожне дієслово тренуємо окремо: помилка в одному не скасовує інших.',
          ]),
        ],
      }),
    ],
  }),
  tasks,
};
