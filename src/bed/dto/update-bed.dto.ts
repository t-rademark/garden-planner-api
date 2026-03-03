import { IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

export class UpdateBedDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    name?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    positionIndex?: number;

    @IsOptional()
    @IsString()
    @MinLength(1)
    notes?: string;
}