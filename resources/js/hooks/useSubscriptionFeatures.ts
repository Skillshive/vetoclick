import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

interface SubscriptionPlan {
  name: string;
  slug: string;
  price: number;
  currency: string;
  billing_period: string;
}

interface SubscriptionStatus {
  has_subscription: boolean;
  plan: SubscriptionPlan | null;
  limits: {
    users: number | null;
    pets: number | null;
    appointments: number | null;
  };
  features: string[];
}

interface FeatureStatus {
  can_create_user: boolean;
  can_create_pet: boolean;
  can_create_appointment: boolean;
  has_advanced_features: boolean;
  can_export_data: boolean;
  has_api_access: boolean;
  has_custom_branding: boolean;
  has_priority_support: boolean;
  [key: string]: boolean;
}

interface UseSubscriptionFeaturesReturn {
  subscription: SubscriptionStatus;
  features: FeatureStatus;
  canPerform: (action: string) => boolean;
  hasFeature: (feature: string) => boolean;
  getLimit: (resource: string) => number | null;
  isUnlimited: (resource: string) => boolean;
  getUsage: (resource: string) => number;
  isLimitReached: (resource: string) => boolean;
  getUpgradeMessage: (action: string) => string;
}

export function useSubscriptionFeatures(): UseSubscriptionFeaturesReturn {
  const { props } = usePage();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    has_subscription: false,
    plan: null,
    limits: { users: null, pets: null, appointments: null },
    features: []
  });
  
  const [features, setFeatures] = useState<FeatureStatus>({
    can_create_user: false,
    can_create_pet: false,
    can_create_appointment: false,
    has_advanced_features: false,
    can_export_data: false,
    has_api_access: false,
    has_custom_branding: false,
    has_priority_support: false,
  });

  const [usage, setUsage] = useState({
    users: 0,
    pets: 0,
    appointments: 0,
  });

  useEffect(() => {
    // Initialize from props
    if (props.subscription) {
      setSubscription(props.subscription);
    }
    
    if (props.features) {
      setFeatures(props.features);
    }
    
    if (props.usage) {
      setUsage(props.usage);
    }
  }, [props]);

  const canPerform = (action: string): boolean => {
    return features[`can_${action}`] || false;
  };

  const hasFeature = (feature: string): boolean => {
    return features[`has_${feature}`] || subscription.features.includes(feature);
  };

  const getLimit = (resource: string): number | null => {
    return subscription.limits[resource] || null;
  };

  const isUnlimited = (resource: string): boolean => {
    const limit = getLimit(resource);
    return limit === null || limit === -1;
  };

  const getUsage = (resource: string): number => {
    return usage[resource] || 0;
  };

  const isLimitReached = (resource: string): boolean => {
    if (isUnlimited(resource)) {
      return false;
    }
    
    const limit = getLimit(resource);
    const currentUsage = getUsage(resource);
    
    return limit !== null && currentUsage >= limit;
  };

  const getUpgradeMessage = (action: string): string => {
    const messages: Record<string, string> = {
      'create_user': 'You have reached your user limit. Upgrade your plan to add more users.',
      'create_pet': 'You have reached your pet limit. Upgrade your plan to add more pets.',
      'create_appointment': 'You have reached your monthly appointment limit. Upgrade your plan for more appointments.',
      'export_data': 'Data export is not available in your current plan. Upgrade to access this feature.',
      'api_access': 'API access is not available in your current plan. Upgrade to access this feature.',
      'custom_branding': 'Custom branding is not available in your current plan. Upgrade to access this feature.',
      'priority_support': 'Priority support is not available in your current plan. Upgrade to access this feature.',
    };

    return messages[action] || 'This feature is not available in your current plan. Upgrade to access this feature.';
  };

  return {
    subscription,
    features,
    canPerform,
    hasFeature,
    getLimit,
    isUnlimited,
    getUsage,
    isLimitReached,
    getUpgradeMessage,
  };
}

// Hook for checking specific permissions
export function usePermission(permission: string): boolean {
  const { features } = useSubscriptionFeatures();
  return features[`has_${permission}`] || false;
}

// Hook for checking subscription limits
export function useSubscriptionLimits() {
  const { subscription, usage, getLimit, isUnlimited, getUsage, isLimitReached } = useSubscriptionFeatures();
  
  return {
    limits: subscription.limits,
    usage,
    getLimit,
    isUnlimited,
    getUsage,
    isLimitReached,
  };
}
