// A1-01-C1 — optional checkpoint. No new teaching and no lock: the self-check steps open scoped
// practice over the block's targets (which draws the held-out delayed/transfer bank), and the
// check's own items are new mixed-context transfer prompts that join that held-out bank.
import { LOOSE, STRICT, clip, es, link, reveal, rule, transcript, uk, ulUk } from '../lib.ts';
import type { Unit } from '../lib.ts';
import { U } from '../common.ts';

const AV_W = 'ortho.accented-vowels/written-form';
const NT_W = 'ortho.n-tilde/written-form';
const UD_W = 'ortho.u-dieresis/written-form';
const WA_W = 'ortho.written-accent.familiar-words/written-form';
const Q_W = 'ortho.question-marks/written-form';
const E_W = 'ortho.exclamation-marks/written-form';
const C_W = 'ortho.capitalization/written-form';
const P_W = 'ortho.sentence-punctuation/written-form';
const T_C = 'formula.greeting.time-of-day/context-choice';
const LF = 'listening.familiar-words/listening-meaning';

export const unit: Unit = {
  lesson: {
    id: 'A1-01-C1',
    titleUk: 'Перевір себе: написання, знаки й ввічливі фрази',
    summaryUk: 'Необов’язкова перевірка блоку A1-01 без нових пояснень і без замків: нові завдання на написання, розділові знаки, фрази й слухання. Допомога доступна; результат записується окремо для кожного вміння.',
    objectives: ['A1-01-O1', 'A1-01-O2', 'A1-01-O3'],
    cv: ['CV-01'],
    situations: ['greetings-introductions'],
    estimatedMinutes: 10,
    introduces: [],
    revisits: [
      'ortho.accented-vowels', 'ortho.n-tilde', 'ortho.u-dieresis', 'ortho.written-accent.familiar-words', 'listening.familiar-words',
      'ortho.question-marks', 'ortho.exclamation-marks', 'ortho.capitalization', 'ortho.sentence-punctuation',
      'formula.greeting', 'formula.greeting.time-of-day', 'formula.leave-taking', 'formula.please-thanks', 'formula.apology',
    ],
    steps: [
      {
        kind: 'self-check',
        title: 'Написання і розділові знаки',
        blocks: [
          uk('Ця перевірка необов’язкова: вона нічого не відкриває і не закриває. Завдання нові, без зразка; правило й підказку можна відкрити будь-коли — допомогу буде записано лише для того вміння, яке вона пояснює. Відповідь, яку не вдалося перевірити автоматично, лишається нерозв’язаною, а не помилкою.'),
          link('Знаки наголосу, ñ, ü, розділові знаки й велика літера', [AV_W, NT_W, UD_W, WA_W, Q_W, E_W, C_W, P_W], 'written', 8),
        ],
      },
      {
        kind: 'self-check',
        title: 'Ввічливі фрази',
        blocks: [
          link('Привітання, прощання, подяка й вибачення', [
            'formula.greeting/phrase-recall', 'formula.leave-taking/phrase-recall', 'formula.please-thanks/phrase-recall', 'formula.apology/phrase-recall',
            'formula.greeting/reading-meaning', 'formula.leave-taking/reading-meaning', 'formula.please-thanks/reading-meaning', 'formula.apology/reading-meaning',
            T_C,
          ], 'written', 8),
        ],
      },
      {
        kind: 'self-check',
        title: 'Слухання',
        blocks: [
          link('Знайомі слова і фрази на слух', [LF, 'formula.greeting/listening-meaning', 'formula.leave-taking/listening-meaning', 'formula.please-thanks/listening-meaning', 'formula.apology/listening-meaning'], 'listening', 6),
        ],
      },
      {
        kind: 'summary',
        title: 'Що далі',
        blocks: [
          ulUk(
            'Результат показується окремо для кожного вміння: правильно самостійно, правильно з допомогою, помилка або нерозв’язано.',
            'Пізніше ці вміння повернуться в нових контекстах — у словах, питаннях і повідомленнях наступних блоків.',
            'Наступний блок A1-02: іменник з артиклем, множина, прикметник і присвійні слова.',
          ),
        ],
      },
    ],
  },
  tasks: [
    {
      n: 1, role: 'transfer', family: 'c1-message', mode: 'exact-variants', targets: [E_W, WA_W, P_W], policy: STRICT,
      prompt: [uk('Ана пише тобі: «¿Un café?» Напиши відповідь іспанською з окликом на початку: «Привіт, Ано! Так, дякую.»')],
      accepted: ['¡Hola, Ana! Sí, gracias.'],
      errors: [
        ['Hola, Ana! Sí, gracias.', { [E_W]: 'x', [WA_W]: 'c', [P_W]: 'c' }, 'Бракує ¡ на початку оклику: ¡Hola, Ana!'],
        ['¡Hola, Ana! Si, gracias.', { [E_W]: 'c', [WA_W]: 'x', [P_W]: 'c' }, 'Si без знака — «якщо»; «так» — sí.'],
        ['¡Hola Ana! Sí, gracias.', { [E_W]: 'c', [WA_W]: 'c', [P_W]: 'x' }, 'Звертання відокремлюємо комою: ¡Hola, Ana!'],
        ['¡Hola, Ana! Sí, gracias', { [E_W]: 'c', [WA_W]: 'c', [P_W]: 'x' }, 'Твердження закінчуємо крапкою: Sí, gracias.'],
      ],
      hints: [rule([E_W], 'Оклик має два знаки: ¡ на початку і ! в кінці.'), rule([WA_W], 'Sí — «так» — пишеться зі знаком наголосу; si без знака — «якщо».'), rule([P_W], 'Звертання відокремлюємо комою, твердження закінчуємо крапкою.'), reveal(es('¡Hola, Ana! Sí, gracias.'))],
      ref: '¡Hola, Ana! Sí, gracias.',
      ok: 'Правильно: ¡Hola, Ana! Sí, gracias.',
      bad: 'Ще ні. Перевір знаки оклику, знак наголосу в sí і кому при звертанні: ¡Hola, Ana! Sí, gracias.',
      unres: U('¡Hola, Ana! Sí, gracias.'),
    },
    {
      n: 2, role: 'transfer', family: 'c1-address', mode: 'exact-variants', targets: [WA_W, C_W, P_W], policy: STRICT,
      prompt: [uk('Ти звертаєшся до сусіда в черзі. Напиши іспанською: «Перепрошую, пане Гарсія.»')],
      accepted: ['Perdón, señor García.', ['¡Perdón, señor García!', 'Оклик замість крапки теж правильний.']],
      errors: [
        ['Perdon, señor García.', { [WA_W]: 'x', [C_W]: 'c', [P_W]: 'c' }, 'Perdón пишеться зі знаком наголосу над ó.'],
        ['Perdón, Señor García.', { [WA_W]: 'c', [C_W]: 'x', [P_W]: 'c' }, 'Señor перед прізвищем пишемо з малої літери.'],
        ['Perdón, señor garcía.', { [WA_W]: 'c', [C_W]: 'x', [P_W]: 'c' }, 'Прізвище пишемо з великої літери: García.'],
        ['Perdón señor García.', { [WA_W]: 'c', [C_W]: 'c', [P_W]: 'x' }, 'Звертання відокремлюємо комою: Perdón, señor García.'],
      ],
      hints: [rule([C_W], 'Señor перед прізвищем — з малої, прізвище — з великої.'), rule([P_W], 'Звертання відокремлюємо комою.'), reveal(es('Perdón, señor García.'))],
      ref: 'Perdón, señor García.',
      ok: 'Правильно: Perdón, señor García.',
      bad: 'Ще ні. Правильно: Perdón, señor García.',
      unres: U('Perdón, señor García.'),
    },
    {
      n: 3, role: 'transfer', family: 'c1-listen', mode: 'choice', targets: ['formula.please-thanks/listening-meaning', 'formula.leave-taking/listening-meaning'], clips: ['clip.a1-01.gracias-hasta-manana'],
      prompt: [uk('Послухай. Що сказала людина?')],
      options: [
        ['Дякую, Ано. До завтра!', 'c'],
        ['Будь ласка, Ано. До завтра!', { 'formula.please-thanks/listening-meaning': 'x', 'formula.leave-taking/listening-meaning': 'c' }, 'Por favor не звучить; у записі gracias — «дякую».'],
        ['Дякую, Ано. Добрий ранок!', { 'formula.please-thanks/listening-meaning': 'c', 'formula.leave-taking/listening-meaning': 'x' }, 'Buenos días не звучить; у записі hasta mañana — «до завтра».'],
      ],
      hints: [transcript(['formula.please-thanks/listening-meaning', 'formula.leave-taking/listening-meaning'], 'Gracias, Ana. ¡Hasta mañana!')],
      ok: 'Так: Gracias, Ana. ¡Hasta mañana! — «Дякую, Ано. До завтра!».',
      bad: 'Ні. У записі звучить Gracias, Ana. ¡Hasta mañana! — «Дякую, Ано. До завтра!».',
    },
    {
      n: 4, role: 'transfer', family: 'c1-time', mode: 'choice', targets: [T_C],
      prompt: [uk('7:30, ти заходиш у кав’ярню на сніданок. Як привітатися?')],
      options: [
        ['Buenos días.', 'c'],
        ['Buenas tardes.', 'x', 'Buenas tardes кажуть після обіду.'],
        ['Buenas noches.', 'x', 'Buenas noches кажуть пізно ввечері.'],
      ],
      hints: [rule([T_C], 'Buenos días — зранку й до обіду, buenas tardes — після обіду, buenas noches — пізно ввечері.')],
      ok: 'Так: зранку — buenos días.',
      bad: 'Ні. Зранку вітаються buenos días.',
    },
    {
      n: 5, role: 'transfer', family: 'c1-reading', mode: 'choice', targets: ['formula.apology/reading-meaning'],
      prompt: [uk('Прочитай короткий діалог у кав’ярні.'), es('—Un café, por favor. —Lo siento, señora.'), uk('Що відповів офіціант?')],
      options: [
        ['Мені шкода, пані.', 'c'],
        ['Нема за що, пані.', 'x', 'Нема за що — de nada.'],
        ['Дякую, пані.', 'x', 'Дякую — gracias.'],
      ],
      hints: [rule(['formula.apology/reading-meaning'], 'Lo siento — «мені шкода»: так кажуть, коли доводиться відмовити.')],
      ok: 'Так: lo siento — «мені шкода»; мабуть, кави немає.',
      bad: 'Ні. Lo siento — «мені шкода».',
    },
    {
      n: 6, role: 'transfer', family: 'c1-dictation', mode: 'exact-variants', targets: ['formula.please-thanks/dictation', 'formula.leave-taking/dictation'], clips: ['clip.a1-01.gracias-hasta-manana'], policy: LOOSE,
      prompt: [uk('Послухай і запиши почуте іспанською.')],
      accepted: ['Gracias, Ana. ¡Hasta mañana!', 'Gracias, Ana. Hasta mañana.', 'Gracias, Ana, hasta mañana.'],
      errors: [
        ['Gracias Ana. ¡Hasta mañana!', 'u', 'Слова записані правильно, але звертання відокремлюємо комою: Gracias, Ana.'],
        ['Gracias, Ana. ¡Hasta manana!', { 'formula.please-thanks/dictation': 'c', 'formula.leave-taking/dictation': 'x' }, 'У mañana потрібна літера ñ.'],
        ['Gracias, Ana. Hasta manana.', { 'formula.please-thanks/dictation': 'c', 'formula.leave-taking/dictation': 'x' }, 'У mañana потрібна літера ñ.'],
        ['Gracias, Ana. ¡Asta mañana!', { 'formula.please-thanks/dictation': 'c', 'formula.leave-taking/dictation': 'x' }, 'Hasta пишеться з h, хоча h не читається.'],
      ],
      hints: [transcript(['formula.please-thanks/dictation', 'formula.leave-taking/dictation'], 'Gracias, Ana. ¡Hasta mañana!')],
      ref: 'Gracias, Ana. ¡Hasta mañana!',
      ok: 'Правильно: Gracias, Ana. ¡Hasta mañana!',
      bad: 'Ще ні. У записі: Gracias, Ana. ¡Hasta mañana!',
      unres: U('Gracias, Ana. ¡Hasta mañana!'),
    },
  ],
  clips: [
    clip({
      id: 'clip.a1-01.gracias-hasta-manana', lessonId: 'A1-01-C1', kind: 'phrase', family: 'thanks-farewell',
      transcript: 'Gracias, Ana. ¡Hasta mañana!', translationUk: 'Дякую, Ано. До завтра!',
      targets: ['formula.please-thanks/listening-meaning', 'formula.leave-taking/listening-meaning', 'formula.please-thanks/dictation', 'formula.leave-taking/dictation'],
    }),
  ],
};
