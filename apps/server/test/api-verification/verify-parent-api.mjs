// Exercises every call the parent app makes, as a parent.
const B = 'http://127.0.0.1:4000/api';
let token = null;

async function call(method, path, body) {
  const res = await fetch(`${B}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  let payload = null;
  try { payload = await res.json(); } catch {}
  return { status: res.status, ok: res.ok, data: payload?.data, raw: payload };
}

const listOf = (p) => (Array.isArray(p) ? p : Array.isArray(p?.data) ? p.data : []);
const results = [];
const push = (name, r, note = '') => results.push({ name, ok: r.ok, status: r.status, note });

const signin = await call('POST', '/auth/signin', {
  identifier: 'tunde.eze@parent.ignite.edu.ng', password: 'ignite123', role: 'parent',
});
if (!signin.ok) { console.error('SIGN IN FAILED', signin.raw); process.exit(1); }
token = signin.data.accessToken;
push('POST /auth/signin', signin, 'parent');

const kids = await call('GET', '/parents/me/children');
const list = listOf(kids.data);
const childId = list[0]?.id;
push('GET /parents/me/children', kids, `${list.length} children`);

const summary = await call('GET', `/children/${childId}/weekly-summary`);
push('GET /children/:id/weekly-summary', summary,
  `present=${summary.data?.daysPresent} projects=${summary.data?.activeProjects}`);

const att = await call('GET', `/children/${childId}/attendance`);
push('GET /children/:id/attendance', att,
  `${att.data?.termPercent}% term, ${(att.data?.weeklyBreakdown ?? []).length} weeks`);

const pf = await call('GET', `/children/${childId}/portfolio`);
push('GET /children/:id/portfolio', pf, `${listOf(pf.data).length} items`);

const skills = await call('GET', `/children/${childId}/skills`);
const levels = (skills.data?.dimensions ?? []).map((d) => Number(d.level));
push('GET /children/:id/skills', skills,
  `${levels.length} dims, ${levels.filter((l) => l > 4).length} above 4 (client normalises)`);

const feed = await call('GET', `/children/${childId}/feed`);
push('GET /children/:id/feed', feed, `${listOf(feed.data).length} items`);

const hw = await call('GET', `/homework?childId=${childId}`);
const hwList = listOf(hw.data);
push('GET /homework?childId', hw, `${hwList.length} homework`);

if (hwList[0]) {
  const subs = await call('GET', `/homework/${hwList[0].id}/submissions`);
  push('GET /homework/:id/submissions', subs, `${listOf(subs.data).length} submissions`);

  const created = await call('POST', `/homework/${hwList[0].id}/submissions`, {
    learnerId: childId, fileType: 'image',
    fileUrl: 'file:///local/homework.jpg', fileName: 'homework.jpg', fileSizeMb: 0.9,
  });
  push('POST /homework/:id/submissions', created, created.ok ? 'created' : JSON.stringify(created.raw).slice(0, 80));

  const subId = created.data?.id ?? listOf(subs.data)[0]?.id;
  if (subId) {
    const msgs = await call('GET', `/homework/submissions/${subId}/messages`);
    push('GET submissions/:id/messages', msgs, `${listOf(msgs.data).length} msgs`);
    const sent = await call('POST', `/homework/submissions/${subId}/messages`, {
      senderType: 'parent', senderName: 'Tunde Eze', body: 'Verification message from parent.',
    });
    push('POST submissions/:id/messages', sent);
  }
}

const reports = await call('GET', `/reports/progress?childId=${childId}`);
const published = listOf(reports.data).filter((r) => r.status === 'published');
push('GET /reports/progress?childId', reports,
  `${listOf(reports.data).length} reports, ${published.length} published`);

const pad = (s, n) => String(s).padEnd(n);
let failures = 0;
console.log('\n' + pad('CALL', 40) + pad('STATUS', 8) + 'NOTE');
console.log('-'.repeat(100));
for (const r of results) {
  if (!r.ok) failures++;
  console.log(pad((r.ok ? '  ok  ' : ' FAIL ') + r.name, 40) + pad(r.status, 8) + r.note);
}
console.log('-'.repeat(100));
console.log(`${results.length - failures}/${results.length} passed`);
process.exit(failures ? 1 : 0);
