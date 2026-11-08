"""A2-05-L5 — describing a past person, place or situation: age, weather, state/location, había, clock time
(CV-04 present-to-past handoff)."""
from build import BL, EX, LINK, P, PE, TB, LessonTasks, lesson, material, reveal, rule, step
from a2_05 import BLOCK, ftask, stask
from a2_05_l2 import IA, R_IA, acc_missing

UD_C = 'imperfecto.use-description/construction-use'
UD_X = 'imperfecto.use-description/context-choice'
AGE = 'imperfecto.age-tenia/construction-use'
WE_C = 'imperfecto.weather/construction-use'
WE_R = 'imperfecto.weather/reading-meaning'
ES = 'imperfecto.estar-state/construction-use'
HA_W = 'imperfecto.habia/written-form'
HA_C = 'imperfecto.habia/construction-use'
ST_C = 'imperfecto.ser-time-setting/construction-use'
ST_R = 'imperfecto.ser-time-setting/reading-meaning'

R_AGE = ('Вік іспанською «мають»: tener + число + años. Про вік у минулому — імперфект: tenía, tenías, tenía, '
         'teníamos, teníais, tenían + años.')
R_WE = ('Погоду в минулому описуємо в 3-й особі однини імперфекту — безособово: hacía calor / frío / sol / viento, '
        'llovía, nevaba, estaba nublado; або з підметом el cielo («небо»): el cielo estaba nublado — стан неба.')
R_ES = ('Де хтось був або в якому стані — estar в імперфекті: estaba, estabas, estaba, estábamos, estabais, estaban. '
        'Прикметник узгоджується з підметом: estaba cansada.')
R_HA = ('Hay (є, наявне) в описі минулого стає había — одна форма для однини й множини: había un parque, había dos '
        'parques. Коли повідомляємо, що щось було (існувало) в місці, кажемо había; estar кажуть про розташування вже '
        'відомого: La farmacia estaba cerca de mi casa.')
R_ST = ('Котра була година чи яка пора — ser в імперфекті: era la una (однина), eran las diez (множина), era de noche, '
        'era tarde, era temprano.')
R_UD = ('Щоб описати, якими були люди, речі й місця в минулому, вживаємо імперфект: era, tenía, estaba, había. Опис '
        'відповідає на питання «яким було?», а не «що сталося?».')

INSTR_USE = ('Доповніть речення правильною формою дієслова в дужках. Усі речення — про минуле: мовець описує, яким усе було тоді '
             '(обставини, стан, тло), а не підсумовує завершений період. Час не підказано: вирішіть за змістом.')
INSTR_USE2 = ('Напишіть речення повністю, вставивши правильні форми дієслів у дужках. Усі речення — про минуле: мовець описує, яким усе було тоді '
              '(обставини, стан, тло), а не підсумовує завершений період. Час не підказано: вирішіть за змістом.')
INSTR_HAY = ('Доповніть опис потрібною формою дієслова haber: мовець розповідає про минуле й повідомляє, що було '
             '(існувало) в цьому місці.')

NOW_THEN = TB(
    ['ahora', 'antes'],
    [
        ['Tengo treinta años.', 'Tenía diez años.'],
        ['Hace frío. Llueve.', 'Hacía frío. Llovía.'],
        ['Está nublado.', 'Estaba nublado.'],
        ['Estoy cansado. Ana está en casa.', 'Estaba cansado. Ana estaba en casa.'],
        ['Hay un parque. Hay dos parques.', 'Había un parque. Había dos parques.'],
        ['Es la una. Son las diez.', 'Era la una. Eran las diez.'],
        ['Es de noche. Es tarde.', 'Era de noche. Era tarde.'],
    ],
)


def x(t, role, fam, keys, sent, verb, ans, errs, rules, **kw):
    return ftask(t, role, fam, keys, sent, verb, ans, errs, rules, instr=kw.pop('instr', INSTR_USE), **kw)


def l5():
    t = LessonTasks('A2-05-L5')
    rA = [((AGE,), R_AGE), ((IA,), R_IA)]
    rW = [((WE_C,), R_WE), ((IA,), R_IA)]
    rE = [((ES,), R_ES)]
    rH = [((HA_W,), R_HA), ((IA,), R_IA)]
    rH3 = [((HA_W, HA_C), R_HA), ((IA,), R_IA)]
    rT = [((ST_C,), R_ST)]
    rD = [((UD_C,), R_UD)]
    H3 = [HA_W, HA_C, IA]
    age_tense = 'Для віку в певний момент минулого вживаємо імперфект: {}.'
    age_have = 'Вік іспанською «мають»: {}, а не ser.'

    # ---------------- supported ----------------
    sup = [
        x(t, 'supported', 'family-past', [AGE, IA], 'En aquella época, mi hija ___ cinco años.', 'tener', 'tenía',
          [('tenia', 'ci', acc_missing('tenía')),
           ('era', 'iu', age_have.format('tenía cinco años')),
           ('tiene', 'iu', 'Tiene — теперішній час, а en aquella época вказує на минуле: tenía.'),
           ('tuvo', 'iu', age_tense.format('tenía'))],
          rA, model='Зразок: Ahora tengo treinta años. → En 2010 tenía catorce años.'),
        stask(t, 'supported', 'summer-memory', [AGE, WE_C], 'Aquel verano yo {a} diez años y {b} mucho calor en el pueblo.', 'tener, hacer',
              {'a': (AGE, ['tenía'], [('era', age_have.format('tenía diez años')),
                                       ('tuve', age_tense.format('tenía'))]),
               'b': (WE_C, ['hacía'], [('hizo', 'Тут описано, якою була погода того літа: hacía calor.'),
                                                ('estaba', 'З calor про погоду вживаємо hacer: hacía calor.'),
                                                ('tenía', 'Tener calor — відчуття людини. Про погоду: hacía calor.')])},
              [((AGE,), R_AGE), ((WE_C,), R_WE)], instr=INSTR_USE2,
              model='Зразок: Aquel invierno mi hermano tenía seis años y hacía mucho frío.'),
        x(t, 'supported', 'summer-memory', [WE_C, IA], 'En el pueblo, en verano, siempre ___ mucho calor.', 'hacer', 'hacía',
          [('hacia', 'ci', acc_missing('hacía') + ' Hacia без знака — інше слово («до, у напрямку»).'),
           ('hace', 'iu', 'Hace — теперішній час, а тут ідеться про колишні літа: hacía.'),
           ('hizo', 'iu', 'Тут описано, якою зазвичай була погода влітку: hacía calor.'),
           ('estaba', 'iu', 'З calor про погоду вживаємо hacer: hacía calor.'),
           ('tenía', 'iu', 'Tener calor — відчуття людини («мені жарко»). Про погоду: hacía calor.')],
          rW, model='Зразок: Hoy hace frío. → Aquel invierno hacía mucho frío.'),
        x(t, 'supported', 'family-past', [ES], 'Antes mi madre siempre ___ cansada porque trabajaba mucho.', 'estar', 'estaba',
          [('era', 'i', 'Стан людини передає estar: estaba cansada.'),
           ('está', 'i', 'Está — теперішній час, а antes вказує на минуле: estaba.')],
          rE, model='Зразок: Ahora estoy bien. → Antes estaba muy cansado.'),
        stask(t, 'supported', 'home-arrival', [ST_C, ES], 'Cuando llegué a casa, {a} las diez y mis padres {b} en la cocina.', 'ser, estar',
              {'a': (ST_C, ['eran'], [('era', 'З годинами, крім la una, — множина: eran las diez.'),
                                       ('fueron', 'Котра була година — це обставина: eran las diez.'),
                                       ('son', 'Son — теперішній час. У минулому: eran las diez.')]),
               'b': (ES, ['estaban'], [('eran', 'Де хтось перебуває — estar: estaban en la cocina.'),
                                        ('estuvieron', 'Тут описано, де були батьки в той момент: estaban.'),
                                        ('están', 'Están — теперішній час. У минулому: estaban.')])},
              [((ST_C,), R_ST), ((ES,), R_ES)], instr=INSTR_USE2,
              model='Зразок: Cuando salí, era la una y Ana estaba en la oficina.'),
        x(t, 'supported', 'street-before', [HA_W, IA], 'Antes en mi calle ___ dos tiendas y un bar.', 'haber', 'había',
          [('habia', 'ci', acc_missing('había')),
           ('habían', 'iu', 'Había не змінюється за числом: había dos tiendas. (Форма habían тут ненормативна.)'),
           ('hay', 'iu', 'Hay — теперішній час. У минулому: había.'),
           ('hubo', 'iu', 'Hubo — pretérito indefinido. Для опису того, що було в місці, вживаємо había.')],
          rH, model='Зразок: Hoy hay un supermercado en mi calle. → Antes había una tienda pequeña.'),
        x(t, 'supported', 'village', H3, 'En mi pueblo ___ un río y muchos árboles.', None, 'había',
          [('habia', 'cci', acc_missing('había')),
           ('habían', 'icu', 'Había не змінюється за числом: había muchos árboles. (Форма habían тут ненормативна.)'),
           ('hay', 'iiu', 'Hay — теперішній час. В описі минулого: había.'),
           ('estaban', 'uiu', 'Тут потрібна форма haber: повідомляємо, що щось було (існувало) в цьому місці. Estar кажуть про розташування вже відомого: La farmacia estaba cerca de mi casa.')],
          rH3, instr=INSTR_HAY, model='Зразок: En mi barrio había un parque y dos tiendas.'),
        x(t, 'supported', 'dinner', [ST_C], 'Cuando terminamos la cena, ___ las once.', 'ser', 'eran',
          [('era', 'i', 'З годинами, крім la una, — множина: eran las once.'),
           ('son', 'i', 'Son — теперішній час. У минулому: eran.'),
           ('fueron', 'i', 'Котра була година — це обставина: eran las once.'),
           ('estaban', 'i', 'Час кажемо через ser: eran las once.')],
          rT, model='Зразок: Ahora son las diez. → Cuando llegué, eran las diez.'),
        stask(t, 'supported', 'grandparents', [UD_C], 'Cuando yo era pequeño, mi abuelo {a} muy alto y {b} el pelo negro.', 'ser, tener',
              {'a': (UD_C, ['era'], [('es', 'Es — теперішній час, а cuando yo era pequeño вказує на минуле: era.'),
                                      ('fue', 'Для опису, яким був дідусь, — імперфект: era.')]),
               'b': (UD_C, ['tenía'], [('tiene', 'Tiene — теперішній час. В описі минулого: tenía.'),
                                        ('tuvo', 'Для опису зовнішності в минулому — імперфект: tenía.')])},
              rD, instr=INSTR_USE2, model='Зразок: Mi abuela era baja y tenía el pelo blanco.'),
    ]

    # ---------------- independent (core) ----------------
    core = [
        x(t, 'independent', 'school-start', [AGE, IA], '¿Cuántos años ___ cuando empezaste el colegio?', 'tener, tú', 'tenías',
          [('tenias', 'ci', acc_missing('tenías')),
           ('tuviste', 'iu', age_tense.format('tenías')),
           ('eras', 'iu', age_have.format('tenías')),
           ('tienes', 'iu', 'Tienes — теперішній час; йдеться про момент у минулому: tenías.')],
          rA),
        x(t, 'independent', 'north-winter', [WE_C, IA], 'En Bilbao, en invierno, ___ mucho y siempre necesitábamos un paraguas.', 'llover', 'llovía',
          [('llovia', 'ci', acc_missing('llovía')),
           ('lluvía', 'iu', 'Чергування o → ue (llueve) в імперфект не переходить: llovía.'),
           ('llueve', 'iu', 'Llueve — теперішній час. У минулому: llovía.'),
           ('llovió', 'iu', 'Тут описано, якою зазвичай була погода (siempre necesitábamos): llovía.')],
          rW),
        x(t, 'independent', 'work-arrival', [ES], 'Cuando llegué a la oficina, Luis no ___ allí.', 'estar', 'estaba',
          [('era', 'i', 'Де хтось перебуває — estar: estaba.'),
           ('estuvo', 'i', 'Тут описано ситуацію в момент приходу: estaba.'),
           ('está', 'i', 'Está — теперішній час. У минулому: estaba.')],
          rE),
        x(t, 'independent', 'street-before', H3, 'Antes en el centro no ___ muchos coches.', None, 'había',
          [('habia', 'cci', acc_missing('había')),
           ('habían', 'icu', 'Había не змінюється за числом: había muchos coches. (Форма habían тут ненормативна.)'),
           ('hay', 'iiu', 'Hay — теперішній час, а antes вказує на минуле: había.'),
           ('estaban', 'uiu', 'Тут потрібна форма haber: повідомляємо, що щось було (існувало) в цьому місці. Estar кажуть про розташування вже відомого: La farmacia estaba cerca de mi casa.')],
          rH3, instr=INSTR_HAY),
        x(t, 'independent', 'bus', [ST_C], '___ la una cuando llegó el autobús.', 'ser', 'Era',
          [('Eran', 'i', 'З la una — однина: era la una.'),
           ('Fue', 'i', 'Котра була година — це обставина: era la una.'),
           ('Es', 'i', 'Es — теперішній час. У минулому: era.')],
          rT),
        t.choice('independent', 'pharmacy', [HA_C],
                 [P('Як сказати «Раніше біля мого дому була аптека»?')],
                 [('Antes estaba una farmacia cerca de mi casa.', 'i', 'Тут повідомляємо, що аптека була (існувала), — це нова інформація, тому había. Estar кажуть про розташування вже відомого: La farmacia estaba cerca de mi casa.'),
                  ('Antes había una farmacia cerca de mi casa.', 'c', None),
                  ('Antes era una farmacia cerca de mi casa.', 'i', 'Ser тут не підходить: про наявність — había.')],
                 [rule([HA_C], R_HA)],
                 ('Правильно: había una farmacia.', 'Ні. Про наявність кажемо había: Antes había una farmacia cerca de mi casa.')),
        t.choice('independent', 'clock', [ST_C],
                 [P('Як сказати «Була восьма ранку»?')],
                 [('Era las ocho de la mañana.', 'i', 'З годинами, крім la una, — множина: eran las ocho.'),
                  ('Estaban las ocho de la mañana.', 'i', 'Час кажемо через ser: eran las ocho.'),
                  ('Eran las ocho de la mañana.', 'c', None)],
                 [rule([ST_C], R_ST)],
                 ('Правильно: Eran las ocho de la mañana.', 'Ні. Правильно: Eran las ocho de la mañana.')),
        t.choice('independent', 'house', [UD_X],
                 [P('Яке речення описує, яким був будинок?')],
                 [('La casa era pequeña y tenía un jardín.', 'c', None),
                  ('Compramos una casa pequeña con jardín.', 'i', 'Це подія (ми купили будинок), а не опис.'),
                  ('La casa es pequeña y tiene un jardín.', 'i', 'Це опис у теперішньому часі.')],
                 [rule([UD_X], R_UD)],
                 ('Правильно: era, tenía — опис у минулому.', 'Ні. Опис у минулому — La casa era pequeña y tenía un jardín.')),
        t.choice('independent', 'winter', [WE_R],
                 [PE('Aquel invierno hacía mucho frío y nevaba mucho.'), P('Якою була погода тієї зими?')],
                 [('було тепло й сонячно', 'i', 'Hacía mucho frío — було дуже холодно.'),
                  ('було дуже холодно і часто йшов сніг', 'c', None),
                  ('щодня йшов дощ', 'i', 'Nevaba — ішов сніг, а не дощ.')],
                 [rule([WE_R], R_WE)],
                 ('Правильно.', 'Ні. Hacía mucho frío — було дуже холодно; nevaba mucho — часто йшов сніг.')),
        t.choice('independent', 'evening', [ST_R],
                 [PE('Eran las diez de la noche y mis padres estaban en casa.'), P('О котрій це було?')],
                 [('о десятій ранку', 'i', 'De la noche — вечора, а не ранку.'),
                  ('о другій ночі', 'i', 'У тексті: eran las diez — була десята.'),
                  ('о десятій вечора', 'c', None)],
                 [rule([ST_R], R_ST)],
                 ('Правильно: eran las diez de la noche — була десята вечора.', 'Ні. Eran las diez de la noche — була десята вечора.')),
        x(t, 'independent', 'people', [UD_C], 'Cuando la conocí, Marta ___ el pelo largo y rizado.', 'tener', 'tenía',
          [('tuvo', 'i', 'Для опису зовнішності в минулому — імперфект: tenía.'),
           ('tiene', 'i', 'Tiene — теперішній час. В описі минулого: tenía.'),
           ('era', 'i', 'Волосся «мають»: tenía el pelo largo.')],
          rD),
    ]

    # ---------------- independent (optional extra) ----------------
    extra = [
        x(t, 'independent', 'moving', [AGE, IA], 'Cuando llegamos a Madrid, nosotros ___ veinte años.', 'tener', 'teníamos',
          [('teniamos', 'ci', acc_missing('teníamos')),
           ('tuvimos', 'iu', age_tense.format('teníamos')),
           ('éramos', 'iu', age_have.format('teníamos')),
           ('tenemos', 'iu', 'Tenemos — теперішній час; йдеться про момент у минулому: teníamos.')],
          rA),
        x(t, 'independent', 'family-past', [AGE, IA], 'En 1990 mis padres ___ treinta años.', 'tener', 'tenían',
          [('tenian', 'ci', acc_missing('tenían')),
           ('tuvieron', 'iu', age_tense.format('tenían')),
           ('eran', 'iu', age_have.format('tenían')),
           ('tienen', 'iu', 'Tienen — теперішній час, а en 1990 вказує на минуле: tenían.')],
          rA),
        stask(t, 'independent', 'first-job', [AGE, ES], 'Cuando empecé a trabajar, yo {a} veinte años y {b} muy contento.', 'tener, estar',
              {'a': (AGE, ['tenía'], [('tuve', age_tense.format('tenía')),
                                       ('era', age_have.format('tenía'))]),
               'b': (ES, ['estaba'], [('era', 'Стан (contento) передає estar: estaba.'),
                                       ('estuve', 'Тут описано стан у той період: estaba.')])},
              [((AGE,), R_AGE), ((ES,), R_ES)], instr=INSTR_USE2),
        x(t, 'independent', 'evening-out', [WE_C, IA], 'Cuando salimos del cine, ___ mucho viento.', 'hacer', 'hacía',
          [('hacia', 'ci', acc_missing('hacía')),
           ('hace', 'iu', 'Hace — теперішній час. У минулому: hacía.'),
           ('hizo', 'iu', 'Тут описано погоду в момент, коли ми виходили: hacía viento.')],
          rW),
        x(t, 'independent', 'morning', [WE_C], 'Cuando me levanté, el cielo ___ nublado.', 'estar', 'estaba',
          [('era', 'i', 'Про хмарне небо кажемо estar: estaba nublado.'),
           ('está', 'i', 'Está — теперішній час. У минулому: estaba.'),
           ('estuvo', 'i', 'Тут описано, яким було небо в момент, коли я встав (встала): estaba.')],
          [((WE_C,), R_WE)]),
        stask(t, 'independent', 'arrival', [ST_C, WE_C], 'Cuando llegamos al pueblo, {a} de noche y {b} mucho frío.', 'ser, hacer',
              {'a': (ST_C, ['era'], [('fue', 'Пора доби — обставина: era de noche.'),
                                      ('es', 'Es — теперішній час. У минулому: era.'),
                                      ('estaba', 'Пору доби кажемо через ser: era de noche.')]),
               'b': (WE_C, ['hacía'], [('hizo', 'Тут описано погоду в момент приїзду: hacía frío.'),
                                        ('tenía', 'Tener frío — відчуття людини. Про погоду: hacía frío.')])},
              [((ST_C,), R_ST), ((WE_C,), R_WE)], instr=INSTR_USE2),
        x(t, 'independent', 'pharmacy', [ES], 'Cuando llegué, la farmacia ___ cerrada.', 'estar', 'estaba',
          [('era', 'i', 'Відчинено чи зачинено — це стан: estaba cerrada.'),
           ('estuvo', 'i', 'Тут описано стан у момент приходу: estaba.'),
           ('está', 'i', 'Está — теперішній час. У минулому: estaba.')],
          rE),
        stask(t, 'independent', 'birthday', [HA_C, ES], 'Cuando llegué al cumpleaños de Ana, {a} mucha gente y todos {b} muy contentos.', 'haber, estar',
              {'a': (HA_C, ['había'], [('habían', 'Había не змінюється за числом: había mucha gente.'),
                                        ('hubo', 'Тут описано, що було, коли я прийшов (прийшла): había.'),
                                        ('estaba', 'Про наявність кажемо haber: había mucha gente.')]),
               'b': (ES, ['estaban'], [('eran', 'Стан (contentos) передає estar: estaban.'),
                                        ('estuvieron', 'Тут описано стан у момент приходу: estaban.')])},
              [((HA_C,), R_HA), ((ES,), R_ES)], instr=INSTR_USE2),
        x(t, 'independent', 'class', H3, 'En la clase ___ veinte estudiantes y una profesora muy simpática.', None, 'había',
          [('habia', 'cci', acc_missing('había')),
           ('habían', 'icu', 'Había не змінюється за числом: había veinte estudiantes. (Форма habían тут ненормативна.)'),
           ('hay', 'iiu', 'Hay — теперішній час. В описі минулого: había.'),
           ('estaban', 'uiu', 'Тут потрібна форма haber: повідомляємо, що щось було (існувало) в цьому місці. Estar кажуть про розташування вже відомого: La farmacia estaba cerca de mi casa.')],
          rH3, instr=INSTR_HAY),
        x(t, 'independent', 'concert', [ST_C], 'Cuando salimos del concierto, ___ muy tarde.', 'ser', 'era',
          [('fue', 'i', 'Пора — обставина: era tarde.'),
           ('estaba', 'i', 'Про пору кажемо ser: era tarde.'),
           ('es', 'i', 'Es — теперішній час. У минулому: era.')],
          rT),
        stask(t, 'independent', 'house', [UD_C], 'Cuando vivíamos en Toledo, nuestra casa {a} pequeña, pero {b} una terraza muy bonita.', 'ser, tener',
              {'a': (UD_C, ['era'], [('es', 'Es — теперішній час, а cuando vivíamos вказує на минуле: era.'),
                                      ('fue', 'Для опису будинку в минулому — імперфект: era.')]),
               'b': (UD_C, ['tenía'], [('tiene', 'Tiene — теперішній час. В описі минулого: tenía.'),
                                        ('tuvo', 'Для опису в минулому — імперфект: tenía.')])},
              rD, instr=INSTR_USE2),
        t.choice('independent', 'grandparents', [UD_X],
                 [P('Оберіть форму, яка підходить за змістом. Мовець описує, якою була бабуся тоді.'), PE('Cuando yo era pequeña, mi abuela ___ el pelo largo.')],
                 [('tuvo', 'i', 'Tuvo підсумовує стан як завершене ціле. Для опису, якою була людина тоді, — імперфект: tenía.'),
                  ('tenía', 'c', None),
                  ('tiene', 'i', 'Tiene — теперішній час, а cuando yo era pequeña вказує на минуле.')],
                 [rule([UD_X], R_UD)],
                 ('Правильно: tenía — опис у минулому.', 'Ні. Для опису в минулому — tenía.')),
        t.choice('independent', 'morning', [WE_R],
                 [PE('Cuando salí de casa, estaba nublado, pero no llovía.'), P('Якою була погода?')],
                 [('ішов дощ', 'i', 'No llovía — дощу не було.'),
                  ('було хмарно, але без дощу', 'c', None),
                  ('було ясно й сонячно', 'i', 'Estaba nublado — було хмарно.')],
                 [rule([WE_R], R_WE)],
                 ('Правильно.', 'Ні. Estaba nublado — було хмарно; no llovía — дощу не було.')),
        t.choice('independent', 'night', [ST_R],
                 [PE('Era muy tarde y no había autobuses.'), P('Яка була пора?')],
                 [('був ранок', 'i', 'Era muy tarde — було дуже пізно.'),
                  ('було дуже пізно', 'c', None),
                  ('був полудень', 'i', 'Era muy tarde — було дуже пізно.')],
                 [rule([ST_R], R_ST)],
                 ('Правильно: era muy tarde — було дуже пізно.', 'Ні. Era muy tarde — було дуже пізно.')),
    ]

    # ---------------- held-out (delayed / transfer) ----------------
    x(t, 'delayed', 'family-past', [AGE, IA], 'Mi abuelo empezó a trabajar cuando ___ quince años.', 'tener', 'tenía',
      [('tenia', 'ci', acc_missing('tenía')),
       ('tuvo', 'iu', age_tense.format('tenía')),
       ('era', 'iu', age_have.format('tenía'))],
      rA)
    x(t, 'delayed', 'school-start', [AGE, IA], 'Cuando fuimos a París, mi hermana y yo ___ seis años.', 'tener', 'teníamos',
      [('teniamos', 'ci', acc_missing('teníamos')),
       ('tuvimos', 'iu', age_tense.format('teníamos')),
       ('éramos', 'iu', age_have.format('teníamos'))],
      rA)
    x(t, 'transfer', 'house-move', [AGE, IA], 'Cuando mis padres compraron la casa, yo ___ dos años.', 'tener', 'tenía',
      [('tenia', 'ci', acc_missing('tenía')),
       ('tuve', 'iu', age_tense.format('tenía')),
       ('era', 'iu', age_have.format('tenía'))],
      rA)
    stask(t, 'transfer', 'first-class', [HA_C, AGE], 'En mi primera clase de español {a} veinte estudiantes y yo {b} treinta años.', 'haber, tener',
          {'a': (HA_C, ['había'], [('habían', 'Había не змінюється за числом: había veinte estudiantes.'),
                                    ('estaban', 'Про наявність кажемо haber: había.')]),
           'b': (AGE, ['tenía'], [('era', age_have.format('tenía')),
                                   ('tuve', age_tense.format('tenía'))])},
          [((HA_C,), R_HA), ((AGE,), R_AGE)], instr=INSTR_USE2)
    x(t, 'delayed', 'village-winter', [WE_C], 'En el pueblo de mis abuelos, en invierno, siempre ___.', 'nevar', 'nevaba',
      [('nieva', 'i', 'Nieva — теперішній час. У минулому: nevaba.'),
       ('nevó', 'i', 'Тут описано, якою зазвичай була зима: nevaba.'),
       ('nievaba', 'i', 'Чергування e → ie (nieva) в імперфект не переходить: nevaba.')],
      [((WE_C,), R_WE)])
    x(t, 'delayed', 'morning', [WE_C, IA], 'Cuando salí de casa, ___ sol, pero hacía frío.', 'hacer', 'hacía',
      [('hacia', 'ci', acc_missing('hacía')),
       ('hizo', 'iu', 'Тут описано погоду в момент, коли я виходив (виходила): hacía sol.'),
       ('hace', 'iu', 'Hace — теперішній час. У минулому: hacía.')],
      rW)
    x(t, 'transfer', 'travel', [WE_C, IA], 'Cuando vivíamos en Sevilla, en agosto siempre ___ mucho calor.', 'hacer', 'hacía',
      [('hacia', 'ci', acc_missing('hacía')),
       ('hizo', 'iu', 'Тут описано, якою зазвичай була погода в серпні: hacía calor.'),
       ('estaba', 'iu', 'З calor про погоду вживаємо hacer: hacía calor.')],
      rW)
    stask(t, 'transfer', 'travel', [HA_C, WE_C], 'En la playa {a} mucha gente porque {b} muy buen tiempo.', 'haber, hacer',
          {'a': (HA_C, ['había'], [('habían', 'Había не змінюється за числом: había mucha gente.'),
                                    ('estaba', 'Про наявність кажемо haber: había mucha gente.')]),
           'b': (WE_C, ['hacía'], [('estaba', 'З buen tiempo вживаємо hacer: hacía buen tiempo.'),
                                    ('hizo', 'Тут описано обставини на пляжі: hacía buen tiempo.')])},
          [((HA_C,), R_HA), ((WE_C,), R_WE)], instr=INSTR_USE2)
    x(t, 'delayed', 'family-past', [ES], 'De pequeños, nosotros siempre ___ contentos en el pueblo.', 'estar', 'estábamos',
      [('éramos', 'i', 'Contento — це стан, тому estar: estábamos contentos.'),
       ('estamos', 'i', 'Estamos — теперішній час, а de pequeños вказує на минуле: estábamos.')],
      rE)
    x(t, 'delayed', 'home-arrival', [ES], 'Cuando volví a casa, mi perro ___ en el jardín.', 'estar', 'estaba',
      [('era', 'i', 'Де хтось перебуває — estar: estaba.'),
       ('estuvo', 'i', 'Тут описано, де був пес у момент мого повернення: estaba.'),
       ('está', 'i', 'Está — теперішній час. У минулому: estaba.')],
      rE)
    x(t, 'delayed', 'work-arrival', [ES], 'Antes vosotros siempre ___ muy ocupados.', 'estar', 'estabais',
      [('erais', 'i', 'Ocupado — це стан, тому estar: estabais.'),
       ('estáis', 'i', 'Estáis — теперішній час, а antes вказує на минуле: estabais.')],
      rE)
    x(t, 'transfer', 'travel', [ES], 'Cuando llegamos al museo, ___ cerrado.', 'estar', 'estaba',
      [('era', 'i', 'Відчинено чи зачинено — це стан: estaba cerrado.'),
       ('estuvo', 'i', 'Тут описано стан у момент нашого приходу: estaba.'),
       ('está', 'i', 'Está — теперішній час. У минулому: estaba.')],
      rE)
    stask(t, 'transfer', 'travel', [ES, WE_C], 'Cuando llegamos a la estación, el tren {a} allí y {b} mucho frío.', 'estar, hacer',
          {'a': (ES, ['estaba'], [('era', 'Де щось перебуває — estar: estaba.'),
                                   ('estuvo', 'Тут описано ситуацію в момент приходу: estaba.')]),
           'b': (WE_C, ['hacía'], [('hizo', 'Тут описано погоду в момент приходу: hacía frío.'),
                                    ('tenía', 'Tener frío — відчуття людини. Про погоду: hacía frío.')])},
          [((ES,), R_ES), ((WE_C,), R_WE)], instr=INSTR_USE2)
    x(t, 'delayed', 'cinema', [HA_W, IA], 'Antes en esta calle ___ un cine.', 'haber', 'había',
      [('habia', 'ci', acc_missing('había')),
       ('hubo', 'iu', 'Hubo — pretérito indefinido. Для опису того, що було в місці, вживаємо había.'),
       ('hay', 'iu', 'Hay — теперішній час, а antes вказує на минуле: había.')],
      rH)
    x(t, 'delayed', 'work-arrival', H3, 'Cuando llegué, no ___ nadie en la oficina.', None, 'había',
      [('habia', 'cci', acc_missing('había')),
       ('hay', 'iiu', 'Hay — теперішній час. У минулому: no había nadie.'),
       ('estaba', 'uiu', 'Тут потрібна форма haber: no había nadie — «нікого не було».')],
      rH3, instr=INSTR_HAY)
    x(t, 'delayed', 'morning', [ST_C], 'Cuando me levanté, ___ las siete.', 'ser', 'eran',
      [('era', 'i', 'З годинами, крім la una, — множина: eran las siete.'),
       ('fueron', 'i', 'Котра була година — це обставина: eran las siete.'),
       ('son', 'i', 'Son — теперішній час. У минулому: eran.')],
      rT)
    x(t, 'delayed', 'arrival', [ST_C], 'Cuando llegamos a la playa, todavía ___ temprano.', 'ser', 'era',
      [('fue', 'i', 'Пора — обставина: era temprano.'),
       ('estaba', 'i', 'Про пору кажемо ser: era temprano.'),
       ('es', 'i', 'Es — теперішній час. У минулому: era.')],
      rT)
    x(t, 'transfer', 'exam', [ST_C], 'Cuando terminé el examen, ___ la una y media.', 'ser', 'era',
      [('eran', 'i', 'З la una (і la una y media) — однина: era.'),
       ('fue', 'i', 'Котра була година — це обставина: era la una y media.'),
       ('es', 'i', 'Es — теперішній час. У минулому: era.')],
      rT)
    stask(t, 'transfer', 'cinema-night', [ST_C, HA_C], 'Cuando terminó la película, {a} las doce y no {b} autobuses.', 'ser, haber',
          {'a': (ST_C, ['eran'], [('era', 'З годинами, крім la una, — множина: eran las doce.'),
                                   ('fueron', 'Котра була година — це обставина: eran las doce.')]),
           'b': (HA_C, ['había'], [('habían', 'Había не змінюється за числом: no había autobuses.'),
                                    ('estaban', 'Про наявність кажемо haber: no había autobuses.')])},
          [((ST_C,), R_ST), ((HA_C,), R_HA)], instr=INSTR_USE2)
    stask(t, 'delayed', 'neighbourhood', [UD_C, HA_C], 'En aquella época, mi barrio {a} muy ruidoso y no {b} parques.', 'ser, haber',
          {'a': (UD_C, ['era'], [('es', 'Es — теперішній час, а en aquella época вказує на минуле: era.'),
                                  ('fue', 'Для опису району в минулому — імперфект: era.')]),
           'b': (HA_C, ['había'], [('habían', 'Había не змінюється за числом: no había parques.'),
                                    ('estaban', 'Про наявність кажемо haber: no había parques.')])},
          [((UD_C,), R_UD), ((HA_C,), R_HA)], instr=INSTR_USE2)
    x(t, 'delayed', 'people', [UD_C], 'Mi primera profesora de inglés ___ muy joven y simpática.', 'ser', 'era',
      [('fue', 'i', 'Для опису, якою була людина, — імперфект: era.'),
       ('es', 'i', 'Es — теперішній час. В описі минулого: era.'),
       ('estaba', 'i', 'Риси людини (joven, simpática) описує ser: era.')],
      rD)
    x(t, 'transfer', 'objects', [UD_C], 'Mi primer coche ___ rojo y muy pequeño.', 'ser', 'era',
      [('fue', 'i', 'Для опису речі в минулому — імперфект: era.'),
       ('es', 'i', 'Es — теперішній час, а «мій перший автомобіль» — у минулому: era.'),
       ('estaba', 'i', 'Колір і розмір описує ser: era.')],
      rD)
    t.choice('delayed', 'village', [UD_X],
             [P('Яке речення — опис місця в минулому, а не подія?')],
             [('Llegamos a un pueblo muy bonito.', 'i', 'Llegamos — подія (ми приїхали).'),
              ('El pueblo era muy bonito y tenía un río.', 'c', None),
              ('El pueblo es muy bonito y tiene un río.', 'i', 'Це опис у теперішньому часі.')],
             [rule([UD_X], R_UD)],
             ('Правильно: era, tenía — опис у минулому.', 'Ні. Опис у минулому — El pueblo era muy bonito y tenía un río.'))
    t.choice('transfer', 'message', [UD_X],
             [P('Оберіть форму, яка підходить за змістом повідомлення.'),
              PE('Hola, Sara: Ayer vi nuestro antiguo colegio. Ahora es muy moderno, pero antes ___ viejo y pequeño.')],
             [('fue', 'i', 'Fue підсумовує стан як завершене ціле. Для опису того, якою була школа раніше (у протиставленні antes … ahora), — імперфект: era.'),
              ('es', 'i', 'Es — теперішній час; antes вказує на минуле.'),
              ('era', 'c', None)],
             [rule([UD_X], R_UD)],
             ('Правильно: antes era viejo y pequeño — опис у минулому.', 'Ні. Опис того, якою була школа раніше, — era.'))
    t.choice('delayed', 'seasons', [WE_R],
             [PE('En verano hacía mucho calor y en invierno hacía mucho viento.'), P('Якою була погода взимку?')],
             [('було дуже вітряно', 'c', None),
              ('було дуже жарко', 'i', 'Жарко (hacía mucho calor) було влітку.'),
              ('ішов сніг', 'i', 'Про сніг у тексті не йдеться: en invierno hacía mucho viento.')],
             [rule([WE_R], R_WE)],
             ('Правильно.', 'Ні. En invierno hacía mucho viento — взимку було дуже вітряно.'))
    t.choice('delayed', 'arrival', [ST_R],
             [PE('Cuando llegamos, era la una y media.'), P('О котрій вони приїхали?')],
             [('о першій', 'i', 'La una y media — пів на другу (1:30).'),
              ('о пів на другу', 'c', None),
              ('о пів на першу', 'i', 'La una y media — це 1:30, тобто пів на другу.')],
             [rule([ST_R], R_ST)],
             ('Правильно: la una y media — пів на другу.', 'Ні. La una y media — 1:30, тобто пів на другу.'))

    assert len(t.tasks) == 60, len(t.tasks)
    body = lesson(
        'A2-05-L5', 'lesson', BLOCK,
        'Опис у минулому: людина, місце, погода, час',
        'pretérito imperfecto: descripciones',
        'Описуємо в імперфекті, якими були люди, речі й місця: вік (tenía diez años), погода (hacía frío, llovía), '
        'місце і стан (estaba cansada), наявність (había) і час (era la una, eran las diez).',
        ['A2-05-O6'], ['CV-04'], ['people-family-home', 'conditions-weather-problems', 'places-accommodation'], 20,
        ['imperfecto.use-description', 'imperfecto.age-tenia', 'imperfecto.weather', 'imperfecto.estar-state',
         'imperfecto.habia', 'imperfecto.ser-time-setting'],
        ['imperfecto.ser', 'imperfecto.regular-er-ir.singular', 'imperfecto.regular-ar.singular', 'imperfecto.ia-accent',
         'imperfecto.use-habit', 'time.past-habit-frames', 'tener.age', 'formula.weather-hace', 'present.llover-nevar',
         'estar.weather', 'contrast.hace-tener-estar', 'estar.location', 'estar.state', 'hay.existence',
         'time.clock.hours', 'time.clock.es-la-una', 'time.clock.minutes', 'adj.agreement.o-a', 'ser.description',
         'tener.possession'],
        [
            step('s1', 'explanation', 'Опис у минулому: яким усе було', True, blocks=[
                P('Імперфект — основний час для опису минулого: якими були люди, речі й місця, яка була погода, котра '
                  'година, що де було. Опис відповідає на питання «яким було?», а не «що сталося?».'),
                EX('Mi abuelo era alto y tenía barba.', 'Мій дідусь був високим і мав бороду.'),
                EX('La casa era pequeña, pero tenía un jardín.', 'Будинок був маленьким, але мав сад.'),
            ]),
            step('s2', 'explanation', 'Знайомі конструкції — тепер у минулому', True, blocks=[
                NOW_THEN,
                P('Вік: tener + число + años (не *era diez años): Mi madre tenía treinta años y yo tenía cinco.'),
                P('Погода: безособово, у 3-й особі однини: hacía calor, llovía, nevaba, estaba nublado. Не плутайте з '
                  'tener calor / tener frío — це відчуття людини: Tenía frío — «Мені було холодно».'),
                P('Наявність: había — одна форма для однини й множини: había un río, había muchos árboles. Форма habían '
                  'тут ненормативна. Коли повідомляємо, що щось було (існувало), кажемо había: Antes había una farmacia cerca de '
                  'mi casa. Estar кажуть про розташування вже відомого: La farmacia estaba cerca de mi casa.'),
                P('Година: з la una — era, з іншими годинами — eran: Era la una. Eran las diez. Так само era de noche, era tarde, era temprano.'),
                P('Місце і стан: estaba en casa, estaba cansada, la tienda estaba cerrada — прикметник узгоджується з підметом.'),
            ]),
            step('s3', 'examples', 'Приклади', True, blocks=[
                EX('Cuando yo era pequeño, mi abuela tenía sesenta años.', 'Коли я був малим, моїй бабусі було шістдесят років.'),
                EX('Aquel invierno hacía mucho frío y nevaba mucho.', 'Тієї зими було дуже холодно і часто йшов сніг.'),
                EX('Cuando llegué a casa, eran las diez y mis padres estaban en la cocina.',
                   'Коли я прийшов (прийшла) додому, була десята, і батьки були на кухні.'),
                EX('En mi pueblo había un río y muchos árboles.', 'У моєму містечку була річка й багато дерев.'),
                EX('Era de noche y no había nadie en la calle.', 'Була ніч, і на вулиці нікого не було.'),
                EX('Marta tenía el pelo largo y rizado.', 'Марта мала довге кучеряве волосся.'),
                EX('Mis abuelos vivían en el campo. Mi abuela tenía el pelo liso y muy largo.',
                   'Мої дідусь і бабуся жили за містом. Бабуся мала пряме й дуже довге волосся.'),
                P('Нові слова: la barba — борода; rizado — кучерявий; liso — прямий (про волосся); el árbol — дерево; '
                  'el río — річка; el campo — поле, сільська місцевість (vivir en el campo — жити за містом).'),
            ]),
            step('s4', 'supported-practice', 'Практика зі зразком', True, tasks=sup),
            step('s5', 'independent-practice', 'Самостійна практика', True, tasks=core),
            step('s6', 'independent-practice', 'Більше практики (необов’язково)', False, tasks=extra),
            step('s7', 'summary', 'Підсумок', True, blocks=[
                BL(['Опис у минулому — імперфект: era, tenía, estaba, había.',
                    'Вік: tenía diez años (tener, а не ser).',
                    'Погода: hacía calor, llovía, nevaba, estaba nublado.',
                    'Наявність: había — одна форма для однини й множини.',
                    'Година: era la una, eran las diez; era de noche, era tarde.']),
            ]),
        ],
    )
    return body, t.tasks


def MATERIALS():
    keys = [UD_C, AGE, WE_C, ES, HA_W, HA_C, ST_C]
    return [
        material('material.a2-05.description', 'A2-05-L5', 'Опис у минулому: вік, погода, стан, había, година', [
            P('Знайомі конструкції теперішнього часу в описі минулого переходять в імперфект.'),
            NOW_THEN,
            P('Вік — tener (tenía diez años); погода — hacía calor, llovía; наявність — había (одна форма); година — era la una, eran las diez.'),
            LINK('Потренувати опис у минулому', keys, 'written', 10),
        ], keys),
    ]


LESSONS = [l5]

SKILL_PATCHES = {
    'imperfecto.habia': {
        'bankJustificationUk': 'Одна форма (había). Форма й вибір конструкції перевіряються разом у завданнях без підказки '
                               'дієслова, а знак наголосу — окремою ціллю; тому для written-form достатньо 6 завдань, а '
                               'construction-use має окремий банк.',
    },
}
