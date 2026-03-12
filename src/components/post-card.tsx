'use client';

import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import CommentSection from '@/components/commentSection';

interface PostCardProps {
  postId: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  timestamp: string;
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments: number;
  shares: number;
  liked?: boolean;
}

export function PostCard({
  postId,
  author,
  timestamp,
  content,
  image,
  video,
  likes,
  comments,
  shares,
  liked = false,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors">
      {/* Header with Author Info */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="font-semibold text-slate-900 text-sm">{author.name}</p>
              <p className="text-slate-500 text-xs">{author.handle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">{timestamp}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-700"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 py-4">
        <p className="text-slate-800 text-base leading-relaxed">{content}</p>
      </div>

      {/* Optional Post Image */}
      {image && (
        <div className="px-6 pb-4">
          <img
            src={image}
            alt="Post content"
            className="w-full rounded-lg object-cover max-h-96"
          />
        </div>
      )}

      {/* Optional Post Video */}
      {video && (
        <div className="px-6 pb-4">
          <div className="w-full rounded-lg bg-slate-100 flex items-center justify-center max-h-96 min-h-[200px]">
            <div className="text-center text-slate-500">
              <div className="text-4xl mb-2">🎥</div>
              <p className="text-sm">Video content</p>
              <p className="text-xs mt-1">Click to play</p>
            </div>
          </div>
        </div>
      )}

      {/* Engagement Stats */}
      <div className="px-6 py-3 border-t border-b border-slate-100 text-xs text-slate-600 flex justify-between">
        <span>{likeCount} likes</span>
        <div className="flex gap-4">
          <span>{comments} comments</span>
          <span>{shares} shares</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
            isLiked
              ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
              : 'text-slate-700 hover:text-red-600 hover:bg-red-50'
          }`}
          onClick={handleLike}
        >
          <Heart
            className="h-5 w-5"
            fill={isLiked ? 'currentColor' : 'none'}
          />
          Like
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50"
        >
          <MessageCircle className="h-5 w-5" />
          Comment
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:text-green-600 hover:bg-green-50"
        >
          <Share2 className="h-5 w-5" />
          Share
        </Button>
      </div>

      <CommentSection postId={postId} />
    </div>
  );
}
