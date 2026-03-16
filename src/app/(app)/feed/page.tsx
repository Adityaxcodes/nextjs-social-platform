'use client';

import { Heart, MessageCircle, Share2, Search, Compass, Mail, Bookmark, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { CommentDrawer } from '@/components/ui_commentSection/comment-drawer';

interface Post {
  id: string;
  caption: string;
  mediaUrl: string;
  mediaType: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    image: string | null;
  };
}

function AutoPlayVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      muted
      loop
      playsInline
      className="w-full h-96 object-cover"
    />
  );
}

async function getPosts(): Promise<Post[]> {
  const res = await fetch('/api/posts', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

function formatDate(iso: string) {
  const diff = new Date().getTime() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Feed() {
  const { data: session } = useSession();
  const username = (session?.user as { username?: string })?.username;
  const [isLoading, setIsLoading] = useState(true);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [activeComments, setActiveComments] = useState<{
    id: string; userId: string; username: string; avatar: string; text: string; timestamp: string;
  }[]>([]);

  useEffect(() => {
    getPosts().then((data) => {
      setPosts(data);
      setIsLoading(false);
    });
  }, []);

  const toggleLike = (postId: string) => {
    setLikes((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const openComments = async (postId: string) => {
    setActivePostId(postId);
    setActiveComments([]);
    setCommentDrawerOpen(true);
    const res = await fetch(`/api/comment?postId=${postId}`);
    if (res.ok) {
      const data = await res.json();
      setActiveComments(
        data.map((c: { id: string; userId: string; content: string; createdAt: string; user: { username: string; image: string | null } }) => ({
          id: c.id,
          userId: c.userId,
          username: c.user.username,
          avatar: c.user.image ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user.username}`,
          text: c.content,
          timestamp: c.createdAt,
        }))
      );
    }
  };

  const handleSubmitComment = async (text: string) => {
    if (!activePostId) return;
    const res = await fetch('/api/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: activePostId, content: text }),
    });
    if (res.ok) {
      await openComments(activePostId);
    }
  };

  const getInitials = (username: string) => username.slice(0, 2).toUpperCase();

  const stories = [
    { id: 1, name: 'Your Story', avatar: 'YOU', hasStory: false },
    { id: 2, name: 'TechStart', avatar: 'TS', hasStory: true },
    { id: 3, name: 'VentureCo', avatar: 'VC', hasStory: true },
    { id: 4, name: 'InnovateLabs', avatar: 'IL', hasStory: true },
    { id: 5, name: 'FutureFund', avatar: 'FF', hasStory: true },
    { id: 6, name: 'LaunchPad', avatar: 'LP', hasStory: true },
  ];

  const suggestions = [
    { name: 'StartupDaily', handle: '@startupdaily', followers: '245K', isFollowing: false },
    { name: 'TechNews', handle: '@technewstoday', followers: '580K', isFollowing: false },
    { name: 'VentureInsider', handle: '@ventureinsider', followers: '125K', isFollowing: false },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-0 py-6 sm:px-4">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 space-y-6">
              <div className="overflow-x-auto bg-card border border-border rounded-2xl shadow-md">
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-gradient-to-r from-background via-background to-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg">
        <div className="mx-auto max-w-full px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex flex-shrink-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground font-bold text-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Image
                  src="/assets/connective%20logo.png"
                  alt="Connective logo"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                  priority
                />
              </div>
              <span className="hidden font-bold text-lg text-foreground bg-clip-text sm:inline">Connective</span>
            </div>

            {/* Search */}
            <div className="hidden flex-1 items-center rounded-full bg-muted/50 backdrop-blur px-4 md:flex md:max-w-xs lg:max-w-sm border border-border/50 hover:border-border transition-colors duration-300 focus-within:ring-2 focus-within:ring-primary/50">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search startups, posts..."
                className="ml-2 w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-6">
              <button className="hidden text-foreground hover:text-primary sm:block transition-colors duration-300 hover:scale-110 transform">
                <Compass className="h-6 w-6" />
              </button>
              <button className="text-foreground hover:text-primary transition-colors duration-300 hover:scale-110 transform">
                <Mail className="h-6 w-6" />
              </button>
              <Link
                href="/create"
                className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all duration-300 hover:scale-110 transform shadow-md font-bold text-xl leading-none"
                title="Create Post"
              >
                +
              </Link>
              <Link
                href={username ? `/profile/${username}` : '/profile'}
                className="text-foreground hover:text-primary transition-colors duration-300 hover:scale-110 transform"
              >
                <User className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-0 py-6 sm:px-4">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Feed */}
          <div className="flex-1 space-y-6">
            {/* Stories Section */}
            <div className="overflow-x-auto bg-card border border-border rounded-2xl shadow-md">
              <div className="flex gap-4 px-4 py-5 sm:px-6">
                {stories.map((story) => (
                  <button
                    key={story.id}
                    className="flex flex-col items-center gap-2 flex-shrink-0 group"
                  >
                    <div
                      className={`flex h-20 w-20 items-center justify-center rounded-full font-bold text-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${
                        story.hasStory
                          ? 'bg-gradient-to-br from-primary via-accent to-primary text-primary-foreground shadow-md'
                          : 'bg-muted text-foreground border-2 border-border group-hover:border-primary'
                      }`}
                    >
                      {story.avatar}
                    </div>
                    <span className="max-w-20 text-center text-xs truncate text-foreground font-medium group-hover:text-primary transition-colors">
                      {story.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.length === 0 && !isLoading && (
                <div className="text-center py-16 text-muted-foreground">No posts yet. Be the first to share!</div>
              )}
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="border border-border rounded-2xl bg-card overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1"
                  onMouseEnter={() => setHoveredPost(post.id)}
                  onMouseLeave={() => setHoveredPost(null)}
                >
                  {/* Post Header */}
                  <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-gradient-to-r from-card via-card to-card/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                        {post.author.image ? (
                          <img src={post.author.image} alt={post.author.username} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          getInitials(post.author.username)
                        )}
                      </div>
                      <div>
                        <Link href={`/profile/${post.author.username}`} className="font-bold text-foreground text-sm hover:text-primary transition-colors">{post.author.username}</Link>
                        <p className="text-xs text-muted-foreground">@{post.author.username}</p>
                      </div>
                    </div>
                    <button className="text-muted-foreground hover:text-primary hover:scale-125 transition-all duration-200 p-2">
                      <span className="text-xl">&bull;&bull;&bull;</span>
                    </button>
                  </div>

                  {/* Post Media */}
                  {post.mediaUrl && (
                    <div className="relative overflow-hidden bg-muted/50">
                      {post.mediaType === 'video' ? (
                        <AutoPlayVideo src={post.mediaUrl} />
                      ) : (
                        <img
                          src={post.mediaUrl}
                          alt={post.caption}
                          className={`w-full h-96 object-cover transition-transform duration-500 ${hoveredPost === post.id ? 'scale-110' : 'scale-100'}`}
                        />
                      )}
                      {post.mediaType !== 'video' && hoveredPost === post.id && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      )}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between border-b border-border/50 px-4 py-4 bg-gradient-to-r from-card to-card/50 gap-4">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 transform hover:scale-125"
                      >
                        <Heart
                          className={`h-6 w-6 transition-all duration-300 ${
                            likes[post.id]
                              ? 'fill-primary text-primary scale-125 animate-pulse'
                              : 'group-hover:text-primary'
                          }`}
                        />
                      </button>
                      <button
                        className="group text-muted-foreground hover:text-primary transition-all duration-300 transform hover:scale-125"
                        onClick={() => openComments(post.id)}
                      >
                        <MessageCircle className="h-6 w-6 group-hover:text-primary transition" />
                      </button>
                      <button className="group text-muted-foreground hover:text-primary transition-all duration-300 transform hover:scale-125">
                        <Share2 className="h-6 w-6 group-hover:text-primary transition" />
                      </button>
                    </div>
                    <button className="group text-muted-foreground hover:text-primary transition-all duration-300 transform hover:scale-125">
                      <Bookmark className="h-6 w-6 group-hover:text-primary transition" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 py-3 bg-card">
                    <p className="text-sm text-foreground leading-relaxed">
                      <Link href={`/profile/${post.author.username}`} className="font-bold text-foreground hover:text-primary transition-colors">{post.author.username}</Link>{' '}
                      <span className="text-foreground/90">{post.caption}</span>
                    </p>
                  </div>

                  {/* Post Footer */}
                  <div className="border-t border-border/50 px-4 py-3 bg-gradient-to-r from-card/30 to-card/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden space-y-6 lg:block lg:w-80 flex-shrink-0">
            {/* Search Mobile Placeholder */}
            <div className="sticky top-20 space-y-6">
              {/* Suggestions */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="mb-4 text-sm font-bold text-foreground bg-clip-text">
                  Suggestions For You
                </h3>
                <div className="space-y-4">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.handle}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200 group"
                    >
                      <div>
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {suggestion.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {suggestion.handle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {suggestion.followers} followers
                        </p>
                      </div>
                      <button className="rounded-full bg-gradient-to-r from-primary to-accent px-4 py-1.5 text-xs font-bold text-primary-foreground hover:shadow-lg hover:scale-105 transition-all duration-300">
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Section */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="mb-4 text-sm font-bold text-foreground bg-clip-text">
                  Trending Topics
                </h3>
                <div className="space-y-3">
                  {[
                    { topic: 'Series A Funding', posts: '145K posts' },
                    { topic: 'AI Innovation', posts: '892K posts' },
                    { topic: 'Startup Life', posts: '234K posts' },
                  ].map((item) => (
                    <button
                      key={item.topic}
                      className="w-full text-left hover:bg-accent/10 rounded-lg p-3 transition-all duration-200 group border border-transparent hover:border-primary/30"
                    >
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.topic}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.posts}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CommentDrawer
        open={commentDrawerOpen}
        onOpenChange={setCommentDrawerOpen}
        comments={activeComments}
        onSubmitComment={handleSubmitComment}
        currentUser={{
          username: (session?.user as { username?: string })?.username ?? 'You',
          avatar: session?.user?.image ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=user`,
        }}
      />
    </div>
  );
}
