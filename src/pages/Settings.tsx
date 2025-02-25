
import { useAuth } from '@/lib/auth';
import { UserManagement } from '@/components/settings/UserManagement';
import { CategoryManagement } from '@/components/settings/CategoryManagement';
import { NotificationSettings } from '@/components/settings/NotificationSettings';

const Settings = () => {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('admin');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-2">Manage your system preferences</p>
      </div>

      <div className="space-y-6">
        {isAdmin && (
          <>
            <UserManagement />
            <CategoryManagement />
          </>
        )}
        <NotificationSettings />
      </div>
    </div>
  );
};

export default Settings;
