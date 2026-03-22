package com.exe.Huerta_directa.Controllers;

import com.exe.Huerta_directa.DTO.ProductDTO;
import com.exe.Huerta_directa.DTO.CommentDTO;
import com.exe.Huerta_directa.DTO.UserDTO;
import com.exe.Huerta_directa.Entity.User;
import com.exe.Huerta_directa.Repository.UserRepository;
import com.exe.Huerta_directa.Service.ProductService;
import com.exe.Huerta_directa.Service.UserService;
import com.exe.Huerta_directa.Service.CommentService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;

import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartUtils;
import org.jfree.chart.JFreeChart;
import org.jfree.data.general.DefaultPieDataset;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class RutasPagina {

    private final ProductService productService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final CommentService commentService;

    public RutasPagina(ProductService productService, UserService userService, UserRepository userRepository,
            CommentService commentService) {
        this.productService = productService;
        this.userService = userService;
        this.userRepository = userRepository;
        this.commentService = commentService;
    }

    /**
     * Método helper para obtener la página de inicio según el rol del usuario
     */
    private String getHomePageByUserRole(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null && user.getRole() != null) {
            // Si es admin (rol 1), redirigir al dashboard admin
            if (user.getRole().getIdRole() == 1) {
                return "redirect:/DashboardAdmin";
            } else if (user.getRole().getIdRole() == 2) {
                // Si es cliente (rol 2), redirigir al dashboard cliente
                return "redirect:/Dashboardd";
            }
        }
        // Por defecto, redirigir al index normal
        return "redirect:/index";
    }

    /**
     * Endpoint para redirección inteligente a inicio basada en sesión
     * Los botones que antes iban a /index ahora deben ir a /home
     */
    @GetMapping("/home")
    public String irAInicio(HttpSession session) {
        return getHomePageByUserRole(session);
    }

    @GetMapping({ "/", "/index" })
    public String mostrarIndex(Model model,
            @ModelAttribute("success") String success,
            HttpSession session) {
        // Log para debugging
        System.out.println("🔍 DEBUG: Mensaje de éxito recibido: " + success);

        // Obtener usuario de la sesión (igual que en dashboard)
        User userSession = (User) session.getAttribute("user");
        if (userSession == null) {
            // Si no hay sesión, redirigir al login
            return "redirect:/login?message=Debes+iniciar+sesion+para+acceder";
        }

        // Obtener TODOS los productos para mostrar en el index
        List<ProductDTO> productos = productService.listarProducts();

        // Enrich products with rating data (average rating and review count)
        productService.enrichProductsWithRatings(productos);

        // Marcar productos del usuario actual con etiqueta
        productos.forEach(producto -> {
            if (producto.getUserId() != null && producto.getUserId().equals(userSession.getId())) {
                producto.setEtiqueta("MI PRODUCTO"); // Agregar etiqueta a tus productos
            } else {
                producto.setEtiqueta("PRODUCTO DE OTRO USUARIO");
            }
        });

        System.out.println("📦 Total productos cargados: " + productos.size());
        System.out.println("👤 MIS PRODUCTOS del usuario " + userSession.getName() + ": " +
                productos.stream().filter(p -> "MI PRODUCTO".equals(p.getEtiqueta())).count());

        model.addAttribute("productos", productos);
        model.addAttribute("currentUser", userSession);

        // Si hay un mensaje de éxito, agregarlo al modelo
        if (success != null && !success.isEmpty()) {
            model.addAttribute("success", success);
        }

        return "index";
    }

    @GetMapping("/agregar_producto")
    public String mostrarFormulario(
            HttpSession session,
            RedirectAttributes redirectAttributes) {

        User currentUser = (User) session.getAttribute("user");

        if (currentUser == null) {
            redirectAttributes.addFlashAttribute("error", "Debe iniciar sesion para acceder");
            return "redirect:/login";
        }

        // Obtiene el usuario actualizado de la base de datos
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar que tenga teléfono y dirección completos
        if (user.getPhone() == null || user.getPhone().trim().isEmpty()) {
            redirectAttributes.addFlashAttribute("error",
                    "Debe completar su número de teléfono en el perfil antes de agregar productos");
            return "redirect:/actualizacionUsuario";
        }

        if (user.getAddress() == null || user.getAddress().trim().isEmpty()) {
            redirectAttributes.addFlashAttribute("error",
                    "Debe completar su dirección en el perfil antes de agregar productos");
            return "redirect:/actualizacionUsuario";
        }

        // Si todo está bien, mostrar el formulario
        return "Agreagar_producto/Agregar_producto";
    }
    // agregar producto desde agregar producto admin

    @GetMapping("/DashBoardAdminAgregarProducto")
    public String mostrarFormularioAdmin(
            HttpSession session,
            RedirectAttributes redirectAttributes) {

        User currentUser = (User) session.getAttribute("user");

        if (currentUser == null) {
            redirectAttributes.addFlashAttribute("error", "Debe iniciar sesion para acceder");
            return "redirect:/login";
        }

        // Obtiene el usuario actualizado de la base de datos
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar que tenga teléfono y dirección completos
        if (user.getPhone() == null || user.getPhone().trim().isEmpty()) {
            redirectAttributes.addFlashAttribute("error",
                    "Debe completar su número de teléfono en el perfil antes de agregar productos");
            return "redirect:/actualizacionUsuario";
        }

        if (user.getAddress() == null || user.getAddress().trim().isEmpty()) {
            redirectAttributes.addFlashAttribute("error",
                    "Debe completar su dirección en el perfil antes de agregar productos");
            return "redirect:/actualizacionUsuario";
        }

        // Si todo está bien, mostrar el formulario
        return "Dashboard_Admin/DashBoardAdminAgregarProducto";
    }

    @GetMapping("/login")
    public String mostrarLogin(Model model,
            @RequestParam(value = "error", required = false) String errorParam,
            @RequestParam(value = "message", required = false) String messageParam,
            @RequestParam(value = "success", required = false) String successParam) {

        System.out.println("🔍 DEBUG: Controlador /login ejecutándose correctamente");

        // Si venimos de un redirect con FlashAttributes, el "userDTO" ya estará en el
        // model:
        // NO lo sobreescribimos para no perder los datos del formulario.
        if (!model.containsAttribute("userDTO")) {
            model.addAttribute("userDTO", new UserDTO());
        }

        // Si el controlador anterior puso un flash "alertMessage" o "error", preferimos
        // eso.
        // Si no hay flash, seguimos aceptando los query params legacy (ej:
        // ?error=session&message=...).
        if (!model.containsAttribute("alertMessage") && "session".equals(errorParam) && messageParam != null) {
            model.addAttribute("alertMessage", messageParam.replace("+", " "));
        }

        if (!model.containsAttribute("success") && successParam != null && !successParam.isEmpty()) {
            model.addAttribute("success", successParam.replace("+", " "));
        }

        // Si existe flash "error" ya está en el model y Thymeleaf lo mostrará con
        // th:if="${error}"
        return "login/login"; // <-- ajusta a "login" si tu archivo está en templates/login.html
    }

    @GetMapping("/forgot-password")
    public String mostrarFormularioRecuperacion(Model model,
            @RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "success", required = false) String success) {
        System.out.println("🔍 DEBUG: Mostrando formulario de recuperación de contraseña");

        // Agregar mensajes de éxito o error si existen
        if (error != null) {
            model.addAttribute("error", error.replace("+", " "));
        }
        if (success != null) {
            model.addAttribute("success", success.replace("+", " "));
        }

        return "login/forgot-password";
    }

    @GetMapping("/error404")
    public String mostrarerror404() {
        return "Errores/error404";
    }

    @GetMapping("/pasarelaPagos")
    public String mostrarPasarelaPagos() {
        return "Pasarela_Pagos/Pasarela";
    }

    @GetMapping("/error500")
    public String mostrarerror500() {
        return "Errores/error500";
    }

    @GetMapping("/actualizacionUsuario")
    public String actualizacionUsuario(HttpSession session, Model model) {
        // Obtener usuario desde la sesión
        User currentUser = (User) session.getAttribute("user");

        if (currentUser != null) {
            model.addAttribute("currentUser", currentUser);

            // Determinar el rol para mostrar
            String userRole = "Usuario";
            boolean isAdmin = false;

            if (currentUser.getRole() != null) {
                isAdmin = currentUser.getRole().getIdRole() == 1;
                userRole = isAdmin ? "Administrador" : "Cliente";
            }

            model.addAttribute("userRole", userRole);
            model.addAttribute("isAdmin", isAdmin);
        } else {
            model.addAttribute("isAdmin", false);
        }

        return "DashBoard/actualizacionUsuario";
    }

    // Este getMapping es para el dashboarAdmin

    @GetMapping("/actualizacionUsuarioAdmin")
    public String actualizacionUsuarioAdmin(HttpSession session, Model model) {
        // Obtener usuario desde la sesión
        User currentUser = (User) session.getAttribute("user");

        if (currentUser != null) {
            model.addAttribute("currentUser", currentUser);

            // Determinar el rol para mostrar
            String userRole = "Usuario";
            if (currentUser.getRole() != null) {
                userRole = currentUser.getRole().getIdRole() == 1 ? "Administrador" : "Cliente";
            }
            model.addAttribute("userRole", userRole);

            System.out.println("🔍 Usuario en sesión: " + currentUser.getName() + " - " + currentUser.getEmail());
        } else {
            System.out.println("⚠️ No hay usuario en sesión");
        }

        return "Dashboard_Admin/actualizacionUsuarioAdmin";
    }

    /*
     * @GetMapping("/MensajesComentarios")
     * // public String MensajesComentarios() {
     * // return "DashBoard/MensajesComentarios";
     * }
     */

    @GetMapping("/DashBoardAgregarProducto")
    public String DashBoardAgregarProducto() {
        return "DashBoard/DashBoardAgregarProducto";
    }

    @GetMapping("/misOrdenes")
    public String misOrdenes() {
        return "DashBoard/misOrdenes";
    }

    @GetMapping("/misVentas")
    public String misVentas() {
        return "DashBoard/misVentas";
    }

    @GetMapping("/DashBoardGraficos")
    public String DashBoardGraficos() {
        return "DashBoard/GraficosDashboarCliente";
    }

    // seccion de comentarios


    @GetMapping("/GraficosCategoriaAdmin")
    public String GraficosCategoriaAdmin(Model model) {

        Map<String, Long> datosCategoria = productService.contarProductosPorCategoria();
        model.addAttribute("datosCategoria", datosCategoria);

        long totalProductos = productService.contarTotalProductos();
        model.addAttribute("totalProductos", totalProductos);

        DefaultPieDataset<String> dataset = new DefaultPieDataset<>();
        datosCategoria.forEach(dataset::setValue);

        JFreeChart chart = ChartFactory.createRingChart(
                "Productos por categoria",
                dataset,
                true,
                true,
                false);

        // RUTA CORRECTA PARA SPRING BOOT
        String rutaCarpeta = new File("src/main/resources/static/graficos").getAbsolutePath();
        File carpeta = new File(rutaCarpeta);
        carpeta.mkdirs();

        File outputFile = new File(carpeta, "productosPorCategoria.png");

        try (FileOutputStream fos = new FileOutputStream(outputFile)) {
            ChartUtils.writeChartAsPNG(fos, chart, 700, 400);
            try {
                Thread.sleep(3000); // 3 segundos
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        model.addAttribute("graficosCategoria", "/graficos/productosPorCategoria.png?v=" + System.currentTimeMillis());

        List<ProductDTO> productosCategoria = productService.listarProducts();
        model.addAttribute("productosCategoria", productosCategoria);

        return "Dashboard_Admin/GraficosCategoriaAdmin";
    }

    @GetMapping("/GraficosDashboarAdmin")
    public String DashBoardGraficosAdmin() {
        return "Dashboard_Admin/GraficosDashboarAdmin";
    }

    @GetMapping("/AdminProductos")
    public String AdminProductos(Model model) {
        List<ProductDTO> productos = productService.listarProducts();
        model.addAttribute("productos", productos);
        return "Dashboard_Admin/AdminProductos";
    }

    @GetMapping("/landing")
    public String mostrarLanding() {
        return "pagina_principal/landing";
    }

    /*
     * @GetMapping("/Quienes_somos")
     * // public String mostrarQuienes_somos() {
     * // return "Quienes_somos/quienes_somos";
     * // }
     */

    @GetMapping("/Frutas")
    public String mostrarFrutas(Model model) {
        List<ProductDTO> productos = productService.listarProductsPorCategoria("frutas");
        model.addAttribute("productos", productos);
        model.addAttribute("categoria", "Frutas");
        return "ProductosCategorias/Frutas";
    }

    @GetMapping("/BebidasNaturales")
    public String mostrarBebidasNaturales(Model model) {
        List<ProductDTO> productos = productService.listarProductsPorCategoria("bebidas-naturales");
        model.addAttribute("productos", productos);
        model.addAttribute("categoria", "Bebidas Naturales");
        return "ProductosCategorias/BebidasNaturales";
    }

    @GetMapping("/CajasMixtas")
    public String mostrarCajasMixtas(Model model) {
        List<ProductDTO> productos = productService.listarProductsPorCategoria("cajas-combos");
        model.addAttribute("productos", productos);
        model.addAttribute("categoria", "Cajas Mixtas");
        return "ProductosCategorias/CajasMixtas";
    }

    @GetMapping("/CarnesYl")
    public String mostrarCarnesYl(Model model) {
        List<ProductDTO> productos = productService.listarProductsPorCategoria("carnes-proteinas");
        model.addAttribute("productos", productos);
        model.addAttribute("categoria", "Carnes y Proteínas");
        return "ProductosCategorias/CarnesYProteinas";
    }

    @GetMapping("/Cereales")
    public String mostrarCereales(Model model) {
        List<ProductDTO> productos = productService.listarProductsPorCategoria("cereales-granos");
        model.addAttribute("productos", productos);
        model.addAttribute("categoria", "Cereales y Granos");
        return "ProductosCategorias/CerealesYGranos";
    }

    @GetMapping("/Lacteos")
    public String mostrarLacteos(Model model) {
        List<ProductDTO> productos = productService.listarProductsPorCategoria("lacteos");
        model.addAttribute("productos", productos);
        model.addAttribute("categoria", "Lácteos");
        return "ProductosCategorias/Lacteos";
    }

    @GetMapping("/legumbresSecas")
    public String mostrarLegumbresSecas(Model model) {
        // CORRECCIÓN: Esta categoría estaba usando "bebidas-naturales"
        List<ProductDTO> productos = productService.listarProductsPorCategoria("legumbres-secas");
        model.addAttribute("productos", productos);
        model.addAttribute("categoria", "Legumbres Secas");
        return "ProductosCategorias/legumbresSecas";
    }

    @GetMapping("/MielYDerivados")
    public String mostrarMielYDerivados(Model model) {
        List<ProductDTO> productos = productService.listarProductsPorCategoria("miel-derivados");
        model.addAttribute("productos", productos);
        model.addAttribute("categoria", "Miel y Derivados");
        return "ProductosCategorias/MielYDerivados";
    }

    @GetMapping("/Organicos")
    public String mostrarOrganicos(Model model) {
        List<ProductDTO> productos = productService.listarProductsPorCategoria("productos-organicos");
        model.addAttribute("productos", productos);
        model.addAttribute("categoria", "Productos Orgánicos");
        return "ProductosCategorias/Organicos";
    }

    @GetMapping("/VerdurasYHortalizas")
    public String mostrarVerdurasYHortalizas(Model model) {
        List<ProductDTO> productos = productService.listarProductsPorCategoria("verduras-hortalizas");
        model.addAttribute("productos", productos);
        model.addAttribute("categoria", "Verduras y Hortalizas");
        return "ProductosCategorias/VerdurasYHortalizas";
    }

    @GetMapping("/DashboardAdmin")
    public String dashboard(Model model, HttpSession session) {
        // ✅ VERIFICACIÓN DE SESIÓN EXPIRADA
        User userSession = (User) session.getAttribute("user");
        if (userSession == null) {
            return "redirect:/login?error=session&message=Sesión+expirada.+Debe+iniciar+sesión+para+acceder+al+panel+de+administración";
        }

        // ✅ VERIFICACIÓN DE PERMISOS DE ADMINISTRADOR
        if (userSession.getRole() == null || userSession.getRole().getIdRole() != 1) {
            return "redirect:/login?error=access&message=Acceso+denegado.+Solo+administradores+pueden+acceder+a+este+panel";
        }

        List<UserDTO> usuarios = userService.listarUsers();
        model.addAttribute("usuarios", usuarios);

        // Obtener usuario de la sesión para mostrar información dinámica
        model.addAttribute("currentUser", userSession);
        // Determinar el nombre del rol para mostrar
        String roleName = "Usuario";
        if (userSession.getRole() != null) {
            roleName = userSession.getRole().getIdRole() == 1 ? "Administrador" : "Cliente";
        }
        model.addAttribute("userRole", roleName);

        return "Dashboard_Admin/DashboardAdmin";
    }

    @GetMapping("/producto/{id}")
    public String verProducto(@PathVariable("id") Long id, Model model, HttpSession session) {
        ProductDTO producto = productService.obtenerProductPorId(id);
        List<CommentDTO> comments = commentService.listarCommentsPorProducto(id);

        // Calculate average rating
        double averageRating = 0.0;
        int ratingCount = 0;

        for (CommentDTO comment : comments) {
            if (comment.getRating() != null) {
                averageRating += comment.getRating();
                ratingCount++;
            }
        }

        if (ratingCount > 0) {
            averageRating = averageRating / ratingCount;
        }

        // Get related products (same category, exclude current product, limit to 6)
        List<ProductDTO> allProducts = productService.listarProducts();
        List<ProductDTO> relatedProducts = allProducts.stream()
                .filter(p -> p.getCategory() != null &&
                        producto.getCategory() != null &&
                        p.getCategory().equalsIgnoreCase(producto.getCategory()) &&
                        !p.getIdProduct().equals(id))
                .limit(6)
                .collect(Collectors.toList());

        // Get current user from session to check if this is their own product
        User userSession = (User) session.getAttribute("user");

        model.addAttribute("producto", producto);
        model.addAttribute("comments", comments);
        model.addAttribute("averageRating", averageRating);
        model.addAttribute("ratingCount", ratingCount);
        model.addAttribute("relatedProducts", relatedProducts);
        model.addAttribute("currentUser", userSession);

        return "Productos/product_detail"; // apunta a tu vista en templates/Productos/product_detail.html
    }

    @GetMapping("/agregar_admin")
    public String mostrarFormularioAdmin(Model model, HttpSession session) {
        // Verificar que solo admins puedan acceder
        User userSession = (User) session.getAttribute("user");
        if (userSession == null) {
            return "redirect:/login?error=session&message=Debe+iniciar+sesión+para+acceder+a+esta+funcionalidad";
        }

        if (userSession.getRole() == null || userSession.getRole().getIdRole() != 1) {
            return "redirect:/DashboardAdmin?error=access&message=Acceso+denegado.+Solo+administradores+pueden+registrar+otros+administradores";
        }

        model.addAttribute("userDTO", new UserDTO());
        // Pasar información del admin actual para mostrar en el formulario
        model.addAttribute("currentAdmin", userSession.getName());
        return "Dashboard_Admin/Registro_nuevo_admin/form_registro_admin";
    }

    @PostMapping("/registrarAdmin")
    public String registrarAdmin(@Valid @ModelAttribute("userDTO") UserDTO userDTO,
            BindingResult result,
            RedirectAttributes redirectAttributes,
            HttpSession session) {
        // Verificar que solo admins puedan registrar otros admins
        User userSession = (User) session.getAttribute("user");
        if (userSession == null) {
            return "redirect:/login?error=session&message=Sesión+expirada";
        }

        if (userSession.getRole() == null || userSession.getRole().getIdRole() != 1) {
            redirectAttributes.addFlashAttribute("error",
                    "Acceso denegado. Solo administradores pueden registrar otros administradores.");
            return "redirect:/DashboardAdmin";
        }

        if (result.hasErrors()) {
            // Si hay errores de validación, volver al formulario con errores
            return "Dashboard_Admin/Registro_nuevo_admin/form_registro_admin";
        }

        try {
            // Verificar que el email no exista ya usando un try-catch para manejar si el
            // método no existe
            try {
                List<UserDTO> todosLosUsuarios = userService.listarUsers();
                boolean emailExiste = todosLosUsuarios.stream()
                        .anyMatch(u -> u.getEmail().equalsIgnoreCase(userDTO.getEmail()));

                if (emailExiste) {
                    redirectAttributes.addFlashAttribute("error",
                            "Ya existe un usuario con el correo: " + userDTO.getEmail());
                    return "redirect:/agregar_admin";
                }
            } catch (Exception e) {
                // Si falla la validación de email duplicado, continuar con el registro
                System.out.println("⚠️ No se pudo verificar email duplicado, continuando...");
            }

            // Establecer fecha de creación
            userDTO.setCreacionDate(LocalDate.now());

            UserDTO adminCreado = userService.crearAdmin(userDTO);

            // Log de la acción para auditoria
            System.out.println("🔐 ADMIN REGISTRADO: " + userSession.getName() +
                    " registró a " + adminCreado.getName() + " como administrador");

            redirectAttributes.addFlashAttribute("success",
                    "✅ Administrador '" + adminCreado.getName() + "' registrado exitosamente por "
                            + userSession.getName());

            return "redirect:/DashboardAdmin";

        } catch (Exception e) {
            System.err.println("❌ Error al registrar administrador: " + e.getMessage());
            redirectAttributes.addFlashAttribute("error",
                    "Error al registrar administrador: " + e.getMessage());
            return "redirect:/agregar_admin";
        }
    }

    @GetMapping("/ClientesDestacados")
    public String mostrarClientesDestacados(Model model) {
        return "Clientes_Destacados/ClientesDestacados";
    }

    @Value("${mercadopago.public_key}")
    private String mercadoPagoPublicKey;

    @GetMapping("/checkout")
    public String mostrarCheckout(Model model) {
        model.addAttribute("publicKey", mercadoPagoPublicKey);
        return "MercadoPago/checkout"; // ✅ Correcto // Ajusta la ruta según tu estructura de templates
    }

    @GetMapping("/reportes/comment")
    public String mostrarReporteEstadistico() {
        // Lógica para generar y mostrar el reporte estadístico
        return "Reportes_estadisticos/commentFc";
    }

    // verify por sms firebase
    /*
     * @GetMapping("/verify-sms")
     * public String showVerifySMS(HttpSession session, Model model) {
     * // Tomar el usuario de la sesión
     * User user = (User) session.getAttribute("user");
     * if (user == null) {
     * // Si no hay usuario en sesión, redirigir al login
     * return "redirect:/login";
     * }
     * 
     * // Pasar el teléfono y rol al HTML
     * model.addAttribute("user", user);
     * return "verify-sms"; // Nombre del HTML sin extensión .html
     * }
     */

    @GetMapping("/verify-sms")
    public String showSmsVerificationPage(HttpSession session) {
        User pendingUser = (User) session.getAttribute("pendingUser");
        if (pendingUser == null) {
            return "redirect:/login";
        }
        return "login/verify-sms"; // Página para ingresar el código SMS
    }

    @GetMapping("/Delivery")
    public String mostrarDeliveryPage() {
        return "Delivery_Form/delivery_from";
    }

}
