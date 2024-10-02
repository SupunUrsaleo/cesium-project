const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'node_modules/cesium/Build/Cesium', to: 'Cesium' },
      ],
    }),
  ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    hot: true,
  },
  resolve: {
    fallback: {
      fs: false,
    },
  },
  performance: {
    maxEntrypointSize: 1024000,  // Set larger entry point size limit (in bytes)
    maxAssetSize: 1024000,  // Set larger asset size limit (in bytes)
    hints: false,  // You can change this to 'error' or 'false' to disable
  },
};
