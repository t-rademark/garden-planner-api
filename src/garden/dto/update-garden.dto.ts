import { IsEnum, IsString, MinLength } from 'class-validator';
import { Region } from '@prisma/client';
import {
  Trim,
  ValidateIfPresent,
} from '../../common/validation/validation.decorators';

export class UpdateGardenDto {
  @ValidateIfPresent()
  @Trim()
  @IsString()
  @MinLength(1)
  name?: string;

  @ValidateIfPresent()
  @IsEnum(Region)
  region?: Region;
}
