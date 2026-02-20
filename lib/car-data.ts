export interface Car {
  id: string
  brand: string
  model: string
  price: number
  fuelType: "gasoline" | "diesel" | "hybrid" | "ev" | "lpg"
  category: "sedan" | "suv" | "mpv"
  year: number
  image: string
  tags: string[]
  lifestyles: string[]
  origin: "domestic" | "import"
  specs: {
    price: number
    fuel: number
    design: number
    space: number
    safety: number
  }
  aiComment: string
  /** 인기순 정렬용 (조회수, 스키마 view_count와 동일) */
  viewCount?: number
}

/**
 * 이미지: 직접 호스팅 대신 Unsplash 무료 이미지 사용.
 * 초기에는 Unsplash, 이후 각 브랜드 공식 홈페이지 이미지 URL로 교체 가능.
 * @see https://unsplash.com/images/things/car
 */
const UNSPLASH_CAR_IMAGES: Record<string, string> = {
  sedan:
    "https://images.unsplash.com/photo-1494976380322-0f4b8c367f65?w=600&auto=format&fit=crop",
  suv:
    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&auto=format&fit=crop",
  ev: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop",
  default:
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&auto=format&fit=crop",
}
const carImg = (category: "sedan" | "suv" | "mpv", fuelType: string) =>
  fuelType === "ev"
    ? UNSPLASH_CAR_IMAGES.ev
    : category === "suv"
      ? UNSPLASH_CAR_IMAGES.suv
      : category === "sedan"
        ? UNSPLASH_CAR_IMAGES.sedan
        : UNSPLASH_CAR_IMAGES.default

export const cars: Car[] = [
  // ─── 국산 ───
  {
    id: "tucson-hybrid",
    brand: "HYUNDAI",
    model: "Tucson Hybrid",
    price: 3489,
    viewCount: 2450,
    fuelType: "hybrid",
    category: "suv",
    year: 2025,
    image: carImg("suv", "hybrid"),
    tags: ["SUV", "가성비"],
    lifestyles: ["출퇴근용", "캠핑", "아이와 함께", "주말여행"],
    origin: "domestic",
    specs: { price: 88, fuel: 92, design: 78, space: 85, safety: 90 },
    aiComment:
      "연비 16.2km/L의 경제성과 3년 후 잔존가치 78%를 유지하는 중형 SUV 최고의 가성비 선택입니다.",
  },
  {
    id: "sonata-nline",
    brand: "HYUNDAI",
    model: "Sonata N Line",
    price: 2890,
    fuelType: "gasoline",
    category: "sedan",
    year: 2025,
    image: carImg("sedan", "gasoline"),
    tags: ["스포츠", "세단"],
    lifestyles: ["출퇴근용", "드라이빙 매니아", "시내주행", "첫 차"],
    origin: "domestic",
    specs: { price: 82, fuel: 70, design: 90, space: 75, safety: 88 },
    aiComment:
      "290마력 2.5L 터보로 스포티함과 일상 활용성의 완벽한 균형. 3천만 원대 세단 중 주행 만족도 1위입니다.",
  },
  {
    id: "ev6-gt",
    brand: "KIA",
    model: "EV6 GT",
    price: 5990,
    fuelType: "ev",
    category: "suv",
    year: 2025,
    image: carImg("suv", "ev"),
    tags: ["전기차", "퍼포먼스"],
    lifestyles: ["드라이빙 매니아", "시내주행", "주말여행"],
    origin: "domestic",
    specs: { price: 55, fuel: 95, design: 92, space: 80, safety: 93 },
    aiComment:
      "최근 30일간 언급량 340% 증가. 800V 초고속 충전과 월드클래스 가속 성능의 전기차입니다.",
  },
  {
    id: "sportage",
    brand: "KIA",
    model: "Sportage",
    price: 3280,
    fuelType: "diesel",
    category: "suv",
    year: 2025,
    image: carImg("suv", "diesel"),
    tags: ["SUV", "패밀리"],
    lifestyles: ["아이와 함께", "캠핑", "주말여행", "출퇴근용"],
    origin: "domestic",
    specs: { price: 85, fuel: 82, design: 85, space: 88, safety: 91 },
    aiComment:
      "넓은 실내 공간과 첨단 안전 사양으로 가족용 SUV의 대표주자. 디젤 특유의 강력한 토크가 장점입니다.",
  },
  {
    id: "genesis-g80",
    brand: "GENESIS",
    model: "G80",
    price: 5899,
    fuelType: "gasoline",
    category: "sedan",
    year: 2025,
    image: carImg("sedan", "gasoline"),
    tags: ["럭셔리", "세단"],
    lifestyles: ["비즈니스", "드라이빙 매니아", "주말여행"],
    origin: "domestic",
    specs: { price: 50, fuel: 65, design: 95, space: 90, safety: 95 },
    aiComment:
      "프리미엄 세단의 정수. 고급스러운 실내와 뛰어난 안전 사양, 제네시스만의 감성 품질이 빛나는 모델입니다.",
  },
  {
    id: "ioniq5",
    brand: "HYUNDAI",
    model: "IONIQ 5",
    price: 5030,
    viewCount: 1870,
    fuelType: "ev",
    category: "suv",
    year: 2025,
    image: carImg("suv", "ev"),
    tags: ["전기차", "패밀리"],
    lifestyles: ["캠핑", "아이와 함께", "시내주행", "첫 차", "주말여행"],
    origin: "domestic",
    specs: { price: 60, fuel: 96, design: 93, space: 92, safety: 92 },
    aiComment:
      "혁신적인 픽셀 디자인과 V2L 기능으로 캠핑족에게 최고의 선택. 넓은 실내 공간은 SUV급입니다.",
  },

  // ─── 수입 (독일) ───
  {
    id: "bmw-3series",
    brand: "BMW",
    model: "3 Series",
    price: 5590,
    viewCount: 2050,
    fuelType: "gasoline",
    category: "sedan",
    year: 2025,
    image: carImg("sedan", "gasoline"),
    tags: ["스포츠", "세단"],
    lifestyles: ["드라이빙 매니아", "비즈니스", "출퇴근용"],
    origin: "import",
    specs: { price: 52, fuel: 68, design: 92, space: 72, safety: 90 },
    aiComment:
      "주행의 즐거움을 정의하는 스포츠 세단의 기준. xDrive 시스템과 48V MHEV로 효율성까지 잡았습니다.",
  },
  {
    id: "bmw-x5",
    brand: "BMW",
    model: "X5 xDrive40i",
    price: 9870,
    fuelType: "gasoline",
    category: "suv",
    year: 2025,
    image: carImg("suv", "gasoline"),
    tags: ["럭셔리", "SUV"],
    lifestyles: ["비즈니스", "아이와 함께", "캠핑", "드라이빙 매니아"],
    origin: "import",
    specs: { price: 30, fuel: 55, design: 90, space: 92, safety: 95 },
    aiComment:
      "럭셔리 중대형 SUV의 아이콘. 강력한 3.0L 직렬 6기통과 넓은 실내, 최첨단 안전 기술을 제공합니다.",
  },
  {
    id: "benz-eclass",
    brand: "MERCEDES-BENZ",
    model: "E 300",
    price: 7690,
    fuelType: "gasoline",
    category: "sedan",
    year: 2025,
    image: carImg("sedan", "gasoline"),
    tags: ["럭셔리", "세단"],
    lifestyles: ["비즈니스", "출퇴근용", "드라이빙 매니아"],
    origin: "import",
    specs: { price: 38, fuel: 62, design: 96, space: 88, safety: 96 },
    aiComment:
      "비즈니스 세단의 정석. MBUX 슈퍼스크린과 최신 ADAS로 기술력과 품격을 동시에 갖춘 모델입니다.",
  },
  {
    id: "benz-glc",
    brand: "MERCEDES-BENZ",
    model: "GLC 300",
    price: 7190,
    viewCount: 2280,
    fuelType: "gasoline",
    category: "suv",
    year: 2025,
    image: carImg("suv", "gasoline"),
    tags: ["럭셔리", "SUV"],
    lifestyles: ["비즈니스", "아이와 함께", "주말여행"],
    origin: "import",
    specs: { price: 40, fuel: 64, design: 93, space: 85, safety: 94 },
    aiComment:
      "프리미엄 중형 SUV 판매 1위. 세련된 디자인과 뛰어난 승차감, 벤츠 특유의 안정감이 특징입니다.",
  },
  {
    id: "audi-a6",
    brand: "AUDI",
    model: "A6 45 TFSI quattro",
    price: 7100,
    fuelType: "gasoline",
    category: "sedan",
    year: 2025,
    image: carImg("sedan", "gasoline"),
    tags: ["럭셔리", "세단"],
    lifestyles: ["비즈니스", "드라이빙 매니아", "출퇴근용"],
    origin: "import",
    specs: { price: 40, fuel: 66, design: 91, space: 86, safety: 93 },
    aiComment:
      "quattro AWD와 터보 엔진의 완벽한 조화. 독일 3사 중 가장 절제된 디자인으로 꾸준한 인기를 얻고 있습니다.",
  },

  // ─── 수입 (미국) ───
  {
    id: "tesla-model3",
    brand: "TESLA",
    model: "Model 3",
    price: 5199,
    fuelType: "ev",
    category: "sedan",
    year: 2025,
    image: carImg("sedan", "ev"),
    tags: ["전기차", "테크"],
    lifestyles: ["출퇴근용", "시내주행", "드라이빙 매니아", "첫 차"],
    origin: "import",
    specs: { price: 55, fuel: 97, design: 85, space: 72, safety: 90 },
    aiComment:
      "전기차 대중화를 이끈 모델. OTA 업데이트와 오토파일럿으로 항상 최신 상태를 유지합니다.",
  },
  {
    id: "tesla-modely",
    brand: "TESLA",
    model: "Model Y",
    price: 5299,
    viewCount: 3120,
    fuelType: "ev",
    category: "suv",
    year: 2025,
    image: carImg("suv", "ev"),
    tags: ["전기차", "패밀리"],
    lifestyles: ["아이와 함께", "캠핑", "출퇴근용", "시내주행"],
    origin: "import",
    specs: { price: 50, fuel: 96, design: 82, space: 88, safety: 92 },
    aiComment:
      "세계에서 가장 많이 팔린 전기차. 넓은 실내 공간과 슈퍼차저 네트워크로 장거리 여행에도 적합합니다.",
  },

  // ─── 수입 (일본) ───
  {
    id: "toyota-camry",
    brand: "TOYOTA",
    model: "Camry Hybrid",
    price: 4290,
    fuelType: "hybrid",
    category: "sedan",
    year: 2025,
    image: carImg("sedan", "hybrid"),
    tags: ["하이브리드", "세단"],
    lifestyles: ["출퇴근용", "시내주행", "비즈니스"],
    origin: "import",
    specs: { price: 70, fuel: 94, design: 80, space: 82, safety: 88 },
    aiComment:
      "하이브리드 세단의 원조. 검증된 신뢰성과 20km/L급 연비로 합리적인 선택을 원하는 분께 추천합니다.",
  },
  {
    id: "toyota-rav4",
    brand: "TOYOTA",
    model: "RAV4 Hybrid",
    price: 4590,
    fuelType: "hybrid",
    category: "suv",
    year: 2025,
    image: carImg("suv", "hybrid"),
    tags: ["하이브리드", "SUV"],
    lifestyles: ["캠핑", "아이와 함께", "주말여행", "출퇴근용"],
    origin: "import",
    specs: { price: 65, fuel: 91, design: 78, space: 87, safety: 90 },
    aiComment:
      "글로벌 SUV 판매 상위권의 검증된 모델. 하이브리드 AWD로 어떤 도로 환경에서도 안정적입니다.",
  },
  {
    id: "honda-civic",
    brand: "HONDA",
    model: "Civic e:HEV",
    price: 3590,
    fuelType: "hybrid",
    category: "sedan",
    year: 2025,
    image: carImg("sedan", "hybrid"),
    tags: ["하이브리드", "스포츠"],
    lifestyles: ["출퇴근용", "드라이빙 매니아", "시내주행", "첫 차"],
    origin: "import",
    specs: { price: 78, fuel: 90, design: 86, space: 74, safety: 87 },
    aiComment:
      "스포티한 주행감과 뛰어난 연비를 동시에. e:HEV 시스템으로 시내에서 EV급 정숙성을 제공합니다.",
  },

  // ─── 수입 (스웨덴) ───
  {
    id: "volvo-xc60",
    brand: "VOLVO",
    model: "XC60 Recharge",
    price: 7290,
    fuelType: "hybrid",
    category: "suv",
    year: 2025,
    image: carImg("suv", "hybrid"),
    tags: ["안전", "럭셔리"],
    lifestyles: ["아이와 함께", "비즈니스", "캠핑", "주말여행"],
    origin: "import",
    specs: { price: 42, fuel: 80, design: 90, space: 86, safety: 98 },
    aiComment:
      "세계 최고 수준의 안전 기술. 플러그인 하이브리드로 일상에선 전기, 장거리에선 하이브리드로 운행합니다.",
  },

  // ─── 수입 (독일 - 스포츠) ───
  {
    id: "porsche-macan",
    brand: "PORSCHE",
    model: "Macan Electric",
    price: 8990,
    fuelType: "ev",
    category: "suv",
    year: 2025,
    image: carImg("suv", "ev"),
    tags: ["스포츠", "전기차"],
    lifestyles: ["드라이빙 매니아", "비즈니스", "주말여행"],
    origin: "import",
    specs: { price: 28, fuel: 88, design: 95, space: 75, safety: 92 },
    aiComment:
      "포르쉐 DNA를 전동화한 스포츠 SUV. 800V 아키텍처와 포르쉐 특유의 핸들링이 압도적입니다.",
  },
]

export const lifestyleTags = [
  "출퇴근용",
  "캠핑",
  "아이와 함께",
  "드라이빙 매니아",
  "시내주행",
  "비즈니스",
  "주말여행",
  "첫 차",
]

/** 브랜드 ID → 한글 라벨 (사이드바 등 표시용) */
export const brandIdToLabel: Record<string, string> = {
  HYUNDAI: "현대",
  KIA: "기아",
  GENESIS: "제네시스",
  TESLA: "테슬라",
  BMW: "BMW",
  "MERCEDES-BENZ": "벤츠",
  AUDI: "아우디",
  TOYOTA: "토요타",
  HONDA: "혼다",
  VOLVO: "볼보",
  PORSCHE: "포르쉐",
  RENAULT: "르노코리아",
  CHEVROLET: "쉐보레",
  KGM: "KGM",
  DONGFENG: "동풍",
  SEVO: "쎄보모빌리티",
  SMARTEV: "SMART EV",
  DPECO: "디피코",
  MYBV: "마이브",
  JSM: "제이스모빌리티",
  BYD: "BYD",
}

/** 차종 id → 한글 라벨 */
export const categoryLabels: Record<string, string> = {
  sedan: "세단",
  suv: "SUV",
  mpv: "MPV",
}

/** 차량 목록에서 실제 존재하는 브랜드만 추려 국산/수입 그룹으로 반환 */
export function getBrandGroupsFromCars(cars: Car[]): {
  domestic: { id: string; label: string }[]
  import: { id: string; label: string }[]
} {
  const seen = new Set<string>()
  const domestic: { id: string; label: string }[] = []
  const importBrands: { id: string; label: string }[] = []
  for (const car of cars) {
    if (seen.has(car.brand)) continue
    seen.add(car.brand)
    const label = brandIdToLabel[car.brand] ?? car.brand
    if (car.origin === "domestic") domestic.push({ id: car.brand, label })
    else importBrands.push({ id: car.brand, label })
  }
  domestic.sort((a, b) => (a.label < b.label ? -1 : 1))
  importBrands.sort((a, b) => (a.label < b.label ? -1 : 1))
  return { domestic, import: importBrands }
}

/** 차량 목록에서 실제 존재하는 차종만 추려 옵션 배열 반환 (데이터 기반) */
export function getCategoryOptionsFromCars(cars: Car[]): { id: string; label: string }[] {
  const set = new Set<string>()
  for (const car of cars) set.add(car.category)
  return Array.from(set)
    .sort()
    .map((id) => ({ id, label: categoryLabels[id] ?? id }))
}

/** 차량 목록에서 실제 존재하는 연료 타입만 추려 옵션 배열 반환 (데이터 기반) */
export function getFuelOptionsFromCars(cars: Car[]): { id: string; label: string }[] {
  const set = new Set<string>()
  for (const car of cars) set.add(car.fuelType)
  return Array.from(set)
    .sort()
    .map((id) => ({ id, label: fuelTypeLabels[id] ?? id }))
}

/** 차량 목록에서 실제 사용된 라이프스타일 태그만 추려 반환. 없으면 기본 lifestyleTags 사용 */
export function getLifestyleTagsFromCars(cars: Car[]): string[] {
  const set = new Set<string>()
  for (const car of cars) {
    for (const tag of car.lifestyles) set.add(tag)
  }
  if (set.size === 0) return [...lifestyleTags]
  return Array.from(set).sort()
}

export const brandGroups = {
  domestic: [
    { id: "HYUNDAI", label: "현대" },
    { id: "KIA", label: "기아" },
    { id: "GENESIS", label: "제네시스" },
  ],
  import: [
    { id: "BMW", label: "BMW" },
    { id: "MERCEDES-BENZ", label: "벤츠" },
    { id: "AUDI", label: "아우디" },
    { id: "TESLA", label: "테슬라" },
    { id: "TOYOTA", label: "토요타" },
    { id: "HONDA", label: "혼다" },
    { id: "VOLVO", label: "볼보" },
    { id: "PORSCHE", label: "포르쉐" },
  ],
}

export const fuelTypeLabels: Record<string, string> = {
  gasoline: "가솔린",
  diesel: "디젤",
  hybrid: "하이브리드",
  ev: "전기차",
  lpg: "LPG",
}

const RANKING_FILLS = ["#00D09C", "#00B386", "#009970", "#33DDAF", "#66E8C3"]

/** 하드코딩 랭킹 (cars 미제공 시 폴백) */
export const rankingData = [
  { name: "Tesla Model Y", value: 3120, fill: "#00D09C" },
  { name: "Tucson HEV", value: 2450, fill: "#00B386" },
  { name: "Benz GLC", value: 2280, fill: "#009970" },
  { name: "BMW 3 Series", value: 2050, fill: "#33DDAF" },
  { name: "IONIQ 5", value: 1870, fill: "#66E8C3" },
].slice(0, 5)

/** 차량 목록에서 인기 랭킹 Top5 생성 (viewCount → 가격 낮은 순). value가 전부 0이면 5~1로 상대 표시 */
export function getRankingDataFromCars(cars: Car[]): { name: string; value: number; fill: string }[] {
  if (cars.length === 0) return rankingData
  const sorted = [...cars].sort((a, b) => {
    const va = a.viewCount ?? 0
    const vb = b.viewCount ?? 0
    if (vb !== va) return vb - va
    return a.price - b.price
  })
  const top5 = sorted.slice(0, 5)
  const hasViewCount = top5.some((c) => (c.viewCount ?? 0) > 0)
  return top5.map((car, i) => ({
    name: `${brandIdToLabel[car.brand] ?? car.brand} ${car.model}`,
    value: hasViewCount ? (car.viewCount ?? 0) : 5 - i,
    fill: RANKING_FILLS[i] ?? RANKING_FILLS[0],
  }))
}
