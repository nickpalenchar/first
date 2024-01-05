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
  if (typeof msg.timestamp !== 'number') {
    throw new Error('incorrect type for body.timestamp');
  }
  if (typeof msg.timestamp !== 'string') {
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
export const buzzin = (msg, room, ws) => {
  log.info('got buzzin', msg);
  const validation = validateBuzzinBody(msg);
  const { name, timestamp } = validation;

  if (room.state === 'standby') {
    // you might be the f1rst!
    room.addRank(name, timestamp);
    room.state = 'buzzed-waiting';
  }
    // discard
    return {
      type: 'silent',
      body: {}
    }

} 