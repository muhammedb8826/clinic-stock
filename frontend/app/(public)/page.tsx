'use client';
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  // --- Slider ref for Partners section ---
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const scrollByAmount = (dir: "left" | "right") => {
    const el = sliderRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  // Testimonials tailored to Milkii’s importer → distributor/clinic/farmer value chain
  const testimonials = [
    {
      quote:
        "As a regional distributor, batch/expiry and route planning cut product returns by 28%. We deliver faster with fewer losses.",
      author: "Eastern Agri Distributor"
    },
    {
      quote:
        "Importer portal keeps supplier COAs and permits in one place. Landed cost and compliance prep are finally painless.",
      author: "Partner Importer, Addis Ababa"
    },
    {
      quote:
        "For our dairy farm, vaccine temp logs and FEFO reduced spoilage and improved herd health tracking.",
      author: "Togocha Dairy Cooperative"
    },
    {
      quote:
        "Clinic POS + e-Rx ties dispensing to licensed vets. Traceability made inspections straightforward.",
      author: "Dire Dawa Vet Clinic"
    },
    {
      quote:
        "From purchase planning to last-mile proof-of-delivery, Milkii coordinates suppliers, sellers and farmers smoothly.",
      author: "Milk & Feed Retailer, Harari"
    },
  ];

  // FAQ content
  const faqs = [
    { q: "Can Milkii work offline?", a: "Yes. Core transactions queue locally (POS, stock moves) and sync when back online." },
    { q: "Do you support on-premise deployments?", a: "We support cloud, on-prem, and hybrid to meet regulatory and connectivity needs." },
    { q: "Is there role-based access control?", a: "Yes—Importer, Distributor, Clinic, Inspector and custom roles with granular permissions." },
    { q: "What integrations are available?", a: "REST APIs; we integrate with ERPs, accounting, SMS/WhatsApp, and payment providers." },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-blue-700 to-blue-900" />
        <svg className="absolute -top-24 -right-24 opacity-20" width="500" height="500" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="#ffffff" d="M43.3,-68.4C55.4,-60.8,63.8,-46.7,71.1,-31.8C78.3,-16.8,84.4,-0.9,83.3,14.9C82.2,30.7,73.8,46.4,61.4,57.8C49,69.1,32.6,76,16.3,79.2C0,82.5,-16.2,82,-31.7,76.4C-47.1,70.7,-61.7,59.8,-71.1,45.3C-80.5,30.8,-84.7,12.7,-83.7,-4.2C-82.6,-21.1,-76.4,-36.9,-66.1,-48.7C-55.9,-60.5,-41.6,-68.4,-26.3,-74.2C-11,-80,5.3,-83.7,19.7,-79.2C34.1,-74.8,46.6,-62.1,43.3,-68.4Z" transform="translate(100 100)"/></svg>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                Modern Supply & Medical Management for <span className="text-emerald-200">Dairy & Veterinary</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-blue-100 max-w-xl">
                Milkii Agricultural Import supplies agricultural inputs and veterinary drugs to sellers and end-users (farmers),
                helping importers, distributors, vet clinics, and cooperatives manage cold-chain, batch/expiry, and last-mile delivery.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/register"><Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">Start Free</Button></Link>
                <Link href="#features"><Button size="lg" variant="secondary" className="bg-transparent border border-white/30 text-white hover:bg-white/10">Explore Features <ArrowRight className="ml-2 h-4 w-4"/></Button></Link>
              </div>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-white/90">
                {[
                  {icon:<ShieldCheck className="h-5 w-5"/>,label:"Regulatory-ready"},
                  {icon:<Thermometer className="h-5 w-5"/>,label:"Cold-chain"},
                  {icon:<Barcode className="h-5 w-5"/>,label:"Batch & Trace"},
                  {icon:<Truck className="h-5 w-5"/>,label:"Last-mile"},
                ].map((i,idx)=> (
                  <div key={idx} className="flex items-center gap-2 text-sm"><span>{i.icon}</span><span>{i.label}</span></div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6, delay:0.1}} className="lg:justify-self-end">
              <div className="relative rounded-2xl bg-white/10 p-6 backdrop-blur border border-white/20 shadow-2xl max-w-md mx-auto">
                <div className="grid grid-cols-2 gap-4 text-white text-sm">
                  {[
                    {icon: <Syringe className="h-4 w-4"/>, title: "Vaccines", value: "+120 SKUs"},
                    {icon: <Package className="h-4 w-4"/>, title: "Vet Drugs", value: "+340 SKUs"},
                    {icon: <Leaf className="h-4 w-4"/>, title: "Feed & Additives", value: "+45 Brands"},
                    {icon: <Factory className="h-4 w-4"/>, title: "Suppliers", value: "+60 Partners"},
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

      {/* Logos / Trust */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm mb-6">Trusted by clinics, cooperatives, and distributors</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 opacity-80">
            {["Harar Vet", "Dire Dawa Dairy", "AgriCoop", "EthiVet", "MilkPlus", "GreenFarm"].map((l)=> (
              <div key={l} className="h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-semibold">{l}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section id="products" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What You Can Manage</h2>
            <p className="text-gray-600 mt-2">End-to-end inventory for dairy and animal health</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {icon:<Syringe className="h-6 w-6"/>, title:"Vaccines & Biologics", desc:"Track vial lots, storage temps, and usage per herd."},
              {icon:<Package className="h-6 w-6"/>, title:"Veterinary Drugs", desc:"Batch, expiry, controlled items, and prescription logs."},
              {icon:<Leaf className="h-6 w-6"/>, title:"Feed & Additives", desc:"Formulas, premixes, purchase plans, and consumption."},
              {icon:<Thermometer className="h-6 w-6"/>, title:"Cold-Chain Items", desc:"Min/max temperature logs and alerts for excursions."},
              {icon:<ClipboardCheck className="h-6 w-6"/>, title:"Lab & Diagnostics", desc:"Rapid tests, consumables, and results records."},
              {icon:<Store className="h-6 w-6"/>, title:"Retail & Counters", desc:"Point-of-sale for clinic pharmacies with barcodes."},
            ].map((f, i)=> (
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

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Built for Importers, Clinics & Co-ops</h2>
              <p className="mt-4 text-gray-600">From shipment to shot—Milkii centralizes your supply chain with transparency, compliance, and speed.</p>
              <ul className="mt-6 space-y-3 text-gray-700">
                {[
                  { icon: <ShieldCheck className="h-5 w-5 text-emerald-600"/>, text: "Regulatory-ready records (batch, expiry, supplier docs)" },
                  { icon: <Barcode className="h-5 w-5 text-emerald-600"/>, text: "Barcode/QR traceability down to the animal group" },
                  { icon: <Thermometer className="h-5 w-5 text-emerald-600"/>, text: "Cold-chain monitoring & excursion alerts" },
                  { icon: <Layers className="h-5 w-5 text-emerald-600"/>, text: "Multi-branch, multi-warehouse inventory" },
                  { icon: <Truck className="h-5 w-5 text-emerald-600"/>, text: "Route planning & proof-of-delivery" },
                  { icon: <Settings className="h-5 w-5 text-emerald-600"/>, text: "Role-based access (Importer, Distributor, Clinic, Inspector)" },
                ].map((li, i)=> (
                  <li key={i} className="flex items-start gap-3"><span>{li.icon}</span><span>{li.text}</span></li>
                ))}
              </ul>
              <div className="mt-8 flex gap-3">
                <Link href="/demo"><Button size="lg">Request a Demo</Button></Link>
                <Link href="/docs"><Button size="lg" variant="outline">Read Docs</Button></Link>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {title:"Batch & Expiry Control", desc:"FEFO picking, auto-holds, recall lists", icon: <Package className="h-5 w-5"/>},
                {title:"e-Prescription", desc:"Tie sales to licensed vets & patient records", icon: <HeartPulse className="h-5 w-5"/>},
                {title:"Procurement", desc:"RFQs, supplier scorecards, landed cost", icon: <Building2 className="h-5 w-5"/>},
                {title:"Analytics", desc:"Demand forecasting & wastage dashboards", icon: <Users2 className="h-5 w-5"/>},
              ].map((c,i)=> (
                <Card key={i} className="hover:shadow-md">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">{c.icon}</div>
                    <CardTitle className="text-base">{c.title}</CardTitle>
                    <CardDescription>{c.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Timeline */}
      <section id="workflow" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">From Import to Herd Care</h2>
            <p className="text-gray-600">Track every step—transparent and auditable</p>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              {title:"Import", icon:<Globe2 className="h-5 w-5"/>, desc:"Shipments, COAs, permits"},
              {title:"Warehouse", icon:<Layers className="h-5 w-5"/>, desc:"Putaway, FEFO, cycles"},
              {title:"Distribute", icon:<Truck className="h-5 w-5"/>, desc:"Routes, PoD, agents"},
              {title:"Dispense", icon:<Store className="h-5 w-5"/>, desc:"POS, eRx, controls"},
              {title:"Care", icon:<HeartPulse className="h-5 w-5"/>, desc:"Treatment records"},
            ].map((step,i)=> (
              <div key={i} className="relative">
                <div className="p-6 rounded-2xl bg-white shadow-sm border">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">{step.icon}</div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
                {i<4 && <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-emerald-200"/>}
              </div>
            ))}
          </div>
        </div>
      </section>

    {/* Testimonials — FULL-WIDTH, AUTO CAROUSEL */}
    <section className="relative w-screen bg-gray-50 py-20 overflow-hidden">
      {/* Heading */}
      <div className="mx-auto max-w-3xl px-4 text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold">What partners say</h2>
        <p className="text-gray-600">Stories from importers, distributors, clinics & farmers</p>
      </div>

      {/* Carousel */}
      <TestimonialsCarousel />
    </section>


      {/* Newsletter / Lead capture */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold">Get product updates & pilot opportunities</h3>
              <p className="mt-2 text-emerald-100">Join our mailing list for release notes and early access.</p>
            </div>
            <form className="flex gap-3">
              <Input type="email" placeholder="Your email" className="bg-white text-gray-900"/>
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
            <p className="text-gray-600">Based in Ethiopia • Serving clinics & co-ops across the region</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {icon:<Phone className="h-5 w-5"/>, title:"Phone", desc:"+251 ••• •• ••"},
              {icon:<Mail className="h-5 w-5"/>, title:"Email", desc:"hello@milkii.africa"},
              {icon:<MapPin className="h-5 w-5"/>, title:"Office", desc:"Addis Ababa • Bole"},
            ].map((c,i)=> (
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

      {/* FAQ — ACCORDION */}
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
          <h2 className="text-3xl md:text-4xl font-extrabold">Ready to digitize your agri-vet supply chain?</h2>
          <p className="mt-3 text-blue-100">Join clinics, importers, and co-ops using Milkii.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register"><Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">Create account</Button></Link>
            <Link href="/login"><Button size="lg" variant="secondary" className="bg-transparent border border-white/30 text-white hover:bg-white/10">Sign in</Button></Link>
          </div>
        </div>
      </section>
    </>
  );
}
function TestimonialsCarousel() {
  // Use your existing `testimonials` array if already defined above; otherwise define here:
  const testimonials = [
    {
      quote:
        "As a regional distributor, batch/expiry and route planning cut product returns by 28%. We deliver faster with fewer losses.",
      author: "Eastern Agri Distributor",
    },
    {
      quote:
        "Importer portal keeps supplier COAs and permits in one place. Landed cost and compliance prep are finally painless.",
      author: "Partner Importer, Addis Ababa",
    },
    {
      quote:
        "For our dairy farm, vaccine temp logs and FEFO reduced spoilage and improved herd health tracking.",
      author: "Togocha Dairy Cooperative",
    },
    {
      quote:
        "Clinic POS + e-Rx ties dispensing to licensed vets. Traceability made inspections straightforward.",
      author: "Dire Dawa Vet Clinic",
    },
    {
      quote:
        "From purchase planning to last-mile proof-of-delivery, Milkii coordinates suppliers, sellers and farmers smoothly.",
      author: "Milk & Feed Retailer, Harari",
    },
  ];

  const [index, setIndex] = useState(0);

  // Auto-advance every 7 seconds
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
      {/* Stage */}
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
                  “{testimonials[index].quote}”
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

      {/* Controls (optional) */}
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

      {/* Dots */}
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

