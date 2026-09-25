import "./instrument.js";

// All other imports below
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './common/filters/allExceptions.filter.js';
import path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.useStaticAssets(path.join(process.cwd(), 'public'), { index: false });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform:true
    })
  )

  app.useGlobalFilters(new AllExceptionFilter());

  // In AI Studio, Nginx proxies 8080 to internal port 3000 on 0.0.0.0
  const port = 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on http://0.0.0.0:${port}`);
}
void bootstrap();
