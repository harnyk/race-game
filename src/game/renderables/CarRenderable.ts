import { Renderable } from '../../engine/Renderable';
import { IVec2D } from '../../engine/vec/IVec2D';
import { Vec2D } from '../../engine/vec/Vec2D';

export class CarRenderable implements Renderable {
    readonly position: Vec2D = new Vec2D();
    angle: number;

    #wheelCoords = [
        new Vec2D().set(0.35, 0.3).toImmutable(),
        new Vec2D().set(-0.35, 0.3).toImmutable(),
        new Vec2D().set(0.35, -0.3).toImmutable(),
        new Vec2D().set(-0.35, -0.3).toImmutable(),
    ];

    #wheelSize = new Vec2D().set(0.2, 0.1).toImmutable();

    constructor(position: IVec2D, angle = 0) {
        this.position.assign(position);
        this.angle = angle;
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = 'blue';
        ctx.fillRect(-0.5, -0.25, 1, 0.5);

        this.#wheelCoords.forEach((vec) => {
            this.#renderWheel(ctx, vec);
        });

        ctx.restore();
    }

    #renderWheel(ctx: CanvasRenderingContext2D, center: IVec2D) {
        ctx.fillStyle = 'black';
        const size = this.#wheelSize;
        ctx.fillRect(
            center.x - size.x / 2,
            center.y - size.y / 2,
            size.x,
            size.y
        );
    }
}
