import { useState, useEffect, useRef } from "react";
import { LogOut, User, Building2, Settings, ChevronDown } from "lucide-react";

interface UserMenuProps {
  userName?: string;
  userEmail?: string;
  tenantName?: string;
  onLogout: () => void;
  onViewProfile?: () => void;
  onSettings?: () => void;
}

export function UserMenu({
  userName,
  userEmail,
  tenantName,
  onLogout,
  onViewProfile,
  onSettings
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleMenuItemClick = (callback?: () => void) => {
    setIsOpen(false);
    callback?.();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-10 px-3 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-sm">
          <span className="text-white text-sm font-semibold">{initials}</span>
        </div>
        <div className="hidden sm:flex sm:flex-col sm:items-start">
          <span className="text-sm font-medium text-foreground">
            {userName || 'User'}
          </span>
          {tenantName && (
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {tenantName}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Content */}
          <div className="absolute right-0 mt-2 w-72 sm:w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-foreground truncate">
                {userName || 'User Account'}
              </p>
              {userEmail && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {userEmail}
                </p>
              )}
            </div>

            {/* Organization Info */}
            {tenantName && (
              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building2 className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">Organization: {tenantName}</span>
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div className="py-1">
              {onViewProfile && (
                <button
                  onClick={() => handleMenuItemClick(onViewProfile)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>View Profile</span>
                </button>
              )}

              {onSettings && (
                <button
                  onClick={() => handleMenuItemClick(onSettings)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span>Settings</span>
                </button>
              )}
            </div>

            {/* Logout */}
            <div className="border-t border-gray-100">
              <button
                onClick={() => handleMenuItemClick(onLogout)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors rounded-b-lg"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Log Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
