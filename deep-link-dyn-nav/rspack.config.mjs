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

  process.env.BABEL_ENV = mode;

  return {
    mode,
    devtool: mode === 'development' ? 'inline-source-map' : false, // Enable source maps in development
    context,
    entry: {},
    resolve: {
      ...Repack.getResolveOptions(platform),
    },
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
            eager: false,
            requiredVersion: '^7.0.14',
          },
          '@react-navigation/native-stack': {
            singleton: true,
            eager: false,
            requiredVersion: '^7.2.0',
          },
          'react-native-safe-area-context': {
            singleton: true,
            eager: false,
            requiredVersion: '^5.2.0',
          },
          '@react-native-masked-view/masked-view': {
            singleton: true,
            eager: false,
            requiredVersion: '^0.3.2',
          },
          'react-native-screens': {
            singleton: true,
            eager: false,
            requiredVersion: '^4.7.0-beta.4',
          },
          '@react-navigation/elements': {
            singleton: true,
            eager: false,
            requiredVersion: '^2.2.5',
          },
        },
      }),
      // silence missing @react-native-masked-view optionally required by @react-navigation/elements
      new rspack.IgnorePlugin({
        resourceRegExp: /^@react-native-masked-view/,
      }),
    ],
  };
};
