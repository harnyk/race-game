import { FixedTimestepIntegrator } from './engine/FixedTimestepIntegrator';
import { Grid } from './engine/Grid';
import { Vec2DLegacy } from './engine/vec/Vec2DLegacy';
import { Viewport } from './engine/Viewport';
import { World } from './engine/World';
import { WorldRenderer } from './engine/WorldRenderer';
import { fromDeg } from './engine/fromDeg';
import { CollisionDetector } from './engine/physics/CollisionDetector';
import { CollisionBody } from './engine/physics/CollisionBody';
import { Block } from './game/Block';
import { Car } from './game/Car';
import { VehicleController } from './game/VehicleController';
import { KeyboardControl, KeyCodeWASD } from './game/controls/KeyboardControl';
import { CompassRenderable } from './game/renderables/CompassRenderable';
import { SpeedometerRenderable } from './game/renderables/SpeedometerRenderable';
import { Terrorist } from './game/Terrorist';
import { Vec2D } from './engine/vec/Vec2D';

function createRoadBlocks() {
    const roadBlocks: Block[] = [];
    for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
            const color = Math.random() < 0.5 ? '#a00' : '#0a0';
            roadBlocks.push(
                new Block(
                    new Vec2D().set(x * 7, y * 7 + 5),
                    new Vec2D().set(0.5, 0.5),
                    0,
                    color
                )
            );
        }
    }
    return roadBlocks;
}

function setupKeyboardControl(
    controller: VehicleController,
    control: KeyboardControl
) {
    const throttleDelta = 0.5;
    const steeringDelta = 0.5;

    control.subscribe(({ type, value }) => {
        switch (type) {
            case 'vertical':
                controller.setThrottle(value * throttleDelta);
                break;
            case 'horizontal':
                controller.setSteering(-value * steeringDelta);
                break;
        }
    });
}

function main() {
    const canvas: HTMLCanvasElement = document.querySelector('canvas#canvas')!;
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    const ctx = canvas.getContext('2d')!;

    const viewport = new Viewport(
        new Vec2DLegacy(0, 0),
        50,
        new Vec2DLegacy(canvas.width, canvas.height)
    );

    const renderer = new WorldRenderer(ctx, viewport);

    const gameController = new KeyboardControl(KeyCodeWASD);
    gameController.attach();

    const world = new World();

    const roadBlocks = createRoadBlocks();
    const colliderToBlock = new Map<CollisionBody, Block>();
    const grid = new Grid(1, '#ddd');
    const car = new Car(new Vec2D().set(0, 0), fromDeg(90));
    const terrorist = new Terrorist(
        new Vec2D().set(10, 10),
        fromDeg(90),
        colliderToBlock
    );
    const compass = new CompassRenderable();
    const speedometer = new SpeedometerRenderable(car.body);

    world.add(grid);
    const collisionDetector = new CollisionDetector();
    for (const block of roadBlocks) {
        world.add(block.renderable);
        collisionDetector.addBody(block.collider);
        colliderToBlock.set(block.collider, block);
    }
    world.add(car.renderable);
    world.add(terrorist.renderable);
    world.add(speedometer);
    world.add(compass);

    collisionDetector.addBody(car.collider);
    collisionDetector.addBody(terrorist.collider);

    const integrator = new FixedTimestepIntegrator(60);

    function loop() {
        integrator.update((dt) => {
            car.update(dt);
            terrorist.update(dt);
        });

        viewport.rotation = fromDeg(90) - car.body.angle;
        viewport.center = viewport.screenToWorldPoint(
            viewport
                .worldToScreenPoint(car.body.position.toLegacy())
                .sub(new Vec2DLegacy(0, canvas.height * 0.25))
        );

        const collisions = collisionDetector
            .detect()
            .filter(({ a, b }) => a === car.collider || b === car.collider);

        for (const { a, b } of collisions) {
            const other = a === car.collider ? b : a;
            const block = colliderToBlock.get(other);
            if (block) {
                world.remove(block.renderable);
                collisionDetector.removeBody(block.collider);
                colliderToBlock.delete(other);
            }
        }

        renderer.render(world);

        requestAnimationFrame(loop);
    }

    setupKeyboardControl(car.controller, gameController);
    loop();
}

main();
