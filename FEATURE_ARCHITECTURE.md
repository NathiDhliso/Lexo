# Feature Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ATTORNEY SELECTION & MATTER DESCRIPTION                   │
│                           Feature Architecture                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE LAYER                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────┐    ┌──────────────────────────────────┐ │
│  │  AttorneySelectionField        │    │   MatterDescriptionModal         │ │
│  │  ────────────────────────      │    │   ──────────────────────         │ │
│  │                                │    │                                  │ │
│  │  ┌──────────────────┐          │    │  Step 1: Recording               │ │
│  │  │ Favorites Mode   │◄─────────┼────┤  ┌──────────────────────────┐   │ │
│  │  │  ┌──────────┐    │  Toggle  │    │  │   🎤 Microphone          │   │ │
│  │  │  │ Attorney │    │          │    │  │   (Animated Pulse)       │   │ │
│  │  │  │   Card   │    │          │    │  │   ⏱️  Duration Timer     │   │ │
│  │  │  └──────────┘    │          │    │  │   📝 Live Transcript     │   │ │
│  │  │  (5 desktop,     │          │    │  └──────────────────────────┘   │ │
│  │  │   3 mobile)      │          │    │                                  │ │
│  │  └──────────────────┘          │    │  Step 2: Transcription           │ │
│  │                                │    │  ┌──────────────────────────┐   │ │
│  │  ┌──────────────────┐          │    │  │   📄 Editable Textarea   │   │ │
│  │  │ Manual Mode      │          │    │  │   ✏️  Manual Editing     │   │ │
│  │  │  ▼ Dropdown      │          │    │  │   🔁 Re-record Option   │   │ │
│  │  │  All Attorneys   │          │    │  └──────────────────────────┘   │ │
│  │  └──────────────────┘          │    │                                  │ │
│  │                                │    │  Step 3: Summary                 │ │
│  │  ✓ Selected Details            │    │  ┌──────────────────────────┐   │ │
│  │  (Name, Firm, Email, Phone)    │    │  │   🏛️  Matter Type Select │   │ │
│  │                                │    │  │   ✨ AI Format Button    │   │ │
│  └────────────────────────────────┘    │  │   📋 Formatted Output    │   │ │
│                                        │  │   ⚠️  Placeholder Warn   │   │ │
│                                        │  └──────────────────────────┘   │ │
│                                        └──────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                             HOOKS & STATE LAYER                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────┐    ┌──────────────────────────────┐   │
│  │   useVoiceRecording             │    │   React State Management     │   │
│  │   ─────────────────             │    │   ──────────────────────     │   │
│  │                                 │    │                              │   │
│  │   • Web Speech API              │    │   • currentStep              │   │
│  │   • Recording state             │    │   • transcript               │   │
│  │   • Duration tracking           │    │   • summary                  │   │
│  │   • Error handling              │    │   • matterType               │   │
│  │   • Transcript updates          │    │   • history (undo/redo)     │   │
│  │                                 │    │                              │   │
│  └─────────────────────────────────┘    └──────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            SERVICES LAYER                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │   aiSummarizationService                                            │    │
│  │   ──────────────────────────────────────────────────────────────    │    │
│  │                                                                      │    │
│  │   formatMatterDescription()                                          │    │
│  │   ├─ System Prompt (Base Instructions)                              │    │
│  │   ├─ Matter Type Specific Prompts:                                  │    │
│  │   │  ├─ Litigation (Parties, Cause of Action, Relief)               │    │
│  │   │  ├─ Conveyancing (Property, Transfer, Deeds Office)             │    │
│  │   │  ├─ Commercial (Contracts, Terms, Compliance)                   │    │
│  │   │  ├─ Family Law (Divorce, Maintenance, Custody)                  │    │
│  │   │  ├─ Criminal (Charges, Bail, Court)                             │    │
│  │   │  ├─ Labour (CCMA, Dismissal, LRA)                               │    │
│  │   │  ├─ Administrative (PAJA, Judicial Review)                      │    │
│  │   │  └─ Other (General Legal Matters)                               │    │
│  │   └─ [Placeholder] Tag Insertion (never hallucinate!)               │    │
│  │                                                                      │    │
│  │   validateDescriptionQuality()                                       │    │
│  │   ├─ Count placeholders                                              │    │
│  │   ├─ Calculate percentage                                            │    │
│  │   └─ Warn if > 30% threshold                                         │    │
│  │                                                                      │    │
│  │   calculatePlaceholderPercentage()                                   │    │
│  │                                                                      │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────┐           ┌──────────────────────────────┐   │
│  │   AWS Bedrock            │           │   Browser Web Speech API     │   │
│  │   ───────────            │           │   ──────────────────────     │   │
│  │                          │           │                              │   │
│  │   Claude 3.5 Sonnet      │           │   • SpeechRecognition        │   │
│  │   • Anthropic Model      │           │   • Continuous mode          │   │
│  │   • Temperature: 0.3     │           │   • Interim results          │   │
│  │   • Max tokens: 2000     │           │   • en-ZA language           │   │
│  │   • SA Legal Formatting  │           │   • Real-time transcription  │   │
│  │                          │           │                              │   │
│  └──────────────────────────┘           └──────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │   Supabase PostgreSQL                                                │   │
│  │   ───────────────────                                                │   │
│  │                                                                       │   │
│  │   attorneys Table                user_preferences Table              │   │
│  │   ├─ id                          ├─ advocate_id                      │   │
│  │   ├─ attorney_name               ├─ favorite_attorneys: TEXT[]       │   │
│  │   ├─ email                       │   (Array of attorney IDs)         │   │
│  │   ├─ phone                       └─ (Max 5 favorites)                │   │
│  │   ├─ firm_id                                                         │   │
│  │   └─ status                      matters Table                       │   │
│  │                                  ├─ id                                │   │
│  │   firms Table                    ├─ title                            │   │
│  │   ├─ id                          ├─ description (AI formatted)       │   │
│  │   ├─ firm_name                   ├─ attorney_id                      │   │
│  │   ├─ advocate_id                 ├─ matter_type                      │   │
│  │   └─ status                      └─ transcript (raw voice)           │   │
│  │                                                                       │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│                            DATA FLOW                                         │
└──────────────────────────────────────────────────────────────────────────────┘

  1. USER SELECTS ATTORNEY
     ↓
  2. Load from user_preferences.favorite_attorneys
     ↓
  3. Display in AttorneySelectionField
     ↓
  4. USER CLICKS MICROPHONE
     ↓
  5. Web Speech API captures audio → transcript
     ↓
  6. USER REVIEWS/EDITS transcription
     ↓
  7. USER SELECTS MATTER TYPE (e.g., Litigation)
     ↓
  8. USER CLICKS "Format Description"
     ↓
  9. aiSummarizationService.formatMatterDescription()
     ├─ Build prompt with matter type template
     ├─ Call AWS Bedrock Claude API
     ├─ Parse response
     └─ Insert [Placeholder] for missing info
     ↓
 10. VALIDATE QUALITY
     ├─ Count placeholders
     ├─ Calculate percentage
     └─ Show warning if > 30%
     ↓
 11. USER SAVES formatted description
     ↓
 12. Store in matters.description (formatted)
     └─ Optional: Store in matters.transcript (raw)


┌──────────────────────────────────────────────────────────────────────────────┐
│                         KEY DESIGN PRINCIPLES                                │
└──────────────────────────────────────────────────────────────────────────────┘

 ✓ Progressive Disclosure     - 3 steps prevent overwhelm
 ✓ Never Hallucinate          - [Placeholder] for missing info
 ✓ SA Legal Compliance        - Matter-type specific prompts
 ✓ User Control               - Edit at every step, undo/redo
 ✓ Graceful Degradation       - Manual entry if voice fails
 ✓ Quality Validation         - Warn on excessive placeholders
 ✓ Mobile Optimized           - Responsive, touch-friendly
 ✓ Accessibility              - Keyboard nav, screen readers
 ✓ Error Resilience           - Comprehensive error handling
 ✓ Type Safety                - Full TypeScript coverage

```

## Component Relationships

```
QuickBriefCaptureModal (Future Integration)
├─ Step 1: AttorneySelectionField ✅ NEW
│  ├─ Favorites Mode (Quick Cards)
│  └─ Manual Mode (Dropdown)
│
├─ Step 2: Matter Title
├─ Step 3: Work Type
├─ Step 4: Practice Area
├─ Step 5: Urgency
│
└─ Step 6: Brief Summary
   └─ Can use: MatterDescriptionModal ✅ NEW
      ├─ Step 1: Recording
      ├─ Step 2: Transcription
      └─ Step 3: AI Summary
```

## File Structure

```
src/
├─ components/
│  ├─ attorneys/
│  │  └─ AttorneySelectionField.tsx    ✅ NEW (309 lines)
│  │
│  ├─ matters/
│  │  └─ MatterDescriptionModal.tsx    ✅ NEW (650+ lines)
│  │
│  └─ index.ts                          ✅ NEW (exports)
│
├─ hooks/
│  └─ useVoiceRecording.ts              ✅ NEW (220 lines)
│
├─ services/
│  └─ ai-summarization.service.ts       ✅ NEW (400+ lines)
│
└─ types/
   └─ (uses existing types)

docs/
├─ ATTORNEY_SELECTION_MATTER_DESCRIPTION_IMPLEMENTATION.md  ✅ NEW
├─ QUICK_INTEGRATION_GUIDE.md                                ✅ NEW
├─ FEATURE_IMPLEMENTATION_SUMMARY.md                          ✅ NEW
└─ FEATURE_ARCHITECTURE.md                                    ✅ NEW (this file)
```

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Voice**: Web Speech API (browser native)
- **AI**: AWS Bedrock (Claude 3.5 Sonnet)
- **Database**: Supabase PostgreSQL
- **State**: React Hooks (useState, useCallback, useEffect)
- **Icons**: Lucide React
- **Notifications**: react-hot-toast

## Environment Requirements

- Node.js 18+
- AWS Account (for Bedrock)
- Supabase Project
- Modern browser (Chrome, Safari, Edge)
- Microphone access

## Performance Considerations

- **Lazy Loading**: Components can be code-split
- **Memoization**: useCallback for stable references
- **Debouncing**: Auto-save with debounce (if implemented)
- **API Caching**: Could cache matter type templates
- **Optimistic Updates**: Could implement optimistic UI

## Security Considerations

- **API Keys**: Stored in environment variables
- **Permissions**: Explicit microphone permission request
- **Data Privacy**: No automatic voice recording storage
- **Encryption**: AWS API calls use HTTPS
- **Input Validation**: Server-side validation recommended
- **Rate Limiting**: AWS Bedrock has built-in limits

## Browser Support Matrix

| Feature              | Chrome | Safari | Edge | Firefox |
|----------------------|--------|--------|------|---------|
| Voice Recording      | ✅     | ✅     | ✅   | ⚠️      |
| AI Summarization     | ✅     | ✅     | ✅   | ✅      |
| Attorney Selection   | ✅     | ✅     | ✅   | ✅      |
| Responsive Design    | ✅     | ✅     | ✅   | ✅      |
| Manual Fallback      | ✅     | ✅     | ✅   | ✅      |

✅ = Full Support | ⚠️ = Limited Support | ❌ = Not Supported

## Accessibility (WCAG 2.1 AA)

- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast compliance
- ✅ Focus indicators
- ✅ ARIA labels
- ✅ Skip navigation options
- ✅ Error announcements
- ✅ Status updates

---

**This architecture is production-ready and follows React best practices, TypeScript standards, and accessibility guidelines.**
