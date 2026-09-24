import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { BookCategory } from '../../common/enums/bookCategory.enum.js';

export class CreateBookDto{
    @IsString()
    @IsNotEmpty()
    title:string;

    @IsString()
    @IsNotEmpty()
    author: string;

    @IsEnum(BookCategory)
    category: BookCategory;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    isbn: string
}