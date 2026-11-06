// Short Ukrainian rule texts used for targeted rule hints and "incorrect" feedback of the a1-late
// tasks. Each text explains exactly one skill, so a rule hint maps only to the targets it explains.
export const RULES: Record<string, string> = {
  // A1-04-L1
  'present.regular-ar':
    'Дієслова на -ar в однині: відкинь -ar і додай закінчення особи — yo -o (hablo), tú -as (hablas), él / ella / usted -a (habla).',
  'present.regular-ar.plural':
    'Дієслова на -ar у множині: nosotros -amos (hablamos), vosotros -áis зі знаком наголосу (habláis), ellos / ellas / ustedes -an (hablan).',
  'prep.con.company': '«Разом із кимось» — con + людина: Ceno con mi familia. Hablo con Ana. Після con іменник чи ім’я не змінюється.',
  'listening.daily-actions':
    'Закінчення дієслова підказує, хто виконує дію: -o — «я», -amos / -emos / -imos — «ми», -an / -en — «вони». Спершу знайди дію, потім — хто її виконує.',
  // A1-04-L2
  'present.regular-er':
    'Дієслова на -er в однині: відкинь -er і додай закінчення особи — yo -o (como), tú -es (comes), él / ella / usted -e (come).',
  'present.regular-er.plural':
    'Дієслова на -er у множині: nosotros -emos (comemos), vosotros -éis зі знаком наголосу (coméis), ellos / ellas / ustedes -en (comen).',
  'present.regular-ir':
    'Дієслова на -ir в однині мають ті самі закінчення, що й дієслова на -er: yo -o (vivo), tú -es (vives), él / ella / usted -e (vive).',
  'present.regular-ir.plural':
    'Дієслова на -ir у множині: nosotros -imos (vivimos), vosotros -ís зі знаком наголосу (vivís), ellos / ellas / ustedes -en (viven).',
  'contrast.er-ir-endings':
    'Дієслова на -er і на -ir відрізняються лише у формах nosotros і vosotros: comemos — vivimos, coméis — vivís. Голосна інфінітива підказує закінчення: -er → -emos, -éis; -ir → -imos, -ís.',
  // A1-04-L3
  'present.ir': 'Ir («іти, їхати») має особливі форми, їх треба запам’ятати: voy, vas, va, vamos, vais, van. Форма vais пишеться без знака наголосу.',
  'present.hacer': 'Hacer відмінюється як правильне дієслово на -er, крім форми yo: hago. Решта форм: haces, hace, hacemos, hacéis, hacen.',
  'prep.a.destination': 'Куди рухаємося — ir a + місце: Voy a Madrid. Vamos a casa. Де перебуваємо — estar en: Estoy en casa.',
  'article.contraction-al':
    'Прийменник a й артикль el зливаються в al: Voy al cine (el cine). З la, los, las злиття немає: Voy a la playa. Перед назвою міста артикля немає — просто a: Voy a Madrid.',
  // A1-04-L4
  'reflexive.pronouns':
    'Займенник відповідає підмету: yo — me, tú — te, él / ella / usted — se, nosotros — nos, vosotros — os, ellos / ellas / ustedes — se.',
  'reflexive.placement':
    'Займенник стоїть окремим словом перед відмінюваним дієсловом: Me levanto temprano. У запереченні no стоїть перед займенником: No me levanto tarde. У словнику таке дієслово має -se в кінці: levantarse.',
  // A1-04-L5
  'time.parts-of-day':
    'Без точного часу частину доби називаємо з por і артиклем la: por la mañana — «зранку», por la tarde — «удень, після обіду», por la noche — «увечері, вночі».',
  'time.frequency.adverbs':
    'Siempre — «завжди», normalmente — «зазвичай», a menudo — «часто», a veces — «іноді». Найчастіше ці слова стоять перед дієсловом або на початку речення: Siempre desayuno en casa. A veces voy al cine.',
  'neg.nunca':
    'Nunca — «ніколи». Якщо nunca стоїть перед дієсловом, no не потрібне: Nunca como carne. Якщо nunca стоїть після дієслова, перед дієсловом ставимо no: No como carne nunca.',
  'time.frequency.expressions':
    'Todos los días або cada día — «щодня», los fines de semana — «на вихідних», una vez a la semana — «раз на тиждень», los sábados — «щосуботи» (los + день тижня означає повтор). Ці вирази зазвичай стоять на початку або в кінці речення.',
};
