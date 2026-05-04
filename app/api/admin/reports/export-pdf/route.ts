import { NextRequest } from "next/server";
import { requireAdminSession } from "@/lib/admin-session";

const DEFAULT_LARAVEL_API_URL = "http://127.0.0.1:8000/api";
const LARAVEL_API_URL = process.env.LARAVEL_API_URL ?? DEFAULT_LARAVEL_API_URL;

export async function GET(request: NextRequest) {
  try {
    const { token } = await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "today";

    const response = await fetch(`${LARAVEL_API_URL}/admin/orders/export-pdf?filter=${filter}`, {
      headers: {
        Accept: "text/html",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return new Response("Gagal mengambil data laporan PDF dari backend.", { 
        status: response.status 
      });
    }

    const html = await response.text();
    
    // Return HTML which has window.print() script
    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("PDF Export error:", error);
    return new Response("Unauthorized or Session Expired", { status: 401 });
  }
}
