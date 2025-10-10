import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.APP_PORT, 10) || 3000,
  name: process.env.APP_NAME || 'nestjs-app',
  version: process.env.APP_VERSION || '1.0.0',
  globalPrefix: process.env.GLOBAL_PREFIX,

  security: {
    corsOrigin: process.env.CORS_ORIGIN,
    helmetCsp: process.env.HELMET_CSP_DIRECTIVES,
  },
}));
