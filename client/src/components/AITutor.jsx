import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, X, Sparkles, Copy, Check, Terminal, Code, GitBranch, Database } from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';

const AITutor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Code Tutor. Ask me anything about JavaScript, React, CSS, Python, SQL, or Git!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { label: 'Explain React Hooks', icon: <Code className="w-3.5 h-3.5" /> },
    { label: 'Git Workflow help', icon: <GitBranch className="w-3.5 h-3.5" /> },
    { label: 'Python basics', icon: <Terminal className="w-3.5 h-3.5" /> },
    { label: 'SQL query example', icon: <Database className="w-3.5 h-3.5" /> },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e, customInput = null) => {
    if (e) e.preventDefault();
    const messageContent = customInput || input;
    if (!messageContent.trim()) return;

    const userMessage = { role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/ask', { question: userMessage.content });
      const botMessage = { role: 'assistant', content: data.data.answer };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('AI Tutor Error:', err);
      const errorMessage = err.response?.data?.message || 'Sorry, I encountered an error. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeText = String(children).replace(/\n$/, '');
      const id = Math.random().toString(36).substr(2, 9);

      return !inline && match ? (
        <div className="relative group my-4">
          <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => copyToClipboard(codeText, id)}
              className="p-1.5 bg-gray-800/80 text-white rounded-md hover:bg-gray-700 backdrop-blur-sm border border-white/10"
              title="Copy code"
            >
              {copiedId === id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <code className={className} {...props}>
            {children}
          </code>
        </div>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Bot className="w-6 h-6 sm:w-7 sm:h-7" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
          </span>
        )}
      </motion.button>
 
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-20 right-4 left-4 sm:left-auto sm:right-6 z-[60] w-auto sm:w-96 h-[500px] sm:h-[550px] bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/10 backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">AI Tutor</h3>
                <p className="text-white/70 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                  Online
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth scrollbar-thin scrollbar-thumb-indigo-500/20">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
                    msg.role === 'assistant' 
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className={`p-3.5 rounded-2xl text-sm ${
                    msg.role === 'assistant'
                      ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 rounded-tl-none prose dark:prose-invert prose-sm max-w-[85%] border border-gray-100 dark:border-white/5'
                      : 'bg-indigo-600 text-white rounded-tr-none max-w-[75%] shadow-lg shadow-indigo-500/20'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown 
                        rehypePlugins={[rehypeHighlight]}
                        components={MarkdownComponents}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              
              {messages.length === 1 && !loading && (
                <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-2">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(null, action.label)}
                        className="flex items-center gap-2 p-2.5 text-left text-xs bg-gray-50 dark:bg-gray-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border border-gray-100 dark:border-white/5 rounded-xl transition-all hover:scale-[1.02] active:scale-95 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300"
                      >
                        <span className="p-1 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                          {action.icon}
                        </span>
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20">
                    <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-white/5">
                     <div className="flex gap-1.5">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></span>
                     </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-[#0f172a] border-t border-gray-100 dark:border-white/5">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Ask a coding question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="w-full bg-gray-50 dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700/50 rounded-2xl py-3.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-gray-900 dark:text-white transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AITutor;
