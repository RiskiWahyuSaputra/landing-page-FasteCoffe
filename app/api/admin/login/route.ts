import { NextResponse } from "next/server";

const API_URL = process.env.LARAVEL_API_URL ?? "https://coffeshop-ki.fwh.is";

export async function GET() {
  return NextResponse.json({
    message: "Proxy login route aktif. Gunakan POST untuk login.",
    backend: `${API_URL}/api/admin/login`,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/api/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const text = await response.text();

    let data: unknown;

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          message: "Backend Laravel membalas bukan JSON.",
          backendStatus: response.status,
          backendResponsePreview: text.slice(0, 1000),
        },
        {
          status: 502,
        },
      );
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Gagal terhubung ke backend Laravel.",
        error: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
      },
    );
  }
}
