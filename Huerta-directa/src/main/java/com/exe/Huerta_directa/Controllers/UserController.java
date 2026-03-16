package com.exe.Huerta_directa.Controllers;

import com.exe.Huerta_directa.DTO.BulkEmailByRoleRequest;
import com.exe.Huerta_directa.DTO.BulkEmailFilteredRequest;
import com.exe.Huerta_directa.DTO.BulkEmailRequest;
import com.exe.Huerta_directa.DTO.BulkEmailResponse;
import com.exe.Huerta_directa.DTO.ProductDTO;
import com.exe.Huerta_directa.DTO.UserDTO;
import com.exe.Huerta_directa.Entity.User;
import com.exe.Huerta_directa.Repository.UserRepository;
import com.exe.Huerta_directa.Service.UserService;
import com.exe.Huerta_directa.Service.ProductService;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import jakarta.mail.MessagingException;
import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.beans.factory.annotation.Value;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;
    private final ProductService productService;
    // Constantes para email centralizadas para evitar duplicación
    private static final String EMAIL_HOST = "smtp.gmail.com";
    private static final String EMAIL_PORT = "587";
    private static final String SENDER_EMAIL = "hdirecta@gmail.com";
    // Nota: la contraseña de aplicación idealmente debe guardarse en
    // properties/secret manager
    @Value("${mail.sender.password}")
    private String SENDER_PASSWORD;

    public UserController(UserService userService, UserRepository userRepository, ProductService productService) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.productService = productService;
    }

    // Aqui irian los endpoints para manejar las solicitudes HTTP relacionadas con
    // Metodo para listar todos los usuarios
    @GetMapping
    public ResponseEntity<List<UserDTO>> listarUsers() {
        return new ResponseEntity<>(userService.listarUsers(), HttpStatus.OK);
    }

    // Metodo para obtener un usuario por su id
    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> obtenerUserPorId(@PathVariable Long userId) {
        return new ResponseEntity<>(userService.obtenerUserPorId(userId), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<UserDTO> crearUser(@RequestBody UserDTO userDTO) {
        return new ResponseEntity<>(userService.crearUser(userDTO), HttpStatus.CREATED);
    }

    // Metodo para actualizar un usuario
    @PutMapping("/{userId}")
    public ResponseEntity<UserDTO> actualizarUser(@PathVariable("userId") Long userId, @RequestBody UserDTO userDTO) {
        return new ResponseEntity<>(userService.actualizarUser(userId, userDTO), HttpStatus.OK);
    }

    // Metodo para eliminar un usuario por su id
    @DeleteMapping("/{userId}")
    @Transactional
    public ResponseEntity<Void> eliminarUserPorId(@PathVariable("userId") Long userId) {
        userService.eliminarUserPorId(userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // ========== EXPORTACIÓN CON FILTROS ==========
    // Método para exportar usuarios a Excel CON FILTROS
    @GetMapping("/exportExcel")
    public void exportarExcel(
            HttpServletResponse response,
            @RequestParam(required = false) String dato,
            @RequestParam(required = false) String valor) throws IOException {
        // Obtener usuarios filtrados
        List<UserDTO> usuarios = obtenerUsuariosFiltrados(dato, valor);
        // Configurar respuesta HTTP
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        String filename = "Usuarios_" + java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
        // Crear libro Excel
        org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook();
        org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("Usuarios");
        // Crear encabezados
        org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("ID");
        headerRow.createCell(1).setCellValue("Nombre");
        headerRow.createCell(2).setCellValue("Email");
        headerRow.createCell(3).setCellValue("Género");
        headerRow.createCell(4).setCellValue("Edad");
        headerRow.createCell(5).setCellValue("Rol ID");
        // Si hay filtro, agregar fila informativa
        if (dato != null && valor != null && !valor.isEmpty()) {
            org.apache.poi.ss.usermodel.Row filterRow = sheet.createRow(1);
            filterRow.createCell(0).setCellValue("Filtro aplicado:");
            filterRow.createCell(1).setCellValue(dato + " = " + valor);
        }
        // Llenar datos
        int rowNum = (dato != null && valor != null && !valor.isEmpty()) ? 2 : 1;
        for (UserDTO usuario : usuarios) {
            org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(usuario.getId());
            row.createCell(1).setCellValue(usuario.getName());
            row.createCell(2).setCellValue(usuario.getEmail());
            row.createCell(3).setCellValue(obtenerGeneroTexto(usuario.getGender()));
            row.createCell(4).setCellValue(calcularEdad(usuario.getBirthDate()));
            row.createCell(5).setCellValue(usuario.getIdRole() != null ? usuario.getIdRole() : 0);
        }
        // Ajustar ancho de columnas
        for (int i = 0; i < 6; i++) {
            sheet.autoSizeColumn(i);
        }
        // Escribir y cerrar
        workbook.write(response.getOutputStream());
        workbook.close();
        response.getOutputStream().flush();
    }

    // Método POST: exportar con gráficas
    @PostMapping("/exportPdf")
    public void exportUsersToPdfWithCharts(
            HttpServletResponse response,
            @RequestParam(required = false) String dato,
            @RequestParam(required = false) String valor,
            @RequestBody(required = false) Map<String, Object> requestBody) throws IOException {

        // Obtener usuarios filtrados
        List<UserDTO> usuarios = obtenerUsuariosFiltrados(dato, valor);

        // Extraer imágenes de gráficas si existen
        Map<String, String> chartImages = null;
        if (requestBody != null && requestBody.containsKey("chartImages")) {
            @SuppressWarnings("unchecked")
            Map<String, String> images = (Map<String, String>) requestBody.get("chartImages");
            chartImages = images;
        }

        try {
            // Configurar la respuesta HTTP
            response.setContentType("application/pdf");
            String filename = "Usuarios_" + java.time.LocalDateTime.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
            response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
            response.setHeader("Cache-Control", "no-cache");

            // Crear documento PDF
            com.lowagie.text.Document document = new com.lowagie.text.Document();
            com.lowagie.text.pdf.PdfWriter.getInstance(document, response.getOutputStream());
            document.open();

            // Título principal
            com.lowagie.text.Font titleFont = com.lowagie.text.FontFactory.getFont(
                    com.lowagie.text.FontFactory.HELVETICA_BOLD, 20, java.awt.Color.decode("#689f38"));
            com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph("HUERTA DIRECTA", titleFont);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(title);

            // Subtítulo
            com.lowagie.text.Font subtitleFont = com.lowagie.text.FontFactory.getFont(
                    com.lowagie.text.FontFactory.HELVETICA_BOLD, 14, java.awt.Color.BLACK);
            com.lowagie.text.Paragraph subtitle = new com.lowagie.text.Paragraph("Reporte de Usuarios", subtitleFont);
            subtitle.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(10);
            document.add(subtitle);

            // Información del filtro
            if (dato != null && valor != null && !valor.isEmpty()) {
                com.lowagie.text.Font filterFont = com.lowagie.text.FontFactory.getFont(
                        com.lowagie.text.FontFactory.HELVETICA_BOLD, 12, java.awt.Color.decode("#689f38"));
                com.lowagie.text.Paragraph filterInfo = new com.lowagie.text.Paragraph(
                        "Filtro aplicado: " + dato + " = \"" + valor + "\"", filterFont);
                filterInfo.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
                filterInfo.setSpacingAfter(15);
                document.add(filterInfo);
            }

            // Información del reporte
            com.lowagie.text.Font infoFont = com.lowagie.text.FontFactory.getFont(
                    com.lowagie.text.FontFactory.HELVETICA, 10, java.awt.Color.GRAY);
            String currentDate = java.time.LocalDateTime.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
            com.lowagie.text.Paragraph reportInfo = new com.lowagie.text.Paragraph(
                    "Fecha: " + currentDate + " | Total: " + usuarios.size() + " usuario(s)", infoFont);
            reportInfo.setAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
            reportInfo.setSpacingAfter(20);
            document.add(reportInfo);

            if (usuarios.isEmpty()) {
                // Sin usuarios
                com.lowagie.text.Font noDataFont = com.lowagie.text.FontFactory.getFont(
                        com.lowagie.text.FontFactory.HELVETICA, 12, java.awt.Color.RED);
                com.lowagie.text.Paragraph noData = new com.lowagie.text.Paragraph(
                        "No se encontraron usuarios con los filtros aplicados.", noDataFont);
                noData.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
                noData.setSpacingBefore(50);
                document.add(noData);
            } else {
                // Crear tabla de usuarios
                com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(6);
                table.setWidthPercentage(100);
                table.setSpacingBefore(10f);
                float[] columnWidths = { 1f, 3f, 4f, 2f, 2f, 2f };
                table.setWidths(columnWidths);

                // Encabezados
                com.lowagie.text.Font headerFont = com.lowagie.text.FontFactory.getFont(
                        com.lowagie.text.FontFactory.HELVETICA_BOLD, 12, java.awt.Color.WHITE);
                addTableHeaderPdf(table, "ID", headerFont);
                addTableHeaderPdf(table, "Nombre", headerFont);
                addTableHeaderPdf(table, "Email", headerFont);
                addTableHeaderPdf(table, "Género", headerFont);
                addTableHeaderPdf(table, "Edad", headerFont);
                addTableHeaderPdf(table, "Rol", headerFont);

                // Datos
                com.lowagie.text.Font dataFont = com.lowagie.text.FontFactory.getFont(
                        com.lowagie.text.FontFactory.HELVETICA, 10, java.awt.Color.BLACK);
                int rowCount = 0;
                for (UserDTO usuario : usuarios) {
                    rowCount++;
                    java.awt.Color rowColor = (rowCount % 2 == 0) ? new java.awt.Color(240, 240, 240)
                            : java.awt.Color.WHITE;
                    addTableCellPdf(table, String.valueOf(usuario.getId()), dataFont, rowColor,
                            com.lowagie.text.Element.ALIGN_CENTER);
                    addTableCellPdf(table, usuario.getName() != null ? usuario.getName() : "N/A",
                            dataFont, rowColor, com.lowagie.text.Element.ALIGN_LEFT);
                    addTableCellPdf(table, usuario.getEmail() != null ? usuario.getEmail() : "N/A",
                            dataFont, rowColor, com.lowagie.text.Element.ALIGN_LEFT);
                    addTableCellPdf(table, obtenerGeneroTexto(usuario.getGender()), dataFont, rowColor,
                            com.lowagie.text.Element.ALIGN_CENTER);
                    addTableCellPdf(table, String.valueOf(calcularEdad(usuario.getBirthDate())), dataFont, rowColor,
                            com.lowagie.text.Element.ALIGN_CENTER);
                    String roleName = obtenerNombreRol(usuario.getIdRole());
                    addTableCellPdf(table, roleName, dataFont, rowColor,
                            com.lowagie.text.Element.ALIGN_CENTER);
                }
                document.add(table);

                // ========== AGREGAR GRÁFICAS ==========
                if (chartImages != null && !chartImages.isEmpty()) {
                    // Nueva página para gráficas
                    document.newPage();

                    // Título de gráficas
                    com.lowagie.text.Font chartsTitle = com.lowagie.text.FontFactory.getFont(
                            com.lowagie.text.FontFactory.HELVETICA_BOLD, 16, java.awt.Color.decode("#689f38"));
                    com.lowagie.text.Paragraph chartsHeader = new com.lowagie.text.Paragraph(
                            "Gráficas Estadísticas", chartsTitle);
                    chartsHeader.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
                    chartsHeader.setSpacingAfter(20);
                    document.add(chartsHeader);

                    // Agregar cada gráfica
                    agregarGrafica(document, chartImages.get("rolesChart"), "Distribución por Roles");
                    agregarGrafica(document, chartImages.get("genderChart"), "Distribución por Género");
                    agregarGrafica(document, chartImages.get("ageChart"), "Distribución por Edad");
                    agregarGrafica(document, chartImages.get("activityChart"), "Actividad por Mes");
                }

                // Estadísticas textuales (original)
                java.util.Map<String, Long> usersByRole = usuarios.stream()
                        .collect(java.util.stream.Collectors.groupingBy(
                                user -> obtenerNombreRol(user.getIdRole()),
                                java.util.stream.Collectors.counting()));

                java.util.Map<String, Long> usersByGender = usuarios.stream()
                        .filter(u -> u.getGender() != null)
                        .collect(java.util.stream.Collectors.groupingBy(
                                user -> obtenerGeneroTexto(user.getGender()),
                                java.util.stream.Collectors.counting()));

                if (!usersByRole.isEmpty() || !usersByGender.isEmpty()) {
                    document.add(new com.lowagie.text.Paragraph(" "));
                    com.lowagie.text.Font statsFont = com.lowagie.text.FontFactory.getFont(
                            com.lowagie.text.FontFactory.HELVETICA_BOLD, 12, java.awt.Color.BLACK);
                    com.lowagie.text.Paragraph statsTitle = new com.lowagie.text.Paragraph(
                            "Estadísticas:", statsFont);
                    statsTitle.setSpacingBefore(20);
                    document.add(statsTitle);

                    com.lowagie.text.Font statsDataFont = com.lowagie.text.FontFactory.getFont(
                            com.lowagie.text.FontFactory.HELVETICA, 10, java.awt.Color.BLACK);

                    if (!usersByRole.isEmpty()) {
                        com.lowagie.text.Paragraph roleTitle = new com.lowagie.text.Paragraph(
                                "Por Rol:", statsDataFont);
                        roleTitle.setSpacingBefore(10);
                        document.add(roleTitle);
                        for (java.util.Map.Entry<String, Long> entry : usersByRole.entrySet()) {
                            com.lowagie.text.Paragraph statLine = new com.lowagie.text.Paragraph(
                                    "• " + entry.getKey() + ": " + entry.getValue() + " usuario(s)", statsDataFont);
                            statLine.setIndentationLeft(20);
                            document.add(statLine);
                        }
                    }

                    if (!usersByGender.isEmpty()) {
                        com.lowagie.text.Paragraph genderTitle = new com.lowagie.text.Paragraph(
                                "Por Género:", statsDataFont);
                        genderTitle.setSpacingBefore(10);
                        document.add(genderTitle);
                        for (java.util.Map.Entry<String, Long> entry : usersByGender.entrySet()) {
                            com.lowagie.text.Paragraph statLine = new com.lowagie.text.Paragraph(
                                    "• " + entry.getKey() + ": " + entry.getValue() + " usuario(s)", statsDataFont);
                            statLine.setIndentationLeft(20);
                            document.add(statLine);
                        }
                    }
                }
            }

            document.close();

        } catch (Exception e) {
            e.printStackTrace();
            throw new IOException("Error generando PDF: " + e.getMessage());
        }
    }

    // Método auxiliar para agregar gráficas al PDF
    private void agregarGrafica(com.lowagie.text.Document document, String base64Image, String titulo)
            throws com.lowagie.text.DocumentException, IOException {
        if (base64Image != null && !base64Image.isEmpty()) {
            // Agregar título de la gráfica
            com.lowagie.text.Font chartTitleFont = com.lowagie.text.FontFactory.getFont(
                    com.lowagie.text.FontFactory.HELVETICA_BOLD, 12, java.awt.Color.BLACK);
            com.lowagie.text.Paragraph chartTitle = new com.lowagie.text.Paragraph(titulo, chartTitleFont);
            chartTitle.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            chartTitle.setSpacingBefore(15);
            document.add(chartTitle);

            // Decodificar imagen base64
            String imageData = base64Image;
            if (imageData.contains(",")) {
                imageData = imageData.split(",")[1];
            }
            byte[] imageBytes = Base64.getDecoder().decode(imageData);

            // Agregar imagen al PDF
            com.lowagie.text.Image pdfImage = com.lowagie.text.Image.getInstance(imageBytes);

            // Escalar imagen para que quepa bien en el PDF
            float maxWidth = 450f;
            float maxHeight = 300f;
            pdfImage.scaleToFit(maxWidth, maxHeight);
            pdfImage.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);

            document.add(pdfImage);
            document.add(new com.lowagie.text.Paragraph(" ")); // Espacio
        }
    }

    // Endpoint para exportar usuarios a PDF CON FILTROS
    @GetMapping("/exportPdf")
    public void exportUsersToPdf(
            HttpServletResponse response,
            @RequestParam(required = false) String dato,
            @RequestParam(required = false) String valor) throws IOException {
        // Obtener usuarios filtrados
        List<UserDTO> usuarios = obtenerUsuariosFiltrados(dato, valor);
        try {
            // Configurar la respuesta HTTP para descarga de archivo PDF
            response.setContentType("application/pdf");
            String filename = "Usuarios_" + java.time.LocalDateTime.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
            response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
            response.setHeader("Cache-Control", "no-cache");
            // Crear documento PDF
            com.lowagie.text.Document document = new com.lowagie.text.Document();
            com.lowagie.text.pdf.PdfWriter.getInstance(document, response.getOutputStream());
            document.open();
            // Título principal
            com.lowagie.text.Font titleFont = com.lowagie.text.FontFactory.getFont(
                    com.lowagie.text.FontFactory.HELVETICA_BOLD, 20, java.awt.Color.decode("#689f38"));
            com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph("HUERTA DIRECTA", titleFont);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            document.add(title);
            // Subtítulo
            com.lowagie.text.Font subtitleFont = com.lowagie.text.FontFactory.getFont(
                    com.lowagie.text.FontFactory.HELVETICA_BOLD, 14, java.awt.Color.BLACK);
            com.lowagie.text.Paragraph subtitle = new com.lowagie.text.Paragraph("Reporte de Usuarios", subtitleFont);
            subtitle.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(10);
            document.add(subtitle);
            // Información del filtro aplicado
            if (dato != null && valor != null && !valor.isEmpty()) {
                com.lowagie.text.Font filterFont = com.lowagie.text.FontFactory.getFont(
                        com.lowagie.text.FontFactory.HELVETICA_BOLD, 12, java.awt.Color.decode("#689f38"));
                com.lowagie.text.Paragraph filterInfo = new com.lowagie.text.Paragraph(
                        "Filtro aplicado: " + dato + " = \"" + valor + "\"", filterFont);
                filterInfo.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
                filterInfo.setSpacingAfter(15);
                document.add(filterInfo);
            }
            // Información del reporte
            com.lowagie.text.Font infoFont = com.lowagie.text.FontFactory.getFont(
                    com.lowagie.text.FontFactory.HELVETICA, 10, java.awt.Color.GRAY);
            String currentDate = java.time.LocalDateTime.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
            com.lowagie.text.Paragraph reportInfo = new com.lowagie.text.Paragraph(
                    "Fecha: " + currentDate + " | Total: " + usuarios.size() + " usuario(s)", infoFont);
            reportInfo.setAlignment(com.lowagie.text.Element.ALIGN_RIGHT);
            reportInfo.setSpacingAfter(20);
            document.add(reportInfo);
            if (usuarios.isEmpty()) {
                // Si no hay usuarios
                com.lowagie.text.Font noDataFont = com.lowagie.text.FontFactory.getFont(
                        com.lowagie.text.FontFactory.HELVETICA, 12, java.awt.Color.RED);
                com.lowagie.text.Paragraph noData = new com.lowagie.text.Paragraph(
                        "No se encontraron usuarios con los filtros aplicados.", noDataFont);
                noData.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
                noData.setSpacingBefore(50);
                document.add(noData);
            } else {
                // Crear tabla con 6 columnas
                com.lowagie.text.pdf.PdfPTable table = new com.lowagie.text.pdf.PdfPTable(6);
                table.setWidthPercentage(100);
                table.setSpacingBefore(10f);
                float[] columnWidths = { 1f, 3f, 4f, 2f, 2f, 2f };
                table.setWidths(columnWidths);
                // Encabezados
                com.lowagie.text.Font headerFont = com.lowagie.text.FontFactory.getFont(
                        com.lowagie.text.FontFactory.HELVETICA_BOLD, 12, java.awt.Color.WHITE);
                addTableHeaderPdf(table, "ID", headerFont);
                addTableHeaderPdf(table, "Nombre", headerFont);
                addTableHeaderPdf(table, "Email", headerFont);
                addTableHeaderPdf(table, "Género", headerFont);
                addTableHeaderPdf(table, "Edad", headerFont);
                addTableHeaderPdf(table, "Rol", headerFont);
                // Datos
                com.lowagie.text.Font dataFont = com.lowagie.text.FontFactory.getFont(
                        com.lowagie.text.FontFactory.HELVETICA, 10, java.awt.Color.BLACK);
                int rowCount = 0;
                for (UserDTO usuario : usuarios) {
                    rowCount++;
                    java.awt.Color rowColor = (rowCount % 2 == 0) ? new java.awt.Color(240, 240, 240)
                            : java.awt.Color.WHITE;
                    addTableCellPdf(table, String.valueOf(usuario.getId()), dataFont, rowColor,
                            com.lowagie.text.Element.ALIGN_CENTER);
                    addTableCellPdf(table, usuario.getName() != null ? usuario.getName() : "N/A",
                            dataFont, rowColor, com.lowagie.text.Element.ALIGN_LEFT);
                    addTableCellPdf(table, usuario.getEmail() != null ? usuario.getEmail() : "N/A",
                            dataFont, rowColor, com.lowagie.text.Element.ALIGN_LEFT);
                    addTableCellPdf(table, obtenerGeneroTexto(usuario.getGender()), dataFont, rowColor,
                            com.lowagie.text.Element.ALIGN_CENTER);
                    addTableCellPdf(table, String.valueOf(calcularEdad(usuario.getBirthDate())), dataFont, rowColor,
                            com.lowagie.text.Element.ALIGN_CENTER);
                    String roleName = obtenerNombreRol(usuario.getIdRole());
                    addTableCellPdf(table, roleName, dataFont, rowColor,
                            com.lowagie.text.Element.ALIGN_CENTER);
                }
                document.add(table);
                // Estadísticas por rol
                java.util.Map<String, Long> usersByRole = usuarios.stream()
                        .collect(java.util.stream.Collectors.groupingBy(
                                user -> obtenerNombreRol(user.getIdRole()),
                                java.util.stream.Collectors.counting()));
                // Estadísticas por género
                java.util.Map<String, Long> usersByGender = usuarios.stream()
                        .filter(u -> u.getGender() != null)
                        .collect(java.util.stream.Collectors.groupingBy(
                                user -> obtenerGeneroTexto(user.getGender()),
                                java.util.stream.Collectors.counting()));
                if (!usersByRole.isEmpty() || !usersByGender.isEmpty()) {
                    document.add(new com.lowagie.text.Paragraph(" ")); // Espacio
                    com.lowagie.text.Font statsFont = com.lowagie.text.FontFactory.getFont(
                            com.lowagie.text.FontFactory.HELVETICA_BOLD, 12, java.awt.Color.BLACK);
                    com.lowagie.text.Paragraph statsTitle = new com.lowagie.text.Paragraph(
                            "Estadísticas:", statsFont);
                    statsTitle.setSpacingBefore(20);
                    document.add(statsTitle);
                    com.lowagie.text.Font statsDataFont = com.lowagie.text.FontFactory.getFont(
                            com.lowagie.text.FontFactory.HELVETICA, 10, java.awt.Color.BLACK);
                    // Estadísticas por rol
                    if (!usersByRole.isEmpty()) {
                        com.lowagie.text.Paragraph roleTitle = new com.lowagie.text.Paragraph(
                                "Por Rol:", statsDataFont);
                        roleTitle.setSpacingBefore(10);
                        document.add(roleTitle);
                        for (java.util.Map.Entry<String, Long> entry : usersByRole.entrySet()) {
                            com.lowagie.text.Paragraph statLine = new com.lowagie.text.Paragraph(
                                    "â€¢ " + entry.getKey() + ": " + entry.getValue() + " usuario(s)", statsDataFont);
                            statLine.setIndentationLeft(20);
                            document.add(statLine);
                        }
                    }
                    // Estadísticas por gÃ©nero
                    if (!usersByGender.isEmpty()) {
                        com.lowagie.text.Paragraph genderTitle = new com.lowagie.text.Paragraph(
                                "Por Género:", statsDataFont);
                        genderTitle.setSpacingBefore(10);
                        document.add(genderTitle);
                        for (java.util.Map.Entry<String, Long> entry : usersByGender.entrySet()) {
                            com.lowagie.text.Paragraph statLine = new com.lowagie.text.Paragraph(
                                    "â€¢ " + entry.getKey() + ": " + entry.getValue() + " usuario(s)", statsDataFont);
                            statLine.setIndentationLeft(20);
                            document.add(statLine);
                        }
                    }
                }
            }
            // Pie de página
            com.lowagie.text.Font footerFont = com.lowagie.text.FontFactory.getFont(
                    com.lowagie.text.FontFactory.HELVETICA_OBLIQUE, 8, java.awt.Color.GRAY);
            com.lowagie.text.Paragraph footer = new com.lowagie.text.Paragraph(
                    "Reporte generado automáticamente por Huerta Directa", footerFont);
            footer.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            footer.setSpacingBefore(30);
            document.add(footer);
            document.close();
            response.getOutputStream().flush();
        } catch (Exception e) {
            // Un único manejo de errores para cualquier excepciÃ³n durante la generaciÃ³n
            // del
            // PDF
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error al generar el archivo PDF: " + e.getMessage());
        }
    }

    // AQUI VAN LOS MÉTODOS DE LOGIN Y REGISTRO
    @Autowired
    private PasswordEncoder passwordEncoder; // o BCryptPasswordEncoder, pero mejor PasswordEncoder

    // Método reutilizable para crear la sesión de correo con las constantes
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

    // ========== MÃ‰TODOS AUXILIARES PARA EXPORTACIÃ“N ==========
    private List<UserDTO> obtenerUsuariosFiltrados(String dato, String valor) {
        List<UserDTO> todosUsuarios = userService.listarUsers();
        if (dato == null || valor == null || valor.isEmpty()) {
            return todosUsuarios;
        }
        return todosUsuarios.stream()
                .filter(usuario -> {
                    switch (dato) {
                        case "id":
                            try {
                                return usuario.getId().equals(Long.parseLong(valor));
                            } catch (NumberFormatException e) {
                                return false;
                            }
                        case "name_user":
                            return usuario.getName() != null &&
                                    usuario.getName().toLowerCase().contains(valor.toLowerCase());
                        case "email":
                            return usuario.getEmail() != null &&
                                    usuario.getEmail().toLowerCase().contains(valor.toLowerCase());
                        case "role":
                            return filtrarPorRol(usuario, valor);
                        case "gender":
                            return usuario.getGender() != null &&
                                    obtenerGeneroTexto(usuario.getGender()).toLowerCase().contains(valor.toLowerCase());
                        default:
                            return false;
                    }
                })
                .collect(java.util.stream.Collectors.toList());
    }

    private boolean filtrarPorRol(UserDTO usuario, String valor) {
        if (usuario.getIdRole() == null || valor == null) {
            return false;
        }
        String valorLower = valor.toLowerCase().trim();
        Long roleId = usuario.getIdRole();
        // Buscar por ID del rol (1 o 2)
        try {
            Long valorRoleId = Long.parseLong(valorLower);
            if (roleId.equals(valorRoleId)) {
                return true;
            }
        } catch (NumberFormatException e) {
            // No es un nÃºmero, continuar con bÃºsqueda por nombre
        }
        // Buscar por nombre del rol (comprobaciÃ³n combinada)
        if ((roleId == 1 && (valorLower.contains("admin") || valorLower.contains("administrador")))
                || (roleId == 2 && (valorLower.contains("client") || valorLower.contains("usuario")))) {
            return true;
        }
        return false;
    }

    private String obtenerNombreRol(Long idRole) {
        if (idRole == null) {
            return "Sin Rol";
        }
        return switch (idRole.intValue()) {
            case 1 -> "Administrador";
            case 2 -> "Cliente";
            default -> "Otro";
        };
    }

    // Método para obtener texto del género
    private String obtenerGeneroTexto(String gender) {
        if (gender == null) {
            return "No especificado";
        }
        return switch (gender) {
            case "M" -> "Masculino";
            case "F" -> "Femenino";
            case "O" -> "Otro";
            default -> "No especificado";
        };
    }

    // Método para calcular edad
    private int calcularEdad(LocalDate birthDate) {
        if (birthDate == null) {
            return 0;
        }
        return Period.between(birthDate, LocalDate.now()).getYears();
    }

    private void addTableHeaderPdf(PdfPTable table, String headerTitle,
            com.lowagie.text.Font font) {
        PdfPCell header = new PdfPCell();
        header.setBackgroundColor(java.awt.Color.decode("#689f38"));
        header.setBorderWidth(1);
        header.setPhrase(new Phrase(headerTitle, font));
        header.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_CENTER);
        header.setVerticalAlignment(com.lowagie.text.Element.ALIGN_MIDDLE);
        header.setPadding(8);
        table.addCell(header);
    }

    private void addTableCellPdf(PdfPTable table, String text,
            com.lowagie.text.Font font, java.awt.Color backgroundColor,
            int alignment) {
        PdfPCell cell = new PdfPCell();
        cell.setPhrase(new Phrase(text, font));
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(com.lowagie.text.Element.ALIGN_MIDDLE);
        cell.setBackgroundColor(backgroundColor);
        cell.setPadding(5);
        cell.setBorderWidth(1);
        table.addCell(cell);
    }
    // ========== MÃ‰TODOS AUXILIARES PARA EXPORTACIÃ“N ==========
    /**
     * Método auxiliar para convertir UserDTO a User Entity
     * Se usa como respaldo si no se puede encontrar el usuario en la base de datos
     */

    // ========== ENVÍO DE CORREOS MASIVOS ==========
    /**
     * Endpoint para enviar correo masivo a todos los usuarios
     */
    @PostMapping("/send-bulk-email")
    @ResponseBody
    public ResponseEntity<BulkEmailResponse> enviarCorreoMasivo(@RequestBody BulkEmailRequest request) {
        try {
            List<User> users = userRepository.findAll().stream()
                    .filter(user -> user.getEmail() != null && !user.getEmail().isEmpty())
                    .collect(Collectors.toList());
            if (users.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new BulkEmailResponse(0, 0, "No hay usuarios con emails válidos"));
            }
            
            // Envío asíncrono - respuesta inmediata
            enviarCorreoMasivoAsync(users, request.getSubject(), request.getBody());
            
            BulkEmailResponse response = new BulkEmailResponse(users.size(), 0,
                    "Correo enviándose en segundo plano a " + users.size() + " usuarios");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new BulkEmailResponse(0, 0, "Error en el envío masivo: " + e.getMessage()));
        }
    }

    /**
     * Endpoint para enviar correo masivo filtrado por IDs o emails
     */
    @PostMapping("/send-bulk-email-filtered")
    @ResponseBody
    public ResponseEntity<BulkEmailResponse> enviarCorreoMasivoFiltrado(@RequestBody BulkEmailFilteredRequest request) {
        try {
            List<User> users = new java.util.ArrayList<>();
            if (request.getUserIds() != null && !request.getUserIds().isEmpty()) {
                users = userRepository.findAllById(request.getUserIds());
            } else if (request.getEmails() != null && !request.getEmails().isEmpty()) {
                users = userRepository.findByEmailIn(request.getEmails());
            } else {
                return ResponseEntity.badRequest()
                        .body(new BulkEmailResponse(0, 0, "Debe proporcionar IDs de usuarios o emails"));
            }
            users = users.stream()
                    .filter(user -> user.getEmail() != null && !user.getEmail().isEmpty())
                    .collect(Collectors.toList());
            if (users.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new BulkEmailResponse(0, 0, "No hay usuarios válidos para enviar"));
            }
            
            // Envío asíncrono - respuesta inmediata
            enviarCorreoMasivoAsync(users, request.getSubject(), request.getBody());
            
            BulkEmailResponse response = new BulkEmailResponse(users.size(), 0,
                    "Correo enviándose en segundo plano a " + users.size() + " usuarios filtrados");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new BulkEmailResponse(0, 0, "Error: " + e.getMessage()));
        }
    }

    /**
     * Endpoint para enviar correo masivo por rol
     */
    @PostMapping("/send-bulk-email-by-role")
    @ResponseBody
    public ResponseEntity<BulkEmailResponse> enviarCorreoMasivoPorRol(@RequestBody BulkEmailByRoleRequest request) {
        try {
            List<User> users = userRepository.findAll().stream()
                    .filter(user -> user.getEmail() != null && !user.getEmail().isEmpty())
                    .filter(user -> user.getRole() != null && user.getRole().getIdRole().equals(request.getIdRole()))
                    .collect(java.util.stream.Collectors.toList());
            if (users.isEmpty()) {
                String roleName = request.getIdRole() == 1 ? "Administradores" : "Clientes";
                return ResponseEntity.badRequest()
                        .body(new BulkEmailResponse(0, 0, "No hay " + roleName + " con emails válidos"));
            }
            
            // Envío asíncrono - respuesta inmediata
            enviarCorreoMasivoAsync(users, request.getSubject(), request.getBody());
            
            String roleName = request.getIdRole() == 1 ? "administradores" : "clientes";
            BulkEmailResponse response = new BulkEmailResponse(users.size(), 0,
                    "Correo enviándose en segundo plano a " + users.size() + " " + roleName);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new BulkEmailResponse(0, 0, "Error: " + e.getMessage()));
        }
    }

    /**
     * Método asíncrono para envío masivo en segundo plano
     */
    @Async
    public void enviarCorreoMasivoAsync(List<User> users, String asunto, String cuerpo) {
        try {
            enviarCorreoMasivoOptimizado(users, asunto, cuerpo);
        } catch (Exception e) {
            System.err.println("Error en envío masivo asíncrono: " + e.getMessage());
        }
    }

    /**
     * Método para envío masivo optimizado - Configuración SMTP mejorada
     */
    private void enviarCorreoMasivoOptimizado(List<User> users, String asunto, String cuerpo) throws MessagingException {
        // Configuración SMTP optimizada
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", EMAIL_HOST);
        props.put("mail.smtp.port", EMAIL_PORT);
        // Optimizaciones de rendimiento
        props.put("mail.smtp.connectionpoolsize", "10");
        props.put("mail.smtp.connectionpooltimeout", "30000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");
        
        Session session = Session.getInstance(props, new Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(SENDER_EMAIL, SENDER_PASSWORD);
            }
        });
        
        MimeMessage message = new MimeMessage(session);
        message.setFrom(new InternetAddress(SENDER_EMAIL));
        
        // Agregar todos los destinatarios usando BCC
        InternetAddress[] destinatarios = new InternetAddress[users.size()];
        for (int i = 0; i < users.size(); i++) {
            destinatarios[i] = new InternetAddress(users.get(i).getEmail());
        }
        message.setRecipients(Message.RecipientType.BCC, destinatarios);
        message.setSubject(asunto);
        
        // Aplicar estilo HTML
        String htmlContent = crearContenidoHTMLEnvioMasivo("Usuario", cuerpo);
        message.setContent(htmlContent, "text/html; charset=utf-8");
        
        // Envío optimizado
        Transport.send(message);
    }

    /**
     * Método para enviar correo individual
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
     * Endpoint para enviar notificación individual a un usuario con mensaje
     * personalizado
     */
    @PostMapping("/notify-single")
    @ResponseBody
    public ResponseEntity<?> notifySingleUser(@RequestBody Map<String, String> request) {
        System.out.println("DEBUG: Endpoint /notify-single invocado");
        try {
            Long userId = Long.parseLong(request.get("userId"));
            String messageBody = request.get("message");
            String subject = request.getOrDefault("subject", "Notificación de Huerta Directa");

            System.out.println("DEBUG: Buscando usuario ID: " + userId);
            UserDTO user = userService.obtenerUserPorId(userId);

            if (user == null) {
                System.out.println("DEBUG: Usuario es NULL");
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Usuario no encontrado"));
            }

            System.out.println("DEBUG: Usuario encontrado. Email: '" + user.getEmail() + "'");

            if (user.getEmail() == null || user.getEmail().isEmpty()) {
                System.out.println("DEBUG: Email es NULL o vacío");
                return ResponseEntity.badRequest()
                        .body(Collections.singletonMap("error", "Usuario sin email asociado"));
            }

            // Generar contenido visual HTML
            String htmlContent = crearContenidoHTMLNotificacion(user.getName() != null ? user.getName() : "Usuario",
                    messageBody);

            enviarCorreoIndividual(user.getEmail(), subject, htmlContent);

            return ResponseEntity
                    .ok(Collections.singletonMap("message", "Correo enviado exitosamente a " + user.getEmail()));

        } catch (Exception e) {
            System.err.println("DEBUG ERROR: Excepción en envío de correo:");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Error al enviar correo: " + e.getMessage()));
        }
    }

    /**
     * Método para crear el contenido HTML del correo de notificación (Estilo Huerta
     * Directa)
     */
    private String crearContenidoHTMLNotificacion(String nombre, String mensajePersonalizado) {
        // Formateamos los saltos de línea del mensaje para HTML
        String mensajeHtml = mensajePersonalizado.replace("\n", "<br>");

        String htmlTemplate = "<!DOCTYPE html>" +
            "<html lang=\"es\">" +
            "<head>" +
            "<meta charset=\"UTF-8\">" +
            "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
            "<title>Notificación - Huerta Directa</title>" +
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
            "Mensaje Importante" +
            "</p>" +
            "</div>" +
            "<!-- Contenido principal -->" +
            "<div style=\"padding: 40px 30px;\">" +
            "<div style=\"text-align: center; margin-bottom: 30px;\">" +
            "<div style=\"background-color: #e8f5e8; border-radius: 50px; width: 80px; height: 80px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; font-size: 35px;\">" +
            "📩" +
            "</div>" +
            "<h2 style=\"color: #2e7d32; margin: 0; font-size: 24px; font-weight: bold;\">" +
            "Tienes una nueva notificación" +
            "</h2>" +
            "</div>" +
            "<div style=\"text-align: left; margin-bottom: 30px;\">" +
            "<p style=\"color: #333333; font-size: 18px; line-height: 1.6; margin-bottom: 15px;\">" +
            "Hola <strong style=\"color: #689f38;\">%s</strong>," +
            "</p>" +
            "<div style=\"background-color: #f8f9fa; border-left: 5px solid #689f38; padding: 20px; border-radius: 5px;\">" +
            "<p style=\"color: #555555; font-size: 16px; line-height: 1.6; margin: 0;\">" +
            "%s" +
            "</p>" +
            "</div>" +
            "</div>" +
            "<!-- Footer -->" +
            "<div style=\"text-align: center; border-top: 2px solid #e8f5e8; padding-top: 25px;\">" +
            "<p style=\"color: #666666; font-size: 14px; line-height: 1.5; margin: 0;\">" +
            "Si tienes preguntas, puedes contactarnos en cualquier momento.<br>" +
            "<strong style=\"color: #689f38;\">¡Gracias por ser parte de Huerta Directa! 🌍</strong>" +
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

        return String.format(htmlTemplate, nombre, mensajeHtml);
    }

    /**
     * Método para crear el contenido HTML del correo de notificación masiva (Estilo Huerta Directa)
     */
    private String crearContenidoHTMLEnvioMasivo(String nombre, String mensajePersonalizado) {
        // Formateamos los saltos de línea del mensaje para HTML
        String mensajeHtml = mensajePersonalizado.replace("\n", "<br>");

        return """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Comunicado - Huerta Directa</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
                    <table role="presentation" style="width: 100%%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 0;">
                                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    <!-- Header con gradiente verde -->
                                    <div style="background: linear-gradient(135deg, #689f38 0%%, #8bc34a 100%%); padding: 40px 30px; text-align: center;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                                            🌱 Huerta Directa
                                        </h1>
                                        <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                                            Comunicado Importante
                                        </p>
                                    </div>
                                    <!-- Contenido principal -->
                                    <div style="padding: 40px 30px;">
                                        <div style="text-align: center; margin-bottom: 30px;">
                                            <div style="background-color: #e8f5e8; border-radius: 50px; width: 80px; height: 80px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; font-size: 35px;">
                                                📢
                                            </div>
                                            <h2 style="color: #2e7d32; margin: 0; font-size: 24px; font-weight: bold;">
                                                Mensaje de Huerta Directa
                                            </h2>
                                        </div>
                                        <div style="text-align: center; margin-bottom: 30px;">
                                            <p style="color: #333333; font-size: 18px; line-height: 1.6; margin-bottom: 15px;">
                                                Estimado/a <strong style="color: #689f38;">miembro de nuestra comunidad</strong>! 👋
                                            </p>
                                        </div>
                                        <!-- Mensaje principal -->
                                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                                            <p style="color: #555555; font-size: 16px; line-height: 1.7; margin: 0; text-align: left;">
                                                %s
                                            </p>
                                        </div>
                                        <!-- Mensaje de agradecimiento -->
                                        <div style="text-align: center; border-top: 2px solid #e8f5e8; padding-top: 25px;">
                                            <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">
                                                Gracias por formar parte de nuestra comunidad que conecta el campo con tu mesa.<br>
                                                <strong style="color: #689f38;">¡Juntos construimos un futuro más verde! 🌍</strong>
                                            </p>
                                        </div>
                                    </div>
                                    <!-- Footer -->
                                    <div style="background-color: #2e7d32; padding: 25px 30px; text-align: center;">
                                        <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">
                                            El equipo de Huerta Directa 🌱
                                        </p>
                                        <p style="color: #c8e6c9; margin: 0; font-size: 12px;">
                                            Este correo fue enviado automáticamente. Por favor, no respondas a este mensaje.
                                        </p>
                                        <div style="margin-top: 15px;">
                                            <span style="color: #c8e6c9; font-size: 12px;">
                                                © 2024 Huerta Directa - Todos los derechos reservados
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .formatted(mensajeHtml);
    }

    /**
     * Metodo privado para enviar correo personalizado
     */
    // lo comente por que me daba error y sÃ© que no se usa/////
    // private void enviarCorreoPersonalizado(String destinatario, String asunto,
    // String cuerpo)
    // throws MessagingException {
    // Session session = crearSesionCorreo();
    // MimeMessage message = new MimeMessage(session);
    // message.setFrom(new InternetAddress(SENDER_EMAIL));
    // message.setRecipients(Message.RecipientType.TO,
    // InternetAddress.parse(destinatario));
    // message.setSubject(asunto);
    // // Detectar si el cuerpo es HTML o texto plano
    // if (cuerpo.trim().startsWith("<!DOCTYPE") ||
    // cuerpo.trim().startsWith("<html")) {
    // message.setContent(cuerpo, "text/html; charset=utf-8");
    // } else {
    // message.setText(cuerpo, "utf-8");
    // }
    // Transport.send(message);
    // }
    // ========== RECUPERACIÃ“N DE CONTRASEÃ‘A ==========
    /**
     * Endpoint para solicitar recuperaciÃ³n de contraseÃ±a - VersiÃ³n simple como
     * el
     * registro
     */

    // ========== CARGA DE DATOS DESDE ARCHIVO ==========
    /**
     * Endpoint para cargar datos desde archivo CSV o Excel
     */
    @PostMapping("/upload")
    @ResponseBody
    public ResponseEntity<?> cargarDatosDesdeArchivo(@RequestParam("archivo") MultipartFile archivo) {
        try {
            // Validar que se enviÃ³ un archivo
            if (archivo.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(java.util.Map.of(
                                "success", false,
                                "message", "No se ha seleccionado ningÃºn archivo"));
            }
            // Validar tipo de archivo
            String nombreArchivo = archivo.getOriginalFilename();
            if (nombreArchivo == null || (!nombreArchivo.endsWith(".csv") &&
                    !nombreArchivo.endsWith(".xlsx") && !nombreArchivo.endsWith(".xls"))) {
                return ResponseEntity.badRequest()
                        .body(java.util.Map.of(
                                "success", false,
                                "message", "Formato de archivo no soportado. Use CSV o Excel (.xlsx, .xls)"));
            }
            List<UserDTO> usuariosCargados = new ArrayList<>();
            int usuariosCreados = 0;
            int usuariosDuplicados = 0;
            List<String> errores = new ArrayList<>();
            if (nombreArchivo.endsWith(".csv")) {
                usuariosCargados = procesarArchivoCSV(archivo.getInputStream());
            } else {
                usuariosCargados = procesarArchivoExcel(archivo.getInputStream());
            }
            // Procesar cada usuario del archivo
            for (int i = 0; i < usuariosCargados.size(); i++) {
                UserDTO usuario = usuariosCargados.get(i);
                try {
                    // Validar datos bÃ¡sicos
                    if (usuario.getEmail() == null || usuario.getEmail().trim().isEmpty()) {
                        errores.add("Fila " + (i + 2) + ": Email requerido");
                        continue;
                    }
                    if (usuario.getName() == null || usuario.getName().trim().isEmpty()) {
                        errores.add("Fila " + (i + 2) + ": Nombre requerido");
                        continue;
                    }
                    // Verificar si el usuario ya existe
                    if (userRepository.findByEmail(usuario.getEmail()).isPresent()) {
                        usuariosDuplicados++;
                        continue;
                    }
                    // Asignar valores por defecto si no estÃ¡n presentes
                    if (usuario.getPassword() == null || usuario.getPassword().trim().isEmpty()) {
                        usuario.setPassword("123456"); // ContraseÃ±a por defecto
                    }
                    if (usuario.getIdRole() == null) {
                        usuario.setIdRole(2L); // Rol cliente por defecto
                    }
                    // Crear el usuario
                    userService.crearUser(usuario);
                    usuariosCreados++;
                } catch (DataIntegrityViolationException e) {
                    usuariosDuplicados++;
                } catch (Exception e) {
                    errores.add("Fila " + (i + 2) + ": " + e.getMessage());
                }
            }
            // Preparar respuesta
            java.util.Map<String, Object> respuesta = new java.util.HashMap<>();
            respuesta.put("success", true);
            respuesta.put("message", "Procesamiento completado");
            respuesta.put("usuariosCreados", usuariosCreados);
            respuesta.put("usuariosDuplicados", usuariosDuplicados);
            respuesta.put("totalProcesados", usuariosCargados.size());
            respuesta.put("errores", errores);
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of(
                            "success", false,
                            "message", "Error al procesar el archivo: " + e.getMessage()));
        }
    }

    /**
     * Procesar archivo CSV
     */
    private List<UserDTO> procesarArchivoCSV(InputStream inputStream) throws IOException {
        List<UserDTO> usuarios = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String linea;
            boolean primeraLinea = true;
            while ((linea = reader.readLine()) != null) {
                if (primeraLinea) {
                    primeraLinea = false; // Saltar encabezados
                    continue;
                }
                String[] campos = linea.split(",");
                if (campos.length >= 2) // Al menos nombre y email
                {
                    UserDTO usuario = new UserDTO();
                    usuario.setName(campos[0].trim());
                    usuario.setEmail(campos[1].trim());
                    // Campos opcionales
                    if (campos.length > 2 && !campos[2].trim().isEmpty()) {
                        usuario.setPassword(campos[2].trim());
                    }
                    if (campos.length > 3 && !campos[3].trim().isEmpty()) {
                        try {
                            usuario.setIdRole(Long.parseLong(campos[3].trim()));
                        } catch (NumberFormatException e) {
                            // Usar rol por defecto si no es vÃ¡lido
                        }
                    }
                    usuarios.add(usuario);
                }
            }
        }
        return usuarios;
    }

    /**
     * Procesar archivo Excel
     */
    private List<UserDTO> procesarArchivoExcel(InputStream inputStream) throws IOException {
        List<UserDTO> usuarios = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0); // Primera hoja
            boolean primeraFila = true;
            for (Row fila : sheet) {
                if (primeraFila) {
                    primeraFila = false; // Saltar encabezados
                    continue;
                }
                if (fila.getPhysicalNumberOfCells() >= 2) {
                    UserDTO usuario = new UserDTO();
                    // Nombre (columna A)
                    Cell celdaNombre = fila.getCell(0);
                    if (celdaNombre != null) {
                        usuario.setName(obtenerValorCelda(celdaNombre));
                    }
                    // Email (columna B)
                    Cell celdaEmail = fila.getCell(1);
                    if (celdaEmail != null) {
                        usuario.setEmail(obtenerValorCelda(celdaEmail));
                    }
                    // ContraseÃ±a (columna C) - opcional
                    Cell celdaPassword = fila.getCell(2);
                    if (celdaPassword != null && !obtenerValorCelda(celdaPassword).trim().isEmpty()) {
                        usuario.setPassword(obtenerValorCelda(celdaPassword));
                    }
                    // Rol (columna D) - opcional
                    Cell celdaRol = fila.getCell(3);
                    if (celdaRol != null) {
                        try {
                            String valorRol = obtenerValorCelda(celdaRol);
                            if (!valorRol.trim().isEmpty()) {
                                usuario.setIdRole(Long.parseLong(valorRol));
                            }
                        } catch (NumberFormatException e) {
                            // Usar rol por defecto si no es vÃ¡lido
                        }
                    }
                    if (usuario.getName() != null && !usuario.getName().trim().isEmpty() &&
                            usuario.getEmail() != null && !usuario.getEmail().trim().isEmpty()) {
                        usuarios.add(usuario);
                    }
                }
            }
        }
        return usuarios;
    }

    /**
     * Obtener valor de celda como String
     */
    private String obtenerValorCelda(Cell celda) {
        if (celda == null) {
            return "";
        }
        switch (celda.getCellType()) {
            case STRING:
                return celda.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(celda)) {
                    return celda.getDateCellValue().toString();
                } else {
                    // Para nÃºmeros enteros, quitar decimales
                    double numero = celda.getNumericCellValue();
                    if (numero == (long) numero) {
                        return String.valueOf((long) numero);
                    } else {
                        return String.valueOf(numero);
                    }
                }
            case BOOLEAN:
                return String.valueOf(celda.getBooleanCellValue());
            case FORMULA:
                return celda.getCellFormula();
            default:
                return "";
        }
    }

    // ========== CARGA MASIVA DE PRODUCTOS ==========
    /**
     * Endpoint para cargar productos masivamente desde archivo CSV o Excel
     */
    @PostMapping("/upload-products")
    @ResponseBody
    public ResponseEntity<?> cargarProductosDesdeArchivo(
            @RequestParam("archivo") MultipartFile archivo,
            HttpSession session) {
        try {
            // OBTENER USUARIO DE LA SESIÃ"N
            User userSession = (User) session.getAttribute("user");
            if (userSession == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of(
                                "success", false,
                                "message", "Sesion expirada. Debe iniciar sesion para cargar productos"));
            }

            // VALIDAR QUE EL USUARIO TENGA DATOS COMPLETOS
            if (userSession.getAddress() == null || userSession.getAddress().trim().isEmpty() ||
                    userSession.getPhone() == null || userSession.getPhone().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message",
                                "Debe completar su información de perfil (dirección y teléfono) antes de poder cargar productos masivamente",
                                "redirectTo", "/actualizacionUsuario"));
            }

            Long currentUserId = userSession.getId();

            // Validar que se enviÃ³ un archivo
            if (archivo.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "No se ha seleccionado ningÃºn archivo"));
            }
            // Validar tipo de archivo
            String nombreArchivo = archivo.getOriginalFilename();
            if (nombreArchivo == null || (!nombreArchivo.endsWith(".csv") &&
                    !nombreArchivo.endsWith(".xlsx") && !nombreArchivo.endsWith(".xls"))) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "Formato de archivo no soportado. Use CSV o Excel (.xlsx, .xls)"));
            }
            List<ProductDTO> productosCargados = new ArrayList<>();
            int productosCreados = 0;
            int productosDuplicados = 0;
            List<String> errores = new ArrayList<>();
            if (nombreArchivo.endsWith(".csv")) {
                productosCargados = procesarArchivoProductosCSV(archivo.getInputStream());
            } else {
                productosCargados = procesarArchivoProductosExcel(archivo.getInputStream());
            }
            // Procesar cada producto del archivo
            for (int i = 0; i < productosCargados.size(); i++) {
                ProductDTO producto = productosCargados.get(i);
                try {
                    // Validar datos bÃ¡sicos
                    if (producto.getNameProduct() == null || producto.getNameProduct().trim().isEmpty()) {
                        errores.add("Fila " + (i + 2) + ": Nombre del producto requerido");
                        continue;
                    }
                    if (producto.getPrice() == null || producto.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                        errores.add("Fila " + (i + 2) + ": Precio vÃ¡lido requerido");
                        continue;
                    }
                    if (producto.getCategory() == null || producto.getCategory().trim().isEmpty()) {
                        errores.add("Fila " + (i + 2) + ": CategorÃ­a requerida");
                        continue;
                    }
                    // Asignar valores por defecto si no estÃ¡n presentes
                    if (producto.getUnit() == null || producto.getUnit().trim().isEmpty()) {
                        producto.setUnit("Unidad");
                    }
                    if (producto.getImageProduct() == null || producto.getImageProduct().trim().isEmpty()) {
                        producto.setImageProduct("default-product.png");
                    }
                    if (producto.getDescriptionProduct() == null || producto.getDescriptionProduct().trim().isEmpty()) {
                        producto.setDescriptionProduct("Producto sin descripciÃ³n");
                    }
                    if (producto.getPublicationDate() == null) {
                        producto.setPublicationDate(LocalDate.now());
                    }
                    // ASIGNAR USUARIO ACTUAL DE LA SESIÃ“N
                    if (producto.getUserId() == null) {
                        producto.setUserId(currentUserId);
                    }
                    // Verificar si el producto ya existe para este usuario
                    boolean existe = verificarProductoExistente(
                            producto.getNameProduct().trim(),
                            producto.getCategory().trim(),
                            currentUserId);
                    if (existe) {
                        productosDuplicados++;
                        continue;
                    }
                    // Crear el producto usando el servicio
                    crearProductoDesdeDTO(producto);
                    productosCreados++;
                } catch (Exception e) {
                    errores.add("Fila " + (i + 2) + ": " + e.getMessage());
                }
            }
            // Preparar respuesta
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("success", true);
            respuesta.put("message", "Procesamiento de productos completado");
            respuesta.put("productosCreados", productosCreados);
            respuesta.put("productosDuplicados", productosDuplicados);
            respuesta.put("totalProcesados", productosCargados.size());
            respuesta.put("errores", errores);
            respuesta.put("needsRefresh", productosCreados > 0);
            respuesta.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error al procesar el archivo: " + e.getMessage()));
        }
    }

    /**
     * Procesar archivo CSV de productos
     */
    private List<ProductDTO> procesarArchivoProductosCSV(InputStream inputStream) throws IOException {
        List<ProductDTO> productos = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String linea;
            boolean primeraLinea = true;

            while ((linea = reader.readLine()) != null) {
                if (primeraLinea) {
                    primeraLinea = false; // Saltar encabezados
                    continue;
                }
                String[] campos = linea.split(",");
                if (campos.length >= 6) {
                    ProductDTO producto = new ProductDTO();
                    producto.setNameProduct(campos[0].trim());
                    try {
                        producto.setPrice(new BigDecimal(campos[1].trim()));
                    } catch (NumberFormatException e) {
                        continue; // Saltar fila con precio inválido
                    }
                    producto.setCategory(campos[2].trim());
                    producto.setUnit(campos[3].trim());
                    producto.setDescriptionProduct(campos[4].trim());
                    producto.setImageProduct(campos[5].trim());

                    // Agregar stock si está disponible (columna 6)
                    if (campos.length > 6 && !campos[6].trim().isEmpty()) {
                        try {
                            producto.setStock(Integer.parseInt(campos[6].trim()));
                        } catch (NumberFormatException e) {
                            producto.setStock(0); // Stock por defecto si no se puede parsear
                        }
                    } else {
                        producto.setStock(0); // Stock por defecto
                    }

                    producto.setPublicationDate(LocalDate.now());
                    productos.add(producto);
                }
            }
        }
        return productos;
    }

    /**
     * Procesar archivo Excel de productos
     */
    private List<ProductDTO> procesarArchivoProductosExcel(InputStream inputStream) throws IOException {
        List<ProductDTO> productos = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            boolean primeraFila = true;
            for (Row row : sheet) {
                if (primeraFila) {
                    primeraFila = false; // Saltar encabezados
                    continue;
                }
                if (row.getPhysicalNumberOfCells() >= 6) {
                    ProductDTO producto = new ProductDTO();
                    Cell nombreCell = row.getCell(0);
                    if (nombreCell != null) {
                        producto.setNameProduct(obtenerValorCelda(nombreCell));
                    }
                    Cell precioCell = row.getCell(1);
                    if (precioCell != null) {
                        try {
                            String valorPrecio = obtenerValorCelda(precioCell);
                            if (!valorPrecio.trim().isEmpty()) {
                                producto.setPrice(new BigDecimal(valorPrecio));
                            }
                        } catch (NumberFormatException e) {
                            continue; // Saltar fila con precio invÃ¡lido
                        }
                    }
                    Cell categoriaCell = row.getCell(2);
                    if (categoriaCell != null) {
                        producto.setCategory(obtenerValorCelda(categoriaCell));
                    }
                    Cell unidadCell = row.getCell(3);
                    if (unidadCell != null) {
                        producto.setUnit(obtenerValorCelda(unidadCell));
                    }
                    Cell descripcionCell = row.getCell(4);
                    if (descripcionCell != null) {
                        producto.setDescriptionProduct(obtenerValorCelda(descripcionCell));
                    }
                    Cell imagenCell = row.getCell(5);
                    if (imagenCell != null) {
                        producto.setImageProduct(obtenerValorCelda(imagenCell));
                    }

                    // Agregar stock si está disponible (columna 6)
                    Cell stockCell = row.getCell(6);
                    if (stockCell != null) {
                        try {
                            String valorStock = obtenerValorCelda(stockCell);
                            if (!valorStock.trim().isEmpty()) {
                                producto.setStock(Integer.parseInt(valorStock.trim()));
                            } else {
                                producto.setStock(0); // Stock por defecto
                            }
                        } catch (NumberFormatException e) {
                            producto.setStock(0); // Stock por defecto si no se puede parsear
                        }
                    } else {
                        producto.setStock(0); // Stock por defecto
                    }

                    producto.setPublicationDate(LocalDate.now());
                    // Validar que los campos obligatorios no estén vacíos
                    if (producto.getNameProduct() != null && !producto.getNameProduct().trim().isEmpty() &&
                            producto.getPrice() != null &&
                            producto.getCategory() != null && !producto.getCategory().trim().isEmpty()) {
                        productos.add(producto);
                    }
                }
            }
        }
        return productos;
    }

    /**
     * Verificar si un producto ya existe por nombre y categorÃ­a
     */
    private boolean verificarProductoExistente(String nombre, String categoria, Long userId) {
        try {
            return productService.existeProductoPorUsuario(nombre, categoria, userId);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Crear producto desde DTO usando ProductService
     */
    private void crearProductoDesdeDTO(ProductDTO producto) {
        try {
            // Usar ProductService para crear el producto en la base de datos
            productService.crearProduct(producto, producto.getUserId());
        } catch (Exception e) {
            throw e; // Re-lanzar la excepciÃ³n para que sea manejada en el bucle principal
        }
    }

    @GetMapping("/products/refresh")
    @ResponseBody
    public ResponseEntity<List<ProductDTO>> obtenerProductosActualizados() {
        try {
            List<ProductDTO> productos = productService.listarProducts();
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }

    @GetMapping("/admin/migrate-passwords")
    public String migratePasswords() {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            // Solo hashear si NO estÃ¡ hasheada (BCrypt empieza con $2a$)
            if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
                String hashedPassword = passwordEncoder.encode(user.getPassword());
                user.setPassword(hashedPassword);
                userRepository.save(user);
            }
        }
        return "redirect:/DashboardAdmin";
    }

    @PostMapping("/actualizarDatos")
    public String actualizarDatos(
            @RequestParam String name,
            @RequestParam String address,
            HttpSession session,
            RedirectAttributes redirectAttributes) {
        try {
            User currentUser = (User) session.getAttribute("user");
            if (currentUser == null) {
                redirectAttributes.addFlashAttribute("error", "Usuario no autenticado.");
                return "redirect:/login";
            }
            User user = userRepository.findById(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));
            user.setName(name);
            user.setAddress(address);
            userRepository.save(user);
            session.setAttribute("user", user);
            redirectAttributes.addFlashAttribute("success", "InformaciÃ³n actualizada exitosamente.");
            return "redirect:/actualizacionUsuario";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error al actualizar la informaciÃ³n");
            return "redirect:/actualizacionUsuario";
        }
    }

    @PostMapping("/ActualizarContacto")
    public String actualizarContacto(
            @RequestParam String email,
            @RequestParam(required = false) String phone,
            HttpSession session,
            RedirectAttributes redirectAttributes) {
        try {
            User currentUser = (User) session.getAttribute("user");
            if (currentUser == null) {
                redirectAttributes.addFlashAttribute("error", "Sesion expirada");
                return "redirect:/login";
            }
            // Validar telefono
            if (phone != null && !phone.trim().isEmpty()) {
                // Esto eliminar espacion y caracteres no numericos
                String phoneClean = phone.replaceAll("[^0-9]", "");
                if (phoneClean.length() != 10) {
                    redirectAttributes.addFlashAttribute("error", "El nÃºmero de telÃ©fono debe tener 10 dÃ­gitos");
                    return "redirect:/actualizacionUsuario";
                }
                phone = phoneClean; // Asignar el telefono limpio
            }
            // Verificar si el email ya estÃ¡ en uso por otro usuario
            if (!currentUser.getEmail().equals(email) &&
                    userRepository.findByEmail(email).isPresent()) {
                redirectAttributes.addFlashAttribute("error", "El email ya estÃ¡ registrado");
                return "redirect:/actualizacionUsuario";
            }
            User user = userRepository.findById(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            user.setEmail(email);
            user.setPhone(phone);
            userRepository.save(user);
            session.setAttribute("user", user);
            redirectAttributes.addFlashAttribute("success", "Contacto actualizado correctamente");
            return "redirect:/actualizacionUsuario";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error al actualizar contacto");
            return "redirect:/actualizacionUsuario";
        }
    }

    @PostMapping("/ActualizarContrasena")
    public String actualizarContrasena(
            @RequestParam String currentPassword,
            @RequestParam String newPassword,
            @RequestParam String confirmPassword,
            HttpSession session,
            RedirectAttributes redirectAttributes) {
        try {
            User currentUser = (User) session.getAttribute("user");
            if (currentUser == null) {
                redirectAttributes.addFlashAttribute("error", "Sesion expirada");
                return "redirect:/login";
            }
            // Determinar la pagina de redireccion segun el rol
            String redirectPage = currentUser.getRole().getName().equals("Admin") ? "/actualizacionUsuarioAdmin"
                    : "/actualizacionUsuario";
            // Validar que las contraseñas nuevas coincidan
            if (!newPassword.equals(confirmPassword)) {
                redirectAttributes.addFlashAttribute("error", "Las contraseÃ±as no coinciden");
                return "redirect:" + redirectPage;
            }
            if (!passwordEncoder.matches(currentPassword, currentUser.getPassword())) {
                redirectAttributes.addFlashAttribute("error", "Contraseña actual incorrecta");
                return "redirect:" + redirectPage;
            }
            User user = userRepository.findById(currentUser.getId())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            session.setAttribute("user", user);
            redirectAttributes.addFlashAttribute("success", "Contraseña actualizada correctamente");
            return "redirect:" + redirectPage;
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Error al actualizar la contraseÃ±a");
            // En caso de error, intentar determinar el rol para redirigir correctamente
            User currentUser = (User) session.getAttribute("user");
            String redirectPage = (currentUser != null && currentUser.getRole().getName().equals("Admin"))
                    ? "/actualizacionUsuarioAdmin"
                    : "/actualizacionUsuario";
            return "redirect:" + redirectPage;
        }
    }
}
