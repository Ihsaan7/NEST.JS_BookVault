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
    const isDoc = req?.headers?.['sec-fetch-dest'] === 'document';
    if ((accept.includes('text/html') || isDoc) && res) {
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

  @Get(['favicon.ico', 'favicon.svg'])
  getFavicon(@Res() res: Response) {
    const iconPath = path.join(process.cwd(), 'public', 'favicon.svg');
    if (fs.existsSync(iconPath)) {
      res.type('image/svg+xml');
      return res.sendFile(iconPath);
    }
    return res.status(404).send('Icon not found');
  }

  @Get('api')
  getApi() {
    return {
      status: 'ok',
      service: 'BookVault API',
      version: '1.0.0',
      message: 'BookVault Archival REST Core is running',
      timestamp: new Date().toISOString(),
    };
  }
}
