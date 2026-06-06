import * as THREE from 'three';

// Tạo không gian và bầu trời
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

// Tạo góc nhìn camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

// Khởi tạo khung vẽ
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);

// Thêm ánh sáng cơ bản
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

// Tạo mặt đất
const planeGeom = new THREE.PlaneGeometry(50, 50);
const planeMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const plane = new THREE.Mesh(planeGeom, planeMat);
plane.rotation.x = -Math.PI / 2; // Xoay ngang mặt phẳng
scene.add(plane);

// Vòng lặp hiển thị game
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
