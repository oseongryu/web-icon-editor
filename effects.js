// ==================== 효과 적용 로직 ====================

// 개별 효과 적용
export function applyEffect(sourceCanvas, effect) {
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;

    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = width;
    resultCanvas.height = height;
    const ctx = resultCanvas.getContext('2d');

    if (effect.type === 'padding') {
        applyPadding(ctx, sourceCanvas, width, height, effect.params);
    } else if (effect.type === 'rounded') {
        applyRounded(ctx, sourceCanvas, width, height, effect.params);
    } else if (effect.type === 'invert') {
        applyInvert(ctx, sourceCanvas, width, height);
    } else if (effect.type === 'border') {
        applyBorder(ctx, sourceCanvas, width, height, effect.params);
    }

    return resultCanvas;
}

// 패딩 효과
function applyPadding(ctx, sourceCanvas, width, height, params) {
    const paddingPercent = params.percent;
    const padding = Math.floor(Math.min(width, height) * paddingPercent / 100);
    const newWidth = width - (padding * 2);
    const newHeight = height - (padding * 2);

    // 투명 배경
    ctx.clearRect(0, 0, width, height);

    // 축소된 이미지를 중앙에 배치
    ctx.drawImage(sourceCanvas, 0, 0, width, height, padding, padding, newWidth, newHeight);
}

// 라운드 코너 효과
function applyRounded(ctx, sourceCanvas, width, height, params) {
    const radiusPercent = params.percent;
    const cornerRadius = Math.floor(Math.min(width, height) * radiusPercent / 100);

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, cornerRadius);
    ctx.clip();
    ctx.drawImage(sourceCanvas, 0, 0);
}

// 색상 반전 효과
function applyInvert(ctx, sourceCanvas, width, height) {
    ctx.drawImage(sourceCanvas, 0, 0);

    // 픽셀 데이터 가져오기
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // 모든 픽셀의 RGB 반전 (Alpha는 유지)
    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];         // R
        data[i + 1] = 255 - data[i + 1]; // G
        data[i + 2] = 255 - data[i + 2]; // B
        // data[i + 3]은 Alpha, 그대로 유지
    }

    // 반전된 픽셀 데이터를 다시 그리기
    ctx.putImageData(imageData, 0, 0);
}

// 테두리 추가 효과
function applyBorder(ctx, sourceCanvas, width, height, params) {
    ctx.drawImage(sourceCanvas, 0, 0);

    // 픽셀 데이터 가져오기
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // 1. 그레이스케일 변환 및 마스크 생성 (어두운 부분 찾기)
    const mask = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            mask[y * width + x] = gray < 128 ? 255 : 0;
        }
    }

    // 2. 형태학적 팽창 (dilation) - 테두리 생성
    const borderWidth = params.width;
    const dilatedMask = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let maxVal = 0;
            // 주변 픽셀 확인
            for (let dy = -borderWidth; dy <= borderWidth; dy++) {
                for (let dx = -borderWidth; dx <= borderWidth; dx++) {
                    const ny = y + dy;
                    const nx = x + dx;
                    if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                        if (mask[ny * width + nx] > maxVal) {
                            maxVal = mask[ny * width + nx];
                        }
                    }
                }
            }
            dilatedMask[y * width + x] = maxVal;
        }
    }

    // 3. 테두리 마스크 = 팽창된 마스크 - 원본 마스크
    const borderMask = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) {
        borderMask[i] = dilatedMask[i] > 0 && mask[i] === 0 ? 255 : 0;
    }

    // 4. 새 이미지 생성: 투명 배경
    ctx.clearRect(0, 0, width, height);
    const newData = ctx.getImageData(0, 0, width, height);
    const newPixels = newData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const maskIdx = y * width + x;

            if (borderMask[maskIdx] > 0) {
                // 테두리: 검은색
                newPixels[idx] = 0;
                newPixels[idx + 1] = 0;
                newPixels[idx + 2] = 0;
                newPixels[idx + 3] = 255;
            } else if (mask[maskIdx] > 0) {
                // N 글자: 흰색
                newPixels[idx] = 255;
                newPixels[idx + 1] = 255;
                newPixels[idx + 2] = 255;
                newPixels[idx + 3] = 255;
            }
            // 나머지는 투명 (이미 0으로 초기화됨)
        }
    }

    ctx.putImageData(newData, 0, 0);
}
