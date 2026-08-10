import { useState } from 'react'
import { useResource, useAction } from '../api/useResource.js'
import { listMedia, deleteMedia } from '../api/endpoints.js'
import { ErrorState, EmptyState, Loading } from '../components/States.jsx'
import IconButton, { Actions } from '../components/IconButton.jsx'
import { IconTrash } from '../components/Icons.jsx'
import { fmtRelative } from '../lib/format.js'

const TYPES = ['video', 'pdf', 'image', 'project']

const TYPE_COLOR = {
  video: '#7c3aed',
  pdf: '#ef4444',
  image: '#14b8a6',
  project: '#2563EB',
}

export default function Media({ active, onToast }) {
  const [type, setType] = useState('all')
  const media = useResource(() => listMedia({ type, limit: 60 }), [type], { enabled: active })
  const remove = useAction()

  async function onDelete(m) {
    const res = await remove.run(() => deleteMedia(m.id))
    if (res.ok) {
      onToast('Media removed')
      media.reload()
    } else {
      onToast(res.error.message)
    }
  }

  const items = media.data?.data ?? []

  return (
    <section className={'view' + (active ? ' active' : '')} id="view-media">
      <div className="toolbar">
        <select className="filter" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">Type: All</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="sp" />
        <span className="count">{media.data?.total ?? 0} item{(media.data?.total ?? 0) === 1 ? '' : 's'}</span>
      </div>

      {media.loading && !media.data ? <Loading label="Loading media library…" variant="rows" /> : null}
      {media.error ? <ErrorState error={media.error} onRetry={media.reload} /> : null}
      {media.data && items.length === 0 ? (
        <EmptyState
          title="Media library is empty"
          hint="Files uploaded through the media API, or by teachers in their app, appear here."
        />
      ) : null}

      {items.length > 0 ? (
        <div className="media-grid">
          {items.map((m) => (
            <div className="mcard" key={m.id}>
              <div
                className="ti"
                style={{
                  background: `color-mix(in srgb, ${TYPE_COLOR[m.type] || '#64748b'} 15%, transparent)`,
                  color: TYPE_COLOR[m.type] || '#64748b',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
                </svg>
              </div>
              <div className="strong" style={{ marginTop: 8 }}>{m.title || m.filename}</div>
              <div className="fm">{m.type} · {fmtRelative(m.createdAt)}</div>
              <Actions>
                <IconButton
                  label="Delete media"
                  tone="danger"
                  icon={<IconTrash />}
                  busy={remove.busy}
                  onClick={() => onDelete(m)}
                />
              </Actions>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
