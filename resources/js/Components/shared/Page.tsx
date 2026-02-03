// Import Dependencies
import { ElementType, Fragment, ReactNode } from "react";
import { Head } from "@inertiajs/react";

// Local Imports
import { APP_NAME } from "@/constants/app";
import { useDocumentTitle } from "@/hooks/index";

// ----------------------------------------------------------------------

type PageProps<T extends ElementType = typeof Fragment> = {
  title?: string;
  description?: string;
  component?: T;
  children: ReactNode;
} & React.ComponentPropsWithoutRef<T>;

function Page<T extends ElementType = typeof Fragment>({
  title = "",
  description = "",
  component,
  children,
  ...rest
}: PageProps<T>) {
  const Component: ElementType = component || Fragment;
  useDocumentTitle(`${title} - ${APP_NAME}`);

  return (
    <>
      <Head>
        {title && <title>{`${title} - ${APP_NAME}`}</title>}
        {description && <meta name="description" content={description} />}
      </Head>
      <Component {...rest}>{children}</Component>
    </>
  );
}

export { Page };
