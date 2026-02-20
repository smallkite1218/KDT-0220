/**
 * 다나와 HTML을 파싱해 lib/danawa-default-cars.json 생성
 * 실행: npx tsx scripts/parse-danawa.ts
 *
 * - data/danawa-sample.html 만 있으면 → 이 파일만 파싱 (1페이지분, 약 30대)
 * - data/danawa-page1.html, danawa-page2.html, ... 도 있으면 → 전부 파싱 후 합쳐서 저장 (300대+ 가능)
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import { parseDanawaHtmlToCars } from "../lib/danawa-parser"
import type { Car } from "../lib/car-data"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const dataDir = join(root, "data")
const outPath = join(root, "lib", "danawa-default-cars.json")

function collectHtmlPaths(): string[] {
  const paths: string[] = []
  const sample = join(dataDir, "danawa-sample.html")
  if (existsSync(sample)) paths.push(sample)

  if (!existsSync(dataDir)) return paths
  const files = readdirSync(dataDir)
  for (const f of files.sort()) {
    if (f.startsWith("danawa-page") && f.endsWith(".html")) {
      paths.push(join(dataDir, f))
    }
  }
  return paths
}

const htmlPaths = collectHtmlPaths()
if (htmlPaths.length === 0) {
  console.error("data/danawa-sample.html 또는 data/danawa-pageN.html 이 없습니다.")
  process.exit(1)
}

const seenModelIds = new Set<string>()
const allCars: Car[] = []

for (const htmlPath of htmlPaths) {
  const html = readFileSync(htmlPath, "utf-8")
  const cars = parseDanawaHtmlToCars(html)
  let added = 0
  for (const car of cars) {
    const modelId = car.id.replace(/^danawa-(\d+)-.*/, "$1")
    if (seenModelIds.has(modelId)) continue
    seenModelIds.add(modelId)
    allCars.push(car)
    added++
  }
  console.log(`  ${htmlPath.split(/[/\\]/).pop()}: ${cars.length}대 중 ${added}대 추가 → 누적 ${allCars.length}대`)
}

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, JSON.stringify(allCars, null, 2), "utf-8")
console.log(`총 ${allCars.length}대 저장 -> ${outPath}`)
