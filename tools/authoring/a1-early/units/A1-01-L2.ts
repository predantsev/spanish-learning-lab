// A1-01-L2 — stress awareness and written accents in a small familiar word set; first listening clips.
import { LOOSE, clip, clue, es, ex, reveal, rule, tableUk, transcript, translationFor, uk, ulUk } from '../lib.ts';
import type { Unit } from '../lib.ts';
import { U } from '../common.ts';

const WA_W = 'ortho.written-accent.familiar-words/written-form';
const WA_C = 'ortho.written-accent.familiar-words/context-choice';
const LF = 'listening.familiar-words/listening-meaning';

const RULE_WA = 'Знак наголосу ставлять над наголошеною голосною — над тією, що звучить сильніше. У словах з уроку він обов’язковий: sí, adiós, perdón, café, aquí, también, número, teléfono, música, sábado, fácil, lápiz. Без знака слово написане з помилкою, а si без знака — інше слово («якщо»).';
const RULE_STRESS = 'Наголошений склад звучить сильніше. У словах на голосну, -n або -s він зазвичай передостанній (CA-sa), в інших словах — останній (ho-TEL). Якщо слово звучить інакше, над наголошеною голосною пишуть знак наголосу: ca-FÉ, LÁ-piz, NÚ-me-ro.';

export const unit: Unit = {
  lesson: {
    id: 'A1-01-L2',
    titleUk: 'Наголос і знак наголосу в знайомих словах',
    termEs: 'la sílaba tónica y la tilde',
    summaryUk: 'Почуєш, який склад у слові звучить сильніше, і навчишся не пропускати знак наголосу в дванадцяти знайомих словах. Перші короткі записи іспанською.',
    objectives: ['A1-01-O2'],
    cv: [],
    situations: [],
    estimatedMinutes: 12,
    skippableFoundation: true,
    introduces: ['ortho.stress-awareness', 'ortho.written-accent.familiar-words', 'listening.familiar-words'],
    revisits: ['ortho.accented-vowels'],
    steps: [
      {
        kind: 'explanation',
        title: 'Наголошений склад',
        blocks: [
          uk('У багатоскладових словах із цього уроку один склад звучить сильніше — це наголошений склад. В іспанській є просте орієнтовне правило:'),
          ulUk(
            'слово закінчується на голосну, -n або -s — наголос зазвичай на передостанньому складі: CA-sa, ME-sa, GRA-cias;',
            'слово закінчується на іншу приголосну — наголос зазвичай на останньому складі: ho-TEL.',
          ),
          uk('Якщо слово звучить інакше, над наголошеною голосною пишуть знак наголосу: ca-FÉ, a-DIÓS, NÚ-me-ro, LÁ-piz. Тому знак підказує, як прочитати слово. Повних правил зараз учити не треба — досить помічати знак і зберігати його в словах, які вже знаєш.'),
        ],
      },
      {
        kind: 'explanation',
        title: 'Знак наголосу в знайомих словах',
        blocks: [
          uk('У цих словах знак наголосу — частина правильного написання. Великими літерами виділено наголошений склад.'),
          tableUk(['Слово', 'Наголос', 'Значення'], [
            ['sí', 'SÍ', 'так'],
            ['adiós', 'a-DIÓS', 'до побачення'],
            ['perdón', 'per-DÓN', 'вибачте, перепрошую'],
            ['café', 'ca-FÉ', 'кава; кав’ярня'],
            ['aquí', 'a-QUÍ', 'тут'],
            ['también', 'tam-BIÉN', 'теж, також'],
            ['número', 'NÚ-me-ro', 'номер; число'],
            ['teléfono', 'te-LÉ-fo-no', 'телефон'],
            ['música', 'MÚ-si-ca', 'музика'],
            ['sábado', 'SÁ-ba-do', 'субота'],
            ['fácil', 'FÁ-cil', 'легкий, простий'],
            ['lápiz', 'LÁ-piz', 'олівець'],
          ]),
          uk('А ці слова з уроку пишуться без знака, бо наголос у них звичайний: casa (CA-sa) — дім, mesa (ME-sa) — стіл, hotel (ho-TEL) — готель, gracias (GRA-cias) — дякую, no — ні.'),
          uk('Sí і si — два різні слова: sí зі знаком означає «так», si без знака — «якщо». На початку речення знак зберігається: Sí, gracias.'),
        ],
      },
      {
        kind: 'examples',
        title: 'Короткі фрази',
        blocks: [
          ex('Sí, gracias.', 'Так, дякую.'),
          ex('Aquí, señor.', 'Ось тут, пане.'),
          ex('Adiós, señora.', 'До побачення, пані.'),
        ],
      },
      { kind: 'supported-practice', title: 'Тренування з підказкою наголосу', tasks: [1, 2, 11] },
      { kind: 'independent-practice', title: 'Самостійно', tasks: [3, 12, 4, 5, 6] },
      {
        kind: 'listening',
        title: 'Послухай знайомі слова',
        clips: ['clip.a1-01.si-gracias', 'clip.a1-01.perdon-senora'],
        tasks: [14, 15],
      },
      {
        kind: 'summary',
        title: 'Підсумок',
        blocks: [
          ulUk(
            'Наголошений склад звучить сильніше; знак наголосу показує його там, де слово звучить «інакше»: ca-FÉ, NÚ-me-ro, LÁ-piz.',
            'Дванадцять слів пишуться зі знаком: sí, adiós, perdón, café, aquí, también, número, teléfono, música, sábado, fácil, lápiz.',
            'Sí — «так», si — «якщо»: знак розрізняє два слова.',
            'Наступний урок: розділові знаки ¿ ? ¡ !, велика літера і перші ввічливі фрази.',
          ),
        ],
      },
    ],
  },
  tasks: [
    // ---- supported ----
    {
      n: 1, role: 'supported', family: 'stress-mark', mode: 'exact-variants', targets: [WA_W], policy: LOOSE,
      prompt: [uk('У слові «музика» наголос на першому складі: MÚ-si-ca. Напиши слово зі знаком наголосу.'), es('musica')],
      accepted: ['música.'],
      errors: [
        ['musica.', 'x', 'Бракує знака наголосу. Наголошена перша голосна: música.'],
        ['musíca.', 'x', 'Знак стоїть не над тією голосною. Наголос на першому складі: música.'],
      ],
      hints: [rule([WA_W], RULE_WA), reveal(es('música'))],
      ref: 'música',
      ok: 'Правильно: música — знак над наголошеною ú.',
      bad: 'Ще ні. Знак наголосу ставлять над першою голосною: música.',
      unres: U('música'),
    },
    {
      n: 2, role: 'supported', family: 'stress-mark', mode: 'exact-variants', targets: [WA_W], policy: LOOSE,
      prompt: [uk('У слові «телефон» наголос на другому складі: te-LÉ-fo-no. Напиши слово зі знаком наголосу.'), es('telefono')],
      accepted: ['teléfono.'],
      errors: [
        ['telefono.', 'x', 'Бракує знака наголосу над другою e: teléfono.'],
        ['téléfono.', 'x', 'Знак наголосу в слові лише один — над наголошеною голосною: teléfono.'],
        ['telefóno.', 'x', 'Знак стоїть не над тією голосною. Наголошений склад LÉ: teléfono.'],
      ],
      hints: [rule([WA_W], RULE_WA), reveal(es('teléfono'))],
      ref: 'teléfono',
      ok: 'Правильно: teléfono.',
      bad: 'Ще ні. Знак стоїть над наголошеною голосною другого складу: teléfono.',
      unres: U('teléfono'),
    },
    {
      n: 11, role: 'supported', family: 'choose-spelling', mode: 'choice', targets: [WA_C],
      prompt: [uk('Підказка: наголос на першому складі — NÚ-me-ro.'), uk('Як правильно пишеться слово «номер; число»?')],
      options: [
        ['número', 'c'],
        ['numero', 'x', 'Бракує знака наголосу: número.'],
        ['numéro', 'x', 'Знак стоїть не над наголошеною голосною: número.'],
      ],
      hints: [rule([WA_C], RULE_WA)],
      ok: 'Так: número — знак над наголошеною ú.',
      bad: 'Ні. Наголос на першому складі, тому número.',
    },
    // ---- independent ----
    {
      n: 3, role: 'independent', family: 'fix-accent', mode: 'exact-variants', targets: [WA_W], policy: LOOSE,
      prompt: [uk('У слові бракує знака наголосу. Виправ його. Значення: «теж, також».'), es('tambien')],
      accepted: ['también.'],
      errors: [
        ['tambien.', 'x', 'Слово не змінилося: también пишеться зі знаком наголосу над é.'],
        ['tambíen.', 'x', 'Знак стоїть не над тією голосною. Наголошений склад BIÉN: también.'],
      ],
      hints: [clue([WA_W], 'Наголос на останньому складі: tam-BIÉN.'), reveal(es('también'))],
      ref: 'también',
      ok: 'Правильно: también.',
      bad: 'Ще ні. Правильне написання — también, знак над é.',
      unres: U('también'),
    },
    {
      n: 4, role: 'independent', family: 'fix-accent', mode: 'exact-variants', targets: [WA_W], policy: LOOSE,
      prompt: [uk('У слові бракує знака наголосу. Виправ його. Значення: «олівець».'), es('lapiz')],
      accepted: ['lápiz.'],
      errors: [
        ['lapiz.', 'x', 'Слово не змінилося: lápiz пишеться зі знаком наголосу над á.'],
        ['lapíz.', 'x', 'Знак стоїть не над тією голосною. Наголос на першому складі: lápiz.'],
      ],
      hints: [clue([WA_W], 'Наголос на першому складі: LÁ-piz.'), reveal(es('lápiz'))],
      ref: 'lápiz',
      ok: 'Правильно: lápiz.',
      bad: 'Ще ні. Правильне написання — lápiz, знак над á.',
      unres: U('lápiz'),
    },
    {
      n: 5, role: 'independent', family: 'recall', mode: 'exact-variants', targets: [WA_W], policy: LOOSE,
      prompt: [uk('Напиши іспанською слово з уроку: «тут».')],
      accepted: ['aquí.'],
      errors: [
        ['aqui.', 'x', 'Бракує знака наголосу над останньою голосною: aquí.'],
        ['áqui.', 'x', 'Знак стоїть не над тією голосною. Наголос на останньому складі: aquí.'],
      ],
      hints: [clue([WA_W], 'Наголос на останньому складі: a-QUÍ.'), reveal(es('aquí'))],
      ref: 'aquí',
      ok: 'Правильно: aquí.',
      bad: 'Ще ні. «Тут» — aquí, зі знаком наголосу над í.',
      unres: U('aquí'),
    },
    {
      n: 6, role: 'independent', family: 'recall', mode: 'exact-variants', targets: [WA_W], policy: LOOSE,
      prompt: [uk('Напиши іспанською одним словом: «перепрошую» (коли випадково комусь заважаєш).')],
      accepted: ['Perdón.', '¡Perdón!'],
      errors: [
        ['Perdon.', 'x', 'Бракує знака наголосу над ó: perdón.'],
        ['¡Perdon!', 'x', 'Бракує знака наголосу над ó: perdón.'],
      ],
      hints: [clue([WA_W], 'Наголос на останньому складі: per-DÓN.'), reveal(es('perdón'))],
      ref: 'perdón',
      ok: 'Правильно: perdón.',
      bad: 'Ще ні. Правильне написання — perdón, зі знаком наголосу над ó.',
      unres: U('perdón'),
    },
    {
      n: 12, role: 'independent', family: 'choose-spelling', mode: 'choice', targets: [WA_C],
      prompt: [uk('Яка відповідь означає «Так, дякую»?')],
      options: [
        ['Sí, gracias.', 'c'],
        ['Si, gracias.', 'x', 'Si без знака означає «якщо». «Так» — sí, зі знаком наголосу.'],
      ],
      hints: [rule([WA_C], RULE_WA)],
      ok: 'Так: Sí, gracias. Знак зберігається й на великій літері.',
      bad: 'Ні. «Так» — sí, зі знаком наголосу: Sí, gracias.',
    },
    // ---- held-out ----
    {
      n: 7, role: 'delayed', family: 'recall', mode: 'exact-variants', targets: [WA_W], policy: LOOSE,
      prompt: [uk('Напиши іспанською назву дня тижня «субота».')],
      accepted: ['sábado.'],
      errors: [
        ['sabado.', 'x', 'Бракує знака наголосу над першою á: sábado.'],
        ['sabádo.', 'x', 'Знак стоїть не над тією голосною. Наголос на першому складі: sábado.'],
      ],
      hints: [clue([WA_W], 'Наголос на першому складі: SÁ-ba-do.'), reveal(es('sábado'))],
      ref: 'sábado',
      ok: 'Правильно: sábado.',
      bad: 'Ще ні. «Субота» — sábado, знак над першою á.',
      unres: U('sábado'),
    },
    {
      n: 8, role: 'delayed', family: 'fix-accent', mode: 'exact-variants', targets: [WA_W], policy: LOOSE,
      prompt: [uk('Виправ слово: у ньому бракує знака наголосу. Значення: «легкий, простий».'), es('facil')],
      accepted: ['fácil.'],
      errors: [
        ['facil.', 'x', 'Слово не змінилося: fácil пишеться зі знаком наголосу над á.'],
        ['facíl.', 'x', 'Знак стоїть не над тією голосною. Наголос на першому складі: fácil.'],
      ],
      hints: [clue([WA_W], 'Наголос на першому складі: FÁ-cil.'), reveal(es('fácil'))],
      ref: 'fácil',
      ok: 'Правильно: fácil.',
      bad: 'Ще ні. Правильне написання — fácil.',
      unres: U('fácil'),
    },
    {
      n: 9, role: 'transfer', family: 'form-field', mode: 'exact-variants', targets: [WA_W], policy: LOOSE,
      prompt: [uk('Ти створюєш контакт у телефоні. Напиши іспанською назву поля «Номер телефону». Між двома словами з уроку постав прийменник de: «номер de телефон».')],
      accepted: ['Número de teléfono.'],
      errors: [
        ['Numero de teléfono.', 'x', 'Бракує знака наголосу в número.'],
        ['Número de telefono.', 'x', 'Бракує знака наголосу в teléfono.'],
        ['Numero de telefono.', 'x', 'Бракує знаків наголосу в обох словах: número, teléfono.'],
      ],
      hints: [rule([WA_W], RULE_WA), reveal(es('Número de teléfono'))],
      ref: 'Número de teléfono',
      ok: 'Правильно: Número de teléfono.',
      bad: 'Ще ні. Обидва слова пишуться зі знаком наголосу: número, teléfono.',
      unres: U('Número de teléfono'),
    },
    {
      n: 10, role: 'transfer', family: 'note', mode: 'exact-variants', targets: [WA_W], policy: LOOSE,
      prompt: [uk('Напиши нотатку іспанською: «Кава і музика».'), ex('y', 'і')],
      accepted: ['Café y música.'],
      errors: [
        ['Cafe y música.', 'x', 'Бракує знака наголосу в café.'],
        ['Café y musica.', 'x', 'Бракує знака наголосу в música.'],
        ['Cafe y musica.', 'x', 'Бракує знаків наголосу: café, música.'],
      ],
      hints: [rule([WA_W], RULE_WA), reveal(es('Café y música'))],
      ref: 'Café y música',
      ok: 'Правильно: Café y música.',
      bad: 'Ще ні. Обидва слова пишуться зі знаком наголосу: café, música.',
      unres: U('Café y música'),
    },
    {
      n: 13, role: 'delayed', family: 'choose-spelling', mode: 'choice', targets: [WA_C],
      prompt: [uk('Як правильно пишеться слово «теж, також»?')],
      options: [
        ['también', 'c'],
        ['tambien', 'x', 'Бракує знака наголосу: también.'],
        ['tambíen', 'x', 'Знак стоїть не над наголошеною голосною: también.'],
      ],
      hints: [rule([WA_C], RULE_WA)],
      ok: 'Так: también.',
      bad: 'Ні. Правильно: también — знак над é.',
    },
    // ---- listening ----
    {
      n: 14, role: 'supported', family: 'listen-reply', mode: 'choice', targets: [LF], clips: ['clip.a1-01.si-gracias'],
      prompt: [uk('Послухай коротку відповідь. Що відповіла людина?')],
      options: [
        ['Так, дякую.', 'c'],
        ['Ні, дякую.', 'x', 'У записі звучить sí — «так».'],
        ['До побачення.', 'x', 'У записі немає adiós; звучить sí, gracias — «так, дякую».'],
      ],
      hints: [translationFor([LF], ex('gracias', 'дякую'), ex('sí', 'так'), ex('no', 'ні')), transcript([LF], 'Sí, gracias.')],
      ok: 'Так: Sí, gracias — «Так, дякую».',
      bad: 'Ні. У записі звучить Sí, gracias — «Так, дякую».',
    },
    {
      n: 15, role: 'independent', family: 'listen-address', mode: 'choice', targets: [LF], clips: ['clip.a1-01.perdon-senora'],
      prompt: [uk('Послухай. Що сказала людина?')],
      options: [
        ['Перепрошую, пані.', 'c'],
        ['Дякую, пані.', 'x', 'У записі звучить perdón — «перепрошую», а не gracias.'],
        ['До побачення, пані.', 'x', 'У записі звучить perdón — «перепрошую», а не adiós.'],
      ],
      hints: [transcript([LF], 'Perdón, señora.')],
      ok: 'Так: Perdón, señora — «Перепрошую, пані».',
      bad: 'Ні. У записі звучить Perdón, señora — «Перепрошую, пані».',
    },
    {
      n: 16, role: 'delayed', family: 'listen-reply', mode: 'choice', targets: [LF], clips: ['clip.a1-01.no-gracias'],
      prompt: [uk('Послухай відповідь. Що вона означає?')],
      options: [
        ['Ні, дякую.', 'c'],
        ['Так, дякую.', 'x', 'У записі звучить no — «ні».'],
        ['Перепрошую.', 'x', 'У записі звучить no, gracias — «ні, дякую».'],
      ],
      hints: [transcript([LF], 'No, gracias.')],
      ok: 'Так: No, gracias — «Ні, дякую».',
      bad: 'Ні. У записі звучить No, gracias — «Ні, дякую».',
    },
  ],
  clips: [
    clip({
      id: 'clip.a1-01.si-gracias', lessonId: 'A1-01-L2', kind: 'phrase', family: 'reply',
      transcript: 'Sí, gracias.', translationUk: 'Так, дякую.', targets: [LF],
      pronunciationNoteUk: 'Наголос: SÍ, GRA-cias.',
    }),
    clip({
      id: 'clip.a1-01.perdon-senora', lessonId: 'A1-01-L2', kind: 'phrase', family: 'address',
      transcript: 'Perdón, señora.', translationUk: 'Перепрошую, пані.', targets: [LF],
      pronunciationNoteUk: 'Наголос: per-DÓN, se-ÑO-ra.',
    }),
    clip({
      id: 'clip.a1-01.no-gracias', lessonId: 'A1-01-L2', kind: 'phrase', family: 'reply',
      transcript: 'No, gracias.', translationUk: 'Ні, дякую.', targets: [LF],
      pronunciationNoteUk: 'Наголос: NO, GRA-cias.',
    }),
  ],
};
