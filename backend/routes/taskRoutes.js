const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const verifyToken = require('../middlewares/authMiddleware');

// ✅ GET: Fetch Tasks
router.get('/', verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.email });
    res.json({ tasks });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// ✅ POST: Create Task (Fixed)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, type, deadline } = req.body;
    const newTask = new Task({
      title,
      description,
      type,
      createdBy: req.user.email,
      createdAt: new Date(),
      deadline,
    });

    await newTask.save();

    const io = req.app.get('io');
    io.emit('task-updated', { message: 'New Task Added' });

    res.status(201).json({ message: "Task saved successfully" });
  } catch (err) {
    console.error('Error saving task:', err);
    res.status(500).json({ message: "Error saving task" });
  }
});

// ✅ PUT: Update Task (Fixed)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        deadline: req.body.deadline,
        status: req.body.status,
      },
      { new: true }
    );

    const io = req.app.get('io');
    io.emit('task-updated', { message: 'Task Modified' });

    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: "Failed to update task" });
  }
});

// ✅ DELETE: Delete Task (Fixed)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    io.emit('task-updated', { message: 'Task Deleted' });

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: "Failed to delete task" });
  }
});

// ✅ PATCH: Update task status (Optional - no socket needed here unless required)
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    const io = req.app.get('io');
    io.emit('task-updated', { message: 'Task Status Updated' });

    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task status:', err);
    res.status(500).json({ message: "Failed to update task status" });
  }
});

module.exports = router;
