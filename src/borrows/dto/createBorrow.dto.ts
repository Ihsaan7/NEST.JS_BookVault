
import { IsInt, Min } from 'class-validator';

export class CreateBorrowDto 
{
    @IsInt()
    @Min(1)
    book_id:number
}