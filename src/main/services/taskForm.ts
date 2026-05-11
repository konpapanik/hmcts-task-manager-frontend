import { CreateTaskPayload, TaskApiError, TaskStatus } from './taskApi';

export type TaskFormValues = {
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
};

export type TaskFormErrors = Partial<Record<keyof TaskFormValues, string>>;

export const statusOptions: { value: TaskStatus; text: string }[] = [
  { value: 'TODO', text: 'To do' },
  { value: 'IN_PROGRESS', text: 'In progress' },
  { value: 'DONE', text: 'Done' },
];

const allowedStatuses = new Set(statusOptions.map(option => option.value));

export function defaultTaskFormValues(): TaskFormValues {
  return {
    title: '',
    description: '',
    status: 'TODO',
    dueDate: '',
  };
}

export function getTaskFormValues(body: Record<string, unknown>): TaskFormValues {
  return {
    title: typeof body.title === 'string' ? body.title : '',
    description: typeof body.description === 'string' ? body.description : '',
    status:
      typeof body.status === 'string' && allowedStatuses.has(body.status as TaskStatus)
        ? (body.status as TaskStatus)
        : 'TODO',
    dueDate: typeof body.dueDate === 'string' ? body.dueDate : '',
  };
}

export function validateCreateTaskForm(values: TaskFormValues): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const dueDate = new Date(values.dueDate);

  if (!values.title.trim()) {
    errors.title = 'Enter a title';
  } else if (values.title.trim().length > 100) {
    errors.title = 'Title must be 100 characters or fewer';
  }

  if (values.description.trim().length > 500) {
    errors.description = 'Description must be 500 characters or fewer';
  }

  if (!allowedStatuses.has(values.status)) {
    errors.status = 'Choose a valid status';
  }

  if (!values.dueDate) {
    errors.dueDate = 'Enter a due date and time';
  } else if (Number.isNaN(dueDate.getTime())) {
    errors.dueDate = 'Enter a valid due date and time';
  } else if (dueDate <= new Date()) {
    errors.dueDate = 'Enter a future due date and time';
  }

  return errors;
}

export function validateStatusForm(status: unknown): TaskFormErrors {
  if (typeof status !== 'string' || !allowedStatuses.has(status as TaskStatus)) {
    return { status: 'Choose a valid status' };
  }

  return {};
}

export function buildCreateTaskPayload(values: TaskFormValues): CreateTaskPayload {
  const dueDate = new Date(values.dueDate);

  return {
    title: values.title.trim(),
    description: values.description.trim() || undefined,
    status: values.status,
    dueDate: Number.isNaN(dueDate.getTime()) ? values.dueDate : dueDate.toISOString(),
  };
}

export function fieldErrorsFromApiError(error: unknown): TaskFormErrors {
  if (!(error instanceof TaskApiError) || !error.details) {
    return {};
  }

  return error.details.reduce<TaskFormErrors>((errors, detail) => {
    if (
      detail.field === 'title' ||
      detail.field === 'description' ||
      detail.field === 'status' ||
      detail.field === 'dueDate'
    ) {
      errors[detail.field] = detail.message;
    }

    return errors;
  }, {});
}

export function errorSummaryFromFieldErrors(errors: TaskFormErrors): { text: string; href: string }[] {
  return Object.entries(errors).map(([field, text]) => ({
    text: text as string,
    href: `#${field}`,
  }));
}
