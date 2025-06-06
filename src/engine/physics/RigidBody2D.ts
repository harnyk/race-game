import { IVec2D } from '../vec/IVec2D';
import { Vec2D } from '../vec/Vec2D';

export class RigidBody2D {
    readonly position = new Vec2D();
    readonly velocity = new Vec2D();
    readonly acceleration = new Vec2D();
    readonly force = new Vec2D();

    angle: number;
    angularVelocity: number;
    angularForce: number;

    mass: number;
    momentOfInertia: number;

    constructor(position: IVec2D, angle = 0, mass = 1, momentOfInertia = 1) {
        this.position.assign(position);

        this.angle = angle;
        this.angularVelocity = 0;
        this.angularForce = 0;

        this.mass = mass;
        this.momentOfInertia = momentOfInertia;
    }

    applyForce(force: IVec2D) {
        this.force.add(force);
    }

    applyTorque(torque: number) {
        this.angularForce += torque;
    }

    update(dt: number) {
        // linear physics
        this.acceleration.x = this.force.x / this.mass;
        this.acceleration.y = this.force.y / this.mass;

        this.velocity.x += this.acceleration.x * dt;
        this.velocity.y += this.acceleration.y * dt;

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        // angular physics
        const angularAcceleration = this.angularForce / this.momentOfInertia;
        this.angularVelocity += angularAcceleration * dt;
        this.angle += this.angularVelocity * dt;

        // reset forces (once forces, like impulse)
        this.force.zero();
        this.angularForce = 0;
    }
}
