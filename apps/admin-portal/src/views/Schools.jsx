import { useState } from 'react'
import { useResource, useAction } from '../api/useResource.js'
import { listSchools, createSchool, updateSchool, deleteSchool, listCurricula } from '../api/endpoints.js'
import { ErrorState, EmptyState, TableSkeleton } from '../components/States.jsx'
import Modal, { ModalActions, Field } from '../components/Modal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import IconButton, { Actions } from '../components/IconButton.jsx'
import { IconEye, IconPencil, IconTrash, IconPlus } from '../components/Icons.jsx'
import { fmtRelative, humanize, coverageColor } from '../lib/format.js'

const REGIONS = ['Lagos', 'Abuja', 'Kano', 'Rivers', 'Oyo', 'Enugu']
const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'needs_attention', label: 'Needs attention' },
]
const TERMS = ['Term 1', 'Term 2', 'Term 3']
const PAGE_SIZE = 20

/** Default the academic year to the one the current month falls in. */
function currentAcademicYear() {
  const now = new Date()
  // School years here start in September.
  const startYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1
  return `${startYear}/${startYear + 1}`
}

/** One form for both create and edit. `school` null means create. */
function SchoolFormModal({ school, curricula, onClose, onSaved, onToast }) {
  const editing = !!school
  const initial = editing
    ? {
        name: school.name || '',
        region: school.region || REGIONS[0],
        subject: school.subject || '',
        academicYear: school.academicYear || '',
        currentTerm: school.currentTerm || TERMS[0],
        timezone: school.timezone || '',
        curriculumVersionId: school.curriculumVersionId || '',
      }
    : {
        name: '',
        region: REGIONS[0],
        subject: 'Digital Innovation',
        academicYear: currentAcademicYear(),
        currentTerm: TERMS[0],
        timezone: 'Africa/Lagos',
        curriculumVersionId: '',
      }

  const [form, setForm] = useState(initial)
  // Every school is created with a principal, so the school always has somebody
  // able to administer it. Not editable here: change it from the Users screen.
  const [principal, setPrincipal] = useState({ email: '', password: '' })
  const [revealPassword, setRevealPassword] = useState(false)
  const { run, busy, error } = useAction()
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const setP = (k) => (e) => setPrincipal((p) => ({ ...p, [k]: e.target.value }))

  const changed = Object.keys(initial).filter((k) => form[k] !== initial[k])

  async function submit(e) {
    e.preventDefault()
    const keys = editing ? changed : Object.keys(form)
    const body = {}
    keys.forEach((k) => {
      // Optional fields must be omitted rather than sent empty; the API
      // validates curriculumVersionId as a UUID and rejects "".
      if (!form[k] && k !== 'name' && k !== 'region') return
      body[k] = form[k]
    })
    if (!editing) {
      body.name = form.name.trim()
      body.region = form.region
      body.principal = {
        email: principal.email.trim(),
        password: principal.password,
      }
    }

    const res = await run(() => (editing ? updateSchool(school.id, body) : createSchool(body)))
    if (res.ok) {
      if (editing) {
        onToast(`${res.value.name} updated`)
      } else {
        onToast(`${res.value.name} created. ${res.value.principal?.email} can sign in now.`)
      }
      onSaved()
      onClose()
    }
  }

  // Mirrors SchoolPrincipalDto so an invalid password fails before a round trip.
  const passwordOk =
    principal.password.length >= 8 &&
    /[A-Za-z]/.test(principal.password) &&
    /\d/.test(principal.password)
  const canSubmit = editing
    ? changed.length > 0
    : !!form.name.trim() && !!principal.email.trim() && passwordOk

  return (
    <Modal
      title={editing ? 'Edit school' : 'Add school'}
      subtitle={editing ? school.name : 'Name and region are required'}
      onClose={onClose}
      busy={busy}
    >
      <form onSubmit={submit}>
        <Field label="School name" htmlFor="s-name">
          <input id="s-name" placeholder="Type school name" className="signin-input" value={form.name} onChange={set('name')} required />
        </Field>

        <div className="modal-grid">
          <Field label="Region" htmlFor="s-region">
            <select id="s-region" className="signin-input" value={form.region} onChange={set('region')}>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Subject" htmlFor="s-subject">
            <input id="s-subject" placeholder="Type subject" className="signin-input" value={form.subject} onChange={set('subject')} />
          </Field>
        </div>

        <div className="modal-grid">
          <Field label="Academic year" htmlFor="s-year">
            <input id="s-year" placeholder="Type academic year" className="signin-input" value={form.academicYear} onChange={set('academicYear')} />
          </Field>
          <Field label="Current term" htmlFor="s-term">
            <select id="s-term" className="signin-input" value={form.currentTerm} onChange={set('currentTerm')}>
              {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Timezone" htmlFor="s-tz">
          <input id="s-tz" placeholder="Type timezone" className="signin-input" value={form.timezone} onChange={set('timezone')} />
        </Field>

        <Field
          label="Curriculum"
          htmlFor="s-curr"
          hint={curricula?.length ? undefined : 'Publish a curriculum version to assign one here.'}
        >
          <select id="s-curr" className="signin-input" value={form.curriculumVersionId} onChange={set('curriculumVersionId')}>
            <option value="">{curricula?.length ? 'No curriculum assigned' : 'No curriculum available yet'}</option>
            {(curricula || []).map((c) => (
              <option key={c.id} value={c.id}>{c.name} v{c.version}</option>
            ))}
          </select>
        </Field>

        {!editing ? (
          <>
            <div className="modal-section">
              <span className="modal-section-title">Principal login</span>
              <span className="modal-section-note">
                Created with the school and active immediately. Pass these
                credentials to the principal, who can change them later.
              </span>
            </div>

            <Field label="Email" htmlFor="p-email">
              <input
                id="p-email"
                className="signin-input"
                type="email"
                autoComplete="off"
                placeholder="Type email"
                value={principal.email}
                onChange={setP('email')}
                required
              />
            </Field>

            <Field
              label="Password"
              htmlFor="p-password"
              hint="At least 8 characters, including a letter and a number."
            >
              <div className="input-affix">
                <input
                  id="p-password"
                  className="signin-input"
                  type={revealPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Type password"
                  value={principal.password}
                  onChange={setP('password')}
                  required
                />
                <button
                  type="button"
                  className="affix-btn"
                  onClick={() => setRevealPassword((v) => !v)}
                >
                  {revealPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </Field>
          </>
        ) : null}

        {error ? <div className="signin-err">{error.message}</div> : null}

        <ModalActions
          onCancel={onClose}
          submitLabel={editing ? 'Save changes' : 'Create school and principal'}
          busy={busy}
          disabled={!canSubmit}
        />
      </form>
    </Modal>
  )
}

export default function Schools({ active, onOpenDetail, onToast }) {
  const [region, setRegion] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [formFor, setFormFor] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const removal = useAction()

  const schools = useResource(
    () => listSchools({ region, status, page, limit: PAGE_SIZE }),
    [region, status, page],
    { enabled: active },
  )
  const curricula = useResource(() => listCurricula(), [], { enabled: active })

  const rows = schools.data?.data ?? []
  const total = schools.data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <section className={'view' + (active ? ' active' : '')} id="view-schools">
      <div className="toolbar">
        <select className="filter" value={region} onChange={(e) => { setRegion(e.target.value); setPage(1) }}>
          <option value="all">Region: All</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="filter" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="all">Status: All</option>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <span className="sp" />
        <span className="count">{total} school{total === 1 ? '' : 's'}</span>
        <button className="btnP" onClick={() => setFormFor({ school: null })}>
          <IconPlus />
          Add school
        </button>
      </div>

      {schools.error ? <ErrorState error={schools.error} onRetry={schools.reload} /> : (
        <div className="panel" style={{ padding: '6px 8px' }}>
          <table>
            <thead>
              <tr>
                <th>School</th><th>Region</th><th>Curriculum</th><th>Term</th>
                <th>AI cap used</th><th>Status</th><th>Last sync</th><th />
              </tr>
            </thead>
            {schools.loading && !schools.data ? <TableSkeleton rows={6} cols={7} /> : (
              <tbody>
                {rows.map((s) => {
                  const curriculum = (curricula.data || []).find((c) => c.id === s.curriculumVersionId)
                  return (
                  <tr key={s.id}>
                    <td className="strong">{s.name}</td>
                    <td>{s.region || '-'}</td>
                    <td>
                      {curriculum
                        ? <span className="badge b-blue">{curriculum.name} v{curriculum.version}</span>
                        : <span className="fm">Not assigned</span>}
                    </td>
                    <td>{s.currentTerm ? `${s.currentTerm} · ${s.academicYear || ''}` : '-'}</td>
                    <td>
                      <span className="cbar">
                        <i style={{
                          width: `${Math.min(100, s.aiCapUsedPercent ?? 0)}%`,
                          background: coverageColor(100 - (s.aiCapUsedPercent ?? 0)),
                        }} />
                      </span>
                      {s.aiCapUsedPercent ?? 0}%
                    </td>
                    <td>
                      <span className={'badge ' + (s.status === 'active' ? 'b-green' : 'b-amber')}>
                        {humanize(s.status)}
                      </span>
                    </td>
                    <td>{fmtRelative(s.lastSyncAt)}</td>
                    <td>
                      <Actions>
                        <IconButton
                          label="View school"
                          icon={<IconEye />}
                          onClick={() => onOpenDetail({ detail: 'school', school: s, curriculum })}
                        />
                        <IconButton
                          label="Edit school"
                          icon={<IconPencil />}
                          onClick={() => setFormFor({ school: s })}
                        />
                        <IconButton
                          label="Delete school"
                          tone="danger"
                          icon={<IconTrash />}
                          onClick={() => setDeleting(s)}
                        />
                      </Actions>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            )}
          </table>
          {!schools.loading && rows.length === 0 ? (
            region === 'all' && status === 'all' ? (
              <EmptyState title="No schools yet" hint='Use "Add school" above to create the first one.' />
            ) : (
              <EmptyState title="No schools match these filters" hint="Try clearing the region or status filter." />
            )
          ) : null}
        </div>
      )}

      {pages > 1 ? (
        <div className="pager">
          <button className="btnO" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span>Page {page} of {pages}</span>
          <button className="btnO" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      ) : null}

      {formFor ? (
        <SchoolFormModal
          school={formFor.school}
          curricula={curricula.data}
          onClose={() => setFormFor(null)}
          onSaved={schools.reload}
          onToast={onToast}
        />
      ) : null}

      {deleting ? (
        <ConfirmModal
          title="Delete this school?"
          tone="danger"
          body={
            <>
              <strong>{deleting.name}</strong> will be removed permanently.
              Staff accounts at this school are kept but detached from it, so
              nobody loses their login. This cannot be undone.
              <br /><br />
              If the school still has classes or learners, deletion is refused
              and nothing changes.
            </>
          }
          confirmLabel="Delete school"
          busy={removal.busy}
          error={removal.error}
          onClose={() => { setDeleting(null); removal.clearError() }}
          onConfirm={async () => {
            const res = await removal.run(() => deleteSchool(deleting.id))
            if (res.ok) {
              const n = res.value?.detachedUsers ?? 0
              onToast(
                `${deleting.name} deleted` +
                (n ? `. ${n} account${n === 1 ? '' : 's'} detached` : ''),
              )
              setDeleting(null)
              schools.reload()
            }
          }}
        />
      ) : null}
    </section>
  )
}
