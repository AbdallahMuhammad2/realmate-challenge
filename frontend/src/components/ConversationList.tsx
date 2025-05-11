import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';

interface Conversation {
  id: string;
  state: 'OPEN' | 'CLOSED';
  messages?: Array<{
    id: string;
    content: string;
    direction: 'SENT' | 'RECEIVED';
    created_at: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
  isLoading: boolean;
  theme?: 'light' | 'dark';
}

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
  onNewConversation,
  isLoading,
  theme = 'dark',
}: ConversationListProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter conversations based on filter and search term
  const filteredConversations = conversations.filter((conv) => {
    // Apply state filter
    if (filter === 'open' && conv.state !== 'OPEN') return false;
    if (filter === 'closed' && conv.state !== 'CLOSED') return false;
    
    // Apply search filter if there's a search term
    if (searchTerm) {
      // Search in conversation ID
      if (conv.id.toLowerCase().includes(searchTerm.toLowerCase())) return true;
      
      // Search in messages content
      const hasMatchInMessages = conv.messages?.some((msg) =>
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (hasMatchInMessages) return true;
      return false;
    }
    
    return true;
  });

  // Sort conversations: open first, then by creation date (newest first)
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    // Open conversations first
    if (a.state === 'OPEN' && b.state !== 'OPEN') return -1;
    if (a.state !== 'OPEN' && b.state === 'OPEN') return 1;
    
    // Then sort by date (recent first)
    const dateA = a.updated_at || a.created_at || '';
    const dateB = b.updated_at || b.created_at || '';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  // Group conversations by date
  const groupedConversations: { [key: string]: Conversation[] } = {};
  sortedConversations.forEach((conv) => {
    const date = conv.created_at ? new Date(conv.created_at) : new Date();
    let dateGroup = 'Older';
    
    if (isToday(date)) {
      dateGroup = 'Today';
    } else if (isYesterday(date)) {
      dateGroup = 'Yesterday';
    } else if (date.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) {
      dateGroup = 'This Week';
    }
    
    if (!groupedConversations[dateGroup]) {
      groupedConversations[dateGroup] = [];
    }
    
    groupedConversations[dateGroup].push(conv);
  });

  // Get the last message from a conversation
  const getLastMessage = (conv: Conversation) => {
    if (!conv.messages || conv.messages.length === 0) return null;
    return conv.messages.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isToday(date)) {
        return format(date, 'HH:mm');
      }
      if (isYesterday(date)) {
        return 'Yesterday';
      }
      return format(date, 'MMM d');
    } catch (e) {
      return '';
    }
  };

  // Handle conversation click
  const handleConversationClick = (id: string) => {
    onSelect(id);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-slate-700/50">
          <div className="animate-pulse h-10 w-full bg-slate-700 rounded-lg mb-4"></div>
          <div className="flex space-x-2 mb-4">
            <div className="animate-pulse h-8 w-1/3 bg-slate-700 rounded-md"></div>
            <div className="animate-pulse h-8 w-1/3 bg-slate-700 rounded-md"></div>
            <div className="animate-pulse h-8 w-1/3 bg-slate-700 rounded-md"></div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-slate-700/60 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-800/30">
      {/* Header with search */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="relative mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-3 text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex rounded-lg p-1 bg-slate-700/40 mb-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 text-sm rounded transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`flex-1 py-1.5 text-sm rounded transition-all ${
              filter === 'open'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white font-medium shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`flex-1 py-1.5 text-sm rounded transition-all ${
              filter === 'closed'
                ? 'bg-gradient-to-r from-slate-600 to-slate-500 text-white font-medium shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Closed
          </button>
        </div>

        {/* New conversation button */}
        <button
          onClick={onNewConversation}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg flex items-center justify-center transition-colors shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          New Conversation
        </button>
      </div>

      {/* Conversations list with date groups */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="p-3 bg-slate-800/60 rounded-full mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              {searchTerm
                ? 'No conversations found for your search'
                : filter !== 'all'
                ? `No ${filter} conversations found`
                : 'No conversations yet'}
            </p>
            {!searchTerm && filter === 'all' && (
              <button
                onClick={onNewConversation}
                className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Start a conversation
              </button>
            )}
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(groupedConversations).map(([date, convs]) => (
              <div key={date} className="mb-4">
                <div className="px-2 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {date}
                </div>
                <div className="space-y-2">
                  {convs.map((conv) => {
                    const lastMessage = getLastMessage(conv);
                    return (
                      <motion.div
                        key={conv.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg cursor-pointer transition-all border ${
                          activeConversationId === conv.id
                            ? 'bg-slate-700 border-blue-500/30 shadow-md shadow-blue-900/10'
                            : 'hover:bg-slate-700/70 border-slate-700/50'
                        }`}
                        onClick={() => handleConversationClick(conv.id)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center space-x-2">
                            {/* Status indicator */}
                            <div className={`w-2 h-2 rounded-full ${
                              conv.state === 'OPEN' 
                                ? 'bg-green-500 animate-pulse' 
                                : 'bg-slate-400'
                            }`}></div>
                            
                            {/* ID */}
                            <span className="font-medium text-slate-200 truncate">
                              #{conv.id.substring(0, 8)}
                            </span>
                          </div>
                          
                          {/* Badge */}
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            conv.state === 'OPEN'
                              ? 'bg-green-900/30 text-green-400 border border-green-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-600/20'
                          }`}>
                            {conv.state}
                          </span>
                        </div>
                        
                        {/* Last message preview */}
                        {lastMessage ? (
                          <div className="mt-2">
                            <div className="flex justify-between items-baseline mb-1">
                              <span className="text-xs font-medium text-slate-300">
                                {lastMessage.direction === 'SENT' ? 'You' : 'Customer'}:
                              </span>
                              <span className="text-xs text-slate-400">
                                {formatDate(lastMessage.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-300 truncate">
                              {lastMessage.content}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 mt-1 italic">
                            No messages yet
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="py-2 px-4 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-400">
        <span>{conversations.length} total conversations</span>
        <span>
          {conversations.filter((c) => c.state === 'OPEN').length} open ·{' '}
          {conversations.filter((c) => c.state === 'CLOSED').length} closed
        </span>
      </div>
    </div>
  );
}