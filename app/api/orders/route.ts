import { NextResponse } from "next/server";

import { createOrder, LaravelApiError } from "@/lib/laravel-admin-api";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const body = contentType.includes("multipart/form-data")
    ? await request.formData().catch(() => null)
    : await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { message: "Payload checkout tidak valid." },
      { status: 400 }
    );
  }

  try {
    const response = await createOrder(
      body as {
        customer_name: string;
        customer_phone: string;
        pickup_note?: string;
        payment_method: string;
        payment_proof?: File;
        service_fee: number;
        items: Array<{
          description: string;
          image_url?: string | null;
          name: string;
          numeric_price: number;
          quantity: number;
        }>;
      }
    );

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof LaravelApiError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { message: "Gagal menyimpan order checkout." },
      { status: 500 }
    );
  }
}
