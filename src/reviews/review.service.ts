import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../db/database.service.js';
import { CreateReviewDto } from './dto/createReview.dto.js';


@Injectable()
export class ReviewService{
    constructor(private readonly db:DatabaseService){}

    // Leave a review
    async create(dto: CreateReviewDto , userId:number)
    {
        // Check for book
        const book = await this.db.get(
            `SELECT id , title FROM books WHERE id = ?`,
            [dto.book_id]
        )
        if(!book){throw new NotFoundException(`Book with "${dto.book_id}" not found!`)}

        const result = await this.db.run(
            `INSERT INTO reviews (user_id , book_id , rating , comment)
                VALUES ( ? , ? ,? ,?)
            `,
            [userId , dto.book_id , dto.rating , dto.comment || null]
        );

        return {
            success: true,
            message: 'Review submitted successfully',
            data: {
                id: result.lastID,
                user_id: userId,
                book_id: dto.book_id,
                rating: dto.rating,
                comment: dto.comment,
            },
        }
    }


    // Get all reviews for a specific book  ( With user's detial )
    async findByBookId(bookId: number)
    {
        const book = await this.db.get(
            `SELECT id FROM books WHERE id = ?`,
            [bookId]
        );
        if(!book){ throw new NotFoundException(`Book with ${bookId} not found!`)}

        const reviews = await this.db.all(
            `SELECT 
                r.id , r.rating , r.comment , r.created_at,
                u.name AS reviewer_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
            `,
            [bookId]
        );

        const avgRating= reviews.length > 0 ? reviews.reduce((sum:any , r:any) => sum + r.rating ,0) : 0
    
        return{
            success: true,
            count: reviews.length,
            average_rating: Number(avgRating.toFixed(2)),
            data: reviews
        }
    }




}