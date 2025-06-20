import { Context } from '../engine/Context';
import { FixedTimestepIntegrator } from '../engine/FixedTimestepIntegrator';
import { Vec2D } from '../engine/vec/Vec2D';
import { Viewport } from '../engine/Viewport';
import { World } from '../engine/World';
import { WorldRenderer } from '../engine/WorldRenderer';
import { IGame } from '../ui/IGame';

export abstract class BaseGame implements IGame {
    protected context = new Context();
    protected canvas: HTMLCanvasElement;
    protected renderer: WorldRenderer;
    protected viewport: Viewport;
    protected world = new World(this.context);
    protected integrator = new FixedTimestepIntegrator(60);
    protected paused = false;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.setupCanvasSize();
        this.viewport = this.createViewport();
        this.renderer = this.createRenderer();
    }

    protected setupCanvasSize() {
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
    }

    protected createViewport(): Viewport {
        return new Viewport(
            this.context,
            Vec2D.set(new Vec2D(), 0, 0),
            50,
            Vec2D.set(new Vec2D(), this.canvas.width, this.canvas.height)
        );
    }

    protected createRenderer(): WorldRenderer {
        return new WorldRenderer(
            this.context,
            this.canvas.getContext('2d')!,
            this.viewport
        );
    }

    protected update(dt: number) {
        this.world.update(dt);
    }

    protected frame() {
        this.renderer.render(this.world);
    }

    public start() {
        const loop = () => {
            if (!this.paused) {
                this.integrator.update((dt) => this.update(dt));
            } else {
                this.integrator.reset();
            }

            this.frame();
            requestAnimationFrame(loop);
        };

        loop();
    }

    public resize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.viewport.canvasSize.set(width, height);
    }

    public pause() {
        this.paused = true;
    }

    public resume() {
        this.paused = false;
    }

    public togglePause() {
        this.paused = !this.paused;
    }
}
