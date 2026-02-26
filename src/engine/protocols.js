'use strict';

/**
 * Protocol registry.
 * Future protocols (JSON_PATH_EXTRACTION, XML_XPATH_SELECTION, CAMEL_CASE_SPLIT, NUMERIC_ISOLATION)
 * should be registered here once implemented.
 */
const SUPPORTED_PROTOCOLS = Object.freeze([
  'DELIMITED_STRING_SPLIT'
  // Phase 2:
  // 'JSON_PATH_EXTRACTION',
  // 'XML_XPATH_SELECTION',
  // 'CAMEL_CASE_SPLIT',
  // 'NUMERIC_ISOLATION'
]);

function isSupported(protocol) {
  return SUPPORTED_PROTOCOLS.includes(protocol);
}

module.exports = { SUPPORTED_PROTOCOLS, isSupported };
