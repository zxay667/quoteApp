const express = require('express');
const path = require('path');
const layouts = require('express-ejs-layouts');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(layouts);
app.set('layout', 'layout');

// Routes
app.get('/', (req, res) => {
  const quotes = db.allQuotes();
  res.render('index', { quotes, title: 'Quotes Board' });
});

app.post('/quotes', (req, res) => {
  const { text, author } = req.body;
  if (!text || !text.trim()) return res.status(400).send('Quote text is required');
  const id = db.addQuote(text.trim(), author && author.trim());
  res.redirect(`/quotes/${id}`);
});

app.get('/quotes/:id', (req, res) => {
  const id = Number(req.params.id);
  const quote = db.getQuote(id);
  if (!quote) return res.status(404).send('Quote not found');
  const comments = db.commentsForQuote(id);
  res.render('quote', { quote, comments, title: 'Quote' });
});

app.post('/quotes/:id/comments', (req, res) => {
  const id = Number(req.params.id);
  const { text, author } = req.body;
  if (!text || !text.trim()) return res.status(400).send('Comment text is required');
  db.addComment(id, text.trim(), author && author.trim());
  res.redirect(`/quotes/${id}`);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Quotes app listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
