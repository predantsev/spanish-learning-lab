"""A2-05-L7 — a short memory or past routine: reading, listening (clips), writing with a rubric (CV-06)."""
from build import BL, EX, LINK, P, PE, LessonTasks, POL_DICT, POL_SENT, clip, lesson, material, reveal, rule, step
from a2_05 import BLOCK

RD = 'reading.past-routine-description/reading-meaning'
LM_M = 'listening.past-memory/listening-meaning'
LM_D = 'listening.past-memory/dictation'
WR = 'writing.past-routine-memory/construction-use'

R_RD = ('Читаючи, з’ясуйте, про який період ідеться (de pequeña, antes, entonces), що було звичкою, а що — описом '
        'людей і місць. Відповідь на питання про зміст не вимагає самостійно відмінювати дієслова.')
R_LM = 'Слухаючи спогад, визначте: хто, де і коли; що було звичкою, а що — описом обставин.'
R_WR = ('Пишучи про минуле, назвіть період (de pequeño, antes), опишіть людей і місця (era, tenía, había) і розкажіть, '
        'що ви зазвичай робили (iba, jugaba). Кілька коротких зрозумілих речень кращі за одне складне.')

TEXT_A = ('Recuerdos de mi infancia. Me llamo Elena. De pequeña, vivía con mis padres y mi hermano en un pueblo cerca de '
          'Toledo. Nuestra casa era vieja, pero muy bonita, y tenía un jardín con muchos árboles. Mi padre trabajaba en '
          'una tienda y mi madre era profesora en el colegio. Todos los días, después del colegio, mi hermano y yo '
          'jugábamos en la plaza con otros niños. Tenía pocos juguetes, pero tenía una bicicleta roja. Los domingos '
          'íbamos a casa de mis abuelos. En verano hacía mucho calor y nadábamos en el río.')
TEXT_B = ('Hola, Lucía: Ayer encontré una foto de mi barrio en 1970. ¡Qué bonito era! No había muchos coches y los niños '
          'jugaban en la calle. Las tiendas eran pequeñas y la gente compraba el pan cerca de casa. Yo tenía diez años y '
          'todos los días iba al colegio con mis amigos. Un abrazo, el abuelo.')
TEXT_C = ('En aquella época trabajaba en un hotel de Málaga. Empezaba a las siete de la mañana y terminaba a las tres. '
          'Por la tarde estudiaba inglés y por la noche paseaba por la playa.')

CLIP_M1 = clip(
    'clip.a2-05.memory-grandmother', 'A2-05-L7', 'text',
    'Mi abuela vivía en el campo, en una casa muy vieja. Cuando yo era pequeño, iba allí todos los veranos. Por la '
    'mañana ayudaba a mi abuela en el jardín y por la tarde leía o dibujaba. Por la noche cenábamos en el jardín.',
    'Моя бабуся жила за містом, у дуже старому будинку. Коли я був малим, я їздив туди щоліта. Уранці я допомагав '
    'бабусі в саду, а після обіду читав або малював. Увечері ми вечеряли в саду.',
    [LM_M], 'grandmother-memory')
CLIP_M2 = clip(
    'clip.a2-05.memory-first-flat', 'A2-05-L7', 'text',
    'Cuando tenía veinte años, vivía en Madrid con dos amigas. Nuestro piso era pequeño y muy ruidoso, porque estaba '
    'en el centro. No teníamos mucho dinero, pero estábamos muy contentas. Los viernes siempre cenábamos en un bar '
    'cerca de casa.',
    'Коли мені було двадцять років, я жила в Мадриді з двома подругами. Наша квартира була маленькою і дуже '
    'галасливою, бо була в центрі. У нас було небагато грошей, але ми були дуже задоволені. По п’ятницях ми завжди '
    'вечеряли в барі біля дому.',
    [LM_M, LM_D], 'first-flat')
CLIP_M3 = clip(
    'clip.a2-05.memory-old-job', 'A2-05-L7', 'text',
    'Antes trabajaba en un restaurante cerca de la playa. Empezaba a las once de la mañana y terminaba muy tarde. '
    'Los lunes no trabajaba y siempre iba al cine con mi hermana.',
    'Раніше я працював у ресторані біля пляжу. Я починав об одинадцятій ранку й закінчував дуже пізно. По '
    'понеділках я не працював і завжди ходив у кіно із сестрою.',
    [LM_M], 'old-job')


def lh(c):
    return [('transcript', [LM_M], [PE(c['transcript'])]), ('translation', [LM_M], [P(c['translationUk'])])]


FB_R = ('Правильно.', 'Ні. Перечитайте текст: відповідь є в ньому.')
FB_L = ('Правильно.', 'Ні. Прослухайте запис ще раз; можна відкрити текст запису як підказку.')
CRITERIA = [
    'Названо період минулого (de pequeño / de pequeña, antes, cuando tenía … años тощо).',
    'Є опис людей, місця чи обставин в імперфекті (era, tenía, había, estaba…).',
    'Є хоча б одна звичка в імперфекті (iba, jugaba, comía…).',
    'Текст зрозумілий; форми дієслів і правопис, зокрема знаки наголосу, правильні.',
]
FB_W = ('Відповідь збігається із зразком.',
        'Порівняйте свій текст із критеріями та зразком.',
        'Вільний текст не перевіряється автоматично. Порівняйте його з критеріями і зразком — зразок лише приклад, '
        'а не єдина правильна відповідь. За потреби збережіть текст для зовнішньої перевірки.')


def l7():
    t = LessonTasks('A2-05-L7')
    rd = [RD]

    # --- reading.past-routine-description ----------------------------------------------------
    r_sup = [t.choice('supported', 'elena', rd,
                      [P('Прочитайте спогад Елени. Підказка: шукайте вирази de pequeña та en un pueblo.'), PE(TEXT_A),
                       P('Де Елена жила в дитинстві?')],
                      [('у містечку біля Толедо', 'c', None),
                       ('у квартирі в Толедо', 'i', 'Вона жила en un pueblo cerca de Toledo — у містечку біля Толедо.'),
                       ('у будинку дідуся й бабусі', 'i', 'До дідуся й бабусі вони їздили по неділях.')],
                      [rule(rd, R_RD)], FB_R)]
    r_ind = [
        t.choice('independent', 'elena', rd,
                 [PE(TEXT_A), P('Що Елена з братом робили щодня після школи?')],
                 [('плавали в річці', 'i', 'У річці вони плавали влітку (en verano).'),
                  ('гралися на площі з іншими дітьми', 'c', None),
                  ('їздили до дідуся й бабусі', 'i', 'До дідуся й бабусі вони їздили по неділях.')],
                 [rule(rd, R_RD)], FB_R),
        t.choice('independent', 'elena', rd,
                 [PE(TEXT_A), P('Яким був їхній будинок?')],
                 [('новим і великим', 'i', 'У тексті: nuestra casa era vieja — старий.'),
                  ('маленькою квартирою в центрі', 'i', 'Вони жили в будинку (casa) із садом у містечку.'),
                  ('старим, але дуже гарним, із садом', 'c', None)],
                 [rule(rd, R_RD)], FB_R),
        t.choice('independent', 'elena', rd,
                 [PE(TEXT_A), P('Ким працювала мама Елени?')],
                 [('учителькою в школі', 'c', None),
                  ('продавчинею в магазині', 'i', 'У магазині працював тато.'),
                  ('лікаркою', 'i', 'У тексті: mi madre era profesora en el colegio.')],
                 [rule(rd, R_RD)], FB_R),
    ]
    t.choice('delayed', 'grandfather-message', rd,
             [P('Прочитайте повідомлення.'), PE(TEXT_B), P('Що дідусь знайшов учора?')],
             [('свій старий велосипед', 'i', 'У повідомленні: encontré una foto de mi barrio — фото свого району.'),
              ('фотографію свого району 1970 року', 'c', None),
              ('лист від Лусії', 'i', 'Лусія — адресатка повідомлення.')],
             [rule(rd, R_RD)], FB_R)
    t.choice('delayed', 'grandfather-message', rd,
             [P('Прочитайте повідомлення.'), PE(TEXT_B), P('Яким був район у 1970 році?')],
             [('машин було небагато, а діти гралися на вулиці', 'c', None),
              ('було багато машин і великих магазинів', 'i', 'У тексті: no había muchos coches — машин було небагато; las tiendas eran pequeñas — магазини були маленькі.'),
              ('там жили лише дорослі', 'i', 'У тексті: los niños jugaban en la calle — діти гралися на вулиці.')],
             [rule(rd, R_RD)], FB_R)
    t.choice('transfer', 'diary', rd,
             [P('Прочитайте уривок зі спогадів.'), PE(TEXT_C), P('Що ця людина зазвичай робила після обіду?')],
             [('гуляла пляжем', 'i', 'Пляжем вона гуляла ввечері (por la noche).'),
              ('працювала в готелі', 'i', 'У готелі вона працювала з сьомої ранку до третьої.'),
              ('вчила англійську', 'c', None)],
             [rule(rd, R_RD)], FB_R)

    # --- listening.past-memory -----------------------------------------------------------------
    lm = [LM_M]
    l1 = t.choice('independent', CLIP_M1['family'], lm,
                  [P('Прослухайте запис. Що оповідач зазвичай робив уранці?')],
                  [('читав або малював', 'i', 'Читав чи малював він після обіду (por la tarde).'),
                   ('допомагав бабусі в саду', 'c', None),
                   ('вечеряв у саду', 'i', 'У саду вони вечеряли ввечері (por la noche).')],
                  lh(CLIP_M1), FB_L, clips=[CLIP_M1['id']])
    l2 = t.choice('independent', CLIP_M2['family'], lm,
                  [P('Прослухайте запис. Якою була квартира?')],
                  [('маленькою і галасливою', 'c', None),
                   ('великою і тихою', 'i', 'У записі: era pequeño y muy ruidoso — маленька й галаслива.'),
                   ('маленькою, але тихою', 'i', 'Квартира була дуже галасливою (muy ruidoso), бо була в центрі.')],
                  lh(CLIP_M2), FB_L, clips=[CLIP_M2['id']])
    dict_text = 'No teníamos mucho dinero, pero estábamos muy contentas.'
    ld = t.exact('independent', CLIP_M2['family'], [LM_D],
                 [P('Диктант (необов’язково). Прослухайте запис ще раз і напишіть третє речення.')],
                 [dict_text, ('No teníamos mucho dinero pero estábamos muy contentas.', 'Кома перед pero бажана, але її відсутність тут не змінює змісту.')],
                 [('No teniamos mucho dinero, pero estabamos muy contentas.', 'i', 'Бракує знаків наголосу: teníamos, estábamos.')],
                 [reveal([LM_D], dict_text)],
                 ('Правильно записано.', 'Є помилка в записі. Порівняйте з правильним реченням.',
                  'Запис відрізняється від тексту, і перевірити його автоматично не вдалося. Порівняйте з правильним реченням: ' + dict_text),
                 dict_text, policy=POL_DICT, clips=[CLIP_M2['id']])
    t.choice('delayed', CLIP_M1['family'], lm,
             [P('Прослухайте запис. Як часто оповідач їздив до бабусі?')],
             [('щонеділі', 'i', 'У записі: iba allí todos los veranos — щоліта.'),
              ('щоліта', 'c', None),
              ('лише один раз', 'i', 'Todos los veranos — щоліта, це повторювалося.')],
             lh(CLIP_M1), FB_L, clips=[CLIP_M1['id']])
    t.choice('transfer', CLIP_M3['family'], lm,
             [P('Прослухайте запис. Що оповідач робив по понеділках?')],
             [('ходив у кіно із сестрою', 'c', None),
              ('працював до пізньої ночі', 'i', 'По понеділках він не працював: los lunes no trabajaba.'),
              ('ходив на пляж', 'i', 'Біля пляжу був ресторан, де він працював; по понеділках він ходив у кіно.')],
             lh(CLIP_M3), FB_L, clips=[CLIP_M3['id']])

    # --- writing.past-routine-memory (rubric-review) ---------------------------------------------
    w = [WR]
    ex1 = ('De pequeña, vivía con mis padres en una ciudad pequeña. Nuestro piso era viejo, pero tenía una terraza. '
           'Todos los días iba al colegio en autobús y por la tarde jugaba en el parque.')
    w1 = t.rubric('supported', 'childhood-text', w,
                  [P('Напишіть 3–4 речення про своє дитинство: де ви жили, яким було це місце і що ви зазвичай робили. '
                     'Можна взяти за зразок спогад Елени.'),
                   EX('De pequeño, vivía en un pueblo. La casa era vieja y tenía un jardín. Todos los días jugaba en la plaza.',
                      'У дитинстві я жив у містечку. Будинок був старий і мав сад. Щодня я грався на площі.')],
                  CRITERIA, [ex1], [rule(w, R_WR), ('reveal', w, [P('Приклад відповіді (не єдиний можливий):'), PE(ex1)])],
                  FB_W, ex1)
    ex2 = ('Hola, Marta: Mi primer piso estaba en el centro de Valencia. Era pequeño y muy ruidoso, pero tenía mucha luz. '
           'Cerca había una farmacia y un parque. Los domingos paseaba por el parque y leía. Un abrazo.')
    w2 = t.rubric('independent', 'first-home', w,
                  [P('Напишіть коротке повідомлення подрузі (3–5 речень) про своє перше житло: яким воно було, що було поруч '
                     'і що ви там зазвичай робили.')],
                  CRITERIA, [ex2], [rule(w, R_WR), ('reveal', w, [P('Приклад відповіді (не єдиний можливий):'), PE(ex2)])],
                  FB_W, ex2)
    ex3 = ('Mi abuelo era alto y tenía barba. Vivía en el campo y tenía un jardín muy grande. En verano yo iba a su casa y '
           'trabajaba con él en el jardín.')
    t.rubric('delayed', 'person-memory', w,
             [P('Опишіть у 3–4 реченнях людину зі свого дитинства: якою вона була, де жила і що ви робили разом.')],
             CRITERIA, [ex3], [rule(w, R_WR), ('reveal', w, [P('Приклад відповіді (не єдиний можливий):'), PE(ex3)])],
             FB_W, ex3)
    ex4 = ('Antes trabajaba en una oficina en el centro. Empezaba a las nueve y terminaba a las cinco. Comía en un bar '
           'cerca de la oficina y me gustaba mucho mi trabajo.')
    t.rubric('transfer', 'old-job-text', w,
             [P('Напишіть 3–4 речення про свою колишню роботу чи навчання: де це було, яким був звичайний день і що вам подобалося.')],
             CRITERIA, [ex4], [rule(w, R_WR), ('reveal', w, [P('Приклад відповіді (не єдиний можливий):'), PE(ex4)])],
             FB_W, ex4)

    assert len(t.tasks) == 16, len(t.tasks)
    body = lesson(
        'A2-05-L7', 'lesson', BLOCK,
        'Спогад: читаємо, слухаємо, пишемо',
        'recuerdos: comprensión y expresión escrita',
        'Читаємо й слухаємо короткі спогади про дитинство, колишнє житло і роботу, а потім пишемо кілька речень про '
        'власне минуле: період, опис і звички.',
        ['A2-05-O8', 'A2-05-O9'], ['CV-06'], ['people-family-home', 'routine-study-leisure'], 18,
        ['reading.past-routine-description', 'listening.past-memory', 'writing.past-routine-memory'],
        ['imperfecto.use-habit', 'imperfecto.use-description', 'time.past-habit-frames', 'imperfecto.ser', 'imperfecto.ir',
         'imperfecto.regular-ar.singular', 'imperfecto.regular-er-ir.singular', 'imperfecto.age-tenia', 'imperfecto.weather',
         'imperfecto.estar-state', 'imperfecto.habia', 'imperfecto.person-1s-3s', 'listening.past-habits-settings',
         'link.cuando-temporal', 'gustar.pronouns'],
        [
            step('s1', 'explanation', 'Як побудовано спогад', True, blocks=[
                P('Спогад зазвичай має три частини: період (de pequeño, antes, cuando tenía veinte años), опис людей і місць '
                  '(era, tenía, había) і звички (iba, jugaba, comíamos). Подію, що сталася один раз, передає pretérito '
                  'indefinido: Ayer encontré una foto.'),
                P('Нові слова: el recuerdo — спогад (¡Qué recuerdos! — Які спогади!); la infancia — дитинство; el juguete — іграшка.'),
            ]),
            step('s2', 'reading', 'Читання: спогад Елени', True,
                 blocks=[P('Прочитайте спогад Елени й дайте відповіді на питання.'), PE(TEXT_A)], tasks=r_sup + r_ind),
            step('s3', 'listening', 'Аудіювання: короткі спогади', True, clips=[CLIP_M1['id'], CLIP_M2['id']], tasks=[l1, l2]),
            step('s4', 'listening', 'Диктант (необов’язково)', False, clips=[CLIP_M2['id']], tasks=[ld]),
            step('s5', 'writing', 'Письмо: мій спогад', True, tasks=[w1, w2]),
            step('s6', 'summary', 'Підсумок', True, blocks=[
                BL(['Спогад: період + опис (era, tenía, había) + звички (iba, jugaba).',
                    'Читаючи й слухаючи, відрізняйте звичку від опису та від однієї події.',
                    'Ваш текст — не копія зразка: важливі зміст і зрозумілість.']),
            ]),
        ],
    )
    return body, t.tasks


def MATERIALS():
    keys = [WR, RD, LM_M]
    model = ('De pequeña, vivía en un pueblo cerca de Toledo. Nuestra casa era vieja, pero tenía un jardín. Todos los días '
             'jugaba en la plaza con otros niños y los domingos íbamos a casa de mis abuelos.')
    return [
        material('material.a2-05.memory-model', 'A2-05-L7', 'Як написати короткий спогад', [
            BL(['Період: de pequeño / de pequeña, antes, cuando tenía … años.',
                'Опис: era, tenía, había, estaba.',
                'Звички: iba, jugaba, comía, veía.',
                'Одна подія — pretérito indefinido.']),
            P('Зразок (лише приклад, не єдиний правильний варіант):'),
            PE(model),
            LINK('Читати, слухати й писати спогади', keys, 'mixed', 6),
        ], keys),
    ]


def CLIPS():
    return [CLIP_M1, CLIP_M2, CLIP_M3]


LESSONS = [l7]
