'use strict';

// 여기서는 particle sprite들의 좌표를 이동시켜 줌. 
// 구조는 kinetic typo 1에서 했던거랑 비교해서 수치만 약간씩 다른거 빼면 거의 비슷한데?

const FRICTION = 0.98;
const COLOR_SPEED = 0.12;
const MOVE_SPEED = 0.88;

export class Particle {
  constructor(pos, texture) {
    this.sprite = new PIXI.Sprite(texture); // parameter로 전달받은 loaded texture를 이용해서 sprite을 만듦. 
    this.sprite.scale.set(0.06);
    /**
     * Pixi에서 sprite의 크기를 조절하는 방법
     * 
     * 1. this.sprite.width, this.sprite.height에 px 단위의 값을 할당하여 사이즈를 절대값으로 지정해준다.
     * 
     * 2. this.sprite.scale.x, this.sprite.scale.y로 x축과 y축 방향으로 상대적인 비율을 변화시킨다.
     * 0에서 1사이의 수를 넣어주되, 0는 현재 사이즈의 0%, 1은 현재 사이즈의 100%. 두 배로 늘리려면 2를 넣어줄 것.
     * 
     * 3. this.sprite.scale.set(num, num) 으로 작성하면 2번에서 두 줄로 작성할 것을 한 줄로 작성해줄 수 있다.
     */

    this.savedX = pos.x;
    this.savedY = pos.y; // 맨 초기의 sprite의 x,y 좌표값을 저장해놓은 것.
    this.x = pos.x;
    this.y = pos.y; // this.x,y는 아래의 메소드에 의해 변화할 좌표값
    this.sprite.x = this.x;
    this.sprite.y = this.y; // 결국 this.x,y가 sprite의 x,y좌표값이 될거임.
    this.vx = 0;
    this.vy = 0; // this.x,y 각각에 매 프레임마다 변화를 줄 변화량
    this.radius = 10; // 해당 sprite의 반경(?). 실제 radius는 아니고, sprite을 둘러싸는 일종의 영역이라고 볼 수 있음.

    // 이건 typo 1 에서는 못보던 field값인데?
    // hex code 값이 할당된 걸 보면 각 sprite들의 색상값을 매 프레임마다 바꿔주려나 본데?
    this.savedRgb = 0xf3316e; // 초기의 색상값을 저장한 듯
    this.rgb = 0xf3316e; // 바뀐 색상값을 집어넣을 field인 것 같음.

    // this.sprite.tint = 0xf3316e; 
    // 얘의 색상값을 여기서 지정해주지 않으면 app.js의 resize 메소드에서
    // this.visual.show(this.stageWidth, this.stageheight, this.stage);를 호출해줘도 
    // 화면에 sprite들이 렌더되지 않음.
  }

  // 얘도 처음 보는 메소드인데?
  // this.rgb에 변화한 색상값을 할당해 줌.
  collide() {
    this.rgb = 0x451966;
  }

  draw() {
    /**
     * hex code 끼리 연산하기
     * 
     * 색상은 16진수인 hex code로 표현되기 때문에,
     * 16진수도 일반적인 10진수처럼 덧셈, 뺄셈, 곱셈 등이 가능하다.
     * 
     * 다만, 16진수끼리 연산을 하더라도, 결과값이 10진수로 return되기 때문에, 
     * 결과값을 10진수를 16진수로 변환하는 과정이 필요할 거다. (stack overflow 답변 북마크 참고)
     * 
     * 참고로 색상 코드를 빼줬을 때 어떤 결과값이 나올까?
     * 예를 들어 white의 hex code에 red, green의 hex code를 각각 빼준 결과값을
     * hex code로 변환하면 blue로 나옴.
     * 즉, 컬러를 더해주면 더해줄수록 점점 밝아지는 가산혼합(rgb) 상에서
     * 해당 컬러를 빼주면, 걔를 제외한 더 어두운 컬러만 남게 되는거임.
     * 
     * 여기서 보면 초기의 색상값(this.savedRgb)에서 
     * collide 메소드에 의해 변화한 색상값(this.rgb)를 빼준 값에 
     * 0.12를 매 프레임마다 곱해줌으로써, 
     * 다시 원래의 초기 색상값으로 매 프레임마다 천천히 돌아올 수 있도록 한 것.
     * 
     * 왜 이런 공식이 나오냐면, COLOR_SPEED를 빼고 보면 알 수 있음.
     * 그럼 공식이 어떻게 돼? 
     * this.rgb += (this.savedRgb - this.rgb);
     * this.rgb = this.rgb + this.savedRgb - this.rgb;
     * this.rgb = this.rgb - this.rgb + this.savedRgb;
     * this.rgb = this.savedRgb;
     * 결국 이걸 보면, 애초에 collide에 의해 변화한 색상값(this.rgb)을 초기의 색상값(this.savedRgb)로
     * 바꾸려는 거지만, COLOR_SPEED를 매 프레임마다 곱해줌으로써, 한번에 바꾸는 게 아니라, 
     * 매 프레임마다 바뀌는 양을 조금씩 줄여주면서 천천히 초기의 색상값으로 돌아올 수 있게 하려는 것.
     */
    this.rgb += (this.savedRgb - this.rgb) * COLOR_SPEED;

    // typo1과 달리 MOVE_SPEED가 0.88로 1에 가깝고
    // this.vx, vy가 아닌 그냥 this.x, y에 바로 더해줘버리네...
    // 이거는 복습할 때 자세히 살펴보자...
    this.x += (this.savedX - this.x) * MOVE_SPEED;
    this.y += (this.savedY - this.y) * MOVE_SPEED;

    this.vx *= FRICTION;
    this.vy *= FRICTION;
    // vx, vy에 추가로 더해주거나 곱해주는 부분들은 복습하면서 좀 더 자세히 살펴볼 것.

    this.x += this.vx;
    this.y += this.vy;

    this.sprite.x = this.x;
    this.sprite.y = this.y; // 여기까지는 typo 1에서 하던 것과 계산이 똑같음.
    this.sprite.tint = this.rgb; // 여기만 살짝 다름. 여기에서는 sprite의 색상을 프레임마다 바꿔 줌.
  }
}