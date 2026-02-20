"use client"

import Link from "next/link"
import Image from "next/image"
import { GNB } from "@/components/gnb"
import { defaultCars } from "@/lib/default-cars"
import {
  fuelTypeLabels,
  categoryLabels,
  brandIdToLabel,
} from "@/lib/car-data"
import { useCarLiked } from "@/contexts/car-liked-context"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

export default function WishlistPage() {
  const { likedIds, toggleLike } = useCarLiked()
  const likedCars = defaultCars.filter((c) => likedIds.has(c.id))

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <GNB />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">찜 목록</h1>
            <Link href="/">
              <Button variant="outline" size="sm">
                차량 둘러보기
              </Button>
            </Link>
          </div>

          {likedCars.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
              <Heart className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-lg font-medium text-muted-foreground">
                찜한 차량이 없습니다
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                마음에 드는 차량에 하트를 눌러 찜해 보세요.
              </p>
              <Link href="/" className="mt-4">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  차량 보러 가기
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* 찜한 차량 카드 목록 */}
              <section>
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  찜한 차량 ({likedCars.length}대)
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {likedCars.map((car) => (
                    <div
                      key={car.id}
                      className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-[#00D09C]/40"
                    >
                      <div className="relative h-36">
                        <Image
                          src={car.image}
                          alt={`${car.brand} ${car.model}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => toggleLike(car.id)}
                          className="absolute right-2 top-2 rounded-full bg-[#0a0a0a]/50 p-1.5 backdrop-blur-sm hover:bg-[#0a0a0a]/70"
                          aria-label="찜 해제"
                        >
                          <Heart className="h-4 w-4 fill-[#00D09C] text-[#00D09C]" />
                        </button>
                      </div>
                      <div className="p-3">
                        <div className="text-xs text-muted-foreground">
                          {brandIdToLabel[car.brand] ?? car.brand}
                        </div>
                        <div className="font-bold text-foreground">
                          {car.model}
                        </div>
                        <div className="text-sm font-medium text-[#00D09C]">
                          {car.price.toLocaleString()}만원
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 찜한 차량 비교 테이블 */}
              <section>
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  찜한 차량 비교
                </h2>
                <div className="overflow-x-auto rounded-xl border border-border bg-card">
                  <table className="w-full min-w-[600px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-4 py-3 text-left font-medium text-foreground">
                          항목
                        </th>
                        {likedCars.map((car) => (
                          <th
                            key={car.id}
                            className="min-w-[140px] border-l border-border px-4 py-3 text-left font-medium text-foreground"
                          >
                            {brandIdToLabel[car.brand] ?? car.brand} {car.model}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <CompareRow
                        label="가격"
                        values={likedCars.map((c) => `${c.price.toLocaleString()}만원`)}
                      />
                      <CompareRow
                        label="연료"
                        values={likedCars.map((c) => fuelTypeLabels[c.fuelType] ?? c.fuelType)}
                      />
                      <CompareRow
                        label="차종"
                        values={likedCars.map((c) => categoryLabels[c.category] ?? c.category)}
                      />
                      <CompareRow
                        label="연식"
                        values={likedCars.map((c) => `${c.year}년`)}
                      />
                      <CompareRow
                        label="가성비"
                        values={likedCars.map((c) => `${c.specs.price}점`)}
                      />
                      <CompareRow
                        label="연비"
                        values={likedCars.map((c) => `${c.specs.fuel}점`)}
                      />
                      <CompareRow
                        label="디자인"
                        values={likedCars.map((c) => `${c.specs.design}점`)}
                      />
                      <CompareRow
                        label="공간"
                        values={likedCars.map((c) => `${c.specs.space}점`)}
                      />
                      <CompareRow
                        label="안전"
                        values={likedCars.map((c) => `${c.specs.safety}점`)}
                      />
                      <CompareRow
                        label="AI 한줄 코멘트"
                        values={likedCars.map((c) => c.aiComment)}
                        className="text-muted-foreground"
                      />
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function CompareRow({
  label,
  values,
  className = "",
}: {
  label: string
  values: string[]
  className?: string
}) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-2.5 font-medium text-muted-foreground">{label}</td>
      {values.map((val, i) => (
        <td
          key={i}
          className={`border-l border-border px-4 py-2.5 text-foreground ${className}`}
        >
          {val}
        </td>
      ))}
    </tr>
  )
}
