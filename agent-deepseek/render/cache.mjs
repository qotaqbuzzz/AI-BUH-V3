/**
 * cache.mjs — Short-lived in-process cache for raw answer markdown.
 *
 * Stores the raw answer string so PDF/Excel export buttons can
 * re-render on demand without re-running the LLM.
 * Bounded to MAX_ENTRIES to prevent unbounded growth.
 */

const MAX_ENTRIES = 200;

/** @type {Map<string, string>} */
const _store = new Map();

function _randomKey() {
  return Math.random().toString(36).slice(2, 12);
}

/**
 * Store an answer and return a cache key.
 * @param {string} answer  Raw markdown answer from the agent
 * @returns {string}       10-char cache key
 */
export function put(answer) {
  const key = _randomKey();
  _store.set(key, answer);
  if (_store.size > MAX_ENTRIES) {
    const oldest = _store.keys().next().value;
    _store.delete(oldest);
  }
  return key;
}

/**
 * Retrieve a cached answer by key.
 * @param {string} key
 * @returns {string|null}
 */
export function get(key) {
  return _store.get(key) ?? null;
}
