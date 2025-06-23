'use client';

import { useEffect, useState } from 'react';


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

// Define the structure of the data we will fetch and manage
type UrlWithSubscription = {
  id: string;
  name: string;
  description: string;
  is_subscribed: boolean;
};

export function UrlScrapping() {
  const supabase = createClient()
  const [urls, setUrls] = useState<UrlWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeComponent = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        fetchUrlsAndSubscriptions(user.id);
      } else {
        setLoading(false);
      }
    };

    initializeComponent();
  }, [supabase]);

  const fetchUrlsAndSubscriptions = async (currentUserId: string) => {
    setLoading(true);
  
    const { data, error } = await supabase.rpc('get_urls_with_user_subscription', {
      user_id_param: currentUserId
    });

    if (error) {
      console.error('Error fetching URLs:', error);
    } else {
      setUrls(data || []);
    }
    setLoading(false);
  };

  const handleSubscriptionChange = async (
    urlId: string,
    isSubscribed: boolean
  ) => {
    if (!userId) return;

    // Optimistic UI update
    setUrls((prevUrls) =>
      prevUrls.map((url) =>
        url.id === urlId ? { ...url, is_subscribed: isSubscribed } : url
      )
    );

    if (isSubscribed) {
      // Create subscription
      const { error } = await supabase
        .from('user_url_subscriptions')
        .insert({ user_id: userId, url_id: urlId });
      if (error) {
        console.error('Error subscribing:', error);
        // Revert UI on error
        setUrls((prevUrls) =>
          prevUrls.map((url) =>
            url.id === urlId ? { ...url, is_subscribed: false } : url
          )
        );
      }
    } else {
      // Delete subscription
      const { error } = await supabase
        .from('user_url_subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('url_id', urlId);
      if (error) {
        console.error('Error unsubscribing:', error);
        // Revert UI on error
        setUrls((prevUrls) =>
          prevUrls.map((url) =>
            url.id === urlId ? { ...url, is_subscribed: true } : url
          )
        );
      }
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Suscripciones de URLs</CardTitle>
        <CardDescription>
          Selecciona las URLs de las que quieres recibir notificaciones de cambio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Cargando URLs disponibles...</p>
        ) : (
          <div className="space-y-4">
            {urls.map((url) => (
              <div
                key={url.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-grow mr-4">
                  <h3 className="font-semibold">{url.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {url.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`sub-${url.id}`}
                    checked={url.is_subscribed}
                    onCheckedChange={(checked) => {
                      handleSubscriptionChange(url.id, !!checked);
                    }}
                  />
                  <Label
                    htmlFor={`sub-${url.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Suscrito
                  </Label>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}