"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Phone, Mail, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

export function AppointmentSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    service: "",
    message: "",
  });

  const appointmentMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // For now, we'll use the contact endpoint to send appointment requests
      // You can create a dedicated appointment endpoint later if needed
      return api.post("/contact", {
        name: data.name,
        email: data.email,
        subject: `Appointment Request - ${data.service || "General"}`,
        message: `Appointment Request Details:\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nPreferred Date: ${data.date}\nPreferred Time: ${data.time}\nService: ${data.service || "General"}\n\nAdditional Message:\n${data.message}`,
      });
    },
    onSuccess: () => {
      toast.success("Appointment request sent successfully! We'll contact you soon to confirm.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        service: "",
        message: "",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send appointment request");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.date || !formData.time) {
      toast.error("Please fill in all required fields");
      return;
    }
    appointmentMutation.mutate(formData);
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <section id="appointment" className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Book an Appointment
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Schedule a consultation with our hair experts. We're here to help you find the perfect style!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Phone className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
                <a href="tel:+233539506949" className="text-purple-600 hover:text-purple-700">
                  +(233) 539506949
                </a>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Mail className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
                <a href="mailto:sales@juellehairgh.com" className="text-purple-600 hover:text-purple-700 text-sm">
                  sales@juellehairgh.com
                </a>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Visit Us</h3>
                <p className="text-gray-600 text-sm">Dansoman, Accra, Ghana</p>
              </CardContent>
            </Card>
          </div>

          {/* Appointment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name *</label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        placeholder="+233 XX XXX XXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Service Type</label>
                      <Input
                        type="text"
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        placeholder="e.g., Wig Consultation, Hair Styling"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred Date *</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                          min={today}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred Time *</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Additional Message</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Tell us about your hair needs or any special requests..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={appointmentMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {appointmentMutation.isPending ? "Sending..." : "Book Appointment"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
