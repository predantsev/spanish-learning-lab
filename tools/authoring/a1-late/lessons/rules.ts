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
};
