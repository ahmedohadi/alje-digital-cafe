const path = require("path");
const webpack = require("webpack"); // Import webpack

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        net: require.resolve("net-browserify"),
        tls: require.resolve("tls-browserify"),
        path: require.resolve("path-browserify"),
        fs: false, // Explicitly disable fs as it's server-side only
        querystring: require.resolve("querystring-es3"),
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        zlib: require.resolve("browserify-zlib"),
        assert: require.resolve("assert/"),
        process: require.resolve("process/browser"), // Ensure process uses a browser-compatible version
        vm: require.resolve("vm-browserify"), // Polyfill for vm
        async_hooks: false, // Explicitly set async_hooks fallback to false
      };

      // Add ProvidePlugin for global variables like process and Buffer
      webpackConfig.plugins = [
        ...(webpackConfig.plugins || []),
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
      ];

      // Optional: Set a fallback for node-specific modules
      webpackConfig.ignoreWarnings = [/Failed to parse source map/];

      return webpackConfig;
    },
  },
};
