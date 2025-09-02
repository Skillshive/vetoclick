// Import Dependencies
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { HiPencil } from "react-icons/hi";

// Local Imports
import { Page } from "@/components/shared/Page";
import { PreviewImg } from "@/components/shared/PreviewImg";
import { Avatar, Button, Input, Upload, Card } from "@/components/ui";
import { useForm } from "@inertiajs/react";
import { useTranslation } from "@/hooks/useTranslation";
import MainLayout from "@/layouts/MainLayout";
import { useToast } from "@/components/common/Toast/ToastContext";
import { getImageUrl } from "@/utils/imageHelper";
import Breeds from "./Breeds/Index";

interface Species {
  uuid: string;
  name: string;
  description?: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

interface SpeciesEditPageProps {
  species: Species;
}

export default function SpeciesEdit({ species }: SpeciesEditPageProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [avatar, setAvatar] = useState<File | null>(null);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: species.name || "",
    description: species.description || "",
    image: null as File | null,
  });

  // Debug: Log the species data to see what's being received
  console.log('Species data received:', species);
  console.log('Form data:', data);

  const imageUrl = getImageUrl(species.image || null, "/assets/default/species-placeholder.png");

  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: { name?: string; description?: string } = {};

    if (!data.name.trim()) {
      newErrors.name = t('validation.required', { attribute: t('common.species_name') });
    }

    if (data.name.length > 255) {
      newErrors.name = t('validation.max.string', { attribute: t('common.species_name'), max: 255 });
    }

    if (data.description && data.description.length > 1000) {
      newErrors.description = t('validation.max.string', { attribute: t('common.species_description'), max: 1000 });
    }

    setValidationErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    post(route('species.update', species.uuid), {
      onSuccess: () => {
        setValidationErrors({});
        showToast({
          type: 'success',
          message: t('common.species_updated'),
        });
      },
      onError: (errors) => {
        showToast({
          type: 'error',
          message: t('common.error_occurred'),
        });
      },
    });
  };

  return (
    <MainLayout>
      <Page title={`${t('common.edit_species')} - ${species.name}`}>
              <div className="transition-content px-(--margin-x) pb-6 my-5">
                  <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
                    <div className="col-span-12 lg:col-span-8">
                      <Card className="p-4 sm:px-5">
              <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800">
                {t('common.edit_species')}
              </h5>
              <p className="dark:text-dark-200 mt-0.5 text-sm text-balance text-gray-500">
                {t('common.edit_species_info')}
              </p>
              <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />

              <form onSubmit={handleSubmit}>
                <div className="mt-5 grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Avatar Column */}
                  <div className="lg:col-span-1 flex flex-col items-center space-y-3">
                    <Avatar
                      size={24}
                      imgComponent={PreviewImg}
                      imgProps={{ file: avatar } as any}
                      src={data.image ? URL.createObjectURL(data.image) : imageUrl}
                      classNames={{
                        root: "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 rounded-xl ring-offset-[3px] ring-offset-white transition-all hover:ring-3",
                        display: "rounded-xl",
                      }}
                      indicator={
                        <div className="dark:bg-dark-700 absolute right-0 bottom-0 -m-1 flex items-center justify-center rounded-full bg-white">
                          {avatar ? (
                            <Button
                              onClick={() => {
                                setAvatar(null);
                                setData('image', null);
                              }}
                              isIcon
                              className="size-6 rounded-full"
                            >
                              <XMarkIcon className="size-4" />
                            </Button>
                          ) : (
                            <Upload
                              name="avatar"
                              onChange={(files) => {
                                setAvatar(files[0]);
                                setData('image', files[0]);
                              }}
                              accept="image/*"
                            >
                              {({ ...props }) => (
                                <Button isIcon className="size-6 rounded-full" {...props}>
                                  <HiPencil className="size-3.5" />
                                </Button>
                              )}
                            </Upload>
                          )}
                        </div>
                      }
                    />
                  </div>

                  {/* Form Fields Column */}
                  <div className="lg:col-span-3 space-y-4">
                    <Input
                      placeholder={t('common.species_name')}
                      label={t('common.species_name')}
                      className="rounded-xl"
                      value={data.name}
                      onChange={(e) => {
                        setData('name', e.target.value);
                        if (validationErrors.name) {
                          setValidationErrors(prev => ({ ...prev, name: undefined }));
                        }
                      }}
                      required={true}
                      error={errors.name || validationErrors.name}
                    />

                    <div>
                      <label className="dark:text-dark-100 block text-sm font-medium text-gray-700">
                        {t('common.species_description')}
                      </label>
                      <textarea
                        placeholder={t('common.species_description')}
                        className="dark:bg-dark-900 dark:border-dark-600 dark:text-dark-100 mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        rows={4}
                        value={data.description}
                        onChange={(e) => {
                          setData('description', e.target.value);
                          if (validationErrors.description) {
                            setValidationErrors(prev => ({ ...prev, description: undefined }));
                          }
                        }}
                      />
                      {(errors.description || validationErrors.description) && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.description || validationErrors.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="dark:bg-dark-500 my-7 h-px bg-gray-200" />

                <div className="mt-8 flex justify-end space-x-3">
                  <Button
                    className="min-w-[7rem]"
                    onClick={() => {
                      reset();
                      setValidationErrors({});
                    }}
                    type="button"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    className="min-w-[7rem]"
                    color="primary"
                    type="submit"
                    disabled={processing || !data.name.trim()}
                  >
                    {processing ? t('common.updating') : t('common.update')}
                  </Button>
                </div>
              </form>
                      </Card>
                    </div>
                    <div className="col-span-12 space-y-4 sm:space-y-5 lg:col-span-4 lg:space-y-6">
                      <Card className="space-y-5 p-4 sm:px-5">
                        <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800 my-0">
                {t('common.store_breed')}
              </h5>
              <p className="dark:text-dark-200 mt-0.5 text-sm text-balance text-gray-500">
                {t('common.store_breed_info')}
              </p>
              <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />
                      <form>
 <Avatar
                      size={24}
                      imgComponent={PreviewImg}
                      imgProps={{ file: avatar } as any}
                      src={data.image ? URL.createObjectURL(data.image) : imageUrl}
                      classNames={{
                        root: "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 rounded-xl ring-offset-[3px] ring-offset-white transition-all hover:ring-3",
                        display: "rounded-xl",
                      }}
                      indicator={
                        <div className="dark:bg-dark-700 absolute right-0 bottom-0 -m-1 flex items-center justify-center rounded-full bg-white">
                          {avatar ? (
                            <Button
                              onClick={() => {
                                setAvatar(null);
                                setData('image', null);
                              }}
                              isIcon
                              className="size-6 rounded-full"
                            >
                              <XMarkIcon className="size-4" />
                            </Button>
                          ) : (
                            <Upload
                              name="avatar"
                              onChange={(files) => {
                                setAvatar(files[0]);
                                setData('image', files[0]);
                              }}
                              accept="image/*"
                            >
                              {({ ...props }) => (
                                <Button isIcon className="size-6 rounded-full" {...props}>
                                  <HiPencil className="size-3.5" />
                                </Button>
                              )}
                            </Upload>
                          )}
                        </div>
                      }
                    />
                  {/* Form Fields Column */}
                  <div className="lg:col-span-3 space-y-4">
                    <Input
                      placeholder={t('common.breed_name')}
                      label={t('common.breed_name')}
                      className="rounded-xl"
                      // value={data.name}
                      // onChange={(e) => {
                      //   setData('name', e.target.value);
                      //   if (validationErrors.name) {
                      //     setValidationErrors(prev => ({ ...prev, name: undefined }));
                      //   }
                      // }}
                      required={true}
                      // error={errors.name || validationErrors.name}
                    />

                    <div>
                      <label className="dark:text-dark-100 block text-sm font-medium text-gray-700">
                        {t('common.breed_description')}
                      </label>
                      <textarea
                        placeholder={t('common.breed_description')}
                        className="dark:bg-dark-900 dark:border-dark-600 dark:text-dark-100 mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        rows={4}
                        // value={data.description}
                        // onChange={(e) => {
                        //   setData('description', e.target.value);
                        //   if (validationErrors.description) {
                        //     setValidationErrors(prev => ({ ...prev, description: undefined }));
                        //   }
                        // }}
                      />
                      {(errors.description || validationErrors.description) && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.description || validationErrors.description}
                        </p>
                      )}
                  </div>
                </div>

                <div className="dark:bg-dark-500 my-7 h-px bg-gray-200" />

                <div className="mt-8 flex justify-end space-x-3">
                  <Button
                    className="min-w-[7rem]"
                    onClick={() => {
                      reset();
                      setValidationErrors({});
                    }}
                    type="button"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    className="min-w-[7rem]"
                    color="primary"
                    type="submit"
                    disabled={processing || !data.name.trim()}
                  >
                    {processing ? t('common.updating') : t('common.update')}
                  </Button>
                </div>
              </form>
                      </Card>
                    </div>
                  </div>
              </div>


              <Breeds/>
      </Page>
    </MainLayout>
  );
}
