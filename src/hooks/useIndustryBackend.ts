import { useMemo } from 'react';
import INDUSTRY_BACKEND_CONFIGS from '../data/industry-backend-configs';
import type { IndustryBackendConfig, IndustryType } from '../types/business.types';

export function useIndustryBackend(industryId?: IndustryType): { config?: IndustryBackendConfig } {
  const config = useMemo(() => {
    if (!industryId) return undefined;
    return INDUSTRY_BACKEND_CONFIGS[industryId] as IndustryBackendConfig | undefined;
  }, [industryId]);

  return { config };
}

export default useIndustryBackend;
