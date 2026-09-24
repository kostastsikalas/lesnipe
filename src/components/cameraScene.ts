import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type Pose = {
  /** 0 = three-quarter view, 1 = facing the viewer. */
  turn: number;
  /** 0 = whole camera in frame, 1 = through the lens. */
  dolly: number;
};

/** Where the lens lands on screen, in CSS px. */
export type LensOnScreen = {
  x: number;
  y: number;
  /** Projected radius of the front glass. */
  r: number;
  /** Outline of the front glass, in perspective. */
  glass: [number, number][];
};

export type CameraScene = {
  render(pose: Pose): LensOnScreen;
  resize(): void;
  dispose(): void;
};

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

const GLASS_POINTS = 72;

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

  // Anchor on the front glass, so its outline can be projected in perspective.
  const glass = new THREE.Object3D();
  glass.position.copy(MODEL.lens);
  rig.add(glass);

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

  const render = ({ turn, dolly }: Pose): LensOnScreen => {
    // Turn from a three-quarter view to facing the viewer.
    rig.rotation.set(0.28 * (1 - turn), -0.75 * (1 - turn), 0);
    rig.updateMatrixWorld(true);
    floor.copy(floorLocal).applyMatrix4(rig.matrixWorld);
    glass.updateMatrixWorld(true);

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
    const [ex, ey] = project(tmp.set(MODEL.lensRadius, 0, 0).applyMatrix4(glass.matrixWorld));
    const outline: [number, number][] = [];
    for (let k = 0; k < GLASS_POINTS; k++) {
      const phi = (k * 2 * Math.PI) / GLASS_POINTS;
      const rho = MODEL.lensRadius * 0.985;
      outline.push(project(tmp.set(Math.cos(phi) * rho, Math.sin(phi) * rho, 0).applyMatrix4(glass.matrixWorld)));
    }
    return { x, y, r: Math.hypot(ex - x, ey - y), glass: outline };
  };

  resize();

  return {
    render,
    resize,
    dispose() {
      renderer.dispose();
      pmrem.dispose();
      renderer.domElement.remove();
    },
  };
}
