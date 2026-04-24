import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AGENT_PROMPT } from '@/lib/prompt';

export interface AgentState {
	question: string | null;
	suggestions: string[];
	step: number;
	finalScript: string | null;
	completed: boolean;
}

const DISCOVERY_QUESTIONS = [
	{
		question: 'What is the primary topic or niche?',
		key: 'topic',
		suggestions: [
			'Business & Entrepreneurship',
			'Technology & AI',
			'Health & Fitness',
			'Personal Finance',
			'Lifestyle & Travel',
			'Gaming & Entertainment',
		],
	},
	{
		question: 'Who is your specific target audience?',
		key: 'audience',
		suggestions: [
			'Gen Z / Alpha',
			'Startup Founders',
			'Busy Professionals',
			'Stay-at-home Parents',
			'Students',
			'High-Net-Worth Individuals',
		],
	},
	{
		question: 'Which platform are we targeting?',
		key: 'platform',
		suggestions: ['Reels', 'TikTok', 'Shorts'],
	},
	{
		question: 'What is the primary goal of this content?',
		key: 'goal',
		suggestions: ['reach', 'trust', 'leads', 'sales'],
	},
	{
		question: 'What is the preferred video length?',
		key: 'length',
		suggestions: ['15s', '30s', '45s', '60s'],
	},
	{
		question: 'What tone should we use?',
		key: 'tone',
		suggestions: ['safe viral', 'aggressive'],
	},
];

export function useAgent() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const [state, setState] = useState<AgentState>({
		question: DISCOVERY_QUESTIONS[0].question,
		suggestions: DISCOVERY_QUESTIONS[0].suggestions,
		step: 1,
		finalScript: null,
		completed: false,
	});

	const cleanJson = (text: string) => {
		try {
			// Remove markdown code blocks if present
			const cleaned = text.replace(/```json\n?|```/g, '').trim();
			return cleaned;
		} catch (_: any) {
			return text;
		}
	};

	const generateFinalStrategy = async (allAnswers: Record<string, string>) => {
		const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
		if (!apiKey) {
			setError('Gemini API Key is missing');
			return;
		}

		setLoading(true);
		try {
			const genAI = new GoogleGenerativeAI(apiKey);
			const model = genAI.getGenerativeModel({
				model: 'gemini-2.5-flash',
				systemInstruction: `${AGENT_PROMPT.role}\n${AGENT_PROMPT.mission}\n${AGENT_PROMPT.output_format}\nRules: ${AGENT_PROMPT.rules.join(', ')}\nSchemas: ${JSON.stringify(AGENT_PROMPT.schemas)}`,
				generationConfig: { responseMimeType: 'application/json' },
			});


			let userPrompt = AGENT_PROMPT.user_template;
			Object.entries(allAnswers).forEach(([key, value]) => {
				userPrompt = userPrompt.replace(`{{${key}}}`, value);
			});

			const result = await model.generateContent(userPrompt);
			const text = result.response.text();
			const response = JSON.parse(cleanJson(text));

			setState((prev) => ({
				...prev,
				question: null,
				suggestions: [],
				finalScript: JSON.stringify(response, null, 2),
				completed: true,
			}));
		} catch (err) {
			console.error(err);
			setError('Failed to generate strategy. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const submitAnswer = async (answer: string) => {
		const currentQuestion = DISCOVERY_QUESTIONS[state.step - 1];
		const updatedAnswers = { ...answers, [currentQuestion.key]: answer };
		setAnswers(updatedAnswers);

		const nextStep = state.step + 1;

		if (nextStep <= DISCOVERY_QUESTIONS.length) {
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
		setAnswers({});
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

