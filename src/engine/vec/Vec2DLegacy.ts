export class Vec2DLegacy {
    x: number;
    y: number;

    public readonly isLegacy = true;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static fromPolar(length: number, angleRad: number): Vec2DLegacy {
        return new Vec2DLegacy(
            Math.cos(angleRad) * length,
            Math.sin(angleRad) * length
        );
    }

    static zero() {
        return new Vec2DLegacy(0, 0);
    }

    scale(s: number) {
        return new Vec2DLegacy(this.x * s, this.y * s);
    }

    add(p: Vec2DLegacy) {
        return new Vec2DLegacy(this.x + p.x, this.y + p.y);
    }

    sub(p: Vec2DLegacy) {
        return new Vec2DLegacy(this.x - p.x, this.y - p.y);
    }

    dot(other: Vec2DLegacy): number {
        return this.x * other.x + this.y * other.y;
    }

    cross(other: Vec2DLegacy): number {
        return this.x * other.y - this.y * other.x;
    }

    get length(): number {
        return Math.hypot(this.x, this.y);
    }

    get angle(): number {
        return Math.atan2(this.y, this.x);
    }

    rotate(angleRad: number): Vec2DLegacy {
        const c = Math.cos(angleRad);
        const s = Math.sin(angleRad);
        return new Vec2DLegacy(this.x * c - this.y * s, this.x * s + this.y * c);
    }

    normalize(): Vec2DLegacy {
        const len = this.length;
        return len === 0
            ? new Vec2DLegacy(0, 0)
            : new Vec2DLegacy(this.x / len, this.y / len);
    }
}
