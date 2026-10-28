import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // vercel.json rewrites "/api/:path*" -> "/api" so this single serverless function
  // handles every route; because the destination doesn't reference :path*, Vercel
  // appends the unmatched segments as a literal "path" query param on every request.
  // Strip it before validation runs, or any endpoint binding a whole DTO via @Query()
  // (with the global ValidationPipe's forbidNonWhitelisted) would reject every request.
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if ('path' in req.query) delete (req.query as Record<string, unknown>).path;
    next();
  });

  const allowedOrigins = config.get<string[]>('allowedOrigins') ?? [];
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some((o) => origin === o || origin.endsWith('.vercel.app'))) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  });

  app.setGlobalPrefix('api');
  // whitelist alone already strips any property not declared on the DTO (no mass-assignment
  // risk — unknown fields are silently dropped before validation, never read or stored).
  // forbidNonWhitelisted used to also throw 400 on those extras, which broke every admin
  // "save" flow: each provider's save() PATCHes back the full object it mapped from the
  // server's own response (id, _id, createdAt, updatedAt, __v and all), since that's the
  // same shape the UI already has in state — none of those are, or should need to be,
  // declared on the Update DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  if (config.get<string>('nodeEnv') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('TechClues API')
      .setDescription('Backend API for the TechClues marketing site and admin panel')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  return app;
}
