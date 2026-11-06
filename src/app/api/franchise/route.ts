/**
 * Заявка на франшизу.
 * TODO: подключить доставку заявки (CRM, Telegram-бот или почта). Сейчас заявка только
 * проверяется и пишется в лог сервера.
 */

type Body = { name?: unknown; phone?: unknown; city?: unknown; message?: unknown };

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const name = str(body.name, 80);
  const phone = str(body.phone, 32);
  const city = str(body.city, 60);
  const message = str(body.message, 1000);

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Как к вам обращаться?";
  if (phone.replace(/\D/g, "").length < 10) errors.phone = "Нужен номер, чтобы мы перезвонили";
  if (city.length < 2) errors.city = "В каком городе хотите открыться?";

  if (Object.keys(errors).length) {
    return Response.json({ ok: false, errors }, { status: 422 });
  }

  console.log("[franchise] новая заявка", { name, phone, city, message, at: new Date().toISOString() });
  return Response.json({ ok: true });
}
