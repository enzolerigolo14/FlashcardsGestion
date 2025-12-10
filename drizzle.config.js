/**
 * Drizzle Kit configuration (CommonJS)
 * @type {import('drizzle-kit').Config}
 */
const config = {
  schema: './src/db/schema.js',
  out: './drizzle',
  driver: 'better-sqlite3',
  dbCredentials: {
    url: 'file:./dev.sqlite'
  }
};

module.exports = config;
