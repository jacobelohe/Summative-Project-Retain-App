import 'dotenv/config';

/**
 * Centralised, validated access to environment variables.
 * Failing fast here gives a clear error instead of an obscure crash later.
 */
const required = ['MONGODB_URI', 'JWT_SECRET'];

export function assertEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export const env = {
  get port() {
    return Number(process.env.PORT) || 5000;
  },
  get mongoUri() {
    return process.env.MONGODB_URI;
  },
  get jwtSecret() {
    return process.env.JWT_SECRET;
  },
  get jwtExpiresIn() {
    return process.env.JWT_EXPIRES_IN || '7d';
  },
  /** Comma-separated list of allowed frontend origins. */
  get clientUrls() {
    return (process.env.CLIENT_URL || 'http://localhost:5173')
      .split(',')
      .map((url) => url.trim().replace(/\/$/, ''))
      .filter(Boolean);
  },
  get isProduction() {
    return process.env.NODE_ENV === 'production';
  },
};
