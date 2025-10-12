# Rate Card Display Fix - Show All User's Rate Cards

## Problem

When creating a pro forma quote, the rate card selector was showing:
```
"No rate cards found. Try showing templates or create custom services."
```

Even though the user had created their own rate cards in the system.

## Root Cause

The `RateCardSelector` component was filtering rate cards by `matter_type` on the server side:

```typescript
const filters = {
  is_active: true,
  ...(matterType && { matter_type: matterType }), // ❌ Too restrictive!
};
```

This meant:
- If a matter type was selected (e.g., "Commercial Law")
- ONLY rate cards with `matter_type = "commercial_law"` would show
- User's custom rate cards without a matter_type wouldn't show
- User's rate cards with different matter types wouldn't show

## Solution

Changed the filtering strategy to:
1. **Load ALL active rate cards** (no server-side matter_type filter)
2. **Sort client-side** to prioritize relevant cards:
   - First: Cards matching the matter type
   - Second: Cards without a matter type (general services)
   - Third: Cards with different matter types

### Code Change

**Before:**
```typescript
const filters = {
  is_active: true,
  ...(matterType && { matter_type: matterType }), // ❌ Excludes user's cards
  ...(selectedCategory !== 'all' && { service_category: selectedCategory })
};

const rateCardsData = await rateCardService.getRateCards(filters);
setRateCards(rateCardsData);
```

**After:**
```typescript
const filters = {
  is_active: true,
  ...(selectedCategory !== 'all' && { service_category: selectedCategory })
  // ✅ Don't filter by matter_type - show all user's rate cards
};

const rateCardsData = await rateCardService.getRateCards(filters);

// ✅ Client-side sorting: prioritize matching matter type
let sortedRateCards = rateCardsData;
if (matterType) {
  sortedRateCards = [
    ...rateCardsData.filter(card => card.matter_type === matterType),
    ...rateCardsData.filter(card => !card.matter_type),
    ...rateCardsData.filter(card => card.matter_type && card.matter_type !== matterType)
  ];
}

setRateCards(sortedRateCards);
```

## Benefits

### Before ❌
- User creates rate cards
- Selects matter type in pro forma modal
- Sees "No rate cards found"
- Frustrated: "Where are my rate cards?!"

### After ✅
- User creates rate cards
- Selects matter type in pro forma modal
- Sees ALL their rate cards
- Most relevant cards appear first
- Can still use all their services

## How It Works Now

### Example: User has these rate cards

1. **Contract Review** - matter_type: "commercial_law"
2. **Court Appearance** - matter_type: "civil_litigation"
3. **Legal Consultation** - matter_type: null (general)
4. **Document Drafting** - matter_type: null (general)

### When matter type = "Commercial Law"

**Display order:**
1. ✅ Contract Review (matches matter type)
2. ✅ Legal Consultation (general service)
3. ✅ Document Drafting (general service)
4. ✅ Court Appearance (different matter type, but still shown)

**All cards are visible!** Just sorted by relevance.

### When matter type = null (not selected)

**Display order:**
- All cards in original order
- No filtering or sorting

## User Experience

### Smart Suggestions
- If matter type is selected, relevant cards appear first
- But ALL user's rate cards are always available
- User can scroll down to see other services

### Flexibility
- User can use any rate card for any matter
- Not restricted by matter type
- Still gets helpful suggestions

### No More "Not Found"
- User's rate cards always show up
- No confusion about missing services
- Professional experience

## Testing

### Test Case 1: Rate Cards with Matter Types
1. Create rate cards with specific matter types
2. Select a matter type in pro forma modal
3. **Verify:** Matching cards appear first ✅
4. **Verify:** All cards are still visible ✅

### Test Case 2: Rate Cards without Matter Types
1. Create rate cards without matter types (general)
2. Select any matter type in pro forma modal
3. **Verify:** General cards appear after matching cards ✅
4. **Verify:** All cards are visible ✅

### Test Case 3: Mixed Rate Cards
1. Create mix of specific and general rate cards
2. Select a matter type
3. **Verify:** Smart sorting (specific → general → other) ✅
4. **Verify:** All cards visible ✅

### Test Case 4: No Matter Type Selected
1. Don't select a matter type
2. **Verify:** All rate cards show in original order ✅

## Files Modified

- `src/components/pricing/RateCardSelector.tsx`
  - Updated `loadData()` function
  - Removed server-side matter_type filter
  - Added client-side smart sorting

## Impact

### Immediate
- ✅ User's rate cards now show up
- ✅ No more "No rate cards found" error
- ✅ Better user experience

### Long-term
- ✅ More flexible rate card usage
- ✅ Reduced user confusion
- ✅ Professional appearance

## Additional Notes

### Category Filtering Still Works
The category filter (Consultation, Research, Drafting, etc.) still works as before:
- Filters on server-side for performance
- User can filter by category if needed

### Templates Unchanged
Standard service templates still filter by matter type:
- Templates are suggestions
- User's own rate cards are always shown

### Performance
- Loading all rate cards is fine for typical usage
- Most users have < 100 rate cards
- Client-side sorting is instant
- Can add pagination later if needed

## Status

✅ **FIXED**
- All user's rate cards now display
- Smart sorting by relevance
- No more "not found" errors
- Better user experience

## Next Steps

1. Test with your rate cards
2. Verify all cards show up
3. Check sorting order
4. Create more rate cards as needed

---

**The rate card selector now shows ALL your rate cards, with smart suggestions based on matter type!** 🎉
