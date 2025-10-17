import { deleteUserAccount } from '@/actions/profile';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { AlertDialogFooter, AlertDialogHeader } from '../ui/alert-dialog';
import { buttonVariants } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

export default function DeleteProfile() {
  const [confirmationText, setConfirmationText] = useState('');
  const [isPending, startTransition] = useTransition();
  const handleDeleteAccount = () => {
    startTransition(async () => {
      const result = await deleteUserAccount();

      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Error al eliminar la cuenta',
          description: result.error,
        });
        setConfirmationText('');
      }
    });
  };
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Zona de peligro</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          La eliminación de tu cuenta es una acción irreversible. Se borrarán todos tus datos.
        </p>
        <AlertDialog onOpenChange={(open) => !open && setConfirmationText('')}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar mi cuenta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Para confirmar, escribe <strong>ELIMINAR</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4">
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="ELIMINAR"
                disabled={isPending}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
              <Button
                onClick={handleDeleteAccount}
                disabled={confirmationText !== 'ELIMINAR' || isPending}
                className={buttonVariants({ variant: 'destructive' })}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Entiendo, eliminar mi cuenta'
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
