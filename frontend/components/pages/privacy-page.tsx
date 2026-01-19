"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Cookie, FileText } from "lucide-react";

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6">
        {/* Introduction */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <p className="text-gray-600">
              Juellehair.com takes your privacy seriously. This privacy policy covers the treatment of personal information that Juellehair.com collects when you are on our website. By visiting Juellehair.com, you are accepting the guidelines described in this privacy policy.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect and Use */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect and Use</h2>
                <p className="text-gray-600 mb-4">
                  Juellehair.com collects your information when you purchase, search, post, visit the website and register for an account. We use your information for the purpose of responding to your request customizing future shopping for you, advertising, improving juellehair.com and communicating with you.
                </p>
                <p className="text-gray-600">
                  Juellehair.com use your order information that we collect to process any orders placed through our website such as processing your payment information, shipping, and emailing you with invoices and/or order confirmations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Protection</h2>
                <p className="text-gray-600">
                  We use fraud detection software to protect the security of your information on our website. It is important for you to be protected against unauthorized access to your password and to your computer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Cookie className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies</h2>
                <p className="text-gray-600">
                  We may set and access Juellehair.com cookies on your computer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Change */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Lock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Change</h2>
                <p className="text-gray-600">
                  Juellehair.com may amend this policy from time to time. If we make any changes in the way we use your personal information we will notify you by posting an announcement on our website.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
