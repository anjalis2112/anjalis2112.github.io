// Import required packages
const express = require('express');
const cors = require('cors');
const path = require(`path`);
const mongoose = require('mongoose');
const { Double, ObjectId } = require('mongodb');

// Create Express app
const app = express();

// Middleware setup
app.use(express.static(path.join(__dirname, './dist/angular-frontend/browser'), {
  setHeaders: (res, path, stat) => {
      if (path.endsWith('.js')) {
      res.set('Content-Type', 'application/javascript');
      }
  }
}));

app.use(express.json());
app.use(cors()); // Enable CORS middleware
app.use(express.urlencoded({ extended: true })); // Use Express urlencoded middleware

// Constants
const FINNHUB_KEY = "cn4rrc1r01qgb8m674g0cn4rrc1r01qgb8m674gg";
const POLY_KEY = "mtPTlyDLSn3iRxUVJsclL6rB3ZvHUyh0";

// MongoDB connection
const url = `mongodb+srv://anjalis2112:TFYTXoo95umACfmQ@cluster0.pffywd2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const connectDB = async () => {
  try {
    await mongoose.connect(url);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Could not connect to MongoDB:', error);
  }
};
connectDB();

// Define MongoDB schema
const favoriteSchema = new mongoose.Schema({
  id: ObjectId,
  ticker: String,
  name: String,
});
const holdingSchema = new mongoose.Schema({
  id: ObjectId,
  ticker: String,
  quantity: Number,
  cost: Number, // total cost
});
const moneySchema = new mongoose.Schema({
  money: Number,
});

// Create MongoDB models
const Favorite = mongoose.model('Favorite', favoriteSchema, 'favorites');
const Holding = mongoose.model('Holding', holdingSchema, 'holdings');
const MoneyDetails = mongoose.model('Money', moneySchema, 'money');

// Routes

// Root route
app.get('/', (req, res) => {
  res.send('CSCI571 HW7');
});

// Autocomplete route
app.get('/auto/:ticker', async (req, res) => {
  // Autocomplete logic
});

// Profile data route
app.get('/profile/:ticker', async (req, res) => {
  // Profile data logic
});

// Hourly data route
app.get('/hourly/:ticker', async (req, res) => {
  // Hourly data logic
});

// Historical data route
app.get('/history/:ticker', async (req, res) => {
  // Historical data logic
});

// Stock quote route
app.get('/quote/:ticker', async (req, res) => {
  // Stock quote logic
});

// News route
app.get('/news/:ticker', async (req, res) => {
  // News logic
});

// Trends route
app.get('/trends/:ticker', async (req, res) => {
  // Trends logic
});

// Insider sentiment route
app.get('/insider/:ticker', async (req, res) => {
  // Insider sentiment logic
});

// Company peers route
app.get('/peers/:ticker', async (req, res) => {
  // Company peers logic
});

// Company earnings route
app.get('/earnings/:ticker', async (req, res) => {
  // Company earnings logic
});

// Favorites route
app.get('/favorites', async (req, res) => {
  // Get favorites logic
});

// Holdings route
app.get('/holdings', async (req, res) => {
  // Get holdings logic
});

// Update favorite route
app.post('/favorites', async (req, res) => {
  // Update favorite logic
});

// Update holding route
app.post('/holdings', async (req, res) => {
  // Update holding logic
});

// Get money route
app.get('/money', (req, res) => {
  // Get money logic
});

// Update money route
app.post('/update-money', (req, res) => {
  // Update money logic
});

// Catch-all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './dist/angular-frontend/browser/index.html'));
});
