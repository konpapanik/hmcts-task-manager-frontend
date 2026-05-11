
import { expect } from 'chai';
import nock from 'nock';
import request from 'supertest';

import { app } from '../../main/app';

describe('Home page', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('on GET', () => {
    test('should render tasks from the backend', async () => {
      nock('http://localhost:4000')
        .get('/tasks')
        .reply(200, [
          {
            id: 1,
            title: 'Prepare hearing bundle',
            description: 'Collect the final draft',
            status: 'TODO',
            dueDate: '2030-05-12T10:00:00',
            createdAt: '2030-05-10T10:00:00',
          },
        ]);

      const response = await request(app)
        .get('/')
        .expect(res => expect(res.status).to.equal(200));

      expect(response.text).to.contain('Manage tasks');
      expect(response.text).to.contain('Prepare hearing bundle');
    });
  });

  describe('on POST /tasks', () => {
    test('should re-render with validation errors for invalid input', async () => {
      nock('http://localhost:4000').get('/tasks').reply(200, []);

      const response = await request(app).post('/tasks').type('form').send({
        title: '',
        description: '',
        status: 'TODO',
        dueDate: '',
      });

      expect(response.status).to.equal(400);
      expect(response.text).to.contain('Enter a title');
      expect(response.text).to.contain('Enter a due date and time');
    });
  });
});
