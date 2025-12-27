// Import Dependencies
import { CSSProperties } from "react";

// Local Imports
import { Veterinarian, AuthorCard } from "./AuthorCard";

// ----------------------------------------------------------------------

interface FeaturedAuthorsProps {
  veterinarians?: Array<{
    id: number;
    name: string;
    avatar?: string;
    clients: number;
    pets: number;
    revenue: number;
    appointments?: number;
    consultations?: number;
  }>;
}

const defaultAwards = [
  {
    uid: 1,
    label: "Top Performer",
    image: "/images/awards/award-19.svg",
  },
  {
    uid: 2,
    label: "Excellence Award",
    image: "/images/awards/award-2.svg",
  },
];

export function FeaturedAuthors({ veterinarians = [] }: FeaturedAuthorsProps) {
  // Transform veterinarians data to match AuthorCard format
  const authors: Veterinarian[] = veterinarians.length > 0
    ? veterinarians.slice(0, 6).map((vet) => ({
        uid: String(vet.id),
        name: vet.name,
        avatar: vet.avatar,
        appointments: vet.appointments,
        consultations: vet.consultations,
        clients: vet.clients.toLocaleString(),
        pets: vet.pets.toLocaleString(),
        revenue: vet.revenue.toLocaleString(),
        awards: defaultAwards,
      }))
    : [
        {
          uid: "1",
          name: "Dr. John Doe",
          avatar: "/images/200x200.png",
          appointments: 2,
          consultations: 4,
          clients: "234",
          pets: "345",
          revenue: "12.5k",
          awards: defaultAwards,
        },
        {
          uid: "2",
          name: "Dr. Jane Smith",
          avatar: "/images/200x200.png",
          appointments: undefined,
          consultations: 2,
          clients: "156",
          pets: "234",
          revenue: "8.3k",
          awards: defaultAwards,
        },
        {
          uid: "3",
          name: "Dr. Mike Johnson",
          avatar: "/images/200x200.png",
          appointments: 4,
          consultations: undefined,
          clients: "89",
          pets: "123",
          revenue: "5.2k",
          awards: defaultAwards.slice(0, 2),
        },
      ];

  return (
    <div className="transition-content mt-4 pl-(--margin-x) sm:mt-5 lg:mt-6">
      <div className="rounded-l-lg bg-info/10 pb-1 pt-4 dark:bg-dark-800">
        <h2 className="truncate px-4 text-base font-medium tracking-wide text-gray-800 dark:text-dark-100 sm:px-5">
          Featured Veterinarians
        </h2>
        <div
          className="custom-scrollbar mt-4 flex space-x-4 overflow-x-auto px-4 pb-4 sm:px-5 "
          style={{ "--margin-scroll": "1.25rem" } as CSSProperties}
        >
          {authors.map((author) => (
            <AuthorCard key={author.uid} {...author} />
          ))}
        </div>
      </div>
    </div>
  );
}

