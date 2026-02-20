/**
 * 다나와 신차 목록 HTML 파서 → CarInsight Car 형식 변환
 * 사용: 목록 페이지 HTML을 POST로 보내거나 파일로 넘기면 Car[] 형태로 반환
 *
 * 주의: 크롤링 대상 사이트의 이용약관·저작권을 확인하고, 개인/교육용 또는 허가 범위 내에서 사용하세요.
 */

import * as cheerio from "cheerio"
import type { Car } from "./car-data"

const BRAND_MAP: Record<string, string> = {
  현대: "HYUNDAI",
  기아: "KIA",
  제네시스: "GENESIS",
  테슬라: "TESLA",
  BMW: "BMW",
  벤츠: "MERCEDES-BENZ",
  메르세데스: "MERCEDES-BENZ",
  아우디: "AUDI",
  토요타: "TOYOTA",
  혼다: "HONDA",
  볼보: "VOLVO",
  포르쉐: "PORSCHE",
  르노코리아: "RENAULT",
  // 다나와 신차검색 HTML 반영
  쉐보레: "CHEVROLET",
  KGM: "KGM",
  동풍: "DONGFENG",
  쎄보모빌리티: "SEVO",
  "SMART EV": "SMARTEV",
  디피코: "DPECO",
  마이브: "MYBV",
  제이스모빌리티: "JSM",
  BYD: "BYD",
  폴스타: "POLESTAR",
}

const DOMESTIC_BRANDS = new Set(["HYUNDAI", "KIA", "GENESIS", "KGM"])

function mapCategory(specText: string): "sedan" | "suv" | "mpv" {
  if (/SUV|스포티지|투싼|싼타페|쏘렌토|코나|셀토스|니로|EV3|EV5|GV70|GV80|팰리세이드|아이오닉|Model Y|그랑 콜레오스|소형SUV|중형SUV|대형SUV/i.test(specText)) return "suv"
  if (/MPV|카니발|스타리아|PV5|RV\/MPV|대형MPV/i.test(specText)) return "mpv"
  if (/경차|소형|준중형|중형|준대형|대형|스포츠카|소형트럭|픽업|밴|경트럭|상용/i.test(specText)) return "sedan"
  return "sedan"
}

function mapFuelType(specText: string): Car["fuelType"] {
  if (/전기\(배터리\)|전기차|복합전비|총주행거리|배터리/i.test(specText)) return "ev"
  if (/전기\(수소\)/i.test(specText)) return "ev"
  if (/하이브리드|HEV|PHEV|플러그인/i.test(specText)) return "hybrid"
  if (/디젤|경유/i.test(specText)) return "diesel"
  if (/LPG|휘발유|가솔린/i.test(specText)) return "gasoline"
  if (/바이퓨얼|LPG\+가솔린/i.test(specText)) return "lpg"
  return "gasoline"
}

function parseEfficiency(specText: string): number | null {
  const m = specText.match(/복합연비\s*([\d.]+)/) || specText.match(/복합전비\s*([\d.]+)/)
  if (m) return parseFloat(m[1])
  const range = specText.match(/([\d.]+)\s*~\s*([\d.]+)\s*[㎞\/ℓ|㎞\/kWh]/)
  if (range) return (parseFloat(range[1]) + parseFloat(range[2])) / 2
  return null
}

function parsePrice(priceText: string): number | null {
  const cleaned = priceText.replace(/,|\s|만원|만\s*원/g, "").trim()
  const n = parseInt(cleaned, 10)
  return Number.isNaN(n) ? null : n
}

function parseYear(specText: string): number {
  const m = specText.match(/(\d{4})\.\d{2}\.\s*출시/)
  if (m) return parseInt(m[1], 10)
  return new Date().getFullYear()
}

export interface DanawaCarRaw {
  modelId: string
  brandName: string
  modelName: string
  priceMin: number | null
  imageUrl: string
  specText: string
  year: number
}

export function parseDanawaListHtml(html: string): DanawaCarRaw[] {
  const $ = cheerio.load(html)
  const items: DanawaCarRaw[] = []

  $("ul.modelList li").each((_, el) => {
    const $li = $(el)
    if ($li.hasClass("list_banner")) return

    const $img = $li.find('a.image img[alt]').first()
    const $name = $li.find('a.name[name="modelDetailLink"]').first()
    const $spec = $li.find(".detail .spec").first()
    const $price = $li.find(".box__selling .text__price").first()

    const modelId = $li.find('a[model]').attr("model") || ""
    if (!modelId) return

    const imgSrc = $img.attr("src") || ""
    const fullName = $name.text().trim().replace(/\s+/g, " ")
    const specText = $spec.text()
    const priceText = $price.text().trim()

    let brandName = ""
    let modelName = fullName
    for (const [kr, en] of Object.entries(BRAND_MAP)) {
      if (fullName.startsWith(kr)) {
        brandName = en
        modelName = fullName.slice(kr.length).trim()
        break
      }
    }
    if (!brandName) brandName = fullName.split(/\s/)[0] || ""

    items.push({
      modelId,
      brandName,
      modelName: modelName || fullName,
      priceMin: parsePrice(priceText),
      imageUrl: imgSrc.startsWith("http") ? imgSrc : imgSrc ? `https:${imgSrc}` : "",
      specText,
      year: parseYear(specText),
    })
  })

  return items
}

export function danawaRawToCar(raw: DanawaCarRaw, index: number): Car {
  const category = mapCategory(raw.specText)
  const fuelType = mapFuelType(raw.specText)
  const efficiency = parseEfficiency(raw.specText)
  const price = raw.priceMin ?? 3000

  const id = `danawa-${raw.modelId}-${index}`
  const origin = DOMESTIC_BRANDS.has(raw.brandName) ? "domestic" : "import"

  const fuelScore = efficiency != null ? Math.min(10, Math.round((efficiency / 20) * 10)) : 5
  const priceScore = price <= 2500 ? 9 : price <= 4000 ? 7 : price <= 6000 ? 5 : 3

  return {
    id,
    brand: raw.brandName,
    model: raw.modelName,
    price,
    fuelType,
    category,
    year: raw.year,
    image: raw.imageUrl || "",
    tags: [raw.brandName, category.toUpperCase()],
    lifestyles: [],
    origin,
    specs: {
      price: priceScore * 10,
      fuel: fuelScore * 10,
      design: 5,
      space: 5,
      safety: 5,
    },
    aiComment: `${raw.year}년 출시. ${raw.specText.slice(0, 80)}${raw.specText.length > 80 ? "…" : ""}`,
    viewCount: 0,
  }
}

export function parseDanawaHtmlToCars(html: string): Car[] {
  const rawList = parseDanawaListHtml(html)
  return rawList.map((raw, i) => danawaRawToCar(raw, i))
}
