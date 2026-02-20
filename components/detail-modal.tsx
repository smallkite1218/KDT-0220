"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { Car } from "@/lib/car-data"

interface DetailModalProps {
  car: Car | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const specLabels: Record<string, string> = {
  price: "가격",
  fuel: "연비",
  design: "디자인",
  space: "공간",
  safety: "안전",
}

export function DetailModal({ car, open, onOpenChange }: DetailModalProps) {
  if (!car) return null

  const radarData = Object.entries(car.specs).map(([key, value]) => ({
    subject: specLabels[key] || key,
    value,
    fullMark: 100,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {car.brand} {car.model}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            AI 분석 리포트
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Radar Chart */}
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#2a2a2a" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#888888", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name={car.model}
                  dataKey="value"
                  stroke="#00D09C"
                  fill="#00D09C"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Analysis */}
          <div className="flex flex-col justify-center">
            <div className="mb-4">
              <span className="font-mono text-2xl font-bold text-[#00D09C]">
                {car.price.toLocaleString()}
              </span>
              <span className="ml-1 text-sm text-muted-foreground">
                만 원
              </span>
            </div>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {car.origin === "import" && (
                <span className="rounded-full border border-[#00D09C] bg-[#00D09C]/10 px-2.5 py-0.5 text-xs font-bold text-[#00D09C]">
                  수입
                </span>
              )}
              {car.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#00D09C]/30 bg-[#00D09C]/10 px-2.5 py-0.5 text-xs font-medium text-[#00D09C]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <div className="mb-2 flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#00D09C]">
                  Gemini AI 분석
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {car.aiComment}
              </p>
            </div>

            {/* Spec Bars */}
            <div className="mt-4 flex flex-col gap-2">
              {radarData.map((item) => (
                <div key={item.subject} className="flex items-center gap-2">
                  <span className="w-12 text-xs text-muted-foreground">
                    {item.subject}
                  </span>
                  <div className="flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-[#00D09C] transition-all"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-xs text-muted-foreground">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
