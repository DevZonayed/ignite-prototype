#!/bin/sh
# nginx's official image runs every executable in /docker-entrypoint.d before
# starting nginx. This writes the one piece of configuration that cannot be
# known at image build time: where the API lives.
set -eu

: "${API_BASE_URL:=http://localhost:4000/api}"

cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.__IGNITE_API_BASE_URL__ = "${API_BASE_URL}";
EOF

echo "runtime-config: API_BASE_URL=${API_BASE_URL}"
