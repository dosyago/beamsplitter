const path = require('path');

module.exports = {
  optimization: {
    minimize: false
  },
  output: {
    path: path.resolve(__dirname, "js", "dist")
  }
};
