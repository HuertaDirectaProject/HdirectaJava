# 🚂 Guía de Configuración en Railway - Variables de Correo

## 📌 ¿Qué es esto?

Este documento te guiará paso a paso para **configurar las variables de entorno en Railway** que permiten el envío de correos electrónicos desde la aplicación en producción.

---

## ⚠️ IMPORTANTE: Antes de Empezar

**SIN ESTA CONFIGURACIÓN, EL ENVÍO DE CORREOS NO FUNCIONARÁ EN PRODUCCIÓN**

Las funcionalidades afectadas son:
- ✉️ Registro de usuarios (correo de bienvenida)
- 🔐 Verificación de login con código 2FA
- 🔑 Recuperación de contraseña
- 📧 Notificaciones de pagos

---

## 📋 Paso 1: Obtener Contraseña de Aplicación de Gmail

### 1.1 Ingresar a tu Cuenta de Google

1. Ve a: **https://myaccount.google.com/security**
2. Inicia sesión con la cuenta **hdirecta@gmail.com**

### 1.2 Activar Verificación en 2 Pasos

1. Busca la sección **"Cómo inicias sesión en Google"**
2. Haz clic en **"Verificación en 2 pasos"**
3. Si NO está activada:
   - Haz clic en **"Empezar"**
   - Sigue los pasos para configurar tu teléfono
   - Completa la activación

### 1.3 Generar Contraseña de Aplicación

1. Una vez activada la verificación en 2 pasos, regresa a:
   **https://myaccount.google.com/security**

2. Busca **"Contraseñas de aplicaciones"** (App Passwords)
   - También puedes ir directamente a: **https://myaccount.google.com/apppasswords**

3. Haz clic en **"Contraseñas de aplicaciones"**

4. Se te pedirá tu contraseña de Gmail nuevamente (ingrésala)

5. En la pantalla de "Contraseñas de aplicaciones":
   - **Aplicación:** Selecciona "Correo"
   - **Dispositivo:** Selecciona "Otro (nombre personalizado)"
   - **Nombre sugerido:** `Railway Huerta Directa`

6. Haz clic en **"Generar"**

7. **MUY IMPORTANTE:** Copia la contraseña generada
   - Te mostrará algo como: `abcd efgh ijkl mnop`
   - **Copia SIN espacios:** `abcdefghijklmnop`
   - **Guárdala en un lugar seguro** (la necesitarás en el siguiente paso)

---

## 🚂 Paso 2: Configurar Variables en Railway

### 2.1 Acceder a tu Proyecto en Railway

1. Ve a: **https://railway.app/**
2. Inicia sesión con tu cuenta
3. Busca y selecciona tu proyecto: **Huerta Directa** (o el nombre que le hayas dado)

### 2.2 Seleccionar el Servicio Backend

1. En el dashboard del proyecto, verás los servicios desplegados
2. Haz clic en el servicio de **backend** (Spring Boot)
   - Normalmente se llama igual que tu repositorio
   - Es el que tiene el código Java

### 2.3 Ir a la Pestaña de Variables

1. Una vez dentro del servicio, busca las pestañas en la parte superior:
   ```
   Deployments | Settings | Metrics | Variables | Logs
   ```

2. Haz clic en **"Variables"** (o "Environment Variables")

### 2.4 Agregar las Variables de Correo

Ahora vas a agregar **4 variables nuevas**. Para cada una:

1. Haz clic en **"New Variable"** o **"+ Add Variable"**
2. Ingresa el **Nombre** y **Valor** según la tabla siguiente
3. Haz clic en **"Add"** o presiona Enter

#### Variables a Agregar:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| **MAIL_SMTP_HOST** | `smtp.gmail.com` | Servidor SMTP de Gmail |
| **MAIL_SMTP_PORT** | `587` | Puerto para TLS |
| **MAIL_SMTP_USERNAME** | `hdirecta@gmail.com` | Email desde el que se enviarán correos |
| **MAIL_SMTP_PASSWORD** | `tu_contraseña_aqui` | La contraseña de aplicación que generaste en el Paso 1.3 |

#### ⚠️ EJEMPLO VISUAL:

```
┌─────────────────────────────────────────────────────┐
│  Variables                                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  MAIL_SMTP_HOST        smtp.gmail.com              │
│  MAIL_SMTP_PORT        587                         │
│  MAIL_SMTP_USERNAME    hdirecta@gmail.com          │
│  MAIL_SMTP_PASSWORD    abcdefghijklmnop            │
│                                                     │
│  [+ New Variable]                                  │
└─────────────────────────────────────────────────────┘
```

### 2.5 Verificar las Variables

1. Asegúrate de que todas las variables estén escritas **exactamente** como se muestra
2. **IMPORTANTE:** No debe haber espacios extras ni errores de tipeo
3. La contraseña de aplicación debe ser **sin espacios**

---

## 🔄 Paso 3: Redeploy de la Aplicación

### 3.1 Trigger del Redeploy

Railway debería hacer un **redeploy automático** después de agregar variables, pero si no:

1. Ve a la pestaña **"Deployments"**
2. Busca el botón **"Deploy"** o **"Redeploy"**
3. Haz clic para forzar un nuevo despliegue

### 3.2 Esperar a que Complete

1. En la pestaña **"Deployments"**, verás el progreso del deploy
2. Espera a que el estado cambie a:
   - ✅ **"Success"** o **"Deployed"**
   - El círculo verde indica que está funcionando

3. Si hay errores:
   - Ve a la pestaña **"Logs"**
   - Busca mensajes de error relacionados con `mail` o `smtp`

---

## ✅ Paso 4: Verificar que Funciona

### 4.1 Probar el Registro de Usuario

1. Ve a tu aplicación en producción (la URL de Railway)
2. Intenta **registrar un nuevo usuario**
3. Deberías recibir un **correo de bienvenida** en la bandeja de entrada

### 4.2 Probar el Login con 2FA

1. Intenta **iniciar sesión** con un usuario existente
2. El sistema debe pedirte que **elijas el canal** (correo o teléfono)
3. Selecciona **"Recibir por correo"**
4. Deberías recibir el **código de verificación** en tu email
5. Ingresa el código para completar el login

### 4.3 Verificar los Logs (Opcional)

Si algo no funciona:

1. Ve a Railway → Tu servicio → Pestaña **"Logs"**
2. Busca mensajes relacionados con:
   - ✅ `Correo enviado exitosamente`
   - ❌ `Error al enviar correo`
   - ❌ `Authentication failed`
   - ❌ `Invalid credentials`

---

## 🚨 Solución de Problemas

### Problema 1: "Authentication failed" o "Invalid credentials"

**Causa:** La contraseña de aplicación es incorrecta

**Solución:**
1. Genera una **nueva contraseña de aplicación** en Google (Paso 1.3)
2. Reemplaza el valor de `MAIL_SMTP_PASSWORD` en Railway
3. Redeploy

---

### Problema 2: "Connection timeout" o "Could not connect"

**Causa:** El puerto o host están mal configurados

**Solución:**
1. Verifica que `MAIL_SMTP_HOST` sea exactamente: `smtp.gmail.com`
2. Verifica que `MAIL_SMTP_PORT` sea exactamente: `587`
3. Redeploy

---

### Problema 3: Los correos no llegan (sin errores en logs)

**Causa:** Los correos pueden estar en spam o Gmail está bloqueando el envío

**Solución:**
1. Revisa la **carpeta de spam** del correo destinatario
2. Ve a tu cuenta de Gmail (hdirecta@gmail.com)
3. Busca en **"Actividad de la cuenta"** si Google bloqueó algo
4. Asegúrate de que la verificación en 2 pasos esté ACTIVA

---

### Problema 4: Las variables no se cargan

**Causa:** Railway no detectó las variables o el código no las está leyendo

**Solución:**
1. Verifica que los nombres de las variables sean **exactamente** como se indica (mayúsculas/minúsculas importan)
2. Verifica que el código en `application-prod.properties` tenga:
   ```properties
   mail.smtp.host=${MAIL_SMTP_HOST:smtp.gmail.com}
   mail.smtp.port=${MAIL_SMTP_PORT:587}
   mail.smtp.username=${MAIL_SMTP_USERNAME}
   mail.smtp.password=${MAIL_SMTP_PASSWORD}
   ```
3. Haz un redeploy manual

---

## 📞 Contacto de Soporte

Si después de seguir todos estos pasos aún tienes problemas:

1. **Revisa los logs:** Railway → Logs → Busca errores de `mail` o `smtp`
2. **Copia el error exacto** que aparece en los logs
3. Escribe el error y solicita ayuda

---

## ✅ Checklist de Configuración

Antes de terminar, verifica que hayas completado:

- [ ] Activaste la **verificación en 2 pasos** en Google
- [ ] Generaste una **contraseña de aplicación** de Gmail
- [ ] Agregaste las **4 variables** en Railway:
  - [ ] `MAIL_SMTP_HOST`
  - [ ] `MAIL_SMTP_PORT`
  - [ ] `MAIL_SMTP_USERNAME`
  - [ ] `MAIL_SMTP_PASSWORD`
- [ ] Railway hizo el **redeploy** automáticamente
- [ ] Probaste el **registro de usuario** y llegó el correo
- [ ] Probaste el **login con 2FA** y llegó el código

---

## 🎉 ¡Listo!

Si completaste todos los pasos y las pruebas funcionaron, **¡felicidades!**

El sistema de envío de correos está configurado correctamente en producción.

---

**Última actualización:** 2026-03-15
**Versión:** 1.0
