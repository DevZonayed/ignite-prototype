import { useState } from 'react'
import { useResource, useAction } from '../api/useResource.js'
import { listSchoolReports, createSchoolReport } from '../api/endpoints.js'
import { API_BASE_URL, getToken } from '../api/client.js'
import { Loading, ErrorState, EmptyState } from '../components/States.jsx'
import Modal, { ModalActions, Field } from '../components/Modal.jsx'
import { IconPlus } from '../components/Icons.jsx'
import { fmtDateTime, humanize } from '../lib/format.js'

const TYPES = [
  { value: 'coverage_summary', label: 'Coverage summary' },
  { value: 'attendance_register', label: 'Attendance register' },
  { value: 'project_completion', label: 'Project completion' },
  { value: 'teacher_activity', label: 'Teacher activity' },
]
const TERMS = ['Term 1', 'Term 2', 'Term 3']

function GenerateModal({ schoolId, onClose, onCreated, onToast }) {
  const [type, setType] = useState(TYPES[0].value)
  const [term, setTerm] = useState(TERMS[0])
  const { run, busy, error } = useAction()

  async function submit(e) {
    e.preventDefault()
    const res = await run(() => createSchoolReport({ schoolId, type, term }))
    if (res.ok) {
      onToast('Report generated')
      onCreated()
      onClose()
    }
  }

  return (
    <Modal title="Generate report" subtitle="Built from your school's current data" onClose={onClose} busy={busy}>
      <form onSubmit={submit}>
        <Field label="Report type" htmlFor="r-type">
          <select id="r-type" className="signin-input" value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Term" htmlFor="r-term">
          <select id="r-term" className="signin-input" value={term} onChange={(e) => setTerm(e.target.value)}>
            {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        {error ? <div className="signin-err">{error.message}</div> : null}
        <ModalActions onCancel={onClose} submitLabel="Generate" busy={busy} />
      </form>
    </Modal>
  )
}

export default function Reports({ active, schoolId, onToast }) {
  const [generating, setGenerating] = useState(false)
  const [downloading, setDownloading] = useState(null)
  const reports = useResource(
    () => listSchoolReports({ schoolId, limit: 50 }),
    [schoolId],
    { enabled: active },
  )

  const rows = reports.data?.data ?? []

  /**
   * The download route needs the bearer token, so it cannot be a plain link.
   * Fetch it, then hand the browser a blob.
   */
  async function download(report) {
    setDownloading(report.id)
    try {
      const res = await fetch(`${API_BASE_URL}/reports/school/${report.id}/download`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error(`Download failed (${res.status})`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.type || 'report'}-${report.term || ''}`.replace(/\s+/g, '-').toLowerCase()
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      onToast(e.message)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <section className={'view' + (active ? ' active' : '')}>
      <div className="toolbar">
        <span className="count">{reports.data?.total ?? 0} report{(reports.data?.total ?? 0) === 1 ? '' : 's'}</span>
        <span className="sp" />
        <button className="btnP" onClick={() => setGenerating(true)}>
          <IconPlus />
          Generate report
        </button>
      </div>

      <div className="panel" style={{ padding: '6px 8px' }}>
        {reports.loading && !reports.data ? <Loading /> : null}
        {reports.error ? <ErrorState error={reports.error} onRetry={reports.reload} /> : null}
        {reports.data && rows.length === 0 ? (
          <EmptyState
            title="No reports yet"
            hint='Use "Generate report" above to build one from your current data.'
          />
        ) : null}
        {rows.length > 0 ? (
          <table>
            <thead><tr><th>Report</th><th>Term</th><th>Generated</th><th /></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="strong">{humanize(r.type)}</td>
                  <td>{r.term || '-'}</td>
                  <td>{fmtDateTime(r.createdAt || r.generatedAt)}</td>
                  <td>
                    <button
                      className="btnO"
                      disabled={downloading === r.id}
                      onClick={() => download(r)}
                    >
                      {downloading === r.id ? 'Preparing…' : 'Download'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      {generating ? (
        <GenerateModal
          schoolId={schoolId}
          onClose={() => setGenerating(false)}
          onCreated={reports.reload}
          onToast={onToast}
        />
      ) : null}
    </section>
  )
}
