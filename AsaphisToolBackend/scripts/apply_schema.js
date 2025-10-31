import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import path from 'path';
import { Client } from 'pg';

dotenv.config();

const schemaPath = path.resolve(process.cwd(), 'database', 'schema.sql');
const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.SUPABASE_DATABASE_URL;

async function applySchema() {
  if (!databaseUrl) {
    console.error('\nERROR: No database connection string found.');
    console.error('Please set the DATABASE_URL environment variable to your Supabase/Postgres connection string.');
    console.error('Example (from Supabase Project > Settings > Database > Connection string):');
    console.error("postgresql://postgres:<password>@db.<projectref>.supabase.co:5432/postgres\n");
    process.exit(1);
  }

  let sql;
  try {
    sql = await readFile(schemaPath, 'utf8');
  } catch (err) {
    console.error('Failed to read schema file at', schemaPath, err);
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Beginning transaction and applying schema...');
    await client.query('BEGIN');
    // Execute the full schema SQL. This file may contain multiple statements.
    await client.query(sql);
    await client.query('COMMIT');
    console.log('\n✅ Schema applied successfully.');
  } catch (err) {
    console.error('\nERROR applying schema:', err.message || err);
    try {
      await client.query('ROLLBACK');
      console.log('Rolled back transaction.');
    } catch (rbErr) {
      console.error('Rollback error:', rbErr.message || rbErr);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

applySchema();
