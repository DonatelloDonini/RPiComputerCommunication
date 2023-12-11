async function main(){
  //////                       //////
  ////// connection with robot //////
  //////                       //////

  const leftLiveCamera= document.createElement("img");
  const rightLiveCamera= document.createElement("img");
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
    
    socket.on("mapUpdate", (data)=> {
      doNothing(); // work in progress
    })
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

  // addMenuItem("3DModel", "3DModel", );
  addMenuItem("LeftCamera", "leftCameraStream", leftLiveCamera);
  addMenuItem("RightCamera", "rightCameraStream", rightLiveCamera);
  // addMenuItem("InfoConsole", "You've added me!");
  // addMenuItem("WarningConsole", "You've added me!");
  // addMenuItem("ErrorConsole", "You've added me!");
  // addMenuItem("NetworkInfo", "You've added me!");
  // addMenuItem("SensorsPanel", "You've added me!");

  //////                                     //////
  ////// removing labels when tabs are added //////
  //////                                     //////

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