// Local Imports
import { useFuse } from "@/hooks";
import { type User, users } from "./partials/data";
import { BreedCard } from "./partials/BreedCard";
import { Toolbar } from "./partials/Toolbar";

// ----------------------------------------------------------------------

export default function Breeds() {
  const {
    result: filteredUsers,
    query,
    setQuery,
  } = useFuse<User>(users, {
    keys: ["name", "tags"],
    threshold: 0.2,
    matchAllOnEmptyQuery: true,
  });

  return (
      <div className="transition-content w-full px-(--margin-x) pb-8">
        <Toolbar setQuery={setQuery} query={query} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {filteredUsers.map(({ item: user, refIndex }) => (
            <BreedCard
              key={refIndex}
              uid={user.uid}
              name={user.name}
              avatar={user.avatar}
              description={user.description}
              query={query}
            />
          ))}
        </div>
      </div>
  );
}
