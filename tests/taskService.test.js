const taskService = require('../src/services/taskService');

describe('taskService Unit Tests', () => {
  beforeEach(() => {
    taskService._reset();
  });

  test('create() generates default task properties', () => {
    const task = taskService.create({ title: 'Unit test task' });
    expect(task.title).toBe('Unit test task');
    expect(task.id).toBeDefined();
    expect(task.description).toBe('');
    expect(task.status).toBe('todo');
    expect(task.priority).toBe('medium');
    expect(task.dueDate).toBeNull();
    expect(task.completedAt).toBeNull();
    expect(task.createdAt).toBeDefined();
  });

  test('findById() returns task for existing ID and undefined for non-existing ID', () => {
    const created = taskService.create({ title: 'Search me' });
    expect(taskService.findById(created.id)).toEqual(created);
    expect(taskService.findById('fake-id')).toBeUndefined();
  });

  test('getByStatus() filters matching status correctly', () => {
    taskService.create({ title: 'T1', status: 'todo' });
    taskService.create({ title: 'T2', status: 'done' });

    const todoTasks = taskService.getByStatus('todo');
    expect(todoTasks.length).toBe(1);
    expect(todoTasks[0].title).toBe('T1');
  });

  test('getPaginated() calculates offset correctly', () => {
    for (let i = 1; i <= 5; i++) {
      taskService.create({ title: `Task ${i}` });
    }

    const page1 = taskService.getPaginated(1, 2);
    expect(page1.length).toBe(2);
    expect(page1[0].title).toBe('Task 1');
    expect(page1[1].title).toBe('Task 2');
  });

  test('getStats() counts task status and overdue items', () => {
    taskService.create({ title: 'T1', status: 'todo' });
    taskService.create({ title: 'T2', status: 'in_progress' });
    taskService.create({ title: 'T3', status: 'done' });
    
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    taskService.create({ title: 'T4', status: 'todo', dueDate: pastDate });

    const stats = taskService.getStats();
    expect(stats.todo).toBe(2);
    expect(stats.in_progress).toBe(1);
    expect(stats.done).toBe(1);
    expect(stats.overdue).toBe(1);
  });

  test('update(), remove(), and completeTask() work as expected', () => {
    const task = taskService.create({ title: 'Task' });
    
    const updated = taskService.update(task.id, { title: 'Updated' });
    expect(updated.title).toBe('Updated');

    const completed = taskService.completeTask(task.id);
    expect(completed.status).toBe('done');
    expect(completed.completedAt).toBeDefined();

    const removed = taskService.remove(task.id);
    expect(removed).toBe(true);
    expect(taskService.findById(task.id)).toBeUndefined();
  });
});