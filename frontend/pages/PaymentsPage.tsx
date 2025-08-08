import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Wallet, DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../hooks/useAuth";
import backend from "~backend/client";
import LoadingSpinner from "../components/LoadingSpinner";

export default function PaymentsPage() {
  const { user, updateWallet, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpCurrency, setTopUpCurrency] = useState<"usd" | "zwl">("usd");
  const [isProcessing, setIsProcessing] = useState(false);

  if (authLoading || !user) {
    return <LoadingSpinner />;
  }

  const handleTopUp = async (paymentMethod: "ecocash" | "onemoney") => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number for the top-up amount.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate API call to payment gateway
      await new Promise(resolve => setTimeout(resolve, 1500));

      const response = await backend.user.topUpWallet({
        userId: user.id,
        amount,
        currency: topUpCurrency,
      });

      updateWallet({
        walletBalanceUsd: response.walletBalanceUsd,
        walletBalanceZwl: response.walletBalanceZwl,
      });

      toast({
        title: "Top-Up Successful",
        description: `Your wallet has been topped up via ${paymentMethod}.`,
      });

      setIsTopUpOpen(false);
      setTopUpAmount("");
    } catch (error) {
      console.error("Top-up failed:", error);
      toast({
        title: "Top-Up Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link to="/parent-dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="h-5 w-5 mr-2" />
              Digital Wallet
            </CardTitle>
            <CardDescription>
              Your current balance and transaction history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">USD Balance</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${user.walletBalanceUsd.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">ZWL Balance</p>
                <p className="text-2xl font-bold text-green-900">
                  ZWL {user.walletBalanceZwl.toFixed(2)}
                </p>
              </div>
            </div>
            <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Top-Up Wallet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Top-Up Your Wallet</DialogTitle>
                  <DialogDescription>
                    Enter the amount and choose your payment method.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={topUpCurrency} onValueChange={(v: "usd" | "zwl") => setTopUpCurrency(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usd">USD</SelectItem>
                          <SelectItem value="zwl">ZWL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Select Payment Method</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleTopUp("ecocash")}
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Processing..." : "Pay with EcoCash"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleTopUp("onemoney")}
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Processing..." : "Pay with OneMoney"}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent payments and top-ups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>No transactions yet.</p>
              <p className="text-sm">Your payment history will appear here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
