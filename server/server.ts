/* eslint-disable @typescript-eslint/no-unused-vars -- Remove me */
import 'dotenv/config';
import pg from 'pg';
import express from 'express';
import { ClientError, errorMiddleware } from './lib/index.js';
import { ValidateRequestBody } from './lib/validate-request.js';

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();

app.use(express.json());

//  CREATE
app.post('/api/entries', async (req, res, next) => {
  try {
    const { userId, title, notes, photoUrl } = req.body;
    ValidateRequestBody(req);
    const sql = `
      INSERT INTO "entries" ("userId","title","notes","photoUrl")
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const params = [userId, title, notes, photoUrl];
    const result = await db.query(sql, params);
    const entry = result.rows[0];
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

// READ All
app.get('/api/entries', async (req, res, next) => {
  try {
    const sql = `
      SELECT * FROM "entries";
    `;
    const result = await db.query(sql);
    const entry = result.rows;
    res.status(200).json(entry);
  } catch (err) {
    next(err);
  }
});

// READ One
app.get('/api/entries/:entryId', async (req, res, next) => {
  try {
    const { entryId } = req.params;
    ValidateRequestBody(req);
    const sql = `
      SELECT * FROM "entries"
      WHERE "entryId" = $1;
    `;
    const params = [entryId];
    const result = await db.query(sql, params);
    const entry = result.rows[0];
    if (!entry) throw new ClientError(404, `entry ${entryId} not found`);
    res.status(200).json(entry);
  } catch (err) {
    next(err);
  }
});

//  UPDATE
app.put('/api/entries/:entryId', async (req, res, next) => {
  try {
    const { entryId } = req.params;
    const { userId, title, notes, photoUrl } = req.body;
    ValidateRequestBody(req);
    const sql = `
      UPDATE "entries"
      SET "userId" = $2, "title" = $3, "notes" = $4, "photoUrl" = $5
      WHERE "entryId" = $1
      RETURNING *;
    `;
    const params = [entryId, userId, title, notes, photoUrl];
    const result = await db.query(sql, params);
    const entry = result.rows[0];
    if (!entry) throw new ClientError(404, `entry ${entryId} not found`);
    res.status(200).json(entry);
  } catch (err) {
    next(err);
  }
});

// DELETE
app.delete('/api/entries/:entryId', async (req, res, next) => {
  try {
    const { entryId } = req.params;
    ValidateRequestBody(req);
    const sql = `
      DELETE FROM "entries"
      WHERE "entryId" = $1
      RETURNING *;
    `;
    const params = [entryId];
    const result = await db.query(sql, params);
    const entry = result.rows[0];
    if (!entry) throw new ClientError(404, `entry ${entryId} not found`);
    res.status(204).json(entry);
  } catch (err) {
    next(err);
  }
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});
