import { buzzin } from "./buzzin.mjs";

/**
 * 
 * @param {*} message
 * @returns {{ type: string, body: string }} body
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
 */
export const processMessage = (msg) => {
  try {
    const message = validateMessage(JSON.parse(msg));

    if (message.type === 'buzzin') {
      return buzzin(message.body);
    }

  } catch (e) {
    return { error: e }
  }
}