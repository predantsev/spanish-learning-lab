#!/usr/bin/env python3
"""Held-out set H1 for repair cycle 1 (brief 05 step 7). Fresh cases, never shown to any reviewer before.

Writes the label-free packet to <worktree>/content/reviews/calibration/cases-h1.json and hidden labels to
labels-h1.json in this directory. Ukrainian terminology follows the policy adopted on 2026-11-06 (content/README.md
rule 6a): «знак наголосу» for the acute accent, «тильда» only for the ~ of ñ, «знаки ¿ ¡» for inverted marks.
Usage: python3 -I author_heldout.py <worktree-root>
"""
import json
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from author_cases import E, FB, H, O, P, TG, UNRESOLVED, V, clip, ctx, tk  # noqa: E402

SEED = 20261107
CASES = []


def case(key, category, cls, *, defect=None, wrong, blocking, sources, context, task, clips=None, finding):
    CASES.append({"key": key, "category": category, "class": cls, "defect": defect, "wrong": wrong, "blocking": blocking,
                  "sources": sources, "context": context, "task": task, "clips": clips or [], "finding": finding})


# ---------------------------------------------------------------- flawed (5)
t = tk("ortho.accent-mark", "written-form")
case("H1-F1", "orthography-prerequisites-ukrainian", "flawed", defect="poor-incorrect-ukrainian", blocking=True,
     wrong='error variant feedbackUk "Над останньою «e» потрібен апостроф…": «апостроф» names the Ukrainian apostrophe (’), not the written accent mark',
     sources=["sum-apostrof", "sum-akut"],
     finding="In Ukrainian «апостроф» is the comma-shaped sign written after a consonant (п'ять); the acute mark is «знак наголосу» (акут), so the feedback names the wrong sign.",
     context=ctx("A1-01-L2", "Initial stress awareness and written accents",
                 ["This lesson: the written accent mark (знак наголосу) on a small word set: café, sofá, mamá, inglés",
                  "Vocabulary: el café (кава)"],
                 [{"target": t, "description": "Writing a familiar word with its written accent mark"}]),
     task={"role": "independent", "family": "cal-h1-coffee", "mode": "exact-variants",
           "targets": [TG("ortho.accent-mark", "written-form")],
           "prompt": [P("uk", "Напишіть іспанською одне слово: «кава».")],
           "input": "short",
           "accepted": [V("v1", "café")],
           "errors": [E("e1", "cafe", {t: "incorrect"}, "Над останньою «e» потрібен апостроф: «café».")],
           "closed": False, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "café",
           "feedback": FB("Правильно!", "Неправильно. Правильно: «café».", UNRESOLVED)})

t = tk("number.agreement-un-una", "written-form")
case("H1-F2", "reference-agreement", "flawed", defect="wrong-form", blocking=True,
     wrong='accepted key "veintiún" and error variant "veintiuna" marked incorrect before the feminine noun «personas»',
     sources=["fu-numerales"],
     finding="Numerals ending in un/una agree in gender with the following noun: veintiuna personas, treinta y una personas — not «veintiún/treinta y un personas».",
     context=ctx("A1-05-L1", "Numbers and quantities",
                 ["This lesson: numbers 0–100 and the agreement of uno/un/una before nouns (un libro, una mesa, veintiún libros, veintiuna mesas)",
                  "hay (A1-03-L4)", "Vocabulary: la clase, las personas"],
                 [{"target": t, "description": "Writing a number word that agrees with the noun"}]),
     task={"role": "independent", "family": "cal-h1-class-size", "mode": "exact-variants",
           "targets": [TG("number.agreement-un-una", "written-form")],
           "prompt": [P("uk", "Напишіть число 21 словом."), P("es-ES", "En la clase hay ___ personas.")],
           "input": "short",
           "accepted": [V("v1", "veintiún")],
           "errors": [E("e1", "veintiuna", {t: "incorrect"}, "Перед іменником число 21 скорочується: «veintiún».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "veintiún",
           "feedback": FB("Правильно!", "Неправильно. Правильно: «veintiún».")})

t = tk("question.adonde-written", "written-form")
case("H1-F3", "orthography-prerequisites-ukrainian", "flawed", defect="valid-alternative-rejected", blocking=True,
     wrong='error variant "¿A dónde vas?" marked incorrect with feedback claiming the word must be written as one word',
     sources=["fu-a-donde"],
     finding="Interrogative adónde and a dónde are both accepted spellings with the same meaning.",
     context=ctx("A1-04-L3", "A small useful irregular-form set: ir and hacer",
                 ["ir in the present (voy, vas, va…) (this lesson)", "Destination question ¿adónde? / ¿a dónde? (this lesson)",
                  "Question marks ¿ ? (A1-01-L3)"],
                 [{"target": t, "description": "Writing a where-to question"}]),
     task={"role": "independent", "family": "cal-h1-where-going", "mode": "exact-variants",
           "targets": [TG("question.adonde-written", "written-form")],
           "prompt": [P("uk", "Запитайте друга іспанською: «Куди ти йдеш?»")],
           "input": "short",
           "accepted": [V("v1", "¿Adónde vas?")],
           "errors": [E("e1", "¿A dónde vas?", {t: "incorrect"}, "Це питальне слово пишеться разом: «adónde».")],
           "closed": False, "policy": {"case": "insensitive", "terminalPunctuation": "required"},
           "referenceAnswer": "¿Adónde vas?",
           "feedback": FB("Правильно!", "Неправильно. Приклад: «¿Adónde vas?»", UNRESOLVED)})

t = tk("gustar.doler-body-article", "written-form")
case("H1-F4", "reference-agreement", "flawed", defect="wrong-rule", blocking=True,
     wrong='key and rule hint require the possessive with a body part: option b «Me duele mi cabeza.» marked correct, option a «Me duele la cabeza.» marked incorrect, hint "…вживаємо присвійний займенник…"',
     sources=["fu-su-muneca"],
     finding="With body parts the established use is the definite article (me duele la cabeza), not the possessive (me duele mi cabeza).",
     context=ctx("A1-06-L3", "What is needed: necesitar; feeling unwell",
                 ["gustar pattern (A1-06-L1)", "doler as a gustar-type verb: me duele / me duelen (A1-06-L2)",
                  "Body parts: la cabeza, la mano, los pies (A1-06-L2)"],
                 [{"target": t, "description": "Saying what hurts"}]),
     task={"role": "independent", "family": "cal-h1-headache", "mode": "choice",
           "targets": [TG("gustar.doler-body-article", "written-form")],
           "prompt": [P("uk", "Оберіть правильний переклад: «У мене болить голова.»")],
           "input": "options",
           "options": [O("a", "Me duele la cabeza.", {t: "incorrect"}, "Потрібен присвійний займенник: «mi cabeza»."),
                       O("b", "Me duele mi cabeza.", {t: "correct"}, "Правильно!"),
                       O("c", "Me duelen mi cabeza.", {t: "incorrect"}, "«Cabeza» — однина, тому «duele».")],
           "hints": [H("rule", [t], [P("uk", "З частинами тіла іспанською вживаємо присвійний займенник, як і в українській: mi cabeza, mi mano.")])],
           "feedback": FB("Правильно!", "Неправильно. Правильно: «Me duele mi cabeza.»")})

t = tk("listening.negation", "listening-meaning")
c = clip("clip.cal-h1.office-holiday", "A2-02-L8", "sentence", "Hoy es fiesta y no viene nadie a la oficina.",
         "Сьогодні свято, і до офісу ніхто не приходить.", [TG("listening.negation", "listening-meaning")], "cal-h1-office")
case("H1-F5", "listening-meaning", "flawed", defect="wrong-key", blocking=True,
     wrong='option b "Усі" is marked correct and option a "Ніхто" incorrect, contradicting the transcript «no viene nadie»',
     sources=["fu-no-vino-nadie"], clips=[c],
     finding="«No viene nadie» has the same meaning as «Nadie viene»: nobody comes; the negative word after the verb with no before it is the normal pattern, not a double positive.",
     context=ctx("A2-02-L8", "Read, compare and describe a familiar choice",
                 ["Negative patterns no … nadie, no … nada, nadie …, nada … (this lesson)", "venir in the present (viene) (A2-01-L2)",
                  "Vocabulary: la fiesta (holiday), la oficina"],
                 [{"target": t, "description": "Understanding a negative statement"}]),
     task={"role": "independent", "family": "cal-h1-office", "mode": "choice",
           "targets": [TG("listening.negation", "listening-meaning")],
           "prompt": [P("uk", "Прослухайте повідомлення. Скільки людей сьогодні прийде до офісу?")],
           "input": "options", "clipIds": [c["id"]],
           "options": [O("a", "Ніхто", {t: "incorrect"}, "Ні, послухайте ще раз."),
                       O("b", "Усі", {t: "correct"}, "Правильно!"),
                       O("c", "Кілька людей", {t: "incorrect"}, "Ні, послухайте ще раз.")],
           "feedback": FB("Правильно!", "Неправильно. Послухайте ще раз.")})

# ---------------------------------------------------------------- valid (4)
t = tk("pron.conmigo-contigo", "written-form")
case("H1-V1", "reference-agreement", "valid", wrong="", blocking=False,
     sources=["fu-conmigo"],
     finding="After con the pronouns mí and ti take the forms conmigo and contigo.",
     context=ctx("A2-02-L3", "Refer to the recipient; pronouns after prepositions",
                 ["Pronouns after prepositions: para mí, para ti, con él… (this lesson)", "con + mí → conmigo, con + ti → contigo (this lesson)",
                  "querer + infinitive (A1-06-L4)", "Vocabulary: el cine, el sábado"],
                 [{"target": t, "description": "Writing conmigo/contigo"}]),
     task={"role": "independent", "family": "cal-h1-cinema", "mode": "exact-variants",
           "targets": [TG("pron.conmigo-contigo", "written-form")],
           "prompt": [P("uk", "Допишіть займенник («зі мною»)."), P("es-ES", "¿Quieres venir al cine ___ el sábado?")],
           "input": "short",
           "accepted": [V("v1", "conmigo")],
           "errors": [E("e1", "con mí", {t: "incorrect"}, "Після con займенник mí зливається з прийменником: «conmigo».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "conmigo",
           "feedback": FB("Правильно!", "Неправильно. Правильно: «conmigo».")})

t = tk("perfecto.haber-impersonal", "written-form")
case("H1-V2", "tenses-participles", "valid", wrong="", blocking=False,
     sources=["fu-habia"],
     finding="Existential haber stays singular in compound tenses too: ha habido problemas, not «han habido».",
     context=ctx("A2-03-L5", "Questions, negatives and pronouns with the pretérito perfecto",
                 ["Pretérito perfecto (A2-03-L1/L2)", "hay (A1-03-L4) and its perfecto 'ha habido' (this lesson)",
                  "Vocabulary: el metro, el problema, esta semana"],
                 [{"target": t, "description": "Existential haber in the pretérito perfecto"}]),
     task={"role": "independent", "family": "cal-h1-metro", "mode": "exact-variants",
           "targets": [TG("perfecto.haber-impersonal", "written-form")],
           "prompt": [P("uk", "Напишіть haber у pretérito perfecto (минулий час від «hay»)."),
                      P("es-ES", "Esta semana ___ muchos problemas en el metro.")],
           "input": "short",
           "accepted": [V("v1", "ha habido")],
           "errors": [E("e1", "han habido", {t: "incorrect"}, "У значенні «є, були» haber не має множини: «ha habido».")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "optional"},
           "referenceAnswer": "ha habido",
           "feedback": FB("Правильно!", "Неправильно. Правильно: «ha habido».")})

t = tk("ortho.accent-mark", "written-form")
case("H1-V3", "orthography-prerequisites-ukrainian", "valid", wrong="", blocking=False,
     sources=["sum-akut", "fu-tambien"],
     finding="«акут» is a standard Ukrainian name for the acute sign (СУМ: знак цього наголосу на письмі), so «знак наголосу (акут)» is correct; también is written with the accent.",
     context=ctx("A1-01-L2", "Initial stress awareness and written accents",
                 ["This lesson: the written accent mark (знак наголосу, акут) on a small word set: también, inglés, sofá",
                  "Vocabulary: también (також)"],
                 [{"target": t, "description": "Recognising the correct written accent"}]),
     task={"role": "independent", "family": "cal-h1-also", "mode": "choice",
           "targets": [TG("ortho.accent-mark", "written-form")],
           "prompt": [P("uk", "Оберіть правильно написане слово («також»).")],
           "input": "options",
           "options": [O("a", "también", {t: "correct"}, "Правильно: над «e» останнього складу стоїть знак наголосу (акут)."),
                       O("b", "tambien", {t: "incorrect"}, "Потрібен знак наголосу (акут) над «e»: «también»."),
                       O("c", "tambíen", {t: "incorrect"}, "Знак наголосу ставимо над «e» останнього складу: «también».")],
           "feedback": FB("Правильно!", "Неправильно. Правильно: «también».")})

t = tk("listening.requests", "listening-meaning")
c = clip("clip.cal-h1.borrow-computer", "A2-07-L1", "sentence", "Mi ordenador no funciona. ¿Me dejas el tuyo?",
         "Мій комп'ютер не працює. Позичиш мені свій?", [TG("listening.requests", "listening-meaning")], "cal-h1-computer")
case("H1-V4", "listening-meaning", "valid", wrong="", blocking=False,
     sources=["fu-ordenador"], clips=[c],
     finding="«ordenador» is the form used in Spain (computadora/computador are correct elsewhere).",
     context=ctx("A2-07-L1", "Request an object, action or help",
                 ["Requests with ¿Me dejas…? (this lesson)", "Possessive pronouns el mío, el tuyo (A2-02-L1)",
                  "Vocabulary: el ordenador, funcionar"],
                 [{"target": t, "description": "Understanding a spoken request"}]),
     task={"role": "independent", "family": "cal-h1-computer", "mode": "choice",
           "targets": [TG("listening.requests", "listening-meaning")],
           "prompt": [P("uk", "Прослухайте повідомлення. Про що просить людина?")],
           "input": "options", "clipIds": [c["id"]],
           "options": [O("a", "Позичити їй комп'ютер", {t: "correct"}, "Правильно!"),
                       O("b", "Полагодити її телефон", {t: "incorrect"}, "Ні: «ordenador» — комп'ютер, а «¿Me dejas…?» — прохання позичити."),
                       O("c", "Купити новий комп'ютер", {t: "incorrect"}, "Ні: «¿Me dejas el tuyo?» — позичиш свій?")],
           "feedback": FB("Правильно!", "Неправильно. Людина просить позичити комп'ютер.")})

# ---------------------------------------------------------------- ambiguous (3)
t = tk("object-pron.lo-la", "reading-meaning")
case("H1-A1", "reference-agreement", "ambiguous", wrong='«La veo» refers to «una de ellas», the neighbour who works at the hospital, but the text never says whether that is Laura or Carmen; the key accepts only "Лауру"',
     blocking=True, sources=["fu-leismo"],
     finding="la is the feminine singular direct-object pronoun; here it picks up «una de ellas», whose identity the text does not give.",
     context=ctx("A2-02-L2", "Replace a direct object with an introduced pronoun",
                 ["This lesson: direct object pronouns lo, la, los, las", "una de ellas (A2-02-L1)", "ver (veo), trabajar (A1-04)",
                  "Vocabulary: la vecina, el hospital, el autobús, todos los días"],
                 [{"target": t, "description": "Identifying the referent of a direct object pronoun"}]),
     task={"role": "independent", "family": "cal-h1-neighbours", "mode": "choice",
           "targets": [TG("object-pron.lo-la", "reading-meaning")],
           "prompt": [P("es-ES", "Tengo dos vecinas, Laura y Carmen. Una de ellas trabaja en el hospital. La veo todos los días en el autobús."),
                      P("uk", "Кого людина бачить в автобусі?")],
           "input": "options",
           "options": [O("a", "Лауру", {t: "correct"}, "Правильно!"),
                       O("b", "Кармен", {t: "incorrect"}, "Ні, в автобусі людина бачить Лауру."),
                       O("c", "Обох сусідок", {t: "incorrect"}, "«La» — однина; для двох було б «las».")],
           "feedback": FB("Правильно!", "Неправильно. Людина бачить Лауру.")})

t = tk("listening.clock-time", "listening-meaning")
c = clip("clip.cal-h1.english-class", "A1-05-L3", "sentence", "La clase de inglés es a las siete.", "Заняття з англійської — о сьомій.",
         [TG("listening.clock-time", "listening-meaning")], "cal-h1-english-class")
case("H1-A2", "listening-meaning", "ambiguous", wrong='«a las siete» has no de la mañana/de la tarde and no other context; the key accepts only "О 19:00" and marks "О 7:00" incorrect',
     blocking=True, sources=["fu-horas"], clips=[c],
     finding="In the 12-hour model the part of the day is given by de la mañana/tarde/noche; without it «a las siete» can be 7:00 or 19:00, and a class at either time is plausible.",
     context=ctx("A1-05-L3", "Clock time and opening hours",
                 ["Numbers (A1-05-L1)", "Clock time with and without de la mañana / de la tarde / de la noche (this lesson)",
                  "ser for the time of an event (this lesson)", "Vocabulary: la clase de inglés"],
                 [{"target": t, "description": "Understanding a clock time"}]),
     task={"role": "independent", "family": "cal-h1-english-class", "mode": "choice",
           "targets": [TG("listening.clock-time", "listening-meaning")],
           "prompt": [P("uk", "Прослухайте оголошення. О котрій заняття?")],
           "input": "options", "clipIds": [c["id"]],
           "options": [O("a", "О 7:00", {t: "incorrect"}, "Ні, заняття о 19:00."),
                       O("b", "О 19:00", {t: "correct"}, "Правильно!"),
                       O("c", "О 17:00", {t: "incorrect"}, "Почуто «a las siete» — о сьомій.")],
           "feedback": FB("Правильно!", "Неправильно. Заняття о 19:00.")})

t = tk("formula.ask-name", "written-form")
case("H1-A3", "orthography-prerequisites-ukrainian", "ambiguous", wrong='the prompt does not say whether the person is addressed with tú or usted; the closed key accepts only «¿Cómo te llamas?» and would mark «¿Cómo se llama?» / «¿Cómo se llama usted?» incorrect',
     blocking=True, sources=["fu-tu-usted"],
     finding="Spanish has distinct singular forms of address (tú, usted; vos elsewhere); the Ukrainian prompt «в людини» fixes neither.",
     context=ctx("A1-03-L2", "Ser for identity and origin; introductions",
                 ["Fixed formulas ¿Cómo te llamas? / ¿Cómo se llama (usted)? (this lesson)", "tú and usted as forms of address (A1-03-L1)",
                  "Question marks ¿ ? (A1-01-L3)"],
                 [{"target": t, "description": "Asking someone's name"}]),
     task={"role": "independent", "family": "cal-h1-ask-name", "mode": "exact-variants",
           "targets": [TG("formula.ask-name", "written-form")],
           "prompt": [P("uk", "Запитайте в людини іспанською, як її звати.")],
           "input": "short",
           "accepted": [V("v1", "¿Cómo te llamas?")],
           "closed": True, "policy": {"case": "insensitive", "terminalPunctuation": "required"},
           "referenceAnswer": "¿Cómo te llamas?",
           "feedback": FB("Правильно!", "Неправильно. Правильно: «¿Cómo te llamas?»")})


def main():
    root = Path(sys.argv[1]).resolve()
    out_dir = Path(__file__).resolve().parent
    assert len(CASES) == 12, len(CASES)
    order = list(range(len(CASES)))
    random.Random(SEED).shuffle(order)
    packet_cases, labels = [], []
    for pos, idx in enumerate(order, start=1):
        c = CASES[idx]
        case_id = f"cal-h1-{pos:02d}"
        lesson = c["context"]["lessonId"]
        task = {"id": f"{lesson}-T9{49 + pos:02d}", "lessonId": lesson, **c["task"], "reviewStatus": "draft"}
        item = {"caseId": case_id, "context": c["context"]}
        if c["clips"]:
            item["clips"] = c["clips"]
        item["task"] = task
        packet_cases.append(item)
        labels.append({"caseId": case_id, "class": c["class"], "primaryCategory": c["category"],
                       "defectType": c["defect"] if c["class"] == "flawed" else ("ambiguity" if c["class"] == "ambiguous" else None),
                       "wrongElement": c["wrong"] or None, "releaseBlocking": c["blocking"], "sourceRefs": c["sources"],
                       "expectedFinding": c["finding"], "authoringKey": c["key"]})
    packet = {"schemaVersion": 1, "packetId": "sll-a32-text-calibration-heldout-h1",
              "description": "A-32 text review calibration, held-out set H1 (repair cycle 1): 12 independent review cases. Calibration-only material; never reused in the course corpus.",
              "cases": packet_cases}
    target = root / "content" / "reviews" / "calibration" / "cases-h1.json"
    target.write_text(json.dumps(packet, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (out_dir / "labels-h1.json").write_text(json.dumps({"schemaVersion": 1, "packetId": packet["packetId"], "shuffleSeed": SEED,
                                                        "labels": labels}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(" ".join(f"{l['caseId'][-2:]}={l['authoringKey']}" for l in labels))
    print("wrote", target)


if __name__ == "__main__":
    main()
