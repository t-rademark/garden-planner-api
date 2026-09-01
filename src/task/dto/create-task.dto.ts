import { IsEnum, IsString, MinLength } from 'class-validator';
import {
  IsDateOnly,
  Trim,
  ValidateIfPresent,
} from '../../common/validation/validation.decorators';
import { TaskRecurrence } from '../task.types';

export class CreateTaskDto {
  @Trim()
  @IsString()
  @MinLength(1)
  title!: string;

  @ValidateIfPresent()
  @IsDateOnly()
  dueOn?: string;

  @ValidateIfPresent()
  @IsEnum(TaskRecurrence)
  recurrence?: TaskRecurrence;
}
