import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, MessageCircle, Share2, Award, Sparkles, Image as ImageIcon, Search, Trophy, Globe, Star, TrendingUp, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState({}); // { postId: boolean }
  const [commentText, setCommentText] = useState({}); // { postId: string }
  const [isCommenting, setIsCommenting] = useState({}); // { postId: boolean }

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const { data } = await api.get('/posts');
      setPosts(data.data);
    } catch (err) {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setIsSubmitting(true);
    try {
      const { data } = await api.post('/posts', { content: newPost });
      setPosts([data.data, ...posts]);
      setNewPost('');
      toast.success('Post shared!');
    } catch (err) {
      toast.error('Failed to share post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLikedByMe = (likes) => {
    if (!likes || !user?._id) return false;
    return likes.some(id => (id._id || id).toString() === user._id.toString());
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await api.put(`/posts/${postId}/like`);
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, likes: data.isLiked 
              ? [...post.likes, { _id: user._id }] // Store as object for consistency
              : post.likes.filter(id => (id._id || id).toString() !== user._id.toString()) 
            }
          : post
      ));
    } catch (err) {
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;

    setIsCommenting({ ...isCommenting, [postId]: true });
    try {
      const { data } = await api.post(`/posts/${postId}/comment`, { text });
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, comments: [data.data, ...post.comments] }
          : post
      ));
      setCommentText({ ...commentText, [postId]: '' });
      toast.success('Comment added!');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting({ ...isCommenting, [postId]: false });
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-vh-100 pt-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  const PostSkeleton = () => (
    <div className="bg-white dark:bg-[#0f172a]/80 p-6 rounded-[32px] border border-gray-100 dark:border-white/10 animate-pulse mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        {/* Left Sidebar - Hidden on small, shown on Desktop */}
        <div className="hidden lg:block lg:col-span-3 sticky top-24 self-start">
          <div className="glass-panel p-6 rounded-[32px] overflow-hidden relative group border border-white/5 shadow-2xl transition-all duration-500 hover:shadow-indigo-500/10">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-transparent opacity-10 group-hover:opacity-20 transition-all duration-700" />
            <div className="relative pt-8 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black border-4 border-white dark:border-[#0f172a] shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h3 className="mt-5 font-black text-xl dark:text-white tracking-tight">{user?.name}</h3>
              <p className="text-sm font-bold text-indigo-400 opacity-80 uppercase tracking-widest mt-1">Elite Coder</p>
              
              <div className="mt-8 w-full grid grid-cols-2 gap-4 border-t border-white/5 pt-8">
                <div className="text-center group/stat cursor-default">
                  <div className="text-2xl font-black dark:text-white group-hover/stat:text-indigo-400 transition-colors">{user?.points || 0}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Points</div>
                </div>
                <div className="text-center group/stat cursor-default">
                  <div className="text-2xl font-black dark:text-white group-hover/stat:text-purple-400 transition-colors">{user?.streak || 0}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Streak</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <h4 className="font-bold mb-4 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Trending Topics
            </h4>
            <div className="space-y-3">
              {['#ReactHooks', '#JavaScript2024', '#CleanCode', '#WebDev'].map(tag => (
                <div key={tag} className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="col-span-1 lg:col-span-6 space-y-6 sm:space-y-8">
          {/* Mobile Profile Card - Only on small screens */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden bg-white dark:bg-[#0f172a]/80 p-5 sm:p-6 rounded-[32px] border border-gray-100 dark:border-white/10 flex items-center gap-5"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-1 shrink-0">
              <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center text-white text-xl font-black border-2 border-[#0f172a]">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">{user?.name}</h3>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full border border-indigo-400/20 uppercase tracking-widest">
                   {user?.points || 0} XP
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest">
                   {user?.streak || 0} Day Streak
                </span>
              </div>
            </div>
          </motion.div>

          {/* Share Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#0f172a]/80 p-5 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-gray-100 dark:border-white/10 shadow-2xl shadow-indigo-500/5 relative overflow-hidden group"
          >
            <form onSubmit={handleSubmit}>
              <div className="flex gap-4">
                <div className="hidden sm:flex w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex-shrink-0 items-center justify-center text-white font-black ring-4 ring-indigo-500/5 dark:ring-white/5">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="Share your coding journey or achievement..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="w-full bg-gray-50/50 dark:bg-[#1e293b]/40 border border-gray-200 dark:border-white/5 rounded-2xl p-4 sm:p-5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all resize-none h-28 sm:h-32 text-sm sm:text-base font-medium placeholder-slate-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center gap-1 sm:gap-2 text-gray-400 dark:text-gray-500">
                  <button type="button" className="p-2 hover:bg-indigo-500/10 hover:text-indigo-400 rounded-xl transition-all">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button type="button" className="p-2 hover:bg-yellow-500/10 hover:text-yellow-400 rounded-xl transition-all">
                    <Award className="w-5 h-5" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!newPost.trim() || isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl font-black flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20 text-sm"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sharing...' : 'Share'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Posts List */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : posts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-panel p-6 rounded-3xl"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold border-2 border-white dark:border-gray-800 shadow-md">
                        {post.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold dark:text-white flex items-center gap-2">
                          {post.user?.name}
                          {post.type === 'achievement' && (
                            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 text-[10px] px-2 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-500/20 uppercase tracking-widest font-bold">
                              Achievement
                            </span>
                          )}
                          {post.type === 'review' && (
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-green-200 dark:border-green-500/20 uppercase tracking-widest font-bold">
                              Review
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                    {post.content}
                  </div>

                  {post.metadata?.quizTitle && (
                    <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-500/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                          <Trophy className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Quiz Completed</p>
                          <h5 className="font-bold dark:text-white">{post.metadata.quizTitle}</h5>
                          <p className="text-xs text-gray-500">Score: {post.metadata.score}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {post.type === 'review' && (
                    <div className="mt-4 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < (post.metadata?.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center gap-6">
                    <button 
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        isLikedByMe(post.likes) 
                          ? 'text-pink-600 dark:text-pink-400' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLikedByMe(post.likes) ? 'fill-current' : ''}`} />
                      {post.likes.length}
                    </button>
                    <button 
                      onClick={() => setShowComments({ ...showComments, [post._id]: !showComments[post._id] })}
                      className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {post.comments.length}
                    </button>
                    <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Comments Section */}
                  <AnimatePresence>
                    {showComments[post._id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 space-y-4">
                          {/* Comment Form */}
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                              {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                placeholder="Write a comment..."
                                value={commentText[post._id] || ''}
                                onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && handleComment(post._id)}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl py-2 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                              />
                              <button 
                                onClick={() => handleComment(post._id)}
                                disabled={isCommenting[post._id] || !commentText[post._id]?.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 disabled:opacity-30"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Comments List */}
                          <div className="space-y-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-500/20">
                            {post.comments.map((comment, i) => (
                              <div key={i} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-bold">
                                  {comment.user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 bg-gray-50 dark:bg-white/5 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-white/5">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold dark:text-white">{comment.user?.name}</span>
                                    <span className="text-[10px] text-gray-400">
                                      {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'just now'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{comment.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {posts.length === 0 && (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/5">
                <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No posts in the feed yet. Be the first to share something!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
