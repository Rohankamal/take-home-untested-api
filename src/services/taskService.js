const { v4: uuidv4 } = require('uuid');

let tasks = [];

const _reset = () => {
  tasks = [];
};

const getAll = () => {
  return tasks;
};

const findById = (id) => {
  return tasks.find((t) => t.id === id);
};

const getByStatus = (status) => {
  return tasks.filter((t) => t.status === status);
};

const getPaginated = (page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, parseInt(limit, 10) || 10);
  
  // FIX: Fixed pagination offset calculation
  const offset = (p - 1) * l;
  return tasks.slice(offset, offset + l);
};

const getStats = () => {
  const stats = {
    todo: 0,
    in_progress: 0,
    done: 0,
    overdue: 0,
  };

  const now = new Date();

  tasks.forEach((task) => {
    if (task.status === 'todo') stats.todo++;
    else if (task.status === 'in_progress') stats.in_progress++;
    else if (task.status === 'done') stats.done++;

    if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'done') {
      stats.overdue++;
    }
  });

  return stats;
};

const create = (data) => {
  const newTask = {
    id: data.id || uuidv4(),
    title: data.title,
    description: data.description || '',
    status: data.status || 'todo',
    priority: data.priority || 'medium',
    dueDate: data.dueDate || null,
    assignee: data.assignee || null,
    completedAt: null,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  return newTask;
};

const update = (id, data) => {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;

  tasks[index] = {
    ...tasks[index],
    ...data,
  };

  return tasks[index];
};

const remove = (id) => {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return false;

  tasks.splice(index, 1);
  return true;
};

const completeTask = (id) => {
  const task = findById(id);
  if (!task) return null;

  task.status = 'done';
  task.completedAt = new Date().toISOString();
  return task;
};

const assignTask = (id, assignee) => {
  const task = findById(id);
  if (!task) return null;

  task.assignee = assignee;
  return task;
};

module.exports = {
  _reset,
  getAll,
  findById,
  getByStatus,
  getPaginated,
  getStats,
  create,
  update,
  remove,
  completeTask,
  assignTask,
};