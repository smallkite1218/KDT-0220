import { NextResponse } from "next/server"
import { parseDanawaHtmlToCars } from "@/lib/danawa-parser"

const DEFAULT_DANAWA_LIST_URL = "https://auto.danawa.com/newcar/"

/**
 * GET /api/cars/import-danawa?url=...
 * 다나와 신차 목록 페이지 URL을 직접 요청해 HTML을 가져온 뒤 파싱해 Car[]를 반환합니다.
 * url 생략 시 기본 목록 페이지를 사용합니다.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url") || DEFAULT_DANAWA_LIST_URL
    if (!url.startsWith("https://auto.danawa.com/")) {
      return NextResponse.json(
        { success: false, error: "다나와 자동차(auto.danawa.com) URL만 허용됩니다." },
        { status: 400 }
      )
    }
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      },
    })
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `페이지 요청 실패: ${res.status}` },
        { status: 502 }
      )
    }
    const html = await res.text()
    const cars = parseDanawaHtmlToCars(html)
    return NextResponse.json({
      success: true,
      count: cars.length,
      data: cars,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "다나와 페이지를 불러오는 중 오류가 났습니다."
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cars/import-danawa
 * Body: { html: string } 또는 multipart/form-data로 HTML 파일 업로드
 * 다나와 신차 목록 HTML을 파싱해 CarInsight Car[] 형식으로 반환합니다.
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || ""
    let html = ""

    if (contentType.includes("application/json")) {
      const body = await request.json()
      html = body.html ?? body.body ?? ""
    } else if (contentType.includes("text/html")) {
      html = await request.text()
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const file = formData.get("file") as File | null
      const field = formData.get("html") as string | null
      if (file) {
        html = await file.text()
      } else if (field) {
        html = field
      }
    }

    if (!html || html.length < 100) {
      return NextResponse.json(
        { success: false, error: "HTML 내용이 비어 있거나 너무 짧습니다. 다나와 신차 목록 페이지 HTML을 넣어 주세요." },
        { status: 400 }
      )
    }

    const cars = parseDanawaHtmlToCars(html)
    return NextResponse.json({
      success: true,
      count: cars.length,
      data: cars,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "파싱 중 오류가 났습니다."
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
