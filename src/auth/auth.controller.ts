import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { CurrentUser } from '../common/decoractors/currentUser.decorator.js';


@Controller(['auth', 'Auth'])
export class AuthController{
    constructor(private readonly authService: AuthService){}

    // POST /auth/register
    @Post('register')
    register(@Body() dto:RegisterDto){
        return this.authService.register(dto)
    }

    // POST /auth/login
    @Post('login')
    login(@Body() dto:LoginDto)
    {
        return this.authService.login(dto)
    }

    // GET /auth/me ( protected )
    @UseGuards(AuthGuard)
    @Get('me')
    getProfile(@CurrentUser() user:any)
    {
        return this.authService.getProfile(user.id)
    }
}