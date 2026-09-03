/**
 * POSTURAFIT™ - High-Converting Interactive Engine
 * Metodología NeuroFunnel (Iconic Studio) | Adaptado a Huánuco, Perú
 */

// ==========================================
// 1. CONFIGURACIÓN PRINCIPAL
// ==========================================
const CONFIG = {
  // Número de WhatsApp comercial oficial (983001517) con código Perú 51
  WHATSAPP_NUMBER: "51983001517",
  
  // Lista de precios oficiales en Soles Peruanos (S/.)
  PRICES: {
    1: { name: "1 Unidad (Individual)", price: 69.90, savings: "Envío Gratis en Huánuco", units: 1 },
    2: { name: "2 Unidades (Combo Pareja / MÁS VENDIDO)", price: 109.90, savings: "Ahorras 21% (S/. 54.95 c/u)", units: 2, recommended: true },
    3: { name: "3 Unidades (Combo Familiar)", price: 149.90, savings: "Ahorras 29% (S/. 49.97 c/u)", units: 3 }
  },

  // Tiempo del temporizador en minutos (Urgencia ética NeuroFunnel)
  TIMER_MINUTES: 15
};

// Estado reactivo de la aplicación
const state = {
  selectedCombo: 1, // Por defecto 1 Unidad (S/. 69.90)
  sizes: ["M", "M", "M"] // Tallas por unidad
};

// ==========================================
// 2. INICIALIZACIÓN AL CARGAR EL DOM
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initCountdownTimer();
  initComboSelector();
  initFAQAccordion();
  initFormHandler();
  initStickyBar();
  initRecentPurchaseToast();
  initSmoothScroll();
});

// ==========================================
// 3. TEMPORIZADOR REGRESIVO (15 MINUTOS)
// ==========================================
function initCountdownTimer() {
  const timerElements = {
    minutes: document.getElementById("timer-minutes"),
    seconds: document.getElementById("timer-seconds"),
    stickyMin: document.getElementById("sticky-timer-min"),
    stickySec: document.getElementById("sticky-timer-sec"),
    stickyMinDesktop: document.getElementById("sticky-timer-min-desktop"),
    stickySecDesktop: document.getElementById("sticky-timer-sec-desktop")
  };

  const STORAGE_KEY = "posturafit_timer_deadline_v3";
  let deadline = localStorage.getItem(STORAGE_KEY);

  if (!deadline || new Date().getTime() > parseInt(deadline, 10)) {
    deadline = new Date().getTime() + CONFIG.TIMER_MINUTES * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, deadline);
  } else {
    deadline = parseInt(deadline, 10);
  }

  function updateTimer() {
    const now = new Date().getTime();
    let diff = deadline - now;

    if (diff <= 0) {
      deadline = new Date().getTime() + CONFIG.TIMER_MINUTES * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, deadline);
      diff = deadline - now;
    }

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const formatM = String(minutes).padStart(2, "0");
    const formatS = String(seconds).padStart(2, "0");

    if (timerElements.minutes) timerElements.minutes.textContent = formatM;
    if (timerElements.seconds) timerElements.seconds.textContent = formatS;
    if (timerElements.stickyMin) timerElements.stickyMin.textContent = formatM;
    if (timerElements.stickySec) timerElements.stickySec.textContent = formatS;
    if (timerElements.stickyMinDesktop) timerElements.stickyMinDesktop.textContent = formatM;
    if (timerElements.stickySecDesktop) timerElements.stickySecDesktop.textContent = formatS;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// ==========================================
// 4. SELECTOR DINÁMICO DE COMBOS Y TALLAS
// ==========================================
function initComboSelector() {
  const comboCards = document.querySelectorAll(".combo-card");
  const comboSelectInput = document.getElementById("combo-select");

  function selectCombo(comboId) {
    state.selectedCombo = parseInt(comboId, 10);
    const comboData = CONFIG.PRICES[state.selectedCombo];

    // Actualizar borde activo en las tarjetas sin alterar el fondo oscuro
    comboCards.forEach(card => {
      const id = parseInt(card.dataset.combo, 10);
      const btn = card.querySelector(".btn-combo-select");
      
      if (id === state.selectedCombo) {
        card.classList.add("active");
        if (btn) btn.textContent = "¡SELECCIONADO! ✓";
      } else {
        card.classList.remove("active");
        if (btn) btn.textContent = id === 1 ? "Seleccionar 1 Unidad" : (id === 2 ? "Seleccionar 2 Unidades" : "Seleccionar 3 Unidades");
      }
    });

    // Actualizar input select si existe
    if (comboSelectInput) {
      comboSelectInput.value = state.selectedCombo;
    }

    // Renderizar selectores de tallas según el número de unidades
    renderSizeSelectors(comboData.units);

    // Actualizar resúmenes de precio
    updatePriceSummaries(comboData);
  }

  comboCards.forEach(card => {
    card.addEventListener("click", () => {
      selectCombo(card.dataset.combo);
    });
  });

  if (comboSelectInput) {
    comboSelectInput.addEventListener("change", (e) => {
      selectCombo(e.target.value);
    });
  }

  // Selección inicial
  selectCombo(state.selectedCombo);
}

// Renderiza los botones de tallas (XS, M, L, XL) para cada unidad comprada
function renderSizeSelectors(totalUnits) {
  const container = document.getElementById("size-selectors-container");
  if (!container) return;

  const sizesOptions = [
    { key: "XS", label: "XS (Muy Delgada)" },
    { key: "M", label: "M (Estándar)" },
    { key: "L", label: "L (Media-Ancha)" },
    { key: "XL", label: "XL (Grande)" }
  ];

  let html = `<div class="space-y-4">`;

  for (let i = 0; i < totalUnits; i++) {
    const unitIndex = i;
    const currentSize = state.sizes[unitIndex] || "M";
    state.sizes[unitIndex] = currentSize;

    html += `
      <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-700">
            ${totalUnits === 1 ? '👉 Elige tu Talla:' : `👉 Talla para el Corrector #${unitIndex + 1}:`}
          </span>
          <span class="text-xs text-sky-600 font-semibold" id="size-label-${unitIndex}">Seleccionada: ${currentSize}</span>
        </div>
        <div class="grid grid-cols-4 gap-2">
          ${sizesOptions.map(opt => `
            <button type="button" 
              class="size-btn py-2 px-1 text-center rounded-lg text-xs font-bold border transition-all ${currentSize === opt.key ? 'active bg-sky-600 text-white border-sky-600 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:border-sky-400'}"
              data-unit="${unitIndex}" 
              data-size="${opt.key}">
              ${opt.key}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  html += `</div>`;
  container.innerHTML = html;

  // Asignar eventos de clic a cada botón de talla
  container.querySelectorAll(".size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const unit = parseInt(btn.dataset.unit, 10);
      const size = btn.dataset.size;
      state.sizes[unit] = size;

      // Actualizar vista de botones en esta unidad
      container.querySelectorAll(`.size-btn[data-unit="${unit}"]`).forEach(b => {
        if (b.dataset.size === size) {
          b.classList.add("active", "bg-sky-600", "text-white", "border-sky-600", "shadow-sm");
          b.classList.remove("bg-white", "text-slate-700", "border-slate-300");
        } else {
          b.classList.remove("active", "bg-sky-600", "text-white", "border-sky-600", "shadow-sm");
          b.classList.add("bg-white", "text-slate-700", "border-slate-300");
        }
      });

      const label = document.getElementById(`size-label-${unit}`);
      if (label) label.textContent = `Seleccionada: ${size}`;
    });
  });
}

function updatePriceSummaries(comboData) {
  const elements = {
    summaryTitle: document.getElementById("order-summary-title"),
    summaryPrice: document.getElementById("order-summary-price"),
    summarySavings: document.getElementById("order-summary-savings"),
    stickyPrice: document.getElementById("sticky-price-display"),
    stickyBadge: document.getElementById("sticky-savings-badge")
  };

  const formattedPrice = `S/. ${comboData.price.toFixed(2)}`;

  if (elements.summaryTitle) elements.summaryTitle.textContent = comboData.name;
  if (elements.summaryPrice) elements.summaryPrice.textContent = formattedPrice;
  if (elements.summarySavings) elements.summarySavings.textContent = comboData.savings;
  if (elements.stickyPrice) elements.stickyPrice.textContent = formattedPrice;
  if (elements.stickyBadge) elements.stickyBadge.textContent = comboData.savings;
}

// ==========================================
// 5. ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ)
// ==========================================
function initFAQAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(item => {
    const trigger = item.querySelector(".faq-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
          const otherContent = otherItem.querySelector(".faq-content");
          if (otherContent) otherContent.style.maxHeight = null;
        }
      });

      if (isActive) {
        item.classList.remove("active");
        const content = item.querySelector(".faq-content");
        if (content) content.style.maxHeight = null;
      } else {
        item.classList.add("active");
        const content = item.querySelector(".faq-content");
        if (content) content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  });
}

// ==========================================
// 6. FORMULARIO DE CHECKOUT Y ENVÍO A WHATSAPP
// ==========================================
function initFormHandler() {
  const form = document.getElementById("order-form");
  const inputNombre = document.getElementById("cliente-nombre");
  const inputTelefono = document.getElementById("cliente-telefono");
  const errorNombre = document.getElementById("nombre-error");
  const errorTelefono = document.getElementById("telefono-error");

  if (!form) return;

  // Restricción en vivo para el Nombre: Solo letras, tildes y espacios
  if (inputNombre) {
    inputNombre.addEventListener("input", () => {
      const original = inputNombre.value;
      const filtrado = original.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
      if (original !== filtrado) {
        inputNombre.value = filtrado;
        if (errorNombre) errorNombre.classList.remove("hidden");
      } else {
        if (errorNombre) errorNombre.classList.add("hidden");
      }
    });
  }

  // Restricción en vivo para el Teléfono: 9 dígitos y empezar siempre con 9
  if (inputTelefono) {
    inputTelefono.addEventListener("input", () => {
      let val = inputTelefono.value.replace(/\D/g, ""); // Solo números
      
      // Si el primer número no es 9, ignorarlo o corregirlo
      if (val.length > 0 && val[0] !== "9") {
        val = "9" + val.slice(0, 8);
        if (errorTelefono) errorTelefono.classList.remove("hidden");
      } else {
        if (errorTelefono) errorTelefono.classList.add("hidden");
      }

      if (val.length > 9) {
        val = val.slice(0, 9);
      }

      inputTelefono.value = val;
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = inputNombre ? inputNombre.value.trim() : "";
    const telefono = inputTelefono ? inputTelefono.value.trim() : "";
    const direccion = document.getElementById("cliente-direccion").value.trim();
    const distrito = document.getElementById("cliente-distrito").value.trim();
    const referencia = document.getElementById("cliente-referencia").value.trim() || "Ninguna especificada";

    // Validar Nombre
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/;
    if (!regexNombre.test(nombre)) {
      if (errorNombre) errorNombre.classList.remove("hidden");
      if (inputNombre) inputNombre.focus();
      alert("Por favor ingresa un nombre válido (mínimo 3 letras, sin números ni caracteres especiales).");
      return;
    } else {
      if (errorNombre) errorNombre.classList.add("hidden");
    }

    // Validar Teléfono (Exactamente 9 dígitos y empieza en 9)
    const regexTelefono = /^9\d{8}$/;
    if (!regexTelefono.test(telefono)) {
      if (errorTelefono) errorTelefono.classList.remove("hidden");
      if (inputTelefono) inputTelefono.focus();
      alert("Por favor ingresa un número de celular peruano válido de 9 dígitos que comience con 9.");
      return;
    } else {
      if (errorTelefono) errorTelefono.classList.add("hidden");
    }

    if (!direccion || !distrito) {
      alert("Por favor completa la dirección y distrito para coordinar tu entrega.");
      return;
    }

    const comboData = CONFIG.PRICES[state.selectedCombo];
    const totalUnits = comboData.units;

    // Resumen de tallas seleccionadas
    let tallasTexto = "";
    if (totalUnits === 1) {
      tallasTexto = `Talla: ${state.sizes[0] || 'M'}`;
    } else {
      tallasTexto = state.sizes.slice(0, totalUnits).map((sz, idx) => `Unidad #${idx + 1}: Talla ${sz}`).join(", ");
    }

    // Construcción del mensaje para WhatsApp oficial
    const mensajeWhatsApp = 
`¡Hola! 👋 Quiero confirmar mi pedido con *PAGO CONTRAENTREGA* en Huánuco:

📦 *PRODUCTO:* Corrector de Postura Ergonómico PosturaFit™
🎁 *OFERTA:* ${comboData.name}
💰 *TOTAL A PAGAR:* S/. ${comboData.price.toFixed(2)} *(Envío Gratis)*
📏 *TALLA(S):* ${tallasTexto}

👤 *DATOS DE ENTREGA:*
• *Nombre:* ${nombre}
• *Celular/WhatsApp:* ${telefono}
• *Distrito:* ${distrito}
• *Dirección Exacta:* ${direccion}
• *Referencia:* ${referencia}

Por favor, confirmen mi despacho para recibir y pagar en mi puerta. ¡Muchas gracias! 🙏`;

    const urlWhatsApp = `https://api.whatsapp.com/send?phone=${CONFIG.WHATSAPP_NUMBER}&text=${encodeURIComponent(mensajeWhatsApp)}`;

    const submitBtn = document.getElementById("submit-order-btn");
    if (submitBtn) {
      submitBtn.innerHTML = `<span>Redirigiendo a WhatsApp...</span> ⏳`;
      submitBtn.disabled = true;
    }

    setTimeout(() => {
      window.location.href = urlWhatsApp;
      if (submitBtn) {
        submitBtn.innerHTML = `<span>¡PEDIDO ENVIADO CON ÉXITO!</span> ✅`;
      }
    }, 400);
  });
}

// ==========================================
// 7. STICKY BAR INFERIOR INTELIGENTE
// ==========================================
function initStickyBar() {
  const stickyBar = document.getElementById("sticky-conversion-bar");
  const heroSection = document.getElementById("hero-section");
  const formSection = document.getElementById("formulario-pedido");

  if (!stickyBar) return;

  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY;
    const heroHeight = heroSection ? heroSection.offsetHeight * 0.4 : 300;
    const formPos = formSection ? formSection.offsetTop - window.innerHeight + 150 : 999999;

    if (scrollPos > heroHeight && scrollPos < formPos) {
      stickyBar.style.transform = "translateY(0)";
      stickyBar.style.opacity = "1";
    } else {
      stickyBar.style.transform = "translateY(100%)";
      stickyBar.style.opacity = "0";
    }
  });
}

// ==========================================
// 8. NOTIFICACIONES SOCIAL PROOF (TOAST EN VIVO)
// ==========================================
function initRecentPurchaseToast() {
  const toast = document.getElementById("recent-purchase-toast");
  if (!toast) return;

  const compradores = [
    { nombre: "Lucía P.", ubicacion: "Amarilis, Huánuco", combo: "Combo Pareja (2x)", tiempo: "hace 4 min" },
    { nombre: "Carlos M.", ubicacion: "Huánuco", combo: "1 Unidad (Talla L)", tiempo: "hace 7 min" },
    { nombre: "Jorge V.", ubicacion: "Cayhuayna, Huánuco", combo: "Combo Familiar (3x)", tiempo: "hace 11 min" },
    { nombre: "Rosa E.", ubicacion: "Esperanza, Huánuco", combo: "Combo Pareja (2x)", tiempo: "hace 15 min" },
    { nombre: "Diego H.", ubicacion: "Amarilis, Huánuco", combo: "1 Unidad (Talla M)", tiempo: "hace 2 min" }
  ];

  let currentIndex = 0;

  function showToast() {
    const item = compradores[currentIndex];
    const toastName = document.getElementById("toast-customer-name");
    const toastLocation = document.getElementById("toast-customer-location");
    const toastCombo = document.getElementById("toast-customer-combo");
    const toastTime = document.getElementById("toast-customer-time");

    if (toastName) toastName.textContent = item.nombre;
    if (toastLocation) toastLocation.textContent = item.ubicacion;
    if (toastCombo) toastCombo.textContent = item.combo;
    if (toastTime) toastTime.textContent = item.tiempo;

    toast.classList.remove("hidden");
    toast.style.display = "block";

    setTimeout(() => {
      toast.classList.add("hidden");
      toast.style.display = "none";
    }, 5000);

    currentIndex = (currentIndex + 1) % compradores.length;
  }

  setTimeout(() => {
    showToast();
    setInterval(showToast, 18000);
  }, 5000);
}

// ==========================================
// 9. SCROLL SUAVE
// ==========================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });
}
