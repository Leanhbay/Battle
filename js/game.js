import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'; 

// 1. Tạo không gian cơ bản
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Màu trời xanh

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);

// Thêm ánh sáng
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// Thêm mặt đất
const planeGeom = new THREE.PlaneGeometry(100, 100);
const planeMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const plane = new THREE.Mesh(planeGeom, planeMat);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// 2. TẢI MÔ HÌNH NHÂN VẬT (summer-girl.fbx)
let player;
const loader = new FBXLoader(); 

loader.load(
    'summer-girl.fbx', // Đã cập nhật chính xác tên file
    function (object) { 
        player = object;
        player.position.set(0, 0, 0); // Đặt ở tâm bản đồ
        
        // Thu nhỏ 100 lần (0.01) do đặc thù định dạng FBX thường bị to
        player.scale.set(0.01, 0.01, 0.01); 
        
        scene.add(player);
        alert('Đã đưa nhân vật Summer Girl vào game!'); 
    },
    undefined,
    function (error) {
        console.error('Lỗi khi tải mô hình FBX:', error);
        alert('Lỗi! Không tìm thấy file summer-girl.fbx. Bạn hãy kiểm tra lại xem đã upload file lên chưa nhé.');
    }
);

// 3. Hệ thống Điều khiển bằng JOYSTICK
let moveVector = new THREE.Vector3(0, 0, 0);

const joystickManager = nipplejs.create({
    zone: document.getElementById('joystick-zone'),
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: 'white',
    size: 100
});

// Xử lý khi ngón tay vuốt Joystick
joystickManager.on('move', (event, data) => {
    if (data.angle && data.force) {
        const force = Math.min(data.force, 2) * 0.1; // Tốc độ chạy
        const angle = data.angle.radian;

        moveVector.x = Math.cos(angle) * force;
        moveVector.z = -Math.sin(angle) * force;

        // Xoay mặt nhân vật theo hướng vuốt
        if (player) {
            player.rotation.y = angle + Math.PI / 2;
        }
    }
});

// Xử lý khi nhả tay khỏi Joystick
joystickManager.on('end', () => {
    moveVector.set(0, 0, 0);
});

// Nút bắn súng
const btnShoot = document.getElementById('btn-shoot');
const shootAction = (e) => {
    if (e) e.preventDefault();
    alert('Đang xả đạn!');
};
btnShoot.addEventListener('touchstart', shootAction);
btnShoot.addEventListener('mousedown', shootAction);

// 4. Vòng Lặp Game và Cập nhật Camera
function animate() {
    requestAnimationFrame(animate);

    if (player) {
        // Di chuyển mô hình
        player.position.x += moveVector.x;
        player.position.z += moveVector.z;

        // Camera bám sát sau lưng nhân vật
        camera.position.x = player.position.x;
        camera.position.y = player.position.y + 3; // Cao hơn đầu 3 mét
        camera.position.z = player.position.z + 6; // Lùi về sau 6 mét
        camera.lookAt(player.position);
    }

    renderer.render(scene, camera);
}
animate();

// Cập nhật lại khung hình khi xoay dọc/ngang điện thoại
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
