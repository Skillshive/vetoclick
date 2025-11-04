// Local Imports
import { Page } from "@/components/shared/Page";
import { Overview } from "./Overview";
import { Statistics } from "./Statistics";
import { Projects } from "./Projects";;
import MainLayout from "@/layouts/MainLayout";

// ----------------------------------------------------------------------

export default function CRMAnalytics() {
  return (
        <MainLayout>
    
    <Page title="CRM Analytics Dashboard">
      <div className="overflow-hidden pb-8">
        <div className="transition-content mt-4 grid grid-cols-12 gap-4 px-(--margin-x) sm:mt-5 sm:gap-5 lg:mt-6 lg:gap-6">
          <Overview />
          <Statistics />
          <Projects />
        </div>
      
      </div>
    </Page>
        </MainLayout>
    
  );
}