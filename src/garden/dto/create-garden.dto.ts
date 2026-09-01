import { IsEnum, IsString, MinLength } from 'class-validator';
import { Region } from '@prisma/client';
import { Trim } from '../../common/validation/validation.decorators';

export class CreateGardenDto {
  @Trim()
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEnum(Region)
  region!: Region;
}
