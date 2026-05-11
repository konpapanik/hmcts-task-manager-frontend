import axios from 'axios';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

type ApiFieldError = {
  field: string;
  message: string;
};

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
};

export type CreateTaskPayload = {
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate: string;
};

export class TaskApiError extends Error {
  status?: number;
  details?: ApiFieldError[];

  constructor(message: string, status?: number, details?: ApiFieldError[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const client = axios.create({
  baseURL: process.env.TASKS_API_URL || 'http://localhost:4000',
  timeout: 5000,
});

function toTaskApiError(error: unknown, fallbackMessage: string): TaskApiError {
  if (axios.isAxiosError(error)) {
    const details = Array.isArray(error.response?.data?.errors)
      ? error.response?.data?.errors.filter(
          (entry: unknown): entry is ApiFieldError =>
            typeof entry === 'object' &&
            entry !== null &&
            typeof (entry as ApiFieldError).field === 'string' &&
            typeof (entry as ApiFieldError).message === 'string'
        )
      : undefined;
    const message = typeof error.response?.data?.message === 'string' ? error.response.data.message : fallbackMessage;

    return new TaskApiError(message, error.response?.status, details);
  }

  return new TaskApiError(fallbackMessage);
}

export async function listTasks(): Promise<Task[]> {
  try {
    const response = await client.get<Task[]>('/tasks');
    return response.data;
  } catch (error) {
    throw toTaskApiError(error, 'We could not load tasks.');
  }
}

export async function getTask(id: number): Promise<Task> {
  try {
    const response = await client.get<Task>(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    throw toTaskApiError(error, 'We could not load that task.');
  }
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  try {
    const response = await client.post<Task>('/tasks', payload);
    return response.data;
  } catch (error) {
    throw toTaskApiError(error, 'We could not create the task.');
  }
}

export async function updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
  try {
    const response = await client.patch<Task>(`/tasks/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw toTaskApiError(error, 'We could not update the task status.');
  }
}

export async function deleteTask(id: number): Promise<void> {
  try {
    await client.delete(`/tasks/${id}`);
  } catch (error) {
    throw toTaskApiError(error, 'We could not delete the task.');
  }
}
