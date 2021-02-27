'use strict';

/*
import {
  Text
} from './text.js';
*/

import {
  Visual
} from './visual.js'

class App {
  constructor() {
    // Web Font를 로드하기 전에 this.setWebgl에서 
    // 가장 먼저 CDN으로 웹페이지에 임베드한 Pixi.js 라이브러리를 이용해
    // WebGL view canvas와 sprite 및 그래픽 객체들을 넣어 놓을 수 있는 root container를 생성함.
    this.setWebgl();

    WebFont.load({
      google: {
        families: ['Hind:700']
      },
      fontactive: () => { // 렌더되는 폰트 각각에 대해 한번씩 실행해줄 콜백함수를 정의할 수 있는 이벤트.
        /*
        // 폰트 하나를 로드 받아서 렌더하면 Text 인스턴스를 생성한 뒤, 임시로 사용할 캔버스에 렌더해서 보여줌.
        // 이 부분은 텍스트가 화면에 어떻게 보일건지 보여주려고 테스트삼아 작성한 것. 나중에 지우게 될거임.
        this.text = new Text();
        this.text.setText(
          'A',
          2,
          document.body.clientWidth,
          document.body.clientHeight,
        );
        // 참고로, 위에 this.setWebgl에서 WebGL view가 먼저 생성되고, 
        // 거기에 this.stage(root container)를 render해주면 
        // (원래 PIXI.Application으로 했다면 따로 this.stage를 WebGL view에 따로 render해주지 않아도 알아서 됬을텐데...)
        // WebGL 캔버스를 생성할 때 지정한 backgroundColor가 먼저 깔리게 됨.
        // 그리고 나서 여기에서 임시로 생성한 캔버스에 0.3의 투명도를 가진 검은색 텍스트를 렌더해주면
        // WebGL 캔버스 위에 new Text에서 생성한 캔버스가 깔린다고 생각하면 됨.
        // 그럼 어떻게 보일까? 텍스트가 렌더된 캔버스는 텍스트 부분을 제외하면 
        // alpha값이 0, 즉 색상값이 없음. 또 텍스트 부분은 투명도가 0.3이므로, 
        // 아래의 WebGL 캔버스에 렌더된 영역에 칠해준 색깔, 즉 backgroundColor에서 지정한 색깔이 비치게 됨. 
        */

        // 폰트를 렌더하면 Visual 인스턴스를 새롭게 생성하여 particle sprite들을
        // 마우스 움직임에 따라 화면에 렌더해 줄 준비를 함.
        this.visual = new Visual();

        // 폰트를 렌더하면 브라우저 창에 리사이징 이벤트를 걸어줌
        window.addEventListener('resize', this.resize.bind(this), false);
        this.resize(); // 폰트 렌더하면 this.resize 콜백 메소드를 한 번 실행시켜 줌

        requestAnimationFrame(this.animate.bind(this)); // 반복 호출해 줄 animate 메소드에도 애니메이션 걸어줌.
      }
    });
  }

  setWebgl() {
    // WebGL이 구동 가능한 canvas를 생성함.
    this.renderer = new PIXI.Renderer({
      width: document.body.clientWidth,
      height: document.body.clientHeight, // WebGL view canvas의 사이즈를 정해줌
      antialias: true, // 픽셀의 계단 깨짐 현상을 제거해줌
      transparent: false, // WebGL에 렌더되는 영역을 투명으로 해줄것인지 여부를 결정해 줌.
      resolution: (window.devicePixelRatio > 1) ? 2 : 1, // retina가 가능할 경우 캔버스의 픽셀 수를 2배로 늘림
      autoDensity: true, // resolution에서 지정한 해상도값에 따라 CSS pixel의 단위크기를 늘려줌. 캔버스의 scale 기능과 동일.
      powerPreference: "high-performance", // 듀얼 그래픽 카드 지원
      backgroundColor: 0xffffff, // WebGL view의 배경색이 아니라, WebGL에 렌더되는 영역(root container)의 색깔을 지정해 줌.
    });
    document.body.appendChild(this.renderer.view); // 생성한 WebGL view를 DOM에 추가해주면 화면에 나타남.

    // root container를 생성해 줌
    this.stage = new PIXI.Container();
  }

  // 브라우저가 리사이징 될때마다 크기값을 가져와서 전달해주는 메소드
  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageheight = document.body.clientHeight;

    // PIXI.Renderer의 메소드인 resize는 
    // WebGL view를 파라미터로 전달받은 width, height만큼 resize함.
    this.renderer.resize(this.stageWidth, this.stageheight);

    // 이걸 resize 메소드에서 호출해도 화면에는 아무것도 안보일까?
    // 왜냐면 this.visual.show에서 실행하는 코드들 중에는 sprite의 tint를 지정해주는 게 없어서 그럼.
    // sprite의 tint는 기본값이 0xFFFFFF이다. 즉, tint값을 따로 할당해주지 않는다면
    // 흰색 바탕에 흰색 sprite가 렌더될테니 아무것도 안보이는 게 당연하지.
    this.visual.show(this.stageWidth, this.stageheight, this.stage);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this)); // 내부에서 호출해서 반복될 수 있도록 함.

    // 이 메소드가 각 sprite의 draw메소드를 호출하기 때문에
    // 이 draw메소드에서 각 sprite의 tint 값을 지정해줘야 렌더된 sprite들이 화면에 보이게 됨.
    // 또 실제로 sprite들이 pointermove 이벤트에 반응하여 움직이는 것도 draw 메소드에서 정의되기 때문에
    // 이 메소드를 호출해줘야 sprite도 마우스 움직임에 따라 이동하게 됨.
    this.visual.animate();

    // 이런 식으로 root container를 별도로 생성하고,
    // renderer 인스턴스에서 render 메소드로 또 별도로 root container를 렌더해줘야 함.
    // PIXI.Application으로 했으면 한방에 처리할 수 있는 것을...
    // 그리고 WebGL view에 렌더되는 영역(this.stage 즉, root container)
    // 이 생김에 따라 PIXI.Renderer에서 지정한 backgroundColor가 칠해짐.
    this.renderer.render(this.stage);
  }
}

window.onload = () => {
  new App();
};