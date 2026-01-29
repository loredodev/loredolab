
import React, { useState, useEffect } from 'react';
import { Language, User } from '../../types';
import { Trophy, Users, ThumbsUp, MessageCircle, Send, Filter, Crown, X, LogOut, Loader2 } from 'lucide-react';
import { ALL_CHALLENGES, CHALLENGE_CATEGORIES_LIST, Challenge } from '../../data/challenges';
import { getUserChallenges, joinChallenge, leaveChallenge } from '../../services/tracking';
import { CONTENT } from '../../constants';

interface GamificationHubProps {
  lang: Language;
  user: User;
}

interface FeedComment {
    id: number;
    author: string;
    text: string;
    time: string;
}

interface FeedPost {
    id: number;
    author: string;
    content: string;
    likes: number;
    liked?: boolean;
    time: string;
    comments: FeedComment[];
}

const LEADERBOARD = [
    { rank: 1, name: "You", points: 0, avatar: "ME", trend: 'same' },
];

const INITIAL_FEED = (lang: Language): FeedPost[] => [];

export const GamificationHub: React.FC<GamificationHubProps> = ({ lang, user }) => {
  const t = CONTENT[lang].gamification;
  const isPt = lang === 'pt';

  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard' | 'community'>('challenges');
  const [challenges, setChallenges] = useState<Challenge[]>(ALL_CHALLENGES);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  
  // Feed State
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  
  // Comment State
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Hydrate data
  useEffect(() => {
      const loadUserChallenges = async () => {
          setLoadingChallenges(true);
          const joinedIds = await getUserChallenges(user.id);
          setChallenges(prev => prev.map(c => ({
              ...c,
              joined: joinedIds.includes(c.id)
          })));
          setLoadingChallenges(false);
      };
      
      loadUserChallenges();

      if (feed.length === 0) {
          setFeed(INITIAL_FEED(lang));
      }
  }, [lang, user.id]);

  const handleToggleChallenge = async (id: string) => {
      // Optimistic Update
      const target = challenges.find(c => c.id === id);
      if (!target) return;
      
      const newStatus = !target.joined;
      setChallenges(prev => prev.map(c => c.id === id ? { ...c, joined: newStatus } : c));

      // DB Sync
      if (newStatus) {
          await joinChallenge(user.id, id);
      } else {
          await leaveChallenge(user.id, id);
      }
  };

  const handlePost = () => {
      if (!newPostContent.trim()) return;
      
      const post: FeedPost = {
          id: Date.now(),
          author: "You",
          content: newPostContent,
          likes: 0,
          comments: [],
          time: isPt ? 'Agora' : 'Just now'
      };
      
      setFeed([post, ...feed]);
      setNewPostContent('');
  };

  const handleLike = (id: number) => {
      setFeed(prev => prev.map(p => {
          if (p.id !== id) return p;
          return { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked };
      }));
  };

  const handleSubmitComment = (postId: number) => {
      if (!commentInput.trim()) return;
      
      const newComment: FeedComment = {
          id: Date.now(),
          author: "You",
          text: commentInput,
          time: isPt ? 'Agora' : 'Just now'
      };

      setFeed(prev => prev.map(p => {
          if (p.id !== postId) return p;
          return { ...p, comments: [...p.comments, newComment] };
      }));

      setCommentInput('');
  };

  // Filter Logic
  const filteredChallenges = challenges.filter(c => 
      selectedCategory === 'ALL' || c.category === selectedCategory
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
                <h1 className="text-3xl font-bold text-lab-900">{t.title}</h1>
                <p className="text-lab-500 mt-1">{t.subtitle}</p>
            </div>
            <div className="flex bg-lab-100 p-1 rounded-lg">
                <button onClick={() => setActiveTab('challenges')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'challenges' ? 'bg-white shadow-sm text-primary-700' : 'text-lab-500 hover:text-lab-900'}`}>{t.tabs.challenges}</button>
                <button onClick={() => setActiveTab('leaderboard')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-white shadow-sm text-primary-700' : 'text-lab-500 hover:text-lab-900'}`}>{t.tabs.leaderboard}</button>
                <button onClick={() => setActiveTab('community')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'community' ? 'bg-white shadow-sm text-primary-700' : 'text-lab-500 hover:text-lab-900'}`}>{t.tabs.feed}</button>
            </div>
        </header>

        {/* --- CHALLENGES TAB --- */}
        {activeTab === 'challenges' && (
            <div className="space-y-6">
                
                {/* Category Filter Chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button 
                        onClick={() => setSelectedCategory('ALL')}
                        className={`flex items-center px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                            selectedCategory === 'ALL' 
                            ? 'bg-lab-900 text-white border-lab-900' 
                            : 'bg-white text-lab-600 border-lab-200 hover:bg-lab-50'
                        }`}
                    >
                        <Filter className="w-3 h-3 mr-2" />
                        {t.filters.all}
                    </button>
                    {CHALLENGE_CATEGORIES_LIST.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                                selectedCategory === cat.id 
                                ? 'bg-primary-600 text-white border-primary-600' 
                                : 'bg-white text-lab-600 border-lab-200 hover:bg-lab-50'
                            }`}
                        >
                            {isPt ? cat.label_pt : cat.label_en}
                        </button>
                    ))}
                </div>

                {loadingChallenges ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-primary-600" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredChallenges.map(c => (
                            <div key={c.id} className={`bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col h-full ${c.joined ? 'border-primary-200 bg-primary-50/30' : 'border-lab-200'}`}>
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Trophy className="w-24 h-24 text-primary-600" />
                                </div>
                                <div className="relative z-10 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-primary-50 text-primary-700 p-2 rounded-lg font-bold text-xl">{c.reward}</div>
                                        <span className="text-xs font-bold bg-lab-100 text-lab-600 px-2 py-1 rounded-full flex items-center">
                                            <Users className="w-3 h-3 mr-1" /> {c.participants}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-lab-900 mb-1 leading-tight">{isPt ? c.title_pt : c.title_en}</h3>
                                    <p className="text-sm text-lab-500 mb-4 flex-grow">{isPt ? c.desc_pt : c.desc_en}</p>
                                    
                                    {c.joined ? (
                                        <div className="space-y-2 mt-auto animate-in fade-in">
                                            <div className="flex justify-between text-xs font-bold text-lab-600">
                                                <span>{t.cards.progress}</span>
                                                <span>{c.progress}%</span>
                                            </div>
                                            <div className="w-full bg-lab-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-primary-600 h-full transition-all duration-1000" style={{ width: `${c.progress}%` }}></div>
                                            </div>
                                            <div className="flex gap-2 mt-4">
                                                <button className="flex-1 bg-white border border-primary-200 text-primary-700 py-2 rounded-lg font-bold text-sm hover:bg-primary-50 transition">
                                                    {t.cards.continue}
                                                </button>
                                                <button 
                                                    onClick={() => handleToggleChallenge(c.id)}
                                                    className="px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg font-bold text-sm hover:bg-red-100 transition flex items-center justify-center"
                                                    title={t.cards.leave}
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleToggleChallenge(c.id)}
                                            className="w-full mt-auto bg-lab-900 text-white py-2 rounded-lg font-bold text-sm hover:bg-lab-800 transition shadow-sm hover:shadow"
                                        >
                                            {t.cards.join}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {!loadingChallenges && filteredChallenges.length === 0 && (
                    <div className="text-center py-20 bg-lab-50 rounded-xl border border-dashed border-lab-200 text-lab-400">
                        {t.cards.empty}
                    </div>
                )}
            </div>
        )}

        {/* --- LEADERBOARD TAB --- */}
        {activeTab === 'leaderboard' && (
            <div className="bg-white rounded-2xl border border-lab-200 shadow-sm overflow-hidden max-w-3xl mx-auto">
                <div className="p-6 border-b border-lab-100 bg-lab-50 flex justify-between items-center">
                    <h3 className="font-bold text-lab-900 flex items-center">
                        <Crown className="w-5 h-5 mr-2 text-amber-500" /> {t.leaderboard.title}
                    </h3>
                    <div className="text-sm text-lab-500">{t.leaderboard.updated}</div>
                </div>
                {LEADERBOARD.map((user, idx) => (
                    <div key={idx} className={`flex items-center p-4 border-b border-lab-100 last:border-0 ${user.name === 'You' ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''}`}>
                        <div className="w-8 text-center font-bold text-lab-400 mr-4">#{user.rank}</div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm mr-4">
                            {user.avatar}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-lab-900">{user.name}</div>
                            <div className="text-xs text-lab-500">{t.leaderboard.rank}</div>
                        </div>
                        <div className="text-right">
                            <div className="font-mono font-bold text-primary-700">{user.points.toLocaleString()} pts</div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* --- COMMUNITY FEED TAB --- */}
        {activeTab === 'community' && (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white p-4 rounded-xl border border-lab-200 shadow-sm flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold shrink-0">ME</div>
                    <div className="flex-1">
                        <textarea 
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder={t.feed.placeholder}
                            className="w-full bg-transparent outline-none text-sm resize-none h-20"
                        ></textarea>
                        <div className="flex justify-end pt-2 border-t border-lab-100">
                            <button 
                                onClick={handlePost}
                                disabled={!newPostContent.trim()}
                                className="bg-primary-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                {t.feed.post} <Send className="w-3 h-3 ml-2" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {feed.length === 0 && (
                        <div className="text-center py-10 text-lab-400 text-sm italic">
                            {t.feed.empty}
                        </div>
                    )}
                    {feed.map(post => (
                        <div key={post.id} className="bg-white p-6 rounded-xl border border-lab-200 shadow-sm animate-in slide-in-from-top-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm border border-indigo-200">
                                    {post.author.substring(0,2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-bold text-lab-900">{post.author}</div>
                                    <div className="text-xs text-lab-400">{post.time}</div>
                                </div>
                            </div>
                            <p className="text-lab-800 text-sm leading-relaxed mb-4">{post.content}</p>
                            
                            <div className="flex items-center gap-6 text-lab-500 text-sm border-t border-lab-100 pt-3">
                                <button 
                                    onClick={() => handleLike(post.id)}
                                    className={`flex items-center transition ${post.liked ? 'text-primary-600 font-bold' : 'hover:text-primary-600'}`}
                                >
                                    <ThumbsUp className={`w-4 h-4 mr-1.5 ${post.liked ? 'fill-current' : ''}`} /> 
                                    {post.likes}
                                </button>
                                <button 
                                    onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                                    className={`flex items-center hover:text-primary-600 transition ${activeCommentPostId === post.id ? 'text-primary-600' : ''}`}
                                >
                                    <MessageCircle className="w-4 h-4 mr-1.5" /> 
                                    {post.comments.length}
                                </button>
                            </div>

                            {/* Comment Section */}
                            {activeCommentPostId === post.id && (
                                <div className="mt-4 pt-4 border-t border-lab-100 animate-in fade-in">
                                    {/* Existing Comments */}
                                    <div className="space-y-3 mb-4">
                                        {post.comments.length === 0 && (
                                            <p className="text-xs text-lab-400 italic">{t.feed.comments}</p>
                                        )}
                                        {post.comments.map(comment => (
                                            <div key={comment.id} className="bg-lab-50 p-3 rounded-lg text-sm">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <span className="font-bold text-lab-800 text-xs">{comment.author}</span>
                                                    <span className="text-[10px] text-lab-400">{comment.time}</span>
                                                </div>
                                                <p className="text-lab-700">{comment.text}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Input */}
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={commentInput}
                                            onChange={(e) => setCommentInput(e.target.value)}
                                            placeholder={t.feed.writeComment}
                                            className="flex-1 bg-lab-50 border border-lab-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500 outline-none"
                                            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
                                        />
                                        <button 
                                            onClick={() => handleSubmitComment(post.id)}
                                            className="p-2 bg-lab-900 text-white rounded-lg hover:bg-lab-800"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};
