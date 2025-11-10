import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProductosView from '../views/ProductosView.vue'
import ProductoDetalleView from '../views/ProductoDetalleView.vue'
import NosotrosView from '../views/NosotrosView.vue'
import ContactoView from '../views/ContactoView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import MisPedidosView from '../views/MisPedidosView.vue'
import AnimationsShowcase from '../views/AnimationsShowcase.vue'
import DashboardView from '../views/admin/DashboardView.vue'
import ProductosAdminView from '../views/admin/ProductosAdminView.vue'
import EditarProductosView from '../views/admin/EditarProductosView.vue'
import UsuariosAdminView from '../views/admin/UsuariosAdminView.vue'
import PedidosAdminView from '../views/admin/PedidosAdminView.vue'
import MisProductosAdminView from '../views/admin/MisProductosAdminView.vue'
import ConfiguracionEmpresaView from '../views/admin/ConfiguracionEmpresaView.vue'
import { useAuthStore } from '../stores/authStore'

const router = createRouter({
    history: createWebHistory(
        import.meta.env.BASE_URL),
    routes: [{
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/productos',
            name: 'productos',
            component: ProductosView
        },
        {
            path: '/producto/:id',
            name: 'producto-detalle',
            component: ProductoDetalleView
        },
        {
            path: '/nosotros',
            name: 'nosotros',
            component: NosotrosView
        },
        {
            path: '/contacto',
            name: 'contacto',
            component: ContactoView
        },
        {
            path: '/animations',
            name: 'animations',
            component: AnimationsShowcase
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { requiresGuest: true }
        },
        {
            path: '/register',
            name: 'register',
            component: RegisterView,
            meta: { requiresGuest: true }
        },
            {
                path: '/checkout',
                name: 'checkout',
                component: CheckoutView
            },
        {
            path: '/mis-pedidos',
            name: 'mis-pedidos',
            component: MisPedidosView,
            meta: { requiresAuth: true }
        },
        // Rutas del Admin
        {
            path: '/admin',
            name: 'admin-dashboard',
            component: DashboardView,
            meta: { requiresAdmin: true }
        },
        {
            path: '/admin/productos',
            name: 'admin-productos',
            component: ProductosAdminView,
            meta: { requiresAdmin: true }
        },
        {
            path: '/admin/editar-productos',
            name: 'admin-editar-productos',
            component: EditarProductosView,
            meta: { requiresAdmin: true }
        },
        {
            path: '/admin/usuarios',
            name: 'admin-usuarios',
            component: UsuariosAdminView,
            meta: { requiresAdmin: true }
        },
        {
            path: '/admin/pedidos',
            name: 'admin-pedidos',
            component: PedidosAdminView,
            meta: { requiresAdmin: true }
        },
        {
            path: '/admin/mis-productos',
            name: 'admin-mis-productos',
            component: MisProductosAdminView,
            meta: { requiresAdmin: true }
        },
        {
            path: '/admin/configuracion',
            name: 'admin-configuracion',
            component: ConfiguracionEmpresaView,
            meta: { requiresAdmin: true }
        }
    ],
    scrollBehavior(to, from, savedPosition) {
        // Scroll to top on every route navigation
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

// Navegación guard
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    // Si la ruta requiere un usuario no autenticado y el usuario está autenticado
    if (to.meta.requiresGuest && authStore.isAuthenticated()) {
        next('/')
        return
    }

    // Si la ruta requiere autenticación y el usuario no está autenticado
    if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
        next('/login')
        return
    }

    // Si la ruta requiere admin y el usuario no es admin
    if (to.meta.requiresAdmin) {
        if (!authStore.isAuthenticated()) {
            next('/login')
            return
        }
        if (!authStore.isAdmin()) {
            next('/')
            return
        }
    }

    next()
})

export default router