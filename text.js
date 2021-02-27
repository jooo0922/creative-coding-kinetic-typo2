'use strict';

export class Text {
  constructor() {
    // 이 캔버스도 그냥 픽셀 데이터만 가져오려고 만든 거겠지?
    // 실제로 화면에 보여주는건 WebGL view에다가 할 거임.
    // 그래서 style값을 css 파일이 아닌 js에서 임시로 할당해준 거임.
    this.canvas = document.createElement('canvas');
    // this.canvas.style.position = 'absolute';
    // this.canvas.style.left = '0';
    // this.canvas.style.top = '0';
    // document.body.appendChild(this.canvas);
    // 임시로 만든 캔버스의 style 프로퍼티, DOM에 추가한 것 모두 코멘트 처리!

    this.ctx = this.canvas.getContext('2d');
  }

  // 기본적인 메소드나 구조는 kinetic typo 1 만들때랑 똑같네
  setText(str, density, stageWidth, stageHeight) {
    // 브라우저의 현재 width, height 만큼만 캔버스 사이즈를 설정해 둠. 
    // 어차피 이 캔버스는 실제로 화면에 보여줄 게 아니니까 레티나 디스플레이는 고려 안해도 됨
    this.canvas.width = stageWidth;
    this.canvas.height = stageHeight;

    const myText = str;
    const fontWeight = 700; // Web Font Loader에서 로드받은 폰트의 굵기
    const fontSize = 800; // 폰트 크기는 800px로 하는거고
    const fontName = 'Hind'; // Web Font Loader에서 로드해온 거니까 얘로 캔버스에 텍스트 렌더할 수 있겠지?

    this.ctx.clearRect(0, 0, stageWidth, stageHeight); // 폰트를 렌더하기 전 캔버스를 한번 싹 지워줌.

    // 텍스트 그릴 때 사용되는 현재 텍스트 스타일. 
    // `폰트 굵기 폰트 사이즈 폰트 패밀리` 순으로 작성. CSS font 프로퍼티 작성 구문 확인해볼 것.
    this.ctx.font = `${fontWeight} ${fontSize}px ${fontName}`;
    this.ctx.fillStyle = `rgba(0, 0, 0, 0.3)`; // 캔버스에서 텍스트가 렌더되는 픽셀에 찍힐 색깔을 정의함.
    this.ctx.textBaseline = `middle`; // textBaseline은 종류만 바뀌고, 실제 위치는 텍스트만 움직임.

    // 렌더되는 텍스트에 대한 정보가 담긴 객체 TextMetrics를 리턴해줌.
    const fontPos = this.ctx.measureText(myText);

    // 텍스트의 x, y좌표값을 할당하여 렌더함. 각각의 값들이 무엇인지 하나씩 지워보면서 확인할 것.
    this.ctx.fillText(
      myText,
      (stageWidth - fontPos.width) / 2,
      fontPos.actualBoundingBoxAscent +
      fontPos.actualBoundingBoxDescent + // 이 두 값을 더하면 텍스트 전체의 '실제' 높이가 나옴.
      ((stageHeight - fontSize) / 2)
    );

    // 이거는 지난번에도 봤듯이 this.ctx에 텍스트가 렌더됬을때
    // 캔버스 상에 컬러값이 찍힌 픽셀들의 좌표값만 모아놓은 배열을 리턴받는 메소드를 호출한 것.
    return this.dotPos(density, stageWidth, stageHeight);
  }

  dotPos(density, stageWidth, stageHeight) {
    // 캔버스 전체 픽셀의 색상데이터 값이 담긴 배열을 복사해서 할당한 것.
    const imageData = this.ctx.getImageData(
      0, 0,
      stageWidth, stageHeight
    ).data;

    const particles = []; // 색상값을 가지는 픽셀의 좌표값으로 생성한 Particle 인스턴스들을 담아놓을 곳.
    let i = 0;
    let width = 0;
    let pixel;

    // density 단위로 브라우저의 pixel들을 돌아보면서 해당 픽셀에 색상값이 존재하는지 확인
    // 모든 pixel들을 일일이 다 세어줄 수는 없으니 density로 한 번 세는 픽셀의 단위크기를 늘려줘서
    // 원래의 픽셀 개수보다 적게 세어줄 수 있도록 한 거 같음.
    for (let height = 0; height < stageHeight; height += density) {
      ++i;
      const slide = (i % 2) == 0;
      width = 0;
      if (slide == 1) {
        width += 6;
      }
      // 밑에서 width 값으로 for loop를 돌릴 때 초기값에 0과 6을 번갈아서 할당해 줌.
      // 사실 이걸 왜 하는건지는 모르겠음. width를 0으로만 놓고 돌려도 결과가 똑같던데...
      // 복습할 때 좀 더 생각해보자.

      for (width; width < stageWidth; width += density) {
        // height - 1 번째 row까지 존재하는 픽셀 개수를 세려면 stageWidth * height 해줘야 됨. 이게 가장 중요.
        // 그리고 height번째의 row에 존재하는 현재 width번째 까지의 픽셀의 개수를 세어줌.
        // 이렇게 하면 전체 픽셀 상에서 해당 픽셀이 몇 번째 픽셀인지의 값을 알 수 있음.
        // 또 이 값에 4를 곱하면 (width + (height * stageWidth))번째 픽셀 옆에 있는 픽셀,
        // 그러니까 (width + (height * stageWidth)) + 1 번째 픽셀의 r값의 index인 셈.
        // 그럼 여기에 -1을 하면? (width + (height * stageWidth))번째 픽셀의 alpha값(투명도)의 index임.
        // 따라서 pixel에는 (width + (height * stageWidth))번째 픽셀의 a값이 들어갈 것임.
        pixel = imageData[((width + (height * stageWidth)) * 4) - 1];

        if (pixel != 0 &&
          width > 0 &&
          width < stageWidth &&
          height > 0 &&
          height < stageHeight) {
          // 투명도가 0이 아니고, 브라우저 안에 존재하는 픽셀이라면,
          // 그 픽셀의 좌표값을 particles 배열에 순서대로 push해줌.
          particles.push({
            x: width,
            y: height,
          });
        }
      }
    }

    // 이중 for loop를 돌면서 캔버스 상에서 색상값이 존재하는 픽셀들의 좌표값을 담아준
    // particles를 최종적으로 return해줌.
    return particles;
  }
}