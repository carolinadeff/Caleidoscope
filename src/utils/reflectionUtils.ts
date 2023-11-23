import { LineParams, Point } from "../types";

function getPathIntersectionPoint(arrLinesParams: LineParams[]) {
  const [
    { a: a1, b: b1, constantX: constantX1 },
    { a: a2, b: b2, constantX: constantX2 },
  ] = arrLinesParams;
  if (a1 === a2) {
    return;
  }

  const intersection: Partial<Point> = {
    x: undefined,
    y: undefined,
  };

  const constantX = constantX1 || constantX2;

  const a = b1 ? a1 : a2;
  const b = b1 ? b1 : b2 ?? 0;

  intersection.x = constantX ?? (b2! - b1!) / (a1 - a2);
  intersection.y = a * intersection.x! + b;

  return intersection;
}

export function getHasIntersection(
  [pInitLine, pEndLine]: any,
  [pInitPath, pEndPath]: any
) {
  const sideParams = getLineParams(pInitLine, pEndLine);
  const particlePathParams = getLineParams(pInitPath, pEndPath);

  const intersection = getPathIntersectionPoint([
    sideParams,
    particlePathParams,
  ]);
  return (
    intersection &&
    isPointInsideLine(intersection as Point, pInitLine, pEndLine) &&
    isPointInsideLine(intersection as Point, pInitPath, pEndPath)
  );
}

export function getReflection(side: [Point, Point], point: Point) {
  const sideParams = getLineParams(...side);

  const aReflection = sideParams.a === 0 ? Infinity : -1 / sideParams.a;
  const isVerticalReflection = aReflection === Infinity;

  const reflectionParams: LineParams = {
    a: aReflection,
    b: isVerticalReflection ? undefined : point.y - aReflection * point.x,
    constantX: isVerticalReflection ? point.x : undefined,
  };

  const pIntersection: Partial<Point> = getPathIntersectionPoint([
    sideParams,
    reflectionParams,
  ])!;

  const correctedPoint = {
    x: point.x + 2 * (pIntersection.x! - point.x),
    y: point.y + 2 * (pIntersection.y! - point.y),
  };

  return correctedPoint;
}

export function getLineParams(p1: Point, p2: Point): LineParams {
  let a = Infinity;
  let b = undefined;
  let isVertical = true;
  if (p2.x !== p1.x) {
    a = (p2.y - p1.y) / (p2.x - p1.x);
    b = p1.y - a * p1.x;
    isVertical = false;
  }

  return { a, b, constantX: isVertical ? p1.x : undefined };
}

function isPointInsideLine(intersection: Point, pInit: Point, pEnd: Point) {
  return (
    intersection.x >= Math.min(pInit.x, pEnd.x) &&
    intersection.x <= Math.max(pInit.x, pEnd.x) &&
    intersection.y >= Math.min(pInit.y, pEnd.y) &&
    intersection.y <= Math.max(pInit.y, pEnd.y)
  );
}
