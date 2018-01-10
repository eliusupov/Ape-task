const merge = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.config.common.js');


module.exports = merge(common, {
	module: {
		rules: [
			{
				test: /\.(scss|css|sass)$/,
				use: ['style-loader',
					{
						loader: 'css-loader',
						options: { importLoaders: 1 },
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
			},
			{
				test: /\.(png|svg|jpg|gif|mp3)$/,
				use: {
					loader: 'file-loader',
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
	devtool: 'inline-source-map',
	devServer: {
		port: 3000,
		contentBase: '../dist',
		compress: true,
		hot: true,
	},
	plugins: [
		new webpack.NamedModulesPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('development'),
		}),
	],
});
