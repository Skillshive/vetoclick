import React from 'react';
import { useSubscriptionFeatures } from '@/hooks/useSubscriptionFeatures';
import { Button } from '@/components/ui';
import { ExclamationTriangleIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface SubscriptionGateProps {
  children: React.ReactNode;
  action: string;
  fallback?: React.ReactNode;
  showUpgradeButton?: boolean;
  className?: string;
}

export function SubscriptionGate({ 
  children, 
  action, 
  fallback, 
  showUpgradeButton = true,
  className = ''
}: SubscriptionGateProps) {
  const { canPerform, getUpgradeMessage, subscription } = useSubscriptionFeatures();

  if (canPerform(action)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={`p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg ${className}`}>
      <div className="flex items-start space-x-3">
        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Feature Not Available
          </h3>
          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
            {getUpgradeMessage(action)}
          </p>
          {showUpgradeButton && subscription.has_subscription && (
            <div className="mt-3">
              <Button
                size="sm"
                color="primary"
                onClick={() => {
                  // Navigate to upgrade page
                  window.location.href = '/subscription/upgrade';
                }}
              >
                Upgrade Plan
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PermissionGateProps {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
  className?: string;
}

export function PermissionGate({ 
  children, 
  permission, 
  fallback, 
  className = ''
}: PermissionGateProps) {
  const { hasFeature } = useSubscriptionFeatures();

  if (hasFeature(permission)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={`p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      <div className="flex items-center space-x-3">
        <LockClosedIcon className="w-5 h-5 text-gray-400" />
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Access Restricted
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You don't have permission to access this feature.
          </p>
        </div>
      </div>
    </div>
  );
}

interface LimitIndicatorProps {
  resource: string;
  className?: string;
}

export function LimitIndicator({ resource, className = '' }: LimitIndicatorProps) {
  const { getLimit, getUsage, isUnlimited, isLimitReached } = useSubscriptionFeatures();

  const limit = getLimit(resource);
  const usage = getUsage(resource);

  if (isUnlimited(resource)) {
    return (
      <div className={`text-sm text-green-600 dark:text-green-400 ${className}`}>
        Unlimited {resource}
      </div>
    );
  }

  if (limit === null) {
    return null;
  }

  const percentage = (usage / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = isLimitReached(resource);

  return (
    <div className={`text-sm ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-600 dark:text-gray-400 capitalize">
          {resource} usage
        </span>
        <span className={`font-medium ${
          isAtLimit ? 'text-red-600 dark:text-red-400' :
          isNearLimit ? 'text-yellow-600 dark:text-yellow-400' :
          'text-gray-900 dark:text-gray-100'
        }`}>
          {usage} / {limit}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isAtLimit ? 'bg-red-500' :
            isNearLimit ? 'bg-yellow-500' :
            'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {isAtLimit && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          Limit reached. Upgrade your plan for more {resource}.
        </p>
      )}
    </div>
  );
}
