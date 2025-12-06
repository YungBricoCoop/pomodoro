<script lang="ts">
	import { onDestroy } from 'svelte';
	import background from '$lib/assets/background.png';
	import Play from '@lucide/svelte/icons/play';
	import Pause from '@lucide/svelte/icons/pause';
	import { formatTime } from '$lib/utils';

	const WORK_TIME = 25 * 60;
	const BREAK_TIME = 5 * 60;
	const FACES = {
		IDLE: 'x _ x',
		BREAK: '^ _ ^',
		WORKING: ['X _ x', 'X _ X', 'x _ X']
	};

	let timeLeft = $state(WORK_TIME);
	let isRunning = $state(false);
	let mode = $state<'work' | 'break'>('work');
	let timer: ReturnType<typeof setInterval> | undefined;

	let faceText = $state(FACES.IDLE);
	let faceTimer: ReturnType<typeof setInterval> | undefined;

	let innerWidth = $state(0);
	let innerHeight = $state(0);
	let imgNaturalWidth = $state(1);
	let imgNaturalHeight = $state(1);

	let isWider = $derived(innerWidth / innerHeight > imgNaturalWidth / imgNaturalHeight);
	let displayedWidth = $derived(
		isWider ? innerWidth : innerHeight * (imgNaturalWidth / imgNaturalHeight)
	);
	let fontSize = $derived(displayedWidth * (14 / 1920));
	let iconSize = $derived(displayedWidth * (40 / 1920));

	const updateFace = (currentMode: 'work' | 'break', running: boolean) => {
		if (faceTimer) clearInterval(faceTimer);

		if (!running) {
			faceText = FACES.IDLE;
			return;
		}

		if (currentMode === 'work') {
			let i = 0;
			faceText = FACES.WORKING[0];
			faceTimer = setInterval(() => {
				i = (i + 1) % FACES.WORKING.length;
				faceText = FACES.WORKING[i];
			}, 500);
			return;
		}

		faceText = FACES.BREAK;
	};

	const stopTimer = () => {
		if (timer) clearInterval(timer);
		isRunning = false;
		updateFace(mode, false);
	};

	const handleTimerComplete = () => {
		stopTimer();
		mode = mode === 'work' ? 'break' : 'work';
		timeLeft = mode === 'work' ? WORK_TIME : BREAK_TIME;
	};

	const startTimer = () => {
		isRunning = true;
		updateFace(mode, true);
		timer = setInterval(() => {
			if (timeLeft > 0) {
				timeLeft--;
			} else {
				handleTimerComplete();
			}
		}, 1000);
	};

	const toggleTimer = () => {
		if (isRunning) {
			stopTimer();
			return;
		}

		startTimer();
	};

	onDestroy(() => {
		if (timer) clearInterval(timer);
		if (faceTimer) clearInterval(faceTimer);
	});
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div class="fixed inset-0 flex items-center justify-center overflow-hidden bg-black">
	<div
		class="relative"
		style:width={isWider ? '100vw' : 'auto'}
		style:height={isWider ? 'auto' : '100vh'}
		style:aspect-ratio="{imgNaturalWidth} / {imgNaturalHeight}"
	>
		<img
			src={background}
			alt="Background"
			class="h-full w-full object-cover"
			bind:naturalWidth={imgNaturalWidth}
			bind:naturalHeight={imgNaturalHeight}
		/>

		<button
			onclick={toggleTimer}
			class="absolute top-[37.5%] right-[23.8%] z-10 -rotate-7 skew-x-8 cursor-pointer border-none bg-transparent p-0 text-ctp-flamingo opacity-40 transition-opacity hover:opacity-100"
			aria-label={isRunning ? 'Pause' : 'Start'}
		>
			{#if isRunning}
				<Pause size={iconSize} />
			{:else}
				<Play size={iconSize} />
			{/if}
		</button>

		<div
			class="absolute top-[31.1%] right-[23.2%] -skew-x-8 -skew-y-8 text-ctp-flamingo opacity-70 mb-12 font-mono font-bold blur-md pointer-events-none"
			style:font-size="{fontSize}px"
		>
			{formatTime(timeLeft)}
		</div>

		<div
			class="absolute top-[31.1%] right-[23.2%] -skew-x-8 -skew-y-8 text-ctp-flamingo opacity-90 mb-12 font-mono font-bold pointer-events-none"
			style:font-size="{fontSize}px"
		>
			{formatTime(timeLeft)}
		</div>
		<div
			class="absolute top-[19.8%] right-[23.1%] -skew-y-12 text-ctp-flamingo opacity-90 mb-12 font-mono font-bold pointer-events-none"
			style:font-size="{fontSize}px"
		>
			{faceText}
		</div>
	</div>
</div>
