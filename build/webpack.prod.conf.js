const baseWebpackConfig = require('./webpack.base.conf');

var conf = baseWebpackConfig;
conf.devtool = "source-map";

module.exports = baseWebpackConfig;
