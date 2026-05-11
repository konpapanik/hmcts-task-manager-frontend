import { Task, TaskStatus } from './taskApi';

export type TaskViewModel = Task & {
  descriptionText: string;
  dueDateText: string;
  createdAtText: string;
  statusLabel: string;
  statusClass: string;
};

const statusLabels: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

const statusClasses: Record<TaskStatus, string> = {
  TODO: 'govuk-tag govuk-tag--blue',
  IN_PROGRESS: 'govuk-tag govuk-tag--yellow',
  DONE: 'govuk-tag govuk-tag--green',
};

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function toTaskViewModel(task: Task): TaskViewModel {
  return {
    ...task,
    descriptionText: task.description || 'No description provided',
    dueDateText: formatDateTime(task.dueDate),
    createdAtText: formatDateTime(task.createdAt),
    statusLabel: statusLabels[task.status],
    statusClass: statusClasses[task.status],
  };
}

export function toTaskTableRows(tasks: TaskViewModel[]): { text?: string; html?: string }[][] {
  return tasks.map(task => [
    { text: task.title },
    { text: task.dueDateText },
    { html: `<strong class="${task.statusClass}">${task.statusLabel}</strong>` },
    {
      html: [
        `<a class="govuk-link" href="/tasks/${task.id}">View</a>`,
        `<form action="/tasks/${task.id}/delete" method="post" class="govuk-!-display-inline-block govuk-!-margin-left-3">`,
        '<button type="submit" class="govuk-link govuk-link--no-visited-state">Delete</button>',
        '</form>',
      ].join(''),
    },
  ]);
}
