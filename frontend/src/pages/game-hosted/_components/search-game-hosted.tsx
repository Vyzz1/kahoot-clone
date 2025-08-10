import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useGameHostedFilter } from "../_hooks/useGameHostedFilter";
import { useEffect, useState } from "react";

import { useDebounce } from "use-debounce";
export default function SearchGameHosted() {
  const { search, setFilters } = useGameHostedFilter();

  const [localSearch, setLocalSearch] = useState(search);

  const [debounceSearch] = useDebounce(localSearch, 300);

  useEffect(() => {
    setFilters({ search: debounceSearch });
  }, [debounceSearch, setFilters]);

  return (
    <Input
      placeholder="Search games..."
      prefix={<SearchOutlined />}
      value={localSearch}
      onChange={(e) => setLocalSearch(e.target.value)}
      allowClear
      style={{ width: 300 }}
    />
  );
}
