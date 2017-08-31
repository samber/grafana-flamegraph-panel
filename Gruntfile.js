module.exports = function(grunt) {
  
    require('load-grunt-tasks')(grunt);
  
    grunt.loadNpmTasks('grunt-execute');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-package-modules');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-multi-dest');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-force-task');
    grunt.loadNpmTasks('grunt-contrib-jshint');
  
  
    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      clean: ["dist"],
  
      jshint: {
        options: {
          jshintrc: '.jshintrc',
          ignores: ['src/**/external/**'],
        },
        src: ['Gruntfile.js', 'src/**/*.js'],
      },

      copy: {
        main: {
          cwd: 'src',
          expand: true,
          src: ['**/*', '!**/*.js'],
          dest: 'dist'
        },
        externals: {
          cwd: 'src',
          expand: true,
          src: ['**/external/*'],
          dest: 'dist'
        },
        pluginDef: {
          expand: true,
          src: ['README.md', 'plugin.json'],
          dest: 'dist',
        }
      },
  
      multidest: {
          copy_some_files: {
              tasks: [
                  "copy:main",
                  "copy:externals",
                  "copy:pluginDef"
              ],
              dest: ["dist"]
          },
      },
  
      packageModules: {
          dist: {
            src: 'package.json',
            dest: 'dist/src'
          },
      },

      concat: {
        dist: {
          src: ['src/node_modules/**/*.js'],
          dest: 'dist/src/<%= pkg.namelower %>-<%= pkg.version %>.js'
        }
      },
  
      watch: {
        rebuild_all: {
          files: ['src/**/*', 'README.md'],
          tasks: ['default'],
          options: {spawn: false}
        },
      },
  
      babel: {
        options: {
          ignore: ['**/external/*'],
          sourceMap: true,
          presets:  ["es2015"],
          plugins: ['transform-es2015-modules-systemjs', "transform-es2015-for-of"],
        },
        dist: {
          files: [{
            cwd: 'src',
            expand: true,
            src: ['**/*.js'],
            dest: 'dist',
            ext:'.js'
          }]
        },
      },
  
    });
  
  
    grunt.registerTask('default', [
            'clean',
            'jshint',
            'multidest',
            'babel']);
    grunt.registerTask('release', ['jshint', 'clean', 'multidest', 'packageModules', 'babel']);
  };