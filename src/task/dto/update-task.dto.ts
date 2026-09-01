import { IsEnum, IsString, MinLength } from 'class-validator';
import {
  IsDateOnly,
  Trim,
  ValidateIfPresent,
  ValidateIfPresentAndNotNull,
} from '../../common/validation/validation.decorators';
import { TaskRecurrence, TaskStatus } from '../task.types';

export class UpdateTaskDto {
  @ValidateIfPresent()
  @Trim()
  @IsString()
  @MinLength(1)
  title?: string;

  @ValidateIfPresentAndNotNull()
  @IsDateOnly()
  dueOn?: string | null;

  @ValidateIfPresent()
  @IsEnum(TaskRecurrence)
  recurrence?: TaskRecurrence;

  @ValidateIfPresent()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
