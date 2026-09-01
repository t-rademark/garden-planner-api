import { IsDateString, IsEnum, IsOptional, Matches } from 'class-validator';
import { TaskStatus } from '../task.types';

export class ListTasksQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dueOn must be YYYY-MM-DD' })
  @IsDateString({ strict: true }, { message: 'dueOn must be a valid date' })
  dueOn?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
