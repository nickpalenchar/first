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

const staticAssetPath = path.join(__dirname, 'client-scripts');

app.use('/client-scripts', express.static(staticAssetPath));

const clientMap = {};
/** @type {Object<string, Room>} */
const roomMap = {};
let roomCount = 0;

export class Room {
  /** @type {string} */
  _code;
  /** @type {'standby' | 'buzzed-waiting' | 'buzzed-prelim' | 'buzzed-resolved'} */
  state;
  /** @type {Array<{name: string, timestamp: number}>} */
  ranks;
  /** @type {Array<string>} */
  _namesRanked;
  /** @type {number} timeouts that started before this time should be discarded. */
  _notBefore;

  constructor(code) {
    this._code = code;
    this.state = 'standby';
    this.ranks = [];
    this._namesRanked = [];
    this._notBefore = Date.now()
  }
  /** @returns {number} */
  get numPlayers() {
    return clientMap[this._code].length;
  }
  /**
   * 
   * @param {string} name 
   * @param {number} timestamp 
   */
  addRank(name, timestamp) {
    if(this._namesRanked.includes(name)) {
      log.warn('name already ranked', { name, roomCode: this._code});
      return null;
    }
    this._namesRanked.push(name);
    this.ranks.push({name, timestamp});
    this.ranks = this.ranks.sort((a, b) => a.timestamp - b.timestamp);
    return this.ranks;
  }
  reset() {
    this._namesRanked = [];
    this.ranks = [];
    this._notBefore = Date.now();
  }

  /**
   * @param {import('./types/OutMessage.mjs').OutMessage} msg 
   * @param {*} ws pass null to broadcast to all, or ws to ignore that ws client
   */
  broadcast(msg, ws) {
    log.info('looking for ' + this._code);
    clientMap[this._code].forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(msg));
      }
    });
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
    const room = new Room(roomCode);
    roomMap[roomCode] = room;
    clientMap[roomCode] = [];
    roomCount += 1;
  }

  clientMap[roomCode].push(ws);

  /** @type {import('./types/OutMessage.mjs').OutMessage} */
  const startMessage = {
    type: 'broadcast',
    action: 'numPlayers',
    body: {
      numPlayers: roomMap[roomCode].numPlayers,
    }
  }
  ws.send(JSON.stringify(startMessage));
  roomMap[roomCode].broadcast(startMessage, ws);

  log.info(`Client connected to room ${roomCode}`);

  ws.on('message', (message) => {
    log.info(`Received in room ${roomCode}: ${message}`);
    const room = roomMap[roomCode];

    const result = processMessage(message.toString(), room, ws);
    if ('error' in result) {
      log.error('websocket error:', result.error);
    }
    log.info('Sending Message', result);
    ws.send(JSON.stringify(result));
    return;
  });

  ws.on('close', () => {
    log.info(`Client disconnected from room ${roomCode}`);
    clientMap[roomCode] = clientMap[roomCode].filter((client) => client !== ws);
    if (!clientMap[roomCode].length) {
      log.info('Purging up empty room', { roomCode })
      delete clientMap[roomCode];
      delete roomMap[roomCode];
      roomCount--;
    }
  });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

server.listen(PORT, () => {
  log.info(`Server listening on port ${PORT}`);
});