/**
 * stdin으로 전달된 HTML을 data/danawa-paste3.html 에 저장
 * 사용법: Get-Content page3.html -Raw | node scripts/write-paste3-from-stdin.js
 * 또는: type page3.html | node scripts/write-paste3-from-stdin.js
 */
const fs = require("fs");
const path = require("path");

let data = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => { data += chunk; });
process.stdin.on("end", () => {
  const root = path.join(__dirname, "..");
  const out = path.join(root, "data", "danawa-paste3.html");
  fs.writeFileSync(out, data, "utf-8");
  console.log("저장:", out);
});
