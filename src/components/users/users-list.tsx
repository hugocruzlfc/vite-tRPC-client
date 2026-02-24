import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";

export default function UsersList() {
  const usersList = useQuery(trpc.users_list.queryOptions());

  if (usersList.isLoading) {
    return <div>Loading...</div>;
  }

  if (usersList.error) {
    return <div>Error: {usersList.error.message}</div>;
  }

  return (
    <div className="mx-auto">
      {usersList.data?.length === 0 ? (
        <p>No users found.</p>
      ) : (
        usersList.data?.map((user) => <div key={user.id}>{user.name}</div>)
      )}
    </div>
  );
}
