import { TaskApiError } from '../../main/services/taskApi';
import { fieldErrorsFromApiError } from '../../main/services/taskForm';

describe('taskApi error mapping', () => {
  test('should map structured backend field errors into form errors', () => {
    const error = new TaskApiError('Validation failed', 400, [
      { field: 'title', message: 'title is required' },
      { field: 'dueDate', message: 'dueDate must be in the future' },
    ]);

    expect(fieldErrorsFromApiError(error)).toEqual({
      title: 'title is required',
      dueDate: 'dueDate must be in the future',
    });
  });
});
