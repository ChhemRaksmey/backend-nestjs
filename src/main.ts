import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as expressLayouts from 'express-ejs-layouts';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, 'views'));
  app.setViewEngine('ejs');
  app.use(expressLayouts);
  app.set('layout', 'layouts/main');
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableShutdownHooks();

  await app.listen(Number(process.env.PORT) || 3000);
}

void bootstrap();
