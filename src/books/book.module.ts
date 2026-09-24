import { Module } from '@nestjs/common';
import { BooksController } from './book.controller.js';
import { BookService } from './book.service.js';

@Module({
    controllers: [BooksController],
    providers: [BookService],
})

export class BookModule{}