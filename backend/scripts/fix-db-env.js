const fs = require('fs');

// Helper function to escape bash strings safely
function escapeBashString(str) {
    // Replace single quotes with '\'' (end quote, escaped quote, start quote)
    return str.replace(/'/g, "'\\''");
}

// Helper function to safely export bash variables
function safeExport(varName, value) {
    const escaped = escapeBashString(value);
    return `export ${varName}='${escaped}'`;
}

// Get environment variables or defaults
const user = process.env.POSTGRES_USER || 'postgres';
const host = process.env.POSTGRES_HOST || 'postgres';
const port = process.env.POSTGRES_PORT || '5432';
const db = process.env.POSTGRES_DB || 'juellehair';
let pass = process.env.POSTGRES_PASSWORD;

// If password is not explicitly set, try to extract from DATABASE_URL
// Handle case where password contains @ (which breaks standard parsing if unencoded)
if (!pass && process.env.DATABASE_URL) {
    try {
        const url = process.env.DATABASE_URL;
        const lastAt = url.lastIndexOf('@');
        if (lastAt > -1) {
            // postgresql://user:pass@word@host:port/db
            const protocolEnd = url.indexOf('://');
            if (protocolEnd > -1) {
                const afterProtocol = url.substring(protocolEnd + 3);
                const firstColon = afterProtocol.indexOf(':');
                if (firstColon > -1) {
                    // Extract part between first colon and last @
                    // This covers the password part roughly
                    // But we need to be careful about the user part
                    // user is from start of afterProtocol to firstColon
                    const potentialUser = afterProtocol.substring(0, firstColon);
                    
                    // If the explicit user matches or isn't set, this confirms structure
                    if (potentialUser === user) {
                        // The password is everything from that colon+1 to the last @
                        // But wait, last @ is the host separator.
                        // So password is url.substring(protocolEnd + 3 + firstColon + 1, lastAt)
                        const passwordStart = protocolEnd + 3 + firstColon + 1;
                        pass = decodeURIComponent(url.substring(passwordStart, lastAt));
                    }
                }
            }
        }
    } catch (e) {
        console.error('Failed to parse password from DATABASE_URL', e);
    }
}

if (!pass) {
    console.error('ERROR: Could not determine database password');
    console.error('POSTGRES_PASSWORD environment variable is required');
    console.error('Current env vars:');
    console.error('  POSTGRES_USER:', user);
    console.error('  POSTGRES_HOST:', host);
    console.error('  POSTGRES_PORT:', port);
    console.error('  POSTGRES_DB:', db);
    console.error('  POSTGRES_PASSWORD:', pass ? '***' : 'NOT SET');
    console.error('  DATABASE_URL:', process.env.DATABASE_URL ? 'SET (hidden)' : 'NOT SET');
    process.exit(1);
}

// Encode password for safe URL
const encodedPass = encodeURIComponent(pass);
// Add connection pool parameters to prevent connection exhaustion and timeouts
const safeUrl = `postgresql://${user}:${encodedPass}@${host}:${port}/${db}?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=10`;

// Output exports with safe escaping
console.log(safeExport('DATABASE_URL', safeUrl));
console.log(safeExport('DB_HOST', host));
console.log(safeExport('DB_PORT', port));
console.log(safeExport('DB_USER', user));
console.log(safeExport('DB_PASS', pass));
console.log(safeExport('DB_NAME', db));
