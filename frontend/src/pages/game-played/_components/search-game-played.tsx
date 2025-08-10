import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useGamePlayedFilter } from "../_hooks/useGamePlayedFilter";

export default function SearchGamePlayed() {
  const { search, setFilters } = useGamePlayedFilter();

  const handleSearch = (value: string) => {
    setFilters({ search: value, currentPage: 1 });
  };

  return (
    <Input
      placeholder="Search games..."
      prefix={<SearchOutlined />}
      value={search}
      onChange={(e) => handleSearch(e.target.value)}
      allowClear
      style={{ width: 300 }}
    />
  );
}
