export interface SubscriptionPlan {
  id: number;
  uuid: string;
  slug: string;
  name: {
    en: string;
    ar: string;
    fr: string;
  };
  description: {
    en: string;
    ar: string;
    fr: string;
  };
  features: Array<{
    id: number;
    uuid: string;
    slug: string;
    name: {
      en: string;
      ar: string;
      fr: string;
    };
    description: {
      en: string;
      ar: string;
      fr: string;
    };
    icon: string;
    color: string;
    group: {
      id: number;
      uuid: string;
      slug: string;
      name: {
        en: string;
        ar: string;
        fr: string;
      };
    };
  }>;
  price: number;
  yearly_price?: number;
  max_clients ?: number;
  max_pets?: number;
  max_appointments?: number;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlanFormData {
  name: {
    en: string;
    ar: string;
    fr: string;
  };
  description: {
    en: string;
    ar: string;
    fr: string;
  };
  features: {
    en: string[];
    ar: string[];
    fr: string[];
  };
  selected_features: string[];
  price: number;
  yearly_price?: number;
  max_clients ?: number;
  max_pets?: number;
  max_appointments?: number;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
}

export interface SubscriptionPlansProps {
  subscriptionPlans: {
    data: {
      data: SubscriptionPlan[];
    };
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
    links: {
      first: string;
      last: string;
      prev?: string;
      next?: string;
    };
  };
  featureGroups?: any[];
  allFeatures?: any[];
  filters: {
    search?: string;
    status?: string;
    billing_period?: string;
  };
  old?: any;
  errors?: any;
}
