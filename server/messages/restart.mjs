import { WebSocket } from 'ws';
import { log } from '../logging.mjs';

/** 
 * @typedef {Object} BuzzinBody
 * @property {number} timestamp
 * @property {string} name
 */

/**
 * 
 * @param {*} msg 
 * @returns {BuzzinBody}
 */
const validateBuzzinBody = (msg) => {
  log.info(msg)
  if (typeof msg.timestamp !== 'number') {
    throw new Error('incorrect type for body.timestamp');
  }
  if (typeof msg.name !== 'string') {
    throw new Error('incorrect type for body.name');
  }
  return msg;
}

/** 
 * @param {*} msg
 * @param {import("../app.mjs").Room} room
 * @param {WebSocket} ws
 * @returns {import('../types/OutMessage.mjs').OutMessage}
 */ 
export const restart = (msg, room, ws) => {
  room.state = 'standby';
  room.reset();
  room.broadcast({
    type: 'broadcast',
    action: 'restart',
    body: {},
  }, null);
  return {
    type: 'broadcast',
    action: 'restart',
    body: {}
  }
}