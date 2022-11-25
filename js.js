$(function() {
    var mySwiper = new Swiper ('.swiper-container', {
        direction: 'horizontal',
        effect: 'slide',
        slidesPerView: 1,
        speed: 3000,
        loop: true,
        mousewheel: {
            // invert: false,
        },
    })

    // model
    var theModel;

    const MODEL_PATH = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/chair.glb";

    const BACKGROUND_COLOR = 0xf1f1f1;
    // Init the scene
    const scene = new THREE.Scene();
    // Set background
    // scene.background = new THREE.Color(BACKGROUND_COLOR);
    scene.background = null; // remove background
    scene.fog = new THREE.Fog(BACKGROUND_COLOR, 20, 100);

    const canvas = document.querySelector('#c');

    // Init the renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0); // the default background null

    var cameraFar = 5;
    document.body.appendChild(renderer.domElement);



    // Add a camerra
    var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = cameraFar;
    camera.position.x = 0;

    // Initial material
    const INITIAL_MTL = new THREE.MeshPhongMaterial({ color: 0xf1f1f1, shininess: 10 });

    const INITIAL_MAP = [
        { childID: "back", mtl: INITIAL_MTL },
        { childID: "base", mtl: INITIAL_MTL },
        { childID: "cushions", mtl: INITIAL_MTL },
        { childID: "legs", mtl: INITIAL_MTL },
        { childID: "supports", mtl: INITIAL_MTL },
    ];



    // Init the object loader
    var loader = new THREE.GLTFLoader();

    loader.load(MODEL_PATH, function (gltf) {
        theModel = gltf.scene;

        theModel.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
            }
        });

        // Set the models initial scale   
        theModel.scale.set(2.2, 2.2, 2.2);
        theModel.rotation.y = Math.PI;

        // Offset the y position a bit
        theModel.position.y = -1;

        // Set initial textures
        for (let object of INITIAL_MAP) {
            initColor(theModel, object.childID, object.mtl);
        }

        // Add the model to the scene
        scene.add(theModel);

    }, undefined, function (error) {
        console.error(error)
    });

    // Function - Add the textures to the models
    function initColor(parent, type, mtl) {
        parent.traverse((o) => {
            if (o.isMesh) {
                if (o.name.includes(type)) {
                    o.material = mtl;
                    o.nameID = type; // Set a new property to identify this object
                }
            }
        });
    }

    // Add lights
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    // Add hemisphere light to scene   
    scene.add(hemiLight);

    var dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    // Add directional Light to scene    
    scene.add(dirLight);

    // Floor
    var floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    var floorMaterial = new THREE.MeshPhongMaterial({
        color: 0xeeeeee,
        shininess: 0
    });

    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    floor.position.y = -1;
    // scene.add(floor);

    // Add controls
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = Math.PI / 3;
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.dampingFactor = 0.1;
    controls.autoRotate = false; // Toggle this if you'd like the chair to automatically rotate
    controls.autoRotateSpeed = 0.2; // 30
    // to disable zoom
    controls.enableZoom = false;
    // to disable rotation
    controls.enableRotate = false;

    function animate() {
        requestAnimationFrame(animate);
        // stats.update();
        TWEEN.update();
        camera.lookAt(scene.position);
        renderer.render(scene, camera);


        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
    }

    animate();

    // Function - New resizing method
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        var width = window.innerWidth;
        var height = window.innerHeight;
        var canvasPixelWidth = canvas.width / window.devicePixelRatio;
        var canvasPixelHeight = canvas.height / window.devicePixelRatio;

        const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }


    const positions = [ // camera position
        [0, 4, 3], // camera 01
        [4, 4, 0], // camera 02
        [-4, -4, 0], // camera 03
    ];

    var currPosition;

    mySwiper.on('slideChange', function (e) {
        if(mySwiper.activeIndex == 1 ||  mySwiper.activeIndex == 4) {
            currPosition = 0;
            tweenCamera(camera, positions[currPosition], 3000);
        } else if(mySwiper.activeIndex == 2) {
            currPosition = 1;
            tweenCamera(camera, positions[currPosition], 3000);
        } else if(mySwiper.activeIndex == 3 || mySwiper.activeIndex == 0) {
            currPosition = 2;
            tweenCamera(camera, positions[currPosition], 3000);
        }
    });

    // var currPosition = 2; // set tung truong hop tu 0 ~ end (positions)
    // tweenCamera(camera, positions[currPosition], 3000);


    function tweenCamera(camera, position, duration) {
        new TWEEN.Tween(camera.position).to({
            x: position[0],
            y: position[1],
            z: position[2]
        }, duration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }


    // GUI

    var guiCtrl = function () {
        this.Camera_x = 0;
        this.Camera_y = 0;
        this.Camera_z = 0;
        this.alert = function () {
            alert("サンプル");
        };
    };

    gui = new dat.GUI();
    guiObj = new guiCtrl();
    var folder = gui.addFolder('Folder');
    folder.add(guiObj, 'Camera_x', -100, 100).onChange(setCameraPosition);
    folder.add(guiObj, 'Camera_y', -100, 100).onChange(setCameraPosition);
    folder.add(guiObj, 'Camera_z', -100, 100).onChange(setCameraPosition);
    folder.open();

    function setCameraPosition() {
        camera.position.set(guiObj.Camera_x, guiObj.Camera_y, guiObj.Camera_z);
    }

    // レンダリング
    function render() {
        requestAnimationFrame(render);
        controls.update();
        renderer.render(scene, camera);
    }

    render();
})

