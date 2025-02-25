
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface NotificationPreferences {
  id: string;
  low_stock_email: boolean;
  low_stock_app: boolean;
  supplier_updates_email: boolean;
  supplier_updates_app: boolean;
}

export function NotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: preferences, refetch } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as NotificationPreferences;
    },
  });

  useEffect(() => {
    if (user && !preferences) {
      createDefaultPreferences();
    }
  }, [user, preferences]);

  const createDefaultPreferences = async () => {
    try {
      await supabase
        .from('notification_preferences')
        .insert([{
          user_id: user?.id,
          low_stock_email: false,
          low_stock_app: true,
          supplier_updates_email: false,
          supplier_updates_app: true,
        }]);
      refetch();
    } catch (error) {
      console.error('Error creating default preferences:', error);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences?.id) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({ [key]: value })
        .eq('id', preferences.id);

      if (error) throw error;

      toast({ title: "Notification preferences updated" });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error updating preferences",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!preferences) {
    return (
      <Card>
        <CardContent className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium">Low Stock Alerts</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive email alerts when items are running low
              </p>
            </div>
            <Switch
              checked={preferences.low_stock_email}
              disabled={isUpdating}
              onCheckedChange={(checked) => updatePreference('low_stock_email', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>In-App Notifications</Label>
              <p className="text-sm text-gray-500">
                Get notified in the app about low stock items
              </p>
            </div>
            <Switch
              checked={preferences.low_stock_app}
              disabled={isUpdating}
              onCheckedChange={(checked) => updatePreference('low_stock_app', checked)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Supplier Updates</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive email updates about supplier changes
              </p>
            </div>
            <Switch
              checked={preferences.supplier_updates_email}
              disabled={isUpdating}
              onCheckedChange={(checked) => updatePreference('supplier_updates_email', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>In-App Notifications</Label>
              <p className="text-sm text-gray-500">
                Get notified in the app about supplier updates
              </p>
            </div>
            <Switch
              checked={preferences.supplier_updates_app}
              disabled={isUpdating}
              onCheckedChange={(checked) => updatePreference('supplier_updates_app', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
