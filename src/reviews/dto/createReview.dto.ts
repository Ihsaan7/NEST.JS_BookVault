import { IsInt, IsString, Min, Max, IsOptional } from 'class-validator';

export class CreateReviewDto {
    @IsInt()
    @Min(1)
    book_id: number;

    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @IsOptional()
    @IsString()
    comment?: string;
}