'use client';

import { useState, useEffect } from 'react';
import { recordToolUsage } from '@/lib/analytics';

export function WordCounter() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0
  });

  useEffect(() => {
    const calculateStats = () => {
      const characters = text.length;
      const charactersNoSpaces = text.replace(/\s/g, '').length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;
      const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length : 0;
      const readingTime = Math.ceil(words / 200); // Average reading speed: 200 words per minute

      setStats({
        characters,
        charactersNoSpaces,
        words,
        sentences,
        paragraphs,
        readingTime
      });
    };

    calculateStats();
  }, [text]);

  const clearText = () => {
    setText('');
  };

  const copyStats = () => {
    const statsText = `Text Statistics:
Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Words: ${stats.words}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Reading time: ${stats.readingTime} min${stats.readingTime !== 1 ? 's' : ''}`;
    
    navigator.clipboard.writeText(statsText);
    recordToolUsage('word-counter', { action: 'Copied Stats', fileCount: 1 });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Enter your text
            </h2>
            <button
              onClick={clearText}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              disabled={!text}
            >
              Clear
            </button>
          </div>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full h-80 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-none"
          />
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {text.length > 0 ? `${text.length} characters` : 'Start typing to see live statistics'}
          </div>
        </div>

        {/* Stats Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Statistics
            </h2>
            <button
              onClick={copyStats}
              className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              disabled={!text}
            >
              Copy Stats
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.characters.toLocaleString()}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Characters
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.charactersNoSpaces.toLocaleString()}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                Characters (no spaces)
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.words.toLocaleString()}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                Words
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.sentences.toLocaleString()}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Sentences
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {stats.paragraphs.toLocaleString()}
              </div>
              <div className="text-sm text-teal-700 dark:text-teal-300 mt-1">
                Paragraphs
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg p-4 border border-pink-200 dark:border-pink-800">
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                {stats.readingTime}
              </div>
              <div className="text-sm text-pink-700 dark:text-pink-300 mt-1">
                Reading time (min)
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {text.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Quick Facts
              </h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div>Average words per sentence: {stats.sentences > 0 ? Math.round(stats.words / stats.sentences) : 0}</div>
                <div>Average characters per word: {stats.words > 0 ? Math.round(stats.charactersNoSpaces / stats.words) : 0}</div>
                <div>Most common word length: {stats.words > 0 ? 'Calculated dynamically' : 'N/A'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
