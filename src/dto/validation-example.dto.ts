import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ValidationExampleDto {

  @IsString()
  @IsNotEmpty({ message: 'Name is required.' })
  @MaxLength(25, { message: 'Name must be 25 characters or fewer.' })
  name: string;

  @Transform(({ value }) => (value === '' ? Number.NaN : Number(value)))
  @IsInt({ message: 'Quantity must be a whole number.' })
  @Min(1, { message: 'Quantity must be at least 1.' })
  @Max(2147483647, { message: 'Quantity is too large.' })
  quantity: number;

  @IsString()
  @Matches(/^-?\d{1,23}(?:\.\d{1,2})?$/, {
    message: 'Amount must fit DECIMAL(25,2).',
  })
  amount: string;

  @IsDateString(
    { strict: true },
    { message: 'Enter a real date in YYYY-MM-DD format.' },
  )
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must use the YYYY-MM-DD format.',
  })
  date: string;

  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Time must use 24-hour HH:mm format.',
  })
  time: string;

  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(255)
  email: string;
  
}
