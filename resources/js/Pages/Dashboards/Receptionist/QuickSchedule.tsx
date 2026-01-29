import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button,  Card, Switch } from "@/components/ui";
import { CalendarIcon, HomeIcon, PlusIcon, VideoCameraIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { PawPrint } from "lucide-react";
import { DatePicker } from "@/components/shared/form/Datepicker";
import ReactSelect from "@/components/ui/ReactSelect";
import { router } from "@inertiajs/react";
import { useToast } from "@/components/common/Toast/ToastContext";
import ReceptionistClientModal from "./modals/ReceptionistClientModal";
import { AddPetModal } from "./modals/AddPetModal";

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface QuickScheduleProps {
  clients: Record<string, string>;
  veterinaryId: string | null;
}

export function QuickSchedule({ clients: initialClients, veterinaryId }: QuickScheduleProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [clients, setClients] = useState(initialClients);
  const [formData, setFormData] = useState({
    client_id: '',
    pet_id: '',
    appointment_type: '',
    reason_for_visit: '',
    is_video_conseil: false,
  });
  const [selectedDateTime, setSelectedDateTime] = useState<Date[]>([]);
  const [pets, setPets] = useState<Array<{ uuid: string; name: string }>>([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [timeValidationError, setTimeValidationError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const clientOptions = Object.entries(clients).map(([uuid, name]) => ({
    value: uuid,
    label: name,
  }));
  
  const appointmentOptions = [
    { value: 'common.checkup', label: t('common.checkup') },
    { value: 'common.new_patient', label: t('common.new_patient') },
    { value: 'common.vaccination', label: t('common.vaccination') },
    { value: 'common.surgery_consult', label: t('common.surgery_consult') },
    { value: 'common.other', label: t('common.other') },
  ];

  // Watch for changes in selectedDateTime to fetch available times
  useEffect(() => {
    if (selectedDateTime && selectedDateTime.length > 0) {
      const selectedDate = selectedDateTime[0];
      const date = selectedDate.toISOString().split('T')[0];
      const time = selectedDate.toTimeString().split(' ')[0].substring(0, 5);
      
      fetchAvailableTimes(date);
      validateSelectedTime(date, time);
    } else {
      setAvailableTimes([]);
      setTimeValidationError(null);
      setShowSuggestions(false);
    }
  }, [selectedDateTime]);


  const handleClientAdded = (newClient: { uuid: string; name: string }) => {
    // Add new client to the list
    setClients({ ...clients, [newClient.uuid]: newClient.name });
    // Auto-select the newly created client
    setFormData({ ...formData, client_id: newClient.uuid, pet_id: '' });
    // Load pets for this client
    handleClientChange(newClient.uuid);
  };

  const handlePetAdded = (newPet: { uuid: string; name: string }) => {
    // Add new pet to the list
    setPets([...pets, newPet]);
    // Auto-select the newly created pet
    setFormData({ ...formData, pet_id: newPet.uuid });
  };

  const handleClientChange = async (clientId: string) => {
    setFormData({ ...formData, client_id: clientId, pet_id: '' });
    
    if (!clientId) {
      setPets([]);
      return;
    }

    setLoadingPets(true);
    try {
      const response = await fetch(route('clients.pets', { uuid: clientId }));
      const data = await response.json();
      setPets(data);
    } catch (error) {
      console.error('Failed to load pets:', error);
      setPets([]);
    } finally {
      setLoadingPets(false);
    }
  };

  // Fetch available times when date/time changes
  const fetchAvailableTimes = async (date: string) => {
    if (!veterinaryId || !date) {
      setAvailableTimes([]);
      return;
    }

    setIsLoadingTimes(true);
    setTimeValidationError(null);
    setShowSuggestions(false);

    try {
      const response = await fetch(
        `${route('appointments.available-times')}?veterinary_id=${veterinaryId}&appointment_date=${date}&duration_minutes=30`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'same-origin',
        }
      );

      const result = await response.json();

      if (result.success && result.suggestions.length > 0) {
        setAvailableTimes(result.suggestions);
      } else {
        setAvailableTimes([]);
      }
    } catch (error) {
      console.error('Failed to fetch available times:', error);
      setAvailableTimes([]);
    } finally {
      setIsLoadingTimes(false);
    }
  };

  // Validate selected time
  const validateSelectedTime = (date: string, time: string) => {
    if (!veterinaryId || !date || !time) {
      setTimeValidationError(null);
      setShowSuggestions(false);
      return;
    }

    if (availableTimes.length > 0) {
      const isAvailable = availableTimes.includes(time);
      
      if (!isAvailable) {
        setTimeValidationError(t('common.veterinarian_not_available_at_requested_time'));
        setShowSuggestions(true);
      } else {
        setTimeValidationError(null);
        setShowSuggestions(false);
      }
    } else if (!isLoadingTimes) {
      setTimeValidationError(t('common.veterinarian_not_available_at_requested_time'));
      setShowSuggestions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id || !formData.pet_id || 
        !selectedDateTime || selectedDateTime.length === 0 || !formData.appointment_type) {
      showToast({
        type: 'error',
        message: t('common.please_fill_required_fields'),
        duration: 3000,
      });
      return;
    }

    if (!veterinaryId) {
      showToast({
        type: 'error',
        message: 'Veterinary information not found. Please contact support.',
        duration: 3000,
      });
      return;
    }

    // Extract date and time from selectedDateTime
    const selectedDate = selectedDateTime[0];
    const appointmentDate = selectedDate.toISOString().split('T')[0];
    const startTime = selectedDate.toTimeString().split(' ')[0].substring(0, 5);

    setLoading(true);
    try {
      const response = await fetch(route('appointments.store'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          veterinary_id: veterinaryId, // Auto-fill from receptionist's linked vet (note: veterinary_id, not veterinarian_id)
          client_id: formData.client_id,
          pet_id: formData.pet_id,
          appointment_date: appointmentDate,
          start_time: startTime,
          appointment_type: formData.appointment_type,
          reason_for_visit: formData.reason_for_visit || '',
          is_video_conseil: formData.is_video_conseil,
        }),
      });

      if (response.ok) {
        showToast({
          type: 'success',
          message: t('common.appointment_created') ,
          duration: 3000,
        });
        
        // Reset form
        setFormData({
          client_id: '',
          pet_id: '',
          appointment_type: '',
          reason_for_visit: '',
          is_video_conseil: false,
        });
        setSelectedDateTime([]);
        setPets([]);
        router.visit(window.location.href, { preserveScroll: true, preserveState: false });
      } else {
        // Try to parse error response
        let errorMessage = 'Failed to create appointment';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON, get status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error.message || t('common.failed_to_create_appointment') || 'Failed to create appointment',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex min-w-0 items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-dark-600">
        <h2 className="text-sm-plus dark:text-dark-100 truncate font-medium tracking-wide text-gray-800">
          {t("common.quick_schedule") || "Quick Schedule"}
        </h2>
        <PlusIcon className="size-5 text-primary-600 dark:text-primary-400" />
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Client Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs-plus font-medium text-gray-700 dark:text-gray-300">
              {t('common.client')} <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowClientModal(true)}
              className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              <UserPlusIcon className="size-4" />
              {t('common.add_client') || 'Add Client'}
            </button>
          </div>
          <ReactSelect
            value={formData.client_id ? { value: formData.client_id, label: clients[formData.client_id] } : null}
            onChange={(option: any) => handleClientChange(option?.value || '')}
            options={clientOptions}
            placeholder={t('common.select_client') || 'Select client'}
            isRequired
          />
        </div>

        {/* Pet Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs-plus font-medium text-gray-700 dark:text-gray-300">
              {t('common.pet')} <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowPetModal(true)}
              disabled={!formData.client_id}
              className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PawPrint className="size-4" />
              {t('common.add_pet') || 'Add Pet'}
            </button>
          </div>
          <ReactSelect
            value={formData.pet_id ? { value: formData.pet_id, label: pets.find(p => p.uuid === formData.pet_id)?.name || '' } : null}
            onChange={(option: any) => setFormData({ ...formData, pet_id: option?.value || '' })}
            options={pets.map(pet => ({ value: pet.uuid, label: pet.name }))}
            placeholder={t('common.select_pet') || 'Select pet'}
            isDisabled={!formData.client_id || loadingPets}
            isRequired
          />
        </div>

        

        {/* Date & Time */}
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('common.vet_dashboard.form.date_and_time') || 'Date & Time'}  <span className="text-red-500">*</span>
            </label>
            <DatePicker
              value={selectedDateTime}
              onChange={(dates: Date[]) => {
                setSelectedDateTime(dates);
              }}
              options={{
                enableTime: true,
                dateFormat: 'Y-m-d H:i',
              }}
              placeholder={t('common.vet_dashboard.form.select_date_time') || 'Select date and time'}
              className="w-full"
            />
            
            {/* Loading indicator */}
            {isLoadingTimes && veterinaryId && selectedDateTime.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t('common.loading_available_times') || 'Loading available times...'}
              </p>
            )}
            
            {/* Time validation error and suggestions */}
            {timeValidationError && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                  {timeValidationError}
                </p>
                
                {showSuggestions && availableTimes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('common.available_times_suggestions') || 'Available times:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => {
                            if (selectedDateTime.length > 0) {
                              const [hours, minutes] = time.split(':');
                              const selectedDate = new Date(selectedDateTime[0]);
                              selectedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                              
                              setSelectedDateTime([selectedDate]);
                              setTimeValidationError(null);
                              setShowSuggestions(false);
                            }
                          }}
                          className="px-3 py-1.5 text-sm font-medium text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {availableTimes.length === 0 && !isLoadingTimes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('common.no_available_times') || 'No available times for this date'}
                  </p>
                )}
              </div>
            )}
            
            {/* Show available times confirmation when time is valid */}
            {!timeValidationError && availableTimes.length > 0 && selectedDateTime.length > 0 && (
              <p className="text-sm text-primary-600 dark:text-primary-400 mt-2">
                {t('common.time_available') || 'This time is available'}
              </p>
            )}
          </div>

        {/* Appointment Type */}
        <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('common.vet_dashboard.form.appointment_type')}
                </label>
                <ReactSelect
                  value={formData.appointment_type ? { value: formData.appointment_type, label: appointmentOptions.find(option => option.value === formData.appointment_type)?.label || '' } : null}
                  options={appointmentOptions}
                  onChange={(selectedOption: any) => setFormData({ ...formData, appointment_type: selectedOption ? selectedOption.value : '' })}
                  placeholder={t('common.vet_dashboard.form.select_appointment_type')}
                  isClearable
                  isRequired
                />
              </div>

        {/* Reason */}
        <div>
          <label className="block text-xs-plus font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {t('common.reason_for_visit')}
          </label>
          <textarea
            value={formData.reason_for_visit}
            onChange={(e) => setFormData({ ...formData, reason_for_visit: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-dark-500 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-600 dark:text-dark-100"
            placeholder={t('common.enter_reason') || 'Enter reason...'}
          />
        </div>

        {/* Video Consultation */}
       
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-600 rounded-lg border border-gray-200 dark:border-dark-500">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${formData.is_video_conseil ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-200 dark:bg-dark-500'}`}>
                    {formData.is_video_conseil ? (
                      <VideoCameraIcon className="w-5 h-5 text-primary-600 dark:text-gray-400" />
                    ) : (
                      <HomeIcon className="w-5 h-5 text-primary-600 dark:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 dark:text-dark-100">
                      {formData.is_video_conseil 
                        ? t('common.vet_dashboard.form.online_consultation') || 'Online Consultation'
                        : t('common.vet_dashboard.form.in_person_visit') || 'In-Person Visit'}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.is_video_conseil
                        ? t('common.vet_dashboard.form.online_consultation_desc') || 'Video call appointment'
                        : t('common.vet_dashboard.form.in_person_visit_desc') || 'Physical visit to clinic'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.is_video_conseil}
                  onChange={(e) =>
                    setFormData({ ...formData, is_video_conseil: e.target.checked })
                  }
                  color="primary"
                  variant="basic"
                />
              </div>
        {/* Submit Button */}
        <Button
          type="submit"
          color="primary"
          className="w-full"
          disabled={loading}
        >
          <CalendarIcon className="size-5 ltr:mr-2 rtl:ml-2" />
          {loading ? (t('common.creating') || 'Creating...') : (t('common.create_appointment') || 'Create Appointment')}
        </Button>
      </form>

      {/* Add Client Modal */}
      <ReceptionistClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onClientAdded={handleClientAdded}
      />

      {/* Add Pet Modal */}
      <AddPetModal
        isOpen={showPetModal}
        onClose={() => setShowPetModal(false)}
        onPetAdded={handlePetAdded}
        clientId={formData.client_id}
      />
    </Card>
  );
}
