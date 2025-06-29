
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, CreditCard, Loader2 } from "lucide-react";

export default function BankSetup({ onComplete }) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [creating, setCreating] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    bankCode: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [verified, setVerified] = useState(false);
  const [hasSubaccount, setHasSubaccount] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchBanks();
      checkSubaccountStatus();
    }
  }, [status]);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/paystack/banks");
      setBanks(response.data);
    } catch (error) {
      console.error("Error fetching banks:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load banks",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSubaccountStatus = async () => {
    try {
      const response = await axios.get("/api/paystack/subaccount");
      if (response.data.hasSubaccount) {
        setHasSubaccount(true);
        setBankDetails(response.data.bankDetails || {});
        setVerified(true);
        if (onComplete) onComplete();
      }
    } catch (error) {
      console.error("Error checking subaccount:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check payment account status",
      });
    }
  };

  const handleBankChange = (bankCode) => {
    const selectedBank = banks.find((bank) => bank.code === bankCode);
    setBankDetails({
      ...bankDetails,
      bankCode,
      bankName: selectedBank?.name || "",
      accountName: "",
    });
    setVerified(false);
  };

  const verifyAccount = async () => {
    if (!bankDetails.accountNumber || !bankDetails.bankCode) {
      toast({
        variant: "warning",
        title: "Warning",
        description: "Please select a bank and enter account number",
      });
      return;
    }

    setVerifying(true);
    try {
      const response = await axios.post("/api/paystack/verify-account", {
        accountNumber: bankDetails.accountNumber,
        bankCode: bankDetails.bankCode,
      });

      setBankDetails({
        ...bankDetails,
        accountName: response.data.accountName,
      });
      setVerified(true);

      toast({
        title: "Success",
        description: "Account verified successfully",
      });
    } catch (error) {
      console.error("Account verification error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Account verification failed. Please check your details.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const createSubaccount = async () => {
    if (!verified) {
      toast({
        variant: "warning",
        title: "Warning",
        description: "Please verify your account first",
      });
      return;
    }

    setCreating(true);
    console.log("Creating subaccount with details:", bankDetails);
    try {
      const response = await axios.post("/api/paystack/subaccount", {
        bankDetails,
      });

      toast({
        title: "Success",
        description: "Payment account set up successfully!",
      });

      setHasSubaccount(true);
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Subaccount creation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to set up payment account",
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div
                className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"
                role="status"
                aria-label="Loading bank setup"
              ></div>
              <p className="mt-4 text-gray-600">Loading bank setup...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasSubaccount) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" aria-hidden="true" />
            <div>
              <h3 className="font-semibold text-green-800">Payment Account Active</h3>
              <p className="text-sm text-green-600">
                Your payment account is set up and ready to receive payments from ticket sales.
              </p>
            </div>
          </div>
          {bankDetails.accountName && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm">
                <strong>Bank:</strong> {bankDetails.bankName}
              </p>
              <p className="text-sm">
                <strong>Account:</strong> {bankDetails.accountName}
              </p>
              <p className="text-sm">
                <strong>Number:</strong> ****{bankDetails.accountNumber?.slice(-4)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" aria-hidden="true" />
          Set Up Payment Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>
            To receive payments from ticket sales, you need to set up your bank account. Paystack will automatically
            send 87% of each ticket sale to your account, while the platform keeps 13% as a service fee.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="bank">Select Your Bank</Label>
            <Select value={bankDetails.bankCode} onValueChange={handleBankChange} aria-label="Select your bank">
              <SelectTrigger>
                <SelectValue placeholder="Choose your bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank, index) => (
                  <SelectItem key={index} value={bank.code}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <div className="flex space-x-2">
              <Input
                id="accountNumber"
                value={bankDetails.accountNumber}
                onChange={(e) =>
                  setBankDetails({
                    ...bankDetails,
                    accountNumber: e.target.value,
                  })
                }
                placeholder="Enter your account number"
                maxLength={10}
                aria-label="Enter your account number"
              />
              <Button
                onClick={verifyAccount}
                disabled={verifying || !bankDetails.accountNumber || !bankDetails.bankCode}
                aria-label={verifying ? "Verifying account" : "Verify account"}
              >
                {verifying ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Verify"}
              </Button>
            </div>
          </div>

          {verified && bankDetails.accountName && (
            <Alert>
              <CheckCircle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>
                <strong>Account Verified:</strong> {bankDetails.accountName}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={createSubaccount}
            disabled={!verified || creating}
            className="w-full"
            aria-label={creating ? "Setting up account" : "Complete payment account setup"}
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                Setting up account...
              </>
            ) : (
              "Complete Setup"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
