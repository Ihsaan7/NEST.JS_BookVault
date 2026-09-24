import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../db/database.service.js';
import { CreateBorrowDto } from './dto/createBorrow.dto.js';
import { BorrowStatus } from '../common/enums/borrowStatus.enum.js';

@Injectable()
export class BorrowSerive{
    constructor (private readonly db: DatabaseService){}

    // Borrow a Book
    async borrow(dto: CreateBorrowDto , userId: number)
    {
        const book = await this.db.get(
            `SELECT id , title , is_available FROM books WHERE id = ?`,
            [dto.book_id]
        );
        if(!book){ throw new NotFoundException(`Book with ${dto.book_id} not found!`)}

        // Check for availbilty
        if(!book.is_available){ throw new ConflictException(`Book "${book.title} is currently unavailable!`)}

        const result = await this.db.run(
            `INSERT INTO borrows (user_id , book_id , status)
                VALUES (? , ?, ?)`,
            [userId , dto.book_id , BorrowStatus.BORROWED]
        );

        await this.db.run(
            `UPDATE books SET is_available = 0 WHERE id = ?`,
            [dto.book_id]
        );

        const newBorrow = await this.db.get(
            `SELECT 
                b.id , b.user , b.book_id , b.status , b.borrowed_at,
                bk.title AS book_title , bk.author as book_author
            FROM borrows b
            JOIN books bk ON b.book_id = bk.id
            WHERE b.id =  ?
            `,
            [result.lastID]
        );

        return{
            success: true,
            message:`Successfully borrowed "${book.title}"`,
            data:newBorrow
        }
    }

    // Return a Book
    async returnBook(borrowedId: number , userId: number)
    {
        const borrow = await this.db.get(
            `SELECT * FROM borrows WHERE id = ?`,
            [borrowedId]
        );
        if(!borrow){ throw new NotFoundException(`Borrow record with ID ${borrowedId} not found!`)} 
        
        if(borrow.user_id !== userId){ throw new ForbiddenException('You can only return book that you borrowed!')}

        if(borrow.status === BorrowStatus.RETURNED){ throw new BadRequestException("This book already has been returned!")}

        await this.db.run(
            `UPDATE borrows SET status = ? , returned_at = CURRENT_TIMESTAMP 
                WHERE id = ?`,
            [BorrowStatus.RETURNED , borrowedId]
        );

        return {
            success: true,
            message: 'Book returned successfully',
            data:{
                id: borrow.id,
                book_id: borrow.book_id,
                status: BorrowStatus.RETURNED
            }
        }
    }

    
        // Get User's Borrows (Active Borrows)
        async findMyBorrows(userId : number)
        {
            const borrow = await this.db.all(
            `SELECT 
                b.id, b.book_id, b.status, b.borrowed_at, b.returned_at,
                bk.title AS book_title, bk.author AS book_author, bk.category
            FROM borrows b
            JOIN books bk ON b.book_id = bk.id
            WHERE b.user_id = ?
            ORDER BY b.borrowed_at DESC`,
            [userId],
            );

            return{
                success:true,
                count: borrow.length,
                data: borrow
            }
        }












}