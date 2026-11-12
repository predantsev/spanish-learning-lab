// A1-02-L1 — a noun with its article: gender tendencies (-o/-a), -e/consonant, -ción/-dad,
// frequent exceptions, people, and the definite article el/la.
import { LOOSE, es, ex, reveal, rule, tableUk, uk, ulUk } from '../lib.ts';
import type { OutcomeSpec, TaskSpec, Unit } from '../lib.ts';
import type { TaskRole } from '../../../content/types.ts';
import { U } from '../common.ts';

const OA_W = 'noun.gender.o-a/written-form';
const OA_C = 'noun.gender.o-a/context-choice';
const EC_W = 'noun.gender.e-consonant/written-form';
const EC_C = 'noun.gender.e-consonant/context-choice';
const CD_W = 'noun.gender.cion-dad/written-form';
const CD_C = 'noun.gender.cion-dad/context-choice';
const MA_W = 'noun.gender.exception.masc-a/written-form';
const MA_C = 'noun.gender.exception.masc-a/context-choice';
const FO_W = 'noun.gender.exception.fem-o/written-form';
const FO_C = 'noun.gender.exception.fem-o/context-choice';
const PE_W = 'noun.gender.people/written-form';
const PE_C = 'noun.gender.people/context-choice';
const AD_W = 'article.definite/written-form';
const AD_C = 'article.definite/context-choice';

const RULE: Record<string, string> = {
  [OA_W]: 'Більшість іменників на -o — чоловічого роду (el libro), більшість на -a — жіночого (la casa). Рід не завжди збігається з українським: la mesa — «стіл».',
  [EC_W]: 'Якщо іменник закінчується на -e або на приголосну, за закінченням рід не вгадати: el coche, але la calle; el hotel, але la flor. Такі слова запам’ятовуй з артиклем.',
  [CD_W]: 'Іменники на -ción і на -dad — жіночого роду: la estación, la habitación, la ciudad, la universidad.',
  [MA_W]: 'Кілька поширених іменників на -a — чоловічого роду: el día, el mapa, el problema, el idioma, el sofá.',
  [FO_W]: 'Кілька поширених іменників на -o — жіночого роду: la mano, la foto, la moto, la radio.',
  [PE_W]: 'Для людей рід зазвичай відповідає статі: el chico — la chica, el amigo — la amiga, el profesor — la profesora. Слово estudiante має одну форму, рід показує артикль: el estudiante, la estudiante.',
};
const RULE_AD = 'Означений артикль: el — перед іменником чоловічого роду в однині, la — перед іменником жіночого роду в однині. Без артикля іменник у такій фразі не вживають.';

type Extra = [string, OutcomeSpec, string];

interface NounTask {
  n: number;
  role: TaskRole;
  family: string;
  skill: string;
  withAD?: boolean;
  ask: string;
  shown?: string;
  support?: string;
  answer: string;
  /** Wrong gender/article forms: [text, feedback]; scored incorrect for the gender skill (article unresolved). */
  wrong: Array<[string, string]>;
  /** Other reviewed variants with explicit outcomes (e.g. a missing accent left unresolved). */
  extra?: Extra[];
  why: string;
}

/** A typed "noun with el/la" task; with `withAD` it also targets article.definite/written-form. */
function noun(t: NounTask): TaskSpec {
  const targets = t.withAD ? [t.skill, AD_W] : [t.skill];
  const bare = t.answer.replace(/^(el|la) /, '');
  const errors: Extra[] = t.wrong.map(([text, fb]) => [`${text}.`, t.withAD ? { [t.skill]: 'x', [AD_W]: 'u' } : 'x', fb]);
  if (t.withAD) {
    const indefinite = t.answer.startsWith('el ') ? `un ${bare}` : `una ${bare}`;
    errors.push([`${bare}.`, { [AD_W]: 'x', [t.skill]: 'u' }, `Перед іменником потрібен артикль: ${t.answer}.`]);
    errors.push([`${indefinite}.`, { [AD_W]: 'x', [t.skill]: 'c' }, `Рід правильний, але тут потрібен означений артикль el/la: ${t.answer}.`]);
  }
  for (const e of t.extra ?? []) errors.push(e);
  const prompt = [...(t.support ? [uk(t.support)] : []), uk(t.ask), ...(t.shown ? [es(t.shown)] : [])];
  return {
    n: t.n, role: t.role, family: t.family, mode: 'exact-variants', targets, policy: LOOSE,
    prompt,
    accepted: [`${t.answer}.`],
    errors,
    hints: [rule([t.skill], RULE[t.skill] ?? ''), ...(t.withAD ? [rule([AD_W], RULE_AD)] : []), reveal(es(t.answer))],
    ref: t.answer,
    ok: `Правильно: ${t.answer}.`,
    bad: `Ще ні. ${t.why}: ${t.answer}.`,
    unres: U(t.answer),
  };
}

function pick(n: number, role: TaskRole, family: string, target: string, ask: string, correct: string, wrong: Array<[string, string]>, ruleText: string, okText: string, support?: string): TaskSpec {
  return {
    n, role, family, mode: 'choice', targets: [target],
    prompt: [...(support ? [uk(support)] : []), uk(ask)],
    options: [[correct, 'c'], ...wrong.map(([label, fb]): [string, OutcomeSpec, string] => [label, 'x', fb])],
    hints: [rule([target], ruleText)],
    ok: okText,
    bad: `Ні. Правильно: ${correct}.`,
  };
}

const ADD = 'Напиши слово з означеним артиклем el або la.';

export const unit: Unit = {
  lesson: {
    id: 'A1-02-L1',
    titleUk: 'Іменник з артиклем: рід',
    termEs: 'el sustantivo y su género',
    summaryUk: 'Дізнаєшся, що кожен іспанський іменник має рід, і навчишся вживати його з означеним артиклем el або la: за закінченням, за поширеними винятками і для назв людей.',
    objectives: ['A1-02-O1', 'A1-02-O2'],
    cv: [],
    situations: ['people-family-home'],
    estimatedMinutes: 16,
    skippableFoundation: true,
    introduces: [
      'noun.gender.o-a', 'noun.gender.e-consonant', 'noun.gender.cion-dad', 'noun.gender.exception.masc-a',
      'noun.gender.exception.fem-o', 'noun.gender.people', 'article.definite',
    ],
    revisits: ['text.grammar-terms', 'ortho.written-accent.familiar-words'],
    steps: [
      {
        kind: 'explanation',
        title: 'Рід іменника й артикль el / la',
        blocks: [
          uk('Кожен іспанський іменник (sustantivo) має рід: чоловічий (masculino) або жіночий (femenino). Рід часто не збігається з українським: la mesa — «стіл», el coche — «машина». Тому нове слово вчи одразу з артиклем.'),
          uk('Означений артикль (artículo) стоїть перед іменником: el — перед іменником чоловічого роду в однині, la — жіночого: el libro, la casa. В українській артиклів немає, тому спершу це незвично.'),
          uk('Артикль el пишеться без знака наголосу; él зі знаком — інше слово, про нього пізніше.'),
        ],
      },
      {
        kind: 'explanation',
        title: 'Як визначити рід',
        blocks: [
          tableUk(['Закінчення', 'Рід', 'Приклади'], [
            ['-o', 'зазвичай чоловічий', 'el libro, el vaso, el bolígrafo'],
            ['-a', 'зазвичай жіночий', 'la casa, la mesa, la silla, la ventana'],
            ['-e або приголосна', 'запам’ятовуємо з артиклем', 'el coche, la calle, la noche, la llave; el hotel, el móvil, la flor'],
            ['-ción, -dad', 'жіночий', 'la estación, la habitación, la ciudad, la universidad'],
          ]),
          uk('Правило для -o та -a — тенденція, а не закон. Запам’ятай часті винятки:'),
          tableUk(['Виняток', 'Значення'], [
            ['el día', 'день'],
            ['el mapa', 'мапа'],
            ['el problema', 'проблема'],
            ['el idioma', 'мова'],
            ['el sofá', 'диван'],
            ['la mano', 'рука (кисть)'],
            ['la foto', 'фото (скорочено від la fotografía)'],
            ['la moto', 'мотоцикл (скорочено від la motocicleta)'],
            ['la radio', 'радіо'],
          ]),
        ],
      },
      {
        kind: 'explanation',
        title: 'Люди: чоловічий і жіночий рід',
        blocks: [
          uk('Для людей граматичний рід зазвичай відповідає статі. Пари на -o / -a: el chico — la chica, el amigo — la amiga. Деякі назви людей на приголосну утворюють жіночу форму додаванням -a: el profesor — la profesora. Слова на -e часто мають одну форму, а рід видно лише з артикля: el estudiante — la estudiante.'),
          uk('El hombre — «чоловік», la mujer — «жінка»: тут рід визначає значення, а не закінчення.'),
        ],
      },
      {
        kind: 'examples',
        title: 'Приклади',
        blocks: [
          ex('el libro y la mesa', 'книжка і стіл'),
          ex('el coche y la calle', 'машина і вулиця'),
          ex('la habitación', 'кімната'),
          ex('el día', 'день'),
          ex('la mano', 'рука (кисть)'),
          ex('el amigo / la amiga', 'друг / подруга'),
          ex('el estudiante / la estudiante', 'студент / студентка'),
        ],
      },
      { kind: 'supported-practice', title: 'Тренування з підказкою', tasks: [1, 2, 12, 13, 23, 24, 34, 35, 45, 51] },
      { kind: 'independent-practice', title: 'Самостійно', tasks: [11, 3, 14, 25, 36, 46, 4, 15, 26, 52, 37, 5, 16, 22, 57, 27, 38, 47, 6, 17, 28, 33, 53, 39, 44, 50, 56] },
      {
        kind: 'summary',
        title: 'Підсумок',
        blocks: [
          ulUk(
            'Іменник має рід; учи його з артиклем: el — чоловічий рід, la — жіночий.',
            '-o — зазвичай el, -a — зазвичай la; -ción і -dad — la; на -e і приголосну — запам’ятовуємо.',
            'Винятки: el día, el mapa, el problema, el idioma, el sofá; la mano, la foto, la moto, la radio.',
            'Люди: el amigo — la amiga, el profesor — la profesora, el / la estudiante.',
          ),
        ],
      },
    ],
  },
  tasks: [
    // ---------- -o / -a ----------
    noun({ n: 1, role: 'supported', family: 'with-article', skill: OA_W, withAD: true, support: 'Пам’ятай: на -o — зазвичай el, на -a — зазвичай la.', ask: `${ADD} Значення: «книжка».`, shown: 'libro', answer: 'el libro', wrong: [['la libro', 'Libro закінчується на -o — це чоловічий рід']], why: 'Libro — чоловічого роду' }),
    noun({ n: 2, role: 'supported', family: 'with-article', skill: OA_W, support: 'Пам’ятай: на -o — зазвичай el, на -a — зазвичай la.', ask: `${ADD} Значення: «стіл».`, shown: 'mesa', answer: 'la mesa', wrong: [['el mesa', 'Mesa закінчується на -a — це жіночий рід, хоча українське «стіл» чоловічого роду']], why: 'Mesa — жіночого роду' }),
    noun({ n: 3, role: 'independent', family: 'recall', skill: OA_W, withAD: true, ask: 'Напиши іспанською з означеним артиклем: «вікно».', answer: 'la ventana', wrong: [['el ventana', 'Ventana — жіночого роду']], why: 'Ventana — жіночого роду' }),
    noun({ n: 4, role: 'independent', family: 'recall', skill: OA_W, ask: 'Напиши іспанською з означеним артиклем: «склянка».', answer: 'el vaso', wrong: [['la vaso', 'Vaso закінчується на -o — чоловічий рід, хоча «склянка» жіночого роду']], why: 'Vaso — чоловічого роду' }),
    noun({ n: 5, role: 'independent', family: 'fix', skill: OA_W, ask: 'Виправ помилку в артиклі.', shown: 'la bolígrafo', answer: 'el bolígrafo', wrong: [['la bolígrafo', 'Артикль не змінено. Bolígrafo закінчується на -o — чоловічий рід']], why: 'Bolígrafo — чоловічого роду' }),
    noun({ n: 6, role: 'independent', family: 'recall', skill: OA_W, ask: 'Напиши іспанською з означеним артиклем: «ліжко».', answer: 'la cama', wrong: [['el cama', 'Cama — жіночого роду']], why: 'Cama — жіночого роду' }),
    noun({ n: 7, role: 'delayed', family: 'recall', skill: OA_W, withAD: true, ask: 'Напиши іспанською з означеним артиклем: «двері» (в іспанській це слово в однині).', answer: 'la puerta', wrong: [['el puerta', 'Puerta — жіночого роду']], why: 'Puerta — жіночого роду' }),
    noun({ n: 8, role: 'delayed', family: 'fix', skill: OA_W, ask: 'Виправ помилку в артиклі.', shown: 'el silla', answer: 'la silla', wrong: [['el silla', 'Артикль не змінено. Silla — жіночого роду']], why: 'Silla — жіночого роду' }),
    noun({ n: 9, role: 'transfer', family: 'label', skill: OA_W, ask: 'Ти підписуєш фото для власного словника. Напиши з означеним артиклем слово teléfono («телефон»).', answer: 'el teléfono', wrong: [['la teléfono', 'Teléfono — чоловічого роду']], extra: [['el telefono.', 'u', 'Рід правильний, але teléfono пишеться зі знаком наголосу.']], why: 'Teléfono — чоловічого роду' }),
    noun({ n: 10, role: 'transfer', family: 'label', skill: OA_W, ask: 'Ти підписуєш фото для власного словника. Напиши з означеним артиклем слово guitarra («гітара»).', answer: 'la guitarra', wrong: [['el guitarra', 'Guitarra — жіночого роду']], why: 'Guitarra — жіночого роду' }),
    pick(11, 'independent', 'choose-article', OA_C, 'Вибери правильний варіант: «дім».', 'la casa', [['el casa', 'Casa закінчується на -a — жіночий рід.']], RULE[OA_W] ?? '', 'Так: la casa.'),
    // ---------- -e / consonant ----------
    noun({ n: 12, role: 'supported', family: 'with-article', skill: EC_W, support: 'Підказка: el coche, la calle, la noche, la llave; el hotel, el móvil, la flor.', ask: `${ADD} Значення: «ніч».`, shown: 'noche', answer: 'la noche', wrong: [['el noche', 'Noche — жіночого роду']], why: 'Noche — жіночого роду' }),
    noun({ n: 13, role: 'supported', family: 'with-article', skill: EC_W, withAD: true, support: 'Підказка: el coche, la calle, el hotel, la flor — рід цих слів запам’ятовуємо з артиклем.', ask: `${ADD} Значення: «машина».`, shown: 'coche', answer: 'el coche', wrong: [['la coche', 'Coche — чоловічого роду, хоча «машина» жіночого']], why: 'Coche — чоловічого роду' }),
    noun({ n: 14, role: 'independent', family: 'recall', skill: EC_W, withAD: true, ask: 'Напиши іспанською з означеним артиклем: «вулиця».', answer: 'la calle', wrong: [['el calle', 'Calle — жіночого роду']], why: 'Calle — жіночого роду' }),
    noun({ n: 15, role: 'independent', family: 'recall', skill: EC_W, ask: 'Напиши іспанською з означеним артиклем: «ключ».', answer: 'la llave', wrong: [['el llave', 'Llave — жіночого роду, хоча «ключ» чоловічого']], why: 'Llave — жіночого роду' }),
    noun({ n: 16, role: 'independent', family: 'recall', skill: EC_W, ask: 'Напиши іспанською з означеним артиклем: «мобільний телефон» (одне слово).', answer: 'el móvil', wrong: [['la móvil', 'Móvil — чоловічого роду']], extra: [['el movil.', 'u', 'Рід правильний, але móvil пишеться зі знаком наголосу.']], why: 'Móvil — чоловічого роду' }),
    noun({ n: 17, role: 'independent', family: 'fix', skill: EC_W, ask: 'Виправ помилку в артиклі.', shown: 'el flor', answer: 'la flor', wrong: [['el flor', 'Артикль не змінено. Flor — жіночого роду']], why: 'Flor — жіночого роду' }),
    noun({ n: 18, role: 'delayed', family: 'recall', skill: EC_W, withAD: true, ask: 'Напиши іспанською з означеним артиклем: «готель».', answer: 'el hotel', wrong: [['la hotel', 'Hotel — чоловічого роду']], why: 'Hotel — чоловічого роду' }),
    noun({ n: 19, role: 'delayed', family: 'fix', skill: EC_W, ask: 'Виправ помилку в артиклі.', shown: 'la coche', answer: 'el coche', wrong: [['la coche', 'Артикль не змінено. Coche — чоловічого роду']], why: 'Coche — чоловічого роду' }),
    noun({ n: 20, role: 'transfer', family: 'label', skill: EC_W, ask: 'Ти підписуєш фото для власного словника. Напиши з означеним артиклем: «квітка».', answer: 'la flor', wrong: [['el flor', 'Flor — жіночого роду']], why: 'Flor — жіночого роду' }),
    noun({ n: 21, role: 'transfer', family: 'label', skill: EC_W, ask: 'Ти підписуєш фото для власного словника. Напиши з означеним артиклем слово café («кава»).', answer: 'el café', wrong: [['la café', 'Café — чоловічого роду, хоча «кава» жіночого']], extra: [['el cafe.', 'u', 'Рід правильний, але café пишеться зі знаком наголосу.']], why: 'Café — чоловічого роду' }),
    pick(22, 'independent', 'choose-article', EC_C, 'Вибери правильний варіант: «ніч».', 'la noche', [['el noche', 'Noche — жіночого роду; рід слів на -e запам’ятовуємо.']], RULE[EC_W] ?? '', 'Так: la noche.'),
    // ---------- -ción / -dad ----------
    noun({ n: 23, role: 'supported', family: 'with-article', skill: CD_W, support: 'Пам’ятай: слова на -ción і -dad — жіночого роду.', ask: `${ADD} Значення: «станція».`, shown: 'estación', answer: 'la estación', wrong: [['el estación', 'Слова на -ción — жіночого роду']], extra: [['la estacion.', 'u', 'Рід правильний, але estación пишеться зі знаком наголосу.']], why: 'Estación — жіночого роду' }),
    noun({ n: 24, role: 'supported', family: 'with-article', skill: CD_W, withAD: true, support: 'Пам’ятай: слова на -ción і -dad — жіночого роду.', ask: `${ADD} Значення: «місто».`, shown: 'ciudad', answer: 'la ciudad', wrong: [['el ciudad', 'Слова на -dad — жіночого роду']], why: 'Ciudad — жіночого роду' }),
    noun({ n: 25, role: 'independent', family: 'recall', skill: CD_W, ask: 'Напиши іспанською з означеним артиклем: «кімната».', answer: 'la habitación', wrong: [['el habitación', 'Слова на -ción — жіночого роду']], extra: [['la habitacion.', 'u', 'Рід правильний, але habitación пишеться зі знаком наголосу.']], why: 'Habitación — жіночого роду' }),
    noun({ n: 26, role: 'independent', family: 'recall', skill: CD_W, withAD: true, ask: 'Напиши іспанською з означеним артиклем: «університет».', answer: 'la universidad', wrong: [['el universidad', 'Слова на -dad — жіночого роду, хоча «університет» чоловічого']], why: 'Universidad — жіночого роду' }),
    noun({ n: 27, role: 'independent', family: 'fix', skill: CD_W, ask: 'Виправ помилку в артиклі.', shown: 'el estación', answer: 'la estación', wrong: [['el estación', 'Артикль не змінено. Слова на -ción — жіночого роду']], extra: [['la estacion.', 'u', 'Рід правильний, але estación пишеться зі знаком наголосу.']], why: 'Estación — жіночого роду' }),
    noun({ n: 28, role: 'independent', family: 'new-word', skill: CD_W, ask: 'Нове слово: nacionalidad — «громадянство». Застосуй правило й напиши його з означеним артиклем.', answer: 'la nacionalidad', wrong: [['el nacionalidad', 'Слова на -dad — жіночого роду']], why: 'Nacionalidad — жіночого роду' }),
    noun({ n: 29, role: 'delayed', family: 'recall', skill: CD_W, ask: 'Напиши іспанською з означеним артиклем: «станція».', answer: 'la estación', wrong: [['el estación', 'Слова на -ción — жіночого роду']], extra: [['la estacion.', 'u', 'Рід правильний, але estación пишеться зі знаком наголосу.']], why: 'Estación — жіночого роду' }),
    noun({ n: 30, role: 'delayed', family: 'new-word', skill: CD_W, ask: 'Нове слово: canción — «пісня». Застосуй правило й напиши його з означеним артиклем.', answer: 'la canción', wrong: [['el canción', 'Слова на -ción — жіночого роду']], extra: [['la cancion.', 'u', 'Рід правильний, але canción пишеться зі знаком наголосу.']], why: 'Canción — жіночого роду' }),
    noun({ n: 31, role: 'transfer', family: 'label', skill: CD_W, withAD: true, ask: 'Ти підписуєш фото для власного словника. Напиши з означеним артиклем: «місто».', answer: 'la ciudad', wrong: [['el ciudad', 'Слова на -dad — жіночого роду']], why: 'Ciudad — жіночого роду' }),
    noun({ n: 32, role: 'transfer', family: 'sign', skill: CD_W, ask: 'Табличка над стійкою на вокзалі. Нове слово: información — «інформація». Напиши його з означеним артиклем.', answer: 'la información', wrong: [['el información', 'Слова на -ción — жіночого роду']], extra: [['la informacion.', 'u', 'Рід правильний, але información пишеться зі знаком наголосу.']], why: 'Información — жіночого роду' }),
    pick(33, 'independent', 'choose-article', CD_C, 'Нове слово: verdad — «правда». Вибери правильний варіант.', 'la verdad', [['el verdad', 'Слова на -dad — жіночого роду.']], RULE[CD_W] ?? '', 'Так: la verdad — слова на -dad жіночого роду.'),
    // ---------- people ----------
    noun({ n: 34, role: 'supported', family: 'person', skill: PE_W, support: 'Підказка: el chico — la chica, el amigo — la amiga, el profesor — la profesora, el / la estudiante.', ask: 'Напиши іспанською з означеним артиклем: «подруга».', answer: 'la amiga', wrong: [['el amiga', 'Подруга — жінка: la amiga'], ['la amigo', 'Для жінки — форма на -a: la amiga'], ['el amigo', 'El amigo — «друг» (чоловік); подруга — la amiga']], why: 'Подруга — la amiga' }),
    noun({ n: 35, role: 'supported', family: 'person', skill: PE_W, withAD: true, support: 'Підказка: el profesor — la profesora.', ask: 'Напиши іспанською з означеним артиклем: «викладачка».', answer: 'la profesora', wrong: [['el profesora', 'Викладачка — жінка, тому la'], ['la profesor', 'Жіноча форма додає -a: la profesora']], why: 'Викладачка — la profesora' }),
    noun({ n: 36, role: 'independent', family: 'person', skill: PE_W, ask: 'Напиши іспанською з означеним артиклем: «студентка». Використай вивчене слово estudiante.', answer: 'la estudiante', wrong: [['el estudiante', 'Студентка — жінка, тому la']], extra: [['la estudianta.', 'u', 'Estudianta — рідковживана жіноча форма. Завдання просить вивчене слово estudiante: у нейтральному вжитку воно має одну форму, а рід показує артикль — la estudiante.']], why: 'Студентка — la estudiante' }),
    noun({ n: 37, role: 'independent', family: 'person', skill: PE_W, ask: 'Напиши іспанською з означеним артиклем: «хлопець».', answer: 'el chico', wrong: [['la chico', 'Хлопець — чоловічий рід: el chico'], ['el chica', 'Chica — «дівчина»; хлопець — el chico']], why: 'Хлопець — el chico' }),
    noun({ n: 38, role: 'independent', family: 'person', skill: PE_W, withAD: true, ask: 'Напиши іспанською з означеним артиклем: «викладач» (чоловік).', answer: 'el profesor', wrong: [['la profesor', 'Викладач-чоловік — el profesor'], ['el profesora', 'Profesora — жіноча форма; для чоловіка — el profesor']], why: 'Викладач — el profesor' }),
    noun({ n: 39, role: 'independent', family: 'fix', skill: PE_W, ask: 'Виправ помилку в артиклі.', shown: 'el chica', answer: 'la chica', wrong: [['el chica', 'Артикль не змінено. Chica — дівчина, жіночий рід']], why: 'Chica — жіночого роду' }),
    noun({ n: 40, role: 'delayed', family: 'person', skill: PE_W, withAD: true, ask: 'Напиши іспанською з означеним артиклем: «друг».', answer: 'el amigo', wrong: [['la amigo', 'Друг — чоловік: el amigo'], ['el amiga', 'Amiga — «подруга»; друг — el amigo']], why: 'Друг — el amigo' }),
    noun({ n: 41, role: 'delayed', family: 'fix', skill: PE_W, ask: 'Пабло — студент. Виправ помилку в артиклі.', shown: 'la estudiante', answer: 'el estudiante', wrong: [['la estudiante', 'Артикль не змінено. Пабло — чоловік, тому el']], why: 'Пабло — el estudiante' }),
    noun({ n: 42, role: 'transfer', family: 'name-tag', skill: PE_W, ask: 'На табличці біля вбиральні треба написати слово «жінка» з означеним артиклем.', answer: 'la mujer', wrong: [['el mujer', 'Mujer — «жінка», жіночий рід']], why: 'Жінка — la mujer' }),
    noun({ n: 43, role: 'transfer', family: 'name-tag', skill: PE_W, ask: 'На табличці біля вбиральні треба написати слово «чоловік» з означеним артиклем.', answer: 'el hombre', wrong: [['la hombre', 'Hombre — «чоловік», чоловічий рід']], why: 'Чоловік — el hombre' }),
    pick(44, 'independent', 'choose-article', PE_C, 'Пабло — студент. Як сказати про нього?', 'el estudiante', [['la estudiante', 'Пабло — чоловік, тому el.'], ['el estudianto', 'Слово estudiante має одну форму; рід показує артикль.']], RULE[PE_W] ?? '', 'Так: el estudiante.'),
    // ---------- masculine -a ----------
    noun({ n: 45, role: 'supported', family: 'with-article', skill: MA_W, support: 'Пам’ятай: el día, el mapa, el problema, el idioma, el sofá — чоловічого роду.', ask: `${ADD} Значення: «день».`, shown: 'día', answer: 'el día', wrong: [['la día', 'Día — виняток: чоловічого роду']], extra: [['el dia.', 'u', 'Рід правильний, але día пишеться зі знаком наголосу.']], why: 'Día — чоловічого роду' }),
    noun({ n: 46, role: 'independent', family: 'recall', skill: MA_W, ask: 'Напиши іспанською з означеним артиклем: «мапа».', answer: 'el mapa', wrong: [['la mapa', 'Mapa — виняток: чоловічого роду']], why: 'Mapa — чоловічого роду' }),
    noun({ n: 47, role: 'independent', family: 'recall', skill: MA_W, ask: 'Напиши іспанською з означеним артиклем: «проблема».', answer: 'el problema', wrong: [['la problema', 'Problema — виняток: чоловічого роду, хоча «проблема» жіночого']], why: 'Problema — чоловічого роду' }),
    noun({ n: 48, role: 'delayed', family: 'recall', skill: MA_W, ask: 'Напиши іспанською з означеним артиклем: «диван».', answer: 'el sofá', wrong: [['la sofá', 'Sofá — чоловічого роду']], extra: [['el sofa.', 'u', 'Рід правильний, але sofá пишеться зі знаком наголосу.']], why: 'Sofá — чоловічого роду' }),
    noun({ n: 49, role: 'transfer', family: 'schedule', skill: MA_W, ask: 'У розкладі курсів треба написати слово «мова» (idioma) з означеним артиклем.', answer: 'el idioma', wrong: [['la idioma', 'Idioma — виняток: чоловічого роду']], why: 'Idioma — чоловічого роду' }),
    pick(50, 'independent', 'choose-article', MA_C, 'Вибери правильний варіант: «день».', 'el día', [['la día', 'Día — виняток: чоловічого роду.']], RULE[MA_W] ?? '', 'Так: el día — виняток.'),
    // ---------- feminine -o ----------
    noun({ n: 51, role: 'supported', family: 'with-article', skill: FO_W, support: 'Пам’ятай: la mano, la foto, la moto, la radio — жіночого роду.', ask: `${ADD} Значення: «фото».`, shown: 'foto', answer: 'la foto', wrong: [['el foto', 'Foto — скорочення від la fotografía, тому жіночого роду']], why: 'Foto — жіночого роду' }),
    noun({ n: 52, role: 'independent', family: 'recall', skill: FO_W, ask: 'Напиши іспанською з означеним артиклем: «рука» (кисть).', answer: 'la mano', wrong: [['el mano', 'Mano — виняток: жіночого роду']], why: 'Mano — жіночого роду' }),
    noun({ n: 53, role: 'independent', family: 'recall', skill: FO_W, ask: 'Напиши іспанською з означеним артиклем: «мотоцикл» (коротке слово).', answer: 'la moto', wrong: [['el moto', 'Moto — скорочення від la motocicleta, тому жіночого роду']], why: 'Moto — жіночого роду' }),
    noun({ n: 54, role: 'delayed', family: 'recall', skill: FO_W, ask: 'Напиши іспанською з означеним артиклем: «радіо» (те, що слухаємо).', answer: 'la radio', wrong: [['el radio', 'У значенні «радіо» в Іспанії кажуть la radio']], why: 'Радіо — la radio' }),
    noun({ n: 55, role: 'transfer', family: 'label', skill: FO_W, ask: 'Ти підписуєш фото для власного словника: на фото мотоцикл. Напиши слово з означеним артиклем.', answer: 'la moto', wrong: [['el moto', 'Moto — жіночого роду']], why: 'Moto — жіночого роду' }),
    pick(56, 'independent', 'choose-article', FO_C, 'Вибери правильний варіант: «фото».', 'la foto', [['el foto', 'Foto — скорочення від la fotografía, тому жіночого роду.']], RULE[FO_W] ?? '', 'Так: la foto.'),
    // ---------- article form when the gender is given ----------
    pick(57, 'independent', 'choose-form', AD_C, 'Іменник flor — жіночого роду. Який означений артикль ставимо перед ним?', 'la', [['el', 'El — для чоловічого роду; flor — жіночого.']], RULE_AD, 'Так: la flor.'),
    pick(58, 'delayed', 'choose-form', AD_C, 'Іменник problema — чоловічого роду. Який означений артикль ставимо перед ним?', 'el', [['la', 'La — для жіночого роду; problema — чоловічого.']], RULE_AD, 'Так: el problema.'),
  ],
};
