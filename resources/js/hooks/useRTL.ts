import { useLocaleContext } from '@/contexts/locale/context';
import { useMemo } from 'react';

export function useRTL() {
  // Safely get the locale context, fallback to LTR if not available
  let isRtl = false;
  try {
    const context = useLocaleContext();
    isRtl = context?.isRtl || false;
  } catch (error) {
    // Context not available, default to LTR
    isRtl = false;
  }

  const rtlClasses = useMemo(() => ({
    // Text alignment
    textStart: isRtl ? 'text-right' : 'text-left',
    textEnd: isRtl ? 'text-left' : 'text-right',
    
    // Flexbox direction
    flexRow: isRtl ? 'flex-row-reverse' : 'flex-row',
    flexRowReverse: isRtl ? 'flex-row' : 'flex-row-reverse',
    
    // Float
    floatStart: isRtl ? 'float-right' : 'float-left',
    floatEnd: isRtl ? 'float-left' : 'float-right',
    
    // Margins
    ml: (size: string) => isRtl ? `mr-${size}` : `ml-${size}`,
    mr: (size: string) => isRtl ? `ml-${size}` : `mr-${size}`,
    ms: (size: string) => `ms-${size}`, // margin-inline-start
    me: (size: string) => `me-${size}`, // margin-inline-end
    
    // Padding
    pl: (size: string) => isRtl ? `pr-${size}` : `pl-${size}`,
    pr: (size: string) => isRtl ? `pl-${size}` : `pr-${size}`,
    ps: (size: string) => `ps-${size}`, // padding-inline-start
    pe: (size: string) => `pe-${size}`, // padding-inline-end
    
    // Positioning
    left: (size: string) => isRtl ? `right-${size}` : `left-${size}`,
    right: (size: string) => isRtl ? `left-${size}` : `right-${size}`,
    
    // Border radius
    roundedL: isRtl ? 'rounded-r' : 'rounded-l',
    roundedR: isRtl ? 'rounded-l' : 'rounded-r',
    roundedTl: isRtl ? 'rounded-tr' : 'rounded-tl',
    roundedTr: isRtl ? 'rounded-tl' : 'rounded-tr',
    roundedBl: isRtl ? 'rounded-br' : 'rounded-bl',
    roundedBr: isRtl ? 'rounded-bl' : 'rounded-br',
    
    // Transform
    rotate: (deg: string) => isRtl ? `-rotate-${deg}` : `rotate-${deg}`,
    scaleX: isRtl ? '-scale-x-100' : 'scale-x-100',
    
    // Space between
    spaceX: (size: string) => `space-x-${size} ${isRtl ? 'space-x-reverse' : ''}`.trim(),
    
    // Justify content
    justifyStart: isRtl ? 'justify-end' : 'justify-start',
    justifyEnd: isRtl ? 'justify-start' : 'justify-end',
    
    // Items alignment
    itemsStart: isRtl ? 'items-end' : 'items-start',
    itemsEnd: isRtl ? 'items-start' : 'items-end',
    
    // Self alignment
    selfStart: isRtl ? 'self-end' : 'self-start',
    selfEnd: isRtl ? 'self-start' : 'self-end',
  }), [isRtl]);

  const rtlProps = useMemo(() => ({
    dir: isRtl ? 'rtl' : 'ltr',
    className: isRtl ? 'rtl' : 'ltr',
  }), [isRtl]);

  return {
    isRtl,
    rtlClasses,
    rtlProps,
    // Helper functions
    conditionalClass: (ltrClass: string, rtlClass: string) => isRtl ? rtlClass : ltrClass,
    flipHorizontal: (value: number | string) => isRtl ? `-${value}` : value,
  };
}