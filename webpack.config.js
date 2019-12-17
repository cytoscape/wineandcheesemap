const path = require('path');
const process = require('process');
const isProd = process.env.NODE_ENV === 'production';
const nodeEnv = isProd ? 'production' : 'development';

const conf = {
  mode: nodeEnv,

  entry: {
    bundle: './src/client/index.js',
    polyfills: './src/client/polyfills.js'
  },

  output: {
    filename: '[name].js'
  },

  devtool: !isProd ? 'inline-source-map' : false,

  module: {
    rules: [
      {
        loader: 'babel-loader',
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'src'),
        ],
        options: {
          cacheDirectory: true
        }
      }
    ]
  }
};

module.exports = conf;