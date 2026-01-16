import { Brain, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';

interface SRSWidgetProps {
  dueCardsCount: number;
  href?: string;
}

export function SRSWidget({ dueCardsCount, href }: SRSWidgetProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-bold">Repaso espaciado</CardTitle>
        </div>
        {href && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border border-primary text-primary hover:bg-primary/20 hover:text-primary"
            asChild
          >
            <Link href={href}>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        {dueCardsCount > 0 ? (
          <>
            <p className="text-3xl font-bold">{dueCardsCount}</p>
            <p className="text-sm text-muted-foreground">
              {dueCardsCount === 1
                ? 'tarjeta pendiente para hoy.'
                : 'tarjetas pendientes para hoy.'}
            </p>
          </>
        ) : (
          <p className="pt-4 text-lg text-muted-foreground">
            ¡Genial! No tienes tarjetas pendientes por hoy. 🎉
          </p>
        )}
      </CardContent>
      {dueCardsCount > 0 && (
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/dashboard/review">Repasar</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
