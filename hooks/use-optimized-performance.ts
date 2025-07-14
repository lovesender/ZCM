"use client"

import { useEffect, useRef, useCallback, useState } from "react"

// 향상된 디바운스 훅
export function useOptimizedDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean; maxWait?: number } = {},
): T {
  const { leading = false, trailing = true, maxWait } = options
  const timeoutRef = useRef<NodeJS.Timeout>()
  const maxTimeoutRef = useRef<NodeJS.Timeout>()
  const lastCallTime = useRef<number>(0)
  const lastInvokeTime = useRef<number>(0)

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      const timeSinceLastCall = now - lastCallTime.current
      const timeSinceLastInvoke = now - lastInvokeTime.current

      lastCallTime.current = now

      const shouldInvokeLeading = leading && timeSinceLastCall >= delay
      const shouldInvokeMaxWait = maxWait && timeSinceLastInvoke >= maxWait

      if (shouldInvokeLeading || shouldInvokeMaxWait) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = undefined
        }
        if (maxTimeoutRef.current) {
          clearTimeout(maxTimeoutRef.current)
          maxTimeoutRef.current = undefined
        }
        lastInvokeTime.current = now
        callback(...args)
        return
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        if (trailing) {
          lastInvokeTime.current = Date.now()
          callback(...args)
        }
        timeoutRef.current = undefined
      }, delay)

      if (maxWait && !maxTimeoutRef.current) {
        maxTimeoutRef.current = setTimeout(() => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = undefined
          }
          lastInvokeTime.current = Date.now()
          callback(...args)
          maxTimeoutRef.current = undefined
        }, maxWait)
      }
    },
    [callback, delay, leading, trailing, maxWait],
  ) as T

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (maxTimeoutRef.current) clearTimeout(maxTimeoutRef.current)
    }
  }, [])

  return debouncedCallback
}

// RAF 기반 스로틀 훅
export function useRAFThrottle<T extends (...args: any[]) => any>(callback: T): T {
  const rafRef = useRef<number>()
  const argsRef = useRef<Parameters<T>>()

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      argsRef.current = args

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          callback(...(argsRef.current as Parameters<T>))
          rafRef.current = undefined
        })
      }
    },
    [callback],
  ) as T

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return throttledCallback
}

// 지능형 교차점 관찰자
export function useIntelligentIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit & {
    cooldown?: number
    maxTriggers?: number
  } = {},
) {
  const { cooldown = 1000, maxTriggers = Number.POSITIVE_INFINITY, ...observerOptions } = options
  const targetRef = useRef<HTMLDivElement>(null)
  const lastTrigger = useRef<number>(0)
  const triggerCount = useRef<number>(0)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const now = Date.now()
        const timeSinceLastTrigger = now - lastTrigger.current

        if (timeSinceLastTrigger >= cooldown && triggerCount.current < maxTriggers) {
          lastTrigger.current = now
          triggerCount.current++
          callback()
        }
      }
    }, observerOptions)

    observer.observe(target)

    return () => observer.disconnect()
  }, [callback, cooldown, maxTriggers])

  return targetRef
}

// 성능 메트릭 수집
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<{
    renderTime: number
    componentCount: number
    memoryUsage?: number
    fps: number
  } | null>(null)

  const renderStartTime = useRef<number>(Date.now())
  const frameCount = useRef<number>(0)
  const lastFrameTime = useRef<number>(Date.now())

  // FPS 측정
  const measureFPS = useCallback(() => {
    const now = Date.now()
    frameCount.current++

    if (now - lastFrameTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (now - lastFrameTime.current))
      frameCount.current = 0
      lastFrameTime.current = now

      setMetrics((prev) => (prev ? { ...prev, fps } : null))
    }

    requestAnimationFrame(measureFPS)
  }, [])

  useEffect(() => {
    const rafId = requestAnimationFrame(measureFPS)

    // 렌더 시간 측정
    const renderTime = Date.now() - renderStartTime.current

    // 메모리 사용량 측정 (가능한 경우)
    const memoryUsage = (performance as any).memory?.usedJSHeapSize

    setMetrics({
      renderTime,
      componentCount: document.querySelectorAll("[data-component]").length,
      memoryUsage: memoryUsage ? Math.round(memoryUsage / 1024 / 1024) : undefined,
      fps: 60, // 초기값
    })

    return () => cancelAnimationFrame(rafId)
  }, [measureFPS])

  return metrics
}

// 배치 업데이트 훅
export function useBatchedUpdates<T>(initialValue: T, batchDelay = 16): [T, (updater: (prev: T) => T) => void] {
  const [value, setValue] = useState<T>(initialValue)
  const pendingUpdates = useRef<((prev: T) => T)[]>([])
  const timeoutRef = useRef<NodeJS.Timeout>()

  const batchedSetValue = useCallback(
    (updater: (prev: T) => T) => {
      pendingUpdates.current.push(updater)

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setValue((prev) => {
          let result = prev
          for (const update of pendingUpdates.current) {
            result = update(result)
          }
          pendingUpdates.current = []
          return result
        })
      }, batchDelay)
    },
    [batchDelay],
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [value, batchedSetValue]
}
