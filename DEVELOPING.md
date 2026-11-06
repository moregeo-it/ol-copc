# Developing

## Setting up development environment

You will start by [forking](https://github.com/moregeo-it/ol-copc/fork) the OL COPC repository.

### Installing dependencies

The minimum requirements are:

* Git
* [Node.js](https://nodejs.org/) (version 20.19 and above)

The executables `git` and `node` should be in your `PATH`.

To install the project dependencies run

```shell
npm install
```


## Style guidelines

We use [ESLint](https://eslint.org/) rules to ensure a consistent coding style and catch potential bugs.  ESLint and the rules used by the project are installed as part of the development dependencies in the step above – so you don't need to have any additional executables installed globally.

When you submit a pull request, the styling rules are enforced by running the `npm run lint` task.  This happens as part of an automated workflow, so you don't need to run it yourself.  However, it can be useful to run the `npm run lint` task before submitting a pull request so that you can fix any styling issues ahead of time.

The best way to conform with the style guidelines is to configure your editor to detect the ESLint configuration from the repository's `package.json` file.  See the [ESLint integration documentation](https://eslint.org/docs/latest/use/integrations) for details on configuring your editor.  If you don't already have a preferred editor that is capable of running ESLint rules, we recommend using [VS Code](https://code.visualstudio.com/) with the [ESLint plugin](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

In addition to having your editor warn you when the style guidelines are not being followed, you can set things up so many of the violations are automatically fixed.  This saves you from having to think about tedious things like spacing and whitespace while developing.  Using the ESLint plugin for VS Code, you can add the following to your settings to automatically fix issues when you save a file:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  }
}
```


## Running examples

To run the examples you first need to start the dev server:

```shell
npm run serve-examples
```

Then, load <http://localhost:8080/> in your browser.


## Running tests

To run the tests once:

```shell
npm test
```

To run the tests continuously during development, start Vitest in watch mode:

```shell
npx vitest --config test/browser/vitest.config.mjs
```


## Adding examples

Adding functionality often implies adding one or several examples. This
section provides explanations related to adding examples.

The examples are located in the `examples` directory. Adding a new example
implies creating two or three files in this directory, an `.html` file, a `.js`
file, and, optionally, a `.css` file.

You can use `copc.js` and `copc.html` as templates for new examples.


## Workers

The points are decompressed in a web worker (`src/ol-copc/worker/COPC.js`). As in OpenLayers,
the worker is bundled into a module that creates it from a `blob:` URL:
`npm run build-package` replaces the worker in the build (see `tasks/serialize-workers.js`),
the examples and tests do the same through a Vite plugin (`tasks/vite-plugin-worker.js`).

The WebAssembly of the LAZ decompressor (laz-perf) is embedded into the worker through
the virtual module `virtual:laz-perf-wasm`, which is provided when the worker is bundled.


## Linking Package

The `ol-copc` package is published from the `build/ol-copc` folder of the `ol-copc` repo.

After you've cloned the `ol-copc` repo locally run the `npm build-package` to prepare the build then use the `npm link` command to connect it your project.

Below is an example of how to build and link it to `sample-project`.

```shell
cd ol-copc
npm run build-package
cd build/ol-copc
npm link
cd /sample-project
npm link ol-copc
```

To remove the link run the following commands

```shell
cd sample-project
npm unlink --no-save ol-copc
cd ../ol-copc
npm unlink
```
