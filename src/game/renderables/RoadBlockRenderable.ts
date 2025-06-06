import { Renderable } from '../../engine/Renderable';
import { Viewport } from '../../engine/Viewport';
import { Vec2D } from '../../engine/vec/Vec2D';
import { IVec2D } from '../../engine/vec/IVec2D';

export class RoadBlockRenderable implements Renderable {
    readonly position = new Vec2D();
    readonly size = new Vec2D();
    angle: number;
    color: string;
    constructor({
        position,
        size,
        angle = 0,
        color = 'blue',
    }: {
        position: IVec2D;
        size: IVec2D;
        angle?: number;
        color?: string;
    } ) {
        this.position.assign(position);
        this.size.assign(size);
        this.angle = angle;
        this.color = color;
    }

    render(ctx: CanvasRenderingContext2D, viewport: Viewport) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.size.x * -0.5,
            this.size.y * -0.5,
            this.size.x,
            this.size.y
        );

        ctx.restore();
    }
}
