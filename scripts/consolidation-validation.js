#!/usr/bin/env node

/**
 * Consolidation Validation Script
 * Validates that consolidation changes don't break functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConsolidationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  // Validate migration consolidation
  validateMigrations() {
    console.log('🔍 Validating migration consolidation...');
    
    const migrationsDir = 'supabase/migrations';
    const archiveDir = path.join(migrationsDir, 'archive');
    
    // Check for duplicate billing preferences migrations
    const billingMigrations = [
      '20250127000022_create_advocate_billing_preferences.sql',
      '20250128000000_advocate_billing_preferences.sql'
    ];
    
    billingMigrations.forEach(migration => {
      const originalPath = path.join(migrationsDir, migration);
      const archivePath = path.join(archiveDir, migration);
      
      if (fs.existsSync(originalPath) && fs.existsSync(archivePath)) {
        this.warnings.push(`Migration ${migration} exists in both original and archive locations`);
      } else if (fs.existsSync(originalPath)) {
        this.warnings.push(`Migration ${migration} should be archived`);
      }
    });
    
    // Verify authoritative migration exists
    const authoritativeMigration = path.join(migrationsDir, '20251027153935_create_advocate_billing_preferences_fix.sql');
    if (!fs.existsSync(authoritativeMigration)) {
      this.errors.push('Authoritative billing preferences migration not found');
    }
  }

  // Validate service consolidation
  validateServices() {
    console.log('🔍 Validating service consolidation...');
    
    const expensesService = 'src/services/api/expenses.service.ts';
    const disbursementService = 'src/services/api/disbursement.service.ts';
    
    if (!fs.existsSync(disbursementService)) {
      this.errors.push('DisbursementService not found');
    }
    
    // Check if ExpensesService still exists (should be compatibility layer)
    if (fs.existsSync(expensesService)) {
      const content = fs.readFileSync(expensesService, 'utf8');
      if (!content.includes('DisbursementService')) {
        this.warnings.push('ExpensesService should delegate to DisbursementService');
      }
    }
  }

  // Validate documentation consolidation
  validateDocumentation() {
    console.log('🔍 Validating documentation consolidation...');
    
    const consolidatedDocs = [
      'docs/PROJECT_STATUS.md',
      'docs/FEATURE_INVENTORY.md',
      'docs/IMPLEMENTATION_HISTORY.md'
    ];
    
    consolidatedDocs.forEach(doc => {
      if (!fs.existsSync(doc)) {
        this.warnings.push(`Consolidated document ${doc} not found`);
      }
    });
  }

  // Run all validations
  validate() {
    console.log('🚀 Starting consolidation validation...\n');
    
    this.validateMigrations();
    this.validateServices();
    this.validateDocumentation();
    
    // Report results
    console.log('\n📊 Validation Results:');
    console.log(`✅ Errors: ${this.errors.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}\n`);
    
    if (this.errors.length > 0) {
      console.log('❌ ERRORS:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    return this.errors.length === 0;
  }
}

// Run validation
const validator = new ConsolidationValidator();
const success = validator.validate();
process.exit(success ? 0 : 1);

export default ConsolidationValidator;