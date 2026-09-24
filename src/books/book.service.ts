import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../db/database.service.js';
import { FilterBookDto } from './dto/filterBook.dto.js';
import { CreateBookDto } from './dto/createBook.dto.js';
import { UpdateBookDto } from './dto/updateBook.dto.js';




@Injectable()
export class BookService{
    constructor(private readonly db: DatabaseService){}

    // Get all Books ( with optional filters )
    async findAll(filters: FilterBookDto)
    {
        let sql = `SELECT * FROM books WHERE 1 = 1`;
        const params: any[] =[]

        if(filters.category){
            sql += ` AND category = ?`;
            params.push(filters.category)
        }
        if(filters.author)
            {
                sql += ` AND author LIKE ?`;
                params.push(`%${filters.author}%`)
            }
        if(filters.search)
            {
                sql += ` AND title LIKE ?`;
                params.push(`%${filters.search}%`)
            }
        
        sql += ` ORDER BY created_at DESC`;

        const books = await this.db.all(sql , params)

        // Convert is_available from 0/1 to true/false for cleaner API
        const formatted = books.map((book:any) => ({
            ...book,
            is_available: Boolean(book.is_available),
        }));

        return {
            success: true,
            count: formatted.length,
            data: formatted
        }

    }

    // GET a single book by ID
    async findOne(id: number)
    {
        const book = await this.db.get(
            `SELECT * FROM books WHERE id = ?`,
            [id]
        );
        if(!book){ throw new NotFoundException(`Book with ${id} not found!`)}

        book.is_available = Boolean(book.is_available)

        return{
            success: true,
            data: book
        }
    }

    // Create new Book ( ADMIN only )
    async create(dto: CreateBookDto, userId: number)
    {
        const result = await this.db.run(
            `INSERT INTO books (title , author , category , description , isbn , added_by)
                VALUES ( ? , ?, ? ,? ,? ,?)
            `,
            [dto.title , dto.author , dto.category , dto.description || null , dto.isbn , userId]
        );

        return this.findOne(result.lastID)
    }

    // Update a Book ( ADMIN only )
    async update(id: number , dto: UpdateBookDto){
        const exists = await this.db.get(`
            SELECT id FROM books WHERE id = ?`,
            [id]
        );
        if(!exists){ throw new NotFoundException(`Book with ${id} not found!`)}

        const fields: string[]=[];
        const params: any[] =[]

        if(dto.title !== undefined){
            fields.push('title = ?');
            params.push(dto.title)
        }
        if (dto.author !== undefined) {
            fields.push('author = ?');
            params.push(dto.author);
        }
        if (dto.category !== undefined) {
            fields.push('category = ?');
            params.push(dto.category);
        }
        if (dto.description !== undefined) {
            fields.push('description = ?');
            params.push(dto.description);
        }
        if (dto.isbn !== undefined) {
            fields.push('isbn = ?');
            params.push(dto.isbn);
        }

        if(fields.length === 0)
            {
                return this.findOne(id)
            }
            
        params.push(id)
        await this.db.run(
            `UPDATE books SET ${fields.join(', ')} WHERE id = ?`,
            params,
        );

        return this.findOne(id)

    }


    // DELETE a Book ( ADMIN only )
    async remove(id: number)
    {
        const book = await this.db.get(
            `SELECT * FROM books WHERE id = ?`,
            [id]
        );
        if(!book){ throw new NotFoundException(`Book with ${id} not found!`)}
        
        await this.db.run(`DELETE FROM books WHERE id = ? `, [id])

        return {
            success: true,
            message:`Book "${book.title}" Deleted successfully`
        }
    }




}