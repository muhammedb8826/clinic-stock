"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  Facebook,
  Linkedin,
  Globe2,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

/*************************
 * PublicNavbar (Milkii)
 *************************/
export function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const linkClass = (href: string) => {
    const active = pathname === href;
    return `
      inline-flex items-center border-b-2 px-3 py-2 text-sm font-medium transition-colors
      ${active
        ? "text-blue-700 border-blue-600"
        : "text-gray-700 border-transparent hover:text-blue-700 hover:border-blue-500"}
    `;
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/80 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-600" />
              <span className="text-xl font-extrabold tracking-tight">Milkii</span>
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Agri-Vet
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={linkClass(l.href)}
                >
                  {l.label}
                </Link>
              );
            })}
            <div className="h-6 w-px bg-gray-200" />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hover:text-blue-700">
                Sign in
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
              onClick={() => setIsMenuOpen((o) => !o)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div id="mobile-nav" className="md:hidden pb-4">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/80 border-t rounded-b-xl">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors
                      ${active
                        ? "text-blue-700 bg-blue-50"
                        : "text-gray-700 hover:text-blue-700 hover:bg-blue-50/60"}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {l.label}
                  </Link>
                );
              })}
              <div className="flex gap-2 px-3 pt-2">
                <Link href="/login" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full hover:text-blue-700">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Subtle gradient underline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
    </nav>
  );
}

/*************************
 * PublicFooter (Milkii)
 *************************/
export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand / About */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-600" />
              <span className="text-xl font-extrabold text-white">Milkii</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Agricultural Inputs & Veterinary Supply platform—batch & expiry control, cold-chain, and last-mile delivery.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <a href="#" aria-label="Website" className="text-slate-400 hover:text-white transition-colors">
                <Globe2 className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Facebook" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider text-white uppercase mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-300 hover:text-white">Home</Link>
              </li>
              <li>
                <Link href="/products" className="text-slate-300 hover:text-white">Products</Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-300 hover:text-white">About</Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-white">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider text-white uppercase mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/pricing" className="text-slate-300 hover:text-white">Pricing</Link></li>
              <li><Link href="/docs" className="text-slate-300 hover:text-white">Documentation</Link></li>
              <li><Link href="/faq" className="text-slate-300 hover:text-white">FAQ</Link></li>
              <li><Link href="/changelog" className="text-slate-300 hover:text-white">Changelog</Link></li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider text-white uppercase mb-3">Stay Updated</h4>
            <p className="text-slate-300 mb-3">Get product updates and tips. No spam.</p>
            <form className="flex items-stretch gap-2">
              <Input
                type="email"
                placeholder="Your email"
                aria-label="Email address"
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-300"
              />
              <Button type="button" className="bg-white/15 hover:bg-white/25 text-white">
                Subscribe
              </Button>
            </form>
            <div className="mt-6 space-y-2 text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+251 ••• •• ••</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>hello@milkii.africa</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Addis Ababa • Bole</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">© {year} Milkii. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-slate-400 hover:text-white">Privacy</Link>
            <Link href="/terms" className="text-slate-400 hover:text-white">Terms</Link>
            <Link href="/status" className="text-slate-400 hover:text-white">System Status</Link>
          </div>
        </div>
      </div>

      {/* Subtle gradient underline */}
      <div className="h-[3px] w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
    </footer>
  );
}
