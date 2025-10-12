/**
 * App.tsx - Simplified Entry Point
 * All routing, providers, and layout logic moved to AppRouter.tsx
 * This follows Iteration 3 of the refactoring plan
 */
import React from 'react';
import { AppRouter } from './AppRouter';

/**
 * Main App Component
 * Simply renders the AppRouter which handles all routing and providers
 */
function App() {
  return <AppRouter />;
}

export default App;
