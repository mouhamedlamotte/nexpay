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

# Always run migrations
run_migration

# Start both applications with supervisor
echo "Starting API (port 9000) and Web (port 9001)..."
exec /usr/bin/supervisord -c /etc/supervisord.conf