import { CollisionDetector } from '../CollisionDetector';
import { RegularPolygonCollisionBody } from '../RegularPolygonCollisionBody';
import { BoxCollisionBody } from '../BoxCollisionBody';
import { CollisionBody } from '../CollisionBody';
import { Vec2DLegacy } from '../../vec/Vec2DLegacy';
import { Vec2D } from '../../vec/Vec2D';

describe('CollisionDetector', () => {
    it('ignores collisions between static bodies', () => {
        const detector = new CollisionDetector();
        detector.addBody(
            new BoxCollisionBody(
                new Vec2D().set(0, 0),
                new Vec2D().set(1, 1),
                0,
                'static'
            )
        );
        detector.addBody(
            new BoxCollisionBody(
                new Vec2D().set(0.5, 0),
                new Vec2D().set(1, 1),
                0,
                'static'
            )
        );
        const result = detector.detect();
        expect(result.length).toBe(0);
    });

    it('detects overlap accounting for rotation', () => {
        const detector = new CollisionDetector();
        const dynamic = new BoxCollisionBody(
            new Vec2D().set(0, 0),
            new Vec2D().set(2, 1),
            Math.PI / 4,
            'dynamic'
        );
        const block = new BoxCollisionBody(
            new Vec2D().set(0.25, 0.75),
            new Vec2D().set(1, 1),
            0,
            'static'
        );
        detector.addBody(dynamic);
        detector.addBody(block);
        const collisions = detector.detect();
        expect(collisions).toEqual([{ a: dynamic, b: block }]);
    });

    it('detects dynamic to dynamic collisions only once', () => {
        const detector = new CollisionDetector();
        const d1 = new BoxCollisionBody(
            new Vec2D().set(0, 0),
            new Vec2D().set(1, 1)
        );
        const d2 = new BoxCollisionBody(
            new Vec2D().set(0.5, 0),
            new Vec2D().set(1, 1)
        );
        detector.addBody(d1);
        detector.addBody(d2);
        const collisions = detector.detect();
        expect(collisions).toEqual([{ a: d1, b: d2 }]);
    });

    it('can remove bodies', () => {
        const detector = new CollisionDetector();
        const d1 = new BoxCollisionBody(
            new Vec2D().set(0, 0),
            new Vec2D().set(1, 1)
        );
        const d2 = new BoxCollisionBody(
            new Vec2D().set(0.5, 0),
            new Vec2D().set(1, 1)
        );
        detector.addBody(d1);
        detector.addBody(d2);
        detector.removeBody(d1);
        const collisions = detector.detect();
        expect(collisions).toEqual([]);
    });

    it('detects collisions for regular polygons', () => {
        const detector = new CollisionDetector();
        const poly = new RegularPolygonCollisionBody(
            new Vec2D().set(0, 0),
            1,
            10
        );
        const box = new BoxCollisionBody(
            new Vec2D().set(0.5, 0),
            new Vec2D().set(1, 1)
        );
        detector.addBody(poly);
        detector.addBody(box);
        const collisions = detector.detect();
        expect(collisions).toEqual([{ a: poly, b: box }]);
    });
});
