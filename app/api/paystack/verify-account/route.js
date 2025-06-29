import { NextResponse } from "next/server"
import axios from "axios"

export async function POST(request) {
  try {
    const { accountNumber, bankCode } = await request.json()

    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    )

    if (response.data.status) {
      return NextResponse.json({
        accountName: response.data.data.account_name,
        accountNumber: response.data.data.account_number,
        bankId: response.data.data.bank_id,
      })
    } else {
      return NextResponse.json({ message: "Account verification failed" }, { status: 400 })
    }
  } catch (error) {
    console.error("Account verification error:", error)
    return NextResponse.json({ message: "Account verification failed" }, { status: 500 })
  }
}
