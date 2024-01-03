const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config =>
    config.plugin('feature-flags').tap(args => {
      args[0].__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = JSON.stringify(false)
      return args
    })
});
