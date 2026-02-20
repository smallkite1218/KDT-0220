import { NextResponse } from "next/server"
import { getPublicDataCarList } from "@/lib/public-data-api"

/**
 * GET /api/cars/public
 * 공공데이터포털(한국에너지공단 자동차 표시연비 목록)에서 제원을 불러옵니다.
 * 환경변수 DATA_GO_KR_SERVICE_KEY 가 설정되어 있어야 합니다.
 * MVP 완성 후 실시간 한국 시장 제원 반영용.
 */
export async function GET() {
  try {
    const items = await getPublicDataCarList()
    return NextResponse.json({
      success: true,
      count: items.length,
      data: items,
      source: "공공데이터포털_자동차 표시연비 목록",
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "공공데이터 조회 실패"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
