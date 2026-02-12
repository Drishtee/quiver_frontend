# QUIVER Frontend Documentation

**Version**: 0.0.1
**Last Updated**: February 2026
**Tech Stack**: React 18.3.1 + TypeScript 5.9 + Vite 6.3.5 + Tailwind CSS 4.1.12 + Radix UI (shadcn/ui)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack & Dependencies](#2-technology-stack--dependencies)
3. [Project Structure](#3-project-structure)
4. [Build & Development Configuration](#4-build--development-configuration)
5. [Entry Point & Provider Hierarchy](#5-entry-point--provider-hierarchy)
6. [Navigation Architecture](#6-navigation-architecture)
7. [Screens](#7-screens)
8. [Components](#8-components)
9. [Contexts (State Management)](#9-contexts-state-management)
10. [Services (API Layer)](#10-services-api-layer)
11. [Hooks](#11-hooks)
12. [Configuration Files](#12-configuration-files)
13. [Types & Interfaces](#13-types--interfaces)
14. [Internationalization (i18n)](#14-internationalization-i18n)
15. [Styling System](#15-styling-system)
16. [Utilities](#16-utilities)
17. [Feedback System](#17-feedback-system)
18. [AI Voice Assistant Architecture](#18-ai-voice-assistant-architecture)
19. [Data Flow Diagrams](#19-data-flow-diagrams)
20. [Environment Variables](#20-environment-variables)

---

## 1. Project Overview

QUIVER is an equity-based growth partnership platform for small businesses in India. The frontend is a mobile-first single-page application (SPA) that guides entrepreneurs through an onboarding journey using a conversational AI voice assistant ("Jyoti Didi"). The application supports four languages: English, Hindi, Assamese, and Marathi.

### Key Features

- **Phone-based OTP authentication** (no password required)
- **Multi-step onboarding wizard** with 6 sequential screens (Consent → Profile → Industry → Questionnaire → Equity → Review)
- **AI Voice Assistant** ("Jyoti Didi") — real-time voice conversation via OpenAI Realtime API WebSocket, can fill onboarding forms conversationally
- **Voice-first onboarding** — complete the entire onboarding through voice conversation
- **AI Growth Pathway** — AI-generated 3-year business growth roadmap
- **Meeting scheduling** with Google Meet integration
- **Document upload** (Aadhaar, Udyam certificate, CIBIL report) to Azure Blob Storage
- **Admin dashboard** with AI assistant configuration
- **Offline-capable** — localStorage + IndexedDB for offline data persistence with auto-sync
- **In-app feedback system** — drag-and-drop sticky notes for client review

---

## 2. Technology Stack & Dependencies

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.3.1 | UI framework |
| react-dom | 18.3.1 | React DOM renderer |
| typescript | 5.9.3 | Static typing |
| vite | 6.3.5 | Build tool & dev server |

### Styling

| Package | Version | Purpose |
|---------|---------|---------|
| tailwindcss | 4.1.12 | Utility-first CSS framework |
| @tailwindcss/vite | 4.1.12 | Vite plugin for Tailwind |
| tw-animate-css | 1.3.8 | Tailwind animation utilities |
| class-variance-authority | 0.7.1 | Component variant management |
| clsx | 2.1.1 | Conditional classnames |
| tailwind-merge | 3.2.0 | Tailwind class deduplication |

### UI Components (Radix UI / shadcn)

| Package | Version | Purpose |
|---------|---------|---------|
| @radix-ui/react-accordion | 1.2.3 | Expandable sections |
| @radix-ui/react-alert-dialog | 1.1.6 | Confirmation dialogs |
| @radix-ui/react-avatar | 1.1.3 | User avatars |
| @radix-ui/react-checkbox | 1.1.4 | Checkboxes |
| @radix-ui/react-dialog | 1.1.6 | Modal dialogs |
| @radix-ui/react-dropdown-menu | 2.1.6 | Dropdown menus |
| @radix-ui/react-label | 2.1.2 | Form labels |
| @radix-ui/react-popover | 1.1.6 | Popover menus |
| @radix-ui/react-progress | 1.1.2 | Progress bars |
| @radix-ui/react-radio-group | 1.2.3 | Radio button groups |
| @radix-ui/react-scroll-area | 1.2.3 | Custom scrollbars |
| @radix-ui/react-select | 2.1.6 | Select dropdowns |
| @radix-ui/react-separator | 1.1.2 | Visual dividers |
| @radix-ui/react-slider | 1.2.3 | Range sliders |
| @radix-ui/react-switch | 1.1.3 | Toggle switches |
| @radix-ui/react-tabs | 1.1.3 | Tab navigation |
| @radix-ui/react-toggle | 1.1.2 | Toggle buttons |
| @radix-ui/react-toggle-group | 1.1.2 | Toggle groups |
| @radix-ui/react-tooltip | 1.1.8 | Tooltips |
| cmdk | 1.1.1 | Command palette |
| input-otp | 1.4.2 | OTP input fields |
| sonner | 2.0.3 | Toast notifications |
| vaul | 1.1.2 | Drawer component |

### MUI (Material UI)

| Package | Version | Purpose |
|---------|---------|---------|
| @mui/material | 7.3.5 | Material Design components |
| @mui/icons-material | 7.3.5 | Material Design icons |
| @emotion/react | 11.14.0 | CSS-in-JS for MUI |
| @emotion/styled | 11.14.1 | Styled components for MUI |

### Data & Forms

| Package | Version | Purpose |
|---------|---------|---------|
| react-hook-form | 7.55.0 | Form state management |
| axios | 1.13.2 | HTTP client (legacy, mostly fetch now) |
| date-fns | 3.6.0 | Date formatting & manipulation |
| recharts | 2.15.2 | Charts for dashboard & analytics |

### AI & Voice

| Package | Version | Purpose |
|---------|---------|---------|
| @openai/agents | 0.0.10 | OpenAI Agents SDK (voice) |
| three | 0.160.1 | 3D graphics (avatar) |
| @react-three/fiber | 8.18.0 | React renderer for Three.js |
| @react-three/drei | 9.122.0 | Three.js helpers |

### Internationalization

| Package | Version | Purpose |
|---------|---------|---------|
| i18next | 23.16.8 | i18n framework |
| react-i18next | 14.1.3 | React bindings for i18next |
| i18next-browser-languagedetector | 7.2.2 | Auto-detect user language |

### Other

| Package | Version | Purpose |
|---------|---------|---------|
| lucide-react | 0.487.0 | Icon library |
| motion | 12.23.24 | Animation library (Framer Motion) |
| react-day-picker | 8.10.1 | Date picker calendar |
| react-dnd | 16.0.1 | Drag and drop |
| react-dnd-html5-backend | 16.0.1 | HTML5 DnD backend |
| react-slick | 0.31.0 | Carousel/slider |
| react-youtube | 10.1.0 | YouTube video embed |
| react-responsive-masonry | 2.7.1 | Masonry grid layout |
| react-resizable-panels | 2.1.7 | Resizable split panels |
| react-popper | 2.3.0 | Popper positioning |
| embla-carousel-react | 8.6.0 | Carousel/slider |
| next-themes | 0.4.6 | Theme management (dark/light) |

---

## 3. Project Structure

```
QUIVER_FRONTEND/
├── public/                          # Static assets
│   ├── illustrations/               # Placeholder illustration directory
│   ├── GFX-*.png                    # Graphic assets for screens
│   └── ...
├── src/
│   ├── main.tsx                     # Application entry point
│   ├── app/
│   │   ├── App.tsx                  # Root component — navigation controller
│   │   ├── screens/                 # 22 screen components
│   │   │   ├── landing.tsx
│   │   │   ├── login.tsx
│   │   │   ├── signup.tsx
│   │   │   ├── otp-verification.tsx
│   │   │   ├── business-model-confirmation.tsx
│   │   │   ├── understanding-consent.tsx
│   │   │   ├── profile-creation.tsx
│   │   │   ├── industry-selection.tsx
│   │   │   ├── business-questionnaire.tsx
│   │   │   ├── equity-partnership.tsx
│   │   │   ├── document-upload.tsx
│   │   │   ├── review-submit.tsx
│   │   │   ├── admin-dashboard.tsx
│   │   │   ├── entrepreneur-dashboard.tsx
│   │   │   ├── entrepreneur-dashboard-enhanced.tsx
│   │   │   ├── schedule-meeting.tsx
│   │   │   ├── google-meet-meeting.tsx
│   │   │   ├── video-meeting.tsx
│   │   │   ├── twilio-video-meeting.tsx
│   │   │   ├── growth-pathway.tsx
│   │   │   ├── ai-growth-pathway.tsx
│   │   │   └── voice-onboarding.tsx
│   │   └── components/              # Reusable components
│   │       ├── ui/                  # 40+ shadcn/ui primitives
│   │       ├── voice/               # Voice assistant UI components
│   │       ├── layout/              # Layout components (Header, Footer, etc.)
│   │       ├── admin/               # Admin panel components
│   │       ├── avatar/              # 3D avatar components
│   │       ├── figma/               # Figma-exported components
│   │       └── *.tsx                # Standalone components
│   ├── contexts/                    # React Context providers (6)
│   │   ├── AuthContext.tsx
│   │   ├── OnboardingContext.tsx
│   │   ├── VoiceAgentContext.tsx
│   │   ├── RealtimeVoiceContext.tsx
│   │   ├── AIAssistantConfigContext.tsx
│   │   └── OpenAIVoiceContext.tsx
│   ├── services/                    # API & business logic services (5)
│   │   ├── api.ts                   # Main API service (40+ endpoints)
│   │   ├── ai-pathway.ts           # AI growth pathway generation
│   │   ├── audioStorage.ts         # IndexedDB audio recording storage
│   │   ├── placeholderAI.ts        # Fallback AI processing (Web Speech API)
│   │   └── whatsapp.ts             # WhatsApp integration
│   ├── hooks/                       # Custom React hooks (7)
│   │   ├── useAutoSave.ts          # Auto-save with debounce & offline queue
│   │   ├── useFormSteps.ts         # Multi-step form navigation
│   │   ├── useSpeechRecognition.ts # Web Speech API wrapper
│   │   ├── useTextToSpeech.ts      # Speech synthesis wrapper
│   │   ├── useAvatarState.ts       # 3D avatar animation state
│   │   ├── useVoiceAgent.ts        # Voice agent logic
│   │   └── useRealtimeVoiceAssistant.ts # OpenAI Realtime API hook
│   ├── config/                      # Configuration (3)
│   │   ├── actionRegistry.ts       # AI assistant action registry
│   │   ├── defaultScreenConfigs.ts # Per-screen AI assistant config
│   │   └── formFieldMappings.ts    # Voice field alias mappings (4 languages)
│   ├── types/                       # TypeScript type definitions (3)
│   │   ├── api.ts                  # API request/response types
│   │   ├── aiAssistantConfig.ts    # AI assistant config types
│   │   └── screenAssistantConfig.ts # Screen-level config types
│   ├── utils/                       # Utility functions (1)
│   │   └── storage.ts              # localStorage wrapper with type safety
│   ├── i18n/                        # Internationalization
│   │   ├── index.ts                # i18next initialization
│   │   ├── LanguageContext.tsx      # Language provider
│   │   └── locales/
│   │       ├── en.json             # English translations
│   │       ├── hi.json             # Hindi translations
│   │       ├── as.json             # Assamese translations
│   │       └── mr.json             # Marathi translations
│   ├── styles/                      # Global styles
│   │   ├── index.css               # Main entry (imports all)
│   │   ├── tailwind.css            # Tailwind directives
│   │   ├── theme.css               # CSS variables & theme
│   │   └── fonts.css               # Font definitions
│   ├── feedback/                    # In-app feedback system
│   │   ├── index.ts                # Exports FeedbackRoot
│   │   ├── FeedbackRoot.tsx        # Root feedback component
│   │   ├── DraggableNotePen.tsx    # Drag-and-drop note pen tool
│   │   ├── StickyNote.tsx          # Sticky note UI
│   │   ├── CommentForm.tsx         # Comment input form
│   │   ├── PasskeyPrompt.tsx       # Passkey auth for feedback
│   │   ├── api.ts                  # Feedback API calls
│   │   ├── webhook.ts             # Webhook notifications
│   │   ├── detectSection.ts        # Section detection utility
│   │   ├── constants.ts            # Feedback constants
│   │   └── types.ts                # Feedback types
│   └── lib/                         # Utility (cn function for Tailwind)
├── vite.config.ts                   # Vite build configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Dependencies & scripts
```

---

## 4. Build & Development Configuration

### Vite Configuration (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),  // @ maps to src/
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',      // Django backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

- **Dev proxy**: `/api/*` requests → `http://localhost:8000/*`
- **Build command**: `vite build`
- **Dev command**: `vite`

### TypeScript Configuration (`tsconfig.json`)

| Setting | Value | Notes |
|---------|-------|-------|
| module | nodenext | ESM module resolution |
| target | esnext | Latest JS features |
| strict | true | Full type checking |
| jsx | react-jsx | JSX transform |
| verbatimModuleSyntax | true | Explicit type imports |
| noUncheckedIndexedAccess | true | Safe index access |
| exactOptionalPropertyTypes | true | Strict optional props |
| skipLibCheck | true | Skip node_modules checks |

---

## 5. Entry Point & Provider Hierarchy

**File**: `src/main.tsx`

The application wraps `<App />` in 5 nested providers:

```
<LanguageProvider>             ← i18n language state
  <AIAssistantConfigProvider>  ← AI assistant config (public + screen configs)
    <OnboardingProvider>       ← Onboarding journey state & persistence
      <VoiceAgentProvider>     ← Fallback voice agent (Web Speech API)
        <OpenAIVoiceProvider>  ← OpenAI Realtime API voice assistant
          <App />
          <FeedbackRoot />     ← In-app feedback overlay
        </OpenAIVoiceProvider>
      </VoiceAgentProvider>
    </OnboardingProvider>
  </AIAssistantConfigProvider>
</LanguageProvider>
```

### Provider Dependency Chain

1. **LanguageProvider** — No dependencies. Provides `currentLanguage`, `setLanguage`, `t()` translation function.
2. **AIAssistantConfigProvider** — Fetches AI config from backend on mount. Provides `config`, `screenConfigs`, `getScreenConfig()`.
3. **OnboardingProvider** — Depends on `useAutoSave` hook. Manages 6-step onboarding state, field data, consent tracking.
4. **VoiceAgentProvider** — Depends on `OnboardingContext` + `LanguageContext`. Provides fallback voice agent via Web Speech API.
5. **OpenAIVoiceProvider** — Depends on `OnboardingContext` + `AIAssistantConfigContext` + `LanguageContext`. Manages OpenAI Realtime API WebSocket.

---

## 6. Navigation Architecture

**File**: `src/app/App.tsx`

The application uses **no routing library** (no React Router). Navigation is controlled by a single state variable:

```typescript
const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreen);
```

### Screen Type

```typescript
type Screen =
  | "landing" | "login" | "signup" | "otp"
  | "business-model" | "consent" | "profile" | "enterprise"
  | "industry" | "pathway" | "ai-pathway" | "questionnaire"
  | "equity" | "documents" | "review" | "admin"
  | "success" | "dashboard" | "schedule" | "video-meeting"
  | "voice-onboarding";
```

### Initial Screen Resolution

```typescript
const getInitialScreen = (): Screen => {
  const path = window.location.pathname;
  if (path === '/admin') return 'admin';
  if (path === '/dashboard') return 'dashboard';
  if (path === '/login') return 'login';
  if (path === '/signup') return 'signup';
  return 'landing';
};
```

### URL Synchronization

The app uses `window.history.pushState()` for URL updates (no page reloads):

| Screen | URL Path |
|--------|----------|
| landing | `/` |
| admin | `/admin` |
| dashboard | `/dashboard` |
| login | `/login` |
| signup | `/signup` |
| schedule | `/schedule` |
| (all others) | (no URL path — stays at current) |

### Navigation Flow

```
Landing → Login/Signup → OTP → [Business Model] → Consent → Profile
    → Industry → Questionnaire → Equity → Review → Success → Dashboard
                                                                ↓
                                                    Schedule Meeting
                                                    Document Upload
                                                    AI Growth Pathway
                                                    Video Meeting
```

### Auth-Guarded Routes

- `/admin` — Redirects to login if no `access_token`; stores `redirect_after_login`
- `/dashboard` — Redirects to login if no `access_token`; stores `redirect_after_login`
- After login, checks `redirect_after_login` in localStorage and navigates accordingly

### Onboarding Step ↔ Screen Mapping

| Step | Screen | What Is Collected |
|------|--------|-------------------|
| 0 | consent | User consent to data sharing |
| 1 | profile | Full name, email, gender, age, education, state, district |
| 2 | industry | Business name, sector, year started, ownership type, role |
| 3 | questionnaire | Products, customers, revenue, assets, growth intent (~20 fields) |
| 4 | equity | Openness to equity partnership (yes/no/maybe) |
| 5 | review | Final review of all submitted data |

---

## 7. Screens

### 7.1 Authentication Screens

#### `landing.tsx` — Landing Page
- **Props**: `onGetStarted(phone)`, `onLogin()`, `onSignup()`
- **Purpose**: Marketing landing page with hero section, features, CTA
- **Imports**: `landing.css` for shared landing styles
- **i18n**: Fully translated

#### `login.tsx` — Login Screen
- **Props**: `onLogin(data)`, `onBack()`, `onSwitchToSignup()`
- **Purpose**: Phone number input + OTP verification for returning users
- **Flow**: Enter phone → Send OTP → Verify OTP → Route based on `onboarding_completed`
- **API**: `sendOTP()`, `verifyOTP()`

#### `signup.tsx` — Signup Screen
- **Props**: `onSignup(data)`, `onBack()`, `onSwitchToLogin()`
- **Purpose**: New user registration via phone + OTP
- **Flow**: Enter phone → Send OTP → Verify OTP → Start onboarding
- **API**: `sendOTP()`, `verifyOTP()`

#### `otp-verification.tsx` — OTP Verification
- **Props**: `phone`, `onVerify(otp)`, `onBack()`, `onResend()`, `error`, `loading`
- **Purpose**: 6-digit OTP input with auto-submit
- **UI**: Uses `input-otp` component with individual digit cells

### 7.2 Onboarding Screens

#### `business-model-confirmation.tsx` — Business Model Intro
- **Props**: `onContinue()`
- **Purpose**: Explains Quiver's equity-based partnership model before onboarding
- **API**: `startOnboarding()` — creates onboarding session

#### `understanding-consent.tsx` — Consent Screen (Step 0)
- **Props**: `onContinue()`, `onVoiceOnboarding()`
- **Purpose**: Data collection consent with multiple consent items
- **Features**: Option to switch to voice-based onboarding
- **Action**: Records consent, marks step 0 complete

#### `profile-creation.tsx` — Profile Creation (Step 1)
- **Props**: `onContinue(data: ProfileData)`, `onBack()`
- **Export**: `ProfileData` type
- **Fields**:
  - `fullName` (text) — required
  - `email` (email) — optional
  - `gender` (select: male/female/other)
  - `age` (text)
  - `education` (select: no_formal/primary/secondary/graduate/post_graduate)
  - `state` (select from Indian states)
  - `district` (text)
- **API**: `bulkUpdateFields()` — saves all 7 fields at once

#### `industry-selection.tsx` — Industry/Business Details (Step 2)
- **Props**: `onContinue(data: EnterpriseData)`, `onBack()`
- **Export**: `EnterpriseData` type
- **Fields**:
  - `businessName` (text)
  - `sector` (select: food/textile/handicraft/agriculture/retail/services/manufacturing/other)
  - `yearStarted` (text)
  - `ownershipType` (select: sole_proprietor/partnership/family/cooperative)
  - `role` (text)
- **API**: `bulkUpdateFields()` — saves all 5 fields

#### `business-questionnaire.tsx` — Business Questionnaire (Step 3)
- **Props**: `onContinue(answers)`, `onBack()`
- **Purpose**: Multi-step questionnaire organized into 4 sections:
  - **Section D**: Products & Market (product description, primary customers, geography, sales channel)
  - **Section E**: Financial Status (monthly revenue, expenses, workers, digital transactions)
  - **Section F**: Assets & Registration (key assets, workspace type, existing registrations)
  - **Section G**: Growth & Intent (hours per day, open to change, priorities, investment amount)
- **UI**: Uses `useFormSteps` hook for internal step navigation
- **API**: `bulkUpdateFields()` — saves all answers

#### `equity-partnership.tsx` — Equity Partnership (Step 4)
- **Props**: `onContinue(answer)`, `onBack()`
- **Purpose**: Present equity partnership concept, get user's response
- **Field**: `open_to_equity` (select: yes/no/maybe/need_more_info)
- **API**: `updateField()` — saves single field

#### `document-upload.tsx` — Document Upload
- **Props**: `sessionId`, `onContinue()`, `onBack()`
- **Purpose**: Upload identity and business documents
- **Document Types**: Aadhaar, Udyam Certificate, CIBIL Report
- **API**: `uploadDocument()`, `listDocuments()`, `deleteDocument()`
- **Storage**: Files uploaded to Azure Blob Storage via backend

#### `review-submit.tsx` — Review & Submit (Step 5)
- **Props**: `profileData`, `enterpriseData`, `businessAnswers`, `equityAnswer`, `onEdit(section)`, `onSubmit()`, `isSubmitting`, `onBack()`
- **Purpose**: Display all collected data for user review before final submission
- **Features**: Edit buttons for each section, final submit button
- **API**: `submitOnboarding()` — marks session as submitted

### 7.3 Post-Onboarding Screens

#### `entrepreneur-dashboard.tsx` — Entrepreneur Dashboard
- **Props**: `profileData`, `onScheduleMeeting()`, `onJoinMeeting(id)`, `onLogout()`, `onUploadDocuments()`
- **Purpose**: Main dashboard after onboarding — meetings, profile summary, quick actions
- **Features**: Meeting list, schedule button, document upload shortcut, growth pathway link

#### `entrepreneur-dashboard-enhanced.tsx` — Enhanced Dashboard (Alternative)
- Enhanced version of the dashboard with additional analytics and charting
- Uses recharts for data visualization

#### `schedule-meeting.tsx` — Schedule Meeting
- **Props**: `onBack()`, `onSchedule(details: MeetingDetails)`
- **Export**: `MeetingDetails` type
- **Purpose**: Calendar-based meeting scheduler with time slot selection
- **Features**: Date picker (react-day-picker), time slot grid, meeting type selection
- **API**: `createMeeting()` — creates meeting with Google Meet room

#### `google-meet-meeting.tsx` — Google Meet Viewer
- **Props**: `meetingId`, `meetingTitle`, `onEndCall()`
- **Purpose**: Embeds Google Meet link with meeting controls
- **API**: `getMeetLink()` — fetches Google Meet URL

#### `video-meeting.tsx` — Video Meeting (Twilio, Legacy)
- Legacy Twilio-based video meeting screen
- **API**: `generateVideoToken()` — creates Twilio access token

#### `twilio-video-meeting.tsx` — Twilio Video (Legacy)
- Alternative Twilio video meeting implementation

#### `growth-pathway.tsx` — Static Growth Pathway
- Static version of the 3-year growth roadmap

#### `ai-growth-pathway.tsx` — AI Growth Pathway
- **Props**: `businessData`, `onBack()`, `onContinue()`
- **Purpose**: AI-generated personalized 3-year business growth pathway
- **API**: `generateGrowthPathway()` — calls backend (proxied to OpenAI)
- **Fallback**: Client-side fallback pathway if backend unavailable
- **Sections**: Business Summary, Growth Overview, Detailed Breakdown, Quiver Support, Key Changes

#### `voice-onboarding.tsx` — Voice-Only Onboarding
- **Props**: `phone`, `onBack()`, `onComplete(sessionId)`
- **Purpose**: Complete the entire onboarding journey through voice conversation
- **Flow**: Single screen with voice-guided data collection, auto-fills all fields

#### `admin-dashboard.tsx` — Admin Dashboard
- **Purpose**: Admin panel for managing AI assistant configuration, viewing onboarding sessions
- **Sections**: AI Assistant Config, Screen Behavior Config, User Management
- **API**: `fetchAIAssistantConfig()`, `updateAIAssistantConfig()`, `updateScreenAssistantConfigs()`

---

## 8. Components

### 8.1 UI Components (shadcn/ui) — `src/app/components/ui/`

40+ reusable Radix UI primitives following the shadcn/ui pattern. Each component:
- Uses Radix UI as the base
- Styled with Tailwind CSS + CSS variables
- Uses `class-variance-authority` for variants
- Uses `cn()` utility for class merging

| Component | File | Description |
|-----------|------|-------------|
| Accordion | accordion.tsx | Expandable content sections |
| AlertDialog | alert-dialog.tsx | Confirmation/warning dialogs |
| Alert | alert.tsx | Alert banners |
| AspectRatio | aspect-ratio.tsx | Responsive aspect ratio container |
| Avatar | avatar.tsx | User avatar with fallback |
| Badge | badge.tsx | Status badges/labels |
| Breadcrumb | breadcrumb.tsx | Navigation breadcrumbs |
| Button | button.tsx | Primary button with variants (default/destructive/outline/secondary/ghost/link) |
| Calendar | calendar.tsx | Date picker (react-day-picker) |
| Card | card.tsx | Card container (Header, Content, Footer) |
| Carousel | carousel.tsx | Image/content carousel (embla) |
| Chart | chart.tsx | Chart wrapper (recharts) |
| Checkbox | checkbox.tsx | Checkbox input |
| Collapsible | collapsible.tsx | Collapsible content |
| Command | command.tsx | Command palette (cmdk) |
| ContextMenu | context-menu.tsx | Right-click context menu |
| Dialog | dialog.tsx | Modal dialog |
| Drawer | drawer.tsx | Bottom/side drawer (vaul) |
| DropdownMenu | dropdown-menu.tsx | Dropdown menu |
| Form | form.tsx | Form context (react-hook-form) |
| FormStep | form-step.tsx | Single step in multi-step form |
| HoverCard | hover-card.tsx | Hover info card |
| Input | input.tsx | Text input |
| InputOTP | input-otp.tsx | OTP digit input |
| Label | label.tsx | Form label |
| Menubar | menubar.tsx | Top menu bar |
| NavigationMenu | navigation-menu.tsx | Navigation menu |
| Pagination | pagination.tsx | Page navigation |
| Popover | popover.tsx | Popover content |
| Progress | progress.tsx | Progress bar |
| RadioGroup | radio-group.tsx | Radio button group |
| Resizable | resizable.tsx | Resizable panels |
| ScrollArea | scroll-area.tsx | Custom scrollbar area |
| Select | select.tsx | Select dropdown |
| Separator | separator.tsx | Horizontal/vertical divider |
| Sheet | sheet.tsx | Side sheet panel |
| Sidebar | sidebar.tsx | Navigation sidebar |
| Skeleton | skeleton.tsx | Loading skeleton |
| Slider | slider.tsx | Range slider |
| Sonner | sonner.tsx | Toast notifications |
| StepProgress | step-progress.tsx | Step indicator for multi-step forms |
| Switch | switch.tsx | Toggle switch |
| Table | table.tsx | Data table |
| Tabs | tabs.tsx | Tab navigation |
| Textarea | textarea.tsx | Multi-line text input |
| Toggle | toggle.tsx | Toggle button |
| ToggleGroup | toggle-group.tsx | Toggle button group |
| Tooltip | tooltip.tsx | Hover tooltip |

### 8.2 Voice Components — `src/app/components/voice/`

| Component | File | Description |
|-----------|------|-------------|
| QuiverAIAssistant | QuiverAIAssistant.tsx | Main AI assistant floating UI — mic button + expandable conversation panel |
| RealtimeVoiceAssistant | RealtimeVoiceAssistant.tsx | Alternative realtime voice implementation |
| VoiceButton | VoiceButton.tsx | Mic button with recording animation |
| GlobalVoiceAgent | GlobalVoiceAgent.tsx | Global voice agent overlay |
| VoiceFormOverlay | VoiceFormOverlay.tsx | Voice-guided form overlay |

### 8.3 Layout Components — `src/app/components/layout/`

| Component | File | Description |
|-----------|------|-------------|
| Header | Header.tsx | App header with logo and navigation |
| Footer | Footer.tsx | App footer |
| Layout | Layout.tsx | Page layout wrapper (Header + Content + Footer) |
| MobileBottomNav | MobileBottomNav.tsx | Bottom navigation bar for mobile |

### 8.4 Admin Components — `src/app/components/admin/`

| Component | File | Description |
|-----------|------|-------------|
| AIAssistantTab | AIAssistantTab.tsx | Admin UI for configuring the AI assistant — voice type, personality, per-screen behavior, tools, prompts |

### 8.5 Other Components

| Component | File | Description |
|-----------|------|-------------|
| LanguageSelector | language-selector.tsx | Language picker dropdown (EN/HI/AS/MR) |
| GuidedTooltip | guided-tooltip.tsx | Step-by-step guided tooltip |
| AIAssistant | ai-assistant.tsx | Legacy text-based AI assistant |
| UserMenu | user-menu.tsx | User profile dropdown menu |
| ResumeJourneyModal | resume-journey-modal.tsx | Modal to resume incomplete onboarding |
| MeetingConfirmationModal | meeting-confirmation-modal.tsx | Meeting booking confirmation |
| VideoExplainer | video-explainer.tsx | YouTube video explainer embed |
| GrowthPlanSection | growth-plan-section.tsx | Growth plan display section |
| MeetingsList | meetings-list.tsx | List of scheduled meetings |
| ProgressIndicator | progress-indicator.tsx | Onboarding progress bar |
| AvatarContainer | avatar/AvatarContainer.tsx | 3D animated avatar (Three.js) |
| IllustrationPlaceholder | IllustrationPlaceholder.tsx | Placeholder for pending illustrations |
| ImageWithFallback | figma/ImageWithFallback.tsx | Image with error fallback |

---

## 9. Contexts (State Management)

### 9.1 OnboardingContext

**File**: `src/contexts/OnboardingContext.tsx`
**Provider**: `<OnboardingProvider>`
**Hook**: `useOnboarding()`

Manages the entire onboarding journey state.

**State**:
```typescript
interface OnboardingState {
  sessionId: string | null;        // Backend session UUID
  currentStep: number;             // 0-5
  completedSteps: number[];        // [0, 1, 2, ...]
  formData: Record<string, any>;   // All form field values
  lastSaved: Date | null;          // Last successful save timestamp
  isSaving: boolean;               // Auto-save in progress
  isOnline: boolean;               // Network connectivity
  consentGiven: boolean;           // Legacy consent flag
  consentTimestamp: Date | null;    // When consent was given
  consents: Record<string, ConsentRecord>;  // Individual consent items
}
```

**Methods**:

| Method | Description |
|--------|-------------|
| `setField(key, value)` | Set a single form field (auto-saves) |
| `setFields(fields)` | Set multiple fields (auto-saves) |
| `getField(key, defaultValue)` | Get field value with type safety |
| `goToStep(step)` | Navigate to onboarding step (0-5) |
| `nextStep()` | Advance to next step |
| `previousStep()` | Go to previous step |
| `markStepComplete(step)` | Mark a step as completed |
| `isStepComplete(step)` | Check if step is done |
| `getCompletionPercentage()` | Get overall progress (0-100%) |
| `setSessionId(id)` | Set backend session UUID |
| `recordConsent(key, timestamp)` | Record individual consent |
| `loadSavedProgress()` | Restore from localStorage |
| `clearProgress()` | Reset all progress |
| `forceSave()` | Trigger immediate API sync |

**Step Definitions**:
```typescript
const ONBOARDING_STEPS = [
  { id: 0, key: 'consent',       name: 'Consent',          nameHi: 'सहमति' },
  { id: 1, key: 'profile',       name: 'Profile',          nameHi: 'प्रोफाइल' },
  { id: 2, key: 'industry',      name: 'Business Details', nameHi: 'व्यवसाय विवरण' },
  { id: 3, key: 'questionnaire', name: 'Questionnaire',    nameHi: 'प्रश्नावली' },
  { id: 4, key: 'equity',        name: 'Partnership',      nameHi: 'साझेदारी' },
  { id: 5, key: 'review',        name: 'Review',           nameHi: 'समीक्षा' },
];
```

### 9.2 AIAssistantConfigContext

**File**: `src/contexts/AIAssistantConfigContext.tsx`
**Provider**: `<AIAssistantConfigProvider>`
**Hook**: `useAIAssistantConfig()`

Fetches and provides AI assistant configuration from the backend.

**State**:
```typescript
interface AIAssistantConfigContextValue {
  config: AIAssistantPublicConfig | null;     // Global AI config
  screenConfigs: ScreenConfigMap;             // Per-screen config map
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getLocalizedValue: (field, language) => string;
  getScreenConfig: (screenKey) => ScreenAssistantConfig;
}
```

**Behavior**:
- Fetches both `fetchPublicAIConfig()` and `fetchScreenAssistantConfigs()` on mount (parallel)
- Merges fetched configs with `DEFAULT_SCREEN_CONFIGS` (fetched overrides defaults)
- Falls back to defaults if API unavailable
- `getScreenConfig()` returns the AI assistant configuration for a specific screen

### 9.3 OpenAIVoiceContext

**File**: `src/contexts/OpenAIVoiceContext.tsx`
**Provider**: `<OpenAIVoiceProvider>`
**Hook**: `useOpenAIVoice()`

The core voice assistant engine. Manages an OpenAI Realtime API WebSocket connection for real-time voice-to-voice conversations.

**Key Features**:
- Connects to OpenAI Realtime API via ephemeral token from backend
- Sends `session.update` on screen change with screen-specific tools and system prompt
- Handles audio input/output via `MediaRecorder` and `AudioContext`
- Manages tool calls (field updates, navigation, confirmation)
- Persona: "Jyoti Didi" — warm, supportive business guide
- Voice: shimmer
- VAD: threshold 0.5, prefix padding 400ms, silence duration 1600ms

**Available Tools** (configured per screen):
- `update_form_field` — Silently save a single field
- `batch_update_fields` — Silently save multiple fields
- `summarize_and_confirm` — End-of-section summary + confirmation
- `navigate_to_screen` — Navigate to allowed screen
- `trigger_action` — Execute registered screen action

**Tool Result Behavior**:
- `update_form_field` / `batch_update_fields`: Does NOT send `response.create` (avoids "field updated" announcements)
- `navigate_to_screen` / `summarize_and_confirm`: Sends `response.create` (needs new AI response)
- `trigger_action`: Executes async action handler

### 9.4 VoiceAgentContext

**File**: `src/contexts/VoiceAgentContext.tsx`
**Provider**: `<VoiceAgentProvider>`
**Hook**: `useVoiceAgentContext()`

Fallback voice agent using Web Speech API (browser-native speech recognition + synthesis). Used when OpenAI Realtime API is not available.

**State**:
```typescript
interface VoiceAgentState {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  isExpanded: boolean;
  transcript: string;
  interimTranscript: string;
  conversationHistory: ConversationMessage[];
  currentScreen: ScreenType | null;
  filledFields: Record<string, any>;
  error: string | null;
  isSupported: boolean;
}
```

### 9.5 LanguageContext

**File**: `src/i18n/LanguageContext.tsx`
**Provider**: `<LanguageProvider>`
**Hook**: `useLanguage()`

**State**:
```typescript
interface LanguageContextType {
  currentLanguage: SupportedLanguage;  // 'en' | 'hi' | 'as' | 'mr'
  setLanguage: (lang) => void;
  languages: { code, name, nativeName }[];
  t: (key, options?) => string;        // Translation function
}
```

- Default language: `'hi'` (Hindi)
- Persisted in localStorage key `quiver_language`

### 9.6 AuthContext

**File**: `src/contexts/AuthContext.tsx`

Legacy authentication context. Current auth is handled directly in App.tsx via localStorage tokens.

---

## 10. Services (API Layer)

### 10.1 Main API Service

**File**: `src/services/api.ts`

Centralized API service with 40+ endpoint functions. Uses `fetch()` API with JWT Bearer authentication.

**Base URL**: `import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'`

**Authentication Helper**:
```typescript
makeAuthenticatedRequest<T>(url, options) → Promise<T>
```
Reads `access_token` from localStorage, sets `Authorization: Bearer ${token}` header.

#### Authentication Endpoints

| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `sendOTP(phone)` | POST | `/auth/send-otp/` | Send OTP to phone (max 3 in 10 min, expires 5 min) |
| `verifyOTP(phone, otp)` | POST | `/auth/verify-otp/` | Verify OTP → returns JWT tokens, stores in localStorage |
| `getDebugOTPs()` | GET | `/auth/debug-otps/` | Dev-only: view recent OTPs |
| `logout()` | — | (client-side) | Clears all auth data from localStorage |

#### Onboarding Endpoints

| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `getQuestionnaire()` | GET | `/onboarding/questionnaire/` | Get questionnaire structure |
| `startOnboarding()` | POST | `/onboarding/start/` | Create/resume onboarding session |
| `updateField(sessionId, key, value, source)` | POST | `/onboarding/update-field/` | Update single field |
| `bulkUpdateFields(sessionId, fields)` | POST | `/onboarding/bulk-update-fields/` | Update multiple fields |
| `getOnboardingSession(sessionId)` | GET | `/onboarding/{id}/` | Get session data |
| `getQuestionnaireWithProgress(sessionId)` | GET | `/onboarding/{id}/questionnaire/` | Get questionnaire with progress |
| `submitOnboarding(sessionId)` | POST | `/onboarding/submit/` | Submit completed onboarding |
| `getMyProfile()` | GET | `/onboarding/my-profile/` | Get user's own profile |

#### Audio & Document Endpoints

| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `uploadAudio(sessionId, blob, metadata)` | POST | `/onboarding/upload-audio/` | Upload audio to Azure Blob Storage |
| `getAudioRecords(sessionId)` | GET | `/onboarding/{id}/audio-records/` | Get session audio records |
| `uploadDocument(sessionId, type, file)` | POST | `/onboarding/upload-document/` | Upload document to Azure Blob |
| `listDocuments(sessionId)` | GET | `/onboarding/{id}/documents/` | List session documents |
| `deleteDocument(documentId)` | DELETE | `/onboarding/document/{id}/delete/` | Delete document |

#### Meeting Endpoints

| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `createMeeting(data)` | POST | `/meetings/create/` | Create meeting + auto-create Google Meet |
| `listMeetings(params?)` | GET | `/meetings/list/` | List user's meetings (max 100) |
| `getMeetingDetails(id)` | GET | `/meetings/{id}/` | Full meeting details + participants |
| `cancelMeeting(id, cancelFuture?)` | POST | `/meetings/{id}/cancel/` | Cancel meeting (organizer only) |
| `addParticipants(id, phones)` | POST | `/meetings/{id}/participants/add/` | Add participants |
| `generateVideoToken(id)` | POST | `/meetings/{id}/video/token/` | Get Twilio video token (legacy) |
| `getMeetingReminders(id)` | GET | `/meetings/{id}/reminders/` | Get meeting reminders |
| `getMeetLink(id)` | GET | `/meetings/{id}/meet-link/` | Get Google Meet link |

#### Voice Agent Endpoints

| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `getVoiceAgentToken()` | GET | `/auth/voice-agent/token/` | Ephemeral token for OpenAI Realtime API |
| `getVoiceAgentConfig()` | GET | `/auth/voice-agent/config/` | Voice agent session config |
| `submitVoiceAgentData(phone, data, sessionId?)` | POST | `/auth/voice-agent/submit/` | Submit voice-collected data |

#### AI Assistant Config Endpoints

| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `fetchPublicAIConfig()` | GET | `/auth/ai-assistant-public-config/` | Public AI config (no auth) |
| `fetchAIAssistantConfig()` | GET | `/auth/ai-assistant-config/` | Full AI config (admin only) |
| `updateAIAssistantConfig(data)` | PUT | `/auth/ai-assistant-config/` | Update AI config (admin only) |
| `fetchScreenAssistantConfigs()` | GET | `/auth/screen-assistant-configs/` | All screen configs (public) |
| `updateScreenAssistantConfigs(configs)` | PUT | `/auth/screen-assistant-configs/` | Bulk update screen configs (admin) |

### 10.2 AI Growth Pathway Service

**File**: `src/services/ai-pathway.ts`

| Function | Description |
|----------|-------------|
| `generateGrowthPathway(businessData)` | Calls backend `/onboarding/ai-growth-pathway/` (proxied to OpenAI). Returns 3-year growth plan. Falls back to client-side template if API unavailable. |

**Response Structure** (`AIGrowthPathwayData`):
- `businessSummary` — One-paragraph summary
- `overview[]` — Year 1/2/3 overview with goals, revenue targets, team size
- `detailed[]` — Quarter-by-quarter breakdown (revenue, profit, customers, actions)
- `quiverSupport` — Mentorship, capital, market access details
- `keyChanges[]` — Year-by-year priority list
- `closingNote` — Inspirational closing

### 10.3 Audio Storage Service

**File**: `src/services/audioStorage.ts`

IndexedDB-based persistent storage for voice recordings.

| Method | Description |
|--------|-------------|
| `saveRecording(recording)` | Save audio blob with metadata to IndexedDB |
| `getRecording(id)` | Get recording by ID |
| `getAllRecordings()` | Get all recordings |
| `getRecordingsBySession(sessionId)` | Filter by session |
| `getPendingUploads()` | Get recordings not yet uploaded |
| `markAsUploaded(id)` | Mark recording as uploaded |
| `deleteRecording(id)` | Delete single recording |
| `clearAllRecordings()` | Delete all recordings |
| `deleteOldRecordings(daysOld)` | Delete recordings older than N days |
| `getStorageUsed()` | Get total bytes used |
| `downloadRecording(id)` | Download recording as WAV file |

### 10.4 Placeholder AI Service

**File**: `src/services/placeholderAI.ts`

Client-side fallback AI that processes user speech transcripts and extracts form field values using pattern matching. Used by `VoiceAgentContext` when OpenAI Realtime API is not available.

### 10.5 WhatsApp Service

**File**: `src/services/whatsapp.ts`

WhatsApp integration utilities for meeting reminders and notifications.

---

## 11. Hooks

### 11.1 useAutoSave

**File**: `src/hooks/useAutoSave.ts`

Auto-saves form data to both localStorage (immediate) and backend API (debounced).

**Options**:
```typescript
interface UseAutoSaveOptions {
  sessionId: string | null;
  debounceMs?: number;        // Default: 500ms
  syncIntervalMs?: number;    // Default: 5000ms (periodic sync)
  onSaveStart?: () => void;
  onSaveComplete?: () => void;
  onSaveError?: (error) => void;
}
```

**Returns**:
```typescript
interface UseAutoSaveReturn {
  saveField: (key, value, source?) => void;
  saveFields: (fields, source?) => void;
  isSaving: boolean;
  lastSaved: Date | null;
  pendingChanges: number;
  forceSave: () => Promise<void>;
  isOnline: boolean;
}
```

**Behavior**:
1. On `saveField()`/`saveFields()`: Saves to localStorage immediately, adds to pending queue
2. Debounces API sync by `debounceMs` (default 500ms)
3. Periodic sync every `syncIntervalMs` (default 5s) if pending changes exist
4. When offline: queues changes in `journeyStorage.addPendingChange()`
5. When back online: replays offline queue and syncs to server

### 11.2 useFormSteps

**File**: `src/hooks/useFormSteps.ts`

Generic multi-step form navigation with validation.

**Options**: Step configs with field definitions, validation functions, optional skip
**Returns**: `currentStep`, `nextStep()`, `prevStep()`, `goToStep()`, `validateCurrentStep()`, form data methods

### 11.3 useSpeechRecognition

**File**: `src/hooks/useSpeechRecognition.ts`

Wrapper around the Web Speech Recognition API.

**Features**: Language setting, continuous/interim results, start/stop control, error handling, browser support detection.

### 11.4 useTextToSpeech

**File**: `src/hooks/useTextToSpeech.ts`

Wrapper around the Web Speech Synthesis API for text-to-speech output.

### 11.5 useAvatarState

**File**: `src/hooks/useAvatarState.ts`

Manages 3D avatar animation state (idle, listening, speaking, thinking) for the Three.js avatar.

### 11.6 useVoiceAgent

**File**: `src/hooks/useVoiceAgent.ts`

Voice agent logic hook (used by VoiceAgentContext).

### 11.7 useRealtimeVoiceAssistant

**File**: `src/hooks/useRealtimeVoiceAssistant.ts`

Hook for managing the OpenAI Realtime API voice assistant connection.

---

## 12. Configuration Files

### 12.1 Action Registry

**File**: `src/config/actionRegistry.ts`

Singleton registry mapping action IDs to handler functions. Used by the AI voice assistant to execute screen-specific actions.

```typescript
class ActionRegistry {
  registerNavigationHandler(handler: (screen) => void);
  registerAction(id: string, handler: () => void, description: string);
  unregisterAction(id: string);
  clearActions();
  navigateTo(screen): { success: boolean; message: string };
  executeAction(id, params?): Promise<{ success; message }>;
  getRegisteredActions(): { id; description }[];
}
```

**Registered Actions** (from App.tsx):
- `go_back` — Navigate to previous screen (uses back map)
- `accept_consent` — Accept consent and proceed to profile (consent screen only)
- `submit_review` — Submit complete application (review screen only)

### 12.2 Default Screen Configs

**File**: `src/config/defaultScreenConfigs.ts`

Fallback AI assistant configuration for each of the 21 screens. Used when backend screen configs are unavailable.

Each config specifies:
- `screen_key` — Screen identifier
- `enabled` — Whether AI assistant is active on this screen
- `system_prompt_override` — Screen-specific conversation prompt
- `enabled_tools` — Which tools the AI can use
- `allowed_navigation_targets` — Screens the AI can navigate to
- `custom_actions` — Screen-specific actions

**Enabled Screens**: consent, profile, industry, questionnaire, equity, documents, review, dashboard, schedule (9 of 21)

### 12.3 Form Field Mappings

**File**: `src/config/formFieldMappings.ts`

Maps voice-spoken field aliases to form field keys. Supports 4 languages.

```typescript
interface FieldMapping {
  key: string;           // e.g., 'fullName'
  screen: ScreenType;    // Which screen this field belongs to
  aliases: {
    en: string[];        // English aliases: ['name', 'full name', 'my name']
    hi: string[];        // Hindi aliases: ['नाम', 'मेरा नाम', 'पूरा नाम']
    as: string[];        // Assamese aliases: ['নাম', 'মোৰ নাম']
    mr: string[];        // Marathi aliases: ['नाव', 'माझे नाव', 'पूर्ण नाव']
  };
  type: 'text' | 'select' | 'number' | 'email';
  options?: FieldOption[];  // For select fields
}
```

**Helper Functions**:
- `findFieldByAlias(text, screen)` — Find field by spoken alias in any language
- `findOptionByAlias(text, field)` — Find select option by spoken alias
- `getFieldsForScreen(screen)` — Get all fields for a screen
- `getFieldByKey(key)` — Get field mapping by key

---

## 13. Types & Interfaces

### 13.1 API Types (`src/types/api.ts`)

All API request/response TypeScript interfaces organized by domain:

**Common Enums**:
```typescript
type MeetingType = 'one_on_one' | 'group';
type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
type FieldStatus = 'suggested' | 'confirmed';
type FieldSource = 'voice' | 'ui' | 'text' | 'document';
type OnboardingStatus = 'in_progress' | 'submitted' | 'locked';
type ReminderType = '24h' | '1h' | '15m';
type ReminderStatus = 'pending' | 'sent' | 'failed';
type ParticipantResponseStatus = 'pending' | 'accepted' | 'declined';
type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';
```

**Key Interfaces**: `SendOTPRequest/Response`, `VerifyOTPRequest/Response`, `StartOnboardingRequest/Response`, `UpdateFieldRequest/Response`, `BulkUpdateFieldsRequest/Response`, `OnboardingSessionResponse`, `CreateMeetingRequest/Response`, `ListMeetingsResponse`, `MeetingDetailsResponse`, `GoogleMeet`, `MeetLinkResponse`, `GenerateVideoTokenResponse`, `ErrorResponse`, `User`

### 13.2 AI Assistant Config Types (`src/types/aiAssistantConfig.ts`)

```typescript
interface AIAssistantConfig {
  assistant_name: Record<string, string>;       // Localized name
  assistant_subtitle: Record<string, string>;   // Localized subtitle
  greeting_messages: Record<string, string>;    // Localized greetings
  voice_type: 'alloy' | 'echo' | 'shimmer' | 'ash' | 'ballad' | 'coral' | 'sage' | 'verse';
  style_preset: 'friendly' | 'professional' | 'casual' | 'empathetic';
  custom_system_prompt: string;
  personality_traits: string[];
  vad_threshold: number;
  silence_duration_ms: number;
  vad_prefix_padding_ms: number;
  updated_at: string;
}

type AIAssistantPublicConfig = Pick<AIAssistantConfig,
  'assistant_name' | 'assistant_subtitle' | 'greeting_messages' | 'voice_type' | 'style_preset'
>;
```

### 13.3 Screen Assistant Config Types (`src/types/screenAssistantConfig.ts`)

```typescript
type AllScreenType =
  | 'landing' | 'login' | 'signup' | 'otp' | 'business-model'
  | 'consent' | 'profile' | 'enterprise' | 'industry' | 'pathway'
  | 'ai-pathway' | 'questionnaire' | 'equity' | 'documents' | 'review'
  | 'admin' | 'success' | 'dashboard' | 'schedule' | 'video-meeting'
  | 'voice-onboarding';

interface ScreenAction {
  action_id: string;
  label: string;
  description: string;
}

interface ScreenAssistantConfig {
  screen_key: AllScreenType;
  enabled: boolean;
  system_prompt_override: string;
  enabled_tools: string[];
  allowed_navigation_targets: AllScreenType[];
  custom_actions: ScreenAction[];
}

type ScreenConfigMap = Record<string, ScreenAssistantConfig>;
```

---

## 14. Internationalization (i18n)

### Configuration

**File**: `src/i18n/index.ts`

```typescript
i18n
  .use(LanguageDetector)          // Auto-detect from localStorage/navigator
  .use(initReactI18next)           // React bindings
  .init({
    resources,                     // en, hi, as, mr
    lng: localStorage.getItem('quiver_language') || 'hi',  // Default: Hindi
    fallbackLng: 'en',             // Fallback: English
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'quiver_language',
    }
  });
```

### Supported Languages

| Code | Language | Native Name | Script |
|------|----------|-------------|--------|
| en | English | English | Latin |
| hi | Hindi | हिंदी | Devanagari |
| as | Assamese | অসমীয়া | Eastern Nagari |
| mr | Marathi | मराठी | Devanagari |

### Translation Files

Located at `src/i18n/locales/`:
- `en.json` — English translations
- `hi.json` — Hindi translations
- `as.json` — Assamese translations
- `mr.json` — Marathi translations

### Usage

```typescript
// In components
const { t } = useTranslation();
<h1>{t('landing.title')}</h1>

// Via LanguageContext
const { currentLanguage, setLanguage, t } = useLanguage();
setLanguage('mr'); // Switch to Marathi
```

### Exports

```typescript
export const changeLanguage = (lang: string) => void;
export const getCurrentLanguage = () => string;
export type SupportedLanguage = 'en' | 'hi' | 'as' | 'mr';
export const languages: { code, name, nativeName }[];
```

---

## 15. Styling System

### Architecture

The styling system uses Tailwind CSS 4.1 with CSS custom properties (variables) for theming.

**Import Chain**: `index.css` → `fonts.css` + `tailwind.css` + `theme.css`

### Brand Colors (CSS Variables in `theme.css`)

| Variable | Value | Usage |
|----------|-------|-------|
| `--primary` | #2E3192 | Deep navy blue (logo V shape) |
| `--secondary` | #1A1F6E | Darker navy |
| `--accent` | #00A651 | Green (logo swoosh) |
| `--warm` | #F59E0B | Amber — warm, friendly |
| `--earth` | #D97706 | Dark amber — earthy |
| `--quiver-green` | #00A651 | Vivid green |
| `--quiver-blue` | #2E3192 | Primary blue |
| `--quiver-dark` | #141660 | Deep navy (dark backgrounds) |
| `--destructive` | #b45309 | Amber-700 (visible but not scary) |
| `--background` | #fafbfc | Page background |
| `--foreground` | oklch(0.145 0 0) | Text color |

### Tailwind Theme Mapping

CSS variables are mapped to Tailwind utility classes via `@theme inline` block:

```css
@theme inline {
  --color-primary: var(--primary);        /* → bg-primary, text-primary */
  --color-secondary: var(--secondary);    /* → bg-secondary */
  --color-accent: var(--accent);          /* → bg-accent */
  --color-muted: var(--muted);            /* → bg-muted */
  --color-destructive: var(--destructive);
  --radius-lg: var(--radius);             /* → rounded-lg */
  /* ... 20+ more mappings */
}
```

### Mobile-First Design

`theme.css` includes extensive mobile optimizations:

- Prevents zoom on input focus (iOS): `input { font-size: 16px !important; }`
- Touch target minimums: `.touch-target { min-height: 48px; }`
- Safe area padding: `.pb-safe { padding-bottom: env(safe-area-inset-bottom); }`
- Dynamic viewport height: `.mobile-full-screen { min-height: 100dvh; }`
- Momentum scrolling: `.scroll-momentum { -webkit-overflow-scrolling: touch; }`
- Tap highlight: `-webkit-tap-highlight-color: rgba(46, 49, 146, 0.1)`

### Dark Mode

Full dark mode support via `.dark` class with oklch-based colors. Toggle via `next-themes`.

### cn() Utility

```typescript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) { return twMerge(clsx(inputs)); }
```

---

## 16. Utilities

### Storage Utility

**File**: `src/utils/storage.ts`

Type-safe localStorage wrapper with error handling.

#### Generic Storage

```typescript
const storage = {
  get<T>(key: string, defaultValue: T): T;    // Read + parse JSON
  set<T>(key: string, value: T): boolean;      // Serialize + write
  remove(key: string): boolean;                 // Delete key
  has(key: string): boolean;                    // Check existence
  clearAll(): void;                             // Clear all quiver_* keys
};
```

All keys prefixed with `quiver_`.

#### Onboarding Storage

```typescript
const onboardingStorage = {
  getData(): StoredOnboardingData;
  saveData(partial): boolean;
  setPhone(phone): boolean;
  isForPhone(phone): boolean;
  updateField(key, value): boolean;
  updateFields(fields): boolean;
  setCurrentStep(step): boolean;
  completeStep(step): boolean;
  setSessionId(id): boolean;
  recordConsent(given): boolean;
  clear(): boolean;
  hasProgress(): boolean;
  getCompletionPercentage(totalSteps): number;
};
```

**Stored Data Shape**:
```typescript
interface StoredOnboardingData {
  phone: string | null;
  sessionId: string | null;
  currentStep: number;
  completedSteps: number[];
  formData: Record<string, any>;
  lastSaved: string | null;
  consentGiven: boolean;
  consentTimestamp: string | null;
}
```

#### Journey Storage

```typescript
const journeyStorage = {
  getLastStep(): number;
  setLastStep(step): boolean;
  getPendingChanges(): Array<{ key; value; timestamp }>;
  addPendingChange(key, value): boolean;
  clearPendingChanges(): boolean;
};
```

Offline queue for changes made while disconnected. Replayed on reconnection by `useAutoSave`.

---

## 17. Feedback System

**Directory**: `src/feedback/`

In-app feedback system for client review — allows placing sticky notes on any part of the UI.

### Components

| File | Description |
|------|-------------|
| `FeedbackRoot.tsx` | Root component — enables feedback mode, renders all notes |
| `DraggableNotePen.tsx` | Floating pen button — click to place a note at cursor position |
| `StickyNote.tsx` | Individual sticky note display |
| `CommentForm.tsx` | Input form for writing feedback comments |
| `PasskeyPrompt.tsx` | Passkey authentication to enable feedback mode |

### Supporting Files

| File | Description |
|------|-------------|
| `api.ts` | Backend API calls for saving/loading feedback notes |
| `webhook.ts` | Webhook notifications when new feedback is posted |
| `detectSection.ts` | Detects which section of the app the note is placed on |
| `constants.ts` | Configuration constants |
| `types.ts` | TypeScript type definitions |
| `index.ts` | Barrel export of `FeedbackRoot` |

**Backend Model**: `FeedbackNote` (UUID, text, route, x_px, y_px)

---

## 18. AI Voice Assistant Architecture

### Overview

The AI voice assistant ("Jyoti Didi") enables users to complete onboarding through natural conversation. It uses the **OpenAI Realtime API** via WebSocket for real-time voice-to-voice interaction.

### Architecture Diagram

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   User's Mic    │────▶│  OpenAIVoice     │────▶│ OpenAI Realtime  │
│                 │     │  Context          │     │ API (WebSocket)  │
│   User's        │◀────│  (manages WS,    │◀────│                  │
│   Speaker       │     │   audio, tools)   │     │  Model: gpt-4o   │
└─────────────────┘     └────────┬─────────┘     │  Voice: shimmer  │
                                 │                └──────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
            ┌───────────┐ ┌──────────┐ ┌─────────────┐
            │ Action    │ │ Onboard  │ │ AI Config   │
            │ Registry  │ │ Context  │ │ Context     │
            │           │ │          │ │             │
            │ navigate  │ │ setField │ │ screenConf  │
            │ goBack    │ │ setFields│ │ systemPrompt│
            │ submit    │ │ confirm  │ │ tools       │
            └───────────┘ └──────────┘ └─────────────┘
```

### Connection Flow

1. User clicks mic button → `QuiverAIAssistant` component
2. `OpenAIVoiceContext.connect()`:
   a. Fetches ephemeral token from backend (`GET /auth/voice-agent/token/`)
   b. Opens WebSocket to `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`
   c. Sends `session.update` with system prompt, tools, VAD config
3. User speaks → audio captured via `MediaRecorder` → sent as `input_audio_buffer.append`
4. Server VAD detects speech end → triggers AI response
5. AI responds with audio + optional tool calls
6. Tool calls (field updates, navigation) are executed locally
7. On screen change → sends new `session.update` with updated tools/prompt

### Screen-Aware Tool Configuration

Each screen has its own set of enabled tools and navigation targets. When the user navigates to a new screen, the voice context sends `session.update` with:

```json
{
  "type": "session.update",
  "session": {
    "instructions": "<full system prompt with screen context>",
    "tools": [/* screen-specific tools */],
    "voice": "shimmer",
    "turn_detection": { "type": "server_vad", ... }
  }
}
```

### Tool Response Behavior

| Tool | Response Strategy |
|------|-------------------|
| `update_form_field` | Send `function_call_output` only — NO `response.create` (avoids "field updated" spam) |
| `batch_update_fields` | Same — silent save, no announcement |
| `summarize_and_confirm` | Send `function_call_output` + `response.create` (needs new response for next section) |
| `navigate_to_screen` | Send `function_call_output` + `response.create` (needs greeting for new screen) |
| `trigger_action` | Execute action handler async, send `function_call_output` + `response.create` |

### Persona: Jyoti Didi

- **Name**: Jyoti Didi (ज्योती दीदी)
- **Voice**: shimmer (warm, feminine)
- **Languages**: Automatic based on user's `currentLanguage` setting
- **Personality**: Warm, supportive, curious, non-judgmental. Like a trusted older sister helping with business.
- **Conversation Style**: Natural, non-interrogative. Asks 1-2 questions at a time. Celebrates responses.
- **End-of-Section Protocol**: After collecting most fields, verbally summarizes what was learned, asks for confirmation, then calls `summarize_and_confirm` tool.

---

## 19. Data Flow Diagrams

### Authentication Flow

```
User enters phone → sendOTP() → Backend creates OTP → User receives SMS
User enters OTP → verifyOTP() → Backend returns JWT tokens
                                  → localStorage stores: access_token, refresh_token,
                                                         tenant_id, user_id
                                  → Check onboarding_completed:
                                      true → Dashboard
                                      false → startOnboarding() → Consent screen
```

### Onboarding Data Flow

```
Screen Component                    OnboardingContext              Backend API
      │                                    │                           │
      │─── setField(key, value) ──────────▶│                           │
      │                                    │─── localStorage.set() ────│
      │                                    │                           │
      │                                    │─── [debounce 500ms] ──────│
      │                                    │                           │
      │                                    │─── bulkUpdateFields() ───▶│
      │                                    │                           │─── OnboardingField
      │                                    │◀── {success, status} ─────│    (upsert)
      │                                    │                           │
      │─── onContinue(data) ─────────────▶ │                           │
      │                                    │─── markStepComplete() ────│
      │                                    │─── setCurrentStep() ──────│
      │                                    │                           │
App.tsx ◀── setCurrentScreen(next) ────────│                           │
```

### Voice Assistant Data Flow

```
User speaks → MediaRecorder → audio chunks → WebSocket → OpenAI Realtime API
                                                              │
                                                              ▼
                                                     AI processes speech
                                                              │
                                                    ┌─────────┼──────────┐
                                                    ▼                    ▼
                                              Text response        Tool calls
                                                    │                    │
                                                    ▼                    ▼
                                              Audio output     update_form_field()
                                              → Speaker        → OnboardingContext.setField()
                                                               → localStorage (immediate)
                                                               → API (debounced)
```

### Offline Sync Flow

```
[Online]
  saveField() → localStorage (immediate) → API (debounced 500ms)

[Offline]
  saveField() → localStorage (immediate) → journeyStorage.addPendingChange()

[Back Online]
  useAutoSave detects online → journeyStorage.getPendingChanges()
                              → bulkUpdateFields() → API sync
                              → journeyStorage.clearPendingChanges()
```

---

## 20. Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000` |

Set in `.env` or `.env.local` file at the frontend root. Vite exposes variables prefixed with `VITE_` to client code via `import.meta.env`.

---

## Appendix: Screen → AI Assistant Config Summary

| Screen | AI Enabled | Tools | Nav Targets | Actions |
|--------|-----------|-------|-------------|---------|
| landing | No | — | — | — |
| login | No | — | — | — |
| signup | No | — | — | — |
| otp | No | — | — | — |
| business-model | No | — | — | — |
| consent | Yes | navigate, trigger_action | profile, voice-onboarding | accept_consent |
| profile | Yes | update_field, batch_update, summarize_and_confirm, navigate, trigger_action | consent, industry | submit_profile, go_back |
| enterprise | No | — | — | — |
| industry | Yes | update_field, batch_update, summarize_and_confirm, navigate, trigger_action | profile, questionnaire | submit_industry, go_back |
| pathway | No | — | — | — |
| ai-pathway | No | — | — | — |
| questionnaire | Yes | update_field, batch_update, summarize_and_confirm, navigate, trigger_action | industry, equity | submit_questionnaire, go_back |
| equity | Yes | update_field, summarize_and_confirm, navigate, trigger_action | questionnaire, review | submit_equity, go_back |
| documents | Yes | navigate, trigger_action | dashboard, review | upload_document |
| review | Yes | navigate, trigger_action | profile, industry, questionnaire, equity | submit_review, go_back |
| admin | No | — | — | — |
| success | No | — | — | — |
| dashboard | Yes | navigate | schedule, documents, profile | — |
| schedule | Yes | update_field, batch_update, navigate | dashboard | — |
| video-meeting | No | — | — | — |
| voice-onboarding | No | — | — | — |
