"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MessageCircle, X, Send, Car, Sparkles } from "lucide-react"
import { cars, fuelTypeLabels, brandGroups } from "@/lib/car-data"
import type { Car as CarType } from "@/lib/car-data"

interface Message {
  role: "user" | "assistant"
  content: string
  recommendations?: RecommendationCard[]
}

interface RecommendationCard {
  car: CarType
  matchReason: string
  matchScore: number
}

interface FloatingChatbotProps {
  budget: number[]
  fuelTypes: string[]
  lifestyles: string[]
}

const intentKeywords: Record<
  string,
  {
    lifestyles?: string[]
    fuelTypes?: string[]
    categories?: string[]
    brands?: string[]
    budgetHint?: "low" | "mid" | "high" | "premium"
  }
> = {
  // Lifestyles
  출퇴근: { lifestyles: ["출퇴근용"] },
  통근: { lifestyles: ["출퇴근용"] },
  회사: { lifestyles: ["출퇴근용", "비즈니스"] },
  캠핑: { lifestyles: ["캠핑", "주말여행"] },
  차박: { lifestyles: ["캠핑"] },
  가족: { lifestyles: ["아이와 함께"] },
  아이: { lifestyles: ["아이와 함께"] },
  육아: { lifestyles: ["아이와 함께"] },
  드라이빙: { lifestyles: ["드라이빙 매니아"] },
  스포츠: { lifestyles: ["드라이빙 매니아"] },
  시내: { lifestyles: ["시내주행"] },
  도심: { lifestyles: ["시내주행"] },
  비즈니스: { lifestyles: ["비즈니스"] },
  접대: { lifestyles: ["비즈니스"] },
  주말: { lifestyles: ["주말여행"] },
  여행: { lifestyles: ["주말여행", "캠핑"] },
  "첫 차": { lifestyles: ["첫 차"] },
  초보: { lifestyles: ["첫 차"] },
  // Fuel types
  전기: { fuelTypes: ["ev"] },
  EV: { fuelTypes: ["ev"] },
  하이브리드: { fuelTypes: ["hybrid"] },
  디젤: { fuelTypes: ["diesel"] },
  가솔린: { fuelTypes: ["gasoline"] },
  // Categories
  SUV: { categories: ["suv"] },
  세단: { categories: ["sedan"] },
  // Budget
  저렴: { budgetHint: "low" },
  싸: { budgetHint: "low" },
  경제적: { budgetHint: "low" },
  가성비: { budgetHint: "low" },
  중간: { budgetHint: "mid" },
  고급: { budgetHint: "high" },
  럭셔리: { budgetHint: "premium" },
  프리미엄: { budgetHint: "premium" },
  // Domestic brands
  현대: { brands: ["HYUNDAI"] },
  기아: { brands: ["KIA"] },
  제네시스: { brands: ["GENESIS"] },
  // Import brands
  BMW: { brands: ["BMW"] },
  비엠: { brands: ["BMW"] },
  벤츠: { brands: ["MERCEDES-BENZ"] },
  메르세데스: { brands: ["MERCEDES-BENZ"] },
  아우디: { brands: ["AUDI"] },
  테슬라: { brands: ["TESLA"] },
  토요타: { brands: ["TOYOTA"] },
  혼다: { brands: ["HONDA"] },
  볼보: { brands: ["VOLVO"] },
  포르쉐: { brands: ["PORSCHE"] },
  // Origin
  국산: { brands: ["HYUNDAI", "KIA", "GENESIS"] },
  수입: { brands: brandGroups.import.map((b) => b.id) },
  외제: { brands: brandGroups.import.map((b) => b.id) },
  수입차: { brands: brandGroups.import.map((b) => b.id) },
  독일차: { brands: ["BMW", "MERCEDES-BENZ", "AUDI", "PORSCHE"] },
  일본차: { brands: ["TOYOTA", "HONDA"] },
}

const budgetRanges: Record<string, number[]> = {
  low: [0, 3500],
  mid: [2500, 5500],
  high: [5000, 10000],
  premium: [7000, 15000],
}

function analyzeMessage(msg: string): {
  lifestyles: string[]
  fuelTypes: string[]
  categories: string[]
  brands: string[]
  budgetRange: number[] | null
  priceExact: number | null
} {
  const result = {
    lifestyles: [] as string[],
    fuelTypes: [] as string[],
    categories: [] as string[],
    brands: [] as string[],
    budgetRange: null as number[] | null,
    priceExact: null as number | null,
  }

  for (const [keyword, intent] of Object.entries(intentKeywords)) {
    if (msg.toLowerCase().includes(keyword.toLowerCase())) {
      if (intent.lifestyles) result.lifestyles.push(...intent.lifestyles)
      if (intent.fuelTypes) result.fuelTypes.push(...intent.fuelTypes)
      if (intent.categories) result.categories.push(...intent.categories)
      if (intent.brands) result.brands.push(...intent.brands)
      if (intent.budgetHint)
        result.budgetRange = budgetRanges[intent.budgetHint]
    }
  }

  // Extract explicit price
  const pricePatterns = [
    /(\d+)천만?\s*원?/,
    /(\d{4,})만?\s*원?/,
    /(\d+),(\d{3})만?\s*원?/,
  ]
  for (const pat of pricePatterns) {
    const m = msg.match(pat)
    if (m) {
      if (pat === pricePatterns[0]) {
        result.priceExact = parseInt(m[1]) * 1000
      } else if (pat === pricePatterns[2]) {
        result.priceExact = parseInt(m[1] + m[2])
      } else {
        result.priceExact = parseInt(m[1])
      }
      break
    }
  }

  result.lifestyles = [...new Set(result.lifestyles)]
  result.fuelTypes = [...new Set(result.fuelTypes)]
  result.categories = [...new Set(result.categories)]
  result.brands = [...new Set(result.brands)]

  return result
}

function findRecommendations(
  intent: ReturnType<typeof analyzeMessage>,
  currentBudget: number[],
  currentFuelTypes: string[],
  currentLifestyles: string[],
): RecommendationCard[] {
  const effectiveBudget = intent.priceExact
    ? [intent.priceExact - 1000, intent.priceExact + 1000]
    : intent.budgetRange || currentBudget

  const effectiveFuels =
    intent.fuelTypes.length > 0 ? intent.fuelTypes : currentFuelTypes
  const effectiveLifestyles =
    intent.lifestyles.length > 0
      ? [...new Set([...intent.lifestyles, ...currentLifestyles])]
      : currentLifestyles

  return cars
    .map((car) => {
      let score = 0
      const reasons: string[] = []

      // Budget
      if (car.price >= effectiveBudget[0] && car.price <= effectiveBudget[1]) {
        score += 25
        reasons.push(`예산 범위 내 (${car.price.toLocaleString()}만 원)`)
      }

      // Fuel
      if (effectiveFuels.length === 0 || effectiveFuels.includes(car.fuelType)) {
        score += 15
        if (intent.fuelTypes.length > 0) {
          reasons.push(`${fuelTypeLabels[car.fuelType]} 차량`)
        }
      }

      // Category
      if (intent.categories.length > 0 && intent.categories.includes(car.category)) {
        score += 15
        reasons.push(car.category === "suv" ? "SUV 차종" : "세단 차종")
      }

      // Brand
      if (intent.brands.length > 0 && intent.brands.includes(car.brand)) {
        score += 25
        reasons.push(`${car.brand} 브랜드`)
      }

      // Lifestyle
      if (effectiveLifestyles.length > 0) {
        const matched = effectiveLifestyles.filter((ls) =>
          car.lifestyles.includes(ls),
        )
        if (matched.length > 0) {
          score += matched.length * 15
          reasons.push(`${matched.join(", ")}에 적합`)
        }
      }

      // Spec bonus
      const avgSpec =
        (car.specs.price + car.specs.fuel + car.specs.design + car.specs.space + car.specs.safety) / 5
      score += Math.round(avgSpec / 10)

      return {
        car,
        matchScore: score,
        matchReason: reasons.length > 0 ? reasons.join(" | ") : "종합 점수 우수",
      }
    })
    .filter((r) => r.matchScore > 20)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)
}

const allBrandLabels: Record<string, string> = Object.fromEntries([
  ...brandGroups.domestic.map((b) => [b.id, b.label]),
  ...brandGroups.import.map((b) => [b.id, b.label]),
])

function buildResponse(
  intent: ReturnType<typeof analyzeMessage>,
  recommendations: RecommendationCard[],
): string {
  if (recommendations.length === 0) {
    return "말씀하신 조건에 정확히 맞는 차량을 찾지 못했습니다. 예산, 브랜드, 연료 타입, 용도를 조금 더 알려주시면 다시 분석해 드리겠습니다."
  }

  const parts: string[] = []
  const contexts: string[] = []

  if (intent.brands.length > 0)
    contexts.push(intent.brands.map((b) => allBrandLabels[b] || b).join(", "))
  if (intent.lifestyles.length > 0)
    contexts.push(intent.lifestyles.join(", "))
  if (intent.fuelTypes.length > 0)
    contexts.push(intent.fuelTypes.map((f) => fuelTypeLabels[f] || f).join(", "))
  if (intent.priceExact)
    contexts.push(`${intent.priceExact.toLocaleString()}만 원대`)
  if (intent.budgetRange && !intent.priceExact)
    contexts.push(
      intent.budgetRange[1] <= 3500
        ? "합리적인 가격대"
        : intent.budgetRange[0] >= 7000
          ? "프리미엄 가격대"
          : intent.budgetRange[0] >= 5000
            ? "고급 가격대"
            : "중간 가격대",
    )

  if (contexts.length > 0) {
    parts.push(`${contexts.join(", ")} 조건으로 분석한 결과입니다.`)
  } else {
    parts.push("현재 설정된 필터 기준으로 분석한 결과입니다.")
  }

  parts.push("")

  recommendations.forEach((rec, i) => {
    const medal = i === 0 ? "1순위" : i === 1 ? "2순위" : "3순위"
    const originLabel = rec.car.origin === "import" ? " [수입]" : " [국산]"
    parts.push(
      `[${medal}] ${rec.car.brand} ${rec.car.model}${originLabel}`,
    )
    parts.push(`  ${rec.car.price.toLocaleString()}만 원 | ${fuelTypeLabels[rec.car.fuelType]} | ${rec.car.year}`)
    parts.push(`  ${rec.matchReason}`)
    parts.push("")
  })

  parts.push("더 궁금하신 점이 있으시면 편하게 질문해 주세요!")

  return parts.join("\n")
}

export function FloatingChatbot({
  budget,
  fuelTypes,
  lifestyles,
}: FloatingChatbotProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "안녕하세요! CarInsight AI 상담사입니다.\n\n국산/수입 모든 차량을 분석해 드립니다.\n아래와 같이 질문해 보세요:\n\n- \"출퇴근용 SUV 추천해줘\"\n- \"BMW 5천만 원대 추천\"\n- \"독일차 럭셔리 세단\"\n- \"테슬라 vs 아이오닉5\"\n- \"가족용 수입 SUV\"\n- \"3천만 원대 하이브리드\"\n\n예산, 브랜드, 연료, 라이프스타일을 조합할수록\n정확한 추천을 받으실 수 있어요!",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const processMessage = useCallback(
    (userMsg: string) => {
      const intent = analyzeMessage(userMsg)
      const recs = findRecommendations(intent, budget, fuelTypes, lifestyles)
      const responseText = buildResponse(intent, recs)
      return { responseText, recs }
    },
    [budget, fuelTypes, lifestyles],
  )

  const handleSend = useCallback(() => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setMessages((prev) => [...prev, { role: "user", content: userMsg }])
    setInput("")
    setLoading(true)

    setTimeout(() => {
      const { responseText, recs } = processMessage(userMsg)
      setLoading(false)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: responseText,
          recommendations: recs.length > 0 ? recs : undefined,
        },
      ])
    }, 1000)
  }, [input, loading, processMessage])

  const handleQuickAction = useCallback(
    (action: string) => {
      setMessages((prev) => [...prev, { role: "user", content: action }])
      setLoading(true)
      setTimeout(() => {
        const { responseText, recs } = processMessage(action)
        setLoading(false)
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: responseText,
            recommendations: recs.length > 0 ? recs : undefined,
          },
        ])
      }, 1000)
    },
    [processMessage],
  )

  const quickActions = [
    "출퇴근용 추천",
    "수입 SUV",
    "전기차 추천",
    "독일차 세단",
    "가성비 국산",
    "럭셔리 추천",
  ]

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#00D09C] shadow-lg shadow-[#00D09C]/25 transition-transform hover:scale-105 active:scale-95"
        aria-label="AI 채팅 열기"
      >
        {open ? (
          <X className="h-6 w-6 text-[#0a0a0a]" />
        ) : (
          <MessageCircle className="h-6 w-6 text-[#0a0a0a]" />
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border bg-secondary px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00D09C]">
              <Sparkles className="h-4 w-4 text-[#0a0a0a]" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-foreground">
                AI 상담사
              </div>
              <div className="text-xs text-[#00D09C]">국산/수입 전차종 추천</div>
            </div>
            {(fuelTypes.length > 0 || lifestyles.length > 0) && (
              <div className="flex items-center gap-1 rounded-full bg-[#00D09C]/10 px-2 py-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#00D09C]" />
                <span className="text-[10px] text-[#00D09C]">필터 연동중</span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[85%]">
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === "user"
                          ? "bg-[#00D09C] text-[#0a0a0a]"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {msg.recommendations.map((rec, j) => (
                          <div
                            key={rec.car.id}
                            className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-2.5 py-2"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#00D09C]/10">
                              <Car className="h-3.5 w-3.5 text-[#00D09C]" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-foreground truncate">
                                  {rec.car.model}
                                </span>
                                <span className="ml-1 shrink-0 text-xs font-bold text-[#00D09C]">
                                  {rec.car.price.toLocaleString()}만
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <span className="truncate">
                                  {rec.car.brand}
                                </span>
                                <span>{'/'}</span>
                                <span>{fuelTypeLabels[rec.car.fuelType]}</span>
                                {rec.car.origin === "import" && (
                                  <span className="rounded bg-[#00D09C]/10 px-1 py-px text-[9px] text-[#00D09C]">
                                    수입
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="shrink-0 rounded bg-[#00D09C]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#00D09C]">
                              {j + 1}위
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-secondary px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground mr-2">분석 중</span>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[#00D09C] [animation-delay:0ms]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[#00D09C] [animation-delay:150ms]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[#00D09C] [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="flex gap-1.5 overflow-x-auto border-t border-border px-3 py-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  className="shrink-0 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-[#00D09C]/50 hover:text-[#00D09C]"
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="브랜드, 예산, 용도로 검색..."
                className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#00D09C] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00D09C] text-[#0a0a0a] transition-opacity disabled:opacity-40"
                aria-label="전송"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
