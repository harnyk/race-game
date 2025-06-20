import { BaseGame } from '../common/BaseGame';
import { fromDeg } from '../engine/fromDeg';
import { CollisionDetector } from '../engine/physics/CollisionDetector';
import { Vec2D } from '../engine/vec/Vec2D';
import { Vec2DAverager } from '../engine/Vec2DAverager';
import { bindVec2 } from '../engine/bindVec2';
import { Block } from './Block';
import { Car } from './Car';
import { KeyboardControl, KeyCodeWASD } from './controls/KeyboardControl';
import { GameStateManager } from './GameStateManager';
import { CompassRenderable } from './renderables/CompassRenderable';
import { CurvedGrid } from './renderables/CurvedGrid';
import { GameStateOverlayRenderable } from './renderables/GameStateOverlayRenderable';
import { SpeedometerRenderable } from './renderables/SpeedometerRenderable';
import { TerroristEyesRenderable } from './renderables/TerroristEyesRenderable';
import { TerroristIndicatorRenderable } from './renderables/TerroristIndicatorRenderable';
import { Terrorist } from './Terrorist';

export class Game extends BaseGame {
    private controller: KeyboardControl;
    private terroristGravityCenterAverager = new Vec2DAverager();
    private gameState = new GameStateManager();
    private car!: Car;
    private terrorist!: Terrorist;
    private terroristEyes!: TerroristEyesRenderable;
    private collisionDetector!: CollisionDetector;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.controller = this.createController();
        this.initGameObjects();
    }

    private createController(): KeyboardControl {
        const controller = new KeyboardControl(KeyCodeWASD);
        controller.attach();
        return controller;
    }

    private createBlocks(): Block[] {
        const distanceBetweenBlocks = 6;
        const vertNumberOfBlocks = 5;
        const horNumberOfBlocks = 5;

        const blocks: Block[] = [];
        for (let x = 0; x < horNumberOfBlocks; x++) {
            for (let y = 0; y < vertNumberOfBlocks; y++) {
                blocks.push(
                    new Block(
                        this.context,
                        Vec2D.set(
                            new Vec2D(),
                            x * distanceBetweenBlocks,
                            y * distanceBetweenBlocks + 5
                        ),
                        Vec2D.set(new Vec2D(), 0.5, 0.5),
                        0,
                        false,
                        '#0a0',
                        '#a00'
                    )
                );
            }
        }
        return blocks;
    }

    private initGameObjects() {
        const roadBlocks = this.createBlocks();

        this.initCollisionDetector(roadBlocks);
        this.initCarAndTerrorist();
        this.initTerroristEyes();
        this.addRenderables(roadBlocks);

        this.setupControls();
    }

    private initTerroristEyes() {
        this.terroristEyes = new TerroristEyesRenderable(
            this.context,
            this.terrorist.body
        );
        bindVec2(this.terroristEyes, 'targetPosition').from(
            this.car.body,
            'position'
        );
    }

    private initCollisionDetector(roadBlocks: Block[]) {
        this.collisionDetector = new CollisionDetector(this.context);

        for (const block of roadBlocks) {
            this.terroristGravityCenterAverager.add(block.collider.position);

            this.collisionDetector.addBody(block.collider, {
                onCollisionStart: (body, other) => {
                    if (other === this.car.collider) {
                        if (block.isGood) {
                            this.world.remove(block.renderable);
                            this.collisionDetector.removeBody(body);
                            this.terroristGravityCenterAverager.remove(
                                body.position
                            );
                        } else {
                            this.car.body.angularVelocity = 10;
                            this.car.body.velocity.normalize();
                            this.car.body.velocity.scale(-10);
                        }
                    } else if (other === this.terrorist.collider) {
                        block.invert();
                    }
                },
            });
        }
    }

    private applyMutualGravity() {
        this.context.vectorPool.borrow((acquire) => {
            const dir = acquire();
            dir.assign(this.terrorist.body.position);
            dir.sub(this.car.body.position);

            const r = Math.max(dir.length, 2);
            dir.normalize();

            const G = 30;
            const forceMagnitude =
                (G * this.car.body.mass * this.terrorist.body.mass) / (r * r);
            dir.scale(forceMagnitude);

            this.car.body.applyForce(dir);

            dir.scale(-1);
            this.terrorist.body.applyForce(dir);
        });
    }


    private initCarAndTerrorist() {
        this.car = new Car(
            this.context,
            Vec2D.set(new Vec2D(), 0, 0),
            fromDeg(90)
        );

        this.terrorist = new Terrorist(
            this.context,
            Vec2D.set(new Vec2D(), 10, 10),
            fromDeg(90),
            this.terroristGravityCenterAverager
        );

        this.collisionDetector.addBody(this.car.collider, {
            onCollisionStart: (body, other) => {
                if (
                    other === this.terrorist.collider &&
                    this.gameState.isPlaying()
                ) {
                    this.gameState.lose();
                }
            },
        });
        this.collisionDetector.addBody(this.terrorist.collider);
    }

    private addRenderables(blocks: Block[]) {
        const grid = new CurvedGrid(this.context, 1, '#222');
        grid.setGravityWell(this.terrorist.body.position);
        this.world.add(grid);

        for (const b of blocks) {
            this.world.add(b.renderable);
        }

        this.world.add(this.car);
        this.world.add(this.terrorist);
        this.world.add(this.terroristEyes);
        this.world.add(new CompassRenderable());
        this.world.add(new SpeedometerRenderable(this.car.body));
        this.world.add(
            new TerroristIndicatorRenderable(
                this.context,
                this.car.body,
                this.terrorist.body
            )
        );
        this.world.add(new GameStateOverlayRenderable(this.gameState));
    }

    private setupControls() {
        const throttleDelta = 0.5;
        const steeringDelta = 0.5;

        this.controller.subscribe(({ type, value }) => {
            switch (type) {
                case 'vertical':
                    this.car.controller.setThrottle(value * throttleDelta);
                    break;
                case 'horizontal':
                    this.car.controller.setSteering(-value * steeringDelta);
                    break;
            }
        });
    }

    protected override update(dt: number) {
        if (!this.gameState.isPlaying()) return;
        this.applyMutualGravity();
        super.update(dt);
        this.checkVictoryOrDefeat();
    }

    protected override frame() {
        this.updateCamera();
        this.collisionDetector.detect();
        super.frame();
    }


    private checkVictoryOrDefeat() {
        if (this.terroristGravityCenterAverager.count === 0) {
            this.gameState.win();
            return;
        }
    }

    private updateCamera() {
        this.viewport.rotation = fromDeg(90) - this.car.body.angle;

        this.context.vectorPool.borrow((acquire) => {
            const tmp = acquire();
            tmp.assign(this.car.body.position);
            this.viewport.worldToScreenPoint(tmp);
            tmp.set(tmp.x, tmp.y - this.canvas.height * 0.25);
            this.viewport.screenToWorldPoint(tmp);
            this.viewport.center.assign(tmp);
        });
    }
}
