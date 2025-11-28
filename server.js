const app = require('./app');
const connectDB = require('./config/db');

connectDB();

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
