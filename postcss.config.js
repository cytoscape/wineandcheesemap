const { env } = require('process');
const isProd = env.NODE_ENV === 'production';
const isNonNil = x => x != null;

let conf = {
  plugins: [
    require('postcss-import')(),
    require('postcss-url')([
      {
        filter: '**/*.png',
        url: 'inline',
        encodeType: 'base64',
        maxSize: Number.MAX_SAFE_INTEGER
      },
      {
        filter: '**/*.svg',
        url: 'inline',
        encodeType: 'encodeURIComponent',
        optimizeSvgEncode: true,
        maxSize: Number.MAX_SAFE_INTEGER
      },
      {
        filter: '**/*.woff',
        url: 'inline',
        encodeType: 'base64',
        maxSize: Number.MAX_SAFE_INTEGER
      },
      {
        filter: '**/*.woff2',
        url: 'inline',
        encodeType: 'base64',
        maxSize: Number.MAX_SAFE_INTEGER
      }
    ]),
    require('postcss-cssnext')({
      browsers: require('./package.json').browserslist,
      warnForDuplicates: false
    }),
    isProd ? require('cssnano')({
      safe: true
    }) : null
  ].filter( isNonNil )
};

module.exports = conf;