import { IsString, IsDateString, IsInt, Min } from 'class-validator';

export class CreateEventDTO {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsDateString()
  date!: string;

  @IsInt()
  @Min(1)
  totalSeats!: number;
}
