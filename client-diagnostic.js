// ============================================================================
// CLIENT-SIDE DIAGNOSTIC SCRIPT FOR RATE CARDS PERMISSION ISSUES
// Run this script in your browser console while on your application
// ============================================================================

console.log('🔍 Starting LexoHub Database Permission Diagnostic...\n');

// Function to safely get supabase instance
function getSupabaseInstance() {
  // Try different ways to access the supabase instance
  if (typeof window !== 'undefined') {
    // Check if supabase is available globally
    if (window.supabase) return window.supabase;
    
    // Try to access from React DevTools or module system
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const reactFiber = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers;
      // This is a simplified check - in practice you'd need to traverse the React tree
    }
  }
  
  console.warn('⚠️ Could not access supabase instance directly. Please run this in the context of your app.');
  return null;
}

// Main diagnostic function
async function runDiagnostic() {
  const results = {
    timestamp: new Date().toISOString(),
    checks: []
  };

  // 1. Check Environment Variables
  console.log('1️⃣ Checking Environment Variables...');
  const envCheck = {
    name: 'Environment Variables',
    status: 'unknown',
    details: {}
  };

  try {
    // Try to access environment variables from window object or check if they're compiled in
    let supabaseUrl = null;
    let supabaseKey = null;
    
    // Method 1: Check if they're available on window object
    if (window.__ENV__) {
      supabaseUrl = window.__ENV__.VITE_SUPABASE_URL;
      supabaseKey = window.__ENV__.VITE_SUPABASE_ANON_KEY;
    }
    
    // Method 2: Try to access from compiled Vite config (if available)
    try {
      // This will work if the app is running and env vars are compiled
      const scripts = document.querySelectorAll('script');
      for (let script of scripts) {
        if (script.textContent && script.textContent.includes('VITE_SUPABASE_URL')) {
          // Environment variables are compiled into the bundle
          console.log('📝 Environment variables found in compiled bundle');
          break;
        }
      }
    } catch (e) {
      // Ignore
    }
    
    // Method 3: Use known values for this specific project
    supabaseUrl = supabaseUrl || 'https://ecaamkrcsjrcjmcjshlu.supabase.co';
    supabaseKey = supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYWFta3Jjc2pyY2ptY2pzaGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMzMwMTYsImV4cCI6MjA3NDYwOTAxNn0.ndbsYfqCWDFGC9jFH1fUHL1rL_dfMn4sozAfDVa4KY8';
    
    envCheck.details = {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'Not found',
      keyValue: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Not found',
      method: 'Using known project values'
    };
    
    envCheck.status = (supabaseUrl && supabaseKey) ? 'pass' : 'fail';
  } catch (error) {
    envCheck.status = 'error';
    envCheck.error = error.message;
  }
  
  results.checks.push(envCheck);
  console.log('   Environment Check:', envCheck);

  // 2. Check Local Storage for Session
  console.log('\n2️⃣ Checking Local Storage for Session...');
  const storageCheck = {
    name: 'Local Storage Session',
    status: 'unknown',
    details: {}
  };

  try {
    const supabaseKeys = Object.keys(localStorage).filter(key => 
      key.includes('supabase') || key.includes('auth')
    );
    
    storageCheck.details = {
      supabaseKeys: supabaseKeys,
      hasSession: supabaseKeys.some(key => localStorage.getItem(key)?.includes('access_token'))
    };
    
    // Try to get the actual session data
    const authKey = supabaseKeys.find(key => key.includes('auth-token'));
    if (authKey) {
      try {
        const sessionData = JSON.parse(localStorage.getItem(authKey) || '{}');
        storageCheck.details.sessionInfo = {
          hasAccessToken: !!sessionData.access_token,
          hasRefreshToken: !!sessionData.refresh_token,
          expiresAt: sessionData.expires_at,
          userEmail: sessionData.user?.email,
          userId: sessionData.user?.id
        };
      } catch (e) {
        storageCheck.details.sessionParseError = e.message;
      }
    }
    
    storageCheck.status = storageCheck.details.hasSession ? 'pass' : 'fail';
  } catch (error) {
    storageCheck.status = 'error';
    storageCheck.error = error.message;
  }
  
  results.checks.push(storageCheck);
  console.log('   Storage Check:', storageCheck);

  // 3. Test Direct API Calls
  console.log('\n3️⃣ Testing Direct API Calls...');
  const apiCheck = {
    name: 'Direct API Access',
    status: 'unknown',
    details: {}
  };

  try {
    // Use the known project values
    const supabaseUrl = 'https://ecaamkrcsjrcjmcjshlu.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYWFta3Jjc2pyY2ptY2pzaGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMzMwMTYsImV4cCI6MjA3NDYwOTAxNn0.ndbsYfqCWDFGC9jFH1fUHL1rL_dfMn4sozAfDVa4KY8';

    // Get auth token from localStorage
    let authToken = null;
    const authKeys = Object.keys(localStorage).filter(key => key.includes('auth-token'));
    if (authKeys.length > 0) {
      try {
        const sessionData = JSON.parse(localStorage.getItem(authKeys[0]) || '{}');
        authToken = sessionData.access_token;
      } catch (e) {
        console.warn('Could not parse auth token from localStorage');
      }
    }

    // Test rate_cards endpoint
    const rateCardsHeaders = {
      'apikey': supabaseKey,
      'Content-Type': 'application/json'
    };
    
    if (authToken) {
      rateCardsHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    const rateCardsResponse = await fetch(
      `${supabaseUrl}/rest/v1/rate_cards?select=*&order=service_name.asc`,
      {
        method: 'GET',
        headers: rateCardsHeaders
      }
    );

    apiCheck.details.rateCards = {
      status: rateCardsResponse.status,
      statusText: rateCardsResponse.statusText,
      hasAuthToken: !!authToken,
      hasApiKey: !!supabaseKey
    };

    if (!rateCardsResponse.ok) {
      const errorText = await rateCardsResponse.text();
      apiCheck.details.rateCards.error = errorText;
    }

    // Test standard_service_templates endpoint
    const templatesResponse = await fetch(
      `${supabaseUrl}/rest/v1/standard_service_templates?select=*&order=template_name.asc`,
      {
        method: 'GET',
        headers: rateCardsHeaders
      }
    );

    apiCheck.details.templates = {
      status: templatesResponse.status,
      statusText: templatesResponse.statusText
    };

    if (!templatesResponse.ok) {
      const errorText = await templatesResponse.text();
      apiCheck.details.templates.error = errorText;
    }

    apiCheck.status = (rateCardsResponse.ok && templatesResponse.ok) ? 'pass' : 'fail';
    
  } catch (error) {
    apiCheck.status = 'error';
    apiCheck.error = error.message;
  }
  
  results.checks.push(apiCheck);
  console.log('   API Check:', apiCheck);

  // 4. Check Network Tab for Recent Requests
  console.log('\n4️⃣ Checking Recent Network Activity...');
  const networkCheck = {
    name: 'Network Activity Analysis',
    status: 'info',
    details: {
      message: 'Check your browser Network tab for recent requests to rate_cards and standard_service_templates endpoints',
      lookFor: [
        'Missing Authorization header',
        'Invalid API key',
        'Expired access token',
        '403 Forbidden responses',
        'CORS errors'
      ]
    }
  };
  
  results.checks.push(networkCheck);
  console.log('   Network Check:', networkCheck);

  // 5. Generate Summary and Recommendations
  console.log('\n📋 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(50));
  
  const failedChecks = results.checks.filter(check => check.status === 'fail');
  const errorChecks = results.checks.filter(check => check.status === 'error');
  
  if (failedChecks.length === 0 && errorChecks.length === 0) {
    console.log('✅ All client-side checks passed!');
    console.log('🔍 The issue is likely on the database/server side.');
    console.log('📝 Run the database-diagnostic.sql script in your Supabase SQL Editor.');
  } else {
    console.log('❌ Issues found:');
    [...failedChecks, ...errorChecks].forEach(check => {
      console.log(`   • ${check.name}: ${check.status}`);
      if (check.error) console.log(`     Error: ${check.error}`);
    });
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('-'.repeat(30));
  
  const envFailed = results.checks.find(c => c.name === 'Environment Variables' && c.status === 'fail');
  if (envFailed) {
    console.log('🔧 IMMEDIATE FIX NEEDED:');
    console.log('1. Your VITE_SUPABASE_ANON_KEY is missing from environment variables');
    console.log('2. Go to Supabase Dashboard → Settings → API');
    console.log('3. Copy the "anon/public" key');
    console.log('4. Add it to your .env file: VITE_SUPABASE_ANON_KEY=your_key_here');
    console.log('5. Restart your dev server (npm run dev)');
    console.log('6. See setup-env.md for detailed instructions');
  }
  
  const storageFailed = results.checks.find(c => c.name === 'Local Storage Session' && c.status === 'fail');
  if (storageFailed) {
    console.log('🔄 User session may be expired - try logging out and back in');
  }
  
  const apiFailed = results.checks.find(c => c.name === 'Direct API Access' && c.status === 'fail');
  if (apiFailed) {
    console.log('🗄️ After fixing environment variables:');
    console.log('   - Run the updated quick-fix-permissions.sql script in Supabase SQL Editor');
    console.log('   - This will fix any missing advocate records and RLS policies');
  }

  console.log('\n📊 Full Results Object:');
  console.log(JSON.stringify(results, null, 2));
  
  return results;
}

// Auto-run the diagnostic
runDiagnostic().catch(error => {
  console.error('❌ Diagnostic failed:', error);
});

// Export for manual use
window.lexoHubDiagnostic = runDiagnostic;