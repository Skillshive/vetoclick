import { TbPalette } from "react-icons/tb";
import { HomeIcon, UserIcon as HiUserIcon, CalendarIcon, CogIcon, UserGroupIcon, BuildingOfficeIcon, DocumentTextIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { ElementType } from "react";

import DashboardsIcon from "@/assets/dualicons/dashboards.svg?react";
import SettingIcon from "@/assets/dualicons/setting.svg?react";

export const navigationIcons: Record<string, ElementType> = {
    dashboards: DashboardsIcon,
    settings: SettingIcon,
    "dashboards.home": HomeIcon,
    "settings.general": HiUserIcon,
    "settings.appearance": TbPalette,
    // Additional icons for menu items
    "users": UserGroupIcon,
    "calendar": CalendarIcon,
    "cog": CogIcon,
    "building": BuildingOfficeIcon,
    "document": DocumentTextIcon,
    "clipboard": ClipboardDocumentListIcon,
    "Folder": ClipboardDocumentListIcon,
};
