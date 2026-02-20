"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { getRankingDataFromCars, rankingData } from "@/lib/car-data"
import type { Car } from "@/lib/car-data"

interface RankingChartProps {
  /** 전달 시 이 목록 기준 인기 Top5 (viewCount → 가격순) */
  cars?: Car[]
}

export function RankingChart({ cars }: RankingChartProps) {
  const data = useMemo(
    () => (cars && cars.length > 0 ? getRankingDataFromCars(cars) : rankingData),
    [cars],
  )
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-bold text-foreground">
        인기 랭킹 Top 5
      </h2>
      <div className="rounded-xl border border-border bg-card p-4">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fill: "#888888", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,208,156,0.08)" }}
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                color: "#f0f0f0",
                fontSize: "12px",
              }}
              formatter={(value: number) => [
                `${value.toLocaleString()}건`,
                "검색량",
              ]}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
