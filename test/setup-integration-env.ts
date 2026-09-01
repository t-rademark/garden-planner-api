if (!process.env.TEST_DATABASE_URL) {
  process.loadEnvFile();
}

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error(
    'TEST_DATABASE_URL is required and must point to a disposable integration-test database',
  );
}

const parsedTestDatabaseUrl = new URL(testDatabaseUrl);
const databaseName = decodeURIComponent(parsedTestDatabaseUrl.pathname);
const schemaName = parsedTestDatabaseUrl.searchParams.get('schema') ?? '';

if (!/(test|integration)/i.test(`${databaseName}/${schemaName}`)) {
  throw new Error(
    'TEST_DATABASE_URL must use a database or schema whose name contains "test" or "integration"',
  );
}

process.env.DATABASE_URL = testDatabaseUrl;
