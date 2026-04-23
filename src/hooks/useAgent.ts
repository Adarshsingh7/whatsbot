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

  const cleanJson = (text: string) => {
    try {
      const cleaned = text.replace(/```json\n?|```/g, "").trim();
      return cleaned;
    } catch (e) {
      return text;
    }
  };

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
      
      const result = await chatRef.current.sendMessage("INITIALIZE: You are the Elite Content OS. Start Phase 1 (Discovery) immediately. Ask Question 1 (Topic or niche?) and provide suggestions.");
      const text = result.response.text();
      const response = JSON.parse(cleanJson(text));
      
      setState({
        question: response.question || "Topic or niche?",
        suggestions: response.suggestions || ["Business", "Tech", "Lifestyle", "Finance", "Gaming", "Health"],
        step: response.step || 1,
        finalScript: null,
        completed: false,
      });
    } catch (err: any) {
      console.error("Agent Init Error:", err);
      setError("Initialization failed. Check API key and connection.");
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
      const text = result.response.text();
      const response = JSON.parse(cleanJson(text));

      console.log("AI Response:", response);

      if (response.completed || response.final_strategy || response.final_script) {
        // FOOLPROOF: Force anything that isn't a string to become a string
        const data = response.final_strategy || response.final_script || response;
        const finalString = typeof data === "string" ? data : JSON.stringify(data, null, 2);

        setState({
          question: null,
          suggestions: [],
          step: 10,
          finalScript: finalString,
          completed: true,
        });
      } else {
        setState({
          question: response.question || "Next step?",
          suggestions: response.suggestions || [],
          step: response.step || 1,
          finalScript: null,
          completed: false,
        });
      }
    } catch (err: any) {
      console.error("Submit Error:", err);
      setError("Strategic engine timeout. Please try again.");
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

  return { state, loading, error, submitAnswer, reset };
}
