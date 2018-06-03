# projext plugin for React on Rollup

Allows you to bundle a [React](https://reactjs.org/) project with [projext](https://yarnpkg.com/en/package/projext) using the [Rollup](https://rollupjs.org/) [build engine](https://yarnpkg.com/en/package/projext-plugin-rollup).

## Introduction

[projext](https://yarnpkg.com/en/package/projext) allows you to configure a project without adding specific settings for a module bundler, then you can decide which build engine to use. This plugin is meant to be used when you are bundling a [React](https://reactjs.org/) and you are using the [Rollup](https://reactjs.org/) [build engine](https://yarnpkg.com/en/package/projext-plugin-rollup).

It adds the required presets to the [`rollup-plugin-babel`](https://yarnpkg.com/en/package/rollup-plugin-babel) configuration in order to handle [`JSX`](https://facebook.github.io/jsx/) code.

## Information

| -            | -                                                                                      |
|--------------|----------------------------------------------------------------------------------------|
| Package      | projext-plugin-rollup-react.                                                           |
| Description  | Allows you to bundle a React project with projext using the Rollup build engine.       |
| Node Version | >= v6.10.0                                                                             |

## Usage

1. You first need the build engine, so install [`projext-plugin-rollup`](https://yarnpkg.com/en/package/projext-plugin-rollup).
2. Add a new setting to your target named `framework` and set its value to `react`.
3. Done

Now, when your target gets builded, the plugin will check if the target is using Rollup and if the framework is `react`, then it will make the necessary changes to bundle the `JSX` code.

### Server side rendering

> Server side rendering (SSR) is when you render your application on the server (backend) as a string, serve it on the browser and then you app runs in order to add all the JS magic.

Let's say you have a `backend` target with your Node server code, and a `frontend` target with your React code, and you want to require your `frontend` code on the `backend` in order to use `ReactDOM.renderToString(...)`:

For your `backend` target you'll have to define its `framework` property to `react`, so the plugin can include the JSX loader, and then add an extra option to enable SSR from `backend` to `frontend`:

```js
module.exports = {
  targets: {
    backend: {
      type: 'node',
      framework: 'react',
      frameworkOptions: {
        ssr: ['frontend'],
      },
    },
  },
};
```

This new setting (`frameworkOptions.ssr`) is where you tell the plugin that the targets on that list should also have their JSX parsed for you to use on Node.

Done, now you can `require`/`import` files from your `frontend` target on the `backend` target and everything will work.

## Development

Before doing anything, install the repository hooks:

```bash
# You can either use npm or yarn, it doesn't matter
yarn run hooks
```

### NPM/Yarn Tasks

| Task                    | Description                         |
|-------------------------|-------------------------------------|
| `npm run hooks`         | Install the GIT repository hooks.   |
| `npm test`              | Run the project unit tests.         |
| `npm run lint`          | Lint the modified files.            |
| `npm run lint:full`     | Lint the project code.              |
| `npm run docs`          | Generate the project documentation. |

### Testing

I use [Jest](https://facebook.github.io/jest/) with [Jest-Ex](https://yarnpkg.com/en/package/jest-ex) to test the project. The configuration file is on `./.jestrc`, the tests and mocks are on `./tests` and the script that runs it is on `./utils/scripts/test`.

### Linting

I use [ESlint](http://eslint.org) to validate all our JS code. The configuration file for the project code is on `./.eslintrc` and for the tests on `./tests/.eslintrc` (which inherits from the one on the root), there's also an `./.eslintignore` to ignore some files on the process, and the script that runs it is on `./utils/scripts/lint`.

### Documentation

I use [ESDoc](http://esdoc.org) to generate HTML documentation for the project. The configuration file is on `./.esdocrc` and the script that runs it is on `./utils/scripts/docs`.