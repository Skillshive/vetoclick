import { TbPalette, TbCoins } from "react-icons/tb";
import { 
  HomeIcon, 
  UserIcon as HiUserIcon, 
  UserGroupIcon,
  BellAlertIcon,
  CubeIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  ChatBubbleBottomCenterIcon
} from "@heroicons/react/24/outline";
import { ElementType } from "react";

import DashboardsIcon from "@/assets/dualicons/dashboards.svg?react";
import SettingIcon from "@/assets/dualicons/setting.svg?react";
import { PawPrint, Shield } from "lucide-react";

export const navigationIcons: Record<string, ElementType> = {
    dashboards: DashboardsIcon,
    settings: SettingIcon,
    "dashboards.home": HomeIcon,
    "settings.general": HiUserIcon,
    "settings.appearance": TbPalette,
    "settings.billing": TbCoins,
    "settings.notifications": BellAlertIcon,
    "settings.applications": CubeIcon,
    "settings.sessions": Shield,
    // Additional icons for menu items
    "users": UserGroupIcon,
    "animals": PawPrint,
    // Help section icons
    "settings.documentation": DocumentTextIcon,
    "settings.faq": QuestionMarkCircleIcon,
    "settings.ask": ChatBubbleBottomCenterIcon,
};
