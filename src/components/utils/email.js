// src/utils/email.js
import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const TO_EMAIL = import.meta.env.VITE_CONTACT_TO_EMAIL;

function required(name, value) {
  if (!value) throw new Error(`[EmailJS] Missing ${name}`);
}

export async function sendContactEmail(payload) {
  required("VITE_EMAILJS_SERVICE_ID", SERVICE_ID);
  required("VITE_EMAILJS_TEMPLATE_ID", TEMPLATE_ID);
  required("VITE_EMAILJS_PUBLIC_KEY", PUBLIC_KEY);
  required("VITE_CONTACT_TO_EMAIL", TO_EMAIL);

  const {
    name = "",
    email = "",
    company = "",
    message = "",
    services = [],
  } = payload || {};

  const templateParams = {
    to_email: TO_EMAIL,
    from_name: name,
    reply_to: email,
    company,
    message,
    services: Array.isArray(services) ? services.join(", ") : String(services),
    submitted_at: new Date().toISOString(),
  };

  // 👇 DEBUG: te muestra si env está realmente cargado
  console.log("[EmailJS] sending with:", {
    SERVICE_ID,
    TEMPLATE_ID,
    PUBLIC_KEY: PUBLIC_KEY ? `${PUBLIC_KEY.slice(0, 4)}…` : "",
    TO_EMAIL,
    templateParams,
  });

  try {
    const res = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, {
      publicKey: PUBLIC_KEY,
    });
    console.log("[EmailJS] success:", res);
    return res;
  } catch (err) {
    console.error("[EmailJS] failed:", err);
    // EmailJS suele traer err.text con el motivo exacto
    throw new Error(err?.text || err?.message || "EmailJS send failed");
  }
}
