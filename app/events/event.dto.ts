export interface EventDTO {

  title: string;
  description: string;
  date: Date;
  totalSeats: number;
  bookedSeats?: number[];
  location: string;   
  imageUrl: string;   
}