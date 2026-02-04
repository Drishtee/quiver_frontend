import { Home, LayoutDashboard, User, Settings, Calendar } from "lucide-react";
import { cn } from "../ui/utils";

interface MobileBottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  isAuthenticated?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  screen: string;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: <Home className="size-5" />,
    screen: "landing",
    requiresAuth: false,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="size-5" />,
    screen: "entrepreneur-dashboard",
    requiresAuth: true,
  },
  {
    id: "meetings",
    label: "Meetings",
    icon: <Calendar className="size-5" />,
    screen: "schedule-meeting",
    requiresAuth: true,
  },
  {
    id: "profile",
    label: "Profile",
    icon: <User className="size-5" />,
    screen: "profile-creation",
    requiresAuth: true,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="size-5" />,
    screen: "settings",
    requiresAuth: false,
  },
];

export function MobileBottomNav({
  currentScreen,
  onNavigate,
  isAuthenticated = false,
}: MobileBottomNavProps) {
  // Filter items based on authentication status
  const visibleItems = navItems.filter(
    (item) => !item.requiresAuth || isAuthenticated
  );

  // Map current screen to nav item
  const getActiveItem = (screen: string): string => {
    // Map various dashboard screens to dashboard tab
    if (screen.includes("dashboard")) return "dashboard";
    if (screen.includes("meeting") || screen === "schedule-meeting") return "meetings";
    if (screen === "profile-creation" || screen === "profile") return "profile";
    if (screen === "landing" || screen === "login" || screen === "otp-verification") return "home";
    if (screen === "settings") return "settings";
    return "home";
  };

  const activeItem = getActiveItem(currentScreen);

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-white/95 backdrop-blur-sm",
        "border-t border-gray-200",
        "pb-safe", // Safe area padding for notched devices
        "md:hidden" // Only visible on mobile
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {visibleItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.screen)}
              className={cn(
                "flex flex-col items-center justify-center",
                "min-w-[64px] min-h-[48px] px-3 py-2",
                "rounded-lg transition-colors",
                "touch-target", // Custom class for touch accessibility
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={cn(
                  "transition-transform",
                  isActive && "scale-110"
                )}
              >
                {item.icon}
              </span>
              <span
                className={cn(
                  "text-xs mt-1 font-medium",
                  isActive ? "text-primary" : "text-gray-500"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
