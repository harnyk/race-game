import { Node } from '../engine/Node';
import { Vec2D } from '../engine/vec/Vec2D';
import { Viewport } from '../engine/Viewport';

export class PlanetRenderable extends Node {
    constructor(
        public readonly color: string = 'red',
        public readonly mass = 1,
        public readonly radius = 1
    ) {
        super();
    }

    public readonly position = new Vec2D();

    render(ctx: CanvasRenderingContext2D, viewport: Viewport) {
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.restore();
    }
}
