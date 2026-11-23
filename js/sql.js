/*
 * sql.js — жижигхэн SQL хөдөлгүүр.
 *
 * Дэмждэг зүйлс:
 *   SELECT <* | багана, ...> FROM <хүснэгт>
 *     [WHERE <багана> <=|!=|<>|<|>|<=|>=|LIKE> <утга>]
 *     [ORDER BY <багана> [ASC|DESC]]
 *     [LIMIT <тоо>]
 *   SHOW TABLES;   DESC <хүснэгт>;   HELP;   CLEAR;   THEME;
 *
 * execute() нь үргэлж { type: ... } хэлбэртэй объект буцаадаг.
 * Харин дэлгэцэнд яаж зурахыг app.js шийднэ.
 */
const SQL = (() => {
  // Нэг том regular expression-оор SELECT-ийг хэсэг хэсэгт нь задална.
  const SELECT_RE = new RegExp(
    '^select\\s+(.+?)\\s+from\\s+(\\w+)' +                        // 1: баганууд, 2: хүснэгт
    '(?:\\s+where\\s+(\\w+)\\s*(<=|>=|!=|<>|=|<|>|like)\\s*' +    // 3: багана, 4: оператор
    '(\'[^\']*\'|"[^"]*"|[^\\s;]+))?' +                           // 5: утга
    '(?:\\s+order\\s+by\\s+(\\w+)(?:\\s+(asc|desc))?)?' +         // 6: багана, 7: чиглэл
    '(?:\\s+limit\\s+(\\d+))?' +                                  // 8: limit
    '\\s*;?\\s*$',
    'i'
  );

  const err = (code, msg) => ({ type: 'error', code, msg });

  // '...' эсвэл тоо байвал JS утга болгоно
  function parseValue(raw) {
    if (/^['"].*['"]$/.test(raw)) return raw.slice(1, -1);
    if (!isNaN(raw)) return Number(raw);
    return raw;
  }

  function compare(a, op, b) {
    if (Array.isArray(a)) a = a.join(', ');
    if (op === 'like') {
      // SQL-ийн % -г regex-ийн .* болгоно. Том жижиг үсэг ялгахгүй.
      const pattern = String(b).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.');
      return new RegExp('^' + pattern + '$', 'i').test(String(a));
    }
    if (typeof b === 'string' && typeof a === 'string') {
      a = a.toLowerCase();
      b = b.toLowerCase();
    }
    switch (op) {
      case '=': return a == b;
      case '!=': case '<>': return a != b;
      case '<': return a < b;
      case '>': return a > b;
      case '<=': return a <= b;
      case '>=': return a >= b;
    }
    return false;
  }

  function runSelect(m, db) {
    const [, colsPart, tableName, wCol, wOp, wVal, oCol, oDir, limit] = m;
    const table = db[tableName.toLowerCase()];
    if (!table) return err('ORA-00942', `"${tableName}" хүснэгт олдсонгүй. SHOW TABLES; гэж бичээд үзээрэй.`);

    const allCols = Object.keys(table[0]);
    const hasCol = (c) => allCols.includes(c.toLowerCase());

    // 1. Баганууд
    const cols = colsPart.trim() === '*'
      ? allCols
      : colsPart.split(',').map((c) => c.trim().toLowerCase());
    const badCol = cols.find((c) => !hasCol(c));
    if (badCol) return err('ORA-00904', `"${badCol}": буруу баганын нэр. DESC ${tableName}; гэж шалгаарай.`);

    let rows = table.slice(); // эх өгөгдлийг өөрчлөхгүйн тулд хуулбарлана

    // 2. WHERE
    if (wCol) {
      if (!hasCol(wCol)) return err('ORA-00904', `"${wCol}": буруу баганын нэр.`);
      const value = parseValue(wVal);
      rows = rows.filter((r) => compare(r[wCol.toLowerCase()], wOp.toLowerCase(), value));
    }

    // 3. ORDER BY
    if (oCol) {
      if (!hasCol(oCol)) return err('ORA-00904', `"${oCol}": буруу баганын нэр.`);
      const key = oCol.toLowerCase();
      const dir = oDir && oDir.toLowerCase() === 'desc' ? -1 : 1;
      rows.sort((a, b) => (a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0));
    }

    // 4. LIMIT
    if (limit) rows = rows.slice(0, Number(limit));

    // Хүссэн багануудыг л үлдээнэ. url-ийг холбоос зурахад хэрэглэх тул нууцаар авч явна.
    const picked = rows.map((r) => {
      const o = {};
      cols.forEach((c) => (o[c] = r[c]));
      if (r.url) o.__url = r.url;
      return o;
    });

    return { type: 'rows', table: tableName.toLowerCase(), cols, rows: picked };
  }

  function typeOf(v) {
    if (typeof v === 'number') return 'NUMBER';
    if (Array.isArray(v)) return 'ARRAY';
    return `VARCHAR2(${Math.max(20, String(v).length)})`;
  }

  function execute(input, db) {
    const q = input.trim().replace(/;+\s*$/, '');
    const lower = q.toLowerCase();

    // ---- Нуугдмал easter egg-үүд ----
    if (/^hire\s+tamir$/.test(lower)) return { type: 'hire' };
    if (/^sudo\b/.test(lower)) return err('SUDO', 'tamir is not in the sudoers file. This incident will be reported. 🙂');
    if (/^(drop|delete|truncate|update|insert|alter|create)\b/.test(lower)) {
      return err('ORA-01031', 'insufficient privileges — Энэ өгөгдлийг зөвхөн Тамир өөрчилж чадна 😉');
    }
    if (/\bfrom\s+(secrets?|passwords?)\b/.test(lower)) {
      return err('ORA-00942', 'Нууц гэж байхгүй ээ 😄 Харин HIRE TAMIR; гэж бичээд үзээрэй...');
    }
    if (lower === 'exit' || lower === 'quit') {
      return { type: 'text', html: 'Гарахаасаа өмнө бүтээлүүдийг минь үзээрэй → <a data-q="SELECT * FROM projects;">SELECT * FROM projects;</a>' };
    }

    // ---- Туслах командууд ----
    if (lower === 'help' || lower === '?') return { type: 'help' };
    if (lower === 'clear' || lower === 'cls') return { type: 'clear' };
    if (/^theme(\s+(light|dark))?$/.test(lower)) return { type: 'theme', value: lower.split(/\s+/)[1] };
    if (lower === 'show tables' || lower === '\\dt') {
      return {
        type: 'rows',
        table: 'tables',
        cols: ['table_name', 'rows'],
        rows: Object.keys(db).map((t) => ({ table_name: t, rows: db[t].length })),
      };
    }
    const desc = lower.match(/^(?:desc|describe)\s+(\w+)$/);
    if (desc) {
      const t = db[desc[1]];
      if (!t) return err('ORA-04043', `"${desc[1]}" объект олдсонгүй.`);
      return {
        type: 'rows',
        table: 'describe',
        cols: ['column', 'type'],
        rows: Object.keys(t[0]).map((c) => ({ column: c, type: typeOf(t[0][c]) })),
      };
    }

    // ---- SELECT ----
    const m = q.match(SELECT_RE);
    if (m) return runSelect(m, db);

    if (/^select\b/.test(lower)) return err('ORA-00923', 'FROM түлхүүр үг олдсонгүй эсвэл бичиглэл буруу байна.');
    return err('ORA-00900', 'Буруу SQL команд. HELP; гэж бичээд жишээнүүдийг үзээрэй.');
  }

  return { execute };
})();

// Node дээр тест ажиллуулахад хэрэгтэй
if (typeof module !== 'undefined') module.exports = SQL;
