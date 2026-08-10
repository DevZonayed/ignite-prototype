/** Placeholder rows that keep table height stable while loading. */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c}><span className="skel" style={{ width: c === 0 ? '58%' : '34%' }} /></td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

/* ------------------------------------------------------------------ skeleton
 *
 * Loading is a skeleton, not a spinner. A spinner says "something is happening";
 * a skeleton says "this is what is coming, and roughly how much of it" — the
 * layout is already reserved, so nothing jumps when the data lands.
 *
 * `Loading` keeps its old call signature, so every existing call site gets a
 * skeleton for free; pass `variant` where the panel has a distinctive shape.
 */

/** One shimmering bar. Width/height accept any CSS length. */
export function Skel({ w = '100%', h = 11, r = 6, style }) {
  return <span className="skel-line" style={{ width: w, height: h, borderRadius: r, ...style }} />
}

/** A paragraph of bars, last one short so it reads as text rather than a block. */
export function SkelText({ lines = 3, widths }) {
  const fallback = ['92%', '78%', '54%', '84%', '61%']
  return (
    <span className="skel-stack">
      {Array.from({ length: lines }).map((_, i) => (
        <Skel key={i} w={widths?.[i] ?? fallback[i % fallback.length]} />
      ))}
    </span>
  )
}

/** Rows of avatar + two lines — feeds, media, audit, people. */
export function SkelRows({ rows = 4, avatar = true, avatarSize = 32 }) {
  return (
    <span className="skel-stack" style={{ gap: 0 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <span className="skel-row" key={i}>
          {avatar ? (
            <span className="skel-avatar" style={{ width: avatarSize, height: avatarSize }} />
          ) : null}
          <span className="skel-rowmain">
            <Skel w={i % 2 ? '52%' : '68%'} h={12} />
            <Skel w={i % 2 ? '34%' : '41%'} h={9} />
          </span>
          <Skel w={54} h={22} r={999} />
        </span>
      ))}
    </span>
  )
}

/** Label + track + value, for coverage / compliance lists. */
export function SkelBars({ rows = 4 }) {
  return (
    <span className="skel-stack" style={{ gap: 14 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Skel w={70} h={11} />
          <Skel w="100%" h={9} r={99} style={{ flex: 1 }} />
          <Skel w={34} h={11} />
        </span>
      ))}
    </span>
  )
}

/** A bar chart's footprint, so the panel keeps its height. */
export function SkelChart({ bars = 7 }) {
  // Fixed pattern rather than random so the shape does not change between renders.
  const heights = [46, 72, 58, 88, 64, 39, 77]
  return (
    <span className="skel-bars">
      {Array.from({ length: bars }).map((_, i) => (
        <span className="skel-bar" key={i} style={{ height: `${heights[i % heights.length]}%` }} />
      ))}
    </span>
  )
}

/** The four stat tiles that head most views. */
export function SkelTiles({ count = 4 }) {
  return (
    <span className="skel-tiles">
      {Array.from({ length: count }).map((_, i) => (
        <span className="skel-tile" key={i}>
          <Skel w="52%" h={10} />
          <Skel w={64} h={26} r={8} />
          <Skel w="70%" h={9} />
        </span>
      ))}
    </span>
  )
}

/** Label + control pairs, for settings and profile forms. */
export function SkelForm({ fields = 4 }) {
  return (
    <span className="skel-stack" style={{ gap: 16 }}>
      {Array.from({ length: fields }).map((_, i) => (
        <span key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skel w={94} h={9} />
          <Skel w="100%" h={38} r={10} />
        </span>
      ))}
    </span>
  )
}

/** Whole-view placeholder: the tile row plus a couple of panels. */
export function SkelPage() {
  return (
    <>
      <SkelTiles />
      <span className="skel-panel" style={{ display: 'block' }}>
        <Skel w={150} h={14} style={{ marginBottom: 16 }} />
        <SkelRows rows={4} />
      </span>
      <span className="skel-panel" style={{ display: 'block' }}>
        <Skel w={120} h={14} style={{ marginBottom: 16 }} />
        <SkelBars rows={3} />
      </span>
    </>
  )
}

const VARIANTS = {
  block: (p) => <SkelText lines={p.lines ?? 3} />,
  rows: (p) => <SkelRows rows={p.rows ?? 4} />,
  list: (p) => <SkelRows rows={p.rows ?? 4} avatar={false} />,
  bars: (p) => <SkelBars rows={p.rows ?? 4} />,
  chart: (p) => <SkelChart bars={p.bars ?? 7} />,
  tiles: (p) => <SkelTiles count={p.count ?? 4} />,
  form: (p) => <SkelForm fields={p.fields ?? 4} />,
  page: () => <SkelPage />,
}

/**
 * Loading placeholder.
 *
 * The label is announced to screen readers but not drawn — a skeleton already
 * says "loading" visually, and a caption under shimmering bars reads as content.
 */
export function Loading({ label = 'Loading…', variant = 'block', ...rest }) {
  const render = VARIANTS[variant] || VARIANTS.block
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {render(rest)}
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="state state-err" role="alert">
      <div className="state-title">Could not load this</div>
      <div className="state-msg">{error?.message || 'Unknown error'}</div>
      {onRetry ? <button className="btnO" onClick={onRetry}>Try again</button> : null}
    </div>
  )
}

export function EmptyState({ title, hint }) {
  return (
    <div className="state">
      <div className="state-title">{title}</div>
      {hint ? <div className="state-msg">{hint}</div> : null}
    </div>
  )
}

/**
 * Standard load/error/empty/content switch so every view behaves the same.
 * `isEmpty` is only consulted once data has arrived.
 */
export function Resource({ query, isEmpty, empty, children, loadingLabel }) {
  if (query.loading && query.data == null) return <Loading label={loadingLabel} />
  if (query.error) return <ErrorState error={query.error} onRetry={query.reload} />
  if (query.data == null) return null
  if (isEmpty && isEmpty(query.data)) {
    return <EmptyState title={empty?.title || 'Nothing here yet'} hint={empty?.hint} />
  }
  return children(query.data)
}
