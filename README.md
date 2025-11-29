# 아이콘 에디터

파이프라인 방식으로 아이콘에 다양한 효과를 순차적으로 적용하는 웹 기반 에디터입니다.

## 주요 기능

- 드래그 앤 드롭 이미지 업로드
- 파이프라인 방식 효과 적용 (순서 변경 가능)
- 실시간 미리보기
- PNG 다운로드
- macOS ICNS 파일 생성용 아이콘셋 다운로드

## 지원 효과

### 📏 내부 여백 (Padding)
이미지 크기는 유지하면서 내용물만 축소하여 중앙에 배치합니다.
- 조정 범위: 0-30%

### ⭕ 라운드 코너 (Rounded Corners)
macOS Big Sur 스타일의 부드러운 모서리를 추가합니다.
- 조정 범위: 0-50%

### 🔄 색상 반전 (Invert Colors)
RGB 색상을 반전하고 투명도는 유지합니다. (트레이 아이콘 생성에 유용)
- 파라미터 없음

### 🖼️ 테두리 추가 (Border)
어두운 부분을 흰색으로 변환하고 검은색 테두리를 추가합니다.
- 조정 범위: 1-10px

## 프로젝트 구조

```
web-icon-editor/
├── index.html              # 메인 HTML
├── icon_editor.css         # 스타일시트
├── icon_editor.js          # 메인 로직 (이벤트 처리, 파이프라인 관리)
├── effect-config.js        # 효과 설정 및 메타데이터
└── effects.js              # 효과 적용 로직
```

## 코드 구조

### icon_editor.js
메인 애플리케이션 로직을 담당합니다.
- 이미지 업로드 처리
- 파이프라인 관리 (추가, 삭제, 순서 변경)
- UI 렌더링 및 이벤트 처리
- ICNS 파일셋 생성

### effect-config.js
효과의 설정과 메타데이터를 관리합니다.
```javascript
export function getDefaultParams(type)     // 기본 파라미터
export function getEffectConfig(type)      // 효과 설정 (아이콘, 제목, 범위 등)
export function renderEffectControls(effect) // UI 컨트롤 렌더링
```

### effects.js
실제 이미지 처리 로직을 담당합니다.
```javascript
export function applyEffect(sourceCanvas, effect) // 메인 효과 적용 함수
```

각 효과는 독립적인 함수로 구현되어 있습니다:
- `applyPadding()` - 패딩 효과
- `applyRounded()` - 라운드 코너 효과
- `applyInvert()` - 색상 반전 효과
- `applyBorder()` - 테두리 추가 효과

## 사용 방법

1. 웹 서버에서 실행 (ES6 모듈 사용으로 로컬 파일로는 실행 불가)
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js (http-server)
   npx http-server
   ```

2. 브라우저에서 `http://localhost:8000` 접속

3. 이미지 업로드 후 효과 추가 및 적용

## 새로운 효과 추가하기

### 1. effect-config.js에 설정 추가

```javascript
// getDefaultParams() 함수에 추가
case 'myeffect':
    return { intensity: 50 };

// getEffectConfig() 함수에 추가
myeffect: { icon: '✨', title: '내 효과', unit: '%', min: 0, max: 100 }

// renderEffectControls() 함수에 추가
else if (effect.type === 'myeffect') {
    return `
        <div class="control-group">
            <label>강도:</label>
            <span class="value-display">${effect.params.intensity}${config.unit}</span>
            <input type="range" ... >
        </div>
    `;
}
```

### 2. effects.js에 로직 추가

```javascript
// applyEffect() 함수에 케이스 추가
if (effect.type === 'myeffect') {
    applyMyEffect(ctx, sourceCanvas, width, height, effect.params);
}

// 효과 함수 구현
function applyMyEffect(ctx, sourceCanvas, width, height, params) {
    // 이미지 처리 로직
    ctx.drawImage(sourceCanvas, 0, 0);
    // ... 추가 처리
}
```

### 3. index.html에 UI 추가

```html
<div class="effect-option" data-effect="myeffect">
    <h4>✨ 내 효과</h4>
    <p>효과 설명</p>
</div>
```

## macOS ICNS 파일 생성

1. "ICNS 준비 파일" 버튼 클릭
2. 다운로드된 ZIP 파일 압축 해제
3. 터미널에서 실행:
   ```bash
   iconutil -c icns icon.iconset
   ```

생성된 크기:
- 16x16, 32x32, 128x128, 256x256, 512x512 (각각 @1x, @2x)

## 기술 스택

- Vanilla JavaScript (ES6 모듈)
- HTML5 Canvas API
- JSZip (ICNS 파일셋 생성)

## 라이선스

MIT
