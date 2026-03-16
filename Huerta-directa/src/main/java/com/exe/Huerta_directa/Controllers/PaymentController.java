
package com.exe.Huerta_directa.Controllers;
import com.exe.Huerta_directa.DTO.PaymentRequest;
import com.exe.Huerta_directa.Impl.MercadoPagoServicePaymentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.exe.Huerta_directa.DTO.CarritoItem;
import com.exe.Huerta_directa.Service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import jakarta.servlet.http.HttpSession;

import java.text.NumberFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;

import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final MercadoPagoServicePaymentRequest mercadoPagoService;
    private final ProductService productService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Constantes para email (igual que en UserController)
    private static final String EMAIL_HOST = "smtp.gmail.com";
    private static final String EMAIL_PORT = "587";
    private static final String SENDER_EMAIL = "hdirecta@gmail.com";
    @Value("${mail.sender.password}")
    private String SENDER_PASSWORD;


    @PostMapping("/process")
    public Map<String, Object> processPayment(
            @RequestBody PaymentRequest paymentRequest,
            HttpSession session) {

        try {
            System.out.println("📥 Iniciando procesamiento de pago...");
            System.out.println("💳 Método de pago: " + paymentRequest.getPaymentMethodId());
            System.out.println("💵 Monto: " + paymentRequest.getTransactionAmount());

            // Llamar a tu servicio (retorna String JSON)
            String responseJson = mercadoPagoService.processPayment(paymentRequest);

            System.out.println("📤 Respuesta de MercadoPago (JSON): " + responseJson);

            // Parsear el JSON a Map usando Jackson con TypeReference
            TypeReference<Map<String, Object>> typeRef = new TypeReference<Map<String, Object>>() {};
            Map<String, Object> paymentResult = objectMapper.readValue(responseJson, typeRef);

            // Extraer información importante
            String status = (String) paymentResult.get("status");
            Object paymentId = paymentResult.get("id");
            String paymentMethodId = (String) paymentResult.get("payment_method_id");

            System.out.println("📊 Estado del pago: " + status);
            System.out.println("🔢 Payment ID: " + paymentId);
            System.out.println("💳 Método usado: " + paymentMethodId);

            // ⭐ Si el pago fue aprobado, descontar stock y enviar correo
            if ("approved".equals(status)) {
                System.out.println("✅ Pago APROBADO - Descontando stock...");
                
                // Obtener carrito antes de limpiarlo
                @SuppressWarnings("unchecked")
                List<CarritoItem> carrito = (List<CarritoItem>) session.getAttribute("carrito");
                
                descontarStockDelCarrito(session);
                
                // Enviar correo de confirmación
                try {
                    enviarCorreoConfirmacionPago(paymentRequest, paymentId.toString(), carrito);
                } catch (Exception emailError) {
                    System.err.println("⚠️ Error al enviar correo (no afecta el pago): " + emailError.getMessage());
                }
                
                paymentResult.put("stock_descontado", true);
                paymentResult.put("mensaje", "Pago procesado exitosamente. Stock actualizado.");

            } else if ("pending".equals(status) || "in_process".equals(status)) {
                System.out.println("⏳ Pago PENDIENTE - No se descuenta stock aún");
                paymentResult.put("mensaje", "Pago pendiente de confirmación");

            } else if ("rejected".equals(status)) {
                System.out.println("❌ Pago RECHAZADO");
                paymentResult.put("mensaje", "El pago fue rechazado");
            }

            return paymentResult;

        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            System.err.println("❌ Error parseando JSON de MercadoPago: " + e.getMessage());
            e.printStackTrace();
            return crearRespuestaError("Error al procesar la respuesta de MercadoPago");

        } catch (RuntimeException e) {
            System.err.println("❌ Error de MercadoPago: " + e.getMessage());
            e.printStackTrace();
            return crearRespuestaError(e.getMessage());

        } catch (Exception e) {
            System.err.println("❌ Error inesperado: " + e.getMessage());
            e.printStackTrace();
            return crearRespuestaError("Error inesperado al procesar el pago");
        }
    }


    private void descontarStockDelCarrito(HttpSession session) {
        try {
            @SuppressWarnings("unchecked")
            List<CarritoItem> carrito = (List<CarritoItem>) session.getAttribute("carrito");

            if (carrito == null || carrito.isEmpty()) {
                System.out.println("⚠️ No hay productos en el carrito para descontar");
                return;
            }

            System.out.println("📦 Descontando stock de " + carrito.size() + " productos:");

            for (CarritoItem item : carrito) {
                try {
                    productService.descontarStock(item.getProductId(), item.getCantidad());
                    System.out.println("  ✅ " + item.getNombre() + " - Cantidad: " + item.getCantidad());

                } catch (RuntimeException e) {
                    System.err.println("  ❌ Error con producto " + item.getNombre() + ": " + e.getMessage());
                    // Continuamos con los demás productos
                }
            }

            // Limpiar el carrito de la sesión
            session.removeAttribute("carrito");
            System.out.println("🗑️ Carrito limpiado de la sesión");

        } catch (Exception e) {
            System.err.println("❌ Error general al descontar stock: " + e.getMessage());
            e.printStackTrace();
        }
    }


    private Map<String, Object> crearRespuestaError(String mensaje) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("status", "error");
        errorResponse.put("error", true);
        errorResponse.put("mensaje", mensaje);
        return errorResponse;
    }
    
    // ==================== MÉTODOS DE ENVÍO DE EMAIL ====================
    
    /**
     * Método para crear sesión de correo (igual que en UserController)
     */
    private Session crearSesionCorreo() {
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", EMAIL_HOST);
        props.put("mail.smtp.port", EMAIL_PORT);
        return Session.getInstance(props, new Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(SENDER_EMAIL, SENDER_PASSWORD);
            }
        });
    }
    
    /**
     * Método para enviar correo individual (igual que en UserController)
     */
    private void enviarCorreoIndividual(String destinatario, String asunto, String cuerpo) throws MessagingException {
        Session session = crearSesionCorreo();
        MimeMessage message = new MimeMessage(session);
        message.setFrom(new InternetAddress(SENDER_EMAIL));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(destinatario));
        message.setSubject(asunto);

        if (cuerpo.trim().startsWith("<!DOCTYPE") || cuerpo.trim().startsWith("<html")) {
            message.setContent(cuerpo, "text/html; charset=utf-8");
        } else {
            message.setText(cuerpo, "utf-8");
        }

        Transport.send(message);
    }
    
    /**
     * Envía correo de confirmación de pago exitoso
     */
    private void enviarCorreoConfirmacionPago(PaymentRequest paymentRequest, String paymentId, List<CarritoItem> carrito) {
        try {
            // Obtener datos del pagador
            String email = paymentRequest.getPayer().getEmail();
            String firstName = paymentRequest.getPayer().getFirstName();
            String lastName = paymentRequest.getPayer().getLastName();
            String customerName = (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
            customerName = customerName.trim();
            
            if (customerName.isEmpty()) {
                customerName = "Cliente";
            }
            
            // 🔧 OVERRIDE para modo prueba - Si el email es de prueba de Mercado Pago, usar tu email real
            if (email != null && (email.contains("test_user") || email.contains("@testuser"))) {
                email = "TU_EMAIL_REAL@gmail.com"; // ← CAMBIA ESTO A TU EMAIL REAL
                System.out.println("🔧 Modo prueba detectado - Enviando correo a: " + email);
            }
            
            // Formatear monto
            @SuppressWarnings("deprecation")
            NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("es", "CO"));
            String formattedAmount = currencyFormat.format(paymentRequest.getTransactionAmount());
            
            // Generar resumen de productos
            String productsSummary = generarResumenProductos(carrito);
            
            // Crear contenido HTML
            String htmlContent = crearContenidoHTMLPagoExitoso(customerName, paymentId, formattedAmount, productsSummary);
            
            // Enviar correo
            String subject = "✅ Confirmación de Pago Exitoso - Huerta Directa";
            enviarCorreoIndividual(email, subject, htmlContent);
            
            System.out.println("✉️ Correo de confirmación enviado a: " + email);
            
        } catch (Exception e) {
            System.err.println("❌ Error al enviar correo de confirmación: " + e.getMessage());
            e.printStackTrace();
            // No lanzamos excepción para que no afecte el proceso de pago
        }
    }
    
    /**
     * Genera un resumen legible de los productos del carrito
     */
    private String generarResumenProductos(List<CarritoItem> carrito) {
        if (carrito == null || carrito.isEmpty()) {
            return "No hay productos en el carrito";
        }
        
        StringBuilder summary = new StringBuilder();
        for (CarritoItem item : carrito) {
            summary.append(String.format("• %s (x%d) - $%,.2f\n", 
                item.getNombre(), 
                item.getCantidad(),
                item.getPrecio().doubleValue()
            ));
        }
        
        return summary.toString();
    }
    
    /**
     * Crea el contenido HTML para el correo de pago exitoso (Estilo Huerta Directa)
     */
    private String crearContenidoHTMLPagoExitoso(String nombre, String paymentId, String monto, String productosHtml) {
        String htmlContent = "<!DOCTYPE html>" +
            "<html lang=\"es\">" +
            "<head>" +
            "<meta charset=\"UTF-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            "<title>Pago Exitoso - Huerta Directa</title>" +
            "</head>" +
            "<body style=\"margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;\">" +
            "<table role=\"presentation\" style=\"width: 100%; border-collapse: collapse;\">" +
            "<tr>" +
            "<td style=\"padding: 0;\">" +
            "<div style=\"max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\">" +
            "<!-- Header con gradiente verde -->" +
            "<div style=\"background: linear-gradient(135deg, #689f38 0%, #8bc34a 100%); padding: 40px 30px; text-align: center;\">" +
            "<h1 style=\"color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);\">" +
            "🌱 Huerta Directa" +
            "</h1>" +
            "<p style=\"color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;\">" +
            "Confirmación de Pago" +
            "</p>" +
            "</div>" +
            "<!-- Contenido principal -->" +
            "<div style=\"padding: 40px 30px;\">" +
            "<div style=\"text-align: center; margin-bottom: 30px;\">" +
            "<div style=\"background-color: #e8f5e8; border-radius: 50px; width: 80px; height: 80px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; font-size: 35px;\">" +
            "✅" +
            "</div>" +
            "<h2 style=\"color: #2e7d32; margin: 0; font-size: 24px; font-weight: bold;\">" +
            "¡Pago Procesado Exitosamente!" +
            "</h2>" +
            "</div>" +
            "<div style=\"text-align: left; margin-bottom: 30px;\">" +
            "<p style=\"color: #333333; font-size: 18px; line-height: 1.6; margin-bottom: 15px;\">" +
            "Hola <strong style=\"color: #689f38;\">{{NOMBRE}}</strong>," +
            "</p>" +
            "<p style=\"color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 25px;\">" +
            "¡Tu pago ha sido procesado exitosamente! 🎉 A continuación encontrarás los detalles de tu compra:" +
            "</p>" +
            "<!-- Detalles del pago -->" +
            "<div style=\"background-color: #f8f9fa; border-left: 5px solid #689f38; padding: 20px; border-radius: 5px; margin-bottom: 25px;\">" +
            "<div style=\"margin-bottom: 15px;\">" +
            "<span style=\"color: #666666; font-size: 14px; display: block; margin-bottom: 5px;\">ID de Pago</span>" +
            "<span style=\"color: #2e7d32; font-size: 18px; font-weight: bold;\">{{PAYMENT_ID}}</span>" +
            "</div>" +
            "<div>" +
            "<span style=\"color: #666666; font-size: 14px; display: block; margin-bottom: 5px;\">Monto Total</span>" +
            "<span style=\"color: #2e7d32; font-size: 22px; font-weight: bold;\">{{MONTO}}</span>" +
            "</div>" +
            "</div>" +
            "<!-- Productos adquiridos -->" +
            "<div style=\"margin-bottom: 25px;\">" +
            "<h3 style=\"color: #2e7d32; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e8f5e8; padding-bottom: 10px;\">" +
            "📦 Productos Adquiridos" +
            "</h3>" +
            "<div style=\"background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 5px; padding: 15px;\">" +
            "<pre style=\"font-family: 'Arial', sans-serif; font-size: 14px; color: #555555; margin: 0; white-space: pre-wrap; word-wrap: break-word;\">{{PRODUCTOS}}</pre>" +
            "</div>" +
            "</div>" +
            "<div style=\"background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin-bottom: 20px;\">" +
            "<p style=\"color: #856404; font-size: 14px; margin: 0; line-height: 1.5;\">" +
            "📍 <strong>Próximos pasos:</strong> En breve recibirás información sobre el envío de tu pedido." +
            "</p>" +
            "</div>" +
            "</div>" +
            "<!-- Footer -->" +
            "<div style=\"text-align: center; border-top: 2px solid #e8f5e8; padding-top: 25px;\">" +
            "<p style=\"color: #666666; font-size: 14px; line-height: 1.5; margin: 0;\">" +
            "Si tienes alguna pregunta, puedes contactarnos en cualquier momento.<br>" +
            "<strong style=\"color: #689f38;\">¡Gracias por tu compra en Huerta Directa! 🌍</strong>" +
            "</p>" +
            "</div>" +
            "</div>" +
            "<!-- Footer Verde -->" +
            "<div style=\"background-color: #2e7d32; padding: 25px 30px; text-align: center;\">" +
            "<p style=\"color: #ffffff; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;\">" +
            "El equipo de Huerta Directa 🌱" +
            "</p>" +
            "<div style=\"margin-top: 15px;\">" +
            "<span style=\"color: #c8e6c9; font-size: 12px;\">" +
            "© 2024 Huerta Directa - Todos los derechos reservados" +
            "</span>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</td>" +
            "</tr>" +
            "</table>" +
            "</body>" +
            "</html>";

        // Reemplazar placeholders usando .replace() en lugar de String.format
        htmlContent = htmlContent.replace("{{NOMBRE}}", nombre);
        htmlContent = htmlContent.replace("{{PAYMENT_ID}}", paymentId);
        htmlContent = htmlContent.replace("{{MONTO}}", monto);
        htmlContent = htmlContent.replace("{{PRODUCTOS}}", productosHtml);
        
        return htmlContent;
    }
}






/*import com.exe.Huerta_directa.DTO.PaymentRequestDTO;
import com.exe.Huerta_directa.Entity.User;
import com.exe.Huerta_directa.Service.MercadoPagoService;
//import com.mercadopago.exceptions.MPApiException;
//import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.math.BigDecimal;

/*@Controller
@RequestMapping("/payment")
public class PaymentController {

    @Autowired
    private MercadoPagoService mercadoPagoService;

    /**
     * Mostrar página de checkout
     */

/*
    @GetMapping("/checkout")
    public String showCheckout(
            @RequestParam String productName,
            @RequestParam BigDecimal price,
            @RequestParam(defaultValue = "1") Integer quantity,
            HttpSession session,
            Model model) {

        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }

        model.addAttribute("productName", productName);
        model.addAttribute("price", price);
        model.addAttribute("quantity", quantity);
        model.addAttribute("total", price.multiply(BigDecimal.valueOf(quantity)));
        model.addAttribute("userEmail", user.getEmail());

        return "Pasarela_Pagos/checkout";
    }


    @PostMapping("/create-preference")
public String createPreference(
        @RequestParam String productName,
        @RequestParam BigDecimal price,
        @RequestParam Integer quantity,
        HttpSession session,
        RedirectAttributes redirectAttributes) {

    System.out.println("\nINICIO CREATE PREFERENCE");
    System.out.println(" Sesión ID: " + session.getId());

    User user = (User) session.getAttribute("user");

    if (user == null) {
        System.err.println("ERROR: Usuario no encontrado en sesión");
        System.err.println("   Redirigiendo a /login");
        return "redirect:/login";
    }

    System.out.println(" Usuario encontrado:");
    System.out.println("   - ID: " + user.getId());
    System.out.println("   - Email: " + user.getEmail());
    System.out.println("   - Nombre: " + user.getName());

    System.out.println("\n Datos del producto:");
    System.out.println("   - Producto: " + productName);
    System.out.println("   - Precio: $" + price);
    System.out.println("   - Cantidad: " + quantity);

    try {
        System.out.println("\n Creando PaymentRequestDTO...");
        PaymentRequestDTO paymentRequest = new PaymentRequestDTO();
        paymentRequest.setTitle(productName);
        paymentRequest.setPrice(price);
        paymentRequest.setQuantity(quantity);
        System.out.println(" DTO creado correctamente");

        System.out.println("\n Llamando a MercadoPagoService.createPreference()...");
        Preference preference = mercadoPagoService.createPreference(paymentRequest, user.getId());

        System.out.println("\nÉXITO");
        System.out.println("   - Preference ID: " + preference.getId());
        System.out.println("   - Init Point: " + preference.getSandboxInitPoint());
        System.out.println("   - Redirigiendo a Mercado Pago...");
        System.out.println("FIN CREATE PREFERENCE\n");

        return "redirect:" + preference.getSandboxInitPoint();

    } catch (Exception e) {
        System.err.println("\nERROR CAPTURADO");
        System.err.println("Clase de error: " + e.getClass().getName());
        System.err.println("Mensaje: " + e.getMessage());
        System.err.println("\n Stack trace completo:");
        e.printStackTrace();
        System.err.println(" FIN DEL ERROR\n");

        redirectAttributes.addFlashAttribute("error", "Error al procesar el pago: " + e.getMessage());
        return "redirect:/index";
    }
}

    @GetMapping("/success")
    public String paymentSuccess(
            @RequestParam(required = false) String payment_id,
            HttpSession session,
            Model model) {

        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }

        model.addAttribute("paymentId", payment_id);
        model.addAttribute("userName", user.getName());

        return "Pasarela_Pagos/success";
    }

    @GetMapping("/failure")
    public String paymentFailure(
            @RequestParam(required = false) String payment_id,
            HttpSession session,
            Model model) {

        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }

        model.addAttribute("paymentId", payment_id);
        model.addAttribute("userName", user.getName());

        return "Pasarela_Pagos/failure";
    }

    @GetMapping("/pending")
    public String paymentPending(
            @RequestParam(required = false) String payment_id,
            HttpSession session,
            Model model) {

        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }

        model.addAttribute("paymentId", payment_id);
        model.addAttribute("userName", user.getName());

        return "Pasarela_Pagos/pending";
    }

}

*/







/*import com.exe.Huerta_directa.DTO.PaymentRequestDTO;
import com.exe.Huerta_directa.Entity.User;
import com.exe.Huerta_directa.Service.MercadoPagoService;
//import com.mercadopago.exceptions.MPApiException;
//import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.math.BigDecimal;

/*@Controller
@RequestMapping("/payment")
public class PaymentController {

    @Autowired
    private MercadoPagoService mercadoPagoService;

    /**
     * Mostrar página de checkout
     */

/*
    @GetMapping("/checkout")
    public String showCheckout(
            @RequestParam String productName,
            @RequestParam BigDecimal price,
            @RequestParam(defaultValue = "1") Integer quantity,
            HttpSession session,
            Model model) {

        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }

        model.addAttribute("productName", productName);
        model.addAttribute("price", price);
        model.addAttribute("quantity", quantity);
        model.addAttribute("total", price.multiply(BigDecimal.valueOf(quantity)));
        model.addAttribute("userEmail", user.getEmail());

        return "Pasarela_Pagos/checkout";
    }


    @PostMapping("/create-preference")
public String createPreference(
        @RequestParam String productName,
        @RequestParam BigDecimal price,
        @RequestParam Integer quantity,
        HttpSession session,
        RedirectAttributes redirectAttributes) {

    System.out.println("\nINICIO CREATE PREFERENCE");
    System.out.println(" Sesión ID: " + session.getId());

    User user = (User) session.getAttribute("user");

    if (user == null) {
        System.err.println("ERROR: Usuario no encontrado en sesión");
        System.err.println("   Redirigiendo a /login");
        return "redirect:/login";
    }

    System.out.println(" Usuario encontrado:");
    System.out.println("   - ID: " + user.getId());
    System.out.println("   - Email: " + user.getEmail());
    System.out.println("   - Nombre: " + user.getName());

    System.out.println("\n Datos del producto:");
    System.out.println("   - Producto: " + productName);
    System.out.println("   - Precio: $" + price);
    System.out.println("   - Cantidad: " + quantity);

    try {
        System.out.println("\n Creando PaymentRequestDTO...");
        PaymentRequestDTO paymentRequest = new PaymentRequestDTO();
        paymentRequest.setTitle(productName);
        paymentRequest.setPrice(price);
        paymentRequest.setQuantity(quantity);
        System.out.println(" DTO creado correctamente");

        System.out.println("\n Llamando a MercadoPagoService.createPreference()...");
        Preference preference = mercadoPagoService.createPreference(paymentRequest, user.getId());

        System.out.println("\nÉXITO");
        System.out.println("   - Preference ID: " + preference.getId());
        System.out.println("   - Init Point: " + preference.getSandboxInitPoint());
        System.out.println("   - Redirigiendo a Mercado Pago...");
        System.out.println("FIN CREATE PREFERENCE\n");

        return "redirect:" + preference.getSandboxInitPoint();

    } catch (Exception e) {
        System.err.println("\nERROR CAPTURADO");
        System.err.println("Clase de error: " + e.getClass().getName());
        System.err.println("Mensaje: " + e.getMessage());
        System.err.println("\n Stack trace completo:");
        e.printStackTrace();
        System.err.println(" FIN DEL ERROR\n");

        redirectAttributes.addFlashAttribute("error", "Error al procesar el pago: " + e.getMessage());
        return "redirect:/index";
    }
}

    @GetMapping("/success")
    public String paymentSuccess(
            @RequestParam(required = false) String payment_id,
            HttpSession session,
            Model model) {

        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }

        model.addAttribute("paymentId", payment_id);
        model.addAttribute("userName", user.getName());

        return "Pasarela_Pagos/success";
    }

    @GetMapping("/failure")
    public String paymentFailure(
            @RequestParam(required = false) String payment_id,
            HttpSession session,
            Model model) {

        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }

        model.addAttribute("paymentId", payment_id);
        model.addAttribute("userName", user.getName());

        return "Pasarela_Pagos/failure";
    }

    @GetMapping("/pending")
    public String paymentPending(
            @RequestParam(required = false) String payment_id,
            HttpSession session,
            Model model) {

        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }

        model.addAttribute("paymentId", payment_id);
        model.addAttribute("userName", user.getName());

        return "Pasarela_Pagos/pending";
    }

}

*/
