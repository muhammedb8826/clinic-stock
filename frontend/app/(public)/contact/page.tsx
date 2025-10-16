"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Phone, Mail, MapPin, Clock, Send, Pill, Shield, Heart, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      // TODO: send to your backend / API
      toast.success("Thanks! We'll get back to you shortly.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      toast.error("Could not send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const contactMethods = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone",
      description: "+251905078826",
      subtitle: "Call us for immediate assistance",
      color: "bg-emerald-50 text-emerald-700"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      description: "info@wanofipharmacy.com",
      subtitle: "Send us detailed inquiries",
      color: "bg-blue-50 text-blue-700"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Address",
      description: "Bole, Addis Ababa, Ethiopia",
      subtitle: "Visit our main office",
      color: "bg-indigo-50 text-indigo-700"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Business Hours",
      description: "Mon – Fri: 9:00 AM – 6:00 PM",
      subtitle: "Saturday: 10:00 AM – 4:00 PM",
      color: "bg-amber-50 text-amber-700"
    },
  ];

  const services = [
    {
      icon: <Pill className="h-5 w-5" />,
      title: "Prescription Management",
      description: "Digital prescription handling and patient care"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Regulatory Compliance",
      description: "FDA compliance and quality assurance"
    },
    {
      icon: <Heart className="h-5 w-5" />,
      title: "Patient Care",
      description: "Comprehensive healthcare retail solutions"
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: "Support & Training",
      description: "24/7 technical support and staff training"
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero band */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-emerald-600 via-blue-700 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
              Contact Wan Ofi Pharmacy
            </h1>
            <p className="text-lg text-white/80">
              Questions about pharmacy management, prescription systems, or cosmetic retail solutions?
              Our team is here to help—pharmacists, healthcare providers, and retail managers.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="space-y-8">
              {contactMethods.map((method, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${method.color}`}>
                        {method.icon}
                      </div>
                      <CardTitle>{method.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-lg text-gray-700 font-medium">
                      {method.description}
                    </CardDescription>
                    <CardDescription className="text-sm text-gray-500 mt-1">
                      {method.subtitle}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}

              {/* Services */}
              <Card className="overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
                <CardHeader>
                  <CardTitle>Our Services</CardTitle>
                  <CardDescription>How we can help your pharmacy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services.map((service, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="p-1 rounded bg-emerald-50 text-emerald-600">
                          {service.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{service.title}</h4>
                          <p className="text-xs text-gray-600">{service.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
              <CardHeader>
                <CardTitle className="text-2xl">Send us a message</CardTitle>
                <CardDescription>
                  Tell us how we can help—pharmacy management, prescription systems, integrations, or consultations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="you@pharmacy.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+251 9•• ••• ••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        placeholder="Pharmacy inquiry, prescription system, etc."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Share details about your pharmacy needs or requirements…"
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    <Send className="h-5 w-5 mr-2" />
                    {submitting ? "Sending…" : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ — Accordion */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Frequently asked questions
          </h2>

          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger className="text-left text-base md:text-lg">
                  How quickly can we get started with Wan Ofi Pharmacy?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  Most pharmacy implementations begin with a short discovery and data import. Small pharmacies can
                  go live in 1–2 weeks; larger pharmacy chains typically take 3–4 weeks
                  including training and pilot testing.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2">
                <AccordionTrigger className="text-left text-base md:text-lg">
                  Do you support custom integrations for pharmacy systems?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  Yes—REST APIs plus connectors for ERP/accounting, payment systems, SMS/WhatsApp notifications and
                  pharmacy management devices. We can scope bespoke integrations for your pharmacy stack.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3">
                <AccordionTrigger className="text-left text-base md:text-lg">
                  What kind of support do you provide for pharmacies?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  24/7 technical support for critical pharmacy issues, onboarding for pharmacy staff, and
                  dedicated account management for multi-location pharmacy chains.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4">
                <AccordionTrigger className="text-left text-base md:text-lg">
                  Is our pharmacy data secure and compliant?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  We use encryption in transit and at rest, role-based access control with audit trails, backups, and
                  optional on-prem/hybrid deployments to meet FDA and regulatory requirements.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-5">
                <AccordionTrigger className="text-left text-base md:text-lg">
                  Can Wan Ofi Pharmacy handle cosmetic and beauty products?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  Absolutely! Our system supports comprehensive cosmetic retail management including inventory tracking,
                  customer preferences, beauty product categories, and integrated point-of-sale for cosmetics.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
            <CardContent className="py-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Modernize Your Pharmacy?</h3>
              <p className="text-gray-600 mb-6">Join hundreds of pharmacies already using Wan Ofi Pharmacy for better patient care and operational efficiency.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700">
                  Schedule Demo
                </Button>
                <Button size="lg" variant="outline">
                  Download Brochure
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}