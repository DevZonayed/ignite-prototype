import { useState } from 'react'
import { useResource, useAction } from '../api/useResource.js'
import { listUsers, inviteUser, deleteUser, listClasses } from '../api/endpoints.js'
import { ErrorState, EmptyState, TableSkeleton } from '../components/States.jsx'
import Modal, { ModalActions, Field } from '../components/Modal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import IconButton, { Actions } from '../components/IconButton.jsx'
import { IconEye, IconPlus, IconTrash } from '../components/Icons.jsx'
import { fullName, humanize, statusBadge, fmtRelative } from '../lib/format.js'

const PAGE_SIZE = 20

function InviteModal({ role, schoolId, onClose, onInvited, onToast }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' })
  const { run, busy, error } = useAction()
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const body = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      role,
      schoolId,
    }
    if (form.phone.trim()) body.phone = form.phone.trim()
    const res = await run(() => inviteUser(body))
    if (res.ok) {
      onToast(`Invited ${fullName(res.value)} (code ${res.value.inviteCode})`)
      onInvited()
      onClose()
    }
  }

  const label = humanize(role)

  return (
    <Modal
      title={`Invite ${label.toLowerCase()}`}
      subtitle={`Added to your school with an invite code to activate`}
      onClose={onClose}
      busy={busy}
    >
      <form onSubmit={submit}>
        <div className="modal-grid">
          <Field label="First name" htmlFor="i-first">
            <input id="i-first" placeholder="Type first name" className="signin-input" value={form.firstName} onChange={set('firstName')} required />
          </Field>
          <Field label="Last name" htmlFor="i-last">
            <input id="i-last" placeholder="Type last name" className="signin-input" value={form.lastName} onChange={set('lastName')} required />
          </Field>
        </div>
        <Field label="Email" htmlFor="i-email">
          <input id="i-email" placeholder="Type email" className="signin-input" type="email" value={form.email} onChange={set('email')} required />
        </Field>
        <Field label="Phone" htmlFor="i-phone" hint="Optional.">
          <input id="i-phone" placeholder="Type phone" className="signin-input" value={form.phone} onChange={set('phone')} />
        </Field>
        {error ? <div className="signin-err">{error.message}</div> : null}
        <ModalActions
          onCancel={onClose}
          submitLabel={`Invite ${label.toLowerCase()}`}
          busy={busy}
          disabled={!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()}
        />
      </form>
    </Modal>
  )
}

/**
 * Shared people table. `role` decides which staff or learners are listed, and
 * everything is scoped to the signed-in principal's own school.
 */
export default function People({ active, role, schoolId, onOpenDetail, onToast }) {
  const [page, setPage] = useState(1)
  const [inviting, setInviting] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const removal = useAction()

  const people = useResource(
    () => listUsers({ role, schoolId, page, limit: PAGE_SIZE }),
    [role, schoolId, page],
    { enabled: active },
  )
  const classes = useResource(() => listClasses({ schoolId, limit: 100 }), [schoolId], { enabled: active })

  const rows = people.data?.data ?? []
  const total = people.data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const label = humanize(role).toLowerCase()

  // Only learners sit on a class register, so the column is theirs alone.
  const isLearnerList = role === 'learner'
  const classNameFor = (classId) =>
    (classes.data?.data ?? []).find((c) => c.id === classId)?.name || ''

  return (
    <section className={'view' + (active ? ' active' : '')}>
      <div className="toolbar">
        <span className="count">{total} {label}{total === 1 ? '' : 's'}</span>
        <span className="sp" />
        <button className="btnP" onClick={() => setInviting(true)}>
          <IconPlus />
          Invite {label}
        </button>
      </div>

      {people.error ? <ErrorState error={people.error} onRetry={people.reload} /> : (
        <div className="panel" style={{ padding: '6px 8px' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {isLearnerList ? <th>Class</th> : null}
                <th>Status</th>
                <th>Last active</th>
                <th />
              </tr>
            </thead>
            {people.loading && !people.data ? <TableSkeleton rows={6} cols={isLearnerList ? 6 : 5} /> : (
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td className="strong">{fullName(u)}</td>
                    <td>{u.email || '-'}</td>
                    {isLearnerList ? (
                      <td>
                        {classNameFor(u.classId) || (
                          <span className="fm">Not enrolled</span>
                        )}
                      </td>
                    ) : null}
                    <td><span className={'badge ' + statusBadge(u.status)}>{humanize(u.status)}</span></td>
                    <td>{fmtRelative(u.lastActiveAt || u.lastLoginAt)}</td>
                    <td>
                      <Actions>
                        <IconButton
                          label={`View ${label}`}
                          icon={<IconEye />}
                          onClick={() => onOpenDetail({
                            detail: 'user',
                            user: u,
                            classes: (classes.data?.data ?? []).filter((c) => c.teacherId === u.id),
                          })}
                        />
                        <IconButton
                          label={`Remove ${label}`}
                          tone="danger"
                          icon={<IconTrash />}
                          onClick={() => setDeleting(u)}
                        />
                      </Actions>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          {!people.loading && rows.length === 0 ? (
            <EmptyState
              title={`No ${label}s yet`}
              hint={`Use "Invite ${label}" above to add the first one.`}
            />
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

      {inviting ? (
        <InviteModal
          role={role}
          schoolId={schoolId}
          onClose={() => setInviting(false)}
          onInvited={people.reload}
          onToast={onToast}
        />
      ) : null}

      {deleting ? (
        <ConfirmModal
          title={`Remove this ${label}?`}
          tone="danger"
          body={
            <>
              <strong>{fullName(deleting)}</strong>
              {deleting.email ? ` (${deleting.email})` : ''} will be removed
              permanently. This cannot be undone.
              <br /><br />
              {deleting.status === 'invited' ? (
                <>
                  They never activated the invite, so their invite code stops
                  working and the account cannot be created from it.
                </>
              ) : (
                <>
                  Classes they lead are kept but become unassigned. If they have
                  already recorded lesson sessions or evidence, removal is
                  refused and nothing changes — suspend the account instead so
                  that history survives.
                </>
              )}
            </>
          }
          confirmLabel={`Remove ${label}`}
          busy={removal.busy}
          error={removal.error}
          onClose={() => { setDeleting(null); removal.clearError() }}
          onConfirm={async () => {
            const res = await removal.run(() => deleteUser(deleting.id))
            if (res.ok) {
              const n = res.value?.unassignedClasses ?? 0
              onToast(
                `${fullName(deleting)} removed` +
                (n ? `. ${n} class${n === 1 ? '' : 'es'} now unassigned` : ''),
              )
              setDeleting(null)
              people.reload()
              classes.reload()
            }
          }}
        />
      ) : null}
    </section>
  )
}
