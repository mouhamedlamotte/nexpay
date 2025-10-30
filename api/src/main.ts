import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
// import helmet from 'helmet';
import * as compression from 'compression';
import { CustomExceptionFilter } from './lib/filters';
import { ErrorInterceptor } from './lib/interceptors';
import { AppModule } from './modules/app.module';
import * as path from 'path';
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const configService = app.get(ConfigService);
    const nodeEnv = configService.get('app.nodeEnv');
    const port = configService.get('app.port');
    const globalPrefix = configService.get('app.globalPrefix');

    app.set('trust proxy', 1);

    // app.use(
    //   helmet({
    //     contentSecurityPolicy: {
    //       directives: {
    //         defaultSrc: ["'self'"],
    //         styleSrc: ["'self'", "'unsafe-inline'"],
    //         scriptSrc: ["'self'"],
    //         imgSrc: ["'self'", 'data:', 'https:'],
    //       },
    //     },
    //     hsts: {
    //       maxAge: 31536000,
    //       includeSubDomains: true,
    //       preload: true,
    //     },
    //   }),
    // );

    app.use(compression());

    app.enableCors({
      origin:
        nodeEnv === 'production'
          ? [configService.get('app.security.corsOrigin')]
          : true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-API-Key',
        'Accept',
      ],
      credentials: true,
      maxAge: 86400,
    });
    app.useStaticAssets(path.join(process.cwd(), 'media'), {
      prefix: `/${globalPrefix}/media/`,
    });
    app.setGlobalPrefix(globalPrefix);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        validateCustomDecorators: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.useGlobalFilters(new CustomExceptionFilter());
    app.useGlobalInterceptors(new ErrorInterceptor());

    const config = new DocumentBuilder()
      .setTitle(configService.get('app.name'))
      .setDescription('Microservice API Documentation')
      .setVersion(configService.get('app.version'))
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${globalPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
      jsonDocumentUrl: `${globalPrefix}/docs/json`,
      customSiteTitle: 'Microservice API Docs',
    });

    // Graceful shutdown
    app.enableShutdownHooks();
    const host = process.env.HOST || '0.0.0.0';

    await app.listen(port, '0.0.0.0');

    logger.log(
      `🚀 Application is running on: http://${host}:${port}/${globalPrefix}`,
    );
    logger.log(`📚 Documentation: http://${host}:${port}/${globalPrefix}/docs`);
    logger.log(
      `🏥 Health Check: http://${host}:${port}/${globalPrefix}/health`,
    );
    logger.log(`📊 Environment: ${nodeEnv}`);
  } catch (error) {
    logger.error('❌ Error starting the application', error);
    process.exit(1);
  }
}

bootstrap();
