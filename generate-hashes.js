// Run this once to generate real bcrypt hashes for seed.sql
// Usage: node generate-hashes.js
//
// Install bcryptjs first if not already: npm install bcryptjs

const bcrypt = require('bcryptjs')

const passwords = {
    admin123: 'admin123',
    center123: 'center123',
    mandar123: 'mandar123',
    pratik123: 'pratik123',
}

const run = async () => {
    console.log('\n=== Bcrypt hashes for seed.sql ===\n')
    for (const [label, plain] of Object.entries(passwords)) {
        const hash = await bcrypt.hash(plain, 10)
        console.log(`${label.padEnd(12)} → ${hash}`)
    }
    console.log('\nCopy each hash into the matching password_hash field in seed.sql\n')
}

run()