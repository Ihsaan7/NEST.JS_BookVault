import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BookCategory } from '../../common/enums/bookCategory.enum.js';

export class FilterBookDto{
    @IsOptional()
    @IsEnum(BookCategory)
    category?: BookCategory;

    @IsOptional()
    @IsString()
    author?: string;

    @IsOptional()
    @IsString()
    search?: string    // Search byt title
}