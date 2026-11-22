import {neon} from '@neondatabase/serverless';
import {readFileSync} from 'node:fs';
const sql=neon(process.env.DATABASE_URL);
for(const statement of readFileSync(new URL('./market-schema.sql',import.meta.url),'utf8').split(';').map(s=>s.trim()).filter(Boolean))await sql.query(statement);
console.log('Marketplace schema ready.');
