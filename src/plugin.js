/**
 * It updates targets Babel configuration in order to add support for JSX.
 */
class ProjextReactPlugin {
  /**
   * Class constructor.
   */
  constructor() {
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
     * The name of the Babel preset required to add support for React's JSX.
     * @type {string}
     * @access protected
     * @ignore
     */
    this._babelPreset = '@babel/preset-react';
    /**
     * The required value a target `framework` setting needs to have in order for the service to
     * take action.
     * @type {string}
     * @access protected
     * @ignore
     */
    this._frameworkProperty = 'react';
  }
  /**
   * This is the method called when the plugin is loaded by projext. It setups all the listeners
   * for the events the plugin needs to intercept in order to add support for JSX.
   * It also listens for the event that defines the external dependencies, because if the
   * target type is Node or is a library, it should include the React packages as externals.
   * @param {Projext} app The projext main container.
   */
  register(app) {
    // Get the `events` service to listen for the events.
    const events = app.get('events');
    // Get the `babelHelper` to send to the method that adds support for JSX.
    const babelHelper = app.get('babelHelper');
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
   * This method gets called when projext reduces a target Babel configuration. The method will
   * validate the target settings and add the Babel preset needed for JSX.
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
}

module.exports = ProjextReactPlugin;
