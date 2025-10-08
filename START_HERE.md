# 🚀 START HERE

## Your ONLY Documentation Files

### 1. **SYSTEM_PROMPT.md** ⭐⭐⭐
**USE THIS FOR EVERYTHING**
- All AI interactions
- Feature validation
- Code reviews
- Architecture decisions
- Enhancement requests

### 2. **README.md**
Quick reference for setup and workflow

### 3. **WIPE_AND_RESET_DATABASE.sql**
Database wipe script (run in Supabase Dashboard)

### 4. **supabase/migrations/20250101000000_fresh_core_schema.sql**
Fresh database schema (run after wipe)

---

## 🎯 The Workflow (ALWAYS)

```
Step 1: PRO FORMA (Quote)
   ↓
Step 2: MATTER (Conversion)
   ↓
Step 3: INVOICE (Billing)
```

**You MUST start with Pro Forma. You CANNOT create matters directly.**

---

## ⚡ Quick Setup

1. **Wipe database:** Run `WIPE_AND_RESET_DATABASE.sql` in Supabase
2. **Apply core schema:** Run `supabase/migrations/20250101000000_fresh_core_schema.sql`
3. **Apply Rate Cards:** Run `supabase/migrations/20250107000005_add_rate_cards_tables.sql`
4. **Generate types:** `supabase gen types typescript --project-id ecaamkrcsjrcjmcjshlu > types/database.ts`
5. **Start dev:** `npm run dev`

---

## 🛡️ Golden Rules

1. **Use SYSTEM_PROMPT.md for ALL decisions**
2. **Pro Forma ALWAYS comes first**
3. **Only 3 core features** (Pro Forma, Matter, Invoice)
4. **Remote database only** (no local databases)
5. **Reject features outside the 3-step workflow**

---

## 🎨 Theme System

LexoHub uses a centralized theme management system:

### Quick Start
```tsx
import { useTheme } from './contexts/ThemeContext';
import { useThemeClasses } from './hooks/useThemeClasses';

// In your component
const { toggleTheme } = useTheme();
const { themeClasses } = useThemeClasses();

<button onClick={toggleTheme}>Toggle Theme</button>
<div className={themeClasses.card}>Themed Card</div>
```

### Key Features
- ✅ CSS Variables-based (no hard-coded colors)
- ✅ Automatic theme switching
- ✅ System preference detection
- ✅ Persistent theme selection
- ✅ All components adapt dynamically

### Theme Files
- `src/styles/theme-variables.css` - Color definitions
- `src/styles/theme-components.css` - Component classes
- `src/contexts/ThemeContext.tsx` - Theme state
- `src/hooks/useThemeClasses.ts` - Utility hook

### Documentation
- `DARK_MODE_IMPLEMENTATION.md` - Full implementation guide
- `DARK_MODE_VERIFICATION.md` - Verification checklist

---

## 📞 Need Help?

1. Open `SYSTEM_PROMPT.md`
2. Search for your question
3. Follow the instructions

**That's it. Everything you need is in SYSTEM_PROMPT.md**
