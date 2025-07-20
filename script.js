// script.js - 3D Solar System Simulation

// Global Variables
let scene, camera, renderer, clock;
let sun, planets = [];
let controls = {};
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let isAnimationPaused = false;
let autoZoomActive = false;

// Planet Data with realistic properties
const planetData = [
    {
        name: 'Mercury',
        radius: 0.4,
        distance: 8,
        speed: 1.2,
        color: 0x8c7853,
        rotationSpeed: 0.02,
        info: 'Closest planet to the Sun. Very hot during the day, very cold at night.'
    },
    {
        name: 'Venus',
        radius: 0.7,
        distance: 12,
        speed: 1.0,
        color: 0xffc649,
        rotationSpeed: 0.018,
        info: 'Hottest planet in our solar system due to its thick atmosphere.'
    },
    {
        name: 'Earth',
        radius: 0.8,
        distance: 16,
        speed: 0.8,
        color: 0x6b93d6,
        rotationSpeed: 0.016,
        info: 'Our home planet, the only known planet with life.'
    },
    {
        name: 'Mars',
        radius: 0.6,
        distance: 20,
        speed: 0.6,
        color: 0xc1440e,
        rotationSpeed: 0.015,
        info: 'The Red Planet, known for its iron oxide surface.'
    },
    {
        name: 'Jupiter',
        radius: 2.5,
        distance: 28,
        speed: 0.4,
        color: 0xd8ca9d,
        rotationSpeed: 0.012,
        info: 'Largest planet in our solar system, a gas giant.'
    },
    {
        name: 'Saturn',
        radius: 2.2,
        distance: 36,
        speed: 0.3,
        color: 0xfad5a5,
        rotationSpeed: 0.010,
        info: 'Famous for its beautiful ring system.'
    },
    {
        name: 'Uranus',
        radius: 1.8,
        distance: 44,
        speed: 0.2,
        color: 0x4fd0e7,
        rotationSpeed: 0.008,
        info: 'An ice giant that rotates on its side.'
    },
    {
        name: 'Neptune',
        radius: 1.7,
        distance: 52,
        speed: 0.1,
        color: 0x4b70dd,
        rotationSpeed: 0.006,
        info: 'Farthest planet from the Sun, very windy and cold.'
    }
];

// Initialize the application
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 30, 40);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    const canvas = document.getElementById('solarSystemCanvas');
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    // Create clock for animations
    clock = new THREE.Clock();
    
    // Create lighting
    createLighting();
    
    // Create background stars
    createStars();
    
    // Create sun
    createSun();
    
    // Create planets
    createPlanets();
    
    // Setup controls
    setupControls();
    
    // Setup event listeners
    setupEventListeners();
    
    // Hide loading screen
    hideLoadingScreen();
    
    // Start animation loop
    animate();
}

// Create realistic lighting
function createLighting() {
    // Ambient light for overall scene illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    scene.add(ambientLight);
    
    // Point light from the sun
    const sunLight = new THREE.PointLight(0xffffff, 2, 100);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    scene.add(sunLight);
}

// Create background stars
function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const positions = new Float32Array(starsCount * 3);
    
    for (let i = 0; i < starsCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 400;
        positions[i + 1] = (Math.random() - 0.5) * 400;
        positions[i + 2] = (Math.random() - 0.5) * 400;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        transparent: true,
        opacity: 0.8
    });
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

// Create the sun
function createSun() {
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.9
    });
    
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.name = 'Sun';
    
    // Add sun glow effect
    const sunGlowGeometry = new THREE.SphereGeometry(4, 32, 32);
    const sunGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.3
    });
    
    const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
    sun.add(sunGlow);
    
    scene.add(sun);
}

// Create all planets
function createPlanets() {
    planetData.forEach((data, index) => {
        const planet = createPlanet(data);
        planets.push(planet);
        scene.add(planet.group);
    });
}

// Create individual planet
function createPlanet(data) {
    // Create planet group for orbit
    const planetGroup = new THREE.Group();
    
    // Create planet geometry and material
    const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: data.color,
        shininess: 30
    });
    
    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.position.x = data.distance;
    planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;
    planetMesh.name = data.name;
    planetMesh.userData = data;
    
    // Create orbit line
    const orbitGeometry = new THREE.RingGeometry(data.distance - 0.1, data.distance + 0.1, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    
    const orbitRing = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbitRing.rotation.x = -Math.PI / 2;
    scene.add(orbitRing);
    
    // Special case for Saturn - add rings
    if (data.name === 'Saturn') {
        const ringGeometry = new THREE.RingGeometry(data.radius + 0.3, data.radius + 0.8, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xD2B48C,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = -Math.PI / 2;
        planetMesh.add(rings);
    }
    
    planetGroup.add(planetMesh);
    
    return {
        group: planetGroup,
        mesh: planetMesh,
        data: data,
        angle: Math.random() * Math.PI * 2, // Random starting position
        currentSpeed: data.speed
    };
}

// Setup control sliders
function setupControls() {
    planetData.forEach((data, index) => {
        const slider = document.getElementById(`${data.name.toLowerCase()}Speed`);
        const speedValue = slider.nextElementSibling;
        
        controls[data.name.toLowerCase()] = {
            slider: slider,
            speedValue: speedValue
        };
        
        // Add event listener for real-time speed adjustment
        slider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            speedValue.textContent = `${speed}x`;
            planets[index].currentSpeed = speed;
        });
    });
}

// Setup all event listeners
function setupEventListeners() {
    // Window resize
    window.addEventListener('resize', onWindowResize);
    
    // Mouse movement for tooltips
    window.addEventListener('mousemove', onMouseMove);
    
    // Control buttons
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('resetBtn').addEventListener('click', resetAllSpeeds);
    document.getElementById('zoomBtn').addEventListener('click', toggleAutoZoom);
    
    // Canvas click for camera movement
    document.getElementById('solarSystemCanvas').addEventListener('click', onCanvasClick);
}

// Handle window resize
function onWindowResize() {
    const container = document.querySelector('.canvas-container');
    const rect = container.getBoundingClientRect();
    
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height);
}

// Handle mouse movement for tooltips
function onMouseMove(event) {
    const canvas = document.getElementById('solarSystemCanvas');
    const rect = canvas.getBoundingClientRect();
    
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Raycast to detect planet hover
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    const tooltip = document.getElementById('planetTooltip');
    let planetFound = false;
    
    for (let intersect of intersects) {
        if (intersect.object.userData && intersect.object.userData.name) {
            showTooltip(event.clientX, event.clientY, intersect.object.userData);
            planetFound = true;
            break;
        }
    }
    
    if (!planetFound) {
        hideTooltip();
    }
}

// Show planet tooltip
function showTooltip(x, y, data) {
    const tooltip = document.getElementById('planetTooltip');
    const title = document.getElementById('tooltipTitle');
    const info = document.getElementById('tooltipInfo');
    
    title.textContent = data.name;
    info.textContent = data.info;
    
    tooltip.style.left = `${x + 10}px`;
    tooltip.style.top = `${y - 10}px`;
    tooltip.classList.remove('hidden');
}

// Hide planet tooltip
function hideTooltip() {
    const tooltip = document.getElementById('planetTooltip');
    tooltip.classList.add('hidden');
}

// Handle canvas click for camera movement
function onCanvasClick(event) {
    const canvas = document.getElementById('solarSystemCanvas');
    const rect = canvas.getBoundingClientRect();
    
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    for (let intersect of intersects) {
        if (intersect.object.userData && intersect.object.userData.name) {
            focusOnPlanet(intersect.object);
            break;
        }
    }
}

// Focus camera on clicked planet
function focusOnPlanet(planetMesh) {
    const targetPosition = planetMesh.position.clone();
    const distance = planetMesh.userData.radius * 4 + 5;
    
    // Calculate camera position
    const cameraOffset = new THREE.Vector3(distance, distance * 0.5, distance);
    const newCameraPosition = targetPosition.clone().add(cameraOffset);
    
    // Animate camera movement
    animateCameraTo(newCameraPosition, targetPosition);
}

// Animate camera movement
function animateCameraTo(targetPosition, lookAtTarget) {
    const startPosition = camera.position.clone();
    const startLookAt = new THREE.Vector3(0, 0, 0);
    
    let progress = 0;
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    
    function animateCamera() {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease out)
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        
        // Interpolate camera position
        camera.position.lerpVectors(startPosition, targetPosition, easedProgress);
        
        // Interpolate look at target
        const currentLookAt = startLookAt.clone().lerp(lookAtTarget, easedProgress);
        camera.lookAt(currentLookAt);
        
        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        }
    }
    
    animateCamera();
}

// Toggle animation pause
function togglePause() {
    const btn = document.getElementById('pauseBtn');
    isAnimationPaused = !isAnimationPaused;
    btn.textContent = isAnimationPaused ? '▶️ Resume' : '⏸️ Pause';
    btn.style.background = isAnimationPaused ? '#c1440e' : '';
}

// Toggle theme
function toggleTheme() {
    const btn = document.getElementById('themeToggle');
    const body = document.body;
    
    if (body.hasAttribute('data-theme')) {
        body.removeAttribute('data-theme');
        btn.textContent = '🌙 Dark';
        scene.background = new THREE.Color(0x000011);
    } else {
        body.setAttribute('data-theme', 'light');
        btn.textContent = '☀️ Light';
        scene.background = new THREE.Color(0x87CEEB);
    }
}

// Reset all planet speeds
function resetAllSpeeds() {
    planetData.forEach((data, index) => {
        const slider = controls[data.name.toLowerCase()].slider;
        const speedValue = controls[data.name.toLowerCase()].speedValue;
        
        slider.value = data.speed;
        speedValue.textContent = `${data.speed}x`;
        planets[index].currentSpeed = data.speed;
    });
    
    // Reset camera position
    camera.position.set(0, 30, 40);
    camera.lookAt(0, 0, 0);
}

// Toggle auto zoom feature
function toggleAutoZoom() {
    const btn = document.getElementById('zoomBtn');
    autoZoomActive = !autoZoomActive;
    btn.textContent = autoZoomActive ? '🔍 Stop Zoom' : '🔍 Auto Zoom';
    btn.style.background = autoZoomActive ? '#4a9eff' : '';
}

// Auto zoom animation
function updateAutoZoom() {
    if (!autoZoomActive) return;
    
    const time = clock.getElapsedTime();
    const radius = 60 + Math.sin(time * 0.3) * 20;
    const height = 20 + Math.cos(time * 0.2) * 10;
    
    camera.position.x = Math.cos(time * 0.1) * radius;
    camera.position.z = Math.sin(time * 0.1) * radius;
    camera.position.y = height;
    camera.lookAt(0, 0, 0);
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.style.opacity = '0';
    
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
}

// Main animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (!isAnimationPaused) {
        const deltaTime = clock.getDelta();
        
        // Rotate sun
        if (sun) {
            sun.rotation.y += deltaTime * 0.5;
        }
        
        // Update planets
        updatePlanets(deltaTime);
        
        // Update auto zoom
        updateAutoZoom();
    }
    
    // Render scene
    renderer.render(scene, camera);
}

// Update planet positions and rotations
function updatePlanets(deltaTime) {
    planets.forEach((planet, index) => {
        // Update orbital position
        planet.angle += deltaTime * planet.currentSpeed * 0.5;
        
        // Calculate new position
        const x = Math.cos(planet.angle) * planet.data.distance;
        const z = Math.sin(planet.angle) * planet.data.distance;
        
        planet.group.rotation.y = planet.angle;
        
        // Rotate planet on its axis
        planet.mesh.rotation.y += deltaTime * planet.data.rotationSpeed;
        
        // Add slight orbital inclination for visual interest
        const inclination = Math.sin(planet.angle * 2) * 0.5;
        planet.mesh.position.y = inclination;
    });
}

// Create planet textures (procedural)
function createPlanetTexture(color, size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    
    // Create gradient
    const gradient = context.createRadialGradient(
        size * 0.3, size * 0.3, 0,
        size * 0.5, size * 0.5, size * 0.5
    );
    
    gradient.addColorStop(0, `#${color.toString(16).padStart(6, '0')}`);
    gradient.addColorStop(1, `#${Math.floor(color * 0.7).toString(16).padStart(6, '0')}`);
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    
    // Add some noise/texture
    const imageData = context.getImageData(0, 0, size, size);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 30;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    
    context.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Enhanced planet creation with better materials
function createEnhancedPlanet(data) {
    const planetGroup = new THREE.Group();
    
    // Create planet geometry
    const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
    
    // Create enhanced material with texture
    const texture = createPlanetTexture(data.color);
    const material = new THREE.MeshPhongMaterial({
        map: texture,
        shininess: data.name === 'Earth' ? 50 : 10,
        specular: data.name === 'Earth' ? 0x111111 : 0x000000
    });
    
    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.position.x = data.distance;
    planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;
    planetMesh.name = data.name;
    planetMesh.userData = data;
    
    // Add atmosphere for Earth
    if (data.name === 'Earth') {
        const atmosphereGeometry = new THREE.SphereGeometry(data.radius * 1.05, 32, 32);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x6ba8ff,
            transparent: true,
            opacity: 0.2
        });
        
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        planetMesh.add(atmosphere);
    }
    
    // Create orbit visualization
    createOrbitLine(data.distance);
    
    planetGroup.add(planetMesh);
    
    return {
        group: planetGroup,
        mesh: planetMesh,
        data: data,
        angle: Math.random() * Math.PI * 2,
        currentSpeed: data.speed
    };
}

// Create orbit line
function createOrbitLine(distance) {
    const points = [];
    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(
            Math.cos(angle) * distance,
            0,
            Math.sin(angle) * distance
        ));
    }
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.3
    });
    
    const orbitLine = new THREE.Line(geometry, material);
    scene.add(orbitLine);
}

// Performance monitoring
function monitorPerformance() {
    const stats = {
        fps: 0,
        lastTime: performance.now(),
        frames: 0
    };
    
    function updateStats() {
        stats.frames++;
        const now = performance.now();
        
        if (now >= stats.lastTime + 1000) {
            stats.fps = Math.round((stats.frames * 1000) / (now - stats.lastTime));
            stats.frames = 0;
            stats.lastTime = now;
            
            // Adjust quality based on performance
            if (stats.fps < 30) {
                // Reduce quality for better performance
                renderer.setPixelRatio(Math.min(window.devicePixelRatio * 0.5, 1));
            } else if (stats.fps > 50) {
                // Increase quality if performance allows
                renderer.setPixelRatio(window.devicePixelRatio);
            }
        }
        
        requestAnimationFrame(updateStats);
    }
    
    updateStats();
}

// Error handling
window.addEventListener('error', (event) => {
    console.error('Solar System Error:', event.error);
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.innerHTML = `
            <div class="loading-content">
                <h2 style="color: #ff4444;">Error Loading Solar System</h2>
                <p>Please refresh the page to try again.</p>
                <button onclick="location.reload()" style="
                    margin-top: 1rem; 
                    padding: 0.5rem 1rem; 
                    background: #4a9eff; 
                    border: none; 
                    border-radius: 4px; 
                    color: white; 
                    cursor: pointer;
                ">Refresh Page</button>
            </div>
        `;
    }
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        init();
        monitorPerformance();
        
        // Adjust canvas size after container is ready
        setTimeout(() => {
            onWindowResize();
        }, 100);
        
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (renderer) {
        renderer.dispose();
    }
});