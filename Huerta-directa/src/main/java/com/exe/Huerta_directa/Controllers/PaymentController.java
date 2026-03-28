
package com.exe.Huerta_directa.Controllers;

import com.exe.Huerta_directa.DTO.PaymentRequest;
import com.exe.Huerta_directa.Entity.Product;
import com.exe.Huerta_directa.Entity.User;
import com.exe.Huerta_directa.Impl.MercadoPagoServicePaymentRequest;
import com.exe.Huerta_directa.Repository.ProductRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.exe.Huerta_directa.DTO.CarritoItem;
import com.exe.Huerta_directa.Service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.text.NumberFormat;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.mail.MessagingException;



@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final MercadoPagoServicePaymentRequest mercadoPagoService;
    private final ProductService productService;
    private final com.exe.Huerta_directa.Repository.PaymentRepository paymentRepository;
    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/process")
    public Map<String, Object> processPayment(
            @RequestBody PaymentRequest paymentRequest,
            HttpSession session) {

        try {
            System.out.println("📥 RAW payer: " + paymentRequest.getPayer());
            System.out.println("📥 RAW email: "
                    + (paymentRequest.getPayer() != null ? paymentRequest.getPayer().getEmail() : "PAYER NULL"));
            System.out.println("📥 Iniciando procesamiento de pago...");
            System.out.println("💳 Método de pago: " + paymentRequest.getPaymentMethodId());
            System.out.println("💵 Monto: " + paymentRequest.getTransactionAmount());

            // Llamar a tu servicio (retorna String JSON)
            String responseJson = mercadoPagoService.processPayment(paymentRequest);

            System.out.println("📤 Respuesta de MercadoPago (JSON): " + responseJson);

            // Parsear el JSON a Map usando Jackson con TypeReference
            TypeReference<Map<String, Object>> typeRef = new TypeReference<Map<String, Object>>() {
            };
            Map<String, Object> paymentResult = objectMapper.readValue(responseJson, typeRef);

            // Extraer información importante
            String status = (String) paymentResult.get("status");
            Object paymentId = paymentResult.get("id");
            String paymentMethodId = (String) paymentResult.get("payment_method_id");

            System.out.println("📊 Estado del pago: " + status);
            System.out.println("🔢 Payment ID: " + paymentId);
            System.out.println("💳 Método usado: " + paymentMethodId);

            // ⭐ Si el pago fue aprobado, descontar stock, guardar en BD y enviar correo
            if ("approved".equals(status)) {
                System.out.println("✅ Pago APROBADO - Descontando stock y guardando en BD...");

                // Obtener carrito antes de limpiarlo
                @SuppressWarnings("unchecked")
                List<CarritoItem> carrito = paymentRequest.getCarrito();
                // --- GUARDAR EN BASE DE DATOS PARA ESTADÍSTICAS ---
                try {
                    com.exe.Huerta_directa.Entity.Payment paymentEntity = new com.exe.Huerta_directa.Entity.Payment();
                    paymentEntity.setPreferenceId((String) paymentResult.get("id").toString());
                    paymentEntity.setPayerEmail(paymentRequest.getPayer().getEmail());
                    paymentEntity.setStatus(status);
                    paymentEntity.setPaymentDate(java.time.LocalDate.now());

                    if (carrito != null) {
                        List<com.exe.Huerta_directa.Entity.PaymentItem> paymentItems = carrito.stream().map(item -> {
                            com.exe.Huerta_directa.Entity.PaymentItem pItem = new com.exe.Huerta_directa.Entity.PaymentItem();
                            pItem.setTitle(item.getNombre());
                            pItem.setProductId(item.getProductId());
                            pItem.setUnitPrice(item.getPrecio());
                            pItem.setQuantity(item.getCantidad());
                            pItem.setPayment(paymentEntity);
                            return pItem;
                        }).collect(java.util.stream.Collectors.toList());
                        paymentEntity.setItems(paymentItems);
                    }

                    paymentRepository.save(paymentEntity);
                    System.out.println("💾 Pago persistido en BD correctamente.");
                } catch (Exception dbError) {
                    System.err.println("⚠️ Error al persistir pago (no afecta el pago): " + dbError.getMessage());
                }
                // --------------------------------------------------

                descontarStockDelCarrito(paymentRequest.getCarrito());

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

    @GetMapping("/my-orders")
    public ResponseEntity<Map<String, Object>> getMyOrders(HttpSession session) {
        User userSession = (User) session.getAttribute("user");
        Long userId = userSession != null ? userSession.getId() : (Long) session.getAttribute("userId");

        if (userId == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Sesion expirada");
            response.put("orders", List.of());
            response.put("summary", Map.of("totalOrders", 0, "totalSales", 0, "pendingOrders", 0, "avgTicket", 0));
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        List<Product> myProducts = productRepository.findByUserId(userId);
        if (myProducts.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("orders", List.of());
            response.put("summary", Map.of("totalOrders", 0, "totalSales", 0, "pendingOrders", 0, "avgTicket", 0));
            return ResponseEntity.ok(response);
        }

        Set<Long> myProductIds = new HashSet<>();
        Set<String> myProductNames = new HashSet<>();
        for (Product product : myProducts) {
            if (product.getIdProduct() != null) {
                myProductIds.add(product.getIdProduct());
            }
            if (product.getNameProduct() != null) {
                myProductNames.add(product.getNameProduct().trim().toLowerCase(Locale.ROOT));
            }
        }

        List<com.exe.Huerta_directa.Entity.Payment> approvedPayments = paymentRepository.findAllByStatusWithItems("approved");
        List<Map<String, Object>> orders = new ArrayList<>();

        BigDecimal totalSales = BigDecimal.ZERO;
        int pendingOrders = 0;

        for (com.exe.Huerta_directa.Entity.Payment payment : approvedPayments) {
            if (payment.getItems() == null || payment.getItems().isEmpty()) {
                continue;
            }

            for (com.exe.Huerta_directa.Entity.PaymentItem item : payment.getItems()) {
                if (item == null) {
                    continue;
                }

                boolean matchesById = item.getProductId() != null && myProductIds.contains(item.getProductId());
                boolean matchesByName = item.getProductId() == null
                        && item.getTitle() != null
                        && myProductNames.contains(item.getTitle().trim().toLowerCase(Locale.ROOT));

                if (!matchesById && !matchesByName) {
                    continue;
                }

                BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                totalSales = totalSales.add(lineTotal);

                String rawStatus = payment.getStatus() == null ? "approved" : payment.getStatus().toLowerCase(Locale.ROOT);
                String status = switch (rawStatus) {
                    case "pending", "in_process" -> "pending";
                    case "rejected", "failure" -> "canceled";
                    default -> "completed";
                };

                if ("pending".equals(status)) {
                    pendingOrders++;
                }

                Map<String, Object> orderRow = new HashMap<>();
                orderRow.put("orderNumber", "#0");
                orderRow.put("buyer", payment.getPayerEmail());
                orderRow.put("product", item.getTitle());
                orderRow.put("quantity", item.getQuantity());
                orderRow.put("date", payment.getPaymentDate());
                orderRow.put("amount", lineTotal);
                orderRow.put("status", status);
                orderRow.put("paymentId", payment.getPreferenceId());
                orders.add(orderRow);
            }
        }

        orders.sort(Comparator.comparing((Map<String, Object> o) -> o.get("date").toString()).reversed());

        // Numeracion privada por cuenta: siempre inicia en 1 para cada productor.
        for (int i = 0; i < orders.size(); i++) {
            orders.get(i).put("orderNumber", "#" + (i + 1));
        }

        BigDecimal avgTicket = orders.isEmpty()
                ? BigDecimal.ZERO
                : totalSales.divide(BigDecimal.valueOf(orders.size()), 2, RoundingMode.HALF_UP);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalOrders", orders.size());
        summary.put("totalSales", totalSales);
        summary.put("pendingOrders", pendingOrders);
        summary.put("avgTicket", avgTicket);

        Map<String, Object> response = new HashMap<>();
        response.put("orders", orders);
        response.put("summary", summary);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/exportPdf")
    public void exportMyOrdersToPdf(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            HttpSession session,
            HttpServletResponse response) throws IOException {

        ResponseEntity<Map<String, Object>> ordersResponse = getMyOrders(session);
        if (ordersResponse.getStatusCode() == HttpStatus.UNAUTHORIZED) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Sesion expirada");
            return;
        }

        Map<String, Object> body = ordersResponse.getBody();
        if (body == null) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "No se pudieron exportar las ordenes");
            return;
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> orders = (List<Map<String, Object>>) body.getOrDefault("orders", List.of());

        String normalizedSearch = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        String normalizedStatus = status == null ? "" : status.trim().toLowerCase(Locale.ROOT);

        List<Map<String, Object>> filteredOrders = orders.stream()
                .filter(order -> {
                    boolean matchesStatus = normalizedStatus.isBlank()
                            || normalizedStatus.equals(String.valueOf(order.getOrDefault("status", "")).toLowerCase(Locale.ROOT));

                    if (normalizedSearch.isBlank()) {
                        return matchesStatus;
                    }

                    String orderNumber = String.valueOf(order.getOrDefault("orderNumber", "")).toLowerCase(Locale.ROOT);
                    String buyer = String.valueOf(order.getOrDefault("buyer", "")).toLowerCase(Locale.ROOT);
                    String product = String.valueOf(order.getOrDefault("product", "")).toLowerCase(Locale.ROOT);

                    return matchesStatus && (orderNumber.contains(normalizedSearch)
                            || buyer.contains(normalizedSearch)
                            || product.contains(normalizedSearch));
                })
                .collect(Collectors.toList());

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=ordenes_huerta_directa.pdf");

        Document document = new Document();
        try {
            PdfWriter.getInstance(document, response.getOutputStream());
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9);

            document.add(new Paragraph("Reporte de Ordenes - Huerta Directa", titleFont));
            document.add(new Paragraph("Total registros: " + filteredOrders.size(), subtitleFont));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[] {1.1f, 1.8f, 2.0f, 1.2f, 1.2f, 1.0f});

            addPdfHeaderCell(table, "N Orden", headerFont);
            addPdfHeaderCell(table, "Usuario", headerFont);
            addPdfHeaderCell(table, "Producto", headerFont);
            addPdfHeaderCell(table, "Fecha", headerFont);
            addPdfHeaderCell(table, "Monto", headerFont);
            addPdfHeaderCell(table, "Estado", headerFont);

            NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("es", "CO"));
            for (Map<String, Object> order : filteredOrders) {
                addPdfBodyCell(table, String.valueOf(order.getOrDefault("orderNumber", "")), bodyFont);
                addPdfBodyCell(table, String.valueOf(order.getOrDefault("buyer", "")), bodyFont);
                addPdfBodyCell(table, String.valueOf(order.getOrDefault("product", "")), bodyFont);
                addPdfBodyCell(table, String.valueOf(order.getOrDefault("date", "")), bodyFont);

                BigDecimal amount = parseBigDecimal(order.get("amount"));
                addPdfBodyCell(table, currencyFormat.format(amount), bodyFont);

                String orderStatus = String.valueOf(order.getOrDefault("status", "completed"));
                String statusLabel = switch (orderStatus) {
                    case "pending" -> "Pendiente";
                    case "canceled" -> "Cancelada";
                    default -> "Completada";
                };
                addPdfBodyCell(table, statusLabel, bodyFont);
            }

            document.add(table);
        } catch (Exception e) {
            throw new IOException("Error al generar PDF de ordenes", e);
        } finally {
            if (document.isOpen()) {
                document.close();
            }
        }
    }

    private void addPdfHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(6f);
        table.addCell(cell);
    }

    private void addPdfBodyCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5f);
        table.addCell(cell);
    }

    private BigDecimal parseBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        try {
            return new BigDecimal(String.valueOf(value));
        } catch (NumberFormatException ex) {
            return BigDecimal.ZERO;
        }
    }

    private void descontarStockDelCarrito(List<CarritoItem> carrito) {
        try {
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
                }
            }
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

    /**
     * Método para enviar correo individual (igual que en UserController)
     */
    private void enviarCorreoIndividual(String destinatario, String asunto, String cuerpo) throws MessagingException {
        try {
            String json = new com.fasterxml.jackson.databind.ObjectMapper()
                    .writeValueAsString(java.util.Map.of(
                            "sender", java.util.Map.of(
                                    "name", "Huerta Directa",
                                    "email", "jjpp142007@gmail.com"
                            ),
                            "to", java.util.List.of(
                                    java.util.Map.of("email", destinatario)
                            ),
                            "subject", asunto,
                            "htmlContent", cuerpo
                    ));

            var request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", System.getenv("BREVO_API_KEY"))
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(json))
                    .build();

            var response = java.net.http.HttpClient.newHttpClient()
                    .send(request, java.net.http.HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                throw new MessagingException("Brevo error " + response.statusCode() + ": " + response.body());
            }

            System.out.println("✉️ Correo enviado a: " + destinatario);
        } catch (MessagingException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("❌ Error enviando correo: " + e.getMessage());
            throw new MessagingException("Error enviando correo: " + e.getMessage());
        }
    }

    /**
     * Envía correo de confirmación de pago exitoso
     */
    private void enviarCorreoConfirmacionPago(PaymentRequest paymentRequest, String paymentId,
            List<CarritoItem> carrito) {
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

            // 🔧 OVERRIDE para modo prueba - Si el email es de prueba de Mercado Pago, usar
            // tu email real
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
            String htmlContent = crearContenidoHTMLPagoExitoso(customerName, paymentId, formattedAmount,
                    productsSummary);

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
                    item.getPrecio().doubleValue()));
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
                "<div style=\"max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\">"
                +
                "<!-- Header con gradiente verde -->" +
                "<div style=\"background: linear-gradient(135deg, #689f38 0%, #8bc34a 100%); padding: 40px 30px; text-align: center;\">"
                +
                "<h1 style=\"color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);\">"
                +
                "🌱 Huerta Directa" +
                "</h1>" +
                "<p style=\"color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;\">" +
                "Confirmación de Pago" +
                "</p>" +
                "</div>" +
                "<!-- Contenido principal -->" +
                "<div style=\"padding: 40px 30px;\">" +
                "<div style=\"text-align: center; margin-bottom: 30px;\">" +
                "<div style=\"background-color: #e8f5e8; border-radius: 50px; width: 80px; height: 80px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; font-size: 35px;\">"
                +
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
                "<div style=\"background-color: #f8f9fa; border-left: 5px solid #689f38; padding: 20px; border-radius: 5px; margin-bottom: 25px;\">"
                +
                "<div style=\"margin-bottom: 15px;\">" +
                "<span style=\"color: #666666; font-size: 14px; display: block; margin-bottom: 5px;\">ID de Pago</span>"
                +
                "<span style=\"color: #2e7d32; font-size: 18px; font-weight: bold;\">{{PAYMENT_ID}}</span>" +
                "</div>" +
                "<div>" +
                "<span style=\"color: #666666; font-size: 14px; display: block; margin-bottom: 5px;\">Monto Total</span>"
                +
                "<span style=\"color: #2e7d32; font-size: 22px; font-weight: bold;\">{{MONTO}}</span>" +
                "</div>" +
                "</div>" +
                "<!-- Productos adquiridos -->" +
                "<div style=\"margin-bottom: 25px;\">" +
                "<h3 style=\"color: #2e7d32; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e8f5e8; padding-bottom: 10px;\">"
                +
                "📦 Productos Adquiridos" +
                "</h3>" +
                "<div style=\"background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 5px; padding: 15px;\">"
                +
                "<pre style=\"font-family: 'Arial', sans-serif; font-size: 14px; color: #555555; margin: 0; white-space: pre-wrap; word-wrap: break-word;\">{{PRODUCTOS}}</pre>"
                +
                "</div>" +
                "</div>" +
                "<div style=\"background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin-bottom: 20px;\">"
                +
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

/*
 * import com.exe.Huerta_directa.DTO.PaymentRequestDTO;
 * import com.exe.Huerta_directa.Entity.User;
 * import com.exe.Huerta_directa.Service.MercadoPagoService;
 * //import com.mercadopago.exceptions.MPApiException;
 * //import com.mercadopago.exceptions.MPException;
 * import com.mercadopago.resources.preference.Preference;
 * import jakarta.servlet.http.HttpSession;
 * import org.springframework.beans.factory.annotation.Autowired;
 * import org.springframework.stereotype.Controller;
 * import org.springframework.ui.Model;
 * import org.springframework.web.bind.annotation.*;
 * import org.springframework.web.servlet.mvc.support.RedirectAttributes;
 * 
 * import java.math.BigDecimal;
 * 
 * /*@Controller
 * 
 * @RequestMapping("/payment")
 * public class PaymentController {
 * 
 * @Autowired
 * private MercadoPagoService mercadoPagoService;
 * 
 * /**
 * Mostrar página de checkout
 */

/*
 * @GetMapping("/checkout")
 * public String showCheckout(
 * 
 * @RequestParam String productName,
 * 
 * @RequestParam BigDecimal price,
 * 
 * @RequestParam(defaultValue = "1") Integer quantity,
 * HttpSession session,
 * Model model) {
 * 
 * User user = (User) session.getAttribute("user");
 * if (user == null) {
 * return "redirect:/login";
 * }
 * 
 * model.addAttribute("productName", productName);
 * model.addAttribute("price", price);
 * model.addAttribute("quantity", quantity);
 * model.addAttribute("total", price.multiply(BigDecimal.valueOf(quantity)));
 * model.addAttribute("userEmail", user.getEmail());
 * 
 * return "Pasarela_Pagos/checkout";
 * }
 * 
 * 
 * @PostMapping("/create-preference")
 * public String createPreference(
 * 
 * @RequestParam String productName,
 * 
 * @RequestParam BigDecimal price,
 * 
 * @RequestParam Integer quantity,
 * HttpSession session,
 * RedirectAttributes redirectAttributes) {
 * 
 * System.out.println("\nINICIO CREATE PREFERENCE");
 * System.out.println(" Sesión ID: " + session.getId());
 * 
 * User user = (User) session.getAttribute("user");
 * 
 * if (user == null) {
 * System.err.println("ERROR: Usuario no encontrado en sesión");
 * System.err.println("   Redirigiendo a /login");
 * return "redirect:/login";
 * }
 * 
 * System.out.println(" Usuario encontrado:");
 * System.out.println("   - ID: " + user.getId());
 * System.out.println("   - Email: " + user.getEmail());
 * System.out.println("   - Nombre: " + user.getName());
 * 
 * System.out.println("\n Datos del producto:");
 * System.out.println("   - Producto: " + productName);
 * System.out.println("   - Precio: $" + price);
 * System.out.println("   - Cantidad: " + quantity);
 * 
 * try {
 * System.out.println("\n Creando PaymentRequestDTO...");
 * PaymentRequestDTO paymentRequest = new PaymentRequestDTO();
 * paymentRequest.setTitle(productName);
 * paymentRequest.setPrice(price);
 * paymentRequest.setQuantity(quantity);
 * System.out.println(" DTO creado correctamente");
 * 
 * System.out.println("\n Llamando a MercadoPagoService.createPreference()...");
 * Preference preference = mercadoPagoService.createPreference(paymentRequest,
 * user.getId());
 * 
 * System.out.println("\nÉXITO");
 * System.out.println("   - Preference ID: " + preference.getId());
 * System.out.println("   - Init Point: " + preference.getSandboxInitPoint());
 * System.out.println("   - Redirigiendo a Mercado Pago...");
 * System.out.println("FIN CREATE PREFERENCE\n");
 * 
 * return "redirect:" + preference.getSandboxInitPoint();
 * 
 * } catch (Exception e) {
 * System.err.println("\nERROR CAPTURADO");
 * System.err.println("Clase de error: " + e.getClass().getName());
 * System.err.println("Mensaje: " + e.getMessage());
 * System.err.println("\n Stack trace completo:");
 * e.printStackTrace();
 * System.err.println(" FIN DEL ERROR\n");
 * 
 * redirectAttributes.addFlashAttribute("error", "Error al procesar el pago: " +
 * e.getMessage());
 * return "redirect:/index";
 * }
 * }
 * 
 * @GetMapping("/success")
 * public String paymentSuccess(
 * 
 * @RequestParam(required = false) String payment_id,
 * HttpSession session,
 * Model model) {
 * 
 * User user = (User) session.getAttribute("user");
 * if (user == null) {
 * return "redirect:/login";
 * }
 * 
 * model.addAttribute("paymentId", payment_id);
 * model.addAttribute("userName", user.getName());
 * 
 * return "Pasarela_Pagos/success";
 * }
 * 
 * @GetMapping("/failure")
 * public String paymentFailure(
 * 
 * @RequestParam(required = false) String payment_id,
 * HttpSession session,
 * Model model) {
 * 
 * User user = (User) session.getAttribute("user");
 * if (user == null) {
 * return "redirect:/login";
 * }
 * 
 * model.addAttribute("paymentId", payment_id);
 * model.addAttribute("userName", user.getName());
 * 
 * return "Pasarela_Pagos/failure";
 * }
 * 
 * @GetMapping("/pending")
 * public String paymentPending(
 * 
 * @RequestParam(required = false) String payment_id,
 * HttpSession session,
 * Model model) {
 * 
 * User user = (User) session.getAttribute("user");
 * if (user == null) {
 * return "redirect:/login";
 * }
 * 
 * model.addAttribute("paymentId", payment_id);
 * model.addAttribute("userName", user.getName());
 * 
 * return "Pasarela_Pagos/pending";
 * }
 * 
 * }
 * 
 */

/*
 * import com.exe.Huerta_directa.DTO.PaymentRequestDTO;
 * import com.exe.Huerta_directa.Entity.User;
 * import com.exe.Huerta_directa.Service.MercadoPagoService;
 * //import com.mercadopago.exceptions.MPApiException;
 * //import com.mercadopago.exceptions.MPException;
 * import com.mercadopago.resources.preference.Preference;
 * import jakarta.servlet.http.HttpSession;
 * import org.springframework.beans.factory.annotation.Autowired;
 * import org.springframework.stereotype.Controller;
 * import org.springframework.ui.Model;
 * import org.springframework.web.bind.annotation.*;
 * import org.springframework.web.servlet.mvc.support.RedirectAttributes;
 * 
 * import java.math.BigDecimal;
 * 
 * /*@Controller
 * 
 * @RequestMapping("/payment")
 * public class PaymentController {
 * 
 * @Autowired
 * private MercadoPagoService mercadoPagoService;
 * 
 * /**
 * Mostrar página de checkout
 */

/*
 * @GetMapping("/checkout")
 * public String showCheckout(
 * 
 * @RequestParam String productName,
 * 
 * @RequestParam BigDecimal price,
 * 
 * @RequestParam(defaultValue = "1") Integer quantity,
 * HttpSession session,
 * Model model) {
 * 
 * User user = (User) session.getAttribute("user");
 * if (user == null) {
 * return "redirect:/login";
 * }
 * 
 * model.addAttribute("productName", productName);
 * model.addAttribute("price", price);
 * model.addAttribute("quantity", quantity);
 * model.addAttribute("total", price.multiply(BigDecimal.valueOf(quantity)));
 * model.addAttribute("userEmail", user.getEmail());
 * 
 * return "Pasarela_Pagos/checkout";
 * }
 * 
 * 
 * @PostMapping("/create-preference")
 * public String createPreference(
 * 
 * @RequestParam String productName,
 * 
 * @RequestParam BigDecimal price,
 * 
 * @RequestParam Integer quantity,
 * HttpSession session,
 * RedirectAttributes redirectAttributes) {
 * 
 * System.out.println("\nINICIO CREATE PREFERENCE");
 * System.out.println(" Sesión ID: " + session.getId());
 * 
 * User user = (User) session.getAttribute("user");
 * 
 * if (user == null) {
 * System.err.println("ERROR: Usuario no encontrado en sesión");
 * System.err.println("   Redirigiendo a /login");
 * return "redirect:/login";
 * }
 * 
 * System.out.println(" Usuario encontrado:");
 * System.out.println("   - ID: " + user.getId());
 * System.out.println("   - Email: " + user.getEmail());
 * System.out.println("   - Nombre: " + user.getName());
 * 
 * System.out.println("\n Datos del producto:");
 * System.out.println("   - Producto: " + productName);
 * System.out.println("   - Precio: $" + price);
 * System.out.println("   - Cantidad: " + quantity);
 * 
 * try {
 * System.out.println("\n Creando PaymentRequestDTO...");
 * PaymentRequestDTO paymentRequest = new PaymentRequestDTO();
 * paymentRequest.setTitle(productName);
 * paymentRequest.setPrice(price);
 * paymentRequest.setQuantity(quantity);
 * System.out.println(" DTO creado correctamente");
 * 
 * System.out.println("\n Llamando a MercadoPagoService.createPreference()...");
 * Preference preference = mercadoPagoService.createPreference(paymentRequest,
 * user.getId());
 * 
 * System.out.println("\nÉXITO");
 * System.out.println("   - Preference ID: " + preference.getId());
 * System.out.println("   - Init Point: " + preference.getSandboxInitPoint());
 * System.out.println("   - Redirigiendo a Mercado Pago...");
 * System.out.println("FIN CREATE PREFERENCE\n");
 * 
 * return "redirect:" + preference.getSandboxInitPoint();
 * 
 * } catch (Exception e) {
 * System.err.println("\nERROR CAPTURADO");
 * System.err.println("Clase de error: " + e.getClass().getName());
 * System.err.println("Mensaje: " + e.getMessage());
 * System.err.println("\n Stack trace completo:");
 * e.printStackTrace();
 * System.err.println(" FIN DEL ERROR\n");
 * 
 * redirectAttributes.addFlashAttribute("error", "Error al procesar el pago: " +
 * e.getMessage());
 * return "redirect:/index";
 * }
 * }
 * 
 * @GetMapping("/success")
 * public String paymentSuccess(
 * 
 * @RequestParam(required = false) String payment_id,
 * HttpSession session,
 * Model model) {
 * 
 * User user = (User) session.getAttribute("user");
 * if (user == null) {
 * return "redirect:/login";
 * }
 * 
 * model.addAttribute("paymentId", payment_id);
 * model.addAttribute("userName", user.getName());
 * 
 * return "Pasarela_Pagos/success";
 * }
 * 
 * @GetMapping("/failure")
 * public String paymentFailure(
 * 
 * @RequestParam(required = false) String payment_id,
 * HttpSession session,
 * Model model) {
 * 
 * User user = (User) session.getAttribute("user");
 * if (user == null) {
 * return "redirect:/login";
 * }
 * 
 * model.addAttribute("paymentId", payment_id);
 * model.addAttribute("userName", user.getName());
 * 
 * return "Pasarela_Pagos/failure";
 * }
 * 
 * @GetMapping("/pending")
 * public String paymentPending(
 * 
 * @RequestParam(required = false) String payment_id,
 * HttpSession session,
 * Model model) {
 * 
 * User user = (User) session.getAttribute("user");
 * if (user == null) {
 * return "redirect:/login";
 * }
 * 
 * model.addAttribute("paymentId", payment_id);
 * model.addAttribute("userName", user.getName());
 * 
 * return "Pasarela_Pagos/pending";
 * }
 * 
 * }
 * 
 */
