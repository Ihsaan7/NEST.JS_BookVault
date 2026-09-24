import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { BorrowSerive } from './borrow.service.js';
import { CreateBorrowDto } from './dto/createBorrow.dto.js';
import { CurrentUser } from '../common/decoractors/currentUser.decorator.js';


@Controller('borrows')
@UseGuards(AuthGuard)
export class BorrowsController{
    constructor(private readonly borrowService: BorrowSerive){}

    // POST /borrows
    @Post()
    borrow(@Body() dto: CreateBorrowDto, @CurrentUser() user:any)
    {
        return this.borrowService.borrow(dto , user.id)
    }

    // PATCH /borrows/:id/return
    @Patch(':id/return')
    returnBook(@Param('id', ParseIntPipe) id:number, @CurrentUser() user:any)
    {
        return this.borrowService.returnBook(id , user.id)
    }

    // GET /borrows/my
    @Get('my')
    getMyBorrow(@CurrentUser() user:any)
    {
        return this.borrowService.findMyBorrows(user.id)
    }
}
