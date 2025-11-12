// Import Dependencies
import {
  FaUserEdit,
  FaLeaf,
  FaProjectDiagram,
  FaHistory,
} from "react-icons/fa";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { ArrowUpRightIcon } from "@heroicons/react/20/solid";

// Local Imports
import {
  Avatar,
  Timeline,
  Tag,
  Button,
  TimelineItem,
  Card,
} from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

// ----------------------------------------------------------------------

export function UsersActivity() {
  const { t } = useTranslation();

  return (
    <Card className="px-4 pb-5 sm:px-5">
      <div className="flex h-14 min-w-0 items-center justify-between py-3">
        <h2 className="dark:text-dark-100 truncate font-medium tracking-wide text-gray-800">
          {t("common.vet_dashboard.users_activity.title")}
        </h2>
        <a
          href="##"
          className="text-xs-plus text-primary-600 hover:text-primary-600/70 focus:text-primary-600/70 dark:text-primary-400 dark:hover:text-primary-400/70 dark:focus:text-primary-400/70 border-b border-dotted border-current pb-0.5 font-medium outline-hidden transition-colors duration-300"
        >
          {t("common.vet_dashboard.users_activity.view_all")}
        </a>
      </div>
      <div className="max-w-lg">
        <Timeline pointSize="1.5rem">
          <TimelineItem
            title={t("common.vet_dashboard.users_activity.entries.photo_changed_title")}
            time={new Date().setMinutes(new Date().getMinutes() - 12)}
            point={
              <div className="timeline-item-point this:secondary text-this dark:text-this-light relative flex shrink-0 items-center justify-center rounded-full border border-current">
                <FaUserEdit className="text-xs" />
              </div>
            }
          >
            <p>
              {t(
                "common.vet_dashboard.users_activity.entries.photo_changed_description",
                { name: "John Doe" },
              )}
            </p>
            <Avatar
              size={12}
              src="/images/200x200.png"
              classNames={{
                root: "mt-2",
                display: "mask is-squircle rounded-none",
              }}
            />
          </TimelineItem>
          <TimelineItem
            title={t("common.vet_dashboard.users_activity.entries.design_completed_title")}
            time={new Date().setHours(new Date().getHours() - 3)}
            point={
              <div className="timeline-item-point this:success text-this dark:text-this-light relative flex shrink-0 items-center justify-center rounded-full border border-current">
                <FaLeaf className="text-xs" />
              </div>
            }
          >
            <p>
              {t(
                "common.vet_dashboard.users_activity.entries.design_completed_description",
                { name: "Robert Nolan" },
              )}
            </p>
            <a
              href="##"
              className="text-primary-600 hover:text-primary-600/70 focus:text-primary-600/70 dark:text-primary-400 dark:hover:text-primary-400/70 dark:focus:text-primary-400/70 mt-3 inline-flex space-x-1 font-medium outline-hidden transition-colors duration-300"
            >
              <DocumentArrowDownIcon className="size-5" />
              <span> Design-final.fig</span>
            </a>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Tag
                href="#"
                variant="soft"
                color="secondary"
                className="border-this-darker/40 dark:border-this-lighter/30 rounded-full border"
              >
                {t("common.vet_dashboard.users_activity.tags.uiux")}
              </Tag>
              <Tag
                href="#"
                variant="soft"
                color="info"
                className="border-this-darker/40 dark:border-this-lighter/30 rounded-full border"
              >
                {t("common.vet_dashboard.users_activity.tags.crm")}
              </Tag>
              <Tag
                href="#"
                variant="soft"
                color="success"
                className="border-this-darker/40 dark:border-this-lighter/30 rounded-full border"
              >
                {t("common.vet_dashboard.users_activity.tags.dashboard")}
              </Tag>
            </div>
          </TimelineItem>
          <TimelineItem
            title={t("common.vet_dashboard.users_activity.entries.er_diagram_title")}
            time={new Date().setDate(new Date().getDate() - 1)}
            point={
              <div className="timeline-item-point this:secondary text-this dark:text-this-light relative flex shrink-0 items-center justify-center rounded-full border border-current">
                <FaProjectDiagram className="text-xs" />
              </div>
            }
          >
            <p>
              {t("common.vet_dashboard.users_activity.entries.er_diagram_description")}
            </p>
            <div className="mt-1">
              <p className="dark:text-dark-300 text-xs text-gray-400">
                {t("common.vet_dashboard.users_activity.members_label")}
              </p>
              <div className="mt-2 flex justify-between">
                <div className="flex flex-wrap -space-x-2">
                  <Avatar
                    size={7}
                    classNames={{
                      root: "origin-bottom transition-transform hover:z-10 hover:scale-125",
                      display: "dark:ring-dark-700 ring-3 ring-white",
                    }}
                    src="/images/200x200.png"
                  />
                  <Avatar
                    size={7}
                    classNames={{
                      root: "origin-bottom transition-transform hover:z-10 hover:scale-125",
                      display: "dark:ring-dark-700 text-xs ring-3 ring-white",
                    }}
                    name="John Doe"
                    initialColor="info"
                  />
                  <Avatar
                    size={7}
                    classNames={{
                      root: "origin-bottom transition-transform hover:z-10 hover:scale-125",
                      display: "dark:ring-dark-700 ring-3 ring-white",
                    }}
                    src="/images/200x200.png"
                  />

                  <Avatar
                    size={7}
                    classNames={{
                      root: "origin-bottom transition-transform hover:z-10 hover:scale-125",
                      display: "dark:ring-dark-700 ring-3 ring-white",
                    }}
                    src="/images/200x200.png"
                  />
                  <Avatar
                    size={7}
                    classNames={{
                      root: "origin-bottom transition-transform hover:z-10 hover:scale-125",
                      display: "dark:ring-dark-700 text-xs ring-3 ring-white",
                    }}
                    src="/images/200x200.png"
                  />
                </div>
                <Button className="size-7 rounded-full" isIcon>
                  <ArrowUpRightIcon className="size-4.5" />
                </Button>
              </div>
            </div>
          </TimelineItem>
          <TimelineItem
            title={t("common.vet_dashboard.users_activity.entries.weekly_report_title")}
            time={new Date().setDate(new Date().getDate() - 2)}
            point={
              <div className="timeline-item-point this:error text-this dark:text-this-light relative flex shrink-0 items-center justify-center rounded-full border border-current">
                <FaHistory className="text-xs" />
              </div>
            }
          >
            <p className="mt-1">
              {t("common.vet_dashboard.users_activity.entries.weekly_report_description")}
            </p>
          </TimelineItem>
        </Timeline>
      </div>
    </Card>
  );
}
