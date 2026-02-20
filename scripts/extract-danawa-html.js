/**
 * One-off: extract Danawa HTML from agent transcript and write data/danawa-sample.html
 */
const fs = require("fs");
const path = require("path");

const transcriptPath = path.join(
  __dirname,
  "..",
  "..",
  "..",
  ".cursor",
  "projects",
  "c-Users-HomePc-ai",
  "agent-transcripts",
  "df01c1c7-4ba7-47e4-8845-430f74e5d8fb",
  "df01c1c7-4ba7-47e4-8845-430f74e5d8fb.jsonl"
);
const lines = fs.readFileSync(transcriptPath, "utf-8").split("\n");
const line95 = lines[94]; // 0-based index for line 95
const msg = JSON.parse(line95);
const text = msg.message.content[0].text;

const start = text.indexOf('<div class="contents">');
const end = text.indexOf(" 여기에 있는");
if (start === -1 || end === -1) throw new Error("Could not find HTML boundaries");
const html = text.substring(start, end).trim();

const outDir = path.join(__dirname, "..", "data");
const outPath = path.join(outDir, "danawa-sample.html");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, html, "utf-8");
console.log("Wrote", outPath, "length", html.length);
