import { Renderable } from '../../engine/Renderable';
import { Viewport } from '../../engine/Viewport';
import { IVec2D } from '../../engine/vec/IVec2D';
import { Vec2D } from '../../engine/vec/Vec2D';

export class RegularPolygonRenderable implements Renderable {
    readonly position = new Vec2D();
    radius: number;
    sides: number;
    angle: number;
    color: string;

    constructor({
        position,
        radius = 0.5,
        sides = 3,
        angle = 0,
        color = 'blue',
    }: {
        position: IVec2D;
        radius?: number;
        sides?: number;
        angle?: number;
        color?: string;
    }) {
        this.position.assign(position);
        this.radius = radius;
        this.sides = sides;
        this.angle = angle;
        this.color = color;
    }

    #local = new Vec2D();

    render(ctx: CanvasRenderingContext2D, viewport: Viewport) {
        const local = this.#local;
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        for (let i = 0; i < this.sides; i++) {
            this.#local.assignPolar(
                this.radius,
                (2 * Math.PI * i) / this.sides
            );
            if (i === 0) {
                ctx.moveTo(local.x, local.y);
            } else {
                ctx.lineTo(local.x, local.y);
            }
        }
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.restore();
    }
}
