import { useTranslation } from "react-i18next";
import { IllustrationPlaceholder } from "../IllustrationPlaceholder";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      {/* GFX-GLOB-004: Footer Decorative Strip — Indian cityscape/village skyline */}
      {/* TODO: Replace with illustrated skyline strip — see GRAPHIC_DESIGN_SPEC.md */}
      {/* <img src="/illustrations/global/gfx-glob-004-footer-strip.svg" alt="" className="w-full h-[60px] opacity-15" /> */}
      <IllustrationPlaceholder
        id="GFX-GLOB-004"
        label="Indian cityscape/village skyline decorative strip"
        height="60px"
      />
      <div className="container max-w-screen-xl mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Copyright - Full width on mobile, left on desktop */}
          <p className="text-xs md:text-sm text-gray-500 text-center md:text-left order-2 md:order-1">
            &copy; {currentYear} Quiver. All rights reserved.
          </p>

          {/* Links - Stacked vertically on mobile, horizontal on desktop */}
          <nav className="flex flex-col items-center gap-3 md:flex-row md:items-center md:gap-6 order-1 md:order-2">
            <a
              href="#privacy"
              className="text-xs md:text-sm text-gray-500 hover:text-gray-900 transition-colors touch-target flex items-center justify-center"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              className="text-xs md:text-sm text-gray-500 hover:text-gray-900 transition-colors touch-target flex items-center justify-center"
            >
              Terms of Service
            </a>
            <a
              href="#contact"
              className="text-xs md:text-sm text-gray-500 hover:text-gray-900 transition-colors touch-target flex items-center justify-center"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
