import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
import { AGENT_PROMPT } from "@/lib/prompt";

export interface AgentState {
  question: string | null;
  suggestions: string[];
  step: number;
  finalScript: string | null;
  completed: boolean;
}

export function useAgent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<AgentState>({
    question: null,
    suggestions: [],
    step: 0,
    finalScript: null,
    completed: false,
  });

  const chatRef = useRef<ChatSession | null>(null);

  const initAgent = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError("Gemini API Key is missing in .env file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: JSON.stringify(AGENT_PROMPT, null, 2),
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      chatRef.current = model.startChat();
      
      // Start the conversation
      const result = await chatRef.current.sendMessage("Start the discovery step. Ask the first question.");
      const response = JSON.parse(result.response.text());
      
      setState({
        question: response.question,
        suggestions: response.suggestions || [],
        step: response.step || 1,
        finalScript: null,
        completed: false,
      });
    } catch (err: any) {
      console.error(err);
      setError("Failed to initialize agent. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answer: string) => {
    if (!chatRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const result = await chatRef.current.sendMessage(answer);
      const response = JSON.parse(result.response.text());

      if (response.completed) {
        setState(prev => ({
          ...prev,
          question: null,
          suggestions: [],
          finalScript: response.final_script,
          completed: true,
        }));
      } else {
        setState(prev => ({
          question: response.question,
          suggestions: response.suggestions || [],
          step: response.step || prev.step + 1,
          finalScript: null,
          completed: false,
        }));
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to submit answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    chatRef.current = null;
    setState({
      question: null,
      suggestions: [],
      step: 0,
      finalScript: null,
      completed: false,
    });
    initAgent();
  };

  useEffect(() => {
    initAgent();
  }, []);

  return {
    state,
    loading,
    error,
    submitAnswer,
    reset,
  };
}
