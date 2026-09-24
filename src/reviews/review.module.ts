import { Module } from '@nestjs/common';
import { ReviewsController } from './review.controller.js';
import { ReviewService } from './review.service.js';

@Module({
    controllers:[ReviewsController],
    providers:[ReviewService]
})

export class ReviewModule{}