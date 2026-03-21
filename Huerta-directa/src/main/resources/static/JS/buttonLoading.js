/**
 * ✨ Button Loading Utility - HuertaDirecta
 * Utilidad JavaScript para manejar estados de loading en botones
 */

class ButtonLoading {
  /**
   * Configuración por defecto
   */
  static defaultConfig = {
    type: "spinner", // spinner, dots, pulse, shimmer
    text: "Cargando...",
    hideText: false,
    disableButton: true,
  };

  /**
   * Activa el estado de loading en un botón
   * @param {string|HTMLElement} button - Selector CSS o elemento del botón
   * @param {Object} options - Opciones de configuración
   * @returns {Object} - Objeto con método stop() para detener el loading
   */
  static start(button, options = {}) {
    const btn = typeof button === "string" ? document.querySelector(button) : button;

    if (!btn) {
      console.error("ButtonLoading: Botón no encontrado");
      return null;
    }

    const config = { ...ButtonLoading.defaultConfig, ...options };

    // Guardar estado original
    btn.dataset.originalContent = btn.innerHTML;
    btn.dataset.originalDisabled = btn.disabled;

    // Agregar clase de loading
    btn.classList.add("btn-loading");

    // Deshabilitar botón si está configurado
    if (config.disableButton) {
      btn.disabled = true;
    }

    // Crear indicador de loading
    const loadingIndicator = ButtonLoading.createIndicator(config.type);

    // Actualizar contenido del botón
    if (config.hideText) {
      btn.innerHTML = loadingIndicator;
    } else {
      btn.innerHTML = `
        <span class="btn-loading-combo">
          ${loadingIndicator}
          <span class="btn-loading-text">${config.text}</span>
        </span>
      `;
    }

    // Retornar objeto con método stop
    return {
      stop: () => ButtonLoading.stop(btn),
    };
  }

  /**
   * Detiene el estado de loading en un botón
   * @param {string|HTMLElement} button - Selector CSS o elemento del botón
   */
  static stop(button) {
    const btn = typeof button === "string" ? document.querySelector(button) : button;

    if (!btn) {
      console.error("ButtonLoading: Botón no encontrado");
      return;
    }

    // Remover clase de loading
    btn.classList.remove("btn-loading");

    // Restaurar contenido original
    if (btn.dataset.originalContent) {
      btn.innerHTML = btn.dataset.originalContent;
      delete btn.dataset.originalContent;
    }

    // Restaurar estado disabled original
    if (btn.dataset.originalDisabled) {
      btn.disabled = btn.dataset.originalDisabled === "true";
      delete btn.dataset.originalDisabled;
    } else {
      btn.disabled = false;
    }
  }

  /**
   * Crea el HTML del indicador de loading según el tipo
   * @param {string} type - Tipo de indicador (spinner, dots, pulse, shimmer)
   * @returns {string} - HTML del indicador
   */
  static createIndicator(type) {
    switch (type) {
      case "spinner":
        return '<div class="btn-loading-spinner"></div>';

      case "dots":
        return `
          <div class="btn-loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        `;

      case "pulse":
        return `
          <div class="btn-loading-pulse">
            <span></span>
            <span></span>
            <span></span>
          </div>
        `;

      case "shimmer":
        return '<i class="fas fa-circle-notch fa-spin"></i>';

      case "fa-spinner":
        return '<i class="fas fa-spinner fa-spin"></i>';

      default:
        return '<div class="btn-loading-spinner"></div>';
    }
  }

  /**
   * Wrapper para ejecutar una función asíncrona con loading automático
   * @param {string|HTMLElement} button - Selector CSS o elemento del botón
   * @param {Function} asyncFunction - Función asíncrona a ejecutar
   * @param {Object} options - Opciones de configuración
   */
  static async withLoading(button, asyncFunction, options = {}) {
    const loading = ButtonLoading.start(button, options);

    try {
      const result = await asyncFunction();
      return result;
    } catch (error) {
      console.error("Error en función asíncrona:", error);
      throw error;
    } finally {
      if (loading) {
        loading.stop();
      }
    }
  }

  /**
   * Activa loading en múltiples botones
   * @param {string|NodeList|Array} buttons - Selector CSS, NodeList o Array de botones
   * @param {Object} options - Opciones de configuración
   */
  static startMultiple(buttons, options = {}) {
    let elements;

    if (typeof buttons === "string") {
      elements = document.querySelectorAll(buttons);
    } else {
      elements = buttons;
    }

    const loadings = [];

    elements.forEach((btn) => {
      const loading = ButtonLoading.start(btn, options);
      if (loading) {
        loadings.push(loading);
      }
    });

    return {
      stop: () => loadings.forEach((loading) => loading.stop()),
    };
  }

  /**
   * Detiene loading en múltiples botones
   * @param {string|NodeList|Array} buttons - Selector CSS, NodeList o Array de botones
   */
  static stopMultiple(buttons) {
    let elements;

    if (typeof buttons === "string") {
      elements = document.querySelectorAll(buttons);
    } else {
      elements = buttons;
    }

    elements.forEach((btn) => ButtonLoading.stop(btn));
  }
}

// ============================================
// HELPERS PARA JQUERY (si está disponible)
// ============================================

if (typeof jQuery !== "undefined") {
  (function ($) {
    $.fn.loadingStart = function (options) {
      return this.each(function () {
        ButtonLoading.start(this, options);
      });
    };

    $.fn.loadingStop = function () {
      return this.each(function () {
        ButtonLoading.stop(this);
      });
    };
  })(jQuery);
}

// ============================================
// EXPORT PARA MÓDULOS
// ============================================

if (typeof module !== "undefined" && module.exports) {
  module.exports = ButtonLoading;
}

// ============================================
// EJEMPLOS DE USO
// ============================================

/*

// EJEMPLO 1: Uso básico
const loading = ButtonLoading.start('#miBoton');
// ... realizar operación
loading.stop();

// EJEMPLO 2: Con opciones personalizadas
ButtonLoading.start('#miBoton', {
  type: 'dots',
  text: 'Procesando...',
  hideText: false
});

// EJEMPLO 3: Con función asíncrona
document.querySelector('#miBoton').addEventListener('click', async () => {
  await ButtonLoading.withLoading('#miBoton', async () => {
    const response = await fetch('/api/endpoint');
    return response.json();
  }, { type: 'pulse', text: 'Guardando...' });
});

// EJEMPLO 4: Con jQuery
$('#miBoton').loadingStart({ type: 'spinner' });
// ... realizar operación
$('#miBoton').loadingStop();

// EJEMPLO 5: Múltiples botones
const loadings = ButtonLoading.startMultiple('.btn-submit', { type: 'dots' });
// ... realizar operación
loadings.stop();

// EJEMPLO 6: En un formulario
document.querySelector('#miForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = e.target.querySelector('button[type="submit"]');

  await ButtonLoading.withLoading(submitBtn, async () => {
    const formData = new FormData(e.target);
    const response = await fetch('/submit', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      alert('¡Guardado exitosamente!');
    }
  }, { type: 'spinner', text: 'Enviando...' });
});

*/
