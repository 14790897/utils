// 创建场景、相机和渲染器
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 创建一个方块（由多个小方块组成）
const shatterCube = new THREE.Group();
const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

for (let i = 0; i < 10; i++) {
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
  shatterCube.add(cube);
}

scene.add(shatterCube);
camera.position.z = 3;

// 破碎效果函数
function shatterEffect(group) {
  for (let i = 0; i < group.children.length; i++) {
    const block = group.children[i];
    const direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    const speed = Math.random() * 0.02;
    block.position.add(direction.multiplyScalar(speed));
  }
}

// 游戏循环
function animate() {
  requestAnimationFrame(animate);

  // 触发破碎效果（在实际游戏中，这应由某种事件触发，如消除方块）
  shatterEffect(shatterCube);

  renderer.render(scene, camera);
}

animate();
