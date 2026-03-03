import { IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { TaskRecurrence, TaskStatus } from '../task.types';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dueOn must be YYYY-MM-DD' })
  dueOn?: string;

  @IsOptional()
  @IsEnum(TaskRecurrence)
  recurrence?: TaskRecurrence;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}