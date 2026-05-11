
import { expect } from 'chai';
import nock from 'nock';
import request from 'supertest';

import { app } from '../../main/app';

describe('Task details routes', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  test('should render the task details page', async () => {
    nock('http://localhost:4000').get('/tasks/7').reply(200, {
      id: 7,
      title: 'Review witness statement',
      description: 'Check the chronology section',
      status: 'IN_PROGRESS',
      dueDate: '2030-05-12T10:00:00',
      createdAt: '2030-05-10T10:00:00',
    });

    const response = await request(app).get('/tasks/7');

    expect(response.status).to.equal(200);
    expect(response.text).to.contain('Review witness statement');
    expect(response.text).to.contain('Update status');
  });

  test('should redirect after a successful status update', async () => {
    nock('http://localhost:4000').patch('/tasks/7/status', { status: 'DONE' }).reply(200, {
      id: 7,
      title: 'Review witness statement',
      description: 'Check the chronology section',
      status: 'DONE',
      dueDate: '2030-05-12T10:00:00',
      createdAt: '2030-05-10T10:00:00',
    });

    const response = await request(app).post('/tasks/7/status').type('form').send({ status: 'DONE' });

    expect(response.status).to.equal(302);
    expect(response.headers.location).to.equal('/tasks/7?success=task-updated');
  });
});
