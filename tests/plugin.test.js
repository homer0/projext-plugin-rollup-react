jest.unmock('/src/plugin');

require('jasmine-expect');

const ProjextReactPlugin = require('/src/plugin');

describe('plugin:projextReact/main', () => {
  it('should be instantiated', () => {
    // Given
    let sut = null;
    // When
    sut = new ProjextReactPlugin();
    // Then
    expect(sut).toBeInstanceOf(ProjextReactPlugin);
  });

  it('should register the listeners for the Rollup plugin', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const targets = 'targets';
    const babelHelper = 'babelHelper';
    const services = {
      events,
      targets,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    let sut = null;
    const expectedEvents = [
      'target-file-rules',
      'babel-configuration',
      'rollup-external-plugin-settings-configuration',
    ];
    const expectedServices = Object.keys(services);
    // When
    sut = new ProjextReactPlugin();
    sut.register(app);
    // Then
    expect(app.get).toHaveBeenCalledTimes(expectedServices.length);
    expectedServices.forEach((service) => {
      expect(app.get).toHaveBeenCalledWith(service);
    });
    expect(events.on).toHaveBeenCalledTimes(expectedEvents.length);
    expectedEvents.forEach((eventName) => {
      expect(events.on).toHaveBeenCalledWith(eventName, expect.any(Function));
    });
  });

  it('shouldn\'t modify a target file rules if the framework setting is invalid', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const targets = 'targets';
    const babelHelper = 'babelHelper';
    const services = {
      events,
      targets,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const target = {
      framework: 'angularjs',
    };
    const rules = {
      js: {
        addTarget: jest.fn(),
      },
      scss: {
        addTarget: jest.fn(),
      },
      fonts: {
        common: {
          addTarget: jest.fn(),
        },
        svg: {
          addTarget: jest.fn(),
        },
      },
      images: {
        addTarget: jest.fn(),
      },
    };
    let sut = null;
    let reducer = null;
    // When
    sut = new ProjextReactPlugin();
    sut.register(app);
    [[, reducer]] = events.on.mock.calls;
    reducer(rules, target);
    // Then
    expect(rules.js.addTarget).toHaveBeenCalledTimes(0);
    expect(rules.scss.addTarget).toHaveBeenCalledTimes(0);
    expect(rules.fonts.common.addTarget).toHaveBeenCalledTimes(0);
    expect(rules.fonts.svg.addTarget).toHaveBeenCalledTimes(0);
    expect(rules.images.addTarget).toHaveBeenCalledTimes(0);
  });

  it('shouldn\'t modify a target file rules if the target doesn\'t implement SSR', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const targets = 'targets';
    const babelHelper = 'babelHelper';
    const services = {
      events,
      targets,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const target = {
      framework: 'react',
    };
    const rules = {
      js: {
        addTarget: jest.fn(),
      },
      scss: {
        addTarget: jest.fn(),
      },
      fonts: {
        common: {
          addTarget: jest.fn(),
        },
        svg: {
          addTarget: jest.fn(),
        },
      },
      images: {
        addTarget: jest.fn(),
      },
    };
    let sut = null;
    let reducer = null;
    // When
    sut = new ProjextReactPlugin();
    sut.register(app);
    [[, reducer]] = events.on.mock.calls;
    reducer(rules, target, targets);
    // Then
    expect(rules.js.addTarget).toHaveBeenCalledTimes(0);
    expect(rules.scss.addTarget).toHaveBeenCalledTimes(0);
    expect(rules.fonts.common.addTarget).toHaveBeenCalledTimes(0);
    expect(rules.fonts.svg.addTarget).toHaveBeenCalledTimes(0);
    expect(rules.images.addTarget).toHaveBeenCalledTimes(0);
  });

  it('should update a target file rules if it implements SSR ', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const otherTarget = 'other-target';
    const targets = {
      getTarget: jest.fn(() => otherTarget),
    };
    const babelHelper = 'babelHelper';
    const services = {
      events,
      targets,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const target = {
      framework: 'react',
      frameworkOptions: {
        ssr: [otherTarget],
      },
    };
    const rules = {
      js: {
        addTarget: jest.fn(),
      },
      scss: {
        addTarget: jest.fn(),
      },
      fonts: {
        common: {
          addTarget: jest.fn(),
        },
        svg: {
          addTarget: jest.fn(),
        },
      },
      images: {
        addTarget: jest.fn(),
      },
    };
    let sut = null;
    let reducer = null;
    // When
    sut = new ProjextReactPlugin();
    sut.register(app);
    [[, reducer]] = events.on.mock.calls;
    reducer(rules, target, targets);
    // Then
    expect(rules.js.addTarget).toHaveBeenCalledTimes(1);
    expect(rules.js.addTarget).toHaveBeenCalledWith(otherTarget);
    expect(rules.scss.addTarget).toHaveBeenCalledTimes(1);
    expect(rules.scss.addTarget).toHaveBeenCalledWith(otherTarget);
    expect(rules.fonts.common.addTarget).toHaveBeenCalledTimes(1);
    expect(rules.fonts.common.addTarget).toHaveBeenCalledWith(otherTarget);
    expect(rules.fonts.svg.addTarget).toHaveBeenCalledTimes(1);
    expect(rules.fonts.svg.addTarget).toHaveBeenCalledWith(otherTarget);
    expect(rules.images.addTarget).toHaveBeenCalledTimes(1);
    expect(rules.images.addTarget).toHaveBeenCalledWith(otherTarget);
  });

  it('shouldn\'t update a target Babel configuration if the framework setting is invalid', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const targets = 'targets';
    const babelHelper = 'babelHelper';
    const services = {
      events,
      targets,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const target = {
      framework: 'angularjs',
    };
    const initialBabelConfiguration = 'current-babel-configuration';
    let sut = null;
    let reducer = null;
    let result = null;
    // When
    sut = new ProjextReactPlugin();
    sut.register(app);
    [, [, reducer]] = events.on.mock.calls;
    result = reducer(initialBabelConfiguration, { target });
    // Then
    expect(result).toBe(initialBabelConfiguration);
  });

  it('should add the React preset to the Babel configuration', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const targets = 'targets';
    const babelHelper = {
      addPreset: jest.fn((config, name) => Object.assign({}, config, { preset: name })),
      addPlugin: jest.fn((config, name) => Object.assign({}, config, { plugin: name })),
    };
    const services = {
      events,
      targets,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const target = {
      framework: 'react',
    };
    const initialBabelConfiguration = {};
    let sut = null;
    let reducer = null;
    let result = null;
    const expectedConfigWithPreset = Object.assign({}, initialBabelConfiguration, {
      preset: 'react',
    });
    const expectedConfigWithPlugin = Object.assign({}, expectedConfigWithPreset, {
      plugin: 'external-helpers',
    });
    // When
    sut = new ProjextReactPlugin();
    sut.register(app);
    [, [, reducer]] = events.on.mock.calls;
    result = reducer(initialBabelConfiguration, target);
    // Then
    expect(result).toEqual(expectedConfigWithPlugin);
    expect(babelHelper.addPreset).toHaveBeenCalledTimes(1);
    expect(babelHelper.addPreset).toHaveBeenCalledWith(initialBabelConfiguration, 'react');
    expect(babelHelper.addPlugin).toHaveBeenCalledTimes(1);
    expect(babelHelper.addPlugin).toHaveBeenCalledWith(expectedConfigWithPreset, 'external-helpers');
  });

  it('shouldn\'t modify a target externals if the framework setting is invalid', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const targets = 'targets';
    const babelHelper = 'babelHelper';
    const services = {
      events,
      targets,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const target = {
      framework: 'angularjs',
    };
    const initialExternals = {
      external: [],
    };
    let sut = null;
    let reducer = null;
    let result = null;
    // When
    sut = new ProjextReactPlugin();
    sut.register(app);
    [,, [, reducer]] = events.on.mock.calls;
    result = reducer(initialExternals, { target });
    // Then
    expect(result).toEqual(initialExternals);
  });

  it('shouldn\'t modify a target externals if the target is a browser app', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const targets = 'targets';
    const babelHelper = 'babelHelper';
    const services = {
      events,
      targets,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const target = {
      framework: 'react',
      is: {
        node: false,
      },
    };
    const initialExternals = {
      external: [],
    };
    let sut = null;
    let reducer = null;
    let result = null;
    // When
    sut = new ProjextReactPlugin();
    sut.register(app);
    [,, [, reducer]] = events.on.mock.calls;
    result = reducer(initialExternals, { target });
    // Then
    expect(result).toEqual(initialExternals);
  });

  it('should include the React packages on the externals for a Node target', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const targets = 'targets';
    const babelHelper = 'babelHelper';
    const services = {
      events,
      targets,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const target = {
      framework: 'react',
      is: {
        node: true,
      },
    };
    const initialExternals = {
      external: ['color/safe'],
    };
    let sut = null;
    let reducer = null;
    let result = null;
    // When
    sut = new ProjextReactPlugin();
    sut.register(app);
    [,, [, reducer]] = events.on.mock.calls;
    result = reducer(initialExternals, { target });
    // Then
    expect(result).toEqual({
      external: [
        ...initialExternals.external,
        ...[
          'react',
          'react-dom',
          'react-dom/server',
        ],
      ],
    });
  });

  it('should include the React packages on the externals for a browser library target', () => {
    // Given
    const events = {
      on: jest.fn(),
    };
    const targets = 'targets';
    const babelHelper = 'babelHelper';
    const services = {
      events,
      targets,
      babelHelper,
    };
    const app = {
      get: jest.fn((service) => services[service]),
    };
    const target = {
      framework: 'react',
      is: {
        node: false,
      },
      library: true,
    };
    const initialExternals = {
      external: ['colors/safe'],
    };
    let sut = null;
    let reducer = null;
    let result = null;
    // When
    sut = new ProjextReactPlugin();
    sut.register(app);
    [,, [, reducer]] = events.on.mock.calls;
    result = reducer(initialExternals, { target });
    // Then
    expect(result).toEqual({
      external: [
        ...initialExternals.external,
        ...[
          'react',
          'react-dom',
          'react-dom/server',
        ],
      ],
    });
  });
});
