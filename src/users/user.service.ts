import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../db/database.service.js';
import { UpdateRoleDto } from './dto/updateRole.dto.js';

@Injectable()
export class UserService {
    constructor(private readonly db: DatabaseService){}
    async findAll()
    {
        const users = await this.db.all(
            `SELECT
                u.id, u.name , u.email , u.role , u.created_at,
                COUNT(b.id) AS total_borrows
            FROM users u
            LEFT JOIN borrows b ON u.id  = b.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC`,
            
        );
        return{
            success: true,
            count: users.length,
            data: users
        }
    }


    // Admin -> Update a user's role
    async updateRole(id: number , dto: UpdateRoleDto)
    {
        const user = await this.db.get(
            `SELECT id , name , role FROM users WHERE id = ?`,
            [id]
        );
        if(!user){ throw new NotFoundException(`User with ${id} not found!`)}

        await this.db.run(
            `UPDATE users SET role = ? WHERE id = ?`,
            [dto.role, id]
        )

        return {
            success:true,
            message:`User "${user.name}" role updated to ${dto.role}`,
             data: {
                id: user.id,
                name: user.name,
                old_role: user.role,
                new_role: dto.role,
            },
        }
    }


    // User Dashboard : Personal Stats
    async getDashboard(userId: number)
    {
        const user = await this.db.get(
            `SELECT id , name , email , role , created_at
                FROM users Where id = ?`,
            [userId]
        );

        if(!user){ throw new NotFoundException("User not found!")}

        // Count borrows
        const totalResult = await this.db.get(
            `SELECT COUNT(*) AS total FROM borrows WHERE user_id = ?`,
            [userId]
        );

        // Count active Borrow ( currently borrowd )
        const activeResult = await this.db.get(
            `SELECT COUNT(*) AS active FROM borrows WHERE user_id = ? AND status = 'BORROWED'`,
            [userId]
        );

        const ratingResult = await this.db.get(
            `SELECT AVG(rating) AS avg_rating FROM reviews WHERE user_id = ?`,
            [userId],
        );

        // Get recently Borrowed Books
        const recentBorrows = await this.db.all(
            `SELECT 
                b.id , b.status , b.borrowed_at , b.returned_at,
                bk.title AS book_title , bk.author AS book_author
            FROM borrows b
            JOIN books bk ON b.book_id = bk.id
            WHERE b.user_id = ?
            ORDER BY b.borrowed_at DESC
            LIMIT 5`,
            [userId]
        );

        return {
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    member_since: user.created_at,
                },
                stats: {
                    total_borrows: totalResult?.total || 0,
                    currently_borrowed: activeResult?.active || 0,
                    average_rating_given: ratingResult?.avg_rating
                        ? Number(ratingResult.avg_rating.toFixed(2))
                        : 0,
                },
                recent_borrows: recentBorrows,
            },
        };
    }




}
