import { Card, Badge, Button } from "@/components/ui";
import { Switch } from "@/components/ui/Form";
import { useTranslation } from "@/hooks/useTranslation";
import { PencilSquareIcon, TrashIcon, CheckIcon, XMarkIcon, UsersIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { SubscriptionPlan } from "../types";
import { useState } from "react";
import clsx from "clsx";
import { FaCar, FaPlane, FaRocket, FaCrown, FaStar, FaGem, FaPaw } from "react-icons/fa";

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  onEdit: () => void;
  onDelete: () => void;
  onToggle?: (plan: SubscriptionPlan) => void;
  isToggling?: boolean;
  isDeleting?: boolean;
}

export function SubscriptionPlanCard({ plan, onEdit, onDelete, onToggle, isToggling = false, isDeleting = false }: SubscriptionPlanCardProps) {
  const { t } = useTranslation();
  const [localIsActive, setLocalIsActive] = useState(plan.is_active);

  const translatePlanName = (planName: any) => {
    if (typeof planName === 'object' && planName !== null) {
      return planName.en || planName.ar || planName.fr || 'Unknown Plan';
    }
    return planName || 'Unknown Plan';
  };

  const translatePlanDescription = (description: any) => {
    if (typeof description === 'object' && description !== null) {
      return description.en || description.ar || description.fr || '';
    }
    return description || '';
  };

  const translateFeatures = (features: any) => {
    if (Array.isArray(features)) {
      // If features is an array of objects, extract the name property
      return features.map((feature: any) => {
        if (typeof feature === 'object' && feature !== null) {
          // Handle feature objects with multilingual names
          if (feature.name && typeof feature.name === 'object') {
            return feature.name.en || feature.name.ar || feature.name.fr || feature.name;
          }
          // Handle feature objects with direct name property
          return feature.name || feature.description || feature.slug || 'Unknown Feature';
        }
        return feature;
      });
    }
    if (typeof features === 'object' && features !== null) {
      return features.en || features.ar || features.fr || [];
    }
    return [];
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getBillingPeriodText = (period: string) => {
    switch (period) {
      case 'monthly':
        return t('common.monthly');
      case 'yearly':
        return t('common.yearly');
      case 'lifetime':
        return t('common.lifetime');
      default:
        return period;
    }
  };

  const getPlanIcon = (plan: SubscriptionPlan) => {
    // Use sort_order to determine icon, with popular plans getting crown
    if (plan.is_popular) return FaCrown;
    
    const sortOrder = plan.sort_order || 1;
    switch (sortOrder) {
      case 1:
        return FaGem; // Enterprise plan
      case 2:
        return FaStar; // Premium plan
      case 3:
        return FaCrown; // Ultimate plan
      default:
        // For any other sort_order, cycle through the 3 available icons
        const icons = [FaGem, FaStar, FaCrown];
        return icons[(sortOrder - 1) % icons.length];
    }
  };

  const getPlanDescription = (plan: SubscriptionPlan) => {
    if (plan.is_popular) return t('common.popular_choice');
    
    const sortOrder = plan.sort_order || 1;
    switch (sortOrder) {
      case 1:
        return t('common.enterprise_choice');
      case 2:
        return t('common.premium_choice');
      case 3:
        return t('common.ultimate_choice');
      default:
        // For any other sort_order, cycle through the 3 available choices
        const choices = [t('common.enterprise_choice'), t('common.premium_choice'), t('common.ultimate_choice')];
        return choices[(sortOrder - 1) % choices.length];
    }
  };

  const handleToggle = () => {
    if (onToggle) {
      // Update local state immediately for optimistic UI
      setLocalIsActive(!localIsActive);
      onToggle(plan);
    }
  };

  const PlanIcon = getPlanIcon(plan);

  return (
    <div className="group relative p-4 text-center sm:p-5 bg-white dark:bg-dark-700 rounded-lg shadow-soft dark:shadow-none border border-gray-150 dark:border-dark-500 hover:shadow-lg transition-all duration-200">
      {/* Popular Badge */}
      {plan.is_popular && (
        <div className="absolute right-0 top-0 p-3">
          <Badge color="info" className="rounded-full">
            {t('common.recommended')}
          </Badge>
        </div>
      )}

      {/* Sort Order Badge */}
      {plan.sort_order && plan.sort_order > 0 && (
        <div className="absolute left-0 top-0 p-3">
          <Badge color="primary" variant="soft" className="rounded-full">
            #{plan.sort_order}
          </Badge>
        </div>
      )}

      {/* Icon */}
      <div className="mt-8">
        <PlanIcon className="inline size-16 text-primary-600 dark:text-primary-400" />
      </div>

      {/* Plan Name and Description */}
      <div className="mt-5">
        <h4 className="text-xl font-semibold text-gray-600 dark:text-dark-100">
          {translatePlanName(plan.name)}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {getPlanDescription(plan)}
        </p>
      </div>

      {/* Price */}
      <div className="mt-5">
        <span className="text-4xl tracking-tight text-primary-600 dark:text-primary-400">
          {plan.price} DH
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">/month</span>
        {plan.yearly_price && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {plan.yearly_price} DH/year
          </div>
        )}
      </div>

      {/* Features */}
      <div className="mt-8 space-y-4 text-left">
        {translateFeatures(plan.features).slice(0, 6).map((feature: string, index: number) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-600/10 text-primary-600 dark:bg-primary-400/10 dark:text-primary-400">
              <CheckIcon className="size-4" />
            </div>
            <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{feature}</span>
          </div>
        ))}
        {translateFeatures(plan.features).length > 6 && (
          <div className="text-sm text-primary-600 dark:text-primary-400 font-medium text-center pt-2">
            +{translateFeatures(plan.features).length - 6} {t('common.more_features')}
          </div>
        )}
      </div>

      {/* Limits - Icon Tags */}
      {(plan.max_clients || plan.max_pets || plan.max_appointments) && (
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          {plan.max_clients && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800">
              <UsersIcon className="size-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                {plan.max_clients === -1 ? '∞' : plan.max_clients}
              </span>
            </div>
          )}
          {plan.max_pets && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-full border border-purple-200 dark:border-purple-800">
              <FaPaw className="size-3.5 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                {plan.max_pets === -1 ? '∞' : plan.max_pets}
              </span>
            </div>
          )}
          {plan.max_appointments && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800">
              <CalendarIcon className="size-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                {plan.max_appointments === -1 ? '∞' : plan.max_appointments}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons - Show on Hover (Top Right) */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        
        <Button
          variant="soft"
          color="primary"
          onClick={onEdit}
          aria-label={t('common.edit')}
          className="h-9 w-9 p-0 shadow-lg"
        >
          <PencilSquareIcon className="size-4" />
        </Button>
        <Button
          variant="soft"
          color="error"
          onClick={onDelete}
          disabled={isDeleting}
          aria-label={t('common.delete')}
          className="h-9 w-9 p-0 shadow-lg"
        >
          <TrashIcon className="size-4" />
        </Button>
        {onToggle && (
          <div className="flex items-center justify-end mb-1">
            <Switch
              checked={localIsActive}
              onChange={handleToggle}
              disabled={isToggling}
              color={localIsActive ? 'success' : 'primary'}
              // label={
              //   <span className="text-xs text-gray-600 dark:text-gray-400">
              //     {localIsActive ? t('common.active') : t('common.inactive')}
              //   </span>
              // }
            />
          </div>
        )}
      </div>

      {/* Status Badge - Show when not hovering and no toggle available */}
      {!onToggle && (
        <div className="mt-6 flex items-center justify-center">
          <Badge 
            color={plan.is_active ? 'success' : 'error'} 
            variant="soft"
            className="text-xs"
          >
            {plan.is_active ? t('common.active') : t('common.inactive')}
          </Badge>
        </div>
      )}
    </div>
  );
}