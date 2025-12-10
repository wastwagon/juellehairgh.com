"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Wallet, WalletTransaction } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet as WalletIcon, Plus, ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { useCurrencyStore } from "@/store/currency-store";

export function WalletView() {
  const queryClient = useQueryClient();
  const { displayCurrency, convert } = useCurrencyStore();
  const [isMounted, setIsMounted] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: wallet, isLoading: walletLoading } = useQuery<Wallet>({
    queryKey: ["wallet", "me"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/wallet/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: isMounted && typeof window !== "undefined" && !!localStorage.getItem("token"),
    retry: false,
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery<{
    transactions: WalletTransaction[];
    pagination: any;
  }>({
    queryKey: ["wallet", "transactions"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/wallet/me/transactions?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: isMounted && !!wallet && typeof window !== "undefined" && !!localStorage.getItem("token"),
    retry: false,
  });

  const topUpMutation = useMutation({
    mutationFn: async (amount: number) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");

      // Initialize Paystack payment for wallet top-up
      const paymentResponse = await api.post(
        "/payments/initialize",
        {
          amount: amount,
          email: wallet?.user?.email || "",
          metadata: {
            type: "wallet_topup",
            userId: wallet?.userId,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Redirect to Paystack
      if (paymentResponse.data.authorizationUrl) {
        window.location.href = paymentResponse.data.authorizationUrl;
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to initialize top-up");
    },
  });

  const handleTopUp = () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amount < 1) {
      toast.error("Minimum top-up amount is GH₵ 1.00");
      return;
    }
    topUpMutation.mutate(amount);
  };

  if (!isMounted) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (walletLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading wallet...</p>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to load wallet. Please try again later.</p>
      </div>
    );
  }

  const transactions = transactionsData?.transactions || [];
  const balance = Number(wallet.balance);

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 mb-2">Wallet Balance</p>
              <p className="text-4xl font-bold mb-1">GH₵ {balance.toFixed(2)}</p>
              <p className="text-purple-100 text-sm">
                ≈ {formatCurrency(convert(balance), displayCurrency)}
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <WalletIcon className="h-12 w-12" />
            </div>
          </div>
          <Button
            onClick={() => setShowTopUpModal(true)}
            className="mt-6 w-full bg-white text-purple-600 hover:bg-purple-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Top Up Wallet
          </Button>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading transactions...</p>
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const isCredit = transaction.type === "TOP_UP" || transaction.type === "REFUND" || transaction.type === "ADMIN_ADD";
                const amount = Math.abs(transaction.amount);

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          isCredit ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowUp className={`h-4 w-4 ${isCredit ? "text-green-600" : "text-red-600"}`} />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.type === "TOP_UP" && "Wallet Top-Up"}
                          {transaction.type === "PAYMENT" && "Payment"}
                          {transaction.type === "REFUND" && "Refund"}
                          {transaction.type === "ADMIN_ADD" && "Admin Added Funds"}
                          {transaction.type === "ADMIN_DEDUCT" && "Admin Deducted Funds"}
                        </p>
                        {transaction.description && (
                          <p className="text-sm text-gray-600">{transaction.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          isCredit ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isCredit ? "+" : "-"}GH₵ {amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Balance: GH₵ {Number(transaction.balanceAfter).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ArrowUpDown className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No transactions yet</p>
              <p className="text-sm text-gray-500 mt-1">Your transaction history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Top Up Wallet</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Current Balance: GH₵ {balance.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount (GH₵)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Enter amount"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: GH₵ 1.00</p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowTopUpModal(false);
                    setTopUpAmount("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTopUp}
                  disabled={topUpMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {topUpMutation.isPending ? "Processing..." : "Continue to Payment"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
