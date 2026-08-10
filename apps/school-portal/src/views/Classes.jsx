import { useState } from 'react'
import { useResource, useAction } from '../api/useResource.js'
import {
  listClasses,
  createClass,
  updateClass,
  listUsers,
  getClassLearners,
  getEnrollableLearners,
  enrolLearners,
  unenrolLearner,
} from '../api/endpoints.js'
import { ErrorState, EmptyState, TableSkeleton, Loading } from '../components/States.jsx'
import Modal, { ModalActions, Field } from '../components/Modal.jsx'
import IconButton, { Actions } from '../components/IconButton.jsx'
import { IconEye, IconPencil, IconPlus, IconUserCheck, IconTrash } from '../components/Icons.jsx'
import { fullName, coverageColor } from '../lib/format.js'

const PAGE_SIZE = 20

function ClassFormModal({ cls, schoolId, teachers, onClose, onSaved, onToast }) {
  const editing = !!cls
  const initial = {
    name: cls?.name || '',
    gradeLevel: cls?.gradeLevel || '',
    subject: cls?.subject || 'Digital Innovation',
    teacherId: cls?.teacherId || '',
  }
  const [form, setForm] = useState(initial)
  const { run, busy, error } = useAction()
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const changed = Object.keys(initial).filter((k) => form[k] !== initial[k])

  async function submit(e) {
    e.preventDefault()
    const keys = editing ? changed : Object.keys(form)
    const body = {}
    keys.forEach((k) => {
      // teacherId is UUID-validated, so an empty pick must be omitted.
      if (!form[k] && k !== 'name') return
      body[k] = form[k]
    })
    if (!editing) {
      body.name = form.name.trim()
      body.schoolId = schoolId
    }

    const res = await run(() => (editing ? updateClass(cls.id, body) : createClass(body)))
    if (res.ok) {
      onToast(editing ? `${res.value.name} updated` : `${res.value.name} created`)
      onSaved()
      onClose()
    }
  }

  return (
    <Modal
      title={editing ? 'Edit class' : 'Add class'}
      subtitle={editing ? cls.name : 'Classes group learners for lessons and attendance'}
      onClose={onClose}
      busy={busy}
    >
      <form onSubmit={submit}>
        <Field label="Class name" htmlFor="c-name">
          <input id="c-name" className="signin-input" placeholder="Type class name" value={form.name} onChange={set('name')} required />
        </Field>
        <div className="modal-grid">
          <Field label="Grade level" htmlFor="c-grade">
            <input id="c-grade" className="signin-input" placeholder="Type grade level" value={form.gradeLevel} onChange={set('gradeLevel')} />
          </Field>
          <Field label="Subject" htmlFor="c-subject">
            <input id="c-subject" placeholder="Type subject" className="signin-input" value={form.subject} onChange={set('subject')} />
          </Field>
        </div>
        <Field
          label="Class teacher"
          htmlFor="c-teacher"
          hint={teachers.length ? undefined : 'Invite a teacher first to assign one.'}
        >
          <select id="c-teacher" className="signin-input" value={form.teacherId} onChange={set('teacherId')}>
            <option value="">{teachers.length ? 'Unassigned' : 'No teachers yet'}</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{fullName(t)}</option>)}
          </select>
        </Field>
        {error ? <div className="signin-err">{error.message}</div> : null}
        <ModalActions
          onCancel={onClose}
          submitLabel={editing ? 'Save changes' : 'Create class'}
          busy={busy}
          disabled={editing ? changed.length === 0 : !form.name.trim()}
        />
      </form>
    </Modal>
  )
}

/**
 * The class register.
 *
 * Enrolment is what makes a class more than a label: attendance, homework
 * compliance and every class-scoped report read this list. A learner sits on
 * exactly one register, so adding them here moves them off any other.
 */
function RosterModal({ cls, onClose, onChanged, onToast }) {
  const [picked, setPicked] = useState([])
  const enrolled = useResource(() => getClassLearners(cls.id), [cls.id])
  const available = useResource(() => getEnrollableLearners(cls.id), [cls.id])
  const add = useAction()
  const remove = useAction()

  const enrolledRows = enrolled.data ?? []
  const availableRows = available.data ?? []

  function refresh() {
    enrolled.reload()
    available.reload()
    onChanged()
  }

  function toggle(id) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }

  async function enrol() {
    const res = await add.run(() => enrolLearners(cls.id, picked))
    if (res.ok) {
      onToast(`${picked.length} learner${picked.length === 1 ? '' : 's'} enrolled`)
      setPicked([])
      refresh()
    }
  }

  async function drop(learner) {
    const res = await remove.run(() => unenrolLearner(cls.id, learner.id))
    if (res.ok) {
      onToast(`${fullName(learner)} removed from ${cls.name}`)
      refresh()
    }
  }

  const busy = add.busy || remove.busy

  return (
    <Modal
      title="Class register"
      subtitle={`${cls.name}${cls.gradeLevel ? ` · ${cls.gradeLevel}` : ''}`}
      onClose={onClose}
      busy={busy}
    >
      <div className="modal-section-title">Enrolled ({enrolledRows.length})</div>
      {enrolled.error ? <ErrorState error={enrolled.error} onRetry={enrolled.reload} /> : null}
      {enrolled.loading && !enrolled.data ? <Loading variant="list" rows={3} /> : null}
      {!enrolled.loading && enrolledRows.length === 0 ? (
        <EmptyState title="Nobody on this register yet" hint="Add learners from the list below." />
      ) : (
        <ul className="rosterlist">
          {enrolledRows.map((l) => (
            <li key={l.id}>
              <span>{fullName(l)}</span>
              <span className="fm">{l.email || '-'}</span>
              <IconButton
                label={`Remove ${fullName(l)}`}
                tone="danger"
                icon={<IconTrash />}
                disabled={busy}
                onClick={() => drop(l)}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="modal-section-title" style={{ marginTop: 18 }}>
        Available learners ({availableRows.length})
      </div>
      <div className="modal-section-note">
        Learners at this school who are not on any register yet.
      </div>
      {available.error ? <ErrorState error={available.error} onRetry={available.reload} /> : null}
      {available.loading && !available.data ? <Loading variant="list" rows={3} /> : null}
      {!available.loading && availableRows.length === 0 ? (
        <EmptyState
          title="No unassigned learners"
          hint="Every learner at this school is already on a register."
        />
      ) : (
        <ul className="rosterlist">
          {availableRows.map((l) => (
            <li key={l.id}>
              <label className="rosterpick">
                <input
                  type="checkbox"
                  checked={picked.includes(l.id)}
                  onChange={() => toggle(l.id)}
                  disabled={busy}
                />
                <span>{fullName(l)}</span>
              </label>
              <span className="fm">{l.email || '-'}</span>
            </li>
          ))}
        </ul>
      )}

      {add.error ? <div className="signin-err">{add.error.message}</div> : null}
      {remove.error ? <div className="signin-err">{remove.error.message}</div> : null}

      <div className="rosterbar">
        <button type="button" className="btnO" onClick={onClose} disabled={busy}>Done</button>
        <button
          type="button"
          className="btnP"
          onClick={enrol}
          disabled={busy || picked.length === 0}
        >
          {add.busy ? 'Enrolling…' : `Enrol ${picked.length || ''}`.trim()}
        </button>
      </div>
    </Modal>
  )
}

export default function Classes({ active, schoolId, onOpenDetail, onToast }) {
  const [page, setPage] = useState(1)
  const [formFor, setFormFor] = useState(null)
  const [rosterFor, setRosterFor] = useState(null)

  const classes = useResource(
    () => listClasses({ schoolId, page, limit: PAGE_SIZE }),
    [schoolId, page],
    { enabled: active },
  )
  const teachers = useResource(
    () => listUsers({ role: 'teacher', schoolId, limit: 100 }),
    [schoolId],
    { enabled: active },
  )

  const rows = classes.data?.data ?? []
  const total = classes.data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const teacherList = teachers.data?.data ?? []

  return (
    <section className={'view' + (active ? ' active' : '')}>
      <div className="toolbar">
        <span className="count">{total} class{total === 1 ? '' : 'es'}</span>
        <span className="sp" />
        <button className="btnP" onClick={() => setFormFor({ cls: null })}>
          <IconPlus />
          Add class
        </button>
      </div>

      {classes.error ? <ErrorState error={classes.error} onRetry={classes.reload} /> : (
        <div className="panel" style={{ padding: '6px 8px' }}>
          <table>
            <thead>
              <tr><th>Class</th><th>Grade</th><th>Teacher</th><th>Learners</th><th>Coverage</th><th /></tr>
            </thead>
            {classes.loading && !classes.data ? <TableSkeleton rows={5} cols={6} /> : (
              <tbody>
                {rows.map((c) => {
                  const teacher = teacherList.find((t) => t.id === c.teacherId)
                  return (
                    <tr key={c.id}>
                      <td className="strong">{c.name}</td>
                      <td>{c.gradeLevel || '-'}</td>
                      <td>{teacher ? fullName(teacher) : <span className="fm">Unassigned</span>}</td>
                      <td>{c.learnerCount ?? 0}</td>
                      <td>
                        <span className="cbar">
                          <i style={{
                            width: `${c.curriculumCoveragePercent ?? 0}%`,
                            background: coverageColor(c.curriculumCoveragePercent ?? 0),
                          }} />
                        </span>
                        {c.curriculumCoveragePercent ?? 0}%
                      </td>
                      <td>
                        <Actions>
                          <IconButton
                            label="View class"
                            icon={<IconEye />}
                            onClick={() => onOpenDetail({ detail: 'class', cls: c, teacher })}
                          />
                          <IconButton
                            label="Manage register"
                            icon={<IconUserCheck />}
                            onClick={() => setRosterFor(c)}
                          />
                          <IconButton
                            label="Edit class"
                            icon={<IconPencil />}
                            onClick={() => setFormFor({ cls: c })}
                          />
                        </Actions>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
          {!classes.loading && rows.length === 0 ? (
            <EmptyState title="No classes yet" hint='Use "Add class" above to create the first one.' />
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
        <ClassFormModal
          cls={formFor.cls}
          schoolId={schoolId}
          teachers={teacherList}
          onClose={() => setFormFor(null)}
          onSaved={classes.reload}
          onToast={onToast}
        />
      ) : null}

      {rosterFor ? (
        <RosterModal
          cls={rosterFor}
          onClose={() => setRosterFor(null)}
          onChanged={classes.reload}
          onToast={onToast}
        />
      ) : null}
    </section>
  )
}
