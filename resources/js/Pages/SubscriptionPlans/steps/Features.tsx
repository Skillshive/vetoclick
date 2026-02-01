// Import Dependencies  
import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

// Local Imports
import { Button, InputErrorMsg, Checkbox } from "@/components/ui";
import { useSubscriptionPlanFormContext } from "../SubscriptionPlanFormContext";
import { useTranslation } from "@/hooks/useTranslation";
import { featuresSchema } from "@/schemas/subscriptionPlanSchema";

// ----------------------------------------------------------------------

interface FeaturesProps {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  featureGroups?: any[];
  allFeatures?: any[];
  onFinalSubmit?: () => void;
  plan?: any;
  isEditing?: boolean;
  backendErrors?: any;
}

export function Features({
  setCurrentStep,
  featureGroups = [],
  allFeatures = [],
  onFinalSubmit,
  plan,
  isEditing,
  backendErrors,
}: FeaturesProps) {
  const subscriptionPlanFormCtx = useSubscriptionPlanFormContext();
  const { t } = useTranslation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [featuresValidationErrors, setFeaturesValidationErrors] = useState<{
    selected_features?: string;
  }>({});
  const selectedFeatures = subscriptionPlanFormCtx.state.formData.features.selected_features;       
  
  const handleFeatureToggle = (featureId: string, isChecked: boolean) => {
    const currentSelected = selectedFeatures || [];
    if (isChecked) {
      subscriptionPlanFormCtx.dispatch({
        type: "SET_FORM_DATA",
        payload: { features: { ...subscriptionPlanFormCtx.state.formData.features, selected_features: [...currentSelected, featureId] } },
      });
    } else {
      subscriptionPlanFormCtx.dispatch({
        type: "SET_FORM_DATA",
        payload: { features: { ...subscriptionPlanFormCtx.state.formData.features, selected_features: currentSelected.filter(id => id !== featureId) } },
      });
    }
  };

  const handleFeatureClick = (featureId: string) => {
    const isCurrentlyChecked = selectedFeatures.includes(featureId);
    handleFeatureToggle(featureId, !isCurrentlyChecked);
  };

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the form data
    const result = featuresSchema.safeParse(subscriptionPlanFormCtx.state.formData.features);
    
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFeaturesValidationErrors({
        selected_features: errors.selected_features?.[0] ? t(errors.selected_features[0]) : undefined,
      });
      return;
    }

    // Clear validation errors
    setFeaturesValidationErrors({});
    
    subscriptionPlanFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { features: { ...subscriptionPlanFormCtx.state.formData.features } },
    });
    subscriptionPlanFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: { features: { isDone: true } },
    });
    setCurrentStep(3);
  };

  return (
    <form onSubmit={onSubmit} autoComplete="off">
      <div className="mt-6 space-y-6">
        {/* Predefined Features */}
        {featureGroups.length > 0 && (
          <div>
            <div className="space-y-4">
              {featureGroups.map((group) => {
                const groupFeatures = allFeatures.filter(feature => feature.group?.uuid === group.uuid);
                const isExpanded = expandedGroups.has(group.uuid);
                
                return (
                  <div key={group.uuid} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.uuid)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {typeof group.name === 'object' ? group.name.en : group.name}
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {groupFeatures.length} {t('common.features_available')}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {groupFeatures.map((feature) => (
                            <div 
                              key={feature.uuid} 
                              className="flex items-start cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded transition-colors"
                              onClick={() => handleFeatureClick(feature.uuid)}
                            >
                              <Checkbox
                                checked={selectedFeatures.includes(feature.uuid)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleFeatureToggle(feature.uuid, e.target.checked);
                                }}
                                className="mr-3 mt-1"
                              />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {typeof feature.name === 'object' ? feature.name.en : feature.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {typeof feature.description === 'object' ? feature.description.en : feature.description}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(featuresValidationErrors?.selected_features || backendErrors?.selected_features) && (
          <p className="text-red-500 text-sm mt-1">{featuresValidationErrors.selected_features || backendErrors?.selected_features}</p>
        )}
      </div>
      <div className="mt-8 flex justify-between">
        <Button 
          type="button" 
          className="min-w-[7rem]"
          onClick={() => setCurrentStep(1)}
        >
          Previous
        </Button>
        <Button type="submit" className="min-w-[7rem]" color="primary">
          Next
        </Button>
      </div>
    </form>
  );
}