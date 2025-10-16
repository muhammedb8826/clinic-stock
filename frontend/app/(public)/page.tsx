'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ArrowRight, ShieldCheck, Truck, Thermometer, Users2, Syringe, Package, Factory, Leaf,
  ClipboardCheck, Barcode, Phone, Mail, MapPin, HeartPulse, Layers, Settings, Building2, Store, Globe2,
  ChevronLeft, ChevronRight, UserRound
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function HomePage() {
  // FAQ content (aligned to Wan Ofi Pharmacy ops)
  const faqs = [
    { q: "Can Wan Ofi Pharmacy work offline?", a: "Yes. Core transactions (POS and inventory movements) queue locally and auto-sync once online." },
    { q: "Do you support multi-location pharmacies?", a: "Yes. Single stores, chains, and multi-site deployments are supported with centralized control." },
    { q: "Is there role-based access control?", a: "Yes—Pharmacist, Technician, Manager, and custom roles with granular permissions." },
    { q: "What integrations are available?", a: "REST APIs for ERP/accounting, SMS/WhatsApp, payments, and label/barcode printers." },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-blue-700 to-blue-900">
        <div
          aria-hidden
          className="absolute inset-0 bg-[url('/images/pharmacy-hero.jpg')] bg-cover bg-center opacity-10"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-white/10 text-white ring-1 ring-inset ring-white/20 hover:bg-white/15 mb-4">
                <Syringe className="h-3 w-3 mr-1" />
                Wan Ofi Pharmacy
              </Badge>

              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                Modern <span className="text-emerald-200">Pharmacy</span> &{" "}
                <span className="text-emerald-200">Cosmetics</span> Retail
              </h1>

              <p className="mt-6 text-lg md:text-xl text-blue-100 max-w-xl">
                Comprehensive management for prescription medicines, OTC drugs, skincare, and healthcare
                accessories—built for accuracy, compliance, and great customer care.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-transparent border border-white/30 text-white hover:bg-white/10"
                  >
                    Explore Features <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-white/90">
                {[
                  { icon: <ShieldCheck className="h-5 w-5" />, label: "EFDA Compliant" },
                  { icon: <Thermometer className="h-5 w-5" />, label: "Cold-Chain Ready" },
                  { icon: <Barcode className="h-5 w-5" />, label: "Batch & Expiry" },
                  { icon: <Truck className="h-5 w-5" />, label: "Delivery & POS" },
                ].map((i, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span>{i.icon}</span>
                    <span>{i.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:justify-self-end"
            >
              <div className="relative rounded-2xl bg-white/10 p-6 backdrop-blur border border-white/20 shadow-2xl max-w-md mx-auto">
                <div className="grid grid-cols-2 gap-4 text-white text-sm">
                  {[
                    { icon: <Syringe className="h-4 w-4" />, title: "Prescription", value: "500+ Medicines" },
                    { icon: <Package className="h-4 w-4" />, title: "OTC Drugs", value: "300+ Products" },
                    { icon: <Leaf className="h-4 w-4" />, title: "Cosmetics", value: "200+ Brands" },
                    { icon: <Factory className="h-4 w-4" />, title: "Suppliers", value: "50+ Partners" },
                  ].map((k, i) => (
                    <Card key={i} className="bg-white/90 border-none">
                      <CardHeader className="pb-1 flex flex-row items-center gap-2">
                        {k.icon}
                        <CardTitle className="text-xs font-semibold text-gray-900">{k.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-lg font-bold text-gray-800">{k.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <p className="mt-4 text-center text-white/80 text-xs">Sample data for illustration</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section id="products" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What You Can Manage</h2>
            <p className="text-gray-600 mt-2">End-to-end pharmacy & cosmetic retail in one place</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Syringe className="h-6 w-6" />, title: "Prescription Medicines", desc: "Controlled items, dosage forms, patient profiles, and e-Rx." },
              { icon: <Package className="h-6 w-6" />, title: "Over-the-Counter Drugs", desc: "OTC meds, supplements, wellness products, and kits." },
              { icon: <Leaf className="h-6 w-6" />, title: "Skincare & Cosmetics", desc: "Dermocosmetics, makeup, and personal care assortments." },
              { icon: <Thermometer className="h-6 w-6" />, title: "Cold-Chain Items", desc: "Temperature logs, alerts, and compliant storage." },
              { icon: <ClipboardCheck className="h-6 w-6" />, title: "Healthcare Accessories", desc: "Devices, diagnostics, home-care and monitoring." },
              { icon: <Store className="h-6 w-6" />, title: "Retail & POS", desc: "Barcode POS, discounts, receipts, and returns." },
            ].map((f, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                    {f.icon}
                  </div>
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Workflow Timeline */}
      <section id="workflow" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">From Procurement to Patient Care</h2>
            <p className="text-gray-600">Every step is visible—transparent and compliant</p>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { title: "Procurement", icon: <Globe2 className="h-5 w-5" />, desc: "Suppliers, orders, approvals" },
              { title: "Inventory", icon: <Layers className="h-5 w-5" />, desc: "FEFO storage, tracking" },
              { title: "Prescription", icon: <HeartPulse className="h-5 w-5" />, desc: "e-Rx, verification" },
              { title: "Dispensing", icon: <Store className="h-5 w-5" />, desc: "POS, barcode, records" },
              { title: "Follow-up", icon: <Phone className="h-5 w-5" />, desc: "Counseling, reminders" },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="p-6 rounded-2xl bg-white shadow-sm border">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">{step.icon}</div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
                {i < 4 && <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-emerald-200" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative w-screen bg-gray-50 py-20 overflow-hidden">
        <div className="mx-auto max-w-3xl px-4 text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">What partners say</h2>
          <p className="text-gray-600">Stories from pharmacies, clinics & healthcare providers</p>
        </div>
        <TestimonialsCarousel />
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold">Get pharmacy updates & new features</h3>
              <p className="mt-2 text-emerald-100">Join our list for release notes and healthcare insights.</p>
            </div>
            <form className="flex gap-3">
              <Input type="email" placeholder="Your email" aria-label="Email address" className="bg-white text-gray-900" />
              <Button type="submit" className="bg-blue-700 hover:bg-blue-800">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Talk to our team</h2>
            <p className="text-gray-600">Based in Ethiopia • Serving pharmacies & healthcare providers across the region</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Phone className="h-5 w-5" />, title: "Phone", desc: "+251 9••• •• ••" },
              { icon: <Mail className="h-5 w-5" />, title: "Email", desc: "info@wanofipharmacy.com" },
              { icon: <MapPin className="h-5 w-5" />, title: "Office", desc: "Addis Ababa • Bole" },
            ].map((c, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center">{c.icon}</div>
                  <div>
                    <CardTitle className="text-base">{c.title}</CardTitle>
                    <CardDescription>{c.desc}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Frequently asked questions</h2>
          </div>
          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-b last:border-b">
                  <AccordionTrigger className="text-left text-base md:text-lg">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-700 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold">Ready to modernize your pharmacy operations?</h2>
          <p className="mt-3 text-blue-100">Join pharmacies and healthcare providers using Wan Ofi Pharmacy.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">Create account</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="bg-transparent border border-white/30 text-white hover:bg-white/10">Sign in</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function TestimonialsCarousel() {
  const testimonials = [
    {
      quote:
        "Batch tracking and expiry control reduced waste by 35%. We serve patients better with accurate inventory.",
      author: "City Pharmacy Chain",
    },
    {
      quote:
        "e-Prescription and patient records keep us compliant and organized. Our workflow is seamless.",
      author: "Community Health Center",
    },
    {
      quote:
        "For cosmetics, inventory insights help us stock the right products. Category sales increased by 25%.",
      author: "Beauty & Wellness Store",
    },
    {
      quote:
        "POS with barcode scanning makes transactions fast and accurate. Customers love the speed.",
      author: "Family Pharmacy",
    },
    {
      quote:
        "From suppliers to patient care, Wan Ofi Pharmacy coordinates our operations smoothly.",
      author: "Regional Healthcare Provider",
    },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(id);
  }, [testimonials.length]);

  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setIndex((i) => (i + 1) % testimonials.length);

  return (
    <div className="relative w-full">
      <div className="relative mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-4xl min-h-[220px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.45 }}
              className="w-full"
            >
              <div className="rounded-2xl border border-emerald-100/60 bg-gradient-to-br from-emerald-50 to-blue-50 shadow-md p-6 md:p-8">
                <p className="text-lg md:text-xl leading-relaxed text-gray-700">
                  "{testimonials[index].quote}"
                </p>
                <div className="mt-5 flex items-center gap-2 text-sm text-gray-600">
                  <UserRound className="h-5 w-5 text-emerald-600" />
                  <span>{testimonials[index].author}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute inset-x-0 -bottom-2 flex items-center justify-center gap-3">
        <button
          aria-label="Previous testimonial"
          onClick={prev}
          className="rounded-full border bg-white/80 hover:bg-white px-3 py-2 shadow-sm"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          aria-label="Next testimonial"
          onClick={next}
          className="rounded-full border bg-white/80 hover:bg-white px-3 py-2 shadow-sm"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              i === index ? "bg-emerald-600 w-5" : "bg-emerald-200 hover:bg-emerald-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
