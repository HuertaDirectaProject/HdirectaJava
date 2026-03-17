# 📧 Configuración de Envío de Correos - Guía Rápida

## 🚨 Problema Solucionado

Antes, las credenciales de correo estaban hardcodeadas en el código, lo que causaba que **el envío de correos no funcionara en producción** (Railway).

Ahora usamos **variables de entorno**, lo que permite:
- ✅ Mantener las credenciales seguras
- ✅ Diferentes configuraciones para desarrollo y producción
- ✅ Fácil configuración en Railway sin modificar código

---

## 🛠️ Configuración Rápida

### 📘 Para Configurar en Railway (Producción)

**👉 Consulta la guía completa:** **[RAILWAY_CONFIGURACION.md](./RAILWAY_CONFIGURACION.md)**

Este documento incluye:
- ✅ Pasos detallados con ejemplos visuales
- ✅ Cómo obtener contraseña de aplicación de Gmail
- ✅ Cómo configurar variables en Railway
- ✅ Solución de problemas comunes
- ✅ Checklist de verificación

### 📗 Para Desarrollo Local

Las credenciales ya están configuradas en `application-dev.properties`. Solo asegúrate de que:
- El perfil activo sea `dev` en `application.properties`
- Puedes probar el envío de correos localmente

---

## 🔒 Variables Necesarias en Railway

Para que el envío de correos funcione en producción, tu compañero debe configurar estas **4 variables** en Railway:

```
MAIL_SMTP_HOST=smtp.gmail.com
MAIL_SMTP_PORT=587
MAIL_SMTP_USERNAME=hdirecta@gmail.com
MAIL_SMTP_PASSWORD=(contraseña de aplicación de Gmail)
```

> ⚠️ **IMPORTANTE:** La contraseña NO es la contraseña normal de Gmail, sino una **"Contraseña de Aplicación"** que se genera desde la configuración de seguridad de Google.

**[Ver guía completa de Railway →](./RAILWAY_CONFIGURACION.md)**

---

## 📁 Archivos Modificados

- ✅ `application-dev.properties` - Credenciales para desarrollo local
- ✅ `application-prod.properties` - Referencias a variables de entorno
- ✅ `LoginController.java` - Usa `@Value` para inyectar credenciales
- ✅ `UserController.java` - Usa `@Value` para inyectar credenciales
- ✅ `PaymentController.java` - Usa `@Value` para inyectar credenciales

---

## 🧪 Verificar que Funciona

### En Desarrollo (Local)

Las credenciales ya están configuradas. Puedes probar:
- Registro de un nuevo usuario (envía correo de bienvenida)
- Login con código de verificación por correo
- Recuperación de contraseña

### En Producción (Railway)

1. Una vez configuradas las variables (ver **[RAILWAY_CONFIGURACION.md](./RAILWAY_CONFIGURACION.md)**), prueba:
   - Registro de un nuevo usuario (debería enviar correo de bienvenida)
   - Login con código de verificación por correo
   - Recuperación de contraseña

2. **Si no funciona**, verifica los logs en Railway:
   - Ve a tu servicio → Pestaña "Logs"
   - Busca errores relacionados con `mail` o `smtp`
   - Consulta la sección "Solución de Problemas" en **[RAILWAY_CONFIGURACION.md](./RAILWAY_CONFIGURACION.md)**

---

## 🔒 Seguridad

✅ **Qué SÍ hacer:**
- Usar contraseñas de aplicación de Gmail
- Mantener las credenciales en variables de entorno
- Nunca commitear credenciales al repositorio

❌ **Qué NO hacer:**
- NO uses tu contraseña normal de Gmail
- NO compartas las credenciales en el código
- NO subas archivos `.env` al repositorio (ya está en `.gitignore`)

---

## 📞 Soporte

Si tienes problemas:
1. Consulta **[RAILWAY_CONFIGURACION.md](./RAILWAY_CONFIGURACION.md)** (guía completa con solución de problemas)
2. Verifica que las variables estén bien configuradas en Railway
3. Revisa los logs de Railway
4. Asegúrate de que la contraseña de aplicación esté correcta

---

**Última actualización:** 2026-03-15
