import { IsString } from 'class-validator';

export class CreateBookingDTO {
  @IsString()
  eventId!: string;
}
