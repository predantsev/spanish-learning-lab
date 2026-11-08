// A2-04-L6 — ser and ir in the indefinido (A2-04-O7): one shared paradigm (indefinido.ser-ir,
// written-form bank of 10) and the meaning contrast «був» / «пішов, поїхав» (contrast.fue-ser-ir:
// 6 reading-meaning + 4 context-choice, see its bankJustificationUk). Every contrast prompt carries
// a cue that leaves only one reading: a + place → ir; an adjective, a profession or «як минуло» → ser.
// A named-verb gap (written-form) is different evidence from interpreting the form (contrast).
import { choice, es, esTable, ex, exact, lesson, step, uk, ukList } from './lib.mjs';

const L = 'A2-04-L6';
const SI = ['indefinido.ser-ir', 'written-form'];
const FR = ['contrast.fue-ser-ir', 'reading-meaning'];
const FC = ['contrast.fue-ser-ir', 'context-choice'];
const num = (n) => `T${String(n).padStart(2, '0')}`;

export const SER_IR_TABLE = esTable(['sujeto', 'ser / ir'], [
  ['yo', 'fui'], ['tú', 'fuiste'], ['él / ella / usted', 'fue'],
  ['nosotros / nosotras', 'fuimos'], ['vosotros / vosotras', 'fuisteis'], ['ellos / ellas / ustedes', 'fueron'],
]);
const SI_RULE = 'Ser і ir у простому минулому мають однакові форми: fui, fuiste, fue, fuimos, fuisteis, fueron. Усі вони пишуться без знака наголосу.';
const FR_RULE = 'Fue, fuimos, fueron… можуть означати «був» (ser) або «пішов, поїхав, ходив» (ir). Після форми a + місце (al cine, a Toledo) — це ir. Якщо далі прикметник (muy bonito), професія (profesora) або йдеться про те, яким щось було, — це ser.';
const NO_ACC = (f) => `Майже: ${f} пишемо без знака наголосу.`;
const PRES = (w, f) => `${w} — теперішній час. Ідеться про минуле: ${f}.`;
const PERSON = (w, f) => `${w} — форма іншої особи. Тут потрібно ${f}.`;
const capFirst = (s) => s.replace(/^([¿¡—]*)(\p{Ll})/u, (_m, a, b) => a + b.toUpperCase());

/** written-form gap: sentence holds «(…) ___» or «___ (…)». */
function gap(n, role, family, sentence, form, fullUk, errors, fullOverride) {
  const full = fullOverride ?? capFirst(sentence.replace(/\([^)]*\) ___|___ \([^)]*\)/, form));
  const supported = role === 'supported';
  return exact({
    id: num(n), lesson: L, role, family, target: SI,
    prompt: [
      uk(`${family === 'messages' ? 'Повідомлення. ' : ''}Впишіть дієслово в дужках у простому минулому часі (pretérito indefinido).${supported ? ' Скористайтеся таблицею.' : ''}`),
      ...(supported ? [SER_IR_TABLE] : []),
      es(sentence),
    ],
    answers: [form], closed: true, errors,
    rule: SI_RULE, full, fullUk,
    ok: `Правильно: ${form}.`, bad: `Правильна форма — ${form}: ${full}`,
  });
}

/** reading-meaning: what does the sentence (or the marked part) mean. */
function read(n, role, family, text, question, options, revealUk, supported = false) {
  return choice({
    id: num(n), lesson: L, role, family, target: FR,
    prompt: [uk(`Прочитайте і дайте відповідь.${supported ? ' Підказка: a + місце — це рух (ir).' : ''}`), es(text), uk(question)],
    options, rule: FR_RULE, full: text, fullUk: revealUk,
    ok: 'Правильно.', bad: `Ні. ${revealUk}`,
  });
}

const IR = 'ir («іти, їхати, ходити»)';
const SER = 'ser («бути»)';
/** context-choice: which verb the marked form belongs to. */
function which(n, role, family, text, form, isIr, why, revealUk) {
  return choice({
    id: num(n), lesson: L, role, family, target: FC,
    prompt: [uk(`${family === 'messages' ? 'Повідомлення. ' : ''}Прочитайте речення. До якого дієслова тут належить форма «${form}»?`), es(text)],
    options: [[IR, isIr, isIr ? undefined : why], [SER, !isIr, isIr ? why : undefined]],
    rule: FR_RULE, full: text, fullUk: revealUk,
    ok: `Правильно: тут ${isIr ? 'ir' : 'ser'}.`, bad: `Ні. ${why}`,
  });
}

const tasks = [
  // ---------- indefinido.ser-ir (written-form) ----------
  gap(1, 'supported', 'leisure', 'Anoche (nosotros, ir) ___ al cine.', 'fuimos', 'Учора ввечері ми ходили в кіно.',
    [['vamos', PRES('Vamos', 'fuimos')], ['fueron', PERSON('Fueron (ellos / ellas)', 'fuimos')], ['fuímos', NO_ACC('fuimos')]]),
  gap(2, 'supported', 'opinion', 'El concierto (ser) ___ genial.', 'fue', 'Концерт був чудовий.',
    [['fué', NO_ACC('fue')], ['fui', PERSON('Fui (yo)', 'fue')]]),
  gap(3, 'independent', 'routine', 'Ayer (yo, ir) ___ al médico.', 'fui', 'Учора я ходив(-ла) до лікаря.',
    [['fuí', NO_ACC('fui')], ['voy', PRES('Voy', 'fui')], ['fue', PERSON('Fue (él / ella)', 'fui')]]),
  gap(4, 'independent', 'opinion', '—¿Qué tal el examen de ayer? —(ser) ___ muy fácil.', 'fue', '—Як учорашній іспит? —Був дуже легкий.',
    [['fué', NO_ACC('fue')], ['es', PRES('Es', 'fue')]], '—¿Qué tal el examen de ayer? —Fue muy fácil.'),
  gap(5, 'independent', 'work-study', '¿(tú, ir) ___ a clase ayer?', 'fuiste', 'Ти ходив(-ла) учора на заняття?',
    [['fuistes', 'Для tú — fuiste, без -s у кінці.'], ['vas', PRES('Vas', 'fuiste')], ['fue', PERSON('Fue (él / ella)', 'fuiste')]]),
  choice({
    id: num(6), lesson: L, role: 'independent', family: 'opinion', target: SI,
    prompt: [uk('Оберіть правильну форму простого минулого часу.'), es('La película de anoche ___ (ser) muy interesante.')],
    options: [['fue', true], ['fué', false, NO_ACC('fue')], ['fui', false, PERSON('Fui (yo)', 'fue')], ['fueron', false, PERSON('Fueron (ellos / ellas)', 'fue')]],
    rule: SI_RULE, full: 'La película de anoche fue muy interesante.', fullUk: 'Фільм, який ми дивилися вчора ввечері, був дуже цікавий.',
    ok: 'Правильно: fue.', bad: 'Правильна форма — fue: La película de anoche fue muy interesante.',
  }),
  gap(7, 'delayed', 'travel', 'El sábado pasado mis padres (ir) ___ a Toledo.', 'fueron', 'Минулої суботи мої батьки їздили до Толедо.',
    [['fue', PERSON('Fue (él / ella)', 'fueron')], ['van', PRES('Van', 'fueron')], ['fuieron', 'Правильно fueron — без i перед e.']]),
  gap(8, 'delayed', 'opinion', 'El año pasado las vacaciones (ser) ___ muy tranquilas.', 'fueron', 'Минулого року відпустка була дуже спокійна.',
    [['fue', PERSON('Fue (él / ella)', 'fueron')], ['son', PRES('Son', 'fueron')]]),
  gap(9, 'transfer', 'messages', '¡Hola, Marta! ¿(vosotros, ir) ___ a la playa el domingo?', 'fuisteis', 'Привіт, Марто! Ви ходили на пляж у неділю?',
    [['fuistes', 'Для vosotros — fuisteis.'], ['vais', PRES('Vais', 'fuisteis')], ['fuísteis', NO_ACC('fuisteis')]], '¡Hola, Marta! ¿Fuisteis a la playa el domingo?'),
  gap(10, 'transfer', 'meetings', 'La reunión de ayer (ser) ___ muy larga.', 'fue', 'Учорашня нарада була дуже довга.',
    [['fué', NO_ACC('fue')], ['fueron', PERSON('Fueron (ellos / ellas)', 'fue')]]),

  // ---------- contrast.fue-ser-ir: reading-meaning ----------
  read(11, 'supported', 'routine', 'Ayer mi padre fue al médico.', 'Що означає речення?',
    [['Учора тато ходив до лікаря.', true],
      ['Тато був лікарем.', false, 'Al médico = a + el médico: це рух, тобто ir. «Був лікарем» — fue médico, без a.'],
      ['Учора лікар прийшов до тата.', false, 'Fue — дія тата, а не лікаря: тато ходив до лікаря.']],
    'Учора тато ходив до лікаря.', true),
  read(12, 'supported', 'family', 'Mi madre fue profesora de inglés.', 'Що означає речення?',
    [['Моя мама була викладачкою англійської.', true],
      ['Моя мама ходила до викладачки англійської.', false, 'Перед profesora немає a: це не рух, а ким була мама, — ser.'],
      ['Моя мама вчить англійську.', false, 'Fue — минулий час, а не теперішній.']],
    'Моя мама була викладачкою англійської.', true),
  read(13, 'independent', 'leisure', '—¿Qué tal el concierto? —Fue genial.', 'Що означає відповідь?',
    [['Концерт був чудовий.', true],
      ['Я пішов (пішла) на концерт.', false, 'Тут немає a + місця: людина відповідає, яким був концерт, — ser.'],
      ['Концерт буде чудовий.', false, 'Fue — минулий час: концерт уже відбувся.']],
    '—Як концерт? —Був чудовий.'),
  read(14, 'independent', 'travel', 'El verano pasado fuimos a Sevilla en tren.', 'Що означає речення?',
    [['Минулого літа ми їздили до Севільї потягом.', true],
      ['Минулого літа Севілья була дуже гарна.', false, 'Fuimos — «ми»; a Sevilla — рух до місця, тобто ir.'],
      ['Наступного літа ми поїдемо до Севільї потягом.', false, 'El verano pasado — «минулого літа»: подія вже відбулася.']],
    'Минулого літа ми їздили до Севільї потягом.'),
  read(15, 'delayed', 'work-study', 'La clase de ayer fue muy interesante.', 'Що означає речення?',
    [['Учорашнє заняття було дуже цікаве.', true],
      ['Учора я пішов (пішла) на дуже цікаве заняття.', false, 'Підмет — la clase, і далі прикметник muy interesante: яким було заняття, — ser.'],
      ['Завтрашнє заняття буде дуже цікаве.', false, 'De ayer — «учорашнє».']],
    'Учорашнє заняття було дуже цікаве.'),
  read(16, 'transfer', 'messages', '¡Hola, Ana! Ayer Luis y yo fuimos a la playa. Fue un día muy bonito.', 'Що означає друге речення — «Fue un día muy bonito»?',
    [['День був дуже гарний.', true],
      ['Луїс пішов на пляж у гарний день.', false, 'У другому реченні немає a + місця: fue un día muy bonito — яким був день, тобто ser.'],
      ['Завтра буде дуже гарний день.', false, 'Fue — минулий час.']],
    'Привіт, Ано! Учора ми з Луїсом ходили на пляж. День був дуже гарний.'),

  // ---------- contrast.fue-ser-ir: context-choice ----------
  which(17, 'independent', 'leisure', 'Anoche fui al teatro con mi hermana.', 'fui', true,
    'Після fui стоїть a + місце (al teatro): це рух — ir.', 'Учора ввечері я ходив(-ла) до театру із сестрою.'),
  which(18, 'independent', 'opinion', 'Las vacaciones fueron muy tranquilas.', 'fueron', false,
    'Після fueron стоїть прикметник (muy tranquilas): ідеться про те, якою була відпустка, — ser.', 'Відпустка була дуже спокійна.'),
  which(19, 'delayed', 'family', 'Mi hermano fue camarero en un bar de Madrid.', 'fue', false,
    'Після fue стоїть професія (camarero): ким був брат — ser. «En un bar» тут означає місце роботи, а не рух.', 'Мій брат був офіціантом у барі в Мадриді.'),
  which(20, 'transfer', 'messages', '¡Hola, Pablo! ¿Fuiste a clase ayer?', 'fuiste', true,
    'Після fuiste стоїть a + місце (a clase): це рух — ir.', 'Привіт, Пабло! Ти ходив учора на заняття?'),
];

const ids = (...n) => n.map((x) => `${L}-${num(x)}`);

export default {
  lesson: lesson({
    id: L,
    titleUk: 'Ser та ir у простому минулому: fui, fue, fueron',
    termEs: 'pretérito indefinido de ser e ir',
    summaryUk:
      'Ser і ir у простому минулому мають однакові форми: fui, fuiste, fue, fuimos, fuisteis, fueron. Вчимося писати ці форми і розуміти з контексту, що означає fue: «був» чи «пішов, поїхав».',
    objectives: ['A2-04-O7'],
    situations: ['time-appointments-transport', 'places-accommodation', 'routine-study-leisure'],
    estimatedMinutes: 15,
    introduces: ['indefinido.ser-ir', 'contrast.fue-ser-ir'],
    revisits: ['indefinido.strong-endings', 'present.ser', 'present.ir', 'contrast.ir-a-place-vs-plan', 'time.past-markers'],
    steps: [
      step('s1', 'explanation', 'Одні форми для двох дієслів', true, {
        blocks: [
          uk('Ser («бути») та ir («іти, їхати, ходити») у простому минулому мають однакові форми. Усі вони пишуться без знака наголосу.'),
          SER_IR_TABLE,
          ex('Ayer fui al médico.', 'Учора я ходив(-ла) до лікаря. (ir)'),
          ex('El examen fue muy fácil.', 'Іспит був дуже легкий. (ser)'),
          ex('El sábado fuimos a Toledo.', 'У суботу ми їздили до Толедо. (ir)'),
        ],
      }),
      step('s2', 'explanation', 'Fue: «був» чи «пішов»?', true, {
        blocks: [
          uk('Значення підказує те, що стоїть після форми, і весь контекст:'),
          ukList([
            'a + місце (al cine, a la playa, a Toledo) — рух, тобто ir: Fuimos al cine — «ми ходили в кіно».',
            'прикметник або професія, або йдеться про те, яким щось було, — ser: Fue muy bonito — «було дуже гарно»; Fue profesora — «вона була викладачкою».',
          ]),
          ex('—¿Qué tal el concierto? —Fue genial.', '—Як концерт? —Був чудовий. (ser)'),
          ex('Mi padre fue al médico.', 'Мій тато ходив до лікаря. (ir)'),
          ex('Mi padre fue médico.', 'Мій тато був лікарем. (ser)'),
          uk('Якщо контекст не показує, яке це дієслово, у завданнях ми його уточнюємо.'),
        ],
      }),
      step('s3', 'supported-practice', 'Практика з таблицею і підказкою', true, { taskIds: ids(1, 2, 11, 12) }),
      step('s4', 'independent-practice', 'Самостійна практика', true, { taskIds: ids(3, 4, 5, 6, 13, 14, 17, 18) }),
      step('s5', 'summary', 'Підсумок', true, {
        blocks: [
          ukList([
            'Ser та ir: fui, fuiste, fue, fuimos, fuisteis, fueron — без знака наголосу.',
            'a + місце → ir: Fui al cine.',
            'прикметник, професія, «яким було» → ser: Fue muy bonito. Fue profesora.',
          ]),
        ],
      }),
    ],
  }),
  tasks,
};
