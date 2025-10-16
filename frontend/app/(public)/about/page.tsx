import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users2,
  Target,
  Award,
  Globe2,
  HeartPulse,
  ShieldCheck,
  Leaf,
  Factory,
  Thermometer,
  Barcode,
  Truck,
  MapPin,
  Mail,
  Phone,
  Building2,
  Handshake,
  Recycle,
  Settings,
  Layers,
  Store,
  LineChart,
  Pill,
  Sparkles,
  CheckCircle,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Dr. Sarah Bekele",
      role: "Chief Pharmacist",
      bio: "PharmD, MSc (Clinical Pharmacy). 15+ years in pharmaceutical care and regulatory compliance.",
      image: "👩‍⚕️",
    },
    {
      name: "Michael Chen",
      role: "Head of Engineering",
      bio: "Full‑stack engineer focused on pharmacy management, e-prescriptions, and multi-location architectures.",
      image: "👨‍💻",
    },
    {
      name: "Amina Yusuf",
      role: "UX Lead",
      bio: "Designs intuitive workflows for pharmacists, technicians, and pharmacy managers.",
      image: "🎨",
    },
    {
      name: "Eng. Tewodros Alemu",
      role: "Compliance & Quality",
      bio: "Regulatory specialist for FDA compliance, batch tracking, and pharmaceutical quality assurance.",
      image: "📦",
    },
  ];

  const milestones = [
    { year: "2021", event: "Wan Ofi Pharmacy founded", description: "Vision to modernize pharmacy operations across Ethiopia." },
    { year: "2022", event: "Pilot with local pharmacies", description: "Inventory + prescription management deployed to 10 pharmacies." },
    { year: "2023", event: "Cosmetic retail module", description: "Beauty products and skincare inventory management." },
    { year: "2024", event: "Multi-location support", description: "Chain pharmacy management with centralized control." },
    { year: "2025", event: "Regional expansion", description: "Serving pharmacies across East Africa with comprehensive healthcare retail solutions." },
  ];

  const values = [
    { icon: <HeartPulse className="h-8 w-8 text-rose-600" />, title: "Patient Care First", desc: "Ensuring safe, effective medication management and patient health outcomes." },
    { icon: <ShieldCheck className="h-8 w-8 text-emerald-600" />, title: "Regulatory Compliance", desc: "FDA-compliant systems with audit trails, encryption, and secure data handling." },
    { icon: <Award className="h-8 w-8 text-indigo-600" />, title: "Operational Excellence", desc: "Reliable systems, clear workflows, and measurable pharmacy outcomes." },
    { icon: <Users2 className="h-8 w-8 text-amber-600" />, title: "Community Partnership", desc: "We work closely with pharmacists, healthcare providers, and patients." },
  ];

  const compliance = [
    { icon: <Barcode className="h-5 w-5" />, title: "Batch & Traceability", desc: "Lot numbers, FEFO, recall management, and audit exports." },
    { icon: <Thermometer className="h-5 w-5" />, title: "Temperature Control", desc: "Cold storage monitoring, excursion alerts, and corrective actions." },
    { icon: <Factory className="h-5 w-5" />, title: "FDA Compliance", desc: "Supplier documentation, COA storage, and regulatory compliance trails." },
    { icon: <ShieldCheck className="h-5 w-5" />, title: "Data Protection", desc: "Granular permissions, backups, and secure data handling." },
  ];

  const platformFeatures = [
    { icon: <Barcode className="h-5 w-5" />, title: "Batch & Expiry (FEFO)", desc: "Automated FEFO picking, holds and recall management reduce wastage." },
    { icon: <Thermometer className="h-5 w-5" />, title: "Temperature Monitoring", desc: "Cold storage logs, excursion alerts, and corrective action records." },
    { icon: <Layers className="h-5 w-5" />, title: "Multi-Location Management", desc: "Chain pharmacy operations, zones, and cycle counts across stores." },
    { icon: <Truck className="h-5 w-5" />, title: "Delivery & Fulfillment", desc: "Prescription delivery tracking and proof-of-delivery with signatures." },
    { icon: <Store className="h-5 w-5" />, title: "POS & e-Prescription", desc: "Point-of-sale with e-prescriptions and controlled substance tracking." },
    { icon: <Building2 className="h-5 w-5" />, title: "Procurement Management", desc: "Supplier management, purchase orders, and accurate cost tracking." },
    { icon: <LineChart className="h-5 w-5" />, title: "Analytics & Forecasting", desc: "Demand planning, inventory optimization, and business insights." },
    { icon: <Settings className="h-5 w-5" />, title: "APIs & Integrations", desc: "ERP/accounting, payments, SMS/WhatsApp notifications." },
  ];

  return (
    <div className="min-h-screen">
      {/* HERO with side image */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-emerald-600 via-blue-700 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Copy */}
            <div>
              <Badge className="bg-white/10 text-white ring-1 ring-inset ring-white/20 hover:bg-white/15">
                <Pill className="h-3 w-3 mr-1" />
                About Wan Ofi Pharmacy
              </Badge>

              <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Modernizing Pharmacy & Healthcare Retail
              </h1>

              <p className="mt-4 text-lg text-white/80 max-w-xl">
                Wan Ofi Pharmacy streamlines operations for pharmacies and healthcare providers—from prescription management to patient care—while helping pharmacists access safe, traceable medications and cosmetic products.
              </p>

              <ul className="mt-6 space-y-2">
                <li className="flex gap-2 items-start">
                  <ShieldCheck className="h-5 w-5 mt-0.5 text-emerald-200" />
                  <span className="text-white/90">FDA-compliant records: batch tracking, expiry management, and prescription logs</span>
                </li>
                <li className="flex gap-2 items-start">
                  <Barcode className="h-5 w-5 mt-0.5 text-emerald-200" />
                  <span className="text-white/90">End-to-end traceability with barcode scanning down to patient level</span>
                </li>
                <li className="flex gap-2 items-start">
                  <Thermometer className="h-5 w-5 mt-0.5 text-emerald-200" />
                  <span className="text-white/90">Temperature monitoring with excursion alerts and CAPA logs</span>
                </li>
                <li className="flex gap-2 items-start">
                  <Truck className="h-5 w-5 mt-0.5 text-emerald-200" />
                  <span className="text-white/90">Prescription delivery & fulfillment for patients and clinics</span>
                </li>
              </ul>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-white/90">Request a Demo</Button>
              </div>
            </div>

            {/* Image */}
            <div>
              <div className="relative aspect-[4/3] md:aspect-[5/4]">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-600/20 rounded-2xl" />
                <div className="relative h-full w-full rounded-2xl bg-white/10 backdrop-blur border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.25)] flex items-center justify-center">
                  <div className="text-center text-white">
                    <Pill className="h-16 w-16 mx-auto mb-4 opacity-80" />
                    <p className="text-lg font-semibold">Modern Pharmacy</p>
                    <p className="text-sm opacity-70">Management System</p>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/20" />
              </div>
              <p className="mt-3 text-xs text-white/70">
                Professional pharmacy management for modern healthcare retail
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Mission & Vision with soft gradient cards */}
        <section className="py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 border-emerald-100">
              <CardHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-3 bg-emerald-100 rounded-full"><Target className="h-6 w-6 text-emerald-700" /></div>
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg leading-relaxed text-gray-800">
                  Enable safe, efficient delivery of pharmaceutical care and cosmetic products by providing modern, reliable, auditable software to every pharmacy and healthcare provider.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-100">
              <CardHeader>
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-3 bg-blue-100 rounded-full"><Globe2 className="h-6 w-6 text-blue-700" /></div>
                  <CardTitle className="text-2xl">Our Vision</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg leading-relaxed text-gray-800">
                  Become the regional standard for pharmacy management software—reducing medication errors, improving patient outcomes, and enhancing healthcare retail operations.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Key Platform Features */}
        <section className="py-14">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Key Platform Features</h2>
            <p className="text-gray-600">Everything you need—from prescription to patient care</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformFeatures.map((f, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2">{f.icon}</div>
                  <CardTitle className="text-base">{f.title}</CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="py-10">
          <div className="bg-gradient-to-r from-emerald-600 to-blue-700 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-8">Our Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-extrabold mb-2">150+</div>
                <div className="text-emerald-100">Pharmacies Served</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold mb-2">500K+</div>
                <div className="text-emerald-100">Prescriptions Managed</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold mb-2">40%</div>
                <div className="text-emerald-100">Efficiency Improvement</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold mb-2">99.9%</div>
                <div className="text-emerald-100">System Uptime</div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Work with us</CardTitle>
              <CardDescription>Partner on implementations, integrations, or regional deployments.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-gray-700"/><span>+251 ••• •• ••</span></div>
                <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-gray-700"/><span>info@wanofipharmacy.com</span></div>
                <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-gray-700"/><span>Addis Ababa • Bole</span></div>
              </div>
              <Separator className="my-6" />
              <div className="flex flex-wrap gap-3">
                <Button>Contact Us</Button>
                <Button variant="outline">Schedule Demo</Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}