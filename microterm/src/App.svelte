<script lang="ts">
	
	import { onMount } from 'svelte';

	import historyPlugin from './historyplugin';


	const page = {
    params: {
      id: '1'
    }
  };

	const id = $derived(page.params.id);
	const fullId = $derived(('00000' + page.params.id).slice(-4));

	
	/* ───────────────────────── state ───────────────────────── */
	let input = $state('');
	let inputEl: HTMLInputElement;
	let outputEl: HTMLDivElement;
	let showSplash = $state(true);
  let currentState = $state('splash');
	let clockCanvas: HTMLCanvasElement | null = null;
	let clockInterval: number | null = null;
	let screensaverCanvas: HTMLCanvasElement | null = null;
	let screensaverRAF: number | null = null;

	/** what the terminal has already printed */
	let outputs: { content: string; type: 'text' | 'error' | 'header' | 'html' }[] = $state([]);

	/* ──────────────── command history plugin ──────────────── */

	/* ────────────────────── emulator core ─────────────────── */
	const emulatorState: Record<string, any> = {};

	const commands: Record<string, (state: any, ...args: string[]) => Promise<string | null>> = {
		help: async () => {
			pushOutput(`
			<div>
  <span class="blue">help</span> <span class="yellow">- show this help menu</span>
  <span class="blue">echo</span> <span class="yellow">&lt;text&gt;</span> <span class="green">- print text</span>
  <span class="blue">clear</span> <span class="yellow">- clear the screen</span>
  <span class="blue">price</span> <span class="yellow">&lt;symbol&gt;</span> <span class="green">- get current price of a cryptocurrency</span>
  <span class="blue">gif</span> <span class="yellow">- re-show Pluggy</span>
  <span class="blue">clock</span> <span class="yellow">- show a large clock (Esc to return)</span>
  <span class="blue">screensaver</span> <span class="yellow">- bouncing Pluggy logo</span>
  <span class="blue">exit</span> <span class="yellow">- go back to idle splash</span>
  </div>
`, 'html');
return null;
		},
		echo: async (_, ...args) => args.join(' '),
		clear: async() => {
			outputs = [];
			return null;
		},
		price: async (_, symbol) => {
			if (!symbol) {
				throw new Error('Please provide a cryptocurrency symbol (e.g. btc, eth)');
			}
			
			try {
				const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`);
				const data = await response.json();
				
				if (!data[symbol.toLowerCase()]) {
					throw new Error(`Cryptocurrency "${symbol}" not found. Try using the coin ID (e.g. bitcoin, ethereum)`);
				}
				
				const price = data[symbol.toLowerCase()].usd;
				return `$${price.toLocaleString()}`;
			} catch (error: any) {
				throw new Error(`Failed to fetch price: ${error.message}`);
			}
		},
		gif: async () => {
			pushOutput(`<div><img src="https://buttpluggy.com/images/${fullId}.gif" alt="Pluggy" style="width: 64px; height: 64px; image-rendering: pixelated;"></div>`, 'html');
			return null;
		},
		clock: async () => {
			if (clockCanvas) return null;
			
			clockCanvas = document.createElement('canvas');
			const ctx = clockCanvas.getContext('2d')!;
			
			const updateCanvasSize = () => {
				clockCanvas!.width = window.innerWidth;
				clockCanvas!.height = window.innerHeight;
				const fontSize = Math.floor(0.2 * Math.min(window.innerWidth, window.innerHeight));
				ctx.font = `${fontSize}px monospace`;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
			};
			
			const drawClock = () => {
				ctx.fillStyle = '#000';
				ctx.fillRect(0, 0, clockCanvas!.width, clockCanvas!.height);
				ctx.fillStyle = '#0f0';
				ctx.fillText(new Date().toLocaleTimeString(), clockCanvas!.width / 2, clockCanvas!.height / 2);
			};
			
			Object.assign(clockCanvas.style, {
				position: 'fixed',
				inset: '0',
				zIndex: '9999',
				pointerEvents: 'none'
			});
			
			document.body.appendChild(clockCanvas);
			updateCanvasSize();
			window.addEventListener('resize', updateCanvasSize);
			drawClock();
			clockInterval = window.setInterval(drawClock, 1000);
			
			const handleEsc = (e: KeyboardEvent) => {
				if (e.key === 'Escape') {
					clearInterval(clockInterval!);
					window.removeEventListener('resize', updateCanvasSize);
					document.removeEventListener('keydown', handleEsc);
					clockCanvas!.remove();
					clockCanvas = null;
					clockInterval = null;
					inputEl?.focus();
				}
			};
			
			document.addEventListener('keydown', handleEsc);
			return null;
		},
		screensaver: async () => {
			if (screensaverCanvas) return null;
			
			screensaverCanvas = document.createElement('canvas');
			const ctx = screensaverCanvas.getContext('2d')!;
			
			const pluggyImg = new Image();
			pluggyImg.src = 'https://buttpluggy.com/images/0038.gif';
			
			let x = 100;
			let y = 100;
			let dx = 3;
			let dy = 3;
			const size = 128;
			
			const updateCanvasSize = () => {
				screensaverCanvas!.width = window.innerWidth;
				screensaverCanvas!.height = window.innerHeight;
			};
			
			const animate = () => {
				ctx.fillStyle = 'rgba(0,0,0,0.2)';
				ctx.fillRect(0, 0, screensaverCanvas!.width, screensaverCanvas!.height);
				ctx.drawImage(pluggyImg, x, y, size, size);
				
				x += dx;
				y += dy;
				
				if (x <= 0 || x + size >= screensaverCanvas!.width) dx *= -1;
				if (y <= 0 || y + size >= screensaverCanvas!.height) dy *= -1;
				
				screensaverRAF = requestAnimationFrame(animate);
			};
			
			Object.assign(screensaverCanvas.style, {
				position: 'fixed',
				inset: '0',
				zIndex: '9999',
				pointerEvents: 'none'
			});
			
			document.body.appendChild(screensaverCanvas);
			updateCanvasSize();
			window.addEventListener('resize', updateCanvasSize);
			animate();
			
			const handleEsc = (e: KeyboardEvent) => {
				if (e.key === 'Escape') {
					cancelAnimationFrame(screensaverRAF!);
					window.removeEventListener('resize', updateCanvasSize);
					document.removeEventListener('keydown', handleEsc);
					screensaverCanvas!.remove();
					screensaverCanvas = null;
					screensaverRAF = null;
					inputEl?.focus();
				}
			};
			
			document.addEventListener('keydown', handleEsc);
			return null;
		},
		exit: async () => {
			currentState = 'splash';
      showSplash = true;
			return null;
		}
	};

	const emulator = {
		run: async (state: any, line: string) => {
			const [cmd, ...args] = line.trim().split(/\s+/);
			if (!cmd) return;
			const fn = commands[cmd];
			if (!fn) throw new Error(`command not found: ${cmd}`);
			return await fn(state, ...args);
		},
		autocomplete(_: any, curr: string) {
			const [prefix] = curr.trim().split(/\s+/);
			const matches = Object.keys(commands).filter(c => c.startsWith(prefix));
			return matches.length === 1 ? matches[0] + ' ' : curr;
		}
	};

	/* ───────────────────── helpers ───────────────────── */
	function scrollToBottom() {
		requestAnimationFrame(() => {
			if (outputEl) outputEl.scrollTop = outputEl.scrollHeight;
		});
	}

	function pushOutput(content: string, type: 'text' | 'error' | 'header' | 'html' = 'text') {
		outputs = [...outputs, { content, type }];
		scrollToBottom();
	}

	async function run() {
		const cmdLine = input;
		if (!cmdLine.trim()) return;

		pushOutput(`$ ${cmdLine}`, 'header');

		try {
			const res = await emulator.run(emulatorState, cmdLine);
			if (res !== null && res !== undefined) pushOutput(String(res), 'text');
		} catch (err: any) {
			pushOutput(err.message ?? String(err), 'error');
		}

		historyPlugin.push(cmdLine);
		input = '';
	}

	function handleSplashClick() {
		showSplash = false;
    currentState = 'terminal';
		inputEl.focus();
		setTimeout(() => {
			inputEl.focus();
		}, 100);
	}

	/* restore the missing listener */
	function handleKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'Enter':
				run();
				break;
			case 'ArrowUp':
				input = historyPlugin.completeUp(input);
				break;
			case 'ArrowDown':
				input = historyPlugin.completeDown(input);
				break;
			case 'Tab':
				input = emulator.autocomplete(emulatorState, input);
				break;
			default:
				return; // let the rest of the keys behave normally
		}
		e.preventDefault();
	}

	/* ─ init once in browser ─ */
	onMount(async () => {
		scrollToBottom();
		pushOutput(`
				<div><img src="https://buttpluggy.com/images_small/${fullId}.png" width="64" style="image-rendering:pixelated;"></div>
				<div class="green">Welcome to Pluggy OS!<br>Type '<span class="blue">help</span>' to begin.</div>
				<div class="green">Links</div>
				<div><a href="https://opensea.io/collection/buttpluggy" target="_blank">OpenSea Collection</a></div>
				<div><a href="https://buttpluggy.com/mine" target="_blank">Mint a Buttpluggy</a></div>
				<div><a href="https://opensea.io/item/ethereum/0x0000420538cd5abfbc7db219b6a1d125f5892ab0/${id}" target="_blank">[Buttpluggy #${id}] on OpenSea</a></div>
		`, 'html');
	});
</script>

{#if currentState === 'splash'}
	<div 
		id="splash" 
		class="fixed inset-0 flex items-center justify-center cursor-pointer transition-transform duration-600 ease-in-out"
		onclick={handleSplashClick}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
				handleSplashClick();
			}
		}}
		onmousemove={(e) => {
			const hint = document.getElementById('hint');
			if (hint) {
				hint.style.left = (e.clientX + 4) + 'px';
				hint.style.top = (e.clientY - 20) + 'px';
			}
		}}
		role="button"
		tabindex="0"
	>
		<img 
			id="pluggy" 
			src="https://buttpluggy.com/images/{fullId}.gif" 
			alt="Pluggy"
			class="w-screen h-screen object-contain pointer-events-none image-pixelated animate-breath"
		>
	</div>
	<span 
		id="hint" 
		class="fixed bg-black/80 text-green-500 text-sm px-1.5 py-0.5 rounded pointer-events-none opacity-0 transition-opacity duration-250 font-mono"
	>
		*click*
	</span>
{/if}

<!-- ───────────────────────── view ───────────────────────── -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	id="output-wrapper"
	class="h-screen w-full font-mono flex flex-col whitespace-pre-wrap overflow-y-auto pb-0.5 text-sm pl-0.5"
	class:hidden={currentState !== 'terminal'}
	bind:this={outputEl}
	onclick={() => inputEl?.focus()}
	onkeydown={(e) => { if (e.key === 'Enter') { inputEl?.focus(); e.preventDefault(); } }}
	tabindex="0"
	role="region"
	aria-label="Terminal output"
>
	{#each outputs as o}
		{#if o.type == 'html'}
			{@html o.content}
		{:else}
		<div
			class:text-output={o.type == 'text'}
			class:error-output={o.type == 'error'}
			class:header-output={o.type == 'header'}
		>
			{o.content}
		</div>
		{/if}
	{/each}
	<div id="input-wrapper" class="  items-center relative font-mono w-full">
		<input
		  bind:value={input}
		  onkeydown={handleKeydown}
		  bind:this={inputEl}
		  class="bg-transparent outline-none border-none flex-grow pl-4"
		  autocomplete="off"
		  autocorrect="off"
		  autocapitalize="off"
		  spellcheck="false"
		/>
	  </div>
<!--
	  <div id="input" contenteditable="true"></div>
	-->
</div>


{#if currentState === 'game'}
  
<div>
  TODO: implement game emulator load logic here
</div>
{/if}

<style>

#input {
    position: relative;
    caret-color: transparent;
}
/* Puts a blinking square after the content as replacement for caret */
#input[contenteditable="true"]:after {
    content: "■";
    animation: cursor 1s infinite;
    animation-timing-function: step-end;
    margin-left: 1px;
}
/* Inserts the > before terminal input */
#input:before {
    content: ">";
    position: absolute;
    padding-left: 1.5rem;
    left: 0;
}


/* aplica el $ antes del input, dentro del contenedor */
#input-wrapper::before {
  content: '$';
  position: absolute;
  left: 0;           /* ajusta según padding-left del input */
  top: 50%;
  transform: translateY(-50%);
  color: #0f0;
  pointer-events: none;    /* para que no interfiera con el foco */
}

.text-output {
	color: #e0e0e0;
}
.error-output {
	color: #ff6868;
}
.header-output {
	color: #8be9fd;
}

.image-pixelated {
	image-rendering: pixelated;
}

@keyframes breath {
	0% { transform: translateY(0); }
	50% { transform: translateY(-6px); }
	100% { transform: translateY(0); }
}

.animate-breath {
	animation: breath 4s ease-in-out infinite;
}

#splash:hover img {
	animation-duration: 1s;
}

#splash:hover + #hint {
	opacity: 1;
}

#hint {
  background: #000c;
  border-radius: 4px;
  color: #0f0;
  font-size: 13px;
  padding: 3px 6px;
}
</style>
