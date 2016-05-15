module.exports = function(grunt) {

    var filesToBeTested = ['./app/js/world/*.js'];
    var specFiles = ['./specs/world/Inventory.spec.js'];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            compile: {
                options: {
                    baseUrl: "./app/js/",
                    mainConfigFile: "./app/js/main.js",
                    name: "main",
                    out: "build/js/app.min.js",
                }
                /* //TODO: Copying of static to build
                   //      and generate a good index.html
                ,
                done: function(done, build) {
                    grunt.log("Copying...");
                    grunt.file.copy(grund.file.expandMapping([
                                    "app/js/webgl/*.glsl"]));
                    done();
                }*/
            }
        },
        watch: {
            app: {
                files: ["app/**", "!**/node_modules/**"],
                options: {
                    livereload: true,
                    async: true,
                }
            }
        },
        connect: {
            app: {
                options: {
                    port: 8888,
                    base: './app',
                    keepalive: false,
                    livereload: true,
                }
            }
        },
        jasmine: {
            src: filesToBeTested,
            options: {
                specs: specFiles,
                template: require('grunt-template-jasmine-requirejs'),
                templateOptions: {
                    requireConfigFile: ["./spec.config.js"]
                }
            }
        }
    });

    /*
    Load npmtasks.
     */
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jasmine');


    /*
    Register grunt tasks.
     */
    grunt.registerTask('default', ['connect', 'watch']);
};