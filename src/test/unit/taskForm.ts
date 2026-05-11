import { buildCreateTaskPayload, defaultTaskFormValues, validateCreateTaskForm } from '../../main/services/taskForm';

describe('taskForm', () => {
  test('should report missing required fields', () => {
    const errors = validateCreateTaskForm(defaultTaskFormValues());

    expect(errors.title).toBe('Enter a title');
    expect(errors.dueDate).toBe('Enter a due date and time');
  });

  test('should trim values when building the payload', () => {
    const payload = buildCreateTaskPayload({
      title: '  Prepare bundle  ',
      description: '  Review chronology  ',
      status: 'TODO',
      dueDate: '2030-05-12T10:00',
    });

    expect(payload.title).toBe('Prepare bundle');
    expect(payload.description).toBe('Review chronology');
    expect(payload.status).toBe('TODO');
    expect(payload.dueDate).toBe(new Date('2030-05-12T10:00').toISOString());
  });

  test('should reject a past due date', () => {
    const errors = validateCreateTaskForm({
      title: 'Prepare bundle',
      description: '',
      status: 'TODO',
      dueDate: '2020-05-12T10:00',
    });

    expect(errors.dueDate).toBe('Enter a future due date and time');
  });
});
