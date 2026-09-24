import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { RolesGuard } from '../common/guards/role.guard.js';
import { Role } from '../common/enums/role.enum.js';
import { UpdateRoleDto } from './dto/updateRole.dto.js';
import { CurrentUser } from '../common/decoractors/currentUser.decorator.js';

@Controller('users')
export class UserController{
    constructor(private readonly userService : UserService){}


    // GET /users ( ADMIN ONLY )
    @UseGuards(AuthGuard , new RolesGuard(Role.ADMIN))
    @Get()
    findAll()
    {
        return this.userService.findAll()
    }

    // PATHC /users/:id/role ( ADMIN ONLY )
    @UseGuards(AuthGuard , new RolesGuard(Role.ADMIN))
    @Patch(':id/role')
    updateRole(@Param('id' , ParseIntPipe) id:number, @Body() dto: UpdateRoleDto)
    {
        return this.userService.updateRole(id , dto)
    }

    // GET /users/me/dashboard ( Protected -Logged User)
    @UseGuards(AuthGuard)
    @Get('me/dashboard')
    getDashboard(@CurrentUser() user:any)
    {
        return this.userService.getDashboard(user.id)
    }

    
}