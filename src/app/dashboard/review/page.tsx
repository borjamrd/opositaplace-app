import { getDueReviewCards } from '@/actions/srs';
import { ReviewSession } from '@/components/review/review-session';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ReviewPage() {
  const initialCards = await getDueReviewCards();

  if (initialCards.length === 0) {
    return (
      <div className="flex justify-center items-center pt-20">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>¡Todo listo! 🥳</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-muted-foreground">No tienes tarjetas pendientes por hoy.</p>
            <Button asChild>
              <Link href="/dashboard">Volver al Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ReviewSession initialCards={initialCards} />;
}
