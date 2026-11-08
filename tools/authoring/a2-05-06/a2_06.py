"""A2-06 — choosing introduced present and past forms: lesson, task, clip and material data (issue #111, brief 09).

Contrast tasks always give a narrative/situational frame; a single time word never decides the key. Where Spain
usage admits two readings both are accepted; where the Spanish norm prefers perfecto but other varieties use
indefinido (skill variantPolicyUk), the indefinido answer is `unresolved` (never a fake failure).
"""
from build import BL, EX, LINK, P, PE, TB, LessonTasks, POL_DICT, clip, lesson, material, reveal, rule, step
from a2_05_l4 import gap

BLOCK = 'A2-06'

PP_X = 'contrast.present-past/context-choice'
PP_C = 'contrast.present-past/construction-use'
TF_X = 'contrast.perfecto-indefinido.time-frame/context-choice'
TF_C = 'contrast.perfecto-indefinido.time-frame/construction-use'
EO_X = 'contrast.perfecto-indefinido.experience-occasion/context-choice'
EO_C = 'contrast.perfecto-indefinido.experience-occasion/construction-use'
HE_X = 'contrast.indefinido-imperfecto.habit-event/context-choice'
HE_C = 'contrast.indefinido-imperfecto.habit-event/construction-use'
FI_X = 'contrast.past-form-identification/context-choice'
NP_X = 'contrast.nosotros-present-indefinido/context-choice'
MX_X = 'contrast.mixed-unlabelled/context-choice'
MX_C = 'contrast.mixed-unlabelled/construction-use'
RT = 'reading.time-relationship/reading-meaning'
LT_M = 'listening.time-reference/listening-meaning'
LT_D = 'listening.time-reference/dictation'
LA_M = 'listening.past-account/listening-meaning'
LA_D = 'listening.past-account/dictation'
WA = 'writing.connected-account-reply/construction-use'

R_PP = ('Спершу визначте, про який час ідеться: теперішнє (ahora, normalmente) — presente; колишня звичка чи стан '
        '(antes, de pequeño) — imperfecto; окрема подія в минулому — perfecto або indefinido залежно від періоду.')
R_TF = ('Якщо період для мовця ще не закінчився (hoy, esta semana, este año), в Іспанії зазвичай вживають perfecto: '
        'he trabajado. Якщо період уже завершився (ayer, la semana pasada, en 2019) — indefinido: trabajé. Вирішує '
        'період у ситуації, а не одне слово.')
R_EO = ('Досвід до цього моменту без указівки, коли саме (alguna vez, nunca, ya, todavía no), — perfecto: He estado '
        'en Sevilla. Щойно називаємо конкретний випадок чи час — indefinido: Estuve allí en 2019.')
R_HE = ('Звичка певного періоду без підрахунку — imperfecto: De pequeño, iba al pueblo cada verano. Окрема подія — '
        'indefinido: El verano pasado fui al pueblo. Повторення, подане як завершене ціле (dos veces, durante tres '
        'años), теж може бути в indefinido.')
R_FI = ('Порівнюйте закінчення й основу: -aba / -ía — imperfecto (hablaba, comía); -é, -ó, -í, -ió — indefinido '
        '(hablé, habló, comí, comió); haber + дієприкметник — perfecto (ha hablado, ha hecho). Fue — indefinido і від '
        'ser, і від ir; era — імперфект від ser, iba — від ir.')
R_NP = ('Для дієслів на -ar та -ir форма nosotros однакова в теперішньому часі й в indefinido (hablamos, vivimos): час '
        'визначає контекст. У дієсловах на -er форми різні: comemos — comimos.')
R_MX = ('Спершу зрозумійте ситуацію: теперішнє чи минуле? Якщо минуле — досвід або подія в періоді, що ще триває '
        '(perfecto), окрема завершена подія (indefinido) чи звичка або обставина (imperfecto)? Обирайте за змістом.')
R_RT = 'Читаючи, позначайте: що відбувається тепер, що було звичкою чи обставиною, що сталося як подія і в якому порядку.'
R_WA = ('Перш ніж писати, вирішіть, що ви розповідаєте: теперішнє, досвід, окремі події чи обставини. Використовуйте '
        'знайомі форми та зв’язки (primero, después, pero, porque).')

INSTR = 'Доповніть речення правильною формою дієслова в дужках. Час не підказано: вирішіть за змістом.'
NORM = 'Так часто кажуть у Латинській Америці та в частині Іспанії, але за поширеною нормою Іспанії тут очікують perfecto: {}.'
FB_C = ('Правильно.', 'Ні. Подумайте, про який час і яку ситуацію йдеться.')


def g(t, role, fam, key, sent, verb, acc, errs, rtxt):
    return gap(t, role, fam, [key], sent, verb, acc, errs, rtxt, INSTR)


def ch(t, role, fam, key, prompt, options, rtxt, fb=FB_C, clips=None, hints=None):
    return t.choice(role, fam, [key], prompt, options, hints or [rule([key], rtxt)], fb, clips=clips)


def lh(key, c):
    return [('transcript', [key], [PE(c['transcript'])]), ('translation', [key], [P(c['translationUk'])])]


FB_L = ('Правильно.', 'Ні. Прослухайте запис ще раз; можна відкрити текст запису як підказку.')


def dictation(t, fam, key, c, text, extra_acc=None):
    acc = [text] + (extra_acc or [])
    return t.exact('independent', fam, [key],
                   [P('Диктант (необов’язково). Прослухайте запис ще раз і напишіть речення, яке починається словами «'
                      + ' '.join(text.split()[:2]) + '».')],
                   acc, [], [reveal([key], text)],
                   ('Правильно записано.', 'Є помилка в записі. Порівняйте з правильним реченням.',
                    'Запис відрізняється від тексту, і перевірити його автоматично не вдалося. Порівняйте з правильним '
                    'реченням: ' + text),
                   text, policy=POL_DICT, clips=[c['id']])


def ids(t, role):
    return [x['id'] for x in t.tasks if x['role'] == role]


# ============================================================================================
# A2-06-L1 — now and before (present vs past); listening: time reference
# ============================================================================================

CT1 = clip('clip.a2-06.time-work-now', 'A2-06-L1', 'text',
           'Antes trabajaba en un banco y salía de casa a las siete. Ahora trabajo en casa y me levanto a las nueve. '
           'Ayer, sin embargo, me levanté a las seis porque tenía una reunión.',
           'Раніше я працював (працювала) в банку й виходив (виходила) з дому о сьомій. Тепер я працюю вдома і встаю '
           'о дев’ятій. Однак учора я встав (встала) о шостій, бо мав (мала) нараду.',
           [LT_M], 'work-then-now')
CT2 = clip('clip.a2-06.time-sister-move', 'A2-06-L1', 'text',
           'Mi hermana vivía en Sevilla, pero el año pasado se mudó a Madrid. Ahora vive en un piso pequeño cerca '
           'del centro y está muy contenta.',
           'Моя сестра жила в Севільї, але минулого року переїхала до Мадрида. Тепер вона живе в маленькій квартирі '
           'біля центру і дуже задоволена.',
           [LT_M, LT_D], 'family-move')
CT3 = clip('clip.a2-06.time-languages', 'A2-06-L1', 'text',
           'Ahora estudio español por la tarde, dos días a la semana. Antes estudiaba inglés, pero el año pasado '
           'empecé con el español y me gusta mucho.',
           'Тепер я вчу іспанську після обіду, двічі на тиждень. Раніше я вчив (вчила) англійську, але минулого року '
           'почав (почала) вчити іспанську, і вона мені дуже подобається.',
           [LT_M], 'languages')


def l1():
    t = LessonTasks('A2-06-L1')
    # contrast.present-past / construction-use (10)
    s = [g(t, 'supported', 'work', PP_C, 'Antes trabajaba en un banco, pero ahora ___ en casa.', 'trabajar, yo', ['trabajo'],
           [('trabajaba', 'i', 'Ahora вказує на теперішнє: trabajo. Trabajaba — колишня звичка.'),
            ('trabajé', 'i', 'Ahora вказує на теперішнє: trabajo.')], R_PP),
         g(t, 'supported', 'home', PP_C, 'Ahora vivo en Madrid, pero de pequeño ___ en un pueblo.', 'vivir, yo', ['vivía'],
           [('vivo', 'i', 'De pequeño вказує на минулий період: vivía.'),
            ('viví', 'i', 'Тут описано, де ви жили в дитинстві (обставина того періоду): vivía.')], R_PP)]
    g(t, 'independent', 'habits', PP_C, 'Antes mi hermana no ___ café, pero ahora toma mucho.', 'tomar', ['tomaba'],
      [('toma', 'i', 'Antes … pero ahora: перша частина — про минуле: tomaba.'),
       ('tomó', 'i', 'Тут ідеться про колишню звичку, а не про одну подію: tomaba.')], R_PP)
    g(t, 'independent', 'transport', PP_C, 'Antes íbamos al trabajo en coche; ahora ___ en bicicleta.', 'ir, nosotros', ['vamos'],
      [('íbamos', 'i', 'Ahora вказує на теперішнє: vamos.'),
       ('fuimos', 'i', 'Ahora вказує на теперішнє: vamos.')], R_PP)
    g(t, 'independent', 'study', PP_C, 'Este año estudio en Sevilla, pero el año pasado ___ en Granada.', 'estudiar, yo',
      ['estudié', ('estudiaba', 'Теж правильно: навчання подано як обставину того року.')],
      [('estudio', 'i', 'El año pasado — минулий рік, отже потрібен минулий час: estudié (або estudiaba).'),
       ('he estudiado', 'i', 'Минулий рік уже завершився: estudié (або estudiaba).')], R_PP)
    g(t, 'independent', 'habits', PP_C, 'Normalmente ceno a las nueve, pero cuando era estudiante ___ muy tarde.', 'cenar, yo', ['cenaba'],
      [('ceno', 'i', 'Cuando era estudiante вказує на минулий період: cenaba.'),
       ('cené', 'i', 'Тут ідеться про звичку того періоду: cenaba.')], R_PP)
    g(t, 'delayed', 'home', PP_C, 'Antes mis padres ___ en el centro; ahora viven en el campo.', 'vivir', ['vivían'],
      [('viven', 'i', 'Antes вказує на минуле: vivían.'),
       ('vivieron', 'u', 'Vivieron подає це як завершений період; у протиставленні antes … ahora звичайніше vivían.')], R_PP)
    g(t, 'delayed', 'habits', PP_C, 'Ahora no ___ mucho, pero antes leía todos los días.', 'leer, yo', ['leo'],
      [('leía', 'i', 'Ahora вказує на теперішнє: leo.'),
       ('leí', 'i', 'Ahora вказує на теперішнє: leo.')], R_PP)
    g(t, 'transfer', 'message', PP_C, 'Hola, Pablo: Antes vivía en Valencia, pero ahora ___ en Bilbao.', 'vivir, yo', ['vivo'],
      [('vivía', 'i', 'Ahora вказує на теперішнє: vivo.'),
       ('viví', 'i', 'Ahora вказує на теперішнє: vivo.')], R_PP)
    g(t, 'transfer', 'message', PP_C, 'Hola, Pablo: Ahora tengo coche, pero antes siempre ___ el autobús.', 'tomar, yo', ['tomaba'],
      [('tomo', 'i', 'Antes вказує на минуле: tomaba.'),
       ('tomé', 'i', 'Siempre … antes — колишня звичка: tomaba.')], R_PP)
    # contrast.present-past / context-choice (5)
    ch(t, 'supported', 'meaning', PP_X, [P('Яке речення розповідає про теперішнє?')],
       [('Antes trabajaba en casa.', 'i', 'Antes + trabajaba — колишня звичка.'),
        ('Ahora trabajo en casa.', 'c', None),
        ('Ayer trabajé en casa.', 'i', 'Ayer + trabajé — подія в минулому.')], R_PP)
    ch(t, 'independent', 'state', PP_X, [P('Оберіть форму, яка підходить за змістом.'), PE('Antes ___ muy cansado, pero ahora duermo bien.')],
       [('estaba', 'c', None), ('estoy', 'i', 'Antes вказує на минуле, а «тепер» — у другій частині.'),
        ('era', 'i', 'Втома — це стан, тому estar: estaba.')], R_PP)
    ch(t, 'independent', 'sport', PP_X, [PE('Antes Luis jugaba al fútbol. Ahora corre todos los días.'), P('Що Луїс робить тепер?')],
       [('грає у футбол', 'i', 'Jugaba — колишня звичка; тепер він бігає (ahora corre).'),
        ('бігає щодня', 'c', None),
        ('нічого не робить', 'i', 'Ahora corre todos los días — тепер він щодня бігає.')], R_PP)
    ch(t, 'delayed', 'work', PP_X, [P('Оберіть форму, яка підходить за змістом.'), PE('Ahora ___ en una oficina, pero antes trabajaba en casa.')],
       [('trabajaba', 'i', 'Ahora вказує на теперішнє: trabajo.'), ('trabajé', 'i', 'Ahora вказує на теперішнє: trabajo.'),
        ('trabajo', 'c', None)], R_PP)
    ch(t, 'transfer', 'message', PP_X, [P('Прочитайте повідомлення.'),
                                         PE('Hola, Pablo: Ahora vivo en Toledo y trabajo en un museo. Antes enseñaba inglés en un colegio. Un beso, Ana.'),
                                         P('Що Ана робить тепер?')],
       [('викладає англійську', 'i', 'Enseñaba — колишня робота (antes).'), ('працює в музеї', 'c', None),
        ('навчається в коледжі', 'i', 'У повідомленні: ahora … trabajo en un museo.')], R_PP)
    # listening.time-reference
    l1a = ch(t, 'independent', CT1['family'], LT_M, [P('Прослухайте запис. О котрій оповідач зазвичай встає тепер?')],
             [('о сьомій', 'i', 'О сьомій він (вона) виходив (виходила) з дому раніше, коли працював (працювала) в банку.'),
              ('о дев’ятій', 'c', None),
              ('о шостій', 'i', 'О шостій — лише вчора, через нараду.')], '', FB_L, clips=[CT1['id']], hints=lh(LT_M, CT1))
    l1b = ch(t, 'independent', CT2['family'], LT_M, [P('Прослухайте запис. Де сестра живе тепер?')],
             [('у Севільї', 'i', 'У Севільї вона жила раніше (vivía).'), ('у Мадриді', 'c', None),
              ('у Толедо', 'i', 'Про Толедо в записі не йдеться: ahora vive … en Madrid.')], '', FB_L, clips=[CT2['id']], hints=lh(LT_M, CT2))
    l1d = dictation(t, CT2['family'], LT_D, CT2, 'Ahora vive en un piso pequeño cerca del centro y está muy contenta.')
    ch(t, 'delayed', CT1['family'], LT_M, [P('Прослухайте запис. Чому вчора оповідач встав о шостій?')],
       [('бо мав (мала) нараду', 'c', None), ('бо тепер працює в банку', 'i', 'У банку він (вона) працював (працювала) раніше.'),
        ('бо так буває щодня', 'i', 'Щодня тепер він (вона) встає о дев’ятій; учора — виняток.')], '', FB_L, clips=[CT1['id']], hints=lh(LT_M, CT1))
    ch(t, 'transfer', CT3['family'], LT_M, [P('Прослухайте запис. Яку мову ця людина вчить тепер?')],
       [('англійську', 'i', 'Англійську вона вчила раніше (antes estudiaba inglés).'), ('іспанську', 'c', None),
        ('обидві мови', 'i', 'Тепер — лише іспанську: ahora estudio español.')], '', FB_L, clips=[CT3['id']], hints=lh(LT_M, CT3))
    assert len(t.tasks) == 20, len(t.tasks)
    body = lesson('A2-06-L1', 'lesson', BLOCK, 'Тепер і раніше: теперішній чи минулий час', 'presente o pasado',
                  'Порівнюємо знайомі ситуації тепер і раніше: обираємо теперішній час, імперфект для колишньої звички чи '
                  'стану або минулий час для окремої події — по одному контрасту за раз.',
                  ['A2-06-O1', 'A2-06-O6'], [], ['routine-study-leisure', 'people-family-home'], 15,
                  ['contrast.present-past', 'listening.time-reference'],
                  ['imperfecto.use-habit', 'imperfecto.estar-state', 'present.regular-ar', 'present.regular-er', 'present.regular-ir',
                   'indefinido.use-completed-event', 'perfecto.choice-context', 'listening.past-habits-settings', 'time.past-habit-frames'],
                  [
                      step('s1', 'explanation', 'Тепер чи раніше?', True, blocks=[
                          P('Спершу визначте, про який час ідеться. Теперішня звичка чи стан — presente: Ahora trabajo en casa. '
                            'Колишня звичка чи стан — imperfecto: Antes trabajaba en un banco. Окрема подія в минулому — '
                            'perfecto або indefinido (про них — у наступному уроці): Ayer trabajé diez horas.'),
                          TB(['ahora', 'antes', 'una vez en el pasado'],
                             [['Vivo en Madrid.', 'Vivía en un pueblo.', 'El año pasado me mudé a Madrid.'],
                              ['Estoy contento.', 'Estaba muy cansado.', 'Ayer estuve en casa de Ana.'],
                              ['Trabajo en casa.', 'Trabajaba en un banco.', 'Ayer trabajé diez horas.']]),
                          P('Слухаючи, звертайте увагу не лише на слова часу, а й на закінчення та наголос: hablo (теперішній, '
                            'наголос на першому складі) і habló (минулий, наголос на останньому) звучать по-різному.'),
                          P('Нові слова: mudarse — переїжджати (me mudé — я переїхав, переїхала); hace poco — нещодавно.'),
                      ]),
                      step('s2', 'supported-practice', 'Практика зі зразком', True, tasks=ids(t, 'supported')),
                      step('s3', 'independent-practice', 'Самостійна практика', True,
                           tasks=[x for x in ids(t, 'independent') if x not in (l1a, l1b, l1d)]),
                      step('s4', 'listening', 'Аудіювання: тепер, колись чи один раз?', True, clips=[CT1['id'], CT2['id']], tasks=[l1a, l1b]),
                      step('s5', 'listening', 'Диктант (необов’язково)', False, clips=[CT2['id']], tasks=[l1d]),
                      step('s6', 'summary', 'Підсумок', True, blocks=[BL([
                          'Тепер — presente: Ahora vivo en Madrid.',
                          'Колишня звичка чи стан — imperfecto: Antes vivía en un pueblo.',
                          'Окрема подія в минулому — perfecto або indefinido: El año pasado me mudé.'])]),
                  ])
    return body, t.tasks


# ============================================================================================
# A2-06-L2 — perfecto compuesto or indefinido in context
# ============================================================================================

def l2():
    t = LessonTasks('A2-06-L2')
    # time-frame / construction-use (10)
    g(t, 'supported', 'workday', TF_C, 'Estoy muy cansado. Hoy ___ diez horas en la oficina.', 'trabajar, yo', ['he trabajado'],
      [('trabajé', 'u', NORM.format('he trabajado')),
       ('trabajaba', 'i', 'Тут ідеться про завершену роботу в сьогоднішньому дні, а не про звичку: he trabajado.')], R_TF)
    g(t, 'supported', 'trip', TF_C, 'La semana pasada ___ a Sevilla con mis padres; fue un viaje muy bonito.', 'ir, nosotros', ['fuimos'],
      [('hemos ido', 'i', 'Минулий тиждень уже завершився: fuimos.'),
       ('íbamos', 'i', 'Тут ідеться про одну поїздку, а не про звичку: fuimos.')], R_TF)
    g(t, 'independent', 'trip', TF_C, 'Este año ___ dos veces a Madrid, y todavía estamos en marzo.', 'viajar, nosotros', ['hemos viajado'],
      [('viajábamos', 'i', 'Тут ідеться про поїздки в цьому році, який ще триває: hemos viajado.')], R_TF)
    g(t, 'independent', 'friends', TF_C, 'El verano pasado mis amigos ___ dos semanas en un hotel cerca de la playa.', 'estar', ['estuvieron'],
      [('han estado', 'i', 'Минуле літо вже завершилося: estuvieron.')], R_TF)
    g(t, 'independent', 'workday', TF_C, '—¿Qué tal el día? —Muy bien. Hoy ___ con Ana en un restaurante del centro.', 'comer, yo', ['he comido'],
      [('comí', 'u', NORM.format('he comido')),
       ('comía', 'i', 'Тут ідеться про подію сьогоднішнього дня, а не про звичку: he comido.')], R_TF)
    g(t, 'independent', 'home', TF_C, 'En 2019 Marta ___ en Valencia; ahora vive en Toledo.', 'vivir',
      ['vivió', ('vivía', 'Теж правильно: життя у Валенсії подано як обставину того року.')],
      [('ha vivido', 'i', '2019 рік уже завершився: vivió (або vivía).')], R_TF)
    g(t, 'delayed', 'workday', TF_C, 'Esta semana no ___ tiempo para nada: tengo mucho trabajo.', 'tener, yo', ['he tenido'],
      [('tuve', 'u', NORM.format('he tenido')),
       ('tenía', 'u', 'Tenía подає це як обставину; про цей тиждень, що ще триває, звичайно кажуть he tenido.')], R_TF)
    g(t, 'delayed', 'friends', TF_C, 'Ayer por la noche ___ una película muy buena en casa.', 'ver, nosotros', ['vimos'],
      [('hemos visto', 'i', 'Учорашній вечір уже минув: vimos.'),
       ('veíamos', 'i', 'Тут ідеться про один перегляд, а не про звичку: vimos.')], R_TF)
    g(t, 'transfer', 'message', TF_C, 'Hola, Ana: Hoy ___ el examen de español y estoy muy contenta.', 'hacer, yo', ['he hecho'],
      [('hice', 'u', NORM.format('he hecho')),
       ('hacía', 'i', 'Тут ідеться про один іспит сьогодні: he hecho.')], R_TF)
    g(t, 'transfer', 'message', TF_C, 'Hola, Ana: El lunes pasado ___ a tu hermano en el cine.', 'ver, yo', ['vi'],
      [('he visto', 'i', 'Минулий понеділок уже минув: vi.'),
       ('veía', 'i', 'Тут ідеться про одну зустріч: vi.')], R_TF)
    # experience-occasion / construction-use (10)
    g(t, 'supported', 'travel', EO_C, '—¿___ alguna vez en Sevilla? —Sí, estuve allí en 2019.', 'estar, tú', ['Has estado'],
      [('Estuviste', 'u', NORM.format('¿Has estado alguna vez…?'))], R_EO)
    g(t, 'supported', 'travel', EO_C, '—¿Has estado en Bilbao? —Sí, ___ allí el año pasado.', 'estar, yo', ['estuve'],
      [('he estado', 'i', 'Щойно названо конкретний час (el año pasado), вживаємо indefinido: estuve.')], R_EO)
    g(t, 'independent', 'travel', EO_C, 'Nunca ___ a Granada, pero quiero ir.', 'ir, yo', ['he ido'],
      [('fui', 'u', NORM.format('nunca he ido'))], R_EO)
    g(t, 'independent', 'films', EO_C, 'Ana ya ___ esa película: la vio el sábado con su hermano.', 'ver', ['ha visto'],
      [('vio', 'u', NORM.format('ya ha visto'))], R_EO)
    g(t, 'independent', 'travel', EO_C, 'Conozco Toledo: ___ allí con mi familia en 2015.', 'estar, yo', ['estuve'],
      [('he estado', 'i', 'Названо конкретний рік (en 2015): estuve.')], R_EO)
    g(t, 'independent', 'travel', EO_C, '—¿Habéis viajado alguna vez a Ucrania? —Sí, ___ allí el verano pasado.', 'viajar, nosotros', ['viajamos'],
      [('hemos viajado', 'i', 'Названо конкретний час (el verano pasado): viajamos.')], R_EO)
    g(t, 'delayed', 'books', EO_C, '¿___ alguna vez un libro en español?', 'leer, tú', ['Has leído'],
      [('Leíste', 'u', NORM.format('¿Has leído alguna vez…?'))], R_EO)
    g(t, 'delayed', 'travel', EO_C, 'Mi padre ha visitado Madrid muchas veces. La última vez ___ en mayo.', 'ir', ['fue'],
      [('ha ido', 'i', 'Названо конкретний випадок (la última vez, en mayo): fue.')], R_EO)
    g(t, 'transfer', 'message', EO_C, 'Hola, Luis: Todavía no ___ tu regalo, pero mañana voy a abrirlo.', 'abrir, yo', ['he abierto'],
      [('abrí', 'u', NORM.format('todavía no he abierto')),
       ('he abrido', 'i', 'Abrir має особливий дієприкметник: abierto.')], R_EO)
    g(t, 'transfer', 'message', EO_C, 'Hola, Luis: En marzo ___ a tus padres en Valencia. ¡Qué simpáticos!', 'conocer, yo', ['conocí'],
      [('he conocido', 'i', 'Названо конкретний час (en marzo): conocí.')], R_EO)
    # context-choice (4 + 4)
    ch(t, 'supported', 'workday', TF_X, [P('Оберіть форму, яка підходить за змістом.'), PE('¡Qué día! Hoy ___ muchísimo y ahora estoy cansada.')],
       [('he trabajado', 'c', None), ('trabajaba', 'i', 'Тут ідеться про роботу сьогодні, а не про звичку.'),
        ('trabajo', 'i', 'Ahora estoy cansada — підсумок уже зробленого сьогодні: he trabajado.')], R_TF)
    ch(t, 'independent', 'trip', TF_X, [P('Оберіть форму, яка підходить за змістом.'), PE('El año pasado ___ a Italia con mis amigos.')],
       [('hemos ido', 'i', 'Минулий рік уже завершився: fuimos.'), ('fuimos', 'c', None),
        ('vamos', 'i', 'El año pasado вказує на минуле.')], R_TF)
    ch(t, 'delayed', 'workday', TF_X, [P('Яке речення природне для Іспанії?')],
       [('Esta semana he ido dos veces al gimnasio.', 'c', None),
        ('Ayer he ido al gimnasio.', 'i', 'Учорашній день уже минув: Ayer fui al gimnasio.'),
        ('La semana pasada he ido dos veces al gimnasio.', 'i', 'Минулий тиждень завершився: fui.')], R_TF)
    ch(t, 'transfer', 'message', TF_X, [PE('Hola, Pablo: Este mes he leído tres libros. El mes pasado leí solo uno. Un abrazo, Marta.'), P('Скільки книжок Марта прочитала минулого місяця?')],
       [('одну', 'c', None), ('три', 'i', 'Три — цього місяця (este mes he leído).'), ('чотири', 'i', 'Минулого місяця — una: leí solo uno.')], R_TF)
    ch(t, 'supported', 'travel', EO_X, [P('Яке питання — про досвід «колись у житті»?')],
       [('¿Has estado alguna vez en Málaga?', 'c', None), ('¿Cuándo estuviste en Málaga?', 'i', 'Це питання про конкретний час.'),
        ('¿Estás en Málaga?', 'i', 'Це питання про теперішнє.')], R_EO)
    ch(t, 'independent', 'travel', EO_X, [P('Оберіть форму, яка підходить за змістом.'), PE('—¿Conoces Bilbao? —Sí, ___ allí en 2018.')],
       [('he estado', 'i', 'Названо конкретний рік: estuve.'), ('estaba', 'i', 'Тут ідеться про один візит: estuve.'),
        ('estuve', 'c', None)], R_EO)
    ch(t, 'delayed', 'films', EO_X, [P('Оберіть форму, яка підходить за змістом.'), PE('Nunca ___ una película en español.')],
       [('he visto', 'c', None), ('veía', 'i', 'Тут ідеться про досвід до цього моменту: nunca he visto.'),
        ('veo', 'i', 'Nunca he visto — досвід до цього моменту; veo — теперішній час.')], R_EO)
    ch(t, 'transfer', 'message', EO_X, [PE('Hola, Pablo: Ya he probado la tortilla de tu madre. ¡Está buenísima!'), P('Що означає ya he probado?')],
       [('уже скуштував (скуштувала)', 'c', None), ('ще не куштував (не куштувала)', 'i', 'Ya — «вже»; «ще не» було б todavía no.'),
        ('куштую щодня', 'i', 'He probado — досвід до цього моменту, а не звичка.')], R_EO,
       hints=[rule([EO_X], R_EO), ('translation', [], [P('Probar — куштувати; la tortilla — іспанський омлет з картоплею.')])])
    assert len(t.tasks) == 28, len(t.tasks)
    sup, ind = ids(t, 'supported'), ids(t, 'independent')
    body = lesson('A2-06-L2', 'lesson', BLOCK, 'Perfecto чи indefinido в контексті', 'pretérito perfecto compuesto o indefinido',
                  'Обираємо між perfecto compuesto та indefinido: період, що ще триває, чи завершений; досвід «колись у житті» '
                  'чи конкретний випадок.',
                  ['A2-06-O2'], [], ['routine-study-leisure', 'time-appointments-transport'], 16,
                  ['contrast.perfecto-indefinido.time-frame', 'contrast.perfecto-indefinido.experience-occasion'],
                  ['perfecto.choice-context', 'perfecto.use-current-period', 'perfecto.use-experience', 'indefinido.use-completed-event',
                   'contrast.perfecto-indefinido', 'time.past-markers', 'participle.hecho', 'participle.visto', 'participle.abierto',
                   'indefinido.ser-ir', 'indefinido.estar', 'indefinido.ver'],
                  [
                      step('s1', 'explanation', 'Період і досвід', True, blocks=[
                          P('Perfecto compuesto (he trabajado) в Іспанії зазвичай описує події в періоді, який для мовця ще не '
                            'закінчився (hoy, esta semana, este año), і досвід до цього моменту (alguna vez, nunca, ya, todavía no). '
                            'Indefinido (trabajé) — події в завершеному періоді (ayer, la semana pasada, en 2019) і конкретні випадки.'),
                          TB(['perfecto', 'indefinido'],
                             [['Esta semana he trabajado mucho.', 'La semana pasada trabajé mucho.'],
                              ['¿Has estado alguna vez en Sevilla?', 'Estuve en Sevilla en 2019.'],
                              ['Todavía no he visto la película.', 'Vi la película el sábado.']]),
                          P('Вирішує не одне слово, а ситуація: чи період ще триває для мовця, чи ми називаємо конкретний випадок. '
                            'Для esta mañana, esta tarde в Іспанії можливі обидва часи.'),
                          P('Регіональна примітка: на Канарах, у частині північного заходу Іспанії та в Латинській Америці частіше '
                            'вживають indefinido й там, де за поширеною нормою Іспанії очікують perfecto. Такі відповіді ми не '
                            'вважаємо помилкою — вони лишаються на перевірку.'),
                      ]),
                      step('s2', 'supported-practice', 'Практика зі зразком', True, tasks=sup),
                      step('s3', 'independent-practice', 'Самостійна практика', True, tasks=ind),
                      step('s4', 'summary', 'Підсумок', True, blocks=[BL([
                          'Період ще триває (hoy, esta semana, este año) — he trabajado.',
                          'Період завершився (ayer, la semana pasada, en 2019) — trabajé.',
                          'Досвід без дати (alguna vez, nunca, ya) — he estado; конкретний випадок — estuve.'])]),
                  ])
    return body, t.tasks


# ============================================================================================
# A2-06-L3 — indefinido or imperfecto: habit vs event
# ============================================================================================

def l3():
    t = LessonTasks('A2-06-L3')
    g(t, 'supported', 'village', HE_C, 'De pequeño, ___ al pueblo todos los veranos.', 'ir, yo', ['iba'],
      [('fui', 'i', 'Звичка дитинства (todos los veranos): iba.')], R_HE)
    g(t, 'supported', 'village', HE_C, 'El verano pasado ___ al pueblo una semana.', 'ir, yo', ['fui'],
      [('iba', 'i', 'Тут ідеться про одну поїздку минулого літа: fui.')], R_HE)
    g(t, 'independent', 'cinema', HE_C, 'Cuando vivía en Madrid, ___ al cine todos los domingos.', 'ir, yo', ['iba'],
      [('fui', 'i', 'Звичка того періоду (todos los domingos): iba.')], R_HE)
    g(t, 'independent', 'cinema', HE_C, 'El domingo pasado ___ al cine con Ana y vimos una comedia.', 'ir, yo', ['fui'],
      [('iba', 'i', 'Тут ідеться про один похід у кіно минулої неділі: fui.')], R_HE)
    g(t, 'independent', 'work', HE_C, 'Durante tres años ___ en un hotel de Málaga.', 'trabajar, yo',
      ['trabajé', ('trabajaba', 'Теж правильно: роботу подано як обставину того періоду.')],
      [('trabajo', 'i', 'Durante tres años … — це минулий період.')], R_HE)
    g(t, 'independent', 'school', HE_C, 'En el colegio, mi hermano siempre ___ tarde a clase.', 'llegar', ['llegaba'],
      [('llegó', 'i', 'Siempre в шкільні роки — звичка: llegaba.')], R_HE)
    g(t, 'delayed', 'work', HE_C, 'Aquel día Ana ___ tarde a la reunión porque perdió el autobús.', 'llegar', ['llegó'],
      [('llegaba', 'i', 'Aquel día — один випадок: llegó.')], R_HE)
    g(t, 'delayed', 'school', HE_C, 'En el colegio, nosotros ___ al fútbol los viernes.', 'jugar', ['jugábamos'],
      [('jugamos', 'i', 'Los viernes у шкільні роки — звичка: jugábamos.')], R_HE)
    g(t, 'transfer', 'message', HE_C, 'Hola, Marta: Ayer ___ a tu abuela en la plaza. ¡Está muy bien!', 'ver, yo', ['vi'],
      [('veía', 'i', 'Ayer — одна зустріч: vi.')], R_HE)
    g(t, 'transfer', 'message', HE_C, 'Hola, Marta: De niñas, tú y yo siempre ___ en tu casa los sábados.', 'comer, nosotras', ['comíamos'],
      [('comimos', 'i', 'Siempre … los sábados у дитинстві — звичка: comíamos.')], R_HE)
    ch(t, 'supported', 'meaning', HE_X, [P('Яке речення описує одну подію?')],
       [('El sábado pasado fuimos a la playa.', 'c', None), ('Los sábados íbamos a la playa.', 'i', 'Це звичка (los sábados).'),
        ('De niños, íbamos mucho a la playa.', 'i', 'Це звичка дитинства.')], R_HE)
    ch(t, 'independent', 'village', HE_X, [P('Оберіть форму, яка підходить за змістом.'), PE('Cuando era pequeña, mi abuela me ___ un cuento cada noche.')],
       [('leía', 'c', None), ('leyó', 'i', 'Cada noche в дитинстві — звичка: leía.'), ('lee', 'i', 'Cuando era pequeña вказує на минуле.')], R_HE,
       hints=[rule([HE_X], R_HE), ('translation', [], [P('Un cuento — казка.')])])
    ch(t, 'independent', 'work', HE_X, [P('Що означає це речення?'), PE('Fui a Londres dos veces el año pasado.')],
       [('Минулого року я двічі їздив (їздила) до Лондона.', 'c', None),
        ('Я щороку їздив (їздила) до Лондона.', 'i', 'Dos veces el año pasado — два конкретні рази.'),
        ('Я їздитиму до Лондона двічі.', 'i', 'Fui — минулий час.')], R_HE)
    ch(t, 'delayed', 'school', HE_X, [P('Оберіть форму, яка підходить за змістом.'), PE('Antes mi padre ___ en tren a la oficina, pero un día compró un coche.')],
       [('fue', 'i', 'Antes — звичка до покупки машини: iba.'), ('iba', 'c', None), ('va', 'i', 'Antes вказує на минуле.')], R_HE)
    assert len(t.tasks) == 14, len(t.tasks)
    body = lesson('A2-06-L3', 'lesson', BLOCK, 'Indefinido чи imperfecto: звичка чи подія', 'indefinido o imperfecto',
                  'Розрізняємо звичку певного періоду (imperfecto) та окрему подію або повторення, подане як завершене ціле '
                  '(indefinido), у знайомих ситуаціях.',
                  ['A2-06-O3'], [], ['routine-study-leisure', 'people-family-home'], 14,
                  ['contrast.indefinido-imperfecto.habit-event'],
                  ['imperfecto.use-habit', 'imperfecto.use-description', 'imperfecto.use-background', 'indefinido.use-completed-event',
                   'contrast.indefinido-imperfecto.background-event', 'contrast.perfecto-indefinido', 'imperfecto.ir', 'indefinido.ser-ir'],
                  [
                      step('s1', 'explanation', 'Звичка того періоду чи окрема подія', True, blocks=[
                          P('Якщо описуємо, що було звичним у певний період, без підрахунку й меж, — imperfecto: De niña, iba al '
                            'pueblo cada verano. Якщо розповідаємо про окрему подію — indefinido: El verano pasado fui al pueblo.'),
                          P('Повторення, подане як завершене ціле (dos veces, durante tres años), теж буває в indefinido: Fui al pueblo '
                            'dos veces. Тому вирішує спосіб подачі, а не слова todos los чи cada.'),
                          EX('Cuando vivía en Madrid, iba al cine todos los domingos.', 'Коли я жив (жила) в Мадриді, я щонеділі ходив (ходила) в кіно.'),
                          EX('El domingo pasado fui al cine con Ana.', 'Минулої неділі я ходив (ходила) в кіно з Аною.'),
                      ]),
                      step('s2', 'supported-practice', 'Практика зі зразком', True, tasks=ids(t, 'supported')),
                      step('s3', 'independent-practice', 'Самостійна практика', True, tasks=ids(t, 'independent')),
                      step('s4', 'summary', 'Підсумок', True, blocks=[BL([
                          'Звичка періоду — imperfecto: iba, jugábamos, comíamos.',
                          'Окрема подія — indefinido: fui, llegó, vi.',
                          'Повторення як завершене ціле (dos veces, durante tres años) — indefinido теж можливий.'])]),
                  ])
    return body, t.tasks


# ============================================================================================
# A2-06-L4 — untangle similar forms (meaning supplied)
# ============================================================================================

def l4():
    t = LessonTasks('A2-06-L4')
    f = FI_X
    ch(t, 'supported', 'forms', f, [P('Зразок: hacía — imperfecto, hizo — indefinido, ha hecho — perfecto. Яка форма — pretérito indefinido від hacer?')],
       [('hacía', 'i', 'Hacía — імперфект.'), ('hizo', 'c', None), ('ha hecho', 'i', 'Ha hecho — це форма perfecto.')], R_FI)
    ch(t, 'supported', 'forms', f, [P('Яка форма — імперфект від ser?')],
       [('fue', 'i', 'Fue — indefinido (від ser і від ir).'), ('era', 'c', None), ('es', 'i', 'Es — теперішній час.')], R_FI)
    ch(t, 'independent', 'forms', f, [P('Оберіть форму, що означає «він ходив (регулярно)»: Antes Luis ___ al gimnasio.')],
       [('iba', 'c', None), ('fue', 'i', 'Fue — одна подія (indefinido).'), ('ha ido', 'i', 'Ha ido — це форма perfecto.')], R_FI)
    ch(t, 'independent', 'forms', f, [P('Оберіть форму, що означає «він побачив (один раз)»: Ayer Pablo ___ a Ana en el parque.')],
       [('veía', 'i', 'Veía — імперфект.'), ('vio', 'c', None), ('ha visto', 'i', 'Ha visto — perfecto; ayer вимагає indefinido.')], R_FI)
    ch(t, 'independent', 'forms', f, [P('У якому реченні fue — від ir («пішов, поїхав»)?')],
       [('Fue muy bonito.', 'i', 'Тут fue — від ser («було»).'), ('Fue a Madrid en tren.', 'c', None),
        ('Fue profesor muchos años.', 'i', 'Тут fue — від ser («був»).')], R_FI)
    ch(t, 'independent', 'forms', f, [P('Яка форма — perfecto від hacer для tú?')],
       [('has hecho', 'c', None), ('has hacido', 'i', 'Hacer має особливий дієприкметник: hecho.'), ('hiciste', 'i', 'Hiciste — це форма indefinido.')], R_FI)
    ch(t, 'delayed', 'forms', f, [P('Яка форма — імперфект від comer для él?')],
       [('comió', 'i', 'Comió — це форма indefinido.'), ('come', 'i', 'Come — теперішній час.'), ('comía', 'c', None)], R_FI)
    ch(t, 'transfer', 'message', f, [PE('Hola, Ana: Ayer fue mi cumpleaños y fue genial. Luego fui a cenar con mis padres.'),
                                     P('Скільки разів у повідомленні fue означає «пішов, поїхав» (від ir)?')],
       [('жодного разу', 'c', None),
        ('один раз', 'i', 'Fui a cenar — це справді ir, але форма тут fui, а не fue.'),
        ('двічі', 'i', 'Обидва fue в першому реченні — від ser («був», «було»). Від ir — лише fui a cenar.')], R_FI)
    n = NP_X
    ch(t, 'supported', 'nosotros', n, [P('Зразок: Ahora hablamos español (теперішнє) — Ayer hablamos con Luis (минуле). Коли відбувається дія?'),
                                        PE('Ayer hablamos con nuestros vecinos.')],
       [('учора', 'c', None), ('зараз', 'i', 'Ayer показує минуле: hablamos тут — indefinido.'), ('щодня', 'i', 'Ayer — один випадок.')], R_NP)
    ch(t, 'independent', 'nosotros', n, [P('Коли відбувається дія?'), PE('Normalmente trabajamos en casa los lunes.')],
       [('у минулому', 'i', 'Normalmente … los lunes — теперішня звичка.'), ('зазвичай, тепер', 'c', None),
        ('лише одного разу', 'i', 'Normalmente — звичка.')], R_NP)
    ch(t, 'independent', 'nosotros', n, [P('Яка форма однозначно означає минуле (дієслово comer)?')],
       [('comemos', 'i', 'Comemos — теперішній час.'), ('comimos', 'c', None), ('comíamos', 'i', 'Comíamos — імперфект, звичка.')], R_NP)
    ch(t, 'delayed', 'nosotros', n, [P('Коли відбувається дія?'), PE('El sábado pasado vivimos una experiencia increíble.')],
       [('минулої суботи', 'c', None), ('щосуботи', 'i', 'El sábado pasado — одна субота в минулому.'),
        ('тепер', 'i', 'El sábado pasado вказує на минуле.')], R_NP,
       hints=[rule([n], R_NP), ('translation', [], [P('Una experiencia increíble — неймовірна пригода, досвід.')])])
    ch(t, 'transfer', 'message', n, [PE('Hola, Luis: Ya no vivimos en Toledo. En mayo nos mudamos a Madrid.'), P('Що означає nos mudamos у цьому повідомленні?')],
       [('ми переїхали (у травні)', 'c', None), ('ми переїжджаємо щотравня', 'i', 'En mayo і контекст (ya no vivimos en Toledo) показують одну подію в минулому.'),
        ('ми переїдемо', 'i', 'Ya no vivimos en Toledo — переїзд уже відбувся.')], R_NP,
       hints=[rule([n], R_NP), ('translation', [], [P('Ya no — вже не.')])])
    assert len(t.tasks) == 13, len(t.tasks)
    body = lesson('A2-06-L4', 'lesson', BLOCK, 'Схожі форми: hacía, hizo, ha hecho', 'formas verbales parecidas',
                  'Коли значення вже задано, розпізнаємо потрібну форму серед схожих: імперфект, indefinido, perfecto, теперішній '
                  'час; fue від ser і від ir; однакові форми nosotros.',
                  ['A2-06-O4', 'A2-06-O1'], [], ['routine-study-leisure'], 12,
                  ['contrast.past-form-identification', 'contrast.nosotros-present-indefinido'],
                  ['imperfecto.regular-er-ir.singular', 'imperfecto.ser', 'imperfecto.ir', 'imperfecto.ver', 'indefinido.ser-ir',
                   'contrast.fue-ser-ir', 'participle.hecho', 'indefinido.hacer', 'indefinido.nosotros-syncretism'],
                  [
                      step('s1', 'explanation', 'Як розрізнити схожі форми', True, blocks=[
                          P(R_FI),
                          TB(['imperfecto', 'indefinido', 'perfecto', 'presente'],
                             [['hablaba', 'habló', 'ha hablado', 'habla'], ['comía', 'comió', 'ha comido', 'come'],
                              ['hacía', 'hizo', 'ha hecho', 'hace'], ['era', 'fue', 'ha sido', 'es'],
                              ['iba', 'fue', 'ha ido', 'va'], ['veía', 'vio', 'ha visto', 've']]),
                          P(R_NP),
                      ]),
                      step('s2', 'supported-practice', 'Практика зі зразком', True, tasks=ids(t, 'supported')),
                      step('s3', 'independent-practice', 'Самостійна практика', True, tasks=ids(t, 'independent')),
                      step('s4', 'summary', 'Підсумок', True, blocks=[BL([
                          '-aba / -ía — imperfecto; -é, -ó, -í, -ió — indefinido; haber + дієприкметник — perfecto.',
                          'Fue — indefinido від ser і від ir; era — від ser, iba — від ir.',
                          'Hablamos, vivimos — і теперішній час, і indefinido: дивіться на контекст.'])]),
                  ])
    return body, t.tasks


# ============================================================================================
# A2-06-L5 — mixed everyday situations without tense labels
# ============================================================================================

def l5():
    t = LessonTasks('A2-06-L5')
    g(t, 'supported', 'day', MX_C, 'Normalmente ___ a las ocho, pero hoy me he levantado a las diez.', 'levantarse, yo', ['me levanto'],
      [('me levantaba', 'i', 'Normalmente тут — теперішня звичка: me levanto.'),
       ('me levanté', 'i', 'Normalmente — звичка, а не одна подія: me levanto.')], R_MX)
    g(t, 'supported', 'childhood', MX_C, 'De pequeña, Lucía ___ el pelo muy largo.', 'tener', ['tenía'],
      [('tuvo', 'i', 'Опис дитинства: tenía.'), ('tiene', 'i', 'De pequeña вказує на минуле: tenía.')], R_MX)
    g(t, 'independent', 'day', MX_C, 'Hoy no ___ nada todavía y tengo mucha hambre.', 'comer, yo', ['he comido'],
      [('comí', 'u', NORM.format('he comido')), ('comía', 'i', 'Todavía + hoy: досвід до цього моменту — he comido.')], R_MX)
    g(t, 'independent', 'trip', MX_C, 'En 2018 ___ a Granada con unos amigos.', 'ir, yo', ['fui'],
      [('he ido', 'i', '2018 рік завершився: fui.'), ('iba', 'i', 'Тут ідеться про одну поїздку: fui.')], R_MX)
    g(t, 'independent', 'childhood', MX_C, 'Cuando era niño, mi familia ___ en un piso muy pequeño.', 'vivir', ['vivía'],
      [('vivió', 'u', 'Vivió подає це як завершений період; в описі дитинства звичайніше vivía.'),
       ('vive', 'i', 'Cuando era niño вказує на минуле: vivía.')], R_MX)
    g(t, 'independent', 'story', MX_C, 'Cuando llegué a la estación, ___ mucha gente.', 'haber', ['había'],
      [('hubo', 'i', 'Тут описано, що було в момент приходу (тло): había.'), ('hay', 'i', 'Llegué — минуле: había.')], R_MX)
    g(t, 'delayed', 'day', MX_C, '¿Ya ___ los deberes? —Sí, los he terminado hace un momento.', 'hacer, tú', ['Has hecho'],
      [('Hiciste', 'u', NORM.format('¿Ya has hecho…?')), ('Hacías', 'i', 'Питання про вже зроблене: ¿Has hecho…?')], R_MX)
    g(t, 'delayed', 'story', MX_C, 'Estábamos en el parque y, de repente, ___ a llover.', 'empezar', ['empezó'],
      [('empezaba', 'i', 'De repente вводить подію: empezó.'), ('ha empezado', 'i', 'Розповідь у минулому, de repente — подія: empezó.')], R_MX)
    g(t, 'transfer', 'message', MX_C, 'Hola, Ana: Ahora ___ en Valencia, pero el mes pasado estuve en Madrid.', 'estar, yo', ['estoy'],
      [('estaba', 'i', 'Ahora вказує на теперішнє: estoy.'), ('estuve', 'i', 'Ahora вказує на теперішнє: estoy.')], R_MX)
    g(t, 'transfer', 'message', MX_C, 'Hola, Ana: Antes siempre ___ el tren, pero este año he comprado un coche.', 'tomar, yo', ['tomaba'],
      [('tomé', 'i', 'Antes siempre — колишня звичка: tomaba.'), ('he tomado', 'i', 'Antes siempre — колишня звичка: tomaba.')], R_MX)
    ch(t, 'supported', 'meaning', MX_X, [P('Оберіть форму, яка підходить за змістом.'), PE('—¿Qué tal las vacaciones? —Muy bien. ___ a Sevilla y comimos muy bien.')],
       [('Fuimos', 'c', None), ('Íbamos', 'i', 'Одна поїздка у відпустці: fuimos.'), ('Vamos', 'i', 'Comimos — минуле: fuimos.')], R_MX)
    ch(t, 'independent', 'story', MX_X, [P('Оберіть форму, яка підходить за змістом.'), PE('Cuando sonó el despertador, yo todavía ___.')],
       [('dormí', 'i', 'Todavía — сон ще тривав: dormía.'), ('dormía', 'c', None), ('duermo', 'i', 'Sonó — минуле.')], R_MX,
       hints=[rule([MX_X], R_MX), ('translation', [], [P('El despertador — будильник.')])])
    ch(t, 'independent', 'day', MX_X, [P('Оберіть форму, яка підходить за змістом.'), PE('Este mes ___ tres libros.')],
       [('he leído', 'c', None), ('leía', 'i', 'Тут — підсумок подій цього місяця: he leído.'), ('leo', 'i', 'Підсумок уже прочитаного: he leído.')], R_MX)
    ch(t, 'delayed', 'childhood', MX_X, [P('Оберіть форму, яка підходить за змістом.'), PE('De niños, mis hermanos y yo ___ mucho en la calle.')],
       [('jugamos', 'i', 'De niños — звичка дитинства: jugábamos.'), ('hemos jugado', 'i', 'De niños — звичка дитинства: jugábamos.'),
        ('jugábamos', 'c', None)], R_MX)
    ch(t, 'transfer', 'message', MX_X, [P('Оберіть форму, яка підходить за змістом повідомлення.'),
                                        PE('Hola, Luis: ¿___ alguna vez en Granada? Es una ciudad muy bonita.')],
       [('Has estado', 'c', None), ('Estabas', 'i', 'Питання про досвід «колись у житті»: ¿Has estado…?'),
        ('Estás', 'i', 'Alguna vez — питання про досвід: ¿Has estado…?')], R_MX)
    assert len(t.tasks) == 15, len(t.tasks)
    body = lesson('A2-06-L5', 'lesson', BLOCK, 'Змішані ситуації без підказки часу', 'elección del tiempo sin etiqueta',
                  'Від парних контрастів переходимо до змішаних знайомих ситуацій: обираємо presente, perfecto, indefinido чи '
                  'imperfecto за змістом, без підказки часу.',
                  ['A2-06-O5'], [], ['routine-study-leisure', 'people-family-home', 'time-appointments-transport'], 14,
                  ['contrast.mixed-unlabelled'],
                  ['contrast.present-past', 'contrast.perfecto-indefinido.time-frame', 'contrast.perfecto-indefinido.experience-occasion',
                   'contrast.indefinido-imperfecto.background-event', 'contrast.indefinido-imperfecto.habit-event', 'imperfecto.habia',
                   'perifrasis.empezar-a'],
                  [
                      step('s1', 'explanation', 'Чотири часи — один алгоритм', True, blocks=[
                          P(R_MX),
                          BL(['Тепер, звичка тепер — presente: Normalmente me levanto a las ocho.',
                              'Період ще триває, досвід — perfecto: Hoy me he levantado a las diez.',
                              'Окрема подія в завершеному періоді — indefinido: Ayer me levanté a las seis.',
                              'Звичка чи обставина в минулому — imperfecto: De pequeño me levantaba temprano.']),
                          P('Іноді природні два варіанти — тоді приймаються обидва; незнайома змістовна відповідь лишається на перевірку.'),
                      ]),
                      step('s2', 'supported-practice', 'Практика зі зразком', True, tasks=ids(t, 'supported')),
                      step('s3', 'independent-practice', 'Самостійна практика', True, tasks=ids(t, 'independent')),
                      step('s4', 'summary', 'Підсумок', True, blocks=[BL(['Спершу зміст: тепер чи минуле?',
                                                                          'Минуле: досвід / період, що триває — perfecto; подія — indefinido; звичка чи тло — imperfecto.'])]),
                  ])
    return body, t.tasks


# ============================================================================================
# A2-06-L6 — a short account or practical reply: reading, listening, writing
# ============================================================================================

TXT_A = ('Hola, Lucía: ¿Qué tal? Yo estoy muy bien. Ahora vivo en Valencia y trabajo en una tienda de libros. Antes vivía '
         'en Madrid y trabajaba en una oficina, pero no me gustaba. El mes pasado me mudé aquí. Esta semana he conocido a '
         'mis vecinos: son muy simpáticos. Ayer fuimos juntos a la playa. Un abrazo, Marta.')
TXT_B = ('El sábado pasado fui a la montaña con mi hermano. Cuando salimos de casa, hacía sol, pero a las doce empezó a '
         'llover. Primero comimos en un bar y después volvimos a casa en autobús. Nunca he visto tanta lluvia.')
CA1 = clip('clip.a2-06.account-weekend', 'A2-06-L6', 'text',
           'El fin de semana pasado fui a Toledo con mis padres. Hacía mucho calor, así que primero visitamos la catedral. '
           'Después comimos en un restaurante pequeño y por la tarde paseamos por el centro. Volvimos a casa muy cansados.',
           'Минулих вихідних я їздив (їздила) з батьками до Толедо. Було дуже спекотно, тож спершу ми відвідали собор. '
           'Потім пообідали в маленькому ресторані, а після обіду гуляли центром. Додому повернулися дуже втомлені.',
           [LA_M, LA_D], 'weekend-trip')
CA2 = clip('clip.a2-06.account-new-job', 'A2-06-L6', 'text',
           'Este año he cambiado de trabajo. Antes trabajaba en un banco y llegaba a casa muy tarde. Ahora trabajo en un '
           'colegio, empiezo a las nueve y termino a las tres. Estoy mucho más contenta.',
           'Цього року я змінила роботу. Раніше я працювала в банку й поверталася додому дуже пізно. Тепер я працюю в '
           'школі, починаю о дев’ятій і закінчую о третій. Я набагато задоволеніша.',
           [LA_M], 'job-change')
CA3 = clip('clip.a2-06.account-lost-keys', 'A2-06-L6', 'text',
           'Ayer, cuando llegué a casa, no tenía las llaves. Llamé a mi hermana, pero no contestó. Al final, esperé una '
           'hora en un bar y luego llegó mi compañero de piso con sus llaves.',
           'Учора, коли я прийшов (прийшла) додому, у мене не було ключів. Я подзвонив (подзвонила) сестрі, але вона не '
           'відповіла. Зрештою я годину чекав (чекала) в барі, а потім прийшов мій сусід по квартирі зі своїми ключами.',
           [LA_M], 'problem')

CRIT_W = [
    'Відповідь стосується ситуації та адресата (привітання, прощання, відповідь на питання).',
    'Є і теперішнє, і минуле там, де цього вимагає зміст (тепер — presente; досвід, подія чи звичка — відповідний минулий час).',
    'Події та обставини пов’язано зрозуміло (primero, después, pero, porque).',
    'Форми дієслів і правопис, зокрема знаки наголосу, правильні; кількість часів і збіг зі зразком не вимагаються.',
]
FB_W = ('Відповідь збігається із зразком.', 'Порівняйте свій текст із критеріями та зразком.',
        'Вільний текст не перевіряється автоматично. Порівняйте його з критеріями і зразком — зразок лише приклад, а не '
        'єдина правильна відповідь. За потреби збережіть текст для зовнішньої перевірки.')


def l6():
    t = LessonTasks('A2-06-L6')
    fr = ('Правильно.', 'Ні. Перечитайте текст: відповідь є в ньому.')
    r1 = ch(t, 'supported', 'letter', RT, [P('Прочитайте лист Марти. Підказка: ahora — тепер, antes — раніше.'), PE(TXT_A), P('Де Марта живе тепер?')],
            [('у Валенсії', 'c', None), ('у Мадриді', 'i', 'У Мадриді вона жила раніше (antes vivía).'),
             ('біля пляжу в Мадриді', 'i', 'Тепер Марта живе у Валенсії: ahora vivo en Valencia.')], R_RT, fr)
    r2 = ch(t, 'independent', 'letter', RT, [PE(TXT_A), P('Що Марта зробила вчора?')],
            [('ходила із сусідами на пляж', 'c', None), ('переїхала до Валенсії', 'i', 'Переїхала вона минулого місяця (el mes pasado).'),
             ('працювала в офісі', 'i', 'В офісі вона працювала раніше, у Мадриді.')], R_RT, fr)
    r3 = ch(t, 'independent', 'letter', RT, [PE(TXT_A), P('Що сталося раніше?')],
            [('Марта познайомилася із сусідами', 'i', 'Це було цього тижня (esta semana), вже після переїзду.'),
             ('Марта переїхала до Валенсії', 'c', None),
             ('Марта пішла на пляж', 'i', 'На пляж вони пішли вчора, вже після переїзду і знайомства.')], R_RT, fr)
    ch(t, 'delayed', 'trip-story', RT, [PE(TXT_B), P('Якою була погода, коли вони виходили з дому?')],
       [('ішов дощ', 'i', 'Дощ почався о дванадцятій (empezó a llover).'), ('світило сонце', 'c', None), ('було дуже холодно', 'i', 'У тексті: hacía sol.')],
       R_RT, fr, hints=[rule([RT], R_RT), ('translation', [], [P('La montaña — гори; tanta lluvia — стільки дощу.')])])
    ch(t, 'transfer', 'trip-story', RT, [PE(TXT_B), P('Що вони зробили одразу після того, як почався дощ?')],
       [('пообідали в барі', 'c', None), ('повернулися автобусом', 'i', 'Автобусом вони повернулися потім (después).'),
        ('вийшли з дому', 'i', 'З дому вони вийшли ще до дощу.')], R_RT, fr,
       hints=[rule([RT], R_RT), ('translation', [], [P('La montaña — гори; tanta lluvia — стільки дощу.')])])
    la = ch(t, 'independent', CA1['family'], LA_M, [P('Прослухайте запис. Що вони зробили спершу?')],
            [('пообідали в ресторані', 'i', 'Обідали вони потім (después).'), ('відвідали собор', 'c', None),
             ('гуляли центром', 'i', 'Центром вони гуляли після обіду.')], '', FB_L, clips=[CA1['id']], hints=lh(LA_M, CA1))
    lb = ch(t, 'independent', CA2['family'], LA_M, [P('Прослухайте запис. О котрій жінка закінчує роботу тепер?')],
            [('дуже пізно', 'i', 'Пізно вона поверталася раніше, коли працювала в банку.'), ('о дев’ятій', 'i', 'О дев’ятій вона починає.'),
             ('о третій', 'c', None)], '', FB_L, clips=[CA2['id']], hints=lh(LA_M, CA2))
    ld = dictation(t, CA2['family'], LA_D, CA2, 'Antes trabajaba en un banco y llegaba a casa muy tarde.')
    ch(t, 'delayed', CA1['family'], LA_M, [P('Прослухайте запис. Якою була погода?')],
       [('було дуже спекотно', 'c', None), ('ішов дощ', 'i', 'У записі: hacía mucho calor.'), ('було холодно', 'i', 'У записі: hacía mucho calor.')],
       '', FB_L, clips=[CA1['id']], hints=lh(LA_M, CA1))
    ch(t, 'transfer', CA3['family'], LA_M, [P('Прослухайте запис. Чому людина не могла зайти додому?')],
       [('у неї не було ключів', 'c', None), ('сестра не відчинила двері', 'i', 'Сестра просто не відповіла на дзвінок.'),
        ('вона була в барі з сусідом', 'i', 'У барі вона чекала сама, поки не прийшов сусід.')], '', FB_L, clips=[CA3['id']], hints=lh(LA_M, CA3))
    w = [WA]
    ex1 = ('Hola, Marta: ¡Qué bien! Yo también estoy bien. Ahora trabajo en casa, pero antes trabajaba en una oficina. '
           'Esta semana he estado muy ocupado y ayer fui al cine con Ana. Un abrazo.')
    w1 = t.rubric('supported', 'reply', w,
                  [P('Відповідайте на лист Марти (3–5 речень): що ви робите тепер, як було раніше і що цікавого сталося '
                     'цього тижня або вчора.'), PE(TXT_A)],
                  CRIT_W, [ex1], [rule(w, R_WA), ('reveal', w, [P('Приклад відповіді (не єдиний можливий):'), PE(ex1)])], FB_W, ex1)
    ex2 = ('El sábado pasado fui a la playa con mis amigos. Hacía mucho sol y había mucha gente. Primero nadamos y después '
           'comimos en un bar. Nunca he comido un pescado tan bueno.')
    w2 = t.rubric('independent', 'account', w,
                  [P('Напишіть коротку розповідь (4–5 речень) про вихідні: куди ви ходили, якою була погода, що ви робили '
                     'спершу і потім.')],
                  CRIT_W, [ex2], [rule(w, R_WA), ('reveal', w, [P('Приклад відповіді (не єдиний можливий):'), PE(ex2)])], FB_W, ex2)
    ex3 = ('Hola, Pablo: Perdona, no he contestado porque esta semana he tenido mucho trabajo. Ayer, cuando volví a casa, eran '
           'las diez y estaba muy cansada. ¿Tomamos un café el sábado? Un beso.')
    t.rubric('delayed', 'reply', w,
             [P('Друг пише: «¿Por qué no contestas mis mensajes?». Напишіть відповідь (3–5 речень): поясніть, що було цього '
                'тижня і вчора, і запропонуйте зустрітися.')],
             CRIT_W, [ex3], [rule(w, R_WA), ('reveal', w, [P('Приклад відповіді (не єдиний можливий):'), PE(ex3)])], FB_W, ex3)
    ex4 = ('Antes vivía en un pueblo y trabajaba en el campo. Hace dos años me mudé a Madrid. Ahora trabajo en una tienda '
           'y vivo cerca del centro. Me gusta mucho mi nueva vida.')
    t.rubric('transfer', 'life-change', w,
             [P('Напишіть 4–5 речень про зміну у своєму житті: як було раніше, що сталося і як ви живете тепер.')],
             CRIT_W, [ex4], [rule(w, R_WA), ('reveal', w, [P('Приклад відповіді (не єдиний можливий):'), PE(ex4)])], FB_W, ex4)
    assert len(t.tasks) == 14, len(t.tasks)
    body = lesson('A2-06-L6', 'lesson', BLOCK, 'Розповідь і відповідь: читаємо, слухаємо, пишемо', 'relato y respuesta',
                  'Читаємо й слухаємо короткі розповіді, де змішано теперішнє й минуле, визначаємо порядок подій, а потім '
                  'пишемо зв’язну розповідь або відповідь на лист.',
                  ['A2-06-O6', 'A2-06-O7'], [], ['personal-messages', 'routine-study-leisure'], 18,
                  ['reading.time-relationship', 'listening.past-account', 'writing.connected-account-reply'],
                  ['contrast.mixed-unlabelled', 'contrast.present-past', 'listening.time-reference', 'listening.past-memory',
                   'writing.past-routine-memory', 'link.past-sequence', 'link.sequence'],
                  [
                      step('s1', 'explanation', 'Як читати й писати розповідь', True, blocks=[
                          P(R_RT + ' Слова primero, después, luego, al final показують порядок подій.'),
                          P(R_WA + ' Кількість часів і збіг зі зразком не важливі — важливі зміст і зрозумілість.'),
                      ]),
                      step('s2', 'reading', 'Читання: лист Марти', True, blocks=[PE(TXT_A)], tasks=[r1, r2, r3]),
                      step('s3', 'listening', 'Аудіювання: короткі розповіді', True, clips=[CA1['id'], CA2['id']], tasks=[la, lb]),
                      step('s4', 'listening', 'Диктант (необов’язково)', False, clips=[CA2['id']], tasks=[ld]),
                      step('s5', 'writing', 'Письмо: розповідь або відповідь', True, tasks=[w1, w2]),
                      step('s6', 'summary', 'Підсумок', True, blocks=[BL([
                          'Розуміння тексту і письмо — окремі вміння.',
                          'У розповіді: тепер — presente, досвід — perfecto, події — indefinido, тло й звички — imperfecto.'])]),
                  ])
    return body, t.tasks


# ============================================================================================
# A2-06-C1 — optional mixed check
# ============================================================================================

def c1():
    t = LessonTasks('A2-06-C1')
    fam = 'check'
    g(t, 'independent', fam, PP_C, 'Antes no me ___ el café, pero ahora lo tomo todos los días.', 'gustar', ['gustaba'],
      [('gusta', 'i', 'Antes вказує на минуле: gustaba.'), ('gustó', 'i', 'Тут — колишнє ставлення, а не одна подія: gustaba.')], R_PP)
    g(t, 'independent', fam, TF_C, 'Esta mañana he desayunado en casa, pero ayer ___ en un bar.', 'desayunar, yo', ['desayuné'],
      [('he desayunado', 'i', 'Учорашній день уже минув: desayuné.')], R_TF)
    g(t, 'independent', fam, EO_C, '—¿___ alguna vez paella? —Sí, muchas veces.', 'comer, tú', ['Has comido'],
      [('Comiste', 'u', NORM.format('¿Has comido alguna vez…?'))], R_EO)
    g(t, 'independent', fam, HE_C, 'Cuando trabajaba en Bilbao, ___ al trabajo en bicicleta.', 'ir, yo', ['iba'],
      [('fui', 'i', 'Звичка того періоду: iba.')], R_HE)
    g(t, 'independent', fam, MX_C, 'El año pasado ___ a mis abuelos en Ucrania.', 'visitar, yo', ['visité'],
      [('he visitado', 'i', 'Минулий рік завершився: visité.'), ('visitaba', 'u', 'Visitaba означало б регулярні відвідини; про одну поїздку — visité.')], R_MX)
    ch(t, 'independent', fam, FI_X, [P('Яка форма — імперфект від ir?')],
       [('fue', 'i', 'Fue — це форма indefinido.'), ('iba', 'c', None), ('ha ido', 'i', 'Ha ido — це форма perfecto.')], R_FI)
    ch(t, 'independent', fam, NP_X, [P('Коли відбувається дія?'), PE('Anoche cenamos en casa de Luis.')],
       [('учора ввечері', 'c', None), ('щовечора', 'i', 'Anoche — учора ввечері, один раз.'), ('сьогодні ввечері', 'i', 'Anoche — учора ввечері.')], R_NP)
    ch(t, 'independent', fam, HE_X, [P('Оберіть форму, яка підходить за змістом.'), PE('De niño, mi padre ___ mucho al fútbol.')],
       [('jugó', 'i', 'De niño — звичка дитинства: jugaba.'), ('jugaba', 'c', None), ('juega', 'i', 'De niño вказує на минуле.')], R_HE)
    ch(t, 'independent', fam, MX_X, [P('Оберіть форму, яка підходить за змістом.'), PE('—¿Has terminado el libro? —No, todavía no lo ___.')],
       [('he terminado', 'c', None), ('terminaba', 'i', 'Todavía no — досвід до цього моменту: no lo he terminado.'),
        ('terminé', 'i', 'Відповідь на ¿Has terminado…? з todavía no — no lo he terminado.')], R_MX)
    assert len(t.tasks) == 9, len(t.tasks)
    pool = [PP_X, PP_C, TF_X, TF_C, EO_X, EO_C, HE_X, HE_C, FI_X, NP_X, MX_X, MX_C, RT, LT_M, LA_M]
    body = lesson('A2-06-C1', 'optional-check', BLOCK, 'Перевірка: вибір часу (необов’язково)', 'presente y pasados: comprobación',
                  'Необов’язкова змішана перевірка блоку без підказки часу: тепер чи раніше, perfecto чи indefinido, звичка чи '
                  'подія, схожі форми. Без блокувань і загальної оцінки.',
                  ['A2-06-O1', 'A2-06-O2', 'A2-06-O3', 'A2-06-O4', 'A2-06-O5', 'A2-06-O6', 'A2-06-O7'], [],
                  ['routine-study-leisure'], 10, [],
                  ['contrast.present-past', 'contrast.perfecto-indefinido.time-frame', 'contrast.perfecto-indefinido.experience-occasion',
                   'contrast.indefinido-imperfecto.habit-event', 'contrast.indefinido-imperfecto.background-event',
                   'contrast.past-form-identification', 'contrast.nosotros-present-indefinido', 'contrast.mixed-unlabelled',
                   'reading.time-relationship', 'listening.time-reference', 'listening.past-account', 'writing.connected-account-reply',
                   'imperfecto.regular-ar.singular', 'imperfecto.regular-ar.plural', 'imperfecto.regular-er-ir.singular',
                   'imperfecto.regular-er-ir.plural', 'imperfecto.ser', 'imperfecto.ir', 'imperfecto.ver', 'imperfecto.use-habit',
                   'imperfecto.use-description', 'imperfecto.use-background'],
                  [
                      step('s1', 'explanation', 'Про перевірку', False, blocks=[P(
                          'Ця перевірка необов’язкова: вона не блокує наступних уроків і не ставить загальної оцінки. Час у '
                          'завданнях не підказано — вирішуйте за змістом. Підказки доступні, але враховуються як допомога.')]),
                      step('s2', 'self-check', 'Змішані ситуації', False, tasks=ids(t, 'independent')),
                      step('s3', 'self-check', 'Ще завдання з банку повторення', False, blocks=[
                          P('Ще кілька завдань, яких не було в уроках: застосунок добирає їх із відкладеного банку цього блоку.'),
                          LINK('Змішане повторення: вибір часу', pool, 'mixed', 10)]),
                  ])
    return body, t.tasks


def MATERIALS():
    keys = [PP_C, TF_C, EO_C, HE_C, MX_C]
    return [material('material.a2-06.tense-choice', 'A2-06', 'Як обрати час: теперішній, perfecto, indefinido, imperfecto', [
        P(R_MX),
        TB(['situación', 'tiempo', 'ejemplo'],
           [['ahora, normalmente', 'presente', 'Normalmente me levanto a las ocho.'],
            ['hoy, esta semana; alguna vez, ya', 'perfecto', 'Hoy me he levantado a las diez.'],
            ['ayer, en 2019; un caso concreto', 'indefinido', 'Ayer me levanté a las seis.'],
            ['antes, de pequeño; hábito o fondo', 'imperfecto', 'De pequeño me levantaba temprano.']]),
        P('Мітки в таблиці — лише орієнтир: вирішує вся ситуація, а не одне слово.'),
        LINK('Потренувати вибір часу', keys, 'written', 10)], keys)]


def build():
    return {
        'block': BLOCK,
        'lessons': [l1(), l2(), l3(), l4(), l5(), l6(), c1()],
        'clips': [CT1, CT2, CT3, CA1, CA2, CA3],
        'materials': MATERIALS(),
        'skill_patches': {},
        'lexicon_updates': {},
        'lexicon_additions': [],
    }
