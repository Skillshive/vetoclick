import twColors from "tailwindcss/colors";

const colors = {
  gray: {
    ...twColors.gray,
    150: "#EBEDF0",
  },
  slate: {
    ...twColors.slate,
    150: "#E9EEF5",
  },
  neutral: {
    ...twColors.neutral,
    150: "#EDEDED",
  },
  navy: {
    50: "#E7E9EF",
    100: "#C2C9D6",
    200: "#A5AFC4",
    300: "#6D7EA1",
    400: "#5C6B8A",
    450: "#465675",
    500: "#384766",
    600: "#313E59",
    700: "#24314A",
    750: "#222E45",
    800: "#202B40",
    900: "#182030",
  },
  mirage: {
    50: "#DDE5F5",
    100: "#B4BFD9",
    200: "#9EAAC4",
    300: "#6C7C9E",
    400: "#3D4E70",
    450: "#293859",
    500: "#1E2B47",
    600: "#1A2640",
    700: "#101A2E",
    750: "#0F1729",
    800: "#0C1221",
    900: "#050A16",
  },
  black: {
    50: "#EBEBED",
    100: "#D9D9DE",
    200: "#C5C5CC",
    300: "#93939C",
    400: "#4A4A4F",
    450: "#333338",
    500: "#242428",
    600: "#1F1F21",
    700: "#131314",
    750: "#0C0C0D",
    800: "#080809",
    900: "#000000",
  },
  mint: {
    50: "#E1E5EA",
    100: "#C5CCD3",
    200: "#A0ABB6",
    300: "#70838F",
    400: "#506877",
    450: "#384954",
    500: "#2A3942",
    600: "#242F38",
    700: "#152129",
    750: "#111B22",
    800: "#0D161C",
    900: "#0A1014",
  },
  cinder: {
    50: "#E6E7EB",
    100: "#D0D2DB",
    200: "#B7BAC4",
    300: "#838794",
    400: "#4C4F57",
    450: "#383A41",
    500: "#2A2C32",
    600: "#232429",
    700: "#1C1D21",
    750: "#1A1B1F",
    800: "#15161A",
    900: "#0E0F11",
  },
  indigo: twColors.indigo,
  blue: twColors.blue,
  green: twColors.green,
  amber: twColors.amber,
  purple: twColors.purple,
  rose: twColors.rose,
  teal: {
    50: "#F0FDFA",
    100: "#CCFBF1",
    200: "#99F6E4",
    300: "#5EEAD4",
    400: "#2DD4BF",
    500: "#5DBFB3",
    600: "#0D9488",
    700: "#0F766E",
    800: "#115E59",
    900: "#134E4A",
  },
  navyBlue: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#1E2A3A",
    600: "#1A2332",
    700: "#161D2A",
    800: "#121722",
    900: "#0E111A",
  },
  lightTurquoise: {
    50: "#F0FDFC",
    100: "#CCFBF1",
    200: "#99F6E4",
    300: "#5EEAD4",
    400: "#2DD4BF",
    500: "#7DD4CA",
    600: "#0D9488",
    700: "#0F766E",
    800: "#115E59",
    900: "#134E4A",
  },
  deepTeal: {
    50: "#F0FDFA",
    100: "#CCFBF1",
    200: "#99F6E4",
    300: "#5EEAD4",
    400: "#2DD4BF",
    500: "#3A9B8E",
    600: "#0D9488",
    700: "#0F766E",
    800: "#115E59",
    900: "#134E4A",
  },
  slateBlue: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#2C3E50",
    600: "#1E293B",
    700: "#0F172A",
    800: "#0C1220",
    900: "#0A0F1A",
  },
  primary: {
    50: "#F0FCFA",
    100: "#D1F4F0",
    200: "#A3E9E1",
    300: "#75DDD2",
    400: "#47D2C3",
    500: "#4DB9AD",
    600: "#15A093",
    700: "#117972",
    800: "#0D5251",
    900: "#092A30",
  },
  secondary: {
    50: "#F0F2F5",
    100: "#D9DDE4",
    200: "#B3BBC9",
    300: "#8D99AE",
    400: "#677793",
    500: "#1B2441",
    600: "#344461",
    700: "#27334A",
    800: "#1A2233",
    900: "#0D111C",
  },
  variants: {
    "secondary-lighter": "#FF75DF",
    "secondary-light": "#FF2ECF",
    secondary: "#E000AD",
    "secondary-darker": "#B8008C",
    "info-lighter": twColors.sky["400"],
    "info-light": twColors.sky["500"],
    info: twColors.sky["600"],
    "info-darker": twColors.sky["700"],
    "success-lighter": twColors.emerald["400"],
    "success-light": twColors.emerald["500"],
    success: twColors.emerald["600"],
    "success-darker": twColors.emerald["700"],
    "warning-lighter": "#FFBA42",
    "warning-light": "#FFA71A",
    warning: "#F59200",
    "warning-darker": "#DB7C00",
    "error-lighter": "#FF8A5C",
    "error-light": "#FF6933",
    error: "#FF4F1A",
    "error-darker": "#E52E00",
  },
};

export { twColors, colors };

export const Vetoclick_COLORS = {
  primary: "#1B2441",      // Dark Navy Blue
  secondary: "#4DB9AD",    // Teal
  white: "#ffffff",
  black: "#000000"
};

export const Vetoclick_INITIALS_COLORS = [
  "#1BA3B8", // Primary dark teal
  "#17959F", // Darker teal variation
  "#0F8A9D", // Deep teal shadows
  "#0D7A8A", // Darkest teal
  "#22B0C5", // Brighter teal
  "#2BC0D8", // Light bright teal
  "#35CAE0", // Lighter cyan
  "#7BC4A4", // Medium mint green
  "#6FB896", // Slightly darker mint
  "#84CEB2", // Light mint green
  "#A8D5C4", // Pale mint
  "#95CDB0", // Medium sage green
  "#B8E0D0", // Light sage
  "#C5E8D8", // Very light mint
  "#D2F0E4", // Pale mint highlight
  "#E8F7F1", // Near-white mint
  "#F0FAF6", // Lightest mint tint
  "#FFFFFF", // Pure white
  "#F8FCFA", // Off-white with mint tint
  "#FAFDFB", // Subtle off-white
  "#FCFEFE", // Near-white
  "#1F9DB4", // Mid-range teal
  "#269FB8", // Teal variation
  "#5CB89A", // Green-teal transition
  "#6CC0A6", // Light green-teal
  "#78C6A8", // Mint-teal blend
  "#8CCFB4", // Light mint-teal
  "#9DD6C0", // Pale mint-teal
  "#AEDCCA", // Very light mint-teal
  "#BEE3D4", // Lightest mint-teal
];
