/**
 * The MAINTENANCE_MODE constant dictates which API handlers are enabled and may
 * have one of the following values:
 *
 * -- = no reading or writing
 * r- = read only mode
 * rw = read and write (normal operation)
 */
import { maintenance } from '../constants.js'
import { HTTPError } from '../errors.js'

/**
 * @typedef {'rw' | 'r-' | '--'} Mode
 * @typedef {import('../utils/router.js').Handler} Handler
 */

const currentModeBits = modeBits(maintenance.mode)

/** @type {Mode[]} */
const modes = ['--', 'r-', 'rw']

export const R = 'r-'
export const RW = 'rw'

export function getMaintenanceMode() {
  return maintenance.mode
}

/**
 * Specify the mode (permissions) a request hander requires to operate e.g.
 * r- = only needs read permission so enabled in read-only AND read+write modes.
 * rw = needs to read and write so only enabled in read+write mode.
 *
 * @param {Handler} handler
 * @param {Mode} mode
 * @returns {Handler}
 */
export function withMode(handler, mode) {
  const enabled = modeBits(mode).every((bit, i) => {
    if (bit === '-') return true
    return currentModeBits[i] === bit
  })
  return enabled ? handler : maintenanceHandler
}

/**
 * @param {any} m
 * @returns {string[]}
 */
function modeBits(m) {
  if (!modes.includes(m)) {
    throw new HTTPError(
      `invalid maintenance mode, wanted one of ${modes} but got "${m}"`,
      503
    )
  }
  return m.split('')
}

/**
 * @returns {never}
 */
function maintenanceHandler() {
  const url = 'https://status.nft.storage'
  throw new Error(`API undergoing maintenance, check ${url} for more info`)
}
