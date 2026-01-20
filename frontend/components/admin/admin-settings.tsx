"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Save, CreditCard, Loader2, Eye, EyeOff, Mail, Send, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function AdminSettings() {
  const queryClient = useQueryClient();
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testEmailStatus, setTestEmailStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [testEmailMessage, setTestEmailMessage] = useState("");
  const [settings, setSettings] = useState({
    siteName: "Juelle Hair",
    siteEmail: "sales@juellehairgh.com",
    sitePhone: "+233 539506949",
    shippingFreeThreshold: 950,
    shippingStandardDays: "3-7",
    returnPolicyDays: 14,
    currencyBase: "GHS",
    paystackSecretKey: "",
    paystackPublicKey: "",
    emailProvider: "smtp",
    smtpHost: "mail.juellehairgh.com",
    smtpPort: "587",
    smtpUser: "admin@juellehairgh.com",
    smtpPassword: "",
    emailFrom: "admin@juellehairgh.com",
    emailFromName: "Le Juelle Hair",
    adminEmail: "",
    maintenanceMode: false,
  });

  // Fetch settings from API
  const { data: apiSettings, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    retry: false,
  });

  // Update local state when API settings are loaded
  useEffect(() => {
    if (apiSettings) {
      setSettings((prev) => ({
        ...prev,
        paystackSecretKey: apiSettings.PAYSTACK_SECRET_KEY || "",
        paystackPublicKey: apiSettings.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        emailProvider: apiSettings.EMAIL_PROVIDER || "smtp",
        smtpHost: apiSettings.SMTP_HOST || "",
        smtpPort: apiSettings.SMTP_PORT || "587",
        smtpUser: apiSettings.SMTP_USER || "",
        smtpPassword: apiSettings.SMTP_PASSWORD || "",
        emailFrom: apiSettings.EMAIL_FROM || "",
        emailFromName: apiSettings.EMAIL_FROM_NAME || "Le Juelle Hair",
        adminEmail: apiSettings.ADMIN_EMAIL || "",
        siteName: apiSettings.SITE_NAME || prev.siteName,
        siteEmail: apiSettings.SITE_EMAIL || prev.siteEmail,
        sitePhone: apiSettings.SITE_PHONE || prev.sitePhone,
        shippingFreeThreshold: apiSettings.SHIPPING_FREE_THRESHOLD ? parseFloat(apiSettings.SHIPPING_FREE_THRESHOLD) : prev.shippingFreeThreshold,
        shippingStandardDays: apiSettings.SHIPPING_STANDARD_DAYS || prev.shippingStandardDays,
        returnPolicyDays: apiSettings.RETURN_POLICY_DAYS ? parseInt(apiSettings.RETURN_POLICY_DAYS) : prev.returnPolicyDays,
        maintenanceMode: apiSettings.MAINTENANCE_MODE === "true",
      }));
    }
  }, [apiSettings]);

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async (settingsToSave: typeof settings) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      
      return api.put(
        "/admin/settings",
        {
          settings: [
            { key: "SITE_NAME", value: settingsToSave.siteName, category: "general" },
            { key: "SITE_EMAIL", value: settingsToSave.siteEmail, category: "general" },
            { key: "SITE_PHONE", value: settingsToSave.sitePhone, category: "general" },
            { key: "SHIPPING_FREE_THRESHOLD", value: settingsToSave.shippingFreeThreshold.toString(), category: "shipping" },
            { key: "SHIPPING_STANDARD_DAYS", value: settingsToSave.shippingStandardDays, category: "shipping" },
            { key: "RETURN_POLICY_DAYS", value: settingsToSave.returnPolicyDays.toString(), category: "returns" },
            { key: "PAYSTACK_SECRET_KEY", value: settingsToSave.paystackSecretKey, category: "payment" },
            { key: "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY", value: settingsToSave.paystackPublicKey, category: "payment" },
            { key: "EMAIL_PROVIDER", value: settingsToSave.emailProvider, category: "email" },
            { key: "SMTP_HOST", value: settingsToSave.smtpHost, category: "email" },
            { key: "SMTP_PORT", value: settingsToSave.smtpPort, category: "email" },
            { key: "SMTP_USER", value: settingsToSave.smtpUser, category: "email" },
            { key: "SMTP_PASSWORD", value: settingsToSave.smtpPassword, category: "email" },
            { key: "EMAIL_FROM", value: settingsToSave.emailFrom, category: "email" },
            { key: "EMAIL_FROM_NAME", value: settingsToSave.emailFromName, category: "email" },
            { key: "ADMIN_EMAIL", value: settingsToSave.adminEmail, category: "email" },
            { key: "MAINTENANCE_MODE", value: settingsToSave.maintenanceMode.toString(), category: "general" },
          ],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      toast.success("Settings saved successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save settings");
    },
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  // Test email mutation
  const testEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      
      const response = await api.post(
        "/admin/settings/test-email",
        { email },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setTestEmailStatus("success");
      setTestEmailMessage(data.message || "Test email sent successfully! Check your inbox.");
      setTimeout(() => {
        setTestEmailStatus("idle");
        setTestEmailMessage("");
        setTestEmail("");
      }, 5000);
    },
    onError: (error: any) => {
      setTestEmailStatus("error");
      setTestEmailMessage(error.response?.data?.message || error.message || "Failed to send test email. Please check your configuration.");
    },
  });

  const handleTestEmail = () => {
    if (!testEmail || !testEmail.includes("@")) {
      setTestEmailStatus("error");
      setTestEmailMessage("Please enter a valid email address");
      return;
    }
    setTestEmailStatus("sending");
    setTestEmailMessage("");
    testEmailMutation.mutate(testEmail);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage platform settings and configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Site Name</label>
            <Input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contact Email</label>
            <Input
              type="email"
              value={settings.siteEmail}
              onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contact Phone</label>
            <Input
              type="tel"
              value={settings.sitePhone}
              onChange={(e) => setSettings({ ...settings, sitePhone: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <label className="text-sm font-bold text-amber-900 block">
                    Maintenance Mode
                  </label>
                  <p className="text-xs text-amber-700 mt-1">
                    When active, only administrators can access the website. All other visitors will see a maintenance page.
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Free Shipping Threshold (GHS)</label>
            <Input
              type="number"
              value={settings.shippingFreeThreshold}
              onChange={(e) =>
                setSettings({ ...settings, shippingFreeThreshold: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Standard Delivery Days</label>
            <Input
              type="text"
              value={settings.shippingStandardDays}
              onChange={(e) => setSettings({ ...settings, shippingStandardDays: e.target.value })}
              placeholder="3-7"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Return & Refund Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Return Policy Days</label>
            <Input
              type="number"
              value={settings.returnPolicyDays}
              onChange={(e) =>
                setSettings({ ...settings, returnPolicyDays: parseInt(e.target.value) || 14 })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Currency Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Base Currency</label>
            <Input
              type="text"
              value={settings.currencyBase}
              onChange={(e) => setSettings({ ...settings, currencyBase: e.target.value })}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Base currency cannot be changed</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Service Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email Provider</label>
            <select
              value={settings.emailProvider}
              onChange={(e) => setSettings({ ...settings, emailProvider: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="smtp">SMTP (Namecheap, Gmail, Outlook, etc.)</option>
              <option value="mailgun">Mailgun</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select your email service provider. Changes require backend restart to take effect.
            </p>
          </div>

          {settings.emailProvider === "smtp" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">SMTP Host</label>
                <Input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                  placeholder="smtp.gmail.com or smtp.yourdomain.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your SMTP server hostname (e.g., smtp.gmail.com, mail.yourdomain.com)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SMTP Port</label>
                <Input
                  type="text"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                  placeholder="587"
                />
                <p className="text-xs text-gray-500 mt-1">
                  SMTP port (usually 587 for TLS, 465 for SSL, or 25 for unencrypted)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SMTP Username</label>
                <Input
                  type="text"
                  value={settings.smtpUser}
                  onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                  placeholder="your-email@yourdomain.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your SMTP account username/email address
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SMTP Password</label>
                <div className="relative">
                  <Input
                    type={showSmtpPassword ? "text" : "password"}
                    value={settings.smtpPassword}
                    onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                    placeholder="Your SMTP password or app password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={showSmtpPassword ? "Hide password" : "Show password"}
                  >
                    {showSmtpPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your SMTP account password. For Gmail, use an App Password instead of your regular password.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">From Email Address</label>
                <Input
                  type="email"
                  value={settings.emailFrom}
                  onChange={(e) => setSettings({ ...settings, emailFrom: e.target.value })}
                  placeholder="noreply@yourdomain.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email address that appears as the sender (must match your SMTP account domain)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">From Name</label>
                <Input
                  type="text"
                  value={settings.emailFromName}
                  onChange={(e) => setSettings({ ...settings, emailFromName: e.target.value })}
                  placeholder="Le Juelle Hair"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Display name that appears as the sender (e.g., "Le Juelle Hair")
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Admin Notification Email</label>
                <Input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                  placeholder="admin@gmail.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email address to receive admin notifications (new orders, payments, new customers). Can be any email address including Gmail.
                </p>
              </div>

              {/* Test Email Section */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-2">Test Email Configuration</label>
                <p className="text-xs text-gray-500 mb-3">
                  Enter an email address to send a test email and verify your SMTP configuration is working.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    className="flex-1"
                    disabled={testEmailStatus === "sending"}
                  />
                  <Button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={testEmailStatus === "sending" || !testEmail || !testEmail.includes("@")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {testEmailStatus === "sending" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Test
                      </>
                    )}
                  </Button>
                </div>
                
                {testEmailStatus === "success" && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">Success!</p>
                      <p className="text-xs text-green-700 mt-1">{testEmailMessage}</p>
                    </div>
                  </div>
                )}

                {testEmailStatus === "error" && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">Error</p>
                      <p className="text-xs text-red-700 mt-1">{testEmailMessage}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> After saving SMTP settings, restart the backend server for changes to take effect.
                </p>
                <p className="text-xs text-blue-800 mt-1">
                  <strong>Gmail Users:</strong> You need to enable 2-factor authentication and create an App Password. Go to Google Account → Security → App Passwords.
                </p>
                <p className="text-xs text-blue-800 mt-1">
                  <strong>Domain Email:</strong> Use your domain's SMTP server (e.g., mail.yourdomain.com) for professional email delivery.
                </p>
              </div>
            </div>
          )}

          {settings.emailProvider === "mailgun" && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Mailgun Configuration:</strong> For Mailgun settings, configure MAILGUN_API_KEY and MAILGUN_DOMAIN in your environment variables or contact your administrator.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Paystack Payment Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Paystack Secret Key (Backend)</label>
            <div className="relative">
              <Input
                type={showSecretKey ? "text" : "password"}
                value={settings.paystackSecretKey}
                onChange={(e) => setSettings({ ...settings, paystackSecretKey: e.target.value })}
                placeholder="sk_live_... or sk_test_..."
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showSecretKey ? "Hide secret key" : "Show secret key"}
              >
                {showSecretKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Secret key for backend payment processing. Get your keys from{" "}
              <a
                href="https://paystack.com/dashboard/settings/developer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                Paystack Dashboard
              </a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Paystack Public Key (Frontend)</label>
            <Input
              type="text"
              value={settings.paystackPublicKey}
              onChange={(e) => setSettings({ ...settings, paystackPublicKey: e.target.value })}
              placeholder="pk_live_... or pk_test_..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Public key for frontend payment initialization. Starts with "pk_live_" or "pk_test_"
            </p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Changes to Paystack keys take effect immediately. The backend will use these keys for all payment operations.
            </p>
            <p className="text-xs text-blue-800 mt-2">
              <strong>Key Types:</strong> Use test keys (sk_test_/pk_test_) for development and live keys (sk_live_/pk_live_) for production.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          className="flex items-center gap-2"
          disabled={saveMutation.isPending || isLoading}
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
