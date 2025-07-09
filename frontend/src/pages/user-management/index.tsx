import { useAuth } from "@/hooks/useAuth";
import useFetchData from "@/hooks/useFetchData";
import Title from "antd/es/typography/Title";
import UserTable from "./_components/user-table";

export default function UserManagement() {
  const { auth } = useAuth();

  console.log(auth);

  const { data, isLoading, error } = useFetchData<Pagination<User>>(
    "/users/list",
    {
      type: "private",
    }
  );

  if (error) {
    return <div>Error: {error.response?.data.message || "Error"}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="px-4 py-6 ">
      <div className="max-w-7xl mx-auto">
        <Title level={3}>User Management</Title>
        <div className="my-12">
          <UserTable users={data!} />
        </div>
      </div>
    </section>
  );
}
