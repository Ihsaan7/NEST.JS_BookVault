import { Module } from '@nestjs/common';
import { BorrowsController } from './borrow.controller.js';
import { BorrowSerive } from './borrow.service.js';


@Module({
    controllers:[BorrowsController],
    providers:[BorrowSerive]
})

export class BorrowModule{}