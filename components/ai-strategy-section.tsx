"use client"

import { useMemo } from "react"
import Image from "next/image"
import { Shield, Zap, TrendingUp, Sparkles, Fuel, Users } from "lucide-react"
import { cars, fuelTypeLabels } from "@/lib/car-data"
import type { Car } from "@/lib/car-data"

interface AIStrategySectionProps {
  budget: number[]
  fuelTypes: string[]
  lifestyles: string[]
  /** 가져오기(다나와 등)로 사용 중인 목록이 있으면 전달 */
  cars?: Car[]
}

interface StrategyCard {
  label: string
  reason: string
  icon: React.ReactNode
  car: Car
  gradient: string
}

function scoreCar(
  car: Car,
  budget: number[],
  fuelTypes: string[],
  lifestyles: string[],
): number {
  let score = 0

  // Budget fit: higher score if the car is within budget
  if (car.price >= budget[0] && car.price <= budget[1]) {
    score += 30
    // Bonus for being near the sweet spot (middle of budget)
    const mid = (budget[0] + budget[1]) / 2
    const diff = Math.abs(car.price - mid) / (budget[1] - budget[0] || 1)
    score += Math.round((1 - diff) * 15)
  }

  // Fuel type match
  if (fuelTypes.length === 0 || fuelTypes.includes(car.fuelType)) {
    score += 20
  }

  // Lifestyle match: more overlap = higher score
  if (lifestyles.length > 0) {
    const matchCount = lifestyles.filter((ls) =>
      car.lifestyles.includes(ls),
    ).length
    score += matchCount * 15
  }

  // Spec averages as tiebreaker
  const avgSpec =
    (car.specs.price + car.specs.fuel + car.specs.design + car.specs.space + car.specs.safety) / 5
  score += Math.round(avgSpec / 10)

  return score
}

export function AIStrategySection({
  budget,
  fuelTypes,
  lifestyles,
  cars: carsOverride,
}: AIStrategySectionProps) {
  const carList = carsOverride ?? cars
  const strategies = useMemo((): StrategyCard[] => {
    // Score all cars
    const scored = carList
      .map((car) => ({
        car,
        score: scoreCar(car, budget, fuelTypes, lifestyles),
      }))
      .sort((a, b) => b.score - a.score)

    // Pick top 3 unique strategies
    const result: StrategyCard[] = []
    const usedIds = new Set<string>()

    // Strategy 1: Best Value (highest price spec)
    const bestValue = scored.find(
      (s) => !usedIds.has(s.car.id) && s.car.specs.price >= 75,
    ) || scored.find((s) => !usedIds.has(s.car.id))
    if (bestValue) {
      usedIds.add(bestValue.car.id)
      const matchedLifestyles = lifestyles.filter((ls) =>
        bestValue.car.lifestyles.includes(ls),
      )
      result.push({
        label: "가성비 픽",
        reason:
          matchedLifestyles.length > 0
            ? `${matchedLifestyles.join(", ")} 라이프스타일에 적합하며, 가격 대비 성능이 뛰어납니다. ${bestValue.car.aiComment}`
            : `예산 대비 최고의 가치를 제공합니다. ${bestValue.car.aiComment}`,
        icon: <Shield className="h-3.5 w-3.5" />,
        car: bestValue.car,
        gradient: "from-emerald-900/60 to-transparent",
      })
    }

    // Strategy 2: Performance Pick (highest design+fuel+safety)
    const perfCandidates = scored.filter((s) => !usedIds.has(s.car.id))
    perfCandidates.sort(
      (a, b) =>
        b.car.specs.design +
        b.car.specs.safety -
        (a.car.specs.design + a.car.specs.safety),
    )
    const perfPick = perfCandidates[0]
    if (perfPick) {
      usedIds.add(perfPick.car.id)
      const matchedLifestyles = lifestyles.filter((ls) =>
        perfPick.car.lifestyles.includes(ls),
      )
      result.push({
        label: "퍼포먼스 픽",
        reason:
          matchedLifestyles.length > 0
            ? `${matchedLifestyles.join(", ")}에 딱 맞는 주행 성능을 제공합니다. ${perfPick.car.aiComment}`
            : `뛰어난 디자인과 안전성을 갖춘 고성능 모델입니다. ${perfPick.car.aiComment}`,
        icon: <Zap className="h-3.5 w-3.5" />,
        car: perfPick.car,
        gradient: "from-blue-900/60 to-transparent",
      })
    }

    // Strategy 3: Lifestyle/Trending pick
    const remainCandidates = scored.filter((s) => !usedIds.has(s.car.id))
    const trendPick = remainCandidates[0]
    if (trendPick) {
      usedIds.add(trendPick.car.id)
      const matchedLifestyles = lifestyles.filter((ls) =>
        trendPick.car.lifestyles.includes(ls),
      )
      const isLifestyleDriven = matchedLifestyles.length > 0
      result.push({
        label: isLifestyleDriven ? "라이프스타일 픽" : "트렌드 픽",
        reason: isLifestyleDriven
          ? `${matchedLifestyles.join(", ")} 생활에 최적화된 차량입니다. ${trendPick.car.aiComment}`
          : `현재 가장 주목받는 모델입니다. ${trendPick.car.aiComment}`,
        icon: isLifestyleDriven ? (
          <Users className="h-3.5 w-3.5" />
        ) : (
          <TrendingUp className="h-3.5 w-3.5" />
        ),
        car: trendPick.car,
        gradient: "from-rose-900/60 to-transparent",
      })
    }

    return result
  }, [budget, fuelTypes, lifestyles, carList])

  const activeFilterCount =
    (fuelTypes.length > 0 ? 1 : 0) + (lifestyles.length > 0 ? 1 : 0)

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[#00D09C]" />
        <h2 className="text-lg font-bold text-foreground">AI 전략 추천</h2>
        <span className="rounded-full bg-[#00D09C] px-2 py-0.5 text-xs font-bold text-[#0a0a0a]">
          Gemini
        </span>
      </div>

      {/* Active filter summary */}
      {(lifestyles.length > 0 || fuelTypes.length > 0) && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-[#00D09C]/20 bg-[#00D09C]/5 px-3 py-2">
          <Fuel className="h-3.5 w-3.5 text-[#00D09C]" />
          <span className="text-xs text-muted-foreground">
            적용된 필터:
          </span>
          {fuelTypes.map((ft) => (
            <span
              key={ft}
              className="rounded-full bg-[#00D09C]/10 px-2 py-0.5 text-xs font-medium text-[#00D09C]"
            >
              {fuelTypeLabels[ft] || ft}
            </span>
          ))}
          {lifestyles.map((ls) => (
            <span
              key={ls}
              className="rounded-full bg-[#00D09C]/10 px-2 py-0.5 text-xs font-medium text-[#00D09C]"
            >
              {ls}
            </span>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            {activeFilterCount > 0
              ? "필터 기반 맞춤 추천 결과입니다"
              : ""}
          </span>
        </div>
      )}

      {strategies.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {strategies.map((s) => (
            <div
              key={s.car.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-[#00D09C]/40"
            >
              <div className="relative h-40 overflow-hidden">
                <Image
                  src={s.car.image}
                  alt={s.car.model}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${s.gradient}`}
                />
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-[#0a0a0a]/70 px-2 py-1 text-xs font-semibold text-[#00D09C] backdrop-blur-sm">
                  {s.icon}
                  {s.label}
                </div>
              </div>
              <div className="p-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <h3 className="font-bold text-foreground">{s.car.model}</h3>
                  <span className="font-mono text-sm font-bold text-[#00D09C]">
                    {s.car.price.toLocaleString()}만
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {s.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            현재 필터 조건에 맞는 추천 차량이 없습니다. 필터를 조정해 보세요.
          </p>
        </div>
      )}
    </section>
  )
}
