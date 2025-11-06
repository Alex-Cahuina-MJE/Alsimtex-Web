# Alsimtex - Backend API

API REST backend para Alsimtex, construida con Node.js, Express y PostgreSQL. Proporciona endpoints para gestión de productos, usuarios, pedidos y autenticación.

## 🚀 Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web para Node.js
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación basada en tokens
- **bcryptjs** - Hashing de contraseñas
- **Winston** - Logging
- **Multer** - Manejo de archivos
- **CORS** - Cross-Origin Resource Sharing
- **Helmet** - Seguridad de headers HTTP
- **Rate Limiting** - Control de tasa de solicitudes

## 📋 Características

- 🔐 **Autenticación JWT**: Sistema seguro de login y registro
- 👥 **Gestión de Usuarios**: CRUD completo de usuarios con roles
- 📦 **Catálogo de Productos**: API para productos textiles
- 🛒 **Sistema de Pedidos**: Creación y gestión de pedidos
- 📁 **Upload de Archivos**: Manejo de imágenes y documentos
- 📊 **Logging**: Sistema de logs estructurado
- 🛡️ **Seguridad**: Middlewares de seguridad y validación
- 📡 **Rate Limiting**: Protección contra abuso de API

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js (versión 16 o superior)
- PostgreSQL (versión 12 o superior)
- npm o yarn

### Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd Web_Alsimtex/backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
Crea un archivo `.env` en la raíz del proyecto:
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
DB_HOST=localhost
DB_USER=tu_usuario_postgres
DB_PASSWORD=tu_password_postgres
DB_NAME=alsimtex_db
DB_PORT=5432
FRONTEND_URL=http://localhost:5174
```

4. Configura la base de datos:
```bash
# Ejecuta el script de setup para crear tablas y usuarios de prueba
npm run setup
```

5. Inicia el servidor:
```bash
npm run dev
```

La API estará disponible en `http://localhost:5000`

## 📜 Scripts Disponibles

- `npm start` - Inicia el servidor en producción
- `npm run dev` - Inicia el servidor con nodemon (desarrollo)
- `npm run setup` - Configura la base de datos inicial

## 🗄️ Base de Datos

### Estructura

- **usuarios**: Gestión de usuarios y autenticación
- **productos**: Catálogo de productos textiles
- **pedidos**: Órdenes de compra
- **detalles_pedido**: Items de cada pedido

### Migraciones

Las migraciones están en la carpeta `migrations/` y se ejecutan automáticamente.

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login de usuario
- `GET /api/auth/profile` - Perfil del usuario autenticado

### Productos
- `GET /api/productos` - Lista de productos
- `POST /api/productos` - Crear producto (admin)
- `PUT /api/productos/:id` - Actualizar producto (admin)
- `DELETE /api/productos/:id` - Eliminar producto (admin)
- `GET /api/productos/categorias` - Lista de categorías

### Pedidos
- `POST /api/pedidos` - Crear pedido
- `GET /api/pedidos` - Lista de pedidos (admin)
- `GET /api/pedidos/:id` - Detalle de pedido
- `PUT /api/pedidos/:id/estado` - Actualizar estado (admin)

### Usuarios
- `GET /api/usuarios` - Lista de usuarios (admin)
- `PUT /api/usuarios/:id` - Actualizar usuario (admin)

## 🏗️ Estructura del Proyecto

```
backend/
├── src/
│   ├── config/           # Configuraciones (DB, logger, security)
│   ├── controllers/      # Lógica de negocio
│   ├── db/              # Conexión a base de datos
│   ├── middleware/      # Middlewares personalizados
│   ├── routes/          # Definición de rutas
│   └── index.js         # Punto de entrada
├── migrations/          # Scripts de migración de BD
├── uploads/            # Archivos subidos
├── logs/               # Archivos de log
├── setup.js            # Script de configuración inicial
├── package.json        # Dependencias
└── README.md
```

## 🔒 Seguridad

- **JWT Tokens**: Autenticación stateless
- **Password Hashing**: bcryptjs con salt rounds
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **CORS**: Configurado para origen específico
- **Helmet**: Headers de seguridad HTTP
- **Input Validation**: Validación de datos de entrada
- **File Upload Security**: Validación de tipos y tamaños de archivo

## 📊 Logging

Los logs se almacenan en `logs/` con los siguientes niveles:
- **error.log**: Errores de aplicación
- **combined.log**: Todos los logs

En desarrollo también se muestra en consola.

## 🚀 Despliegue

1. Configura las variables de entorno para producción
2. Ejecuta `npm run setup` para configurar la BD
3. Inicia con `npm start`

## 🧪 Testing

```bash
npm test
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Contacto

Alsimtex - info@alsimtex.com

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.