/**
 * @typedef {Object} OutMessage
 * @property {'response' | 'broadcast'| 'silent'} type - The type of the response message.
 * @property {string | null} action
 * @property {Record<string, any>} body - The body of the response message.
 * @property {string} [error] - Optional error message.
 */
