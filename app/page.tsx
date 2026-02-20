"use client"

import { useState, useMemo } from "react"
import { GNB } from "@/components/gnb"
import { FilterSidebar } from "@/components/filter-sidebar"
import { MobileFilter } from "@/components/mobile-filter"
import { AIStrategySection } from "@/components/ai-strategy-section"
import { RankingChart } from "@/components/ranking-chart"
import { VehicleCard } from "@/components/vehicle-card"
import { DetailModal } from "@/components/detail-modal"
import { FloatingChatbot } from "@/components/floating-chatbot"
import { defaultCars } from "@/lib/default-cars"
import {
  type Car,
  getCategoryOptionsFromCars,
  getFuelOptionsFromCars,
  getLifestyleTagsFromCars,
} from "@/lib/car-data"
import { useCarLiked } from "@/contexts/car-liked-context"

export type SortOption = "popular" | "price"

export default function Home() {
  const [carList] = useState<Car[]>(defaultCars)
  const [budget, setBudget] = useState([1500, 8000])
  const [fuelTypes, setFuelTypes] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [lifestyles, setLifestyles] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("popular")
  const { likedIds, toggleLike, isLiked } = useCarLiked()
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const categoryOptions = useMemo(
    () => getCategoryOptionsFromCars(carList),
    [carList],
  )
  const fuelOptions = useMemo(() => getFuelOptionsFromCars(carList), [carList])
  const lifestyleTagsList = useMemo(
    () => getLifestyleTagsFromCars(carList),
    [carList],
  )

  const filteredCars = useMemo(() => {
    let list = carList.filter((car) => {
      const inBudget = car.price >= budget[0] && car.price <= budget[1]
      const fuelMatch =
        fuelTypes.length === 0 || fuelTypes.includes(car.fuelType)
      const categoryMatch =
        categories.length === 0 || categories.includes(car.category)
      const lifestyleMatch =
        lifestyles.length === 0 ||
        lifestyles.some((ls) => car.lifestyles.includes(ls))
      const brandMatch = brands.length === 0 || brands.includes(car.brand)
      return inBudget && fuelMatch && categoryMatch && lifestyleMatch && brandMatch
    })
    if (sortBy === "price") {
      list = [...list].sort((a, b) => a.price - b.price)
    } else {
      list = [...list].sort(
        (a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0),
      )
    }
    return list
  }, [carList, budget, fuelTypes, categories, lifestyles, brands, sortBy])

  const fallbackCars = useMemo(() => {
    if (filteredCars.length > 0) return []
    const pad = Math.max(500, Math.ceil(budget[1] * 0.1))
    const low = Math.max(0, budget[0] - pad)
    const high = Math.min(55000, budget[1] + pad)
    return carList
      .filter(
        (car) =>
          car.price >= low &&
          car.price <= high &&
          (categories.length === 0 || categories.includes(car.category)) &&
          (fuelTypes.length === 0 || fuelTypes.includes(car.fuelType)) &&
          (brands.length === 0 || brands.includes(car.brand)),
      )
      .slice(0, 5)
  }, [carList, filteredCars.length, budget, categories, fuelTypes, brands])

  function openDetail(car: Car) {
    setSelectedCar(car)
    setModalOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <GNB />
      <div className="flex flex-1">
        <FilterSidebar
          cars={carList}
          budget={budget}
          setBudget={setBudget}
          fuelTypes={fuelTypes}
          setFuelTypes={setFuelTypes}
          categories={categories}
          setCategories={setCategories}
          lifestyles={lifestyles}
          setLifestyles={setLifestyles}
          brands={brands}
          setBrands={setBrands}
          categoryOptions={categoryOptions}
          fuelOptions={fuelOptions}
          lifestyleTags={lifestyleTagsList}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <MobileFilter
            cars={carList}
            budget={budget}
            setBudget={setBudget}
            fuelTypes={fuelTypes}
            setFuelTypes={setFuelTypes}
            categories={categories}
            setCategories={setCategories}
            lifestyles={lifestyles}
            setLifestyles={setLifestyles}
            brands={brands}
            setBrands={setBrands}
            categoryOptions={categoryOptions}
            fuelOptions={fuelOptions}
            lifestyleTags={lifestyleTagsList}
          />

          <AIStrategySection
            budget={budget}
            fuelTypes={fuelTypes}
            lifestyles={lifestyles}
            cars={carList}
          />
          <RankingChart cars={carList} />

          {/* Vehicle Lineup */}
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-foreground">
                차량 라인업
              </h2>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as SortOption)
                  }
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-[#00D09C] focus:outline-none"
                >
                  <option value="popular">인기순</option>
                  <option value="price">가격순</option>
                </select>
                <span className="text-sm text-muted-foreground">
                  {filteredCars.length}대
                </span>
              </div>
            </div>
            {filteredCars.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCars.map((car) => (
                  <VehicleCard
                    key={car.id}
                    car={car}
                    liked={isLiked(car.id)}
                    onToggleLike={() => toggleLike(car.id)}
                    onCompare={() => openDetail(car)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
                <p className="text-lg font-medium text-muted-foreground">
                  조건에 맞는 차량이 없습니다
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {fallbackCars.length > 0
                    ? "예산을 조금만 조정하면 이런 차들도 구매할 수 있어요."
                    : "필터 조건을 변경해 보세요."}
                </p>
                {fallbackCars.length > 0 && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {fallbackCars.map((car) => (
                      <button
                        key={car.id}
                        onClick={() => openDetail(car)}
                        className="rounded-lg border border-[#00D09C]/40 bg-[#00D09C]/10 px-3 py-2 text-sm font-medium text-[#00D09C] transition-colors hover:bg-[#00D09C]/20"
                      >
                        {car.brand} {car.model} ({car.price.toLocaleString()}만)
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>

      <DetailModal
        car={selectedCar}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
      <FloatingChatbot
        budget={budget}
        fuelTypes={fuelTypes}
        lifestyles={lifestyles}
      />
    </div>
  )
}
