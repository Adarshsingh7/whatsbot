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
	{ id: 'hooks', label: 'Hook Engine', icon: Zap },
	{ id: 'scripts', label: 'Viral Scripts', icon: Film },
	{ id: 'editing_cues', label: 'Editing', icon: Scissors },
	{ id: 'distribution', label: 'Distribution', icon: Share2 },
	{ id: 'iteration', label: 'v2 Strategy', icon: TrendingUp },
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
				<div className='text-muted-foreground italic'>
					No data available for this section.
				</div>
			);

		if (id === 'hooks') {
			return (
				<div className='space-y-6'>
					<div className='p-4 rounded-xl bg-primary/5 border border-primary/20'>
						<h4 className='text-primary font-bold flex items-center gap-2 mb-2'>
							<CheckCircle2 className='w-4 h-4' /> Recommended Hook
						</h4>
						<p className='text-lg font-semibold leading-tight'>
							{finalData.best_hook?.hook || finalData.best_hook}
						</p>
						<p className='text-sm text-muted-foreground mt-2 italic'>
							{finalData.best_hook?.reason}
						</p>
					</div>

					<div className='grid gap-3'>
						{Array.isArray(data) ? (
							data.map((hook: any, i: number) => (
								<div
									key={i}
									className='p-3 rounded-lg bg-muted/30 border border-border/50 text-sm flex gap-3'
								>
									<span className='text-primary font-mono font-bold'>
										{i + 1}.
									</span>
									<p>
										{typeof hook === 'string'
											? hook
											: hook.hook || JSON.stringify(hook)}
									</p>
								</div>
							))
						) : (
							<pre className='text-xs whitespace-pre-wrap'>
								{JSON.stringify(data, null, 2)}
							</pre>
						)}
					</div>
				</div>
			);
		}

		if (id === 'scripts') {
			const scripts = Array.isArray(data)
				? data
				: data.versions || Object.values(data);
			return (
				<div className='space-y-8'>
					{scripts.map((script: any, i: number) => (
						<div
							key={i}
							className='space-y-4'
						>
							<div className='flex items-center gap-2'>
								<div className='px-3 py-1 rounded-md bg-accent text-accent-foreground text-xs font-bold uppercase'>
									{script.label || script.type || `Version ${i + 1}`}
								</div>
								<div className='h-px flex-1 bg-border/50' />
							</div>
							<div className='p-5 rounded-xl bg-card border shadow-sm font-sans leading-relaxed text-sm md:text-base whitespace-pre-wrap'>
								{script.content ||
									script.script ||
									(typeof script === 'string'
										? script
										: JSON.stringify(script, null, 2))}
							</div>
						</div>
					))}
				</div>
			);
		}

		return (
			<div className='space-y-4'>
				{typeof data === 'object' ? (
					Object.entries(data).map(([key, value]: [string, any]) => (
						<div
							key={key}
							className='space-y-2'
						>
							<h4 className='text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
								{key.replace(/_/g, ' ')}
							</h4>
							<div className='p-4 rounded-xl bg-muted/20 border border-border/50'>
								{Array.isArray(value) ? (
									<ul className='space-y-2'>
										{value.map((item, idx) => (
											<li
												key={idx}
												className='flex gap-2 text-sm'
											>
												<span className='text-primary'>•</span>
												<span>{item}</span>
											</li>
										))}
									</ul>
								) : (
									<p className='text-sm leading-relaxed'>{value}</p>
								)}
							</div>
						</div>
					))
				) : (
					<pre className='text-xs whitespace-pre-wrap bg-muted/30 p-4 rounded-xl border border-border/50'>
						{JSON.stringify(data, null, 2)}
					</pre>
				)}
			</div>
		);
	};

	const renderContent = () => {
		if (error) {
			return (
				<div className='space-y-4 py-8 animate-in fade-in zoom-in-95 duration-300'>
					<div className='p-6 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 flex items-start gap-4'>
						<AlertCircle className='w-6 h-6 shrink-0 mt-1' />
						<div>
							<h3 className='font-bold text-lg mb-1'>System Error</h3>
							<p className='text-sm opacity-90'>{error}</p>
						</div>
					</div>
					<Button
						onClick={reset}
						variant='outline'
						className='w-full h-12 rounded-xl'
					>
						Restart VIRALОС Engine
					</Button>
				</div>
			);
		}

		if (!state.question && !state.completed && loading) {
			return (
				<div className='flex flex-col items-center justify-center py-24 space-y-6 animate-in fade-in duration-1000'>
					<div className='relative'>
						<div className='absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse' />
						<RefreshCw className='w-16 h-16 text-primary animate-spin relative z-10' />
					</div>
					<div className='text-center space-y-2'>
						<h3 className='text-2xl font-bold tracking-tight'>
							Engineering Viral Retention...
						</h3>
						<p className='text-muted-foreground text-sm max-w-[300px]'>
							VIRALОС is currently processing 10,000+ data points to optimize
							your script.
						</p>
					</div>
				</div>
			);
		}

		if (state.completed && finalData) {
			return (
				<div className='space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-700'>
					<div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2'>
						<div className='flex items-center gap-3 text-green-500'>
							<div className='p-2 rounded-full bg-green-500/10'>
								<CheckCircle2 className='w-6 h-6' />
							</div>
							<h3 className='text-2xl font-black tracking-tight text-foreground'>
								Strategy Engineered
							</h3>
						</div>
						<Button
							onClick={reset}
							variant='ghost'
							size='sm'
							className='gap-2 text-muted-foreground hover:text-primary transition-colors'
						>
							<RefreshCw className='w-4 h-4' /> New Session
						</Button>
					</div>

					<div className='flex flex-col gap-6'>
						{/* Sidebar-style Tabs */}
						<div className='flex overflow-x-auto pb-2 scrollbar-none gap-2 no-scrollbar'>
							{SECTIONS.map((section) => (
								<button
									key={section.id}
									onClick={() => setActiveTab(section.id)}
									className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
										activeTab === section.id
											? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
											: 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50'
									}`}
								>
									<section.icon className='w-4 h-4' />
									{section.label}
								</button>
							))}
						</div>

						<div className='min-h-[400px] p-1'>
							<div className='animate-in fade-in slide-in-from-right-4 duration-500'>
								{renderSectionContent(activeTab)}
							</div>
						</div>
					</div>
				</div>
			);
		}

		return (
			<div className='space-y-10 min-h-[400px]'>
				{/* Question Area */}
				<div className='space-y-4 animate-in fade-in slide-in-from-right-8 duration-500'>
					<div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2 border border-primary/20'>
						Operational Phase {state.step} of 6
					</div>
					{state.question ? (
						<h2 className='text-3xl font-black tracking-tighter text-foreground leading-[1.1] max-w-lg'>
							{state.question}
						</h2>
					) : (
						<div className='h-10 w-3/4 bg-muted animate-pulse rounded-xl' />
					)}
				</div>

				{/* Suggestions Grid */}
				<div className='min-h-[140px]'>
					{state.suggestions && state.suggestions.length > 0 ? (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150'>
							{state.suggestions.map((suggestion, idx) => (
								<button
									key={idx}
									disabled={loading}
									onClick={() => handleSuggestionClick(suggestion)}
									className='text-left p-5 rounded-2xl border border-border/50 bg-muted/20 hover:bg-primary/5 hover:border-primary/40 transition-all group flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed h-full hover:shadow-xl hover:shadow-primary/5'
								>
									<span className='text-sm font-bold pr-2 tracking-tight'>
										{suggestion}
									</span>
									<div className='w-8 h-8 rounded-full bg-muted group-hover:bg-primary/20 flex items-center justify-center transition-colors'>
										<ChevronRight className='w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0' />
									</div>
								</button>
							))}
						</div>
					) : loading ? (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
							{[1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className='h-16 rounded-2xl bg-muted/40 animate-pulse'
								/>
							))}
						</div>
					) : (
						<div className='flex items-center justify-center h-full text-muted-foreground/60 font-medium italic text-sm border-2 border-dashed border-border rounded-2xl'>
							Input specific parameters below to proceed
						</div>
					)}
				</div>

				{/* Custom Input */}
				<div className='pt-6 space-y-4'>
					<div className='relative group'>
						<div className='absolute inset-0 bg-primary/5 blur-xl rounded-2xl group-focus-within:bg-primary/10 transition-all opacity-0 group-focus-within:opacity-100' />
						<MessageSquare className='absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors' />
						<Input
							disabled={loading}
							placeholder='Input custom value or choose suggestion...'
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleNext()}
							className='pl-14 h-16 text-lg rounded-2xl bg-background/80 backdrop-blur border-border/60 focus-visible:ring-primary/40 focus-visible:border-primary/50 relative z-10'
						/>
					</div>

					<Button
						disabled={!inputValue || loading}
						onClick={handleNext}
						className='w-full h-16 text-xl font-black rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-primary to-primary/80'
					>
						{loading ? (
							<RefreshCw className='w-6 h-6 animate-spin mr-3' />
						) : (
							<Sparkles className='w-6 h-6 mr-3' />
						)}
						{loading ? 'ANALYZING...' : 'CONFIRM INPUT'}
					</Button>
				</div>
			</div>
		);
	};

	return (
		<div className='min-h-screen bg-background text-foreground flex items-center justify-center p-4 md:p-12 selection:bg-primary/30 overflow-x-hidden'>
			{/* Luxury Gradient Background */}
			<div className='fixed inset-0 overflow-hidden pointer-events-none'>
				<div className='absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[140px] animate-pulse opacity-60' />
				<div
					className='absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[140px] animate-pulse opacity-60'
					style={{ animationDelay: '2s' }}
				/>
				<div className='absolute inset-0 bg-[url("https://grainy-gradients.vercel.app/noise.svg")] opacity-[0.03] brightness-100' />
			</div>

			<div className='w-full max-w-4xl relative z-10 space-y-10'>
				<div className='flex flex-col items-center gap-6 text-center animate-in fade-in slide-in-from-top-4 duration-1000'>
					<div className='p-5 rounded-[2rem] bg-gradient-to-br from-primary via-primary/80 to-primary/40 text-white shadow-2xl shadow-primary/30 rotate-3 hover:rotate-0 transition-all duration-700 hover:scale-110 cursor-pointer group'>
						<Bot className='w-12 h-12 group-hover:scale-110 transition-transform' />
					</div>
					<div className='space-y-2'>
						<div className='flex items-center justify-center gap-3'>
							<h1 className='text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50'>
								VIRALОС
							</h1>
							<div className='px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[10px] font-black mt-2'>
								v3.0
							</div>
						</div>
						<p className='text-muted-foreground font-black uppercase tracking-[0.4em] text-[10px] opacity-60'>
							Viral Retention Operating System
						</p>
					</div>
				</div>

				<Card className='border-border/40 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] backdrop-blur-2xl bg-card/60 overflow-hidden rounded-[2.5rem] ring-1 ring-white/10'>
					<CardHeader className='bg-muted/30 border-b border-border/20 px-10 py-8'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-4'>
								<div className='relative'>
									<div
										className={`w-3 h-3 rounded-full ${loading ? 'bg-amber-500 animate-ping' : 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]'}`}
									/>
									{loading && (
										<div className='absolute inset-0 w-3 h-3 rounded-full bg-amber-500 animate-pulse' />
									)}
								</div>
								<span className='text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground'>
									{loading ? 'Neural Engine Active' : 'System Ready'}
								</span>
							</div>
							{!state.completed && state.step > 0 && (
								<div className='flex items-center gap-4'>
									<div className='h-1.5 w-32 bg-muted rounded-full overflow-hidden border border-border/30'>
										<div
											className='h-full bg-primary transition-all duration-500'
											style={{ width: `${(state.step / 6) * 100}%` }}
										/>
									</div>
									<span className='text-[10px] font-mono font-bold text-muted-foreground/40'>
										{((state.step / 6) * 100).toFixed(0)}%
									</span>
								</div>
							)}
						</div>
					</CardHeader>

					<CardContent className='p-10'>{renderContent()}</CardContent>
				</Card>

				<div className='flex flex-wrap justify-center gap-x-8 gap-y-4 text-muted-foreground/30 font-mono text-[9px] uppercase tracking-[0.3em] font-bold'>
					<div className='flex items-center gap-2'>
						<div className='w-1 h-1 rounded-full bg-muted-foreground/30' />
						<span>Model: Gemini 1.5 Flash</span>
					</div>
					<div className='flex items-center gap-2'>
						<div className='w-1 h-1 rounded-full bg-muted-foreground/30' />
						<span>Engine: VIRALOC_CORE_V3</span>
					</div>
					<div className='flex items-center gap-2'>
						<div className='w-1 h-1 rounded-full bg-muted-foreground/30' />
						<span>Protocol: Retention-First</span>
					</div>
				</div>
			</div>
		</div>
	);
}
