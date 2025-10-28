# Quick Integration Guide

## For Developers: How to Use the New Features

### 1. Attorney Selection with Favorites

```tsx
import { AttorneySelectionField } from '@/components';

function YourComponent() {
  const [attorney, setAttorney] = useState<Attorney | null>(null);

  return (
    <AttorneySelectionField
      value={attorney}
      onChange={setAttorney}
      required
      label="Select Attorney"
    />
  );
}
```

### 2. Voice-Enabled Matter Description

```tsx
import { MatterDescriptionModal } from '@/components';

function YourComponent() {
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState('');

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Record Description
      </button>

      <MatterDescriptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={(desc, transcript) => {
          setDescription(desc);
          setShowModal(false);
        }}
      />
    </>
  );
}
```

### 3. Direct Voice Recording (Advanced)

```tsx
import { useVoiceRecording } from '@/hooks/useVoiceRecording';

function YourComponent() {
  const recording = useVoiceRecording({
    language: 'en-ZA',
    onTranscriptComplete: (text) => console.log(text)
  });

  return (
    <div>
      <button onClick={recording.toggleRecording}>
        {recording.isRecording ? 'Stop' : 'Start'} Recording
      </button>
      <p>Duration: {recording.duration}s</p>
      <p>{recording.transcript}</p>
    </div>
  );
}
```

### 4. AI Summarization (Standalone)

```typescript
import { aiSummarizationService } from '@/services/ai-summarization.service';

async function formatDescription() {
  const result = await aiSummarizationService.formatMatterDescription({
    transcript: 'Raw voice transcript...',
    matterType: 'litigation'
  });

  const validation = aiSummarizationService.validateDescriptionQuality(
    result.formattedDescription
  );

  if (!validation.isValid) {
    alert(validation.warning);
  }

  return result.formattedDescription;
}
```

## Environment Setup

Add to `.env`:
```bash
# AWS Bedrock for AI Summarization
VITE_AWS_BEDROCK_REGION=us-east-1
VITE_AWS_BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
VITE_AWS_ACCESS_KEY_ID=your_key
VITE_AWS_SECRET_ACCESS_KEY=your_secret
```

## Database Migration

```sql
-- Add favorite attorneys column to user_preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS favorite_attorneys TEXT[] DEFAULT '{}';
```

## Next Steps

1. ✅ Components created and tested
2. ⏳ Integrate into Quick Brief Capture Modal (Step 1)
3. ⏳ Create Favorite Attorneys Settings Page
4. ⏳ Test with real AWS Bedrock API
5. ⏳ Add analytics tracking

See `ATTORNEY_SELECTION_MATTER_DESCRIPTION_IMPLEMENTATION.md` for full documentation.
