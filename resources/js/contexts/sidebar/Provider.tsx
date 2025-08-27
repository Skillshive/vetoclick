import { ReactNode, useLayoutEffect, useState } from "react";

import { useDisclosure, useDidUpdate } from "@/hooks";
import { useBreakpointsContext } from "../breakpoint/context";
import { SidebarContext, SidebarContextValue } from "./context";

const initialState: SidebarContextValue = {
  isExpanded: false,
  activeSegmentPath: '',
  toggle: () => {},
  open: () => {},
  close: () => {},
  setActiveSegmentPath: () => {},
};

export function SidebarProvider({ children }: { children: ReactNode }) {
  const { xlAndUp, lgAndDown, name } = useBreakpointsContext();
  const [activeSegmentPath, setActiveSegmentPath] = useState('');

  const [isExpanded, { open, close, toggle }] = useDisclosure(
    initialState.isExpanded && xlAndUp,
  );

  useDidUpdate(() => {
    if (lgAndDown) {
      close();
    }
  }, [name]);

  useLayoutEffect(() => {
    const documentBody = document?.body;
    if (documentBody) {
      if (isExpanded) {
        documentBody.classList.add("is-sidebar-open");
      } else {
        documentBody.classList.remove("is-sidebar-open");
      }
    }
  }, [isExpanded]);

  if (!children) {
    return null;
  }

  return (
    <SidebarContext
      value={{
        isExpanded,
        activeSegmentPath,
        toggle,
        open,
        close,
        setActiveSegmentPath,
      }}
    >
      {children}
    </SidebarContext>
  );
}
