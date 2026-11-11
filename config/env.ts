import 'dotenv/config';

/**
 * Single source of truth for environment-dependent values.
 * Switch target environments with TEST_ENV instead of editing tests.
 */
type EnvName = 'prod';

interface EnvConfig {
  uiBaseUrl: string;
  apiBaseUrl: string;
}

const environments: Record<EnvName, EnvConfig> = {
  prod: {
    uiBaseUrl: 'https://www.saucedemo.com',
    apiBaseUrl: 'https://restful-booker.herokuapp.com',
  },
};

const envName = (process.env.TEST_ENV ?? 'prod') as EnvName;

if (!(envName in environments)) {
  throw new Error(
    `Unknown TEST_ENV "${envName}". Expected one of: ${Object.keys(environments).join(', ')}`,
  );
}

export const env = {
  name: envName,
  ...environments[envName],
  /** Shared password for all Sauce Demo users. Public demo value, overridable via .env. */
  uiPassword: process.env.SAUCE_PASSWORD ?? 'secret_sauce',
  /** Restful-Booker admin credentials. Public demo values, overridable via .env. */
  apiUser: process.env.BOOKER_USER ?? 'admin',
  apiPassword: process.env.BOOKER_PASSWORD ?? 'password123',
} as const;
