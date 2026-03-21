import { useEffect, useMemo, useRef, useState } from 'react'

export type InteractiveBodySvgProps = {
  svgRaw: string
  shadingPngSrc?: string
  muscleMap: Record<string, string[]>
  selectedIds: string[]
  onSelectedIdsChange: (ids: string[]) => void
  onHoverIdChange?: (id: string | null) => void
  getLabel?: (id: string) => string
  hoverColor?: string
  hoverOpacity?: number
  selectedColor?: string
  selectedOpacity?: number
  interactive?: boolean
  showTooltip?: boolean
  className?: string
}

function stripSvgFills(raw: string): string {
  return raw
    .replace(/<path[^>]*fill="#FDFDFD"[^>]*\/>/i, '')
    .replace(/fill="#0066FF"/gi, 'fill="transparent"')
    .replace(/fill="#FF0000"/gi, 'fill="transparent"')
    .replace(/stroke="#0066FF"/gi, 'stroke="transparent"')
    .replace(/stroke="#FF0000"/gi, 'stroke="transparent"')
}

export function InteractiveBodySvg({
  svgRaw,
  shadingPngSrc,
  muscleMap,
  selectedIds,
  onSelectedIdsChange,
  onHoverIdChange,
  getLabel,
  hoverColor = '#8FEDE1',
  hoverOpacity = 0.35,
  selectedColor = '#2fd4c1',
  selectedOpacity = 0.6,
  interactive = true,
  showTooltip = interactive,
  className,
}: InteractiveBodySvgProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const paintRef = useRef<HTMLDivElement | null>(null)
  const hitmapRef = useRef<HTMLDivElement | null>(null)

  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)

  const svgMarkup = useMemo(() => stripSvgFills(svgRaw), [svgRaw])

  const muscleMapRef = useRef(muscleMap)
  const selectedIdsRef = useRef(selectedIds)
  const onSelectedIdsChangeRef = useRef(onSelectedIdsChange)
  const onHoverIdChangeRef = useRef(onHoverIdChange)

  const svgIdToLogicalIdRef = useRef<Record<string, string>>({})
  const svgIdToLogicalId = useMemo(
    () =>
      Object.entries(muscleMap).reduce<Record<string, string>>((acc, [logicalId, svgIds]) => {
        svgIds.forEach((svgId) => {
          acc[svgId] = logicalId
        })
        return acc
      }, {}),
    [muscleMap],
  )

  useEffect(() => {
    muscleMapRef.current = muscleMap
    selectedIdsRef.current = selectedIds
    onSelectedIdsChangeRef.current = onSelectedIdsChange
    onHoverIdChangeRef.current = onHoverIdChange
    svgIdToLogicalIdRef.current = svgIdToLogicalId
  }, [muscleMap, selectedIds, onSelectedIdsChange, onHoverIdChange, svgIdToLogicalId])

  useEffect(() => {
    if (paintRef.current) {
      paintRef.current.innerHTML = svgMarkup
      const svg = paintRef.current.querySelector('svg')
      if (svg) {
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
        svg.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;'
      }
    }

    if (hitmapRef.current && interactive) {
      hitmapRef.current.innerHTML = svgMarkup
      const svg = hitmapRef.current.querySelector('svg')
      if (svg) {
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
        svg.style.cssText = 'display:block;width:100%;height:100%;pointer-events:auto;'
        svg.querySelectorAll<SVGPathElement>('path').forEach((path) => {
          path.setAttribute('fill', 'rgba(0,0,0,0.001)')
          path.setAttribute('fill-opacity', '1')
          path.setAttribute('stroke', 'transparent')
          path.style.pointerEvents = 'all'
        })
      }
    } else if (hitmapRef.current) {
      hitmapRef.current.innerHTML = ''
    }
  }, [interactive, svgMarkup])

  useEffect(() => {
    if (!interactive) {
      return
    }

    const getHitmapSvg = () => hitmapRef.current?.querySelector('svg') ?? null

    const resolveLogicalId = (event: PointerEvent): string | null => {
      const group = (event.target as Element | null)?.closest('g[id]') as SVGGElement | null
      const svgId = group?.getAttribute('id') ?? null
      if (!svgId) {
        return null
      }

      return svgIdToLogicalIdRef.current[svgId] ?? null
    }

    const onMove = (event: PointerEvent) => {
      const logicalId = resolveLogicalId(event)
      setHovered(logicalId)
      onHoverIdChangeRef.current?.(logicalId)

      const container = containerRef.current
      if (!container || !logicalId) {
        setTooltipPos(null)
        return
      }

      const rect = container.getBoundingClientRect()
      setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top })
    }

    const onLeave = () => {
      setHovered(null)
      setTooltipPos(null)
      onHoverIdChangeRef.current?.(null)
    }

    const onDown = (event: PointerEvent) => {
      const logicalId = resolveLogicalId(event)
      if (!logicalId) {
        return
      }

      const current = selectedIdsRef.current
      const next = current.includes(logicalId)
        ? current.filter((id) => id !== logicalId)
        : [...current, logicalId]

      onSelectedIdsChangeRef.current(next)
    }

    const attachListeners = () => {
      const svg = getHitmapSvg()
      if (!svg) {
        return
      }

      svg.addEventListener('pointermove', onMove)
      svg.addEventListener('pointerleave', onLeave)
      svg.addEventListener('pointerdown', onDown)
    }

    attachListeners()

    return () => {
      const svg = getHitmapSvg()
      if (!svg) {
        return
      }

      svg.removeEventListener('pointermove', onMove)
      svg.removeEventListener('pointerleave', onLeave)
      svg.removeEventListener('pointerdown', onDown)
    }
  }, [interactive, svgMarkup])

  useEffect(() => {
    const svg = paintRef.current?.querySelector('svg')
    if (!svg) {
      return
    }

    svg.querySelectorAll<SVGPathElement>('path').forEach((path) => {
      path.setAttribute('fill', 'transparent')
      path.setAttribute('fill-opacity', '0')
      path.setAttribute('stroke', 'transparent')
      path.setAttribute('stroke-opacity', '0')
    })

    const paintGroup = (svgId: string, color: string, opacity: number) => {
      const group = Array.from(svg.querySelectorAll<SVGGElement>('g[id]')).find(
        (element) => element.getAttribute('id') === svgId,
      ) ?? null

      if (!group) {
        return
      }

      group.querySelectorAll<SVGPathElement>('path').forEach((path) => {
        path.setAttribute('fill', color)
        path.setAttribute('fill-opacity', String(opacity))
        path.setAttribute('stroke', color)
        path.setAttribute('stroke-opacity', String(opacity))
      })
    }

    selectedIds.forEach((logicalId) => {
      ;(muscleMap[logicalId] ?? []).forEach((svgId) => paintGroup(svgId, selectedColor, selectedOpacity))
    })

    if (hovered && !selectedIds.includes(hovered)) {
      ;(muscleMap[hovered] ?? []).forEach((svgId) => paintGroup(svgId, hoverColor, hoverOpacity))
    }
  }, [hovered, selectedIds, muscleMap, svgMarkup, hoverColor, hoverOpacity, selectedColor, selectedOpacity])

  return (
    <div ref={containerRef} className={`relative h-full w-full${className ? ` ${className}` : ''}`}>
      {shadingPngSrc ? (
        <img
          src={shadingPngSrc}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute inset-0 z-10 h-full w-full select-none object-contain dark:brightness-125 dark:contrast-125 dark:drop-shadow-sm"
        />
      ) : null}

      <div
        ref={paintRef}
        className="pointer-events-none absolute inset-0 z-20 [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
        aria-hidden="true"
      />

      {interactive ? (
        <div
          ref={hitmapRef}
          className="absolute inset-0 z-30 [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
        />
      ) : null}

      {interactive && showTooltip && hovered && tooltipPos ? (
        <div
          className="pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-border bg-popover px-3 py-1.5 text-xs font-semibold text-popover-foreground shadow-md"
          style={{ left: tooltipPos.x, top: tooltipPos.y - 10 }}
        >
          {getLabel ? getLabel(hovered) : hovered}
          {selectedIds.includes(hovered) ? <span className="ml-1.5 text-primary">✓</span> : null}
        </div>
      ) : null}
    </div>
  )
}
