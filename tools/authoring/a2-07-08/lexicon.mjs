// Lexicon rows added by the A2-07/A2-08 authoring pass (words the lessons teach that the WP-04
// inventory did not list). Idempotent: inserts a row only when its id is absent, after the last
// row with the same or an earlier firstLesson; existing rows are never modified here.
//   node tools/authoring/a2-07-08/lexicon.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SRC } from './lib.mjs';

export const ADDITIONS = {
  'A2-07': [
    { id: 'lex.pasar', lemma: 'pasar', pos: 'verb', meaningUk: 'передавати (за столом, з рук у руки)', firstLesson: 'A2-07-L1', noteUk: '¿Me pasas el pan? — Передаси мені хліб?' },
    { id: 'lex.cambiar', lemma: 'cambiar', pos: 'verb', meaningUk: 'змінювати; переносити (зустріч, запис)', firstLesson: 'A2-07-L1', noteUk: 'Quería cambiar la cita. — Я хотів би перенести запис.' },
    { id: 'lex.momento', lemma: 'momento', pos: 'noun', gender: 'm', plural: 'momentos', meaningUk: 'мить, момент', firstLesson: 'A2-07-L1', noteUk: 'Un momento — хвилинку.' },
    { id: 'lex.mirar', lemma: 'mirar', pos: 'verb', meaningUk: 'дивитися', firstLesson: 'A2-07-L3', noteUk: '¡Mira! — Подивися!' },
    { id: 'lex.seguir', lemma: 'seguir', pos: 'verb', meaningUk: 'продовжувати; іти далі', firstLesson: 'A2-07-L3', noteUk: 'У теперішньому часі e → i: sigue. Sigue hasta la plaza. — Іди далі до площі.' },
    { id: 'lex.reservar', lemma: 'reservar', pos: 'verb', meaningUk: 'бронювати, резервувати', firstLesson: 'A2-07-L7', noteUk: 'Hay que reservar mesa. — Треба забронювати столик.' },
    { id: 'lex.vender', lemma: 'vender', pos: 'verb', meaningUk: 'продавати', firstLesson: 'A2-07-L7', noteUk: 'Se vende — продається (в оголошеннях).' },
    { id: 'lex.boton', lemma: 'botón', pos: 'noun', gender: 'm', plural: 'botones', meaningUk: 'кнопка', firstLesson: 'A2-07-L7', noteUk: 'Pulsar el botón — натиснути кнопку.' },
  ],
  'A2-08': [],
};

const order = (id) => {
  const m = /^A([12])-0([1-8])-(?:L([0-9]{1,2})|(C1))$/.exec(id);
  return m ? Number(m[1]) * 10000 + Number(m[2]) * 100 + (m[4] ? 99 : Number(m[3])) : 0;
};

export function applyAdditions() {
  const added = [];
  for (const [block, rows] of Object.entries(ADDITIONS)) {
    const path = join(SRC, 'lexicon', `${block}.json`);
    const json = JSON.parse(readFileSync(path, 'utf8'));
    for (const row of rows) {
      if (json.items.some((x) => x.id === row.id)) continue;
      let at = json.items.length;
      for (let i = json.items.length - 1; i >= 0; i--) {
        if (order(json.items[i].firstLesson) <= order(row.firstLesson)) {
          at = i + 1;
          break;
        }
        at = i;
      }
      json.items.splice(at, 0, row);
      added.push(`${block}:${row.id}`);
    }
    writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`);
  }
  return added;
}

if (process.argv[1]?.endsWith('lexicon.mjs')) console.log(applyAdditions().join('\n') || 'nothing to add');
