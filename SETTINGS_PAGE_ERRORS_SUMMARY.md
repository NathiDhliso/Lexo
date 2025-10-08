# SettingsPage TypeScript Errors - Summary & Solutions

## Current Issues

The SettingsPage has **20+ TypeScript errors** due to mismatched data structures between:
1. The profile form fields
2. The actual `UserMetadata` interface
3. The `StandardServiceTemplate` interface

## Root Cause

### UserMetadata Structure (from auth.service.ts)
```typescript
export interface UserMetadata {
  user_type: 'junior' | 'senior';
  full_name?: string;
  practice_number?: string;
  phone_number?: string;
  experience_years?: number;
}
```

### Current Profile Form (INCORRECT)
```typescript
const [profileData, setProfileData] = useState({
  fullName: user?.user_metadata?.full_name || '',
  email: user?.email || '',
  practiceNumber: user?.user_metadata?.practice_number || '',
  userType: user?.user_metadata?.user_type || 'junior',
  experienceYears: user?.user_metadata?.experience_years || 0,
});
```

### Form Fields Still Reference OLD Properties
The form JSX still references properties that don't exist:
- `profileData.phone` (should be removed or use phone_number)
- `profileData.firm` (doesn't exist in UserMetadata)
- `profileData.bio` (doesn't exist in UserMetadata)
- `profileData.firstName` (changed to fullName but form not updated)
- `profileData.lastName` (removed, now using fullName)

## Solution: Simplify Profile Form

### Step 1: Update Profile State (DONE ✅)
```typescript
const [profileData, setProfileData] = useState({
  fullName: user?.user_metadata?.full_name || '',
  email: user?.email || '',
  practiceNumber: user?.user_metadata?.practice_number || '',
  userType: user?.user_metadata?.user_type || 'junior',
  experienceYears: user?.user_metadata?.experience_years || 0,
});
```

### Step 2: Update handleSaveProfile (DONE ✅)
```typescript
const handleSaveProfile = async () => {
  try {
    const { error } = await updateProfile({
      full_name: profileData.fullName,
      practice_number: profileData.practiceNumber,
      user_type: profileData.userType as 'junior' | 'senior',
      experience_years: profileData.experienceYears,
    });
    // ... rest of handler
  }
};
```

### Step 3: Update Form Fields (NEEDS FIXING ⚠️)

**Replace lines 377-407 with:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Full Name</label>
    <input
      type="text"
      value={profileData.fullName}
      onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
      disabled={!isEditing}
      className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-900 text-neutral-900 dark:text-neutral-100 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 disabled:bg-neutral-100 dark:disabled:bg-metallic-gray-800 disabled:text-neutral-500 dark:disabled:text-neutral-400"
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Email</label>
    <input
      type="email"
      value={profileData.email}
      disabled
      className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 rounded-md bg-neutral-100 dark:bg-metallic-gray-800 text-neutral-500 dark:text-neutral-400"
    />
    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Email cannot be changed</p>
  </div>
  
  <div>
    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Practice Number</label>
    <input
      type="text"
      value={profileData.practiceNumber}
      onChange={(e) => setProfileData(prev => ({ ...prev, practiceNumber: e.target.value }))}
      disabled={!isEditing}
      className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-900 text-neutral-900 dark:text-neutral-100 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 disabled:bg-neutral-100 dark:disabled:bg-metallic-gray-800 disabled:text-neutral-500 dark:disabled:text-neutral-400"
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">User Type</label>
    <select
      value={profileData.userType}
      onChange={(e) => setProfileData(prev => ({ ...prev, userType: e.target.value as 'junior' | 'senior' }))}
      disabled={!isEditing}
      className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-900 text-neutral-900 dark:text-neutral-100 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 disabled:bg-neutral-100 dark:disabled:bg-metallic-gray-800 disabled:text-neutral-500 dark:disabled:text-neutral-400"
    >
      <option value="junior">Junior Advocate</option>
      <option value="senior">Senior Advocate</option>
    </select>
  </div>
  
  <div>
    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Years of Experience</label>
    <input
      type="number"
      value={profileData.experienceYears}
      onChange={(e) => setProfileData(prev => ({ ...prev, experienceYears: parseInt(e.target.value) || 0 }))}
      disabled={!isEditing}
      min="0"
      className="w-full px-3 py-2 border border-neutral-300 dark:border-metallic-gray-600 bg-white dark:bg-metallic-gray-900 text-neutral-900 dark:text-neutral-100 rounded-md focus:outline-none focus:ring-2 focus:ring-judicial-blue-500 disabled:bg-neutral-100 dark:disabled:bg-metallic-gray-800 disabled:text-neutral-500 dark:disabled:text-neutral-400"
    />
  </div>
</div>
```

## StandardServiceTemplate Errors

### Current Interface (from rate-card.service.ts)
```typescript
export interface StandardServiceTemplate {
  id: string;
  template_name: string;           // NOT 'name'
  template_description?: string;   // NOT 'description'
  service_category: ServiceCategory;  // NOT 'category'
  matter_types?: string[];
  default_hourly_rate?: number;    // NOT 'default_rate'
  default_fixed_fee?: number;
  estimated_hours?: number;
  is_system_template: boolean;
  bar_association?: string;
  created_at: string;
  updated_at: string;
}
```

### Fix Template Rendering (Lines 1147-1200)

**Replace all template property references:**
- `template.name` → `template.template_name`
- `template.description` → `template.template_description`
- `template.category` → `template.service_category`
- `template.default_rate` → `template.default_hourly_rate`
- `template.matter_types` → `template.matter_types` (already correct, just add optional chaining)

## Quick Fix Commands

### 1. Delete Old Form Fields (Lines 377-407)
Delete the Phone, Law Firm, and Bio fields entirely.

### 2. Update Template References
Find and replace in SettingsPage.tsx:
- `template.name` → `template.template_name`
- `template.description` → `template.template_description || ''`
- `template.category` → `template.service_category`
- `template.default_rate` → `template.default_hourly_rate || 0`
- `template.matter_types.map` → `template.matter_types?.map`

### 3. Update CreateRateCardForm
In the template button onClick (around line 1187):
```typescript
setCreateRateCardForm({
  service_name: template.template_name,
  service_description: template.template_description,
  service_category: template.service_category,
  pricing_type: 'hourly',
  hourly_rate: template.default_hourly_rate,
  estimated_hours: template.estimated_hours,
  matter_type: template.matter_types?.[0],
  is_default: false,
  requires_approval: false
});
```

## Summary

**Total Errors:** 20+
**Root Causes:** 
1. Profile form fields don't match UserMetadata interface (5 fields need removal/update)
2. Template properties use wrong names (5+ property name mismatches)
3. Missing optional chaining on template.matter_types

**Fix Priority:**
1. HIGH - Remove Phone, Law Firm, Bio fields from profile form
2. HIGH - Update all template property names
3. MEDIUM - Add optional chaining for template.matter_types

**Estimated Fix Time:** 10-15 minutes with careful find-and-replace

---

**Status:** Documented - Ready for manual fixes
**Last Updated:** January 2025
