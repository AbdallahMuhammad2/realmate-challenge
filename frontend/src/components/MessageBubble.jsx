import { useState } from 'react';

export default function MessageBubble({ message, animate = false }) {
  const isSent = message.direction === 'SENT';
  const [isHovered, setIsHovered] = useState(false);
  
  // Format time from ISO string
  const formattedTime = new Date(message.created_at).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return (
    <div 
      className={`flex items-end space-x-2 group ${isSent ? 'justify-end' : 'justify-start'} ${
        animate ? 'animate-slide-in-right' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Show avatar only for received messages */}
      {!isSent && (
        <div className="h-8 w-8 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-700 text-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      <div 
        className={`relative max-w-md px-4 py-2 rounded-bubble shadow-bubble ${
          isSent 
            ? 'bg-chat-sent text-neutral-800 rounded-tr-none' 
            : 'bg-chat-received text-neutral-800 rounded-tl-none'
        }`}
      >
        {/* Message content with support for simple formatting */}
        <div className="prose prose-sm max-w-none">
          {message.content.split('\n').map((line, i) => (
            <p key={i} className="mb-1 last:mb-0">
              {line || <br />}
            </p>
          ))}
        </div>
        
        {/* Time and status indicators */}
        <div 
          className={`flex items-center mt-1 space-x-1 ${
            isSent ? 'justify-end' : 'justify-start'
          }`}
        >
          <span className={`text-xs ${isSent ? 'text-neutral-600' : 'text-neutral-500'}`}>
            {formattedTime}
          </span>
          
          {/* Add double check mark for sent messages */}
          {isSent && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        {/* Context menu that appears on hover */}
        <div className={`absolute ${isSent ? 'left-0' : 'right-0'} -translate-y-1/2 top-1/2 ${
          isSent ? '-translate-x-full mr-2' : 'translate-x-full ml-2'
        } ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
          <div className="bg-white rounded-full shadow-elevated p-1 flex space-x-1">
            <button className="hover:bg-neutral-100 rounded-full p-1 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            </button>
            <button className="hover:bg-neutral-100 rounded-full p-1 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Show avatar only for sent messages */}
      {isSent && (
        <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium">
          AI
        </div>
      )}
    </div>
  );
}