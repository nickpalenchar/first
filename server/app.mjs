import WebSocket from 'ws';
import http from 'http';
import express from 'express';
import path from 'path';
import winston from 'winston';

const log = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ]
});

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const roomMap = {};
let roomCount = 0;

app.get('/:roomCode', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

wss.on('connection', (ws, req) => {
  const roomCode = req.url.substring(1); // Extract room code from the URL

  if (roomCount > 99) {
    ws.send(JSON.stringify({ error: 'Server is at max capacity.'}))
    ws.close();
    return;
  }
  // Create a new room if it doesn't exist
  if (!roomMap[roomCode]) {
    roomMap[roomCode] = [];
    roomCount += 1;
  }

  roomMap[roomCode].push(ws);

  log.info(`Client connected to room ${roomCode}`);

  ws.on('message', (message) => {
    log.info(`Received in room ${roomCode}: ${message}`);

    roomMap[roomCode].forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(`Room ${roomCode}: ${message}`);
      }
    });
  });

  ws.on('close', () => {
    log.info(`Client disconnected from room ${roomCode}`);
    roomMap[roomCode] = roomMap[roomCode].filter((client) => client !== ws);
    if (!roomMap[roomCode].length) {
      delete roomMap[roomCode];
      roomCount--;
    }
  });
});

server.listen(3000, () => {
  log.info('Server listening on port 3000');
});