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
  LineChart
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Dr. Hana Bekele",
      role: "Chief Veterinary Officer",
      bio: "DVM, MSc (Epidemiology). 12+ years in livestock health programs and cold‑chain quality systems.",
      image: "🐄",
    },
    {
      name: "Michael Chen",
      role: "Head of Engineering",
      bio: "Full‑stack engineer focused on traceability, eRx, and multi‑warehouse architectures.",
      image: "👨‍💻",
    },
    {
      name: "Amina Yusuf",
      role: "UX Lead",
      bio: "Designs intuitive workflows for importers, distributors, and clinic counters.",
      image: "🎨",
    },
    {
      name: "Eng. Tewodros Alemu",
      role: "Supply Chain & Compliance",
      bio: "Regulatory specialist for batch/expiry, FEFO, and GMP/GDP alignment.",
      image: "📦",
    },
  ];

  const milestones = [
    { year: "2021", event: "Milkii founded", description: "Vision to digitize agri‑vet supply chains across East Africa." },
    { year: "2022", event: "Pilot with cooperatives", description: "Inventory + batch/expiry deployed to 10 co‑ops." },
    { year: "2023", event: "Cold‑chain module", description: "Temperature logs & excursion alerts from warehouse to clinic." },
    { year: "2024", event: "Traceability v2", description: "Barcode/QR down to herd/lots. Faster recalls, fewer losses." },
    { year: "2025", event: "Regional rollout", description: "Multi‑branch, multi‑warehouse with PoD routing and e‑Rx." },
  ];

  const values = [
    { icon: <HeartPulse className="h-8 w-8 text-rose-600" />, title: "Animal & Public Health", desc: "Protecting herd health and food safety is core to our work." },
    { icon: <ShieldCheck className="h-8 w-8 text-emerald-600" />, title: "Security First", desc: "Role‑based access, audit trails, encryption at rest & in transit." },
    { icon: <Award className="h-8 w-8 text-indigo-600" />, title: "Operational Excellence", desc: "Reliable systems, clear workflows, measurable outcomes." },
    { icon: <Users2 className="h-8 w-8 text-amber-600" />, title: "Partnership", desc: "We co‑build with farmers, vets, and distributors." },
  ];

  const compliance = [
    { icon: <Barcode className="h-5 w-5" />, title: "Batch & Traceability", desc: "Lot numbers, FEFO, recall lists, and audit exports." },
    { icon: <Thermometer className="h-5 w-5" />, title: "Cold‑Chain QA", desc: "Min/max, excursions, corrective actions, calibrated devices." },
    { icon: <Factory className="h-5 w-5" />, title: "GMP/GDP Alignment", desc: "Supplier docs, COA storage, and procurement trails." },
    { icon: <ShieldCheck className="h-5 w-5" />, title: "Data Protection", desc: "Granular permissions, backups, and on‑prem/hybrid options." },
  ];

  const platformFeatures = [
    { icon: <Barcode className="h-5 w-5" />, title: "Batch & Expiry (FEFO)", desc: "Automated FEFO picking, holds and recall lists reduce wastage." },
    { icon: <Thermometer className="h-5 w-5" />, title: "Cold‑Chain Monitoring", desc: "Temperature logs, excursion alerts, corrective action records." },
    { icon: <Layers className="h-5 w-5" />, title: "Multi‑Branch Warehousing", desc: "Branches, zones, and cycle counts across regional stores." },
    { icon: <Truck className="h-5 w-5" />, title: "Distribution & PoD", desc: "Route planning, agents, and proof‑of‑delivery with signatures." },
    { icon: <Store className="h-5 w-5" />, title: "POS & e‑Rx", desc: "Dispense to clinics with e‑prescriptions and controls." },
    { icon: <Building2 className="h-5 w-5" />, title: "Procurement & Landed Cost", desc: "RFQs, supplier docs, and accurate COGS for imports." },
    { icon: <LineChart className="h-5 w-5" />, title: "Analytics & Forecasting", desc: "Demand planning, wastage dashboards, stockout prevention." },
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
                About Milkii Agri-Vet
              </Badge>

              <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Digitizing Agricultural Inputs & Veterinary Supply
              </h1>

              <p className="mt-4 text-lg text-white/80 max-w-xl">
                Milkii Agricultural Import streamlines operations for importers and distributors—from shipment to treatment—while helping sellers, clinics, and farmers access safe, traceable animal-health products.
              </p>

              <ul className="mt-6 space-y-2">
                <li className="flex gap-2 items-start">
                  <ShieldCheck className="h-5 w-5 mt-0.5 text-emerald-200" />
                  <span className="text-white/90">Regulatory-ready records: batch, expiry, permits, and COAs</span>
                </li>
                <li className="flex gap-2 items-start">
                  <Barcode className="h-5 w-5 mt-0.5 text-emerald-200" />
                  <span className="text-white/90">End-to-end traceability with barcode/QR down to herd or lot</span>
                </li>
                <li className="flex gap-2 items-start">
                  <Thermometer className="h-5 w-5 mt-0.5 text-emerald-200" />
                  <span className="text-white/90">Cold-chain monitoring with excursion alerts and CAPA logs</span>
                </li>
                <li className="flex gap-2 items-start">
                  <Truck className="h-5 w-5 mt-0.5 text-emerald-200" />
                  <span className="text-white/90">Last-mile delivery & PoD for agents and co-ops</span>
                </li>
              </ul>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-white/90">Request a Demo</Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-transparent border border-white/30 text-white hover:bg-white/10"
                >
                  Download Company Profile
                </Button>
              </div>
            </div>

            {/* Image */}
            <div>
              <div className="relative aspect-[4/3] md:aspect-[5/4]">
                <Image
                  src="/images/1212.png"
                  alt="Agri-vet supply operations at Milkii"
                  fill
                  priority
                  className="rounded-2xl object-cover border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/20" />
              </div>
              <p className="mt-3 text-xs text-white/70">
                Replace the image at <code className="text-white/90">/images/1212.png</code> with your brand imagery.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* How Milkii helps */}
        <section className="py-14">
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Factory className="h-5 w-5 text-emerald-600"/>Streamlining company operations</CardTitle>
                <CardDescription>Built for importers & distributors of agricultural inputs and veterinary drugs.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex gap-2"><Building2 className="h-4 w-4 text-emerald-600"/>Procurement, landed‑cost, and supplier document vault (COAs, permits)</li>
                  <li className="flex gap-2"><Layers className="h-4 w-4 text-emerald-600"/>Multi‑warehouse inventory with FEFO and cycle counts</li>
                  <li className="flex gap-2"><Thermometer className="h-4 w-4 text-emerald-600"/>Cold‑chain logs + excursion alerts from warehouse to clinic</li>
                  <li className="flex gap-2"><Truck className="h-4 w-4 text-emerald-600"/>Route planning, agent delivery, and proof‑of‑delivery</li>
                  <li className="flex gap-2"><Settings className="h-4 w-4 text-emerald-600"/>Role‑based access, audits, and on‑prem/hybrid deployment</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5 text-blue-600"/>Helping sellers, clinics & farmers</CardTitle>
                <CardDescription>Reliable access to safe, traceable inputs with clear pricing and records.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex gap-2"><Barcode className="h-4 w-4 text-blue-600"/>Traceability down to herd/lot with simple barcode/QR scanning</li>
                  <li className="flex gap-2"><HeartPulse className="h-4 w-4 text-blue-600"/>Clinic POS & e‑Rx to ensure controlled dispensing</li>
                  <li className="flex gap-2"><Leaf className="h-4 w-4 text-blue-600"/>Feed/additive planning and usage records</li>
                  <li className="flex gap-2"><LineChart className="h-4 w-4 text-blue-600"/>Stock visibility and notifications to prevent stockouts</li>
                  <li className="flex gap-2"><Handshake className="h-4 w-4 text-blue-600"/>Training & onboarding support for field teams</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

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
                  Enable safe, efficient delivery of animal‑health products and farm inputs by providing modern, reliable, auditable software to every node in the supply chain.
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
                  Become the regional standard for agri‑vet supply software—reducing wastage, accelerating recalls, and improving animal & public‑health outcomes.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Key Platform Features */}
        <section className="py-14">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Key Platform Features</h2>
            <p className="text-gray-600">Everything you need—from import to herd care</p>
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

        {/* Values */}
        <section className="py-10">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <div key={i} className="text-center">
                <div className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-gray-50">
                  {v.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
                <p className="text-gray-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance & Sustainability */}
        <section className="py-6 grid lg:grid-cols-2 gap-6 items-start">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-emerald-600" /><CardTitle>Compliance you can trust</CardTitle></div>
              <CardDescription>Aligned with best practices for safe, auditable operations.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {compliance.map((c, i) => (
                  <div key={i} className="p-4 rounded-xl border bg-white">
                    <div className="flex items-center gap-2 text-gray-800 font-medium">{c.icon}{c.title}</div>
                    <p className="text-sm text-gray-600 mt-1">{c.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3"><Leaf className="h-6 w-6 text-emerald-600" /><CardTitle>Sustainability & Impact</CardTitle></div>
              <CardDescription>Less spoilage, smarter routes, greener operations.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2"><Recycle className="h-5 w-5 text-emerald-600"/>Wastage reduction via FEFO and temperature control</li>
                <li className="flex gap-2"><Truck className="h-5 w-5 text-emerald-600"/>Optimized delivery routes & proof‑of‑delivery</li>
                <li className="flex gap-2"><Building2 className="h-5 w-5 text-emerald-600"/>Support for local distributors & co‑ops</li>
                <li className="flex gap-2"><Handshake className="h-5 w-5 text-emerald-600"/>Training & onboarding for field teams</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Team */}
        <section className="py-10">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-6xl mb-4 select-none">{member.image}</div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <Badge variant="secondary">{member.role}</Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription>{member.bio}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="py-10">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-emerald-200" />
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="flex-1 px-8">
                    <Card className={`${index % 2 === 0 ? 'ml-auto' : 'mr-auto'} max-w-md`}>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">{milestone.year}</Badge>
                          <CardTitle className="text-lg">{milestone.event}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{milestone.description}</CardDescription>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="w-4 h-4 bg-emerald-600 rounded-full border-4 border-white shadow-lg" />
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-10">
          <div className="bg-gradient-to-r from-emerald-600 to-blue-700 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-8">Our Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-extrabold mb-2">250+</div>
                <div className="text-emerald-100">Clinics & Co‑ops</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold mb-2">1.2M+</div>
                <div className="text-emerald-100">Doses Tracked</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold mb-2">35%</div>
                <div className="text-emerald-100">Wastage Reduction</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold mb-2">99.9%</div>
                <div className="text-emerald-100">Platform Uptime</div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-10">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Work with us</CardTitle>
              <CardDescription>Partner on pilots, integrations, or regional deployments.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-gray-700"/><span>+251 ••• •• ••</span></div>
                <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-gray-700"/><span>hello@milkii.africa</span></div>
                <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-gray-700"/><span>Addis Ababa • Bole</span></div>
              </div>
              <Separator className="my-6" />
              <div className="flex flex-wrap gap-3">
                <Button>Request a Demo</Button>
                <Button variant="outline">Download Company Profile</Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
