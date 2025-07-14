'use client';

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { PlusCircleIcon, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon?: LucideIcon;
    }[];
}) {
    const location = usePathname();

    return (
        <SidebarGroup>
            <SidebarGroupLabel>De tu oposición</SidebarGroupLabel>
            <SidebarGroupContent className="flex flex-col gap-2 flex-1">
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center gap-2">
                        <SidebarMenuButton
                            variant="outline"
                            tooltip="Quick Create"
                            className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                        >
                            <PlusCircleIcon />
                            <span>Nuevo test</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.url} className="flex items-center gap-2">
                            <SidebarMenuButton
                                asChild
                                className={`w-full justify-start ${
                                    location === item.url ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            >
                                <Link href={item.url} className="flex items-center gap-2 w-full">
                                    {item.icon && <item.icon className="size-4" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
            {/* El usuario ahora se muestra en la parte inferior del sidebar */}
        </SidebarGroup>
    );
}
