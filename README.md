# LexoHub - Legal Practice Management System

## 🎯 The 3-Step Workflow

```
Step 1: PRO FORMA (Quote) → Step 2: MATTER (Conversion) → Step 3: INVOICE (Billing)
```

**The workflow ALWAYS starts with Pro Forma. You cannot create matters directly.**

---

## 📚 Documentation

### ⭐ SYSTEM_PROMPT.md - **USE THIS ONLY**

**This is your ONLY system prompt document.**

Use `SYSTEM_PROMPT.md` for:
- ✅ All AI interactions
- ✅ Feature validation
- ✅ Code reviews
- ✅ Enhancement requests
- ✅ Architecture decisions

**Do not create or use any other system prompt documents.**

---

## 🗄️ Database Setup

### Step 1: Wipe Database
Run `WIPE_AND_RESET_DATABASE.sql` in Supabase SQL Editor

### Step 2: Apply Fresh Schema
Run `supabase/migrations/20250101000000_fresh_core_schema.sql` in Supabase SQL Editor

### Step 3: Regenerate Types
```bash
supabase gen types typescript --project-id ecaamkrcsjrcjmcjshlu > types/database.ts
```

### Step 4: Start Development
```bash
npm run dev
```

---

## 🚀 Quick Start

1. Create Pro Forma (quote)
2. Send to attorney
3. When accepted, convert to Matter
4. Log time and expenses
5. Generate Invoice from WIP
6. Record payments

---

## 🛡️ Rules

1. **Pro Forma ALWAYS comes first** - No creating matters directly
2. **Only 3 core features** - Pro Forma, Matter, Invoice
3. **Remote database only** - No local databases
4. **Validate against SYSTEM_PROMPT.md** - For all changes

---

## 📁 Core Structure

- **Services:** 12 files (see SYSTEM_PROMPT.md)
- **Pages:** 7 files (see SYSTEM_PROMPT.md)
- **Database:** 11 tables (see SYSTEM_PROMPT.md)
  - Core: 8 tables (advocates, proforma_requests, matters, time_entries, expenses, invoices, payments, user_preferences)
  - Rate Cards: 3 tables (rate_cards, standard_service_templates, service_categories)

---

## 💰 Rate Cards Feature

Rate Cards enhance the 3-step workflow with standardized pricing:

### Integration Points
1. **Pro Forma (Step 1):** Auto-populate service prices when creating quotes
2. **Matter (Step 2):** Consistent hourly rates for time tracking
3. **Invoice (Step 3):** Standardized pricing for billing

### Key Features
- Pre-configured South African legal service templates
- Custom rate card creation
- Service categorization (consultation, research, drafting, court appearance, etc.)
- Hourly and fixed-fee pricing options
- Matter-type specific pricing

### Database Tables
- `rate_cards` - Advocate-specific pricing templates
- `standard_service_templates` - Pre-configured legal service templates
- `service_categories` - Service category definitions

---

## 🎨 Theme System

LexoHub features a centralized theme management system with dynamic light/dark mode support:

### Features
- **CSS Variables-Based:** All colors use CSS custom properties for instant theme switching
- **No Hard-Coded Colors:** Flexible system supports future theme additions
- **Automatic Adaptation:** All UI components (cards, buttons, menus, etc.) dynamically respond to theme changes
- **System Preference Detection:** Respects user's OS theme preference
- **Persistent Selection:** Theme choice saved in localStorage

### Theme Files
- `src/styles/theme-variables.css` - Centralized color definitions
- `src/styles/theme-components.css` - Reusable themed component classes
- `src/contexts/ThemeContext.tsx` - Theme state management
- `src/hooks/useThemeClasses.ts` - Theme utility hook

### Usage
```tsx
import { useTheme } from './contexts/ThemeContext';
import { useThemeClasses } from './hooks/useThemeClasses';

// Toggle theme
const { theme, setTheme, toggleTheme } = useTheme();

// Use theme classes
const { themeClasses } = useThemeClasses();
<div className={themeClasses.card}>Content</div>
```

### Documentation
- **Implementation Guide:** `DARK_MODE_IMPLEMENTATION.md`
- **Verification Report:** `DARK_MODE_VERIFICATION.md`

---

## 🔗 Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/ecaamkrcsjrcjmcjshlu
- **System Prompt:** `SYSTEM_PROMPT.md`
- **Database Wipe:** `WIPE_AND_RESET_DATABASE.sql`
- **Fresh Schema:** `supabase/migrations/20250101000000_fresh_core_schema.sql`
- **Rate Cards Migration:** `supabase/migrations/20250107000005_add_rate_cards_tables.sql`
