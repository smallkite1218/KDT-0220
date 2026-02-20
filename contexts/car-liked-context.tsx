"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

const STORAGE_KEY = "car-insight-liked"

type CarLikedContextValue = {
  likedIds: Set<string>
  toggleLike: (id: string) => void
  isLiked: (id: string) => boolean
}

const CarLikedContext = createContext<CarLikedContextValue | null>(null)

function loadLikedIds(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw) as string[]
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function saveLikedIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  } catch {}
}

export function CarLikedProvider({ children }: { children: ReactNode }) {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setLikedIds(loadLikedIds())
  }, [])

  const toggleLike = useCallback((id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      saveLikedIds(next)
      return next
    })
  }, [])

  const isLiked = useCallback((id: string) => likedIds.has(id), [likedIds])

  return (
    <CarLikedContext.Provider value={{ likedIds, toggleLike, isLiked }}>
      {children}
    </CarLikedContext.Provider>
  )
}

export function useCarLiked() {
  const ctx = useContext(CarLikedContext)
  if (!ctx) throw new Error("useCarLiked must be used within CarLikedProvider")
  return ctx
}
