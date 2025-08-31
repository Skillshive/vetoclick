import { ElementType } from "react";
import { NavigationType } from "@/constants/app";

export interface NavigationTree {
  id: string;
  type: NavigationType;
  path?: string;
  title?: string;
  transKey?: string;
  icon?: string | ElementType;
  childs?: NavigationTree[];
}
