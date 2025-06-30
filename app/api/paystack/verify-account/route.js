// import { NextResponse } from "next/server"
// import axios from "axios"

// export async function POST(request) {
//   try {
//     const { accountNumber, bankCode } = await request.json()

//     const response = await axios.get(
//       `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         },
//       },
//     )

//     if (response.data.status) {
//       return NextResponse.json({
//         accountName: response.data.data.account_name,
//         accountNumber: response.data.data.account_number,
//         bankId: response.data.data.bank_id,
//       })
//     } else {
//       return NextResponse.json({ message: "Account verification failed" }, { status: 400 })
//     }
//   } catch (error) {
//     console.error("Account verification error:", error)
//     return NextResponse.json({ message: "Account verification failed" }, { status: 500 })
//   }
// }

import { NextResponse } from "next/server";
import axios from "axios";

// Paystack bank account validation endpoint
const PAYSTACK_API_URL = "https://api.paystack.co/bank/validate";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY; // Ensure this is set in .env.local

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      bankCode,
      accountNumber,
      accountName,
      accountType,
      documentType,
      documentNumber,
    } = body;

    // Validate required fields
    if (
      !bankCode ||
      !accountNumber ||
      !accountName ||
      !accountType ||
      !documentType ||
      !documentNumber
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Make request to Paystack API
    const response = await axios.post(
      PAYSTACK_API_URL,
      {
        bank_code: bankCode,
        country_code: "ZA", // South Africa
        account_number: accountNumber,
        account_name: accountName,
        account_type: accountType,
        document_type: documentType,
        document_number: documentNumber,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Return the Paystack response
    return NextResponse.json(
      {
        accountName: response.data.data.account_name,
        verified: response.data.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Paystack verification error:",
      error.response?.data || error
    );
    return NextResponse.json(
      {
        error:
          error.response?.data?.message ||
          "Failed to verify account. Please check your details.",
      },
      { status: error.response?.status || 500 }
    );
  }
}
