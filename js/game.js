import * as THREE from 'three';

// 1. TẠO KHÔNG GIAN BẢN ĐỒ
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Bầu trời xanh

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-container').appendChild(renderer.domElement);

const light = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(light);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

const planeGeom = new THREE.PlaneGeometry(100, 100);
const planeMat = new THREE.MeshToonMaterial({ color: 0x228B22 }); // Cỏ xanh hoạt hình
const plane = new THREE.Mesh(planeGeom, planeMat);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// 2. TẠO NHÂN VẬT MINECRAFT BẰNG CÁC KHỐI VUÔNG
const player = new THREE.Group();
scene.add(player);

// Bảng màu hoạt hình
const skinMat = new THREE.MeshToonMaterial({ color: 0xffcc99 }); // Màu da
const shirtMat = new THREE.MeshToonMaterial({ color: 0x00aaff }); // Áo xanh dương
const pantsMat = new THREE.MeshToonMaterial({ color: 0x0000aa }); // Quần xanh đậm
const faceMat = new THREE.MeshToonMaterial({ color: 0x000000 });  // Mắt đen

// A. Thân mình
const bodyGeom = new THREE.BoxGeometry(1, 1.5, 0.5);
const body = new THREE.Mesh(bodyGeom, shirtMat);
body.position.y = 1.75; // Nâng thân lên khỏi mặt đất
player.add(body);

// B. Đầu và Mặt
const headGroup = new THREE.Group();
headGroup.position.y = 3; // Đặt đầu lên trên cổ
player.add(headGroup);

const headGeom = new THREE.BoxGeometry(1, 1, 1);
const head = new THREE.Mesh(headGeom, skinMat);
headGroup.add(head);

// Mắt trái & phải
const eyeGeom = new THREE.BoxGeometry(0.15, 0.15, 0.1);
const leftEye = new THREE.Mesh(eyeGeom, faceMat);
leftEye.position.set(-0.25, 0.2, 0.51); // Nhô ra phía trước một chút
headGroup.add(leftEye);
const rightEye = new THREE.Mesh(eyeGeom, faceMat);
rightEye.position.set(0.25, 0.2, 0.51);
headGroup.add(rightEye);

// Cái Mũi nhô ra
const noseGeom = new THREE.BoxGeometry(0.2, 0.3, 0.2);
const nose = new THREE.Mesh(noseGeom, skinMat);
nose.position.set(0, -0.1, 0.6); // Đặt chính giữa và nhô ra trước mặt
headGroup.add(nose);

// C. Tay (Tạo khớp xoay ở bả vai)
const armGeom = new THREE.BoxGeometry(0.4, 1.5, 0.4);
armGeom.translate(0, -0.75, 0); // Dịch tâm xoay lên đỉnh khối (vai)
const leftArm = new THREE.Mesh(armGeom, skinMat);
leftArm.position.set(-0.75, 2.5, 0);
player.add(leftArm);

const rightArm = new THREE.Mesh(armGeom, skinMat);
rightArm.position.set(0.75, 2.5, 0);
player.add(rightArm);

// D. Chân (Tạo khớp xoay ở hông)
const legGeom = new THREE.BoxGeometry(0.45, 1.5, 0.45);
legGeom.translate(0, -0.75, 0); // Dịch tâm xoay lên đỉnh khối (hông)
const leftLeg = new THREE.Mesh(legGeom, pantsMat);
leftLeg.position.set(-0.25, 1.5, 0);
player.add(leftLeg);

const rightLeg = new THREE.Mesh(legGeom, pantsMat);
rightLeg.position.set(0.25, 1.5, 0);
player.add(rightLeg);

// 3. ĐIỀU KHIỂN JOYSTICK
let moveVector = new THREE.Vector3(0, 0, 0);
let isMoving = false; // Biến kiểm tra xem có đang đi bộ không

const joystickManager = nipplejs.create({
    zone: document.getElementById('joystick-zone'),
    mode: 'static',
    position: { left: '50%', top: '50%' },
    color: 'white',
    size: 100
});

joystickManager.on('move', (event, data) => {
    if (data.angle && data.force) {
        const force = Math.min(data.force, 2) * 0.15; // Tốc độ chạy
        const angle = data.angle.radian;

        moveVector.x = Math.cos(angle) * force;
        moveVector.z = -Math.sin(angle) * force;
        isMoving = true;

        // Nhân vật xoay mặt theo hướng đi
        player.rotation.y = angle + Math.PI / 2;
    }
});

joystickManager.on('end', () => {
    moveVector.set(0, 0, 0);
    isMoving = false;
});

// Nút bắn súng
const btnShoot = document.getElementById('btn-shoot');
const shootAction = (e) => {
    if (e) e.preventDefault();
    alert('Pằng pằng!');
};
btnShoot.addEventListener('touchstart', shootAction);
btnShoot.addEventListener('mousedown', shootAction);

// 4. VÒNG LẶP GAME VÀ CAMERA
const clock = new THREE.Clock(); // Đồng hồ đếm thời gian để làm hoạt ảnh

function animate() {
    requestAnimationFrame(animate);

    // Xử lý di chuyển
    player.position.x += moveVector.x;
    player.position.z += moveVector.z;

    // Xử lý hoạt ảnh vung vẩy tay chân
    const time = clock.getElapsedTime() * 10; // Tốc độ vung tay
    if (isMoving) {
        // Hàm Math.sin tạo chuyển động con lắc
        leftArm.rotation.x = Math.sin(time) * 0.5;
        rightArm.rotation.x = Math.sin(time + Math.PI) * 0.5; // Vung ngược chiều
        leftLeg.rotation.x = Math.sin(time + Math.PI) * 0.5;
        rightLeg.rotation.x = Math.sin(time) * 0.5;
    } else {
        // Đứng im thì khép tay chân lại
        leftArm.rotation.x = 0;
        rightArm.rotation.x = 0;
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
    }

    // Camera góc nhìn thứ 3 (Qua vai phải)
    camera.position.x = player.position.x + 3; // Lệch phải
    camera.position.y = player.position.y + 4; // Cao hơn đầu
    camera.position.z = player.position.z + 8; // Lùi về sau
    
    // Camera nhìn thẳng về phía trước nhân vật
    const targetPoint = new THREE.Vector3(player.position.x, player.position.y + 3, player.position.z - 10);
    camera.lookAt(targetPoint);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
