"""A2-05-L6 — a past situation as background; initial imperfecto / indefinido meaning contrast (CV-04).

Every contextual choice gives a narrative frame (an explicit event with indefinido, de repente, todavía, a time)
so that only the reviewed reading survives; a time word alone never decides the key.
"""
from build import BL, EX, LINK, P, PE, LessonTasks, lesson, material, reveal, rule, step
from a2_05 import BLOCK

BG_X = 'imperfecto.use-background/context-choice'
BG_C = 'imperfecto.use-background/construction-use'
BE_X = 'contrast.indefinido-imperfecto.background-event/context-choice'

R_BG = ('У розповіді імперфект описує тло — обставини, які вже тривали в момент події (місце, стан, час, погода, те, '
        'що відбувалося навколо). Саму подію, що сталася на цьому тлі, передає pretérito indefinido.')
R_BE = ('Імперфект показує ситуацію як тло, що вже тривало; indefinido — як подію розповіді. Cuando salí de casa, '
        'llovía — дощ уже йшов. Cuando salí de casa, empezó a llover — дощ почався. Тривалість дії сама по собі вибору не визначає.')
INSTR_BG = 'Доповніть розповідь правильною формою дієслова в дужках. Час не підказано: вирішіть, тло це чи подія.'
PROG_NOTE = 'Теж правильно: estar в імперфекті + gerundio підкреслює дію в процесі.'


def bg(t, role, fam, sent, verb, accepted, errs, *, model=None, ex=None):
    main = accepted[0] if isinstance(accepted[0], str) else accepted[0][0]
    full = sent.replace('___', main)
    prompt = [P((model + ' ' if model else '') + INSTR_BG)]
    if ex:
        prompt.append(EX(*ex))
    prompt.append(PE(f'{sent} ({verb})'))
    others = [a if isinstance(a, str) else a[0] for a in accepted[1:]]
    alt = f' Можливо також: {", ".join(others)}.' if others else ''
    fb = (f'Правильно: {main} — тло, що вже тривало в момент події.' + alt,
          f'Ні. Тут потрібне тло: {main}.' + alt,
          f'Цю відповідь не вдалося перевірити автоматично. Порівняйте її з прикладом: {main}.' + alt)
    return t.exact(role, fam, [BG_C], prompt, accepted, errs, [rule([BG_C], R_BG), reveal([BG_C], full)], fb, full)


def l6():
    t = LessonTasks('A2-05-L6')
    fbx = ('Правильно.', 'Ні. Подумайте, що тут тло (вже тривало), а що — подія (сталася).')

    # --- imperfecto.use-background / construction-use --------------------------------------
    sup_c = [
        bg(t, 'supported', 'home', 'Cuando sonó el teléfono, yo ___ en la cocina.', 'estar', ['estaba'],
           [('estuve', 'i', 'Estuve подає перебування як окрему завершену подію. Тут описано, де ви були в момент дзвінка: estaba.'),
            ('estoy', 'i', 'Estoy — теперішній час, а дзвінок був у минулому: estaba.')],
           model='Зразок: Cuando llegué a la estación, hacía frío y había mucha gente. De repente, llegó el tren.'),
        bg(t, 'supported', 'home', 'Cuando llegué a casa, mis hijos todavía ___.', 'dormir',
           ['dormían', ('estaban durmiendo', PROG_NOTE)],
           [('durmieron', 'i', 'Durmieron подає сон як завершену подію. Todavía показує, що сон ще тривав, коли ви прийшли: dormían.'),
            ('duermen', 'i', 'Duermen — теперішній час, а ви прийшли в минулому: dormían.')]),
    ]
    ind_c = [
        bg(t, 'independent', 'going-out', 'Cuando llegamos al restaurante, ___ mucha gente y tuvimos que esperar.', 'haber', ['había'],
           [('hubo', 'i', 'Hubo подає це як подію. Тут описано, що було, коли ви прийшли: había mucha gente.'),
            ('habían', 'i', 'Había не змінюється за числом: había mucha gente.'),
            ('hay', 'i', 'Hay — теперішній час. У минулому: había.')]),
        bg(t, 'independent', 'going-out', 'Cuando empezó la película, ___ las nueve y media.', 'ser', ['eran'],
           [('era', 'i', 'З годинами, крім la una, — множина: eran las nueve y media.'),
            ('fueron', 'i', 'Котра була година — це тло: eran las nueve y media.')]),
        bg(t, 'independent', 'home', 'Cuando Ana llegó, yo ___ muy cansado y no quería salir.', 'estar', ['estaba'],
           [('estuve', 'i', 'Тут описано стан у момент приходу Ани (no quería salir): estaba.'),
            ('era', 'i', 'Стан (cansado) передає estar: estaba.')]),
    ]
    held_c = [
        bg(t, 'delayed', 'home', 'Cuando volví del trabajo, mi madre todavía ___ en el jardín.', 'trabajar',
           ['trabajaba', ('estaba trabajando', PROG_NOTE)],
           [('trabajó', 'i', 'Todavía показує, що робота ще тривала, коли ви повернулися: trabajaba.'),
            ('trabaja', 'i', 'Trabaja — теперішній час. У минулому: trabajaba.')]),
        bg(t, 'delayed', 'going-out', 'Cuando llegó el autobús, ___ muy tarde y yo estaba muy cansada.', 'ser', ['era'],
           [('fue', 'i', 'Пора — це тло: era tarde.'),
            ('estaba', 'i', 'Про пору кажемо ser: era tarde.')]),
        bg(t, 'transfer', 'message', 'Hola, Marta: Ayer, cuando viniste a mi casa, yo no ___ allí. Lo siento.', 'estar', ['estaba'],
           [('estuve', 'i', 'Тут описано, де ви були в момент приходу Марти: no estaba.'),
            ('estoy', 'i', 'Estoy — теперішній час. У минулому: estaba.')]),
    ]

    # --- imperfecto.use-background / context-choice ----------------------------------------
    sup_x = [t.choice('supported', 'story', [BG_X],
                      [P('Прочитайте розповідь. Яка частина описує тло — обставини, на тлі яких щось сталося?'),
                       PE('Hacía sol y los niños jugaban en la plaza. De repente, llegó un autobús muy grande.')],
                      [('Hacía sol y los niños jugaban en la plaza.', 'c', None),
                       ('De repente, llegó un autobús muy grande.', 'i', 'Це подія, яка сталася на цьому тлі (de repente, llegó).')],
                      [rule([BG_X], R_BG)], fbx)]
    ind_x = [
        t.choice('independent', 'office', [BG_X],
                 [P('Оберіть форму, яка підходить за змістом.'), PE('Cuando llegué a la oficina, Luis ya ___ con su ordenador.')],
                 [('trabajó', 'i', 'Trabajó подало б роботу як окрему завершену подію. Ya показує, що Луїс уже працював, коли ви прийшли: trabajaba.'),
                  ('trabajaba', 'c', None),
                  ('trabaja', 'i', 'Trabaja — теперішній час, а ви прийшли в минулому.')],
                 [rule([BG_X], R_BG)], fbx),
        t.choice('independent', 'home', [BG_X],
                 [P('Що означає це речення?'), PE('Cuando sonó el teléfono, yo dormía.')],
                 [('Після дзвінка я ліг (лягла) спати.', 'i', 'Dormía — сон уже тривав у момент дзвінка, а не почався після нього.'),
                  ('Телефон задзвонив, коли я вже спав (спала).', 'c', None),
                  ('Щоразу, коли дзвонив телефон, я спав (спала).', 'i', 'Sonó — один дзвінок, а не повторювана ситуація.')],
                 [rule([BG_X], R_BG)], fbx),
    ]
    held_x = [
        t.choice('delayed', 'story', [BG_X],
                 [P('Оберіть форму, яка підходить за змістом.'), PE('___ las once de la noche y todos dormían. De repente, sonó el teléfono.')],
                 [('Fueron', 'i', 'Котра була година — це тло: eran las once.'),
                  ('Eran', 'c', None),
                  ('Son', 'i', 'Son — теперішній час, а розповідь — про минуле.')],
                 [rule([BG_X], R_BG)], fbx),
        t.choice('transfer', 'message', [BG_X],
                 [P('Оберіть форму, яка підходить за змістом повідомлення.'),
                  PE('Hola, Pablo: Ayer, cuando llegué a la estación, el tren ya ___ allí. ¡Qué bien!')],
                 [('estaba', 'c', None),
                  ('estuvo', 'i', 'Estuvo подає перебування як окрему подію. Ya показує, що потяг уже стояв там, коли ви прийшли: estaba.'),
                  ('está', 'i', 'Está — теперішній час, а розповідь — про вчора.')],
                 [rule([BG_X], R_BG)], fbx),
    ]

    # --- contrast.indefinido-imperfecto.background-event / context-choice -------------------
    bx = [BE_X]
    sup_b = [
        t.choice('supported', 'rain', bx,
                 [P('Порівняйте два речення: Cuando salí de casa, llovía. — Cuando salí de casa, empezó a llover. Що означає перше?'),
                  PE('Cuando salí de casa, llovía.')],
                 [('Дощ уже йшов, коли я виходив (виходила).', 'c', None),
                  ('Дощ почався, коли я вийшов (вийшла).', 'i', 'Це значення речення з подією: Cuando salí de casa, empezó a llover.'),
                  ('Дощ ішов щодня.', 'i', 'Salí — один вихід з дому, а не повторювана ситуація.')],
                 [rule(bx, R_BE)], fbx),
        t.choice('supported', 'rain', bx,
                 [P('Що означає це речення?'), PE('Cuando salí de casa, empezó a llover.')],
                 [('Дощ уже йшов, коли я виходив (виходила).', 'i', 'Це значення речення з тлом: Cuando salí de casa, llovía.'),
                  ('Дощ почався, коли я вийшов (вийшла).', 'c', None)],
                 [rule(bx, R_BE)], fbx),
    ]
    ind_b = [
        t.choice('independent', 'home', bx,
                 [P('Що сталося на тлі чого?'), PE('Yo leía un libro cuando llegó mi hermana.')],
                 [('Сестра прийшла, коли я читав (читала) книжку.', 'c', None),
                  ('Я почав (почала) читати, коли прийшла сестра.', 'i', 'Це означало б: Empecé a leer cuando llegó mi hermana.'),
                  ('Книжку читала сестра.', 'i', 'Llegó mi hermana — сестра прийшла; читав той, хто розповідає (yo leía).')],
                 [rule(bx, R_BE)], fbx),
        t.choice('independent', 'park', bx,
                 [P('Оберіть форму, яка підходить за змістом.'), PE('Estábamos en el parque y hacía sol. De repente, ___ a llover.')],
                 [('empezaba', 'i', 'De repente вводить подію, що сталася на цьому тлі: empezó a llover.'),
                  ('empieza', 'i', 'Empieza — теперішній час, а розповідь — про минуле.'),
                  ('empezó', 'c', None)],
                 [rule(bx, R_BE)], fbx),
        t.choice('independent', 'doctor', bx,
                 [P('Оберіть форму, яка підходить за змістом.'), PE('Cuando llegó el médico, mi abuela ___ muy mal.')],
                 [('estaba', 'c', None),
                  ('estuvo', 'i', 'Тут описано стан бабусі в момент приходу лікаря — це тло: estaba.'),
                  ('está', 'i', 'Está — теперішній час, а лікар прийшов у минулому.')],
                 [rule(bx, R_BE)], fbx),
    ]
    held_b = [
        t.choice('delayed', 'dinner', bx,
                 [P('Яке речення означає «Коли ми прийшли, вони вже вечеряли»?')],
                 [('Cuando llegamos, cenaron.', 'i', 'Cenaron подає вечерю як окрему подію після вашого приходу.'),
                  ('Cuando llegamos, cenaban.', 'c', None),
                  ('Cuando llegamos, cenamos.', 'i', 'Cenamos — вечеряли ми, а не вони.')],
                 [rule(bx, R_BE)], fbx),
        t.choice('delayed', 'park', bx,
                 [P('Оберіть форму, яка підходить за змістом.'), PE('Hacía buen tiempo y paseábamos por el pueblo. De repente, ___ a Luis.')],
                 [('veíamos', 'i', 'De repente вводить подію, що сталася під час прогулянки: vimos a Luis.'),
                  ('vimos', 'c', None),
                  ('vemos', 'i', 'Vemos — теперішній час, а розповідь — про минуле.')],
                 [rule(bx, R_BE)], fbx),
        t.choice('transfer', 'message', bx,
                 [P('Оберіть форму, яка підходить за змістом повідомлення.'),
                  PE('Hola, Ana: Ayer fui al concierto. Cuando llegué, ___ mucha gente y no vi nada.')],
                 [('hubo', 'i', 'Hubo подає це як подію. Тут описано, що було, коли ви прийшли: había.'),
                  ('hay', 'i', 'Hay — теперішній час, а розповідь — про вчора.'),
                  ('había', 'c', None)],
                 [rule(bx, R_BE)], fbx),
    ]

    assert len(t.tasks) == 21, len(t.tasks)
    body = lesson(
        'A2-05-L6', 'lesson', BLOCK,
        'Тло й подія: imperfecto чи indefinido',
        'imperfecto (fondo) e indefinido (hecho)',
        'Розрізняємо в розповіді тло — обставини, які вже тривали (imperfecto), — і подію, що сталася на цьому тлі '
        '(pretérito indefinido): Cuando salí de casa, llovía — Cuando salí de casa, empezó a llover.',
        ['A2-05-O7'], ['CV-04'], ['routine-study-leisure', 'conditions-weather-problems'], 15,
        ['imperfecto.use-background', 'contrast.indefinido-imperfecto.background-event'],
        ['imperfecto.use-description', 'imperfecto.weather', 'imperfecto.estar-state', 'imperfecto.habia',
         'imperfecto.ser-time-setting', 'imperfecto.ser', 'link.cuando-temporal', 'indefinido.regular-ar',
         'indefinido.regular-er-ir', 'indefinido.use-completed-event', 'perifrasis.empezar-a', 'progressive.estar-gerund'],
        [
            step('s1', 'explanation', 'Тло і подія в розповіді', True, blocks=[
                P('У розповіді про минуле часто є два плани: тло — обставини, які вже тривали (погода, місце, стан, час, те, '
                  'що відбувалося навколо), — і подія — те, що сталося на цьому тлі. Тло описуємо імперфектом, подію — '
                  'pretérito indefinido.'),
                EX('Hacía sol y los niños jugaban en la plaza. Entonces llegó el autobús.',
                   'Світило сонце, і діти гралися на площі. Тоді приїхав автобус.'),
                P('Порівняйте: Cuando salí de casa, llovía — дощ уже йшов, коли я виходив (обставина). Cuando salí de casa, '
                  'empezó a llover — дощ почався, коли я вийшов (подія).'),
                P('Підказки в тексті: de repente («раптом») зазвичай вводить подію: De repente, sonó el teléfono. Todavía («ще») '
                  'і ya («вже») часто описують те, що вже тривало в той момент: Cuando llegué, Ana todavía dormía.'),
                P('Тривалість дії сама по собі не вирішує — вирішує її роль у розповіді: тло чи подія. Український вид дієслова '
                  'теж не переносьте механічно: «читав» може відповідати і leía, і leí — дивіться на роль дії в розповіді.'),
                P('Про дію в процесі можна сказати й estar в імперфекті + gerundio: Cuando llegué, mis hijos estaban durmiendo. '
                  'Це теж правильно, але в цьому уроці ми тренуємо простий імперфект.'),
            ]),
            step('s2', 'examples', 'Приклади', True, blocks=[
                EX('Cuando sonó el teléfono, yo estaba en la cocina.', 'Коли задзвонив телефон, я був (була) на кухні.'),
                EX('Eran las once de la noche y todos dormían. De repente, sonó el teléfono.',
                   'Була одинадцята вечора, і всі спали. Раптом задзвонив телефон.'),
                EX('Cuando llegamos al restaurante, había mucha gente.', 'Коли ми прийшли в ресторан, там було багато людей.'),
                EX('Estábamos en el parque y hacía sol. De repente, empezó a llover.', 'Ми були в парку, і світило сонце. Раптом почався дощ.'),
                P('Нові слова: de repente — раптом; sonar — дзвонити, звучати (про телефон, будильник): sonó el teléfono — задзвонив телефон.'),
            ]),
            step('s3', 'supported-practice', 'Практика зі зразком', True, tasks=sup_c + sup_x + sup_b),
            step('s4', 'independent-practice', 'Самостійна практика', True, tasks=ind_c + ind_x + ind_b),
            step('s5', 'summary', 'Підсумок', True, blocks=[
                BL(['Тло (що вже тривало, яким усе було) — imperfecto: llovía, estaba, había, eran las diez.',
                    'Подія (що сталося на цьому тлі) — pretérito indefinido: sonó, llegó, empezó a llover.',
                    'De repente зазвичай вводить подію; todavía і ya часто описують стан у той момент.',
                    'Вирішує роль дії в розповіді, а не її тривалість чи одне слово.']),
            ]),
        ],
    )
    return body, t.tasks


def MATERIALS():
    keys = [BG_C, BG_X, BE_X]
    return [
        material('material.a2-05.background-event', 'A2-05-L6', 'Тло й подія: imperfecto та indefinido', [
            P('Тло (що вже тривало) — imperfecto; подія (що сталося на цьому тлі) — pretérito indefinido.'),
            EX('Cuando salí de casa, llovía.', 'Коли я виходив (виходила) з дому, ішов дощ (уже йшов).'),
            EX('Cuando salí de casa, empezó a llover.', 'Коли я вийшов (вийшла) з дому, почався дощ.'),
            EX('Hacía sol y los niños jugaban en la plaza. De repente, llegó el autobús.',
               'Світило сонце, і діти гралися на площі. Раптом приїхав автобус.'),
            LINK('Потренувати тло й подію', keys, 'written', 8),
        ], keys),
    ]


LESSONS = [l6]
