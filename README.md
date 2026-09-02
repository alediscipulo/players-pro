# ⚽ Players Pro - Buscador de Jugadores Offline

**Una app para iPhone que te permite buscar jugadores de la Liga Profesional Argentina sin necesidad de conexión a internet, con reconocimiento facial y búsqueda avanzada.**

---

## 🎯 Características

✅ **100% Offline** - Funciona completamente sin internet  
✅ **Búsqueda por Nombre** - Encuentra jugadores al instante  
✅ **Búsqueda por Rostro** - Reconocimiento facial con IA  
✅ **Filtros Avanzados** - Por equipo, posición, estadísticas  
✅ **Favoritos** - Guarda tus jugadores favoritos  
✅ **Estadísticas Completas** - Goles, asistencias, partidos jugados, tarjetas  
✅ **Base de Datos Actualizada** - Todos los jugadores de la Liga Profesional  
✅ **PWA Instalable** - Se instala como una app nativa en iPhone

---

## 📋 Requisitos

- iPhone con iOS 12 o superior (o navegador moderno)
- Conexión a internet (solo para la instalación inicial)
- ~50MB de espacio libre en el dispositivo

---

## 🚀 GUÍA DE INSTALACIÓN PASO A PASO

### PASO 1: Preparar los datos (En tu computadora)

#### Opción A: Descargar los datos automáticamente

```bash
# Instala Node.js si no lo tienes: https://nodejs.org

# Coloca estos archivos en una carpeta:
# - scraper-promiedos.js
# - index.html
# - app.js
# - sw.js
# - manifest.json

# Desde terminal/cmd en esa carpeta, ejecuta:
node scraper-promiedos.js
```

Esto crea un archivo `players-database.json` con todos los jugadores.

#### Opción B: Usar datos de demostración (para probar)

La app incluye datos de demostración. Funciona inmediatamente sin descargar datos.

---

### PASO 2: Instalar servidor local (En tu computadora)

Necesitas un servidor web local para servir los archivos. Elige uno:

#### Opción A: Python (Recomendado - más simple)

```bash
# Navega a la carpeta de la app
cd /ruta/a/la/app

# Python 3.x
python -m http.server 8000

# O Python 2.x
python -m SimpleHTTPServer 8000
```

#### Opción B: Node.js

```bash
# Instala http-server globalmente
npm install -g http-server

# Ejecuta desde la carpeta de la app
http-server
```

#### Opción C: PHP

```bash
# Navega a la carpeta
php -S localhost:8000
```

---

### PASO 3: Acceder desde tu iPhone

1. Abre **Safari** en tu iPhone
2. En la barra de direcciones, escribe: `http://TU_IP:8000`
   - Reemplaza `TU_IP` con la IP de tu computadora
   - Para encontrarla:
     - **Mac**: System Preferences > Network
     - **Windows**: Cmd > `ipconfig` (busca "IPv4 Address")
     - **Linux**: Terminal > `hostname -I`
   - Ejemplo: `http://192.168.1.100:8000`

3. La app debería cargar en tu iPhone

---

### PASO 4: Instalar como PWA (App nativa)

1. Una vez que la app cargue en Safari:
2. Toca el botón de **Compartir** (cuadrado con flecha)
3. Desplázate y toca **"Añadir a pantalla de inicio"**
4. Personaliza el nombre (ej: "Players Pro")
5. Toca **"Añadir"**

✅ ¡La app ya está instalada! Aparecerá como un ícono en tu pantalla de inicio.

---

## 🔄 Actualizar datos desde Promiedos

Para actualizar con los datos más recientes:

1. En tu computadora, vuelve a ejecutar:
   ```bash
   node scraper-promiedos.js
   ```

2. Se sobrescribe `players-database.json` con datos nuevos

3. Abre la app en iPhone y ve a **Ajustes**
4. Toca **"Actualizar Datos"** (descargará de Promiedos si hay conexión)

---

## 📱 Cómo usar la app

### 🔍 **BÚSQUEDA POR NOMBRE**
1. En la pestaña "Buscar"
2. Escribe el nombre del jugador
3. Filtra por equipo o posición si quieres
4. Toca la tarjeta del jugador para ver detalles

### 👤 **BÚSQUEDA POR ROSTRO**
1. Ve a la pestaña "Por Rostro"
2. Toca **"Activar Cámara"**
3. Espera a que cargue el modelo de IA (~15 segundos)
4. Colócate frente a la cámara
5. Toca **"Capturar Rostro"**
6. La app busca coincidencias en la base de datos

**💡 Tips para mejor reconocimiento:**
- Buena iluminación
- Rostro centrado en pantalla
- Sin gafas de sol
- Varios ángulos para mayor precisión

### ⭐ **FAVORITOS**
1. Abre cualquier jugador
2. Toca **"Agregar a Favoritos"**
3. Accede desde la pestaña "Favoritos" más rápidamente

### ⚙️ **AJUSTES**
- Ver estadísticas de la base de datos
- Actualizar datos (necesita internet)
- Limpiar datos locales

---

## 📊 Información de jugadores

Cada jugador muestra:
- **Número de camiseta**
- **Posición** (Portero, Defensor, Mediocampista, Delantero)
- **Edad y altura**
- **Equipo**
- **Estadísticas:**
  - Partidos jugados
  - Goles
  - Asistencias
  - Tarjetas amarillas/rojas
  - Minutos jugados
- **Estado** (Disponible/Lesionado)

---

## 🔧 Solución de problemas

### "No puedo acceder desde el iPhone"
- ✅ Asegúrate de que la computadora y iPhone están en la **misma WiFi**
- ✅ Verifica que el servidor esté corriendo
- ✅ Usa la IP correcta (no localhost)
- ✅ Reinicia el servidor

### "La cámara no funciona"
- ✅ Abre Ajustes > Safari > Cámara y permite acceso
- ✅ Asegúrate de estar en HTTPS (la cámara requiere seguridad)
- ✅ Para testing local: usa `http://localhost` o acceso por red segura

### "No carga el modelo de IA"
- ✅ Necesita conexión a internet (se descargan los modelos una sola vez)
- ✅ Espera 20-30 segundos la primera vez
- ✅ Verifica que no hay bloqueador de contenido activo

### "Los datos no se actualizan"
- ✅ Ve a Ajustes > Limpiar Datos
- ✅ Vuelve a instalar la app

---

## 🌐 Hostear online (Opcional)

Si quieres que cualquiera pueda acceder desde cualquier lugar:

### Opción: Vercel (Gratis)
```bash
# Instala Vercel CLI
npm i -g vercel

# Desde la carpeta de la app
vercel

# Sigue las instrucciones
```

### Opción: Netlify (Gratis)
```bash
# Arrastra la carpeta a https://app.netlify.com
```

---

## 📝 Estructura de archivos

```
app/
├── index.html           # Interfaz principal
├── app.js              # Lógica de la aplicación
├── sw.js               # Service Worker (offline)
├── manifest.json       # Configuración PWA
├── scraper-promiedos.js  # Descargar datos
├── players-database.json # Base de datos (generado)
└── README.md           # Este archivo
```

---

## 🔐 Privacidad

- ✅ Todos los datos se guardan **localmente en tu iPhone**
- ✅ **No** se envían datos a servidores
- ✅ Funciona **100% sin conexión**
- ✅ Solo necesita internet para actualizar datos de Promiedos

---

## 🛠️ Desarrollo / Personalización

### Cambiar colores
Edita `app.js` línea ~25 (CSS variables):
```css
--primary: #3b82f6;      /* Azul principal */
--secondary: #1f2937;    /* Fondo oscuro */
--accent: #10b981;       /* Verde acento */
```

### Agregar más ligas
Modifica `scraper-promiedos.js` para descargar otras ligas además de Primera División.

### Mejorar búsqueda facial
Implementa almacenamiento de descriptores faciales en IndexedDB para búsquedas más rápidas.

---

## 📞 Soporte

Si tienes problemas:
1. Abre la consola (iPhone > Safari > Ajustes > Avanzado > Consola Web)
2. Busca mensajes de error
3. Asegúrate de seguir los pasos exactamente

---

## 📜 Licencia

Esta app es de uso personal. Los datos son de Promiedos.com.ar

---

## 🎉 ¡Listo!

Ahora puedes buscar jugadores desde cualquier lugar sin internet.

**Disfruta explorando la Liga Profesional Argentina! ⚽**
