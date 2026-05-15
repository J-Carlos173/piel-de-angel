import { NextRequest, NextResponse } from "next/server";
import { WebpayPlus, Environment, Options } from "transbank-sdk";

const COMMERCE_CODE = process.env.TRANSBANK_COMMERCE_CODE!;
const API_KEY = process.env.TRANSBANK_API_KEY!;
const IS_PROD = process.env.TRANSBANK_ENV === "production";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function getTransaction() {
  const options = new Options(
    COMMERCE_CODE,
    API_KEY,
    IS_PROD ? Environment.Production : Environment.Integration
  );
  return new WebpayPlus.Transaction(options);
}

// Transbank hace POST a esta ruta después del pago
export async function POST(req: NextRequest) {
  const body = await req.formData().catch(() => null);
  const params = body
    ? Object.fromEntries(body.entries())
    : Object.fromEntries(new URL(req.url).searchParams.entries());

  const tokenWs: string | undefined = params["token_ws"] as string;
  const tbkToken: string | undefined = params["TBK_TOKEN"] as string;

  // Pago cancelado por el usuario
  if (tbkToken && !tokenWs) {
    return NextResponse.redirect(`${SITE_URL}/checkout/failed?reason=cancelled`);
  }

  // Timeout de sesión
  if (!tokenWs) {
    return NextResponse.redirect(`${SITE_URL}/checkout/failed?reason=timeout`);
  }

  try {
    const tx = getTransaction();
    const result = await tx.commit(tokenWs);

    // Pago aprobado (responseCode 0 = aprobado)
    if (result.response_code === 0) {
      const params = new URLSearchParams({
        order: result.buy_order,
        amount: String(result.amount),
        card: result.card_detail?.card_number ?? "",
        auth: result.authorization_code ?? "",
      });
      return NextResponse.redirect(`${SITE_URL}/checkout/success?${params}`);
    }

    return NextResponse.redirect(`${SITE_URL}/checkout/failed?reason=rejected`);
  } catch (err) {
    console.error("[checkout/confirm]", err);
    return NextResponse.redirect(`${SITE_URL}/checkout/failed?reason=error`);
  }
}
