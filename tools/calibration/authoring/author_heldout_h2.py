#!/usr/bin/env python3
"""Held-out set H2 for repair cycle 2 (brief 05 step 7). Fresh cases, never shown to any reviewer before.

Valid controls deliberately use ordinary vocabulary that their taughtBefore lists do not name (cycle 1 showed a
reviewer reading the lists as exhaustive); one flawed case depends on a genuinely untaught advanced form, so a
reviewer cannot pass by ignoring prerequisites. Ukrainian terminology follows content/README.md rule 6a.
Writes <worktree>/content/reviews/calibration/cases-h2.json and labels-h2.json in this directory.
Usage: python3 -I author_heldout_h2.py <worktree-root>
"""
import json
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from author_cases import E, EX, FB, H, O, P, TG, UNRESOLVED, V, clip, ctx, tk  # noqa: E402

SEED = 20261108
CASES = []


def case(key, category, cls, *, defect=None, wrong, blocking, sources, context, task, clips=None, finding):
    CASES.append({"key": key, "category": category, "class": cls, "defect": defect, "wrong": wrong, "blocking": blocking,
                  "sources": sources, "context": context, "task": task, "clips": clips or [], "finding": finding})


# ---------------------------------------------------------------- flawed (5)
t = tk("estar.location", "written-form")
case("H2-F1", "orthography-prerequisites-ukrainian", "flawed", defect="unknown-prerequisite", blocking=True,
     wrong='the answer «estaba» (imperfecto) and the frame «Cuando llegamos» (indefinido) are required in an A1-03-L3 task; both past tenses are taught only in A2-04/A2-05',
     sources=["repo-readme-rule1", "repo-curriculum-a2-05-l1"],
     finding="At A1-03-L3 only the present of estar is taught; the task can only be answered with the imperfecto «estaba» and the past frame «llegamos», both introduced in A2.",
     context=ctx("A1-03-L3", "Estar for location and a small reviewed state set",
                 ["This lesson: estar in the present (estoy, estás, está, estamos, estáis, están) for location", "en casa (A1-03-L3)"],
                 [{"target": t, "description": "Choosing the form of estar for a location"}]),
     task={"role": "independent", "family": "cal-h2-home", "mode": "exact-variants",
           "targets": [TG("estar.location", "written-form")],
           "prompt": [P("uk", "Напишіть дієслово estar у правильній формі."), P("es-ES", "Cuando llegamos, Marta ya ___ en casa.")],
           "input": "short",
           "accepted": [V("v1", "estaba")],
           "errors": [E("e1", "está", {t: "incorrect"}, "Ідеться про минуле: «estaba».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "estaba",
           "feedback": FB("Правильно!", "Неправильно. Правильна форма — «estaba».")})

t = tk("indefinido.haber-impersonal", "written-form")
case("H2-F2", "tenses-participles", "flawed", defect="wrong-form", blocking=True,
     wrong='accepted variant v2 "hubieron" (noteUk claims agreement with «dos accidentes») accepted as correct for existential haber',
     sources=["fu-habia-hubo"],
     finding="Existential haber stays singular in every tense: «hubo dos accidentes», not «hubieron».",
     context=ctx("A2-04-L5", "Frequent irregular indefinido stems",
                 ["hay (A1-03-L4)", "This lesson: hubo as the indefinido of hay", "Vocabulary: el accidente, la autopista"],
                 [{"target": t, "description": "Existential haber in the indefinido"}]),
     task={"role": "independent", "family": "cal-h2-motorway", "mode": "exact-variants",
           "targets": [TG("indefinido.haber-impersonal", "written-form")],
           "prompt": [P("uk", "Напишіть haber у pretérito indefinido (минулий час від «hay»)."),
                      P("es-ES", "Ayer ___ dos accidentes en la autopista.")],
           "input": "short",
           "accepted": [V("v1", "hubo"), V("v2", "hubieron", "Теж правильно: дієслово узгоджується з «dos accidentes».")],
           "errors": [E("e1", "había", {t: "incorrect"}, "Тут потрібен pretérito indefinido: «hubo».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "hubo",
           "feedback": FB("Правильно!", "Неправильно. Правильна форма — «hubo».")})

t = tk("ortho.aun-accent", "written-form")
case("H2-F3", "orthography-prerequisites-ukrainian", "flawed", defect="wrong-stress-accent", blocking=True,
     wrong='accepted key "Aun" and error variant "Aún" marked incorrect with feedback "Тут знак наголосу не потрібен" for aún meaning todavía',
     sources=["fu-aun"],
     finding="aún meaning todavía is tonic and written with the accent; aun without accent means incluso/hasta.",
     context=ctx("A2-03-L5", "Questions, negatives and pronouns with the pretérito perfecto",
                 ["Pretérito perfecto (A2-03-L1/L2)", "This lesson: ya, todavía, aún (= todavía) with negatives",
                  "Vocabulary: los deberes, terminar"],
                 [{"target": t, "description": "Writing aún (= todavía)"}]),
     task={"role": "independent", "family": "cal-h2-homework", "mode": "exact-variants",
           "targets": [TG("ortho.aun-accent", "written-form")],
           "prompt": [P("uk", "Допишіть слово «ще» (у значенні «todavía»)."), P("es-ES", "___ no he terminado los deberes.")],
           "input": "short",
           "accepted": [V("v1", "Aun")],
           "errors": [E("e1", "Aún", {t: "incorrect"}, "Тут знак наголосу не потрібен: «aun».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "Aun",
           "feedback": FB("Правильно!", "Неправильно. Правильно: «Aun».")})

t = tk("ser.profession", "written-form")
case("H2-F4", "reference-agreement", "flawed", defect="answer-leakage", blocking=True,
     wrong='prompt block 2 (example) shows «Mi hermana es médica. — Моя сестра — лікарка.», the exact answer of this delayed held-out translation task',
     sources=["repo-schema-role-delayed", "repo-content-plan-heldout"],
     finding="A delayed task is a held-out prompt for later review; displaying the identical sentence as an example turns recall into copying.",
     context=ctx("A1-03-L2", "Ser for identity, origin and description",
                 ["ser in the present (this lesson)", "Professions with gender: médico/médica, profesor/profesora (this lesson)",
                  "Possessive mi (A1-02-L5)", "Family: la hermana (A1-02)"],
                 [{"target": t, "description": "Saying someone's profession with ser"}]),
     task={"role": "delayed", "family": "cal-h2-sister-doctor", "mode": "exact-variants",
           "targets": [TG("ser.profession", "written-form")],
           "prompt": [P("uk", "Перекладіть іспанською."), EX("Mi hermana es médica.", "Моя сестра — лікарка."),
                      P("uk", "«Моя сестра — лікарка.»")],
           "input": "short",
           "accepted": [V("v1", "Mi hermana es médica.")],
           "closed": False, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "Mi hermana es médica.",
           "feedback": FB("Правильно!", "Неправильно. Приклад: «Mi hermana es médica.»", UNRESOLVED)})

t = tk("listening.age", "listening-meaning")
c = clip("clip.cal-h2.age", "A1-05-L1", "dialogue-line", "—¿Cuántos años tienes? —Tengo veinte años.",
         "— Скільки тобі років? — Мені двадцять років.", [TG("listening.age", "listening-meaning")], "cal-h2-age")
case("H2-F5", "listening-meaning", "flawed", defect="conflicting-feedback-support-attribution", blocking=True,
     wrong='option b "12" has outcome "incorrect" but feedbackUk "Правильно! …", contradicting its own outcome',
     sources=["repo-content-plan-conflicting"], clips=[c],
     finding="Option feedback must agree with the option's outcome; an incorrect option that tells the learner «Правильно!» is conflicting feedback.",
     context=ctx("A1-05-L1", "Numbers and quantities; age after numbers (CV-04)",
                 ["Numbers 0–100 (this lesson)", "Age with tener: tengo … años (this lesson)"],
                 [{"target": t, "description": "Understanding a spoken age"}]),
     task={"role": "independent", "family": "cal-h2-age", "mode": "choice",
           "targets": [TG("listening.age", "listening-meaning")],
           "prompt": [P("uk", "Прослухайте діалог. Скільки років людині, яка відповідає?")],
           "input": "options", "clipIds": [c["id"]],
           "options": [O("a", "20", {t: "correct"}, "Правильно!"),
                       O("b", "12", {t: "incorrect"}, "Правильно! «Tengo veinte años» — мені двадцять років."),
                       O("c", "22", {t: "incorrect"}, "Почуто «veinte» — двадцять.")],
           "feedback": FB("Правильно!", "Неправильно. Людині двадцять років.")})

# ---------------------------------------------------------------- valid (4)
t = tk("pron.prepositional", "written-form")
case("H2-V1", "reference-agreement", "valid", wrong="", blocking=False,
     sources=["fu-delante", "fu-tilde-diacritica"],
     finding="delante de mí is the recommended pattern in the common language, and the pronoun mí carries the diacritic accent.",
     context=ctx("A2-02-L3", "Refer to the recipient; pronouns after prepositions",
                 ["This lesson: pronouns after prepositions: para mí, para ti, delante de mí, cerca de ti"],
                 [{"target": t, "description": "Pronoun after a preposition"}]),
     task={"role": "independent", "family": "cal-h2-cinema-seat", "mode": "exact-variants",
           "targets": [TG("pron.prepositional", "written-form")],
           "prompt": [P("uk", "Допишіть займенник («я»)."), P("es-ES", "En el cine, un señor muy alto se sienta delante de ___.")],
           "input": "short",
           "accepted": [V("v1", "mí")],
           "errors": [E("e1", "mi", {t: "incorrect"}, "Після прийменника займенник «mí» пишемо зі знаком наголосу.")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "mí",
           "feedback": FB("Правильно!", "Неправильно. Правильно: «mí».")})

t = tk("formula.shop-greeting", "listening-meaning")
c = clip("clip.cal-h2.shop-greeting", "A1-05-L2", "dialogue-line", "¡Buenos días! ¿Qué le pongo?", "Доброго ранку! Що вам подати?",
         [TG("formula.shop-greeting", "listening-meaning")], "cal-h2-shop")
case("H2-V2", "listening-meaning", "valid", wrong="", blocking=False,
     sources=["fu-buenos-dias"], clips=[c],
     finding="Buenos días is the morning greeting of general Spanish (buen día predominates in American Spanish).",
     context=ctx("A1-05-L2", "Prices and amounts; shop formulas (CV-01)",
                 ["Greetings buenos días, buenas tardes (A1-01-L3)", "Shop formula ¿Qué le pongo? (this lesson)"],
                 [{"target": t, "description": "Understanding a shop greeting"}]),
     task={"role": "independent", "family": "cal-h2-shop", "mode": "choice",
           "targets": [TG("formula.shop-greeting", "listening-meaning")],
           "prompt": [P("uk", "Прослухайте. Що каже продавець?")],
           "input": "options", "clipIds": [c["id"]],
           "options": [O("a", "Вітається і питає, що вам подати", {t: "correct"}, "Правильно!"),
                       O("b", "Прощається до завтра", {t: "incorrect"}, "Ні: «¡Buenos días!» — це привітання."),
                       O("c", "Каже, що магазин зачинено", {t: "incorrect"}, "Ні: «¿Qué le pongo?» — що вам подати?")],
           "feedback": FB("Правильно!", "Неправильно. Продавець вітається і питає, що вам подати.")})

t = tk("obligation.deber", "reading-meaning")
case("H2-V3", "tenses-participles", "valid", wrong="", blocking=False,
     sources=["fu-deber"],
     finding="deber + infinitive without de is preferably used for obligation; deber de + infinitive preferably for supposition.",
     context=ctx("A2-07-L2", "Permission and a short response",
                 ["Obligation with tener que + infinitive (A2-01-L6)", "deber + infinitive for obligation (this block)"],
                 [{"target": t, "description": "Understanding deber + infinitive"}]),
     task={"role": "independent", "family": "cal-h2-exam", "mode": "choice",
           "targets": [TG("obligation.deber", "reading-meaning")],
           "prompt": [P("es-ES", "Mañana tienes un examen. Debes estudiar esta tarde."), P("uk", "Що означає «Debes estudiar»?")],
           "input": "options",
           "options": [O("a", "Тобі треба вчитися (обов'язок)", {t: "correct"}, "Правильно!"),
                       O("b", "Ти, мабуть, вчишся (припущення)", {t: "incorrect"}, "Для припущення частіше вживають «deber de»; тут ідеться про обов'язок."),
                       O("c", "Ти вже вчився", {t: "incorrect"}, "Ні: «debes estudiar» стосується того, що треба зробити.")],
           "feedback": FB("Правильно!", "Неправильно. «Debes estudiar» — тобі треба вчитися.")})

t = tk("ortho.hay-ahi-ay", "written-form")
case("H2-V4", "orthography-prerequisites-ukrainian", "valid", wrong="", blocking=False,
     sources=["fu-hay-ahi"],
     finding="ahí is the adverb of place (Déjalo ahí, sobre la mesa); hay is a form of haber; ay is an interjection.",
     context=ctx("A1-05-L5", "Where something is: places and basic spatial expressions",
                 ["This lesson: aquí, ahí, allí; hay vs estar", "¡Ay! as an interjection (A1-01-L3)"],
                 [{"target": t, "description": "Choosing ahí, hay or ay"}]),
     task={"role": "independent", "family": "cal-h2-keys", "mode": "choice",
           "targets": [TG("ortho.hay-ahi-ay", "written-form")],
           "prompt": [P("uk", "Оберіть правильне слово."), P("es-ES", "Tus llaves están ___, encima de la mesa.")],
           "input": "options",
           "options": [O("a", "ahí", {t: "correct"}, "Правильно: «ahí» — там (місце)."),
                       O("b", "hay", {t: "incorrect"}, "«hay» — форма дієслова haber (є)."),
                       O("c", "ay", {t: "incorrect"}, "«ay» — вигук (ой!).")],
           "feedback": FB("Правильно!", "Неправильно. Правильно: «ahí».")})

# ---------------------------------------------------------------- ambiguous (3)
t = tk("object-pron.se-combination", "reading-meaning")
case("H2-A1", "reference-agreement", "ambiguous", wrong='«se las di» — se can stand for le (Luis) or les (his siblings, or all of them); nothing in the text selects one; the key accepts only "Луїсові"',
     blocking=True, sources=["fu-se-los"],
     finding="se before lo/la/los/las is an invariable variant of both le and les, so it does not show whether the recipient is one person or several.",
     context=ctx("A2-06-L6", "A short account or practical reply",
                 ["Indefinido and imperfecto (A2-04, A2-05)", "se lo / se la / se los / se las (A2-02-L5)",
                  "Vocabulary: las entradas, el concierto, los hermanos"],
                 [{"target": t, "description": "Identifying the recipient behind se"}]),
     task={"role": "independent", "family": "cal-h2-tickets", "mode": "choice",
           "targets": [TG("object-pron.se-combination", "reading-meaning")],
           "prompt": [P("es-ES", "Ayer hablé con Luis y con sus hermanos. Tenía dos entradas para el concierto y se las di."),
                      P("uk", "Кому людина віддала квитки?")],
           "input": "options",
           "options": [O("a", "Луїсові", {t: "correct"}, "Правильно!"),
                       O("b", "Братам Луїса", {t: "incorrect"}, "Ні: квитки отримав Луїс."),
                       O("c", "Луїсові та його братам", {t: "incorrect"}, "Ні: квитки отримав Луїс.")],
           "feedback": FB("Правильно!", "Неправильно. Квитки отримав Луїс.")})

t = tk("contrast.indefinido-imperfecto", "context-choice")
case("H2-A2", "tenses-participles", "ambiguous", wrong='«Cuando era pequeña, ___ en Sevilla.» admits «vivía» (background) and «viví» (a completed episode); the key accepts only «vivía» and the feedback calls «viví» wrong',
     blocking=True, sources=["fu-imperfecto"],
     finding="The imperfecto presents a past situation in its course, the indefinido as a finished whole; the sentence gives no duration or other cue that excludes the finished-episode reading.",
     context=ctx("A2-06-L3", "Indefinido or imperfecto in context",
                 ["Imperfecto (A2-05)", "Indefinido (A2-04)", "Contrast taught: imperfecto for background and descriptions; indefinido for completed events"],
                 [{"target": t, "description": "Choosing indefinido or imperfecto from context"}]),
     task={"role": "independent", "family": "cal-h2-seville", "mode": "choice",
           "targets": [TG("contrast.indefinido-imperfecto", "context-choice")],
           "prompt": [P("uk", "Оберіть форму минулого часу."), P("es-ES", "Cuando era pequeña, ___ en Sevilla.")],
           "input": "options",
           "options": [O("a", "vivía", {t: "correct"}, "Правильно: це фон, тривала ситуація в минулому."),
                       O("b", "viví", {t: "incorrect"}, "Ні: тут потрібен імперфект — це фон.")],
           "feedback": FB("Правильно!", "Неправильно. Правильна форма — «vivía».")})

t = tk("listening.clock-time", "listening-meaning")
c = clip("clip.cal-h2.cinema-ten", "A1-05-L3", "sentence", "Quedamos mañana a las diez en la puerta del cine.",
         "Зустрічаємося завтра о десятій біля входу до кінотеатру.", [TG("listening.clock-time", "listening-meaning")], "cal-h2-cinema-meet")
case("H2-A3", "listening-meaning", "ambiguous", wrong='«a las diez» has no de la mañana/de la noche and no other cue; the key accepts only "О 22:00" and marks "О 10:00" incorrect',
     blocking=True, sources=["fu-horas"], clips=[c],
     finding="In the 12-hour model the part of the day is given by de la mañana/tarde/noche; without it «a las diez» can be 10:00 or 22:00, and a meeting at either is plausible.",
     context=ctx("A1-05-L3", "Clock time and opening hours",
                 ["Clock time with and without de la mañana / de la tarde / de la noche (this lesson)", "quedar (to meet) and mañana (this lesson)"],
                 [{"target": t, "description": "Understanding a clock time"}]),
     task={"role": "independent", "family": "cal-h2-cinema-meet", "mode": "choice",
           "targets": [TG("listening.clock-time", "listening-meaning")],
           "prompt": [P("uk", "Прослухайте повідомлення. О котрій зустріч?")],
           "input": "options", "clipIds": [c["id"]],
           "options": [O("a", "О 10:00", {t: "incorrect"}, "Ні, зустріч о 22:00."),
                       O("b", "О 22:00", {t: "correct"}, "Правильно!"),
                       O("c", "О 12:00", {t: "incorrect"}, "Почуто «a las diez» — о десятій.")],
           "feedback": FB("Правильно!", "Неправильно. Зустріч о 22:00.")})


def main():
    root = Path(sys.argv[1]).resolve()
    out_dir = Path(__file__).resolve().parent
    assert len(CASES) == 12, len(CASES)
    order = list(range(len(CASES)))
    random.Random(SEED).shuffle(order)
    packet_cases, labels = [], []
    for pos, idx in enumerate(order, start=1):
        c = CASES[idx]
        case_id = f"cal-h2-{pos:02d}"
        lesson = c["context"]["lessonId"]
        task = {"id": f"{lesson}-T9{69 + pos:02d}", "lessonId": lesson, **c["task"], "reviewStatus": "draft"}
        item = {"caseId": case_id, "context": c["context"]}
        if c["clips"]:
            item["clips"] = c["clips"]
        item["task"] = task
        packet_cases.append(item)
        labels.append({"caseId": case_id, "class": c["class"], "primaryCategory": c["category"],
                       "defectType": c["defect"] if c["class"] == "flawed" else ("ambiguity" if c["class"] == "ambiguous" else None),
                       "wrongElement": c["wrong"] or None, "releaseBlocking": c["blocking"], "sourceRefs": c["sources"],
                       "expectedFinding": c["finding"], "authoringKey": c["key"]})
    packet = {"schemaVersion": 1, "packetId": "sll-a32-text-calibration-heldout-h2",
              "description": "A-32 text review calibration, held-out set H2 (repair cycle 2): 12 independent review cases. Calibration-only material; never reused in the course corpus.",
              "cases": packet_cases}
    target = root / "content" / "reviews" / "calibration" / "cases-h2.json"
    target.write_text(json.dumps(packet, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (out_dir / "labels-h2.json").write_text(json.dumps({"schemaVersion": 1, "packetId": packet["packetId"], "shuffleSeed": SEED,
                                                        "labels": labels}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(" ".join(f"{l['caseId'][-2:]}={l['authoringKey']}" for l in labels))
    print("wrote", target)


if __name__ == "__main__":
    main()
