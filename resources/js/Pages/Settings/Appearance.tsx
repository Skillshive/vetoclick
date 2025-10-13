import { Label, Radio, RadioGroup } from "@headlessui/react";
import clsx from "clsx";
import { toast } from "sonner";

// Local Imports
import { useThemeContext } from "@/contexts/theme/context";
import { Button, Card, Switch } from "@/components/ui";
import { useDidUpdate } from "@/hooks";
import { colors } from "@/constants/colors";
import MainLayout from "@/layouts/MainLayout";
import { Page } from "@/components/shared/Page";
import { useTranslation } from "@/hooks/useTranslation";

// ----------------------------------------------------------------------

const primaryColors = [
  "teal",
  "navyBlue", 
  "lightTurquoise",
  "deepTeal",
  "slateBlue",
] as const;

const lightColors = ["slate", "gray", "neutral"] as const;
const darkColors = ["mint", "navy", "mirage", "cinder", "black"] as const;

interface CardSkin {
  value: "shadow" | "bordered";
  labelKey: string;
}

const cardSkins: CardSkin[] = [
  {
    value: "shadow",
    labelKey: "common.appearance.shadow",
  },
  {
    value: "bordered", 
    labelKey: "common.appearance.bordered",
  },
];

const notificationPos = [
  { value: "top-left", labelKey: "common.appearance.top_left" },
  { value: "top-center", labelKey: "common.appearance.top_center" },
  { value: "top-right", labelKey: "common.appearance.top_right" },
  { value: "bottom-left", labelKey: "common.appearance.bottom_left" },
  { value: "bottom-center", labelKey: "common.appearance.bottom_center" },
  { value: "bottom-right", labelKey: "common.appearance.bottom_right" },
] as const;


export default function Appearance() {
  const theme = useThemeContext();
  const { t } = useTranslation();

  useDidUpdate(() => {
    const currentPosition = notificationPos.find(
      (pos) => pos.value === theme.notification?.position,
    );

    if (currentPosition) {
      toast(t("common.appearance.position_updated"), {
        description: t("common.appearance.position_updated_description", { position: t(currentPosition.labelKey) }),
        descriptionClassName: "text-gray-600 dark:text-dark-200 text-xs mt-0.5",
      });
    }
  }, [theme.notification?.position]);

  useDidUpdate(() => {
    for (let i = 0; i < 3; i++) toast(t("common.appearance.this_is_a_toast"));
  }, [theme.notification?.isExpanded]);

  return (
    <MainLayout>
      
      <Page title={t("common.appearance.title")}>
        <div className="transition-content grid w-full grid-rows-[auto_1fr] px-(--margin-x) pb-8">
    <Card className="px-8 py-6 mt-4">
    <div className="w-full max-w-3xl 2xl:max-w-5xl">
      <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800">
        {t("common.appearance.title")}
      </h5>
      <p className="dark:text-dark-200 mt-0.5 text-sm text-balance text-gray-500">
        {t("common.appearance.description")}
      </p>
      <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />

      <div className="space-y-8">
        <div>
          <div>
            <p className="dark:text-dark-100 text-base font-medium text-gray-800">
              {t("common.appearance.theme")}
            </p>
            <p className="mt-0.5">
              {t("common.appearance.theme_description")}
            </p>
          </div>
          <RadioGroup
            value={theme.themeMode}
            onChange={theme.setThemeMode}
            className="mt-4"
          >
            <Label className="sr-only">{t("common.appearance.theme_mode_description")}</Label>
            <div className="mt-2 flex flex-wrap gap-6">
              <Radio
                value="system"
                className="w-44 cursor-pointer outline-hidden"
              >
                {({ checked }) => (
                  <>
                    <div
                      className={clsx(
                        "bg-dark-900 relative overflow-hidden rounded-lg border-2 dark:border-transparent",
                        checked &&
                          "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 ring-2 ring-offset-2 ring-offset-white transition-all",
                      )}
                    >
                      <div
                        style={{
                          clipPath: "polygon(50% 50%, 100% 0, 0 0, 0% 100%)",
                        }}
                        className="w-full space-y-2 bg-gray-50 p-1.5"
                      >
                        <div className="w-full space-y-2 rounded-sm bg-white p-2 shadow-xs">
                          <div className="bg-gray-150 h-2 w-9/12 rounded-lg"></div>
                          <div className="bg-gray-150 h-2 w-11/12 rounded-lg"></div>
                        </div>
                        <div className="flex items-center space-x-2 rounded-sm bg-white p-2 shadow-xs">
                          <div className="bg-gray-150 size-4 shrink-0 rounded-full"></div>
                          <div className="bg-gray-150 h-2 w-full rounded-lg"></div>
                        </div>
                        <div className="flex items-center space-x-2 rounded-sm bg-white p-2 shadow-xs">
                          <div className="bg-gray-150 size-4 shrink-0 rounded-full"></div>
                          <div className="bg-gray-150 h-2 w-9/12 rounded-lg"></div>
                        </div>
                      </div>
                      <div
                        style={{
                          clipPath:
                            "polygon(50% 50%, 100% 0, 100% 100%, 0% 100%)",
                        }}
                        className="absolute inset-0 space-y-2 p-1.5"
                      >
                        <div className="bg-dark-700 w-full space-y-2 rounded-sm p-2 shadow-xs">
                          <div className="bg-dark-400 h-2 w-9/12 rounded-lg"></div>
                          <div className="bg-dark-400 h-2 w-11/12 rounded-lg"></div>
                        </div>
                        <div className="bg-dark-700 flex items-center space-x-2 rounded-sm p-2 shadow-xs">
                          <div className="bg-dark-400 size-4 shrink-0 rounded-full"></div>
                          <div className="bg-dark-400 h-2 w-full rounded-lg"></div>
                        </div>
                        <div className="bg-dark-700 flex items-center space-x-2 rounded-sm p-2 shadow-xs">
                          <div className="bg-dark-400 size-4 shrink-0 rounded-full"></div>
                          <div className="bg-dark-400 h-2 w-9/12 rounded-lg"></div>
                        </div>
                      </div>
                    </div>

                    <p className="mt-1.5 text-center">{t("common.appearance.system")}</p>
                  </>
                )}
              </Radio>
              <Radio
                value="light"
                className="w-44 cursor-pointer outline-hidden"
              >
                {({ checked }) => (
                  <>
                    <div
                      className={clsx(
                        "relative overflow-hidden rounded-lg border-2 dark:border-transparent",
                        checked &&
                          "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 ring-2 ring-offset-2 ring-offset-white transition-all",
                      )}
                    >
                      <div className="w-full space-y-2 bg-gray-50 p-1.5">
                        <div className="w-full space-y-2 rounded-sm bg-white p-2 shadow-xs">
                          <div className="bg-gray-150 h-2 w-9/12 rounded-lg"></div>
                          <div className="bg-gray-150 h-2 w-11/12 rounded-lg"></div>
                        </div>
                        <div className="flex items-center space-x-2 rounded-sm bg-white p-2 shadow-xs">
                          <div className="bg-gray-150 size-4 shrink-0 rounded-full"></div>
                          <div className="bg-gray-150 h-2 w-full rounded-lg"></div>
                        </div>
                        <div className="flex items-center space-x-2 rounded-sm bg-white p-2 shadow-xs">
                          <div className="bg-gray-150 size-4 shrink-0 rounded-full"></div>
                          <div className="bg-gray-150 h-2 w-9/12 rounded-lg"></div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-1.5 text-center">{t("common.appearance.light")}</p>
                  </>
                )}
              </Radio>
              <Radio
                value="dark"
                className="w-44 cursor-pointer outline-hidden"
              >
                {({ checked }) => (
                  <>
                    <div
                      className={clsx(
                        "bg-dark-900 relative overflow-hidden rounded-lg border border-transparent",
                        checked &&
                          "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 ring-2 ring-offset-2 ring-offset-white transition-all",
                      )}
                    >
                      <div className="bg-dark-900 w-full space-y-2 p-1.5">
                        <div className="bg-dark-700 w-full space-y-2 rounded-sm p-2 shadow-xs">
                          <div className="bg-dark-400 h-2 w-9/12 rounded-lg"></div>
                          <div className="bg-dark-400 h-2 w-11/12 rounded-lg"></div>
                        </div>
                        <div className="bg-dark-700 flex items-center space-x-2 rounded-sm p-2 shadow-xs">
                          <div className="bg-dark-400 size-4 shrink-0 rounded-full"></div>
                          <div className="bg-dark-400 h-2 w-full rounded-lg"></div>
                        </div>
                        <div className="bg-dark-700 flex items-center space-x-2 rounded-sm p-2 shadow-xs">
                          <div className="bg-dark-400 size-4 shrink-0 rounded-full"></div>
                          <div className="bg-dark-400 h-2 w-9/12 rounded-lg"></div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-1.5 text-center">{t("common.appearance.dark")}</p>
                  </>
                )}
              </Radio>
            </div>
          </RadioGroup>
        </div>

        <div>
          <div>
            <p className="dark:text-dark-100 text-base font-medium text-gray-800">
              {t("common.appearance.primary_color")}
            </p>
            <p className="mt-0.5">
              {t("common.appearance.primary_color_description")}
            </p>
          </div>
          <RadioGroup
            value={theme.primaryColorScheme?.name || "teal"}
            onChange={(color) => theme.setPrimaryColorScheme?.(color)}
            className="mt-2"
          >
            <Label className="sr-only">{t("common.appearance.choose_primary_theme_color")}</Label>
            <div className="mt-2 flex w-fit flex-wrap gap-4 sm:gap-5">
              {primaryColors.map((color) => (
                <Radio
                  key={color}
                  value={color}
                  className={({ checked }) =>
                    clsx(
                      "flex h-14 w-16 cursor-pointer items-center justify-center rounded-lg border outline-hidden",
                      checked
                        ? "border-primary-500"
                        : "dark:border-dark-500 border-gray-200",
                    )
                  }
                >
                  {({ checked }) => (
                    <div
                      className={clsx(
                        "mask is-diamond size-6 transition-all",
                        checked && "scale-110 rotate-45",
                      )}
                      style={{
                        backgroundColor: colors[color]?.[500] || colors.teal[500],
                      }}
                    ></div>
                  )}
                </Radio>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div>
          <div>
            <p className="dark:text-dark-100 text-base font-medium text-gray-800">
              {t("common.appearance.light_color_scheme")}
            </p>
            <p className="mt-0.5">
              {t("common.appearance.light_color_scheme_description")}
            </p>
          </div>
          <RadioGroup
            value={theme.lightColorScheme?.name || "slate"}
            onChange={(color) => theme.setLightColorScheme?.(color)}
            className="mt-4"
          >
            <Label className="sr-only">{t("common.appearance.theme_light_mode_color_scheme")}</Label>
            <div className="mt-2 flex flex-wrap gap-4">
              {lightColors.map((color) => (
                <Radio
                  key={color}
                  value={color}
                  className="w-32 cursor-pointer outline-hidden"
                >
                  {({ checked }) => (
                    <>
                      <div
                        className={clsx(
                          "relative overflow-hidden rounded-lg border-2 dark:border-transparent",
                          checked &&
                            "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 ring-2 ring-offset-2 ring-offset-white transition-all",
                        )}
                      >
                        <div
                          className="w-full space-y-2 p-1.5"
                          style={{ backgroundColor: colors[color]?.[200] || colors.slate[200] }}
                        >
                          <div className="w-full space-y-2 rounded-sm bg-white p-2 shadow-xs">
                            <div
                              className="h-2 w-9/12 rounded-lg"
                              style={{ backgroundColor: colors[color]?.[400] || colors.slate[400] }}
                            ></div>
                            <div
                              className="h-2 w-11/12 rounded-lg"
                              style={{ backgroundColor: colors[color]?.[400] || colors.slate[400] }}
                            ></div>
                          </div>
                          <div className="flex items-center space-x-2 rounded-sm bg-white p-2 shadow-xs">
                            <div
                              className="size-4 shrink-0 rounded-full"
                              style={{ backgroundColor: colors[color]?.[400] || colors.slate[400] }}
                            ></div>
                            <div
                              className="h-2 w-full rounded-lg"
                              style={{ backgroundColor: colors[color]?.[400] || colors.slate[400] }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <p className="mt-1.5 text-center capitalize">{color}</p>
                    </>
                  )}
                </Radio>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div>
          <div>
            <p className="dark:text-dark-100 text-base font-medium text-gray-800">
              {t("common.appearance.dark_color_scheme")}
            </p>
            <p className="mt-0.5">
              {t("common.appearance.dark_color_scheme_description")}
            </p>
          </div>
          <RadioGroup
            value={theme.darkColorScheme?.name || "cinder"}
            onChange={(color) => theme.setDarkColorScheme?.(color)}
            className="mt-4"
          >
              <Label className="sr-only">{t("common.appearance.dark_mode_color_schemes")}</Label>
            <div className="mt-2 flex flex-wrap gap-4">
              {darkColors.map((color) => (
                <Radio
                  key={color}
                  value={color}
                  className="w-32 cursor-pointer outline-hidden"
                >
                  {({ checked }) => (
                    <>
                      <div
                        className={clsx(
                          "relative overflow-hidden rounded-lg",
                          checked &&
                            "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 ring-2 ring-offset-2 ring-offset-white transition-all",
                        )}
                      >
                        <div
                          className="w-full space-y-2 p-1.5"
                          style={{ backgroundColor: colors[color]?.[900] || colors.cinder[900] }}
                        >
                          <div
                            className="w-full space-y-2 rounded-sm p-2 shadow-xs"
                            style={{ backgroundColor: colors[color]?.[700] || colors.cinder[700] }}
                          >
                            <div
                              className="h-2 w-9/12 rounded-lg"
                              style={{ backgroundColor: colors[color]?.[400] || colors.cinder[400] }}
                            ></div>
                            <div
                              className="h-2 w-11/12 rounded-lg"
                              style={{ backgroundColor: colors[color]?.[400] || colors.cinder[400] }}
                            ></div>
                          </div>
                          <div
                            className="flex items-center space-x-2 rounded-sm p-2 shadow-xs"
                            style={{ backgroundColor: colors[color]?.[700] || colors.cinder[700] }}
                          >
                            <div
                              className="size-4 shrink-0 rounded-full"
                              style={{ backgroundColor: colors[color]?.[400] || colors.cinder[400] }}
                            ></div>
                            <div
                              className="h-2 w-full rounded-lg"
                              style={{ backgroundColor: colors[color]?.[400] || colors.cinder[400] }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <p className="mt-1.5 text-center capitalize">{color}</p>
                    </>
                  )}
                </Radio>
              ))}
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="dark:bg-dark-500 my-6 h-px bg-gray-200"></div>
      
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <p className="my-auto">{t("common.appearance.card_skin")}</p>
          <div className="mt-1.5 flex flex-1 md:col-span-2 md:mt-0">
            <select
              value={theme.cardSkin || "shadow"}
              onChange={(e) => theme.setCardSkin?.(e.target.value as "shadow" | "bordered")}
              className="w-full rounded-lg border border-gray-300 dark:border-dark-450 px-3 py-2 bg-white dark:bg-dark-800 text-gray-800 dark:text-dark-100"
            >
              {cardSkins.map((skin) => (
                <option key={skin.value} value={skin.value}>
                  {t(skin.labelKey)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3">
          <p className="my-auto">{t("common.appearance.theme_chrome_mode")}</p>
          <div className="dark:border-dark-450 mt-1.5 flex flex-1 items-center justify-between space-x-2 rounded-lg border border-gray-300 px-3 py-2 md:col-span-2 md:mt-0">
            <p className="dark:text-dark-100 text-gray-800">{t("common.appearance.monochrome_mode")}</p>
            <Switch
              checked={theme.isMonochrome || false}
              onChange={(e) => theme.setMonochromeMode?.(e.target.checked)}
            />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <Button color="primary" onClick={theme.resetTheme}>
          {t("common.appearance.reset_theme")}
        </Button>
      </div>
      </div>
    </Card>
      </div>
      </Page>
    </MainLayout>
  );
}