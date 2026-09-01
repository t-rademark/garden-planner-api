import { IsEnum } from 'class-validator';
import {
  IsDateOnly,
  ValidateIfPresent,
} from '../../common/validation/validation.decorators';
import { TaskStatus } from '../task.types';

export class ListTasksQueryDto {
  @ValidateIfPresent()
  @IsDateOnly()
  dueOn?: string;

  @ValidateIfPresent()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
