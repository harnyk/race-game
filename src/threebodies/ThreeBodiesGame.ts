import { BaseGame } from '../common/BaseGame';
import { Grid } from '../engine/Grid';
import { Planet } from './Planet';

export class ThreeBodiesGame extends BaseGame {
    private grid = new Grid(this.context, 10);

    private planets: Planet[] = [];

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        this.world.add(this.grid);

        this.generateRandomPlanets();

        for (const planet of this.planets) {
            this.world.add(planet);
        }
    }

    public generateRandomPlanets() {
        for (let i = 0; i < 100; i++) {
            const mass = 2 ** (Math.random() * 4 + 0.3);
            const colorRed = Math.random() * 255;
            const colorGreen = Math.random() * 255;
            const colorBlue = Math.random() * 255;
            const color = `rgb(${colorRed}, ${colorGreen}, ${colorBlue})`;
            const radius = mass * 0.3;

            this.planets.push(
                new Planet({
                    color,
                    radius,
                    mass,
                })
            );
        }

        this.planets.push(
            new Planet({
                color: 'white',
                radius: 0.5,
                mass: 10000,
            })
        );
    }

    private applyGravity(planets: Planet[]) {
        this.context.vectorPool.borrow((acquire) => {
            for (let i = 0; i < planets.length; i++) {
                const pi = planets[i];
                for (let j = i + 1; j < planets.length; j++) {
                    const pj = planets[j];
                    const dir = acquire();

                    dir.assign(pj.body.position);
                    dir.sub(pi.body.position);

                    const dist = Math.max(dir.length, 0.5);
                    dir.normalize();

                    const G = 10;
                    const f = (G * pi.body.mass * pj.body.mass) / (dist * dist);

                    const force = acquire();
                    force.assign(dir);
                    force.scale(f);

                    pi.body.applyForce(force);
                    force.scale(-1);
                    pj.body.applyForce(force);
                }
            }
        });
    }

    private updateViewportToFit(planets: Planet[]) {
        this.context.vectorPool.borrow((acquire) => {
            // Exponent of mass
            const gamma = 2;

            const weightedCenter = acquire();
            weightedCenter.zero();

            let totalWeight = 0;
            for (const p of planets) {
                const weight = Math.pow(p.body.mass, gamma);
                weightedCenter.x += p.body.position.x * weight;
                weightedCenter.y += p.body.position.y * weight;
                totalWeight += weight;
            }
            weightedCenter.scale(1 / totalWeight);

            // Evaluate "importance" of bodies for focus
            const weighted = planets.map((p) => {
                const dx = p.body.position.x - weightedCenter.x;
                const dy = p.body.position.y - weightedCenter.y;
                const distSq = dx * dx + dy * dy;
                const weight = Math.pow(p.body.mass, gamma) / (1 + distSq);
                return { planet: p, weight };
            });

            weighted.sort((a, b) => b.weight - a.weight);

            // const coreCount = Math.floor(planets.length * 0.1);
            // Number of most interesting planets
            const coreCount = 6
            const core = weighted.slice(0, coreCount).map((e) => e.planet);

            const bounds = {
                minX: Infinity,
                maxX: -Infinity,
                minY: Infinity,
                maxY: -Infinity,
            };

            for (const p of core) {
                const r = p.options.radius;
                const pos = p.body.position;

                bounds.minX = Math.min(bounds.minX, pos.x - r);
                bounds.maxX = Math.max(bounds.maxX, pos.x + r);
                bounds.minY = Math.min(bounds.minY, pos.y - r);
                bounds.maxY = Math.max(bounds.maxY, pos.y + r);
            }

            const padding = 5;
            const width = bounds.maxX - bounds.minX + padding * 2;
            const height = bounds.maxY - bounds.minY + padding * 2;

            const cx = (bounds.minX + bounds.maxX) / 2;
            const cy = (bounds.minY + bounds.maxY) / 2;

            const canvasWidth = this.viewport.canvasSize.x;
            const canvasHeight = this.viewport.canvasSize.y;

            const zoomX = canvasWidth / width;
            const zoomY = canvasHeight / height;
            const targetZoom = Math.min(zoomX, zoomY);

            // Camera inertion
            const alpha = 0.02;

            this.viewport.center.x += (cx - this.viewport.center.x) * alpha;
            this.viewport.center.y += (cy - this.viewport.center.y) * alpha;
            this.viewport.zoom += (targetZoom - this.viewport.zoom) * alpha;
        });
    }

    public override start() {
        for (const planet of this.planets) {
            planet.body.position.set(
                Math.random() * 300 - 150,
                Math.random() * 300 - 150
            );
            planet.body.velocity.set(
                Math.random() * 1 - 0.5,
                Math.random() * 1 - 0.5
            );
        }
        super.start();
    }

    protected override update(dt: number) {
        this.applyGravity(this.planets);
        this.updateViewportToFit(this.planets);
        for (const planet of this.planets) {
            planet.body.update(dt);
        }
        super.update(dt);
    }
}
