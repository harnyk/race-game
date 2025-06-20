import { Context } from '../engine/Context';
import { BoxCollisionBody } from '../engine/physics/BoxCollisionBody';
import { CollisionBody } from '../engine/physics/CollisionBody';
import { RigidBody2D } from '../engine/physics/RigidBody2D';
import { Vec2D } from '../engine/vec/Vec2D';
import { CarRenderable } from './renderables/CarRenderable';
import { VehicleController } from './VehicleController';
import { Node } from '../engine/Node';
import { bindVec2 } from '../engine/bindVec2';
import { bindScalar } from '../engine/bindScalar';

export class Car extends Node {
    readonly body: RigidBody2D;
    readonly controller: VehicleController;
    readonly renderable: CarRenderable;
    readonly collider: CollisionBody;

    constructor(
        private readonly context: Context,
        initialPosition: Vec2D,
        initialRotation = 0
    ) {
        super();
        this.body = new RigidBody2D(initialPosition, initialRotation, 1, 0.1);
        
        this.renderable = new CarRenderable();
        
        this.controller = new VehicleController(this.body);
        this.controller.setFriction(0.3);
        this.controller.setAngularFriction(1);
        
        this.collider = new BoxCollisionBody(
            context,
            this.body.position,
            Vec2D.set(new Vec2D(), 1, 0.5),
            this.body.angle,
            'dynamic'
        );

        this.add(this.body);
        this.add(this.collider);
        this.add(this.renderable);
        this.add(this.controller);
        
        bindVec2(this.renderable, 'position').from(this.body, 'position');
        bindScalar(this.renderable, 'angle').from(this.body, 'angle');

        bindVec2(this.collider, 'position').from(this.body, 'position');
        bindScalar(this.collider, 'angle').from(this.body, 'angle');
    }

    boost(k: number) {
        this.body.velocity.scale(k);
    }
}
