import { useEffect, useState } from "react";
import { useUserFilter } from "../_hooks/useUserFilter";
import { useDebounce } from "use-debounce";
import { Input, type InputProps } from "antd";

function SearchUser({ ...props }: InputProps) {
  const { search, setFilters } = useUserFilter();

  const [localSearch, setLocalSearch] = useState(search);

  const [debounceSearch] = useDebounce(localSearch, 300);

  useEffect(() => {
    setFilters({ search: debounceSearch });
  }, [debounceSearch, setFilters]);
  return (
    <Input
      {...props}
      placeholder="Search by name or email"
      value={localSearch}
      onChange={(e) => setLocalSearch(e.target.value)}
      style={{ width: 300 }}
    />
  );
}

export default SearchUser;
