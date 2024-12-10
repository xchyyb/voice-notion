'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Note {
  id: string;
  properties: {
    笔记: {
      rich_text: Array<{ plain_text: string }>;
    };
    添加时间: {
      date: {
        start: string;
      };
    };
    标签: {
      multi_select: Array<{ name: string }>;
    };
  };
}

// 格式化日期的函数
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export default function NoteList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [startCursor, setStartCursor] = useState<string | null>(null);
  const isFirstLoad = useRef(true);
  const isFetching = useRef(false);

  const fetchNotes = useCallback(async (isRefresh = false) => {
    if (isFetching.current) return;
    
    try {
      isFetching.current = true;
      setLoading(true);
      setError(null);

      const response = await fetch('/api/get-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          startCursor: isRefresh ? null : startCursor 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      const data = await response.json();
      
      if (isRefresh) {
        // 如果是刷新，直接替换所有笔记
        setNotes(data.results);
        setStartCursor(data.next_cursor);
      } else {
        // 如果是加载更多，追加笔记
        setNotes(prev => isFirstLoad.current ? data.results : [...prev, ...data.results]);
        setStartCursor(data.next_cursor);
      }
      
      setHasMore(data.has_more);
      isFirstLoad.current = false;
    } catch (err) {
      setError('加载笔记失败，请稍后重试');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [startCursor]);

  // 初始加载
  useEffect(() => {
    if (isFirstLoad.current) {
      fetchNotes();
    }
  }, [fetchNotes]);

  // 监听笔记创建事件
  useEffect(() => {
    const handleNoteCreated = () => {
      // 重新获取笔记列表
      fetchNotes(true);
    };

    window.addEventListener('noteCreated', handleNoteCreated);

    return () => {
      window.removeEventListener('noteCreated', handleNoteCreated);
    };
  }, [fetchNotes]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && !isFetching.current) {
      fetchNotes();
    }
  }, [loading, hasMore, fetchNotes]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="p-4 border rounded shadow">
            <p className="text-gray-800">
              {note.properties.笔记.rich_text[0]?.plain_text}
            </p>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <time>
                {formatDate(note.properties.添加时间.date.start)}
              </time>
              <div className="flex gap-2">
                {note.properties.标签.multi_select.map((tag) => (
                  <span
                    key={tag.name}
                    className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      )}

      {hasMore && !loading && (
        <button
          onClick={handleLoadMore}
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          加载更多
        </button>
      )}
    </div>
  );
} 