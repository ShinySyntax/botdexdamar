const path = require('path');
const webpack = require('webpack');
// const UglifyJsPlugin=require("uglifyjs-webpack-plugin");
const TerserPlugin=require('terser-webpack-plugin');
function resolve (dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/' : '/', //vueConf.publicPath, // 根域上下文目录
  outputDir: 'tioims', // 构建输出目录
    assetsDir: './static/', // 静态资源目录 (js, css, img, fonts) 
    indexPath: 'index.html',
    lintOnSave: true, // 是否开启eslint保存检测，有效值：ture | false | 'error'
    runtimeCompiler: true, // 运行时版本是否需要编译
    transpileDependencies: [], // 默认babel-loader忽略mode_modules，这里可增加例外的依赖包名
    productionSourceMap: false, // 是否在构建生产包时生成 sourceMap 文件，false将提高构建速度
    css: { // 配置高于chainWebpack中关于css loader的配置
        // modules: true, // 是否开启支持‘foo.module.css’样式
        // extract: true, // 是否使用css分离插件 ExtractTextPlugin，采用独立样式文件载入，不采用<style>方式内联至html文件中
        sourceMap: false, // 是否在构建样式地图，false将提高构建速度
        loaderOptions: { // css预设器配置项
            sass: {
                data: ''//`@import "@/assets/scss/mixin.scss";`
            }
        }
    },
    parallel: require('os').cpus().length > 1, // 构建时开启多进程处理babel编译
    pluginOptions: { // 第三方插件配置
        'style-resources-loader': {
            preProcessor: 'less',
            patterns: [path.resolve(__dirname, "./src/assets/style/less/common.less")] // 引入全局样式变量
        },
    },
    chainWebpack: config => {
        config.resolve.alias
          .set('@public', resolve('public')) // 配置快捷路径，styles为路径名字，resolve是原路径地址
        config.module.rule('less').oneOf('vue').use('style-resource')
          .loader('style-resources-loader')
          .options({
              patterns: [
                  path.resolve(__dirname, './src/assets/style/less/common.less'),
              ],
          })
    },
    css: {
      loaderOptions: {
          less: {
              javascriptEnabled: true
          }
      }
  },
    configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({
                $:"jquery",
                jQuery:"jquery",
                "windows.jQuery":"jquery"
            }),
            //打包后移除console.log
            // new TerserPlugin({
            //     terserOptions: {
            //       ecma: undefined,
            //       warnings: false,
            //       parse: {},
            //       compress: {
            //         drop_console: true,
            //         drop_debugger: false,
            //         pure_funcs: ['console.log'] // 移除console
            //       }
            //     },
            // })
        ],
        module: {
            rules: [
            { test: /\.m4a$/, use: 'raw-loader' }
            ]
        },
    },
    devServer: {
        open: false,
        // host: "local.t-io.org",
        host: "0.0.0.0",
        port: 8085,
        https: false,
        hotOnly: false,
        proxy: {
            "/mytio": {
              // target: "http://local.t-io.org:6060", // 本地模拟数据服务器
              target: "http://alb-ntlfj7aw8uq5a0vjgq.cn-hangzhou.alb.aliyuncs.com:6060",   // 本地模拟数据服务器
              // target: "http://47.97.67.167:6060",   // 本地模拟数据服务器
              // target: "http://121.199.41.87:6060",  // 谭聊生产环境模拟数据服务器
                // target: "http://121.40.233.190:6060",
              //target: "http://alb-vtg5465cbxucc9gose.cn-hangzhou.alb.aliyuncs.com",   // 本地模拟数据服务器
              changeOrigin: true,
              pathRewrite: {
                "^/mytio": "" // 去掉接口地址中的api字符串
              },
              cookieDomainRewrite:''//重写cookie 的domain,在localhost上工作时，cookie域必须设置为“”或NULL或FALSE
            },
            "/api": {
                target: "http://alb-ntlfj7aw8uq5a0vjgq.cn-hangzhou.alb.aliyuncs.com:8084",  
                changeOrigin: true,
                pathRewrite: {
                  "^/api": "" // 去掉接口地址中的api字符串
                },
                cookieDomainRewrite:''//重写cookie 的domain,在localhost上工作时，cookie域必须设置为“”或NULL或FALSE
              }
        },
        before: app => {}
    }
}
