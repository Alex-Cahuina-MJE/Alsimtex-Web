# 📱 Guía de Diseño Responsive - ALSIMTEX

## ✅ Optimizaciones Implementadas

### 🎯 Sistema de Breakpoints

La aplicación utiliza un sistema de breakpoints mobile-first:

- **Mobile (XS)**: 320px - 767px
- **Tablet (MD)**: 768px - 1023px  
- **Desktop (LG)**: 1024px - 1279px
- **Large Desktop (XL)**: 1280px+

### 📦 Archivos Principales

#### 1. **style.css** (Estilos Base)
- Variables CSS globales
- Sistema de colores y tipografía
- Espaciado responsive
- Utilidades responsive
- Animaciones optimizadas

#### 2. **responsive.css** (Framework Responsive)
- Componentes responsive reutilizables
- Grids adaptativos
- Utilidades de visibilidad
- Optimizaciones táctiles
- Modo landscape

#### 3. **index.html** (Configuración Meta)
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
<meta name="theme-color" content="#14b8a6" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

## 🔧 Componentes Optimizados

### 1. NavBar.vue ✅
**Optimizaciones móviles:**
- ✅ Menú hamburguesa funcional
- ✅ Logo adaptativo (70px → 60px → 50px)
- ✅ Overlay para móvil
- ✅ Links de navegación en columna
- ✅ Botones de acción más pequeños (48px → 40px → 36px)
- ✅ Menú de usuario responsive
- ✅ Animaciones suaves

**Breakpoints:**
```css
@media (max-width: 768px) { /* Tablet */ }
@media (max-width: 480px) { /* Mobile */ }
```

### 2. ProductosFiltros.vue ✅
**Optimizaciones móviles:**
- ✅ Sidebar sticky en desktop
- ✅ Padding reducido en móvil
- ✅ Tamaño de fuente adaptativo
- ✅ Botones de filtro táctiles (44px mínimo)
- ✅ Tags de filtro compactos
- ✅ Búsqueda responsive
- ✅ Scroll optimizado en landscape

**Mobile Breakpoints:**
```css
@media (max-width: 768px) { padding: 1rem; }
@media (max-width: 480px) { padding: 0.75rem; }
```

### 3. ShoppingCartPro.vue ✅
**Optimizaciones móviles:**
- ✅ Panel 100% ancho en móvil
- ✅ Imágenes adaptativas (80px → 60px)
- ✅ Botones táctiles optimizados
- ✅ Layout flexible para items
- ✅ Footer sticky con scroll
- ✅ Botones stack en móvil

**Características:**
- Touch-friendly: Áreas táctiles mínimo 44px
- Swipe para cerrar (nativo)
- Feedback visual en actualizaciones
- Vibración táctil (si disponible)

### 4. ProductosTable.vue
**Estado:** ⚠️ Requiere optimización adicional
**Recomendaciones:**
- Convertir a cards en móvil
- Vista de lista compacta en tablet
- Acciones en dropdown

## 📐 Clases Responsive Disponibles

### Grids Adaptativos
```html
<!-- Grid que se adapta automáticamente -->
<div class="grid-responsive">
  <!-- 1 col móvil, 2 tablet, 3 desktop, 4 xl -->
</div>

<!-- Productos Grid -->
<div class="productos-grid">
  <!-- 1 col móvil, 2 tablet, 3 desktop, 4 xl -->
</div>
```

### Contenedores
```html
<div class="container">          <!-- Max-width con padding adaptativo -->
<div class="container-fluid">    <!-- 100% ancho con padding -->
```

### Visibilidad
```html
<div class="hide-mobile">   <!-- Oculto en móvil -->
<div class="hide-tablet">   <!-- Oculto en tablet -->
<div class="hide-desktop">  <!-- Oculto en desktop -->

<div class="show-mobile">   <!-- Solo visible en móvil -->
<div class="show-tablet">   <!-- Solo visible en tablet -->
<div class="show-desktop">  <!-- Solo visible en desktop -->
```

### Botones
```html
<button class="btn-responsive">
  <!-- 100% ancho en móvil, auto en desktop -->
</button>
```

### Formularios
```html
<form class="form-responsive">
  <!-- Inputs 100% ancho con min-height 44px -->
</form>
```

### Modales
```html
<div class="modal-responsive">
  <div class="modal-content-responsive">
    <!-- Fullscreen en móvil, centrado en desktop -->
  </div>
</div>
```

## 🎨 Variables CSS Responsive

### Espaciado (se reduce en móvil)
```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px → 32px móvil */
--spacing-3xl: 4rem;     /* 64px → 40px móvil */
--spacing-4xl: 6rem;     /* 96px → 48px móvil */
```

### Tipografía (escala en móvil)
```css
/* Desktop base: 16px */
/* Tablet: 14px */
/* Mobile: 13px */

h1: 2.25rem → 1.875rem → 1.5rem
h2: 1.875rem → 1.5rem → 1.25rem
h3: 1.5rem → 1.25rem → 1.125rem
```

## 📱 Optimizaciones Táctiles

### Áreas Táctiles Mínimas
```css
@media (hover: none) and (pointer: coarse) {
  button, a, input[type="button"] {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### Feedback Táctil
```css
button:active, a:active {
  opacity: 0.7;
}
```

### Vibración (implementada en JS)
```javascript
if (navigator.vibrate) {
  navigator.vibrate(50);
}
```

## 🔄 Vistas Principales

### HomeView.vue
**Responsive features:**
- Hero adaptativo (100vh → 80vh → 60vh)
- Video background con parallax
- Logo escalable
- Botones stack en móvil
- Feature tags flexibles
- Action cards grid responsive

### ProductosView.vue
**Responsive features:**
- Grid de productos adaptativo
- Filtros laterales (sidebar → offcanvas móvil)
- Modales fullscreen en móvil
- Carrusel de telas touch-friendly
- Especificaciones colapsables

### CheckoutView.vue
**Responsive features:**
- Formulario en pasos
- Inputs full-width en móvil
- Botones stack verticalmente
- Resumen sticky
- Validación visual mejorada

## ⚡ Mejoras de Performance

### Lazy Loading
```vue
<LazyImage :src="imagen" :alt="descripcion" />
```

### Optimización de Imágenes
```css
img {
  max-width: 100%;
  height: auto;
  display: block;
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🎯 Próximas Optimizaciones

### Pendientes
- [ ] Convertir ProductosTable a cards responsive
- [ ] Optimizar AdminLayout para tablets
- [ ] Mejorar ImageCarousel para touch
- [ ] Añadir gestos swipe en galerías
- [ ] Optimizar carga de fuentes
- [ ] Implementar Service Worker para PWA

### En Progreso
- [x] Sistema de diseño responsive base
- [x] Componentes principales optimizados
- [x] NavBar mobile-first
- [x] Carrito lateral responsive
- [x] Filtros adaptativos

## 📝 Guía de Uso

### Para Desarrolladores

1. **Usar clases responsive existentes:**
```html
<div class="grid-responsive">
  <div class="card-responsive">...</div>
</div>
```

2. **Añadir media queries específicas:**
```css
@media (max-width: 767px) {
  .mi-componente {
    /* Estilos móvil */
  }
}
```

3. **Variables CSS para consistencia:**
```css
.mi-elemento {
  padding: var(--spacing-lg);
  font-size: var(--font-base);
}
```

### Testing en Dispositivos

1. **Chrome DevTools:** F12 → Toggle Device Toolbar
2. **Breakpoints a probar:**
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - iPad Pro (1024px)
   - Desktop (1280px+)

3. **Orientaciones:**
   - Portrait
   - Landscape

## 🐛 Debugging Tips

### Overflow issues
```css
* {
  overflow-x: hidden;
}
```

### Touch actions
```css
.draggable {
  touch-action: none;
}
```

### Font size adjustment
```css
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
```

## 📚 Recursos

- [MDN: Responsive Design](https://developer.mozilla.org/es/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Web.dev: Responsive Images](https://web.dev/responsive-images/)
- [CSS-Tricks: Media Queries](https://css-tricks.com/a-complete-guide-to-css-media-queries/)

---

**Última actualización:** 10 de noviembre de 2025
**Versión:** 1.0.0
**Estado:** ✅ Base implementada, optimizaciones continuas
