import { NextResponse } from "next/server"

const Z_API_URL = "https://api.z-api.io/instances/3EB605034006810864C082D554977C76/token/949E614B58871AA0858B975F"
const CLIENT_TOKEN = "F4e475885d6ba4f8c9f0f9bd4263bc640S"

export async function GET() {
  try {
    console.log("[v0] Buscando grupos na Z-API...")

    const response = await fetch(`${Z_API_URL}/groups`, {
      method: "GET",
      headers: {
        "Client-Token": CLIENT_TOKEN,
      },
    })

    const data = await response.json()

    console.log("[v0] Resposta da Z-API:", JSON.stringify(data).substring(0, 200))

    if (!response.ok) {
      throw new Error(data.message || "Erro ao buscar grupos")
    }

    return NextResponse.json({
      success: true,
      groups: data,
    })
  } catch (error: any) {
    console.error("[v0] Erro ao buscar grupos:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
