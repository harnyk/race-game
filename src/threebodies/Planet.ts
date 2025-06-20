import { bindVec2 } from '../engine/bindVec2';
import { Node } from '../engine/Node';
import { RigidBody2D } from '../engine/physics/RigidBody2D';
import { Vec2D } from '../engine/vec/Vec2D';
import { PlanetRenderable } from './PlanetRenderable';

export class Planet extends Node {
    body: RigidBody2D;
    renderable: PlanetRenderable;
    constructor(
        public readonly options: {
            color: string;
            radius: number;
            mass: number;
        }
    ) {
        super();
        this.body = new RigidBody2D(new Vec2D(), 0, options.mass, 0);
        this.renderable = new PlanetRenderable(
            this.options.color,
            options.mass,
            options.radius
        );

        this.add(this.renderable);
        this.add(this.body);

        bindVec2(this.renderable, 'position').from(this.body, 'position');
    }
}
