"use client"

import { useMemo } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { getBrandGroupsFromCars } from "@/lib/car-data"
import type { Car } from "@/lib/car-data"

interface FilterSidebarProps {
  cars: Car[]
  budget: number[]
  setBudget: (v: number[]) => void
  fuelTypes: string[]
  setFuelTypes: (v: string[]) => void
  categories: string[]
  setCategories: (v: string[]) => void
  lifestyles: string[]
  setLifestyles: (v: string[]) => void
  brands: string[]
  setBrands: (v: string[]) => void
  /** 데이터 기반 옵션 (차종/연료/라이프스타일) */
  categoryOptions: { id: string; label: string }[]
  fuelOptions: { id: string; label: string }[]
  lifestyleTags: string[]
}

function formatPrice(v: number) {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}억`
  if (v === 0) return "0원"
  return `${v.toLocaleString()}만`
}

export function FilterSidebar({
  cars,
  budget,
  setBudget,
  fuelTypes,
  setFuelTypes,
  categories,
  setCategories,
  lifestyles,
  setLifestyles,
  brands,
  setBrands,
  categoryOptions,
  fuelOptions,
  lifestyleTags,
}: FilterSidebarProps) {
  const brandGroups = useMemo(() => getBrandGroupsFromCars(cars), [cars])
  const budgetRange = useMemo(() => {
    if (cars.length === 0) return { min: 0, max: 55000 }
    const prices = cars.map((c) => c.price)
    return { min: Math.min(...prices), max: Math.max(...prices) }
  }, [cars])
  function toggleCategory(id: string) {
    setCategories(
      categories.includes(id)
        ? categories.filter((c) => c !== id)
        : [...categories, id],
    )
  }

  function toggleFuel(id: string) {
    setFuelTypes(
      fuelTypes.includes(id)
        ? fuelTypes.filter((f) => f !== id)
        : [...fuelTypes, id],
    )
  }

  function toggleLifestyle(tag: string) {
    setLifestyles(
      lifestyles.includes(tag)
        ? lifestyles.filter((l) => l !== tag)
        : [...lifestyles, tag],
    )
  }

  function toggleBrand(id: string) {
    setBrands(
      brands.includes(id)
        ? brands.filter((b) => b !== id)
        : [...brands, id],
    )
  }

  return (
    <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border bg-background p-5 lg:block">
      <div className="mb-6 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-foreground" />
        <h2 className="text-sm font-bold text-foreground">Filter</h2>
      </div>

      {/* Budget */}
      <div className="mb-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          예산
        </h3>
        <Slider
          value={budget}
          onValueChange={setBudget}
          min={budgetRange.min}
          max={Math.max(budgetRange.max, budgetRange.min + 1000)}
          step={100}
          className="mb-2"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatPrice(budget[0])}</span>
          <span className="text-muted-foreground">~</span>
          <span>{formatPrice(budget[1])}</span>
        </div>
        {budget[1] > 0 && budget[1] < 500 && (
          <p className="mt-1.5 text-[11px] text-amber-500">
            현재 예산으로 구매 가능한 신차가 없을 수 있습니다. 최소 예산을 확인해 주세요.
          </p>
        )}
      </div>

      {/* Category */}
      <div className="mb-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          차종
        </h3>
        <div className="flex flex-col gap-2.5">
          {categoryOptions.map((cat) => (
            <label
              key={cat.id}
              className="flex cursor-pointer items-center gap-2.5"
            >
              <Checkbox
                checked={categories.includes(cat.id)}
                onCheckedChange={() => toggleCategory(cat.id)}
              />
              <span className="text-sm text-foreground">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div className="mb-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          브랜드
        </h3>
        <div className="mb-2">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[#00D09C]">
            국산
          </span>
          <div className="flex flex-col gap-2">
            {brandGroups.domestic.map((b) => (
              <label
                key={b.id}
                className="flex cursor-pointer items-center gap-2.5"
              >
                <Checkbox
                  checked={brands.includes(b.id)}
                  onCheckedChange={() => toggleBrand(b.id)}
                />
                <span className="text-sm text-foreground">{b.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mt-3">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[#00D09C]">
            수입
          </span>
          <div className="flex flex-col gap-2">
            {brandGroups.import.map((b) => (
              <label
                key={b.id}
                className="flex cursor-pointer items-center gap-2.5"
              >
                <Checkbox
                  checked={brands.includes(b.id)}
                  onCheckedChange={() => toggleBrand(b.id)}
                />
                <span className="text-sm text-foreground">{b.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Fuel Type */}
      <div className="mb-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          연료 타입
        </h3>
        <div className="flex flex-col gap-2.5">
          {fuelOptions.map((fuel) => (
            <label
              key={fuel.id}
              className="flex cursor-pointer items-center gap-2.5"
            >
              <Checkbox
                checked={fuelTypes.includes(fuel.id)}
                onCheckedChange={() => toggleFuel(fuel.id)}
              />
              <span className="text-sm text-foreground">{fuel.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Lifestyle */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          라이프스타일
        </h3>
        <div className="flex flex-wrap gap-2">
          {lifestyleTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleLifestyle(tag)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                lifestyles.includes(tag)
                  ? "border-[#00D09C] bg-[#00D09C]/10 text-[#00D09C]"
                  : "border-border text-muted-foreground hover:border-[#00D09C]/50 hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
