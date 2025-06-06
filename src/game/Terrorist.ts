import { CollisionBody } from '../engine/physics/CollisionBody';
import { RegularPolygonCollisionBody } from '../engine/physics/RegularPolygonCollisionBody';
import { RigidBody2D } from '../engine/physics/RigidBody2D';
import { Vec2D } from '../engine/vec/Vec2D';
import { Block } from './Block';
import { RegularPolygonRenderable } from './renderables/RegularPolygonRenderable';

export class Terrorist {
    readonly renderable: RegularPolygonRenderable;
    readonly collider: RegularPolygonCollisionBody;
    readonly body: RigidBody2D;
    private timeAccumulator: number = 0;

    constructor(
        position: Vec2D,
        angle = 0,
        public readonly colliderToBlock: Map<CollisionBody, Block>
    ) {
        const radius = 3;
        const sides = 5;

        this.renderable = new RegularPolygonRenderable({
            position,
            radius,
            sides,
            angle: angle,
            color: '#333',
        });

        this.collider = new RegularPolygonCollisionBody(
            position,
            radius,
            sides,
            angle,
            'dynamic'
        );

        this.body = new RigidBody2D(position, angle, 1, 0.1);
        this.body.applyTorque(1);
    }

    update(dt: number) {
        this.timeAccumulator += dt;
        if (this.timeAccumulator >= 1) {
            if (this.colliderToBlock.size > 0) {
                const center = this.#getAveragePositionOfAllBlocks();
                center.sub(this.body.position).normalize().scale(50);
                this.body.applyForce(center.toLegacy());
            }
            this.timeAccumulator = 0;
        }

        this.renderable.position.assign(this.body.position);
        this.renderable.angle = this.body.angle;
        this.collider.position.assign(this.body.position);
        this.collider.angle = this.body.angle;
        this.body.update(dt);
    }

    readonly #sum = new Vec2D();
    #getAveragePositionOfAllBlocks() {
        const sum = this.#sum;
        sum.zero();

        for (const block of this.colliderToBlock.values()) {
            sum.add(block.renderable.position);
        }
        sum.scale(1 / this.colliderToBlock.size);
        return sum;
    }
}
