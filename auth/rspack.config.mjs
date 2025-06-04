import * as Repack from '@callstack/repack';
// import { getSharedDependencies } from './getSharedDependencies.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import rspack from '@rspack/core';

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

const dirname = Repack.getDirname(import.meta.url)
const zephyrDisabled = true

export default (env) => {
  //const sharedDepsMobile = JSON.parse(
  //  readFileSync(join(dirname, '../../shared-deps-mob.json'), 'utf8')
  //);

  const {
    platform = process.env.PLATFORM
  } = env

  const defaultRemotes = {
    "mob_remote1": `mob_remote1@http://localhost:8082/${platform}/mf-manifest.json`,
    "mob_remote2": `mob_remote2@http://localhost:8083/${platform}/mf-manifest.json`,
    "mob_remote3": `mob_remote3@http://localhost:8084/${platform}/mf-manifest.json`,
    "auth": `auth@http://localhost:8083/${platform}/mf-manifest.json`
  };

  return {
    context:dirname,
    entry : './index.js',
    resolve: {
      ...Repack.getResolveOptions(),
    },
    module: {
      rules: [
        ...Repack.getJsTransformRules(),
        ...Repack.getAssetTransformRules(),
      ],
    },
    plugins: [
      new Repack.RepackPlugin(),
      new Repack.plugins.ModuleFederationPluginV2({
        name: 'auth',
        filename: 'auth.container.js.bundle',
        exposes: {
          './App': './src/app/App',
        },
        dts: false,
        shared: {
          react: {
            singleton: true,
            eager: true,
            requiredVersion: '19.0.0',
          },
          'react-native': {
            singleton: true,
            eager: true,
            requiredVersion: '0.79.2',
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
  };
};
