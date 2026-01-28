import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { cn } from "../ui/utils";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showLanguageSelector?: boolean;
  showUserMenu?: boolean;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  className?: string;
  containerClassName?: string;
  fullWidth?: boolean;
  // Mobile navigation props
  showMobileNav?: boolean;
  currentScreen?: string;
  onNavigate?: (screen: string) => void;
}

export function Layout({
  children,
  showHeader = true,
  showFooter = true,
  showLanguageSelector = true,
  showUserMenu = false,
  isAuthenticated = false,
  onLogout,
  className,
  containerClassName,
  fullWidth = false,
  // Mobile navigation props
  showMobileNav = true,
  currentScreen = "landing",
  onNavigate,
}: LayoutProps) {
  // Determine if mobile nav should be visible based on screen type
  const isMobileNavVisible = showMobileNav && onNavigate;

  // Hide footer on mobile when bottom nav is visible
  const shouldShowFooter = showFooter;

  return (
    <div className={cn("min-h-screen flex flex-col bg-background", className)}>
      {showHeader && (
        <Header
          showLanguageSelector={showLanguageSelector}
          showUserMenu={showUserMenu}
          isAuthenticated={isAuthenticated}
          onLogout={onLogout}
        />
      )}

      <main
        className={cn(
          "flex-1",
          !fullWidth && "container max-w-screen-xl mx-auto px-4 py-4 md:py-6",
          // Add bottom padding for mobile nav
          isMobileNavVisible && "pb-20 md:pb-6",
          containerClassName
        )}
      >
        {children}
      </main>

      {/* Footer - hidden on mobile when bottom nav is visible */}
      {shouldShowFooter && (
        <div className={cn(isMobileNavVisible && "hidden md:block")}>
          <Footer />
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobileNavVisible && (
        <MobileBottomNav
          currentScreen={currentScreen}
          onNavigate={onNavigate}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
}
