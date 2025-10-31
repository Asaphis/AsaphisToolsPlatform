'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tool } from '@/types';

interface SearchBarProps {
  placeholder?: string;
}

export function SearchBar({ placeholder = 'Search tools...' }: SearchBarProps) {
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
        const res = await fetch('/api/tools', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load tools');
        const json = await res.json();
        const list: Tool[] = json.tools || [];
        const lower = query.toLowerCase();
        const filtered = list
          .filter(
            (t) =>
              t.name.toLowerCase().includes(lower) ||
              (t.description || '').toLowerCase().includes(lower) ||
              (t.tags || []).some((tag: string) => tag.toLowerCase().includes(lower))
          )
          .slice(0, 8);

        if (!abort) {
          setSuggestions(filtered);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch (err) {
        if (!abort) {
          setSuggestions([]);
          setIsOpen(false);
          setSelectedIndex(-1);
        }
      }
    };

    run();
    return () => {
      abort = true;
    };
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
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
            <svg className="h-5 w-5 text-foreground/60" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length > 1 && setIsOpen(true)}
            className="block w-full pl-10 pr-3 py-2 rounded-full leading-5 bg-card text-foreground placeholder:text-foreground/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            placeholder={placeholder}
            autoComplete="off"
          />
        </div>
      </form>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-popup rounded-lg shadow-lg border border-border overflow-hidden">
          {suggestions.map((tool, index) => (
            <div
              key={tool.id}
              className={`px-4 py-3 cursor-pointer hover:bg-muted transition-colors flex items-start gap-3 ${index === selectedIndex ? 'bg-muted' : ''}`}
              onClick={() => handleSuggestionClick(tool)}
            >
              <div className="text-2xl">{tool.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium truncate">{tool.name}</p>
                  {tool.premium && <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">Pro</span>}
                </div>
                <p className="text-xs text-foreground/70 truncate">{tool.description}</p>
              </div>
            </div>
          ))}

          {query.length > 1 && (
            <div className="px-4 py-3 border-t border-border text-sm">
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                className="text-primary-600 hover:text-primary-700"
                onClick={() => {
                  setIsOpen(false);
                  setQuery('');
                }}
              >
                See all results for "{query}"
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
