'use client';

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User, ChevronDown } from 'lucide-react';

export default function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleProfile = () => {
    router.push('/dashboard/profile');
  };

  const handleSettings = () => {
    router.push('/dashboard/settings');
  };

  return (
    <header className="bg-gradient-to-r from-red-600 to-red-700 border-b border-red-800 shadow-lg">
      <div className="px-6 py-4 flex justify-between items-center">
        {/* Left side - Title */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Congress Dashboard
          </h1>
          <div className="hidden md:block">
            <Badge 
              variant="secondary" 
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              {user?.role === 'admin' ? 'Administrator' : 'User'}
            </Badge>
          </div>
        </div>

        {/* Right side - User Menu */}
        <div className="flex items-center space-x-4">
          {/* Welcome text - hidden on mobile */}
          <div className="hidden lg:block text-white/90 text-sm">
            <span className="font-medium">Welcome back,</span>
            <br />
            <span className="text-white font-semibold">
              {user?.first_name} {user?.last_name}
            </span>
          </div>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-12 w-auto px-3 text-white hover:bg-white/20 border border-white/30"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8 border-2 border-white/50">
                    <AvatarFallback className="bg-white text-red-600 font-bold text-sm">
                      {user?.first_name?.charAt(0)?.toUpperCase()}
                      {user?.last_name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-white">
                      {user?.first_name} {user?.last_name}
                    </div>
                    <div className="text-xs text-white/70">
                      {user?.email}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-white/70" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              className="w-64 bg-white border border-gray-200 shadow-xl" 
              align="end"
            >
              <DropdownMenuLabel className="text-gray-900">
                <div className="flex flex-col space-y-1">
                  <span className="font-semibold">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <span className="text-sm text-gray-500 font-normal">
                    {user?.email}
                  </span>
                  <Badge 
                    variant={user?.role === 'admin' ? 'destructive' : 'secondary'}
                    className="w-fit text-xs"
                  >
                    {user?.role === 'admin' ? 'Administrator' : 'User'}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleProfile}
                className="cursor-pointer hover:bg-gray-50"
              >
                <User className="mr-2 h-4 w-4 text-gray-500" />
                <span>Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={handleSettings}
                className="cursor-pointer hover:bg-gray-50"
              >
                <Settings className="mr-2 h-4 w-4 text-gray-500" />
                <span>Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}