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
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
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
      toast.success("Thanks! We’ll get back to you shortly.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      toast.error("Could not send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen">
      {/* Hero band */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-emerald-600 via-blue-700 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
              Contact Milkii
            </h1>
            <p className="text-lg text-white/80">
              Questions about agri-input imports, veterinary drug distribution, or pilots?
              Our team is here to help—importers, distributors, clinics & cooperatives.
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
              <Card className="overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                      <Phone className="h-6 w-6" />
                    </div>
                    <CardTitle>Phone</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg text-gray-700">
                    +251905078826
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                      <Mail className="h-6 w-6" />
                    </div>
                    <CardTitle>Email</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <CardDescription className="text-lg text-gray-700">
                      hello@milkii.africa
                    </CardDescription>
                    <CardDescription className="text-lg text-gray-700">
                      support@milkii.africa
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <CardTitle>Address</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg text-gray-700">
                    Bole, Addis Ababa, Ethiopia
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                      <Clock className="h-6 w-6" />
                    </div>
                    <CardTitle>Business Hours</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg text-gray-700 space-y-1">
                    <div>Mon – Fri: 9:00 AM – 6:00 PM</div>
                    <div>Saturday: 10:00 AM – 4:00 PM</div>
                    <div>Sunday: Closed</div>
                    <div className="text-sm text-amber-700 font-medium mt-2">
                      24/7 support for critical cold-chain inquiries
                    </div>
                  </CardDescription>
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
                  Tell us how we can help—imports, distribution, integrations, or pilots.
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
                        placeholder="you@company.com"
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
                        placeholder="Import inquiry, distributor onboarding, etc."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Share details about your use case or requirements…"
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
                  How quickly can we get started?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  Most deployments begin with a short discovery and data import. Small teams can
                  go live in 1–2 weeks; larger importer/distributor setups typically take 3–4 weeks
                  including training and pilot.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2">
                <AccordionTrigger className="text-left text-base md:text-lg">
                  Do you support custom integrations?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  Yes—REST APIs plus connectors for ERP/accounting, payments, SMS/WhatsApp and
                  cold-chain devices. We can scope bespoke integrations for your stack.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3">
                <AccordionTrigger className="text-left text-base md:text-lg">
                  What kind of support do you provide?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  24/7 technical support for critical issues, onboarding for field teams, and
                  dedicated account management for multi-branch importers and distributors.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4">
                <AccordionTrigger className="text-left text-base md:text-lg">
                  Is our data secure?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700">
                  We use encryption in transit and at rest, RBAC with audit trails, backups, and
                  optional on-prem/hybrid deployments to meet regulatory requirements.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
