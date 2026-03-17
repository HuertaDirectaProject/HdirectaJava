package com.exe.Huerta_directa.Controllers;

import com.exe.Huerta_directa.DTO.UserDTO;
import com.exe.Huerta_directa.Entity.User;
import com.exe.Huerta_directa.Repository.UserRepository;
import com.exe.Huerta_directa.Service.UserService;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.Period;
import java.util.Properties;
import java.util.Random;
import java.security.SecureRandom;
import java.util.UUID;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller
@RequestMapping("/api/login")

public class LoginController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    @Value("${upload.path:C:/HuertaUploads}")
    private String uploadPath;
    // logger
    private static final Logger log = LoggerFactory.getLogger(LoginController.class);

    public LoginController(UserService userService, PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    private static final String EMAIL_HOST = "smtp.gmail.com";
    private static final String EMAIL_PORT = "587";
    private static final String SENDER_EMAIL = "hdirecta@gmail.com";
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\d{10}$");
    private static final Pattern ADDRESS_PATTERN = Pattern.compile("^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\\s#.,\\-_/()]+$");
    private static final int EMAIL_CODE_LENGTH = 6;
    private static final long EMAIL_CODE_TTL_SECONDS = 300L;
    private static final int EMAIL_MAX_ATTEMPTS = 5;
    private static final SecureRandom OTP_RANDOM = new SecureRandom();
    // Nota: la contraseña de aplicación idealmente debe guardarse en
    // properties/secret manager
    @Value("${mail.sender.password}")
    private String SENDER_PASSWORD;

    // Metodo para crear la sesion de correo
    private Session crearSesionCorreo() {
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", EMAIL_HOST);
        props.put("mail.smtp.port", EMAIL_PORT);
        props.put("mail.smtp.ssl.trust", EMAIL_HOST);
        return Session.getInstance(props, new Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(SENDER_EMAIL, SENDER_PASSWORD);
            }
        });
    }

    /**
     * Endpoint para registro de usuarios
     * Acepta JSON desde React y retorna respuesta JSON
     */
    @PostMapping("/register")
    @ResponseBody
    public ResponseEntity<?> registerUser(@RequestBody UserDTO userDTO, HttpSession session) {
        log.info("Intento de registro para el email: {}", userDTO.getEmail());
        
        try {
            // Validar datos básicos
            if (userDTO.getEmail() == null || userDTO.getEmail().isBlank()) {
                return ResponseEntity
                        .badRequest()
                        .body(new ErrorResponse("El correo electrónico es requerido"));
            }

            if (userDTO.getName() == null || userDTO.getName().isBlank()) {
                return ResponseEntity
                        .badRequest()
                        .body(new ErrorResponse("El nombre es requerido"));
            }

            if (userDTO.getPassword() == null || userDTO.getPassword().isBlank()) {
                return ResponseEntity
                        .badRequest()
                        .body(new ErrorResponse("La contraseña es requerida"));
            }

            // Validar edad
            if (userDTO.getBirthDate() != null) {
                LocalDate today = LocalDate.now();
                Period age = Period.between(userDTO.getBirthDate(), today);

                if (age.getYears() < 18) {
                    log.warn("Intento de registro de menor de edad: {}", userDTO.getEmail());
                    return ResponseEntity
                            .badRequest()
                            .body(new ErrorResponse("Debes ser mayor de 18 años para registrarte"));
                }
            }

            // Crear usuario
            UserDTO usuarioCreado = userService.crearUser(userDTO);
            log.info("Usuario creado exitosamente: {}", usuarioCreado.getEmail());

            // Buscar el usuario creado
            User userEntity = userRepository
                    .findByEmail(usuarioCreado.getEmail())
                    .orElse(null);

            if (userEntity != null) {
                session.setAttribute("user", userEntity);
                session.setAttribute("userId", userEntity.getId());
                session.setAttribute("userRole", userEntity.getRole() != null ? userEntity.getRole().getIdRole() : null);
            }

            // Enviar correo de confirmación (asíncrono para no bloquear)
            try {
                enviarCorreoConfirmacion(usuarioCreado.getName(), usuarioCreado.getEmail());
                log.info("Correo de confirmación enviado a: {}", usuarioCreado.getEmail());
            } catch (Exception e) {
                log.warn("No se pudo enviar el correo de confirmación a: {}", usuarioCreado.getEmail(), e);
            }

            // Preparar respuesta
            UserResponse response = new UserResponse();
            response.setId(usuarioCreado.getId());
            response.setName(usuarioCreado.getName());
            response.setEmail(usuarioCreado.getEmail());
            response.setIdRole(usuarioCreado.getIdRole());
            response.setProfileImageUrl(usuarioCreado.getProfileImageUrl());
            response.setMessage("Registro exitoso");

            return ResponseEntity.ok(response);

        } catch (DataIntegrityViolationException e) {
            log.warn("Intento de registro con correo duplicado: {}", userDTO.getEmail());
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("El correo electrónico ya está registrado"));

        } catch (Exception e) {
            log.error("Error al crear la cuenta para: {}", userDTO.getEmail(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error al crear la cuenta: " + e.getMessage()));
        }
    }

    // Metodo para enviar correo de confirmacion de que si se registro
    private void enviarCorreoConfirmacion(String nombre, String email) throws MessagingException {
        Session session = crearSesionCorreo();
        MimeMessage message = new MimeMessage(session);
        message.setFrom(new InternetAddress(SENDER_EMAIL));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(email));
        message.setSubject("Registro exitoso en Huerta Directa");
        // Crear el contenido HTML del correo
        String htmlContent = crearContenidoHTMLCorreo(nombre);
        // Configurar el mensaje como HTML
        message.setContent(htmlContent, "text/html; charset=utf-8");
        Transport.send(message);
    }

    // CONTENIDO HTML DEL CORREO DE REGISTRO
    private String crearContenidoHTMLCorreo(String nombre) {
        return """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Bienvenido a Huerta Directa</title>
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
                                            Conectando el campo con tu mesa
                                        </p>
                                    </div>
                                    <!-- Contenido principal -->
                                    <div style="padding: 40px 30px;">
                                        <div style="text-align: center; margin-bottom: 30px;">
                                            <div style="background-color: #e8f5e8; border-radius: 50px; width: 80px; height: 80px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; font-size: 35px;">
                                                ✅
                                            </div>
                                            <h2 style="color: #2e7d32; margin: 0; font-size: 24px; font-weight: bold;">
                                                ¡Registro Exitoso!
                                            </h2>
                                        </div>
                                        <div style="text-align: center; margin-bottom: 30px;">
                                            <p style="color: #333333; font-size: 18px; line-height: 1.6; margin-bottom: 15px;">
                                                ¡Hola <strong style="color: #689f38;">%s</strong>! 👋
                                            </p>
                                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                                                Tu cuenta en <strong>Huerta Directa</strong> ha sido creada exitosamente.
                                                Ahora formas parte de nuestra comunidad que conecta directamente a productores
                                                campesinos con consumidores como tú.
                                            </p>
                                        </div>
                                        <!-- Beneficios -->
                                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                                            <h3 style="color: #2e7d32; margin: 0 0 20px 0; font-size: 18px; text-align: center;">
                                                ¿Qué puedes hacer ahora?
                                            </h3>
                                            <div style="text-align: left;">
                                                <p style="color: #555555; margin: 8px 0; font-size: 14px;">
                                                    🥕 <strong>Explorar productos frescos</strong> directamente de la huerta
                                                </p>
                                                <p style="color: #555555; margin: 8px 0; font-size: 14px;">
                                                    🚚 <strong>Realizar pedidos</strong> con entrega a domicilio
                                                </p>
                                                <p style="color: #555555; margin: 8px 0; font-size: 14px;">
                                                    👨‍🌾 <strong>Conocer a los productores</strong> detrás de tus alimentos
                                                </p>
                                                <p style="color: #555555; margin: 8px 0; font-size: 14px;">
                                                    💚 <strong>Apoyar la agricultura local</strong> y sostenible
                                                </p>
                                            </div>
                                        </div>
                                        <!-- Botón de acción -->
                                        <div style="text-align: center; margin-bottom: 30px;">
                                            <a href="#" style="display: inline-block; background: linear-gradient(135deg, #689f38 0%%, #8bc34a 100%%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(104, 159, 56, 0.3); transition: all 0.3s ease;">
                                                🌟 Comenzar a Explorar
                                            </a>
                                        </div>
                                        <!-- Mensaje de agradecimiento -->
                                        <div style="text-align: center; border-top: 2px solid #e8f5e8; padding-top: 25px;">
                                            <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">
                                                Gracias por unirte a nuestra misión de acercar el campo a tu mesa.<br>
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
                .formatted(nombre);
    }

    /**
     * Endpoint para login de usuarios
     * Acepta JSON desde React y retorna respuesta JSON
     */
    @PostMapping("/loginUser")
    @ResponseBody
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest, HttpSession session) {
        log.info("Intento de login para el email: {}", loginRequest.getEmail());
        
        try {
            // Validar que los datos no estén vacíos
            if (loginRequest.getEmail() == null || loginRequest.getEmail().isBlank()) {
                log.warn("Email vacío en el intento de login");
                return ResponseEntity
                        .badRequest()
                        .body(new ErrorResponse("El correo electrónico es requerido"));
            }

            if (loginRequest.getPassword() == null || loginRequest.getPassword().isBlank()) {
                log.warn("Contraseña vacía en el intento de login");
                return ResponseEntity
                        .badRequest()
                        .body(new ErrorResponse("La contraseña es requerida"));
            }

            // Buscar usuario por email
            User user = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);

            if (user == null) {
                log.warn("Usuario no encontrado con email: {}", loginRequest.getEmail());
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Correo o contraseña incorrectos"));
            }

            // Validar contraseña
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                log.warn("Contraseña incorrecta para el usuario: {}", loginRequest.getEmail());
                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Correo o contraseña incorrectos"));
            }

            log.info("Login exitoso para el usuario: {} con rol: {}",
                    user.getEmail(),
                    user.getRole() != null ? user.getRole().getIdRole() : "sin rol");

            // ============================================================================
            // VERIFICACIÓN 2FA ACTIVADA
            // ============================================================================
            // Flujo de verificación en 2 pasos: el usuario elige el canal (correo/teléfono)
            // y recibe un código de verificación antes de completar el login
            // ============================================================================

            session.setAttribute("pendingUser", user);
            clearPendingEmailCode(session);

            LoginResponse verifyResponse = new LoginResponse();
            verifyResponse.setStatus("choose-channel");
            verifyResponse.setMessage("Selecciona cómo deseas recibir el código");
            verifyResponse.setMaskedEmail(maskEmail(user.getEmail()));
            verifyResponse.setHasPhone(user.getPhone() != null && !user.getPhone().isBlank());
            return ResponseEntity.ok(verifyResponse);

            // ============================================================================
            // LOGIN DIRECTO (DESACTIVADO - Solo usar para presentaciones sin 2FA)
            // ============================================================================
            // session.setAttribute("user", user);
            // session.setAttribute("userId", user.getId());
            // session.setAttribute("userRole", user.getRole() != null ? user.getRole().getIdRole() : null);
            //
            // LoginResponse response = new LoginResponse();
            // response.setStatus("success");
            // response.setMessage("Login exitoso");
            // response.setId(user.getId());
            // response.setName(user.getName());
            // response.setEmail(user.getEmail());
            // response.setIdRole(user.getRole() != null ? user.getRole().getIdRole() : null);
            // response.setRedirect(getRedirectUrlByRole(user.getRole() != null ? user.getRole().getIdRole() : null));
            //
            // return ResponseEntity.ok(response);
            // ============================================================================

        } catch (Exception e) {
            log.error("Error inesperado en login para usuario: {}", loginRequest.getEmail(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error al iniciar sesión: " + e.getMessage()));
        }
    }

    // =========================
    // GESTIÓN DE SESIÓN
    // =========================
    
    /**
     * Verificar sesión actual del usuario
     */
    @GetMapping("/session")
    @ResponseBody
    public ResponseEntity<?> checkSession(HttpSession session) {
        User user = (User) session.getAttribute("user");
        
        if (user == null) {
            log.debug("No hay sesión activa");
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("No hay sesión activa"));
        }

        log.info("Sesión activa para el usuario: {} con rol: {}", 
                user.getEmail(), 
                user.getRole() != null ? user.getRole().getIdRole() : "sin rol");

        LoginResponse response = new LoginResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setIdRole(user.getRole() != null ? user.getRole().getIdRole() : null);
        response.setProfileImageUrl(user.getProfileImageUrl());
        response.setStatus("active");
        response.setMessage("Sesión activa");

        return ResponseEntity.ok(response);
    }

    /**
     * Cerrar sesión
     */
    @PostMapping("/logout")
    @ResponseBody
    public ResponseEntity<?> logout(HttpSession session) {
        User user = (User) session.getAttribute("user");
        
        if (user != null) {
            log.info("Cerrando sesión para el usuario: {}", user.getEmail());
        }
        
        session.invalidate();
        
        return ResponseEntity.ok(new MessageResponse("Sesión cerrada correctamente"));
    }

    /**
     * Confirmar login (endpoint legado, no permitido en 2FA)
     */
    @PostMapping("/complete-login")
    @ResponseBody
    public ResponseEntity<?> completeLogin(HttpSession session) {
        return ResponseEntity
                .status(HttpStatus.GONE)
                .body(new ErrorResponse("Este endpoint fue reemplazado por /api/login/verify-email"));
    }

    @PostMapping("/verify-email")
    @ResponseBody
    public ResponseEntity<?> verifyEmail(@RequestBody VerifyEmailRequest verifyRequest, HttpSession session) {
        User pendingUser = (User) session.getAttribute("pendingUser");
        String pendingCode = (String) session.getAttribute("pendingEmailCode");
        Long expiresAt = (Long) session.getAttribute("pendingEmailExpiresAt");
        Integer attempts = (Integer) session.getAttribute("pendingEmailAttempts");

        if (pendingUser == null || pendingCode == null || expiresAt == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("No hay verificación pendiente. Inicia sesión nuevamente."));
        }

        if (attempts != null && attempts >= EMAIL_MAX_ATTEMPTS) {
            clearPendingEmailSession(session);
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Superaste el número máximo de intentos. Inicia sesión nuevamente."));
        }

        if (verifyRequest == null || verifyRequest.getCode() == null || verifyRequest.getCode().isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("El código es requerido"));
        }

        String userCode = verifyRequest.getCode().trim();
        if (!userCode.matches("\\d{" + EMAIL_CODE_LENGTH + "}")) {
            return ResponseEntity.badRequest().body(new ErrorResponse("El código debe tener 6 dígitos"));
        }

        long nowEpoch = System.currentTimeMillis() / 1000;
        if (nowEpoch > expiresAt) {
            clearPendingEmailCode(session);
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("El código expiró. Solicita uno nuevo."));
        }

        if (!pendingCode.equals(userCode)) {
            int newAttempts = (attempts == null ? 0 : attempts) + 1;
            session.setAttribute("pendingEmailAttempts", newAttempts);
            int remaining = Math.max(0, EMAIL_MAX_ATTEMPTS - newAttempts);
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Código incorrecto. Intentos restantes: " + remaining));
        }

        session.setAttribute("user", pendingUser);
        session.setAttribute("userId", pendingUser.getId());
        session.setAttribute("userRole", pendingUser.getRole() != null ? pendingUser.getRole().getIdRole() : null);
        clearPendingEmailSession(session);

        LoginResponse response = new LoginResponse();
        response.setId(pendingUser.getId());
        response.setName(pendingUser.getName());
        response.setEmail(pendingUser.getEmail());
        response.setIdRole(pendingUser.getRole() != null ? pendingUser.getRole().getIdRole() : null);
        response.setProfileImageUrl(pendingUser.getProfileImageUrl());
        response.setStatus("success");
        response.setMessage("Login exitoso");

        if (pendingUser.getRole() != null && pendingUser.getRole().getIdRole() == 1) {
            response.setRedirect("/admin-dashboard");
        } else {
            response.setRedirect("/HomePage");
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/start-verification")
    @ResponseBody
    public ResponseEntity<?> startVerification(@RequestBody VerificationChannelRequest request, HttpSession session) {
        User pendingUser = (User) session.getAttribute("pendingUser");

        if (pendingUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("No hay verificación pendiente. Inicia sesión nuevamente."));
        }

        if (request == null || request.getChannel() == null || request.getChannel().isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Selecciona un canal de verificación"));
        }

        String channel = request.getChannel().trim().toLowerCase();
        if ("email".equals(channel)) {
            sendEmailVerificationCode(pendingUser, session);

            LoginResponse response = new LoginResponse();
            response.setStatus("verify-email");
            response.setMessage("Te enviamos un código al correo registrado");
            response.setMaskedEmail(maskEmail(pendingUser.getEmail()));
            response.setHasPhone(pendingUser.getPhone() != null && !pendingUser.getPhone().isBlank());
            return ResponseEntity.ok(response);
        }

        if ("sms".equals(channel)) {
            return ResponseEntity
                    .status(HttpStatus.NOT_IMPLEMENTED)
                    .body(new ErrorResponse("La verificación por celular estará disponible próximamente"));
        }

        return ResponseEntity.badRequest().body(new ErrorResponse("Canal no válido"));
    }

    @PostMapping("/resend-email")
    @ResponseBody
    public ResponseEntity<?> resendEmailCode(HttpSession session) {
        User pendingUser = (User) session.getAttribute("pendingUser");

        if (pendingUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("No hay verificación pendiente. Inicia sesión nuevamente."));
        }

        sendEmailVerificationCode(pendingUser, session);

        LoginResponse response = new LoginResponse();
        response.setStatus("verify-email");
        response.setMessage("Se envió un nuevo código al correo registrado");
        response.setMaskedEmail(maskEmail(pendingUser.getEmail()));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/redirigirPorRol")
    public ResponseEntity<?> redirigirPorRol(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No autorizado");

        String redirectUrl = (user.getRole().getIdRole() == 1) ? "/DashboardAdmin" : "/index";
        return ResponseEntity.ok(java.util.Map.of("redirect", redirectUrl));
    }

    /**
     * Metodo para obtener información del usuario logueado (útil para mostrar en el
     * frontend)
     */
    @GetMapping("/current")
    @ResponseBody
    public ResponseEntity<UserDTO> getCurrentUser(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setEmail(user.getEmail());
        userDTO.setPhone(user.getPhone());
        userDTO.setAddress(user.getAddress());
        userDTO.setGender(user.getGender());
        userDTO.setBirthDate(user.getBirthDate());
        userDTO.setIdRole(user.getRole() != null ? user.getRole().getIdRole() : null);
        userDTO.setProfileImageUrl(user.getProfileImageUrl());
        return new ResponseEntity<>(userDTO, HttpStatus.OK);
    }

    /**
     * Obtener perfil del usuario autenticado según su sesión actual
     */
    @GetMapping("/profile")
    @ResponseBody
    public ResponseEntity<?> getProfile(HttpSession session) {
        User user = (User) session.getAttribute("user");

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("No hay sesión activa"));
        }

        ProfileResponse response = new ProfileResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setIdRole(user.getRole() != null ? user.getRole().getIdRole() : null);
        response.setProfileImageUrl(user.getProfileImageUrl());

        return ResponseEntity.ok(response);
    }

    /**
     * Subir foto de perfil del usuario autenticado
     */
    @PostMapping(value = "/profile/photo", consumes = "multipart/form-data")
    @ResponseBody
    public ResponseEntity<?> uploadProfilePhoto(@RequestParam("photo") MultipartFile photo, HttpSession session) {
        User sessionUser = (User) session.getAttribute("user");

        if (sessionUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("No hay sesión activa"));
        }

        if (photo == null || photo.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Debes seleccionar una imagen"));
        }

        String contentType = photo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(new ErrorResponse("El archivo debe ser una imagen válida"));
        }

        if (photo.getSize() > (5 * 1024 * 1024)) {
            return ResponseEntity.badRequest().body(new ErrorResponse("La imagen no puede superar 5MB"));
        }

        try {
            User dbUser = userRepository.findById(sessionUser.getId()).orElse(null);
            if (dbUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Usuario no encontrado"));
            }

            Path profileDir = Paths.get(uploadPath, "profiles");
            Files.createDirectories(profileDir);

            String originalName = photo.getOriginalFilename() != null ? photo.getOriginalFilename() : "image.jpg";
            String extension = ".jpg";
            int extensionIndex = originalName.lastIndexOf('.');
            if (extensionIndex >= 0 && extensionIndex < originalName.length() - 1) {
                extension = originalName.substring(extensionIndex);
            }

            String safeFileName = "user_" + sessionUser.getId() + "_" + UUID.randomUUID() + extension;
            Path destination = profileDir.resolve(safeFileName);
            Files.copy(photo.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            String profileImageUrl = "/uploads/profiles/" + safeFileName;
            dbUser.setProfileImageUrl(profileImageUrl);

            User savedUser = userRepository.save(dbUser);
            session.setAttribute("user", savedUser);

            ProfileResponse response = new ProfileResponse();
            response.setId(savedUser.getId());
            response.setName(savedUser.getName());
            response.setEmail(savedUser.getEmail());
            response.setPhone(savedUser.getPhone());
            response.setAddress(savedUser.getAddress());
            response.setIdRole(savedUser.getRole() != null ? savedUser.getRole().getIdRole() : null);
            response.setProfileImageUrl(savedUser.getProfileImageUrl());

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("Error subiendo foto de perfil para usuario {}", sessionUser.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("No se pudo guardar la foto de perfil"));
        }
    }

    /**
     * Actualizar datos del perfil del usuario autenticado
     */
    @PutMapping("/profile")
    @ResponseBody
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request, HttpSession session) {
        User sessionUser = (User) session.getAttribute("user");

        if (sessionUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("No hay sesión activa"));
        }

        User dbUser = userRepository.findById(sessionUser.getId()).orElse(null);
        if (dbUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Usuario no encontrado"));
        }

        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("El nombre es obligatorio"));
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("El correo electrónico es obligatorio"));
        }

        if (request.getPhone() == null || request.getPhone().isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("El número de teléfono es obligatorio"));
        }

        String normalizedPhone = request.getPhone().trim();
        if (!PHONE_PATTERN.matcher(normalizedPhone).matches()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("El teléfono debe tener exactamente 10 dígitos numéricos"));
        }

        if (request.getAddress() == null || request.getAddress().isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("La dirección es obligatoria"));
        }

        String normalizedAddress = request.getAddress().trim();
        if (!ADDRESS_PATTERN.matcher(normalizedAddress).matches()) {
            return ResponseEntity.badRequest().body(new ErrorResponse(
                    "La dirección contiene caracteres no permitidos. Usa letras, números y símbolos como # . , - /"));
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String currentEmail = dbUser.getEmail() != null ? dbUser.getEmail().trim().toLowerCase() : "";
        if (!normalizedEmail.equals(currentEmail)) {
            return ResponseEntity.badRequest().body(new ErrorResponse("El correo electrónico no se puede editar"));
        }

        dbUser.setName(request.getName().trim());
        dbUser.setEmail(currentEmail);
        dbUser.setPhone(normalizedPhone);
        dbUser.setAddress(normalizedAddress);

        User savedUser = userRepository.save(dbUser);
        session.setAttribute("user", savedUser);

        ProfileResponse response = new ProfileResponse();
        response.setId(savedUser.getId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());
        response.setPhone(savedUser.getPhone());
        response.setAddress(savedUser.getAddress());
        response.setIdRole(savedUser.getRole() != null ? savedUser.getRole().getIdRole() : null);
        response.setProfileImageUrl(savedUser.getProfileImageUrl());

        return ResponseEntity.ok(response);
    }

    /**
     * Cambiar contraseña del usuario autenticado
     */
    @PostMapping("/change-password")
    @ResponseBody
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request, HttpSession session) {
        User sessionUser = (User) session.getAttribute("user");

        if (sessionUser == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("No hay sesión activa"));
        }

        User dbUser = userRepository.findById(sessionUser.getId()).orElse(null);
        if (dbUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Usuario no encontrado"));
        }

        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("La contraseña actual es obligatoria"));
        }

        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("La nueva contraseña es obligatoria"));
        }

        if (request.getNewPassword().trim().length() < 6) {
            return ResponseEntity.badRequest().body(new ErrorResponse("La nueva contraseña debe tener mínimo 6 caracteres"));
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), dbUser.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("La contraseña actual no es correcta"));
        }

        dbUser.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
        User savedUser = userRepository.save(dbUser);
        session.setAttribute("user", savedUser);

        return ResponseEntity.ok(new MessageResponse("Contraseña actualizada correctamente"));
    }

    // Registro de nuevo administrador desde el dashboard admin
    @PostMapping("/FormAdmin")
    public String registrarAdmin(
            @Valid @ModelAttribute("userDTO") UserDTO userDTO,
            BindingResult result,
            RedirectAttributes redirect) {
        if (result.hasErrors()) {
            // Cambiado para usar la plantilla existente en el proyecto
            return "Dashboard_Admin/Registro_nuevo_admin/form_registro_admin";
        }
        userService.crearAdmin(userDTO); // crear el admin
        redirect.addFlashAttribute("success", "Administrador creado con Ã©xito");
        return "redirect:/DashboardAdmin"; // redireccion al dashboard
    }

    @PostMapping("/forgot-password")
    @ResponseBody
    public ResponseEntity<?> solicitarRecuperacionContrasena(@RequestBody ForgotPasswordRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().isBlank()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("El correo electrónico es requerido"));
            }

            String email = request.getEmail().trim();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.ok(
                        new MessageResponse("Si el correo existe, recibiras tu nueva contraseña en unos minutos"));
            }

            String nuevaContrasena = generarContrasenaAleatoria();
            enviarCorreoNuevaContrasena(user.getName(), email, nuevaContrasena);

            user.setPassword(passwordEncoder.encode(nuevaContrasena));
            userRepository.save(user);

            return ResponseEntity.ok(
                    new MessageResponse("Si el correo existe, recibiras tu nueva contraseña en unos minutos"));
        } catch (MessagingException e) {
            log.error("No se pudo enviar el correo de recuperación para: {}", request.getEmail(), e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new ErrorResponse("No pudimos enviar el correo de recuperación en este momento. Intenta de nuevo más tarde."));
        } catch (Exception e) {
            log.error("Error al procesar recuperación de contraseña para: {}", request.getEmail(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error al procesar la solicitud. Por favor, intenta nuevamente"));
        }
    }

    /**
     * Metodo para generar una contraseÃ±a aleatoria segura
     */
    private String generarContrasenaAleatoria() {
        String caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        java.util.Random random = new Random();
        StringBuilder contrasena = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            int index = random.nextInt(caracteres.length());
            contrasena.append(caracteres.charAt(index));
        }
        return contrasena.toString();
    }

    /**
     * Metodo para enviar correo con la nueva contraseÃ±a
     */
    private void enviarCorreoNuevaContrasena(String nombre, String email, String nuevaContrasena)
            throws MessagingException {
        Session session = crearSesionCorreo();
        MimeMessage message = new MimeMessage(session);
        message.setFrom(new InternetAddress(SENDER_EMAIL));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(email));
        message.setSubject("Tu nueva contraseña - Huerta Directa");
        String htmlContent = crearContenidoHTMLNuevaContrasena(nombre, nuevaContrasena);
        message.setContent(htmlContent, "text/html; charset=utf-8");
        Transport.send(message);
    }

    /**
     * Metodo para crear el contenido HTML del correo con la nueva contraseÃ±a
     */
    private String crearContenidoHTMLNuevaContrasena(String nombre, String nuevaContrasena) {
        return """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Nueva Contraseña - Huerta Directa</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
                    <table role="presentation" style="width: 100%%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 0;">
                                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                    <!-- Header -->
                                    <div style="background: linear-gradient(135deg, #689f38 0%%, #8bc34a 100%%); padding: 40px 30px; text-align: center;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                                            🌱 Huerta Directa
                                        </h1>
                                        <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                                            Nueva Contraseña Generada
                                        </p>
                                    </div>
                                    <!-- Contenido principal -->
                                    <div style="padding: 40px 30px;">
                                        <div style="text-align: center; margin-bottom: 30px;">
                                            <div style="background-color: #e8f5e8; border-radius: 50px; width: 80px; height: 80px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; font-size: 35px;">
                                                🔑
                                            </div>
                                            <h2 style="color: #2e7d32; margin: 0; font-size: 24px; font-weight: bold;">
                                                ¡Nueva Contraseña Lista!
                                            </h2>
                                        </div>
                                        <div style="text-align: center; margin-bottom: 30px;">
                                            <p style="color: #333333; font-size: 18px; line-height: 1.6; margin-bottom: 15px;">
                                                ¡Hola <strong style="color: #689f38;">%s</strong>! 👋
                                            </p>
                                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                                                Hemos generado una nueva contraseña para tu cuenta en <strong>Huerta Directa</strong>.
                                                Ya puedes iniciar sesión con esta nueva contraseña.
                                            </p>
                                        </div>
                                        <!-- Nueva contraseña -->
                                        <div style="background-color: #f8f9fa; border: 2px dashed #8dc84b; border-radius: 15px; padding: 25px; margin-bottom: 30px; text-align: center;">
                                            <h3 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 18px;">
                                                🔐 Tu Nueva Contraseña
                                            </h3>
                                            <div style="background-color: #ffffff; border: 2px solid #8dc84b; border-radius: 10px; padding: 15px; margin: 10px 0;">
                                                <span style="font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; color: #2e7d32; letter-spacing: 2px;">
                                                    %s
                                                </span>
                                            </div>
                                            <p style="color: #666666; font-size: 12px; margin: 10px 0 0 0;">
                                                Copia esta contraseña exactamente como aparece
                                            </p>
                                        </div>
                                        <!-- Instrucciones -->
                                        <div style="background-color: #fff3e0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                                            <h3 style="color: #f57c00; margin: 0 0 15px 0; font-size: 16px; text-align: center;">
                                                📋 Próximos Pasos
                                            </h3>
                                            <div style="text-align: left;">
                                                <p style="color: #555555; margin: 8px 0; font-size: 14px;">
                                                    1️⃣ Ve a la página de inicio de sesión
                                                </p>
                                                <p style="color: #555555; margin: 8px 0; font-size: 14px;">
                                                    2️⃣ Usa tu email y esta nueva contraseña
                                                </p>
                                                <p style="color: #555555; margin: 8px 0; font-size: 14px;">
                                                    3️⃣ ¡Recomendamos cambiarla por una personalizada!
                                                </p>
                                            </div>
                                        </div>
                                        <!-- Botón de acción -->
                                        <div style="text-align: center; margin-bottom: 30px;">
                                            <a href="http://localhost:8085/login" style="display: inline-block; background: linear-gradient(135deg, #689f38 0%%, #8bc34a 100%%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(104, 159, 56, 0.3);">
                                                🚀 Iniciar Sesión Ahora
                                            </a>
                                        </div>
                                        <!-- Mensaje de seguridad -->
                                        <div style="text-align: center; border-top: 2px solid #e8f5e8; padding-top: 25px;">
                                            <p style="color: #666666; font-size: 14px; line-height: 1.5; margin: 0;">
                                                Si no solicitaste este cambio, contacta inmediatamente con soporte.<br>
                                                <strong style="color: #689f38;">Tu cuenta está segura con nosotros 🛡️</strong>
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
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """
                .formatted(nombre, nuevaContrasena);
    }

    // =========================
    // CLASES HELPER PARA RESPUESTAS JSON
    // =========================

    /**
     * Clase para respuestas de error
     */
    public static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    public static class ForgotPasswordRequest {
        private String email;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public static class UpdateProfileRequest {
        private String name;
        private String email;
        private String phone;
        private String address;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }
    }

    /**
     * Método helper para obtener URL de redirección según el rol
     */
    private String getRedirectUrlByRole(Long roleId) {
        if (roleId != null && roleId == 1) {
            return "/admin-dashboard";
        }
        return "/HomePage";
    }

    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;

        public String getCurrentPassword() {
            return currentPassword;
        }

        public void setCurrentPassword(String currentPassword) {
            this.currentPassword = currentPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }

    /**
     * Clase para request de login
     */
    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    /**
     * Clase para respuesta de login
     */
    public static class LoginResponse {
        private Long id;
        private String name;
        private String email;
        private Long idRole;
        private String status;
        private String message;
        private String redirect;
        private String profileImageUrl;
        private String maskedEmail;
        private boolean hasPhone;

        // Getters y Setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public Long getIdRole() {
            return idRole;
        }

        public void setIdRole(Long idRole) {
            this.idRole = idRole;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getRedirect() {
            return redirect;
        }

        public void setRedirect(String redirect) {
            this.redirect = redirect;
        }

        public String getProfileImageUrl() {
            return profileImageUrl;
        }

        public void setProfileImageUrl(String profileImageUrl) {
            this.profileImageUrl = profileImageUrl;
        }

        public String getMaskedEmail() {
            return maskedEmail;
        }

        public void setMaskedEmail(String maskedEmail) {
            this.maskedEmail = maskedEmail;
        }

        public boolean isHasPhone() {
            return hasPhone;
        }

        public void setHasPhone(boolean hasPhone) {
            this.hasPhone = hasPhone;
        }
    }

    public static class VerificationChannelRequest {
        private String channel;

        public String getChannel() {
            return channel;
        }

        public void setChannel(String channel) {
            this.channel = channel;
        }
    }

    public static class VerifyEmailRequest {
        private String code;

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }
    }

    private void sendEmailVerificationCode(User user, HttpSession session) {
        String otp = generateEmailOtpCode();
        long expiresAt = (System.currentTimeMillis() / 1000) + EMAIL_CODE_TTL_SECONDS;

        session.setAttribute("pendingUser", user);
        session.setAttribute("pendingEmailCode", otp);
        session.setAttribute("pendingEmailExpiresAt", expiresAt);
        session.setAttribute("pendingEmailAttempts", 0);

        try {
            enviarCorreoIndividual(
                    user.getEmail(),
                    "Código de verificación - Huerta Directa",
                    crearContenidoHTMLCodigoVerificacion(user.getName(), otp));
        } catch (MessagingException e) {
            clearPendingEmailSession(session);
            log.error("No se pudo enviar OTP al correo {}", user.getEmail(), e);
            throw new RuntimeException("No fue posible enviar el código al correo. Inténtalo nuevamente.");
        }
    }

    private String crearContenidoHTMLCodigoVerificacion(String nombre, String codigo) {
        return """
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Código de verificación - Huerta Directa</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
                    <table role="presentation" style="width: 100%%; border-collapse: collapse; background-color: #f4f4f4;">
                        <tr>
                            <td style="padding: 24px 12px;">
                                <table role="presentation" style="width: 100%%; max-width: 600px; margin: 0 auto; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #689f38 0%%, #8bc34a 100%%); padding: 36px 28px; text-align: center;">
                                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">🌱 Huerta Directa</h1>
                                            <p style="color: #e8f5e8; margin: 12px 0 0 0; font-size: 18px;">Conectando el campo con tu mesa</p>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding: 36px 28px; text-align: center;">
                                            <div style="background-color: #e8f5e8; border-radius: 999px; width: 84px; height: 84px; margin: 0 auto 18px auto; line-height: 84px; font-size: 34px;">🔐</div>
                                            <h2 style="color: #2e7d32; margin: 0 0 14px 0; font-size: 34px; font-weight: 700;">Verificación de acceso</h2>
                                            <p style="color: #333333; font-size: 20px; margin: 0 0 8px 0;">Hola <strong style="color: #689f38;">%s</strong>,</p>
                                            <p style="color: #666666; font-size: 17px; margin: 0 0 22px 0;">Tu código para ingresar es:</p>

                                            <table role="presentation" style="width: 100%%; border-collapse: collapse;">
                                                <tr>
                                                    <td style="padding: 0 10px;">
                                                        <div style="background-color: #f8f9fa; border: 2px dashed #8dc84b; border-radius: 12px; padding: 18px 10px;">
                                                            <div style="font-family: 'Courier New', monospace; color: #1b5e20; font-size: 44px; font-weight: 700; letter-spacing: 12px;">%s</div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </table>

                                            <p style="color: #666666; margin: 20px 0 0 0; font-size: 16px;">Este código vence en 5 minutos.</p>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="padding: 0 28px 28px 28px;">
                                            <div style="background-color: #f8f9fa; border-radius: 10px; padding: 18px; text-align: center;">
                                                <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.6;">
                                                    Si no intentaste iniciar sesión, ignora este mensaje.<br>
                                                    <strong style="color: #689f38;">Tu cuenta está protegida 🛡️</strong>
                                                </p>
                                            </div>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="background-color: #2e7d32; padding: 22px 28px; text-align: center;">
                                            <p style="color: #ffffff; margin: 0 0 8px 0; font-size: 16px; font-weight: 700;">El equipo de Huerta Directa 🌱</p>
                                            <p style="color: #c8e6c9; margin: 0; font-size: 12px;">Este correo fue enviado automáticamente. Por favor, no respondas a este mensaje.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(nombre, codigo);
    }

    private void enviarCorreoIndividual(String destinatario, String asunto, String cuerpo) throws MessagingException {
        Session session = crearSesionCorreo();
        MimeMessage message = new MimeMessage(session);
        message.setFrom(new InternetAddress(SENDER_EMAIL));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(destinatario));
        message.setSubject(asunto);
        message.setContent(cuerpo, "text/html; charset=utf-8");
        Transport.send(message);
    }

    private String generateEmailOtpCode() {
        int max = (int) Math.pow(10, EMAIL_CODE_LENGTH);
        int value = OTP_RANDOM.nextInt(max);
        return String.format("%0" + EMAIL_CODE_LENGTH + "d", value);
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "***";
        }

        String[] parts = email.split("@", 2);
        String local = parts[0];
        String domain = parts[1];

        if (local.length() <= 2) {
            return "**@" + domain;
        }

        return local.charAt(0) + "***" + local.charAt(local.length() - 1) + "@" + domain;
    }

    private void clearPendingEmailCode(HttpSession session) {
        session.removeAttribute("pendingEmailCode");
        session.removeAttribute("pendingEmailExpiresAt");
        session.removeAttribute("pendingEmailAttempts");
    }

    private void clearPendingEmailSession(HttpSession session) {
        clearPendingEmailCode(session);
        session.removeAttribute("pendingUser");
    }

    /**
     * Clase para respuesta de registro
     */
    public static class UserResponse {
        private Long id;
        private String name;
        private String email;
        private Long idRole;
        private String message;
        private String profileImageUrl;

        // Getters y Setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public Long getIdRole() {
            return idRole;
        }

        public void setIdRole(Long idRole) {
            this.idRole = idRole;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getProfileImageUrl() {
            return profileImageUrl;
        }

        public void setProfileImageUrl(String profileImageUrl) {
            this.profileImageUrl = profileImageUrl;
        }
    }

    public static class ProfileResponse {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String address;
        private Long idRole;
        private String profileImageUrl;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }

        public Long getIdRole() {
            return idRole;
        }

        public void setIdRole(Long idRole) {
            this.idRole = idRole;
        }

        public String getProfileImageUrl() {
            return profileImageUrl;
        }

        public void setProfileImageUrl(String profileImageUrl) {
            this.profileImageUrl = profileImageUrl;
        }
    }

    /**
     * Clase para mensajes simples de respuesta
     */
    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
