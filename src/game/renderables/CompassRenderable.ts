import { Renderable } from '../../engine/Renderable';
import { Viewport } from '../../engine/Viewport';
import { Vec2D } from '../../engine/vec/Vec2D';

export class CompassRenderable implements Renderable {
    size: number;
    #viewportCenter: Vec2D = new Vec2D();

    constructor(size = 50) {
        this.size = size;
    }

    render(ctx: CanvasRenderingContext2D, viewport: Viewport) {
        const padding = 10;
        this.#viewportCenter.x =
            viewport.canvasSize.x - this.size / 2 - padding;
        this.#viewportCenter.y = this.size / 2 + padding;
        const center = this.#viewportCenter;

        ctx.save();

        // Рисуем в экранных координатах, не применяя transform
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(center.x, center.y);

        // Основной круг
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#222';
        ctx.fill();

        // Вращаем стрелки в обратную сторону камеры (чтобы север был вверх, юг — вниз)
        ctx.rotate(-viewport.rotation);

        // Южная стрелка (вниз, 90°)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, this.size / 2 - 5);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Северная стрелка (вверх, 270°)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -this.size / 2 + 5);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }
}
