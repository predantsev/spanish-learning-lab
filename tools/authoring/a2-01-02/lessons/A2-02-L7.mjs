// A2-02-L7 — adding a detail to a description: relative que, qué vs que, adjectives with agreement.
import { EX, LINK, LIST_UK, UK, choice, gap, lesson as mkLesson, open, rubric, step } from '../lib.mjs';

const L = 'A2-02-L7';
const RQ = 'relative.que/construction-use';
const RQ_R = 'relative.que/reading-meaning';
const AQ = 'ortho.accent-pair.que/written-form';
const AQ_C = 'ortho.accent-pair.que/context-choice';
const WD = 'writing.description-detail/construction-use';

const R = {
  rq: 'Que приєднує до іменника пояснення, як українські «який, яка, що»: Tengo un vecino que habla tres idiomas. Que не змінюється й стосується і людей, і речей. Перед que особове a не ставимо: la chica que conozco.',
  aq: 'Qué зі знаком наголосу — у питаннях і окликах, також непрямих: ¿Qué quieres? ¡Qué bonito! No sé qué quiere. Que без знака — «який, що» в поясненні чи після дієслова: la casa que tiene jardín; Dice que viene.',
  wd: 'Деталь до опису додаємо прикметниками в потрібному роді й числі (Es un piso pequeño, pero muy luminoso) або реченням з que (un piso que está cerca del centro).',
};
const ASK_RQ = 'Поєднайте два речення в одне за допомогою que.';

const join = (id, role, family, es, uk, acc, err, model) =>
  open(L, { id, role, family, ts: [RQ], ask: model ? `Подивіться на зразок. ${ASK_RQ}` : ASK_RQ, model, es, uk, a: acc, err: err.map(([x, fb]) => [x, { [RQ]: 'incorrect' }, fb]), rule: R.rq, full: acc[0], ok: `Правильно: ${acc[0]}`, no: `Можлива відповідь: ${acc[0]}` });
const QQ = (id, role, family, es, uk, a, full, model) =>
  gap(L, { id, role, family, t: AQ, ask: model ? 'Подивіться на зразок: que чи qué? Впишіть потрібне слово.' : 'Que чи qué? Впишіть потрібне слово.', model, es, uk, a, err: [[a.toLowerCase() === 'qué' ? 'que' : 'qué', a.toLowerCase() === 'qué' ? 'Тут питання чи оклик (зокрема непряме питання) — qué зі знаком наголосу.' : 'Тут que пояснює іменник або вводить сказане — без знака наголосу.']], rule: R.aq, full });
const desc = (id, role, family, parts, uk, acc, err, model) =>
  open(L, { id, role, family, ts: [WD], ask: `${model ? 'Подивіться на зразок. ' : ''}Складіть одне речення-опис з поданих слів. Узгодьте прикметники.`, model, es: parts, uk, a: acc, err: err.map(([x, fb]) => [x, { [WD]: 'incorrect' }, fb]), rule: R.wd, full: acc[0], ok: `Правильно: ${acc[0]}`, no: `Можлива відповідь: ${acc[0]}` });

export const tasks = [
  // relative que
  join('T01', 'supported', 'family-home', 'Tengo un vecino. El vecino habla tres idiomas.', 'У мене є сусід, який говорить трьома мовами.', ['Tengo un vecino que habla tres idiomas.'], [['Tengo un vecino qué habla tres idiomas.', 'Тут que пояснює іменник — без знака наголосу.'], ['Tengo un vecino que él habla tres idiomas.', 'Після que він уже не повторюємо: un vecino que habla.']], [['Es una casa. La casa tiene jardín. → Es una casa que tiene jardín.', 'Це будинок, у якого є сад.']]),
  join('T02', 'supported', 'home', 'Busco un piso. El piso tiene terraza.', 'Я шукаю квартиру з терасою.', ['Busco un piso que tiene terraza.'], [['Busco un piso qué tiene terraza.', 'Тут que пояснює іменник — без знака наголосу.']], [['Tengo una amiga. La amiga vive en Madrid. → Tengo una amiga que vive en Madrid.', 'У мене є подруга, яка живе в Мадриді.']]),
  join('T03', 'independent', 'shop', 'Quiero el bolso. El bolso está en la ventana.', 'Я хочу сумку, яка у вітрині.', ['Quiero el bolso que está en la ventana.'], [['Quiero el bolso cual está en la ventana.', 'Тут уживаємо que: el bolso que está…']]),
  join('T04', 'independent', 'family-home', 'Esta es la chica. Conozco a la chica del gimnasio.', 'Це дівчина, яку я знаю зі спортзалу.', ['Esta es la chica que conozco del gimnasio.'], [['Esta es la chica a que conozco del gimnasio.', 'Перед que особове a не ставимо: la chica que conozco.'], ['Esta es la chica que la conozco del gimnasio.', 'Після que займенник la не повторюємо.']]),
  join('T05', 'independent', 'home', 'Vivo en un barrio. El barrio es muy tranquilo.', 'Я живу в районі, який дуже спокійний.', ['Vivo en un barrio que es muy tranquilo.'], [['Vivo en un barrio qué es muy tranquilo.', 'Тут que пояснює іменник — без знака наголосу.']]),
  join('T06', 'independent', 'free-time', 'Leo un libro. Mi hermana me presta el libro.', 'Я читаю книжку, яку мені позичає сестра.', ['Leo un libro que me presta mi hermana.', 'Leo un libro que mi hermana me presta.'], [['Leo un libro que me lo presta mi hermana.', 'Після que займенник lo не повторюємо.']]),
  join('T07', 'delayed', 'home', 'Es un piso. El piso está cerca del centro.', 'Це квартира біля центру.', ['Es un piso que está cerca del centro.'], [['Es un piso qué está cerca del centro.', 'Тут que пояснює іменник — без знака наголосу.']]),
  join('T08', 'delayed', 'family-home', 'Tengo un perro. El perro duerme mucho.', 'У мене собака, який багато спить.', ['Tengo un perro que duerme mucho.'], [['Tengo un perro que él duerme mucho.', 'Після que він уже не повторюємо.']]),
  join('T09', 'transfer', 'messages', '¡Hola, Ana! Tengo un vecino nuevo. El vecino cocina muy bien.', 'Привіт, Ано! У мене новий сусід, який дуже добре готує.', ['¡Hola, Ana! Tengo un vecino nuevo que cocina muy bien.'], [['¡Hola, Ana! Tengo un vecino nuevo qué cocina muy bien.', 'Тут que пояснює іменник — без знака наголосу.']]),
  join('T10', 'transfer', 'travel', 'Buscamos un hotel. El hotel está cerca de la playa.', 'Ми шукаємо готель біля пляжу.', ['Buscamos un hotel que está cerca de la playa.'], [['Buscamos un hotel qué está cerca de la playa.', 'Тут que пояснює іменник — без знака наголосу.']]),
  choice(L, { id: 'T11', role: 'supported', family: 'family-home', ts: [RQ_R], ask: 'Прочитайте речення. Хто говорить трьома мовами?', es: 'Mi vecina tiene un hijo que habla tres idiomas.', opts: [['син сусідки', 'c'], ['сусідка', 'x', 'Que стосується найближчого іменника: un hijo.'], ['я', 'x', 'Que пояснює слово hijo.']], rule: R.rq, ok: 'Правильно: que = un hijo.', no: 'Que пояснює un hijo: трьома мовами говорить син.' }),
  choice(L, { id: 'T12', role: 'independent', family: 'home', ts: [RQ_R], ask: 'Прочитайте опис. У чого є велика тераса?', es: 'Es un piso que tiene una terraza grande y una cocina que es muy luminosa.', opts: [['квартира', 'c'], ['кухня', 'x', 'Про кухню сказано, що вона світла; тераса є у квартири.'], ['будинок поруч', 'x', 'Про інший будинок не йдеться.']], rule: R.rq, ok: 'Правильно: un piso que tiene una terraza.', no: 'Un piso que tiene una terraza — тераса є у квартири.' }),
  choice(L, { id: 'T13', role: 'transfer', family: 'messages', ts: [RQ_R], ask: 'Прочитайте повідомлення. Де живе подруга, про яку пише Пабло?', es: '¡Hola, Marta! Mañana viene mi amiga Carmen, la chica que vive en Valencia. ¿Vienes a cenar con nosotros?', opts: [['у Валенсії', 'c'], ['у Мадриді', 'x', 'Про Мадрид не йдеться.'], ['з Пабло', 'x', 'La chica que vive en Valencia — вона живе у Валенсії.']], rule: R.rq, ok: 'Правильно: la chica que vive en Valencia.', no: 'La chica que vive en Valencia — Кармен живе у Валенсії.' }),

  // que / qué
  QQ('T21', 'supported', 'family-home', 'No sé ___ quiere Ana para su cumpleaños.', 'Я не знаю, що Ана хоче на день народження.', 'qué', 'No sé qué quiere Ana para su cumpleaños.', [['¿Qué quieres? — No sé qué quiere. — La casa que tiene jardín.', 'Що ти хочеш? — Не знаю, чого він хоче. — Будинок, у якого є сад.']]),
  QQ('T22', 'supported', 'home', 'Es una casa ___ tiene jardín.', 'Це будинок, у якого є сад.', 'que', 'Es una casa que tiene jardín.', [['Dice que viene mañana.', 'Каже, що прийде завтра.']]),
  QQ('T23', 'independent', 'free-time', '¡___ bonito es tu barrio!', 'Який гарний твій район!', 'Qué', '¡Qué bonito es tu barrio!'),
  QQ('T24', 'independent', 'family-home', 'Mi madre dice ___ la cena es a las nueve.', 'Мама каже, що вечеря о дев’ятій.', 'que', 'Mi madre dice que la cena es a las nueve.'),
  QQ('T25', 'independent', 'shop', '¿___ prefieres, el bolso rojo o el negro?', 'Що тобі більше подобається, червона сумка чи чорна?', 'Qué', '¿Qué prefieres, el bolso rojo o el negro?'),
  QQ('T26', 'independent', 'home', 'El piso ___ buscamos tiene tres habitaciones.', 'Квартира, яку ми шукаємо, має три кімнати.', 'que', 'El piso que buscamos tiene tres habitaciones.'),
  QQ('T27', 'delayed', 'family-home', 'Pablo pregunta ___ hora es.', 'Пабло питає, котра година.', 'qué', 'Pablo pregunta qué hora es.'),
  QQ('T28', 'delayed', 'free-time', 'La película ___ vemos esta noche es muy buena.', 'Фільм, який ми дивимося сьогодні ввечері, дуже добрий.', 'que', 'La película que vemos esta noche es muy buena.'),
  QQ('T29', 'transfer', 'messages', '¡Hola, Pablo! ¿Sabes ___ tren cogemos mañana?', 'Привіт, Пабло! Ти знаєш, яким потягом ми їдемо завтра?', 'qué', '¡Hola, Pablo! ¿Sabes qué tren cogemos mañana?'),
  QQ('T30', 'transfer', 'work-study', 'Luis dice ___ la reunión es a las diez.', 'Луїс каже, що нарада о десятій.', 'que', 'Luis dice que la reunión es a las diez.'),
  choice(L, { id: 'T31', role: 'independent', family: 'shop', ts: [AQ_C], ask: 'Оберіть правильне написання.', es: 'No sé ___ mochila comprar.', opts: [['qué', 'c'], ['que', 'x', 'Це непряме питання («яку саме»): qué.']], rule: R.aq, ref: 'No sé qué mochila comprar.', ok: 'Правильно: непряме питання — qué.', no: 'Непряме питання — qué: No sé qué mochila comprar.' }),
  choice(L, { id: 'T32', role: 'delayed', family: 'home', ts: [AQ_C], ask: 'Оберіть правильне написання.', es: 'Me gusta el barrio ___ tiene muchos parques.', opts: [['que', 'c'], ['qué', 'x', 'Тут que пояснює іменник barrio — без знака наголосу.']], rule: R.aq, ref: 'Me gusta el barrio que tiene muchos parques.', ok: 'Правильно: que пояснює іменник.', no: 'Que пояснює barrio — без знака наголосу.' }),

  // description with detail
  desc('T41', 'supported', 'home', 'piso / pequeño / pero muy / luminoso', 'Це маленька, але дуже світла квартира.', ['Es un piso pequeño, pero muy luminoso.', 'Es un piso pequeño pero muy luminoso.'], [['Es un piso pequeña, pero muy luminosa.', 'Piso — чоловічого роду: pequeño, luminoso.']], [['casa / grande / y / moderno → Es una casa grande y moderna.', 'Це великий і сучасний будинок.']]),
  desc('T42', 'supported', 'family-home', 'mis vecinas / simpático / y / tranquilo', 'Мої сусідки приємні й спокійні.', ['Mis vecinas son simpáticas y tranquilas.'], [['Mis vecinas son simpáticos y tranquilos.', 'Vecinas — жіночого роду, множина: simpáticas, tranquilas.']], [['mi barrio / antiguo / pero / bonito → Mi barrio es antiguo, pero bonito.', 'Мій район старий, але гарний.']]),
  desc('T43', 'independent', 'home', 'la cocina / pequeño / pero / cómodo', 'Кухня маленька, але зручна.', ['La cocina es pequeña, pero cómoda.', 'La cocina es pequeña pero cómoda.'], [['La cocina es pequeño, pero cómodo.', 'Cocina — жіночого роду: pequeña, cómoda.']]),
  desc('T44', 'independent', 'shop', 'unas gafas / nuevo / y / muy / bonito', 'Це нові й дуже гарні окуляри.', ['Son unas gafas nuevas y muy bonitas.'], [['Son unas gafas nuevos y muy bonitos.', 'Gafas — жіночого роду, множина: nuevas, bonitas.']]),
  desc('T45', 'independent', 'home', 'un barrio / céntrico / que / tener / muchos parques', 'Це центральний район, у якому багато парків.', ['Es un barrio céntrico que tiene muchos parques.'], [['Es un barrio céntrica que tiene muchos parques.', 'Barrio — чоловічого роду: céntrico.']]),
  desc('T46', 'independent', 'family-home', 'mi hermana / alto / y / muy / simpático', 'Моя сестра висока й дуже приємна.', ['Mi hermana es alta y muy simpática.'], [['Mi hermana es alto y muy simpático.', 'Hermana — жіночого роду: alta, simpática.']]),
  desc('T47', 'delayed', 'home', 'las habitaciones / grande / pero / un poco / ruidoso', 'Кімнати великі, але трохи галасливі.', ['Las habitaciones son grandes, pero un poco ruidosas.', 'Las habitaciones son grandes pero un poco ruidosas.'], [['Las habitaciones son grandes, pero un poco ruidosos.', 'Habitaciones — жіночого роду, множина: ruidosas.']]),
  rubric(L, { id: 'T48', role: 'delayed', family: 'free-time', ts: [WD], ask: 'Опишіть парк або кафе у своєму районі двома реченнями: прикметники + одне речення з que.', criteria: ['Є щонайменше два прикметники в правильному роді й числі.', 'Є речення з que, яке додає деталь до іменника.', 'Опис зрозумілий і стосується одного місця.'], exemplars: ['El café de mi barrio es pequeño, pero muy tranquilo. Es un café que está cerca de mi casa.'], rule: R.wd }),
  rubric(L, { id: 'T49', role: 'transfer', family: 'messages', ts: [WD], ask: 'Напишіть другові коротке повідомлення про свою нову квартиру (2–3 речення): яка вона і одна деталь з que.', criteria: ['Прикметники узгоджені з іменниками.', 'Є речення з que, яке додає деталь.', 'Текст — повідомлення другові.'], exemplars: ['¡Hola, Pablo! Mi piso nuevo es pequeño, pero muy luminoso. Tiene una terraza que es muy bonita.'], rule: R.wd }),
  rubric(L, { id: 'T50', role: 'transfer', family: 'work-study', ts: [WD], ask: 'Опишіть свого викладача або колегу (2–3 речення): який він чи вона і одна деталь з que.', criteria: ['Прикметники узгоджені з людиною, яку описуєте.', 'Є речення з que, яке додає деталь.', 'Опис зрозумілий.'], exemplars: ['Mi profesora de inglés es muy simpática y joven. Es una mujer que habla tres idiomas.'], rule: R.wd }),
];

const s = (id, kind, title, required, opts = {}) => step(id, kind, title, required, { ...opts, lessonId: L });

export const lesson = mkLesson({
  id: L,
  titleUk: 'Додаємо деталь: un piso que tiene terraza',
  termEs: 'oraciones de relativo con que',
  summaryUk: 'Доповнюємо опис деталлю: прикметники в правильному роді й числі та речення з que (un vecino que habla tres idiomas). Розрізняємо que і qué.',
  objectives: ['A2-02-O9'],
  cv: ['CV-03'],
  situations: ['places-accommodation', 'people-family-home'],
  estimatedMinutes: 18,
  introduces: ['relative.que', 'ortho.accent-pair.que', 'writing.description-detail'],
  revisits: ['adj.agreement.o-a', 'present.decir', 'ortho.interrogative-accent', 'ortho.porque-por-que', 'prep.a.personal'],
  steps: [
    s('s1', 'explanation', 'Que: який, яка, що', true, {
      blocks: [
        UK('Щоб додати деталь до іменника, приєднуємо речення словом que — як українські «який, яка, що»: Tengo un vecino que habla tres idiomas. Que не змінюється за родом і числом і стосується і людей, і речей. Після que не повторюємо іменник чи займенник, а особове a перед que не ставимо: la chica que conozco.'),
        UK('Нове слово: el vecino, la vecina — сусід, сусідка.'),
        EX('Es una casa que tiene jardín.', 'Це будинок, у якого є сад.'),
        EX('El libro que leo es muy interesante.', 'Книжка, яку я читаю, дуже цікава.'),
      ],
    }),
    s('s2', 'supported-practice', 'Крок 1. Поєднуємо речення', true, { tasks: ['T01', 'T02', 'T11'] }),
    s('s3', 'explanation', 'Que чи qué', true, {
      blocks: [
        UK('Qué зі знаком наголосу пишемо в питаннях і окликах — і в прямих, і в непрямих: ¿Qué quieres? ¡Qué bonito! No sé qué quiere. Que без знака — «який, що» в поясненні до іменника або після дієслів на кшталт decir: la casa que tiene jardín; Dice que viene.'),
        EX('No sé qué quiere Ana. — Ana dice que quiere un libro.', 'Не знаю, чого хоче Ана. — Ана каже, що хоче книжку.'),
      ],
    }),
    s('s4', 'supported-practice', 'Крок 2. Que чи qué', true, { tasks: ['T21', 'T22'] }),
    s('s5', 'explanation', 'Опис з деталлю', true, {
      blocks: [
        UK('Опис будуємо зі знайомих прикметників, узгоджених з іменником, і поєднуємо їх через y або pero: Es un piso pequeño, pero muy luminoso. Деталь можна додати реченням з que: Es un barrio céntrico que tiene muchos parques.'),
        EX('Mis vecinas son simpáticas y tranquilas.', 'Мої сусідки приємні й спокійні.'),
      ],
    }),
    s('s6', 'supported-practice', 'Крок 3. Складаємо опис', true, { tasks: ['T41', 'T42'] }),
    s('s7', 'independent-practice', 'Самостійно', true, { tasks: ['T03', 'T04', 'T12', 'T23', 'T24', 'T31', 'T43', 'T44'] }),
    s('s8', 'independent-practice', 'Додаткова практика', false, { tasks: ['T05', 'T06', 'T25', 'T26', 'T45', 'T46'] }),
    s('s9', 'summary', 'Підсумок', true, {
      blocks: [
        LIST_UK([
          'Que приєднує деталь до іменника: un vecino que habla tres idiomas.',
          'Qué — у питаннях і окликах (також No sé qué…); que — в поясненні та після dice.',
          'Прикметники в описі узгоджуємо з іменником.',
        ]),
        LINK('Потренувати que і опис', [RQ, AQ, WD, AQ_C], 'written', 10),
      ],
    }),
  ],
});
