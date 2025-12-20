#!/bin/sh
set -e

echo "🚀 NexPay Starting..."

run_migration() {
    echo "📦 Running database migration..."
    cd /app && node scripts/db-migrate.mjs
    local migration_status=$?
    if [ $migration_status -ne 0 ]; then
        echo "❌ Database migration failed"
        exit 1
    fi
    echo "✅ Database migration completed successfully"
}

inject_frontend_config() {
    echo "⚙️ Injecting frontend runtime configuration..."
    cat > /app/web/public/config.js <<EOF
window.__RUNTIME_CONFIG__ = {
  NEXT_PUBLIC_API_URL: '${NEXT_PUBLIC_API_URL}',
  NEXT_PUBLIC_READ_API_KEY: '${NEXT_PUBLIC_READ_API_KEY}'
};
EOF
    echo "✅ Frontend config: API_URL=${NEXT_PUBLIC_API_URL}"
}

run_migration
inject_frontend_config

echo "Starting API (port 9000) and Web (port 9001)..."
exec /usr/bin/supervisord -c /etc/supervisord.conf