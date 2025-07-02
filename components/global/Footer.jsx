"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: "About Us", href: "/about" },
      { name: "Contact Us", href: "/contact" },
      { name: "Terms & Conditions", href: "/terms" },
    ],
    platform: [
      { name: "Browse Events", href: "/events" },
      //   { name: "Create Event", href: "/events/create" },
      { name: "My Tickets", href: "/tickets" },
    ],
    support: [
      //   { name: "Help Center", href: "/help" },
      { name: "Privacy Policy", href: "/terms" },
      { name: "Cookie Policy", href: "/terms" },
    ],
  };

  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      href: "https://facebook.com/truecircleevents",
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: "https://twitter.com/truecircleevents",
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://instagram.com/truecircleevents",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://linkedin.com/company/truecircleevents",
    },
  ];

  return (
    <footer className="bg-background text-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="text-2xl font-bold mb-4 block gradient-text"
            >
              Event Circle
            </Link>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Connecting communities through unforgettable experiences. Create,
              discover, and attend amazing events with Event Circle.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span>Truecirclevents@gmail.com</span>
              </div>
              {/* <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span>+27 (0) 11 123 4567</span>
              </div> */}
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Johannesburg, South Africa</span>
              </div>
            </div>
          </div>

          {/* Dynamic Link Sections */}
          {Object.entries(footerLinks).map(([sectionTitle, links]) => (
            <div key={sectionTitle}>
              <h3 className="text-lg font-semibold mb-4 capitalize">
                {sectionTitle}
              </h3>
              <ul className="space-y-3 text-sm">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social & Copyright */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            <p className="text-muted-foreground text-sm text-center md:text-right">
              © {currentYear} TrueCircleEvents Pty (Ltd). All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
