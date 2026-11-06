#!/usr/bin/env python3
"""Authoring scaffold for the A-32 text-review calibration (issue #111, brief 05).

Holds the 40 calibration cases together with their hidden labels. Writes:
  - the label-free reviewer packet to <worktree>/content/reviews/calibration/cases.json
  - the hidden labels to this directory (labels.json, authoring-map.json)

This file stays OUTSIDE the repository while reviewers run, because it contains the labels.
Usage: python3 -I author_cases.py <worktree-root>
"""
import json
import random
import sys
from pathlib import Path

SEED = 20261106  # fixed shuffle seed, recorded in the report

# ---------------------------------------------------------------- helpers

def P(lang, text):
    return {"type": "paragraph", "language": lang, "text": text}


def EX(es, uk):
    return {"type": "example", "spanish": es, "ukrainian": uk}


def TG(skill, modality):
    return {"skillId": skill, "modality": modality}


def tk(skill, modality):
    return f"{skill}/{modality}"


def V(vid, text, note=None):
    v = {"id": vid, "text": text}
    if note:
        v["noteUk"] = note
    return v


def E(eid, text, outcomes, feedback):
    return {"id": eid, "text": text, "outcomes": outcomes, "feedbackUk": feedback}


def O(oid, label, outcomes, feedback=None):
    o = {"id": oid, "label": label, "outcomes": outcomes}
    if feedback:
        o["feedbackUk"] = feedback
    return o


def H(kind, targets, blocks):
    return {"kind": kind, "targets": targets, "blocks": blocks}


def FB(correct, incorrect, unresolved=None):
    f = {"correctUk": correct, "incorrectUk": incorrect}
    if unresolved:
        f["unresolvedUk"] = unresolved
    return f


UNRESOLVED = "Цю відповідь не вдалося перевірити автоматично. Порівняйте її з прикладом відповіді."

# Source ids used by labels (resolved to URLs + passages in source-verification.json).
SRC = {
    "fu-habia": "https://www.fundeu.es/recomendacion/habia-habian-muchas-personas-haber-uso-impersonal/",
    "fu-dio-vio": "https://www.fundeu.es/recomendacion/dio-vio-o-fue-se-escriben-sin-tilde/",
    "fu-construido": "https://www.fundeu.es/recomendacion/incluido-construido-y-huida-sin-tilde-1544/",
    "fu-dobles-participios": "https://www.fundeu.es/recomendacion/dobles-participios-frito-freido-etc-claves-de-redaccion/",
    "fu-anduve": "https://www.fundeu.es/consulta/anduve-o-ande-1394/",
    "fu-ducir": "https://www.fundeu.es/recomendacion/reducir-conducir-conjugacion-adecuada/",
    "fu-ha-participio": "https://www.fundeu.es/recomendacion/ha-participio-no-a-participio/",
    "fu-tiempos-verbales": "https://www.fundeu.es/consulta/tiempos-verbales-515/",
    "fu-imperfecto": "https://www.fundeu.es/consulta/preterito-imperfecto-672/",
    "fu-idos-iros": "https://www.fundeu.es/recomendacion/idos-mejor-que-iros/",
    "fu-se-los": "https://www.fundeu.es/consulta/se-los-dije-5291/",
    "fu-leismo": "https://www.fundeu.es/recomendacion/leismo-laismo-y-loismo-claves/",
    "fu-mayoria": "https://www.fundeu.es/recomendacion/la-mayoria-voto-votaron-construcciones-partitivas/",
    "fu-el-agua": "https://www.fundeu.es/recomendacion/la-y-el-en-nombres-femeninos-agua-aguila/",
    "fu-tu-usted": "https://www.fundeu.es/consulta/tu-vos-usted-49/",
    "fu-imperativo-reflejos": "https://www.fundeu.es/consulta/imperativo-verbos-reflejos-2482/",
    "fu-tilde-diacritica": "https://www.fundeu.es/recomendacion/tilde-diacritica/",
    "fu-dias": "https://www.fundeu.es/recomendacion/dias-de-la-semana-meses-estaciones-minuscula/",
    "fu-como-donde": "https://www.fundeu.es/recomendacion/como-cuando-y-donde-cuando-se-escriben-con-tilde-509/",
    "fu-interrogacion": "https://www.fundeu.es/recomendacion/interrogacion-y-exclamacion-usos-de-los-signos-ortograficos/",
    "fu-porque": "https://www.fundeu.es/recomendacion/porque-porque-por-que-y-por-que-935/",
    "fu-mediodia": "https://www.fundeu.es/recomendacion/medio-dia-no-es-lo-mismo-que-mediodia-1108/",
    "fu-horas": "https://www.fundeu.es/recomendacion/horas-grafia/",
    "fu-coger": "https://www.fundeu.es/consulta/tomarcoger-5690/",
    "fu-de-nada": "https://www.fundeu.es/consulta/de-nada-o-por-nada-22031/",
    "fu-ir-a": "https://www.fundeu.es/recomendacion/ir-a-va-a-infinitivo/",
    "fu-ayer-tarde": "https://www.fundeu.es/recomendacion/ayer-tarde/",
    "fu-a-ver": "https://www.fundeu.es/recomendacion/a-ver-haber/",
    "sum-slovo": "https://slovnyk.ua/index.php?swrd=%D1%81%D0%BB%D0%BE%D0%B2%D0%BE",
    "sum-vy": "https://slovnyk.ua/index.php?swrd=%D0%B2%D0%B8",
    "repo-readme-rule1": "repo:content/README.md#authoring-rule-1",
    "repo-readme-rule4": "repo:content/README.md#authoring-rule-4",
    "repo-readme-rule4-exact": "repo:content/README.md#authoring-rule-4-exact-variants",
    "repo-readme-rule5": "repo:content/README.md#authoring-rule-5",
    "repo-schema-hint": "repo:content/schemas/content.schema.json#/$defs/Hint/properties/targets",
    "repo-schema-role": "repo:content/schemas/content.schema.json#/$defs/Task/properties/role",
    "repo-content-plan-indefinido": "repo:docs/CONTENT-PLAN.md#indefinido-row",
    "repo-content-plan-persons": "repo:docs/CONTENT-PLAN.md#person-form-row",
    "repo-impl-plan-listening": "repo:docs/IMPLEMENTATION-PLAN.md#listening-row",
    "repo-domain-support": "repo:docs/DOMAIN-SPEC.md#support-lifecycle",
    "repo-curriculum-a2-08-l5": "repo:docs/CURRICULUM-A1-A2.md#A2-08-L5",
}

CASES = []


def case(key, category, cls, *, defect=None, wrong, blocking, sources, context, task, clips=None, finding):
    CASES.append({
        "key": key, "category": category, "class": cls, "defect": defect, "wrong": wrong,
        "blocking": blocking, "sources": sources, "context": context, "task": task,
        "clips": clips or [], "finding": finding,
    })


def ctx(lesson_id, topic, taught, targets):
    return {"lessonId": lesson_id, "lessonTopic": topic, "taughtBefore": taught, "targets": targets}


def clip(cid, lesson_id, kind, transcript, translation, targets, family):
    return {"id": cid, "lessonId": lesson_id, "kind": kind, "transcript": transcript,
            "translationUk": translation, "targets": targets, "family": family, "reviewStatus": "draft"}


# ================================================================ T: tenses / participles (12)

t = tk("imperfecto.haber-impersonal", "written-form")
case("T1", "tenses-participles", "flawed", defect="wrong-form", blocking=True,
     wrong='accepted variant v2 "habían" (noteUk claims agreement with «muchas personas») is accepted as correct for existential haber',
     sources=["fu-habia"],
     finding="Existential haber is impersonal and stays singular: «había muchas personas», not «habían».",
     context=ctx("A2-05-L5", "Describe a past person, place or situation (imperfecto in descriptions)",
                 ["Present 'hay' for existence (A1-03-L4)", "Imperfecto of regular -ar/-er/-ir verbs (A2-05-L1/L2)",
                  "Imperfecto of ser, ir, ver (A2-05-L3)", "This lesson: 'había' as the past of 'hay' in descriptions"],
                 [{"target": t, "description": "Existential haber in the imperfecto in a past description"}]),
     task={"role": "independent", "family": "cal-birthday-memory", "mode": "exact-variants",
           "targets": [TG("imperfecto.haber-impersonal", "written-form")],
           "prompt": [P("uk", "Напишіть дієслово haber в імперфекті (минулий час від «hay»)."),
                      P("es-ES", "En el cumpleaños de Lucía ___ muchas personas y dos tartas enormes.")],
           "input": "short",
           "accepted": [V("v1", "había"), V("v2", "habían", "Теж правильно: дієслово узгоджується з «muchas personas».")],
           "errors": [E("e1", "hay", {t: "incorrect"}, "«hay» — теперішній час. Тут ідеться про минуле: «había».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "hints": [H("rule", [t], [P("uk", "Минулий час від «hay» в описах — «había»: En la plaza había un mercado.")])],
           "referenceAnswer": "había",
           "feedback": FB("Правильно!", "Неправильно. Тут потрібна форма «había».")})

t = tk("indefinido.monosyllables-no-accent", "written-form")
case("T2", "tenses-participles", "flawed", defect="wrong-stress-accent", blocking=True,
     wrong='accepted key "vió", error variant "vio" marked incorrect, and the hint/feedback teaching a tilde on «vio»',
     sources=["fu-dio-vio"],
     finding="dio, vio, fue (and di, vi, fui) are written without a tilde because they are orthographic monosyllables.",
     context=ctx("A2-04-L3", "Selected spelling changes and written accents in the indefinido",
                 ["Regular -ar/-er/-ir indefinido endings with written accents on -é/-ó (hablé, habló, comió) (A2-04-L1/L2)",
                  "This lesson: indefinido of ver (vi, viste, vio, vimos, visteis, vieron) and written-accent rules"],
                 [{"target": t, "description": "Writing short indefinido forms such as vio/dio/fue correctly"}]),
     task={"role": "independent", "family": "cal-cinema-weekend", "mode": "exact-variants",
           "targets": [TG("indefinido.monosyllables-no-accent", "written-form")],
           "prompt": [P("uk", "Напишіть дієслово ver у pretérito indefinido."),
                      P("es-ES", "Ayer Marta ___ una película francesa en el cine.")],
           "input": "short",
           "accepted": [V("v1", "vió")],
           "errors": [E("e1", "vio", {t: "incorrect"},
                        "Не забудьте про тильду: у 3-й особі однини наголос падає на -ó, як у «comió», тому пишемо «vió».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "hints": [H("rule", [t], [P("uk", "У pretérito indefinido форми 3-ї особи однини мають наголос на закінченні -ó і тильду: habló, comió, vió.")])],
           "referenceAnswer": "vió",
           "feedback": FB("Правильно!", "Неправильно. Правильна форма — «vió».")})

t = tk("participle.ido-accent", "written-form")
case("T3", "tenses-participles", "flawed", defect="wrong-rule", blocking=True,
     wrong='rule hint: "…завжди пишеться з тильдою над í: … construído, incluído" (over-general rule with wrong examples); the key «leído» itself is correct',
     sources=["fu-construido", "fu-dobles-participios"],
     finding="Participles of -uir verbs (construido, incluido) carry no tilde (-ui- is a diphthong in llanas); the hint's 'always' rule and examples are false.",
     context=ctx("A2-03-L4", "Written accents in familiar participles",
                 ["Present of haber (he, has, ha, hemos, habéis, han) (A2-03-L1)", "Regular participles -ado/-ido (A2-03-L2)",
                  "This lesson: participles of leer, oír, traer with a written accent (leído, oído, traído)"],
                 [{"target": t, "description": "Writing the written accent in participles such as leído"}]),
     task={"role": "independent", "family": "cal-reading-year", "mode": "exact-variants",
           "targets": [TG("participle.ido-accent", "written-form")],
           "prompt": [P("uk", "Напишіть дієприкметник дієслова leer."),
                      P("es-ES", "Este año he ___ cinco novelas en español.")],
           "input": "short",
           "accepted": [V("v1", "leído")],
           "errors": [E("e1", "leido", {t: "incorrect"}, "Потрібна тильда над í: «leído».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "hints": [H("rule", [t], [P("uk", "Правило: якщо основа дієслова закінчується на голосний, дієприкметник на -ido завжди пишеться з тильдою над í: leído, oído, traído, construído, incluído.")])],
           "referenceAnswer": "leído",
           "feedback": FB("Правильно!", "Неправильно. Правильна форма — «leído».")})

t = tk("participle.freir", "written-form")
case("T4", "tenses-participles", "flawed", defect="valid-alternative-rejected", blocking=True,
     wrong='error variant e1 "freído" marked incorrect with feedback claiming freír has only «frito»',
     sources=["fu-dobles-participios"],
     finding="freír has two participles; both freído and frito are adequate in compound tenses («He freído/frito un huevo»).",
     context=ctx("A2-03-L3", "A manageable set of irregular participles",
                 ["Present of haber (A2-03-L1)", "Regular participles -ado/-ido (A2-03-L2)",
                  "This lesson: irregular participles hecho, dicho, escrito, visto, puesto, vuelto, abierto, roto, frito"],
                 [{"target": t, "description": "Participle of freír in the pretérito perfecto"}]),
     task={"role": "independent", "family": "cal-breakfast", "mode": "exact-variants",
           "targets": [TG("participle.freir", "written-form")],
           "prompt": [P("uk", "Напишіть дієприкметник дієслова freír."),
                      P("es-ES", "Hoy he ___ dos huevos para el desayuno.")],
           "input": "short",
           "accepted": [V("v1", "frito")],
           "errors": [E("e1", "freído", {t: "incorrect"}, "Форма «freído» неправильна: дієслово freír має лише дієприкметник «frito».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "frito",
           "feedback": FB("Правильно!", "Неправильно. Правильна форма — «frito».")})

t = tk("indefinido.regular-ar", "written-form")
case("T5", "tenses-participles", "flawed", defect="unknown-prerequisite", blocking=True,
     wrong='the task asks for the indefinido of the irregular verb «ir» (answer «fui») in an A2-04-L1 regular -ar task targeting indefinido.regular-ar',
     sources=["repo-readme-rule1", "repo-content-plan-indefinido", "fu-dio-vio"],
     finding="Only regular -ar indefinido forms are taught at this point; «fui» is an irregular form of ir/ser that is not taught yet and is not a regular -ar form, so it cannot be assessed under this target.",
     context=ctx("A2-04-L1", "Regular -ar past forms (pretérito indefinido)",
                 ["Present tense of regular and selected irregular verbs (A1-04, A2-01)",
                  "This lesson: indefinido endings of regular -ar verbs for all persons (hablé, hablaste, habló, hablamos, hablasteis, hablaron)",
                  "Time expressions ayer, el lunes, la semana pasada"],
                 [{"target": t, "description": "Indefinido of regular -ar verbs"}]),
     task={"role": "independent", "family": "cal-dentist", "mode": "exact-variants",
           "targets": [TG("indefinido.regular-ar", "written-form")],
           "prompt": [P("uk", "Напишіть дієслово в pretérito indefinido."),
                      P("es-ES", "El lunes (yo) ___ (ir) al dentista.")],
           "input": "short",
           "accepted": [V("v1", "fui")],
           "errors": [E("e1", "fuí", {t: "incorrect"}, "Без тильди: «fui».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "hints": [H("rule", [t], [P("uk", "Pretérito indefinido дієслів на -ar: -é, -aste, -ó, -amos, -asteis, -aron.")])],
           "referenceAnswer": "fui",
           "feedback": FB("Правильно!", "Неправильно. Правильна форма — «fui».")})

t = tk("participle.imprimir", "written-form")
case("T6", "tenses-participles", "valid", wrong="", blocking=False,
     sources=["fu-dobles-participios"],
     finding="imprimir has two participles; impreso and imprimido are both adequate in compound tenses (impreso more frequent).",
     context=ctx("A2-03-L3", "A manageable set of irregular participles",
                 ["Present of haber (A2-03-L1)", "Regular participles -ado/-ido (A2-03-L2)",
                  "This lesson: irregular participles; imprimir has two participles (impreso, imprimido)",
                  "Vocabulary: las entradas, el concierto, imprimir"],
                 [{"target": t, "description": "Participle of imprimir in the pretérito perfecto"}]),
     task={"role": "independent", "family": "cal-concert-tickets", "mode": "exact-variants",
           "targets": [TG("participle.imprimir", "written-form")],
           "prompt": [P("uk", "Напишіть дієприкметник дієслова imprimir."),
                      P("es-ES", "Ya he ___ las entradas para el concierto del sábado.")],
           "input": "short",
           "accepted": [V("v1", "impreso"),
                        V("v2", "imprimido", "Обидві форми правильні в складених часах; «impreso» вживається частіше.")],
           "errors": [E("e1", "imprimí", {t: "incorrect"},
                        "«imprimí» — це pretérito indefinido. Після «he» потрібен дієприкметник: «impreso» або «imprimido».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "impreso",
           "feedback": FB("Правильно!", "Неправильно. Правильно: «impreso» або «imprimido».")})

t = tk("indefinido.andar", "written-form")
case("T7", "tenses-participles", "valid", wrong="", blocking=False,
     sources=["fu-anduve"],
     finding="The RAE considers «andé» incorrect; the correct form is «anduve».",
     context=ctx("A2-04-L5", "Frequent irregular indefinido stems",
                 ["Regular indefinido endings (A2-04-L1/L2)",
                  "This lesson: irregular stems tuv- (tener), estuv- (estar), anduv- (andar), pud- (poder), pus- (poner) with endings -e, -iste, -o, -imos, -isteis, -ieron"],
                 [{"target": t, "description": "Indefinido of andar"}]),
     task={"role": "independent", "family": "cal-hiking", "mode": "exact-variants",
           "targets": [TG("indefinido.andar", "written-form")],
           "prompt": [P("uk", "Напишіть дієслово andar у pretérito indefinido."),
                      P("es-ES", "El sábado (yo) ___ doce kilómetros por la sierra de Madrid.")],
           "input": "short",
           "accepted": [V("v1", "anduve")],
           "errors": [E("e1", "andé", {t: "incorrect"}, "«Andé» вважається помилкою. Правильна форма — «anduve».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "anduve",
           "feedback": FB("Правильно!", "Неправильно. Правильна форма — «anduve».")})

t = tk("indefinido.ducir", "written-form")
case("T8", "tenses-participles", "valid", wrong="", blocking=False,
     sources=["fu-ducir"],
     finding="In -ducir verbs the stem c becomes j in the indefinido: condujo, not «condució».",
     context=ctx("A2-04-L5", "Frequent irregular indefinido stems",
                 ["Regular indefinido endings (A2-04-L1/L2)",
                  "This lesson: verbs in -ducir (conducir, traducir) take the stem -duj- in the indefinido",
                  "Vocabulary: conducir, sin parar"],
                 [{"target": t, "description": "Indefinido of -ducir verbs"}]),
     task={"role": "independent", "family": "cal-road-trip", "mode": "exact-variants",
           "targets": [TG("indefinido.ducir", "written-form")],
           "prompt": [P("uk", "Напишіть дієслово conducir у pretérito indefinido."),
                      P("es-ES", "Ayer mi hermano ___ de Valencia a Madrid sin parar.")],
           "input": "short",
           "accepted": [V("v1", "condujo")],
           "errors": [E("e1", "condució", {t: "incorrect"}, "У дієсловах на -ducir у pretérito indefinido c змінюється на j: «condujo».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "condujo",
           "feedback": FB("Правильно!", "Неправильно. Правильна форма — «condujo».")})

t = tk("participle.hecho", "written-form")
case("T9", "tenses-participles", "valid", wrong="", blocking=False,
     sources=["fu-dobles-participios"],
     finding="«hecho» is the irregular participle of hacer (FundéuRAE lists it with roto as an irregular participle).",
     context=ctx("A2-03-L3", "A manageable set of irregular participles",
                 ["Present of haber (A2-03-L1)", "This lesson: irregular participles hecho, dicho, escrito, visto",
                  "Routine expression 'hacer la compra' (A1-04-L4)"],
                 [{"target": t, "description": "Participle hecho"}]),
     task={"role": "independent", "family": "cal-market-shopping", "mode": "choice",
           "targets": [TG("participle.hecho", "written-form")],
           "prompt": [P("uk", "Оберіть правильний варіант."), P("es-ES", "Hoy ___ la compra en el mercado.")],
           "input": "options",
           "options": [O("a", "he hecho", {t: "correct"}, "Правильно: «hecho» — дієприкметник від hacer."),
                       O("b", "he echo", {t: "incorrect"}, "Дієприкметник від hacer пишеться з h: «hecho»."),
                       O("c", "he hacido", {t: "incorrect"}, "Такої форми немає: дієприкметник від hacer — «hecho».")],
           "feedback": FB("Правильно!", "Неправильно. Правильний варіант — «he hecho».")})

t = tk("perfecto.haber-forms", "written-form")
case("T10", "tenses-participles", "valid", wrong="", blocking=False,
     sources=["fu-ha-participio"],
     finding="Compound tenses use the haber form «ha» (with h) + participle: «ha llamado», not «a llamado».",
     context=ctx("A2-03-L2", "Regular participles with -ado/-ido",
                 ["Present of haber: he, has, ha, hemos, habéis, han (A2-03-L1)", "This lesson: regular participles (llamado, comido)",
                  "Preposition 'a' (A1-02)"],
                 [{"target": t, "description": "Choosing the haber auxiliary form"}]),
     task={"role": "independent", "family": "cal-phone-call", "mode": "choice",
           "targets": [TG("perfecto.haber-forms", "written-form")],
           "prompt": [P("uk", "Оберіть правильний варіант."), P("es-ES", "Marta ___ llamado a su madre esta mañana.")],
           "input": "options",
           "options": [O("a", "ha", {t: "correct"}, "Правильно: «ha» — форма дієслова haber."),
                       O("b", "a", {t: "incorrect"}, "«a» — прийменник. У складеному часі потрібне допоміжне дієслово: «ha»."),
                       O("c", "han", {t: "incorrect"}, "«han» — форма для ellos/ellas/ustedes. Для Marta — «ha».")],
           "feedback": FB("Правильно!", "Неправильно. Правильний варіант — «ha».")})

t = tk("contrast.perfecto-indefinido", "context-choice")
case("T11", "tenses-participles", "ambiguous", wrong='"Por la mañana" does not say whether the morning belongs to today (still-open period, perfecto expected in Spain) or to an earlier day (indefinido); the closed key accepts only «he llamado» and marks «llamé» incorrect',
     blocking=True, sources=["fu-tiempos-verbales"],
     finding="The perfecto refers to a past action within a period not yet finished, often an implicit one such as 'the current day'; the prompt does not fix that period, so «llamé» cannot be ruled out.",
     context=ctx("A2-06-L2", "Perfecto compuesto or indefinido in context",
                 ["Pretérito perfecto (A2-03)", "Regular and irregular indefinido (A2-04)",
                  "Contrast taught: perfecto for today/this week/unfinished periods; indefinido for ayer/el lunes/finished periods"],
                 [{"target": t, "description": "Choosing perfecto or indefinido from context"}]),
     task={"role": "independent", "family": "cal-call-sister", "mode": "exact-variants",
           "targets": [TG("contrast.perfecto-indefinido", "context-choice")],
           "prompt": [P("uk", "Поставте дієслово llamar у минулому часі."),
                      P("es-ES", "Por la mañana ___ a mi hermana.")],
           "input": "short",
           "accepted": [V("v1", "he llamado")],
           "errors": [E("e1", "llamé", {t: "incorrect"}, "Тут потрібен pretérito perfecto: «he llamado».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "hints": [H("rule", [t], [P("uk", "Pretérito perfecto вживаємо для подій у ще не завершеному періоді: hoy, esta mañana, esta semana.")])],
           "referenceAnswer": "he llamado",
           "feedback": FB("Правильно!", "Неправильно. Правильна форма — «he llamado».")})

t = tk("contrast.indefinido-imperfecto", "context-choice")
case("T12", "tenses-participles", "ambiguous", wrong='the sentence gives no time frame or discourse context, so «trabajaba» (ongoing/habitual) and «trabajó» (completed period) are both defensible; the key accepts only «trabajaba» and its feedback asserts a habitual reading the prompt does not establish',
     blocking=True, sources=["fu-imperfecto"],
     finding="The imperfecto presents past facts in their course, the indefinido as finished; without context both views of 'my grandfather worked in a factory' are possible.",
     context=ctx("A2-06-L3", "Indefinido or imperfecto in context",
                 ["Imperfecto (A2-05)", "Indefinido (A2-04)",
                  "Contrast taught: imperfecto for habits, background and descriptions; indefinido for completed events"],
                 [{"target": t, "description": "Choosing indefinido or imperfecto from context"}]),
     task={"role": "independent", "family": "cal-grandfather-job", "mode": "choice",
           "targets": [TG("contrast.indefinido-imperfecto", "context-choice")],
           "prompt": [P("uk", "Оберіть форму минулого часу."),
                      P("es-ES", "Mi abuelo ___ en una fábrica de muebles de Valencia.")],
           "input": "options",
           "options": [O("a", "trabajaba", {t: "correct"}, "Правильно: ідеться про звичну дію в минулому."),
                       O("b", "trabajó", {t: "incorrect"}, "Ні: тут потрібен імперфект, бо ідеться про звичну дію в минулому.")],
           "feedback": FB("Правильно!", "Неправильно. Правильна форма — «trabajaba».")})

# ================================================================ R: reference / agreement (8)

t = tk("imperative.vosotros-os", "written-form")
case("R1", "reference-agreement", "flawed", defect="valid-alternative-rejected", blocking=True,
     wrong='error variant e1 "Iros" marked incorrect, with feedback claiming it is only an infinitive with a pronoun',
     sources=["fu-idos-iros"],
     finding="«Idos» is the recommended vosotros imperative of irse, but the Academia also considers the widespread variant «iros» valid.",
     context=ctx("A2-07-L6", "A pronoun joined to an instruction",
                 ["Affirmative tú/vosotros imperatives (A2-07-L3)", "Reflexive verbs such as irse, sentarse (A1-04-L4)",
                  "This lesson: attaching os to a vosotros imperative drops the final -d (sentad + os → sentaos); irse: id + os → idos"],
                 [{"target": t, "description": "vosotros imperative with attached os"}]),
     task={"role": "independent", "family": "cal-late-night", "mode": "exact-variants",
           "targets": [TG("imperative.vosotros-os", "written-form")],
           "prompt": [P("uk", "Ви кажете друзям, що їм уже час іти. Напишіть форму наказового способу дієслова irse для vosotros."),
                      P("es-ES", "¡___ ya, que es muy tarde!")],
           "input": "short",
           "accepted": [V("v1", "Idos")],
           "errors": [E("e1", "Iros", {t: "incorrect"}, "«Iros» — помилка: це інфінітив із займенником, а не наказовий спосіб. Правильно: «Idos»."),
                      E("e2", "Irse", {t: "incorrect"}, "«Irse» — інфінітив. Для vosotros потрібна форма «Idos».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "Idos",
           "feedback": FB("Правильно!", "Неправильно. Правильна форма — «Idos».")})

t = tk("object-pron.se-combination", "written-form")
case("R2", "reference-agreement", "flawed", defect="wrong-form", blocking=True,
     wrong='accepted variant v2 "Se las" (noteUk: plural of «vecinos» may move to the pronoun) is accepted as correct for one key given to several people',
     sources=["fu-se-los"],
     finding="One thing given to several people is «se la/se lo»; moving the plural onto the direct-object pronoun («se las») is strongly rejected in European Spanish.",
     context=ctx("A2-02-L5", "Combine two pronouns in a small familiar pattern set",
                 ["Direct object pronouns lo, la, los, las (A2-02-L2)", "Indirect object pronouns le, les (A2-02-L3)",
                  "This lesson: le/les before lo/la/los/las becomes se (se lo, se la, se los, se las)",
                  "Vocabulary: dejar, la llave, los vecinos"],
                 [{"target": t, "description": "Combining an indirect and a direct object pronoun with se"}]),
     task={"role": "independent", "family": "cal-holiday-keys", "mode": "exact-variants",
           "targets": [TG("object-pron.se-combination", "written-form")],
           "prompt": [P("uk", "Замініть обидва додатки займенниками."),
                      P("es-ES", "Les dejo la llave a mis vecinos. → ___ dejo.")],
           "input": "short",
           "accepted": [V("v1", "Se la"),
                        V("v2", "Se las", "Також правильно: множину «vecinos» можна перенести на займенник.")],
           "errors": [E("e1", "Les la", {t: "incorrect"}, "Перед lo/la/los/las займенник les змінюється на se: «Se la».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "Se la",
           "feedback": FB("Правильно!", "Неправильно. Правильно: «Se la dejo».")})

t = tk("object-pron.lo-la", "written-form")
case("R3", "reference-agreement", "flawed", defect="conflicting-feedback-support-attribution", blocking=True,
     wrong='hints[0] (kind "translation": vocabulary gloss «la cartera — гаманець») lists the grammar target object-pron.lo-la/written-form in its targets',
     sources=["repo-readme-rule5", "repo-schema-hint", "repo-domain-support", "fu-leismo"],
     finding="A vocabulary gloss supports no grammar target; mapping it to the pronoun target would record pronoun support (and postpone independent credit) whenever the learner only needed the word.",
     context=ctx("A2-02-L2", "Replace a direct object with an introduced pronoun",
                 ["This lesson: direct object pronouns lo, la, los, las", "encontrar (o → ue: encuentro) (A2-01-L1)",
                  "por ninguna parte (A2-01)"],
                 [{"target": t, "description": "Choosing the direct object pronoun lo/la"}]),
     task={"role": "independent", "family": "cal-lost-wallet", "mode": "exact-variants",
           "targets": [TG("object-pron.lo-la", "written-form")],
           "prompt": [P("uk", "Допишіть займенник."),
                      P("es-ES", "¿Dónde está mi cartera? No ___ encuentro por ninguna parte.")],
           "input": "short",
           "accepted": [V("v1", "la")],
           "errors": [E("e1", "lo", {t: "incorrect"}, "«lo» вживаємо для чоловічого роду. «Cartera» — жіночого роду: «la»."),
                      E("e2", "le", {t: "incorrect"}, "«le» — непрямий додаток. Тут прямий додаток жіночого роду: «la».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "hints": [H("translation", [t], [EX("la cartera", "гаманець")]),
                     H("rule", [t], [P("uk", "Прямий додаток жіночого роду однини замінюємо займенником «la»: Busco la llave. → La busco.")])],
           "referenceAnswer": "la",
           "feedback": FB("Правильно!", "Неправильно. Правильна форма — «la».")})

t = tk("object-pron.lo-la", "written-form")
case("R4", "reference-agreement", "valid", wrong="", blocking=False,
     sources=["fu-leismo"],
     finding="lo is the direct object for a male person; le is also admitted for male persons (leísmo de persona), more often in the singular.",
     context=ctx("A2-02-L2", "Replace a direct object with an introduced pronoun",
                 ["This lesson: direct object pronouns lo, la, los, las", "ver in the present (veo, ves, ve…) (A2-01-L2)",
                  "Vocabulary: el gimnasio, todos los martes"],
                 [{"target": t, "description": "Choosing the direct object pronoun for a person"}]),
     task={"role": "independent", "family": "cal-gym-friend", "mode": "exact-variants",
           "targets": [TG("object-pron.lo-la", "written-form")],
           "prompt": [P("uk", "Допишіть займенник."),
                      P("es-ES", "—¿Ves a Pablo en el gimnasio? —Sí, ___ veo todos los martes.")],
           "input": "short",
           "accepted": [V("v1", "lo"), V("v2", "le", "Для особи чоловічого роду RAE допускає також «le» (так часто кажуть в Іспанії).")],
           "errors": [E("e1", "la", {t: "incorrect"}, "«la» — для жіночого роду. Pablo — чоловічого роду: «lo» (або «le»).")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "lo",
           "feedback": FB("Правильно!", "Неправильно. Правильно: «lo» або «le».")})

t = tk("agreement.partitive-verb", "written-form")
case("R5", "reference-agreement", "valid", wrong="", blocking=False,
     sources=["fu-mayoria"],
     finding="With la mayoría de + plural noun, both singular and plural verb agreement are adequate (plural more usual); no attribute/predicative here.",
     context=ctx("A2-02-L8", "Read, compare and describe a familiar choice",
                 ["Present of regular -ir verbs (vivir) (A1-04-L2)",
                  "This block: quantity expressions la mayoría de, muchos, pocos", "Vocabulary: compañeros de clase, cerca de"],
                 [{"target": t, "description": "Verb agreement after la mayoría de + plural noun"}]),
     task={"role": "independent", "family": "cal-classmates", "mode": "exact-variants",
           "targets": [TG("agreement.partitive-verb", "written-form")],
           "prompt": [P("uk", "Напишіть дієслово vivir у теперішньому часі."),
                      P("es-ES", "La mayoría de mis compañeros de clase ___ cerca de la universidad.")],
           "input": "short",
           "accepted": [V("v1", "viven"),
                        V("v2", "vive", "Також правильно: дієслово може узгоджуватися з «la mayoría» (однина) або з «compañeros» (множина).")],
           "errors": [E("e1", "vivimos", {t: "incorrect"}, "«vivimos» — форма для nosotros. Підмет — «la mayoría de mis compañeros».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "viven",
           "feedback": FB("Правильно!", "Неправильно. Правильно: «viven» або «vive».")})

ta = tk("article.el-a-tonica", "written-form")
tb = tk("adj.agreement-gender", "written-form")
case("R6", "reference-agreement", "valid", wrong="", blocking=False,
     sources=["fu-el-agua"],
     finding="Feminine nouns beginning with stressed a take «el» in the singular but stay feminine, so adjectives agree in the feminine: el agua fría.",
     context=ctx("A1-02-L4", "Describing people and objects with familiar adjectives",
                 ["Definite articles el, la, los, las (A1-02-L2)",
                  "Exception set (A1-02-L1): feminine nouns beginning with stressed a- take 'el' in the singular (el agua, el aula)",
                  "This lesson: adjective gender agreement (-o/-a): frío/fría", "Fixed request formula: ¿Me pasas…, por favor?"],
                 [{"target": ta, "description": "Article el before feminine nouns with stressed a-"},
                  {"target": tb, "description": "Adjective gender agreement"}]),
     task={"role": "independent", "family": "cal-dinner-table", "mode": "finite-slots",
           "targets": [TG("article.el-a-tonica", "written-form"), TG("adj.agreement-gender", "written-form")],
           "prompt": [P("uk", "Напишіть речення повністю: вставте артикль (el або la) і прикметник frío в правильній формі."),
                      P("es-ES", "¿Me pasas ___ agua ___, por favor?")],
           "input": "short",
           "template": ["¿Me pasas ", {"slot": "art"}, " agua ", {"slot": "adj"}, ", por favor?"],
           "slots": [{"id": "art", "target": ta, "accepted": ["el"],
                      "errors": [{"text": "la", "feedbackUk": "Перед іменником жіночого роду, що починається з наголошеного a-, в однині вживаємо «el»: el agua."}],
                      "closed": True},
                     {"id": "adj", "target": tb, "accepted": ["fría"],
                      "errors": [{"text": "frío", "feedbackUk": "«Agua» залишається іменником жіночого роду, тому прикметник — «fría»."}],
                      "closed": True}],
           "policy": {"case": "insensitive", "terminalPunctuation": "required"},
           "referenceAnswer": "¿Me pasas el agua fría, por favor?",
           "feedback": FB("Правильно!", "Неправильно. Правильно: «¿Me pasas el agua fría, por favor?»", UNRESOLVED)})

t = tk("object-pron.le-les", "reading-meaning")
case("R7", "reference-agreement", "ambiguous", wrong='«le» in «Ana le da un diccionario» can refer to Pablo or to the professor (both present, both singular); the key accepts only "Професорові Руїсу" and option feedback asserts that reading',
     blocking=True, sources=["fu-leismo"],
     finding="le is the indirect-object pronoun for a singular recipient of either gender; the sentence offers two singular candidates and nothing selects one.",
     context=ctx("A2-02-L3", "Refer to the recipient (indirect object)",
                 ["This lesson: indirect object pronouns le, les", "dar in the present (da) (A2-01-L2)",
                  "Vocabulary: la biblioteca, el diccionario, el profesor"],
                 [{"target": t, "description": "Identifying the referent of an indirect object pronoun"}]),
     task={"role": "independent", "family": "cal-library-dictionary", "mode": "choice",
           "targets": [TG("object-pron.le-les", "reading-meaning")],
           "prompt": [P("es-ES", "Ana, Pablo y el profesor Ruiz están en la biblioteca. Ana le da un diccionario."),
                      P("uk", "Кому Ана дає словник?")],
           "input": "options",
           "options": [O("a", "Пабло", {t: "incorrect"}, "Ні. У цьому реченні «le» — це професор Руїс."),
                       O("b", "Професорові Руїсу", {t: "correct"}, "Правильно: «le» — це професор Руїс."),
                       O("c", "Пабло й професорові", {t: "incorrect"}, "«le» — однина; для двох осіб було б «les».")],
           "feedback": FB("Правильно!", "Неправильно. Правильна відповідь — професорові Руїсу.")})

t = tk("imperative.pronoun-attach", "written-form")
case("R8", "reference-agreement", "ambiguous", wrong='the prompt does not say whether the guests are addressed as vosotros (friends/family) or ustedes (formal); the closed key accepts only «Siéntense» and marks «Sentaos» incorrect',
     blocking=True, sources=["fu-tu-usted", "fu-imperativo-reflejos"],
     finding="Spanish has two plural forms of address, vosotros and ustedes; the vosotros reflexive imperative is levantaos/duchaos and the ustedes one levántense/dúchense, so both «Sentaos» and «Siéntense» fit depending on the unstated relationship.",
     context=ctx("A2-07-L6", "A pronoun joined to an instruction",
                 ["Affirmative tú/vosotros imperatives (A2-07-L3)", "Affirmative usted/ustedes imperatives (A2-07-L5)",
                  "This lesson: attaching pronouns: siéntate, sentaos, siéntese, siéntense"],
                 [{"target": t, "description": "Imperative with an attached reflexive pronoun"}]),
     task={"role": "independent", "family": "cal-guests-arrive", "mode": "exact-variants",
           "targets": [TG("imperative.pronoun-attach", "written-form")],
           "prompt": [P("uk", "До вас щойно прийшли гості. Запросіть їх сісти (sentarse)."), P("es-ES", "¡___, por favor!")],
           "input": "short",
           "accepted": [V("v1", "Siéntense")],
           "errors": [E("e1", "Sentaos", {t: "incorrect"}, "Тут очікується форма для ustedes: «Siéntense».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "Siéntense",
           "feedback": FB("Правильно!", "Неправильно. Правильна форма — «Siéntense».")})

# ================================================================ O: orthography / prerequisites / Ukrainian (8)

t = tk("pron.prepositional", "written-form")
case("O1", "orthography-prerequisites-ukrainian", "flawed", defect="wrong-stress-accent", blocking=True,
     wrong='accepted key "mi" and error variant "mí" marked incorrect with feedback "односкладові слова … пишуться без тильди"',
     sources=["fu-tilde-diacritica"],
     finding="The personal pronoun mí (after a preposition: para mí) carries a diacritic tilde, unlike the possessive mi.",
     context=ctx("A2-02-L3", "Refer to the recipient; pronouns after prepositions",
                 ["Possessive mi, mis (A1-02-L5)", "This lesson: pronouns after prepositions such as para, con, de",
                  "Vocabulary: el regalo"],
                 [{"target": t, "description": "Pronoun after a preposition"}]),
     task={"role": "independent", "family": "cal-gift", "mode": "exact-variants",
           "targets": [TG("pron.prepositional", "written-form")],
           "prompt": [P("uk", "Допишіть займенник («я»)."), P("es-ES", "Este regalo es para ___.")],
           "input": "short",
           "accepted": [V("v1", "mi")],
           "errors": [E("e1", "mí", {t: "incorrect"}, "Тильда не потрібна: односкладові слова в іспанській пишуться без тильди.")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "mi",
           "feedback": FB("Правильно!", "Неправильно. Правильна форма — «mi».")})

t = tk("article.definite-gender", "written-form")
case("O2", "orthography-prerequisites-ukrainian", "flawed", defect="poor-incorrect-ukrainian", blocking=True,
     wrong='option b feedbackUk "Ця слово жіночого роду…": wrong gender agreement in Ukrainian (слово is neuter: «Це слово»)',
     sources=["sum-slovo"],
     finding="Ukrainian «слово» is a neuter noun (СУМ: «СЛОВО, а, с.»), so the demonstrative must be «це», not feminine «ця».",
     context=ctx("A1-02-L1", "A noun with its article",
                 ["This lesson: definite articles el, la", "Nouns with gender: la mesa, la casa, el libro, el coche"],
                 [{"target": t, "description": "Choosing the definite article by noun gender"}]),
     task={"role": "independent", "family": "cal-classroom-objects", "mode": "choice",
           "targets": [TG("article.definite-gender", "written-form")],
           "prompt": [P("uk", "Оберіть артикль."), P("es-ES", "___ mesa")],
           "input": "options",
           "options": [O("a", "la", {t: "correct"}, "Правильно: «mesa» — жіночого роду."),
                       O("b", "el", {t: "incorrect"}, "Неправильно. Ця слово жіночого роду, тому потрібен артикль «la».")],
           "feedback": FB("Правильно!", "Неправильно. Правильний артикль — «la».")})

t = tk("present.regular-ar", "written-form")
case("O3", "orthography-prerequisites-ukrainian", "flawed", defect="unknown-prerequisite", blocking=True,
     wrong='the task assesses the vosotros form («Vosotros ___» → «habláis») although only yo/tú/él-ella-usted forms have been taught at this point',
     sources=["repo-readme-rule1", "repo-content-plan-persons"],
     finding="Teach before testing: plural person forms (including vosotros) are not in the taught list, so the item assesses an untaught person form.",
     context=ctx("A1-04-L1", "Regular -ar action verbs",
                 ["Subject pronouns yo, tú, él, ella, usted (A1-03-L1)",
                  "Taught so far in this lesson: present of regular -ar verbs for yo, tú, él/ella/usted (hablo, hablas, habla)"],
                 [{"target": t, "description": "Present tense of regular -ar verbs"}]),
     task={"role": "independent", "family": "cal-language-class", "mode": "exact-variants",
           "targets": [TG("present.regular-ar", "written-form")],
           "prompt": [P("uk", "Напишіть дієслово hablar у теперішньому часі."), P("es-ES", "Vosotros ___ muy bien español.")],
           "input": "short",
           "accepted": [V("v1", "habláis")],
           "errors": [E("e1", "hablais", {t: "incorrect"}, "Потрібна тильда: «habláis».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "habláis",
           "feedback": FB("Правильно!", "Неправильно. Правильна форма — «habláis».")})

t = tk("date.weekdays", "reading-meaning")
case("O4", "orthography-prerequisites-ukrainian", "flawed", defect="wrong-rule", blocking=True,
     wrong='rule hint: "Назви днів тижня в іспанській завжди пишуться з великої літери… Lunes, Martes, Jueves"',
     sources=["fu-dias"],
     finding="Names of days, months and seasons are common nouns and are written in lowercase as a general rule.",
     context=ctx("A1-05-L4", "Days, dates and a simple appointment",
                 ["This lesson: days of the week", "Clock time 'a las + hour' (A1-05-L3)", "Vocabulary: la reunión"],
                 [{"target": t, "description": "Understanding the day of an appointment"}]),
     task={"role": "independent", "family": "cal-meeting-day", "mode": "choice",
           "targets": [TG("date.weekdays", "reading-meaning")],
           "prompt": [P("es-ES", "La reunión es el jueves a las cinco."), P("uk", "Коли зустріч?")],
           "input": "options",
           "options": [O("a", "У четвер о п'ятій", {t: "correct"}, "Правильно!"),
                       O("b", "У вівторок о п'ятій", {t: "incorrect"}, "«jueves» — четвер; вівторок — «martes»."),
                       O("c", "У четвер о сьомій", {t: "incorrect"}, "«a las cinco» — о п'ятій.")],
           "hints": [H("rule", [t], [P("uk", "Назви днів тижня в іспанській завжди пишуться з великої літери, як в англійській: Lunes, Martes, Jueves.")])],
           "feedback": FB("Правильно!", "Неправильно. Зустріч у четвер о п'ятій.")})

t = tk("question.where-written", "written-form")
case("O5", "orthography-prerequisites-ukrainian", "valid", wrong="", blocking=False,
     sources=["fu-como-donde", "fu-interrogacion"],
     finding="Interrogative dónde carries a tilde, and omitting the opening question mark is considered a spelling error.",
     context=ctx("A1-05-L6", "Ask for the missing information",
                 ["Opening and closing question marks ¿ ? (A1-01-L3)",
                  "Question words with a written accent: qué, dónde, cuándo, cómo, cuánto (A1-03-L6)",
                  "estar for location (A1-03-L3)", "Vocabulary: la estación de tren (A1-05-L5)"],
                 [{"target": t, "description": "Writing a where-question with correct accent and punctuation"}]),
     task={"role": "independent", "family": "cal-station-question", "mode": "exact-variants",
           "targets": [TG("question.where-written", "written-form")],
           "prompt": [P("uk", "Запитайте іспанською: «Де залізничний вокзал?» (la estación de tren).")],
           "input": "short",
           "accepted": [V("v1", "¿Dónde está la estación de tren?")],
           "errors": [E("e1", "¿Donde está la estación de tren?", {t: "incorrect"}, "Питальне слово «dónde» пишеться з тильдою."),
                      E("e2", "Dónde está la estación de tren?", {t: "incorrect"}, "В іспанській питання починається знаком «¿».")],
           "closed": False, "policy": {"case": "insensitive", "terminalPunctuation": "required"},
           "referenceAnswer": "¿Dónde está la estación de tren?",
           "feedback": FB("Правильно!", "Неправильно. Приклад: «¿Dónde está la estación de tren?»", UNRESOLVED)})

t = tk("ortho.diacritic-te", "written-form")
case("O6", "orthography-prerequisites-ukrainian", "valid", wrong="", blocking=False,
     sources=["fu-tilde-diacritica"],
     finding="té (noun 'infusion') carries a diacritic tilde; te (pronoun) does not.",
     context=ctx("A1-06-L1", "Likes and dislikes with a small gustar pattern set",
                 ["This lesson: me gusta / te gusta", "Drinks: el café, el té, el agua",
                  "Diacritic pairs tú/tu, él/el (A1-03-L1) and té/te (this lesson)"],
                 [{"target": t, "description": "Distinguishing té and te in writing"}]),
     task={"role": "independent", "family": "cal-green-tea", "mode": "choice",
           "targets": [TG("ortho.diacritic-te", "written-form")],
           "prompt": [P("uk", "Оберіть правильно написане речення («Тобі подобається зелений чай?»).")],
           "input": "options",
           "options": [O("a", "¿Te gusta el té verde?", {t: "correct"}, "Правильно!"),
                       O("b", "¿Té gusta el te verde?", {t: "incorrect"}, "Навпаки: займенник «te» пишемо без тильди, а «té» (чай) — з тильдою."),
                       O("c", "¿Te gusta el te verde?", {t: "incorrect"}, "«Té» у значенні «чай» пишеться з тильдою.")],
           "feedback": FB("Правильно!", "Неправильно. Правильно: «¿Te gusta el té verde?»")})

t = tk("link.porque-por-que", "written-form")
case("O7", "orthography-prerequisites-ukrainian", "valid", wrong="", blocking=False,
     sources=["fu-porque"],
     finding="por qué (preposition + interrogative) introduces the question; porque (conjunction, 'because') introduces the reason.",
     context=ctx("A1-06-L5", "Connect ideas with y, pero and porque",
                 ["Question words including ¿por qué? (A1-03-L6)", "This lesson: porque", "estudiar, querer (quiero), vivir"],
                 [{"target": t, "description": "Writing por qué and porque"}]),
     task={"role": "independent", "family": "cal-why-spanish", "mode": "choice",
           "targets": [TG("link.porque-por-que", "written-form")],
           "prompt": [P("uk", "Оберіть правильно написаний діалог.")],
           "input": "options",
           "options": [O("a", "—¿Por qué estudias español? —Porque quiero vivir en Madrid.", {t: "correct"}, "Правильно!"),
                       O("b", "—¿Porque estudias español? —Por qué quiero vivir en Madrid.", {t: "incorrect"},
                         "Навпаки: у питанні — «por qué» (окремо, з тильдою), у відповіді — «porque» (разом, без тильди)."),
                       O("c", "—¿Por que estudias español? —Porque quiero vivir en Madrid.", {t: "incorrect"},
                         "У питанні «por qué» пишеться з тильдою.")],
           "feedback": FB("Правильно!", "Неправильно. У питанні — «por qué», у відповіді — «porque».")})

t = tk("perfecto.question", "written-form")
case("O8", "orthography-prerequisites-ukrainian", "ambiguous", wrong='the Ukrainian prompt «Ви вже поїли?» (sentence-initial capital) can be polite singular or plural; the closed key accepts only vosotros forms and would mark «¿Ya ha comido?» (usted) or «¿Ya han comido?» (ustedes) incorrect',
     blocking=True, sources=["sum-vy", "fu-tu-usted"],
     finding="Ukrainian ви is used to address two or more people or, politely, one person (СУМ); Spanish distinguishes usted, vosotros and ustedes, and the prompt does not say which applies.",
     context=ctx("A2-03-L5", "Questions, negatives and pronouns with the pretérito perfecto",
                 ["Pretérito perfecto for all persons (he, has, ha, hemos, habéis, han + participle) (A2-03-L1/L2)",
                  "ya (already)", "comer"],
                 [{"target": t, "description": "Writing a question in the pretérito perfecto"}]),
     task={"role": "independent", "family": "cal-lunch-check", "mode": "exact-variants",
           "targets": [TG("perfecto.question", "written-form")],
           "prompt": [P("uk", "Перекладіть іспанською: «Ви вже поїли?»")],
           "input": "short",
           "accepted": [V("v1", "¿Ya habéis comido?"), V("v2", "¿Habéis comido ya?")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "required"},
           "referenceAnswer": "¿Ya habéis comido?",
           "feedback": FB("Правильно!", "Неправильно. Правильно: «¿Ya habéis comido?»")})

# ================================================================ L: listening transcript / meaning or mixed (12)

t = tk("listening.opening-days", "listening-meaning")
c = clip("clip.cal.shop-sundays", "A1-05-L4", "sentence", "Abrimos de lunes a sábado. Los domingos no abrimos.",
         "Ми працюємо з понеділка по суботу. У неділю ми не працюємо.", [TG("listening.opening-days", "listening-meaning")], "cal-shop-hours")
case("L1", "listening-meaning", "flawed", defect="wrong-key", blocking=True,
     wrong='option a "Так, працює" is marked correct and option b "Ні, не працює" incorrect, contradicting the transcript «Los domingos no abrimos»',
     sources=["repo-readme-rule4"], clips=[c],
     finding="The transcript states the shop does not open on Sundays; the key marks the opposite answer correct.",
     context=ctx("A1-05-L4", "Days, dates and a simple appointment",
                 ["Days of the week (this lesson)", "abrir (abrimos) (A1-04-L2)", "Negation with no (A1-03-L6)"],
                 [{"target": t, "description": "Understanding opening days in a short announcement"}]),
     task={"role": "independent", "family": "cal-shop-hours", "mode": "choice",
           "targets": [TG("listening.opening-days", "listening-meaning")],
           "prompt": [P("uk", "Прослухайте оголошення. Чи працює магазин у неділю?")],
           "input": "options", "clipIds": [c["id"]],
           "options": [O("a", "Так, працює", {t: "correct"}, "Правильно!"),
                       O("b", "Ні, не працює", {t: "incorrect"}, "Ні, послухайте ще раз.")],
           "hints": [H("transcript", [t], [P("es-ES", c["transcript"])])],
           "feedback": FB("Правильно!", "Неправильно. Послухайте ще раз.")})

t = tk("listening.prices", "listening-meaning")
c = clip("clip.cal.bakery-price", "A1-05-L2", "dialogue-line", "—¿Cuánto es? —Son tres euros con veinte.",
         "— Скільки з мене? — Три євро двадцять центів.", [TG("listening.prices", "listening-meaning")], "cal-bakery")
case("L2", "listening-meaning", "flawed", defect="wrong-key", blocking=True,
     wrong='accepted answers "3,02" and "3.02" do not match the transcript «tres euros con veinte» (3,20 €)',
     sources=["repo-readme-rule4-exact"], clips=[c],
     finding="«tres euros con veinte» is 3,20 €; the key accepts 3,02 and the correct amount would only be unresolved.",
     context=ctx("A1-05-L2", "Prices and amounts",
                 ["Numbers 0–100 (A1-05-L1)", "Prices: euros, céntimos, 'con' in spoken prices (this lesson)", "¿Cuánto es? (this lesson)"],
                 [{"target": t, "description": "Understanding a spoken price"}]),
     task={"role": "independent", "family": "cal-bakery", "mode": "exact-variants",
           "targets": [TG("listening.prices", "listening-meaning")],
           "prompt": [P("uk", "Прослухайте діалог. Скільки треба заплатити? Напишіть суму цифрами (наприклад, 1,50).")],
           "input": "short", "clipIds": [c["id"]],
           "accepted": [V("v1", "3,02"), V("v2", "3.02")],
           "closed": False, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "hints": [H("transcript", [t], [P("es-ES", c["transcript"])])],
           "referenceAnswer": "3,02",
           "feedback": FB("Правильно!", "Неправильно. Послухайте ще раз.", UNRESOLVED)})

t = tk("listening.time-expressions", "listening-meaning")
c = clip("clip.cal.museum-noon", "A1-05-L3", "sentence", "Quedamos mañana a mediodía en la puerta del museo.",
         "Зустрічаємося завтра через пів дня біля входу до музею.", [TG("listening.time-expressions", "listening-meaning")], "cal-museum")
case("L3", "listening-meaning", "flawed", defect="wrong-meaning", blocking=True,
     wrong='clip translationUk and the translation hint render «a mediodía» as "через пів дня" (in half a day) instead of "опівдні" (at noon)',
     sources=["fu-mediodia"], clips=[c],
     finding="mediodía denotes a moment (noon, the central hours of the day); medio día denotes a duration (half a day).",
     context=ctx("A1-05-L3", "Clock time and opening hours",
                 ["Clock time (this lesson)", "mañana (tomorrow), mediodía, medianoche (this lesson)", "quedar (to meet) (A1-06-L4)",
                  "Vocabulary: el museo, la puerta"],
                 [{"target": t, "description": "Understanding a meeting time"}]),
     task={"role": "independent", "family": "cal-museum", "mode": "choice",
           "targets": [TG("listening.time-expressions", "listening-meaning")],
           "prompt": [P("uk", "Прослухайте повідомлення. Коли зустріч?")],
           "input": "options", "clipIds": [c["id"]],
           "options": [O("a", "Завтра опівдні", {t: "correct"}, "Правильно!"),
                       O("b", "Завтра опівночі", {t: "incorrect"}, "«medianoche» — опівночі; тут «mediodía»."),
                       O("c", "Сьогодні ввечері", {t: "incorrect"}, "Почуто «mañana» — завтра.")],
           "hints": [H("translation", [t], [P("uk", c["translationUk"])])],
           "feedback": FB("Правильно!", "Неправильно. Зустріч завтра опівдні.")})

t = tk("listening.voice-message", "listening-meaning")
c = clip("clip.cal.airport-message", "A2-08-L5", "text",
         "Hola, soy Elena. Llego al aeropuerto el viernes a las diez de la noche. ¿Puedes recogerme?",
         "Привіт, це Олена. Я прилітаю в аеропорт у п'ятницю о десятій вечора. Можеш мене зустріти?",
         [TG("listening.voice-message", "listening-meaning")], "cal-airport")
case("L4", "listening-meaning", "flawed", defect="answer-leakage", blocking=True,
     wrong='prompt block 2 shows the full Spanish transcript before the learner answers an independent listening-meaning question',
     sources=["repo-curriculum-a2-08-l5", "repo-impl-plan-listening", "repo-schema-role"], clips=[c],
     finding="An audio-only meaning question must not display the transcript; showing it turns the listening target into reading and removes the support decision from the learner.",
     context=ctx("A2-08-L5", "Understand a short recording",
                 ["Days and clock time with de la mañana/tarde/noche (A1-05)", "llegar, poder (puedes) (A1-04, A2-01)",
                  "recoger a alguien (A2-07)", "Vocabulary: el aeropuerto"],
                 [{"target": t, "description": "Understanding a short voice message"}]),
     task={"role": "independent", "family": "cal-airport", "mode": "choice",
           "targets": [TG("listening.voice-message", "listening-meaning")],
           "prompt": [P("uk", "Прослухайте голосове повідомлення і дайте відповідь."),
                      P("es-ES", c["transcript"]),
                      P("uk", "Коли прилітає Олена?")],
           "input": "options", "clipIds": [c["id"]],
           "options": [O("a", "У п'ятницю о 22:00", {t: "correct"}, "Правильно!"),
                       O("b", "У п'ятницю о 10:00", {t: "incorrect"}, "«de la noche» — вечора: 22:00."),
                       O("c", "У четвер о 22:00", {t: "incorrect"}, "Почуто «el viernes» — у п'ятницю.")],
           "feedback": FB("Правильно!", "Неправильно. Олена прилітає в п'ятницю о 22:00.")})

t = tk("listening.clock-time", "listening-meaning")
c = clip("clip.cal.yoga-evening", "A1-05-L3", "sentence", "La clase de yoga es a las ocho de la tarde.",
         "Заняття з йоги — о восьмій вечора.", [TG("listening.clock-time", "listening-meaning")], "cal-yoga")
case("L5", "listening-meaning", "valid", wrong="", blocking=False,
     sources=["fu-horas"], clips=[c],
     finding="In the 12-hour model the part of the day is specified with de la mañana / de la tarde / de la noche; «a las ocho de la tarde» is 20:00.",
     context=ctx("A1-05-L3", "Clock time and opening hours",
                 ["Numbers (A1-05-L1)", "Clock time with de la mañana / de la tarde / de la noche (this lesson)",
                  "ser for the time of an event: La clase es a las… (this lesson)", "Vocabulary: la clase de yoga"],
                 [{"target": t, "description": "Understanding a clock time"}]),
     task={"role": "independent", "family": "cal-yoga", "mode": "choice",
           "targets": [TG("listening.clock-time", "listening-meaning")],
           "prompt": [P("uk", "Прослухайте оголошення. О котрій заняття?")],
           "input": "options", "clipIds": [c["id"]],
           "options": [O("a", "О 8:00", {t: "incorrect"}, "«de la tarde» — після полудня, тобто 20:00."),
                       O("b", "О 20:00", {t: "correct"}, "Правильно!"),
                       O("c", "О 18:00", {t: "incorrect"}, "Почуто «a las ocho» — о восьмій.")],
           "feedback": FB("Правильно!", "Неправильно. Заняття о 20:00.")})

t = tk("listening.directions", "listening-meaning")
c = clip("clip.cal.bus-centre", "A2-07-L7", "sentence", "Para ir al centro, coge el autobús número cinco en la parada de la plaza.",
         "Щоб дістатися до центру, сідай на автобус номер п'ять на зупинці на площі.",
         [TG("listening.directions", "listening-meaning")], "cal-bus")
case("L6", "listening-meaning", "valid", wrong="", blocking=False,
     sources=["fu-coger"], clips=[c],
     finding="«coger el autobús/ascensor» and «tomar…» are both correct; coger is only to be avoided in some American countries.",
     context=ctx("A2-07-L7", "Understand short instructions and their order",
                 ["tú imperatives (A2-07-L3)", "Transport vocabulary: el autobús, la parada, coger/tomar el autobús (A1-05-L5)",
                  "para + infinitive (A2-01)"],
                 [{"target": t, "description": "Understanding a spoken direction"}]),
     task={"role": "independent", "family": "cal-bus", "mode": "choice",
           "targets": [TG("listening.directions", "listening-meaning")],
           "prompt": [P("uk", "Прослухайте пораду. Що радять зробити?")],
           "input": "options", "clipIds": [c["id"]],
           "options": [O("a", "Сісти на автобус № 5 на зупинці на площі", {t: "correct"}, "Правильно!"),
                       O("b", "Піти пішки до площі", {t: "incorrect"}, "Ні: «coge el autobús» — сідай на автобус."),
                       O("c", "Узяти таксі біля площі", {t: "incorrect"}, "Ні: ідеться про автобус номер п'ять.")],
           "feedback": FB("Правильно!", "Неправильно. Радять сісти на автобус № 5.")})

t = tk("formula.de-nada", "listening-meaning")
c = clip("clip.cal.thanks-reply", "A1-01-L3", "dialogue-line", "—Muchas gracias, Marta. —¡De nada!",
         "— Дуже дякую, Марто. — Нема за що!", [TG("formula.de-nada", "listening-meaning")], "cal-thanks")
case("L7", "listening-meaning", "valid", wrong="", blocking=False,
     sources=["fu-de-nada"], clips=[c],
     finding="«de nada» is a completely correct courteous reply when someone thanks you.",
     context=ctx("A1-01-L3", "A short written phrase; everyday fixed phrases (CV-01)",
                 ["Fixed formulas taught as wholes in this lesson: hola, gracias, muchas gracias, de nada, por favor, adiós"],
                 [{"target": t, "description": "Understanding the reply to a thank-you"}]),
     task={"role": "independent", "family": "cal-thanks", "mode": "choice",
           "targets": [TG("formula.de-nada", "listening-meaning")],
           "prompt": [P("uk", "Прослухайте діалог. Що означає відповідь Марти?")],
           "input": "options", "clipIds": [c["id"]],
           "options": [O("a", "Нема за що (відповідь на подяку)", {t: "correct"}, "Правильно!"),
                       O("b", "Нічого немає", {t: "incorrect"}, "«De nada» — ввічлива відповідь на «gracias»."),
                       O("c", "Будь ласка, дайте мені", {t: "incorrect"}, "«De nada» — ввічлива відповідь на «gracias».")],
           "feedback": FB("Правильно!", "Неправильно. «De nada» означає «нема за що».")})

t = tk("future-ir.ir-a-infinitive", "dictation")
c = clip("clip.cal.bilbao-rain", "A2-01-L7", "sentence", "Mañana va a llover en Bilbao.", "Завтра в Більбао буде дощ.",
         [TG("future-ir.ir-a-infinitive", "dictation")], "cal-weather-plan")
case("L8", "listening-meaning", "valid", wrong="", blocking=False,
     sources=["fu-ir-a"], clips=[c],
     finding="In ir a + infinitive the preposition a must never be dropped in careful usage: va a llover, not «va llover».",
     context=ctx("A2-01-L7", "Put the situation together: routine, current action and plan",
                 ["ir in the present (va) (A1-04-L3)", "ir a + infinitive (A2-01-L5)", "This lesson: present weather frames (llueve, va a llover, hace sol)",
                  "mañana (tomorrow)"],
                 [{"target": t, "description": "Dictation of an ir a + infinitive sentence"}]),
     task={"role": "independent", "family": "cal-weather-plan", "mode": "exact-variants",
           "targets": [TG("future-ir.ir-a-infinitive", "dictation")],
           "prompt": [P("uk", "Прослухайте й запишіть речення.")],
           "input": "short", "clipIds": [c["id"]],
           "accepted": [V("v1", "Mañana va a llover en Bilbao.")],
           "errors": [E("e1", "Mañana va llover en Bilbao.", {t: "incorrect"}, "Не пропускайте прийменник «a»: «va a llover».")],
           "closed": False, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "Mañana va a llover en Bilbao.",
           "feedback": FB("Правильно!", "Неправильно. Приклад: «Mañana va a llover en Bilbao.»", UNRESOLVED)})

t = tk("listening.past-account", "listening-meaning")
c = clip("clip.cal.grandparents-visit", "A2-04-L8", "sentence", "Soy Pedro. Ayer tarde estuve en casa de mis abuelos.",
         "Це Педро. Учора по обіді я був у бабусі й дідуся.", [TG("listening.past-account", "listening-meaning")], "cal-grandparents")
case("L9", "listening-meaning", "valid", wrong="", blocking=False,
     sources=["fu-ayer-tarde"], clips=[c],
     finding="«ayer tarde» is perfectly appropriate (DPD), alongside ayer por la tarde.",
     context=ctx("A2-04-L8", "Put past events in sequence",
                 ["Indefinido of estar (estuve) (A2-04-L5)", "ayer, por la tarde, ayer tarde (A2-04-L1/L8)",
                  "Family: los abuelos (A1-02)"],
                 [{"target": t, "description": "Understanding a short past account"}]),
     task={"role": "independent", "family": "cal-grandparents", "mode": "choice",
           "targets": [TG("listening.past-account", "listening-meaning")],
           "prompt": [P("uk", "Прослухайте повідомлення. Де був Педро вчора по обіді?")],
           "input": "options", "clipIds": [c["id"]],
           "options": [O("a", "У бабусі й дідуся", {t: "correct"}, "Правильно!"),
                       O("b", "Удома з батьками", {t: "incorrect"}, "Ні: «en casa de mis abuelos» — у бабусі й дідуся."),
                       O("c", "На роботі", {t: "incorrect"}, "Ні: «en casa de mis abuelos» — у бабусі й дідуся.")],
           "feedback": FB("Правильно!", "Неправильно. Педро був у бабусі й дідуся.")})

t = tk("listening.clock-time", "listening-meaning")
c = clip("clip.cal.station-eight", "A1-05-L3", "sentence", "Te espero en la estación a las ocho.", "Чекатиму тебе на вокзалі о восьмій.",
         [TG("listening.clock-time", "listening-meaning")], "cal-station-wait")
case("L10", "listening-meaning", "ambiguous", wrong='«a las ocho» has no part-of-day complement (de la mañana/tarde/noche) and no other context; the key accepts only "О 20:00" and marks "О 8:00" incorrect',
     blocking=True, sources=["fu-horas"], clips=[c],
     finding="In the 12-hour model the part of the day is given by de la mañana/de la tarde/de la noche; without it «a las ocho» can be 8:00 or 20:00.",
     context=ctx("A1-05-L3", "Clock time and opening hours",
                 ["Numbers (A1-05-L1)", "Clock time with and without de la mañana / de la tarde / de la noche (this lesson)",
                  "esperar (A1-04-L1)", "Vocabulary: la estación"],
                 [{"target": t, "description": "Understanding a clock time"}]),
     task={"role": "independent", "family": "cal-station-wait", "mode": "choice",
           "targets": [TG("listening.clock-time", "listening-meaning")],
           "prompt": [P("uk", "Прослухайте повідомлення. О котрій зустріч?")],
           "input": "options", "clipIds": [c["id"]],
           "options": [O("a", "О 8:00", {t: "incorrect"}, "Ні, зустріч о 20:00."),
                       O("b", "О 20:00", {t: "correct"}, "Правильно!"),
                       O("c", "О 18:00", {t: "incorrect"}, "Почуто «a las ocho» — о восьмій.")],
           "feedback": FB("Правильно!", "Неправильно. Зустріч о 20:00.")})

t = tk("formula.a-ver", "dictation")
c = clip("clip.cal.let-us-see", "A2-08-L5", "phrase", "A ver.", "Подивимося.", [TG("formula.a-ver", "dictation")], "cal-let-us-see")
case("L11", "listening-meaning", "ambiguous", wrong='the isolated clip «A ver.» is homophonous with «Haber.» and gives no context; the closed key accepts only «A ver.»',
     blocking=True, sources=["fu-a-ver"], clips=[c],
     finding="a ver and haber are homophones (they sound the same); an isolated clip cannot show which spelling is intended.",
     context=ctx("A2-08-L5", "Understand a short recording",
                 ["Fixed expression 'a ver' (let's see) (A1-06-L6)", "haber as the infinitive of the perfecto auxiliary (A2-03-L1)"],
                 [{"target": t, "description": "Dictation of a short fixed expression"}]),
     task={"role": "independent", "family": "cal-let-us-see", "mode": "exact-variants",
           "targets": [TG("formula.a-ver", "dictation")],
           "prompt": [P("uk", "Прослухайте й запишіть те, що почули.")],
           "input": "short", "clipIds": [c["id"]],
           "accepted": [V("v1", "A ver.")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "A ver.",
           "feedback": FB("Правильно!", "Неправильно. Правильно: «A ver.»")})

t = tk("object-pron.lo-la", "listening-meaning")
c = clip("clip.cal.call-friends", "A2-02-L2", "dialogue-line", "—Busco a Marta y a Lucía. —La llamo ahora mismo.",
         "— Я шукаю Марту й Люсію. — Зараз їй подзвоню.", [TG("object-pron.lo-la", "listening-meaning")], "cal-call-friends")
case("L12", "listening-meaning", "ambiguous", wrong='«La llamo» can refer to Marta or to Lucía (both feminine singular candidates); the key accepts only "Марті"',
     blocking=True, sources=["fu-leismo"], clips=[c],
     finding="la is the feminine singular direct-object pronoun; it does not identify which of two feminine singular referents is meant.",
     context=ctx("A2-02-L2", "Replace a direct object with an introduced pronoun",
                 ["This lesson: direct object pronouns lo, la, los, las", "llamar a alguien (A1-04-L1)", "buscar (A1-04-L1)",
                  "ahora mismo (A2-01-L4)"],
                 [{"target": t, "description": "Identifying the referent of a direct object pronoun"}]),
     task={"role": "independent", "family": "cal-call-friends", "mode": "choice",
           "targets": [TG("object-pron.lo-la", "listening-meaning")],
           "prompt": [P("uk", "Прослухайте діалог. Кому зараз подзвонить друга людина?")],
           "input": "options", "clipIds": [c["id"]],
           "options": [O("a", "Марті", {t: "correct"}, "Правильно!"),
                       O("b", "Люсії", {t: "incorrect"}, "Ні, «la» — це Марта."),
                       O("c", "Обом", {t: "incorrect"}, "«la» — однина; для двох було б «las».")],
           "feedback": FB("Правильно!", "Неправильно. Правильна відповідь — Марті.")})

# ---------------------------------------------------------------- build

def main():
    root = Path(sys.argv[1]).resolve()
    out_dir = Path(__file__).resolve().parent
    assert len(CASES) == 40, len(CASES)
    order = list(range(len(CASES)))
    random.Random(SEED).shuffle(order)
    packet_cases, labels, mapping = [], [], []
    for pos, idx in enumerate(order, start=1):
        c = CASES[idx]
        case_id = f"cal-{pos:02d}"
        task = dict(c["task"])
        lesson = c["context"]["lessonId"]
        task = {"id": f"{lesson}-T9{pos:02d}", "lessonId": lesson, **task, "reviewStatus": "draft"}
        item = {"caseId": case_id, "context": c["context"]}
        if c["clips"]:
            item["clips"] = c["clips"]
        item["task"] = task
        packet_cases.append(item)
        labels.append({
            "caseId": case_id,
            "class": c["class"],
            "primaryCategory": c["category"],
            "defectType": c["defect"] if c["class"] == "flawed" else ("ambiguity" if c["class"] == "ambiguous" else None),
            "wrongElement": c["wrong"] or None,
            "releaseBlocking": c["blocking"],
            "sourceRefs": c["sources"],
            "expectedFinding": c["finding"],
            "authoringKey": c["key"],
        })
        mapping.append({"caseId": case_id, "authoringKey": c["key"]})
    packet = {
        "schemaVersion": 1,
        "packetId": "sll-a32-text-calibration-main",
        "description": "A-32 text review calibration packet: 40 independent review cases. Calibration-only material; never reused in the course corpus.",
        "cases": packet_cases,
    }
    target = root / "content" / "reviews" / "calibration" / "cases.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(packet, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (out_dir / "labels.json").write_text(json.dumps({
        "schemaVersion": 1, "packetId": packet["packetId"], "shuffleSeed": SEED,
        "sources": SRC, "labels": labels}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (out_dir / "authoring-map.json").write_text(json.dumps(mapping, indent=2) + "\n", encoding="utf-8")
    counts = {}
    for c in CASES:
        counts.setdefault((c["category"], c["class"]), 0)
        counts[(c["category"], c["class"])] += 1
    for k in sorted(counts):
        print(k, counts[k])
    print("wrote", target)


if __name__ == "__main__":
    main()
