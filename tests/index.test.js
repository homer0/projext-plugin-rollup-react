jest.unmock('/src/index');

require('jasmine-expect');

const ProjextReactPlugin = require('/src/plugin');
const plugin = require('/src/index');

describe('plugin:projextReact', () => {
  it('should call the `register` method of the plugin main class', () => {
    // Given
    const app = 'projextApp';
    // When
    plugin(app);
    // Then
    expect(ProjextReactPlugin).toHaveBeenCalledTimes(1);
    expect(ProjextReactPlugin.mock.instances.length).toBe(1);
    expect(ProjextReactPlugin.mock.instances[0].register).toHaveBeenCalledTimes(1);
    expect(ProjextReactPlugin.mock.instances[0].register).toHaveBeenCalledWith(app);
  });
});
