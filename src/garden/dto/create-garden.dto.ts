import { IsEnum, IsString, MinLength } from 'class-validator';
import { Region } from '../region';

export class CreateGardenDto {
    @IsString()
    @MinLength(1)
    name!: string;

    @IsEnum(Region)
    region!: Region;
}