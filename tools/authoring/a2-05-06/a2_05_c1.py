"""A2-05-C1 — optional mixed check: new prompts (not shown in the lessons) plus a link into the held-out bank."""
from build import LINK, P, PE, LessonTasks, lesson, rule, step
from a2_05 import AR_S, AR_P, ABA, BLOCK, P13, R_AR_S, R_P13, ftask
from a2_05_l2 import ER_S, ER_P, IA, PIR, R_ER_P, R_IA, R_PIR, acc_missing
from a2_05_l3 import EI, IR, R_EI, R_IR, R_SER, R_VER, SER, VER
from a2_05_l4 import CLIP_C, HF_C, HF_R, LH_D, LH_M, UH_C, UH_X, R_UH, lhints
from a2_05_l5 import AGE, ES, HA_C, HA_W, R_AGE, R_HA, ST_C, ST_R, UD_C, UD_X, WE_C, WE_R
from a2_05_l6 import BE_X, BG_C, BG_X, R_BE, R_BG
from a2_05_l7 import LM_D, LM_M, RD, R_RD, WR

INSTR_CHECK = 'Напишіть форму імперфекту дієслова в дужках.'
INSTR_FREE = 'Доповніть речення правильною формою дієслова в дужках. Час не підказано: вирішіть за змістом.'


def c1():
    t = LessonTasks('A2-05-C1')
    fam = 'check'
    fbx = ('Правильно.', 'Ні. Перегляньте пояснення в уроках цього блоку.')
    forms = [
        ftask(t, 'independent', fam, [AR_S], 'Antes Carmen ___ en una farmacia.', 'trabajar', 'trabajaba',
              [('trabajó', 'i', 'Trabajó — pretérito indefinido. Тут потрібна форма імперфекту: trabajaba.'),
               ('trabaja', 'i', 'Trabaja — теперішній час. В імперфекті: trabajaba.')],
              [((AR_S,), R_AR_S)], instr=INSTR_CHECK),
        ftask(t, 'independent', fam, [ER_P, IA], '¿Antes vosotros ___ cerca del centro?', 'vivir', 'vivíais',
              [('viviais', 'ci', acc_missing('vivíais')),
               ('vivís', 'iu', 'Vivís — теперішній час. В імперфекті: vivíais.'),
               ('vivisteis', 'iu', 'Vivisteis — pretérito indefinido. Тут потрібна форма імперфекту: vivíais.')],
              [((ER_P,), R_ER_P), ((IA,), R_IA)], instr=INSTR_CHECK),
        ftask(t, 'independent', fam, [SER, EI], 'De pequeños, mi hermano y yo ___ muy rubios.', 'ser', 'éramos',
              [('eramos', 'ci', acc_missing('éramos')),
               ('fuimos', 'iu', 'Fuimos — pretérito indefinido. Для опису в минулому: éramos.'),
               ('somos', 'iu', 'Somos — теперішній час. В імперфекті: éramos.')],
              [((SER,), R_SER), ((EI,), R_EI)], instr=INSTR_CHECK),
        ftask(t, 'independent', fam, [IR], 'Antes ellos ___ al gimnasio los lunes.', 'ir', 'iban',
              [('fueron', 'i', 'Fueron — pretérito indefinido. Тут потрібна форма імперфекту: iban.'),
               ('van', 'i', 'Van — теперішній час. В імперфекті: iban.')],
              [((IR,), R_IR)], instr=INSTR_CHECK),
        ftask(t, 'independent', fam, [VER, IA], 'Antes tú ___ mucho a tu abuela.', 'ver', 'veías',
              [('veias', 'ci', acc_missing('veías')),
               ('vías', 'iu', 'Ver зберігає e з інфінітива: veías.'),
               ('viste', 'iu', 'Viste — pretérito indefinido. Тут потрібна форма імперфекту: veías.')],
              [((VER,), R_VER), ((IA,), R_IA)], instr=INSTR_CHECK),
        ftask(t, 'independent', fam, [PIR, IA], 'Antes mi hijo ___ ser médico.', 'querer', 'quería',
              [('queria', 'ci', acc_missing('quería')),
               ('quiería', 'iu', 'Чергування e → ie в імперфект не переходить: quería.'),
               ('quiso', 'iu', 'Quiso — pretérito indefinido. Тут потрібна форма імперфекту: quería.')],
              [((PIR,), R_PIR), ((IA,), R_IA)], instr=INSTR_CHECK),
    ]
    meaning = [
        t.choice('independent', fam, [P13],
                 [P('Прочитайте діалог і дайте відповідь.'),
                  PE('—¿Qué hacía tu padre? —Trabajaba en un banco y tenía un coche rojo.'), P('Хто працював у банку?')],
                 [('той, хто відповідає', 'i', 'Відповідь продовжує тему питання — tu padre.'),
                  ('тато', 'c', None),
                  ('з тексту неможливо визначити', 'i', 'Контекст достатній: питання про тата, і відповідь — про нього.')],
                 [rule([P13], R_P13)], fbx),
        t.choice('independent', fam, [RD],
                 [PE('De niño, Pablo vivía en Bilbao. Su padre era médico y su madre trabajaba en un banco. Los sábados iban '
                     'a la playa y comían en un restaurante.'), P('Що родина Пабло робила по суботах?')],
                 [('їздила на пляж і обідала в ресторані', 'c', None),
                  ('ходила до лікаря', 'i', 'Лікарем був тато Пабло; про суботи в тексті: iban a la playa y comían en un restaurante.'),
                  ('працювала в банку', 'i', 'У банку працювала мама.')],
                 [rule([RD], R_RD)], fbx),
        t.choice('independent', fam, [LH_M],
                 [P('Прослухайте запис. Що робили сусіди?')],
                 [('гуляли парком', 'i', 'Парком гуляв оповідач із батьками.'),
                  ('гралися на вулиці', 'i', 'На вулиці гралися діти.'),
                  ('розмовляли на площі', 'c', None)],
                 lhints(CLIP_C), ('Правильно.', 'Ні. Прослухайте запис ще раз.'), clips=[CLIP_C['id']]),
    ]
    use = [
        t.choice('independent', fam, [UH_X],
                 [P('Оберіть форму, яка підходить за змістом.'), PE('Antes mis padres ___ en el campo, pero ahora viven en la ciudad.')],
                 [('vivieron', 'i', 'Antes … pero ahora протиставляє колишнє життя теперішньому — це опис того, як було: vivían.'),
                  ('vivían', 'c', None),
                  ('viven', 'i', 'Viven — теперішній час, а antes вказує на минуле.')],
                 [rule([UH_X], R_UH)], fbx),
        ftask(t, 'independent', fam, [AGE, IA], 'Cuando empecé a estudiar español, ___ treinta años.', 'tener', 'tenía',
              [('tenia', 'ci', acc_missing('tenía')),
               ('tuve', 'iu', 'Для віку в певний момент минулого — імперфект: tenía.'),
               ('era', 'iu', 'Вік іспанською «мають»: tenía treinta años.')],
              [((AGE,), R_AGE), ((IA,), R_IA)], instr=INSTR_FREE),
        ftask(t, 'independent', fam, [HA_W, HA_C, IA], 'En el pueblo de mis abuelos no ___ cine.', None, 'había',
              [('habia', 'cci', acc_missing('había')),
               ('hay', 'iiu', 'Hay — теперішній час. В описі минулого: había.'),
               ('estaba', 'uiu', 'Про наявність кажемо haber: no había cine.')],
              [((HA_W, HA_C), R_HA), ((IA,), R_IA)], instr='Доповніть опис дієсловом у потрібній формі (що було в цьому місці).'),
        t.choice('independent', fam, [BE_X],
                 [P('Оберіть форму, яка підходить за змістом.'),
                  PE('Estábamos en la playa y hacía mucho calor. De repente, ___ el móvil de Pablo.')],
                 [('sonaba', 'i', 'De repente вводить подію на цьому тлі: sonó.'),
                  ('sonó', 'c', None),
                  ('suena', 'i', 'Suena — теперішній час, а розповідь — про минуле.')],
                 [rule([BE_X], R_BE)], fbx),
        ftask(t, 'independent', fam, [BG_C], 'Cuando llegué al parque, mis amigos ya ___ allí.', 'estar', 'estaban',
              [('estuvieron', 'i', 'Ya показує стан у момент вашого приходу — це тло: estaban.'),
               ('están', 'i', 'Están — теперішній час. У минулому: estaban.')],
              [((BG_C,), R_BG)], instr='Доповніть розповідь правильною формою дієслова в дужках. Час не підказано: вирішіть, тло це чи подія.'),
    ]
    assert len(t.tasks) == 14, len(t.tasks)
    pool = [AR_S, AR_P, ABA, ER_S, ER_P, IA, PIR, SER, IR, VER, EI, P13, HF_R, HF_C, UH_C, UH_X, UD_C, UD_X, AGE,
            WE_C, WE_R, ES, HA_W, HA_C, ST_C, ST_R, BG_C, BG_X, BE_X, RD]
    body = lesson(
        'A2-05-C1', 'optional-check', BLOCK,
        'Перевірка: імперфект (необов’язково)',
        'pretérito imperfecto: comprobación',
        'Необов’язкова змішана перевірка блоку: форми імперфекту, знаки наголосу, ser/ir/ver, звички, опис, тло й подія, '
        'читання та аудіювання. Без блокувань і загальної оцінки: результат показує, що варто повторити.',
        ['A2-05-O1', 'A2-05-O2', 'A2-05-O3', 'A2-05-O4', 'A2-05-O5', 'A2-05-O6', 'A2-05-O7', 'A2-05-O8', 'A2-05-O9'],
        [], ['routine-study-leisure', 'people-family-home'], 12,
        [],
        ['imperfecto.regular-ar.singular', 'imperfecto.regular-ar.plural', 'imperfecto.abamos-accent', 'imperfecto.person-1s-3s',
         'imperfecto.regular-er-ir.singular', 'imperfecto.regular-er-ir.plural', 'imperfecto.ia-accent',
         'imperfecto.present-irregulars-regular', 'imperfecto.ser', 'imperfecto.ir', 'imperfecto.ver',
         'imperfecto.eramos-ibamos-accent', 'time.past-habit-frames', 'imperfecto.use-habit', 'imperfecto.use-description',
         'imperfecto.age-tenia', 'imperfecto.weather', 'imperfecto.estar-state', 'imperfecto.habia',
         'imperfecto.ser-time-setting', 'imperfecto.use-background', 'contrast.indefinido-imperfecto.background-event',
         'reading.past-routine-description', 'listening.past-habits-settings', 'listening.past-memory',
         'writing.past-routine-memory'],
        [
            step('s1', 'explanation', 'Про перевірку', False, blocks=[
                P('Ця перевірка необов’язкова: вона не блокує наступних уроків і не ставить загальної оцінки за тему. '
                  'Завдання змішані — так, як у повторенні. Підказки доступні, але вони враховуються як допомога. '
                  'Помилка лише покаже, яку конкретну форму чи значення варто повторити.'),
            ]),
            step('s2', 'self-check', 'Форми імперфекту', False, tasks=forms),
            step('s3', 'self-check', 'Хто діє і про що йдеться', False, tasks=meaning),
            step('s4', 'self-check', 'Звичка, опис, тло чи подія', False, tasks=use),
            step('s5', 'self-check', 'Ще завдання з банку повторення', False, blocks=[
                P('Ще кілька завдань, яких не було в уроках: застосунок добирає їх із відкладеного банку цього блоку.'),
                LINK('Змішане повторення: імперфект', pool, 'mixed', 10),
            ]),
        ],
    )
    return body, t.tasks


LESSONS = [c1]
