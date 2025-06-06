import { ImmutableVec2D, Vec2D } from '../vec/Vec2D';
import { CollisionBody } from './CollisionBody';

export type BodyType = 'static' | 'dynamic';

export type CollisionPair = { a: CollisionBody; b: CollisionBody };

export class CollisionDetector {
    private bodies: CollisionBody[] = [];

    addBody(body: CollisionBody) {
        this.bodies.push(body);
    }

    removeBody(body: CollisionBody) {
        const index = this.bodies.indexOf(body);
        if (index >= 0) this.bodies.splice(index, 1);
    }

    readonly #tmpAxis = new Vec2D();
    readonly #tmpVec = new Vec2D();
    detect(): CollisionPair[] {
        const pairs: CollisionPair[] = [];
        for (let i = 0; i < this.bodies.length; i++) {
            const a = this.bodies[i];
            for (let j = i + 1; j < this.bodies.length; j++) {
                const b = this.bodies[j];
                if (a.type === 'static' && b.type === 'static') continue;
                if (this.#overlap(a, b, this.#tmpAxis, this.#tmpVec)) {
                    pairs.push({ a, b });
                }
            }
        }
        return pairs;
    }

    #overlap(
        a: CollisionBody,
        b: CollisionBody,
        axisBuf: Vec2D,
        tmp: Vec2D
    ): boolean {
        const axesA = a.getAxes();
        const axesB = b.getAxes();
        const vertsA = a.getVertices();
        const vertsB = b.getVertices();

        for (let i = 0; i < axesA.length; i++) {
            if (!this.#testAxis(vertsA, vertsB, axesA[i], axisBuf, tmp))
                return false;
        }
        for (let i = 0; i < axesB.length; i++) {
            if (!this.#testAxis(vertsA, vertsB, axesB[i], axisBuf, tmp))
                return false;
        }
        return true;
    }

    #testAxis(
        vertsA: ImmutableVec2D[],
        vertsB: ImmutableVec2D[],
        axis: ImmutableVec2D,
        axisBuf: Vec2D,
        tmp: Vec2D
    ): boolean {
        axisBuf.assign(axis).normalize();

        let minA = Infinity;
        let maxA = -Infinity;
        for (let i = 0; i < vertsA.length; i++) {
            const dot = tmp.assign(vertsA[i]).dot(axisBuf);
            if (dot < minA) minA = dot;
            if (dot > maxA) maxA = dot;
        }

        let minB = Infinity;
        let maxB = -Infinity;
        for (let i = 0; i < vertsB.length; i++) {
            const dot = tmp.assign(vertsB[i]).dot(axisBuf);
            if (dot < minB) minB = dot;
            if (dot > maxB) maxB = dot;
        }

        return !(maxA < minB || maxB < minA);
    }
}
