import { useState } from 'react'
import { useResource, useAction } from '../api/useResource.js'
import { listAnnouncements, createAnnouncement, deleteAnnouncement } from '../api/endpoints.js'
import { ErrorState, EmptyState, Loading } from '../components/States.jsx'
import Modal, { ModalActions, Field } from '../components/Modal.jsx'
import IconButton, { Actions } from '../components/IconButton.jsx'
import { IconTrash, IconPlus } from '../components/Icons.jsx'
import { fmtRelative, humanize } from '../lib/format.js'

const AUDIENCES = [
  { value: 'all_parents', label: 'All parents' },
  { value: 'by_school', label: 'By school' },
  { value: 'by_class', label: 'By class' },
]

function AnnouncementModal({ onClose, onPosted, onToast }) {
  const [form, setForm] = useState({ title: '', message: '', audience: 'all_parents' })
  const { run, busy, error } = useAction()
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const res = await run(() => createAnnouncement({
      title: form.title.trim(),
      message: form.message.trim(),
      audience: form.audience,
    }))
    if (res.ok) {
      onToast('Announcement posted')
      onPosted()
      onClose()
    }
  }

  return (
    <Modal
      title="New announcement"
      subtitle="Parents see this in their app"
      onClose={onClose}
      busy={busy}
    >
      <form onSubmit={submit}>
        <Field label="Title" htmlFor="a-title">
          <input
            id="a-title"
            className="signin-input"
            placeholder="Type title"
            value={form.title}
            onChange={set('title')}
            required
          />
        </Field>

        <Field label="Message" htmlFor="a-msg">
          <textarea
            id="a-msg"
            className="signin-input"
            rows={5}
            placeholder="Type message"
            value={form.message}
            onChange={set('message')}
            required
          />
        </Field>

        <Field label="Audience" htmlFor="a-aud">
          <select id="a-aud" className="signin-input" value={form.audience} onChange={set('audience')}>
            {AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </Field>

        {error ? <div className="signin-err">{error.message}</div> : null}

        <ModalActions
          onCancel={onClose}
          submitLabel="Post announcement"
          busy={busy}
          disabled={!form.title.trim() || !form.message.trim()}
        />
      </form>
    </Modal>
  )
}

export default function Announcements({ active, onToast }) {
  const [composing, setComposing] = useState(false)
  const posts = useResource(() => listAnnouncements({ limit: 50 }), [], { enabled: active })
  const remove = useAction()

  async function onDelete(a) {
    const res = await remove.run(() => deleteAnnouncement(a.id))
    if (res.ok) {
      onToast('Announcement deleted')
      posts.reload()
    } else {
      onToast(res.error.message)
    }
  }

  const rows = posts.data?.data ?? []

  return (
    <section className={'view' + (active ? ' active' : '')} id="view-announcements">
      <div className="toolbar">
        <span className="count">{rows.length} posted</span>
        <span className="sp" />
        <button className="btnP" onClick={() => setComposing(true)}>
          <IconPlus />
          New announcement
        </button>
      </div>

      <div className="panel">
        <div className="ph">
          <h3>Posted announcements</h3>
          <button type="button" className="linkbtn" onClick={posts.reload}>Refresh</button>
        </div>
        {posts.loading && !posts.data ? <Loading variant="rows" /> : null}
        {posts.error ? <ErrorState error={posts.error} onRetry={posts.reload} /> : null}
        {posts.data && rows.length === 0 ? (
          <EmptyState
            title="Nothing posted yet"
            hint='Use "New announcement" above. Posts reach parents in their app.'
          />
        ) : null}
        {rows.map((a) => (
          <div className="mcard" key={a.id}>
            <div className="ph" style={{ padding: 0, border: 0 }}>
              <div className="strong">{a.title}</div>
              <Actions>
                <IconButton
                  label="Delete announcement"
                  tone="danger"
                  icon={<IconTrash />}
                  busy={remove.busy}
                  onClick={() => onDelete(a)}
                />
              </Actions>
            </div>
            <div className="fm" style={{ margin: '6px 0 8px' }}>{a.message}</div>
            <div>
              <span className="badge b-blue">{humanize(a.audience)}</span>
              <span className="fm" style={{ marginLeft: 8 }}>{fmtRelative(a.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {composing ? (
        <AnnouncementModal
          onClose={() => setComposing(false)}
          onPosted={posts.reload}
          onToast={onToast}
        />
      ) : null}
    </section>
  )
}
