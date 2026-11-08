"""A2-05-L2 — regular -er/-ir imperfecto forms (-ía), the -ía accent, present-irregular verbs."""
from build import BL, EX, P, PE, TB, LessonTasks, lesson, rule, step
from a2_05 import BLOCK, P13, R_P13, ftask, stask

ER_S = 'imperfecto.regular-er-ir.singular/written-form'
ER_P = 'imperfecto.regular-er-ir.plural/written-form'
IA = 'imperfecto.ia-accent/written-form'
PIR = 'imperfecto.present-irregulars-regular/written-form'

R_ER_S = 'Дієслова на -er та -ir в імперфекті: основа + -ía (yo), -ías (tú), -ía (él, ella, usted).'
R_ER_P = 'У множині: основа + -íamos (nosotros), -íais (vosotros), -ían (ellos, ellas, ustedes).'
R_IA = ('У закінченнях -ía, -ías, -íamos, -íais, -ían наголос падає на í, яка вимовляється окремим складом '
        '(co-MÍ-a), тому над í завжди пишемо знак наголосу.')
R_PIR = ('Зміни теперішнього часу (puedo, quiero, juego, tengo, hago) в імперфект не переходять: основу беремо '
         'з інфінітива — podía, quería, jugaba, tenía, hacía.')

ER_TABLE = TB(
    ['persona', 'comer', 'vivir', 'tener'],
    [
        ['yo', 'comía', 'vivía', 'tenía'],
        ['tú', 'comías', 'vivías', 'tenías'],
        ['él / ella / usted', 'comía', 'vivía', 'tenía'],
        ['nosotros / nosotras', 'comíamos', 'vivíamos', 'teníamos'],
        ['vosotros / vosotras', 'comíais', 'vivíais', 'teníais'],
        ['ellos / ellas / ustedes', 'comían', 'vivían', 'tenían'],
    ],
)
PIR_TABLE = TB(
    ['infinitivo', 'presente', 'imperfecto'],
    [
        ['poder', 'puedo', 'podía'],
        ['querer', 'quiero', 'quería'],
        ['pedir', 'pido', 'pedía'],
        ['tener', 'tengo', 'tenía'],
        ['hacer', 'hago', 'hacía'],
        ['jugar', 'juego', 'jugaba'],
        ['empezar', 'empiezo', 'empezaba'],
    ],
)


def acc_missing(form):
    return f'Форму утворено правильно, але бракує знака наголосу: {form}.'


def l2():
    t = LessonTasks('A2-05-L2')
    S2, P2 = [ER_S, IA], [ER_P, IA]
    rs = [((ER_S,), R_ER_S), ((IA,), R_IA)]
    rp = [((ER_P,), R_ER_P), ((IA,), R_IA)]

    # --- imperfecto.regular-er-ir.singular (+ ia-accent) -----------------------------------
    ftask(t, 'supported', 'home-before', S2, 'Antes yo ___ mucha fruta.', 'comer', 'comía',
          [('comia', 'ci', acc_missing('comía')),
           ('como', 'iu', 'Como — теперішній час. В імперфекті: comía.'),
           ('comí', 'iu', 'Comí — pretérito indefinido. Тут потрібна форма імперфекту: comía.'),
           ('comaba', 'iu', 'Закінчення -aba — лише для дієслів на -ar. Comer → comía.'),
           ('comiba', 'iu', 'Дієслова на -er мають в імперфекті закінчення -ía: comía.')],
          rs, model='Зразок: comer → yo comía, tú comías, él comía.')
    ftask(t, 'supported', 'work-before', S2, 'Antes mi hermana ___ en Valencia.', 'vivir', 'vivía',
          [('vivia', 'ci', acc_missing('vivía')),
           ('vive', 'iu', 'Vive — теперішній час. В імперфекті: vivía.'),
           ('vivió', 'iu', 'Vivió — pretérito indefinido. Тут потрібна форма імперфекту: vivía.'),
           ('vivían', 'iu', 'Vivían — форма множини. Mi hermana — одна особа: vivía.')],
          rs, model='Зразок: vivir → ella vivía.')
    ftask(t, 'independent', 'home-before', S2, '¿Antes ___ mucho por la noche?', 'leer, tú', 'leías',
          [('leias', 'ci', acc_missing('leías')),
           ('lees', 'iu', 'Lees — теперішній час. В імперфекті: leías.'),
           ('leíste', 'iu', 'Leíste — pretérito indefinido. Тут потрібна форма імперфекту: leías.'),
           ('leía', 'iu', 'Leía — форма для yo або él/ella/usted. Для tú: leías.')],
          rs)
    ftask(t, 'independent', 'work-before', S2, '¿Antes usted ___ cerca de la oficina?', 'vivir', 'vivía',
          [('vivia', 'ci', acc_missing('vivía')),
           ('vivías', 'iu', 'Vivías — форма для tú. З usted вживаємо форму él/ella: vivía.'),
           ('vive', 'iu', 'Vive — теперішній час. В імперфекті: vivía.')],
          rs)
    ftask(t, 'independent', 'home-before', S2, 'Antes mi padre ___ el periódico todos los días.', 'leer', 'leía',
          [('leia', 'ci', acc_missing('leía')),
           ('lee', 'iu', 'Lee — теперішній час. В імперфекті: leía.'),
           ('leyó', 'iu', 'Leyó — pretérito indefinido. Тут потрібна форма імперфекту: leía.')],
          rs)
    stask(t, 'independent', 'work-before', [ER_S], 'Antes yo {a} cerca del parque y mi hermana {b} allí todos los días.', 'vivir, correr',
          {'a': (ER_S, ['vivía'], [('vivo', 'Vivo — теперішній час. В імперфекті: vivía.'),
                                    ('viví', 'Viví — pretérito indefinido. Тут потрібна форма імперфекту: vivía.')]),
           'b': (ER_S, ['corría'], [('corre', 'Corre — теперішній час. В імперфекті: corría.'),
                                     ('corrió', 'Corrió — pretérito indefinido. Тут потрібна форма імперфекту: corría.')])},
          [((ER_S,), R_ER_S)])
    ftask(t, 'delayed', 'home-before', S2, 'Antes tú ___ mucha leche.', 'beber', 'bebías',
          [('bebias', 'ci', acc_missing('bebías')),
           ('bebes', 'iu', 'Bebes — теперішній час. В імперфекті: bebías.'),
           ('bebiste', 'iu', 'Bebiste — pretérito indefinido. Тут потрібна форма імперфекту: bebías.'),
           ('bebía', 'iu', 'Bebía — форма для yo або él/ella. Для tú: bebías.')],
          rs)
    ftask(t, 'delayed', 'work-before', S2, 'Antes Lucía ___ muchos mensajes en el trabajo.', 'escribir', 'escribía',
          [('escribia', 'ci', acc_missing('escribía')),
           ('escribe', 'iu', 'Escribe — теперішній час. В імперфекті: escribía.'),
           ('escribió', 'iu', 'Escribió — pretérito indefinido. Тут потрібна форма імперфекту: escribía.')],
          rs)
    ftask(t, 'transfer', 'school-before', S2, 'Antes, en clase, yo ___ mucho con la profesora.', 'aprender', 'aprendía',
          [('aprendia', 'ci', acc_missing('aprendía')),
           ('aprendo', 'iu', 'Aprendo — теперішній час. В імперфекті: aprendía.'),
           ('aprendí', 'iu', 'Aprendí — pretérito indefinido. Тут потрібна форма імперфекту: aprendía.')],
          rs)
    stask(t, 'transfer', 'school-before', [ER_S], 'Antes, en la universidad, mi amiga {a} mucho y yo {b} muy poco.', 'leer, escribir',
          {'a': (ER_S, ['leía'], [('lee', 'Lee — теперішній час. В імперфекті: leía.'),
                                   ('leyó', 'Leyó — pretérito indefinido. Тут потрібна форма імперфекту: leía.')]),
           'b': (ER_S, ['escribía'], [('escribo', 'Escribo — теперішній час. В імперфекті: escribía.'),
                                       ('escribí', 'Escribí — pretérito indefinido. Тут потрібна форма імперфекту: escribía.')])},
          [((ER_S,), R_ER_S)])

    # --- imperfecto.regular-er-ir.plural (+ ia-accent) -------------------------------------
    ftask(t, 'supported', 'home-before', P2, 'Antes nosotros ___ en casa de mis padres los domingos.', 'comer', 'comíamos',
          [('comiamos', 'ci', acc_missing('comíamos')),
           ('comemos', 'iu', 'Comemos — теперішній час. В імперфекті: comíamos.'),
           ('comimos', 'iu', 'Comimos — pretérito indefinido. Тут потрібна форма імперфекту: comíamos.'),
           ('comían', 'iu', 'Comían — форма для ellos. Для nosotros: comíamos.')],
          rp, model='Зразок: comer → nosotros comíamos, vosotros comíais, ellos comían.')
    ftask(t, 'supported', 'work-before', P2, 'Antes mis amigos ___ en el centro.', 'vivir', 'vivían',
          [('vivian', 'ci', acc_missing('vivían')),
           ('viven', 'iu', 'Viven — теперішній час. В імперфекті: vivían.'),
           ('vivieron', 'iu', 'Vivieron — pretérito indefinido. Тут потрібна форма імперфекту: vivían.'),
           ('vivía', 'iu', 'Vivía — форма однини. Mis amigos — множина: vivían.')],
          rp, model='Зразок: vivir → ellos vivían.')
    ftask(t, 'independent', 'home-before', P2, '¿Antes vosotros ___ muchos libros?', 'leer', 'leíais',
          [('leiais', 'ci', acc_missing('leíais')),
           ('leéis', 'iu', 'Leéis — теперішній час. В імперфекті: leíais.'),
           ('leísteis', 'iu', 'Leísteis — pretérito indefinido. Тут потрібна форма імперфекту: leíais.'),
           ('leían', 'iu', 'Leían — форма для ellos або ustedes. Для vosotros: leíais.')],
          rp)
    ftask(t, 'independent', 'work-before', P2, 'Antes Pablo y yo ___ cerca de la estación.', 'vivir', 'vivíamos',
          [('viviamos', 'ci', acc_missing('vivíamos')),
           ('vivimos', 'iu', 'Vivimos — теперішній час (або pretérito indefinido). В імперфекті: vivíamos.'),
           ('vivían', 'iu', 'Pablo y yo — це nosotros. Потрібна форма vivíamos.')],
          rp)
    ftask(t, 'independent', 'home-before', P2, 'Antes mis hermanos ___ por el parque todos los días.', 'correr', 'corrían',
          [('corrian', 'ci', acc_missing('corrían')),
           ('corren', 'iu', 'Corren — теперішній час. В імперфекті: corrían.'),
           ('corrieron', 'iu', 'Corrieron — pretérito indefinido. Тут потрібна форма імперфекту: corrían.'),
           ('corría', 'iu', 'Corría — форма однини. Mis hermanos — множина: corrían.')],
          rp)
    stask(t, 'independent', 'work-before', [ER_P], 'Antes vosotros {a} encima de la tienda y vuestros padres la {b} a las nueve.', 'vivir, abrir',
          {'a': (ER_P, ['vivíais'], [('vivís', 'Vivís — теперішній час. В імперфекті: vivíais.'),
                                      ('vivían', 'Vivían — форма для ellos. Для vosotros: vivíais.')]),
           'b': (ER_P, ['abrían'], [('abren', 'Abren — теперішній час. В імперфекті: abrían.'),
                                     ('abrieron', 'Abrieron — pretérito indefinido. Тут потрібна форма імперфекту: abrían.'),
                                     ('abría', 'Abría — форма однини. Vuestros padres — множина: abrían.')])},
          [((ER_P,), R_ER_P)])
    ftask(t, 'delayed', 'home-before', P2, 'Antes nosotros ___ mensajes muy largos.', 'escribir', 'escribíamos',
          [('escribiamos', 'ci', acc_missing('escribíamos')),
           ('escribimos', 'iu', 'Escribimos — теперішній час (або pretérito indefinido). В імперфекті: escribíamos.'),
           ('escribían', 'iu', 'Escribían — форма для ellos. Для nosotros: escribíamos.')],
          rp)
    ftask(t, 'delayed', 'work-before', P2, '¿Antes ustedes ___ cerca de aquí?', 'vivir', 'vivían',
          [('vivian', 'ci', acc_missing('vivían')),
           ('vivíais', 'iu', 'Vivíais — форма для vosotros. З ustedes вживаємо форму ellos: vivían.'),
           ('viven', 'iu', 'Viven — теперішній час. В імперфекті: vivían.')],
          rp)
    ftask(t, 'transfer', 'school-before', P2, 'Antes, en clase, los estudiantes ___ mucho con el profesor.', 'aprender', 'aprendían',
          [('aprendian', 'ci', acc_missing('aprendían')),
           ('aprenden', 'iu', 'Aprenden — теперішній час. В імперфекті: aprendían.'),
           ('aprendieron', 'iu', 'Aprendieron — pretérito indefinido. Тут потрібна форма імперфекту: aprendían.')],
          rp)
    stask(t, 'transfer', 'school-before', [ER_P], 'Antes, en la universidad, nosotros {a} muchos libros y vosotros {b} mucho.', 'leer, escribir',
          {'a': (ER_P, ['leíamos'], [('leemos', 'Leemos — теперішній час. В імперфекті: leíamos.'),
                                      ('leímos', 'Leímos — pretérito indefinido. Тут потрібна форма імперфекту: leíamos.')]),
           'b': (ER_P, ['escribíais'], [('escribís', 'Escribís — теперішній час. В імперфекті: escribíais.'),
                                         ('escribisteis', 'Escribisteis — pretérito indefinido. Тут потрібна форма імперфекту: escribíais.')])},
          [((ER_P,), R_ER_P)])

    # --- imperfecto.present-irregulars-regular (+ ia-accent on -er/-ir verbs) --------------
    PI2 = [PIR, IA]
    rpi = [((PIR,), R_PIR), ((IA,), R_IA)]
    ftask(t, 'supported', 'home-before', PI2, 'Antes yo no ___ dormir bien.', 'poder', 'podía',
          [('podia', 'ci', acc_missing('podía')),
           ('puedía', 'iu', 'В імперфекті чергування o → ue немає: основа з інфінітива — podía.'),
           ('puedo', 'iu', 'Puedo — теперішній час. В імперфекті: podía.'),
           ('pude', 'iu', 'Pude — pretérito indefinido. Тут потрібна форма імперфекту: podía.')],
          rpi, model='Зразок: poder — у теперішньому часі puedo, а в імперфекті podía (без -ue-).')
    ftask(t, 'supported', 'work-before', PI2, 'Antes mi hermano ___ trabajar en un hotel.', 'querer', 'quería',
          [('queria', 'ci', acc_missing('quería')),
           ('quiería', 'iu', 'Чергування e → ie в імперфект не переходить: quería.'),
           ('quiere', 'iu', 'Quiere — теперішній час. В імперфекті: quería.'),
           ('quiso', 'iu', 'Quiso — pretérito indefinido. Тут потрібна форма імперфекту: quería.')],
          rpi, model='Зразок: querer — у теперішньому часі quiero, а в імперфекті quería (без -ie-).')
    ftask(t, 'independent', 'home-before', [PIR], 'Antes mis hijos ___ en el parque por la tarde.', 'jugar', 'jugaban',
          [('juegaban', 'i', 'Чергування u → ue (juego) в імперфект не переходить: jugaban.'),
           ('juegan', 'i', 'Juegan — теперішній час. В імперфекті: jugaban.'),
           ('jugaron', 'i', 'Jugaron — pretérito indefinido. Тут потрібна форма імперфекту: jugaban.')],
          [((PIR,), R_PIR)])
    ftask(t, 'independent', 'work-before', PI2, 'Antes tú ___ a casa muy tarde.', 'volver', 'volvías',
          [('volvias', 'ci', acc_missing('volvías')),
           ('vuelvías', 'iu', 'Чергування o → ue (vuelvo) в імперфект не переходить: volvías.'),
           ('vuelves', 'iu', 'Vuelves — теперішній час. В імперфекті: volvías.'),
           ('volviste', 'iu', 'Volviste — pretérito indefinido. Тут потрібна форма імперфекту: volvías.')],
          rpi)
    ftask(t, 'independent', 'home-before', PI2, 'Antes, los domingos, mi madre ___ la comida.', 'hacer', 'hacía',
          [('hacia', 'ci', 'Форму утворено правильно, але бракує знака наголосу: hacía. (Hacia без знака — інше слово, прийменник «до, у напрямку».)'),
           ('hagía', 'iu', 'Основа hag- з теперішнього часу (hago) в імперфект не переходить: hacía.'),
           ('hace', 'iu', 'Hace — теперішній час. В імперфекті: hacía.'),
           ('hizo', 'iu', 'Hizo — pretérito indefinido. Тут потрібна форма імперфекту: hacía.')],
          rpi)
    t.choice('independent', 'work-before', [PIR],
             [P('Яка форма імперфекту дієслова tener правильна?')],
             [('tengía', 'i', 'Основа teng- з теперішнього часу (tengo) в імперфект не переходить: tenía.'),
              ('tenía', 'c', None),
              ('tienía', 'i', 'Чергування e → ie (tienes) в імперфект не переходить: tenía.')],
             [rule([PIR], R_PIR)],
             ('Правильно: tenía — основа з інфінітива tener.', 'Ні. Правильно: tenía — в імперфекті основа береться з інфінітива.'))
    ftask(t, 'delayed', 'home-before', PI2, 'Antes yo ___ muy poco.', 'dormir', 'dormía',
          [('dormia', 'ci', acc_missing('dormía')),
           ('duermía', 'iu', 'Чергування o → ue (duermo) в імперфект не переходить: dormía.'),
           ('duermo', 'iu', 'Duermo — теперішній час. В імперфекті: dormía.'),
           ('dormí', 'iu', 'Dormí — pretérito indefinido. Тут потрібна форма імперфекту: dormía.')],
          rpi)
    ftask(t, 'delayed', 'work-before', [PIR], 'Antes Marta ___ a trabajar a las siete.', 'empezar', 'empezaba',
          [('empiezaba', 'i', 'Чергування e → ie (empiezo) в імперфект не переходить: empezaba.'),
           ('empieza', 'i', 'Empieza — теперішній час. В імперфекті: empezaba.'),
           ('empezó', 'i', 'Empezó — pretérito indefinido. Тут потрібна форма імперфекту: empezaba.')],
          [((PIR,), R_PIR)])
    ftask(t, 'transfer', 'message', PI2, 'Hola, Pablo: ¡Qué bien! Antes nunca ___ tiempo para nada y ahora tienes vacaciones.', 'tener, tú', 'tenías',
          [('tenias', 'ci', acc_missing('tenías')),
           ('tengías', 'iu', 'Основа teng- з теперішнього часу (tengo) в імперфект не переходить: tenías.'),
           ('tienías', 'iu', 'Чергування e → ie (tienes) в імперфект не переходить: tenías.'),
           ('tienes', 'iu', 'Tienes — теперішній час. В імперфекті: tenías.'),
           ('tuviste', 'iu', 'Tuviste — pretérito indefinido. Тут потрібна форма імперфекту: tenías.')],
          rpi)
    t.choice('transfer', 'cafe', [PIR],
             [P('У якому реченні форма імперфекту правильна?')],
             [('Antes Luis siempre pidía un café.', 'i', 'Чергування e → i (pido) в імперфект не переходить: pedía.'),
              ('Antes Luis siempre pedía un café.', 'c', None),
              ('Antes Luis siempre pidió un café.', 'i', 'Pidió — pretérito indefinido. Для звички в минулому тут потрібна форма імперфекту: pedía.')],
             [rule([PIR], R_PIR)],
             ('Правильно: pedía — основа з інфінітива pedir.', 'Ні. Правильно: Antes Luis siempre pedía un café.'))

    # --- person-1s-3s revisited ----------------------------------------------------------
    t.choice('independent', 'story', [P13],
             [P('Прочитайте і визначте, як найприродніше зрозуміти текст.'),
              PE('Mi hermana vivía en Valencia. Tenía un piso pequeño en el centro.'),
              P('Хто, найпевніше, мав маленьку квартиру в центрі?')],
             [('той, хто розповідає (я)', 'i', 'Формально tenía може означати і «я мав (мала)», але без нового підмета друге речення природно продовжує розповідь про mi hermana.'),
              ('сестра', 'c', None),
              ('батьки сестри', 'i', 'Про батьків у тексті не йдеться, а tenía — форма однини.')],
             [rule([P13], R_P13)],
             ('Правильно: tenía тут продовжує розповідь про сестру.', 'Ні. Tenía продовжує розповідь про mi hermana.'))
    t.choice('delayed', 'dialogue', [P13],
             [P('Прочитайте діалог і дайте відповідь.'),
              PE('—¿Dónde vivías antes? —Vivía en Toledo, en un piso con dos amigos.'),
              P('Хто жив у Толедо?')],
             [('лише двоє друзів', 'i', 'Vivía — форма однини: людина відповідає на питання ¿Dónde vivías? про себе (вона жила там разом із друзями).'),
              ('з тексту неможливо визначити', 'i', 'Контекст тут достатній: на питання до tú (vivías) людина відповідає про себе.'),
              ('той, хто відповідає', 'c', None)],
             [rule([P13], R_P13)],
             ('Правильно: на питання ¿Dónde vivías? людина відповідає про себе — vivía (yo).', 'Ні. Vivía тут — відповідь про себе: «я жив (жила) в Толедо».'))

    sup = [x['id'] for x in t.tasks if x['role'] == 'supported']
    ind = [x['id'] for x in t.tasks if x['role'] == 'independent']
    assert len(t.tasks) == 32, len(t.tasks)
    body = lesson(
        'A2-05-L2', 'lesson', BLOCK,
        'Імперфект дієслів на -er та -ir: comía, vivíamos',
        'pretérito imperfecto: verbos en -er/-ir',
        'Утворюємо імперфект дієслів на -er та -ir (закінчення -ía, -ías, -ía, -íamos, -íais, -ían), пишемо знак '
        'наголосу на í і бачимо, що зміни основи теперішнього часу (puedo, quiero, tengo) в імперфект не переходять.',
        ['A2-05-O2', 'A2-05-O4'], [], ['routine-study-leisure', 'people-family-home'], 18,
        ['imperfecto.regular-er-ir.singular', 'imperfecto.regular-er-ir.plural', 'imperfecto.ia-accent',
         'imperfecto.present-irregulars-regular'],
        ['imperfecto.regular-ar.singular', 'imperfecto.regular-ar.plural', 'imperfecto.person-1s-3s',
         'present.regular-er', 'present.regular-ir', 'present.stem-e-ie', 'present.stem-o-ue', 'present.stem-e-i',
         'present.jugar', 'present.yo-g'],
        [
            step('s1', 'explanation', 'Закінчення -ía для дієслів на -er та -ir', True, blocks=[
                P('Дієслова на -er та -ir мають в імперфекті однакові закінчення: відкидаємо -er або -ir і додаємо '
                  '-ía, -ías, -ía, -íamos, -íais, -ían. Не плутайте їх із -aba: це закінчення лише для дієслів на -ar.'),
                ER_TABLE,
                P('У закінченні -ía голосні i та a належать до різних складів, і наголос падає на í (co-MÍ-a). Щоб це '
                  'показати, над í в усіх особах пишемо знак наголосу: comía, vivíamos, tenían.'),
                P('Як і в дієсловах на -ar, форма yo збігається з формою él, ella, usted: yo comía — ella comía.'),
            ]),
            step('s2', 'explanation', 'Неправильні в теперішньому — правильні в імперфекті', True, blocks=[
                P('В імперфекті неправильних дієслів лише три — ser, ir і ver (їх вивчимо в наступному уроці). Усі інші '
                  'дієслова правильні, навіть ті, що змінюються в теперішньому часі: основу беремо з інфінітива. '
                  'Чергування e → ie, o → ue, e → i, u → ue і форми на -go в імперфект не переходять.'),
                PIR_TABLE,
            ]),
            step('s3', 'examples', 'Приклади', True, blocks=[
                EX('Antes mi hermana vivía en Valencia.', 'Раніше моя сестра жила у Валенсії.'),
                EX('Antes yo leía mucho por la noche.', 'Раніше я багато читав (читала) ввечері.'),
                EX('¿Antes comíais en casa?', 'Ви (кілька людей) раніше обідали вдома?'),
                EX('Antes yo no podía dormir bien.', 'Раніше я не міг (не могла) добре спати.'),
                EX('Antes mis padres tenían una tienda.', 'Раніше мої батьки мали крамницю.'),
                EX('Antes Luis siempre pedía un café.', 'Раніше Луїс завжди замовляв каву.'),
                EX('Antes los niños hacían los deberes por la tarde.', 'Раніше діти робили домашнє завдання після обіду.'),
                P('Нове слово: los deberes — домашнє завдання (hacer los deberes — робити домашнє завдання).'),
            ]),
            step('s4', 'supported-practice', 'Практика зі зразком', True, tasks=sup),
            step('s5', 'independent-practice', 'Самостійна практика', True, tasks=ind),
            step('s6', 'summary', 'Підсумок', True, blocks=[
                BL(['Дієслова на -er та -ir: основа + -ía, -ías, -ía, -íamos, -íais, -ían.',
                    'Знак наголосу на í — в усіх особах: comía, comíamos, comían.',
                    'Чергування й форми на -go з теперішнього часу в імперфект не переходять: podía, quería, tenía, hacía, jugaba.',
                    'Неправильні в імперфекті лише ser, ir, ver — про них наступний урок.']),
            ]),
        ],
    )
    return body, t.tasks


def MATERIALS():
    from build import LINK, material
    return [
        material('material.a2-05.er-ir-paradigm', 'A2-05-L2', 'Імперфект дієслів на -er та -ir: таблиця форм', [
            P('Дієслова на -er та -ir в імперфекті: основа + -ía, -ías, -ía, -íamos, -íais, -ían. Знак наголосу на í — в усіх особах.'),
            ER_TABLE,
            P('Зміни основи теперішнього часу (puedo, quiero, tengo, hago) в імперфект не переходять: основа з інфінітива — podía, quería, tenía, hacía. Винятки — ser, ir, ver (era, iba, veía) — мають особливі форми.'),
            PIR_TABLE,
            LINK('Потренувати форми на -er та -ir', [ER_S, ER_P, IA, PIR], 'written', 10),
        ], [ER_S, ER_P, IA, PIR]),
    ]


LESSONS = [l2]

SKILL_PATCHES = {
    'imperfecto.present-irregulars-regular': {
        'titleUk': 'Зміни основи теперішнього часу в імперфект не переходять',
        'ruleUk': 'Зміни основи, які дієслово має в теперішньому часі (puedo, quiero, tengo, hago), в імперфекті не '
                  'відбуваються: основа береться з інфінітива. Poder → podía, querer → quería, tener → tenía, hacer → '
                  'hacía. Винятки — ser, ir, ver (era, iba, veía) — мають особливі форми й вивчаються окремо.',
        'prerequisites': ['imperfecto.regular-ar.singular', 'imperfecto.regular-ar.plural', 'imperfecto.regular-er-ir.singular',
                          'imperfecto.regular-er-ir.plural', 'present.stem-e-ie', 'present.stem-o-ue', 'present.yo-g'],
    },
    'imperfecto.ia-accent': {
        'bankJustificationUk': 'Знак наголосу на í перевіряється в кожному завданні з формою на -ía (правильні дієслова на -er '
                               'та -ir, ver, había) окремою ціллю, тому банк навмисно більший за 12 завдань; окремі завдання '
                               'лише на знак не потрібні.',
    },
}
