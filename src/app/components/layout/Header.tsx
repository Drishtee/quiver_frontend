import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { LanguageSelector } from "../language-selector";
import { UserMenu } from "../user-menu";
import { cn } from "../ui/utils";
import { Button } from "../ui/button";

interface HeaderProps {
  showLanguageSelector?: boolean;
  showUserMenu?: boolean;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export function Header({
  showLanguageSelector = true,
  showUserMenu = false,
  isAuthenticated = false,
  onLogout
}: HeaderProps) {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-xl items-center justify-between px-4 mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-display font-semibold text-primary">
            Quiver
          </span>
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-4">
          {showLanguageSelector && <LanguageSelector />}
          {showUserMenu && isAuthenticated && onLogout && (
            <UserMenu onLogout={onLogout} />
          )}
        </div>

        {/* Mobile Menu Button - Visible only on mobile */}
        <div className="flex md:hidden items-center gap-2">
          {/* Show user menu on mobile if authenticated */}
          {showUserMenu && isAuthenticated && onLogout && (
            <UserMenu onLogout={onLogout} />
          )}

          {/* Hamburger menu for language selector */}
          {showLanguageSelector && (
            <Button
              variant="ghost"
              size="icon"
              className="min-h-touch min-w-touch"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-200 ease-in-out",
          isMobileMenuOpen ? "max-h-48 border-b border-border" : "max-h-0"
        )}
      >
        <div className="container max-w-screen-xl mx-auto px-4 py-4">
          <nav className="flex flex-col gap-4">
            {/* Language Selector in mobile menu */}
            {showLanguageSelector && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Language
                </span>
                <LanguageSelector />
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
