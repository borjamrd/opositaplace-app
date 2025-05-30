// src/app/(subscriptions)/plans/page.tsx
"use client";

import { PlanSelector } from "@/components/subscription/plan-selector";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PlansPageContentWrapper() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const searchParams = useSearchParams();

  const onboardingCompleted =
    searchParams.get("source") === "onboarding_completed";

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
      setLoadingUser(false);
    };
    getUser();
  }, [supabase]);

  if (loadingUser) {
    return (
      <div className="container mx-auto py-12 px-4 md:px-6 text-center">
        Cargando usuario...
      </div>
    );
  }

  return (
    <PlanSelector
      user={user}
      onboardingCompleted={onboardingCompleted}
      source="plansPage"
    />
  );
}

export default function PlansPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-12 px-4 md:px-6 text-center">
          Cargando planes...
        </div>
      }
    >
      <PlansPageContentWrapper />
    </Suspense>
  );
}
