import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { Region } from "@prisma/client";

export class UpdateGardenDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    name?: string;

    @IsOptional()
    @IsEnum(Region)
    region?: Region;
}