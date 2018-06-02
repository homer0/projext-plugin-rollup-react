/**
 * This service is in charge of modifying a target Babel and entry settings in order to build
 * React code. It also manages the settings related to the React Hot Loader.
 */
class ProjextReactPlugin {
  /**
   * Class constructor.
   */
  constructor() {
    /**
     * The name of the reducer event the service will listen for in order to add paths for
     * SSR targets that needs to be transpiled and bundled.
     * @type {string}
     * @access protected
     * @ignore
     */
    this._jsRuleEvent = 'rollup-js-rule-configuration';
    /**
     * The name of the reducer event the service will listen for in order to add paths for
     * SSR targets that needs to be processed and bundled.
     * @type {string}
     * @access protected
     * @ignore
     */
    this._scssRuleEvent = 'rollup-scss-rule-configuration';
    /**
     * The name of the reducer event the service will listen for in order to add paths for
     * SSR targets SVG fonts that needs to be processed.
     * @type {string}
     * @access protected
     * @ignore
     */
    this._fontsRuleEvent = 'rollup-fonts-rule-configuration';
    /**
     * The name of the reducer event the service will listen for in order to exclude SSR targets
     * SVG fonts in order to avoid processing them as images.
     * @type {string}
     * @access protected
     * @ignore
     */
    this._imagesRuleEvent = 'rollup-images-rule-configuration';
    /**
     * The name of the reducer event the service will listen for in order to exclude React packages
     * from the bundle when the target is a library.
     * This is only for browser targets as Node targets already exclude the production
     * dependencies as external.
     * @type {string}
     * @access protected
     * @ignore
     */
    this._externalPluginEvent = 'rollup-external-plugin-settings-configuration-for-browser';
    /**
     * The list of React packages that should never end up on the bundle if the target is a
     * library.
     * @type {Array}
     * @access protected
     * @ignore
     */
    this._externalModulesForLibraries = [
      'react',
      'react-dom',
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
     * The list of Babel plugins that need to be added in order to add support for JSX.
     * @type {Array}
     * @access protected
     * @ignore
     */
    this._babelPlugins = [
      'transform-react-jsx',
      'external-helpers',
    ];
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
   * This is the method called when the plugin is loaded by projext. It gets the `events` service
   * and subscribes to the reducer events the plugin needs to modify in order to support JSX and
   * SSR. It also gets the `targets` service in order to load the SSR targets information.
   * @param {Projext} app The projext main container.
   */
  register(app) {
    const events = app.get('events');
    const targets = app.get('targets');
    events.on(this._jsRuleEvent, (rule, params) => (
      this._updateJSRule(rule, params.target, targets)
    ));
    events.on(this._scssRuleEvent, (rule, params) => (
      this._updateSCSSRule(rule, params.target, targets)
    ));
    events.on(this._fontsRuleEvent, (rule, params) => (
      this._updateFontsRule(rule, params.target, targets)
    ));
    events.on(this._imagesRuleEvent, (rule, params) => (
      this._updateImagesRule(rule, params.target, targets)
    ));
    events.on(this._externalPluginEvent, (settings, params) => (
      this._updateExternalPluginSettings(settings, params.target)
    ));
    events.on(this._babelConfigurationEvent, (configuration, target) => (
      this._updateBabelConfiguration(configuration, target)
    ));
  }
  /**
   * This method gets called when the Rollup plugin reduces the rule it uses to find JS files
   * that need to be transpiled. The method validates the target settings and, if needed, it
   * includes the paths for SSR targets.
   * @param {FileRule} currentRule  The rule settings to find JS files.
   * @param {Target}   target       The target information.
   * @param {Targets}  targets      The targets service, to get the information of targets the
   *                                one being processed may need for SSR.
   * @return {FileRule} The updated rule.
   * @access protected
   * @ignore
   */
  _updateJSRule(currentRule, target, targets) {
    let updatedRule;
    if (target.framework === this._frameworkProperty) {
      const options = this._getTargetOptions(target);
      const ssrTargets = options.ssr.map((name) => targets.getTarget(name));
      updatedRule = Object.assign({}, currentRule);
      updatedRule.include.push(...ssrTargets.map((targetInfo) => (
        new RegExp(`${targetInfo.paths.source}/.*?\\.jsx?$`, 'i')
      )));

      if (updatedRule.glob) {
        updatedRule.glob.include.push(...ssrTargets.map((targetInfo) => (
          `${targetInfo.paths.source}/**/*.{js,jsx}`
        )));
      }
    } else {
      updatedRule = currentRule;
    }

    return currentRule;
  }
  /**
   * This method gets callend when the Rollup plugin reduces the rule it uses to find SCS files
   * that need processing. The method validates the target settings and, if needed, it includes
   * the paths for SSR targets.
   * @param {FileRule} currentRule  The rule settings to find SCSS files.
   * @param {Target}   target       The target information.
   * @param {Targets}  targets      The targets service, to get the SSR targets information.
   * @return {FileRule} The updated rule.
   * @access protected
   * @ignore
   */
  _updateSCSSRule(currentRule, target, targets) {
    let updatedRule;
    if (target.framework === this._frameworkProperty) {
      const options = this._getTargetOptions(target);
      const ssrTargets = options.ssr.map((name) => targets.getTarget(name));
      updatedRule = Object.assign({}, currentRule);
      updatedRule.include.push(...ssrTargets.map((targetInfo) => (
        new RegExp(`${targetInfo.paths.source}/.*?\\.scss$`, 'i')
      )));
    } else {
      updatedRule = currentRule;
    }

    return updatedRule;
  }
  /**
   * This method gets called when the Rollup plugin reduces the rule it uses to find SVG fonts.
   * The method validates the target settings and, if needed, it includes the paths for SSR
   * targets.
   * The reason this method only filters SVG fonts is that SVG files need to be separated in
   * images and fonts so they don't end up on the wrong directories.
   * @param {FileRule} currentRule  The rule settings to find fonts files.
   * @param {Target}   target       The target information.
   * @param {Targets}  targets      The targets service, to get the SSR targets information.
   * @return {FileRule} The updated rule.
   * @access protected
   * @ignore
   */
  _updateFontsRule(currentRule, target, targets) {
    let updatedRule;
    if (target.framework === this._frameworkProperty) {
      const options = this._getTargetOptions(target);
      const ssrTargets = options.ssr.map((name) => targets.getTarget(name));
      updatedRule = Object.assign({}, currentRule);
      updatedRule.include.push(...ssrTargets.map((targetInfo) => (
        new RegExp(`${targetInfo.paths.source}/(?:.*?/)?fonts/.*?\\.svg$`, 'i')
      )));
    } else {
      updatedRule = currentRule;
    }

    return updatedRule;
  }
  /**
   * This method gets called when the Rollup plugin reduces the rule it uses to find images.
   * Different from the other methods that updates rules, after validating the target settings
   * it doesn't _"include"_ paths for SSR targets, but it excludes them: It excludes SVG fonts
   * files on SSR targets so they won't end up on the images diretory.
   * @param {FileRule} currentRule  The rules settings to find images files.
   * @param {Target}   target       The target information.
   * @param {Targets}  targets      The targets service, to get the SSR targets information.
   * @return {FileRule} The updated rule.
   * @access protected
   * @ignore
   */
  _updateImagesRule(currentRule, target, targets) {
    let updatedRule;
    if (target.framework === this._frameworkProperty) {
      const options = this._getTargetOptions(target);
      const ssrTargets = options.ssr.map((name) => targets.getTarget(name));
      updatedRule = Object.assign({}, currentRule);
      updatedRule.exclude.push(...ssrTargets.map((targetInfo) => (
        new RegExp(`${targetInfo.paths.source}/(?:.*?/)?fonts/.*?`, 'i')
      )));
    } else {
      updatedRule = currentRule;
    }

    return updatedRule;
  }
  /**
   * This method gets called when the Rollup plugin reduces the settings for the modules that
   * should be handled as external dependencies. The method validates the targate settings and
   * if the target is a library, it pushes the list of React packages that shouldn't be bundled.
   * @param {Object} currentSettings          The settings for external dependencies.
   * @param {Array}  currentSettings.external The list of dependencies that should be handled as
   *                                          external.
   * @param {Target} target                   The target information.
   * @return {Object} The updated settings.
   * @access protected
   * @ignore
   */
  _updateExternalPluginSettings(currentSettings, target) {
    let updatedSettings;
    if (target.framework === this._frameworkProperty && target.library) {
      updatedSettings = Object.assign({}, currentSettings);
      updatedSettings.external.push(...this._externalModulesForLibraries);
    } else {
      updatedSettings = currentSettings;
    }

    return updatedSettings;
  }
  /**
   * This method gets called when projext reduces a target Babel configuration. The method will
   * validate the target settings and add the Babel plugins needed for JSX.
   * @param {Object} currentConfiguration The current Babel configuration for the target.
   * @param {Target} target               The target information.
   * @return {Object} The updated configuration.
   * @access protected
   * @ignore
   */
  _updateBabelConfiguration(currentConfiguration, target) {
    let updatedConfiguration;
    if (target.framework === this._frameworkProperty) {
      updatedConfiguration = Object.assign({}, currentConfiguration);
      if (!updatedConfiguration.plugins) {
        updatedConfiguration.plugins = this._babelPlugins.slice();
      } else {
        updatedConfiguration.plugins.push(
          ...this._babelPlugins.filter((plugin) => !updatedConfiguration.plugins.includes(plugin))
        );
      }
    } else {
      updatedConfiguration = currentConfiguration;
    }

    return updatedConfiguration;
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
