'use client';

import * as React from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

interface DrawerInfoProps {
  children: React.ReactNode;
}

export function DrawerInfo({ children }: DrawerInfoProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 md:-top-6 md:right-15 z-50 text-muted-foreground border-none hover:bg-transparent"
        >
          <Info className="h-5 w-5" />

          <span className="hidden md:block">¿Cómo funciona?</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Información</DrawerTitle>
            <DrawerDescription className="sr-only">Información adicional</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">{children}</div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
