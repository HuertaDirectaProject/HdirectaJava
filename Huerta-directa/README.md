# 🌱 Huerta Directa - Sistema de Gestión

Sistema de gestión para conectar productores agrícolas con consumidores.

---

## 📚 Documentación Importante

### 🔧 Configuración y Despliegue

- 📧 **[RAILWAY_CONFIGURACION.md](./RAILWAY_CONFIGURACION.md)** - **Guía completa paso a paso** para configurar el envío de correos en Railway (producción)
  - Cómo obtener contraseña de aplicación de Gmail
  - Cómo configurar variables de entorno en Railway
  - Solución de problemas comunes
  - Checklist de verificación

- 📧 **[CONFIGURACION_CORREO.md](./CONFIGURACION_CORREO.md)** - Resumen de la configuración de correos (desarrollo y producción)

- 🔐 **[DESACTIVAR_2FA.md](./DESACTIVAR_2FA.md)** - Instrucciones para activar/desactivar la verificación 2FA temporalmente

- 📝 **[.env.example](./.env.example)** - Plantilla de variables de entorno necesarias

---

## 🚀 Inicio Rápido

### Desarrollo Local

1. Clona el repositorio
2. Asegúrate de tener Java 17+ y Maven instalados
3. El perfil de desarrollo ya está configurado con credenciales de correo
4. Ejecuta: `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`

### Despliegue en Railway

**👉 Sigue la guía:** **[RAILWAY_CONFIGURACION.md](./RAILWAY_CONFIGURACION.md)**

Resumen:
1. Conecta tu repositorio a Railway
2. Configura las variables de entorno (ver guía)
3. Railway hará el deploy automáticamente

---

## 📋 Variables de Entorno Requeridas en Producción

Para que la aplicación funcione correctamente en Railway, necesitas configurar:

### Correo Electrónico (OBLIGATORIO)
```
MAIL_SMTP_HOST=smtp.gmail.com
MAIL_SMTP_PORT=587
MAIL_SMTP_USERNAME=hdirecta@gmail.com
MAIL_SMTP_PASSWORD=(contraseña de aplicación)
```

### Base de Datos
Railway las genera automáticamente si usas su servicio de PostgreSQL.

### MercadoPago (Opcional)
```
MERCADOPAGO_ACCESS_TOKEN=tu_token
MERCADOPAGO_PUBLIC_KEY=tu_key
```

**Ver instrucciones completas en:** **[RAILWAY_CONFIGURACION.md](./RAILWAY_CONFIGURACION.md)**

---

## 🔐 Seguridad

- ✅ Las credenciales están en variables de entorno (no en el código)
- ✅ Verificación 2FA activada por defecto
- ✅ Contraseñas encriptadas con BCrypt
- ✅ Sesiones seguras con HttpSession

---

## 🛠️ Tecnologías

- **Backend:** Spring Boot 3.x
- **Base de Datos:** PostgreSQL
- **Autenticación:** Spring Security + 2FA
- **Pagos:** MercadoPago API
- **Email:** JavaMail + Gmail SMTP
- **Deploy:** Railway

---

## 📞 Soporte

Para problemas con:
- **Envío de correos:** Ver **[RAILWAY_CONFIGURACION.md](./RAILWAY_CONFIGURACION.md)** (sección "Solución de Problemas")
- **Verificación 2FA:** Ver **[DESACTIVAR_2FA.md](./DESACTIVAR_2FA.md)**
- **Configuración general:** Ver **[CONFIGURACION_CORREO.md](./CONFIGURACION_CORREO.md)**

---

**Última actualización:** 2026-03-15
