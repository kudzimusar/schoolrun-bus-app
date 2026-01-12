import React, { useState } from "react";
import { CreditCard, CheckCircle, AlertCircle, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import Header from "../components/Header";
import { useAuth } from "../hooks/useAuth";

export default function Payments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    { id: "weekly", name: "Weekly Pass", price: 15, duration: "7 days", description: "Perfect for short-term needs" },
    { id: "monthly", name: "Monthly Pass", price: 50, duration: "30 days", description: "Most popular for regular students", popular: true },
    { id: "termly", name: "Term Pass", price: 140, duration: "90 days", description: "Best value for the whole term" },
  ];

  const handlePayment = async (plan: any) => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const response = await (backend as any).payments.initiatePaynow({
        userId: user.id,
        amount: plan.price,
        currency: "USD",
        email: user.email || "parent@example.com",
      });

      toast({
        title: "Redirecting to Paynow",
        description: "Please complete your payment on the secure Paynow page.",
      });

      // In a real app, we would redirect:
      // window.location.href = response.browserUrl;
      
      // For demo, we'll simulate success
      setTimeout(() => {
        setIsProcessing(false);
        window.open(response.browserUrl, '_blank');
      }, 1500);

    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Subscription & Payments" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
            <p className="text-gray-600">Secure your child's seat with our flexible subscription options.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {plans.map((plan) => (
              <Card key={plan.id} className={`relative flex flex-col ${plan.popular ? 'border-blue-500 shadow-lg ring-1 ring-blue-500' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600">
                    MOST POPULAR
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-gray-500 ml-1">/ {plan.duration}</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Live GPS Tracking</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Boarding Notifications</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> AI ETA Predictions</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    onClick={() => handlePayment(plan)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Pay with Paynow"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-blue-50 border-blue-100">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-blue-900">
                  <ShieldCheck className="h-5 w-5 mr-2 text-blue-600" />
                  Secure Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-800">
                  We use **Paynow** to process all transactions securely. You can pay using Visa, Mastercard, EcoCash, OneMoney, and more.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-100">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-green-900">
                  <Zap className="h-5 w-5 mr-2 text-green-600" />
                  Instant Activation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-800">
                  Your subscription will be activated immediately after a successful payment. You'll receive a digital receipt via email.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
