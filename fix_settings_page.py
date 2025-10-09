#!/usr/bin/env python3
"""
Fix SettingsPage.tsx TypeScript errors by:
1. Removing Phone, Law Firm, Bio fields
2. Adding User Type and Experience fields
3. Fixing template property names
"""

import re

def fix_settings_page():
    file_path = r'c:\Users\nathi\Downloads\LexoHub\src\pages\SettingsPage.tsx'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix 1: Replace template.name with template.template_name
    content = re.sub(r'template\.name\b', 'template.template_name', content)
    
    # Fix 2: Replace template.description with template.template_description
    content = re.sub(r'template\.description\b', 'template.template_description', content)
    
    # Fix 3: Replace template.category with template.service_category
    content = re.sub(r'template\.category\b', 'template.service_category', content)
    
    # Fix 4: Replace template.default_rate with template.default_hourly_rate
    content = re.sub(r'template\.default_rate\b', 'template.default_hourly_rate', content)
    
    # Fix 5: Add optional chaining to template.matter_types
    content = re.sub(r'template\.matter_types\.map', 'template.matter_types?.map', content)
    
    # Fix 6: Remove the Phone field (lines 377-386)
    phone_pattern = r'        <div>\s*\n\s*<label[^>]*>Phone</label>\s*\n\s*<input\s*\n[^>]*value=\{profileData\.phone\}[^>]*>[^<]*</input>\s*\n\s*</div>'
    content = re.sub(phone_pattern, '', content, flags=re.DOTALL)
    
    # Fix 7: Remove the Law Firm field
    firm_pattern = r'        <div className="md:col-span-2">\s*\n\s*<label[^>]*>Law Firm</label>\s*\n\s*<input\s*\n[^>]*value=\{profileData\.firm\}[^>]*>[^<]*</input>\s*\n\s*</div>'
    content = re.sub(firm_pattern, '', content, flags=re.DOTALL)
    
    # Fix 8: Remove the Bio field
    bio_pattern = r'        <div className="md:col-span-2">\s*\n\s*<label[^>]*>Bio</label>\s*\n\s*<textarea\s*\n[^>]*value=\{profileData\.bio\}[^>]*>[^<]*</textarea>\s*\n\s*</div>'
    content = re.sub(bio_pattern, '', content, flags=re.DOTALL)
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Fixed template property names")
    print("✅ Added optional chaining")
    print("⚠️  Note: Phone, Law Firm, and Bio fields need manual removal")
    print("   Add User Type and Experience fields manually after removal")

if __name__ == '__main__':
    fix_settings_page()
