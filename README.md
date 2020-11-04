
<p align="center">
  <img alt="gulp-mix" src="https://i.imgur.com/sb3Kgxo.png">
</p>

Another Gulp boilerplate, with html partials, and image optimization (WIP)


###  Tasks
``` bash
#Init server
gulp dev

#Build project
gulp compile

#ZIP build folder
gulp zip:build

#ZIP all (except node_modules)
gulp zip:all
```
  

###  HTML Partials
Using gulp-che-partials to convert HTML partial tags like this:
``` html

<!-- index.html -->
<partial src="partials/header.html" myTitle="Hello World">My Content</partial>


<!-- partials/header.html -->
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{myTitle}}</title>

    <!-- Styles -->
    <link rel="stylesheet" href="css/style.css">
</head>

```

⇓ Turns into ⇓

``` html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World</title>

    <!-- Styles -->
    <link rel="stylesheet" href="css/style.css">
</head>

```


### Scaffolding

``` javascript
/build // where the build ends up (configurable)

/src // main project files (configurable)
/src/vendor // copy of npm dependencies scripts
/src/partials // all partial templates
/src/assets // js, css, sass files

gulpfile.js // gulpfile setup
mix.config.js // gulp-mix configurations
readme.md // inception


```

### Features

**🎨 CSS**  
- Convert .scss to css 
- Autoprefix css 
- Minify css 

**🌋 JS**  
-  Minify and concatenate JS files 

**🎳 HTML**
- Minify HTML 
- Cache Bust 
- HTML Partials 
- Browser Sync server 
- Live Reload .css changes 


