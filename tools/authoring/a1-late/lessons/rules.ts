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
  // A1-04-L6
  'link.sequence':
    'Щоб розповісти про дії по черзі: primero — «спочатку», después і luego — «потім», más tarde — «пізніше», por último і al final — «наостанок, зрештою». Primero me levanto, después desayuno y luego voy al trabajo.',
  'reading.routine-text':
    'Прочитай текст і знайди потрібне: що людина робить, як часто і в якій послідовності. Слова primero, después, siempre, a veces підказують порядок і частотність дій.',
  'writing.routine':
    'Напиши кілька коротких речень про день: що робиш, як часто і в якій послідовності. Використовуй вивчені дієслова, слова частотності (siempre, a veces) і порядку (primero, después).',
  'listening.routine': 'Спершу визнач головне — хто говорить і про що, потім деталі: у якій послідовності й як часто відбуваються дії.',
  // A1-05-L1
  'number.0-15': 'Числа від 0 до 15 — окремі слова: cero, uno, dos, tres, cuatro, cinco, seis, siete, ocho, nueve, diez, once, doce, trece, catorce, quince.',
  'number.16-29':
    'Від 16 до 29 числа пишуться одним словом: dieci- + одиниці (dieciséis, diecisiete), veinti- + одиниці (veintiuno, veintidós). Знак наголосу мають dieciséis, veintidós, veintitrés і veintiséis.',
  'number.30-99':
    'Десятки: treinta, cuarenta, cincuenta, sesenta, setenta, ochenta, noventa. Від 31 до 99 між десятками й одиницями ставимо y і пишемо окремо: treinta y uno, cuarenta y cinco.',
  'number.100-1000':
    'Рівно 100 — cien, 101–199 — ciento + решта (ciento veinte). Сотні: doscientos, trescientos, cuatrocientos, quinientos, seiscientos, setecientos, ochocientos, novecientos; перед іменником жіночого роду — -as (doscientas fotos). 1000 — mil.',
  'number.uno-un-una':
    'Рахуючи, кажемо uno, а перед іменником — un (чоловічий рід) або una (жіночий рід): un libro, una casa. Так само в складених числах: veintiún años (зі знаком наголосу), treinta y un chicos.',
  'number.ordinal':
    'Порядкові числа змінюються, як прикметники на -o: primero / primera, segundo / segunda, tercero, cuarto, quinto, sexto, séptimo, octavo, noveno, décimo. На табличках: 1.º, 2.ª.',
  'number.ordinal.apocope':
    'Перед іменником чоловічого роду в однині primero і tercero втрачають -o: el primer piso, el tercer día. Перед жіночим родом форма повна: la primera calle, la tercera planta.',
  'listening.amounts': 'Послухай і визнач число чи кількість. Відповідати можна цифрами: тут перевіряється, чи ти правильно почув, а не як пишеться число.',
  'quant.mucho':
    'Перед іменником mucho («багато») і poco («мало») узгоджуються з ним: mucho dinero, mucha agua, muchos libros, muchas personas; poco tiempo, pocas sillas. Після дієслова вони не змінюються: Trabaja mucho.',
  'contrast.muy-mucho':
    'Muy — перед прикметником чи прислівником: muy grande, muy bien. Mucho — перед іменником (mucho trabajo) або після дієслова (Estudia mucho). Українською обидва часто звучать як «дуже» чи «багато», тож дивись, що стоїть поруч.',
  'quant.containers':
    'Кількість товару: міра + de + іменник без артикля: un kilo de tomates, una botella de agua, un paquete de café. Половина: medio kilo, medio litro, media docena.',
  'tener.age': 'Вік в іспанській «мають»: Tengo veinte años — «мені двадцять років». Питання: ¿Cuántos años tienes? Не кажи «soy veinte años».',
  'question.word.cuanto':
    'Cuánto питає про кількість і перед іменником узгоджується з ним: ¿Cuánto dinero? ¿Cuánta agua? ¿Cuántos años? ¿Cuántas personas? Усі форми пишуться зі знаком наголосу.',
  // A1-05-L2
  'price.amount-comprehension':
    'На іспанських цінниках десяткову частину відокремлює кома: 3,50 € — три євро п’ятдесят центів. Знак € зазвичай стоїть після суми. Тисячі пишуть із крапкою, пробілом або разом: 1.200 €, 1 200 €, 1200 €.',
  'price.amount-wording':
    'Ціну словами називаємо так: число + euros + con + центи: tres euros con cincuenta (céntimos). У розмові коротше: tres euros cincuenta або tres cincuenta. Менше за євро — céntimos: ochenta céntimos. Один євро — un euro, 21 — veintiún euros.',
  'price.ask-answer':
    'Ціну однієї речі питаємо ¿Cuánto cuesta…?, кількох — ¿Cuánto cuestan…?: ¿Cuánto cuestan los tomates? Відповідь: Cuesta dos euros. Cuestan tres euros el kilo. Загальну суму питаємо ¿Cuánto es? — Son cinco euros.',
  'formula.shop':
    'Продавець: ¿Qué desea? або ¿Qué le pongo? — «Що бажаєте?»; ¿Algo más? — «Щось іще?». Ти: ¿Me pone un café, por favor? / Un kilo de tomates, por favor; Nada más, gracias. Aquí tiene — «ось, будь ласка». ¿En efectivo o con tarjeta? — «готівкою чи карткою?». У кафе: La cuenta, por favor.',
  'reading.price-label':
    'На цінниках вказують товар, ціну й одиницю: Tomates 2,30 €/kg — кілограм помідорів коштує 2,30 €. Oferta — акція, 2 x 1 — «два за ціною одного». Menú del día — комплексний обід за фіксовану ціну.',
  // A1-05-L3
  'time.clock.hours': 'Котра година — ¿Qué hora es? Відповідь: Son las + число: Son las dos, Son las diez. Артикль las обов’язковий: не «son dos», а son las dos.',
  'time.clock.es-la-una': 'Перша година — в однині: Es la una, Es la una y media. Усі інші години — у множині: Son las dos. Так само «о першій» — a la una, а «о другій» — a las dos.',
  'time.clock.minutes':
    'До половини години хвилини додаємо через y: las tres y cuarto (3:15), las tres y media (3:30), las cinco y diez (5:10). Після половини називаємо наступну годину й віднімаємо хвилини через menos: las cuatro menos cuarto (3:45), las seis menos veinte (5:40).',
  'time.clock.de-la-manana':
    'З точним часом частину доби додаємо через de: a las ocho de la mañana, a las cinco de la tarde, a las once de la noche. Без точного часу — por: por la mañana.',
  'time.event.a-las': 'Про час події питаємо ¿A qué hora…?: ¿A qué hora es la clase? Відповідь: a las + година: A las nueve. О першій — a la una.',
  'contrast.que-hora-a-que-hora': '¿Qué hora es? — «Котра година зараз?» (Son las cinco.) ¿A qué hora…? — «О котрій відбувається подія?» (A las nueve.)',
  'time.range.de-a': '«Від … до …» — de … a …: El banco abre de nueve a dos. Інший варіант — desde las nueve hasta las dos. На табличках коротко: de 9:00 a 14:00.',
  'time.abre-cierra':
    'Abre — «відчиняється», cierra — «зачиняється»; про кілька закладів — abren, cierran. El banco abre a las nueve y cierra a las dos. Стан зараз — estar: La farmacia está cerrada.',
  'reading.opening-hours':
    'Horario — «години роботи». L–V — «з понеділка до п’ятниці». Багато закладів в Іспанії працюють із перервою: 9:00–14:00 y 17:00–20:30. Festivos — святкові дні, cerrado — зачинено.',
  'listening.times': 'Послухай і визнач час. Звертай увагу на y і menos: las cuatro menos cuarto — це 3:45, а не 4:15.',
};
