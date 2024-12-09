import { useState, useEffect, useMemo } from "react";
import { useAtom } from 'jotai';
import { Input } from "@material-tailwind/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

// Import all atoms
import { clientsAtom } from "@/store/atoms/clientsAtom";
import { plantsAtom } from "@/store/atoms/plantsAtom";
import { regionsAtom } from "@/store/atoms/regionsAtom";
import { usersAtom } from "@/store/atoms/usersAtom";

export function DashboardSearch() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Get data from all atoms
  const [clients] = useAtom(clientsAtom);
  const [plants] = useAtom(plantsAtom);
  const [regions] = useAtom(regionsAtom);
  const [users] = useAtom(usersAtom);

  const searchableData = useMemo(() => {
    return [
      ...clients.map(item => ({ ...item, type: 'Client' })),
      ...plants.map(item => ({ ...item, type: 'Plant' })),
      ...regions.map(item => ({ ...item, type: 'Region' })),
      ...users.map(item => ({ ...item, type: 'User' }))
    ];
  }, [clients, plants, regions, users]);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const results = searchableData.reduce((acc, item) => {
      const searchableFields = Object.entries(item).filter(([key]) => 
        typeof item[key] === 'string' || typeof item[key] === 'number'
      );

      const matches = searchableFields.filter(([_, value]) => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (matches.length > 0) {
        acc.push({
          id: item.id,
          name: item.name || item.email || 'Unnamed',
          type: item.type,
          matchedIn: matches.map(([key, value]) => ({
            field: key,
            value: String(value)
          }))
        });
      }

      return acc;
    }, []);

    setSearchResults(results);
  }, [searchTerm, searchableData]);

  const getItemPath = (type, id) => {
    const pathMap = {
      'Client': `/dashboard/clients/${id}`,
      'Plant': `/dashboard/plants/${id}`,
      'Region': `/dashboard/regions/${id}`,
      'User': `/dashboard/users/${id}`,
    };
    return pathMap[type];
  };

  const handleResultClick = (result) => {
    const path = getItemPath(result.type, result.id);
    if (path) {
      navigate(path);
      setShowResults(false);
      setSearchTerm("");
    }
  };

  return (
    <div className="relative w-full max-w-[240px]">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-gray-300" />
        <Input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          className="pl-10 pr-4 py-2 w-full !border-t-blue-gray-200 focus:!border-t-gray-900"
          labelProps={{
            className: "before:content-none after:content-none",
          }}
          containerProps={{
            className: "min-w-[100px] !min-h-0",
          }}
        />
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
          {searchResults.map((result, index) => (
            <div
              key={`${result.type}-${result.id}-${index}`}
              className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
              onClick={() => handleResultClick(result)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 truncate max-w-[70%]">
                  {result.name}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {result.type}
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {result.matchedIn.map((match, idx) => (
                  <div key={idx} className="text-xs text-gray-500 truncate">
                    Found in {match.field}: {match.value}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Click outside handler */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}

export default DashboardSearch; 