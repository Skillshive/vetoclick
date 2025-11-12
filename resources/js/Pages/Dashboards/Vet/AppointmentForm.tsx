import { useEffect, useState } from "react";
import { addMinutes, format } from "date-fns";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Select, { SingleValue } from "react-select";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { DatePicker } from "@/components/shared/form/Datepicker";
import { Card, Button } from "@/components/ui";
import { Checkbox, Input, Textarea } from "@/components/ui/Form";

declare const route: (
  name: string,
  params?: Record<string, unknown>,
  absolute?: boolean,
) => string;

type Option = {
  value: string;
  label: string;
};

const appointmentSchema = z.object({
  appointment_date: z.string().min(1, "Date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  client: z.string().min(1, "Client name is required"),
  pet: z.string().optional(),
  appointment_type: z.string().min(1, "Appointment type is required"),
  duration_minutes: z
    .number()
    .min(15, "Minimum duration is 15 minutes")
    .max(240, "Maximum duration is 240 minutes")
    .nullable()
    .optional(),
  meeting_provider: z.string().nullable(),
  is_video_conseil: z.boolean(),
  auto_record: z.boolean(),
  reason_for_visit: z.string().optional(),
  appointment_notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface Client {
  uuid: string;
  first_name: string;
  last_name: string;
}

interface Pet {
  id?: string;
  uuid?: string;
  name: string;
}

export const AppointmentForm = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(new Date());
  const [clients, setClients] = useState<Client[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const appointmentOptions = [
    { value: "common.checkup", label: t("common.checkup") },
    { value: "common.new_patient", label: t("common.new_patient") },
    { value: "common.vaccination", label: t("common.vaccination") },
    { value: "common.surgery_consult", label: t("common.surgery_consult") },
    { value: "zoom.consult", label: t("common.zoom_consult") },
    { value: "common.other", label: t("common.other") },
  ];

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(route("clients.all"));
        setClients(response.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      const fetchPets = async () => {
        try {
          const response = await axios.get(
            route("clients.pets", { uuid: selectedClient }),
          );
          setPets(response.data);
        } catch (error) {
          console.error("Error fetching pets:", error);
        }
      };
      fetchPets();
    } else {
      setPets([]);
    }
  }, [selectedClient]);

  const {
    control,
    handleSubmit,
    setValue,
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      appointment_date: format(startDate, "yyyy-MM-dd"),
      start_time: format(startDate, "HH:mm"),
      end_time: format(addMinutes(startDate, 45), "HH:mm"),
      client: "",
      pet: undefined,
      appointment_type: "",
      duration_minutes: 45,
      meeting_provider: "in_person",
      is_video_conseil: false,
      auto_record: false,
      reason_for_visit: "",
      appointment_notes: "",
    },
  });

  const appointmentType = watch("appointment_type");
  const isVideoConsult = watch("is_video_conseil");

  const handleSelectChange =
    (
      onChange: (value: string | undefined) => void,
      afterChange?: (value: string | undefined) => void,
    ) =>
    (selectedOption: SingleValue<Option>) => {
      const value = selectedOption ? selectedOption.value : undefined;
      onChange(value);
      if (afterChange) {
        afterChange(value);
      }
    };

  useEffect(() => {
    if (appointmentType === "zoom.consult") {
      setValue("is_video_conseil", true);
      setValue("meeting_provider", "zoom");
      setValue("auto_record", true);
    } else {
      setValue("is_video_conseil", false);
      setValue("meeting_provider", "in_person");
      setValue("auto_record", false);
    }
  }, [appointmentType, setValue]);

  useEffect(() => {
    const now = new Date();
    setStartDate(now);
    setValue("appointment_date", format(now, "yyyy-MM-dd"));
    setValue("start_time", format(now, "HH:mm"));
    setValue("end_time", format(addMinutes(now, 45), "HH:mm"));
  }, [setValue]);

  const onSubmit: SubmitHandler<AppointmentFormValues> = async (data) => {
    setIsSubmitting(true);

    const payload = {
      client_id: data.client,
      pet_id: data.pet ?? null,
      appointment_type: data.appointment_type,
      appointment_date: data.appointment_date,
      start_time: data.start_time,
      end_time: data.end_time,
      duration_minutes: data.duration_minutes,
      is_video_conseil: data.is_video_conseil,
      meeting_provider: data.meeting_provider,
      auto_record: data.auto_record,
      reason_for_visit: data.reason_for_visit,
      appointment_notes: data.appointment_notes,
    };

    try {
      const response = await axios.post<{
        appointment?: { video_join_url?: string | null };
        error?: string;
      }>(route("appointments.store"), payload, {
        headers: {
          Accept: "application/json",
        },
      });

      if (response.data?.appointment) {
        const newNow = new Date();
        reset({
          appointment_date: format(newNow, "yyyy-MM-dd"),
          start_time: format(newNow, "HH:mm"),
          end_time: format(addMinutes(newNow, 45), "HH:mm"),
          client: "",
          pet: undefined,
          appointment_type: "",
          duration_minutes: 45,
          meeting_provider: "in_person",
          is_video_conseil: false,
          auto_record: false,
          reason_for_visit: "",
          appointment_notes: "",
        });
        setStartDate(newNow);
        setValue("appointment_date", format(newNow, "yyyy-MM-dd"), {
          shouldValidate: true,
        });
        setValue("start_time", format(newNow, "HH:mm"), { shouldValidate: true });
        setValue("end_time", format(addMinutes(newNow, 45), "HH:mm"));
        setSelectedClient(null);
        setPets([]);
        window.dispatchEvent(new CustomEvent("appointment:created"));
        alert(t("appointments.scheduled_successfully"));
      }
    } catch (error: unknown) {
      console.error("Failed to schedule appointment", error);
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.error ?? t("appointments.scheduled_failed"),
        );
      } else {
        alert(t("appointments.scheduled_failed"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientOptions: Option[] = clients.map((client) => ({
    label: `${client.first_name} ${client.last_name}`,
    value: client.uuid,
  }));

  const petOptions: Option[] = pets.map((pet) => ({
    label: pet.name,
    value: pet.uuid ?? pet.id ?? "",
  }));

  return (
    <Card className="h-fit pb-4">
      <div className="px-4 py-3">
        <h2 className="font-medium tracking-wide text-gray-800 dark:text-dark-100">
          Schedule New Appointment
        </h2>
      </div>
      <div className="px-4 py-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DatePicker
            id="appointment_date"
            value={startDate}
            onChange={(dates) => {
              const [selected] = dates as Date[];
              if (!selected) {
                return;
              }

              setStartDate(selected);
              setValue("appointment_date", format(selected, "yyyy-MM-dd"), {
                shouldValidate: true,
              });
              setValue("start_time", format(selected, "HH:mm"), {
                shouldValidate: true,
              });
              const suggestedEnd = addMinutes(selected, 45);
              setValue("end_time", format(suggestedEnd, "HH:mm"));
            }}
            options={{
              enableTime: true,
              dateFormat: "Y-m-d H:i",
              minDate: new Date(),
            }}
            className="w-full"
          />
          <input type="hidden" {...register("appointment_date")} />
          <input type="hidden" {...register("start_time")} />
          <input type="hidden" {...register("end_time")} />
          <input type="hidden" {...register("meeting_provider")} />
          <input type="hidden" {...register("is_video_conseil")} />

          <Controller
            name="client"
            control={control}
            render={({ field }) => (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Client Name
                </label>
                <Select
                  {...field}
                  options={clientOptions}
                  onChange={handleSelectChange(field.onChange, (value) => {
                    setSelectedClient(value ?? null);
                    setValue("pet", undefined, { shouldValidate: true });
                  })}
                  value={clientOptions.find(
                    (option) => option.value === field.value,
                  )}
                  placeholder="Select a client"
                  isClearable
                  noOptionsMessage={() => "No clients found"}
                />
                {errors.client && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.client.message as string}
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            name="pet"
            control={control}
            render={({ field }) => (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Pet Name
                </label>
                <Select
                  {...field}
                  options={petOptions}
                  onChange={handleSelectChange(field.onChange)}
                  value={petOptions.find(
                    (option) => option.value === field.value,
                  )}
                  placeholder="Select a pet"
                  isClearable
                  isDisabled={!selectedClient}
                  noOptionsMessage={() => "No pets found for this client"}
                />
                {errors.pet && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.pet.message as string}
                  </p>
                )}
              </div>
            )}
          />

          <Controller
            name="appointment_type"
            control={control}
            render={({ field }) => (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Appointment Type
                </label>
                <Select
                  {...field}
                  options={appointmentOptions}
                  onChange={handleSelectChange(field.onChange)}
                  value={appointmentOptions.find(
                    (option) => option.value === field.value,
                  )}
                  placeholder="Select appointment type"
                  isClearable
                  noOptionsMessage={() => "No appointment types found"}
                />
                {errors.appointment_type && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.appointment_type.message as string}
                  </p>
                )}
              </div>
            )}
          />

          {isVideoConsult && (
            <div className="space-y-3 rounded-md border border-dashed border-emerald-400/60 bg-emerald-50 p-3 dark:border-emerald-500/40 dark:bg-emerald-500/5">
              <div className="flex items-center justify-between gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Auto-record Zoom meeting
                </label>
                <Controller
                  name="auto_record"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      checked={Boolean(field.value)}
                      onChange={(event) => field.onChange(event.target.checked)}
                      label={t("appointments.auto_record")}
                    />
                  )}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Duration (minutes)
                </label>
                <Controller
                  name="duration_minutes"
                  control={control}
                  render={({ field: { value, onChange, name, onBlur, ref } }) => {
                    const displayValue = value ?? "";
                    return (
                      <Input
                        name={name}
                        ref={ref}
                        onBlur={onBlur}
                        type="number"
                        min={15}
                        max={240}
                        step={15}
                        placeholder="45"
                        value={displayValue}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          onChange(
                            nextValue === ""
                              ? null
                              : Number.parseInt(nextValue, 10),
                          );
                        }}
                      />
                    );
                  }}
                />
                {errors.duration_minutes && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.duration_minutes.message as string}
                  </p>
                )}
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-200">
                {t("appointments.zoom_recording_notice")}
              </p>
            </div>
          )}

          <Controller
            name="reason_for_visit"
            control={control}
            render={({ field }) => {
              const { value, onChange, name, onBlur } = field;
              return (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Reason for visit
                  </label>
                  <Textarea
                    name={name}
                    onBlur={onBlur}
                    rows={3}
                    placeholder="Describe the reason for the appointment"
                    value={value ?? ""}
                    onChange={(event) => onChange(event.target.value)}
                  />
                  {errors.reason_for_visit && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.reason_for_visit.message as string}
                    </p>
                  )}
                </div>
              );
            }}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("appointments.scheduling") : t("common.schedule")}
          </Button>
        </form>

      </div>
    </Card>
  );
};
