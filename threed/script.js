// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// camera.position.z = 5;

// function animate() {
//   requestAnimationFrame(animate);
//   cube.rotation.x += 0.01;
//   cube.rotation.y += 0.01;
//   renderer.render(scene, camera);
// }
// animate();



// 假设我们有一个10x10的游戏板
const boardSize = 10;
const board = [];

// 初始化游戏板
for (let i = 0; i < boardSize; i++) {
  board[i] = [];
  for (let j = 0; j < boardSize; j++) {
    // 假设每个格子都有一个随机的颜色值，范围从0到5
    board[i][j] = Math.floor(Math.random() * 6);
  }
}

// 检测并消除匹配的项
function detectAndClearMatches() {
  const matches = [];
  
  // 检测行匹配
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize - 2; j++) {
      if (board[i][j] === board[i][j + 1] && board[i][j] === board[i][j + 2]) {
        matches.push({ x: i, y: j, length: 3, direction: 'horizontal' });
      }
    }
  }
  
  // 检测列匹配
  for (let j = 0; j < boardSize; j++) {
    for (let i = 0; i < boardSize - 2; i++) {
      if (board[i][j] === board[i + 1][j] && board[i][j] === board[i + 2][j]) {
        matches.push({ x: i, y: j, length: 3, direction: 'vertical' });
      }
    }
  }
  
  // 清除匹配的项
  for (const match of matches) {
    for (let i = 0; i < match.length; i++) {
      const x = match.direction === 'horizontal' ? match.x : match.x + i;
      const y = match.direction === 'horizontal' ? match.y + i : match.y;
      board[x][y] = null;  // 将匹配的项设置为null
    }
  }
}

// 调用函数来检测并消除匹配的项
detectAndClearMatches();



// 假设我们有一个用于存储选定对象的变量
let selectedObject = null;

// 这个函数被调用当玩家选择一个对象时
function onObjectSelected(object) {
  // 如果没有选定的对象，将此对象设置为选定的对象
  if (selectedObject === null) {
    selectedObject = object;
  } else {
    // 否则，尝试交换选定的对象和此对象的位置
    swapObjects(selectedObject, object);
    
    // 检测并清除任何匹配
    detectAndClearMatches();
    
    // 清除选定的对象
    selectedObject = null;
  }
}

// 这个函数交换两个对象的位置
function swapObjects(object1, object2) {
  // 获取对象的位置
  const position1 = object1.position.clone();
  const position2 = object2.position.clone();
  
  // 交换对象的位置
  object1.position.copy(position2);
  object2.position.copy(position1);
}

// 假设我们有一个函数来处理鼠标点击事件
function onMouseClick(event) {
  // ... 代码来确定玩家点击了哪个对象 ...
  
  // 当玩家选择一个对象时调用此函数
  onObjectSelected(clickedObject);
}
