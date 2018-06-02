const ProjextReactPlugin = require('./plugin');
/**
 * This is the method called by projext when loading the plugin. It takes care of creating
 * a new instance of the plugin class and use it to register for the required events.
 * @param {Projext} app The projext main container.
 * @ignore
 */
const loadPlugin = (app) => {
  const plugin = new ProjextReactPlugin();
  plugin.register(app);
};

module.exports = loadPlugin;
