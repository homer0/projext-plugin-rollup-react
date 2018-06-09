/**
 * It updates targets Babel configuration in order to add support for JSX. And if a target
 * implements SSR, it takes care of including the paths of the target to serve on the rules
 * for Rollup to process/transpile.
 */
class ProjextReactPlugin {
  /**
   * Class constructor.
   */
  constructor() {
    /**
     * The name of the event triggered when the files rules of a target are created. This service
     * will listen for it, and if the target implements SSR, it will add the other target(s) to the
     * file rules.
     * @type {string}
     * @access protected
     * @ignore
     */
    this._rulesEvent = 'target-file-rules';
    /**
     * The name of the reducer event the service will listen for in order to exclude React packages
     * from the bundle when the target is Node or when is a library for the browser.
     * @type {string}
     * @access protected
     * @ignore
     */
    this._externalSettingsEventName = 'rollup-external-plugin-settings-configuration';
    /**
     * The list of React packages that should never end up on the bundle. For browser targets,
     * this is only if the target is also a library.
     * @type {Array}
     * @access protected
     * @ignore
     */
    this._externalModules = [
      'react',
      'react-dom',
      'react-dom/server',
    ];
    /**
     * The name of the reducer event the service will listen for in order to add support for JSX
     * when a target is bundled.
     * @type {string}
     * @access protected
     * @ignore
     */
    this._babelConfigurationEvent = 'babel-configuration';
    /**
     * The required Babel plugin for the JSX integration of with Rollup.
     * @type {string}
     * @access protected
     * @ignore
     */
    this._babelPlugin = 'external-helpers';
    /**
     * The name of the Babel preset required to add support for React's JSX.
     * @type {string}
     * @access protected
     * @ignore
     */
    this._babelPreset = 'react';
    /**
     * The required value a target `framework` setting needs to have in order for the service to
     * take action.
     * @type {string}
     * @access protected
     * @ignore
     */
    this._frameworkProperty = 'react';
    /**
     * The default values for the options a target can use to customize how the plugin works.
     * @type {Object}
     * @property {Array} ssr A list of other targets being used for SSR (Server Side Rendering) and
     *                       which paths should be included while processing the JSX.
     * @access protected
     * @ignore
     */
    this._frameworkOptions = {
      ssr: [],
    };
  }
  /**
   * This is the method called when the plugin is loaded by projext. It setups all the listeners
   * for the events the plugin needs to intercept in order to add support for JSX and to include
   * other targets paths for SSR.
   * It also listens for the event that defines the external dependencies, because if the
   * target type is Node or is a library, it should include the React packages as externals.
   * @param {Projext} app The projext main container.
   */
  register(app) {
    // Get the `events` service to listen for the events.
    const events = app.get('events');
    // Get the `targets` service to send to the methods that need to obtain information for SSR.
    const targets = app.get('targets');
    // Get the `babelHelper` to send to the method that adds support for JSX.
    const babelHelper = app.get('babelHelper');
    // Add the listener for the event that includes SSR paths.
    events.on(this._rulesEvent, (rules, target) => {
      this._updateTargetFileRules(rules, target, targets);
    });
    // Add the listener for the target Babel configuration.
    events.on(this._babelConfigurationEvent, (configuration, target) => (
      this._updateBabelConfiguration(configuration, target, babelHelper)
    ));
    // Add the listener for the external plugin settings event.
    events.on(this._externalSettingsEventName, (settings, params) => (
      this._updateExternals(settings, params.target)
    ));
  }
  /**
   * This method gets called when projext creates the file rules for a target. The method validates
   * the target settings and, if needed, add the paths of another target for SSR.
   * @param {TargetFilesRules} rules   The file rules for the target.
   * @param {Target}           target  The target information.
   * @param {Targets}          targets The targets service, to get the information of targets
   *                                   the one being processed may need for SSR.
   * @access protected
   * @ignore
   */
  _updateTargetFileRules(rules, target, targets) {
    if (target.framework === this._frameworkProperty) {
      const options = this._getTargetOptions(target);
      options.ssr.forEach((name) => {
        const ssrTarget = targets.getTarget(name);
        rules.js.addTarget(ssrTarget);
        rules.scss.addTarget(ssrTarget);
        rules.fonts.common.addTarget(ssrTarget);
        rules.fonts.svg.addTarget(ssrTarget);
        rules.images.addTarget(ssrTarget);
      });
    }
  }
  /**
   * This method gets called when projext reduces a target Babel configuration. The method will
   * validate the target settings and add the Babel plugins needed for JSX.
   * @param {Object}      currentConfiguration The current Babel configuration for the target.
   * @param {Target}      target               The target information.
   * @param {BabelHelper} babelHelper          To update the target configuration and add the
   *                                           required preset and plugin.
   * @return {Object} The updated configuration.
   * @access protected
   * @ignore
   */
  _updateBabelConfiguration(currentConfiguration, target, babelHelper) {
    let updatedConfiguration;
    if (target.framework === this._frameworkProperty) {
      updatedConfiguration = babelHelper.addPreset(currentConfiguration, this._babelPreset);
      updatedConfiguration = babelHelper.addPlugin(updatedConfiguration, this._babelPlugin);
    } else {
      updatedConfiguration = currentConfiguration;
    }

    return updatedConfiguration;
  }
  /**
   * This method gets called when the Rollup plugin reduces the list of modules that should be
   * handled as external dependencies. The method validates the target settings and if it's a
   * Node target or a browser library, it pushes the React packages to the list.
   * @param {Object} currentSettings          The settings for external dependencies.
   * @param {Array}  currentSettings.external The list of dependencies that should be handled as
   *                                          external.
   * @param {Target} target                   The target information.
   * @return {Object} The updated settings.
   * @access protected
   * @ignore
   */
  _updateExternals(currentSettings, target) {
    let updatedSettings;
    if (
      target.framework === this._frameworkProperty &&
      (target.is.node || target.library)
    ) {
      updatedSettings = {
        external: currentSettings.external.slice(),
      };
      updatedSettings.external.push(...this._externalModules);
    } else {
      updatedSettings = currentSettings;
    }

    return updatedSettings;
  }
  /**
   * Merge the default framework options with the overwrites the target may have, and return the
   * dictionary with the _"final options"_, ready to use.
   * @param {Target} target The target information.
   * @return {Object}
   * @access protected
   * @ignore
   */
  _getTargetOptions(target) {
    return Object.assign(
      {},
      this._frameworkOptions,
      target.frameworkOptions || {}
    );
  }
}

module.exports = ProjextReactPlugin;
