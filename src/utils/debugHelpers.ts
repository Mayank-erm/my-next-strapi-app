// src/utils/debugHelpers.ts - DEBUGGING UTILITIES

// Add this to your HomePage component for debugging
export const useDebugData = (componentName: string) => {
  const debugLog = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 [${componentName}] ${message}`, data || '');
    }
  };

  return { debugLog };
};

// Add this hook to monitor state changes
export const useStateLogger = (stateName: string, state: any) => {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 [State Change] ${stateName}:`, state);
    }
  }, [stateName, state]);
};

// Data validation helper
export const validateProposalData = (proposals: any[]): boolean => {
  if (!Array.isArray(proposals)) {
    console.error('❌ Proposals is not an array:', proposals);
    return false;
  }

  const invalidProposals = proposals.filter(p => !p.id || !p.unique_id);
  if (invalidProposals.length > 0) {
    console.error('❌ Invalid proposals found:', invalidProposals);
    return false;
  }

  console.log('✅ Proposal data validation passed:', proposals.length, 'items');
  return true;
};

// Network status checker
export const checkMeiliSearchHealth = async () => {
  try {
    const response = await fetch('/api/health-check', { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('❌ MeiliSearch health check failed:', error);
    return false;
  }
};