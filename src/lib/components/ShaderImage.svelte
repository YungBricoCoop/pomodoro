<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as twgl from 'twgl.js';
	import baseVert from '$lib/shaders/base.vert';

	let {
		src,
		fragmentShader,
		alt,
		class: className,
		naturalWidth = $bindable(),
		naturalHeight = $bindable(),
		play = false,
		state = 0
	} = $props();

	let canvas: HTMLCanvasElement;
	let gl: WebGLRenderingContext;
	let programInfo: twgl.ProgramInfo;
	let bufferInfo: twgl.BufferInfo;
	let texture: WebGLTexture;
	let animationId: number;
	let startTime = 0;
	let lastTime = 0;
	let dustTime = 0;

	const loadTexture = (url: string) => {
		const img = new Image();
		img.src = url;
		img.onload = () => {
			naturalWidth = img.naturalWidth;
			naturalHeight = img.naturalHeight;

			if (!gl) return;

			texture = twgl.createTexture(gl, {
				src: img,
				flipY: 1
			});
		};
	};

	$effect(() => {
		if (src) loadTexture(src);
	});

	const render = (time: number) => {
		if (!gl || !programInfo || !bufferInfo || !texture) {
			animationId = requestAnimationFrame(render);
			return;
		}

		if (startTime === 0) startTime = time;
		if (lastTime === 0) lastTime = time;

		const deltaTime = (time - lastTime) * 0.001;
		lastTime = time;

		if (play) {
			dustTime += deltaTime;
		}

		const u_time = (time - startTime) * 0.001;

		twgl.resizeCanvasToDisplaySize(canvas);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		const uniforms = {
			u_time,
			u_dust_time: dustTime,
			u_play: play ? 1.0 : 0.0,
			u_state: state,
			u_texture: texture,
			u_resolution: [gl.canvas.width, gl.canvas.height]
		};

		gl.useProgram(programInfo.program);
		twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
		twgl.setUniforms(programInfo, uniforms);
		twgl.drawBufferInfo(gl, bufferInfo);

		animationId = requestAnimationFrame(render);
	};

	onMount(() => {
		gl = canvas.getContext('webgl')!;
		if (!gl) {
			console.error('WebGL not supported');
			return;
		}

		programInfo = twgl.createProgramInfo(gl, [baseVert, fragmentShader]);

		const arrays = {
			position: {
				numComponents: 3,
				data: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]
			},
			texcoord: { numComponents: 2, data: [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1] }
		};

		bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

		animationId = requestAnimationFrame(render);
	});

	onDestroy(() => {
		if (animationId) cancelAnimationFrame(animationId);
	});
</script>

<canvas bind:this={canvas} class={className} aria-label={alt}></canvas>
