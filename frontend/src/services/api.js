const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetch all conversations from the API
 * @returns {Promise<Array>} List of conversations
 */
export async function fetchConversations() {
  try {
    const response = await fetch(`${API_URL}/conversations/`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return []; // Return empty array if no conversations exist yet
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return []; // Return empty array on error
  }
}

/**
 * Fetch a specific conversation by ID
 * @param {string} id Conversation ID
 * @returns {Promise<Object>} Conversation data
 */
export async function fetchConversation(id) {
  try {
    const response = await fetch(`${API_URL}/conversations/${id}/`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching conversation ${id}:`, error);
    throw error; // Re-throw to let caller handle it
  }
}

/**
 * Send a webhook to the API
 * @param {string} type Webhook type (NEW_CONVERSATION, NEW_MESSAGE, CLOSE_CONVERSATION)
 * @param {Object} data Webhook data
 * @returns {Promise<Object>} API response
 */
export async function sendWebhook(type, data) {
  const payload = {
    type,
    timestamp: new Date().toISOString(),
    data
  };
  
  try {
    const response = await fetch(`${API_URL}/webhook/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      // Registrar detalhes do erro para entender melhor o problema
      const errorDetails = await response.text();
      console.error(`Erro de webhook ${response.status}: ${errorDetails}`);
      throw new Error(`Falha no webhook: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro ao enviar webhook do tipo ${type}:`, error);
    throw error;
  }
}

/**
 * @typedef {Object} Stats
 * @property {number} total_conversations - Total number of conversations
 * @property {number} open_conversations - Number of open conversations
 * @property {number} closed_conversations - Number of closed conversations
 * @property {number} total_messages - Total message count
 * @property {string} response_time - Average response time
 */

/**
 * Fetch system statistics
 * @returns {Promise<Stats>} Statistics data
 */
export async function fetchStats() {
  try {
    const response = await fetch(`${API_URL}/stats/`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Ensure all required fields are present
    return {
      total_conversations: data.total_conversations || 0,
      open_conversations: data.open_conversations || 0,
      closed_conversations: data.closed_conversations || 0,
      total_messages: data.total_messages || 0,
      response_time: data.response_time || '0s',
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Return default values if API fails
    return {
      total_conversations: 0,
      open_conversations: 0,
      closed_conversations: 0,
      total_messages: 0,
      response_time: '0s',
    };
  }
}

/**
 * Send a new message to a conversation
 * @param {string} conversationId - ID of the conversation
 * @param {string} content - Message content
 * @returns {Promise<Object>} - Created message
 */
export async function sendMessage(conversationId, content) {
  const messageId = crypto.randomUUID();
  
  try {
    return await sendWebhook('NEW_MESSAGE', {
      id: messageId,
      conversation_id: conversationId,
      direction: 'SENT',
      content,
    });
  } catch (error) {
    console.error(`Error sending message to conversation ${conversationId}:`, error);
    throw error;
  }
}

/**
 * Create a new conversation
 * @returns {Promise<Object>} - New conversation data
 */
export async function createConversation() {
  const conversationId = crypto.randomUUID();
  
  try {
    return await sendWebhook('NEW_CONVERSATION', { 
      id: conversationId 
    });
  } catch (error) {
    console.error('Error creating new conversation:', error);
    throw error;
  }
}

/**
 * Close an existing conversation
 * @param {string} conversationId - ID of the conversation to close
 * @returns {Promise<Object>} - Closed conversation data
 */
export async function closeConversation(conversationId) {
  try {
    return await sendWebhook('CLOSE_CONVERSATION', { 
      id: conversationId 
    });
  } catch (error) {
    console.error(`Error closing conversation ${conversationId}:`, error);
    throw error;
  }
}

/**
 * Get analytics data
 * @param {string} timeframe - Timeframe for analytics (day, week, month)
 * @returns {Promise<Object>} Analytics data
 */
export async function getAnalytics(timeframe = 'week') {
  try {
    const response = await fetch(`${API_URL}/analytics/?timeframe=${timeframe}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching analytics for timeframe ${timeframe}:`, error);
    // Return minimal placeholder data
    return {
      message_count: [],
      response_times: [],
      conversations_by_day: []
    };
  }
}