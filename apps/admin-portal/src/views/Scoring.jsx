import { useEffect, useRef, useState } from 'react'
import { useResource, useAction } from '../api/useResource.js'
import { getDimensions, updateDimensions, getBadges } from '../api/endpoints.js'
import { Loading, ErrorState, EmptyState } from '../components/States.jsx'
import IconButton from '../components/IconButton.jsx'
import { IconTrash } from '../components/Icons.jsx'

export default function Scoring({ active, onToast }) {
  const dims = useResource(() => getDimensions(), [], { enabled: active })
  const badges = useResource(() => getBadges(), [], { enabled: active })
  const save = useAction()

  // Local copy so weights can be edited before saving.
  const [draft, setDraft] = useState(null)
  const nextKey = useRef(0)
  // `key` is a stable local handle: new rows have no id yet, so they cannot be
  // addressed by one until after the first save.
  useEffect(() => {
    if (dims.data) setDraft(dims.data.map((d) => ({ ...d, key: d.id })))
  }, [dims.data])

  const total = (draft || []).reduce((sum, d) => sum + (Number(d.weight) || 0), 0)
  const balanced = total === 100
  // Compare the whole draft, not just weights by index: rows can now be added
  // and removed, so an index-wise weight check would miss both.
  const dirty =
    draft && dims.data &&
    JSON.stringify(draft.map(({ id, name, color, weight }) => ({ id, name, color, weight: Number(weight) }))) !==
      JSON.stringify(dims.data.map(({ id, name, color, weight }) => ({ id, name, color, weight: Number(weight) })))
  const named = (draft || []).every((d) => d.name.trim())

  function setField(key, key2, value) {
    setDraft((prev) => prev.map((d) => (d.key === key ? { ...d, [key2]: value } : d)))
  }

  function setWeight(key, value) {
    setField(key, 'weight', Math.max(0, Math.min(100, Number(value) || 0)))
  }

  // A fresh install has no dimensions at all, and `PUT /lqs/dimensions` treats
  // an item without an id as a create — but nothing in the UI could produce
  // one, so the LQS scale could never be set up here. This adds that row.
  function addDimension() {
    const palette = ['#2563EB', '#F59E0B', '#7C3AED', '#14B8A6', '#DC2626', '#16A34A']
    setDraft((prev) => [
      ...(prev || []),
      {
        key: `new-${nextKey.current++}`,
        id: undefined,
        name: '',
        color: palette[(prev || []).length % palette.length],
        weight: 0,
      },
    ])
  }

  function removeDimension(key) {
    setDraft((prev) => prev.filter((d) => d.key !== key))
  }

  async function onSave() {
    const payload = draft.map(({ id, name, color, weight }) => {
      const item = { name: name.trim(), color, weight: Number(weight) }
      // An id of undefined must be omitted, not sent — @IsUUID rejects null.
      if (id) item.id = id
      return item
    })
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
            <button type="button" className="linkbtn" onClick={addDimension}>
              + Add dimension
            </button>
          </div>

          {dims.loading && !dims.data ? <Loading variant="bars" /> : null}
          {dims.error ? <ErrorState error={dims.error} onRetry={dims.reload} /> : null}
          {dims.data && dims.data.length === 0 && (!draft || draft.length === 0) ? (
            <EmptyState
              title="No dimensions configured"
              hint='Use "Add dimension" above to build the LQS scale. Weights must total 100%.'
            />
          ) : null}

          {draft ? (
            <>
              <div className="dimlist">
                {draft.map((d) => (
                  <div className="matrow" key={d.key}>
                    <input
                      className="dimcolor"
                      type="color"
                      value={d.color || '#2563EB'}
                      onChange={(e) => setField(d.key, 'color', e.target.value)}
                      aria-label={`${d.name || 'New dimension'} colour`}
                    />
                    <input
                      className="dimname"
                      value={d.name}
                      placeholder="Type dimension name"
                      onChange={(e) => setField(d.key, 'name', e.target.value)}
                      aria-label="Dimension name"
                    />
                    <span className="dimtrack">
                      <i style={{ width: `${d.weight}%`, background: d.color }} />
                    </span>
                    <input
                      className="dimw"
                      type="number"
                      min="0"
                      max="100"
                      value={d.weight}
                      onChange={(e) => setWeight(d.key, e.target.value)}
                      aria-label={`${d.name || 'New dimension'} weight`}
                    />
                    <IconButton
                      label={`Remove ${d.name || 'dimension'}`}
                      tone="danger"
                      icon={<IconTrash />}
                      onClick={() => removeDimension(d.key)}
                    />
                  </div>
                ))}
              </div>

              {draft.length > 0 && !balanced ? (
                <div className="signin-err" style={{ marginTop: 10 }}>
                  Weights must total exactly 100% before they can be saved. They currently total {total}%.
                </div>
              ) : null}
              {!named ? (
                <div className="signin-err" style={{ marginTop: 10 }}>
                  Every dimension needs a name.
                </div>
              ) : null}
              {save.error ? <div className="signin-err" style={{ marginTop: 10 }}>{save.error.message}</div> : null}

              <div className="pubbar">
                <button className="btnP" onClick={onSave} disabled={!balanced || !dirty || !named || save.busy}>
                  {save.busy ? 'Saving…' : 'Save weights'}
                </button>
                <button
                  className="btnO"
                  onClick={() => setDraft(dims.data.map((d) => ({ ...d, key: d.id })))}
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
          {badges.loading && !badges.data ? <Loading variant="bars" /> : null}
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
