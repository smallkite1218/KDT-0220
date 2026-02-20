/**
 * 다나와 신차검색 2페이지 HTML을 가져와 data/danawa-page2.html 로 저장
 * 실행: node scripts/fetch-danawa-page2.js
 * 그 다음: npx tsx scripts/parse-danawa.ts
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const PAGE2_URL =
  "https://auto.danawa.com/newcar/?Work=search&listSortType=3&tab=all&listCount=30&page=2";
const root = path.join(__dirname, "..");
const dest = path.join(root, "data", "danawa-page2.html");

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      }
    );
    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

async function main() {
  console.log("다나와 2페이지 요청 중...");
  const html = await fetchHtml(PAGE2_URL);

  const listStart = html.indexOf('<ul class="list modelList">');
  const listEnd = html.indexOf("</ul>", listStart);
  if (listStart === -1 || listEnd === -1) {
    console.error(
      "서버 응답에 차량 목록(ul.list.modelList)이 없습니다. 다나와는 목록을 JavaScript로 불러옵니다.\n" +
        "2페이지 전체를 반영하려면 docs/실제_차량_데이터_적용_가이드.md 의 '2페이지 전체 반영하기'를 참고해\n" +
        "브라우저에서 해당 페이지를 연 뒤, 목록 HTML을 복사해 저장하고 set-danawa-page2.js 로 넣어주세요."
    );
    process.exit(1);
  }

  const list = html.slice(listStart, listEnd + 5);
  const out = '<div class="contents">' + list + "</div>";
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, out, "utf-8");
  console.log("저장 완료:", dest);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
