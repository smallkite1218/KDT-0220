/**
 * 기존(sample, page2) + 3페이지 데이터를 합쳐 lib/danawa-default-cars.json 갱신.
 * 3페이지: data/danawa-paste3.html 에 HTML 붙여넣기 후 이 스크립트 실행.
 * 사용법: node scripts/merge-danawa.js
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const paste3 = path.join(root, "data", "danawa-paste3.html");

if (fs.existsSync(paste3)) {
  const html = fs.readFileSync(paste3, "utf-8");
  const listStart = html.indexOf('<ul class="list modelList">');
  const listEnd = listStart >= 0 ? html.indexOf("</ul>", listStart) : -1;
  if (listStart >= 0 && listEnd > listStart) {
    console.log("3페이지 HTML 감지 → 추출 후 파싱합니다.");
    execSync(`node scripts/set-danawa-page3.js "${paste3}"`, { cwd: root, stdio: "inherit" });
  }
}

execSync("npx tsx scripts/parse-danawa.ts", { cwd: root, stdio: "inherit" });
console.log("UI에 반영된 데이터: lib/danawa-default-cars.json (앱 새로고침 시 적용)");
