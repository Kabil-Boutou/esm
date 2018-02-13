# @std/esm

This fast, small, zero-dependency package is all you need to enable
ES modules in Node 4+ today!

See the release [post](https://medium.com/web-on-the-edge/es-modules-in-node-today-32cff914e4b)
:book: and [video](https://www.youtube.com/watch?v=60S1PFndbn0) :movie_camera:
for all the details.

Getting started
---

Run `npm i --save @std/esm` in your app or package directory.

There are three ways to enable ESM with `@std/esm`.

1. Enable ESM with a CJS bridge:

    **index.js**
    ```js
    // Provide options as a parameter, environment variable, or rc file.
    require = require("@std/esm")(module/*, options*/)
    module.exports = require("./main.mjs").default
    ```

2. Enable ESM in the Node CLI with the [`-r` option](https://nodejs.org/api/cli.html#cli_r_require_module):

    ```shell
    node -r @std/esm main.mjs
    ```

3. Enable ESM in the Node REPL:

    ```shell
    node -r @std/esm
    ```

    or upon entering:

    ```shell
    $ node
    > require("@std/esm")
    @std/esm enabled
    ```

*Note: All `"cjs"` options are [unlocked](#unlockables) in the Node REPL.*

Standard Features
---

The `@std/esm` loader is as spec-compliant
as possible and follows Node’s [ESM rules](https://github.com/nodejs/node-eps/blob/master/002-es-modules.md).

:point_right: This means, by default, ESM requires the use of the `.mjs` file
extension.<br>
:unlock: You can [unlock](#unlockables) ESM with the `.js` file extension using
the `"js"` ESM mode.

Out of the box `@std/esm` just works, no configuration necessary, and supports:

* [`import`](https://ponyfoo.com/articles/es6-modules-in-depth#import) / [`export`](https://ponyfoo.com/articles/es6-modules-in-depth#export)
* [`import.meta`](https://github.com/tc39/proposal-import-meta)
* [Dynamic `import`](https://github.com/tc39/proposal-dynamic-import)
* [Improved errors](https://github.com/standard-things/esm/wiki/improved-errors)
* [Live bindings](https://ponyfoo.com/articles/es6-modules-in-depth#bindings-not-values)
* [Loading `.mjs` files as ESM](https://github.com/nodejs/node-eps/blob/master/002-es-modules.md#32-determining-if-source-is-an-es-module)
* [The file URI scheme](https://en.wikipedia.org/wiki/File_URI_scheme)
* Node [`--eval`](https://nodejs.org/api/cli.html#cli_e_eval_script) and [`--print`](https://nodejs.org/api/cli.html#cli_p_print_script) flags
* Node 4+ support

Unlockables
---

Unlock features with options specified as one of the following:

* The `"@std/esm"` field in your package.json
* [JSON6](https://github.com/d3x0r/json6) in an .esmrc or .esmrc.json file
* JSON6 or file path in the `ESM_OPTIONS` environment variable
* CJS/ESM in an .esmrc.js or .esmrc.mjs file

Commonly used options may be specified in shorthand form:

* `"@std/esm":"js"` is shorthand for `"@std/esm":{"esm":"js"}`
* `"@std/esm":"cjs"` is shorthand for `"@std/esm":{"cjs":true,"esm":"js"}`

<table>
<tr>
  <td colspan="2"><code>{</code></td>
</tr>
<tr>
  <td valign="top"><code>"esm":</code></td>
  <td>
    <p>A string mode:</p>
    <ul>
      <li><code>"all"</code> files as ESM</li>
      <li><code>"js"</code> and other files with <code>import</code>, <code>import.meta</code>, <code>export</code>, or <a href="https://github.com/tc39/proposal-modules-pragma"><code>"use module"</code></a> as ESM</li>
    </ul>
  </td>
</tr>
<tr>
  <td valign="top"><code>"cjs":</code></td>
  <td>
    <p>A boolean or object to unlock CJS features in ESM.</p>
    <details>
      <summary>Unlockable Features</summary>
      <table>
      <tr>
        <td colspan="2"><code>{</code></td>
      </tr>
      <tr>
        <td valign="top"><code>"cache":</code></td>
        <td>
          <p>A boolean for storing ES modules in <code>require.cache</code>.</p>
        </td>
      </tr>
      <tr>
        <td valign="top"><code>"extensions":</code></td>
        <td>
          <p>A boolean for respecting <code>require.extensions</code> in ESM.</p>
        </td>
      </tr>
      <tr>
        <td valign="top"><code>"interop":</code></td>
        <td>
          <p>A boolean for <code>__esModule</code> interoperability.</p>
        </td>
      </tr>
      <tr>
        <td valign="top"><code>"namedExports":</code></td>
        <td>
          <p>A boolean for <a href="https://ponyfoo.com/articles/es6-modules-in-depth#importing-named-exports">importing named exports</a> of CJS modules.</p>
        </td>
      </tr>
      <tr>
        <td valign="top"><code>"paths":</code></td>
        <td>
          <p>A boolean for following CJS <a href="https://github.com/nodejs/node-eps/blob/master/002-es-modules.md#432-removal-of-non-local-dependencies">path rules</a> in ESM.</p>
        </td>
      </tr>
      <tr>
        <td valign="top"><code>"topLevelReturn":</code></td>
        <td>
          <p>A boolean for <a href="http://stackoverflow.com/questions/28955047/why-does-a-module-level-return-statement-work-in-node-js/#28955050">top-level <code>return</code></a>.</p>
        </td>
      </tr>
      <tr>
        <td valign="top"><code>"vars":</code></td>
        <td>
          <p>A boolean for <code>__dirname</code>, <code>__filename</code>, and <code>require</code> in ESM.</p>
        </td>
      </tr>
      <tr>
        <td colspan="2"><code>}</code></td>
      </tr>
      </table>
    </details>
  </td>
</tr>
<tr>
  <td valign="top"><code>"await":</code></td>
  <td>
    <p>A boolean for top-level <code>await</code> in modules without ESM exports. <i>(requires Node 7.6+)</i></p>
  </td>
</tr>
<tr>
  <td colspan="2"><code>}</code></td>
</tr>
</table>

DevOpts
---

<table>
<tr>
  <td colspan="2"><code>{</code></td>
</tr>
<tr>
  <td valign="top"><code>"cache":</code></td>
  <td>
    <p>A boolean for toggling cache creation or string path of the cache directory.</p>
  </td>
</tr>
<tr>
  <td valign="top"><code>"debug":</code></td>
  <td>
    <p>A boolean for unmasking stack traces.</p>
  </td>
</tr>
<tr>
  <td valign="top"><code>"sourceMap":</code></td>
  <td>
    <p>A boolean for including inline source maps.</p>
  </td>
</tr>
<tr>
  <td valign="top"><code>"warnings":</code></td>
  <td>
    <p>A boolean for logging development parse and runtime warnings.</p>
  </td>
</tr>
<tr>
  <td colspan="2"><code>}</code></td>
</tr>
</table>

Tips
---
* Load `@std/esm` before
  [`@babel/register`](https://github.com/babel/babel/tree/master/packages/babel-register) v7+
* Load `@std/esm` with the *“require”* option of
  [`ava`](https://github.com/avajs/ava#options),
  [`mocha`](https://mochajs.org/#-r---require-module-name),
  [`nyc`](https://github.com/istanbuljs/nyc#require-additional-modules), and
  [`tape`](https://github.com/substack/tape#preloading-modules)
* Load `@std/esm` with the `--node-arg=-r --node-arg=@std/esm` option of
  [`node-tap`](http://www.node-tap.org/cli/)
* Load `@std/esm` with the `--node-args="-r @std/esm"` option of
  [`pm2`](http://pm2.keymetrics.io/docs/usage/quick-start/#options)
* Load `@std/esm` with [`wallaby.js`](https://wallabyjs.com/docs/integration/node.html#es-modules)
* Use `@std/esm` to load [`jasmine`](https://jasmine.github.io/setup/nodejs.html#a-simple-example-using-the-library)
* Use `"@std/esm":"cjs"` for the `--watch` and `--watch-extensions` options of
  [`mocha`](https://mochajs.org/#-w---watch)
* Use `"@std/esm":"cjs"` for [`ava`](https://github.com/avajs/ava) and [`webpack`](https://github.com/webpack/webpack)
* When in doubt, use `"@std/esm":"cjs"`
