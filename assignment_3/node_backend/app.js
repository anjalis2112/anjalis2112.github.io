// import packages
const express = require('express');
const cors = require('cors');
const path = require(`path`);
const mongoose = require('mongoose');
const { Double, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS middleware

const FINNHUB_KEY = "cn4rrc1r01qgb8m674g0cn4rrc1r01qgb8m674gg";
const POLY_KEY = "mtPTlyDLSn3iRxUVJsclL6rB3ZvHUyh0";


// Set app to use Express urlencoded middleware
app.use(express.urlencoded({ extended: true }));

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

app.get('/', (req, res) => {
  res.send('CSCI571 HW7');
});

// get autocomplete
app.get('/auto/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  try {
    const response = await fetch(`https://finnhub.io/api/v1/search?q=${ticker}&token=${FINNHUB_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from Finnhub Autocomplete API: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Finnhub Autocomplete API:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// get profile data
app.get('/profile/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  try {
    const response = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${FINNHUB_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from Finnhub profile API: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Finnhub profile API:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// get hourly data
app.get('/hourly/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();

  // today
  const to = new Date().toISOString().split('T')[0];
  const today = new Date();
  // 5 days ago
  today.setDate(today.getDate() - 5);

  const from = today.toISOString().split('T')[0];
  try {
    const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/hour/${from}/${to}?adjusted=true&sort=asc&apiKey=${POLY_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from Polygon Historical API: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Polygon Historical API:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// get historical data
app.get('/history/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  // 2 years ago
  const to = new Date().toISOString().split('T')[0];
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  const from = twoYearsAgo.toISOString().split('T')[0];
  try {
    const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${POLY_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from Polygon Historical API: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Polygon Historical API:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// get stock quote
app.get('/quote/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from Finnhub Quote API: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Finnhub Quote API:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// get news
app.get('/news/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  // 6 months and 1 day ago
  const to = new Date().toISOString().split('T')[0];
  const today = new Date();
  today.setMonth(today.getMonth() - 6);
  today.setDate(today.getDate() - 1);

  const from = today.toISOString().split('T')[0];
  try {
    const response = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${from}&to=${to}&token=${FINNHUB_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from Finnhub News API: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Finnhub News API:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// get trends
app.get('/trends/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  try {
    const response = await fetch(`https://finnhub.io/api/v1/stock/recommendation?symbol=${ticker}&token=${FINNHUB_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from Finnhub Trends API: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Finnhub Trends API:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// get insider sentiment
app.get('/insider/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  try {
    const response = await fetch(`https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${ticker}&from=2022-01-01&token=${FINNHUB_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from Finnhub Insider API: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Finnhub Insider API:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// get company peers
app.get('/peers/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  try {
    const response = await fetch(`https://finnhub.io/api/v1/stock/peers?symbol=${ticker}&token=${FINNHUB_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from Finnhub Peers API: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Finnhub Peers API:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// get company earnings
app.get('/earnings/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  try {
    const response = await fetch(`https://finnhub.io/api/v1/stock/earnings?symbol=${ticker}&token=${FINNHUB_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from Finnhub Earnings API: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Finnhub Earnings API:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

const url = `mongodb+srv://anjalis2112:TFYTXoo95umACfmQ@cluster0.pffywd2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const db = async () => {
  try {
    await mongoose.connect(url);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Could not connect to MongoDB:', error);
  }
};
db();

// schema for db collection
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

// Create model from schema
const Favorite = mongoose.model('Favorite', favoriteSchema, 'favorites'); // 3rd argument specifies the collection name
const Holding = mongoose.model('Holding', holdingSchema, 'holdings');

// get favorites
app.get('/favorites', async (req, res) => {
  try {
    console.log("HELLO inside get fav")
    const favorites = await Favorite.find();
    console.log(favorites);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get holding
app.get('/holdings', async (req, res) => {
  try {
    const holdings = await Holding.find();
    res.json(holdings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// update favorite
app.post('/favorites', async (req, res) => {
  try {

    console.log("HELLO inside post fav");
    // Check if the favorite already exists
    console.log("BODY:", req.body);
    const favorite = await Favorite.findOne({ ticker: req.body.ticker });
    console.log("Favorite", favorite);
    if (favorite) {
      // If the favorite exists, delete it
      await favorite.deleteOne();
      res.json({ message: 'Favorite deleted' });
    } else {
      // If the favorite doesn't exist, add it
      const newFavorite = new Favorite({ ticker: req.body.ticker, name: req.body.name });
      await newFavorite.save();
      res.status(201).json(newFavorite);
    }
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({ message: error.message });
  }
});

// update holding
app.post('/holdings', async (req, res) => {
  try {
    let holding = await Holding.findOne({ ticker: req.body.ticker });

    if (holding) {
      // If holding exists, update it
      const newQuantity = holding.quantity + req.body.quantity;

      // if new quantity is 0, delete the holding
      if (newQuantity === 0) {
        await holding.deleteOne();
        res.json({ message: 'Holding deleted' });
        return;
      }

      const newCost = holding.cost + req.body.cost;

      holding.quantity = newQuantity;
      holding.cost = newCost;

      await holding.save();
      res.status(200).json(holding);
    } else {
      // If holding does not exist, create a new one
      const newHolding = new Holding({
        ticker: req.body.ticker,
        quantity: req.body.quantity,
        cost: req.body.cost
      });
      await newHolding.save();
      res.status(201).json(newHolding);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
