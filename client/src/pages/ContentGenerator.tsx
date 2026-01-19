import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { useContent, useGenerateContent } from "@/hooks/use-content";
import { Sparkles, Loader2, Copy, Check, PenTool } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export default function ContentGenerator() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  const { data: content, isLoading } = useContent();
  const generateMutation = useGenerateContent();
  const { toast } = useToast();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !niche) {
      toast({ title: "Validation Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    generateMutation.mutate({ topic, niche, count: 3 });
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "Copied!", description: "Content copied to clipboard." });
  };

  return (
    <div className="flex min-h-screen bg-background text-white">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
        <PageHeader 
          title="Content Generator" 
          description="AI-powered tweet generation tailored to your niche."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="glass-panel rounded-2xl p-6 border border-white/5 sticky top-8">
              <h3 className="text-lg font-bold font-display mb-6 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-primary" />
                Configuration
              </h3>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Topic / Angle</label>
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="e.g. Cold Email Tips"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Target Niche</label>
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="e.g. SaaS Founders"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={generateMutation.isPending}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {generateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Generate Magic
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold font-display mb-2">Generated Drafts</h3>
            
            {isLoading ? (
               <div className="flex items-center justify-center py-20">
                 <Loader2 className="w-8 h-8 text-primary animate-spin" />
               </div>
            ) : (
              <AnimatePresence>
                {content?.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card rounded-2xl p-6 border border-white/5 group relative"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-medium text-primary px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
                        {item.topic}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt!).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap font-medium">
                      {item.content}
                    </p>
                    <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => copyToClipboard(item.content, item.id)}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        {copiedId === item.id ? "Copied" : "Copy Tweet"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {(!content || content.length === 0) && (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h4 className="text-muted-foreground font-medium">No content generated yet</h4>
                <p className="text-sm text-muted-foreground/60 mt-1">Fill the form to get started</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
