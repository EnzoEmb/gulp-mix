'use strict'

// const concat = require('concat-stream')
const through = require('through2')
const PluginError = require('plugin-error')
const fs = require('fs')

// const extend = require('extend')
// const path = require('path')
module.exports = function (options) {
  return through.obj(function (file, encoding, callback) {
    if (file.isNull()) {
      callback(null, file);
      return;
    }

    if (file.isStream()) {
      callback(new PluginError('gulp-che-partials', 'Streaming not supported'));
      return;
    }

    try {


      file.contents = Buffer.from(replacePartials(file));


    } catch (error) {
      this.emit('error', new PluginError('gulp-che-partials', error));
    }

    callback(null, file);
    // callback();
  });
};











/**
 *
 * 
 * Functions
 */


// main function
function replacePartials(file) {

  var html = file.contents.toString();

  var myTags = getPartialTags(html);

  // get partial content and replacing
  if (myTags.length != 0) {
    myTags.forEach(element => {
      var src_file = file.base + '/' + element.parameters.src
      if (fs.existsSync(src_file)) {
        var data = fs.readFileSync(src_file).toString();
        data = replaceParameters(data, element.parameters);
        // console.log(myTags.parameters);
        html = html.replace(element.tag, data)
      } else {
        console.log('One partial src file does not exist.');
      }
    });
  }



  return html;
}



// get partial tags and parameters
function getPartialTags(html) {

  var partial_regex = "<\s*partial[^>]*>(.*?)<\s*/\s*partial>";
  var partial_regex_self_closing = "<\s*partial[^>]*/>";
  // var src_regex = /src\=([^\s]*)\s?\>?/;
  var parameters_regex = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|\s*\/?[>"']))+.)["']?/g;
  var tags = [...html.matchAll(partial_regex)];
  var tags_self_closing = [...html.matchAll(partial_regex_self_closing)];
  tags = tags.concat(tags_self_closing);

  var myTags = [];
  tags.forEach(function (e) {
    // var src_content = e[0].match(src_regex)[1].replace(/['"]+/g, '');
    var pars = e[0].match(parameters_regex);

    // get parameters of the tag
    var parameters = [];
    pars.forEach(function (ee) {
      ee = ee.replace(/['"]+/g, ''); // remove quotes
      ee = ee.split('=')
      parameters[ee[0]] = ee[1]
    })


    // get tag, content, src parameters and other parameters
    myTags.push({
      tag: e[0],
      content: e[1],
      // src: src_content,
      parameters,
    })
  })

  return myTags;
}


// setup parameters
function replaceParameters(data, parameters) {
  // console.log(data);
  // console.log(parameters);
  var starterTags = "{{";
  var closingTags = "}}";
  var regexHandlebars = /{{{?[a-z0-9]+.[a-z0-9]*}?}}/g;
  var matches = data.match(regexHandlebars);


  if (matches != null) {
    matches.forEach(element => {
      var palabra = element.replace("{{", "").replace("}}", "").toLowerCase()

      for (var key of Object.keys(parameters)) {
        if (palabra == key.toLowerCase()) {
          data = data.replace(element, parameters[key])
        }
      }

    });
  }





  return data;
}




// module.exports = function (opts) {
//   // if (typeof opts === 'string') {
//   //   opts = { prefix: opts }
//   // }

//   // opts = extend({}, {
//   //   basepath: '@file',
//   //   prefix: '@@',
//   //   suffix: '',
//   //   context: {},
//   //   filters: false,
//   //   indent: false
//   // }, opts)



//   function myPlugin(file, enc, callback) {
//     const trimmedString = 'hola que tal222';
//     file.contents = Buffer.from(trimmedString);
//     callback(null, file);
//   }

//   return through.obj(myPlugin)

// }