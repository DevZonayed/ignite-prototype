import { useState } from 'react'
import { useResource, useAction } from '../api/useResource.js'
import { listUsers, listSchools, inviteUser, updateUser, updateUserStatus, deleteUser } from '../api/endpoints.js'
import { ErrorState, EmptyState, TableSkeleton } from '../components/States.jsx'
import Modal, { ModalActions, Field } from '../components/Modal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import IconButton, { Actions } from '../components/IconButton.jsx'
import { IconEye, IconPencil, IconUserOff, IconUserCheck, IconPlus, IconTrash } from '../components/Icons.jsx'
import { fullName, humanize, statusBadge, roleBadge, fmtRelative } from '../lib/format.js'

const ROLES = ['platform_admin', 'curriculum_admin', 'principal', 'teacher', 'learner', 'parent']
const PAGE_SIZE = 20

const EMPTY_USER = { firstName: '', lastName: '', email: '', phone: '', role: 'teacher', schoolId: '' }

/**
 * One form for both invite and edit. `user` null means invite.
 * Only fields the admin actually changed are sent on edit, so an untouched
 * form cannot accidentally clear a value.
 */
function UserFormModal({ user, schools, onClose, onSaved, onToast }) {
  const editing = !!user
  const initial = editing
    ? {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role,
        schoolId: user.schoolId || '',
      }
    : EMPTY_USER

  const [form, setForm] = useState(initial)
  const { run, busy, error } = useAction()
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const changed = Object.keys(initial).filter((k) => form[k] !== initial[k])

  async function submit(e) {
    e.preventDefault()

    if (editing) {
      const body = {}
      changed.forEach((k) => {
        // schoolId cleared in the UI means "no school"; the API validates it as
        // a UUID, so an empty string must not be sent.
        if (k === 'schoolId' && !form[k]) return
        if (k === 'phone' && !form[k]) return
        body[k] = form[k]
      })
      const res = await run(() => updateUser(user.id, body))
      if (res.ok) {
        onToast(`${fullName(res.value)} updated`)
        onSaved()
        onClose()
      }
      return
    }

    const body = { firstName: form.firstName, lastName: form.lastName, email: form.email, role: form.role }
    if (form.phone) body.phone = form.phone
    if (form.schoolId) body.schoolId = form.schoolId
    const res = await run(() => inviteUser(body))
    if (res.ok) {
      onToast(`Invited ${fullName(res.value)} (code ${res.value.inviteCode})`)
      onSaved()
      onClose()
    }
  }

  const canSubmit = editing
    ? changed.length > 0
    : form.firstName.trim() && form.lastName.trim() && form.email.trim()

  return (
    <Modal
      title={editing ? 'Edit user' : 'Invite user'}
      subtitle={editing ? user.email : 'They receive an invite code to activate the account'}
      onClose={onClose}
      busy={busy}
    >
      <form onSubmit={submit}>
        <div className="modal-grid">
          <Field label="First name" htmlFor="u-first">
            <input id="u-first" placeholder="Type first name" className="signin-input" value={form.firstName} onChange={set('firstName')} required />
          </Field>
          <Field label="Last name" htmlFor="u-last">
            <input id="u-last" placeholder="Type last name" className="signin-input" value={form.lastName} onChange={set('lastName')} required />
          </Field>
        </div>

        <Field label="Email" htmlFor="u-email">
          <input id="u-email" placeholder="Type email" className="signin-input" type="email" value={form.email} onChange={set('email')} required />
        </Field>

        <Field label="Phone" htmlFor="u-phone" hint="Optional.">
          <input id="u-phone" placeholder="Type phone" className="signin-input" value={form.phone} onChange={set('phone')} />
        </Field>

        <div className="modal-grid">
          <Field label="Role" htmlFor="u-role">
            <select id="u-role" className="signin-input" value={form.role} onChange={set('role')}>
              {ROLES.map((r) => <option key={r} value={r}>{humanize(r)}</option>)}
            </select>
          </Field>
          <Field label="School" htmlFor="u-school">
            <select id="u-school" className="signin-input" value={form.schoolId} onChange={set('schoolId')}>
              <option value="">{schools?.length ? 'No school' : 'No schools yet'}</option>
              {(schools || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
        </div>

        {error ? <div className="signin-err">{error.message}</div> : null}

        <ModalActions
          onCancel={onClose}
          submitLabel={editing ? 'Save changes' : 'Send invite'}
          busy={busy}
          disabled={!canSubmit}
        />
      </form>
    </Modal>
  )
}

export default function Users({ active, onOpenDetail, onToast }) {
  const [role, setRole] = useState('all')
  const [schoolId, setSchoolId] = useState('all')
  const [page, setPage] = useState(1)
  // null = closed, { user: null } = invite, { user } = edit
  const [formFor, setFormFor] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const removal = useAction()

  const schools = useResource(() => listSchools({ limit: 100 }), [], { enabled: active })
  const users = useResource(
    () => listUsers({ role, schoolId, page, limit: PAGE_SIZE }),
    [role, schoolId, page],
    { enabled: active },
  )
  const statusAction = useAction()

  async function toggleStatus(u) {
    const next = u.status === 'active' ? 'suspended' : 'active'
    const res = await statusAction.run(() => updateUserStatus(u.id, next))
    if (res.ok) {
      onToast(`${fullName(u)} is now ${next}`)
      users.reload()
    } else {
      onToast(res.error.message)
    }
  }

  const rows = users.data?.data ?? []
  const total = users.data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const schoolList = schools.data?.data ?? []

  return (
    <section className={'view' + (active ? ' active' : '')} id="view-users">
      <div className="toolbar">
        <select className="filter" value={role} onChange={(e) => { setRole(e.target.value); setPage(1) }}>
          <option value="all">Role: All</option>
          {ROLES.map((r) => <option key={r} value={r}>{humanize(r)}</option>)}
        </select>
        <select className="filter" value={schoolId} onChange={(e) => { setSchoolId(e.target.value); setPage(1) }}>
          <option value="all">School: All</option>
          {schoolList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <span className="sp" />
        <span className="count">{total} user{total === 1 ? '' : 's'}</span>
        <button className="btnP" onClick={() => setFormFor({ user: null })}>
          <IconPlus />
          Invite user
        </button>
      </div>

      {users.error ? <ErrorState error={users.error} onRetry={users.reload} /> : (
        <div className="panel" style={{ padding: '6px 8px' }}>
          <table>
            <thead>
              <tr><th>Name</th><th>Role</th><th>School</th><th>Status</th><th>Last active</th><th /></tr>
            </thead>
            {users.loading && !users.data ? (
              <TableSkeleton rows={6} cols={6} />
            ) : (
              <tbody>
                {rows.map((u) => {
                  const school = schoolList.find((s) => s.id === u.schoolId)
                  return (
                    <tr key={u.id}>
                      <td className="strong">{fullName(u)}</td>
                      <td><span className={'badge ' + roleBadge(u.role)}>{humanize(u.role)}</span></td>
                      <td>{school ? school.name : '-'}</td>
                      <td><span className={'badge ' + statusBadge(u.status)}>{humanize(u.status)}</span></td>
                      <td>{fmtRelative(u.lastActiveAt || u.lastLoginAt)}</td>
                      <td>
                        <Actions>
                          <IconButton
                            label="View user"
                            icon={<IconEye />}
                            onClick={() => onOpenDetail({ detail: 'user', user: u, schoolName: school?.name })}
                          />
                          <IconButton
                            label="Edit user"
                            icon={<IconPencil />}
                            onClick={() => setFormFor({ user: u })}
                          />
                          <IconButton
                            label={u.status === 'active' ? 'Suspend account' : 'Activate account'}
                            tone={u.status === 'active' ? 'danger' : 'default'}
                            icon={u.status === 'active' ? <IconUserOff /> : <IconUserCheck />}
                            busy={statusAction.busy}
                            onClick={() => toggleStatus(u)}
                          />
                          <IconButton
                            label="Delete user"
                            tone="danger"
                            icon={<IconTrash />}
                            onClick={() => setDeleting(u)}
                          />
                        </Actions>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>

          {!users.loading && rows.length === 0 ? (
            role === 'all' && schoolId === 'all' ? (
              <EmptyState title="No users yet" hint='Use "Invite user" above to add the first one.' />
            ) : (
              <EmptyState title="No users match these filters" hint="Try clearing the role or school filter." />
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
        <UserFormModal
          user={formFor.user}
          schools={schoolList}
          onClose={() => setFormFor(null)}
          onSaved={users.reload}
          onToast={onToast}
        />
      ) : null}

      {deleting ? (
        <ConfirmModal
          title="Delete this user?"
          tone="danger"
          body={
            <>
              <strong>{fullName(deleting)}</strong>
              {deleting.email ? ` (${deleting.email})` : ''} will be removed
              permanently. This cannot be undone.
              <br /><br />
              {deleting.status === 'invited' ? (
                <>
                  The invite was never activated, so their invite code stops
                  working and no account can be created from it.
                </>
              ) : (
                <>
                  Classes they lead are kept but become unassigned. If they have
                  already recorded lesson sessions or evidence, deletion is
                  refused and nothing changes — suspend the account instead so
                  that history survives.
                </>
              )}
            </>
          }
          confirmLabel="Delete user"
          busy={removal.busy}
          error={removal.error}
          onClose={() => { setDeleting(null); removal.clearError() }}
          onConfirm={async () => {
            const res = await removal.run(() => deleteUser(deleting.id))
            if (res.ok) {
              const n = res.value?.unassignedClasses ?? 0
              onToast(
                `${fullName(deleting)} deleted` +
                (n ? `. ${n} class${n === 1 ? '' : 'es'} now unassigned` : ''),
              )
              setDeleting(null)
              users.reload()
            }
          }}
        />
      ) : null}
    </section>
  )
}
