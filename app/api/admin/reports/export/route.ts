import { NextRequest } from "next/server";
import { requireAdminSession } from "@/lib/admin-session";

const DEFAULT_LARAVEL_API_URL = "http://127.0.0.1:8000/api";
const LARAVEL_API_URL = process.env.LARAVEL_API_URL ?? DEFAULT_LARAVEL_API_URL;

export async function GET(request: NextRequest) {
  try {
    const { token } = await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "today";

    const response = await fetch(`${LARAVEL_API_URL}/admin/orders/export?filter=${filter}`, {
      headers: {
        Accept: "text/csv",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return new Response("Gagal mengambil data laporan dari backend.", { 
        status: response.status 
      });
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition");
    
    // Forward the CSV response with correct headers
    return new Response(blob, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": contentDisposition || `attachment; filename="laporan-faste-coffee-${filter}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    // If requireAdminSession redirects, it throws an error that Next.js handles,
    // but in an API route we should ideally return a 401.
    return new Response("Unauthorized or Session Expired", { status: 401 });
  }
}
