import { Router } from 'express';
import express from 'express';
import path from 'path';
import { app } from '../..';

function router() {
  const route = Router();

  app.use(express.static(path.join(__dirname, 'dist')));
  route.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  return route;
}

export default router;
