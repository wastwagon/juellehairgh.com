#!/usr/bin/env node

/**
 * Database Connection Diagnostic Script
 * 
 * This script tests the database connection and provides
 * detailed diagnostic information if it fails.
 */

const { execSync } = require('child_process');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
    log('red', `✗ ${message}`);
}

function success(message) {
    log('green', `✓ ${message}`);
}

function info(message) {
    log('blue', `→ ${message}`);
}

function warn(message) {
    log('yellow', `⚠ ${message}`);
}

console.log('\n');
log('blue', '========================================');
log('blue', '  Database Connection Diagnostic');
log('blue', '========================================');
console.log('');

// Step 1: Load environment fix script
info('Step 1: Loading database environment...');
try {
    const fixOutput = execSync('node ./scripts/fix-db-env.js', { 
        encoding: 'utf-8',
        stdio: 'pipe'
    });
    
    // Evaluate the exports
    eval(fixOutput);
    success('Environment variables loaded');
} catch (e) {
    error('Failed to load environment variables');
    console.error(e.message);
    process.exit(1);
}

// Step 2: Display connection info (without password)
console.log('');
info('Step 2: Connection Details');
console.log(`  Host: ${process.env.DB_HOST || 'NOT SET'}`);
console.log(`  Port: ${process.env.DB_PORT || 'NOT SET'}`);
console.log(`  User: ${process.env.DB_USER || 'NOT SET'}`);
console.log(`  Database: ${process.env.DB_NAME || 'NOT SET'}`);
console.log(`  Password: ${process.env.DB_PASS ? '*** (SET)' : 'NOT SET'}`);
console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@') : 'NOT SET'}`);

// Step 3: Test PostgreSQL connection
console.log('');
info('Step 3: Testing PostgreSQL connection...');

const user = process.env.DB_USER;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const db = process.env.DB_NAME;
const pass = process.env.DB_PASS;

if (!user || !host || !port || !db || !pass) {
    error('Missing required environment variables');
    process.exit(1);
}

// Test connection using psql
try {
    const testCmd = `PGPASSWORD='${pass.replace(/'/g, "'\\''")}' psql -h ${host} -p ${port} -U ${user} -d ${db} -c "SELECT 1 as test;" 2>&1`;
    const result = execSync(testCmd, { encoding: 'utf-8', stdio: 'pipe' });
    
    if (result.includes('test')) {
        success('Database connection successful!');
        console.log('');
        info('Connection Test Result:');
        console.log(result);
    } else {
        throw new Error('Unexpected response from database');
    }
} catch (e) {
    error('Database connection failed!');
    console.log('');
    
    const errorOutput = e.stderr || e.stdout || e.message;
    console.error('Error details:');
    console.error(errorOutput);
    console.log('');
    
    warn('Troubleshooting Steps:');
    console.log('  1. Verify POSTGRES_PASSWORD matches the database password');
    console.log('  2. Check if database container is running: docker ps | grep postgres');
    console.log('  3. Verify network connectivity: docker network ls');
    console.log('  4. Check database logs: docker logs <postgres-container-name>');
    console.log('');
    
    // Check common error patterns
    if (errorOutput.includes('password authentication failed')) {
        warn('PASSWORD MISMATCH DETECTED');
        console.log('  → The password in POSTGRES_PASSWORD does not match the database password');
        console.log('  → Solution: Update POSTGRES_PASSWORD to match the database password');
        console.log('  → Or reset the database password in PostgreSQL');
    } else if (errorOutput.includes('connection refused') || errorOutput.includes('could not connect')) {
        warn('CONNECTION REFUSED');
        console.log('  → Database server is not accessible at ' + host + ':' + port);
        console.log('  → Check if database container is running');
        console.log('  → Verify network configuration');
    } else if (errorOutput.includes('database') && errorOutput.includes('does not exist')) {
        warn('DATABASE NOT FOUND');
        console.log('  → Database "' + db + '" does not exist');
        console.log('  → Solution: Create the database or update POSTGRES_DB');
    }
    
    console.log('');
    process.exit(1);
}

// Step 4: Test Prisma connection
console.log('');
info('Step 4: Testing Prisma connection...');
try {
    // Try to initialize Prisma Client
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test a simple query
    const testQuery = async () => {
        await prisma.$connect();
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        await prisma.$disconnect();
        return result;
    };
    
    testQuery().then(() => {
        success('Prisma connection successful!');
        console.log('');
        log('green', '========================================');
        log('green', '  All Checks Passed! ✓');
        log('green', '========================================');
        console.log('');
        process.exit(0);
    }).catch((e) => {
        error('Prisma connection failed!');
        console.error(e.message);
        process.exit(1);
    });
} catch (e) {
    warn('Could not test Prisma connection (Prisma Client not available)');
    console.log('  This is okay if Prisma Client has not been generated yet');
    console.log('');
    log('green', '========================================');
    log('green', '  Database Connection OK ✓');
    log('green', '========================================');
    console.log('');
    process.exit(0);
}
