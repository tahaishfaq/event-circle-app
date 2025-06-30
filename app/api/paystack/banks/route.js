import { NextResponse } from "next/server"
import axios from "axios"

export async function GET() {
  try {
    const response = await axios.get("https://api.paystack.co/bank", {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      params: {
        country: "south africa",
        enabled_for_verification: true,
        currency: "ZAR"
      }
    })

    if (response.data.status) {
      return NextResponse.json(response.data.data)
    } else {
      return NextResponse.json({ message: "Failed to fetch banks" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error fetching banks:", error)
    return NextResponse.json({ message: "Failed to fetch banks" }, { status: 500 })
  }
}
