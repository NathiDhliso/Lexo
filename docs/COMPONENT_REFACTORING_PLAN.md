# Component Refactoring Plan

## Overview
This document provides a detailed plan for refactoring large, monolithic components into smaller, maintainable pieces.

---

## 🎯 Refactoring Targets

### Priority 1: PDFTemplateEditor.tsx (2,100+ lines)

**Current Issues**:
- Single file with 2,100+ lines
- Multiple responsibilities (color selection, layout, preview, etc.)
- Difficult to test individual features
- Hard to maintain and debug

**Target Structure**:
```
src/components/settings/pdf-template/
├── PDFTemplateEditor.tsx          # Main orchestrator (~200 lines)
├── ColorSchemeSelector.tsx        # Color scheme selection (~150 lines)
├── LayoutPresetSelector.tsx       # Layout preset selection (~200 lines)
├── LogoUploadSection.tsx          # Logo upload and positioning (~150 lines)
├── TitleStyleSection.tsx          # Title styling controls (~150 lines)
├── TableStyleSection.tsx          # Table styling controls (~200 lines)
├── FooterCustomization.tsx        # Footer content and styling (~200 lines)
├── AdvancedLayoutControls.tsx    # Advanced layout options (~250 lines)
├── LivePreviewPanel.tsx           # PDF preview rendering (~300 lines)
├── hooks/
│   ├── usePDFTemplate.ts         # Template state management
│   ├── useColorScheme.ts         # Color scheme logic
│   └── usePreview.ts             # Preview generation logic
├── utils/
│   ├── colorSchemes.ts           # Color scheme definitions
│   ├── layoutPresets.ts          # Layout preset definitions
│   └── pdfHelpers.ts             # PDF generation helpers
└── types.ts                       # Shared TypeScript types
```

**Refactoring Steps**:

#### Step 1: Extract Type Definitions (Day 1)
```typescript
// src/components/settings/pdf-template/types.ts
export interface PDFTemplate {
  id: string;
  name: string;
  colors: ColorScheme;
  layout: LayoutConfig;
  logo: LogoConfig;
  // ... other properties
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  // ... other colors
}

export interface LayoutConfig {
  preset: LayoutPreset;
  margins: Margins;
  orientation: 'portrait' | 'landscape';
  // ... other layout options
}

// ... other type definitions
```

#### Step 2: Extract Color Scheme Selector (Day 2)
```typescript
// src/components/settings/pdf-template/ColorSchemeSelector.tsx
import React from 'react';
import { ColorScheme } from './types';

interface ColorSchemeSelectorProps {
  value: ColorScheme;
  onChange: (scheme: ColorScheme) => void;
  presets: ColorScheme[];
}

export const ColorSchemeSelector: React.FC<ColorSchemeSelectorProps> = ({
  value,
  onChange,
  presets
}) => {
  return (
    <div className="color-scheme-selector">
      {/* Color scheme selection UI */}
    </div>
  );
};
```

#### Step 3: Extract Layout Preset Selector (Day 3)
```typescript
// src/components/settings/pdf-template/LayoutPresetSelector.tsx
import React from 'react';
import { LayoutConfig } from './types';

interface LayoutPresetSelectorProps {
  value: LayoutConfig;
  onChange: (layout: LayoutConfig) => void;
  presets: LayoutConfig[];
}

export const LayoutPresetSelector: React.FC<LayoutPresetSelectorProps> = ({
  value,
  onChange,
  presets
}) => {
  return (
    <div className="layout-preset-selector">
      {/* Layout preset selection UI */}
    </div>
  );
};
```

#### Step 4: Extract Logo Upload Section (Day 4)
```typescript
// src/components/settings/pdf-template/LogoUploadSection.tsx
import React from 'react';
import { LogoConfig } from './types';

interface LogoUploadSectionProps {
  value: LogoConfig;
  onChange: (logo: LogoConfig) => void;
  onUpload: (file: File) => Promise<string>;
}

export const LogoUploadSection: React.FC<LogoUploadSectionProps> = ({
  value,
  onChange,
  onUpload
}) => {
  return (
    <div className="logo-upload-section">
      {/* Logo upload and positioning UI */}
    </div>
  );
};
```

#### Step 5: Extract Preview Panel (Day 5)
```typescript
// src/components/settings/pdf-template/LivePreviewPanel.tsx
import React from 'react';
import { PDFTemplate } from './types';

interface LivePreviewPanelProps {
  template: PDFTemplate;
  sampleData: any;
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  template,
  sampleData
}) => {
  return (
    <div className="live-preview-panel">
      {/* PDF preview rendering */}
    </div>
  );
};
```

#### Step 6: Create Custom Hooks (Day 6-7)
```typescript
// src/components/settings/pdf-template/hooks/usePDFTemplate.ts
import { useState, useCallback } from 'react';
import { PDFTemplate } from '../types';

export const usePDFTemplate = (initialTemplate: PDFTemplate) => {
  const [template, setTemplate] = useState(initialTemplate);

  const updateColors = useCallback((colors: ColorScheme) => {
    setTemplate(prev => ({ ...prev, colors }));
  }, []);

  const updateLayout = useCallback((layout: LayoutConfig) => {
    setTemplate(prev => ({ ...prev, layout }));
  }, []);

  // ... other update methods

  return {
    template,
    updateColors,
    updateLayout,
    // ... other methods
  };
};
```

#### Step 7: Refactor Main Component (Day 8-9)
```typescript
// src/components/settings/pdf-template/PDFTemplateEditor.tsx
import React from 'react';
import { ColorSchemeSelector } from './ColorSchemeSelector';
import { LayoutPresetSelector } from './LayoutPresetSelector';
import { LogoUploadSection } from './LogoUploadSection';
import { LivePreviewPanel } from './LivePreviewPanel';
import { usePDFTemplate } from './hooks/usePDFTemplate';

export const PDFTemplateEditor: React.FC = () => {
  const {
    template,
    updateColors,
    updateLayout,
    updateLogo
  } = usePDFTemplate(initialTemplate);

  return (
    <div className="pdf-template-editor">
      <div className="editor-panel">
        <ColorSchemeSelector
          value={template.colors}
          onChange={updateColors}
          presets={colorPresets}
        />
        <LayoutPresetSelector
          value={template.layout}
          onChange={updateLayout}
          presets={layoutPresets}
        />
        <LogoUploadSection
          value={template.logo}
          onChange={updateLogo}
          onUpload={handleLogoUpload}
        />
        {/* Other sections */}
      </div>
      <div className="preview-panel">
        <LivePreviewPanel
          template={template}
          sampleData={sampleInvoiceData}
        />
      </div>
    </div>
  );
};
```

#### Step 8: Testing (Day 10)
```typescript
// src/components/settings/pdf-template/__tests__/ColorSchemeSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorSchemeSelector } from '../ColorSchemeSelector';

describe('ColorSchemeSelector', () => {
  it('renders color scheme options', () => {
    // Test implementation
  });

  it('calls onChange when scheme is selected', () => {
    // Test implementation
  });
});
```

**Timeline**: 10 days (2 weeks with buffer)  
**Estimated Effort**: 60-80 hours

---

### Priority 2: App.tsx (1,000+ lines)

**Current Issues**:
- Mixing routing, layout, and business logic
- Public route detection logic embedded
- Multiple responsibilities

**Target Structure**:
```
src/
├── App.tsx                        # Main entry point (~100 lines)
├── AppRouter.tsx                  # Already exists, enhance
├── layouts/
│   ├── MainLayout.tsx            # Authenticated user layout (~150 lines)
│   ├── PublicLayout.tsx          # Public page layout (~100 lines)
│   └── AttorneyLayout.tsx        # Attorney portal layout (~100 lines)
├── routes/
│   ├── ProtectedRoutes.tsx       # Protected route definitions (~150 lines)
│   ├── PublicRoutes.tsx          # Public route definitions (~100 lines)
│   └── AttorneyRoutes.tsx        # Attorney route definitions (~100 lines)
└── utils/
    └── routeDetection.ts         # Route detection logic (~50 lines)
```

**Refactoring Steps**:

#### Step 1: Extract Route Detection Logic (Day 1)
```typescript
// src/utils/routeDetection.ts
export interface PublicRoute {
  type: 'proforma' | 'attorney-proforma' | 'attorney-engagement' | 'cloud-storage-callback';
  token?: string;
}

export const detectPublicRoute = (): PublicRoute | null => {
  const hash = window.location.hash;
  const pathname = window.location.pathname;
  
  // Hash-based routes
  if (hash.startsWith('#/pro-forma-request/')) {
    return { type: 'proforma', token: hash.substring(2).split('/').pop() };
  }
  // ... other route detection logic
  
  return null;
};
```

#### Step 2: Extract Layout Components (Day 2-3)
```typescript
// src/layouts/MainLayout.tsx
import React from 'react';
import { NavigationBar } from '@/components/navigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-gradient-to-br">
      <NavigationBar />
      <main className="flex-1">
        <div className="px-3 sm:px-4 md:px-6 py-4 md:py-6">
          {children}
        </div>
      </main>
    </div>
  );
};
```

#### Step 3: Extract Route Definitions (Day 4-5)
```typescript
// src/routes/ProtectedRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/layouts/MainLayout';
import * as Pages from '@/pages';

export const ProtectedRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Pages.DashboardPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      {/* Other protected routes */}
    </Routes>
  );
};
```

#### Step 4: Simplify App.tsx (Day 6)
```typescript
// src/App.tsx
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppRouter } from './AppRouter';
import { queryClient } from './lib/queryClient';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
```

**Timeline**: 6 days (1 week with buffer)  
**Estimated Effort**: 30-40 hours

---

## 📋 Refactoring Checklist

### Before Starting:
- [ ] Create feature branch
- [ ] Review current implementation
- [ ] Identify all dependencies
- [ ] Plan component boundaries
- [ ] Set up test files

### During Refactoring:
- [ ] Extract one component at a time
- [ ] Write tests for each extracted component
- [ ] Ensure no functionality is lost
- [ ] Update imports in dependent files
- [ ] Run full test suite after each extraction

### After Refactoring:
- [ ] Code review
- [ ] Performance testing
- [ ] Update documentation
- [ ] Merge to main branch
- [ ] Monitor for issues

---

## 🧪 Testing Strategy

### Unit Tests:
- Test each extracted component in isolation
- Mock dependencies
- Test edge cases and error handling

### Integration Tests:
- Test component interactions
- Verify data flow between components
- Test with real data

### E2E Tests:
- Verify full user workflows still work
- Test across different browsers
- Test responsive behavior

---

## 📊 Success Metrics

### Code Quality:
- Component size: < 300 lines per file
- Cyclomatic complexity: < 10 per function
- Test coverage: > 80% for new components

### Maintainability:
- Time to understand component: < 15 minutes
- Time to add new feature: < 2 hours
- Time to fix bug: < 1 hour

### Performance:
- No performance regression
- Bundle size increase: < 5%
- Render time: Same or better

---

## 🔄 Review Schedule

- **Daily**: Progress check-in
- **Weekly**: Code review session
- **End of refactoring**: Comprehensive review

---

**Last Updated**: 2025-01-12  
**Next Review**: 2025-01-19  
**Document Owner**: Frontend Team
