import { useEffect, useState } from 'react'
import { useResource, useAction } from '../api/useResource.js'
import { getAiConfig, updateAiConfig, getAiUsage, getAiSchoolUsage } from '../api/endpoints.js'
import { Loading, ErrorState, EmptyState, Skel } from '../components/States.jsx'
import { fmtNumber } from '../lib/format.js'

export default function AIServices({ active, onToast }) {
  const config = useResource(() => getAiConfig(), [], { enabled: active })
  const usage = useResource(() => getAiUsage(), [], { enabled: active })
  const perSchool = useResource(() => getAiSchoolUsage({ limit: 20 }), [], { enabled: active })
  const save = useAction()

  const [draft, setDraft] = useState(null)
  useEffect(() => {
    if (config.data) {
      setDraft({
        modelTier: config.data.modelTier,
        requireTeacherReview: !!config.data.requireTeacherReview,
        monthlyCallCap: config.data.monthlyCallCap ?? 0,
      })
    }
  }, [config.data])

  const dirty =
    draft && config.data &&
    (draft.modelTier !== config.data.modelTier ||
      draft.requireTeacherReview !== !!config.data.requireTeacherReview ||
      Number(draft.monthlyCallCap) !== Number(config.data.monthlyCallCap))

  async function onSave() {
    const res = await save.run(() => updateAiConfig({
      modelTier: draft.modelTier,
      requireTeacherReview: draft.requireTeacherReview,
      monthlyCallCap: Number(draft.monthlyCallCap),
    }))
    if (res.ok) {
      onToast('AI configuration saved')
      config.reload()
      usage.reload()
    } else {
      onToast(res.error.message)
    }
  }

  const u = usage.data || {}
  const capPercent = config.data?.monthlyCallCap
    ? Math.min(100, Math.round(((u.callsThisMonth ?? 0) / config.data.monthlyCallCap) * 100))
    : 0

  return (
    <section className={'view' + (active ? ' active' : '')} id="view-ai">
      <div className="tiles">
        <div className="tile">
          <div className="th"><span className="tl">Calls this month</span></div>
          <div className="tn">{usage.loading && !usage.data ? <Skel w={72} h={24} /> : fmtNumber(u.callsThisMonth)}</div>
          <div className="tf">{capPercent}% of cap</div>
        </div>
        <div className="tile">
          <div className="th"><span className="tl">Estimated spend</span></div>
          <div className="tn">{usage.loading && !usage.data ? <Skel w={72} h={24} /> : `$${fmtNumber(u.estimatedSpend)}`}</div>
          <div className="tf">this billing period</div>
        </div>
        <div className="tile">
          <div className="th"><span className="tl">Reports published</span></div>
          <div className="tn">{usage.loading && !usage.data ? <Skel w={72} h={24} /> : fmtNumber(u.reportsPublished)}</div>
          <div className="tf">AI-assisted</div>
        </div>
        <div className="tile">
          <div className="th"><span className="tl">Teacher review rate</span></div>
          <div className="tn">{usage.loading && !usage.data ? <Skel w={72} h={24} /> : `${u.teacherReviewRate ?? 0}%`}</div>
          <div className="tf">reviewed before publish</div>
        </div>
      </div>

      <div className="grid2">
        <div className="panel">
          <div className="ph"><h3>Configuration</h3></div>
          {config.loading && !config.data ? <Loading variant="form" /> : null}
          {config.error ? <ErrorState error={config.error} onRetry={config.reload} /> : null}

          {draft ? (
            <div className="annseg">
              <label className="signin-label" htmlFor="ai-tier">Model tier</label>
              <select
                id="ai-tier"
                className="signin-input"
                value={draft.modelTier}
                onChange={(e) => setDraft((d) => ({ ...d, modelTier: e.target.value }))}
              >
                <option value="small">Small (cheaper, faster)</option>
                <option value="large">Large (higher quality)</option>
              </select>

              <label className="signin-label" htmlFor="ai-cap">Monthly call cap</label>
              <input
                id="ai-cap"
          placeholder="Type monthly call cap"
                className="signin-input"
                type="number"
                min="0"
                value={draft.monthlyCallCap}
                onChange={(e) => setDraft((d) => ({ ...d, monthlyCallCap: e.target.value }))}
              />

              <label className="chkitem" style={{ marginTop: 12 }}>
                <input
                  type="checkbox"
                  checked={draft.requireTeacherReview}
                  onChange={(e) => setDraft((d) => ({ ...d, requireTeacherReview: e.target.checked }))}
                />
                <span>Require teacher review before AI reports are published</span>
              </label>

              {save.error ? <div className="signin-err" style={{ marginTop: 10 }}>{save.error.message}</div> : null}

              <div className="pubbar">
                <button className="btnP" onClick={onSave} disabled={!dirty || save.busy}>
                  {save.busy ? 'Saving…' : 'Save configuration'}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="panel">
          <div className="ph"><h3>Usage by school</h3></div>
          {perSchool.loading && !perSchool.data ? <Loading variant="form" /> : null}
          {perSchool.error ? <ErrorState error={perSchool.error} onRetry={perSchool.reload} /> : null}
          {perSchool.data && (perSchool.data.data ?? []).length === 0 ? (
            <EmptyState title="No per-school usage recorded" hint="Usage appears once schools start making AI calls." />
          ) : null}
          {perSchool.data && (perSchool.data.data ?? []).length > 0 ? (
            <table>
              <thead><tr><th>School</th><th>Calls</th><th>Spend</th></tr></thead>
              <tbody>
                {perSchool.data.data.map((r, i) => (
                  <tr key={r.schoolId || i}>
                    <td className="strong">{r.schoolName || r.name || r.schoolId}</td>
                    <td>{fmtNumber(r.callsThisMonth ?? r.calls)}</td>
                    <td>${fmtNumber(r.estimatedSpend ?? r.spend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>
    </section>
  )
}
