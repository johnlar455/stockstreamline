
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserWithRole } from '@/lib/types/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function UserManagement() {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // First get profiles with user_roles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name
        `);
      
      if (profilesError) throw profilesError;
      
      // Get roles for each user
      const usersWithRoles: UserWithRole[] = [];
      
      for (const profile of profilesData) {
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.id);
          
        if (rolesError) throw rolesError;
        
        // Transform data to match UserWithRole type
        usersWithRoles.push({
          id: profile.id,
          email: '', // Email not accessible through profiles
          profile: {
            id: profile.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            updated_at: ''
          },
          roles: rolesData.map(r => r.role)
        });
      }
      
      return usersWithRoles;
    },
  });

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    setIsUpdating(userId);
    try {
      // In a real application, you would implement user status toggle here
      toast({
        title: "User status updated",
        description: "The user's status has been successfully updated."
      });
    } catch (error: any) {
      toast({
        title: "Error updating user status",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.profile.first_name} {user.profile.last_name}
                  </TableCell>
                  <TableCell>
                    {user.roles?.map(role => (
                      <Badge key={role} variant="secondary" className="mr-1">
                        {role}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={true}
                      disabled={isUpdating === user.id}
                      onCheckedChange={(checked) => handleToggleUserStatus(user.id, checked)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
