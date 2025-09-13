import { Card, Badge, Button } from "@/components/ui";
import { Switch } from "@/components/ui/Form";
import { useTranslation } from "@/hooks/useTranslation";
import { PencilSquareIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { SubscriptionPlan } from "../types";
import { useState } from "react";

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

  const handleToggle = () => {
    if (onToggle) {
      // Update local state immediately for optimistic UI
      setLocalIsActive(!localIsActive);
      onToggle(plan);
    }
  };

  return (
    <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 w-full min-h-[300px] flex flex-col relative">
      {/* Popular Badge */}
      {plan.is_popular && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <Badge color="primary" variant="filled" className="text-xs px-3 py-1">
            {t('common.popular')}
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {translatePlanName(plan.name)}
        </h3>
      </div>

      {/* Description */}
      <div className="mb-4 flex-1">
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center line-clamp-3">
          {translatePlanDescription(plan.description)}
        </p>
      </div>

      {/* Features */}
      <div className="mb-4 flex-1">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t('common.features')}:
        </h4>
        <ul className="space-y-1">
          {translateFeatures(plan.features).slice(0, 4).map((feature: string, index: number) => (
            <li key={index} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
              <CheckIcon className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
              <span className="line-clamp-1">{feature}</span>
            </li>
          ))}
          {translateFeatures(plan.features).length > 4 && (
            <li className="text-xs text-gray-500 dark:text-gray-400">
              +{translateFeatures(plan.features).length - 4} {t('common.more_features')}
            </li>
          )}
        </ul>
      </div>

      {/* Limits */}
      <div className="mb-4 space-y-1">
        {plan.max_clients && (
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{t('common.max_clients')}:</span>
            <span className="font-medium">{plan.max_clients === -1 ? t('common.unlimited') : plan.max_clients}</span>
          </div>
        )}
        {plan.max_pets && (
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{t('common.max_pets')}:</span>
            <span className="font-medium">{plan.max_pets === -1 ? t('common.unlimited') : plan.max_pets}</span>
          </div>
        )}
        {plan.max_appointments && (
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{t('common.max_appointments')}:</span>
            <span className="font-medium">{plan.max_appointments === -1 ? t('common.unlimited') : plan.max_appointments}</span>
          </div>
        )}
        {(plan as any).trial_days && (
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{t('common.trial_days')}:</span>
            <span className="font-medium">{(plan as any).trial_days}</span>
          </div>
        )}
      </div>

      {/* Status Toggle */}
      <div className="mb-4 flex items-center justify-center">
        {onToggle ? (
          <div className="flex items-center space-x-2">
            <Switch
              checked={localIsActive}
              onChange={handleToggle}
              disabled={isToggling}
              color={localIsActive ? 'success' : 'primary'}
              label={
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {localIsActive ? t('common.active') : t('common.inactive')}
                </span>
              }
            />
          </div>
        ) : (
          <Badge 
            color={plan.is_active ? 'success' : 'error'} 
            variant="soft"
            className="text-xs"
          >
            {plan.is_active ? t('common.active') : t('common.inactive')}
          </Badge>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-auto">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(plan.created_at).toLocaleDateString()}
        </div>
        <div className="flex space-x-1">
          <Button
            variant="soft"
            color="primary"
            onClick={onEdit}
            aria-label={t('common.edit')}
            className="h-8 w-8 p-0"
          >
            <PencilSquareIcon className="size-4" />
          </Button>
          <Button
            variant="soft"
            color="error"
            onClick={onDelete}
            disabled={isDeleting}
            aria-label={t('common.delete')}
            className="h-8 w-8 p-0"
          >
            <TrashIcon className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
