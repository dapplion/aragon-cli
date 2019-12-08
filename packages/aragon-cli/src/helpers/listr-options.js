import ListrRenderer from '../reporters/ListrRenderer'

/**
 * https://github.com/SamVerschueren/listr#options
 * https://github.com/SamVerschueren/listr-update-renderer#options
 * https://github.com/SamVerschueren/listr-verbose-renderer#options
 *
 * @param {boolean} silent Option silent
 * @param {boolean} debug Option debug
 * @returns {Object} listr options object
 */
export function listrOpts(silent, debug) {
  return {
    renderer: ListrRenderer(silent, debug),
    dateFormat: false,
  }
}
