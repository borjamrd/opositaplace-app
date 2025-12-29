'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export function AvailableOppositionsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-muted-foreground hover:text-primary">
          Oposiciones disponibles
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold mb-4">Oposiciones disponibles</DialogTitle>
          <DialogDescription className="text-lg">
            Consulta las oposiciones en las que estamos trabajando actualmente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 mt-6">
          <Alert className="bg-primary/5 border-primary/20 p-6">
            <Info className="h-5 w-5 text-primary" />
            <AlertTitle className="text-lg font-semibold text-primary mb-2">
              Contenido de calidad
            </AlertTitle>
            <AlertDescription className="text-base text-muted-foreground leading-relaxed">
              En opositaplace estamos trabajando para ofrecerte contenido de calidad, y por eso
              vamos poco a poco. Por ahora ofrecemos el servicio a:
              <ul className="list-disc list-inside mt-2 font-medium text-primary">
                <li>Gestión de la Administración Civil del Estado</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-medium">
                Correo electrónico
              </Label>
              <Input
                id="email"
                placeholder="tu@email.com"
                type="email"
                className="h-12 text-lg px-4 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="opposition" className="text-base font-medium">
                ¿Qué oposición te interesa?
              </Label>
              <Input
                id="opposition"
                placeholder="Ej: Administrativo del Estado"
                className="h-12 text-lg px-4 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-primary/20 transition-all"
              />
            </div>

            <Button className="w-full h-12 text-lg font-semibold rounded-lg mt-4">
              Avísame cuando esté disponible
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
