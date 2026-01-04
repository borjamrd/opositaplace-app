'use client';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AvailableOppositionsDialog } from './available-oppositions-dialog';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-start space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Por ahora disponible para GACE</span>
            </motion.div>

            {/* Title */}
            <div className="space-y-3">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                No estudies más.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                  Estudia mejor
                </span>
                <br />
                con opositaplace.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Un solo lugar para registrar tu estudio, realizar ejercicios y estar al tanto de tu
                proceso selectivo.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center sm:items-start gap-4 w-full sm:w-auto">
              <Button
                asChild
                variant="btn-header"
                className="h-14 px-10 text-xl rounded-xl shadow-xl hover:shadow-primary/20 transition-all duration-300 w-full sm:w-auto"
              >
                <Link href="/register">Acceder</Link>
              </Button>

              <AvailableOppositionsDialog />
            </div>
          </motion.div>

          {/* Right Content - Image Containter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 w-full lg:min-h-[500px] aspect-video max-w-[800px] mx-auto group">
              {/* Glassmorphism Container for Image Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-primary/10 rounded-2xl border border-white/10 backdrop-blur-sm shadow-2xl overflow-hidden">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                  <source src="/landing_video.mp4" type="video/mp4" />
                </video>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl -z-10 group-hover:bg-primary/30 transition-colors duration-500" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10 group-hover:bg-primary/20 transition-colors duration-500" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
