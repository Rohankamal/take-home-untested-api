const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Tasks Integration Tests', () => {
  beforeEach(() => {
    taskService._reset();
  });

  test('GET /tasks returns empty array initially', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('GET /tasks?status=todo filters tasks', async () => {
    taskService.create({ title: 'T1', status: 'todo' });
    taskService.create({ title: 'T2', status: 'done' });

    const res = await request(app).get('/tasks?status=todo');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('T1');
  });

  test('GET /tasks pagination works on page 1', async () => {
    taskService.create({ title: 'T1' });
    taskService.create({ title: 'T2' });
    taskService.create({ title: 'T3' });

    const res = await request(app).get('/tasks?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].title).toBe('T1');
  });

  test('POST /tasks creates a new task', async () => {
    const res = await request(app).post('/tasks').send({
      title: 'Write tests',
      description: 'Testing API',
      priority: 'high',
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('Write tests');
  });

  test('PUT /tasks/:id updates existing task', async () => {
    const task = taskService.create({ title: 'Old Task' });

    const res = await request(app).put(`/tasks/${task.id}`).send({
      title: 'Updated task',
      priority: 'high',
    });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated task');
  });

  test('DELETE /tasks/:id deletes task', async () => {
    const task = taskService.create({ title: 'Delete me' });

    const res = await request(app).delete(`/tasks/${task.id}`);
    expect(res.status).toBe(204);
  });

  test('PATCH /tasks/:id/complete marks task as done', async () => {
    const task = taskService.create({ title: 'Incomplete' });

    const res = await request(app).patch(`/tasks/${task.id}/complete`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('done');
    expect(res.body.completedAt).not.toBeNull();
  });

  test('GET /tasks/stats returns task status count', async () => {
    taskService.create({ title: 'T1', status: 'todo' });
    taskService.create({ title: 'T2', status: 'done' });

    const res = await request(app).get('/tasks/stats');
    expect(res.status).toBe(200);
    expect(res.body.todo).toBe(1);
    expect(res.body.done).toBe(1);
  });

  // Edge Cases
  test('Edge Case 1: POST without title returns 400', async () => {
    const res = await request(app).post('/tasks').send({});
    expect(res.status).toBe(400);
  });

  test('Edge Case 2: POST with invalid priority returns 400', async () => {
    const res = await request(app).post('/tasks').send({
      title: 'Test',
      priority: 'super-high',
    });
    expect(res.status).toBe(400);
  });

  test('Edge Case 3: PUT non-existing ID returns 404', async () => {
    const res = await request(app).put('/tasks/fake-id').send({ title: 'New' });
    expect(res.status).toBe(404);
  });

  test('Edge Case 4: DELETE non-existing ID returns 404', async () => {
    const res = await request(app).delete('/tasks/fake-id');
    expect(res.status).toBe(404);
  });

  test('Edge Case 5: PATCH complete non-existing task returns 404', async () => {
    const res = await request(app).patch('/tasks/fake-id/complete');
    expect(res.status).toBe(404);
  });

  // Assign Endpoint Tests
  test('PATCH /tasks/:id/assign successfully assigns assignee', async () => {
    const task = taskService.create({ title: 'Assign Task' });

    const res = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({ assignee: 'Rohan' });

    expect(res.status).toBe(200);
    expect(res.body.assignee).toBe('Rohan');
  });

  test('PATCH /tasks/:id/assign returns 404 for non-existing task', async () => {
    const res = await request(app)
      .patch('/tasks/fake-id/assign')
      .send({ assignee: 'Rohan' });

    expect(res.status).toBe(404);
  });

  test('PATCH /tasks/:id/assign validation (empty string, whitespace, non-string)', async () => {
    const task = taskService.create({ title: 'Assign Task' });

    const res1 = await request(app).patch(`/tasks/${task.id}/assign`).send({ assignee: '' });
    expect(res1.status).toBe(400);

    const res2 = await request(app).patch(`/tasks/${task.id}/assign`).send({ assignee: '   ' });
    expect(res2.status).toBe(400);

    const res3 = await request(app).patch(`/tasks/${task.id}/assign`).send({ assignee: 123 });
    expect(res3.status).toBe(400);
  });

  test('PATCH /tasks/:id/assign allows reassignment', async () => {
    const task = taskService.create({ title: 'Reassign Task' });

    await request(app).patch(`/tasks/${task.id}/assign`).send({ assignee: 'Rohan' });
    const res = await request(app).patch(`/tasks/${task.id}/assign`).send({ assignee: 'Aman' });

    expect(res.status).toBe(200);
    expect(res.body.assignee).toBe('Aman');
  });


  test('GET /tasks/:id returns 200 for existing task and 404 for missing task', async () => {
    const task = taskService.create({ title: 'Single Task' });
    
    const resFound = await request(app).get(`/tasks/${task.id}`);
    expect(resFound.status).toBe(200);
    expect(resFound.body.title).toBe('Single Task');

    const resNotFound = await request(app).get('/tasks/fake-id-123');
    expect(resNotFound.status).toBe(404);
  });

  test('PUT /tasks/:id validation errors (empty title, invalid priority)', async () => {
    const task = taskService.create({ title: 'Valid Task' });

    const res1 = await request(app).put(`/tasks/${task.id}`).send({ title: '' });
    expect(res1.status).toBe(400);

    const res2 = await request(app).put(`/tasks/${task.id}`).send({ priority: 'invalid-priority' });
    expect(res2.status).toBe(400);
  });
});
