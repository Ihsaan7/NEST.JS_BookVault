import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { CreateReviewDto } from './dto/createReview.dto.js';
import { CurrentUser } from '../common/decoractors/currentUser.decorator.js';


@Controller('reviews')
export class ReviewsController{
    constructor (private readonly reviewService: ReviewService){}

    // POST /reviews ( protected )
    @UseGuards(AuthGuard)
    @Post()
    create(@Body() dto: CreateReviewDto , @CurrentUser() user:any)
    {
        return this.reviewService.create(dto , user.id)
    }

    // Get /reviews/book/:bookId (Public)
    @Get('/book/:bookId')
    findByBookId(@Param('bookId' , ParseIntPipe) bookId : number)
    {
        return this.reviewService.findByBookId(bookId)
    }

}