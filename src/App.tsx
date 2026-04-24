'use client';

import { useState, useMemo } from 'react';
import { useAgent } from '@/hooks/useAgent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Sparkles,
	Bot,
	RefreshCw,
	CheckCircle2,
	MessageSquare,
	ChevronRight,
	Search,
	Target,
	Zap,
	Film,
	Scissors,
	Share2,
	TrendingUp,
	AlertCircle,
} from 'lucide-react';

const SECTIONS = [
	{ id: 'research', label: 'Research', icon: Search },
	{ id: 'pain_mining', label: 'Psychology', icon: Target },
	{ id: 'hooks', label: 'Hooks', icon: Zap },
	{ id: 'scripts', label: 'Scripts', icon: Film },
	{ id: 'editing_cues', label: 'Editing', icon: Scissors },
	{ id: 'distribution', label: 'Promo', icon: Share2 },
	{ id: 'iteration', label: 'Strategy', icon: TrendingUp },
];

export default function App() {
	const { state, loading, error, submitAnswer, reset } = useAgent();
	const [inputValue, setInputValue] = useState('');
	const [activeTab, setActiveTab] = useState('research');

	const handleNext = () => {
		if (!inputValue) return;
		submitAnswer(inputValue);
		setInputValue('');
	};

	const handleSuggestionClick = (suggestion: string) => {
		submitAnswer(suggestion);
		setInputValue('');
	};

	const finalData = useMemo(() => {
		if (!state.finalScript) return null;
		try {
			return JSON.parse(state.finalScript);
		} catch (e) {
			console.error('Failed to parse final script', e);
			return null;
		}
	}, [state.finalScript]);

	const renderSectionContent = (id: string) => {
		if (!finalData) return null;
		const data = finalData[id];

		if (!data)
			return (
				<div className='text-muted-foreground text-xs italic py-4 text-center'>
					No data available for this section.
				</div>
			);

		if (id === 'hooks') {
			const hooksList = Array.isArray(data) ? data : data.hooks || [];
			return (
				<div className='space-y-3'>
					<div className='p-3 rounded-xl bg-primary/5 border border-primary/10'>
						<h4 className='text-primary text-[10px] font-bold flex items-center gap-1.5 mb-1 uppercase tracking-wider'>
							<CheckCircle2 className='w-3 h-3' /> Best Pick
						</h4>
						<p className='text-sm font-semibold tracking-tight leading-snug'>
							{finalData.best_hook?.hook || finalData.best_hook}
						</p>
					</div>
					<div className='grid gap-2'>
						{hooksList.map((hook: any, i: number) => (
							<div
								key={i}
								className='p-2.5 rounded-lg bg-card border border-border/50 text-xs flex gap-2.5'
							>
								<span className='text-primary/40 font-mono font-bold'>
									{i + 1}
								</span>
								<p className='text-foreground/90'>
									{typeof hook === 'string' ? hook : hook.hook}
								</p>
							</div>
						))}
					</div>
				</div>
			);
		}

		if (id === 'scripts') {
			const scripts = Array.isArray(data) ? data : data.versions || [data];
			return (
				<div className='space-y-4'>
					{scripts.map((script: any, i: number) => (
						<div
							key={i}
							className='space-y-2'
						>
							<div className='flex items-center gap-2'>
								<span className='text-[9px] font-bold uppercase tracking-widest text-primary px-1.5 py-0.5 bg-primary/10 rounded'>
									{script.label || `V${i + 1}`}
								</span>
								<div className='h-px flex-1 bg-border/40' />
							</div>
							<div className='p-3 rounded-xl bg-card border border-border/60 text-xs leading-relaxed whitespace-pre-wrap'>
								{script.content ||
									script.script ||
									(typeof script === 'string'
										? script
										: JSON.stringify(script))}
							</div>
						</div>
					))}
				</div>
			);
		}

		return (
			<div className='p-3 rounded-xl bg-muted/20 border border-border/50 text-xs leading-relaxed'>
				{Array.isArray(data) ? (
					<ul className='space-y-2'>
						{data.map((item, idx) => (
							<li
								key={idx}
								className='flex gap-2 text-foreground/80'
							>
								<span className='text-primary'>•</span> {item}
							</li>
						))}
					</ul>
				) : typeof data === 'object' ? (
					<pre className='whitespace-pre-wrap font-sans'>
						{JSON.stringify(data, null, 2)}
					</pre>
				) : (
					data
				)}
			</div>
		);
	};

	const renderContent = () => {
		if (error) {
			return (
				<div className='space-y-3 py-2 animate-in fade-in duration-200'>
					<div className='p-3 rounded-xl bg-destructive/5 text-destructive border border-destructive/10 flex items-start gap-2'>
						<AlertCircle className='w-4 h-4 shrink-0 mt-0.5' />
						<p className='text-xs font-medium'>{error}</p>
					</div>
					<Button
						onClick={reset}
						variant='outline'
						className='w-full h-10 rounded-xl text-xs font-bold'
					>
						RETRY SYSTEM
					</Button>
				</div>
			);
		}

		if (!state.question && !state.completed && loading) {
			return (
				<div className='flex flex-col items-center justify-center py-12 space-y-4'>
					<RefreshCw className='w-8 h-8 text-primary animate-spin' />
					<p className='text-xs font-bold tracking-widest text-muted-foreground uppercase'>
						Processing Data...
					</p>
				</div>
			);
		}

		if (state.completed && finalData) {
			return (
				<div className='space-y-4 animate-in slide-in-from-bottom-2 duration-300'>
					<div className='flex overflow-x-auto pb-2 gap-1.5 no-scrollbar -mx-1 px-1'>
						{SECTIONS.map((section) => (
							<button
								key={section.id}
								onClick={() => setActiveTab(section.id)}
								className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${
									activeTab === section.id
										? 'bg-primary text-primary-foreground'
										: 'bg-muted/50 text-muted-foreground'
								}`}
							>
								<section.icon className='w-3 h-3' />
								{section.label}
							</button>
						))}
					</div>
					<div className='min-h-[200px]'>{renderSectionContent(activeTab)}</div>
					<Button
						onClick={reset}
						variant='ghost'
						className='w-full text-[10px] font-bold text-muted-foreground tracking-widest uppercase'
					>
						<RefreshCw className='w-3 h-3 mr-2' /> New Strategy
					</Button>
				</div>
			);
		}

		return (
			<div className='space-y-6'>
				<div className='space-y-1'>
					<span className='text-[9px] font-black text-primary uppercase tracking-widest'>
						Phase {state.step}/6
					</span>
					<h2 className='text-lg font-bold tracking-tight leading-tight'>
						{state.question || 'Initialising...'}
					</h2>
				</div>

				<div className='grid gap-2'>
					{state.suggestions?.map((suggestion, idx) => (
						<button
							key={idx}
							disabled={loading}
							onClick={() => handleSuggestionClick(suggestion)}
							className='text-left p-3 rounded-xl border border-border/60 bg-card active:scale-[0.97] transition-all flex items-center justify-between disabled:opacity-50'
						>
							<span className='text-xs font-semibold pr-2'>{suggestion}</span>
							<ChevronRight className='w-3.5 h-3.5 text-primary shrink-0' />
						</button>
					))}
				</div>

				<div className='space-y-2'>
					<div className='relative'>
						<Input
							disabled={loading}
							placeholder='Custom input...'
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleNext()}
							className='h-10 rounded-xl bg-background border-border focus-visible:ring-primary/20 text-sm pr-10'
						/>
						<MessageSquare className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30' />
					</div>
					<Button
						disabled={!inputValue || loading}
						onClick={handleNext}
						className='w-full h-10 rounded-xl text-xs font-bold uppercase tracking-widest bg-primary transition-all active:scale-95'
					>
						{loading ? (
							<RefreshCw className='w-3.5 h-3.5 animate-spin mr-2' />
						) : (
							<Sparkles className='w-3.5 h-3.5 mr-2' />
						)}
						Confirm
					</Button>
				</div>
			</div>
		);
	};

	return (
		<div className='min-h-screen bg-background text-foreground flex flex-col p-4 sm:p-8 selection:bg-primary/20'>
			{/* Mobile-Optimized Header */}
			<header className='flex items-center justify-between mb-6 animate-in fade-in slide-in-from-top-1 duration-500'>
				<div className='flex items-center gap-2.5'>
					<div className='p-1.5 rounded-lg bg-primary text-primary-foreground shadow-sm'>
						<Bot className='w-4 h-4' />
					</div>
					<div>
						<h1 className='text-sm font-bold tracking-tight leading-none uppercase'>
							Forbet
						</h1>
						<p className='text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5'>
							V3.0 Core
						</p>
					</div>
				</div>
				{!state.completed && state.step > 0 && (
					<div className='flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-full border border-border/50'>
						<div className='h-1 w-8 bg-background rounded-full overflow-hidden'>
							<div
								className='h-full bg-primary'
								style={{ width: `${(state.step / 6) * 100}%` }}
							/>
						</div>
						<span className='text-[8px] font-mono font-bold'>
							{Math.round((state.step / 6) * 100)}%
						</span>
					</div>
				)}
			</header>

			<main className='flex-1 flex flex-col max-w-lg mx-auto w-full'>
				<Card className='border-border/60 shadow-lg bg-card/50 backdrop-blur-sm rounded-[20px] overflow-hidden flex-1 sm:flex-initial'>
					<CardHeader className='bg-muted/30 border-b border-border/40 py-2 px-4 flex-row items-center gap-2 space-y-0'>
						<div
							className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}
						/>
						<span className='text-[8px] font-bold tracking-[0.2em] uppercase text-muted-foreground'>
							{loading ? 'Processing' : 'Standby'}
						</span>
					</CardHeader>
					<CardContent className='p-5 md:p-6'>{renderContent()}</CardContent>
				</Card>

				<footer className='mt-6 flex justify-center gap-4 text-muted-foreground/30 font-mono text-[7px] uppercase tracking-widest pb-4'>
					<span>LATENCY: 12ms</span>
					<span>RETENTION_PRIORITY: HIGH</span>
				</footer>
			</main>
		</div>
	);
}
