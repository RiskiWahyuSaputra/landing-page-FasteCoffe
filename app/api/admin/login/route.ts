import { NextResponse } from "next/server";

const API_URL = process.env.LARAVEL_API_URL ?? "https://coffeshop-ki.fwh.is";

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

    const data = await response.json().catch(() => ({
      message: "Response backend bukan JSON.",
    }));

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Gagal terhubung ke backend Laravel.",
      },
      {
        status: 500,
      },
    );
  }
}
