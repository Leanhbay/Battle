import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'; 

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

// --- PHẦN TẢI FBX MỚI (CÓ BÁO PHẦN TRĂM) ---
let player;
const loader = new FBXLoader(); 
const loadingText = document.getElementById('loading-text');

loader.load(
    'summer-girl.fbx', 
    function (object) { 
        player = object;
        player.position.set(0, 0, 0); 
        player.scale.set(0.01, 0.01, 0.01); 
        scene.add(player);
        
        // Ẩn chữ đi khi tải xong
        loadingText.style.display = 'none'; 
    },
    function (xhr) {
        // Hàm tính toán và hiển thị % tải lên màn hình
        if (xhr.total > 0) {
            const percent = Math.round((xhr.loaded / xhr.total) * 100);
            loadingText.innerText = 'Đang tải nhân vật: ' + percent + '%';
        } else {
            // Nếu file không báo tổng dung lượng
            const kb = Math.round(xhr.loaded / 1024);
            loadingText.innerText = 'Đang tải nhân vật... (' + kb + ' KB)';
        }
    },
    function (error) {
        console.error(error);
        loadingText.innerText = 'Lỗi! Không tìm thấy file hoặc sai tên.';
        loadingText.style.color = 'red';
    }
);
// ------------------------------------------

let moveVector = new THREE.Vector3(0, 0, 0);

const joystickManager = nipplejs.create({
    zone: document.getElementById('joystick-zone'),
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: 'white',
    size: 100
});

joystickManager.on('move', (event, data) => {
    if (data.angle && data.force) {
        const force = Math.min(data.force, 2) * 0.1; 
        const angle = data.angle.radian;

        moveVector.x = Math.cos(angle) * force;
        moveVector.z = -Math.sin(angle) * force;

        if (player) {
            player.rotation.y = angle + Math.PI / 2;
        }
    }
});

joystickManager.on('end', () => {
    moveVector.set(0, 0, 0);
});

const btnShoot = document.getElementById('btn-shoot');
const shootAction = (e) => {
    if (e) e.preventDefault();
    alert('Đang xả đạn!');
};
btnShoot.addEventListener('touchstart', shootAction);
btnShoot.addEventListener('mousedown', shootAction);

function animate() {
    requestAnimationFrame(animate);

    if (player) {
        player.position.x += moveVector.x;
        player.position.z += moveVector.z;

        camera.position.x = player.position.x;
        camera.position.y = player.position.y + 3; 
        camera.position.z = player.position.z + 6; 
        camera.lookAt(player.position);
    }

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
