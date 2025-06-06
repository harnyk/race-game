import { BoxCollisionBody } from '../engine/physics/BoxCollisionBody';
import { CollisionBody } from '../engine/physics/CollisionBody';
import { RigidBody2D } from '../engine/physics/RigidBody2D';
import { Vec2D } from '../engine/vec/Vec2D';
import { CarRenderable } from './renderables/CarRenderable';
import { VehicleController } from './VehicleController';

export class Car {
    readonly body: RigidBody2D;
    readonly controller: VehicleController;
    readonly renderable: CarRenderable;
    readonly collider: CollisionBody;

    constructor(initialPosition: Vec2D, initialRotation = 0) {
        this.body = new RigidBody2D(initialPosition, initialRotation, 1, 0.1);

        this.renderable = new CarRenderable(this.body.position);

        this.controller = new VehicleController(this.body);
        this.controller.setFriction(0.3);
        this.controller.setAngularFriction(1);

        this.collider = new BoxCollisionBody(
            this.body.position,
            new Vec2D().set(1, 0.5),
            this.body.angle,
            'dynamic'
        );
    }

    update(dt: number) {
        this.renderable.position.assign(this.body.position);
        this.renderable.angle = this.body.angle;
        this.collider.position.assign(this.body.position);
        this.collider.angle = this.body.angle;

        this.body.update(dt);
        this.controller.update(dt);
    }
}
