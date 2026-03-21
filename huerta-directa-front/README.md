# 🌱 Huerta Directa - Frontend

## 📁 Estructura del proyecto (Frontend Architecture)

### **Arquitectura por capas del frontend**

```
PAGES (Vistas)
   ↓
COMPONENTS (UI reutilizable)
   ↓
LAYOUTS (Estructura base)
   ↓
ASSETS (Recursos estáticos)
```

---

## 📂 Estructura de archivos completa

```
huerta-directa-front/
├─ .env.development
├─ .env.production
├─ .gitignore
├─ .vite/
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public/
├─ README.md
├─ src/
│  ├─ App.tsx
│  ├─ assets/
│  │  ├─ hero.jpg
│  │  ├─ image/
│  │  ├─ logo_huerta.png
│  │  ├─ SinImagenHuerta.png
│  ├─ components/
│  │  ├─ AboutComponents/
│  │  ├─ Auth/
│  │  ├─ Checkout/
│  │  ├─ Dashboard/
│  │  │  ├─ PanelDeControl/
│  │  │  └─ Productos/
│  │  ├─ GlobalComponents/
│  │  │  ├─ Cart/
│  │  │  ├─ FloatingButtons/
│  │  ├─ Home/
│  │  ├─ Modals/
│  ├─ config/
│  │  ├─ api.ts
│  │  └─ firebase.ts
│  ├─ contexts/
│  │  ├─ CartContext.tsx
│  │  └─ PaymentContext.tsx
│  ├─ font/
│  │  └─ Poppins/
│  ├─ hooks/
│  │  ├─ Productos/
│  │  │  ├─ useImageUpload.ts
│  │  │  ├─ useProductForm.ts
│  │  │  └─ useProducts.ts
│  │  ├─ useAuth.ts
│  │  ├─ useCart.ts
│  │  ├─ usePageTitle.ts
│  │  ├─ usePayment.ts
│  │  ├─ useSMSVerification.ts
│  ├─ layout/
│  │  ├─ AdminDashboardLayout.tsx
│  │  ├─ AuthLayout.tsx
│  │  ├─ DashboardLayout.tsx
│  │  ├─ MainLayout.tsx
│  │  ├─ PaymentLayaout.tsx
│  │  └─ StatusPaymentLayaout.tsx
│  ├─ main.tsx
│  ├─ pages/
│  │  ├─ About/
│  │  │  └─ QuienesSomos.tsx
│  │  ├─ AboutProduct/
│  │  │  └─ ProductDetailPage.tsx
│  │  ├─ Auth/
│  │  │  ├─ ForgotPassword.tsx
│  │  │  ├─ ForgotPasswordMobile.tsx
│  │  │  ├─ Login.css
│  │  │  ├─ Login.tsx
│  │  │  ├─ RegisterMobilePage.tsx
│  │  │  └─ SMSVerification.tsx
│  │  ├─ Dashboard/
│  │  │  ├─ ActualizacionUsuario.tsx
│  │  │  ├─ Dashboard.tsx
│  │  │  ├─ DashboardAgregarProducto.tsx
│  │  │  ├─ DashboardFavorites.tsx
│  │  │  ├─ DashboardGraficos.tsx
│  │  │  └─ MensajesAreaSocial.tsx
│  │  ├─ DashboardAdmin/
│  │  │  ├─ AdminConfig.tsx
│  │  │  ├─ AdminProducts.tsx
│  │  │  ├─ AdminRegister.tsx
│  │  │  ├─ AdminReports.tsx
│  │  │  ├─ AdminStats.tsx
│  │  │  ├─ AdminUsers.tsx
│  │  │  └─ DashboardAdmin.tsx
│  │  ├─ Landing/
│  │  │  └─ Landing.tsx
│  │  ├─ Main/
│  │  │  ├─ CategoryPage/
│  │  │  │  ├─ CategoryPage.tsx
│  │  │  │  └─ ProductsByCategoryPage.tsx
│  │  │  ├─ HomePage.tsx
│  │  │  └─ ProductosPage/
│  │  │     └─ ProductosPage.tsx
│  │  ├─ Payment/
│  │  │  ├─ CheckoutSummaryPage.tsx
│  │  │  ├─ MercadoPagoPayment.tsx
│  │  │  ├─ StatusFailure.tsx
│  │  │  ├─ StatusPending.tsx
│  │  │  └─ StatusSucesfull.tsx
│  ├─ services/
│  │  ├─ authService.ts
│  │  ├─ favoriteService.ts
│  │  ├─ paymentService.ts
│  │  └─ productService.ts
│  ├─ tailwind.config.js
│  ├─ types/
│  │  ├─ Product.ts
│  │  └─ swiper.d.ts
│  ├─ utils/
│  │  └─ imageHelpers.ts
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
└─ README.md
```

---

## 📋 Leyenda

- **✓** = Implementado y funcional
- **⏳** = En desarrollo
- **❌** = No implementado

---

## 🎯 Próximas mejoras

- [ ] Expandir componentes de Auth
- [ ] Crear páginas adicionales (Productos, Perfil, etc.)
- [x] Implementar Dashboard de usuario
- [x] Agregar más páginas de navegación (QuienesSomos, Dashboard)
- [x] Mejorar sistema de componentes (Cart, FloatingButtons, Home, Modals)
- [ ] Crear más componentes en Auth/
- [ ] Implementar funcionalidades de búsqueda avanzada
- [ ] Optimizar imágenes y assets

---

## 🚀 Inicio rápido

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview

# Instalar Swiper (carrusel)
npm install swiper 
```

---

**Última actualización:** 2026-03-02
