'use strict';

/**
 * Pre-compiled regex cache keyed by delimiter string.
 * Compiled once at call-time and reused across requests for O(1) cache hits.
 */
const regexCache = new Map();

/**
 * Build or retrieve cached split regex for a given delimiter.
 * Handles multi-consecutive delimiter collapsing.
 */
function getSplitRegex(delimiter) {
  if (regexCache.has(delimiter)) return regexCache.get(delimiter);
  // Escape special regex chars in the delimiter
  const escaped = delimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`${escaped}+`, 'u'); // 'u' flag for full Unicode support
  regexCache.set(delimiter, pattern);
  return pattern;
}

/**
 * tokenize()
 * @param {object} opts
 * @param {string} opts.protocol        - Parsing protocol identifier
 * @param {string} opts.splitDelimiter  - Character(s) used to split payload
 * @param {string} opts.joinDelimiter   - Character(s) used to join output tokens
 * @param {string} opts.payload         - Raw payload data string
 * @returns {{ tokens: string, tokenCount: number }}
 */
function tokenize({ protocol, splitDelimiter, joinDelimiter, payload }) {
  if (protocol !== 'DELIMITED_STRING_SPLIT') {
    const err = new Error(`Unsupported protocol: ${protocol}`);
    err.code = 'UNSUPPORTED_PROTOCOL';
    throw err;
  }

  // Empty payload fast path
  if (payload === '') {
    return { tokens: '', tokenCount: 0 };
  }

  const regex = getSplitRegex(splitDelimiter);

  // Split, then filter out empty strings (handles leading/trailing delimiters)
  const parts = payload.split(regex).filter((t) => t.length > 0);

  const tokens = parts.join(joinDelimiter);

  return { tokens, tokenCount: parts.length };
}

module.exports = { tokenize };
