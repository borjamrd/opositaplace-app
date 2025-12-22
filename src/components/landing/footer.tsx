'use client';

import Link from 'next/link';
import { Logo } from '../logo';
import { Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-12 bg-primary/5 border-t border-border/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Copyright */}
          <div className="md:col-span-1">
            <Link href="/" className="font-bold text-2xl flex items-center gap-2 mb-4">
              <Logo />
            </Link>
            <p className="text-sm text-foreground/60 mb-4">
              &copy; {new Date().getFullYear()} Opositaplace. <br />
              Todos los derechos reservados.
            </p>
            <p className="text-sm text-foreground/60">
              Hecho con <span className="text-red-500">❤️</span> para los futuros funcionarios.
            </p>
          </div>

          {/* Section 1: Legal */}
          <div className="md:col-span-1">
            <h3 className="font-semibold text-lg mb-4 text-primary">Legal</h3>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li>
                <Link href="/legal" className="hover:text-primary transition-colors">
                  Aviso Legal
                </Link>
              </li>
              <li>
                <Link href="/politica-privacidad" className="hover:text-primary transition-colors">
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Empty columns for spacing or future use */}
          <div className="md:col-span-1"></div>

          {/* Social */}
          <div className="md:col-span-1">
            <h3 className="font-semibold text-lg mb-4 text-primary">Síguenos</h3>
            <div className="flex gap-4">
              <Link
                href="https://instagram.com/opositaplace"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
