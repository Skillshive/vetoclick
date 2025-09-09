// Import Dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, Resolver, useForm } from "react-hook-form";
import { DocumentPlusIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import type { Delta as DeltaType } from "quill";

// Local Imports
import { schema, type SchemaType } from "./schema";
import { Page } from "@/components/shared/Page";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { Delta, TextEditor } from "@/components/shared/form/TextEditor";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { Tags } from "@/components/shared/form/Tags";
import { CoverImageUpload } from "@/components/shared/form/CoverImageUpload";
import MainLayout from "@/layouts/MainLayout";
import { ContextualHelp } from "@/components/shared/ContextualHelp";
import { useTranslation } from "@/hooks/useTranslation";

// ----------------------------------------------------------------------

const initialState = {
  title: "manar",
  caption: "",
  content: new Delta(),
  cover: "",
  category_id: "",
  author_id: "",
  tags: [],
  publish_date: null,
  meta: {
    title: "",
    description: "",
    keywords: [],
  },
};

const editorModules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["blockquote", "code-block"],
    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }], // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    [{ direction: "rtl" }], // text direction
    [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }, "image"],
    ["clean"], // remove formatting button
  ],
};

const categories = [
  {
    id: "1",
    label: "Accessories",
  },
  {
    id: "2",
    label: "Digital",
  },
  {
    id: "3",
    label: "Home",
  },
  {
    id: "4",
    label: "Technology",
  },
];

const NewPostFrom = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<SchemaType>({
    resolver: yupResolver(schema) as Resolver<SchemaType>,
    defaultValues: initialState as unknown as SchemaType,
  });

  
  const {t}=useTranslation();
  const onSubmit = (data: any) => {
    console.log(data);
    toast("New Post Published. Now you can add new one", {
      invert: true,
    });
    reset();
  };

  return (
            <MainLayout>
    <Page title={t("common.new_post_form")}>
      <div className="transition-content px-(--margin-x) pb-6">
        <div className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6">
          <div className="flex items-center gap-1">
            <DocumentPlusIcon className="size-6" />
            <h2 className="dark:text-dark-50 line-clamp-1 text-xl font-medium text-gray-700">
             {t('common.new_post')}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button className="min-w-[7rem]" variant="outlined">
              {t('common.preview')}
            </Button>
            <Button
              className="min-w-[7rem]"
              color="primary"
              type="submit"
              form="new-post-form"
            >
                            {t('common.save')}
            </Button>
          </div>
        </div>
        <form
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          id="new-post-form"
        >
          <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
            <div className="col-span-12 lg:col-span-8">
              <Card className="p-4 sm:px-5">
                <h3 className="dark:text-dark-100 text-base font-medium text-gray-800">
                                {t('common.general_information')}
                </h3>
                <div className="mt-5 space-y-5">
                  <Input
                    label={t('common.title')}
                    placeholder={t('common.enter_post_title')}
                    {...register("title")}
                    error={errors?.title?.message}
                  />

                  <Input
                    label={t('common.caption')}
                    placeholder={t('common.enter_post_caption')}
                    {...register("caption")}
                    error={errors?.caption?.message}
                  />

                  <div className="flex flex-col">
                    <span>{t('common.description')}</span>
                    <Controller
                      control={control}
                      name="content"
                      render={({ field: { value, onChange, ...rest } }) => (
                        <TextEditor
                          value={value as DeltaType}
                          onChange={(val) => onChange(val)}
                          placeholder={t('common.enter_post_description')}
                          className="mt-1.5 [&_.ql-editor]:max-h-80 [&_.ql-editor]:min-h-[12rem]"
                          modules={editorModules}
                          error={errors?.content?.message}
                          {...rest}
                        />
                      )}
                    />
                  </div>

                  <Controller
                    render={({ field: { onChange, value, ...rest } }) => (
                      <CoverImageUpload
                        classNames={{
                          box: "mt-1.5",
                        }}
                        label={t('common.cover_image')}
                        error={errors?.cover?.message}
                        value={value as File}
                        onChange={onChange}
                        {...rest}
                      />
                    )}
                    name="cover"
                    control={control}
                  />
                </div>
              </Card>
            </div>
            <div className="col-span-12 space-y-4 sm:space-y-5 lg:col-span-4 lg:space-y-6">
              <Card className="space-y-5 p-4 sm:px-5">
                <Controller
                  render={({ field }) => (
                    <Listbox
                      data={categories}
                      value={
                        categories.find((cat) => cat.id === field.value) || null
                      }
                      onChange={(val) => field.onChange(val.id)}
                      name={field.name}
                      label={t('common.category')}
                      placeholder={t('common.choose_category')}
                      displayField="label"
                      error={errors?.category_id?.message}
                    />
                  )}
                  control={control}
                  name="category_id"
                />

                <Controller
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Tags
                      value={
                        value?.map((val, i) => {
                          return { id: String(i), value: String(val) };
                        }) || []
                      }
                      placeholder="Enter Tags"
                      onChange={(val) => onChange(val.map((i) => i.value))}
                      error={errors?.tags?.message}
                      label="Tags"
                      {...rest}
                    />
                  )}
                  control={control}
                  name="tags"
                />
              </Card>

              <Card className="p-4 sm:px-5">
                <h6 className="dark:text-dark-100 flex space-x-1.5 text-base font-medium text-gray-800">
                  <span>SEO Meta Data</span>
                  <ContextualHelp
                    title="SEO Meta Data"
                    anchor={{ to: "bottom", gap: 8 }}
                    content={
                      <p>
                        SEO data is relevant information that your company needs
                        to be aware of so that your business can take full
                        advantage of all the opportunities presented with this
                        type of strategy.
                      </p>
                    }
                  />
                </h6>

                <div className="mt-3 space-y-5">
                  <Input
                    {...register("meta.title")}
                    label="Meta title"
                    error={errors?.meta?.title?.message}
                    placeholder="Enter Meta Title"
                  />
                  <Textarea
                    rows={4}
                    {...register("meta.description")}
                    label="Meta Description"
                    error={errors?.meta?.description?.message}
                    placeholder="Enter Meta Description"
                  />
                  <Controller
                    render={({ field }) => (
                      <Tags
                        placeholder="Enter Meta Keywords"
                        label="Meta Keywords"
                        value={
                          field.value?.map((val, i) => {
                            return { id: String(i), value: String(val) };
                          }) || []
                        }
                        onChange={(val) =>
                          field.onChange(val.map((i) => i.value))
                        }
                        error={errors?.meta?.keywords?.message}
                      />
                    )}
                    control={control}
                    name="meta.keywords"
                  />
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </Page>
            </MainLayout>
  );
};

export default NewPostFrom;
