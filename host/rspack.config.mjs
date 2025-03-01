// @ts-check
import {createRequire} from 'node:module'
import {composePlugins} from '@nx/rspack'
import {withZephyr} from 'zephyr-repack-plugin'
import path from 'node:path'
import * as Repack from '@callstack/repack'
import rspack from '@rspack/core'

// import pkg from './package.json' with {type: "json"}
const EXCEPT = ['@module-federation/enhanced']

/*const getSharedDependencies = ({eager = true}) => {
  const shared = Object.entries(pkg.dependencies)
    .filter(([dep]) => !EXCEPT.includes(dep))
    .map(([dep, version]) => {
      return [dep, {singleton: true, eager, requiredVersion: version}];
    });
  return Object.fromEntries(shared);
};*/

// @ts-ignore
const dirname = Repack.getDirname(import.meta.url)
// const {resolve} = createRequire(import.meta.url)

/** @type {(env: import('@callstack/repack').EnvOptions) => import('@rspack/core').Configuration} */
export default (env) => {
  const {
    mode = 'development',
    context = dirname,
    entry = './index.js',
    platform = process.env.PLATFORM,
    minimize = mode === 'production',
    devServer = undefined,
    bundleFilename = undefined,
    sourceMapFilename = undefined,
    assetsPath = undefined,
  } = env

  /**
   * Using Module Federation might require disabling hmr.
   * Uncomment below to set `devServer.hmr` to `false`.
   *
   * Keep in mind that `devServer` object is not available
   * when running `webpack-bundle` command. Be sure
   * to check its value to avoid accessing undefined value,
   * otherwise an error might occur.
   */
  // if (devServer) {
  //  devServer.hmr = false;
  // }

  if (!platform) {
    throw new Error('Missing platform')
  }

  process.env.BABEL_ENV = mode

  return {
    mode,
    /**
     * This should be always `false`, since the Source Map configuration is done
     * by `SourceMapDevToolPlugin`.
     */
    devtool: false,
    context,
    entry,
    resolve: {
      /**
       * `getResolveOptions` returns additional resolution configuration for React Native.
       * If it's removed, you won't be able to use `<file>.<platform>.<ext>` (eg: `file.ios.js`)
       * convention and some 3rd-party libraries that specify `react-native` field
       * in their `package.json` might not work correctly.
       */
      ...Repack.getResolveOptions(platform),
      /**
       * Uncomment this to ensure all `react-native*` imports will resolve to the same React Native
       * dependency. You might need it when using workspaces/monorepos or unconventional project
       * structure. For simple/typical project you won't need it.
       */
      // alias: {
      //   'react-native': reactNativePath,
      // },
    },
    externalsType: 'module', // Use ESM instead of commonjs
    /**
     * Configures output.
     * It's recommended to leave it as it is unless you know what you're doing.
     * By default, Webpack will emit files into the directory specified under `path`. In order for the
     * React Native app use them when bundling the `.ipa`/`.apk`, they need to be copied over with
     * `Repack.OutputPlugin`, which is configured by default inside `Repack.RepackPlugin`.
     */
    output: {
      clean: true,
      hashFunction: 'xxhash64',
      path: path.join(dirname, 'build', 'host', platform),
      filename: 'index.bundle',
      chunkFilename: '[name].chunk.bundle',
      publicPath: Repack.getPublicPath({ platform, devServer }),
      uniqueName: 'host',
    },
    /** Configures optimization of the built bundle. */
    optimization: {
      /** Enables minification based on values passed from React Native Community CLI or from fallback. */
      minimize,
      /** Configure minimizer to process the bundle. */
      chunkIds: 'named',
    },
    module: {
      rules: [
        Repack.REACT_NATIVE_LOADING_RULES,
        Repack.NODE_MODULES_LOADING_RULES,
        Repack.FLOW_TYPED_MODULES_LOADING_RULES,
        {
          test: /\.[jt]sx?$/,
          type: 'javascript/auto',
          exclude: /node_modules\/(?!@react-native-masked-view)/, // Exclude all but this package
          use: {
            loader: 'builtin:swc-loader',
            options: {
              env: {
                targets: { 'react-native': '0.77' },
              },
              jsc: {
                assumptions: {
                  setPublicClassFields: true,
                  privateFieldsAsProperties: true,
                },
                externalHelpers: true,
                transform: {
                  react: {
                    runtime: 'automatic',
                  },
                },
              },
            },
          },
        },
        {
          test: Repack.getAssetExtensionsRegExp(Repack.ASSET_EXTENSIONS),
          use: {
            loader: '@callstack/repack/assets-loader',
            options: {
              platform,
              devServerEnabled: Boolean(devServer),
              inline: true,
            },
          },
        },
      ],
    },
    plugins: [
      /**
       * Configure other required and additional plugins to make the bundle
       * work in React Native and provide good development experience with
       * sensible defaults.
       *
       * `Repack.RepackPlugin` provides some degree of customization, but if you
       * need more control, you can replace `Repack.RepackPlugin` with plugins
       * from `Repack.plugins`.
       */
      new Repack.RepackPlugin({
        context,
        mode,
        platform,
        devServer,
        output: {
          bundleFilename,
          sourceMapFilename,
          assetsPath,
        },
      }),
      new Repack.plugins.ModuleFederationPluginV2({
        name: 'host',
        filename: 'host.container.js.bundle',
        exposes: {
          '.': './App',
        },
        remotes: {
          mfeFood: `mfeFood@http://localhost:8082/${platform}/mf-manifest.json`,
          auth: `auth@http://localhost:8083/${platform}/mf-manifest.json`,
          // deepLinkDynNav: `deepLinkDynNav@http://localhost:8084/${platform}/mf-manifest.json`,
          deepLinkDynNav: `deepLinkDynNav@https://t-ios-latest-lyndon-fasanya-deep-link-dyn-nav-module--bba357-ze.zephyrcloud.app/deepLinkDynNav.container.js.bundle`,
        },
        dts: false,
        shared: {
          react: {
            singleton: true,
            eager: true,
            requiredVersion: '18.3.1',
          },
          'react-native': {
            singleton: true,
            eager: true,
            requiredVersion: '0.77.0',
          },
          '@react-navigation/native': {
            singleton: true,
            eager: true,
            requiredVersion: '^7.0.14',
          },
          '@react-navigation/native-stack': {
            singleton: true,
            eager: true,
            requiredVersion: '^7.2.0',
          },
          'react-native-safe-area-context': {
            singleton: true,
            eager: true,
            requiredVersion: '^5.2.0',
          },
          'react-native-screens': {
            singleton: true,
            eager: true,
            requiredVersion: '^4.7.0-beta.4',
          },
          '@react-native-masked-view/masked-view': {
            singleton: true,
            eager: true,
            requiredVersion: '^0.3.2',
          },
          '@react-navigation/elements': {
            singleton: true,
            eager: true,
            requiredVersion: '^2.2.5',
          },
        },
      }),
      // silence missing @react-native-masked-view optionally required by @react-navigation/elements
      new rspack.IgnorePlugin({
        resourceRegExp: /^@react-native-masked-view/,
      }),
    ],
  }
}
