<script lang="ts">
	import '../app.css';

	import { onMount } from 'svelte';

	import { dev } from '$app/environment';
	import { initWeb3 } from '../lib/store';

	import Header from './Header.svelte';
	// import Footer from './Footer.svelte';
	onMount(() => {
		initWeb3();
	});
</script>

<svelte:head>
	{#if dev}
		<script>
			if (!window.process) {
				window.process = { env: { NODE_ENV: 'development' } };
			}
		</script>
	{:else}
		<script>
			if (!window.process) {
				window.process = { env: { NODE_ENV: 'production' } };
			}
		</script>
	{/if}
</svelte:head>

<div class="min-h-screen flex flex-col bg-base-100 text-base-content font-sans">
	<Header />

	<!-- El contenido principal se inyecta acá -->
	<slot />

	<!--<Footer />-->
	<!-- src/lib/components/Footer.svelte -->
	<footer class="mt-0 bg-[#0b0d10] text-white/70 text-[0.84rem] tracking-[1px]">
		<div class="container mx-auto px-4 py-8">
			<div class="flex flex-col divide-y divide-white/10 space-y-4">
				<div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 py-2">
					<div class="text-white/30">SOCIALS</div>
					<div class="flex flex-wrap gap-x-4">
						<a href="https://twitter.com/webtresclub" target="_blank">𝕏 / Twitter</a>
						<a href="https://github.com/webtresclub/huffplug" target="_blank">GitHub</a>
					</div>
				</div>

				<div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 py-2">
					<div class="text-white/30">PLATFORM</div>
					<div class="flex flex-wrap gap-x-4">
						<a href="/mine">Mine</a>
						<a href="/claim">Claim</a>
						<a href="/attributes">Attributes</a>
					</div>
				</div>

				<div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 py-2">
					<div class="text-white/30">COLLECTION</div>
					<div class="flex flex-wrap gap-x-4">
						<a href="https://opensea.io/collection/buttpluggy" target="_blank">OpenSea</a>
						<a href="/about">About</a>
						<a href="/faq">FAQ</a>
					</div>
				</div>

				<div class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 py-2">
					<div class="text-white/30">LEGAL</div>
					<div class="flex flex-wrap gap-x-4">Code licensed MIT, docs CC BY-SA 4.0.</div>
				</div>
			</div>

			<div
				class="mt-6 text-white/30 text-[0.7rem] flex flex-col md:flex-row md:justify-between md:items-center"
			>
				<span>Buttpluggy © {new Date().getFullYear()}</span>
				<span class="hidden md:inline px-2">–</span>
				<span class="mt-1 md:mt-0">A WebtrES Club Project</span>
			</div>
		</div>
	</footer>

	<!--
	<footer>
		<div class="container border-t border-slate-700 pt-4 mt-2">
			<section>
				< !-- <h1>Buttplug!</h1> -- >
				<nav class="links">
					< !--
          TODO: Add a link to the latest release
          this code has been inspired by pico css homepage
        <ul>
          <li><strong>About</strong></li>
          <li><a class="secondary" href="/docs/v2">What's new?</a></li>
          <li><a class="secondary" href="/docs/brand">Brand</a></li>
          <li><a class="secondary" href="/docs/mission">Mission</a></li>
          <li><a class="secondary" href="/docs/usage-scenarios">Usage scenarios</a></li>
        </ul>
        <ul>
          <li><strong>Docs</strong></li>
          <li><a class="secondary" href="/docs">Quick start</a></li>
          <li><a class="secondary" href="/docs/version-picker">Version picker</a></li>
          <li><a class="secondary" href="/docs/classless">Class-less version</a></li>
          <li><a class="secondary" href="/docs/forms">Form elements</a></li>
        </ul>
        <ul>
          <li><strong>Community</strong></li>
          <li><a rel="noopener noreferrer" class="secondary" href="https://github.com/picocss/pico/issues"
              target="_blank">Issues</a></li>
          <li><a rel="noopener noreferrer" class="secondary" href="https://github.com/picocss/pico/discussions"
              target="_blank">Discussions</a></li>
          <li><a rel="noopener noreferrer" class="secondary"
              href="https://github.com/picocss/pico/discussions/categories/help" target="_blank">Help</a></li>
        </ul>
        <ul>
          <li><strong>Examples</strong></li>
          <li><a rel="noopener noreferrer" class="secondary"
              href="https://codesandbox.io/embed/4mrnhq?view=Editor+%2B+Preview&amp;module=%2Findex.html"
              target="_blank">HTML</a></li>
          <li><a rel="noopener noreferrer" class="secondary"
              href="https://codesandbox.io/embed/x4qtf8?view=Editor+%2B+Preview&amp;module=%2Findex.html"
              target="_blank">Class-less</a></li>
          <li><a rel="noopener noreferrer" class="secondary"
              href="https://codesandbox.io/p/devbox/github/picocss/examples/tree/master/v2-react-classless-login?embed=1&amp;file=%2Fsrc%2Fmain.scss"
              target="_blank">React</a></li>
          <li><a class="secondary" href="/examples">All</a></li>
        </ul>
        -- >
				</nav>
				<p class="build-info">
					Designed by <a
						rel="noopener noreferrer"
						class="secondary"
						href="https://webtres.club/"
						target="_blank">webtrES.club</a
					>.
				</p>
				<ul class="resources">
					<li>
						<a
							rel="noopener noreferrer"
							class="contrast"
							title="GitHub"
							href="https://github.com/webtresclub/huffplug/tree/main/src"
							target="_blank"
							aria-label="GitHub repository"
							><svg
								xmlns="http://www.w3.org/2000/svg"
								height="24"
								width="24.25"
								viewBox="0 0 496 512"
								class="icon-github"
								aria-hidden="true"
							>
								<path
									d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
								>
								</path>
							</svg></a
						>
					</li>
					<li>
						<a
							rel="noopener noreferrer"
							class="contrast"
							title="Twitter"
							href="https://twitter.com/webtresclub"
							target="_blank"
							aria-label="Twitter profile"
							><svg
								xmlns="http://www.w3.org/2000/svg"
								height="24"
								width="24"
								viewBox="0 0 512 512"
								class="icon-x"
								aria-hidden="true"
							>
								<path
									d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"
								>
								</path>
							</svg></a
						>
					</li>
				</ul>
			</section>
			<section>
				<p>

				</p>
			</section>
		</div>
	</footer>
-->
</div>
