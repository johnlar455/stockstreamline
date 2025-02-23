
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Settings,
  BarChart,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: Users, label: 'Suppliers', path: '/suppliers' },
  { icon: ShoppingCart, label: 'Transactions', path: '/transactions' },
  { icon: BarChart, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 p-4 fixed left-0 top-0">
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Inventory</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4">
          <p className="text-sm text-gray-500">© 2024 Inventory System</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
