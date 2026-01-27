import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
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
  fullWidth = false
}: LayoutProps) {
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
          !fullWidth && "container max-w-screen-xl mx-auto px-4 py-6",
          containerClassName
        )}
      >
        {children}
      </main>

      {showFooter && <Footer />}
    </div>
  );
}
