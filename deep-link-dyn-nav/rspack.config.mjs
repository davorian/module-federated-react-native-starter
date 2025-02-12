import path from 'node:path'
import * as Repack from '@callstack/repack'
import rspack from '@rspack/core'

const dirname = Repack.getDirname(import.meta.url)

/** @type {(env: import('@callstack/repack').EnvOptions) => import('@rspack/core').Configuration} */
export default (env) => {
  const {
    mode = 'development',
    context = dirname,
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
    devtool: 'source-map',
    context,
    entry: {},
    resolve: {
      ...Repack.getResolveOptions(platform),
      alias: {
        // Force ESM version of @react-navigation/native-stack to avoid commonjs conflicts
        '@react-navigation/native-stack': path.resolve(
          'node_modules/@react-navigation/native-stack/lib/module/index.js'
        ),
        // Force ESM version of @react-navigation/native-stack to avoid commonjs conflicts
        '@react-navigation/native': path.resolve(
          'node_modules/@react-navigation/native/lib/module/index.js'
        ),
      },
    },
    externalsType: 'module', // Use ESM instead of commonjs
    externals: [
      {
        // Prevent React Native internals like AppContainer from being bundled
        'react-native/Libraries/ReactNative/AppContainer':
          'react-native/Libraries/ReactNative/AppContainer',
      },
    ],
    output: {
      clean: true,
      hashFunction: 'xxhash64',
      path: path.join(dirname, 'build', 'deepLinkDynNav', platform),
      filename: 'index.bundle',
      chunkFilename: '[name].chunk.bundle',
      publicPath: Repack.getPublicPath({ platform, devServer }),
      uniqueName: 'deepLinkDynNav',
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
          exclude: [/node_modules/],
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
        name: 'deepLinkDynNav',
        filename: 'deepLinkDynNav.container.js.bundle',
        exposes: {
          '.': './src/app/App',
        },
        dts: false,
        getPublicPath: `return "http://localhost:8084/${platform}/"`,
        shared: {
          react: {
            singleton: true,
            eager: false,
            requiredVersion: '18.3.1',
          },
          'react-native': {
            singleton: true,
            eager: false,
            requiredVersion: '0.77.0',
          },
          '@react-navigation/native': {
            singleton: true,
            eager: true,
            requiredVersion: '^6.1.18',
          },
          '@react-navigation/native-stack': {
            singleton: true,
            eager: true,
            requiredVersion: '^6.10.1',
          },
          'react-native-safe-area-context': {
            singleton: true,
            eager: true,
            requiredVersion: '^4.14.0',
          },
          'react-native-screens': {
            singleton: true,
            eager: true,
            requiredVersion: '^3.35.0',
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
