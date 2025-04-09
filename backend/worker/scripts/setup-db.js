const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to the migration file
const migrationPath = path.join(__dirname, '../migrations/0000_initial.sql');
const migrationSql = fs.readFileSync(migrationPath, 'utf8');

// Path to the local SQLite database
const dbPath = path.join(__dirname, '../dev.db');

// Create the database if it doesn't exist
if (!fs.existsSync(dbPath)) {
  console.log('Creating new database...');
  fs.writeFileSync(dbPath, '');
}

// Apply the migration
console.log('Applying migration...');
try {
  // Write SQL to a temporary file to avoid command line issues
  const tempSqlPath = path.join(__dirname, '../temp.sql');
  fs.writeFileSync(tempSqlPath, migrationSql);
  
  // Execute SQL from the file
  execSync(`sqlite3 ${dbPath} < ${tempSqlPath}`);
  
  // Clean up
  fs.unlinkSync(tempSqlPath);
  
  console.log('Migration applied successfully!');
} catch (error) {
  console.error('Error applying migration:', error.message);
  process.exit(1);
} 