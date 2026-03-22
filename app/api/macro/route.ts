import { NextResponse } from "next/server";
import { getMacroMarkers } from "@/lib/macroEngine";

export async function GET() {
  try {
    const markers = await getMacroMarkers();
    if (!markers) {
      return NextResponse.json({ error: "Macro feed unavailable" }, { status: 503 });
    }

    return NextResponse.json(markers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Macro feed unavailable" }, { status: 500 });
  }
}
