const express   = require('express');
const cors      = require('cors');
const dotenv    = require('dotenv');
const path      = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '5mb' })); // allow base64 image uploads
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Serve frontend files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/profile',  require('./routes/profile'));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Modern Furniture API is running' });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('  Server : http://localhost:' + PORT);
  console.log('  Admin  : http://localhost:' + PORT + '/admin.html');
  console.log('  Profile: http://localhost:' + PORT + '/profile.html');
  console.log('');
});