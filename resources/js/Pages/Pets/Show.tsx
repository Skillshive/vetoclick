import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import MainLayout from '@/layouts/MainLayout';
import { Page } from '@/components/shared/Page';
import { Card, Button, Badge, Avatar } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { BreadcrumbItem, Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { getPetAvatarUrl } from '@/utils/imageHelper';
import {
  ArrowLeftIcon,
  PencilIcon,
  CalendarIcon,
  UserIcon,
  IdentificationIcon,
  ScaleIcon,
  PaintBrushIcon,
  HeartIcon,
  DocumentTextIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { PawPrint, Syringe, AlertTriangle } from 'lucide-react';

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface Breed {
  uuid: string;
  name: string;
  species?: {
    uuid: string;
    name: string;
  };
}

interface Client {
  uuid: string;
  first_name: string;
  last_name: string;
}

interface Pet {
  uuid: string;
  name: string;
  breed_id?: string;
  sex?: number;
  neutered_status?: boolean;
  dob?: string;
  microchip_ref?: string;
  profile_img?: string;
  weight_kg?: number;
  bcs?: number;
  color?: string;
  notes?: string;
  deceased_at?: string;
  breed?: Breed;
  client?: Client;
}

interface Consultation {
  uuid: string;
  date: string;
  appointment_type: string;
  reason: string;
  notes?: string;
  status: string;
  is_video_conseil: boolean;
  has_consultation: boolean;
  is_canceled: boolean;
  consultation_uuid?: string;
  medical_record?: any;
}

interface Vaccination {
  uuid: string;
  vaccine_name: string;
  vaccination_date: string;
  next_due_date?: string;
  status: 'active' | 'overdue';
  administered_by: string;
}

interface Allergy {
  uuid: string;
  allergen_type: string;
  allergen_detail: string;
  start_date: string;
  reaction_description?: string;
  severity_level?: string;
  resolved_status: boolean;
  resolution_date?: string;
  treatment_given?: string;
}

interface ShowProps {
  pet: Pet;
  consultations?: Consultation[];
  vaccinations?: Vaccination[];
  allergies?: Allergy[];
}

export default function Show({ pet, consultations: initialConsultations, vaccinations: initialVaccinations, allergies: initialAllergies }: ShowProps) {
  const { t } = useTranslation();
  const [consultations, setConsultations] = useState<Consultation[]>(initialConsultations || []);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>(initialVaccinations || []);
  const [allergies, setAllergies] = useState<Allergy[]>(initialAllergies || []);
  const [loading, setLoading] = useState(!initialConsultations && !initialVaccinations && !initialAllergies);

  useEffect(() => {
    // Only fetch if data wasn't provided in props
    if (initialConsultations !== undefined && initialVaccinations !== undefined && initialAllergies !== undefined) {
      setLoading(false);
      return;
    }

    const fetchMedicalHistory = async () => {
      try {
        const response = await fetch(route('pets.medical-history', pet.uuid), {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'same-origin',
        });

        if (response.ok) {
          const data = await response.json();
          setConsultations(data.consultations || []);
          setVaccinations(data.vaccinations || []);
          setAllergies(data.allergies || []);
        }
      } catch (error) {
        console.error('Error fetching medical history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalHistory();
  }, [pet.uuid, initialConsultations, initialVaccinations, initialAllergies]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getGenderLabel = (sex?: number) => {
    return sex === 1 ? t('common.female') || 'Female' : t('common.male') || 'Male';
  };

  const getStatusBadgeColor = (status: string): "neutral" | "primary" | "secondary" | "info" | "success" | "warning" | "error" | undefined => {
    const mapping: Record<string, "neutral" | "primary" | "secondary" | "info" | "success" | "warning" | "error"> = {
      'completed': 'success',
      'confirmed': 'info',
      'pending': 'warning',
      'canceled': 'error',
      'cancelled': 'error',
      'active': 'success',
      'overdue': 'error',
    };
    return mapping[status.toLowerCase()] || 'secondary';
  };

  const getSeverityBadgeColor = (severity?: string): "neutral" | "primary" | "secondary" | "info" | "success" | "warning" | "error" | undefined => {
    const mapping: Record<string, "neutral" | "primary" | "secondary" | "info" | "success" | "warning" | "error"> = {
      'mild': 'warning',
      'moderate': 'info',
      'severe': 'error',
    };
    return severity ? mapping[severity.toLowerCase()] || 'secondary' : 'secondary';
  };

  const calculateAge = (dob?: string) => {
    if (!dob) return '-';
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      
      if (months < 0) {
        years--;
        months += 12;
      }
      
      if (years > 0) {
        return `${years} ${years === 1 ? 'year' : 'years'}${months > 0 ? `, ${months} ${months === 1 ? 'month' : 'months'}` : ''}`;
      }
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    } catch {
      return '-';
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('common.pets') || 'Pets', path: route('pets.index') },
    { title: pet.name },
  ];

  return (
    <MainLayout>
      <Page title={pet.name}>
        <div className="transition-content px-(--margin-x) pb-6">
          {/* Header */}
          <div className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6">
            <div className="flex items-center gap-1">
              <div>
                <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('common.pet_details') || 'View pet information and medical history'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outlined"
                onClick={() => router.visit(route('pets.index'))}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="size-4" />
                {t('common.back')}
              </Button>
              <Button
                variant="filled"
                color="primary"
                onClick={() => router.visit(route('pets.edit', pet.uuid))}
                className="flex items-center gap-2"
              >
                <PencilIcon className="size-4" />
                {t('common.edit')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
            {/* Pet Information Card */}
            <div className="col-span-12 lg:col-span-4">
              <Card className="p-4 sm:px-5">
                <div className="flex flex-col items-center mb-6">
                  <Avatar
                    size={24}
                    src={getPetAvatarUrl(pet)}
                    name={pet.name}
                    classNames={{
                      root: "ring-primary-600 dark:ring-primary-500",
                    }}
                  />
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-4">
                    {pet.name}
                  </h2>
                  {pet.deceased_at && (
                    <Badge color="error" className="mt-2">
                      {t('common.deceased') || 'Deceased'}
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Breed */}
                  {pet.breed && (
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <PawPrint className="size-4" />
                        {t('common.breed') || 'Breed'}
                      </label>
                      <p className="text-base font-medium text-gray-800 dark:text-gray-200 mt-1">
                        {pet.breed.name}
                        {pet.breed.species && ` (${pet.breed.species.name})`}
                      </p>
                    </div>
                  )}

                  {/* Gender */}
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <UserIcon className="size-4" />
                      {t('common.gender') || 'Gender'}
                    </label>
                    <p className="text-base font-medium text-gray-800 dark:text-gray-200 mt-1">
                      {getGenderLabel(pet.sex)}
                      {pet.neutered_status !== undefined && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({pet.neutered_status ? t('common.neutered') || 'Neutered' : t('common.not_neutered') || 'Not Neutered'})
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Date of Birth */}
                  {pet.dob && (
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <CalendarIcon className="size-4" />
                        {t('common.date_of_birth') || 'Date of Birth'}
                      </label>
                      <p className="text-base font-medium text-gray-800 dark:text-gray-200 mt-1">
                        {formatDate(pet.dob)}
                        <span className="ml-2 text-sm text-gray-500">
                          ({calculateAge(pet.dob)})
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Microchip */}
                  {pet.microchip_ref && (
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <IdentificationIcon className="size-4" />
                        {t('common.microchip_number') || 'Microchip Number'}
                      </label>
                      <p className="text-base font-medium text-gray-800 dark:text-gray-200 mt-1">
                        {pet.microchip_ref}
                      </p>
                    </div>
                  )}

                  {/* Weight */}
                  {pet.weight_kg !== null && pet.weight_kg !== undefined && (
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <ScaleIcon className="size-4" />
                        {t('common.weight') || 'Weight'}
                      </label>
                      <p className="text-base font-medium text-gray-800 dark:text-gray-200 mt-1">
                        {pet.weight_kg} kg
                      </p>
                    </div>
                  )}

                  {/* BCS */}
                  {pet.bcs !== null && pet.bcs !== undefined && (
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <HeartIcon className="size-4" />
                        {t('common.bcs') || 'Body Condition Score'}
                      </label>
                      <p className="text-base font-medium text-gray-800 dark:text-gray-200 mt-1">
                        {pet.bcs}/9
                      </p>
                    </div>
                  )}

                  {/* Color */}
                  {pet.color && (
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <PaintBrushIcon className="size-4" />
                        {t('common.color') || 'Color'}
                      </label>
                      <p className="text-base font-medium text-gray-800 dark:text-gray-200 mt-1">
                        {pet.color}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {pet.notes && (
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <DocumentTextIcon className="size-4" />
                        {t('common.notes') || 'Notes'}
                      </label>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {pet.notes}
                      </p>
                    </div>
                  )}

                  {/* Deceased Date */}
                  {pet.deceased_at && (
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <XCircleIcon className="size-4" />
                        {t('common.deceased_at') || 'Deceased Date'}
                      </label>
                      <p className="text-base font-medium text-gray-800 dark:text-gray-200 mt-1">
                        {formatDate(pet.deceased_at)}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Medical History Section */}
            <div className="col-span-12 lg:col-span-8 space-y-4">
              {/* Recent Consultations */}
              <Card className="p-4 sm:px-5">
                <div className="flex items-center gap-2 mb-4">
                  <BeakerIcon className="size-5 text-primary-600 dark:text-primary-400" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {t('common.recent_consultations') || 'Recent Consultations'}
                  </h3>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('common.loading') || 'Loading...'}</p>
                  </div>
                ) : consultations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('common.no_consultations_found') || 'No consultations found'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {consultations.slice(0, 5).map((consultation) => (
                      <div
                        key={consultation.uuid}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                                {consultation.appointment_type || t('common.consultation') || 'Consultation'}
                              </h4>
                              {consultation.is_video_conseil  ? (
                                <Badge color="info" variant="soft" className="text-xs">
                                  {t('common.video_consultation') || 'Video'}
                                </Badge>
                              ) : null}
                              <Badge color={getStatusBadgeColor(consultation.status)} variant="soft" className="text-xs">
                                {t(`common.${consultation.status}`) || consultation.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              {formatDateTime(consultation.date)}
                            </p>
                            {consultation.reason  ? (
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {t('common.reason') || 'Reason'}: {consultation.reason}
                              </p>
                            ) : null}
                            {consultation.notes  ? (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {consultation.notes}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Vaccinations */}
              <Card className="p-4 sm:px-5">
                <div className="flex items-center gap-2 mb-4">
                  <Syringe className="size-5 text-primary-600 dark:text-primary-400" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {t('common.vaccinations') || 'Vaccinations'}
                  </h3>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('common.loading') || 'Loading...'}</p>
                  </div>
                ) : vaccinations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('common.no_vaccinations_found') || 'No vaccinations found'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vaccinations.map((vaccination) => (
                      <div
                        key={vaccination.uuid}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                                {vaccination.vaccine_name}
                              </h4>
                              <Badge color={getStatusBadgeColor(vaccination.status)} variant="soft" className="text-xs">
                                {vaccination.status === 'overdue' ? t('common.overdue') || 'Overdue' : t('common.active') || 'Active'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              {t('common.vaccination_date') || 'Date'}: {formatDate(vaccination.vaccination_date)}
                            </p>
                            {vaccination.next_due_date  ? (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('common.next_due_date') || 'Next Due'}: {formatDate(vaccination.next_due_date)}
                              </p>
                            ) : null}
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {t('common.administered_by') || 'Administered by'}: {vaccination.administered_by}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Allergies */}
              <Card className="p-4 sm:px-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="size-5 text-warning-600 dark:text-warning-400" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {t('common.allergies') || 'Allergies'}
                  </h3>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('common.loading') || 'Loading...'}</p>
                  </div>
                ) : allergies.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('common.no_allergies_found') || 'No allergies recorded'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allergies.map((allergy) => (
                      <div
                        key={allergy.uuid}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                                {allergy.allergen_type}
                                {allergy.allergen_detail && ` - ${allergy.allergen_detail}`}
                              </h4>
                              {allergy.severity_level  ? (
                                <Badge color={getSeverityBadgeColor(allergy.severity_level)} variant="soft" className="text-xs">
                                  {allergy.severity_level}
                                </Badge>
                              ) : null}
                              {allergy.resolved_status ? (
                                <Badge color="success" variant="soft" className="text-xs">
                                  {t('common.resolved') || 'Resolved'}
                                </Badge>
                              ) : (
                                <Badge color="warning" variant="soft" className="text-xs">
                                  {t('common.active') || 'Active'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              {t('common.start_date') || 'Start Date'}: {formatDate(allergy.start_date)}
                            </p>
                            {allergy.reaction_description  ? (
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                {t('common.reaction') || 'Reaction'}: {allergy.reaction_description}
                              </p>
                            ) : null}
                            {allergy.treatment_given  ? (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('common.treatment') || 'Treatment'}: {allergy.treatment_given}
                              </p>
                            ) : null}
                            {allergy.resolution_date  ? (
                              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                {t('common.resolved_on') || 'Resolved on'}: {formatDate(allergy.resolution_date)}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </Page>
    </MainLayout>
  );
}

