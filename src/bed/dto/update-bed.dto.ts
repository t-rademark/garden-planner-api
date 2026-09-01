import { IsInt, IsString, Min, MinLength } from 'class-validator';
import {
  Trim,
  ValidateIfPresent,
} from '../../common/validation/validation.decorators';

export class UpdateBedDto {
  @ValidateIfPresent()
  @Trim()
  @IsString()
  @MinLength(1)
  name?: string;

  @ValidateIfPresent()
  @IsInt()
  @Min(0)
  positionIndex?: number;

  @ValidateIfPresent()
  @Trim()
  @IsString()
  @MinLength(1)
  notes?: string;
}
