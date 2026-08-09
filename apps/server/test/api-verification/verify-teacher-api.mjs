// Exercises every call the teacher app makes, against the live API, as a
// teacher. Catches wrong paths, rejected query params and shape assumptions.
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
async function check(name, fn) {
  try {
    const r = await fn();
    results.push({ name, ok: r.ok, status: r.status, note: r.note ?? '' });
  } catch (e) {
    results.push({ name, ok: false, status: 'THREW', note: e.message });
  }
}

// ── sign in ──────────────────────────────────────────────────────────────
const signin = await call('POST', '/auth/signin', {
  identifier: 'funke.okafor@ignite.edu.ng', password: 'ignite123', role: 'teacher',
});
if (!signin.ok) { console.error('SIGN IN FAILED', signin.raw); process.exit(1); }
token = signin.data.accessToken;
results.push({ name: 'POST /auth/signin', ok: true, status: signin.status, note: 'teacher' });

await check('GET /auth/me', async () => { const r = await call('GET', '/auth/me'); return { ...r, note: r.data?.role }; });

// ── classes / learners ───────────────────────────────────────────────────
const classes = await call('GET', '/classes');
const classId = listOf(classes.data)[0]?.id;
results.push({ name: 'GET /classes', ok: classes.ok, status: classes.status, note: `${listOf(classes.data).length} classes` });

const learners = await call('GET', `/classes/${classId}/learners`);
const learnerId = listOf(learners.data)[0]?.id;
results.push({ name: 'GET /classes/:id/learners', ok: learners.ok, status: learners.status, note: `${listOf(learners.data).length} learners` });

// ── curriculum / lessons ─────────────────────────────────────────────────
const currs = await call('GET', '/curriculum');
const currId = listOf(currs.data).find((c) => c.status === 'published')?.id ?? listOf(currs.data)[0]?.id;
results.push({ name: 'GET /curriculum', ok: currs.ok, status: currs.status, note: `${listOf(currs.data).length}` });

const curr = await call('GET', `/curriculum/${currId}`);
const units = curr.data?.units ?? [];
const lesson = units.flatMap((u) => u.lessons ?? [])[0];
results.push({ name: 'GET /curriculum/:id', ok: curr.ok, status: curr.status, note: `${units.length} units, statuses: ${[...new Set(units.map(u=>u.status))].join('/')}` });

await check('GET /lessons/:id', async () => call('GET', `/lessons/${lesson.id}`));
await check('GET /lessons/:id/steps', async () => { const r = await call('GET', `/lessons/${lesson.id}/steps`); return { ...r, note: `${listOf(r.data).length}` }; });
await check('GET /lessons/:id/media', async () => { const r = await call('GET', `/lessons/${lesson.id}/media`); return { ...r, note: `${listOf(r.data).length}` }; });
await check('GET /lessons/:id/activities', async () => { const r = await call('GET', `/lessons/${lesson.id}/activities`); return { ...r, note: `${listOf(r.data).length}` }; });

// ── lesson session lifecycle ─────────────────────────────────────────────
await check('GET /lesson-sessions/current', async () => { const r = await call('GET', `/lesson-sessions/current?classId=${classId}`); return { ...r, note: r.data ? 'running' : 'none' }; });

const started = await call('POST', '/lesson-sessions', { lessonId: lesson.id, classId });
const sessionId = started.data?.id;
results.push({ name: 'POST /lesson-sessions', ok: started.ok, status: started.status, note: sessionId ? 'started' : JSON.stringify(started.raw).slice(0, 90) });

await check('PATCH /lesson-sessions/:id', async () => call('PATCH', `/lesson-sessions/${sessionId}`, { elapsedSeconds: 120 }));
await check('GET /lesson-sessions/:id/stats', async () => call('GET', `/lesson-sessions/${sessionId}/stats`));

// ── attendance ───────────────────────────────────────────────────────────
await check('PUT /attendance/session/:id', async () =>
  call('PUT', `/attendance/session/${sessionId}`, {
    records: listOf(learners.data).map((l) => ({ learnerId: l.id, status: 'present' })),
  }));
await check('GET /attendance/session/:id', async () => { const r = await call('GET', `/attendance/session/${sessionId}`); return { ...r, note: `${listOf(r.data).length} marked` }; });

// ── activities toggle ────────────────────────────────────────────────────
const acts = listOf((await call('GET', `/lessons/${lesson.id}/activities`)).data);
if (acts.length) {
  await check('PATCH /lessons/:id/activities/:aid', async () => {
    const r = await call('PATCH', `/lessons/${lesson.id}/activities/${acts[0].id}`);
    return { ...r, note: `title now "${r.data?.title?.slice(0, 24)}"` };
  });
} else {
  results.push({ name: 'PATCH activities toggle', ok: true, status: 'SKIP', note: 'lesson has no activities' });
}

// ── LQS ──────────────────────────────────────────────────────────────────
const dims = await call('GET', '/lqs/dimensions');
const dimList = listOf(dims.data);
results.push({ name: 'GET /lqs/dimensions', ok: dims.ok, status: dims.status, note: `${dimList.length} dims` });
await check('GET /lqs/scores?learnerId', async () => { const r = await call('GET', `/lqs/scores?learnerId=${learnerId}`); return { ...r, note: `${listOf(r.data).length}` }; });
await check('POST /lqs/scores/bulk', async () =>
  call('POST', '/lqs/scores/bulk', {
    entries: [{ learnerId, scores: dimList.slice(0, 3).map((d) => ({ dimensionId: d.id, score: 3 })) }],
  }));

// ── assessment ───────────────────────────────────────────────────────────
await check('GET /assessments?lessonSessionId', async () => { const r = await call('GET', `/assessments?lessonSessionId=${sessionId}`); return { ...r, note: `${listOf(r.data).length}` }; });
await check('POST /assessments/bulk', async () =>
  call('POST', '/assessments/bulk', {
    lessonId: lesson.id, lessonSessionId: sessionId,
    assessments: [{ learnerId, score: 3 }],
  }));

// ── homework ─────────────────────────────────────────────────────────────
await check('GET /homework?classId', async () => { const r = await call('GET', `/homework?classId=${classId}`); return { ...r, note: `${listOf(r.data).length}` }; });
const hwList = listOf((await call('GET', `/homework?classId=${classId}`)).data);
const created = await call('POST', '/homework', {
  lessonId: lesson.id, classId, title: 'API verification homework',
  instructions: 'Created by the endpoint verification script.', status: 'published',
});
results.push({ name: 'POST /homework', ok: created.ok, status: created.status, note: created.ok ? 'created' : JSON.stringify(created.raw).slice(0, 90) });

if (hwList[0]) {
  const subs = await call('GET', `/homework/${hwList[0].id}/submissions?reviewStatus=pending`);
  results.push({ name: 'GET /homework/:id/submissions?reviewStatus', ok: subs.ok, status: subs.status, note: `${listOf(subs.data).length} pending` });
  const sub = listOf(subs.data)[0] ?? listOf((await call('GET', `/homework/${hwList[0].id}/submissions`)).data)[0];
  if (sub) {
    await check('GET /homework/submissions/:id', async () => call('GET', `/homework/submissions/${sub.id}`));
    await check('GET submissions/:id/messages', async () => { const r = await call('GET', `/homework/submissions/${sub.id}/messages`); return { ...r, note: `${listOf(r.data).length} msgs` }; });
    await check('POST submissions/:id/messages', async () => call('POST', `/homework/submissions/${sub.id}/messages`, { senderType: 'teacher', senderName: 'Funke Okafor', body: 'Verification message.' }));
    await check('PATCH submissions/:id/feedback', async () => call('PATCH', `/homework/submissions/${sub.id}/feedback`));
  } else {
    results.push({ name: 'submission detail calls', ok: true, status: 'SKIP', note: 'no submissions seeded' });
  }
}

// ── evidence / portfolio / notifications / sync / ai ─────────────────────
await check('GET /evidence?lessonId&classId', async () => { const r = await call('GET', `/evidence?lessonId=${lesson.id}&classId=${classId}`); return { ...r, note: `${listOf(r.data).length}` }; });
await check('POST /evidence', async () => call('POST', '/evidence', {
  lessonId: lesson.id, classId, mediaType: 'photo',
  fileUrl: 'file:///local/verification.jpg', consentChecked: true, learnerIds: [learnerId],
}));
await check('GET /portfolio', async () => { const r = await call('GET', '/portfolio'); return { ...r, note: `${listOf(r.data).length}` }; });
await check('POST /portfolio/projects', async () => call('POST', '/portfolio/projects', {
  title: 'Verification project', fileType: 'scratch', learnerId, lessonId: lesson.id,
}));
await check('GET /notifications', async () => { const r = await call('GET', '/notifications'); return { ...r, note: `${listOf(r.data).length}` }; });
await check('PATCH /notifications/read-all', async () => call('PATCH', '/notifications/read-all'));
await check('GET /sync/queue', async () => { const r = await call('GET', '/sync/queue'); return { ...r, note: `${listOf(r.data).length}` }; });
await check('POST /sync/trigger', async () => call('POST', '/sync/trigger'));
await check('GET /ai/conversations', async () => { const r = await call('GET', '/ai/conversations'); return { ...r, note: `${listOf(r.data).length}` }; });
await check('POST /ai/conversations', async () => { const r = await call('POST', '/ai/conversations', { content: 'Verification question' }); return { ...r, note: r.data?.assistantMessage ? 'reply returned' : '' }; });

// ── complete the session we started ──────────────────────────────────────
await check('PATCH /lesson-sessions/:id/complete', async () =>
  call('PATCH', `/lesson-sessions/${sessionId}/complete`, {
    elapsedSeconds: 1500, reflection: 'Verification run.', sentiment: 'went_well',
  }));

// ── report ───────────────────────────────────────────────────────────────
const pad = (s, n) => String(s).padEnd(n);
let failures = 0;
console.log('\n' + pad('CALL', 44) + pad('STATUS', 8) + 'NOTE');
console.log('-'.repeat(96));
for (const r of results) {
  if (!r.ok) failures++;
  console.log(pad((r.ok ? '  ok  ' : ' FAIL ') + r.name, 44) + pad(r.status, 8) + r.note);
}
console.log('-'.repeat(96));
console.log(`${results.length - failures}/${results.length} passed`);
process.exit(failures ? 1 : 0);
