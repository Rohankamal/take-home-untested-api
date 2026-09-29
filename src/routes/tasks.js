const express = require('express');
const router = express.Router();
const taskService = require('../services/taskService');

const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_STATUSES = ['todo', 'in_progress', 'done'];

// GET /tasks/stats
router.get('/stats', (req, res) => {
  const stats = taskService.getStats();
  res.json(stats);
});

// GET /tasks
router.get('/', (req, res) => {
  const { status, page, limit } = req.query;

  if (status) {
    const tasks = taskService.getByStatus(status);
    return res.json(tasks);
  }

  if (page || limit) {
    const tasks = taskService.getPaginated(page, limit);
    return res.json(tasks);
  }

  const tasks = taskService.getAll();
  res.json(tasks);
});

// GET /tasks/:id
router.get('/:id', (req, res) => {
  const task = taskService.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// POST /tasks
router.post('/', (req, res) => {
  const { title, description, priority, status, dueDate } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required and must be a non-empty string' });
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority' });
  }

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const newTask = taskService.create({
    title: title.trim(),
    description,
    priority,
    status,
    dueDate,
  });

  res.status(201).json(newTask);
});

// PUT /tasks/:id
router.put('/:id', (req, res) => {
  const existingTask = taskService.findById(req.params.id);
  if (!existingTask) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, priority } = req.body;

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ error: 'Title cannot be empty' });
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority' });
  }

  const updatedTask = taskService.update(req.params.id, req.body);
  res.json(updatedTask);
});

// DELETE /tasks/:id
router.delete('/:id', (req, res) => {
  const deleted = taskService.remove(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.status(204).send();
});

// PATCH /tasks/:id/complete
router.patch('/:id/complete', (req, res) => {
  const task = taskService.completeTask(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// PATCH /tasks/:id/assign
router.patch('/:id/assign', (req, res) => {
  const { assignee } = req.body;

  if (typeof assignee !== 'string' || assignee.trim() === '') {
    return res.status(400).json({
      error: 'assignee must be a non-empty string',
    });
  }

  const task = taskService.assignTask(req.params.id, assignee.trim());

  if (!task) {
    return res.status(404).json({
      error: 'Task not found',
    });
  }

  res.json(task);
});

module.exports = router;