/**
 * 2페이지 전체 HTML을 data/danawa-page2.html 로 저장
 * 사용법: node scripts/set-danawa-page2.js <저장된_HTML_파일_경로>
 * 예: 채팅에서 복사한 HTML을 data/page2-paste.html 에 붙여넣기 후
 *     node scripts/set-danawa-page2.js data/page2-paste.html
 * 그 다음: npx tsx scripts/parse-danawa.ts
 */
const fs = require("fs");
const path = require("path");

const src = process.argv[2];
if (!src) {
  console.error("사용법: node scripts/set-danawa-page2.js <HTML파일경로>");
  process.exit(1);
}

const root = path.join(__dirname, "..");
const dest = path.join(root, "data", "danawa-page2.html");
let html = fs.readFileSync(src, "utf-8");

// ul.list.modelList 만 있으면 파서가 동작하므로, 해당 구간만 추출해도 됨 (선택)
const listStart = html.indexOf('<ul class="list modelList">');
const listEnd = html.indexOf("</ul>", listStart);
if (listStart !== -1 && listEnd !== -1) {
  const list = html.slice(listStart, listEnd + 5);
  html = '<div class="contents">' + list + "</div>";
}

fs.writeFileSync(dest, html, "utf-8");
console.log("저장 완료:", dest);
