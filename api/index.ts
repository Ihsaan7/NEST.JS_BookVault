import '../src/instrument.js';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from '../src/common/filters/allExceptions.filter.js';
import express, { Express, Request, Response } from 'express';

const server: Express = express();
let isInitialized = false;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionFilter());
  await app.init();
  isInitialized = true;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  if (!isInitialized) {
    await bootstrap();
  }
  server(req, res);
}
