package com.exe.Huerta_directa.Impl;
import com.exe.Huerta_directa.DTO.RoleDTO;
import com.exe.Huerta_directa.DTO.UserDTO;
import com.exe.Huerta_directa.Entity.Role;
import com.exe.Huerta_directa.Entity.User;
import com.exe.Huerta_directa.Repository.RoleRepository;
import com.exe.Huerta_directa.Repository.UserRepository;
import com.exe.Huerta_directa.Service.RoleService;
import com.exe.Huerta_directa.Service.UserService;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.transaction.Transactional;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.awt.Color;
import java.io.IOException;
import java.io.OutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;
    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository, RoleService roleService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.roleService = roleService;
        this.passwordEncoder = passwordEncoder;
    }
    public List<User> obtenerTodos() {
        return userRepository.findAll();
    }
    @Override
    public List<UserDTO> listarUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }
    @Override
    public UserDTO obtenerUserPorId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado por id: " + userId));
        return convertirADTO(user);
    }
    @Override
    public UserDTO crearUser(UserDTO userDTO) {
        User user = convertirAEntity(userDTO);
        // â­ HASHEAR la contraseÃ±a antes de guardar
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            String hashedPassword = passwordEncoder.encode(userDTO.getPassword());
            user.setPassword(hashedPassword);
        }
        User nuevoUser = userRepository.save(user);
        return convertirADTO(nuevoUser);
    }
    @Override
    public UserDTO actualizarUser(Long userId, UserDTO userDTO) {
        User userExistente = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado por id: " + userId));
        actualizarDatosPersona(userExistente, userDTO);
        // â­ Solo hashear si la contraseÃ±a cambiÃ³ (no estÃ¡ vacÃ­a)
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            String hashedPassword = passwordEncoder.encode(userDTO.getPassword());
            userExistente.setPassword(hashedPassword);
        }
        User userActualizado = userRepository.save(userExistente);
        return convertirADTO(userActualizado);
    }
    @Override
    @Transactional
    public void eliminarUserPorId(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Usuario no encontrado por id: " + userId);
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado por id: " + userId));
        if (user.getProducts() != null && !user.getProducts().isEmpty()) {
            throw new RuntimeException("No se puede eliminar este usuario porque tiene " +
                    user.getProducts().size() + " producto(s) asociado(s). " +
                    "Elimine primero los productos o reasÃ­gnelos a otro usuario.");
        }
        userRepository.deleteById(userId);
    }
    //DE AUTENTICACIÃ“N CON BCRYPT
    @Override
    public UserDTO autenticarUsuario(String email, String password) {
        // Buscar usuario por email
        User user = userRepository.findByEmail(email)
                .orElse(null);
        if (user == null) {
            return null;
        }
        // â­ Verificar la contraseÃ±a hasheada con BCrypt
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return null;
        }
        // Convertir a DTO y devolver
        return convertirADTO(user);
    }
    @Override
    public UserDTO crearAdmin(UserDTO userDTO) {
        // Obtener el rol admin (id = 1)
        RoleDTO roleAdmin = roleService.obtenerRolePorId(1L);
        userDTO.setIdRole(roleAdmin.getIdRole());
        // â­ La contraseÃ±a se hashearÃ¡ automÃ¡ticamente en crearUser()
        return crearUser(userDTO);
    }
    // ========== MÃ‰TODOS PRIVADOS ==========
    private UserDTO convertirADTO(User user) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setEmail(user.getEmail());
        // NO incluir la contraseÃ±a en el DTO
        userDTO.setPassword(null);
        userDTO.setPhone(user.getPhone());
        userDTO.setAddress(user.getAddress());
        userDTO.setCreacionDate(user.getCreacionDate());
        // âœ… NUEVOS CAMPOS - IMPORTANTE
        userDTO.setGender(user.getGender());
        userDTO.setBirthDate(user.getBirthDate());
        userDTO.setProfileImageUrl(user.getProfileImageUrl());
        if (user.getRole() != null) {
            userDTO.setIdRole(user.getRole().getIdRole());
        } else {
            userDTO.setIdRole(null);
        }
        return userDTO;
    }
    private User convertirAEntity(UserDTO userDTO) {
        User user = new User();
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setPassword(userDTO.getPassword()); // Se hashearÃ¡ en crearUser()
        user.setPhone(userDTO.getPhone());
        user.setAddress(userDTO.getAddress());
        // âœ… NUEVOS CAMPOS - IMPORTANTE
        user.setGender(userDTO.getGender());
        user.setBirthDate(userDTO.getBirthDate());
        user.setProfileImageUrl(userDTO.getProfileImageUrl());
        // CORRECCIÃ“N: Establecer fecha actual si no existe
        if (user.getCreacionDate() == null) {
            user.setCreacionDate(LocalDate.now());
        }
        if (userDTO.getIdRole() != null) {
            Role role = roleRepository.findById(userDTO.getIdRole())
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado con id: " + userDTO.getIdRole()));
            user.setRole(role);
        } else {
            // Rol por defecto: Cliente (ID 2)
            Role defaultRole = roleRepository.findById(2L)
                    .orElseThrow(() -> new RuntimeException(
                            "Rol por defecto con ID 2 ('cliente') no encontrado."));
            user.setRole(defaultRole);
        }
        return user;
    }
    private void actualizarDatosPersona(User user, UserDTO userDTO) {
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setPhone(userDTO.getPhone());
        user.setAddress(userDTO.getAddress());
        // âœ… NUEVOS CAMPOS - IMPORTANTE
        user.setGender(userDTO.getGender());
        user.setBirthDate(userDTO.getBirthDate());
        user.setProfileImageUrl(userDTO.getProfileImageUrl());
        // La contraseÃ±a se hashearÃ¡ en actualizarUser() si no estÃ¡ vacÃ­a
        // NO hashear aquÃ­ para evitar hashear dos veces
        if (userDTO.getIdRole() != null) {
            Role role = roleRepository.findById(userDTO.getIdRole())
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado con id: " + userDTO.getIdRole()));
            user.setRole(role);
        } else {
            throw new RuntimeException("El idRole no puede ser nulo");
        }
    }
    // ========== EXPORTACIÃ“N ==========
    @Override
    public void exporUserstToExcel(OutputStream outputStream) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Users");
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("User ID");
        headerRow.createCell(1).setCellValue("Name");
        headerRow.createCell(2).setCellValue("Email");
        headerRow.createCell(3).setCellValue("GÃ©nero");
        headerRow.createCell(4).setCellValue("Fecha Nacimiento");
        headerRow.createCell(5).setCellValue("TelÃ©fono");
        headerRow.createCell(6).setCellValue("Role");
        List<User> users = obtenerTodos();
        int rowNum = 1;
        for (User user : users) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(user.getId());
            row.createCell(1).setCellValue(user.getName());
            row.createCell(2).setCellValue(user.getEmail());
            row.createCell(3).setCellValue(obtenerGeneroTexto(user.getGender()));
            row.createCell(4).setCellValue(user.getBirthDate() != null ? user.getBirthDate().toString() : "N/A");
            row.createCell(5).setCellValue(user.getPhone() != null ? user.getPhone() : "N/A");
            String roleName = (user.getRole() != null) ? user.getRole().getName() : "No Role Assigned";
            row.createCell(6).setCellValue(roleName);
        }
        for (int i = 0; i < 7; i++) {
            sheet.autoSizeColumn(i);
        }
        try {
            workbook.write(outputStream);
        } finally {
            workbook.close();
        }
    }
    @Override
    public void exportUsersToPdf(OutputStream outputStream) throws IOException {
        Document document = new Document();
        try {
            PdfWriter.getInstance(document, outputStream);
            document.open();
            // TÃ­tulo
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.GREEN.darker());
            Paragraph title = new Paragraph("HUERTA DIRECTA", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            // SubtÃ­tulo
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.BLACK);
            Paragraph subtitle = new Paragraph("Reporte de Usuarios", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(10);
            document.add(subtitle);
            // Info del reporte
            Font infoFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            String currentDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
            List<User> users = obtenerTodos();
            Paragraph reportInfo = new Paragraph("Fecha de generaciÃ³n: " + currentDate +
                    " | Total de registros: " + users.size(), infoFont);
            reportInfo.setAlignment(Element.ALIGN_RIGHT);
            reportInfo.setSpacingAfter(20);
            document.add(reportInfo);
            if (users.isEmpty()) {
                Font noDataFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.RED);
                Paragraph noData = new Paragraph("No se encontraron usuarios registrados.", noDataFont);
                noData.setAlignment(Element.ALIGN_CENTER);
                noData.setSpacingBefore(50);
                document.add(noData);
            } else {
                // Tabla
                PdfPTable table = new PdfPTable(7);
                table.setWidthPercentage(100);
                table.setSpacingBefore(10f);
                table.setSpacingAfter(10f);
                float[] columnWidths = { 1f, 2f, 3f, 1.5f, 2f, 2f, 1.5f };
                table.setWidths(columnWidths);
                Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.WHITE);
                addTableHeader(table, "ID", headerFont);
                addTableHeader(table, "Nombre", headerFont);
                addTableHeader(table, "Email", headerFont);
                addTableHeader(table, "GÃ©nero", headerFont);
                addTableHeader(table, "Fecha Nac.", headerFont);
                addTableHeader(table, "TelÃ©fono", headerFont);
                addTableHeader(table, "Rol", headerFont);
                Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
                int rowCount = 0;
                for (User user : users) {
                    rowCount++;
                    Color rowColor = (rowCount % 2 == 0) ? new Color(240, 240, 240) : Color.WHITE;
                    addTableCell(table, String.valueOf(user.getId()), dataFont, rowColor, Element.ALIGN_CENTER);
                    addTableCell(table, user.getName() != null ? user.getName() : "N/A", dataFont, rowColor,
                            Element.ALIGN_LEFT);
                    addTableCell(table, user.getEmail() != null ? user.getEmail() : "N/A", dataFont, rowColor,
                            Element.ALIGN_LEFT);
                    addTableCell(table, obtenerGeneroTexto(user.getGender()), dataFont, rowColor, Element.ALIGN_CENTER);
                    addTableCell(table, user.getBirthDate() != null ? user.getBirthDate().toString() : "N/A", dataFont, rowColor,
                            Element.ALIGN_CENTER);
                    addTableCell(table, user.getPhone() != null ? user.getPhone() : "N/A", dataFont, rowColor,
                            Element.ALIGN_CENTER);
                    String roleName = (user.getRole() != null) ? user.getRole().getName() : "Sin Rol";
                    addTableCell(table, roleName, dataFont, rowColor, Element.ALIGN_CENTER);
                }
                document.add(table);
                // EstadÃ­sticas
                Map<String, Long> usersByRole = users.stream()
                        .collect(Collectors.groupingBy(
                                user -> user.getRole() != null && user.getRole().getName() != null
                                        ? user.getRole().getName()
                                        : "Sin Rol",
                                Collectors.counting()));
                // EstadÃ­sticas por gÃ©nero
                Map<String, Long> usersByGender = users.stream()
                        .filter(u -> u.getGender() != null)
                        .collect(Collectors.groupingBy(
                                user -> obtenerGeneroTexto(user.getGender()),
                                Collectors.counting()));
                if (!usersByRole.isEmpty() || !usersByGender.isEmpty()) {
                    document.add(new Paragraph(" "));
                    Font statsFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK);
                    Paragraph statsTitle = new Paragraph("EstadÃ­sticas:", statsFont);
                    statsTitle.setSpacingBefore(20);
                    document.add(statsTitle);
                    Font statsDataFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
                    // EstadÃ­sticas por rol
                    if (!usersByRole.isEmpty()) {
                        Paragraph roleTitle = new Paragraph("Por Rol:", statsDataFont);
                        roleTitle.setSpacingBefore(10);
                        document.add(roleTitle);
                        for (Map.Entry<String, Long> entry : usersByRole.entrySet()) {
                            Paragraph statLine = new Paragraph(
                                    "â€¢ " + entry.getKey() + ": " + entry.getValue() + " usuario(s)", statsDataFont);
                            statLine.setIndentationLeft(20);
                            document.add(statLine);
                        }
                    }
                    // EstadÃ­sticas por gÃ©nero
                    if (!usersByGender.isEmpty()) {
                        Paragraph genderTitle = new Paragraph("Por GÃ©nero:", statsDataFont);
                        genderTitle.setSpacingBefore(10);
                        document.add(genderTitle);
                        for (Map.Entry<String, Long> entry : usersByGender.entrySet()) {
                            Paragraph statLine = new Paragraph(
                                    "â€¢ " + entry.getKey() + ": " + entry.getValue() + " usuario(s)", statsDataFont);
                            statLine.setIndentationLeft(20);
                            document.add(statLine);
                        }
                    }
                }
            }
            // Footer
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, Color.GRAY);
            Paragraph footer = new Paragraph("Reporte generado automÃ¡ticamente por el sistema Huerta Directa",
                    footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(30);
            document.add(footer);
        } catch (DocumentException e) {
            throw new IOException("Error al crear el documento PDF: " + e.getMessage(), e);
        } finally {
            if (document.isOpen()) {
                document.close();
            }
        }
    }
    // MÃ©todo auxiliar para obtener texto del gÃ©nero
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
    private void addTableHeader(PdfPTable table, String headerTitle, Font font) {
        PdfPCell header = new PdfPCell();
        header.setBackgroundColor(new Color(67, 160, 71));
        header.setBorderWidth(1);
        header.setPhrase(new Phrase(headerTitle, font));
        header.setHorizontalAlignment(Element.ALIGN_CENTER);
        header.setVerticalAlignment(Element.ALIGN_MIDDLE);
        header.setPadding(8);
        table.addCell(header);
    }
    private void addTableCell(PdfPTable table, String text, Font font, Color backgroundColor, int alignment) {
        PdfPCell cell = new PdfPCell();
        cell.setPhrase(new Phrase(text, font));
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBackgroundColor(backgroundColor);
        cell.setPadding(5);
        cell.setBorderWidth(1);
        table.addCell(cell);
    }
}
