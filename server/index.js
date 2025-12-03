/**
 * TaskFlow AI - Backend Reference Implementation
 * 
 * Required Dependencies:
 * npm install express cors helmet morgan mongoose jsonwebtoken bcryptjs dotenv
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/taskflow')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// --- Mongoose Models ---
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  avatar: String
});

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'], default: 'TODO' },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);

// --- Middleware: Auth ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Routes: Health ---
app.get('/', (req, res) => {
  res.send('TaskFlow AI API is running');
});

// --- Routes: Auth ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
    
    const user = new User({ name, email, password: hashedPassword, avatar });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secret_key');
    res.json({ user: { id: user._id, name, email, avatar }, token });
  } catch (err) {
    res.status(400).json({ message: 'User already exists or invalid data' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secret_key');
    res.json({ user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Routes: Tasks ---
app.get('/api/tasks', authenticateToken, async (req, res) => {
  const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(tasks);
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  const task = new Task({ ...req.body, userId: req.user.id });
  await task.save();
  res.json(task);
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id }, 
    req.body, 
    { new: true }
  );
  res.json(task);
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  await Task.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ message: 'Deleted' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});