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
export const buzzin = (msg, room, ws) => {
  log.info('got buzzin', msg);
  const validation = validateBuzzinBody(msg);
  const { name, timestamp } = validation;

  if (room.state === 'standby') {
    // you might be the f1rst!
    room.addRank(name, timestamp);
    // STATE 1: Entered input, show no results.
    room.state = 'buzzed-waiting';
    room.broadcast({
      type: 'broadcast',
      action: 'STATE_CHANGE',
      body: { state: 'buzzed-waiting' }
    }, null);
    setTimeout(() => {
      if (room.state === 'buzzed-resolved') {
        return { type: 'silent' , action: null, body: {} };
      }
      console.log('ROOM?', { room });
      // STATE 2: show preliminary results (they may still change)
      if (room.ranks.length === room.numPlayers) {
        // jump straight to the end, this is the last result.
        room.state = 'buzzed-resolved';
        room.broadcast({
          type: 'broadcast',
          action: 'STATE_CHANGE',
          body: {
            state: 'buzzed-resolved', ranks: room.ranks,
          }
        }, null)
        return { type: 'silent' , action: null, body: {} };
      }
      room.state = 'buzzed-prelim';
      room.broadcast({
        type: 'broadcast',
        action: 'STATE_CHANGE',
        body: { state: 'buzzed-prelim', ranks: room.ranks }
      }, null);
      setTimeout(() => {
        if (room.state === 'buzzed-prelim') {
          return { type: 'silent' , action: null, body: {} };
        }
        // STATE 3: show final results
        room.state = 'buzzed-resolved';
        room.broadcast({
          type: 'broadcast',
          action: 'STATE_CHANGE',
          body: { state: 'buzzed-resolved', ranks: room.ranks },
        }, null);
      }, 10000);
    }, 360);
  } else if (room.state === 'buzzed-prelim' || room.state === 'buzzed-waiting') {
    const added = room.addRank(name, timestamp);
    if (added) {
      if (room.ranks.length === room.numPlayers) {
        // jump straight to the end, this is the last result.
        room.state = 'buzzed-resolved';
        room.broadcast({
          type: 'broadcast',
          action: 'STATE_CHANGE',
          body: {
            state: 'buzzed-resolved', ranks: room.ranks,
          }
        }, null)
        return { type: 'silent' , action: null, body: {} };
      } else {
        room.broadcast({
          type: 'broadcast',
          action: 'NEW_RANKS',
          body: { ranks: room.ranks }
        }, null)
      }
    }
  }
    // discard
    return {
      type: 'silent',
      action: null,
      body: {}
    }
} 