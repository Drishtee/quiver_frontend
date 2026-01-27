import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../language-selector";
import { UserMenu } from "../user-menu";

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-xl items-center justify-between px-4 mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-display font-semibold text-primary">
            Quiver
          </span>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {showLanguageSelector && <LanguageSelector />}
          {showUserMenu && isAuthenticated && onLogout && (
            <UserMenu onLogout={onLogout} />
          )}
        </div>
      </div>
    </header>
  );
}
