function boot(fullId) {
	const $ = (q) => document.querySelector(q);
	const splash = $('#splash'),
		gif = $('#pluggy'),
		hint = $('#hint');

	/* -------- hover behaviour -------- */
	splash.addEventListener('mouseenter', () => {
		gif.style.animationDuration = '1s';
		hint.style.opacity = 1;
	});
	splash.addEventListener('mouseleave', () => {
		gif.style.animationDuration = '4s';
		hint.style.opacity = 0;
	});
	splash.addEventListener('mousemove', (e) => {
		// place tooltip near cursor ( 12 px offset defined in CSS )
		hint.style.left = e.clientX + 'px';
		hint.style.top = e.clientY + 'px';
	});

	let isBooted = false;

	/* -------- click to enter ---------- */
	function enter() {
		if (isBooted) return;
		isBooted = true;
		splash.style.transform = 'scale(6)';
		splash.style.opacity = '0';
		hint.style.opacity = 0;
		setTimeout(() => {
			splash.remove();
			bootTerminal();
		}, 600);
	}
	splash.addEventListener('click', enter);
	document.addEventListener('keydown', (e) => {
		if (['Enter', ' ', 'Escape'].includes(e.key)) enter();
	});

	/* ------------- minimal terminal ------------- */

	/* ---------- minimal terminal ---------- */
	function bootTerminal() {
		const wrap = $('#termWrap'),
			out = $('#output'),
			inp = $('#cmd');
		wrap.style.display = 'block';
		inp.focus();

		const helpText = `Available commands: 
    help     - this message
    clear    - clear screen
    ping     - prints 'pong'
    gif      - re-show Pluggy
    clock    - show a large clock (Esc to return)
    screensaver - bouncing Pluggy logo
    exit     - go back to idle splash`;

		/* NEW – allow rich inline HTML ------------------------------------ */
		function printHTML(html) {
			const div = document.createElement('div');
			div.innerHTML = html; // insert *as* markup
			out.appendChild(div);
			out.scrollTop = out.scrollHeight;
		}

		/* NEW – quick wrappers for common elements */
		function printLink(label, href) {
			printHTML('<a href="' + href + '" target="_blank">' + label + '</a>');
		}

		function printImage(src, w = 128) {
			printHTML('<img src="' + src + '" width="' + w + '" style="image-rendering:pixelated;">');
		}

		printImage('https://buttpluggy.com/images_small/' + fullId + '.png', 64);
		printLine("Welcome to Pluggy OS!\nType 'help' to begin.");

		printLine('\nLinks');
		printLink('OpenSea Collection', 'https://opensea.io/collection/buttpluggy');
		printLink('Mint a Buttpluggy', 'https://buttpluggy.com/mine');

		printLink(
			'[Buttpluggy #' + fullId + '] on OpenSea',
			'https://opensea.io/item/ethereum/0x0000420538cd5abfbc7db219b6a1d125f5892ab0/' +
				String(parseInt(fullId))
		);
		/* utilities */
		function printLine(t) {
			const div = document.createElement('div');
			div.textContent = t + '\n';
			out.appendChild(div);
			out.scrollTop = out.scrollHeight;
		}

		function clear() {
			out.textContent = '';
		}

		/* clock --------------------------------------------------------------- */
		let clockRunning = false; // guard flag

		function clock() {
			if (clockRunning) return; // only one clock at a time
			clockRunning = true;

			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const interval = 1000; // update once per second
			let timerId = null;

			/* style so the canvas always covers the viewport and sits on top */
			Object.assign(canvas.style, {
				position: 'fixed',
				inset: 0,
				zIndex: 9999, // larger than anything else
				pointerEvents: 'none' // clicks go “through” the canvas
			});
			document.body.appendChild(canvas);

			/* full-window metrics + responsive font -------------------------- */
			function resize() {
				canvas.width = innerWidth;
				canvas.height = innerHeight;

				// scale the font to ~20 % of the shorter viewport edge
				const size = Math.floor(Math.min(innerWidth, innerHeight) * 0.2);
				ctx.font = size + 'px monospace';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
			}
			resize();
			window.addEventListener('resize', resize);

			/* render loop (once a second) ------------------------------------ */
			function draw() {
				ctx.fillStyle = '#000';
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.fillStyle = '#0f0';
				ctx.fillText(new Date().toLocaleTimeString(), canvas.width / 2, canvas.height / 2);
			}
			draw();
			timerId = setInterval(draw, interval);

			/* teardown on Esc ------------------------------------------------- */
			function escHandler(e) {
				if (e.key !== 'Escape') return;

				clearInterval(timerId);
				window.removeEventListener('resize', resize);
				document.removeEventListener('keydown', escHandler);
				canvas.remove();
				inp.focus(); // back to the terminal prompt
				clockRunning = false;
			}
			document.addEventListener('keydown', escHandler);
		}
		/* screensaver */
		function screensaver() {
			const logo = new Image();
			logo.src = gif.src;
			const c = document.createElement('canvas');
			const ctx = c.getContext('2d');
			let x = 100,
				y = 100,
				vx = 3,
				vy = 3,
				size = 128;

			function resize() {
				c.width = innerWidth;
				c.height = innerHeight;
			}
			resize();
			window.addEventListener('resize', resize);
			document.body.appendChild(c);

			function step() {
				ctx.fillStyle = 'rgba(0,0,0,0.2)';
				ctx.fillRect(0, 0, c.width, c.height);
				ctx.drawImage(logo, x, y, size, size);
				x += vx;
				y += vy;
				if (x <= 0 || x + size >= c.width) vx *= -1;
				if (y <= 0 || y + size >= c.height) vy *= -1;
				clockRAF = requestAnimationFrame(step);
			}
			step();
			const esc = (e) => {
				if (e.key === 'Escape') {
					cleanup();
				}
			};

			function cleanup() {
				cancelAnimationFrame(clockRAF);
				c.remove();
				window.removeEventListener('resize', resize);
				document.removeEventListener('keydown', esc);
			}
			document.addEventListener('keydown', esc);
		}
		/* command handler */
		inp.addEventListener('keydown', (e) => {
			if (e.key !== 'Enter') return;
			const cmd = inp.value.trim();
			inp.value = '';
			printLine('> ' + cmd);
			switch (cmd) {
				case 'help':
					printLine(helpText);
					break;
				case 'clear':
					clear();
					break;
				case 'ping':
					printLine('pong');
					break;
				case 'gif':
					printLine('(re-displaying)');
					out.appendChild(gif.cloneNode());
					break;
				case 'clock':
					clock();
					break;
				case 'screensaver':
					screensaver();
					break;
				case 'exit':
					location.reload();
					break;
				default:
					printLine('unknown command');
					break;
			}
			// clear input
			inp.value = '';
		});
	}
}
