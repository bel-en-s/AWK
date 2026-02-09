import nodemailer from "nodemailer";

export async function POST({ request }) {
  try {
    const body = await request.json();

    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim();
    const company = String(body?.company || "").trim();
    const message = String(body?.message || "").trim();
    const services = Array.isArray(body?.services) ? body.services : [];

    if (!name || !email) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const transporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST,
      port: Number(import.meta.env.SMTP_PORT || 587),
      secure: String(import.meta.env.SMTP_SECURE || "false") === "true",
      auth: {
        user: import.meta.env.SMTP_USER,
        pass: import.meta.env.SMTP_PASS,
      },
    });

    const to = "belen.seoane.palmieri@gmail.com";

    const subject = `New contact — ${name}${company ? ` (${company})` : ""}`;

    const text =
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      `Company: ${company || "-"}\n` +
      `Services: ${services.length ? services.join(", ") : "-"}\n\n` +
      `${message || "-"}`;

    await transporter.sendMail({
      from: import.meta.env.MAIL_FROM || import.meta.env.SMTP_USER,
      to,
      replyTo: email,
      subject,
      text,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
