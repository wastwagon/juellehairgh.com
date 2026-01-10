#!/bin/bash
# PostgreSQL Password Initialization Script
# This script ensures the database password matches POSTGRES_PASSWORD
# Run this inside the postgres container

set -e

# Get password from environment
NEW_PASSWORD="${POSTGRES_PASSWORD:-JuelleHair2026}"

echo "Initializing PostgreSQL password to match POSTGRES_PASSWORD..."

# Use peer authentication (local socket) to connect without password
# Then update the password
psql -U postgres -d postgres <<EOF
ALTER USER postgres WITH PASSWORD '$NEW_PASSWORD';
\q
EOF

echo "Password updated successfully!"
