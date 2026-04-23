import { useState } from "react";
import { useAgent } from "@/hooks/useAgent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, Bot, RefreshCw, CheckCircle2, MessageSquare, ChevronRight } from "lucide-react";

export default function App() {
  const { state, loading, error, submitAnswer, reset } = useAgent();
  const [inputValue, setInputValue] = useState("");

  const handleNext = () => {
    if (!inputValue) return;
    submitAnswer(inputValue);
    setInputValue("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    submitAnswer(suggestion);
    setInputValue("");
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="space-y-4 py-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            <h3 className="font-semibold mb-2">Error Encountered</h3>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={reset} variant="outline" className="w-full">
            Restart Session
          </Button>
        </div>
      );
    }

    if (!state.question && !state.completed && loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-in fade-in duration-1000">
          <RefreshCw className="w-12 h-12 text-primary animate-spin" />
          <h3 className="text-xl font-medium text-muted-foreground">Initializing Agent...</h3>
        </div>
      );
    }

    if (state.completed && state.finalScript) {
      return (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-700">
          <div className="flex items-center gap-3 text-green-500 mb-6">
            <CheckCircle2 className="w-6 h-6" />
            <h3 className="text-xl font-semibold text-foreground text-center">Your Breakthrough Strategy is Ready</h3>
          </div>
          
          <div className="prose prose-invert max-w-none p-6 rounded-xl bg-card border shadow-xl ring-1 ring-primary/20">
            <pre className="whitespace-pre-wrap font-sans text-sm md:text-base text-card-foreground leading-relaxed">
              {state.finalScript}
            </pre>
          </div>
          
          <Button onClick={reset} variant="outline" className="w-full gap-2 mt-8 py-6 text-lg border-primary/20 hover:bg-primary/5">
            <RefreshCw className="w-4 h-4" /> Start Another Breakthrough Session
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-8 min-h-[300px]">
        {/* Question Area */}
        <div className="space-y-3 animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            Step {state.step} of 9
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
            {state.question}
          </h2>
        </div>

        {/* Suggestions Grid */}
        {state.suggestions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            {state.suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-left p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-primary/5 hover:border-primary/30 transition-all group flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm font-medium pr-2">{suggestion}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* Custom Input */}
        <div className="pt-4 space-y-4">
          <div className="relative group">
            <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              disabled={loading}
              placeholder="Or type your own answer here..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
              className="pl-12 h-14 text-lg bg-background/50 border-border/50 focus-visible:ring-primary/30"
            />
          </div>
          
          <Button 
            disabled={!inputValue || loading}
            onClick={handleNext}
            className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-5 h-5 mr-2" />
            )}
            {loading ? "Strategizing..." : "Submit Answer"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 md:p-8 selection:bg-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-2xl relative z-10 space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-white shadow-xl shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Bot className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60">
              ELITE CONTENT OS
            </h1>
            <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">
              AI Strategic Operating System
            </p>
          </div>
        </div>

        <Card className="border-border/50 shadow-2xl backdrop-blur-xl bg-card/70 overflow-hidden ring-1 ring-white/5">
          <CardHeader className="bg-muted/50 border-b border-border/50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-ping' : 'bg-green-500'}`} />
                <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                  {loading ? 'AI Thinking' : 'Agent Ready'}
                </span>
              </div>
              {!state.completed && state.step > 0 && (
                <span className="text-xs font-mono text-muted-foreground/60">
                  SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()}
                </span>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {renderContent()}
          </CardContent>
        </Card>
        
        <div className="flex justify-center gap-6 text-muted-foreground/40 font-mono text-[10px] uppercase tracking-widest">
          <span>Model: Gemini 2.5 Flash</span>
          <span>Engine: Content Moat v2.0</span>
          <span>Status: Optimized</span>
        </div>
      </div>
    </div>
  );
}
