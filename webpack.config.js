const path = require('path');

const src = path.resolve(__dirname, 'src');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(sass|less|css)$/,
        use: ["style-loader", "css-loader", 'sass-loader'],
      },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: 'index.js',
    path: src
  },
  devServer: {
    contentBase: src,
  },
  experiments: {
    asyncWebAssembly: true,
  },
}