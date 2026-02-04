import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { LanguageSelector } from "../language-selector";
import { UserMenu } from "../user-menu";
import { cn } from "../ui/utils";

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
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="container flex h-14 max-w-screen-xl items-center justify-between px-4 mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/logo.jpg"
            alt="Quiver Logo"
            className="w-8 h-8 object-contain"
          />
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
            <button
              className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-200 ease-in-out",
          isMobileMenuOpen ? "max-h-48 border-b border-gray-200" : "max-h-0"
        )}
      >
        <div className="container max-w-screen-xl mx-auto px-4 py-4">
          <nav className="flex flex-col gap-4">
            {/* Language Selector in mobile menu */}
            {showLanguageSelector && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
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
