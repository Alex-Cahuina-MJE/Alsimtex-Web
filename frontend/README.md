# Alsimtex - Frontend

Aplicación web frontend para Alsimtex, una empresa especializada en textiles para el hogar. Esta aplicación permite a los usuarios explorar y comprar productos textiles como sábanas, edredones, almohadas y más.

## 🚀 Tecnologías Utilizadas

- **Vue.js 3** - Framework progresivo para construir interfaces de usuario
- **Vite** - Herramienta de construcción rápida y moderna
- **Pinia** - State management para Vue.js
- **Vue Router** - Enrutamiento oficial para Vue.js
- **Material Design Icons** - Iconografía moderna
- **SweetAlert2** - Modales y alertas elegantes

## 📋 Características

- 🛍️ **Catálogo de Productos**: Explora productos textiles organizados por categorías
- 🛒 **Carrito de Compras**: Gestión completa del carrito con cálculos automáticos
- 👤 **Sistema de Autenticación**: Registro y login de usuarios
- 📦 **Gestión de Pedidos**: Seguimiento de pedidos y estados
- 🖼️ **Galería de Imágenes**: Carruseles interactivos para productos
- 📱 **Responsive Design**: Optimizado para dispositivos móviles y desktop
- 🔍 **Filtros Avanzados**: Búsqueda y filtrado por categorías y subcategorías

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn

### Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd Web_Alsimtex/frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
Crea un archivo `.env` en la raíz del proyecto con:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5174`

## 📜 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción

## 🏗️ Estructura del Proyecto

```
frontend/
├── public/                 # Archivos estáticos
├── src/
│   ├── assets/            # Recursos (CSS, imágenes, fuentes)
│   ├── components/        # Componentes reutilizables
│   ├── composables/       # Composables de Vue
│   ├── config/           # Configuraciones de API
│   ├── router/           # Configuración de rutas
│   ├── stores/           # Stores de Pinia
│   ├── views/            # Páginas/Vistas principales
│   ├── App.vue           # Componente raíz
│   └── main.js           # Punto de entrada
├── vite.config.js         # Configuración de Vite
└── package.json           # Dependencias y scripts
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `VITE_API_BASE_URL` | URL base de la API backend | `http://localhost:5000/api` |

### Desarrollo con Backend

Asegúrate de que el backend esté corriendo en el puerto 5000. Consulta el README del backend para más detalles.

## 🚀 Despliegue

1. Construye la aplicación:
```bash
npm run build
```

2. Los archivos de producción estarán en la carpeta `dist/`

3. Despliega los contenidos de `dist/` en tu servidor web preferido

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Contacto

Alsimtex - info@alsimtex.com

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
