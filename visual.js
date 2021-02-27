'use strict';

// 이 모듈도 typo1의 visual.js와 거의 동일함.

import {
  Text
} from './text.js';
import {
  Particle
} from './particle.js';

export class Visual {
  constructor() {
    // Text 인스턴스를 생성해 임시 캔버스를 만들겠지?
    this.text = new Text();

    // 지난 번에 사용한 것과 똑같은 이미지를 로드해서 텍스쳐로 변환해서 담아놓음.
    // 텍스쳐에 관한 설명은 typo 1에 자세하게 정리해놓음.
    this.texture = PIXI.Texture.from('particle.png');

    // 색상값이 존재하는 픽셀의 좌표값들로 만든 Particle 인스턴스들을 담아놓을 빈 배열
    this.particles = [];

    // 마우스가 움직인 좌표값과 
    // 마우스의 반경(?) 그니까 마우스 지점 주변을 둘러싸는 일종의 영역값이 저장됨.
    this.mouse = {
      x: 0,
      y: 0,
      radius: 100,
    };

    // pointer가 움직일 때마다 이벤트가 발생하겠지
    document.addEventListener('pointermove', this.onMove.bind(this), false);
  }

  // resize 이벤트 직후 리사이징된 브라우저 사이즈와 렌더된 root container를 가져온 뒤,
  // 리사이징된 브라우저 사이즈에 따라 임시 캔버스에 텍스트를 렌더해주고,
  // 임시 캔버스에서 색상값이 존재하는 픽셀들의 좌표값이 담긴 배열을 가져와서 this.pos에 할당하고,
  // 그 좌표값들로 ParticleContainer 안에 수백개의 sprite를 빠르게 만들어서 렌더하고,
  // 이 ParticleContainer를 가져온 root container에 추가하여 화면에 렌더해 줌 
  // -> 그래서 메소드 이름이 show임. 화면에 보여주는 역할이라는 거지.
  // 추가로 this.particles에 생성된 Particle 인스턴스들을 담아놓음
  show(stageWidth, stageHeight, stage) {
    // 리사이징 후 show 메소드를 실행했을 때 이미 생성된 ParticleContainer가 있다면 
    // 리사이징 전에 생성된 이 ParticleContainer는 root container에서 제거해주고,
    // 리사이징된 브라우저에 맞게 텍스트 위치를 재설정하여 임시 캔버스에 다시 렌더해주고,
    // ParticleContainer를 새로 하나 더 만들어서 거기에다 위치가 변한 텍스트를 기준으로
    // 다시 sprite들을 생성해서 addChild해줌.
    if (this.container) {
      stage.removeChild(this.container);
    }

    // 색상값이 존재하는 픽셀의 좌표값들이 들어있는 배열이 this.pos에 할당될거임.
    this.pos = this.text.setText('T', 2, stageWidth, stageHeight);

    /**
     * new PIXI.ParticleContainer(maxSize, properties, batchSize, autoResize)
     * 
     * 참고로 ParticleContainer를 새로 생성할 때 전달할 paramter는 총 4개
     * 뒤에 두개는 여기서 사용되지 않았으니 공식문서에서 설명을 한 번 읽어보고,
     * 
     * maxSize는 이 컨테이너에 렌더할 수 있는 particle(sprite)의 최대 개수를 의미함.
     * 즉, 색상값이 존재하는 픽셀의 개수까지 렌더할 수 있도록 함.
     * 
     * properties는 밑에 전달한 option들을 담아놓은 객체를 의미함. 
     * 해당 ParticleContainer안에 addChild해줄 각각의 sprite들의 properties들을
     * upload해줄지 말지를 지정해 줌. 각각의 뜻은 공식문서 참고.
     */
    this.container = new PIXI.ParticleContainer(
      this.pos.length, {
        vertice: false, // 꼭지점 값은 필요없고
        position: true, // 위치값은 필요함. 왜? 각 sprite의 좌표값을 움직여서 이동시킬 거니까.
        rotation: false, // 회전값은 회전시킬 거 아니니까 필요없음
        scale: false, // 크기값은 크기 변경시킬 거 아니니까 필요없음
        uvs: false, // uv map? 같은것도 필요없고
        tint: true, // typo 2에서는 particle.js에서 sprite의 색상값도 바꿔줄거니까 필요함.
        // 이런 식으로 필요한 값들은 true로 지정해서 ParticleContainer에 upload하고, 
        // 필요없는 값들은 false로 지정하면 sprite 객체의 값을 전달해주지 않음.
        // 이렇게 필요한 값들만 골라서 ParticleContainer에 upload할 수 있도록 해주는 이유가 뭘까?
        // ParticleContainer는 수백개의 sprite들을 아주 빠른 속도로 생성하여 렌더해주니까
        // 가급적이면 필요없는 값들은 ParticleContainer에 upload하지 않는게 좋겠지!
      }
    );

    // root container에 ParticleContainer를 추가함.
    // 항상 DOM에 뭔가를 추가할 때는 appendChild, container에 추가할 때는 addChild
    stage.addChild(this.container);

    this.particles = [];

    for (let i = 0; i < this.pos.length; i++) { // 색상값이 존재하는 픽셀 개수만큼 for loop를 돌리고
      const item = new Particle(this.pos[i], this.texture); // 색상값이 존재하는 각 픽셀의 좌표값으로 Particle 인스턴스를 생성하고
      this.container.addChild(item.sprite); // Particle 인스턴스에서 생성된 각각의 sprite들을 ParticleContainer에 렌더해주고
      this.particles.push(item); // 앞에서 생성한 Particle 인스턴스들을 차곡차곡 this.particles에 저장해놓음.
    }
    // 이런 식으로 this.pos.length의 개수만큼 for loop를 돌면서 엄청나게 빠른 속도로
    // ParticleContainer에 sprite들을 생성하여 추가해 줌.
  }

  animate() {
    for (let i = 0; i < this.particles.length; i++) {
      const item = this.particles[i];
      const dx = this.mouse.x - item.x;
      const dy = this.mouse.y - item.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // 각 sprite들의 현재 좌표값과 현재 마우스의 위치값 사이의 거리를 구해 줌.

      // minDist는 마우스를 둘러싼 영역(?)과 각 sprite들을 둘러싼 영역(?)을 더해준 값.
      // 그니까, 이만큼은 서로의 영역이니 넘보지 말도록 하자. 마우스와 각 sprite끼리 이만큼의 거리는 유지하자
      // 라는 의미에서 minDist임. '최소 유지 거리' 라고 보면 될 듯.
      // 따라서 마우스가 sprite들을 향해서 이동할수록 minDist만큼의 거리를 유지하려면
      // 각 sprite들이 그만큼 뒤로 밀려나겠지 -> 이런 움직임을 구현하기 위해 만든 값.
      const minDist = item.radius + this.mouse.radius;

      // 마우스와 각 sprite사이의 실제 거리가 최소 유지 거리보다 작아지려고 한다면?
      // 즉, 어떤 sprite이 마우스에 의해 최소 유지 거리를 침범하려고 한다면?
      // if block을 수행하여 해당 sprite을 이동시켜서 계속 거리를 유지시킬 수 있도록 하겠지
      // 이 if block은 typo1의 note_capture.jpg 를 참고하면서 보면 이해가 쉬움.
      if (dist < minDist) {
        // atan2에 두 지점의 x, y좌표값을 각각 뺸 값을 넣어주면 무슨 각도가 나온다?
        // 두 지점을 연결한 벡터의 기울기 각도가 나온다!
        // typo1의 visual.js에 정리한 내용을 참고할 것.
        // 결과적으로 마우스 지점과, 최소 유지 거리를 침범당한 sprite 지점을 연결한 벡터의 기울기값을 받게 됨.
        const angle = Math.atan2(dy, dx);

        // 그 벡터의 기울기로 원의 좌표를 구한다면?
        // 최소 유지 거리를 침범당한 sprite을 중심으로 minDist만큼의 반지름을 갖는 원 위에서
        // 해당 각도의 원의 좌표값이 tx, ty가 됨.
        // 이건 뭘까? 즉, 해당 sprite와 마우스 지점이 최소 유지거리를 지켰다면
        // 마우스가 위치했어야 할 지점의 좌표값을 tx, ty로 할당해준 것임.
        // 마우스한테 '너는 최소 유지거리를 지키려면 원래 여기에 있어야 해!'라고 하는 좌표값인 것.
        const tx = item.x + Math.cos(angle) * minDist;
        const ty = item.y + Math.sin(angle) * minDist;

        // 마우스에 의해 최소 유지 거리를 침범당한 해당 sprite에 대해 
        // 최소 유지거리를 지키려면 있어야 할 마우스의 위치(tx, ty) - 실제 침범한 마우스의 위치(this.mouse.x,y)
        // 이니까, ax, ay는 뭘까? 
        // x, y좌표값 각각에서 마우스가 '얼만큼 침범했는지', 침범한 거리값이 ax, ay에 할당됨 
        const ax = tx - this.mouse.x;
        const ay = ty - this.mouse.y;

        // 마우스가 침범한 만큼의 거리값을
        // 해당 sprite가 이동해야 할 변화량(item.vx, vy)에 할당해 줌.
        // 마우스가 이만큼 침범했으니, 너도 이만큼 뒤로 가라는 뜻.
        item.vx -= ax;
        item.vy -= ay;

        // typo2에서는 추가로 침범당한 sprite에 대해 색상값을 변화시켜 줌
        item.collide();
      }

      // 모든 sprite들에 대해 draw 메소드를 호출해서 sprite의 위치값, 색상값에 변화를 줘서
      // 매 프레임마다 실제로 움직이고 색상이 변하도록 해줌. 
      item.draw();
    }
  }

  onMove(e) {
    // this.mouse에 마우스가 움직인 좌표값을 이벤트가 발생할 때마다 할당해주고!
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }
}