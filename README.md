# IGNITE — Digital Innovation Learning Platform (working prototype)

A self-contained, front-end **working prototype** of the IGNITE Phase-1 platform: five connected apps (Teacher, Learner, Parent, School, IGNITE Admin) plus a shared sign-in flow, all navigable with realistic sample data and light/dark themes.

- Entry point: [`/design/index.html`](design/index.html) (the launcher). The site root `/` redirects there.
- Pure static HTML/CSS/vanilla-JS — no build step. Served by nginx (see `Dockerfile` + `deploy/nginx.conf`).

Sample content only — no real learner data.
