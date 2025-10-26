'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tool } from '@/types';

interface SearchBarProps {
  placeholder?: string;
}

export function SearchBar({ placeholder = "Search tools..." }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Tool[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simple client-side fetch + filter against API tools
  useEffect(() => {
    let abort = false;
    const run = async () => {
      if (query.length <= 1) {
        setSuggestions([]);
        setIsOpen(false);
        setSelectedIndex(-1);
        return;
      }
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || '';
        const url = base.startsWith('http') ? `${base}/tools` : '/api/tools';
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load tools');
        const json = await res.json();
        const list: Tool[] = json.tools || [];
        const lower = query.toLowerCase();
        const filtered = list.filter(t =>
          t.name.toLowerCase().includes(lower) ||
          (t.description || '').toLowerCase().includes(lower) ||
          (t.tags || []).some((tag: string) => tag.toLowerCase().includes(lower))
        ).slice(0, 8);
        if (!abort) {
          setSuggestions(filtered);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch {
        if (!abort) {
          setSuggestions([]);
          setIsOpen(false);
          setSelectedIndex(-1);
        }
      }
    };
    run();
    return () => { abort = true; };
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          router.push(`/tools/${suggestions[selectedIndex].slug}`);
          setIsOpen(false);
          setQuery('');
          inputRef.current?.blur();
        } else if (query.length > 0) {
          router.push(`/search?q=${encodeURIComponent(query)}`);
          setIsOpen(false);
          inputRef.current?.blur();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (tool: Tool) => {
    router.push(`/tools/${tool.slug}`);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length > 0) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length > 1 && setIsOpen(true)}
            className="block w-full pl-10 pr-3 py-2 rounded-full leading-5 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-400 border focus:outline-none focus:ring-1 focus:ring-ring focus:border-input text-sm"
            placeholder={placeholder}
            autoComplete="off"
          />
        </div>
      </form>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-600 rounded-md max-h-96 overflow-auto">
          {suggestions.map((tool, index) => (
            <div
              key={tool.id}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                index === selectedIndex
                  ? 'bg-primary-50 dark:bg-primary-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleSuggestionClick(tool)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{tool.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {tool.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {tool.description}
                  </p>
                </div>
                {tool.premium && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Pro
                  </span>
                )}
              </div>
            </div>
          ))}
          
          {query.length > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-600">
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                onClick={() => {
                  setIsOpen(false);
                  setQuery('');
                }}
              >
                See all results for &quot;{query}&quot;
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
