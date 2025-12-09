#!/bin/bash
# Health check test script for Render shell
# Run this in Render's shell to debug health check issues

echo "🔍 Testing backend health check..."
echo ""

# Check if the app is running
echo "1. Checking if Node process is running:"
ps aux | grep node | grep -v grep || echo "❌ No Node process found"

echo ""
echo "2. Checking what ports are listening:"
netstat -tlnp 2>/dev/null || ss -tlnp 2>/dev/null || echo "⚠️ Cannot check ports (netstat/ss not available)"

echo ""
echo "3. Checking environment variables:"
echo "   PORT: ${PORT:-not set}"
echo "   NODE_ENV: ${NODE_ENV:-not set}"
echo "   DATABASE_URL: ${DATABASE_URL:+set (hidden)}"

echo ""
echo "4. Testing health endpoint on port ${PORT:-3001}:"
curl -v http://localhost:${PORT:-3001}/health 2>&1 || echo "❌ Health endpoint not responding"

echo ""
echo "5. Testing API health endpoint:"
curl -v http://localhost:${PORT:-3001}/api/health 2>&1 || echo "❌ API health endpoint not responding"

echo ""
echo "6. Checking application logs (last 20 lines):"
tail -20 /var/log/syslog 2>/dev/null || echo "⚠️ Cannot access system logs"

echo ""
echo "✅ Health check test complete"

