<script lang="ts">
  import { onMount } from 'svelte';


  


  onMount(async () => {
    const { Game, Scene, AUTO } = await import("phaser");

class Example extends Phaser.Scene {
    constructor() {
        super();
        this.tileSize = 120; // Size of each tile
        this.mapSize = { width: 32, height: 32 }; // Map dimensions in tiles
    }

    preload() {
        // Possibly preload other assets needed upfront
    }

    create() {
        this.cameras.main.setBounds(-60, -60, this.tileSize * this.mapSize.width + 60, this.tileSize * this.mapSize.height + 60);
        this.cameras.main.setZoom(1);

        this.loadedTiles = {};

        
     // Enable panning with the mouse
        this.input.on('pointerdown', (pointer) => {
            this.dragPoint = { x: pointer.x, y: pointer.y };
        });

        this.input.on('pointermove', (pointer) => {
            if (this.dragPoint) {
                this.cameras.main.scrollX -= (pointer.x - this.dragPoint.x) / this.cameras.main.zoom;
                this.cameras.main.scrollY -= (pointer.y - this.dragPoint.y) / this.cameras.main.zoom;
                this.dragPoint = { x: pointer.x, y: pointer.y };
            }
        });

        this.input.on('pointerup', (pointer) => {
            this.dragPoint = null;
        });

        // Enable zooming with the mouse wheel
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            const zoomFactor = 0.001; // Adjust zoom speed
            this.cameras.main.zoom -= deltaY * zoomFactor;
            this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom, 0.2, 2); // Adjust min/max zoom levels
            console.log(this.cameras.main.zoom)
        });



        this.loadVisibleTiles();
    }

    update() {
        this.loadVisibleTiles();
    }

    loadVisibleTiles() {
        const cam = this.cameras.main;
        const visibleLeft = cam.scrollX;
        const visibleRight = cam.scrollX + cam.width / cam.zoom;
        const visibleTop = cam.scrollY;
        const visibleBottom = cam.scrollY + cam.height / cam.zoom;

        const fromX = Math.max(0, Math.floor(visibleLeft / 120));
        const toX = Math.min(32, Math.ceil(visibleRight / 120));
        const fromY = Math.max(0, Math.floor(visibleTop / 120));
        const toY = Math.min(32,Math.ceil(visibleBottom / 120));

        //console.log()
        

        for (let y = fromY; y < toY; y++) {
            for (let x = fromX; x < toX; x++) {
                const tileKey = `tile-${x}-${y}`;
                if (!this.loadedTiles[tileKey]) {
                    const tileIndex = y * this.mapSize.width + x + 1;
                    const imagePath = `/images_small/${('00000'+tileIndex).slice(-4)}.png`;
                    
                    if (!this.textures.exists(`tile${tileIndex}`)) {
                        console.log(('00000'+tileIndex).slice(-4))

                        this.load.image(`tile${tileIndex}`, imagePath);
                        this.load.once('complete', () => {
                            const tile = this.add.image(x * this.tileSize, y * this.tileSize, `tile${tileIndex}`).setOrigin(0);
                        });
                        this.load.start();
                    } else {
                        const tile = this.add.image(x * this.tileSize, y * this.tileSize, `tile${tileIndex}`).setOrigin(0);
                    }

                    this.loadedTiles[tileKey] = true;
                }
            }
        }
    }
}


    const game = new Game({
        type: Phaser.AUTO,
        parent: 'canva-container',
        width: document.getElementById('canva-container').clientWidth,
        height: document.getElementById('canva-container').clientHeight,
        pixelArt: true,
        backgroundColor: '#222222',
        scene: Example

    });
  });

</script>

<div id="canva-container">
</div>
<style>
	div {
		border: 5px solid #000;
		padding:2px;
		height: 500px;
		width: 500px;
	}
	canvas {
		
		height: 100%;
		width: 100%;
		background-color: #666;
		
	}
</style>
