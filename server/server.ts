/* eslint-disable @typescript-eslint/no-unused-vars -- Remove me */
import 'dotenv/config';
import pg from 'pg';
import argon2 from 'argon2';
import express from 'express';
import jwt from 'jsonwebtoken';
import { ClientError, errorMiddleware, authMiddleware } from './lib/index.js';
import { ValidateRequestBody } from './lib/validate-request.js';

type User = {
  userId: number;
  username: string;
  hashedPassword: string;
};
type Auth = {
  username: string;
  password: string;
};

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const hashKey = process.env.TOKEN_SECRET;
if (!hashKey) throw new Error('TOKEN_SECRET not found in .env');

const app = express();

app.use(express.json());

app.post('/api/auth/sign-up', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ClientError(400, 'username and password are required fields');
    }
    const hashedPassword = await argon2.hash(password);

    const sql = `
      INSERT INTO "users" ("username", "hashedPassword")
      VALUES ($1, $2)
      RETURNING "userId", "username", "createdAt";
    `;
    const result = await db.query(sql, [username, hashedPassword]);
    const user = result.rows[0];
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/sign-in', async (req, res, next) => {
  try {
    const { username, password } = req.body as Partial<Auth>;
    if (!username || !password) {
      throw new ClientError(401, 'invalid login');
    }

    const sql = `
      SELECT "userId", "hashedPassword", "username"
      FROM "users"
      WHERE "username" = $1
    `;

    const result = await db.query(sql, [username]);
    if (!result) {
      throw new ClientError(401, 'invalid login');
    }
    const user = result.rows[0];

    const unhashedPassword = argon2.verify(user.hashedPassword, password);
    if (!unhashedPassword) {
      throw new ClientError(401, 'invalid login');
    }

    const userInfo = {
      userId: user.userId,
      username: user.username,
    };

    const token = jwt.sign(userInfo, hashKey);
    res.status(200).send({ user: userInfo, token });
  } catch (err) {
    next(err);
  }
});

//  CREATE
app.post('/api/entries', authMiddleware, async (req, res, next) => {
  try {
    const { title, notes, photoUrl } = req.body;
    ValidateRequestBody(req);
    const sql = `
      INSERT INTO "entries" ("userId","title","notes","photoUrl")
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const params = [req.user?.userId, title, notes, photoUrl];
    const result = await db.query(sql, params);
    const entry = result.rows[0];
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
});

// READ All
app.get('/api/entries', authMiddleware, async (req, res, next) => {
  try {
    const sql = `
      SELECT * FROM "entries"
      WHERE "userId" = $1;
    `;
    const params = [req.user?.userId];
    const result = await db.query(sql, params);
    const entry = result.rows;
    res.status(200).json(entry);
  } catch (err) {
    next(err);
  }
});

// READ One
app.get('/api/entries/:entryId', authMiddleware, async (req, res, next) => {
  try {
    const { entryId } = req.params;
    ValidateRequestBody(req);
    const sql = `
      SELECT * FROM "entries"
      WHERE "userId" = $1, "entryId" = $2
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
app.put('/api/entries/:entryId', authMiddleware, async (req, res, next) => {
  try {
    const { entryId } = req.params;
    const { title, notes, photoUrl } = req.body;
    ValidateRequestBody(req);
    const sql = `
      UPDATE "entries"
      SET "userId" = $1, "entryId" = $2, title" = $3, "notes" = $4, "photoUrl" = $5
      WHERE "userId" = $1, "entryId" = $2
      RETURNING *;
    `;
    const params = [req.user?.userId, entryId, title, notes, photoUrl];
    const result = await db.query(sql, params);
    const entry = result.rows[0];
    if (!entry) throw new ClientError(404, `entry ${entryId} not found`);
    res.status(200).json(entry);
  } catch (err) {
    next(err);
  }
});

// DELETE
app.delete('/api/entries/:entryId', authMiddleware, async (req, res, next) => {
  try {
    const { entryId } = req.params;
    ValidateRequestBody(req);
    const sql = `
      DELETE FROM "entries"
      WHERE "userId" = $1, "entryId" = $2
      RETURNING *;
    `;
    const params = [req.user?.userId, entryId];
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
