#!/usr/bin/env node

/**
 * Rollback Consolidation Script
 * Provides rollback procedures for consolidation changes
 */

const fs = require('fs');
const path = require('path');

class ConsolidationRollback {
  constructor() {
    this.operations = [];
  }

  // Rollback migration consolidation
  rollbackMigrations() {
    console.log('🔄 Rolling back migration consolidation...');
    
    const migrationsDir = 'supabase/migrations';
    const archiveDir = path.join(migrationsDir, 'archive');
    
    // Restore archived billing preferences migrations
    const billingMigrations = [
      '20250127000022_create_advocate_billing_preferences.sql',
      '20250128000000_advocate_billing_preferences.sql'
    ];
    
    billingMigrations.forEach(migration => {
      const archivePath = path.join(archiveDir, migration);
      const originalPath = path.join(migrationsDir, migration);
      
      if (fs.existsSync(archivePath)) {
        fs.copyFileSync(archivePath, originalPath);
        console.log(`✅ Restored ${migration}`);
        this.operations.push(`Restored migration: ${migration}`);
      }
    });
  }

  // Rollback service consolidation
  rollbackServices() {
    console.log('🔄 Rolling back service consolidation...');
    
    // This would restore original ExpensesService if needed
    // For now, just log the operation
    console.log('⚠️  Service rollback requires manual intervention');
    this.operations.push('Service rollback flagged for manual review');
  }

  // Rollback documentation consolidation
  rollbackDocumentation() {
    console.log('🔄 Rolling back documentation consolidation...');
    
    const archiveDir = 'docs/archive';
    const docsDir = 'docs';
    
    // Restore archived documentation files
    if (fs.existsSync(archiveDir)) {
      const archivedFiles = fs.readdirSync(archiveDir);
      archivedFiles.forEach(file => {
        if (file.endsWith('.md')) {
          const archivePath = path.join(archiveDir, file);
          const originalPath = path.join(docsDir, file);
          
          fs.copyFileSync(archivePath, originalPath);
          console.log(`✅ Restored ${file}`);
          this.operations.push(`Restored documentation: ${file}`);
        }
      });
    }
  }

  // Execute rollback
  execute(phase = 'all') {
    console.log(`🚀 Starting consolidation rollback (${phase})...\n`);
    
    switch (phase) {
      case 'migrations':
        this.rollbackMigrations();
        break;
      case 'services':
        this.rollbackServices();
        break;
      case 'documentation':
        this.rollbackDocumentation();
        break;
      case 'all':
      default:
        this.rollbackMigrations();
        this.rollbackServices();
        this.rollbackDocumentation();
        break;
    }
    
    console.log('\n📊 Rollback Summary:');
    this.operations.forEach(op => console.log(`  - ${op}`));
    
    console.log('\n✅ Rollback completed');
  }
}

// Run rollback if called directly
if (require.main === module) {
  const phase = process.argv[2] || 'all';
  const rollback = new ConsolidationRollback();
  rollback.execute(phase);
}

module.exports = ConsolidationRollback;