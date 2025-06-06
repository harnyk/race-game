import { IVec2D } from './IVec2D';
import { Vec2DLegacy } from './Vec2DLegacy';

export interface ImmutableVec2D {
    readonly x: number;
    readonly y: number;
    readonly isVec2D: true;
    /**
     * @deprecated do not use Vec2DLegacy
     */
    toLegacy(): Vec2DLegacy;
    /**
     * @deprecated do not clone
     */
    clone(): Vec2D;
    length: number;
    angle: number;
}

export class Vec2D {
    x: number = 0;
    y: number = 0;

    public readonly isVec2D = true;

    toImmutable(): ImmutableVec2D {
        return this;
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }

    assign(vec: IVec2D) {
        return this.set(vec.x, vec.y);
    }

    assignPolar(length: number, angleRad: number) {
        this.x = Math.cos(angleRad) * length;
        this.y = Math.sin(angleRad) * length;
        return this;
    }

    /**
     * @deprecated do not clone
     */
    clone() {
        return new Vec2D().assign(this);
    }

    /**
     * @deprecated do not use Vec2DLegacy
     */
    toLegacy() {
        return new Vec2DLegacy(this.x, this.y);
    }

    zero() {
        this.x = 0;
        this.y = 0;
        return this;
    }

    scale(s: number) {
        this.x *= s;
        this.y *= s;
        return this;
    }

    add(p: IVec2D) {
        this.x += p.x;
        this.y += p.y;
        return this;
    }

    sub(p: IVec2D) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    }

    dot(other: IVec2D): number {
        return this.x * other.x + this.y * other.y;
    }

    cross(other: IVec2D): number {
        return this.x * other.y - this.y * other.x;
    }

    get length(): number {
        return Math.hypot(this.x, this.y);
    }

    get angle(): number {
        return Math.atan2(this.y, this.x);
    }

    rotate(angleRad: number) {
        const c = Math.cos(angleRad);
        const s = Math.sin(angleRad);
        const x = this.x;
        const y = this.y;
        this.x = x * c - y * s;
        this.y = x * s + y * c;
        return this;
    }

    normalize() {
        const len = this.length;
        if (len === 0) {
            this.zero();
        } else {
            this.x /= len;
            this.y /= len;
        }
        return this;
    }
}
