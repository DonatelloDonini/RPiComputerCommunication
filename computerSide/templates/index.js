import * as THREE from "three";
import { OrbitControls } from "three/OrbitControls";
import Map from "./assets/js/threeJS/Map.js";

const initialize3DEnvironment= (rootNode, map)=> {
  //////             //////
  ////// scene setup //////
  //////             //////

  const scene = new THREE.Scene();
  // scene.background= new THREE.Color(0x7FB7BE);
  const camera = new THREE.PerspectiveCamera(10, rootNode.clientWidth / rootNode.clientHeight, 0.1, 1000);
  camera.position.set(1, 5, 5);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.setSize(rootNode.clientWidth, rootNode.clientHeight);

  //////        //////
  ////// lights //////
  //////        //////

  const sun = new THREE.PointLight(0xffffff, 15);
  sun.position.set(2, 2, 2);

  // const pointLightHelper = new THREE.PointLightHelper(sun);
  // scene.add(pointLightHelper);

  const lightHolder = new THREE.Group();
  lightHolder.add(sun);

  scene.add(lightHolder)

  const minLightLevel = new THREE.AmbientLight(0x606060);
  scene.add(minLightLevel);

  //////                //////
  ////// controls setup //////
  //////                //////

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.mouseButtons = {
    LEFT: THREE.MOUSE.LEFT,
    MIDDLE: THREE.MOUSE.MIDDLE,
    RIGHT: THREE.MOUSE.RIGHT
  };
  // controls.enablePan= false;

  //////                           //////
  ////// 3D environment generation //////
  //////                           //////

  var axisHelper = new THREE.AxesHelper(3); // 3 is the size of the axes
  scene.add(axisHelper);

  scene.add(map._3DModel);

  rootNode.appendChild(renderer.domElement);

  //////                //////
  ////// animation loop //////
  //////                //////

  const animate = () => {
    requestAnimationFrame(animate);
  
    lightHolder.quaternion.copy(camera.quaternion);
  
    renderer.render(scene, camera);
  };
  
  animate();

  return [renderer, camera];
}

async function main(){
  //////                       //////
  ////// connection with robot //////
  //////                       //////
  
  const leftLiveCamera= document.createElement("img");
  const rightLiveCamera= document.createElement("img");

  const map3DModelContainer= document.createElement("div");
  map3DModelContainer.id= "environment3D";
  await Map.initialize3DModel();
  const map= new Map();
  const [renderer, camera]= initialize3DEnvironment(map3DModelContainer, map);
  
  const remoteConsole= new RemoteConsole();
  {
    //////                      //////
    ////// live video streaming //////
    //////                      //////

    // this function exists only for better readability
    const doNothing= ()=> {};

    const socket= io.connect('http://localhost:5000');
    
    // setting imgs' attributes
    leftLiveCamera.id= 'leftLiveCamera';
    rightLiveCamera.id= 'rightLiveCamera';
    leftLiveCamera.setAttribute("alt", "Left Live Camera Stream");
    rightLiveCamera.setAttribute("alt", "Right Live Camera Stream");
    
    // SocketIO event to handle incoming frames
    socket.on('frameUpdate', (data)=> {
      console.log("frame recieved");
      data.left_frame ? leftLiveCamera.setAttribute("src", 'data:image/jpg;base64,' + data.left_frame) : doNothing();
      data.right_frame ? rightLiveCamera.setAttribute("src", 'data:image/jpg;base64,' + data.right_frame) : doNothing();
    });
    
    //////                    //////
    ////// live JSON reciever //////
    //////                    //////
    
    socket.on("mapUpdate", (update_package)=> {
      map.update(update_package);
    });

    socket.on("consoleUpdate", (message)=> {
      switch (message.type) {
        case "info":
          remoteConsole.log(message.message);
          break;
        case "warn":
          remoteConsole.warn(message.message);
          break;
        case "error":
          remoteConsole.error(message.message);
          break;
      }
    });
  }

  //////           //////
  ////// tab logic //////
  //////           //////

  const config= {
    content: []
  };

  const myLayout= new window.GoldenLayout(config, $("#tabsContainer"));

  myLayout.registerComponent("genericComponent", function (container, state) {
    container.getElement().html(state.children);
  });

  myLayout.init();

  const addMenuItem= function (label, componentName, children) {
    const element= $(`<div id="${componentName}" class="tab primary-container on-primary-container-text body-large">${label}</div>`);
    $("#tabNamesContainer").append(element);

    const newItemConfig= {
      title: componentName,
      type: "component",
      componentName: "genericComponent",
      componentState: { children: children },
    };

    myLayout.createDragSource(element, newItemConfig);
  };
  
  addMenuItem("3DModel", "model3D", map3DModelContainer);
  addMenuItem("LeftCamera", "leftCameraStream", leftLiveCamera);
  addMenuItem("RightCamera", "rightCameraStream", rightLiveCamera);
  addMenuItem("Console", "console", remoteConsole.domElement);
  // addMenuItem("NetworkInfo", "You've added me!");
  // addMenuItem("SensorsPanel", "You've added me!");

  //////                     //////
  ////// managing tab events //////
  //////                     //////

  {
    myLayout.on("tabCreated", (tab)=> {
      // get opened window ID
      const toDeleteLabelID= tab.contentItem.config.title;
      document.getElementById(toDeleteLabelID).style.display= "none";
    });
    
    myLayout.on("itemDestroyed", (item)=> {
      if (! item.isComponent) return;
      const toDisplayLabelID= item.config.title;
      document.getElementById(toDisplayLabelID).style.display= "revert";
    });

    myLayout.on("itemCreated", (item)=> {
      if (! item.isComponent) return;
      if (item.config.title=== "model3D"){
        item.container.on("resize", ()=> {

          const containerWidth = map3DModelContainer.clientWidth;
          const containerHeight = map3DModelContainer.clientHeight;
        
          // Update camera aspect ratio
          camera.aspect = containerWidth / containerHeight;
          camera.updateProjectionMatrix();
        
          // Update renderer size
          renderer.setSize(containerWidth, containerHeight);
        })
      }
    });

    myLayout.on("itemDestroyed", (item)=> {
      if (! item.isComponent) return;
      if (item.config.title=== "model3D"){
        item.container.off("resize")
      }
    })
  }

  //////                            //////
  ////// handling resizing problems //////
  //////                            //////

  const resizeLayout= ()=> {
    myLayout.updateSize((window.innerWidth- MENU_CONTAINER.clientWidth), window.innerHeight);
  }

  const MENU_CONTAINER= document.getElementById("menuContainer");
  window.addEventListener("resize", resizeLayout);

  //////                     //////
  ////// menuToggleBehaviour //////
  //////                     //////

  {
    let menuOpened= false;
    const MENU_BUTTON= document.getElementById("menuIcon");
    const MENU= document.getElementById("menu");

    const toggleMenu= ()=> {
      menuOpened= ! menuOpened;
      MENU.style.display= menuOpened ? "block" : "none";
      MENU_BUTTON.style.transform= menuOpened ? "scaleX(-1)" : "scaleX(1)";
    }

    MENU_BUTTON.onclick= ()=> {
      toggleMenu();
      resizeLayout();
    };
  }
}

main();