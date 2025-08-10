import useFetchData from "@/hooks/useFetchData";
import Title from "antd/es/typography/Title";
import GameHostedTable from "./_components/game-hosted-table";
import { Button, Flex } from "antd";
import SearchGameHosted from "./_components/search-game-hosted";
import { useGameHostedFilter } from "./_hooks/useGameHostedFilter";

export default function GameHostedPage() {
  const { getParamsString, shouldResetFilters, deleteAllFilters } =
    useGameHostedFilter();

  const { data, isLoading, error } = useFetchData<PaginationGameHosted>(
    `/game/hosted?${getParamsString()}`,
    {
      type: "private",
      uniqueKey: ["/game/hosted", getParamsString()],
    }
  );

  if (error) {
    return <div>Error: {error.response?.data.message || "Error"}</div>;
  }

  return (
    <section className="px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <Flex justify="space-between" align="center">
          <Title level={3}>Hosted Games</Title>
        </Flex>
        <div className="my-12 !space-y-8">
          <Flex>
            <SearchGameHosted />
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
          <GameHostedTable data={data!} isLoading={isLoading} />
        </div>
      </div>
    </section>
  );
}
