// Exercises every call the learner app makes, as a learner.
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
  identifier: 'amara.eze@learner.ignite.edu.ng', password: 'ignite123', role: 'learner',
});
if (!signin.ok) { console.error('SIGN IN FAILED', signin.raw); process.exit(1); }
token = signin.data.accessToken;
push('POST /auth/signin', signin, 'learner');

const me = await call('GET', '/auth/me');
const id = me.data.id;
push('GET /auth/me', me, me.data?.role);

const portfolio = await call('GET', `/portfolio/learner/${id}`);
const groups = portfolio.data?.groups ?? {};
const flat = Object.values(groups).flat();
push('GET /portfolio/learner/:id', portfolio, `${Object.keys(groups).length} groups, ${flat.length} projects`);

const recent = await call('GET', `/portfolio/learner/${id}/recent`);
push('GET /portfolio/learner/:id/recent', recent, `${listOf(recent.data).length}`);

const progress = await call('GET', `/portfolio/learner/${id}/progress`);
push('GET /portfolio/learner/:id/progress', progress,
  `streak=${progress.data?.streak} term=${progress.data?.termProgressPercent}% badges=${progress.data?.totalBadges}`);

if (flat[0]) {
  const proj = await call('GET', `/portfolio/projects/${flat[0].id}`);
  push('GET /portfolio/projects/:id', proj, proj.data?.title);
  // Teacher-only on the server, so the learner app deliberately does not offer
  // it. Asserted here so a future permission change is noticed.
  const shared = await call('POST', `/portfolio/projects/${flat[0].id}/share`);
  push(
    'POST /projects/:id/share is teacher-only',
    { ok: shared.status === 403, status: shared.status },
    'learner correctly forbidden',
  );
}

const lqs = await call('GET', `/lqs/learner/${id}`);
push('GET /lqs/learner/:id', lqs, `${(lqs.data?.dimensions ?? []).length} dims, total=${lqs.data?.totalScore}`);

const radar = await call('GET', `/lqs/learner/${id}/radar`);
const vals = (radar.data?.dimensions ?? []).map((d) => Number(d.value));
const outOfRange = vals.filter((v) => v > 1).length;
push('GET /lqs/learner/:id/radar', radar,
  `${vals.length} points, ${outOfRange} above 1.0 (client normalises)`);

const badges = await call('GET', `/lqs/badges/learner/${id}`);
const earned = listOf(badges.data).filter((b) => b.earned).length;
push('GET /lqs/badges/learner/:id', badges, `${listOf(badges.data).length} total, ${earned} earned`);

const cert = await call('GET', `/lqs/certificates/learner/${id}`);
push('GET /lqs/certificates/learner/:id', cert, cert.data?.verifiedId ?? 'none');

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
