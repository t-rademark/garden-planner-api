import { IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { TaskRecurrence } from '../task.types';

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  title!: string;

  // date-only: YYYY-MM-DD
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dueOn must be YYYY-MM-DD' })
  dueOn?: string;

  @IsOptional()
  @IsEnum(TaskRecurrence)
  recurrence?: TaskRecurrence;
}