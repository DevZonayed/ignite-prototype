# No `# syntax=` directive on purpose: nothing here needs a BuildKit frontend,
# and pulling one makes the build fail on any host whose docker config names a
# credential helper it does not have (Colima inheriting `credsStore: desktop`).

# ── builder ──────────────────────────────────────────────────────────────
# bcrypt ships prebuilt binaries but falls back to node-gyp, which needs a
# toolchain. The builder carries it; the runtime image does not.
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

# Drop dev dependencies from the tree we are about to copy across. The
# migration CLI needs typeorm and ts-node at runtime, both of which survive
# because typeorm is a production dependency and migrations are compiled to
# JS by `npm run build`.
RUN npm prune --omit=dev

# ── runtime ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# dumb-init reaps zombies and forwards signals, so `docker stop` is a clean
# shutdown rather than a 10-second SIGKILL wait.
RUN apk add --no-cache dumb-init

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Uploads are written at runtime; without this the directory is missing and
# the first upload fails. Mount a volume here for anything that must persist.
RUN mkdir -p /app/uploads && chown -R node:node /app

USER node
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||4000)+'/api/monitoring/health',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))"

# Migrations run at boot via migrationsRun in database.config.ts, so the
# entrypoint is just the server. Run `npm run migration:run` separately if you
# would rather gate deployment on migrations succeeding first.
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
