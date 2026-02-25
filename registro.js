(() => {
    // Si el dispositivo ya fue registrado, no mostrar formulario
  if (localStorage.getItem("alarmedics_registered") === "true") {
    window.location.href = "./index.html";
    return;
  }
  const form = document.getElementById("registerForm");
  const nombre = document.getElementById("regNombre");
  const apellido = document.getElementById("regApellido");
  const edad = document.getElementById("regEdad");
  const country = document.getElementById("regCountry");
  const telefono = document.getElementById("regTelefono");
  const ciudad = document.getElementById("regCiudad");
  const STORAGE_KEY = "userProfile";

  const PLACEHOLDER_MAP = {
    "56": "Ej: 912345678",
    "58": "Ej: 4121234567",
    "1": "Ej: 7731234567",
    "34": "Ej: 612345678",
    "52": "Ej: 5512345678",
    "57": "Ej: 3012345678",
    "51": "Ej: 987654321",
    "": "Ingresa solo dígitos (sin código de país)"
  };

  function splitPhone(fullNumber, countryCode) {
    const digits = normalizeTelefono(fullNumber);
    const code = normalizeTelefono(countryCode);
    if (!digits) return { country: code, local: "" };
    if (code && digits.startsWith(code)) {
      return { country: code, local: digits.slice(code.length) };
    }
    return { country: code, local: digits };
  }

  function setInitialValues() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.nombre) nombre.value = data.nombre;
      if (data.apellido) apellido.value = data.apellido;
      if (data.edad) edad.value = data.edad;
      if (data.country) country.value = data.country;
      if (data.telefono) {
        const parts = splitPhone(data.telefono, data.country || "");
        telefono.value = parts.local;
      }
      if (data.ciudad) ciudad.value = data.ciudad;
      updatePlaceholder();
    } catch (err) {
      console.warn("No se pudo cargar el perfil previo", err);
    }
  }

  function normalizeTelefono(value) {
    if (!value) return "";
    return value.replace(/\D+/g, "");
  }

  function updatePlaceholder() {
    const code = country?.value || "";
    telefono.placeholder = PLACEHOLDER_MAP[code] || PLACEHOLDER_MAP[""];
  }

  function validate() {
    if (!nombre.value.trim() || !apellido.value.trim()) return false;
    const edadNum = Number(edad.value);
    if (!edad.value || isNaN(edadNum) || edadNum < 1 || edadNum > 120) return false;
    const phone = normalizeTelefono(telefono.value);
    if (!phone) return false;
    return true;
  }

  async function ensureServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch (err) {
      console.warn("No se pudo registrar el service worker en registro", err);
    }
  }

  form?.addEventListener("submit", event => {
    event.preventDefault();
    if (!validate()) {
      alert("Completa todos los campos obligatorios correctamente.");
      return;
    }

    const countryCode = normalizeTelefono(country?.value || "");
    const phoneLocal = normalizeTelefono(telefono.value);
    const phoneFull = `${countryCode}${phoneLocal}`;

    const payload = {
      nombre: nombre.value.trim(),
      apellido: apellido.value.trim(),
      telefono: phoneFull,
      telefonoLocal: phoneLocal,
    };

    try {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

  // marca que este dispositivo ya pasó por registro
  localStorage.setItem("alarmedics_registered", "true");

  window.location.href = "./index.html";

} catch (err) {
      console.error("No se pudo guardar el perfil", err);
      alert("No se pudo guardar el registro en este dispositivo.");
    }
  });

  setInitialValues();
  updatePlaceholder();
  ensureServiceWorker();

  country?.addEventListener("change", updatePlaceholder);
})();
