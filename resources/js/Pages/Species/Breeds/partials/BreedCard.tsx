// Import Dependencies
import { EnvelopeIcon, PencilIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

// Local Imports
import { Avatar, Button, Card } from "@/components/ui";
import { Highlight } from "@/components/shared/Highlight";
import { User } from "./data";

// ----------------------------------------------------------------------

export function BreedCard({
  name,
  avatar,
  description,
  query,
}: User & { query: string }) {
  return (
    <Card className="flex grow flex-col items-center p-4 text-center sm:p-5">
      <Avatar
        size={18}
        src={avatar}
        name={name}
        classNames={{ display: "text-xl" }}
        initialColor="auto"
      />

      <div className="my-2 grow">
        <h3 className="dark:text-dark-100 text-base font-medium text-gray-800">
          <Highlight query={query}>{name}</Highlight>
        </h3>
        <p className="text-muted">{description}</p>
      </div>
      <div className="mt-3 flex justify-center space-x-1">
        <Button
          className="size-7 rounded-full"
          isIcon
          aria-label="Edit Breed"
        >
          <PencilSquareIcon className="size-4 stroke-2  text-green-500" />
        </Button>
        <Button
          className="size-7 rounded-full"
          isIcon
          aria-label="Delete Breed"
        >
          <TrashIcon className="size-4 stroke-2 text-red-500" />
        </Button>
      
      </div>
    </Card>
  );
}
