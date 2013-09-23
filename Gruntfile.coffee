banner = """
  // Empty evented library
  // version: <%= pkg.version %>  
  // author: Arturo Castillo Delgado  
  // license: MIT  
  // https://github.com/acstll/empty

  ;(function () {\n\n
  """

module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    concat:
      options:
        banner: banner,
        footer: '\n\n}());',
        process: true
      dist:
        src: './index.js'
        dest: 'dist/empty.js'

    jshint:
      options:
        laxbreak: true
      index: './index.js',
      tests: ['test/*.js']

  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-concat'

  grunt.registerTask 'lint', ['jshint:index']
  grunt.registerTask 'build', ['concat:dist']