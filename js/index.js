// three 3D start
window.onload = function() {

  let scene, camera, webGLRenderer;
  let windowScreen, fov;
  const cameraPositions = []; // カメラポジション用の配列
  let pov;  //カメラポジションを作成する
  let rotateObj;
  let theModel; // glbファイル定義

  createRotateObj(); // 回転を作成、カメラとカメラポジションを入れて一緒に回す
  createCameraPositions();
  init();
  createCar();

  const intervalID = setInterval(function(e) { // settimeout when first load
    if (modelFlag === true) {
      clearInterval(intervalID);
      renderScene();
    } else {
      console.log(e)
    }
  }, 10);

  function init() {
    scene = new THREE.Scene();
    scene.add(rotateObj);

    windowScreen = window.innerWidth / window.innerHeight;
    fov = getFov(windowScreen);
    camera = new THREE.PerspectiveCamera(fov, windowScreen, 1, 2000);

    // カメラの座標(ローカル)
    camera.position.copy(cameraPositions[0].position);

    // カメラの頭方向
    const dir = new THREE.Vector3();
    dir.copy(camera.position).multiplyScalar(2);
    camera.up.set(dir.x, dir.y, dir.z);

    //カメラが見ている座標(ローカル)
    camera.lookAt(pov.position);

    rotateObj.add(camera);

    webGLRenderer = new THREE.WebGLRenderer({
        alpha: true
    });

    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    webGLRenderer.shadowMap.enabled = true;
    webGLRenderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById("canvas").appendChild(webGLRenderer.domElement);

    const ambiLight = new THREE.AmbientLight(0x404040);
    scene.add(ambiLight);

    // add lights
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

    window.addEventListener("resize", resizeWindow);
  }

  function createRotateObj() { // 回転を作成、カメラとカメラポジションを入れて一緒に回す
    rotateObj = new THREE.Object3D();
  }

  let modelFlag = false;

  function createCar() {
    const loader = new THREE.GLTFLoader(); // threeライブラリー ロード
    const MODEL_PATH = "triangle3.glb"; // ファイル読み込む

    loader.load(MODEL_PATH, function(gltf) {
      theModel = gltf.scene;
      
      theModel.position.setFromSphericalCoords(10.08, degToRad(90), degToRad(90));

      const dir = new THREE.Vector3();
      dir.copy(theModel.position).multiplyScalar(2);
      theModel.up.set(dir.x, dir.y, dir.z);
      theModel.lookAt(pov.position);
      theModel.scale.set(0.3, 0.3, 0.3);
      rotateObj.add(theModel);

      modelFlag = true;
    });
  }

  function createCameraPositions() {
    
    // カメラ1のポジション
    const cp1 = new THREE.Object3D();
    const pos1 = new THREE.Vector3();
    pos1.setFromSphericalCoords(30, degToRad(90), degToRad(60));
    cp1.position.set(pos1.x, pos1.y, pos1.z);
    rotateObj.add(cp1);
    cameraPositions.push(cp1);

    // カメラ2のポジション
    const cp2 = new THREE.Object3D();
    const pos2 = new THREE.Vector3();
    pos2.setFromSphericalCoords(25, degToRad(235), degToRad(-80));
    cp2.position.set(pos2.x, pos2.y, pos2.z);
    rotateObj.add(cp2);
    cameraPositions.push(cp2);

    // カメラ3のポジション
    const cp3 = new THREE.Object3D();
    const pos3 = new THREE.Vector3();
    pos3.setFromSphericalCoords(25, degToRad(300), degToRad(-90));
    cp3.position.set(pos3.x, pos3.y, pos3.z);
    rotateObj.add(cp3);
    cameraPositions.push(cp3);

    // ついでにカメラが見るポジションも作っておく
    pov = new THREE.Object3D();
    const pos4 = new THREE.Vector3();
    pos4.setFromSphericalCoords(10.08, degToRad(90), degToRad(96));
    pov.position.set(pos4.x, pos4.y, pos4.z);
    rotateObj.add(pov);
  }

  function degToRad(deg) {
    return (deg * Math.PI) / 180;
  }

  function resizeWindow() {
    windowScreen = window.innerWidth / window.innerHeight;
    camera.aspect = windowScreen;
    camera.fov = getFov(windowScreen);
    camera.updateProjectionMatrix();
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    renderScene();
  }

  const dir = new THREE.Vector3();
  function changeCameraPosition(targetPosition) {
    TWEEN.removeAll();
    new TWEEN.Tween(camera.position)
      .to(targetPosition, 1500)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(function() {
          dir
            .copy(camera.getWorldPosition(new THREE.Vector3()))
            .multiplyScalar(2);
          camera.up.copy(dir);
          camera.lookAt(pov.getWorldPosition(new THREE.Vector3()));
      })
      .start();
  }

  // 視野角取得
  function getFov(windowScreen) {
    let fov;
    if (windowScreen > 1) {
        fov = 25;
    } else if (windowScreen > 0.8) {
        fov = 30;
    } else if (windowScreen > 0.6) {
        fov = 40;
    } else if (windowScreen > 0.5) {
        fov = 50;
    } else {
        fov = 60;
    }
    return fov;
  }

  function renderScene() {
    requestAnimationFrame(renderScene);
    webGLRenderer.render(scene, camera);

    TWEEN.update();
  }

  $('.c-hero__slider').attr('data-current', 'jinja');

  const bgSwiper = new Swiper('.c-hero__decorate-container', {
    loop: true,
    speed: 1500,
  })

  const mySwiper = new Swiper('.c-hero__slider-container', {
    loop: true,
    mousewheel: true,
    centeredSlides: true,
    speed: 1500,
    effect: 'fade',
    preventInteractionOnTransition: true,
    followFinger: false,

    thumbs: {
        swiper: bgSwiper
    },

    on: {
      realIndexChange: (swiper) => {
        const currentSection = swiper.realIndex;
        const currentContentTrigger = $('.c-hero__slider');

        switch (currentSection) {
          case 0:
            changeCameraPosition(cameraPositions[0].position);
            currentContentTrigger.attr('data-current', '');
            setTimeout(() => {
                currentContentTrigger.attr('data-current', 'jinja');
            }, 1800);
            break;

          case 1:
            changeCameraPosition(cameraPositions[1].position);
            currentContentTrigger.attr('data-current', 'omikuji');
            currentContentTrigger.attr('data-current', '');
            setTimeout(() => {
                currentContentTrigger.attr('data-current', 'omikuji');
            }, 1800);
            break;

          case 2:
            changeCameraPosition(cameraPositions[2].position);
            currentContentTrigger.attr('data-current', 'ema');
            currentContentTrigger.attr('data-current', '');
            setTimeout(() => {
                currentContentTrigger.attr('data-current', 'ema');
            }, 1800);
            break;
          default:
        }
      }
    },
  })
};