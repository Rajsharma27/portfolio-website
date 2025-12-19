import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.querySelector('#threed-canvas');
    if (!canvas) return;

    const container = canvas.parentElement;

    // Create scene
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 100);
    camera.position.z = 4;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.enablePan = false;

    // Group for rotation
    const rotatingGroup = new THREE.Group();
    scene.add(rotatingGroup);

    // Inner Icosahedron
    const innerGeometry = new THREE.IcosahedronGeometry(1, 3);
    const innerMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.5,
        metalness: 1,
        flatShading: true,
        transparent: true,
        opacity: 0.8
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    rotatingGroup.add(innerMesh);

    // Wireframe Outer Icosahedron
    const outerGeometry = new THREE.IcosahedronGeometry(1.15, 3);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const wireframeMesh = new THREE.Mesh(outerGeometry, wireframeMaterial);
    rotatingGroup.add(wireframeMesh);

    // Particles
    const positions = [];
    const posAttr = outerGeometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
        positions.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x00ffff,
        size: 0.03
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    rotatingGroup.add(particles);

    // Lighting
    const light = new THREE.PointLight(0x00ffff, 0.5);
    light.position.set(2, 2, 2);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();

        rotatingGroup.rotation.x += 0.003;
        rotatingGroup.rotation.y += 0.005;

        renderer.render(scene, camera);
    }

    animate();

    // Resize Handler
    function handleResize() {
        const newWidth = container.offsetWidth;
        const newHeight = container.offsetHeight;

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    }

    window.addEventListener('resize', handleResize);
});
