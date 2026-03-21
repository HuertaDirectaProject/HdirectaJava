# 🌱 Proyecto en Spring Boot — *Huerta Directa*

Este proyecto es una **recreación** de un trabajo que previamente realizamos en **PHP**, pero en esta ocasión decidimos implementar **Spring Boot** para aprovechar su arquitectura más robusta y su integración con Java.  
El objetivo principal es **aprender y aplicar buenas prácticas** en el desarrollo de aplicaciones empresariales usando Spring.

---

## 🧠 Descripción

El sistema conserva las mismas funcionalidades que el trabajo original en PHP, pero ahora cuenta con:

- ✅ **Backend** desarrollado en Spring Boot.  
- ✅ Mejor **organización del código** siguiendo el patrón **MVC**.  
- ✅ Mayor **escalabilidad y mantenibilidad**.  
- ✅ Soporte para **inyección de dependencias** y **controladores REST**.  

---

## 👥 Integrantes del equipo

- **Emerson Reyes**  
- **Jesús Parra**  
- **Jeferson Sánchez**  
- **Santiago Puetes**

---

## 🧰 Tecnologías utilizadas

| Tecnología | Descripción |
|-------------|-------------|
| **Java 21** | Lenguaje base del proyecto |
| **Spring Boot 3.5.11** | Framework principal del backend |
| **Maven** | Gestor de dependencias y compilación |
| **PostgreSQL** | Base de datos relacional |
| **Thymeleaf** | Motor de plantillas HTML |
| **Tailwind CSS** | Framework de estilos moderno |
| **Bootstrap** | Librería CSS para diseño responsivo |
| **React 19.2** | Frontend moderno (en desarrollo) |
| **TypeScript** | Tipado para JavaScript |
| **Vite** | Build tool para frontend |
| **Lombok** | Reducción de código boilerplate |
| **Apache POI** | Importar/exportar Excel |
| **OpenPDF** | Generar reportes PDF |
| **JFreeChart** | Gráficos estadísticos |
| **Twilio** | SMS de verificación |
| **Firebase** | Autenticación por SMS |
| **Mercado Pago** | Procesamiento de pagos |
| **WebSocket/STOMP** | Chat en tiempo real |

---

## 🏗️ Arquitectura por capas del Backend

```
CONTROLLERS (Rutas HTTP)
   ↓
SERVICES (Lógica de negocio)
   ↓
REPOSITORIES (Acceso a datos)
   ↓
ENTITIES (Modelos de base de datos)
```

---

## 📂 Estructura de archivos del Backend

```
Huerta-directa/
├─ src/
│  ├─ main/
│  │  ├─ java/
│  │  │  └─ com/exe/Huerta_directa/
│  │  │     ├─ HuertaDirectaApplication.java    ✓ Clase principal (Spring Boot)
│  │  │     │
│  │  │     ├─ Controllers/                      ← Controladores (MVC)
│  │  │     │  ├─ CarritoController.java         ✓ Gestión del carrito
│  │  │     │  ├─ ChatController.java            ✓ Mensajería general
│  │  │     │  ├─ ChatWebSocketController.java   ✓ WebSocket para chat
│  │  │     │  ├─ CommentController.java         ✓ Gestión de comentarios
│  │  │     │  ├─ DashboardController.java       ✓ Dashboard de usuarios
│  │  │     │  ├─ DeliveryController.java        ✓ Gestión de entregas
│  │  │     │  ├─ EmailController.java           ✓ Envío de emails
│  │  │     │  ├─ LoginController.java           ✓ Autenticación
│  │  │     │  ├─ MercadoPagoViewController.java ✓ Vistas de Mercado Pago
│  │  │     │  ├─ PaymentController.java         ✓ Procesamiento de pagos
│  │  │     │  ├─ ProductController.java         ✓ CRUD de productos
│  │  │     │  ├─ ProductExportController.java   ✓ Exportación de productos
│  │  │     │  ├─ ReportesPDFController.java     ✓ Generación de reportes PDF
│  │  │     │  ├─ RoleController.java            ✓ Gestión de roles
│  │  │     │  ├─ RutasPagina.java               ✓ Rutas de navegación
│  │  │     │  ├─ SocialMessagesController.java  ✓ Mensajes sociales
│  │  │     │  ├─ UserController.java            ✓ Gestión de usuarios
│  │  │     │  └─ UserViewController.java        ✓ Vistas de usuarios
│  │  │     │
│  │  │     ├─ Service/                          ← Servicios (Lógica de negocio)
│  │  │     │  ├─ ChatSocialService.java         ✓ Servicio de chat social
│  │  │     │  ├─ CommentService.java            ✓ Servicio de comentarios
│  │  │     │  ├─ DeliveryService.java           ✓ Servicio de entregas
│  │  │     │  ├─ DeliveryStrategyFactory.java   ✓ Factory de estrategias
│  │  │     │  ├─ ProductService.java            ✓ Servicio de productos
│  │  │     │  ├─ RoleService.java               ✓ Servicio de roles
│  │  │     │  └─ UserService.java               ✓ Servicio de usuarios
│  │  │     │
│  │  │     ├─ Impl/                             ← Implementaciones de servicios
│  │  │     │  ├─ ChatSocialServiceImpl.java      ✓ Impl de chat social
│  │  │     │  ├─ CommentServiceImpl.java         ✓ Impl de comentarios
│  │  │     │  ├─ DeliveryServiceImpl.java        ✓ Impl de entregas
│  │  │     │  ├─ DeliveryStrategyFactoryImpl.java ✓ Impl de factory
│  │  │     │  ├─ EmailServiceImpl.java           ✓ Impl de emails
│  │  │     │  ├─ MercadoPagoServicePaymentRequest.java ✓ Impl Mercado Pago
│  │  │     │  ├─ ProductServiceImpl.java         ✓ Impl de productos
│  │  │     │  ├─ RoleServiceImpl.java            ✓ Impl de roles
│  │  │     │  └─ UserServiceImpl.java            ✓ Impl de usuarios
│  │  │     │
│  │  │     ├─ Repository/                       ← Acceso a datos (JPA)
│  │  │     │  ├─ ChatSocialRepository.java      ✓ Repositorio de chat
│  │  │     │  ├─ CommentRepository.java         ✓ Repositorio de comentarios
│  │  │     │  ├─ PaymentRepository.java         ✓ Repositorio de pagos
│  │  │     │  ├─ ProductRepository.java         ✓ Repositorio de productos
│  │  │     │  ├─ RoleRepository.java            ✓ Repositorio de roles
│  │  │     │  └─ UserRepository.java            ✓ Repositorio de usuarios
│  │  │     │
│  │  │     ├─ Entity/                           ← Entidades (Modelos JPA)
│  │  │     │  ├─ ChatSocialMessage.java         ✓ Entidad de chat social
│  │  │     │  ├─ Comment.java                   ✓ Entidad de comentarios
│  │  │     │  ├─ CommentType.java               ✓ Tipo de comentario (enum)
│  │  │     │  ├─ Payment.java                   ✓ Entidad de pagos
│  │  │     │  ├─ PaymentItem.java               ✓ Items de pago
│  │  │     │  ├─ Product.java                   ✓ Entidad de productos
│  │  │     │  ├─ ProductImage.java              ✓ Imágenes de productos
│  │  │     │  ├─ Role.java                      ✓ Entidad de roles
│  │  │     │  └─ User.java                      ✓ Entidad de usuarios
│  │  │     │
│  │  │     ├─ DTO/                              ← Data Transfer Objects
│  │  │     │  ├─ AuthTokenResponse.java         ✓ Response de autenticación
│  │  │     │  ├─ BulkEmailByRoleRequest.java    ✓ Request email por rol
│  │  │     │  ├─ BulkEmailFilteredRequest.java  ✓ Request email filtrado
│  │  │     │  ├─ BulkEmailRequest.java          ✓ Request email masivo
│  │  │     │  ├─ BulkEmailResponse.java         ✓ Response email masivo
│  │  │     │  ├─ CarritoItem.java               ✓ Item del carrito
│  │  │     │  ├─ ChatMessage.java               ✓ Mensaje de chat
│  │  │     │  ├─ CommentDTO.java                ✓ DTO de comentarios
│  │  │     │  ├─ PaymentRequest.java            ✓ Request de pago
│  │  │     │  ├─ PaymentResponse.java           ✓ Response de pago
│  │  │     │  ├─ ProductDTO.java                ✓ DTO de productos
│  │  │     │  ├─ RoleDTO.java                   ✓ DTO de roles
│  │  │     │  ├─ TokenRequest.java              ✓ Request de token
│  │  │     │  └─ UserDTO.java                   ✓ DTO de usuarios
│  │  │     │
│  │  │     ├─ Strategy/                         ← Patrón Strategy
│  │  │     │  ├─ DeliveryResult.java            ✓ Resultado de entrega
│  │  │     │  ├─ DeliveryStrategy.java          ✓ Interfaz estrategia
│  │  │     │  ├─ Localidad.java                 ✓ Modelo de localidad
│  │  │     │  └─ strategies/                    ← Implementaciones
│  │  │     │     ├─ CarDeliveryStrategy.java    ✓ Entrega en auto
│  │  │     │     ├─ MotorcycleDeliveryStrategy.java ✓ Entrega en moto
│  │  │     │     ├─ SharedDeliveryStrategy.java ✓ Entrega compartida
│  │  │     │     ├─ StorePickupStrategy.java    ✓ Retiro en tienda
│  │  │     │     ├─ TruckDeliveryStrategy.java  ✓ Entrega en camión
│  │  │     │     └─ UrbanRuralDeliveryStrategy.java ✓ Entrega urbano/rural
│  │  │     │
│  │  │     └─ config/                           ← Configuración
│  │  │        ├─ GlobalAttributes.java          ✓ Atributos globales
│  │  │        ├─ MvcConfig.java                 ✓ Configuración MVC
│  │  │        ├─ PasswordConfig.java            ✓ Encriptación de contraseñas
│  │  │        ├─ WebConfig.java                 ✓ Configuración web
│  │  │        └─ WebSocketConfig.java           ✓ Configuración WebSocket
│  │  │
│  │  └─ resources/
│  │     ├─ application.properties               ✓ Configuración principal
│  │     ├─ firebase-service-account.json        ✓ Credenciales Firebase
│  │     ├─ META-INF/                            ← Metadata
│  │     │
│  │     ├─ static/                              ← Recursos estáticos
│  │     │  ├─ CSS/                              ✓ Estilos CSS
│  │     │  ├─ JS/                               ✓ Scripts JavaScript
│  │     │  ├─ images/                           ✓ Imágenes
│  │     │  └─ graficos/                         ✓ Imágenes de gráficos
│  │     │
│  │     └─ templates/                           ← Plantillas Thymeleaf
│  │        ├─ index.html                        ✓ Home principal
│  │        ├─ login/                            ✓ Plantillas de login
│  │        ├─ Agreagar_producto/                ✓ Agregar productos
│  │        ├─ buscador_usuarios/                ✓ Búsqueda de usuarios
│  │        ├─ Clientes_destacados/              ✓ Clientes destacados
│  │        ├─ Consulta_usuarios/                ✓ Consulta de usuarios
│  │        ├─ DashBoard/                        ✓ Dashboard de usuario
│  │        ├─ Dashboard_Admin/                  ✓ Dashboard de admin
│  │        ├─ Delivery_Form/                    ✓ Formularios de entrega
│  │        ├─ Errores/                          ✓ Páginas de error
│  │        ├─ fragments/                        ✓ Fragmentos reutilizables
│  │        ├─ Interfaces_Pagos/                 ✓ Interfaces de pago
│  │        ├─ MercadoPago/                      ✓ Templates Mercado Pago
│  │        ├─ Modulo_Pagos/                     ✓ Módulo de pagos
│  │        ├─ pagina_principal/                 ✓ Páginas principales
│  │        ├─ Pasarela_Pagos/                   ✓ Pasarela de pagos
│  │        ├─ Productos/                        ✓ Templates de productos
│  │        ├─ ProductosCategorias/              ✓ Categorías de productos
│  │        ├─ Quienes_somos/                    ✓ Página quiénes somos
│  │        └─ Reportes_estadisticos/            ✓ Reportes estadísticos
│  │
│  └─ test/
│     └─ java/
│        └─ com/exe/                             ← Tests unitarios
│
├─ target/                                       ← Artefactos compilados
├─ pom.xml                                       ✓ Dependencias Maven
├─ mvnw & mvnw.cmd                               ✓ Maven Wrapper
├─ package.json                                  ✓ Dependencias Node (Tailwind)
├─ tailwind.config.js                            ✓ Config Tailwind
├─ postcss.config.js                             ✓ Config PostCSS
├─ productos_ejemplo.csv                         ✓ CSV de ejemplo
├─ Scrip\ base\ de\ datos.txt                    ✓ Script SQL
├─ HELP.md                                       ✓ Ayuda del proyecto
└─ pom.xml                                       ✓ Configuración Maven
```

---

## 📋 Leyenda
- **✓** = Implementado y funcional
- **⏳** = En desarrollo
- **❌** = No implementado

---

## 🏗️ Arquitectura por capas del Frontend

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

## 📂 Estructura de archivos del Frontend

```
huerta-directa-front/
├─ public/                                      ← Archivos estáticos públicos
│
├─ src/
│  ├─ assets/                                  ← Imágenes, logos, íconos
│  │  ├─ logo_huerta.png                       ✓ Logo principal
│  │  └─ image/                                ← Imágenes de productos y UI
│  │     ├─ 1.png                              ✓ Imagen producto 1
│  │     ├─ ImagenHover-modified.png           ✓ Imagen hover modificada
│  │     ├─ pr4.png                            ✓ Imagen producto 4
│  │     ├─ pr5.png                            ✓ Imagen producto 5
│  │     ├─ pr6.png                            ✓ Imagen producto 6
│  │     ├─ rigth.png                          ✓ Imagen decorativa
│  │     └─ oferts/                            ✓ Carpeta con ofertas
│  │
│  ├─ components/                              ← Componentes reutilizables UI
│  │  ├─ Auth/                                 ← Componentes de autenticación
│  │  │  └─ (vacío - en desarrollo)            ⏳ Componentes auth por implementar
│  │  │
│  │  ├─ GlobalComponents/                     ← Componentes globales
│  │  │  ├─ AdminSidebar.tsx                   ✓ Barra lateral admin
│  │  │  ├─ Background.tsx                     ✓ Componente de fondo
│  │  │  ├─ Button.tsx                         ✓ Botón reutilizable
│  │  │  ├─ DashboardHeader.tsx                ✓ Encabezado del dashboard
│  │  │  ├─ Footer.tsx                         ✓ Pie de página
│  │  │  ├─ Loader.tsx                         ✓ Componente de carga
│  │  │  ├─ Modal.tsx                          ✓ Modal genérico
│  │  │  ├─ Navbar.tsx                         ✓ Barra de navegación
│  │  │  ├─ PasswordInput.tsx                  ✓ Input para contraseña
│  │  │  ├─ ProfileMenu.tsx                    ✓ Menú de perfil
│  │  │  ├─ Sidebar.tsx                        ✓ Barra lateral
│  │  │  ├─ ThemeToggle.tsx                    ✓ Toggle para tema oscuro/claro
│  │  │  ├─ Cart/                              ← Componentes del carrito
│  │  │  │  ├─ CartButton.tsx                  ✓ Botón del carrito
│  │  │  │  └─ CartDropdown.tsx                ✓ Desplegable del carrito
│  │  │  └─ FloatingButtons/                   ← Botones flotantes
│  │  │     ├─ FloatingActionButton.tsx        ✓ Botón de acción flotante
│  │  │     └─ FloatingChatButton.tsx          ✓ Botón de chat flotante
│  │  │
│  │  ├─ Home/                                 ← Componentes para la página de inicio
│  │  │  ├─ CategoriesSection.tsx              ✓ Sección de categorías
│  │  │  ├─ HeaderSection.tsx                  ✓ Sección de encabezado
│  │  │  ├─ HeroSlider.tsx                     ✓ Carrusel principal
│  │  │  ├─ InformationSection.tsx             ✓ Sección de información
│  │  │  ├─ OffersSection.tsx                  ✓ Sección de ofertas
│  │  │  ├─ ProductCard.tsx                    ✓ Tarjeta de producto
│  │  │  └─ ProductsSection.tsx                ✓ Sección de productos
│  │  │
│  │  └─ Modals/                               ← Componentes modales
│  │     ├─ ChatModal.tsx                      ✓ Modal de chat
│  │     ├─ EditProductModal.tsx               ✓ Modal para editar productos
│  │     ├─ EditUserModal.tsx                  ✓ Modal para editar datos del usuario
│  │     └─ NotifyProducerModal.tsx            ✓ Modal para notificar productores
│  │
│  ├─ font/                                    ← Fuentes personalizadas
│  │  └─ Poppins/                              ✓ Fuentes Poppins (19 variantes)
│  │     ├─ OFL.txt                            ✓ Licencia Open Font License
│  │     ├─ Poppins-Black.ttf                  ✓ Peso Black
│  │     ├─ Poppins-Bold.ttf                   ✓ Peso Bold
│  │     ├─ Poppins-ExtraBold.ttf              ✓ Peso ExtraBold
│  │     ├─ Poppins-Light.ttf                  ✓ Peso Light
│  │     ├─ Poppins-Medium.ttf                 ✓ Peso Medium
│  │     ├─ Poppins-Regular.ttf                ✓ Peso Regular
│  │     ├─ Poppins-SemiBold.ttf               ✓ Peso SemiBold
│  │     └─ ... (y más variantes)              ✓ Variantes Italic incluidas
│  │
│  ├─ hooks/                                   ← Custom React hooks
│  │  ├─ useAuth.ts                            ✓ Hook de autenticación
│  │  └─ usePageTitle.ts                       ✓ Hook para título de página
│  │
│  ├─ layout/                                  ← Layouts (estructura base)
│  │  ├─ AdminDashboardLayout.tsx              ✓ Layout para admin dashboard
│  │  ├─ AuthLayout.tsx                        ✓ Layout de autenticación
│  │  ├─ DashboardLayout.tsx                   ✓ Layout del dashboard de usuario
│  │  └─ MainLayout.tsx                        ✓ Layout principal
│  │
│  ├─ pages/                                   ← Vistas (rutas)
│  │  ├─ Auth/                                 ← Páginas de autenticación
│  │  │  ├─ Login.tsx                          ✓ Página de login
│  │  │  └─ Login.css                          ✓ Estilos de login
│  │  │
│  │  ├─ Dashboard/                            ← Páginas del dashboard de usuario
│  │  │  ├─ Dashboard.tsx                      ✓ Dashboard principal
│  │  │  ├─ ActualizacionUsuario.tsx           ✓ Actualizar perfil de usuario
│  │  │  ├─ DashboardAgregarProducto.tsx       ✓ Agregar nuevo producto
│  │  │  ├─ DashboardGraficos.tsx              ✓ Gráficos y estadísticas
│  │  │  └─ MensajesAreaSocial.tsx             ✓ Área de mensajes sociales
│  │  │
│  │  ├─ DashboardAdmin/                       ← Páginas del dashboard admin
│  │  │  ├─ DashboardAdmin.tsx                 ✓ Dashboard admin principal
│  │  │  ├─ AdminConfig.tsx                    ✓ Configuración general del sistema
│  │  │  ├─ AdminProducts.tsx                  ✓ Gestión de productos
│  │  │  ├─ AdminRegister.tsx                  ✓ Registro de nuevos admins
│  │  │  ├─ AdminReports.tsx                   ✓ Reportes del sistema
│  │  │  ├─ AdminStats.tsx                     ✓ Estadísticas generales
│  │  │  └─ AdminUsers.tsx                     ✓ Gestión de usuarios
│  │  │
│  │  ├─ Landing/                              ← Páginas públicas
│  │  │  └─ Landing.tsx                        ✓ Landing page / Home público
│  │  │
│  │  ├─ Main/                                 ← Páginas principales (autenticadas)
│  │  │  └─ HomePage.tsx                       ✓ Home page del usuario logueado
│  │  │
│  │  └─ QuienesSomos/                         ← Páginas informativas
│  │     └─ QuienesSomos.tsx                   ✓ Página quiénes somos
│  │
│  ├─ types/                                   ← Definiciones de tipos TypeScript
│  │  └─ swiper.d.ts                           ✓ Tipos para Swiper
│  │
│  ├─ App.tsx                                  ✓ Componente principal y rutas
│  ├─ main.tsx                                 ✓ Entry point de la aplicación
│  └─ index.css                                ✓ Tailwind base y estilos globales
│
├─ .gitignore                                  ✓ Exclusiones de git
├─ index.html                                  ✓ HTML principal
├─ package.json                                ✓ Dependencias del proyecto
├─ package-lock.json                           ✓ Lock file de dependencias
├─ tsconfig.json                               ✓ Configuración TypeScript
├─ tsconfig.app.json                           ✓ Config TypeScript - aplicación
├─ tsconfig.node.json                          ✓ Config TypeScript - node
├─ vite.config.ts                              ✓ Configuración de Vite
├─ eslint.config.js                            ✓ Configuración de ESLint
└─ README.md                                   ✓ Este archivo
```

---

## ⚙️ Instalación del sistema (obligatorio)

Esta sección reemplaza la instalación típica de PHP/XAMPP porque este proyecto está construido con Spring Boot + PostgreSQL + React/Vite.

### ✅ Requisitos

- Java 21 (JDK)
- Maven 3.9+ (o usar `mvnw.cmd` cuando el wrapper esté completo)
- Node.js 20+ y npm
- PostgreSQL 14+
- Git
- Navegador web (Chrome, Edge o Firefox)

### 🧩 Pasos de instalación

1. Descargar o clonar el proyecto

   - Repositorio: `https://github.com/152004E/HdirectaJava.git`

2. Entrar a las carpetas del backend y frontend

   - Backend: `HdirectaJava/Huerta-directa`
   - Frontend: `HdirectaJava/huerta-directa-front`

3. Crear la base de datos en PostgreSQL

   - Nombre sugerido: `huerta_directa`

4. Importar el script SQL

   - Opción 1: usar `Huerta-directa/src/main/resources/schema.sql`
   - Opción 2: usar `Huerta-directa/Scrip base de datos.txt`

5. Configurar conexión a base de datos y entorno local

   - Editar `Huerta-directa/src/main/resources/application-dev.properties`
   - Revisar al menos:
     - `spring.datasource.url`
     - `spring.datasource.username`
     - `spring.datasource.password`
     - `server.port` (actualmente `8085`)

6. Instalar dependencias del frontend

   - En `huerta-directa-front`: ejecutar `npm install`

7. Ejecutar backend (Spring Boot)

   - En `Huerta-directa`: ejecutar `mvn spring-boot:run`

8. Ejecutar frontend (React + Vite)

   - En `huerta-directa-front`: ejecutar `npm run dev`

9. Abrir en navegador

   - Frontend: `http://localhost:5173`
   - Backend/API: `http://localhost:8085`

---

## ⚙️ Instalación y configuración de Tailwind CSS

A continuación se explican **todos los pasos necesarios** para instalar y ejecutar **Tailwind CSS** dentro del proyecto **Spring Boot**.

---

### 1️⃣ Posicionarse en la raíz del proyecto

Abre una terminal en la carpeta principal del proyecto:

```bash
cd Huerta-directa
```

---

### 2️⃣ Inicializar npm

Crea el archivo `package.json` para manejar las dependencias de Node.js:

```bash
npm init -y
```

---

### 3️⃣ Instalar Tailwind CSS y su CLI

Ejecuta el siguiente comando para instalar Tailwind:

```bash
npm install tailwindcss @tailwindcss/cli
```

---

### 4️⃣ Compilar Tailwind

Ejecuta este comando para generar el archivo `output.css` y mantenerlo actualizado con cada cambio:

```bash
npx @tailwindcss/cli -i ./src/main/resources/static/css/input.css -o ./src/main/resources/static/css/output.css --watch
```

---

## 🚀 Ejecución completa del proyecto

Sigue los pasos a continuación para ejecutar **Huerta Directa** correctamente.

---

### 🧩 Clonar el repositorio

```bash
git clone https://github.com/152004E/HdirectaJava.git
```

---

### 📁 Entrar en la carpeta del proyecto

```bash
cd HdirectaJava/Huerta-directa
```

---

### 🎨 Compilar Tailwind (mantener abierto el proceso)

```bash
npx @tailwindcss/cli -i ./src/main/resources/static/css/input.css -o ./src/main/resources/static/css/output.css --watch
```

---

### 🔧 Ejecutar el servidor de Spring Boot

```bash
mvn spring-boot:run
```

---

### 🌐 Abrir en el navegador

```bash
http://localhost:8085

```

### 🌐 application.properties

spring.application.name=Huerta-directa

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/huerta_directa
spring.datasource.username=postgres
#spring.datasource.password=2424
spring.datasource.password=1234



spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true
spring.jpa.properties.hibernate.temp.use_jdbc_metadata_defaults=false
# Desactiva cach? para ver cambios sin reiniciar
spring.thymeleaf.cache=false

# Ubicaci?n y extensi?n por defecto
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html

# (Opcional) Modo de plantillas
spring.thymeleaf.mode=HTML

logging.level.org.thymeleaf=TRACE

# Ruta para subir im�genes
upload.path=C:/HuertaUploads

# Tama�o m�ximo de archivo individual
spring.servlet.multipart.max-file-size=10MB
# Tama�o m�ximo de request completo
spring.servlet.multipart.max-request-size=10MB

# Puerto salida
server.port=8085
# Access Token de PRUEBA (para desarrollo)




mercadopago.access_token=TEST-2739771912434898-111023-440e0fc48167af26ffe666b77d3d947f-2272938327
mercadopago.public_key=TEST-e589cbad-ee43-483c-9bb9-0911bed0eb35
mercadopago.success_url=http://localhost:8085/payment/success
mercadopago.failure_url=http://localhost:8085/payment/failure
mercadopago.pending_url=http://localhost:8085/payment/pending