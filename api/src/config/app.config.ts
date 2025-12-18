import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.APP_PORT, 10) || 3000,
  name: process.env.APP_NAME || 'nestjs-app',
  version: process.env.APP_VERSION || '1.0.0',
  domain: process.env.APP_DOMAIN,
  globalPrefix: process.env.GLOBAL_PREFIX,
  url:
    `${process.env.NODE_ENV === 'production' ? 'https' : 'http'}://${process.env.APP_DOMAIN}:9090` ||
    'http://localhost:9000',

  security: {
    corsOrigin: process.env.CORS_ORIGIN,
    helmetCsp: process.env.HELMET_CSP_DIRECTIVES,
  },
}));
