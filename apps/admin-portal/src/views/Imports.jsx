import { useState } from 'react'
import { useResource, useAction } from '../api/useResource.js'
import { getImportTemplate, getImportJob } from '../api/endpoints.js'
import { Loading, ErrorState } from '../components/States.jsx'

/** Turn the template into a downloadable CSV without leaving the page. */
function downloadCsv(template) {
  const headers = template.headers.join(',')
  const sample = template.headers.map((h) => template.sampleRow?.[h] ?? '').join(',')
  const blob = new Blob([`${headers}\n${sample}\n`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'ignite-bulk-import-template.csv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function Imports({ active, onToast }) {
  const template = useResource(() => getImportTemplate(), [], { enabled: active })
  const [jobId, setJobId] = useState('')
  const [job, setJob] = useState(null)
  const lookup = useAction()

  async function checkJob(e) {
    e.preventDefault()
    const res = await lookup.run(() => getImportJob(jobId.trim()))
    if (res.ok) setJob(res.value)
    else { setJob(null); onToast(res.error.message) }
  }

  return (
    <section className={'view' + (active ? ' active' : '')} id="view-imports">
      <div className="grid2">
        <div className="panel">
          <div className="ph"><h3>CSV template</h3></div>
          {template.loading && !template.data ? <Loading /> : null}
          {template.error ? <ErrorState error={template.error} onRetry={template.reload} /> : null}
          {template.data ? (
            <>
              <p className="fm" style={{ marginBottom: 10 }}>
                Bulk-onboard users by uploading a CSV with these columns. Download the
                template, fill it in, then upload it via <code>POST /api/imports/upload</code>.
              </p>
              <table>
                <thead><tr><th>Column</th><th>Example</th></tr></thead>
                <tbody>
                  {template.data.headers.map((h) => (
                    <tr key={h}>
                      <td className="strong">{h}</td>
                      <td className="fm">{template.data.sampleRow?.[h] || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pubbar">
                <button className="btnP" onClick={() => downloadCsv(template.data)}>
                  Download template
                </button>
              </div>
            </>
          ) : null}
        </div>

        <div className="panel">
          <div className="ph"><h3>Check an import job</h3></div>
          <form className="annseg" onSubmit={checkJob}>
            <label className="signin-label" htmlFor="job-id">Job ID</label>
            <input
              id="job-id"
              className="signin-input"
              placeholder="Type job ID"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
            />
            <div className="pubbar">
              <button className="btnO" type="submit" disabled={!jobId.trim() || lookup.busy}>
                {lookup.busy ? 'Checking…' : 'Check status'}
              </button>
            </div>
          </form>

          {lookup.error ? <div className="signin-err">{lookup.error.message}</div> : null}

          {job ? (
            <div className="stepper">
              <div className="stepitem">
                <span className="stp">Status</span>
                <span className={'badge ' + (job.status === 'completed' ? 'b-green' : 'b-amber')}>
                  {job.status}
                </span>
              </div>
              <div className="stepitem">
                <span className="stp">Rows</span>
                <span>{job.totalRows ?? '-'} total · {job.successRows ?? 0} ok · {job.errorRows ?? 0} failed</span>
              </div>
              {job.filename ? (
                <div className="stepitem"><span className="stp">File</span><span>{job.filename}</span></div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
