# Ejercicio 4 Node.js: TMB

Tendrás que crear una aplicación de consola para listar las paradas de una línea de metro de TMB. Éstas son las especificaciones:

- El usuario debe decir qué línea quiere consultar. Para ello se le hará primero una pregunta:
  "¿Qué tipo de transporte quiere consultar?" -> esta pregunta debe tener dos respuestas posibles: "Metro" o "Bus".
- Si el usuario elige "Bus", debe imprimirse por consola un mensaje en amarillo diciendo que no tenemos información disponible sobre los buses e imprimiendo la URL de TMB. Después el programa debe finalizar.
- Si el usuario elige "Metro", se le preguntará "¿Qué información extra quiere obtener de cada parada?" -> esta pregunta debe tener dos respuestas (se pueden elegir una, dos o ninguna): "Coordenadas" y "Fecha de inauguración"
- Luego se le preguntará "¿Quiere que le informemos de los errores?" (pregunta de sí o no)
- Luego se le preguntará "¿Qué línea quiere consultar?".
- Además de las preguntas, el usuario podrá pasar dos argumentos por línea de comandos:

  `--color #548273`

  `--abrev`

  Ambos son opcionales.

- Una vez recogida toda la información del usuario, la app tiene que conectarse a la API de TMB para consultar si existe la línea escogida por el usuario. Para ello se usará el endpoint que devuelve todas las líneas de metro.
- Si la línea no existe: en caso de que el usuario haya elegido que le informemos de los errores, se debe imprimir por consola un error diciendo, en rojo y en negrita, que no existe la línea, y se terminará el programa. Si ha elegido que no le informemos de los errores, simplemente se terminará el programa.
- Si la línea existe, entonces imprimiremos un primer mensaje con el nombre de la línea y la descripción. El color usado para este texto y todos los siguientes será: si el usuario ha pasado un código de color por línea de comandos, ese color; si no ha pasado ninguno, será el color de la línea de metro (lo da la API).
- Luego la app debe conectarse a la API de TMB a pedir todas las paradas de metro de la línea seleccionada.
- Debe imprimir todos los nombres de las paradas. Si el usuario ha pasado el argumento --abrev por consola, entonces sólo se imprimirán los tres primeros caracteres del nombre de la parada, seguidos de un punto.
- Si el usuario eligió información extra (coordenadas y/o fecha de inauguración), deben imprimirse al lado de cada parada.
- Después de los resultados, preguntarle al usuario si quiere recibirlos por email.
- Si es así, hay que preguntarle la dirección de correo.
- Hay que guardar el listado de paradas en un archivo llamado paradas.txt y enviárselo en un email como adjunto.

Notas:

- el array de preguntas debe estar en un archivo aparte
- las URL de TMB deben estar en un archivo .env
