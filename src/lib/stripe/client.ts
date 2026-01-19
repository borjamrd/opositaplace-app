export const handleManageSubscription = async (
  setIsLoading: (loading: boolean) => void,
  toast: (props: any) => void
) => {
  setIsLoading(true);
  try {
    const response = await fetch('/api/stripe/create-portal-link', {
      method: 'POST',
      body: JSON.stringify({ return_url: window.location.href }),
    });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error || 'No se pudo obtener el enlace al portal.');
    }
  } catch (error: any) {
    console.error('Error managing subscription:', error);
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
  }
};
