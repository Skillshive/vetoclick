import { createSafeContext } from "@/utils/createSafeContext";

export interface SidebarContextValue {
    isExpanded: boolean;
    activeSegmentPath: string;
    toggle: () => void;
    open: () => void;
    close: () => void;
    setActiveSegmentPath: (path: string) => void;
}

export const [SidebarContext, useSidebarContext] =
    createSafeContext<SidebarContextValue>(
        "useSidebarContext must be used within SidebarProvider"
    );
