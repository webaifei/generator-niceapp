const yeoman = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');
const request = require('request');
const fs = require('fs')

//nodejs module
module.exports = yeoman.Base.extend({
  constructor: function() {
    yeoman.Base.apply(this, arguments);
    // this.argument 方法
    this.argument('appname', {
      type: String,
      required: true
    })
    this.option('skip-install')
  },
  // 私有方法 不会自动触发 我们内部调用的方法
  _get_$: function(type) {
    var $ = {
      res: '',
      used: false
    };
    switch (type) {
      case 'jquery':
        $ = {
          url: 'http://apps.bdimg.com/libs/jquery/2.1.4/jquery.min.js',
          used: true
        }
        break;
      case 'zepto':
        $ = {
          url: 'http://apps.bdimg.com/libs/zepto/1.1.4/zepto.min.js',
          used: true
        }
        break;
      default:
        $ = {
          url: '',
          used: false
        };
    }
    return $;
  },
  _fetch: function(url, dest,cb) {
    var that = this;
    request(url)
      .on('error', function (err){
        cb&&cb(err)
      })
      .pipe(fs.createWriteStream(dest))
  },

  // 填写配置信息 选择需要的配置
  prompting: function() {
    return this.prompt([{
      type: 'input',
      name: 'name',
      message: 'Your project name?',
      default: this.appname //default to current folder name
    }, {
      tpye: 'input',
      name: 'keywords',
      message: 'your website keywords',
      default: ''
    }, {
      tpye: 'input',
      name: 'desc',
      message: 'your website desc',
      default: this.appname
    }, {
      type: 'confirm',
      name: 'sass',
      message: 'use sass?',
      default: true
    }, {
      type: 'rawlist',
      name: '$',
      message: 'use jquery , zeptojs or none?',
      default: 1,
      choices: [
        'jquery',
        'zepto',
        'none'
      ]
    }]).then(function(answers) {
      console.log(answers)
      this.config.set(answers)
    }.bind(this))
  },
  // 根据配置信息和用户选择 生成项目结构
  /**
   * - src
   * 	- sass
   * 		common.scss
   * 		style.scss
   * 	- scripts
   * 		- common
   * 			utils.js
   * 		- libs
   * 			1. jquery
   * 			2. zeptojs
   *
   * 		- index.html
   *
   *
   */
  writing: function() {
    var useSass = this.config.get('sass'),
      $type = this.config.get('$'),
      stylePathName = 'css',
      $ = this._get_$($type),
      commonJsPath = 'src/scripts/common',
      libsPath = 'src/scripts/libs';
    if (useSass) {
      stylePathName = 'sass'
    }
    //删除生成的目录结构
    this.spawnCommandSync('rm', ['-rf', './'])
    this.mkdir('src/' + stylePathName)
    this.mkdir('src/images')
    this.mkdir(commonJsPath)
    this.mkdir(libsPath)

    if ($.used) {
      var _baseName = path.basename($.url);
      this.log(chalk.red(_baseName))
      this._fetch($.url, path.join(libsPath, _baseName), function (err){
        this.log(err)
      }.bind(this))
    }
    //拷贝package.json
    this.fs.copyTpl(
      this.templatePath('package.json'),
      this.destinationPath('package.json'), {
        appname: this.appname
      }
    )
    //拷贝html
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('src/index.html'), {
        title: this.appname,
        keywords: this.config.get('keywords'),
        desc: this.config.get('desc')
      }
    )
    //拷贝 editorconfig  jshintrc gulpfile gitignore
    this.copy('editorconfig', '.editorconfig')
    this.copy('eslintrc', '.eslintrc')
    this.copy('gulpfile.js', 'gulpfile.js')
    this.copy('gitignore', '.gitignore')
    this.copy('.babelrc', '.babelrc')

  },
  install: function() {
    if(this.options['skip-install'])
      return;
    this.npmInstall()
      //this.bowerInstall()
      // this.installDependencies()
  }
})
