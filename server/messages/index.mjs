import { WebSocket } from "ws";
import { buzzin } from "./buzzin.mjs";
import { restart } from "./restart.mjs";

/** @typedef {import("../types/InMessage.mjs").InMessage} InMessage*/

/**
 * 
 * @param {*} message
 * @returns {InMessage} body
 */
const validateMessage = (message) => {
  if (!message.type) {
    throw Error('No type property on message!');
  }
  if (!message.body) {
    throw Error('No body property on message!');
  }
  return message;
}

/**
 * @param {string} msg 
 * @param {import("../app.mjs").Room} room
 * @param {WebSocket} ws
 */
export const processMessage = (msg, room, ws) => {
  try {
    const message = validateMessage(JSON.parse(msg));

    if (message.type === 'buzzin') {
      return buzzin(message.body, room, ws);
    }

    if (message.type === 'restart') {
      return restart(message.body, room, ws);
    }

  } catch (e) {
    return { error: e }
  }
}