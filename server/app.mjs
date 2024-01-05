import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { processMessage } from './messages/index.mjs';
import { log } from './logging.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clientMap = {};
const roomMap = {};
let roomCount = 0;

export class Room {
  /** @type {'standby' | 'buzzed-waiting' | 'buzzed-resolved'} */
  state;
  /** @type {Array<{name: string, timestamp: number}>} */
  ranks;

  constructor() {
    this.state = 'standby';
    this.ranks = [];
  }

  /**
   * 
   * @param {string} name 
   * @param {number} timestamp 
   */
  addRank(name, timestamp) {
    this.ranks.push({name, timestamp});
    this.ranks = this.ranks.sort((a, b) => a.timestamp - b.timestamp);
    return this.ranks;
  }
}

app.get('/:roomCode', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

wss.on('connection', (ws, req) => {
  const roomCode = req.url.substring(1);

  if (roomCount > 99) {
    log.error('Refusing new connection; socket at max capacity')
    ws.send(JSON.stringify({ error: 'Server is at max capacity.' }))
    ws.close();
    return;
  }
  // Create a new room if it doesn't exist
  if (!clientMap[roomCode]) {
    const room = new Room();
    roomMap[roomCode] = room;
    clientMap[roomCode] = [];
    roomCount += 1;
  }

  clientMap[roomCode].push(ws);

  log.info(`Client connected to room ${roomCode}`);

  ws.on('message', (message) => {
    log.info(`Received in room ${roomCode}: ${message}`);
    const room = roomMap[roomCode];

    const result = processMessage(message.toString(), room, ws);
    if ('error' in result) {
      log.error('websocket error:', result.error);
    }
    ws.send(JSON.stringify(result));
    return;
  });

  ws.on('close', () => {
    log.info(`Client disconnected from room ${roomCode}`);
    clientMap[roomCode] = clientMap[roomCode].filter((client) => client !== ws);
    if (!clientMap[roomCode].length) {
      delete clientMap[roomCode];
      delete roomMap[roomCode];
      roomCount--;
    }
  });
});

server.listen(3000, () => {
  log.info('Server listening on port 3000');
});