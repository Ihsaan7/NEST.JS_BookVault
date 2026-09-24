import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppService } from './app.service.js';
import fs from 'fs';
import path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() req?: Request, @Res({ passthrough: true }) res?: Response): any {
    const accept = req?.headers?.['accept'] || '';
    if (accept.includes('text/html') && res) {
      const htmlPath = path.join(process.cwd(), 'public', 'index.html');
      if (fs.existsSync(htmlPath)) {
        res.type('html');
        return fs.readFileSync(htmlPath, 'utf-8');
      }
    }
    return this.appService.getHello();
  }

  @Get('api/health')
  getHealth() {
    return {
      status: 'ok',
      service: 'BookVault API',
      sentry_enabled: true,
      timestamp: new Date().toISOString(),
    };
  }
}
