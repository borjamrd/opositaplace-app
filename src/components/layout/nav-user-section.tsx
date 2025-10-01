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
import { useProfileStore } from '@/store/profile-store';
import { Calendar, LayoutDashboard, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function NavUserSection() {
  const { profile } = useProfileStore();
  const [open, setOpen] = useState(false);

  const getInitials = (email?: string | null) => {
    if (!email) return 'OP';
    return email.substring(0, 2).toUpperCase();
  };

  if (!profile) return null;

  return (
    <div className="flex flex-col items-center gap-2 p-2 border-t border-border/40">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-full px-2 py-1 flex items-center gap-3"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.avatar_url || ''} alt={profile.email || 'User'} />
              <AvatarFallback>{getInitials(profile.email)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-sm font-medium truncate">
                {profile.username || profile.email}
              </span>
              <span className="text-xs text-muted-foreground truncate">{profile.email}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start" forceMount>
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
          <DropdownMenuItem onSelect={() => setOpen(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Calendario
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <SignOutButton />
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Calendario y Onboarding</DialogTitle>
          </DialogHeader>
          <UserOnboarding />
        </DialogContent>
      </Dialog>
    </div>
  );
}
