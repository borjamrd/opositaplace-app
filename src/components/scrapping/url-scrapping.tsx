'use client';

import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { createClient } from '@/lib/supabase/client';

type UrlWithSubscription = {
  id: string;
  name: string;
  description: string;
  is_subscribed: boolean;
};

export function UrlScrapping() {
  const supabase = createClient();
  const [urls, setUrls] = useState<UrlWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUrlsAndSubscriptions = async (currentUserId: string) => {
    setLoading(true);

    const { data, error } = await supabase.rpc('get_urls_with_user_subscription', {
      user_id_param: currentUserId,
    });

    if (error) {
      console.error('Error fetching URLs:', error);
    } else {
      setUrls(data || []);
    }
    setLoading(false);
  };

  const handleSubscriptionChange = async (urlId: string, isSubscribed: boolean) => {
    if (!userId) return;

    setUrls((prevUrls) =>
      prevUrls.map((url) => (url.id === urlId ? { ...url, is_subscribed: isSubscribed } : url))
    );

    if (isSubscribed) {
      const { error } = await supabase
        .from('user_url_subscriptions')
        .insert({ user_id: userId, url_id: urlId });
      if (error) {
        setUrls((prevUrls) =>
          prevUrls.map((url) => (url.id === urlId ? { ...url, is_subscribed: false } : url))
        );
      }
    } else {
      const { error } = await supabase
        .from('user_url_subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('url_id', urlId);
      if (error) {
        setUrls((prevUrls) =>
          prevUrls.map((url) => (url.id === urlId ? { ...url, is_subscribed: true } : url))
        );
      }
    }
  };

  const selectedUrls = urls.filter((url) => url.is_subscribed);

  return (
    <div className="mb-4">
      {loading ? (
        <p>Cargando URLs disponibles...</p>
      ) : (
        <div className="space-y-6">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                Seleccionar URLs
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 max-h-96 overflow-y-auto">
              <div className="flex flex-col gap-3">
                {urls.map((url) => (
                  <div key={url.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`sub-${url.id}`}
                      checked={url.is_subscribed}
                      onCheckedChange={(checked) => {
                        handleSubscriptionChange(url.id, !!checked);
                      }}
                    />
                    <Label
                      htmlFor={`sub-${url.id}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {url.name}
                      <span className="block text-xs text-muted-foreground">{url.description}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {selectedUrls.length === 0 ? (
              <span className="text-muted-foreground text-sm">No hay URLs seleccionadas.</span>
            ) : (
              selectedUrls.map((url) => (
                <Badge key={url.id} variant="secondary" className="flex items-center gap-1">
                  {url.name}
                  <button
                    type="button"
                    className="ml-1 text-xs text-muted-foreground hover:text-destructive focus:outline-none"
                    aria-label={`Eliminar ${url.name}`}
                    onClick={() => handleSubscriptionChange(url.id, false)}
                  >
                    ×
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
