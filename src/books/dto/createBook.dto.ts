import { IsString, IsNotEmpty, IsEnum, IsOptional, IsEmpty } from 'class-validator';
import { BookCategory } from '../../common/enums/bookCategory.enum.js';

export class CreateBookDto{
    @IsString()
    @IsEmpty()
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