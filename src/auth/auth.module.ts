import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { DatabaseModule } from '../db/database.module.js';

@Module({
    controllers: [AuthController],
    providers:[AuthService]
})

export class AuthModule{}