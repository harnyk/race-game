import { IVec2D } from '../vec/IVec2D';
import { ImmutableVec2D, Vec2D } from '../vec/Vec2D';
import { BodyType } from './CollisionDetector';

export abstract class CollisionBody {
    readonly position = new Vec2D();
    angle: number;
    type: BodyType;

    protected readonly axes: Vec2D[] = [];
    protected readonly vertices: Vec2D[] = [];

    constructor(position: IVec2D, angle = 0, type: BodyType = 'dynamic') {
        this.position.assign(position);
        this.angle = angle;
        this.type = type;
    }

    protected abstract preallocateVertices(): void;
    protected abstract preallocateAxes(): void;
    protected abstract computeVertices(): void;

    protected preallocate(): void {
        this.preallocateVertices();
        this.preallocateAxes();
    }

    protected computeAxes(): void {
        const verts = this.getVertices();
        const axes = this.axes;

        for (let i = 0; i < verts.length; i++) {
            const p1 = verts[i];
            const p2 = verts[(i + 1) % verts.length];
            const axis = axes[i];
            axis.assign(p2);
            axis.sub(p1);
            axis.set(-axis.y, axis.x);
            axis.normalize();
        }
    }

    getVertices() {
        this.computeVertices();
        return this.vertices as ImmutableVec2D[];
    }

    getAxes() {
        this.computeAxes();
        return this.axes as ImmutableVec2D[];
    }
}
