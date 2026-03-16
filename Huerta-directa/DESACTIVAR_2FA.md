# 🎯 Verificación 2FA - DESACTIVADA TEMPORALMENTE PARA PRESENTACIÓN

## ⚠️ IMPORTANTE

La verificación de 2 factores (correo/teléfono) está **TEMPORALMENTE DESACTIVADA** para facilitar la presentación.

Ahora los usuarios pueden hacer login **directamente** sin necesidad de códigos de verificación.

---

## 🔄 CÓMO REACTIVAR DESPUÉS DE LA PRESENTACIÓN

### 📍 Ubicación del Código
**Archivo:** `LoginController.java`
**Método:** `loginUser()` (línea ~338-372)

### ✅ Pasos para Reactivar 2FA

1. **Abre el archivo:**
   ```
   Huerta-directa/src/main/java/com/exe/Huerta_directa/Controllers/LoginController.java
   ```

2. **Busca la sección:**
   ```java
   // TEMPORAL PRESENTACIÓN - VERIFICACIÓN 2FA DESACTIVADA
   ```

3. **Comenta el bloque de LOGIN DIRECTO (líneas ~346-360):**
   ```java
   // ============================================================================
   // LOGIN DIRECTO (SIN VERIFICACIÓN) - TEMPORAL PARA PRESENTACIÓN
   // ============================================================================
   /*
   session.setAttribute("user", user);
   session.setAttribute("userId", user.getId());
   session.setAttribute("userRole", user.getRole() != null ? user.getRole().getIdRole() : null);

   LoginResponse response = new LoginResponse();
   response.setStatus("success");
   response.setMessage("Login exitoso");
   response.setId(user.getId());
   response.setName(user.getName());
   response.setEmail(user.getEmail());
   response.setIdRole(user.getRole() != null ? user.getRole().getIdRole() : null);
   response.setRedirect(getRedirectUrlByRole(user.getRole() != null ? user.getRole().getIdRole() : null));

   return ResponseEntity.ok(response);
   */
   ```

4. **Descomenta el bloque de FLUJO 2FA ORIGINAL (líneas ~364-372):**
   ```java
   // ============================================================================
   // FLUJO 2FA ORIGINAL (REACTIVADO)
   // ============================================================================
   session.setAttribute("pendingUser", user);
   clearPendingEmailCode(session);

   LoginResponse verifyResponse = new LoginResponse();
   verifyResponse.setStatus("choose-channel");
   verifyResponse.setMessage("Selecciona cómo deseas recibir el código");
   verifyResponse.setMaskedEmail(maskEmail(user.getEmail()));
   verifyResponse.setHasPhone(user.getPhone() != null && !user.getPhone().isBlank());
   return ResponseEntity.ok(verifyResponse);
   ```

5. **Guarda el archivo y haz commit:**
   ```bash
   git add LoginController.java
   git commit -m "Reactivar verificación 2FA después de presentación"
   git push
   ```

6. **Redeploy en Railway** (tu compañero debe hacer el deploy)

---

## 🧪 Verificar que Funciona

### Mientras está DESACTIVADO (ahora):
- ✅ Login directo con email y contraseña
- ✅ Sin códigos de verificación
- ✅ Acceso inmediato al sistema

### Cuando se REACTIVE:
- ✅ Login con email y contraseña
- ✅ Selección de canal (correo/teléfono)
- ✅ Código de verificación enviado
- ✅ Ingreso de código para completar login

---

## 📝 Notas

- **No elimines el código comentado**, solo activa/desactiva según necesites
- Los endpoints de verificación `/start-verification`, `/verify-email`, etc. siguen existiendo pero no se usan mientras esté desactivado
- Asegúrate de tener configuradas las variables de email en Railway antes de reactivar (ver `CONFIGURACION_CORREO.md`)

---

**Última actualización:** 2026-03-15
**Estado actual:** ✅ 2FA ACTIVADO - Verificación por correo/teléfono funcionando
