/**
 * 3페이지(또는 N페이지) HTML에서 차량 목록만 추출해 data/danawa-page3.html 로 저장
 * 사용법: node scripts/set-danawa-page3.js <저장된_HTML_파일_경로>
 * 예: 채팅에서 복사한 HTML을 data/paste3.html 에 붙여넣기 후
 *     node scripts/set-danawa-page3.js data/paste3.html
 * 그 다음: npx tsx scripts/parse-danawa.ts
 */
const fs = require("fs");
const path = require("path");

const src = process.argv[2];
if (!src) {
  console.error("사용법: node scripts/set-danawa-page3.js <HTML파일경로>");
  process.exit(1);
}

const root = path.join(__dirname, "..");
const dest = path.join(root, "data", "danawa-page3.html");
let html = fs.readFileSync(src, "utf-8");

const listStart = html.indexOf('<ul class="list modelList">');
if (listStart === -1) {
  console.error("HTML에서 <ul class=\"list modelList\"> 를 찾을 수 없습니다.");
  process.exit(1);
}
// pagination 직전의 </ul>이 모델 리스트를 닫는 태그
const paginationStart = html.indexOf('<div class="common-pagination-basic">', listStart);
const searchEnd = paginationStart !== -1 ? paginationStart : html.length;
const listEnd = html.lastIndexOf("</ul>", searchEnd);
if (listEnd === -1 || listEnd <= listStart) {
  console.error("목록 종료 </ul> 을 찾을 수 없습니다.");
  process.exit(1);
}
const list = html.slice(listStart, listEnd + 5);
const out = '<div class="contents">' + list + "</div>";

fs.writeFileSync(dest, out, "utf-8");
console.log("저장 완료:", dest);
