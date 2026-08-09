import { useState } from 'react'
import { useResource, useAction } from '../api/useResource.js'
import { listClasses, createClass, updateClass, listUsers } from '../api/endpoints.js'
import { ErrorState, EmptyState, TableSkeleton } from '../components/States.jsx'
import Modal, { ModalActions, Field } from '../components/Modal.jsx'
import IconButton, { Actions } from '../components/IconButton.jsx'
import { IconEye, IconPencil, IconPlus } from '../components/Icons.jsx'
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

export default function Classes({ active, schoolId, onOpenDetail, onToast }) {
  const [page, setPage] = useState(1)
  const [formFor, setFormFor] = useState(null)

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
    </section>
  )
}
