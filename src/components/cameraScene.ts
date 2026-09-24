import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type Pose = {
  /** 0 = three-quarter view, 1 = facing the viewer. */
  turn: number;
  /** 0 = whole camera in frame, 1 = through the lens. */
  dolly: number;
  /** Iris opening as a fraction of the lens radius (0 = shut, 1 = wide open). */
  aperture: number;
  /** Iris rotation in radians; blades twist as they open. */
  twist: number;
};

/** Where the lens and the iris hole land on screen, in CSS px. */
export type LensOnScreen = {
  x: number;
  y: number;
  /** Projected radius of the front glass. */
  r: number;
  /** Corners of the iris hole, in perspective. */
  hole: [number, number][];
};

export type CameraScene = {
  render(pose: Pose): LensOnScreen;
  resize(): void;
  dispose(): void;
};

export const BLADES = 7;

// Model-space tuning, measured on /models/camera-web.glb (normalised so its longest side is 1).
const MODEL = {
  /** Rotation that makes the lens point at the viewer (+Z). */
  face: new THREE.Euler(0, Math.PI, 0),
  /** Centre of the front lens glass, after `face` is applied. */
  lens: new THREE.Vector3(0.135, 0.08, 0.25),
  /** Radius of the front lens glass. */
  lensRadius: 0.17,
  /** Everything below this height (the tripod plate) is clipped away. */
  floor: -0.222,
};

const SIDE = (2 * Math.PI) / BLADES;
const HOLE_POINTS = BLADES * 12;

/**
 * Radius of the iris hole at angle `phi`, for apothem `a`. Nearly shut it is a heptagon;
 * as it opens the straight sides bow out into a circle, like curved blades, and it never
 * grows past the glass radius `r`.
 */
function holeRadius(phi: number, a: number, r: number) {
  const d = ((((phi + SIDE / 2) % SIDE) + SIDE) % SIDE) - SIDE / 2;
  const heptagon = a / Math.cos(d);
  const round = Math.min(1, (a / r) ** 1.5 * 1.4);
  return Math.min(heptagon + (a - heptagon) * round, r * 0.985);
}

/**
 * One iris blade: the slice of the lens disc outside the hole, across side `i` and a little
 * beyond so neighbours overlap. Seven of them leave exactly the hole described by holeRadius.
 */
function bladeShape(r: number, a: number, i: number) {
  const from = i * SIDE - SIDE / 2 - 0.12;
  const to = i * SIDE + SIDE / 2 + 0.12;
  const steps = 20;
  const shape = new THREE.Shape();
  for (let k = 0; k <= steps; k++) {
    const phi = from + ((to - from) * k) / steps;
    const rho = holeRadius(phi, a, r);
    if (k === 0) shape.moveTo(Math.cos(phi) * rho, Math.sin(phi) * rho);
    else shape.lineTo(Math.cos(phi) * rho, Math.sin(phi) * rho);
  }
  shape.absarc(0, 0, r, to, from, true);
  shape.closePath();
  return shape;
}

export async function createCameraScene(container: HTMLElement): Promise<CameraScene> {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;
  renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  // Studio lighting: soft key from the top left, orange rim from behind right.
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(-2, 3, 3);
  const rim = new THREE.DirectionalLight(0xff7000, 5);
  rim.position.set(3, 1.5, -2.5);
  const fill = new THREE.DirectionalLight(0xffffff, 0.4);
  fill.position.set(2, -1, 2);
  scene.add(key, rim, fill);

  const cam = new THREE.PerspectiveCamera(30, 1, 0.001, 20);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync("/models/camera-web.glb");
  const model = gltf.scene;

  // Normalise: centre on origin, longest side = 1.
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const s = 1 / Math.max(size.x, size.y, size.z);
  model.position.copy(center).multiplyScalar(-s);
  model.scale.setScalar(s);

  // Hide the tripod plate the scan came with.
  const floorLocal = new THREE.Plane(new THREE.Vector3(0, 1, 0), -MODEL.floor);
  const floor = floorLocal.clone();
  model.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      for (const m of [o.material].flat()) m.clippingPlanes = [floor];
    }
  });

  const inner = new THREE.Group();
  inner.add(model);
  inner.rotation.copy(MODEL.face);
  const rig = new THREE.Group();
  rig.add(inner);
  scene.add(rig);

  // Iris, sitting just behind the front glass so it turns with the camera.
  const iris = new THREE.Group();
  iris.position.copy(MODEL.lens);
  rig.add(iris);
  const bladeMaterial = new THREE.MeshStandardMaterial({
    color: 0x151413,
    metalness: 0.7,
    roughness: 0.38,
    side: THREE.DoubleSide,
  });
  const blades = Array.from({ length: BLADES }, (_, i) => {
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), bladeMaterial);
    // Stagger depth so overlapping blades don't z-fight.
    mesh.position.z = -i * 0.0012;
    iris.add(mesh);
    return mesh;
  });
  let lastAperture = -1;
  const setIris = (aperture: number, twist: number) => {
    iris.rotation.z = twist;
    if (Math.abs(aperture - lastAperture) < 1e-4) return;
    lastAperture = aperture;
    // Keep a sliver of hole when shut so the blade shapes never collapse to a point.
    const a = Math.max(aperture, 0.002) * MODEL.lensRadius;
    blades.forEach((b, i) => {
      b.visible = aperture < 0.999;
      if (!b.visible) return;
      b.geometry.dispose();
      b.geometry = new THREE.ShapeGeometry(bladeShape(MODEL.lensRadius, a, i), 24);
    });
  };

  const tmp = new THREE.Vector3();
  const lensWorld = new THREE.Vector3();
  let w = 1;
  let h = 1;
  const baseDistance = 2.6;
  const restWide = new THREE.Vector3(-0.32, 0, 0);
  const restTall = new THREE.Vector3(0, -0.12, 0);

  const resize = () => {
    w = container.clientWidth;
    h = container.clientHeight;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    // Keep the camera a similar size on portrait screens.
    cam.fov = cam.aspect < 1 ? 30 / Math.max(cam.aspect, 0.5) : 30;
    cam.updateProjectionMatrix();
  };

  const project = (v: THREE.Vector3): [number, number] => {
    tmp.copy(v).project(cam);
    return [(tmp.x * 0.5 + 0.5) * w, (-tmp.y * 0.5 + 0.5) * h];
  };

  const render = ({ turn, dolly, aperture, twist }: Pose): LensOnScreen => {
    // Turn from a three-quarter view to facing the viewer.
    rig.rotation.set(0.28 * (1 - turn), -0.75 * (1 - turn), 0);
    rig.updateMatrixWorld(true);
    floor.copy(floorLocal).applyMatrix4(rig.matrixWorld);
    setIris(aperture, twist);
    iris.updateMatrixWorld(true);

    // Dolly straight at the lens. Distance falls exponentially so the push feels constant.
    lensWorld.copy(MODEL.lens).applyMatrix4(rig.matrixWorld);
    const diag = Math.hypot(w, h);
    const focal = h / 2 / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const minDistance = (MODEL.lensRadius * focal) / (diag * 0.9);
    const distance = baseDistance * (minDistance / baseDistance) ** dolly;
    // Before the dolly, frame the whole body (right of the title on wide screens, above it on
    // narrow ones); during it, aim the view at the lens.
    const rest = w >= 1024 && w > h ? restWide : restTall;
    const target = rest.clone().lerp(lensWorld, dolly);
    cam.position.set(target.x, target.y, lensWorld.z + distance);
    cam.lookAt(target);
    cam.near = Math.max(distance * 0.2, 0.0005);
    cam.updateProjectionMatrix();

    renderer.render(scene, cam);

    const [x, y] = project(lensWorld);
    const [ex, ey] = project(tmp.set(MODEL.lensRadius, 0, 0).applyMatrix4(iris.matrixWorld));
    const a = aperture * MODEL.lensRadius;
    const hole: [number, number][] = [];
    for (let k = 0; k < HOLE_POINTS; k++) {
      const phi = (k * 2 * Math.PI) / HOLE_POINTS;
      const rho = holeRadius(phi, a, MODEL.lensRadius);
      hole.push(project(tmp.set(Math.cos(phi) * rho, Math.sin(phi) * rho, 0).applyMatrix4(iris.matrixWorld)));
    }
    return { x, y, r: Math.hypot(ex - x, ey - y), hole };
  };

  resize();

  return {
    render,
    resize,
    dispose() {
      for (const b of blades) b.geometry.dispose();
      bladeMaterial.dispose();
      renderer.dispose();
      pmrem.dispose();
      renderer.domElement.remove();
    },
  };
}
