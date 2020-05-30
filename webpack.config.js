const path = require('path')

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    'y-vis-network': './y-vis-network.js'
  },
  output: {
    globalObject: 'self',
    path: path.resolve(__dirname, './dist/'),
    filename: '[name].bundle.js',
    publicPath: '/y-vis-network/dist/'
  },
  module: {
  	rules: [
  		{
  			test: /\.css/,
  			use: [
  				'style-loader',
  				'css-loader',
  				],
  			},
  		],
  	},		
  devServer: {
    contentBase: path.join(__dirname),
    compress: true,
    publicPath: '/dist/'
  }
}
