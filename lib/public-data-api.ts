/**
 * 공공데이터포털 API 연동 (MVP 완성 후 실시간 제원 반영용)
 *
 * - 한국에너지공단_자동차 표시연비 목록 조회 서비스 (data.go.kr 15139827)
 *   모델명, 제조사, 차종, 연비, 1회충전거리 등
 * - API 키: 공공데이터포털 회원가입 → 활용신청 → 서비스키 발급
 * - Swagger 명세: 해당 API 상세 페이지에서 확인
 */

export interface PublicDataCarItem {
  modelName?: string
  maker?: string
  vehicleType?: string
  fuelType?: string
  efficiency?: number
  cityEfficiency?: number
  highwayEfficiency?: number
  evRange?: number
  co2Emissions?: number
  grade?: string
  [key: string]: unknown
}

// 공공데이터포털 API 상세(스펙)에 따라 URL 변경 가능. Swagger에서 확인.
const ENERGY_EFFICIENCY_API_BASE =
  "https://apis.data.go.kr/1613000/DisplayStandardsService"

/**
 * 공공데이터포털 서비스키로 자동차 표시연비 목록 조회.
 * 환경변수 DATA_GO_KR_SERVICE_KEY 가 설정되어 있을 때만 동작.
 */
export async function fetchCarEfficiencyFromPublicData(
  serviceKey: string,
  options?: { pageNo?: number; numOfRows?: number }
): Promise<PublicDataCarItem[]> {
  const pageNo = options?.pageNo ?? 1
  const numOfRows = options?.numOfRows ?? 100

  const params = new URLSearchParams({
    serviceKey: decodeURIComponent(serviceKey),
    pageNo: String(pageNo),
    numOfRows: String(numOfRows),
    type: "json",
  })

  const url = `${ENERGY_EFFICIENCY_API_BASE}/getDisplayStandardsList?${params}`

  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) {
    throw new Error(`공공데이터 API 오류: ${res.status}`)
  }

  const data = await res.json()

  if (data.response?.header?.resultCode !== "00") {
    const msg = data.response?.header?.resultMsg ?? "알 수 없는 오류"
    throw new Error(`공공데이터 응답 오류: ${msg}`)
  }

  const items = data.response?.body?.items
  if (!items) return []

  const list = Array.isArray(items) ? items : items.item ? [items.item] : []
  return list.map((item: Record<string, unknown>) => ({
    modelName: item.modelNm ?? item.modelName,
    maker: item.maker ?? item.mfrNm,
    vehicleType: item.vehicleType ?? item.vhclType,
    fuelType: item.fuelType ?? item.fuel,
    efficiency: item.efficiency ?? item.cmbstnEffcn ?? item.fuelEfficiency,
    cityEfficiency: item.cityEfficiency ?? item.cityEffcn,
    highwayEfficiency: item.highwayEfficiency ?? item.hwyEffcn,
    evRange: item.evRange ?? item.oneChargeDist,
    co2Emissions: item.co2Emissions ?? item.co2,
    grade: item.grade,
    ...item,
  }))
}

/**
 * 환경변수에 설정된 서비스키로 연비 목록 조회.
 * 키가 없으면 빈 배열 반환 (MVP 시 로컬 데이터 사용).
 */
export async function getPublicDataCarList(): Promise<PublicDataCarItem[]> {
  const key = process.env.DATA_GO_KR_SERVICE_KEY
  if (!key || key === "YOUR_SERVICE_KEY") return []

  try {
    const items = await fetchCarEfficiencyFromPublicData(key, {
      pageNo: 1,
      numOfRows: 500,
    })
    return items
  } catch {
    return []
  }
}
