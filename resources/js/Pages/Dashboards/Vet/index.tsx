import { Page } from "@/components/shared/Page";
import { Overview } from "./Overview";
import { Statistics } from "./Statistics";
import { Projects } from "./Projects";
import { AppointmentForm } from "./AppointmentForm";
import MainLayout from "@/layouts/MainLayout";
import { Budget } from "./Budget";

// ----------------------------------------------------------------------

export default function CRMAnalytics() {
  return (
        <MainLayout>
    
    <Page title="CRM Analytics Dashboard">
          
      <div className="overflow-hidden pb-8">  <div className="px-(--margin-x) lg:mt-6 lg:gap-6 flex min-w-0 items-center justify-between gap-2">
              <h2 className="truncate text-base font-medium tracking-wide text-gray-800 dark:text-dark-100">
                Appointments Overview
              </h2>
            </div>
        <div className="transition-content grid grid-cols-12 gap-4 px-(--margin-x) sm:mt-4 sm:gap-5">
          
          <div className="col-span-12 grid grid-cols-12 gap-4 sm:gap-5 lg:col-span-8 lg:gap-6">
            
            <Overview />
            <Statistics />
            <Projects />
          </div>
       <div className="col-span-12 lg:col-span-4 gap-4 sm:gap-5 lg:gap-6">                                        
                    <AppointmentForm />
                    <Budget />
        </div>
        </div>
      
      </div>
    </Page>
        </MainLayout>
    
  );
}