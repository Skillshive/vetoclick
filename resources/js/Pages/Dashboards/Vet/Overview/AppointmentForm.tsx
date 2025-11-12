
// Import Dependencies
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Form/Input";
import { Box } from "@/components/ui";

// ----------------------------------------------------------------------

export function AppointmentForm() {
  return (
    <Box className="col-span-12 lg:col-span-4">
      <h2 className="truncate text-base font-medium tracking-wide text-gray-800 dark:text-dark-100 mb-4">
        Create Appointment
      </h2>
      <form>
        <div className="space-y-2">
          <Input id="petName" type="text" placeholder="Enter pet name" label="Pet Name" />
          <Input id="ownerName" type="text" placeholder="Enter owner name" label="Owner Name" />
          <Input id="appointmentDate" type="date" label="Date" />
          <Input id="appointmentTime" type="time" label="Time" />
          <Input id="reason" type="text" placeholder="Enter reason for visit" label="Reason for visit" />
          <Button type="submit" className="w-full">
            Create Appointment
          </Button>
        </div>
      </form>
    </Box>
  );
}
