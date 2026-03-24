# Mejorar layout para los diferentes usuarios y agregar variables de estilos globales css
Tu objetivo sera mejorar la presentacion de este proyecto para cada uno de los layout de usuarios.
El shell componente tiene sidebar a la izquierda + topbar arriba + <router-outlet> en el área de contenido.
es necesario agregar estilos para mejorar la presentacion de esta forma:
La pagina tendra un pequeño padding antes de mostrar los contenedores sidebar, topbar, content
tanto sidebar, content y topbar tendran un border radius y habra un gap entre ellos.
El componente de sidebar debera ocupar un ancho responsivo, tendra un espacio para el logo de piedrazul en la parte superior, bajo este estaran los items del menu. Al final del sidebar se debera mostrar los items ajustes, ayuda y cerrar sesion
El componente de topbar esta compuesto de dos partes, a la izquierda un titulo de la seccion en la que me encuentro y bajo ella una pequeña descripcion, a la derecha debera tener un espacio para mostrar el nombre del usuario logueado, correo y a la izquierda del nombre una imagen de perfil (pueden ser las iniciales si no carga imagen) y un boton de cerrar sesion

Los colores a manejar seran los siguientes:
```
:root {
--blue-green-50: #E6F4F9;
--blue-green-100: #C8EAF2;
--blue-green-200: #99DAE9;
--blue-green-300: #68CBE1;
--blue-green-400: #35BFDC;
--blue-green-500: #00B4D8;
--blue-green-600: #0069AE;
--blue-green-700: #002E7F;
--blue-green-800: #00084D;
--blue-green-900: #000017;
--neutro-white: #F9FAFA;
--neutro-gray-100: #D3DCDE;
--neutro-gray-200: #BBCBCE;
--neutro-gray-300: #A3B8BD;
--neutro-gray-400: #729299;
--neutro-gray-500: #607F85;
--neutro-gray-600: #445D62;
--neutro-gray-700: #1D3337;
--neutro-gray-800: #0E1F23;
--neutro-gray-900: #061A1E;
--neutro-black: #000F0F;
}
```

El fondo de toda la pagina debera ser blue-green-200 y los colores de los componentes sidebar y topbar seran neutro-white, con texto en neutro-gray-700 y detalles o botones en blue-green-500 . el area de contenido tendra un fondo de neutro-white con texto en neutro-gray-700 y detalles en blue-green-500.
El texto de un item seleccionado en el sidebar debera ser neutro-white y el fondo del item seleccionado debera ser blue-green-600, borde redondeado 10px ademas de que el item tendra un icono a la izquierda del texto (puedes usar fontawesome para esto) 
El texto de un item no seleccionado en el sidebar debera ser neutro-gray-400 y el fondo del item no seleccionado debera ser neutro-white, borde redondeado 10px ademas de que el item tendra un icono a la izquierda del texto (puedes usar fontawesome para esto)
# implementar fase 2 - Agendar cita manual

Se requiere implementar en este proyecto angular, una vista para que un agendador o medico
pueda registrar de forma manual un paciente.

Primer deberas entender como funciona la logica de implementacion
y la estructura del proyecto, esta se encuentra documentada en ARCHITECTURE.md
y guia-implementacion-sprint1.md 

Para conocer la estructura de los datos y los endpoints implementados en 
el backend, puedes revisar el documento 01-endpoints-implementados.md

El formulario para registrar una cita manual se define por las siguientes dos secciones

1. Informacion del paciente:
  se debe ingresar la informacion del paciente a registrar (documento, nombres, apellidos, celular, genero, fecha nacimiento opcional, correo opcional)
  El sistema debera proveer un formulario en el que se pueda ser capaz de llenar estos datos, se debera tener en cuenta que el componente input debera estar en shared para que otros componentes puedan usarlo
  Cuando el usuario digite al menos dos digitos del documento, el sistema debera mostrar una vista de sugerencias con nombre y documento de pacientes ya registrados ("search as you type")
  El medico o agendador selecciona una sugerencia y los campos se llenan automaticamente
  consideraciones:
  - Se debe agregar una sugerencia para presionar tab dentro del input para autocompletar (esta sugerencia puede incorporarse en el componente input si necesita ser usada por otros componentes o inputs)
  - Cuando se selecione un usuario (autocomplete) se deberan deshabilitar los demas inputs para evitar modificaciones y se vaciaran cuando el usuario cambie el input de documento 
  - El componente de input deberia poder aceptar un icono al inico de la escritura dentro del capo. este icono de fontawesome es opcional y solo sirve para decorar
2. Seleccion de horario:
  Debe existir una seccion para seleccinar el medico que atendera la cita, la fecha y la hora de la cita
  para facilitarle esto al medico se debera mostrar ademas una lista con desplegables agrupados por horas (como se muestra en el response del api agenda dinamica)
  en esta lista se mostrara la hora de la cita, el nombre del paciente, el documento y el telefono del paciente.
  cuando el usuario seleccione un medico, la lista debera cargar la agenda dinamica para ese medico en la fecha donde tenga el espacio para agendar una cita mas reciente
  En la lista, en el primer espacio disponible, el slot de la lista sera reemplazado por uno con un poco mas de ancho, con un borde, con la informacion del usuario que quiero agendar y con un boton "Seleccionar"
  Al hacer click en seleccionar este slot cambia de color y el boton seleccionar cambia a eliminar, ademas el input de hora debera cambiar a la hora en el espacio seleccionado
  Bajo la lista, deberan existir dos botones para moverse al dia siguiente y dia anterior (si es posible marcarlo como el dia de la semana siguiente: si es martes "lunes" "miercoles", si el medico no atiende miercoles entonces el siguiente sera "jueves")
  La seleccion de horario deberia tener una funcion rapida para permitir al medico agendar rapidamente una cita con cualquier medico que tenga la fecha disponible mas reciente en la api disponibilidad/primera/global
  Debera existir una opcion para que el medico pueda abrir un espacio entre citas si asi lo desea, para ello el medico se desplazara por la lista, y mientras hace hover se debera mostrar "+ abrir espacio" entre las citas en las que se pueda hacer esto (en agenda dinamica permiteAbrirPrioridadPosterior), cuando el usuario haga click en abrir espacio se mostrara el slot seleccionable como el del primer slot libre pero mostrara un modal antes "seguro que desea abrir un espacio, esto recortara el tiempo de las citas vecinas"
  
Por ultimo se muestra el boton para agendar cita / cancelar con si respectivo modal de confirmacion.

Las implementaciones visuales deben tener la capacidad de ser modificables, es decir trabajar estilos y html en archivos separados del componente para facilitar esto, usar variables globales estandares en la industia para todo el proyecto (puedes agregarlas y luego seran modificadas)
Las dos secciones deberan estar claramente marcadas, en un div con esquinas redondeadas, icono acompañado del titulo del div

Deberas siempre tener en cuenta la estructura documentada en el proyecto para evitar violaciones de responsabilidades o directorios incoherentes.
