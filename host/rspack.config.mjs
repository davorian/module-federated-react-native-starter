// @ts-check
// import {createRequire} from 'node:module';
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
//const {resolve} = createRequire(import.meta.url)

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

  if (!platform) {
    throw new Error('Missing platform')
  }

  process.env.BABEL_ENV = mode

  return {
    mode,
    devtool: false,
    context,
    entry,
    resolve: {
      ...Repack.getResolveOptions(platform),
    },
    externalsType: 'module', // Use ESM instead of commonjs
    output: {
      clean: true,
      hashFunction: 'xxhash64',
      path: path.join(dirname, 'build', 'host', platform),
      filename: 'index.bundle',
      chunkFilename: '[name].chunk.bundle',
      publicPath: Repack.getPublicPath({ platform, devServer }),
      uniqueName: 'host',
    },
    optimization: {
      minimize,
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
          deepLinkDynNav: `deepLinkDynNav@http://localhost:8084/${platform}/mf-manifest.json`,
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
