import useFetchData from "@/hooks/useFetchData";
import Title from "antd/es/typography/Title";
import GamePlayedTable from "./_components/game-played-table";
import { Button, Flex } from "antd";
import SearchGamePlayed from "./_components/search-game-played";
import { useGamePlayedFilter } from "./_hooks/useGamePlayedFilter";
import { useNavigate } from "react-router-dom";

export default function GamePlayedPage() {
  const navigate = useNavigate();
  const { getParamsString, shouldResetFilters, deleteAllFilters } =
    useGamePlayedFilter();

  const { data, isLoading, error } = useFetchData<PaginationGamePlayed>(
    `/game/played?${getParamsString()}`,
    {
      type: "private",
      uniqueKey: ["/game/played", getParamsString()],
    }
  );

  if (error) {
    return <div>Error: {error.response?.data.message || "Error"}</div>;
  }

  return (
    <section className="px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <Flex justify="space-between" align="center">
          <Title level={3}>Games Played</Title>
          <div className="flex gap-4">
            <Button
              size="middle"
              type="primary"
              onClick={() => navigate("/join-game")}
            >
              Join New Game
            </Button>
          </div>
        </Flex>
        <div className="my-12 !space-y-8">
          <Flex>
            <SearchGamePlayed />
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
          <GamePlayedTable data={data!} isLoading={isLoading} />
        </div>
      </div>
    </section>
  );
}
