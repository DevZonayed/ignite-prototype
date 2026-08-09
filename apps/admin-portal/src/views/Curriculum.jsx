import { useState } from 'react'
import { useResource, useAction } from '../api/useResource.js'
import {
  listCurricula, getCurriculum, getCoverage, createCurriculum,
  publishCurriculum, assignCurriculum, addUnit, updateUnit, deleteUnit,
  listSchools,
} from '../api/endpoints.js'
import { Loading, ErrorState, EmptyState } from '../components/States.jsx'
import Modal, { ModalActions, Field } from '../components/Modal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import IconButton, { Actions } from '../components/IconButton.jsx'
import { IconPencil, IconTrash, IconPlus } from '../components/Icons.jsx'
import { fmtDate, humanize, coverageColor } from '../lib/format.js'

/* ------------------------------------------------------------------ modals */

function NewVersionModal({ onClose, onCreated, onToast }) {
  const [name, setName] = useState('')
  const { run, busy, error } = useAction()

  async function submit(e) {
    e.preventDefault()
    const res = await run(() => createCurriculum(name.trim()))
    if (res.ok) {
      onToast(`${res.value.name} v${res.value.version} created as a draft`)
      onCreated(res.value.id)
      onClose()
    }
  }

  return (
    <Modal
      title="New curriculum version"
      subtitle="Starts as an editable draft. The version number is assigned automatically."
      onClose={onClose}
      busy={busy}
    >
      <form onSubmit={submit}>
        <Field label="Name" htmlFor="c-name">
          <input
            id="c-name"
            className="signin-input"
            placeholder="Type name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>
        {error ? <div className="signin-err">{error.message}</div> : null}
        <ModalActions onCancel={onClose} submitLabel="Create draft" busy={busy} disabled={!name.trim()} />
      </form>
    </Modal>
  )
}

function UnitModal({ curriculumId, unit, nextOrder, onClose, onSaved, onToast }) {
  const editing = !!unit
  const initial = { title: unit?.title || '', order: unit?.order ?? nextOrder }
  const [form, setForm] = useState(initial)
  const { run, busy, error } = useAction()

  async function submit(e) {
    e.preventDefault()
    const body = { title: form.title.trim(), order: Number(form.order) }
    const res = await run(() =>
      editing ? updateUnit(curriculumId, unit.id, body) : addUnit(curriculumId, body))
    if (res.ok) {
      onToast(editing ? 'Unit updated' : 'Unit added')
      onSaved()
      onClose()
    }
  }

  const dirty = editing
    ? form.title !== initial.title || Number(form.order) !== Number(initial.order)
    : !!form.title.trim()

  return (
    <Modal
      title={editing ? 'Edit unit' : 'Add unit'}
      subtitle={editing ? unit.title : 'Units group the lessons teachers deliver'}
      onClose={onClose}
      busy={busy}
    >
      <form onSubmit={submit}>
        <Field label="Title" htmlFor="u-title">
          <input
            id="u-title"
            className="signin-input"
            placeholder="Type title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </Field>
        <Field label="Order" htmlFor="u-order" hint="Position in the sequence, starting at 1.">
          <input
            id="u-order"
          placeholder="Type order"
            className="signin-input"
            type="number"
            min="1"
            value={form.order}
            onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
            required
          />
        </Field>
        {error ? <div className="signin-err">{error.message}</div> : null}
        <ModalActions
          onCancel={onClose}
          submitLabel={editing ? 'Save unit' : 'Add unit'}
          busy={busy}
          disabled={!dirty}
        />
      </form>
    </Modal>
  )
}

function AssignModal({ curriculum, schools, onClose, onAssigned, onToast }) {
  const [selected, setSelected] = useState(
    () => new Set(schools.filter((s) => s.curriculumVersionId === curriculum.id).map((s) => s.id)),
  )
  const { run, busy, error } = useAction()

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function submit(e) {
    e.preventDefault()
    const res = await run(() => assignCurriculum(curriculum.id, Array.from(selected)))
    if (res.ok) {
      onToast(`Assigned to ${selected.size} school${selected.size === 1 ? '' : 's'}`)
      onAssigned()
      onClose()
    }
  }

  return (
    <Modal
      title="Assign to schools"
      subtitle={`${curriculum.name} v${curriculum.version}`}
      onClose={onClose}
      busy={busy}
    >
      <form onSubmit={submit}>
        {schools.length === 0 ? (
          <EmptyState title="No schools yet" hint="Create a school before assigning a curriculum." />
        ) : (
          <div className="check-list">
            {schools.map((s) => (
              <label className="check-row" key={s.id}>
                <input
                  type="checkbox"
                  checked={selected.has(s.id)}
                  onChange={() => toggle(s.id)}
                />
                <span className="check-main">
                  <span className="strong">{s.name}</span>
                  <span className="fm">{s.region || 'No region'}</span>
                </span>
                {s.curriculumVersionId && s.curriculumVersionId !== curriculum.id ? (
                  <span className="badge b-grey">on another version</span>
                ) : null}
              </label>
            ))}
          </div>
        )}
        {error ? <div className="signin-err">{error.message}</div> : null}
        <ModalActions
          onCancel={onClose}
          submitLabel={`Assign to ${selected.size} school${selected.size === 1 ? '' : 's'}`}
          busy={busy}
          disabled={schools.length === 0}
        />
      </form>
    </Modal>
  )
}

/* -------------------------------------------------------------------- view */

export default function Curriculum({ active, onToast }) {
  const [selectedId, setSelectedId] = useState(null)
  const [newVersion, setNewVersion] = useState(false)
  const [unitModal, setUnitModal] = useState(null)   // { unit } | { unit: null }
  const [confirm, setConfirm] = useState(null)       // { kind, unit? }
  const [assigning, setAssigning] = useState(false)

  const curricula = useResource(() => listCurricula(), [], { enabled: active })
  const list = curricula.data ?? []
  const currentId = selectedId ?? list[0]?.id ?? null

  const detail = useResource(() => getCurriculum(currentId), [currentId], {
    enabled: active && !!currentId,
  })
  const coverage = useResource(() => getCoverage(), [], { enabled: active })
  const schools = useResource(() => listSchools({ limit: 100 }), [], { enabled: active })

  const publish = useAction()
  const removeUnit = useAction()

  const current = detail.data
  const units = current?.units ?? []
  const locked = !!current?.isImmutable
  const published = current?.status === 'published'
  const schoolList = schools.data?.data ?? []
  const usingThis = schoolList.filter((s) => s.curriculumVersionId === current?.id)
  const totalLessons = units.reduce((n, u) => n + (u.lessons?.length ?? 0), 0)

  async function doPublish() {
    const res = await publish.run(() => publishCurriculum(current.id))
    if (res.ok) {
      onToast(`${current.name} v${current.version} published`)
      curricula.reload()
      detail.reload()
      setConfirm(null)
    }
  }

  async function doDeleteUnit(unit) {
    const res = await removeUnit.run(() => deleteUnit(current.id, unit.id))
    if (res.ok) {
      onToast('Unit deleted')
      detail.reload()
      setConfirm(null)
    }
  }

  return (
    <section className={'view' + (active ? ' active' : '')} id="view-curriculum">
      <div className="toolbar">
        <select
          className="filter"
          value={currentId ?? ''}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={list.length === 0}
        >
          {list.length === 0 ? <option value="">No curriculum</option> : null}
          {list.map((c) => (
            <option key={c.id} value={c.id}>{c.name} v{c.version} ({c.status})</option>
          ))}
        </select>

        {current ? (
          <span className={'badge ' + (published ? 'b-green' : 'b-amber')}>
            {humanize(current.status)}
          </span>
        ) : null}
        {locked ? <span className="badge b-grey">locked</span> : null}

        <span className="sp" />

        {current && !published ? (
          <button className="btnO" onClick={() => setConfirm({ kind: 'publish' })}>
            Publish version
          </button>
        ) : null}
        {current && published ? (
          <button className="btnO" onClick={() => setAssigning(true)}>
            Assign to schools
          </button>
        ) : null}
        <button className="btnP" onClick={() => setNewVersion(true)}>
          <IconPlus />
          New version
        </button>
      </div>

      {curricula.loading && !curricula.data ? <Loading label="Loading curricula…" /> : null}
      {curricula.error ? <ErrorState error={curricula.error} onRetry={curricula.reload} /> : null}
      {curricula.data && list.length === 0 ? (
        <EmptyState
          title="No curriculum versions yet"
          hint='Use "New version" above to create the first draft.'
        />
      ) : null}

      {list.length > 0 ? (
        <>
          <div className="tiles">
            <div className="tile">
              <div className="th"><span className="tl">Units</span></div>
              <div className="tn">{units.length}</div>
              <div className="tf">{totalLessons} lesson{totalLessons === 1 ? '' : 's'} in total</div>
            </div>
            <div className="tile">
              <div className="th"><span className="tl">Schools using this</span></div>
              <div className="tn">{usingThis.length}</div>
              <div className="tf">{published ? 'assignable' : 'publish before assigning'}</div>
            </div>
            <div className="tile">
              <div className="th"><span className="tl">Status</span></div>
              <div className="tn" style={{ fontSize: 22 }}>
                <span className={'badge ' + (published ? 'b-green' : 'b-amber')}>
                  {humanize(current?.status)}
                </span>
              </div>
              <div className="tf">
                {current?.publishedAt ? `published ${fmtDate(current.publishedAt)}` : 'not published yet'}
              </div>
            </div>
            <div className="tile">
              <div className="th"><span className="tl">Editable</span></div>
              <div className="tn" style={{ fontSize: 22 }}>
                <span className={'badge ' + (locked ? 'b-grey' : 'b-green')}>
                  {locked ? 'Locked' : 'Draft'}
                </span>
              </div>
              <div className="tf">{locked ? 'published versions cannot change' : 'units can be edited'}</div>
            </div>
          </div>

          <div className="grid2">
            {/* ---------------- units ---------------- */}
            <div className="panel">
              <div className="ph">
                <h3>Units</h3>
                {!locked ? (
                  <span
                    className="link"
                    onClick={() => setUnitModal({ unit: null })}
                  >
                    + Add unit
                  </span>
                ) : null}
              </div>

              {locked ? (
                <div className="note-strip">
                  This version is published and immutable. Create a new version to change its units.
                </div>
              ) : null}

              {detail.loading && !detail.data ? <Loading /> : null}
              {detail.error ? <ErrorState error={detail.error} onRetry={detail.reload} /> : null}
              {detail.data && units.length === 0 ? (
                <EmptyState
                  title="No units in this version"
                  hint={locked ? undefined : 'Add the first unit to start building the sequence.'}
                />
              ) : null}

              {units.length > 0 ? (
                <div className="tree">
                  {units.map((u) => (
                    <div className="tnode" key={u.id}>
                      <div className="tnum">{u.order}</div>
                      <div style={{ flex: 1 }}>
                        <div className="strong">{u.title}</div>
                        <div className="fm">
                          {(u.lessons?.length ?? 0)} lesson{(u.lessons?.length ?? 0) === 1 ? '' : 's'}
                          {u.status ? ` · ${humanize(u.status)}` : ''}
                        </div>
                        {u.lessons?.length ? (
                          <div className="lesson-chips">
                            {u.lessons.map((l) => (
                              <span className="chip" key={l.id}>{l.title}</span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      {!locked ? (
                        <Actions>
                          <IconButton
                            label="Edit unit"
                            icon={<IconPencil />}
                            onClick={() => setUnitModal({ unit: u })}
                          />
                          <IconButton
                            label="Delete unit"
                            tone="danger"
                            icon={<IconTrash />}
                            onClick={() => setConfirm({ kind: 'unit', unit: u })}
                          />
                        </Actions>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* ---------------- where this curriculum is used ---------------- */}
            <div className="panel">
              <div className="ph">
                <h3>Schools on this version</h3>
                <span className="link" onClick={schools.reload}>Refresh</span>
              </div>
              {schools.loading && !schools.data ? <Loading /> : null}
              {schools.error ? <ErrorState error={schools.error} onRetry={schools.reload} /> : null}
              {schools.data && usingThis.length === 0 ? (
                <EmptyState
                  title="Not assigned to any school"
                  hint={published
                    ? 'Use "Assign to schools" above to roll it out.'
                    : 'Publish this version before assigning it.'}
                />
              ) : null}
              {usingThis.length > 0 ? (
                <table>
                  <thead><tr><th>School</th><th>Region</th><th>Term</th></tr></thead>
                  <tbody>
                    {usingThis.map((s) => (
                      <tr key={s.id}>
                        <td className="strong">{s.name}</td>
                        <td>{s.region || '-'}</td>
                        <td>{s.currentTerm || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}

              <div className="ph" style={{ marginTop: 18 }}>
                <h3>Coverage by class</h3>
                <span className="link" onClick={coverage.reload}>Refresh</span>
              </div>
              {coverage.loading && !coverage.data ? <Loading /> : null}
              {coverage.error ? <ErrorState error={coverage.error} onRetry={coverage.reload} /> : null}
              {coverage.data && coverage.data.length === 0 ? (
                <EmptyState
                  title="No coverage recorded yet"
                  hint="Coverage appears once teachers deliver lessons."
                />
              ) : null}
              {coverage.data && coverage.data.length > 0 ? (
                <table>
                  <thead><tr><th>Class</th><th>Delivered</th><th>Coverage</th></tr></thead>
                  <tbody>
                    {coverage.data.map((c) => (
                      <tr key={c.classId}>
                        <td className="strong">{c.className}</td>
                        <td>{c.deliveredLessons}/{c.totalLessons}</td>
                        <td>
                          <span className="cbar">
                            <i style={{ width: `${c.coveragePercent}%`, background: coverageColor(c.coveragePercent) }} />
                          </span>
                          {c.coveragePercent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      {newVersion ? (
        <NewVersionModal
          onClose={() => setNewVersion(false)}
          onCreated={(id) => { curricula.reload(); setSelectedId(id) }}
          onToast={onToast}
        />
      ) : null}

      {unitModal && current ? (
        <UnitModal
          curriculumId={current.id}
          unit={unitModal.unit}
          nextOrder={units.length + 1}
          onClose={() => setUnitModal(null)}
          onSaved={detail.reload}
          onToast={onToast}
        />
      ) : null}

      {assigning && current ? (
        <AssignModal
          curriculum={current}
          schools={schoolList}
          onClose={() => setAssigning(false)}
          onAssigned={schools.reload}
          onToast={onToast}
        />
      ) : null}

      {confirm?.kind === 'publish' && current ? (
        <ConfirmModal
          title="Publish this version?"
          body={`Publishing ${current.name} v${current.version} locks it permanently. Its ${units.length} unit${units.length === 1 ? '' : 's'} can never be edited again, and it becomes assignable to schools. To make further changes you would create a new version.`}
          confirmLabel="Publish and lock"
          busy={publish.busy}
          error={publish.error}
          onConfirm={doPublish}
          onClose={() => setConfirm(null)}
        />
      ) : null}

      {confirm?.kind === 'unit' ? (
        <ConfirmModal
          title="Delete this unit?"
          tone="danger"
          body={`"${confirm.unit.title}" and its place in the sequence will be removed. This cannot be undone.`}
          confirmLabel="Delete unit"
          busy={removeUnit.busy}
          error={removeUnit.error}
          onConfirm={() => doDeleteUnit(confirm.unit)}
          onClose={() => setConfirm(null)}
        />
      ) : null}
    </section>
  )
}
