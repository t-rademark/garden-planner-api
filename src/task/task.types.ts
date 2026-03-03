export enum TaskStatus {
  OPEN = 'OPEN',
  DONE = 'DONE',
}

export enum TaskRecurrence {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

export type Task = {
  id: number;
  bedId: number;
  title: string;
  dueOn?: string; // YYYY-MM-DD (date-only)
  recurrence: TaskRecurrence;
  status: TaskStatus;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};