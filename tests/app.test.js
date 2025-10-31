const request = require('supertest');

// Use in-memory DB for tests before the app (and db) are loaded
process.env.DB_PATH = ':memory:';

const app = require('../src/server');

describe('Quotes Board', () => {
  test('GET / returns 200 and renders page', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Quotes Board');
  });

  test('POST /quotes creates a quote and redirects to its page', async () => {
    const res = await request(app)
      .post('/quotes')
      .type('form')
      .send({ text: 'Hello Jest', author: 'Tester' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/^\/quotes\/\d+$/);

    const show = await request(app).get(res.headers.location);
    expect(show.status).toBe(200);
    expect(show.text).toContain('Hello Jest');
    expect(show.text).toContain('Tester');
  });

  test('POST /quotes/:id/comments adds a comment', async () => {
    // Create a quote first
    const created = await request(app)
      .post('/quotes')
      .type('form')
      .send({ text: 'Quote for comments', author: 'A' });
    const loc = created.headers.location;

    const commented = await request(app)
      .post(`${loc}/comments`)
      .type('form')
      .send({ text: 'Nice!', author: 'B' });

    expect(commented.status).toBe(302);

    const show = await request(app).get(loc);
    expect(show.text).toContain('Nice!');
    expect(show.text).toContain('B');
  });
});
