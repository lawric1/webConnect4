import { startInputEvents } from "./input.js";
import { Vector2 } from "./math.js";
import { preloadImages } from "./preload.js"


class GameSettings {
    constructor() {
        this.width;
        this.height;
        this.canvasScale;

        this.mousePos = new Vector2();
        
        this.textures;
        
        this.possibleGameStates = ["start", "run", "gameover"];
        this.state = "start";

        this.layers = {};

        this.inputCanvas = null;
    }

    setGameState(newState) {
        if (this.possibleGameStates.includes(newState)) {
            this.state = newState;
        }
    }

    createWindow(w, h, scale) {
        [this.width, this.height, this.canvasScale] = [w, h, scale];
    
        // Input events need this first canvas layer to operate.
        this.addLayer("inputCanvas", 999);
        this.inputCanvas = document.getElementsByTagName("canvas")[0];
        startInputEvents();
    
        let style = document.createElement('style');
        style.textContent = `
            canvas {
                position: absolute;
                scale: ${this.canvasScale};
                image-rendering: pixelated;
                font-smooth: never;
                -webkit-font-smoothing: none;
            }
        `;
        document.head.appendChild(style);
    
        return true;
    }

    addLayer(layerName, zIndex, antialiasing = true) {
        // Filter to disable anti-aliasing
        let aaFilter = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="f" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer></filter></svg>#f')`

        // Create this div in the html file, this is where all the canvas layers will be pushed to.
        const layersDiv = document.getElementById('layers');

        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        canvas.style.width = this.width * this.canvasScale;
        canvas.style.height = this.height * this.canvasScale;
        canvas.style.position = 'absolute';
        canvas.style.zIndex = zIndex;
    
        const context = canvas.getContext('2d');
        
        // Make pixel art sprites crisper when scaling and rotating.
        context.imageSmoothingEnabled = false;
    
        if (!antialiasing) {
            context.filter = aaFilter;
        }
    
        this.layers[layerName] = context;
    
        layersDiv.appendChild(canvas);
    }

    async preloadAll(urls) {
        this.textures = await preloadImages(urls);
    }
}

export let Game = new GameSettings();