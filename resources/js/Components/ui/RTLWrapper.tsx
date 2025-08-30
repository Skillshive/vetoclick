import { ReactNode } from 'react';
import clsx from 'clsx';
import { useRTL } from '@/hooks/useRTL';

interface RTLWrapperProps {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  [key: string]: any;
}

export function RTLWrapper({ 
  children, 
  className, 
  as: Component = 'div', 
  ...props 
}: RTLWrapperProps) {
  const { isRtl, rtlProps } = useRTL();

  return (
    <Component
      {...rtlProps}
      className={clsx(
        className,
        isRtl && 'rtl-container'
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default RTLWrapper;