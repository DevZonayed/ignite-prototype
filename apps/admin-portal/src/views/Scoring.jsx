import { useEffect, useState } from 'react'
import { useResource, useAction } from '../api/useResource.js'
import { getDimensions, updateDimensions, getBadges } from '../api/endpoints.js'
import { Loading, ErrorState, EmptyState } from '../components/States.jsx'

export default function Scoring({ active, onToast }) {
  const dims = useResource(() => getDimensions(), [], { enabled: active })
  const badges = useResource(() => getBadges(), [], { enabled: active })
  const save = useAction()

  // Local copy so weights can be edited before saving.
  const [draft, setDraft] = useState(null)
  useEffect(() => {
    if (dims.data) setDraft(dims.data.map((d) => ({ ...d })))
  }, [dims.data])

  const total = (draft || []).reduce((sum, d) => sum + (Number(d.weight) || 0), 0)
  const balanced = total === 100
  const dirty =
    draft && dims.data &&
    draft.some((d, i) => Number(d.weight) !== Number(dims.data[i]?.weight))

  function setWeight(id, value) {
    const weight = Math.max(0, Math.min(100, Number(value) || 0))
    setDraft((prev) => prev.map((d) => (d.id === id ? { ...d, weight } : d)))
  }

  async function onSave() {
    const payload = draft.map(({ id, name, color, weight }) => ({ id, name, color, weight }))
    const res = await save.run(() => updateDimensions(payload))
    if (res.ok) {
      onToast('Rubric weights saved')
      dims.reload()
    } else {
      onToast(res.error.message)
    }
  }

  return (
    <section className={'view' + (active ? ' active' : '')} id="view-scoring">
      <div className="grid2">
        <div className="panel">
          <div className="ph">
            <h3>LQS dimensions</h3>
            <span className={'badge ' + (balanced ? 'b-green' : 'b-amber')}>
              Total {total}%
            </span>
          </div>

          {dims.loading && !dims.data ? <Loading /> : null}
          {dims.error ? <ErrorState error={dims.error} onRetry={dims.reload} /> : null}
          {dims.data && dims.data.length === 0 ? (
            <EmptyState title="No dimensions configured" />
          ) : null}

          {draft ? (
            <>
              <div className="dimlist">
                {draft.map((d) => (
                  <div className="matrow" key={d.id}>
                    <span className="dimdot" style={{ background: d.color }} />
                    <span className="dimname">{d.name}</span>
                    <span className="dimtrack">
                      <i style={{ width: `${d.weight}%`, background: d.color }} />
                    </span>
                    <input
                      className="dimw"
                      type="number"
                      min="0"
                      max="100"
                      value={d.weight}
                      onChange={(e) => setWeight(d.id, e.target.value)}
                      aria-label={`${d.name} weight`}
                    />
                  </div>
                ))}
              </div>

              {!balanced ? (
                <div className="signin-err" style={{ marginTop: 10 }}>
                  Weights must total exactly 100% before they can be saved. They currently total {total}%.
                </div>
              ) : null}
              {save.error ? <div className="signin-err" style={{ marginTop: 10 }}>{save.error.message}</div> : null}

              <div className="pubbar">
                <button className="btnP" onClick={onSave} disabled={!balanced || !dirty || save.busy}>
                  {save.busy ? 'Saving…' : 'Save weights'}
                </button>
                <button
                  className="btnO"
                  onClick={() => setDraft(dims.data.map((d) => ({ ...d })))}
                  disabled={!dirty || save.busy}
                >
                  Reset
                </button>
              </div>
            </>
          ) : null}
        </div>

        <div className="panel">
          <div className="ph"><h3>Badges</h3></div>
          {badges.loading && !badges.data ? <Loading /> : null}
          {badges.error ? <ErrorState error={badges.error} onRetry={badges.reload} /> : null}
          {badges.data && badges.data.length === 0 ? (
            <EmptyState title="No badges defined" hint="Badges reward learners when a rule is met." />
          ) : null}
          {badges.data && badges.data.length > 0 ? (
            <div className="badgegrid">
              {badges.data.map((b) => (
                <div className="bcard" key={b.id}>
                  <div className="strong">{b.name}</div>
                  <div className="fm">{b.description}</div>
                  <div className="fm" style={{ marginTop: 6 }}>
                    <span className="badge b-grey">{b.triggerRule}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
