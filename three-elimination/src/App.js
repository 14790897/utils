import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

const Board = () => {
  const boardSize = 8;
  const [board, setBoard] = useState(generateInitialBoard(boardSize));
  const [selectedObject, setSelectedObject] = useState(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const raycaster = useRef(null);
  const mouse = useRef(new THREE.Vector2());
  const cameraRef = useRef(null);

  function clearLayer(scene, layerNumber) {
    // 获得所有在指定层的对象
    const objectsToRemove = scene.children.filter(object => object.layers.test(layerNumber));
  
    // 从场景中删除这些对象
    objectsToRemove.forEach(object => scene.remove(object));
  }

  const renderBoard = useCallback(() => {
    clearLayer(sceneRef.current, 0); // 清除场景以便重新渲染
    const geometry = new THREE.BoxGeometry();
    const margin = 0.1; // 选择适合你的边距大小
    // 在渲染前打印 board 数组的值来调试
    console.log("board in renderBoard:", board);
    board.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell !== null) {
          // 只渲染非null的项
          const material = new THREE.MeshBasicMaterial({
            color: getColor(cell),
          });
          const cube = new THREE.Mesh(geometry, material);
          // 在设置立方体的位置时添加边距
          cube.position.set(
            (i - board.length / 2) * (1 + margin),
            (j - board[0].length / 2) * (1 + margin),
            0
          );
          cube.userData = { row: i, col: j }; // 存储行和列索引
          sceneRef.current.add(cube);
        }
      });
    });
    cameraRef.current.layers.set(0); // 默认情况只渲染层 0
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, [board]);

  useEffect(() => {
    // 初始化Three.js对象
    sceneRef.current = new THREE.Scene();
    rendererRef.current = new THREE.WebGLRenderer();
    raycaster.current = new THREE.Raycaster();
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current.layers.set(0); // 设置相机只渲染层 0
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(rendererRef.current.domElement);
    cameraRef.current.position.z = 5;
    renderBoard();
    return () => {
      document.body.removeChild(rendererRef.current.domElement);
    };
  }, [renderBoard]);

  useEffect(() => {
    renderBoard();
  }, [board, renderBoard]); // 每当 board 更新时，重新执行 renderBoard 函数

  useEffect(() => {
    // 启动动画循环
    animate();
  }, []);

  const detectAndClearMatches = () => {
    setBoard((prevBoard) => {
      const matches = [];
      const newBoard = prevBoard.map((row) => row.slice()); // 创建 prevBoard 的深拷贝

      // 检测行匹配
      for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize - 2; j++) {
          if (
            newBoard[i][j] === newBoard[i][j + 1] &&
            newBoard[i][j] === newBoard[i][j + 2]
          ) {
            matches.push({ x: i, y: j, length: 3, direction: "horizontal" });
          }
        }
      }

      // 检测列匹配
      for (let j = 0; j < boardSize; j++) {
        for (let i = 0; i < boardSize - 2; i++) {
          if (
            newBoard[i][j] === newBoard[i + 1][j] &&
            newBoard[i][j] === newBoard[i + 2][j]
          ) {
            matches.push({ x: i, y: j, length: 3, direction: "vertical" });
          }
        }
      }

      // 清除匹配的项
      for (const match of matches) {
        for (let i = 0; i < match.length; i++) {
          const x = match.direction === "horizontal" ? match.x : match.x + i;
          const y = match.direction === "horizontal" ? match.y + i : match.y;
          createShatterEffect(x, y); // 在清除匹配项之前创建碎片效果
          newBoard[x][y] = null; // 将匹配的项设置为null
        }
      }

      return newBoard;
    });
  };

  const createShatterEffect = (x, y) => {
    console.log("createShatterEffect called", x, y); // 检查 createShatterEffect 函数是否被调用
    // 根据你的需求创建几何体和材料
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    for (let i = 0; i < 10; i++) {
      // 创建10个碎片
      const fragment = new THREE.Mesh(geometry, material);
      fragment.layers.set(1); // 将碎片设置为层 1
      fragment.position.set(x, y, 0);
      sceneRef.current.add(fragment);

      // 给每个碎片一个随机的初始速度
      fragment.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      fragment.userData.isFragment = true; // 添加一个标签以识别碎片
    }
    const layer1ObjectCount = sceneRef.current.children.filter((object) =>
      object.layers.test(1)
    ).length;
    console.log("Number of objects in layer 1:", layer1ObjectCount); // 输出第一层中对象的数量
    };

  // 在你的动画循环中（你可能需要创建一个新的动画循环）
  const animate = () => {
    requestAnimationFrame(animate);
    // console.log("animate")
    sceneRef.current.traverse((object) => {
      if (object.userData.isFragment) {
        // 只更新标记为碎片的对象
        // 更新碎片的位置
        object.position.add(object.userData.velocity);
        console.log("object.position", object.position); // 输出碎片的位置
      }
    });
    // 启用层 0 和层 1，以便同时渲染两个层的对象
    cameraRef.current.layers.enable(0);
    cameraRef.current.layers.enable(1);

    rendererRef.current.render(sceneRef.current, cameraRef.current);

    // 如果需要，你可以在这里禁用任何不再需要的层
    // cameraRef.current.layers.disable(0);
    // cameraRef.current.layers.disable(1);
  };

  const swapObjects = (object1, object2) => {
    const position1 = object1.position.clone();
    const position2 = object2.position.clone();
    object1.position.copy(position2);
    object2.position.copy(position1);

    // 获取对象的行和列索引
    const { row: row1, col: col1 } = object1.userData;
    const { row: row2, col: col2 } = object2.userData;

    // 更新 board 数组
    setBoard((prevBoard) => {
      // 创建 prevBoard 的深拷贝
      const newBoard = prevBoard.map((row) => row.slice());

      // 使用临时变量存储一个值
      const tempValue = newBoard[row1][col1];
      // 从一个位置复制到另一个位置
      newBoard[row1][col1] = newBoard[row2][col2];
      // 从临时变量复制回去
      newBoard[row2][col2] = tempValue;
      // 打印 prevBoard 和 newBoard 的值来调试
      console.log("prevBoard:", prevBoard);
      console.log("newBoard:", newBoard);

      return newBoard;
    });
  };

  const onObjectSelected = (object) => {
    if (selectedObject === null) {
      object.scale.set(1, 1, 1.5); // 放大1.5倍
      setSelectedObject(object);
    } else {
      if (object === selectedObject) {
        // 如果玩家再次点击了已选中的对象，取消选中
        object.scale.set(1, 1, 1); // 放大1.5倍
        setSelectedObject(null);
      } else {
        // 如果玩家点击了另一个对象，进行交换
        object.scale.set(1, 1, 1); // 放大1.5倍
        swapObjects(selectedObject, object);
        detectAndClearMatches();
        setSelectedObject(null);
      }
    }
    cameraRef.current.layers.set(0); // 设置相机只渲染层 0
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  };

  const onMouseClick = (event) => {
    mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, cameraRef.current);
    const intersects = raycaster.current.intersectObjects(
      sceneRef.current.children
    );

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      // 当玩家选择一个对象时调用此函数
      onObjectSelected(clickedObject);
    }
  };
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
      onClick={onMouseClick}
    ></div>
  );
};

const generateInitialBoard = (boardSize) => {
  const board = [];
  for (let i = 0; i < boardSize; i++) {
    board[i] = [];
    for (let j = 0; j < boardSize; j++) {
      board[i][j] = Math.floor(Math.random() * 6);
    }
  }
  return board;
};

const getColor = (value) => {
  const colors = [
    0xff0000, // 红色
    0x00ff00, // 绿色
    0x0000ff, // 蓝色
    0xffff00, // 黄色
    0xffa500, // 橙色
    0x800080, // 紫色
  ];
  return colors[value];
};

export default Board;
