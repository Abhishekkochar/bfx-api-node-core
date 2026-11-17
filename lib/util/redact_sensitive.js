'use strict'

// NOTE: keep in sync with the credential fields produced by lib/util/get_auth_params.js
const SENSITIVE_KEYS = ['apiKey', 'authSig', 'authPayload', 'authNonce', 'token']

/**
 * Returns a copy of the message safe for logging, with auth credentials
 * replaced. Non-object messages (i.e. arrays for order ops) are returned as-is.
 *
 * @param {*} msg
 * @returns {*} safeMsg
 */
const redact = (msg) => {
  if (!msg || typeof msg !== 'object' || Array.isArray(msg)) {
    return msg
  }

  const safe = { ...msg }

  for (const key of SENSITIVE_KEYS) {
    if (key in safe) {
      safe[key] = '[REDACTED]'
    }
  }

  return safe
}

module.exports = redact
