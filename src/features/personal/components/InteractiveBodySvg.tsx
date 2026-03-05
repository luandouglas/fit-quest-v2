import { useEffect, useMemo, useRef, useState } from 'react'

export type InteractiveBodySvgProps = {
  /** SVG raw string — fills are stripped internally */
  svgRaw: string
  /** PNG stacked between SVG fill layer and hitmap */
  shadingPngSrc?: string
  /**
   * Logical-id → SVG group-id[] map.
   * Keys are logical IDs surfaced to the outside (selectedIds, callbacks).
   * Values are the <g id="..."> elements to paint in the SVG.
   */
  muscleMap: Record<string, string[]>
  /** Controlled selected logical IDs */
  selectedIds: string[]
  onSelectedIdsChange: (ids: string[]) => void
  /** Notifies parent of the currently hovered logical ID (or null) */
  onHoverIdChange?: (id: string | null) => void
  /** Tooltip label resolver — defaults to the raw logical ID */
  getLabel?: (id: string) => string
  /** Highlight colours */
  hoverColor?: string
  hoverOpacity?: number
  selectedColor?: string
  selectedOpacity?: number
  className?: string
}

/** Strip the original fills so the SVG starts fully transparent */
function stripSvgFills(raw: string): string {
  return raw
    .replace(/<path[^>]*fill="#FDFDFD"[^>]*\/>/i, '')
    .replace(/fill="#0066FF"/gi, 'fill="transparent"')
    .replace(/stroke="#0066FF"/gi, 'stroke="transparent"')
}

export function InteractiveBodySvg({
  svgRaw,
  shadingPngSrc,
  muscleMap,
  selectedIds,
  onSelectedIdsChange,
  onHoverIdChange,
  getLabel,
  hoverColor = '#67E8F9',
  hoverOpacity = 0.35,
  selectedColor = '#2563eb',
  selectedOpacity = 0.6,
  className,
}: InteractiveBodySvgProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const paintRef = useRef<HTMLDivElement | null>(null)
  const hitmapRef = useRef<HTMLDivElement | null>(null)

  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)

  const svgMarkup = useMemo(() => stripSvgFills(svgRaw), [svgRaw])

  // ── Refs for latest prop values ───────────────────────────────────────────
  // Allows the event-listener effect to run exactly ONCE while always reading
  // up-to-date values — avoids detaching/reattaching listeners on every render.
  const muscleMapRef = useRef(muscleMap)
  const selectedIdsRef = useRef(selectedIds)
  const onSelectedIdsChangeRef = useRef(onSelectedIdsChange)
  const onHoverIdChangeRef = useRef(onHoverIdChange)

  // Reverse map ref: svg_group_id -> logical_id
  const svgIdToLogicalIdRef = useRef<Record<string, string>>({})
  const svgIdToLogicalId = useMemo(
    () =>
      Object.entries(muscleMap).reduce<Record<string, string>>((acc, [logicalId, svgIds]) => {
        svgIds.forEach((svgId) => (acc[svgId] = logicalId))
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

  // ── Effect 1: Inject SVG markup imperatively ──────────────────────────────
  // We own the DOM — React must NOT overwrite innerHTML after this point.
  // Using dangerouslySetInnerHTML would allow React to replace the node on any
  // re-render, destroying fills and event listeners we applied imperatively.
  useEffect(() => {
    if (paintRef.current) {
      paintRef.current.innerHTML = svgMarkup
      const svg = paintRef.current.querySelector('svg')
      if (svg) {
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
        svg.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;'
      }
    }
    if (hitmapRef.current) {
      hitmapRef.current.innerHTML = svgMarkup
      const svg = hitmapRef.current.querySelector('svg')
      if (svg) {
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
        svg.style.cssText = 'display:block;width:100%;height:100%;pointer-events:auto;'
        // Make every path nearly-transparent so pointer-events fire on fill area
        svg.querySelectorAll<SVGPathElement>('path').forEach((p) => {
          p.setAttribute('fill', 'rgba(0,0,0,0.001)')
          p.setAttribute('fill-opacity', '1')
          p.setAttribute('stroke', 'transparent')
          p.style.pointerEvents = 'all'
        })
      }
    }
  }, [svgMarkup])

  // ── Effect 2: Event delegation (runs once) ────────────────────────────────
  // All runtime values are read through refs so deps stay empty and listeners
  // are never torn down / re-added on prop changes.
  useEffect(() => {
    const getHitmapSvg = () => hitmapRef.current?.querySelector('svg') ?? null

    const resolveLogicalId = (e: PointerEvent): string | null => {
      const g = (e.target as Element | null)?.closest('g[id]') as SVGGElement | null
      const svgId = g?.getAttribute('id') ?? null
      if (!svgId) return null
      return svgIdToLogicalIdRef.current[svgId] ?? null
    }

    const onMove = (e: PointerEvent) => {
      const logicalId = resolveLogicalId(e)
      setHovered(logicalId)
      onHoverIdChangeRef.current?.(logicalId)

      const container = containerRef.current
      if (!container || !logicalId) {
        setTooltipPos(null)
        return
      }
      const rect = container.getBoundingClientRect()
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    const onLeave = () => {
      setHovered(null)
      setTooltipPos(null)
      onHoverIdChangeRef.current?.(null)
    }

    const onDown = (e: PointerEvent) => {
      const logicalId = resolveLogicalId(e)
      if (!logicalId) return
      const current = selectedIdsRef.current
      const next = current.includes(logicalId)
        ? current.filter((id) => id !== logicalId)
        : [...current, logicalId]
      onSelectedIdsChangeRef.current(next)
    }

    // Effect 1 may not have run yet if svgMarkup changes at the same tick;
    // schedule listener attachment after the DOM is ready.
    const attachListeners = () => {
      const svg = getHitmapSvg()
      if (!svg) return
      svg.addEventListener('pointermove', onMove)
      svg.addEventListener('pointerleave', onLeave)
      svg.addEventListener('pointerdown', onDown)
    }

    attachListeners()

    return () => {
      const svg = getHitmapSvg()
      if (!svg) return
      svg.removeEventListener('pointermove', onMove)
      svg.removeEventListener('pointerleave', onLeave)
      svg.removeEventListener('pointerdown', onDown)
    }
  }, [svgMarkup]) // re-attach only when the SVG DOM itself is replaced

  // ── Effect 3: Paint ───────────────────────────────────────────────────────
  useEffect(() => {
    const svg = paintRef.current?.querySelector('svg')
    if (!svg) return

    // Reset
    svg.querySelectorAll<SVGPathElement>('path').forEach((p) => {
      p.setAttribute('fill', 'transparent')
      p.setAttribute('fill-opacity', '0')
      p.setAttribute('stroke', 'transparent')
      p.setAttribute('stroke-opacity', '0')
    })

    const paintGroup = (svgId: string, color: string, opacity: number) => {
      // Use direct attribute comparison instead of CSS.escape to avoid
      // silent querySelector misses when the id contains special characters.
      const g = Array.from(svg.querySelectorAll<SVGGElement>('g[id]')).find(
        (el) => el.getAttribute('id') === svgId,
      ) ?? null
      if (!g) return
      g.querySelectorAll<SVGPathElement>('path').forEach((p) => {
        p.setAttribute('fill', color)
        p.setAttribute('fill-opacity', String(opacity))
        p.setAttribute('stroke', color)
        p.setAttribute('stroke-opacity', String(opacity))
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
      {/* Layer 1 (bottom): PNG — static character with lines, shadows & details */}
      {shadingPngSrc ? (
        <img
          src={shadingPngSrc}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute inset-0 z-10 h-full w-full select-none object-contain dark:brightness-[1.26] dark:contrast-[1.2] dark:drop-shadow-[0_0_8px_rgba(241,245,249,0.32)]"
        />
      ) : null}

      {/* Layer 2 (middle): SVG highlight — semi-transparent fills painted above the PNG */}
      <div
        ref={paintRef}
        className="pointer-events-none absolute inset-0 z-20 [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
        aria-hidden="true"
      />

      {/* Layer 3 (top): SVG hitmap — invisible, captures hover/click events */}
      <div
        ref={hitmapRef}
        className="absolute inset-0 z-30 [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
      />

      {/* Tooltip */}
      {hovered && tooltipPos ? (
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
