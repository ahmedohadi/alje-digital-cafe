module.exports = {
    resolve: {
      fallback: {
        "zlib": require.resolve("browserify-zlib"),
        "querystring": require.resolve("querystring-es3"),
        "path": require.resolve("path-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "fs": false,
        "http": require.resolve("stream-http"),
        "stream": require.resolve("stream-browserify"),
        "util": require.resolve("util/")
      }
    }
  };
  