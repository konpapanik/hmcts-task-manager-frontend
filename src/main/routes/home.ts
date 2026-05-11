import { Application, Request, Response } from 'express';

import { createTask, listTasks } from '../services/taskApi';
import {
  buildCreateTaskPayload,
  defaultTaskFormValues,
  errorSummaryFromFieldErrors,
  fieldErrorsFromApiError,
  getTaskFormValues,
  statusOptions,
  validateCreateTaskForm,
} from '../services/taskForm';
import { toTaskTableRows, toTaskViewModel } from '../services/taskPresenter';

type HomePageOptions = {
  formValues?: ReturnType<typeof defaultTaskFormValues>;
  formErrors?: ReturnType<typeof fieldErrorsFromApiError>;
  pageError?: string;
  successMessage?: string;
  statusCode?: number;
};

const successMessages: Record<string, string> = {
  'task-created': 'Task created successfully.',
  'task-updated': 'Task status updated successfully.',
  'task-deleted': 'Task deleted successfully.',
};

const errorMessages: Record<string, string> = {
  'task-not-found': 'The requested task could not be found.',
  'task-action-failed': 'We could not complete that action. Try again.',
};

async function renderHome(res: Response, options: HomePageOptions = {}): Promise<void> {
  try {
    const tasks = await listTasks();
    const taskViewModels = tasks.map(toTaskViewModel);
    const formValues = options.formValues ?? defaultTaskFormValues();
    const formErrors = options.formErrors ?? {};

    res.status(options.statusCode ?? 200).render('home', {
      tasks: taskViewModels,
      taskRows: toTaskTableRows(taskViewModels),
      formValues,
      formErrors,
      errorSummary: errorSummaryFromFieldErrors(formErrors),
      pageError: options.pageError,
      successMessage: options.successMessage,
      statusOptions,
    });
  } catch (error) {
    res.status(502).render('home', {
      tasks: [],
      taskRows: [],
      formValues: options.formValues ?? defaultTaskFormValues(),
      formErrors: options.formErrors ?? {},
      errorSummary: errorSummaryFromFieldErrors(options.formErrors ?? {}),
      pageError: 'The task service is currently unavailable.',
      successMessage: undefined,
      statusOptions,
    });
  }
}

function readMessage(queryValue: unknown, lookup: Record<string, string>): string | undefined {
  if (typeof queryValue !== 'string') {
    return undefined;
  }

  return lookup[queryValue];
}

export default function (app: Application): void {
  app.get('/', async (req: Request, res: Response) => {
    await renderHome(res, {
      successMessage: readMessage(req.query.success, successMessages),
      pageError: readMessage(req.query.error, errorMessages),
    });
  });

  app.post('/tasks', async (req: Request, res: Response) => {
    const formValues = getTaskFormValues(req.body);
    const validation = validateCreateTaskForm(formValues);

    if (Object.keys(validation).length > 0) {
      await renderHome(res, {
        formValues,
        formErrors: validation,
        pageError: 'Fix the form errors below before creating a task.',
        statusCode: 400,
      });
      return;
    }

    try {
      await createTask(buildCreateTaskPayload(formValues));
      res.redirect('/?success=task-created');
    } catch (error) {
      await renderHome(res, {
        formValues,
        formErrors: fieldErrorsFromApiError(error),
        pageError: 'We could not create the task.',
        statusCode: 400,
      });
    }
  });
}
