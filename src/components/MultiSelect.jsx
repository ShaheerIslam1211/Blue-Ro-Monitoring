import { useState, useEffect, useRef } from "react";
import { XMarkIcon, PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export function MultiSelect({ 
  options, 
  value, 
  onChange, 
  placeholder,
  color = "blue",
  label = "",
  required = false,
  error = "",
  disabled = false,
  className = "" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option => 
    !value.includes(option.id) && 
    option.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRemove = (id) => {
    if (!disabled) {
      onChange(value.filter(itemId => itemId !== id));
    }
  };

  const handleSelect = (id) => {
    onChange([...value, id]);
    setIsOpen(false);
    setSearch("");
  };

  const selectedItems = value.map(id => options.find(o => o.id === id)).filter(Boolean);

  const getColorClasses = (type) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        hoverBorder: 'hover:border-blue-300',
        text: 'text-blue-700',
        hoverText: 'hover:text-blue-600',
        lightText: 'text-blue-400'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        hoverBorder: 'hover:border-green-300',
        text: 'text-green-700',
        hoverText: 'hover:text-green-600',
        lightText: 'text-green-400'
      }
    };
    return colors[color][type];
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Selected Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {selectedItems.map(item => (
          <div 
            key={item.id}
            className={`
              group flex items-center justify-between p-3 rounded-lg border
              ${getColorClasses('bg')} ${getColorClasses('border')}
              ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
            `}
          >
            <span className={`text-sm font-medium ${getColorClasses('text')}`}>
              {item.name}
            </span>
            {!disabled && (
              <button
                onClick={() => handleRemove(item.id)}
                className={`
                  opacity-0 group-hover:opacity-100 transition-opacity
                  ${getColorClasses('lightText')} ${getColorClasses('hoverText')}
                `}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        {/* Add New Button */}
        {!disabled && (
          <button
            onClick={() => setIsOpen(true)}
            className={`
              flex items-center justify-center p-3 rounded-lg border border-dashed
              transition-colors text-gray-400 hover:text-gray-600
              ${getColorClasses('border')} ${getColorClasses('hoverBorder')}
            `}
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {/* Dropdown */}
      {isOpen && (
        <div ref={dropdownRef} className="relative">
          <div className="absolute z-10 w-full bg-white rounded-lg shadow-lg border">
            <div className="p-2 border-b">
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-8 pr-4 py-2 bg-gray-50 rounded-md text-sm"
                  placeholder={`Search ${placeholder}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
                <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.map(option => (
                <button
                  key={option.id}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  onClick={() => handleSelect(option.id)}
                >
                  {option.name}
                </button>
              ))}
              {filteredOptions.length === 0 && (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No results found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiSelect; 