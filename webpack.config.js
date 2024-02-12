const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: "./src/index.ts",
  target: "node",
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  module: {
    rules: [
      {
        test: /\.m?js$|\.tsx?$/,
        exclude: /(node_modules)/,
        use: {
          // `.swcrc` can be used to configure swc
          loader: 'babel-loader',
        }
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  externals: {
    "nest-commander": "commonjs2 nest-commander",
    "@nestjs/core": "commonjs2 @nestjs/core",
    "@nestjs/common": "commonjs2 @nestjs/common",
    "archiver": "commonjs2 archiver",
  },
  output: {
    libraryTarget: 'commonjs2',
    filename: 'index.js',
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /original-fs/,
      contextRegExp: /adm-zip/
    })
  ]
}
