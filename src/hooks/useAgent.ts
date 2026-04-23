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

const DISCOVERY_QUESTIONS = [
  {
    question: "What is your primary topic or niche?",
    suggestions: ["Business & Entreprenuership", "Technology & AI", "Health & Fitness", "Personal Finance", "Lifestyle & Travel", "Gaming & Entertainment"]
  },
  {
    question: "Who is your target audience?",
    suggestions: ["Gen Z / Alpha", "Startup Founders", "Busy Professionals", "Stay-at-home Parents", "Students", "High-Net-Worth Individuals"]
  },
  {
    question: "What is your language preference?",
    suggestions: ["English", "Hindi", "Spanish", "French", "German", "Mixed / Hinglish"]
  },
  {
    question: "What is the primary goal of this content?",
    suggestions: ["Massive Reach (Viral)", "Building Trust (Authority)", "Generating Leads", "Driving Sales"]
  },
  {
    question: "What is your preferred video length?",
    suggestions: ["15 Seconds (Fast)", "30 Seconds (Standard)", "60 Seconds (Deep)", "90 Seconds (Story)"]
  },
  {
    question: "What vibe should we aim for?",
    suggestions: ["Safe & Inspiring (Viral)", "Aggressive & Polarizing (Breakout)", "Educational & Calm", "Fast-Paced & Chaotic"]
  },
  {
    question: "Which creator style should we emulate?",
    suggestions: ["MrBeast (Retention)", "Raj Shamani (Storytelling)", "Alex Hormozi (Persuasion)", "Hybrid (The Best of All)"]
  },
  {
    question: "Should we prioritize contrarian/hot-take angles?",
    suggestions: ["Yes, go aggressive", "No, keep it mainstream", "Maybe, subtle hooks only"]
  },
  {
    question: "Include trend-hijacking opportunities?",
    suggestions: ["Yes, find current trends", "No, keep it evergreen", "Only if relevant"]
  }
];

export function useAgent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [state, setState] = useState<AgentState>({
    question: DISCOVERY_QUESTIONS[0].question,
    suggestions: DISCOVERY_QUESTIONS[0].suggestions,
    step: 1,
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

  const generateFinalStrategy = async (allAnswers: string[]) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setError("Gemini API Key is missing");
      return;
    }

    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: JSON.stringify(AGENT_PROMPT, null, 2),
        generationConfig: { responseMimeType: "application/json" },
      });

      const prompt = `Generate the final viral strategy based on these answers:
      ${allAnswers.map((a, i) => `${DISCOVERY_QUESTIONS[i].question}: ${a}`).join("\n")}
      
      Follow the 'script_output' requirements and return in the requested JSON format with 'final_strategy'.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const response = JSON.parse(cleanJson(text));

      const data = response.final_strategy || response.final_script || response;
      const finalString = typeof data === "string" ? data : JSON.stringify(data, null, 2);

      setState(prev => ({
        ...prev,
        question: null,
        suggestions: [],
        finalScript: finalString,
        completed: true,
      }));
    } catch (err) {
      console.error(err);
      setError("Failed to generate strategy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answer: string) => {
    const nextStep = state.step + 1;
    const updatedAnswers = [...answers, answer];
    setAnswers(updatedAnswers);

    if (nextStep <= DISCOVERY_QUESTIONS.length) {
      // Local transition - INSTANT
      setState({
        question: DISCOVERY_QUESTIONS[nextStep - 1].question,
        suggestions: DISCOVERY_QUESTIONS[nextStep - 1].suggestions,
        step: nextStep,
        finalScript: null,
        completed: false,
      });
    } else {
      // Final step - Call AI
      await generateFinalStrategy(updatedAnswers);
    }
  };

  const reset = () => {
    setAnswers([]);
    setState({
      question: DISCOVERY_QUESTIONS[0].question,
      suggestions: DISCOVERY_QUESTIONS[0].suggestions,
      step: 1,
      finalScript: null,
      completed: false,
    });
  };

  return { state, loading, error, submitAnswer, reset };
}
