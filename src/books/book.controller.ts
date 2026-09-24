import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service.js';
import { FilterBookDto } from './dto/filterBook.dto.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { RolesGuard } from '../common/guards/role.guard.js';
import { CreateBookDto } from './dto/createBook.dto.js';
import { CurrentUser } from '../common/decoractors/currentUser.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { UpdateBookDto } from './dto/updateBook.dto.js';


@Controller('books')
export class BooksController{
    constructor(private readonly bookService: BookService){}

    // GET /books ( Public - Browse with fileters)
    @Get()
    findAll(@Query() filters: FilterBookDto)
    {
        return this.bookService.findAll(filters)
    }

    // GET /book/:id ( public )
    @Get(':id')
    findOne(@Param('id' , ParseIntPipe) id: number){
        return this.bookService.findOne(id)
    }

    // POST /books ( ADMIN only )
    @UseGuards(AuthGuard , new RolesGuard(Role.ADMIN))
    @Post()
    create(@Body() dto:CreateBookDto , @CurrentUser() user: any)
    {
        return this.bookService.create(dto , user.id)
    }

    // PATCH /books/:id ( ADMIN only )
    @UseGuards(AuthGuard , new RolesGuard(Role.ADMIN))
    @Post(':id')
    update(@Param('id' , ParseIntPipe) id:number, @Body() dto: UpdateBookDto)
    {
        return this.bookService.update(id , dto)
    }

    // DELETE /books/:id ( ADMIN only )
    @UseGuards(AuthGuard, new RolesGuard(Role.ADMIN))
    @Delete(':id')
    remove(@Param('id' , ParseIntPipe) id : number)
    {
        return this.bookService.remove(id)
    }

}