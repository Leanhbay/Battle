import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 1. Tạo không gian cơ bản
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);

const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

const planeGeom = new THREE.PlaneGeometry(100, 100);
const planeMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const plane = new THREE.Mesh(planeGeom, planeMat);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// 2. Tải Mô Hình 3D
let player;
const loader = new GLTFLoader();

loader.load(
    'nhanvat.glb', // Đảm bảo đúng tên file .glb trên GitHub
    function (gltf) {
        player = gltf.scene;
        player.position.set(0, 0, 0);
        player.scale.set(1, 1, 1); 
        scene.add(player);
    },
    undefined,
    function (error) {
        console.error('Lỗi khi tải mô hình 3D:', error);
    }
);

// 3. Hệ thống Điều khiển bằng JOYSTICK
let moveVector = new THREE.Vector3(0, 0, 0); // Lưu trữ vector di chuyển

// Khởi tạo Joystick ảo
const joystickManager = nipplejs.create({
    zone: document.getElementById('joystick-zone'),
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: 'white',
    size: 100
});

// Khi ngón tay đẩy Joystick
joystickManager.on('move', (event, data) => {
    if (data.angle && data.force) {
        // Tính lực đẩy (Càng đẩy mạnh chạy càng nhanh)
        const force = Math.min(data.force, 2) * 0.1;
        const angle = data.angle.radian; // Góc vuốt

        // Tính toán toán học: X là cos, Z là sin (âm Z là đi tới)
        moveVector.x = Math.cos(angle) * force;
        moveVector.z = -Math.sin(angle) * force;

        // Cho nhân vật xoay mặt theo hướng di chuyển
        if (player) {
            // Góc xoay mặt cơ bản cần bù trừ Math.PI / 2 để nhìn thẳng
            player.rotation.y = angle + Math.PI / 2;
        }
    }
});

// Khi thả ngón tay khỏi Joystick
joystickManager.on('end', () => {
    moveVector.set(0, 0, 0); // Dừng lại
});

// Nút bắn súng
const btnShoot = document.getElementById('btn-shoot');
const shootAction = (e) => {
    if (e) e.preventDefault();
    alert('Pằng pằng!');
};
btnShoot.addEventListener('touchstart', shootAction);
btnShoot.addEventListener('mousedown', shootAction);

// 4. Vòng Lặp Game và Cập nhật Camera
function animate() {
    requestAnimationFrame(animate);

    if (player) {
        // Áp dụng vector di chuyển vào tọa độ của mô hình
        player.position.x += moveVector.x;
        player.position.z += moveVector.z;

        // Camera luôn đi theo sau lưng nhân vật
        camera.position.x = player.position.x;
        camera.position.y = player.position.y + 3;
        camera.position.z = player.position.z + 6;
        camera.lookAt(player.position);
    }

    renderer.render(scene, camera);
}
animate();

// Xử lý khi xoay ngang/dọc điện thoại
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
