<header class="navbar bg-[#0b0d10] border-b border-base-300 px-6 py-4">
	<div class="flex-1 gap-2 items-center">
		<a href="/" class="flex items-center gap-2 no-underline hover:opacity-80 transition">
			<img src="/favicon.gif" alt="Buttpluggy Logo" class="w-8 h-8" />

			<div>
				<h1 class="text-2xl md:text-3xl font-bold leading-tight">
					<span class="font-bold">Buttplugs</span>
					<small class="hidden lg:inline text-sm text-base-content/70 ml-1">(UwU)</small>
				</h1>
				<p class="text-xs hidden lg:inline md:text-sm text-base-content/60 -mt-1">A Huff NFT collection</p>
			</div>
		</a>
	</div>

	<!-- Mobile Menu -->
	<div class="flex-none sm:hidden">
		<div class="dropdown dropdown-end">
			<label tabindex="0" class="btn btn-ghost">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</label>
			<ul
				tabindex="0"
				class="menu dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
			>
				<li><a href="/mine">🌱 Mint</a></li>
				<li><a href="/attributes">🖼 Gallery</a></li>
				<li>
					<a href="https://opensea.io/collection/buttpluggy" target="_blank">🌊 OpenSea</a>
				</li>
				<li>
					<a href="https://github.com/webtresclub/huffplug" target="_blank">💻 GitHub</a>
				</li>
			</ul>
		</div>
	</div>

	<!-- Desktop Nav -->
	<nav class="flex-none gap-2 hidden sm:flex">
		<a href="/mine" class="btn btn-sm btn-ghost">🌱 Mint</a>
		<a href="/attributes" class="btn btn-sm btn-ghost">🖼 Gallery</a>
		<a href="https://opensea.io/collection/buttpluggy" target="_blank" class="btn btn-sm btn-ghost"
			>🌊 OpenSea</a
		>
		<a href="https://github.com/webtresclub/huffplug" target="_blank" class="btn btn-sm btn-ghost"
			>💻 GitHub</a
		>
	</nav>

	<!-- WalletConnect button -->
	<div class="flex-none ml-4">
		<w3m-button></w3m-button>
	</div>
</header>
