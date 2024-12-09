import { useState, useEffect, useRef } from 'react';
import { PencilSquareIcon, CheckIcon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export function SelectSearch({ 
  options, 
  value, 
  onChange, 
  displayValue, 
  placeholder = "Search...",
  className = "",
  disabled = false,
  required = false,
  error = "",
  label = "",
  icon = null,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsEditing(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (value) => {
    onChange(value);
    setIsEditing(false);
    setSearchTerm('');
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setSearchTerm('');
    }
  };

  // Clear selection
  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
    if (isEditing) {
      inputRef.current?.focus();
    }
  };

  if (!isEditing) {
    return (
      <div className={`relative ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div 
          className={`
            flex items-center gap-2 p-2 border rounded-lg cursor-pointer
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400'}
            ${error ? 'border-red-300' : 'border-gray-300'}
            ${value ? 'bg-white' : 'bg-gray-50'}
          `}
          onClick={() => !disabled && setIsEditing(true)}
        >
          {icon && <span className="text-gray-400">{icon}</span>}
          <span className="flex-1 text-gray-700 truncate">
            {displayValue || <span className="text-gray-400">{placeholder}</span>}
          </span>
          <div className="flex items-center gap-1">
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600"
                disabled={disabled}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
            <PencilSquareIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-10 py-2 border rounded-lg text-sm
            ${error ? 'border-red-300' : 'border-gray-300'}
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
          `}
          autoFocus
        />
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setSearchTerm('');
          }}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {filteredOptions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              className={`
                w-full px-4 py-2 text-left text-sm hover:bg-gray-50 
                flex items-center justify-between
                ${value === option.id ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}
                ${isFocused ? 'focus:bg-gray-50 focus:outline-none' : ''}
              `}
            >
              {option.name}
              {value === option.id && <CheckIcon className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}

      {filteredOptions.length === 0 && searchTerm && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
          No results found
        </div>
      )}
    </div>
  );
}

export default SelectSearch; 