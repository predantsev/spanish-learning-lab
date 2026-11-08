"""A2-05-L3 — ser, ir, ver: the three irregular imperfecto verbs; the accent in éramos / íbamos."""
from build import BL, EX, LINK, P, PE, TB, LessonTasks, lesson, material, rule, step
from a2_05 import BLOCK, P13, R_P13, ftask, stask
from a2_05_l2 import IA, R_IA, acc_missing

SER = 'imperfecto.ser/written-form'
IR = 'imperfecto.ir/written-form'
VER = 'imperfecto.ver/written-form'
EI = 'imperfecto.eramos-ibamos-accent/written-form'

R_SER = 'Ser в імперфекті має власні форми: era, eras, era, éramos, erais, eran.'
R_IR = 'Ir в імперфекті має власні форми: iba, ibas, iba, íbamos, ibais, iban.'
R_VER = 'Ver зберігає e з інфінітива: ve- + -ía → veía, veías, veía, veíamos, veíais, veían (не *vía).'
R_EI = ('Éramos та íbamos наголошені на третьому складі від кінця (É-ra-mos, Í-ba-mos), тому пишуться зі знаком '
        'наголосу. Era, iba, erais, ibais знака не мають.')

SIV_TABLE = TB(
    ['persona', 'ser', 'ir', 'ver'],
    [
        ['yo', 'era', 'iba', 'veía'],
        ['tú', 'eras', 'ibas', 'veías'],
        ['él / ella / usted', 'era', 'iba', 'veía'],
        ['nosotros / nosotras', 'éramos', 'íbamos', 'veíamos'],
        ['vosotros / vosotras', 'erais', 'ibais', 'veíais'],
        ['ellos / ellas / ustedes', 'eran', 'iban', 'veían'],
    ],
)

ACC_EXTRA_EI = 'Форму утворено правильно, але знак наголосу тут зайвий: {}. Знак мають лише éramos та íbamos.'


def l3():
    t = LessonTasks('A2-05-L3')
    rser = [((SER,), R_SER)]
    rser2 = [((SER,), R_SER), ((EI,), R_EI)]
    rir = [((IR,), R_IR)]
    rir2 = [((IR,), R_IR), ((EI,), R_EI)]
    rver = [((VER,), R_VER), ((IA,), R_IA)]
    V2 = [VER, IA]

    # --- imperfecto.ser (10) --------------------------------------------------------------
    ftask(t, 'supported', 'people-before', [SER], 'Antes mi barrio ___ muy tranquilo.', 'ser', 'era',
          [('fue', 'i', 'Fue — pretérito indefinido від ser (і від ir). Для опису в минулому тут потрібен імперфект: era.'),
           ('es', 'i', 'Es — теперішній час. В імперфекті: era.'),
           ('seía', 'i', 'Ser має в імперфекті власні форми: era (не *seía).')],
          rser, model='Зразок: ser → era, eras, era, éramos, erais, eran.')
    ftask(t, 'supported', 'school-before', [SER], 'En el colegio, mis profesores ___ muy simpáticos.', 'ser', 'eran',
          [('fueron', 'i', 'Fueron — pretérito indefinido. Для опису в минулому тут потрібен імперфект: eran.'),
           ('son', 'i', 'Son — теперішній час. В імперфекті: eran.'),
           ('era', 'i', 'Era — форма однини. Mis profesores — множина: eran.')],
          rser, model='Зразок: ser → ellos eran.')
    ftask(t, 'independent', 'people-before', [SER], '¿Antes ___ rubio?', 'ser, tú', 'eras',
          [('era', 'i', 'Era — форма для yo або él/ella/usted. Для tú: eras.'),
           ('eres', 'i', 'Eres — теперішній час. В імперфекті: eras.'),
           ('fuiste', 'i', 'Fuiste — pretérito indefinido. Тут потрібен імперфект: eras.')],
          rser)
    ftask(t, 'independent', 'school-before', [SER, EI], 'En el colegio, Marta y yo ___ muy buenas amigas.', 'ser', 'éramos',
          [('eramos', 'ci', acc_missing('éramos')),
           ('somos', 'iu', 'Somos — теперішній час. В імперфекті: éramos.'),
           ('fuimos', 'iu', 'Fuimos — pretérito indefinido. Для опису в минулому тут потрібен імперфект: éramos.'),
           ('eran', 'iu', 'Marta y yo — це nosotras: éramos.')],
          rser2)
    ftask(t, 'independent', 'people-before', [SER], 'Antes la casa de mis padres ___ pequeña, pero muy bonita.', 'ser', 'era',
          [('fue', 'i', 'Fue — pretérito indefinido. Для опису в минулому тут потрібен імперфект: era.'),
           ('es', 'i', 'Es — теперішній час. В імперфекті: era.'),
           ('eran', 'i', 'La casa — однина: era.')],
          rser)
    ftask(t, 'independent', 'school-before', [SER, EI], '¿Antes vosotros ___ vecinos?', 'ser', 'erais',
          [('érais', 'ci', ACC_EXTRA_EI.format('erais')),
           ('sois', 'iu', 'Sois — теперішній час. В імперфекті: erais.'),
           ('fuisteis', 'iu', 'Fuisteis — pretérito indefinido. Тут потрібен імперфект: erais.'),
           ('eran', 'iu', 'Eran — форма для ellos або ustedes. Для vosotros: erais.')],
          rser2)
    ftask(t, 'delayed', 'people-before', [SER], 'Antes las calles de mi barrio ___ muy ruidosas.', 'ser', 'eran',
          [('fueron', 'i', 'Fueron — pretérito indefinido. Для опису в минулому тут потрібен імперфект: eran.'),
           ('son', 'i', 'Son — теперішній час. В імперфекті: eran.'),
           ('era', 'i', 'Era — форма однини. Las calles — множина: eran.')],
          rser)
    ftask(t, 'delayed', 'school-before', [SER, EI], 'En la universidad, mis amigos y yo ___ muy buenos estudiantes.', 'ser', 'éramos',
          [('eramos', 'ci', acc_missing('éramos')),
           ('somos', 'iu', 'Somos — теперішній час. В імперфекті: éramos.'),
           ('fuimos', 'iu', 'Fuimos — pretérito indefinido. Для опису в минулому тут потрібен імперфект: éramos.')],
          rser2)
    ftask(t, 'transfer', 'transport-before', [SER], 'Antes el billete de tren ___ muy barato.', 'ser', 'era',
          [('es', 'i', 'Es — теперішній час, а йдеться про минуле (antes): era.'),
           ('fue', 'i', 'Fue — pretérito indefinido. Для опису в минулому тут потрібен імперфект: era.')],
          rser)
    stask(t, 'transfer', 'transport-before', [SER], 'Antes la estación {a} muy pequeña y los trenes {b} muy viejos.', 'ser, ser',
          {'a': (SER, ['era'], [('es', 'Es — теперішній час. В імперфекті: era.'),
                                 ('fue', 'Fue — pretérito indefinido. Для опису в минулому: era.')]),
           'b': (SER, ['eran'], [('son', 'Son — теперішній час. В імперфекті: eran.'),
                                  ('fueron', 'Fueron — pretérito indefinido. Для опису в минулому: eran.'),
                                  ('era', 'Era — форма однини. Los trenes — множина: eran.')])},
          rser)

    # --- imperfecto.ir (10) ---------------------------------------------------------------
    ftask(t, 'supported', 'school-before', [IR], 'Antes yo ___ al colegio en autobús.', 'ir', 'iba',
          [('fui', 'i', 'Fui — pretérito indefinido. Для звички в минулому тут потрібен імперфект: iba.'),
           ('voy', 'i', 'Voy — теперішній час. В імперфекті: iba.'),
           ('iva', 'i', 'Форма пишеться з b: iba.')],
          rir, model='Зразок: ir → iba, ibas, iba, íbamos, ibais, iban.')
    ftask(t, 'supported', 'leisure-before', [IR], 'Antes mis padres ___ al cine todos los sábados.', 'ir', 'iban',
          [('fueron', 'i', 'Fueron — pretérito indefinido. Для звички в минулому тут потрібен імперфект: iban.'),
           ('van', 'i', 'Van — теперішній час. В імперфекті: iban.'),
           ('iba', 'i', 'Iba — форма однини. Mis padres — множина: iban.'),
           ('ivan', 'i', 'Форма пишеться з b: iban.')],
          rir, model='Зразок: ir → ellos iban.')
    ftask(t, 'independent', 'school-before', [IR], '¿Antes ___ a clase de inglés?', 'ir, tú', 'ibas',
          [('iba', 'i', 'Iba — форма для yo або él/ella/usted. Для tú: ibas.'),
           ('vas', 'i', 'Vas — теперішній час. В імперфекті: ibas.'),
           ('fuiste', 'i', 'Fuiste — pretérito indefinido. Тут потрібен імперфект: ibas.')],
          rir)
    ftask(t, 'independent', 'leisure-before', [IR, EI], 'Antes nosotros ___ a la playa en verano.', 'ir', 'íbamos',
          [('ibamos', 'ci', acc_missing('íbamos')),
           ('vamos', 'iu', 'Vamos — теперішній час. В імперфекті: íbamos.'),
           ('fuimos', 'iu', 'Fuimos — pretérito indefinido. Для звички в минулому тут потрібен імперфект: íbamos.'),
           ('iban', 'iu', 'Iban — форма для ellos. Для nosotros: íbamos.')],
          rir2)
    ftask(t, 'independent', 'school-before', [IR], 'Antes mi hermana ___ a la universidad en bicicleta.', 'ir', 'iba',
          [('fue', 'i', 'Fue — pretérito indefinido. Для звички в минулому тут потрібен імперфект: iba.'),
           ('va', 'i', 'Va — теперішній час. В імперфекті: iba.'),
           ('iban', 'i', 'Iban — форма множини. Mi hermana — одна особа: iba.')],
          rir)
    ftask(t, 'independent', 'leisure-before', [IR, EI], '¿Antes vosotros ___ mucho al teatro?', 'ir', 'ibais',
          [('íbais', 'ci', ACC_EXTRA_EI.format('ibais')),
           ('vais', 'iu', 'Vais — теперішній час. В імперфекті: ibais.'),
           ('fuisteis', 'iu', 'Fuisteis — pretérito indefinido. Тут потрібен імперфект: ibais.'),
           ('iban', 'iu', 'Iban — форма для ellos або ustedes. Для vosotros: ibais.')],
          rir2)
    ftask(t, 'delayed', 'school-before', [IR], 'Antes los niños ___ al colegio a las nueve.', 'ir', 'iban',
          [('fueron', 'i', 'Fueron — pretérito indefinido. Для звички в минулому тут потрібен імперфект: iban.'),
           ('van', 'i', 'Van — теперішній час. В імперфекті: iban.'),
           ('iba', 'i', 'Iba — форма однини. Los niños — множина: iban.')],
          rir)
    ftask(t, 'delayed', 'leisure-before', [IR, EI], 'Antes mi familia y yo ___ al museo los domingos.', 'ir', 'íbamos',
          [('ibamos', 'ci', acc_missing('íbamos')),
           ('vamos', 'iu', 'Vamos — теперішній час. В імперфекті: íbamos.'),
           ('fuimos', 'iu', 'Fuimos — pretérito indefinido. Для звички в минулому тут потрібен імперфект: íbamos.'),
           ('iban', 'iu', 'Mi familia y yo — це nosotros: íbamos.')],
          rir2)
    ftask(t, 'transfer', 'work-trips', [IR], '¿Antes usted ___ a la oficina en coche?', 'ir', 'iba',
          [('ibas', 'i', 'Ibas — форма для tú. З usted вживаємо форму él/ella: iba.'),
           ('va', 'i', 'Va — теперішній час. В імперфекті: iba.'),
           ('fue', 'i', 'Fue — pretérito indefinido. Тут потрібен імперфект: iba.')],
          rir)
    stask(t, 'transfer', 'work-trips', [IR], 'Antes mi padre {a} a la oficina en tren y mis hermanos {b} a la universidad en autobús.', 'ir, ir',
          {'a': (IR, ['iba'], [('va', 'Va — теперішній час. В імперфекті: iba.'),
                                ('fue', 'Fue — pretérito indefinido. Для звички в минулому: iba.')]),
           'b': (IR, ['iban'], [('van', 'Van — теперішній час. В імперфекті: iban.'),
                                 ('fueron', 'Fueron — pretérito indefinido. Для звички в минулому: iban.'),
                                 ('iba', 'Iba — форма однини. Mis hermanos — множина: iban.')])},
          rir)

    # --- imperfecto.ver (+ ia-accent) (10) ------------------------------------------------
    ftask(t, 'supported', 'leisure-before', V2, 'Antes yo ___ la tele por la noche.', 'ver', 'veía',
          [('veia', 'ci', acc_missing('veía')),
           ('vía', 'iu', 'Ver зберігає e з інфінітива: ve- + -ía → veía (не *vía).'),
           ('veo', 'iu', 'Veo — теперішній час. В імперфекті: veía.'),
           ('vi', 'iu', 'Vi — pretérito indefinido. Для звички в минулому тут потрібен імперфект: veía.')],
          rver, model='Зразок: ver → veía, veías, veía, veíamos, veíais, veían.')
    ftask(t, 'supported', 'leisure-before', V2, 'Antes mis hermanos ___ dibujos animados los sábados por la mañana.', 'ver', 'veían',
          [('veian', 'ci', acc_missing('veían')),
           ('vían', 'iu', 'Ver зберігає e з інфінітива: veían.'),
           ('ven', 'iu', 'Ven — теперішній час. В імперфекті: veían.'),
           ('vieron', 'iu', 'Vieron — pretérito indefinido. Для звички в минулому тут потрібен імперфект: veían.')],
          rver, model='Зразок: ver → ellos veían.')
    ftask(t, 'independent', 'leisure-before', V2, '¿Antes ___ mucho a tus amigos de Valencia?', 'ver, tú', 'veías',
          [('veias', 'ci', acc_missing('veías')),
           ('vías', 'iu', 'Ver зберігає e з інфінітива: veías.'),
           ('ves', 'iu', 'Ves — теперішній час. В імперфекті: veías.'),
           ('viste', 'iu', 'Viste — pretérito indefinido. Тут потрібен імперфект: veías.')],
          rver)
    ftask(t, 'independent', 'family-before', V2, 'Antes mi madre ___ a sus amigas los jueves.', 'ver', 'veía',
          [('veia', 'ci', acc_missing('veía')),
           ('vía', 'iu', 'Ver зберігає e з інфінітива: veía.'),
           ('ve', 'iu', 'Ve — теперішній час. В імперфекті: veía.'),
           ('vio', 'iu', 'Vio — pretérito indefinido. Для звички в минулому тут потрібен імперфект: veía.')],
          rver)
    ftask(t, 'independent', 'leisure-before', V2, 'Antes nosotros ___ el fútbol en un bar.', 'ver', 'veíamos',
          [('veiamos', 'ci', acc_missing('veíamos')),
           ('víamos', 'iu', 'Ver зберігає e з інфінітива: veíamos.'),
           ('vemos', 'iu', 'Vemos — теперішній час. В імперфекті: veíamos.'),
           ('vimos', 'iu', 'Vimos — pretérito indefinido. Для звички в минулому тут потрібен імперфект: veíamos.')],
          rver)
    t.choice('independent', 'family-before', [VER],
             [P('Яка форма імперфекту дієслова ver правильна для ellos?')],
             [('vían', 'i', 'Ver зберігає e з інфінітива: veían.'),
              ('veían', 'c', None),
              ('vieron', 'i', 'Vieron — pretérito indefinido, а не імперфект.')],
             [rule([VER], R_VER)],
             ('Правильно: veían.', 'Ні. Правильно: veían — основа ve- і закінчення -ían.'))
    ftask(t, 'delayed', 'leisure-before', V2, '¿Antes vosotros ___ muchas películas?', 'ver', 'veíais',
          [('veiais', 'ci', acc_missing('veíais')),
           ('víais', 'iu', 'Ver зберігає e з інфінітива: veíais.'),
           ('veis', 'iu', 'Veis — теперішній час. В імперфекті: veíais.'),
           ('visteis', 'iu', 'Visteis — pretérito indefinido. Тут потрібен імперфект: veíais.')],
          rver)
    ftask(t, 'delayed', 'family-before', V2, 'Antes yo ___ películas con mi hermana los viernes.', 'ver', 'veía',
          [('veia', 'ci', acc_missing('veía')),
           ('vía', 'iu', 'Ver зберігає e з інфінітива: veía.'),
           ('veo', 'iu', 'Veo — теперішній час. В імперфекті: veía.'),
           ('vi', 'iu', 'Vi — pretérito indefinido. Для звички в минулому тут потрібен імперфект: veía.')],
          rver)
    ftask(t, 'transfer', 'neighbourhood', V2, 'Antes, desde mi ventana, yo ___ el parque.', 'ver', 'veía',
          [('veia', 'ci', acc_missing('veía')),
           ('vía', 'iu', 'Ver зберігає e з інфінітива: veía.'),
           ('veo', 'iu', 'Veo — теперішній час. В імперфекті: veía.'),
           ('vi', 'iu', 'Vi — pretérito indefinido. Тут ідеться про те, що було видно постійно: veía.')],
          rver)
    stask(t, 'transfer', 'neighbourhood', [VER], 'Antes, desde la terraza, nosotros {a} la plaza y nuestros vecinos {b} el parque.', 'ver, ver',
          {'a': (VER, ['veíamos'], [('vemos', 'Vemos — теперішній час. В імперфекті: veíamos.'),
                                     ('víamos', 'Ver зберігає e з інфінітива: veíamos.')]),
           'b': (VER, ['veían'], [('ven', 'Ven — теперішній час. В імперфекті: veían.'),
                                   ('vían', 'Ver зберігає e з інфінітива: veían.')])},
          [((VER,), R_VER + ' Не забудьте знак наголосу на í.')])

    # --- imperfecto.eramos-ibamos-accent: spelling-only items -----------------------------
    t.choice('supported', 'spelling', [EI],
             [P('Зразок: hablar → hablábamos (знак на третьому складі від кінця). Оберіть правильно написану форму nosotros дієслова ser в імперфекті.')],
             [('eramos', 'i', 'Бракує знака наголосу: É-ra-mos → éramos.'),
              ('éramos', 'c', None),
              ('erámos', 'i', 'Знак стоїть не на тому складі: наголос на першому складі — éramos.')],
             [rule([EI], R_EI)],
             ('Правильно: éramos.', 'Ні. Правильно: éramos — знак наголосу над першою é.'))
    t.choice('supported', 'spelling', [EI],
             [P('Оберіть правильно написану форму nosotros дієслова ir в імперфекті.')],
             [('íbamos', 'c', None),
              ('ibamos', 'i', 'Бракує знака наголосу: Í-ba-mos → íbamos.'),
              ('ibámos', 'i', 'Знак стоїть не на тому складі: наголос на першому складі — íbamos.')],
             [rule([EI], R_EI)],
             ('Правильно: íbamos.', 'Ні. Правильно: íbamos — знак наголосу над першою í.'))
    t.choice('transfer', 'message', [EI],
             [P('У якому реченні всі форми написано правильно?')],
             [('Antes eramos vecinos e ibamos al colegio en autobús.', 'i', 'Бракує знаків наголосу: éramos, íbamos.'),
              ('Antes éramos vecinos e íbamos al colegio en autobús.', 'c', None),
              ('Antes éramos vecinos e ibámos al colegio en autobús.', 'i', 'У íbamos знак стоїть на першому складі: Í-ba-mos.')],
             [rule([EI], R_EI)],
             ('Правильно: éramos, íbamos — обидві форми nosotros мають знак наголосу.',
              'Ні. Правильно: Antes éramos vecinos e íbamos al colegio en autobús.'))

    # --- person-1s-3s revisited ----------------------------------------------------------
    t.choice('independent', 'dialogue', [P13],
             [P('Прочитайте діалог і дайте відповідь.'),
              PE('—¿Y tu profesora de inglés? —Era muy simpática, pero no explicaba bien.'),
              P('Хто погано пояснював?')],
             [('вчителька англійської', 'c', None),
              ('та, хто відповідає (я)', 'i', 'Відповідь продовжує тему питання — tu profesora de inglés.'),
              ('з тексту неможливо визначити', 'i', 'Контекст тут достатній: питання про вчительку, і відповідь — про неї.')],
             [rule([P13], R_P13)],
             ('Правильно: era та explicaba тут описують учительку.', 'Ні. Відповідь описує вчительку: era muy simpática, no explicaba bien.'))

    sup = [x['id'] for x in t.tasks if x['role'] == 'supported']
    ind = [x['id'] for x in t.tasks if x['role'] == 'independent']
    assert len(t.tasks) == 34, len(t.tasks)
    body = lesson(
        'A2-05-L3', 'lesson', BLOCK,
        'Ser, ir, ver в імперфекті: era, iba, veía',
        'pretérito imperfecto: ser, ir, ver',
        'Запам’ятовуємо три неправильні дієслова імперфекту — ser (era), ir (iba) і ver (veía) — та знак наголосу '
        'в éramos і íbamos.',
        ['A2-05-O3', 'A2-05-O4'], [], ['people-family-home', 'routine-study-leisure'], 18,
        ['imperfecto.ser', 'imperfecto.ir', 'imperfecto.ver', 'imperfecto.eramos-ibamos-accent'],
        ['imperfecto.regular-er-ir.singular', 'imperfecto.ia-accent', 'imperfecto.abamos-accent', 'imperfecto.person-1s-3s',
         'ser.description', 'present.ir', 'present.ver', 'indefinido.ser-ir', 'link.y-e'],
        [
            step('s1', 'explanation', 'Три неправильні дієслова', True, blocks=[
                P('В імперфекті є лише три неправильні дієслова: ser, ir і ver. Їхні форми треба запам’ятати.'),
                SIV_TABLE,
                P('Ser: era, eras, era, éramos, erais, eran. Ir: iba, ibas, iba, íbamos, ibais, iban. Ver: основа ve- '
                  'зберігає e з інфінітива, а закінчення звичайні -ía: veía (не *vía).'),
                P('Знак наголосу: éramos та íbamos наголошені на третьому складі від кінця (É-ra-mos, Í-ba-mos), тому '
                  'пишуться зі знаком — як hablábamos. Era, iba, erais, ibais знака не мають. У ver знак стоїть на í в усіх '
                  'особах, як у comía: veía, veíamos.'),
                P('Не плутайте з pretérito indefinido: fue — це indefinido і від ser, і від ir; era — імперфект від ser, '
                  'iba — від ir. Vio — indefinido від ver, veía — імперфект.'),
            ]),
            step('s2', 'examples', 'Приклади', True, blocks=[
                EX('Antes mi barrio era muy tranquilo.', 'Раніше мій район був дуже тихим.'),
                EX('En el colegio, Marta y yo éramos muy buenas amigas.', 'У школі ми з Мартою були дуже добрими подругами.'),
                EX('Antes yo iba al colegio en autobús.', 'Раніше я їздив (їздила) до школи автобусом.'),
                EX('Los sábados íbamos al cine.', 'По суботах ми ходили в кіно.'),
                EX('Antes yo veía la tele por la noche.', 'Раніше я дивився (дивилася) телевізор увечері.'),
                EX('Mis hermanos veían dibujos animados los sábados.', 'Мої брати дивилися мультфільми по суботах.'),
                EX('Antes yo veía a mis abuelos todos los domingos.', 'Раніше я щонеділі бачився (бачилася) з дідусем і бабусею.'),
                P('Нові слова: el colegio — школа (для дітей); los dibujos animados — мультфільми; la tele — телевізор '
                  '(розмовне скорочення від la televisión); el abuelo — дідусь, la abuela — бабуся, los abuelos — дідусь і бабуся.'),
            ]),
            step('s3', 'supported-practice', 'Практика зі зразком', True, tasks=sup),
            step('s4', 'independent-practice', 'Самостійна практика', True, tasks=ind),
            step('s5', 'summary', 'Підсумок', True, blocks=[
                BL(['Ser: era, eras, era, éramos, erais, eran.',
                    'Ir: iba, ibas, iba, íbamos, ibais, iban.',
                    'Ver: veía, veías, veía, veíamos, veíais, veían — e з інфінітива зберігається.',
                    'Знак наголосу: éramos, íbamos і всі форми veía.',
                    'Fue — це pretérito indefinido (від ser і від ir), а не імперфект.']),
            ]),
        ],
    )
    return body, t.tasks


def MATERIALS():
    return [
        material('material.a2-05.ser-ir-ver', 'A2-05-L3', 'Ser, ir, ver в імперфекті: таблиця форм', [
            P('Лише три дієслова мають неправильний імперфект: ser, ir, ver.'),
            SIV_TABLE,
            P('Знак наголосу: éramos, íbamos і всі форми ver (veía). Fue — це pretérito indefinido від ser та ir.'),
            LINK('Потренувати ser, ir, ver', [SER, IR, VER, EI], 'written', 10),
        ], [SER, IR, VER, EI]),
    ]


LESSONS = [l3]

SKILL_PATCHES = {
    'imperfecto.eramos-ibamos-accent': {
        'bankJustificationUk': 'Лише дві форми (éramos, íbamos). Знак перевіряється в завданнях на ці форми, на erais та ibais '
                               'і в окремих завданнях на правопис, тому банк менший за 10 завдань.',
    },
}

LEXICON_ADDITIONS = [
    {'id': 'lex.tele', 'lemma': 'tele', 'pos': 'noun', 'gender': 'f', 'plural': 'teles',
     'meaningUk': 'телевізор (розмовне скорочення від la televisión)', 'firstLesson': 'A2-05-L3',
     'noteUk': 'Ver la tele — дивитися телевізор.'},
    {'id': 'lex.abuelo', 'lemma': 'abuelo', 'pos': 'noun', 'gender': 'm', 'plural': 'abuelos',
     'meaningUk': 'дідусь', 'firstLesson': 'A2-05-L3', 'noteUk': 'Los abuelos — дідусь і бабуся.'},
    {'id': 'lex.abuela', 'lemma': 'abuela', 'pos': 'noun', 'gender': 'f', 'plural': 'abuelas',
     'meaningUk': 'бабуся', 'firstLesson': 'A2-05-L3'},
]
