# tamir.db — SQL консол портфолио

> `SELECT * FROM tamir;`

**Баасанжав Тамир**ын хувийн портфолио вэбсайт. SWE334 Интернет програмчлал, бие даалт 2.

🔗 **Live:** https://tamir-portfolio-two.vercel.app/

---

## 💡 Бүтээлч санаа

Ердийн "нүүр → тухай → бүтээл" бүтэцтэй сайтын оронд энэ сайт нь **Oracle SQL Developer маягийн өгөгдлийн сангийн консол** юм.
Зочин намайг **SQL query бичиж** танина:

```sql
SELECT * FROM about;
SELECT name, level FROM skills WHERE level >= 80 ORDER BY level DESC;
SELECT title, stack FROM projects WHERE stack LIKE '%React%';
SELECT * FROM contact;
```

Яагаад SQL вэ? Би Герэгэ Системс-д дадлага хийхдээ Oracle SQL-тэй их ажилласан, мөн өгөгдөл, аналитикийн чиглэлээр хөгжиж байгаа. Тиймээс миний тухай мэдээлэл ч гэсэн **өгөгдлийн сан** байх нь зүйн хэрэг.

SQL мэдэхгүй зочинд зориулж зүүн талд **хүснэгт, хадгалсан query-ууд** байрлуулсан. Дарахад query өөрөө бичигдэж, ажилладаг тул хэрэглэгч SQL-ийг давхар сурна.

### Онцлогууд
- **Өөрөө бичсэн жижиг SQL хөдөлгүүр:** `SELECT`, баганаар сонгох, `WHERE` (`= != < > <= >= LIKE`), `ORDER BY`, `LIMIT`, `SHOW TABLES`, `DESC`
- **Oracle маягийн алдааны мессеж:** `ORA-00942`, `ORA-00904` гэх мэт
- Үр дүнг төрлөөр нь **өөр өөрөөр зурна:** бүтээлүүд карт хэлбэрээр, ур чадвар анимэйшнтэй bar-аар, нэг мөртэй үр дүн түлхүүр–утга хэлбэрээр
- Syntax highlighting, **↑↓** query түүх, **Tab** автоматаар нөхөх
- **Dark / Light** горим (localStorage-д хадгална)
- Гар утсанд responsive: хажуугийн самбар нь гүйлгэдэг chip болж хувирна
- Бүтээлийн зургууд, лого бүгд **өөрөө зурсан SVG**
- 🤫 Нуугдмал easter egg-үүд бий (`DROP TABLE`, `sudo`, ...). Хамгийн гол нь юу болохыг олоорой.

## 🛠 Технологи

| | |
|---|---|
| Хэл | HTML, CSS, Vanilla JavaScript (framework-гүй) |
| Фонт | IBM Plex Sans, IBM Plex Mono (Google Fonts) |
| Байршуулалт | Vercel |

Ямар нэг framework, build tool ашиглаагүй. Бүх логик нь цэвэр JS.

## 📁 Бүтэц

```
├── index.html          # Хуудасны бүтэц
├── style.css           # Загвар, dark/light өнгө, responsive
├── js/
│   ├── data.js         # "Өгөгдлийн сан": me, about, skills, projects, contact хүснэгтүүд
│   ├── sql.js          # SQL хөдөлгүүр: query-г задлаад үр дүн буцаана
│   └── app.js          # Консолын UI: үр дүн зурах, түүх, тема, анимэйшн
└── assets/             # Өөрөө зурсан SVG зураг, favicon
```

**Ажиллах урсгал:** хэрэглэгч query бичнэ → `app.js` → `SQL.execute(query, DB)` → `{ type: 'rows', cols, rows }` эсвэл `{ type: 'error', ... }` → `app.js` үр дүнг дэлгэцэнд зурна.

`sql.js` нь `SELECT`-ийг нэг regular expression-оор хэсэгчилж (баганууд, хүснэгт, WHERE, ORDER BY, LIMIT), дараа нь `filter → sort → slice → map` дарааллаар массив дээр ажиллуулдаг.

## ▶️ Локалаар ажиллуулах

Build хэрэггүй. `index.html`-ийг browser дээр нээх эсвэл:

```bash
npx serve .
```

## ✏️ Мэдээлэл засах

Бүх контент `js/data.js` дотор байна. Шинэ бүтээл нэмэх бол `projects` массивт нэг объект нэмэхэд хангалттай.

## 📚 Эх сурвалж

- Фонт: [IBM Plex](https://github.com/IBM/plex), SIL Open Font License
- Зураг, лого, иконууд: өөрөө SVG-ээр зурсан
- Санаа: Oracle SQL Developer болон терминал интерфэйсээс сэдэвлэсэн
- AI хэрэгсэл (Claude)-ийг хөгжүүлэлтэд туслах байдлаар ашигласан
