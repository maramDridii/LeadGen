import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { useMonitorTweets, useTweets } from "@/hooks/use-tweets";
import { Search, Loader2, MessageCircle, Repeat2, Heart, ExternalLink, Twitter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TweetMonitor() {
  const [offer, setOffer] = useState("");
  const { data: tweets, isLoading } = useTweets();
  const monitorMutation = useMonitorTweets();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offer.trim()) return;
    monitorMutation.mutate({ offer });
  };

  return (
    <div className="flex min-h-screen bg-background text-white">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
        <PageHeader 
          title="Tweet Monitor" 
          description="Real-time surveillance of relevant conversations and opportunities."
        />

        <div className="glass-panel rounded-2xl p-6 mb-8 border border-white/5 shadow-2xl">
          <form onSubmit={handleScan} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Your Offer / Keyword to Match
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="text" 
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  placeholder="e.g. 'Web development services' or 'Looking for SaaS'"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={monitorMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {monitorMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Scan Network"}
            </button>
          </form>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {tweets?.map((tweet, index) => (
                <motion.div 
                  key={tweet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card rounded-2xl p-6 flex flex-col h-full border border-white/5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-sm font-bold border border-white/10">
                        {tweet.authorUsername.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">@{tweet.authorUsername}</h4>
                        <span className="text-xs text-muted-foreground">Just now</span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-bold border ${
                      (tweet.relevanceScore || 0) > 80 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {(tweet.relevanceScore || 0)}% Match
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-6 flex-1 leading-relaxed">
                    {tweet.content}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        <span>--</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Repeat2 className="w-3.5 h-3.5" />
                        <span>--</span>
                      </div>
                    </div>
                    <a 
                      href={`https://twitter.com/${tweet.authorUsername}/status/${tweet.twitterId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                    >
                      View Tweet <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {(!tweets || tweets.length === 0) && (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Twitter className="w-8 h-8 opacity-20" />
                </div>
                <p>No tweets found yet. Try running a scan above.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
