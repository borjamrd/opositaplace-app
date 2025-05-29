"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const SiteHeader: React.FC = () => {
  const pathname = usePathname();

  const paths = pathname.split("/").filter(Boolean);

  const getBreadcrumbs = () => {
    const breadcrumbs = paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join("/")}`;
      const isLast = index === paths.length - 1;

      const formattedPath = path
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return {
        path: formattedPath,
        url,
        isLast,
      };
    });

    return breadcrumbs;
  };

  return (
    <header className="w-full border-b p-4">
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link className="text-base font-medium" href="/dashboard">
                    Dashboard
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {getBreadcrumbs()
                .slice(1)
                .map((breadcrumb) => (
                  <BreadcrumbItem key={breadcrumb.url}>
                    <BreadcrumbSeparator />
                    {breadcrumb.isLast ? (
                      <BreadcrumbPage className="text-base font-medium">
                        {breadcrumb.path}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          className="text-base font-medium"
                          href={breadcrumb.url}
                        >
                          {breadcrumb.path}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    </header>
  );
};