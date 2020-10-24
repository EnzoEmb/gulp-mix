#  Layton Boilerplate

Boilerplate para Frontend basado en Gulp 4, con setup inicial de scripts y estilos.

##  Requerimientos

- Node JS (https://nodejs.org/es/)

- NPM (https://www.npmjs.com/)

 

##  Instalación


1. Clonar el repositorio en tu proyecto (git clone https://Layt@bitbucket.org/Layt/layton.git)

2. Entrar en la carpeta y tirar el comando **npm install**

3. Si el comando gulp no funciona, instalarlo globalmente: npm install -g gulp-cli


##  Uso
En ningún caso debes comitear o subir a producción la carpeta /node_modules/ ni /temp/. Puedes utilizar los comandos de compresión para obtener solo los archivos necesarios. De lo posible solo subir los archivos dentro de /build/ al sitio.

###  Comandos

    #Iniciar el proyecto
    gulp dev
    
    #Compilar el proyecto
    gulp compile

    #Crear .zip del build
    gulp zip:build
    
    #Crear .zip de todo
    gulp zip:all
  

###  Partials

Se incluye un sistema para hacer includes de archivos .HTML, por ejemplo, para no repetir el código del header.
	
    #Condicional
    const PARTIALS_HTML = true
    
    #Uso básico
    @@include('./partials/_header.html')
    
Más información: https://github.com/haoxins/gulp-file-include#readme


###  Variables

**PURGE_CSS:** Funcion experimental que elimina el css que no se esta utilizando, recorre todos los archivos HTML, PHP y JS y luego toma el CSS y solo deja las clases que estan en uso.

**CACHE_BUST:** Añade un parametro random a todas los links y scripts incluidos en los HTML, PHP.

**COPY_FOLDER:** Añade las carpetas que se copiaran al build, por defecto copia los HTML y las carpetas img, js, css.
  

##  Changelog

#### 1.0.1
- 🐛 Se copiaba la carpeta partials al build
- 🐛 No se copiaba la carpeta img
- 🐛 No se copiaban bien los COPY_FOLDER
- 🐛 No se inyectaba el CSS
- 🎉 Añadida opción si no se necesita bundlear CSS o JS
- 🎉 Añadido plumber para logear los errores

#### 1.0.0

- 🚀 Version inicial
- 🐱‍ Crear custom bundles para CSS
- 😢 Borrar carpeta build antes de recompilar
- 🧾 Minificar HTML
- 🕐 Versionado de Assets
- ⚙ Variables de setup iniciales
- ⛑ PurgeCSS
- 🗜 ZIP:build ZIP:all
- 🦴 Partials

## Para hacer
- Copiar las vistas y el resto de assets en el build.
- Que el dev funcione solo en el SRC no en el build (?) - Descartado
- Critical CSS.
- Optimizar imagenes, WEBP?
- Headless, constante para poner el build donde sea.
- Prevenir explosion si no existe el partial.
- Rebuildear solo las partes necesarias (?)
- A veces tirar error las imagenes, quizas porque las rebuildea cada vez y tarda
- Al cambiar nombre de imagen explota
- https://www.npmjs.com/package/gulp-changed