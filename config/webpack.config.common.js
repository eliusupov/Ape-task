const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// src folder path
const src = path.resolve(__dirname, '../src');


// webpack config // css loaders in diff configs (dev\prod)
module.exports = {
	entry: {
		index: `${src}/index.js`,
	},
	module: {
		rules: [
			{
				test: /\.js/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			},
			{
				test: /\.html$/,
				loader: ['html-loader'],
			},
			{
				test: /\.worker\.js$/,
				use: {
					loader: 'worker-loader',
					options: { name: 'WorkerName.[hash].js' },
				},
			},
			// {
			// 	test: /\.json$/,
			// 	loader: 'file-loader?name=[name].json',
			// },
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: `${src}/index.html`,
			hash: true,
		}),
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
			'window.jQuery': 'jquery',
			Popper: ['popper.js', 'default'],
			Util: 'exports-loader?Util!bootstrap/js/dist/util',
			Dropdown: 'exports-loader?Dropdown!bootstrap/js/dist/dropdown',
		}),
	],
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, '../dist'),
	},
};