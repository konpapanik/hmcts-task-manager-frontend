import { Application, Request, Response } from 'express';

import { deleteTask, getTask, updateTaskStatus } from '../services/taskApi';
import { fieldErrorsFromApiError, statusOptions, validateStatusForm } from '../services/taskForm';
import { toTaskViewModel } from '../services/taskPresenter';

type TaskPageOptions = {
  pageError?: string;
  successMessage?: string;
  formErrors?: ReturnType<typeof fieldErrorsFromApiError>;
  statusCode?: number;
};

const successMessages: Record<string, string> = {
  'task-updated': 'Task status updated successfully.',
};

const errorMessages: Record<string, string> = {
  'task-action-failed': 'We could not complete that action. Try again.',
};

async function renderTaskDetails(req: Request, res: Response, options: TaskPageOptions = {}): Promise<void> {
  try {
    const task = await getTask(Number(req.params.id));

    res.status(options.statusCode ?? 200).render('task-details', {
      task: toTaskViewModel(task),
      statusOptions,
      formErrors: options.formErrors ?? {},
      errorSummary: Object.entries(options.formErrors ?? {}).map(([field, text]) => ({ text, href: `#${field}` })),
      pageError: options.pageError,
      successMessage: options.successMessage,
    });
  } catch (error) {
    res.status(404).render('not-found');
  }
}

function readMessage(queryValue: unknown, lookup: Record<string, string>): string | undefined {
  if (typeof queryValue !== 'string') {
    return undefined;
  }

  return lookup[queryValue];
}

export default function (app: Application): void {
  app.get('/tasks/:id', async (req: Request, res: Response) => {
    await renderTaskDetails(req, res, {
      successMessage: readMessage(req.query.success, successMessages),
      pageError: readMessage(req.query.error, errorMessages),
    });
  });

  app.post('/tasks/:id/status', async (req: Request, res: Response) => {
    const formErrors = validateStatusForm(req.body.status);

    if (Object.keys(formErrors).length > 0) {
      await renderTaskDetails(req, res, {
        formErrors,
        pageError: 'Choose a valid status before saving.',
        statusCode: 400,
      });
      return;
    }

    try {
      await updateTaskStatus(Number(req.params.id), req.body.status);
      res.redirect(`/tasks/${req.params.id}?success=task-updated`);
    } catch (error) {
      const apiErrors = fieldErrorsFromApiError(error);
      await renderTaskDetails(req, res, {
        formErrors: apiErrors,
        pageError: 'We could not update the task status.',
        statusCode: 400,
      });
    }
  });

  app.post('/tasks/:id/delete', async (req: Request, res: Response) => {
    try {
      await deleteTask(Number(req.params.id));
      res.redirect('/?success=task-deleted');
    } catch (error) {
      res.redirect(`/tasks/${req.params.id}?error=task-action-failed`);
    }
  });
}
