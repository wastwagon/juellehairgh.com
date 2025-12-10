"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Wallet, WalletTransaction } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Search, DollarSign, TrendingUp, Users, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

export function AdminWallets() {
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: walletsData, isLoading } = useQuery<{
    wallets: Wallet[];
    pagination: any;
  }>({
    queryKey: ["admin", "wallets", searchQuery],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get(`/wallet/admin/all?search=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: isMounted && typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const { data: stats } = useQuery({
    queryKey: ["admin", "wallet-stats"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/wallet/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: isMounted && typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const addFundsMutation = useMutation({
    mutationFn: async ({ walletId, amount, description }: { walletId: string; amount: number; description?: string }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.post(`/wallet/admin/${walletId}/add`, { amount, description }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "wallets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "wallet-stats"] });
      toast.success("Funds added successfully");
      setShowAddModal(false);
      setAmount("");
      setDescription("");
      setSelectedWallet(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add funds");
    },
  });

  const deductFundsMutation = useMutation({
    mutationFn: async ({ walletId, amount, description }: { walletId: string; amount: number; description?: string }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.post(`/wallet/admin/${walletId}/deduct`, { amount, description }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "wallets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "wallet-stats"] });
      toast.success("Funds deducted successfully");
      setShowDeductModal(false);
      setAmount("");
      setDescription("");
      setSelectedWallet(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to deduct funds");
    },
  });

  const handleAddFunds = () => {
    if (!selectedWallet || !amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    addFundsMutation.mutate({
      walletId: selectedWallet.id,
      amount: parseFloat(amount),
      description: description || undefined,
    });
  };

  const handleDeductFunds = () => {
    if (!selectedWallet || !amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (parseFloat(amount) > selectedWallet.balance) {
      toast.error("Amount exceeds wallet balance");
      return;
    }
    deductFundsMutation.mutate({
      walletId: selectedWallet.id,
      amount: parseFloat(amount),
      description: description || undefined,
    });
  };

  if (!isMounted) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading wallets...</p>
      </div>
    );
  }

  const wallets = walletsData?.wallets || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Wallet Management</h1>
          <p className="text-gray-600 mt-1">Manage user wallets and transactions</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Wallets</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalWallets || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    GH₵ {Number(stats.totalBalance || 0).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions || 0}</p>
                </div>
                <ArrowUpDown className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    GH₵ {stats.totalWallets > 0 ? (Number(stats.totalBalance || 0) / stats.totalWallets).toFixed(2) : "0.00"}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Wallets ({walletsData?.pagination?.total || wallets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {wallets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-gray-900">User</th>
                    <th className="text-left p-3 font-semibold text-gray-900">Email</th>
                    <th className="text-left p-3 font-semibold text-gray-900">Balance</th>
                    <th className="text-left p-3 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.map((wallet) => (
                    <tr key={wallet.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium text-gray-900">
                          {wallet.user?.name || "N/A"}
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{wallet.user?.email}</td>
                      <td className="p-3">
                        <span className="font-bold text-green-600">
                          GH₵ {Number(wallet.balance).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedWallet(wallet);
                              setShowAddModal(true);
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedWallet(wallet);
                              setShowDeductModal(true);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            Deduct
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              window.location.href = `/admin/wallets/${wallet.id}`;
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No wallets found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Funds Modal */}
      {showAddModal && selectedWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Add Funds to Wallet</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">User: {selectedWallet.user?.name || selectedWallet.user?.email}</p>
                <p className="text-sm text-gray-600">Current Balance: GH₵ {Number(selectedWallet.balance).toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount (GH₵)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Reason for adding funds"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setAmount("");
                    setDescription("");
                    setSelectedWallet(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddFunds}
                  disabled={addFundsMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {addFundsMutation.isPending ? "Adding..." : "Add Funds"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deduct Funds Modal */}
      {showDeductModal && selectedWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Deduct Funds from Wallet</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">User: {selectedWallet.user?.name || selectedWallet.user?.email}</p>
                <p className="text-sm text-gray-600">Current Balance: GH₵ {Number(selectedWallet.balance).toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount (GH₵)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedWallet.balance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Reason for deducting funds"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeductModal(false);
                    setAmount("");
                    setDescription("");
                    setSelectedWallet(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeductFunds}
                  disabled={deductFundsMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deductFundsMutation.isPending ? "Deducting..." : "Deduct Funds"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
