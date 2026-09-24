import { IsString, IsEnum, IsOptional } from 'class-validator';
import { BookCategory } from '../../common/enums/bookCategory.enum.js';


export class UpdateBookDto{
    @IsString()
    @IsOptional()
    title?:string;

    @IsOptional()
    @IsString()
    author?: string;

    @IsOptional()
    @IsEnum(BookCategory)
    category?: BookCategory;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    isbn?: string;
}