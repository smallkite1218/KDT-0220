"use client"

import Link from "next/link"
import { Heart, User, LogOut } from "lucide-react"

export function GNB() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-sm lg:px-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00D09C]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0a0a0a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-2-2.2-3.3C13 5.6 12 5 11 5H6c-1 0-2 .5-2.7 1.3L1 9v7c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            CarInsight
          </span>
        </Link>
        <div className="ml-2 hidden items-center gap-2 text-sm md:flex">
          <span className="rounded bg-[#00D09C] px-1.5 py-0.5 text-xs font-bold text-[#0a0a0a]">
            HOT
          </span>
          <span className="text-muted-foreground">
            {'Tesla Model Y 5,990만 > BMW 3 Series 5,590만 >'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="찜 목록"
        >
          <Heart className="h-5 w-5" />
        </button>
        <button
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="프로필"
        >
          <User className="h-5 w-5" />
        </button>
        <button
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="로그아웃"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
