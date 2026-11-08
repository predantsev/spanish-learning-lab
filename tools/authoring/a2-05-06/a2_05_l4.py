"""A2-05-L4 — past habits and routines; past-period frames; first listening clips (CV-06)."""
from build import BL, EX, LINK, P, PE, LessonTasks, POL_DICT, clip, lesson, material, reveal, rule, step
from a2_05 import BLOCK

HF_R = 'time.past-habit-frames/reading-meaning'
HF_C = 'time.past-habit-frames/construction-use'
UH_C = 'imperfecto.use-habit/construction-use'
UH_X = 'imperfecto.use-habit/context-choice'
LH_M = 'listening.past-habits-settings/listening-meaning'
LH_D = 'listening.past-habits-settings/dictation'

R_HF = ('De pequeño / de niño («у дитинстві») узгоджуються з тим, про кого йдеться: про жінку — de pequeña, de niña; '
        'про кількох — de pequeños, de pequeñas. Antes — «раніше»; entonces, en aquella época — «тоді, у той час».')
R_UH = ('Імперфект описує звичку певного періоду минулого (antes, de pequeño, en aquella época): що людина зазвичай '
        'робила тоді. Одну завершену подію передає pretérito indefinido, а теперішню звичку — presente.')
INSTR_USE = ('Доповніть речення правильною формою дієслова в дужках. Мовець описує, як зазвичай бувало в той період '
             'минулого. Час не підказано: вирішіть за змістом.')

CLIP_A = clip(
    'clip.a2-05.habits-summer', 'A2-05-L4', 'text',
    'De pequeño, vivía en un pueblo cerca de Valencia. Todos los veranos iba a la playa con mis abuelos. '
    'Por la mañana nadábamos y por la tarde jugaba con mis amigos en la plaza.',
    'У дитинстві я жив у містечку біля Валенсії. Щоліта я їздив на пляж із дідусем і бабусею. Уранці ми плавали, '
    'а після обіду я грався з друзями на площі.',
    [LH_M, LH_D], 'childhood-summer')
CLIP_B = clip(
    'clip.a2-05.habits-shop-work', 'A2-05-L4', 'text',
    'Antes trabajaba en una tienda en el centro. Empezaba a las nueve y terminaba a las ocho de la tarde. '
    'Comía en un bar y siempre volvía a casa muy cansada.',
    'Раніше я працювала в магазині в центрі. Я починала о дев’ятій і закінчувала о восьмій вечора. Обідала '
    'в барі й завжди поверталася додому дуже втомлена.',
    [LH_M], 'work-routine-before')
CLIP_C = clip(
    'clip.a2-05.habits-neighbourhood', 'A2-05-L4', 'text',
    'Mi barrio antes era muy tranquilo. Los niños jugaban en la calle y los vecinos hablaban en la plaza. '
    'Los domingos mis padres y yo paseábamos por el parque.',
    'Раніше мій район був дуже тихим. Діти гралися на вулиці, а сусіди розмовляли на площі. По неділях ми '
    'з батьками гуляли парком.',
    [LH_M], 'neighbourhood-before')


def lhints(c):
    return [('transcript', [LH_M], [PE(c['transcript'])]), ('translation', [LH_M], [P(c['translationUk'])])]


FB_LIST = ('Правильно.', 'Ні. Прослухайте запис ще раз; можна відкрити текст запису як підказку.')


def gap(t, role, fam, keys, sent, verb, accepted, errs, rule_txt, instr, *, model=None, ex=None):
    """One-gap exact-variants task with possibly several accepted answers (first = reference)."""
    full = sent.replace('___', accepted[0] if isinstance(accepted[0], str) else accepted[0][0])
    prompt = [P((model + ' ' if model else '') + instr)]
    if ex:
        prompt.append(EX(*ex))
    prompt.append(PE(f'{sent} ({verb})' if verb else sent))
    main = accepted[0] if isinstance(accepted[0], str) else accepted[0][0]
    others = [a if isinstance(a, str) else a[0] for a in accepted[1:]]
    alt = f' Можливо також: {", ".join(others)}.' if others else ''
    fb = (f'Правильно: {main}.' + alt, f'Ні. Правильно: {main}.' + alt,
          f'Цю відповідь не вдалося перевірити автоматично. Порівняйте її з прикладом: {main}.' + alt)
    return t.exact(role, fam, keys, prompt, accepted, errs, [rule(keys, rule_txt), reveal(keys, full)], fb, full)


def l4():
    t = LessonTasks('A2-05-L4')
    instr_hf = 'Доповніть вираз «у дитинстві» одним словом: pequeño, pequeña, pequeños, pequeñas, niño, niña…'

    # --- imperfecto.use-habit / construction-use ------------------------------------------
    uc = [UH_C]
    sup_uc = [
        gap(t, 'supported', 'routine-then-now', uc, 'Antes ___ en un banco, pero ahora trabajo en casa.', 'trabajar, yo', ['trabajaba'],
            [('trabajé', 'i', 'Trabajé подає дію (або серію дій) як завершене ціле. Тут мовець описує, як зазвичай бувало в той період: trabajaba.'),
             ('trabajo', 'i', 'Trabajo — теперішній час, а antes вказує на минуле: trabajaba.'),
             ('he trabajado', 'i', 'He trabajado — pretérito perfecto. Для того, що було звичним раніше, вживаємо імперфект: trabajaba.')],
            R_UH, INSTR_USE, model='Зразок: Antes iba al trabajo en coche, pero ahora voy en bicicleta.'),
        gap(t, 'supported', 'childhood', uc, 'De pequeña, Lucía ___ al parque todos los días.', 'ir', ['iba'],
            [('fue', 'i', 'Fue подає дію (або серію дій) як завершене ціле. Тут мовець описує, як зазвичай бувало в той період (de pequeña, todos los días): iba.'),
             ('va', 'i', 'Va — теперішній час, а de pequeña вказує на минуле: iba.'),
             ('ha ido', 'i', 'Ha ido — pretérito perfecto. Для звички дитинства вживаємо імперфект: iba.')],
            R_UH, INSTR_USE, model='Зразок: De pequeño, Pablo jugaba en la calle todos los días.'),
    ]
    ind_uc = [
        gap(t, 'independent', 'routine-then-now', uc, 'Antes mis padres ___ muy tarde, pero ahora cenan a las ocho.', 'cenar', ['cenaban'],
            [('cenaron', 'i', 'Cenaron подає дію (або серію дій) як завершене ціле. Тут мовець описує, як зазвичай бувало в той період: cenaban.'),
             ('cenan', 'i', 'Cenan — теперішній час, а antes вказує на минуле: cenaban.'),
             ('han cenado', 'i', 'Han cenado — pretérito perfecto. Для колишньої звички: cenaban.')],
            R_UH, INSTR_USE),
        gap(t, 'independent', 'childhood', uc, 'De niño, mi hermano siempre ___ con su perro.', 'jugar', ['jugaba'],
            [('jugó', 'i', 'Jugó подає дію (або серію дій) як завершене ціле. Тут мовець описує, як зазвичай бувало в той період (de niño, siempre): jugaba.'),
             ('juega', 'i', 'Juega — теперішній час, а de niño вказує на минуле: jugaba.'),
             ('ha jugado', 'i', 'Ha jugado — pretérito perfecto. Для звички дитинства: jugaba.')],
            R_UH, INSTR_USE),
        gap(t, 'independent', 'routine-then-now', uc, 'Antes nosotros ___ mucho, pero ahora no tenemos tiempo.', 'leer', ['leíamos'],
            [('leímos', 'i', 'Leímos подає дію (або серію дій) як завершене ціле. Тут мовець описує, як зазвичай бувало в той період: leíamos.'),
             ('leemos', 'i', 'Leemos — теперішній час, а antes вказує на минуле: leíamos.'),
             ('hemos leído', 'i', 'Hemos leído — pretérito perfecto. Для колишньої звички: leíamos.')],
            R_UH, INSTR_USE),
    ]
    held_uc = [
        gap(t, 'delayed', 'childhood', uc, 'De pequeño, yo ___ a casa de mis abuelos todos los veranos.', 'ir', ['iba'],
            [('fui', 'i', 'Fui подає дію (або серію дій) як завершене ціле. Тут мовець описує, як зазвичай бувало в той період (de pequeño, todos los veranos): iba.'),
             ('voy', 'i', 'Voy — теперішній час, а de pequeño вказує на минуле: iba.'),
             ('he ido', 'i', 'He ido — pretérito perfecto. Для звички дитинства: iba.')],
            R_UH, INSTR_USE),
        gap(t, 'delayed', 'routine-then-now', uc, 'Antes tú ___ mucho café y ahora no tomas nada.', 'tomar', ['tomabas'],
            [('tomaste', 'i', 'Tomaste подає дію (або серію дій) як завершене ціле. Тут мовець описує, як зазвичай бувало в той період: tomabas.'),
             ('tomas', 'i', 'Tomas — теперішній час, а antes вказує на минуле: tomabas.'),
             ('has tomado', 'i', 'Has tomado — pretérito perfecto. Для колишньої звички: tomabas.')],
            R_UH, INSTR_USE),
        gap(t, 'transfer', 'work-life', uc, 'En mi antiguo trabajo, ___ a las ocho y salía a las tres.', 'empezar, yo', ['empezaba'],
            [('empecé', 'i', 'Empecé подає дію (або серію дій) як завершене ціле. Тут мовець описує, як зазвичай бувало в той період — звичайний розклад тієї роботи: empezaba.'),
             ('empiezo', 'i', 'Empiezo — теперішній час, а en mi antiguo trabajo вказує на минуле: empezaba.'),
             ('he empezado', 'i', 'He empezado — pretérito perfecto. Для звичного розкладу в минулому: empezaba.')],
            R_UH, INSTR_USE),
    ]

    # --- imperfecto.use-habit / context-choice ---------------------------------------------
    ux = [UH_X]
    fbx = ('Правильно.', 'Ні. Подумайте, чи йдеться про звичку минулого періоду, одну подію чи теперішнє.')
    sup_ux = [t.choice('supported', 'meaning', ux,
                       [P('Яке речення описує звичку в минулому?')],
                       [('Los domingos íbamos al pueblo.', 'c', None),
                        ('El domingo fuimos al pueblo.', 'i', 'Це одна поїздка минулої неділі — подія, а не звичка.'),
                        ('Los domingos vamos al pueblo.', 'i', 'Це звичка в теперішньому часі.')],
                       [rule(ux, R_UH)], fbx)]
    ind_ux = [
        t.choice('independent', 'routine-then-now', ux,
                 [P('Оберіть форму, яка підходить за змістом. Мовець описує, як зазвичай бувало раніше.'),
                  PE('Antes mi hermano ___ al fútbol los sábados, pero ahora prefiere nadar.')],
                 [('jugó', 'i', 'Jugó подає дію (або серію дій) як завершене ціле. Тут мовець описує, як зазвичай бувало в той період: jugaba.'),
                  ('jugaba', 'c', None),
                  ('juega', 'i', 'Juega — теперішній час, а antes вказує на минуле.')],
                 [rule(ux, R_UH)], fbx),
        t.choice('independent', 'childhood', ux,
                 [P('Що означає це речення?'), PE('De pequeña, Ana iba al pueblo todos los veranos.')],
                 [('Ана поїхала в село одного літа.', 'i', 'Iba … todos los veranos описує повторювану звичку, а не одну поїздку.'),
                  ('Ана й тепер їздить у село щоліта.', 'i', 'Iba — минулий час: так було в дитинстві.'),
                  ('У дитинстві Ана щоліта їздила в село.', 'c', None)],
                 [rule(ux, R_UH)], fbx),
    ]
    held_ux = [
        t.choice('delayed', 'routine-then-now', ux,
                 [P('Оберіть форму, яка підходить за змістом. Мовець описує, як зазвичай бувало раніше.'),
                  PE('Antes nosotros ___ en coche al trabajo y ahora vamos en tren.')],
                 [('íbamos', 'c', None),
                  ('fuimos', 'i', 'Fuimos подає дію (або серію дій) як завершене ціле. Тут мовець описує, як зазвичай бувало в той період: íbamos.'),
                  ('vamos', 'i', 'Vamos — теперішній час, а antes вказує на минуле.')],
                 [rule(ux, R_UH)], fbx),
        t.choice('transfer', 'message', ux,
                 [P('Оберіть форму, яка підходить за змістом повідомлення. Авторка описує, як зазвичай бувало раніше.'),
                  PE('Hola, Luis: Ahora no trabajo en el hotel. Antes ___ todos los fines de semana y estaba muy cansada.')],
                 [('trabajé', 'i', 'Trabajé подає дію (або серію дій) як завершене ціле. Тут мовець описує, як зазвичай бувало в той період: trabajaba.'),
                  ('trabajo', 'i', 'Trabajo — теперішній час, а antes вказує на минуле.'),
                  ('trabajaba', 'c', None)],
                 [rule(ux, R_UH)], fbx),
    ]

    # --- time.past-habit-frames / construction-use -----------------------------------------
    hc = [HF_C]
    sup_hc = [gap(t, 'supported', 'childhood', hc, 'Mi hermana, de ___, iba al colegio en bicicleta.', None, ['pequeña', 'niña'],
                  [('pequeño', 'i', 'Mi hermana — жіночий рід: de pequeña (або de niña).'),
                   ('niño', 'i', 'Mi hermana — жіночий рід: de niña (або de pequeña).')],
                  R_HF, instr_hf, model='Зразок: Pablo, de pequeño, vivía en Sevilla. — Ana, de pequeña, vivía en Sevilla.')]
    ind_hc = [
        gap(t, 'independent', 'childhood', hc, 'Mi padre, de ___, jugaba al fútbol en la calle.', None, ['pequeño', 'niño'],
            [('pequeña', 'i', 'Mi padre — чоловічий рід: de pequeño (або de niño).'),
             ('niña', 'i', 'Mi padre — чоловічий рід: de niño (або de pequeño).')],
            R_HF, instr_hf),
        gap(t, 'independent', 'period', hc, 'Ahora vivo en Madrid, pero ___ vivía en Toledo.', None, ['antes'],
            [('después', 'i', 'Después — «потім, після». Тут потрібно «раніше»: antes.'),
             ('ahora', 'i', 'Ahora — «зараз». Тут потрібно «раніше»: antes.')],
            R_HF, 'Напишіть іспанською слово «раніше».'),
    ]
    held_hc = [
        gap(t, 'delayed', 'period', hc, 'Mis abuelos vivían en un pueblo pequeño. ___ no tenían coche.', None,
            ['En aquella época', 'Entonces'],
            [('Después', 'i', 'Después — «потім, після». Тут потрібно «у той час»: en aquella época або entonces.')],
            R_HF, 'Напишіть іспанською вираз «у той час».'),
        gap(t, 'delayed', 'childhood', hc, 'Nosotras, de ___, veíamos dibujos animados todos los días.', None, ['pequeñas', 'niñas'],
            [('pequeña', 'i', 'Nosotras — множина: de pequeñas (або de niñas).'),
             ('pequeños', 'i', 'Nosotras — жіночий рід: de pequeñas (або de niñas).'),
             ('pequeño', 'i', 'Nosotras — жіночий рід і множина: de pequeñas (або de niñas).')],
            R_HF, instr_hf),
        gap(t, 'transfer', 'friends', hc, 'Mi amigo Luis, de ___, quería ser médico.', None, ['pequeño', 'niño'],
            [('pequeña', 'i', 'Luis — чоловічий рід: de pequeño (або de niño).'),
             ('pequeños', 'i', 'Luis — одна особа: de pequeño (або de niño).')],
            R_HF, instr_hf),
    ]

    # --- time.past-habit-frames / reading-meaning -------------------------------------------
    hr = [HF_R]
    fbr = ('Правильно.', 'Ні. Подивіться, який період задає вираз.')
    sup_hr = [t.choice('supported', 'childhood', hr,
                       [PE('De niña, Elena vivía en un pueblo.'), P('Що означає de niña в цьому реченні?')],
                       [('у дитинстві', 'c', None),
                        ('з дівчинкою', 'i', 'Тут de niña — вираз часу: «у дитинстві». «З дівчинкою» було б con una niña.'),
                        ('для дівчинки', 'i', 'Тут de niña — вираз часу: «у дитинстві».')],
                       [rule(hr, R_HF)], fbr)]
    ind_hr = [t.choice('independent', 'period', hr,
                       [PE('Antes trabajaba en un banco. En aquella época salía de casa a las siete.'),
                        P('Про який час ідеться в другому реченні?')],
                       [('про сьогоднішній день', 'i', 'Salía — минулий час, а en aquella época відсилає до періоду з першого речення.'),
                        ('про той час, коли людина працювала в банку', 'c', None),
                        ('про наступний тиждень', 'i', 'Salía — минулий час, а en aquella época — «у той час».')],
                       [rule(hr, R_HF)], fbr)]
    held_hr = [
        t.choice('delayed', 'period', hr,
                 [PE('Mis padres vivían en Bilbao. Entonces trabajaban en un hotel.'), P('Що означає entonces у цьому тексті?')],
                 [('тому, отже', 'i', 'Entonces може означати й «отже», але тут ідеться про час: «тоді, у той час».'),
                  ('потім, після цього', 'i', 'Тут entonces — «тоді, у той час», а не «потім».'),
                  ('тоді, у той час', 'c', None)],
                 [rule(hr, R_HF)], fbr),
        t.choice('transfer', 'message', hr,
                 [PE('Hola, Ana: ¡Qué bonita foto! De pequeñas íbamos a la playa todos los veranos.'), P('Як часто вони ходили на пляж?')],
                 [('щоліта, коли були малими', 'c', None),
                  ('один раз, минулого літа', 'i', 'De pequeñas, todos los veranos та íbamos описують повторювану звичку дитинства.'),
                  ('щоліта — і досі', 'i', 'Íbamos — минулий час: так було в дитинстві.')],
                 [rule(hr, R_HF)], fbr),
    ]

    # --- listening.past-habits-settings ------------------------------------------------------
    lm = [LH_M]
    la = t.choice('independent', CLIP_A['family'], lm,
                  [P('Прослухайте запис. Що оповідач зазвичай робив після обіду?')],
                  [('грався з друзями на площі', 'c', None),
                   ('плавав', 'i', 'Плавали вони вранці: por la mañana nadábamos.'),
                   ('ходив до школи', 'i', 'У записі йдеться про літо, а не про школу.')],
                  lhints(CLIP_A), FB_LIST, clips=[CLIP_A['id']])
    lb = t.choice('independent', CLIP_B['family'], lm,
                  [P('Прослухайте запис. Де ця жінка зазвичай обідала?')],
                  [('удома', 'i', 'У записі: comía en un bar — вона обідала в барі.'),
                   ('у барі', 'c', None),
                   ('у магазині', 'i', 'У магазині вона працювала, а обідала в барі.')],
                  lhints(CLIP_B), FB_LIST, clips=[CLIP_B['id']])
    dictation = 'Todos los veranos iba a la playa con mis abuelos.'
    ld = t.exact('independent', CLIP_A['family'], [LH_D],
                 [P('Диктант (необов’язково). Прослухайте запис ще раз і напишіть друге речення.')],
                 [dictation],
                 [('Todos los veranos iva a la playa con mis abuelos.', 'i', 'Iba пишеться з b.')],
                 [reveal([LH_D], dictation)],
                 ('Правильно записано.', 'Є помилка в записі. Порівняйте з правильним реченням.',
                  'Запис відрізняється від тексту, і перевірити його автоматично не вдалося. Порівняйте з правильним реченням: '
                  + dictation),
                 dictation, policy=POL_DICT, clips=[CLIP_A['id']])
    t.choice('delayed', CLIP_B['family'], lm,
             [P('Прослухайте запис. О котрій ця жінка закінчувала роботу?')],
             [('о дев’ятій ранку', 'i', 'О дев’ятій вона починала роботу.'),
              ('о восьмій ранку', 'i', 'У записі: terminaba a las ocho de la tarde — о восьмій вечора.'),
              ('о восьмій вечора', 'c', None)],
             lhints(CLIP_B), FB_LIST, clips=[CLIP_B['id']])
    t.choice('transfer', CLIP_C['family'], lm,
             [P('Прослухайте запис. Що зазвичай робили діти в цьому районі?')],
             [('гуляли парком із батьками', 'i', 'Парком гуляв оповідач із батьками по неділях.'),
              ('гралися на вулиці', 'c', None),
              ('розмовляли на площі', 'i', 'На площі розмовляли сусіди.')],
             lhints(CLIP_C), FB_LIST, clips=[CLIP_C['id']])

    assert len(t.tasks) == 28, len(t.tasks)
    body = lesson(
        'A2-05-L4', 'lesson', BLOCK,
        'Звички минулого: що ми робили раніше',
        'pretérito imperfecto: hábitos en el pasado',
        'Розповідаємо, що людина зазвичай робила в певний період минулого (antes, de pequeño, en aquella época), '
        'відрізняємо колишню звичку від теперішньої та від однієї події і слухаємо короткі спогади.',
        ['A2-05-O5', 'A2-05-O8'], ['CV-06'], ['routine-study-leisure', 'people-family-home'], 16,
        ['time.past-habit-frames', 'link.cuando-temporal', 'imperfecto.use-habit', 'listening.past-habits-settings'],
        ['imperfecto.regular-ar.singular', 'imperfecto.regular-ar.plural', 'imperfecto.regular-er-ir.singular',
         'imperfecto.regular-er-ir.plural', 'imperfecto.present-irregulars-regular', 'imperfecto.ser', 'imperfecto.ir',
         'imperfecto.ver', 'time.frequency.adverbs', 'time.frequency.expressions', 'indefinido.use-completed-event',
         'question.word.cuando'],
        [
            step('s1', 'explanation', 'Імперфект для звичок минулого', True, blocks=[
                P('Імперфект описує, що людина зазвичай робила в певний період минулого: у дитинстві, раніше, у той час. '
                  'Ми не рахуємо, скільки разів це було, і не кажемо, коли почалося чи закінчилося, — описуємо звичку того періоду.'),
                EX('De pequeño, iba al colegio en autobús.', 'У дитинстві я їздив до школи автобусом.'),
                P('Період минулого задають вирази: antes — раніше; de pequeño / de pequeña, de niño / de niña — у дитинстві '
                  '(узгоджуються з родом і числом: de pequeñas); entonces, en aquella época — тоді, у той час; '
                  'todos los veranos, cada verano — щоліта.'),
                P('Слова siempre, normalmente, a veces, todos los días вам уже знайомі. Вони допомагають, але самі не вирішують, '
                  'який потрібен час: Siempre como en casa — теперішня звичка; Antes siempre comía en casa — колишня звичка. '
                  'Вирішує зміст: чи йдеться про звичку минулого періоду.'),
                P('Порівняйте: Los domingos íbamos al pueblo — звичка (так бувало щонеділі). El domingo fuimos al pueblo — '
                  'одна поїздка (pretérito indefinido).'),
                P('Cuando з минулим часом теж задає період: Cuando era pequeño, vivía en un pueblo — «Коли я був малим, я жив '
                  'у містечку». Такі речення поки що треба лише розуміти. Знак наголосу залежить від ролі слова, а не від типу '
                  'речення: cuando, що вводить час («коли … , то …»), пишемо без знака (¿Qué hacías cuando eras pequeño?); '
                  'питальне cuándo («коли?») — зі знаком і в питанні, і в розповіді (No sé cuándo llegó).'),
            ]),
            step('s2', 'examples', 'Приклади', True, blocks=[
                EX('Antes trabajaba en un banco, pero ahora trabajo en casa.', 'Раніше я працював (працювала) в банку, а тепер працюю вдома.'),
                EX('De niña, Elena vivía en un pueblo.', 'У дитинстві Елена жила в селі.'),
                EX('Todos los veranos íbamos a la playa con mis abuelos.', 'Щоліта ми їздили на пляж із дідусем і бабусею.'),
                EX('En aquella época, mis padres no tenían coche.', 'У той час мої батьки не мали машини.'),
                EX('Mis padres vivían en Bilbao. Entonces trabajaban en un hotel.', 'Мої батьки жили в Більбао. Тоді вони працювали в готелі.'),
                EX('Cuando era pequeña, veía dibujos animados todos los días.', 'Коли я була малою, я щодня дивилася мультфільми.'),
                P('Нові слова: de pequeño / de pequeña, de niño / de niña — у дитинстві; entonces — тоді; en aquella época — '
                  'у той час; el pueblo — село, містечко (в Іспанії часто — рідне містечко родини).'),
            ]),
            step('s3', 'supported-practice', 'Практика зі зразком', True, tasks=sup_uc + sup_ux + sup_hc + sup_hr),
            step('s4', 'independent-practice', 'Самостійна практика', True, tasks=ind_uc + ind_ux + ind_hc + ind_hr),
            step('s5', 'listening', 'Аудіювання: звички минулого', True, clips=[CLIP_A['id'], CLIP_B['id']], tasks=[la, lb]),
            step('s6', 'listening', 'Диктант (необов’язково)', False, clips=[CLIP_A['id']], tasks=[ld]),
            step('s7', 'summary', 'Підсумок', True, blocks=[
                BL(['Імперфект — для того, що було звичним у певний період минулого.',
                    'Період задають antes, de pequeño / de pequeña, entonces, en aquella época, todos los veranos.',
                    'Одне слово-маркер не вирішує: Siempre como en casa (тепер) — Antes siempre comía en casa (раніше).',
                    'Одна завершена подія — pretérito indefinido: El domingo fuimos al pueblo.']),
            ]),
        ],
    )
    return body, t.tasks


def MATERIALS():
    return [
        material('material.a2-05.habits', 'A2-05-L4', 'Звички минулого: вирази періоду', [
            P('Імперфект описує, що людина зазвичай робила в певний період минулого.'),
            BL(['antes — раніше', 'de pequeño / de pequeña, de niño / de niña — у дитинстві',
                'entonces, en aquella época — тоді, у той час', 'todos los veranos, cada verano — щоліта'], lang='uk'),
            EX('Antes trabajaba en un banco, pero ahora trabajo en casa.', 'Раніше я працював (працювала) в банку, а тепер працюю вдома.'),
            EX('Los domingos íbamos al pueblo.', 'По неділях ми їздили в село (так було заведено).'),
            LINK('Потренувати звички минулого', [UH_C, UH_X, HF_C, HF_R], 'written', 8),
        ], [UH_C, UH_X, HF_C, HF_R]),
    ]


def CLIPS():
    return [CLIP_A, CLIP_B, CLIP_C]


LESSONS = [l4]

SKILL_PATCHES = {
    'imperfecto.use-habit': {'prerequisites': [
        'imperfecto.regular-ar.singular', 'imperfecto.regular-ar.plural', 'imperfecto.regular-er-ir.singular',
        'imperfecto.regular-er-ir.plural', 'imperfecto.present-irregulars-regular', 'imperfecto.ser', 'imperfecto.ir',
        'imperfecto.ver', 'time.past-habit-frames', 'indefinido.use-completed-event']},
    'listening.past-habits-settings': {'prerequisites': [
        'imperfecto.regular-ar.singular', 'imperfecto.regular-ar.plural', 'imperfecto.regular-er-ir.singular',
        'imperfecto.regular-er-ir.plural', 'imperfecto.ser', 'imperfecto.ir', 'imperfecto.ver', 'imperfecto.eramos-ibamos-accent']},
}
