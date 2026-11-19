import React from 'react';
import Link from 'next/link';
import { Scissors, MapPin, Phone, Mail, Clock } from 'lucide-react';

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M14 9h3V6h-3c-2.21 0-4 1.79-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.55.45-1 1-1Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M4 3h4.3l4 5.5L16.7 3H21l-6.2 7.4L21.4 21h-4.3l-4.3-5.9L7.4 21H3l6.7-8L4 3Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-stone-800 bg-salon-950 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* 1. Logo & Short Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15">
                <Scissors className="h-5 w-5 text-amber-400" />
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-wide">
                Salon<span className="text-amber-400">Book</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Your premier destination for luxury styling, bespoke hair transformations, rejuvenating skincare, and restorative wellness experiences.
            </p>
            {/* Social Media Links */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-800 transition-colors hover:bg-amber-500 hover:text-salon-950"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-800 transition-colors hover:bg-amber-500 hover:text-salon-950"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-800 transition-colors hover:bg-amber-500 hover:text-salon-950"
                aria-label="X (Twitter)"
              >
                <XIcon />
              </a>
            </div>
          </div>

          {/* 2. Important Navigation Links */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
              Quick Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-amber-400 transition-colors">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link href="/services?category=Haircut+%26+Styling" className="hover:text-amber-400 transition-colors">
                  Haircuts & Styling
                </Link>
              </li>
              <li>
                <Link href="/services?category=Facial+%26+Skincare" className="hover:text-amber-400 transition-colors">
                  Facials & Skincare
                </Link>
              </li>
              <li>
                <Link href="/signin" className="hover:text-amber-400 transition-colors">
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Salon Contact Information */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span>+1 (800) 555-BOOK / (555) 019-2834</span>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span>concierge@salonbook.com</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span>742 Evergreen Avenue, Suite 400, Beverly Hills, CA 90210</span>
              </li>
            </ul>
          </div>

          {/* 4. Salon Address & Opening Hours */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
              Salon Hours
            </h3>
            <div className="space-y-2 text-sm text-stone-400">
              <div className="flex items-center space-x-2 text-amber-300">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Opening Schedule:</span>
              </div>
              <div className="flex justify-between border-b border-stone-800 pb-1.5">
                <span>Monday - Friday:</span>
                <span className="text-stone-200">9:00 AM - 8:00 PM</span>
              </div>
              <div className="flex justify-between border-b border-stone-800 pb-1.5">
                <span>Saturday:</span>
                <span className="text-stone-200">8:30 AM - 7:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-stone-200">10:00 AM - 5:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Information */}
        <div className="mt-14 pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center text-xs text-stone-500">
          <p>© {new Date().getFullYear()} SalonBook Inc. All rights reserved. Professional Salon Appointment Booking.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="hover:text-stone-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-stone-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-stone-400 cursor-pointer">Cookie Preferences</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
