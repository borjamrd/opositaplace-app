'use client';

import { SignOutButton } from '@/components/auth/signout-button';
import UserOnboarding from '@/components/onboarding/user-onboarding';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { getPlanNameByPriceId } from '@/lib/stripe/config';
import { handleManageSubscription } from '@/lib/stripe/client';
import { useUserSubscription } from '@/lib/supabase/queries/useUserSubscription';
import { useProfileStore } from '@/store/profile-store';
import { Calendar, CreditCard, LayoutDashboard, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

export function NavUserSection({ collapsed }: { collapsed: boolean }) {
  const { profile } = useProfileStore();
  const [open, setOpen] = useState(false);
  const { data: subscription } = useUserSubscription();
  const { toast } = useToast();
  const [loadingStripe, setLoadingStripe] = useState(false);

  const getInitials = (email?: string | null) => {
    if (!email) return 'OP';
    return email.substring(0, 2).toUpperCase();
  };

  if (!profile) return null;

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative rounded-full h-8 w-8 px-2 py-1 flex items-center gap-3"
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage
                className="rounded-full aspect-square object-cover object-center"
                src={profile.avatar_url || ''}
                alt={profile.email || 'User'}
              />
              <AvatarFallback>{getInitials(profile.email)}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-medium truncate">
                  {profile.username || profile.email}
                </span>
                <span className="text-xs text-muted-foreground truncate">{profile.email}</span>
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start" forceMount>
          <div className="bg-muted/50 p-2 text-xs text-muted-foreground">
            {subscription ? (
              <div className="flex items-center justify-between">
                <span>{getPlanNameByPriceId(subscription.price_id)}</span>
                <Badge variant="secondary" className="h-5 text-[10px] px-1.5">
                  {subscription.status === 'trialing' ? 'Prueba' : 'Activo'}
                </Badge>
              </div>
            ) : (
              <span>Plan Gratuito</span>
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">
              <UserIcon className="mr-2 h-4 w-4" />
              Perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => handleManageSubscription(setLoadingStripe, toast)}
            disabled={loadingStripe}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {loadingStripe ? 'Cargando...' : 'Suscripción'}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpen(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Calendario
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <SignOutButton />
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>Tu calendario de estudio e información de onboarding</DialogTitle>
          </DialogHeader>
          <UserOnboarding />
        </DialogContent>
      </Dialog>
    </div>
  );
}
