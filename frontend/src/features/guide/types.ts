import { EnterpriseRole } from '@/utils/rbac';

export interface GuideStep {
  step: number;
  titleZh: string;
  titleEn: string;
  detailZh: string;
  detailEn: string;
  roleHint?: EnterpriseRole[];
}

export interface FeatureGuideModule {
  id: string;
  titleZh: string;
  titleEn: string;
  badgeZh: string;
  badgeEn: string;
  iconName: string;
  route: string;
  hotkey?: string;
  allowedRoles: EnterpriseRole[];
  category: 'CORE' | 'OPERATIONS' | 'SUPPLY_CHAIN' | 'GOVERNANCE';
  summaryZh: string;
  summaryEn: string;
  keyFeaturesZh: string[];
  keyFeaturesEn: string[];
  steps: GuideStep[];
  proTipsZh: string[];
  proTipsEn: string[];
}
