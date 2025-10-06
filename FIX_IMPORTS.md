# Fix Remaining Import Errors

## Files That Need Manual Fixes

### 1. src/components/matters/NewMatterModal.tsx

**Remove these imports (lines 11-13):**
```typescript
import { TemplateLibraryModal, SaveTemplateModal } from './templates';
import type { MatterTemplateData } from '../../types/matter-templates';
import { templateSuggestionService, type TemplateSuggestion } from '../../services/template-suggestion.service';
```

**Remove template state (lines 227-229):**
```typescript
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
```

**Remove template buttons (around lines 1206-1220):**
```typescript
<button
  onClick={() => setShowTemplateLibrary(true)}
  ...
>
  Templates
</button>
<button
  onClick={handleSaveAsTemplate}
  ...
>
  Save Template
</button>
```

**Remove template modals at the end (lines 1340-1356):**
```typescript
<TemplateLibraryModal ... />
<SaveTemplateModal ... />
```

**Remove all template handler functions:**
- handleTemplateSelect
- handleSaveAsTemplate
- convertFormDataToTemplateData
- handleApplyTemplateSuggestion

---

## Quick Fix Commands

```bash
# Search for all files importing deleted components
grep -r "from './templates'" src/
grep -r "TemplateLibrary" src/
grep -r "matter-templates" src/
grep -r "template-suggestion" src/

# Find other potential issues
grep -r "MatterWorkbench" src/
grep -r "DocumentIntelligence" src/
grep -r "WorkflowIntegrations" src/
```

---

## Alternative: Comment Out Template Code

If you want to keep the template functionality for later, just comment it out:

1. Comment out the imports
2. Comment out the state
3. Comment out the buttons
4. Comment out the modals
5. Comment out the handlers

This way you can restore it later if needed.
