/**
 * @external {Projext}
 * https://homer0.github.io/projext/class/src/app/index.js~Projext.html
 */

/**
 * @external {Target}
 * https://homer0.github.io/projext/typedef/index.html#static-typedef-Target
 */

/**
 * @external {Targets}
 * https://homer0.github.io/projext/class/src/services/targets/targets.js~Targets.html
 */

/**
 * @typedef {Object} FileRuleGlobs
 * @property {Array} include A list of glob patterns for paths that should be included when
 *                           searching for files.
 * @property {Array} exclude A list of glob patterns for paths that shouldn't be included when
 *                           searching for files.
 */

/**
 * @typedef {Object} FileRule
 * @property {Array}          include A list of regular expressions for paths that should be
 *                                    included when searching for files.
 * @property {Array}          exclude A list of regular expressions for paths that shouldn't be
 *                                    included when searching for files.
 * @property {?FileRuleGlobs} glob    Plugins that use an old version of `rollup-pluginutils`,
 *                                    don't have support for regular expressions for paths, so
 *                                    _"glob alternatives"_ are included on this property.
 */
