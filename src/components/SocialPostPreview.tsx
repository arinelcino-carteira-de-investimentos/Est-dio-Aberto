import React, { useState } from "react";
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bookmark, 
  MoreHorizontal, 
  ThumbsUp, 
  MessageSquare, 
  Repeat, 
  Share2, 
  Eye, 
  Clock, 
  Tv, 
  ArrowRight,
  Sparkles,
  Award
} from "lucide-react";
import { Post, AppState } from "../types";

interface SocialPostPreviewProps {
  post: Post;
  state: AppState;
}

export default function SocialPostPreview({ post, state }: SocialPostPreviewProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(Math.floor(Math.random() * 85) + 30);
  const [commentsCount, setCommentsCount] = useState(Math.floor(Math.random() * 15) + 3);
  const [readMore, setReadMore] = useState(false);

  const authorName = state.profile?.name || "Arinelcino de Souza";
  const authorAvatar = state.profile?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200";
  const authorRole = state.profile?.role || "Content Creator & Founder";
  const handleStr = authorName.toLowerCase().replace(/\s+/g, "_");

  const toggleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  // Switch based on channel
  const channelLower = post.channel ? post.channel.toLowerCase() : "linkedin";

  if (channelLower.includes("linkedin")) {
    return (
      <div id="mock-linkedin" className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-850 rounded-xl p-4 shadow-sm w-full font-sans text-left text-zinc-900 dark:text-zinc-100 max-w-md mx-auto">
        {/* LinkedIn Top Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src={authorAvatar} 
              alt={authorName} 
              className="w-12 h-12 rounded-full object-cover border border-zinc-200"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-zinc-900 hover:underline dark:text-zinc-50 cursor-pointer">
                  {authorName}
                </span>
                <span className="text-[10px] text-zinc-400 font-normal">• 1º</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-tight truncate max-w-[200px]">
                {authorRole} (Open Studio Author)
              </p>
              <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                <span>1 h</span>
                <span>•</span>
                <span className="text-[9px]">🌐</span>
              </p>
            </div>
          </div>
          <button type="button" className="text-zinc-400 hover:text-zinc-600">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-3.5 space-y-2.5 text-[12.5px] leading-relaxed">
          <p className="text-zinc-850 dark:text-zinc-200 whitespace-pre-wrap">
            {readMore || post.content.length < 160 
              ? post.content 
              : `${post.content.slice(0, 160)}...`}
          </p>
          {post.content.length >= 160 && (
            <button 
              type="button" 
              onClick={() => setReadMore(!readMore)}
              className="text-zinc-500 hover:text-zinc-700 font-semibold cursor-pointer text-xs"
            >
              {readMore ? "Exibir menos" : "... ler mais"}
            </button>
          )}
        </div>

        {/* Dynamic visual tag frame to add high fidelity */}
        <div className="bg-zinc-50 dark:bg-zinc-90 w-full rounded-lg border border-zinc-150 p-3.5 mt-3 space-y-1.5 pointer-events-none relative overflow-hidden">
          <div className="absolute right-2 top-2 bg-indigo-50 dark:bg-zinc-800 p-1 rounded-sm"><Award className="w-4 h-4 text-zinc-500" /></div>
          <p className="text-[10.5px] font-bold text-zinc-500 uppercase tracking-widest font-mono">TÓPICO CONTEMPLADO</p>
          <h4 className="text-[12.5px] font-bold text-zinc-800 dark:text-zinc-200">{post.title}</h4>
          <span className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-550 border border-zinc-250 cursor-pointer">
            #{post.keyword || "automation"}
          </span>
        </div>

        {/* Reaction Stats */}
        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-2.5 pt-3.5 text-[10.5px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center justify-center w-4 h-4 bg-blue-500 text-white rounded-full text-[8px]">👍</span>
            <span className="flex items-center justify-center w-4 h-4 bg-red-400 text-white rounded-full text-[8px]">❤️</span>
            <span>{likesCount} curtiram</span>
          </div>
          <span>{commentsCount} comentários • 1 compartilhamento</span>
        </div>

        {/* Action Toolbars */}
        <div className="flex items-center justify-between pt-1 border-b border-zinc-50">
          <button 
            type="button" 
            onClick={toggleLike}
            className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg text-xs font-semibold ${
              liked ? "text-blue-600" : "text-zinc-500 hover:bg-zinc-50"
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Gostei</span>
          </button>
          <button 
            type="button" 
            className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg text-xs font-semibold text-zinc-505 hover:bg-zinc-50"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comentar</span>
          </button>
          <button 
            type="button" 
            className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg text-xs font-semibold text-zinc-505 hover:bg-zinc-50"
          >
            <Repeat className="w-4 h-4" />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>
    );
  }

  if (channelLower.includes("instagram")) {
    return (
      <div id="mock-instagram" className="bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-850 rounded-xl overflow-hidden shadow-sm w-full font-sans text-left text-zinc-900 dark:text-zinc-100 max-w-md mx-auto">
        {/* Instagram Top Area */}
        <div className="flex items-center justify-between p-3 border-b border-zinc-100/60 dark:border-zinc-900">
          <div className="flex items-center gap-2.5">
            <img 
              src={authorAvatar} 
              alt={authorName} 
              className="w-8 h-8 rounded-full object-cover p-0.5 ring-2 ring-pink-500"
            />
            <div>
              <h4 className="text-xs font-bold font-sans tracking-tight leading-none">
                {handleStr}
              </h4>
              <span className="text-[9px] text-zinc-400 font-medium">Patrocínio Autônomo</span>
            </div>
          </div>
          <button type="button" className="text-zinc-400 hover:text-zinc-600">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Instagram Canvas Graphical Image Mock */}
        <div className="aspect-square w-full bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-700 flex flex-col justify-between p-6 relative">
          <div className="absolute inset-0 bg-[#000]/22 pointer-events-none"></div>
          <div className="flex justify-between items-center relative z-10">
            <span className="text-[9px] font-mono font-bold bg-white/20 text-white backdrop-blur-md px-2 py-1 rounded">
              OPEN STUDIO LIVE
            </span>
            <Sparkles className="w-5 h-5 text-[#d4af37]" />
          </div>
          
          <div className="space-y-2 relative z-10 text-center select-none py-4">
            <h3 className="text-base font-bold text-white tracking-tight leading-snug drop-shadow-md">
              {post.title}
            </h3>
            <p className="text-[11px] text-zinc-200 font-mono italic">
              #{post.keyword || "nocodestartup"}
            </p>
          </div>

          <div className="flex items-center justify-between relative z-10 pt-2 border-t border-white/20 text-white">
            <span className="text-[9px] font-medium tracking-wide">@{handleStr}</span>
            <span className="text-[9px] font-medium">nocodestartup.co 🚀</span>
          </div>
        </div>

        {/* Reaction Bar */}
        <div className="p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={toggleLike}
                className={liked ? "text-red-500 scale-110 transition-all" : "text-zinc-700 hover:text-black dark:text-zinc-200"}
              >
                <Heart className={`w-5 h-5 ${liked ? "fill-red-500" : ""}`} />
              </button>
              <MessageCircle className="w-5 h-5 text-zinc-700 dark:text-zinc-200 cursor-pointer" />
              <Send className="w-5 h-5 text-zinc-700 dark:text-zinc-200 cursor-pointer" />
            </div>
            <Bookmark className="w-5 h-5 text-zinc-70s hover:text-black cursor-pointer dark:text-zinc-200" />
          </div>

          {/* Likes info */}
          <p className="text-xs font-bold">
            {likesCount} curtidas
          </p>

          {/* Caption */}
          <div className="space-y-1">
            <p className="text-xs">
              <span className="font-bold mr-1.5">{handleStr}</span>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium whitespace-pre-wrap">
                {readMore || post.content.length < 130 
                  ? post.content 
                  : `${post.content.slice(0, 130)}...`}
              </span>
            </p>
            {post.content.length >= 130 && (
              <button 
                type="button" 
                onClick={() => setReadMore(!readMore)}
                className="text-[10px] text-zinc-400 font-semibold block"
              >
                {readMore ? "menos" : "mais"}
              </button>
            )}
          </div>

          {/* Post Timing */}
          <span className="text-[9px] text-zinc-400 font-mono block uppercase">
            HÁ 28 MINUTOS
          </span>
        </div>
      </div>
    );
  }

  if (channelLower.includes("twitter") || channelLower.includes("x")) {
    return (
      <div id="mock-twitter" className="bg-black border border-zinc-800 rounded-xl p-4 shadow-sm w-full font-sans text-left text-white max-w-md mx-auto">
        {/* Twitter Top Area */}
        <div className="flex items-start justify-between">
          <div className="flex gap-2.5">
            <img 
              src={authorAvatar} 
              alt={authorName} 
              className="w-10 h-10 rounded-full object-cover border border-zinc-800"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold hover:underline cursor-pointer">
                  {authorName}
                </span>
                <span className="text-[11px] text-zinc-500">@{handleStr}</span>
                <span className="text-[11px] text-zinc-500">· 14m</span>
              </div>
              <p className="text-[12.5px] leading-relaxed text-zinc-200 whitespace-pre-wrap mt-0.5">
                {post.content}
              </p>
            </div>
          </div>
          <button type="button" className="text-zinc-500">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Topic Badge preview */}
        <div className="ml-12 mt-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 space-y-1 pointer-events-none">
          <span className="text-[8px] font-mono text-[#d4af37] tracking-widest uppercase font-bold">X GRAPH INDICATOR</span>
          <h4 className="text-xs font-bold">{post.title}</h4>
          <p className="text-[10px] text-[#db2777]">#{post.keyword || "twitterdev"}</p>
        </div>

        {/* Action stats */}
        <div className="ml-12 flex justify-between items-center text-zinc-500 text-[11px] mt-4 pt-2.5 border-t border-zinc-900">
          <span className="hover:text-sky-500 flex items-center gap-1.5 cursor-pointer">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{commentsCount}</span>
          </span>
          <span className="hover:text-green-500 flex items-center gap-1.5 cursor-pointer">
            <Repeat className="w-3.5 h-3.5" />
            <span>12</span>
          </span>
          <button 
            type="button" 
            onClick={toggleLike}
            className={`flex items-center gap-1.5 cursor-pointer ${liked ? "text-rose-500" : "hover:text-rose-500"}`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-rose-500" : ""}`} />
            <span>{likesCount}</span>
          </button>
          <span className="hover:text-sky-500 flex items-center gap-1.5 cursor-pointer">
            <Eye className="w-3.5 h-3.5" />
            <span>{(likesCount * 35).toLocaleString("pt-BR")}</span>
          </span>
          <span className="hover:text-sky-500 cursor-pointer">
            <Share2 className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    );
  }

  // Fallback / Other channel layout
  return (
    <div id="mock-fallback" className="bg-slate-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-3.5 max-w-md mx-auto text-left text-zinc-800 dark:text-zinc-200">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">📢</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">FEED GLOBAL</h4>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-150">{post.channel} Preview</h3>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-zinc-400">Canal: {post.channel}</span>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{post.title}</h2>
        <p className="text-xs leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-800 p-2.5 rounded text-[10.5px] text-zinc-500 flex justify-between font-mono">
        <span>Foco: {post.keyword}</span>
        <span>Autor: {authorName}</span>
      </div>
    </div>
  );
}
