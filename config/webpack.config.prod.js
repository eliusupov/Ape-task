const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const common = require('./webpack.config.common.js');

// deletes the dist folder in every run of "build"
const CleanWebpackPlugin = require('clean-webpack-plugin');

const pathsToClean = [
	'dist',
];
const cleanOptions = {
	root: path.resolve(__dirname, '../../apester'),
	verbose: true,
};
// end of clean plugin options


module.exports = merge(common, {
	module: {
		rules: [
			{
				test: /\.(scss|css|sass)$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {
								importLoaders: 1,
								minimize: true,
							},
						},
						{
							loader: 'postcss-loader',
							options: {
								config: {
									path: './config/postcss.config.js',
								},
							},
						},
						{
							loader: 'sass-loader',
						},
					],
				}),
			},
			{
				test: /\.(png|svg|jpg|gif|mp3)$/,
				use: {
					loader: 'file-loader',
					options: {
						outputPath: 'assets/',
					},
				},
			},
			{
				test: /\.(png|jpg|gif)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 8192,
						},
					},
				],
			},
		],
	},
	devtool: 'source-map',
	plugins: [
		new CleanWebpackPlugin(pathsToClean, cleanOptions),
		new UglifyJSPlugin({ sourceMap: true }),
		new ExtractTextPlugin('style.css'),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
	],
});