"""A2-05 — pretérito imperfecto: lesson, task, clip and material data (issue #111, brief 09).

All Spanish is Peninsular (Spain) Spanish; all instructions, hints and feedback are Ukrainian.
The written accent ´ is «знак наголосу» (content/README rule 6a). Generated JSON is canonical.
"""
from build import BL, EX, LINK, P, PE, TB, LessonTasks, gloss, lesson, material, reveal, rule, step

BLOCK = 'A2-05'

# Target keys (skillId/modality)
AR_S = 'imperfecto.regular-ar.singular/written-form'
AR_P = 'imperfecto.regular-ar.plural/written-form'
ABA = 'imperfecto.abamos-accent/written-form'
P13 = 'imperfecto.person-1s-3s/context-choice'


def fb_form(ans: str, why: str = '') -> tuple:
    return (
        f'Правильно: {ans}.' + (f' {why}' if why else ''),
        f'Ні. Правильна форма — {ans}.',
        f'Цю відповідь не вдалося перевірити автоматично. Порівняйте її з правильною формою: {ans}.',
    )


def fb_slots(answers: str) -> tuple:
    return (
        f'Правильно: {answers}.',
        f'Не всі форми правильні. Правильно: {answers}.',
        'Відповідь не вдалося перевірити автоматично: можливо, речення переписано не повністю або з іншими словами. '
        f'Порівняйте з правильним варіантом: {answers}.',
    )


AR_TABLE = TB(
    ['persona', 'hablar', 'trabajar', 'estar'],
    [
        ['yo', 'hablaba', 'trabajaba', 'estaba'],
        ['tú', 'hablabas', 'trabajabas', 'estabas'],
        ['él / ella / usted', 'hablaba', 'trabajaba', 'estaba'],
        ['nosotros / nosotras', 'hablábamos', 'trabajábamos', 'estábamos'],
        ['vosotros / vosotras', 'hablabais', 'trabajabais', 'estabais'],
        ['ellos / ellas / ustedes', 'hablaban', 'trabajaban', 'estaban'],
    ],
)

R_AR_S = 'Дієслова на -ar в імперфекті: основа + -aba (yo), -abas (tú), -aba (él, ella, usted).'
R_AR_P = 'У множині: основа + -ábamos (nosotros), -abais (vosotros), -aban (ellos, ellas, ustedes).'
R_ABA = ('Знак наголосу в імперфекті дієслів на -ar має лише форма nosotros: наголос падає на третій склад '
         'від кінця (ha-BLÁ-ba-mos). Hablaba, hablabais, hablaban пишуться без знака.')
R_P13 = ('В імперфекті форма yo збігається з формою él, ella, usted (hablaba). Якщо підмет не названо, '
         'зазвичай ідеться про ту саму особу, що й у попередньому реченні; якщо неясно — додаємо займенник.')

INSTR_FORM = 'Напишіть форму імперфекту дієслова в дужках.'
INSTR_SLOTS = 'Напишіть речення повністю, вставивши форми імперфекту дієслів у дужках.'


def ftask(t, role, fam, keys, sent, verb, ans, errs, rules, *, model=None, ex=None, instr=INSTR_FORM, fb=None):
    """One-gap exact-variants task: `sent` contains ___; rules = [(keys, text_uk), ...]."""
    full = sent.replace('___', ans)
    prompt = [P((model + ' ' if model else '') + instr)]
    if ex:
        prompt.append(EX(*ex))
    prompt.append(PE(f'{sent} ({verb})' if verb else sent))
    hints = [rule(list(k), txt) for k, txt in rules] + [reveal(keys, full)]
    return t.exact(role, fam, keys, prompt, [ans], errs, hints, fb or fb_form(ans), full)


def stask(t, role, fam, keys, tmpl, verbs, slotdefs, rules, *, instr=INSTR_SLOTS, model=None):
    """Two-gap finite-slots task written as a full sentence; tmpl uses {a}, {b}."""
    import re as _re
    display = _re.sub(r'\{[a-z]\}', '___', tmpl) + (f' ({verbs})' if verbs else '')
    answers = {k: v[1][0] for k, v in slotdefs.items()}
    full = tmpl.format(**answers)
    prompt = [P((model + ' ' if model else '') + instr), PE(display)]
    hints = [rule(list(k), txt) for k, txt in rules] + [reveal(keys, full)]
    return t.slots(role, fam, keys, prompt, tmpl, slotdefs, hints, fb_slots(', '.join(answers.values())), full)


# ============================================================================================
# A2-05-L1 — regular -ar forms (-aba)
# ============================================================================================

def l1():
    t = LessonTasks('A2-05-L1')
    S, PL = [AR_S], [AR_P, ABA]

    # --- imperfecto.regular-ar.singular (10) -----------------------------------------------
    t.exact('supported', 'home-before', S,
            [P('Зразок: estudiar → yo estudiaba. ' + INSTR_FORM),
             EX('Antes yo estudiaba por la tarde.', 'Раніше я вчився (вчилася) після обіду.'),
             PE('Antes yo ___ mucho por la tarde. (dibujar)')],
            ['dibujaba'],
            [('dibujo', 'i', 'Dibujo — теперішній час. Для минулого: dibuj- + -aba → dibujaba.'),
             ('dibujé', 'i', 'Dibujé — pretérito indefinido, інший минулий час. Тут потрібна форма імперфекту: dibujaba.'),
             ('dibujava', 'i', 'Закінчення імперфекту пишеться з b: -aba → dibujaba.'),
             ('dibujabas', 'i', 'Dibujabas — форма для tú. Для yo: dibujaba.')],
            [rule(S, 'Для yo: основа + -aba: dibujar → dibuj- → dibujaba.'), reveal(S, 'Antes yo dibujaba mucho por la tarde.')],
            fb_form('dibujaba'), 'Antes yo dibujaba mucho por la tarde.')
    t.exact('supported', 'work-before', S,
            [P('Зразок: estudiar → Ana estudiaba. ' + INSTR_FORM),
             EX('Antes Ana estudiaba en Madrid.', 'Раніше Ана навчалася в Мадриді.'),
             PE('Antes mi madre ___ en un banco. (trabajar)')],
            ['trabajaba'],
            [('trabaja', 'i', 'Trabaja — теперішній час. В імперфекті: trabajaba.'),
             ('trabajó', 'i', 'Trabajó — pretérito indefinido. Тут потрібна форма імперфекту: trabajaba.'),
             ('trabajaban', 'i', 'Trabajaban — форма множини. Mi madre — одна особа: trabajaba.'),
             ('trabajava', 'i', 'Закінчення імперфекту пишеться з b: trabajaba.')],
            [rule(S, 'Для él, ella, usted форма така сама, як для yo: trabajar → trabajaba.'), reveal(S, 'Antes mi madre trabajaba en un banco.')],
            fb_form('trabajaba'), 'Antes mi madre trabajaba en un banco.')
    t.exact('independent', 'home-before', S,
            [P(INSTR_FORM), PE('¿Antes ___ mucho con tu hermana? (hablar, tú)')],
            ['hablabas'],
            [('hablaba', 'i', 'Hablaba — форма для yo або él/ella/usted. Для tú додаємо -s: hablabas.'),
             ('hablas', 'i', 'Hablas — теперішній час. В імперфекті: hablabas.'),
             ('hablaste', 'i', 'Hablaste — pretérito indefinido. Тут потрібна форма імперфекту: hablabas.'),
             ('hablavas', 'i', 'Закінчення імперфекту пишеться з b: hablabas.')],
            [rule(S, 'Для tú: основа + -abas: hablar → hablabas.'), reveal(S, '¿Antes hablabas mucho con tu hermana?')],
            fb_form('hablabas'), '¿Antes hablabas mucho con tu hermana?')
    t.exact('independent', 'work-before', S,
            [P(INSTR_FORM), PE('Antes mi hermano ___ en la universidad. (estudiar)')],
            ['estudiaba'],
            [('estudia', 'i', 'Estudia — теперішній час. В імперфекті: estudiaba.'),
             ('estudió', 'i', 'Estudió — pretérito indefinido. Тут потрібна форма імперфекту: estudiaba.'),
             ('estudiaban', 'i', 'Estudiaban — форма множини. Mi hermano — одна особа: estudiaba.'),
             ('estudiava', 'i', 'Закінчення імперфекту пишеться з b: estudiaba.')],
            [rule(S, R_AR_S), reveal(S, 'Antes mi hermano estudiaba en la universidad.')],
            fb_form('estudiaba'), 'Antes mi hermano estudiaba en la universidad.')
    t.slots('independent', 'home-before', S,
            [P(INSTR_SLOTS), PE('Antes yo ___ la cena y mi hermano ___ la fruta. (cocinar, comprar)')],
            'Antes yo {a} la cena y mi hermano {b} la fruta.',
            {'a': (AR_S, ['cocinaba'], [('cocino', 'Cocino — теперішній час. В імперфекті: cocinaba.'),
                                        ('cociné', 'Cociné — pretérito indefinido. Тут потрібна форма імперфекту: cocinaba.')]),
             'b': (AR_S, ['compraba'], [('compra', 'Compra — теперішній час. В імперфекті: compraba.'),
                                        ('compró', 'Compró — pretérito indefinido. Тут потрібна форма імперфекту: compraba.'),
                                        ('compraban', 'Compraban — форма множини. Mi hermano — одна особа: compraba.')])},
            [rule(S, R_AR_S + ' Форма yo така сама, як для él.'), reveal(S, 'Antes yo cocinaba la cena y mi hermano compraba la fruta.')],
            fb_slots('cocinaba, compraba'), 'Antes yo cocinaba la cena y mi hermano compraba la fruta.')
    t.exact('independent', 'work-before', S,
            [P(INSTR_FORM), PE('¿Usted ___ aquí antes? (trabajar)')],
            ['trabajaba'],
            [('trabajabas', 'i', 'Trabajabas — форма для tú. З usted вживаємо форму él/ella: trabajaba.'),
             ('trabaja', 'i', 'Trabaja — теперішній час. В імперфекті: trabajaba.'),
             ('trabajó', 'i', 'Trabajó — pretérito indefinido. Тут потрібна форма імперфекту: trabajaba.')],
            [rule(S, 'З usted вживаємо ту саму форму, що й з él, ella: trabajaba.'), reveal(S, '¿Usted trabajaba aquí antes?')],
            fb_form('trabajaba'), '¿Usted trabajaba aquí antes?')
    t.exact('delayed', 'home-before', S,
            [P(INSTR_FORM), PE('Antes tú ___ la cena todos los días. (cocinar)')],
            ['cocinabas'],
            [('cocinaba', 'i', 'Cocinaba — форма для yo або él/ella. Для tú: cocinabas.'),
             ('cocinas', 'i', 'Cocinas — теперішній час. В імперфекті: cocinabas.'),
             ('cocinaste', 'i', 'Cocinaste — pretérito indefinido. Тут потрібна форма імперфекту: cocinabas.')],
            [rule(S, R_AR_S), reveal(S, 'Antes tú cocinabas la cena todos los días.')],
            fb_form('cocinabas'), 'Antes tú cocinabas la cena todos los días.')
    t.exact('delayed', 'work-before', S,
            [P(INSTR_FORM), PE('Antes Pablo ___ el autobús a las ocho. (tomar)')],
            ['tomaba'],
            [('toma', 'i', 'Toma — теперішній час. В імперфекті: tomaba.'),
             ('tomó', 'i', 'Tomó — pretérito indefinido. Тут потрібна форма імперфекту: tomaba.'),
             ('tomava', 'i', 'Закінчення імперфекту пишеться з b: tomaba.')],
            [rule(S, R_AR_S), reveal(S, 'Antes Pablo tomaba el autobús a las ocho.')],
            fb_form('tomaba'), 'Antes Pablo tomaba el autobús a las ocho.')
    t.exact('transfer', 'holidays-before', S,
            [P(INSTR_FORM), PE('Antes, en verano, yo ___ por la playa con mi perro. (pasear)')],
            ['paseaba'],
            [('paseo', 'i', 'Paseo — теперішній час. В імперфекті: paseaba.'),
             ('paseé', 'i', 'Paseé — pretérito indefinido. Тут потрібна форма імперфекту: paseaba.'),
             ('paseava', 'i', 'Закінчення імперфекту пишеться з b: paseaba.')],
            [rule(S, R_AR_S), reveal(S, 'Antes, en verano, yo paseaba por la playa con mi perro.')],
            fb_form('paseaba'), 'Antes, en verano, yo paseaba por la playa con mi perro.')
    t.slots('transfer', 'holidays-before', S,
            [P(INSTR_SLOTS), PE('Antes, en vacaciones, mi hermana ___ mucho y yo ___ en casa. (viajar, descansar)')],
            'Antes, en vacaciones, mi hermana {a} mucho y yo {b} en casa.',
            {'a': (AR_S, ['viajaba'], [('viaja', 'Viaja — теперішній час. В імперфекті: viajaba.'),
                                       ('viajó', 'Viajó — pretérito indefinido. Тут потрібна форма імперфекту: viajaba.')]),
             'b': (AR_S, ['descansaba'], [('descanso', 'Descanso — теперішній час. В імперфекті: descansaba.'),
                                          ('descansé', 'Descansé — pretérito indefinido. Тут потрібна форма імперфекту: descansaba.')])},
            [rule(S, R_AR_S), reveal(S, 'Antes, en vacaciones, mi hermana viajaba mucho y yo descansaba en casa.')],
            fb_slots('viajaba, descansaba'), 'Antes, en vacaciones, mi hermana viajaba mucho y yo descansaba en casa.')

    # --- imperfecto.regular-ar.plural + imperfecto.abamos-accent (10 + 10) ---------------
    acc_missing = 'Форму утворено правильно, але бракує знака наголосу: {}.'
    acc_extra = 'Форму утворено правильно, але знак наголосу тут зайвий: {}. Знак має лише форма nosotros.'
    t.exact('supported', 'home-before', PL,
            [P('Зразок: trabajar → nosotros trabajábamos, vosotros trabajabais, ellos trabajaban. ' + INSTR_FORM),
             PE('Antes nosotros ___ en casa los domingos. (cenar)')],
            ['cenábamos'],
            [('cenabamos', 'ci', acc_missing.format('cenábamos')),
             ('cenamos', 'iu', 'Cenamos — теперішній час (або pretérito indefinido). В імперфекті: cenábamos.'),
             ('cenaban', 'iu', 'Cenaban — форма для ellos. Для nosotros: cenábamos.'),
             ('cenabais', 'iu', 'Cenabais — форма для vosotros. Для nosotros: cenábamos.')],
            [rule([AR_P], 'Nosotros: основа + -ábamos: cenar → cenábamos.'),
             rule([ABA], 'У формі nosotros наголос падає на третій склад від кінця (ce-NÁ-ba-mos), тому пишемо знак наголосу: cenábamos.'),
             reveal(PL, 'Antes nosotros cenábamos en casa los domingos.')],
            fb_form('cenábamos'), 'Antes nosotros cenábamos en casa los domingos.')
    t.exact('supported', 'work-before', PL,
            [P('Зразок: estudiar → ellos estudiaban. ' + INSTR_FORM), PE('Antes mis padres ___ en una tienda. (trabajar)')],
            ['trabajaban'],
            [('trabajában', 'ci', acc_extra.format('trabajaban')),
             ('trabajan', 'iu', 'Trabajan — теперішній час. В імперфекті: trabajaban.'),
             ('trabajaron', 'iu', 'Trabajaron — pretérito indefinido. Тут потрібна форма імперфекту: trabajaban.'),
             ('trabajaba', 'iu', 'Trabajaba — форма однини. Mis padres — множина: trabajaban.')],
            [rule([AR_P], 'Ellos, ellas, ustedes: основа + -aban: trabajar → trabajaban.'),
             rule([ABA], R_ABA), reveal(PL, 'Antes mis padres trabajaban en una tienda.')],
            fb_form('trabajaban'), 'Antes mis padres trabajaban en una tienda.')
    t.exact('independent', 'home-before', PL,
            [P(INSTR_FORM), PE('¿Antes vosotros ___ mucho? (viajar)')],
            ['viajabais'],
            [('viajábais', 'ci', acc_extra.format('viajabais')),
             ('viajabáis', 'ci', 'Форму утворено правильно, але знак наголосу тут зайвий: viajabais. Знак має теперішній час (viajáis), а в імперфекті vosotros пишеться без знака.'),
             ('viajáis', 'iu', 'Viajáis — теперішній час. В імперфекті: viajabais.'),
             ('viajasteis', 'iu', 'Viajasteis — pretérito indefinido. Тут потрібна форма імперфекту: viajabais.'),
             ('viajaban', 'iu', 'Viajaban — форма для ellos або ustedes. Для vosotros: viajabais.')],
            [rule([AR_P], 'Vosotros: основа + -abais: viajar → viajabais.'), rule([ABA], R_ABA),
             reveal(PL, '¿Antes vosotros viajabais mucho?')],
            fb_form('viajabais'), '¿Antes vosotros viajabais mucho?')
    t.exact('independent', 'work-before', PL,
            [P(INSTR_FORM), PE('Antes Ana y yo ___ en una oficina. (trabajar)')],
            ['trabajábamos'],
            [('trabajabamos', 'ci', acc_missing.format('trabajábamos')),
             ('trabajamos', 'iu', 'Trabajamos — теперішній час (або pretérito indefinido). В імперфекті: trabajábamos.'),
             ('trabajaban', 'iu', 'Ana y yo — це nosotros. Потрібна форма trabajábamos.')],
            [rule([AR_P], 'Ana y yo = nosotros: основа + -ábamos.'), rule([ABA], R_ABA),
             reveal(PL, 'Antes Ana y yo trabajábamos en una oficina.')],
            fb_form('trabajábamos'), 'Antes Ana y yo trabajábamos en una oficina.')
    t.exact('independent', 'home-before', PL,
            [P(INSTR_FORM), PE('Antes mis hermanos ___ música por la noche. (escuchar)')],
            ['escuchaban'],
            [('escuchában', 'ci', acc_extra.format('escuchaban')),
             ('escuchan', 'iu', 'Escuchan — теперішній час. В імперфекті: escuchaban.'),
             ('escucharon', 'iu', 'Escucharon — pretérito indefinido. Тут потрібна форма імперфекту: escuchaban.'),
             ('escuchaba', 'iu', 'Escuchaba — форма однини. Mis hermanos — множина: escuchaban.')],
            [rule([AR_P], R_AR_P), rule([ABA], R_ABA), reveal(PL, 'Antes mis hermanos escuchaban música por la noche.')],
            fb_form('escuchaban'), 'Antes mis hermanos escuchaban música por la noche.')
    t.slots('independent', 'work-before', [AR_P],
            [P(INSTR_SLOTS), PE('Antes vosotros ___ en Madrid y vuestros amigos ___ en Sevilla. (estudiar, trabajar)')],
            'Antes vosotros {a} en Madrid y vuestros amigos {b} en Sevilla.',
            {'a': (AR_P, ['estudiabais'], [('estudiáis', 'Estudiáis — теперішній час. В імперфекті: estudiabais.'),
                                           ('estudiaban', 'Estudiaban — форма для ellos. Для vosotros: estudiabais.')]),
             'b': (AR_P, ['trabajaban'], [('trabajan', 'Trabajan — теперішній час. В імперфекті: trabajaban.'),
                                          ('trabajabais', 'Trabajabais — форма для vosotros. Vuestros amigos — це ellos: trabajaban.')])},
            [rule([AR_P], R_AR_P), reveal([AR_P], 'Antes vosotros estudiabais en Madrid y vuestros amigos trabajaban en Sevilla.')],
            fb_slots('estudiabais, trabajaban'), 'Antes vosotros estudiabais en Madrid y vuestros amigos trabajaban en Sevilla.')
    t.choice('independent', 'spelling', [ABA],
             [P('Оберіть правильно написану форму nosotros дієслова hablar в імперфекті.')],
             [('hablabamos', 'i', 'Бракує знака наголосу: наголос падає на третій склад від кінця — hablábamos.'),
              ('hablábamos', 'c', None),
              ('hablabámos', 'i', 'Знак стоїть не на тому складі: ha-BLÁ-ba-mos → hablábamos.')],
             [rule([ABA], 'Наголос у формі nosotros падає на третій склад від кінця: ha-BLÁ-ba-mos. Такі слова завжди пишуться зі знаком наголосу.')],
             ('Правильно: hablábamos.', 'Ні. Правильно: hablábamos — знак наголосу над a перед -bamos.'))
    t.exact('delayed', 'work-before', PL,
            [P(INSTR_FORM), PE('Antes nosotros ___ a la oficina a las nueve. (llegar)')],
            ['llegábamos'],
            [('llegabamos', 'ci', acc_missing.format('llegábamos')),
             ('llegamos', 'iu', 'Llegamos — теперішній час (або pretérito indefinido). В імперфекті: llegábamos.'),
             ('llegaban', 'iu', 'Llegaban — форма для ellos. Для nosotros: llegábamos.')],
            [rule([AR_P], R_AR_P), rule([ABA], R_ABA), reveal(PL, 'Antes nosotros llegábamos a la oficina a las nueve.')],
            fb_form('llegábamos'), 'Antes nosotros llegábamos a la oficina a las nueve.')
    t.exact('delayed', 'home-before', PL,
            [P(INSTR_FORM), PE('Antes vosotros ___ por el parque después de comer. (pasear)')],
            ['paseabais'],
            [('paseábais', 'ci', acc_extra.format('paseabais')),
             ('paseáis', 'iu', 'Paseáis — теперішній час. В імперфекті: paseabais.'),
             ('paseasteis', 'iu', 'Paseasteis — pretérito indefinido. Тут потрібна форма імперфекту: paseabais.'),
             ('paseaban', 'iu', 'Paseaban — форма для ellos або ustedes. Для vosotros: paseabais.')],
            [rule([AR_P], R_AR_P), rule([ABA], R_ABA), reveal(PL, 'Antes vosotros paseabais por el parque después de comer.')],
            fb_form('paseabais'), 'Antes vosotros paseabais por el parque después de comer.')
    t.choice('delayed', 'spelling', [ABA],
             [P('У якому реченні всі форми написано правильно?')],
             [('Antes estabamos en casa y cenabamos a las nueve.', 'i', 'Бракує знаків наголосу: estábamos, cenábamos.'),
              ('Antes estábamos en casa y cenabámos a las nueve.', 'i', 'У cenábamos знак стоїть на третьому складі від кінця: ce-NÁ-ba-mos.'),
              ('Antes estábamos en casa y cenábamos a las nueve.', 'c', None)],
             [rule([ABA], R_ABA)],
             ('Правильно: estábamos, cenábamos — обидві форми nosotros мають знак наголосу.',
              'Ні. Правильно: Antes estábamos en casa y cenábamos a las nueve.'))
    t.exact('transfer', 'holidays-before', PL,
            [P(INSTR_FORM), PE('Antes, en vacaciones, mis amigos y yo ___ mucho. (bailar)')],
            ['bailábamos'],
            [('bailabamos', 'ci', acc_missing.format('bailábamos')),
             ('bailamos', 'iu', 'Bailamos — теперішній час (або pretérito indefinido). В імперфекті: bailábamos.'),
             ('bailaban', 'iu', 'Mis amigos y yo — це nosotros. Потрібна форма bailábamos.')],
            [rule([AR_P], 'Mis amigos y yo = nosotros: основа + -ábamos.'), rule([ABA], R_ABA),
             reveal(PL, 'Antes, en vacaciones, mis amigos y yo bailábamos mucho.')],
            fb_form('bailábamos'), 'Antes, en vacaciones, mis amigos y yo bailábamos mucho.')
    t.slots('transfer', 'holidays-before', [AR_P],
            [P(INSTR_SLOTS), PE('Antes, en verano, mis hermanas ___ en un hotel y vosotros ___ en la playa. (trabajar, estar)')],
            'Antes, en verano, mis hermanas {a} en un hotel y vosotros {b} en la playa.',
            {'a': (AR_P, ['trabajaban'], [('trabajan', 'Trabajan — теперішній час. В імперфекті: trabajaban.'),
                                          ('trabajaron', 'Trabajaron — pretérito indefinido. Тут потрібна форма імперфекту: trabajaban.'),
                                          ('trabajaba', 'Trabajaba — форма однини. Mis hermanas — множина: trabajaban.')]),
             'b': (AR_P, ['estabais'], [('estáis', 'Estáis — теперішній час. В імперфекті: estabais.'),
                                        ('estuvisteis', 'Estuvisteis — pretérito indefinido. Тут потрібна форма імперфекту: estabais.'),
                                        ('estaban', 'Estaban — форма для ellos. Для vosotros: estabais.')])},
            [rule([AR_P], R_AR_P + ' Estar в імперфекті правильне: estaba, estabais, estaban.'),
             reveal([AR_P], 'Antes, en verano, mis hermanas trabajaban en un hotel y vosotros estabais en la playa.')],
            fb_slots('trabajaban, estabais'), 'Antes, en verano, mis hermanas trabajaban en un hotel y vosotros estabais en la playa.')

    # --- imperfecto.person-1s-3s (context-choice, 6) --------------------------------------
    no_ctx = 'Контекст тут достатній: '
    t.choice('supported', 'story', [P13],
             [P('Форма trabajaba може означати «я працював (працювала)» або «він (вона) працював (працювала)». '
                'Прочитайте і визначте, про кого йдеться.'),
              PE('Mi madre trabajaba en una tienda. Hablaba mucho con la gente.'),
              P('Хто багато розмовляв з людьми?')],
             [('мама', 'c', None),
              ('той, хто розповідає (я)', 'i', 'Підмет першого речення — mi madre, і друге речення продовжує розповідь про неї.'),
              ('з тексту неможливо визначити', 'i', no_ctx + 'друге речення без підмета продовжує розповідь про маму.')],
             [rule([P13], R_P13)],
             ('Правильно: hablaba тут продовжує розповідь про mi madre.', 'Ні. Hablaba продовжує розповідь про mi madre — це вона багато розмовляла з людьми.'))
    t.choice('supported', 'story', [P13],
             [P('Прочитайте і визначте, про кого йдеться.'),
              PE('Me llamo Olga. Antes trabajaba en un banco, pero ahora estudio español.'),
              P('Хто раніше працював у банку?')],
             [('Ольга — та, хто розповідає', 'c', None),
              ('якась інша людина', 'i', 'Ольга розповідає про себе: me llamo, estudio — форми yo. Antes … pero ahora протиставляє минуле і теперішнє тієї самої особи.'),
              ('з тексту неможливо визначити', 'i', no_ctx + 'me llamo і estudio показують, що Ольга говорить про себе.')],
             [rule([P13], R_P13)],
             ('Правильно: trabajaba тут — форма yo, Ольга говорить про себе.', 'Ні. Ольга розповідає про себе: trabajaba тут означає «я працювала».'))
    t.choice('independent', 'dialogue', [P13],
             [P('Прочитайте діалог і дайте відповідь.'),
              PE('—¿Y tu hermano? —Antes cocinaba muy bien, pero ahora no cocina nunca.'),
              P('Хто раніше добре готував?')],
             [('той, хто відповідає (я)', 'i', 'Відповідь продовжує тему питання — tu hermano; no cocina — теж форма для él.'),
              ('брат', 'c', None),
              ('з тексту неможливо визначити', 'i', no_ctx + 'питання про брата, і cocina — форма для él.')],
             [rule([P13], R_P13)],
             ('Правильно: йдеться про брата.', 'Ні. Питання стосується брата, тож cocinaba тут — «він готував».'))
    t.choice('independent', 'pronoun-choice', [P13],
             [P('Яке речення однозначно означає «Я навчався (навчалася) в Мадриді»?')],
             [('Estudiaba en Madrid.', 'i', 'Estudiaba може означати і yo, і él/ella/usted — без контексту це неоднозначно.'),
              ('Ella estudiaba en Madrid.', 'i', 'Ella — це «вона», а не «я».'),
              ('Yo estudiaba en Madrid.', 'c', None)],
             [rule([P13], R_P13)],
             ('Правильно: займенник yo знімає неоднозначність.', 'Ні. Однозначно лише Yo estudiaba en Madrid: без займенника форма може означати і «він (вона)».'))
    t.choice('delayed', 'story', [P13],
             [P('Прочитайте і визначте, про кого йдеться.'),
              PE('Mi padre llegaba a casa a las nueve. Cenaba en la cocina y después descansaba.'),
              P('Хто вечеряв на кухні?')],
             [('той, хто розповідає (я)', 'i', 'Підмет першого речення — mi padre, і далі розповідь продовжується про нього.'),
              ('з тексту неможливо визначити', 'i', no_ctx + 'друге речення без підмета продовжує розповідь про тата.'),
              ('тато', 'c', None)],
             [rule([P13], R_P13)],
             ('Правильно: йдеться про тата.', 'Ні. Cenaba продовжує розповідь про mi padre.'))
    t.choice('transfer', 'message', [P13],
             [P('Прочитайте повідомлення.'),
              PE('Hola, Marta: Ahora trabajo en casa y estoy muy contenta. Antes tomaba el autobús todos los días y llegaba tarde a casa. ¡Un beso!'),
              P('Хто раніше щодня їздив автобусом?')],
             [('Марта', 'i', 'Марта — адресатка повідомлення. Розповідь іде від першої особи: trabajo, estoy.'),
              ('та, хто пише повідомлення', 'c', None),
              ('з тексту неможливо визначити', 'i', no_ctx + 'trabajo і estoy — форми yo, і розповідь продовжується від тієї самої особи.')],
             [rule([P13], R_P13)],
             ('Правильно: tomaba і llegaba тут — форми yo.', 'Ні. Авторка розповідає про себе: tomaba і llegaba тут означають «я їздила», «я поверталася».'))

    ids = [x['id'] for x in t.tasks]
    sup = [x['id'] for x in t.tasks if x['role'] == 'supported']
    ind = [x['id'] for x in t.tasks if x['role'] == 'independent']
    assert len(ids) == 28, len(ids)

    body = lesson(
        'A2-05-L1', 'lesson', BLOCK,
        'Імперфект дієслів на -ar: hablaba, hablábamos',
        'pretérito imperfecto: verbos en -ar',
        'Утворюємо pretérito imperfecto дієслів на -ar (закінчення -aba, -abas, -aba, -ábamos, -abais, -aban), '
        'розпізнаємо, хто діє, коли форми yo та él/ella/usted збігаються, і пишемо знак наголосу у формі nosotros.',
        ['A2-05-O1', 'A2-05-O4'], [], ['routine-study-leisure', 'people-family-home'], 15,
        ['imperfecto.regular-ar.singular', 'imperfecto.regular-ar.plural', 'imperfecto.abamos-accent', 'imperfecto.person-1s-3s'],
        ['present.regular-ar', 'present.regular-ar.plural', 'pron.subject', 'pron.subject.plural', 'ortho.stress-awareness'],
        [
            step('s1', 'explanation', 'Що таке імперфект і як утворити форми на -ar', True, blocks=[
                P('Pretérito imperfecto (імперфект) — минулий час, яким розповідають, що бувало раніше або яким усе було '
                  'в минулому: Antes mi padre trabajaba en un banco — «Раніше мій тато працював у банку». Коли саме обирати '
                  'імперфект, розберемо в наступних уроках; спершу навчимося утворювати форми.'),
                P('Дієслова на -ar: відкидаємо -ar і до основи додаємо закінчення -aba, -abas, -aba, -ábamos, -abais, -aban. '
                  'Усі дієслова на -ar в імперфекті правильні — навіть estar: estaba.'),
                AR_TABLE,
                P('Форма для yo така сама, як для él, ella, usted: yo hablaba — ella hablaba. Хто діє, зрозуміло з підмета '
                  'або з попереднього речення. Якщо це неясно, додаємо займенник: Yo trabajaba en Madrid.'),
                P('Знак наголосу має лише форма nosotros: hablábamos (ha-BLÁ-ba-mos — наголос на третьому складі від кінця). '
                  'Hablaba, hablabais, hablaban пишуться без знака.'),
                P('Vosotros (hablabais) — звичайне в Іспанії звертання на «ти» до кількох людей; з ustedes вживаємо форму ellos: ustedes hablaban.'),
            ]),
            step('s2', 'examples', 'Приклади', True, blocks=[
                EX('Antes mi padre trabajaba en un banco.', 'Раніше мій тато працював у банку.'),
                EX('Antes Ana dibujaba mucho.', 'Раніше Ана багато малювала.'),
                EX('Antes yo cuidaba a mi hermano por la tarde.', 'Раніше я після обіду доглядав (доглядала) брата.'),
                EX('¿Antes estudiabas español?', 'Ти раніше вчив (вчила) іспанську?'),
                EX('Antes nosotros merendábamos en casa.', 'Раніше ми полуднували вдома.'),
                EX('¿Vosotros cenabais tarde?', 'Ви (кілька людей) пізно вечеряли?'),
                EX('Mis amigos escuchaban mucha música.', 'Мої друзі слухали багато музики.'),
                P('Нові слова: antes — раніше; dibujar — малювати; merendar — полуднувати (легко перекусити між обідом і '
                  'вечерею; в Іспанії це la merienda); cuidar a alguien — доглядати когось.'),
            ]),
            step('s3', 'supported-practice', 'Практика зі зразком', True, tasks=sup),
            step('s4', 'independent-practice', 'Самостійна практика', True, tasks=ind),
            step('s5', 'summary', 'Підсумок', True, blocks=[
                BL(['Дієслова на -ar: основа + -aba, -abas, -aba, -ábamos, -abais, -aban.',
                    'Усі дієслова на -ar в імперфекті правильні, навіть estar: estaba.',
                    'Yo і él/ella/usted мають однакову форму (hablaba); займенник додаємо, коли без нього незрозуміло, хто діє.',
                    'Знак наголосу — лише в nosotros: hablábamos.']),
            ]),
        ],
    )
    return body, t.tasks


def materials():
    return [
        material('material.a2-05.ar-paradigm', 'A2-05-L1', 'Імперфект дієслів на -ar: таблиця форм', [
            P('Дієслова на -ar в імперфекті: основа + -aba, -abas, -aba, -ábamos, -abais, -aban. Знак наголосу — лише в nosotros.'),
            AR_TABLE,
            LINK('Потренувати форми на -ar', [AR_S, AR_P, ABA], 'written', 10),
        ], [AR_S, AR_P, ABA]),
    ]


LESSON_MODULES = ['a2_05_l2', 'a2_05_l3', 'a2_05_l4', 'a2_05_l5']


def build():
    import importlib
    lessons = [l1()]
    mats = materials()
    clips: list = []
    patches: dict = {}
    additions: list = []
    for name in LESSON_MODULES:
        mod = importlib.import_module(name)
        lessons += [fn() for fn in mod.LESSONS]
        mats += getattr(mod, 'MATERIALS', lambda: [])()
        clips += getattr(mod, 'CLIPS', lambda: [])()
        patches.update(getattr(mod, 'SKILL_PATCHES', {}))
        additions += getattr(mod, 'LEXICON_ADDITIONS', [])
    return {
        'block': BLOCK,
        'lessons': lessons,
        'clips': clips,
        'materials': mats,
        'skill_patches': patches,
        'lexicon_updates': {
            'lex.cuidar': {'noteUk': 'Вживається з прийменником a або de: cuidar a los niños, cuidar de los niños.'},
        },
        'lexicon_additions': additions,
    }
