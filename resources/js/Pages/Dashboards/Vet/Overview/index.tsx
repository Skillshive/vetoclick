// Import Dependencies
import { Radio, RadioGroup } from "@headlessui/react";
import clsx from "clsx";
import { useState } from "react";

// Local Imports
import { Box } from "@/components/ui";
import { AppointmentInfo } from "./AppointmentInfo";
import { AppointmentsChart } from "./AppointmentsChart";
import { History } from "../History";

// ----------------------------------------------------------------------

const appointmentsData = {
  monthly: {
    series: [
      {
        name: "Passed",
        data: [45, 28, 50, 35, 55, 32, 60, 30, 45, 56, 50, 35, 45, 28, 50, 35],
      },
      {
        name: "Cancelled",
        data: [25, 14, 25, 20, 20, 12, 20, 15, 25, 14, 25, 20, 25, 14, 25, 20],
      },
    ],
    categories: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31],
  },
  yearly: {
    series: [
      {
        name: "Passed",
        data: [28, 45, 35, 50, 32, 55, 23, 60, 28, 45, 35, 50],
      },
      {
        name: "Cancelled",
        data: [14, 25, 20, 25, 12, 20, 15, 20, 14, 25, 20, 25],
      },
    ],
    categories: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  },
};

type AppointmentsData = keyof typeof appointmentsData;

export function Overview() {
  const [activeRange, setActiveRange] = useState<AppointmentsData>("yearly");
  const series = appointmentsData[activeRange].series;
  const categories = appointmentsData[activeRange].categories;

  return (
    <Box className="col-span-12 lg:col-span-6">

      {/* <div className="flex flex-col"> */}
        {/* <AppointmentInfo /> */}
        <History />
      {/* </div> */}
    </Box>
  );
}
