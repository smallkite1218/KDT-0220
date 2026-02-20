"use client"

import Image from "next/image"
import { Heart, BarChart3 } from "lucide-react"
import type { Car } from "@/lib/car-data"
import { fuelTypeLabels } from "@/lib/car-data"

interface VehicleCardProps {
  car: Car
  liked: boolean
  onToggleLike: () => void
  onCompare: () => void
}

export function VehicleCard({
  car,
  liked,
  onToggleLike,
  onCompare,
}: VehicleCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-[#00D09C]/40">
      <div className="relative h-44 overflow-hidden">
        <Image
          src={car.image}
          alt={`${car.brand} ${car.model}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {car.origin === "import" && (
            <span className="rounded bg-[#00D09C]/90 px-2 py-0.5 text-xs font-bold text-[#0a0a0a] backdrop-blur-sm">
              수입
            </span>
          )}
          {car.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-[#0a0a0a]/70 px-2 py-0.5 text-xs font-semibold text-foreground backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        <button
          onClick={onToggleLike}
          className="absolute right-3 top-3 rounded-full bg-[#0a0a0a]/50 p-1.5 backdrop-blur-sm transition-colors hover:bg-[#0a0a0a]/70"
          aria-label={liked ? "찜 해제" : "찜하기"}
        >
          <Heart
            className={`h-4 w-4 ${liked ? "fill-[#00D09C] text-[#00D09C]" : "text-white/70"}`}
          />
        </button>
      </div>
      <div className="p-4">
        <div className="mb-0.5 text-xs text-muted-foreground">{car.brand}</div>
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-bold text-foreground">{car.model}</h3>
          <span className="font-mono text-sm font-bold text-[#00D09C]">
            {car.price.toLocaleString()}만
          </span>
        </div>
        <div className="mb-3 text-xs text-muted-foreground">
          {fuelTypeLabels[car.fuelType]} / {car.year}
        </div>
        <button
          onClick={onCompare}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary py-2 text-sm font-medium text-foreground transition-colors hover:border-[#00D09C]/50 hover:text-[#00D09C]"
        >
          <BarChart3 className="h-4 w-4" />
          상세 비교
        </button>
      </div>
    </div>
  )
}
