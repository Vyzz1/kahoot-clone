import useFetchData from "@/hooks/useFetchData";
import Title from "antd/es/typography/Title";
import UserTable from "./_components/user-table";
import { Button, Flex } from "antd";
import UserForm from "./_components/user-form";
import SearchUser from "./_components/search-user";
import { useUserFilter } from "./_hooks/useUserFilter";
import { useNavigate } from "react-router-dom";

export default function UserManagement() {
  const navigate = useNavigate();
  const { getParamsString, shouldResetFilters, deleteAllFilters } = useUserFilter();

  const { data, isLoading, error } = useFetchData<Pagination<User>>(
    `/users/list?${getParamsString()}`,
    {
      type: "private",
    }
  );

  if (error) {
    return <div>Error: {error.response?.data.message || "Error"}</div>;
  }

  return (
    <section className="px-4 py-6 ">
      <div className="max-w-7xl mx-auto">
        <Flex justify="space-between" align="center">
          <Title level={3}>User Management</Title>
          <div className="flex gap-4">
            <Button
              size="middle"
              type="default"
              onClick={() => navigate("/admin/quiz-management")}
            >
              View Quizzes
            </Button>
            <UserForm isEdit={false} onSubmit={() => {}} />
          </div>
        </Flex>
        <div className="my-12 !space-y-8">
          <Flex>
            <SearchUser />
            {shouldResetFilters && (
              <Button
                size="small"
                type="primary"
                onClick={deleteAllFilters}
                className="ml-4"
              >
                Reset Filters
              </Button>
            )}
          </Flex>
          <UserTable users={data!} isLoading={isLoading} />
        </div>
      </div>
    </section>
  );
}
