// 모듈 임포트
import { getDefaultParams, getEffectConfig, renderEffectControls } from './effect-config.js';
import { applyEffect } from './effects.js';

// 전역 변수
let uploadedImage = null;
let pipeline = [];
let effectIdCounter = 0;

// DOM 요소
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const pipelineContainer = document.getElementById('pipeline');
const addEffectBtn = document.getElementById('addEffectBtn');
const processBtn = document.getElementById('processBtn');
const resetBtn = document.getElementById('resetBtn');
const preview = document.getElementById('preview');
const originalImage = document.getElementById('originalImage');
const resultCanvas = document.getElementById('resultCanvas');
const downloadBtn = document.getElementById('downloadBtn');
const downloadIcnsBtn = document.getElementById('downloadIcnsBtn');
const info = document.getElementById('info');
const effectModal = document.getElementById('effectModal');
const icnsModal = document.getElementById('icnsModal');

// ==================== 이벤트 리스너 ====================

// 업로드 영역 이벤트
uploadArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) loadImage(file);
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadImage(file);
});

// 효과 추가 버튼
addEffectBtn.addEventListener('click', () => {
    effectModal.classList.add('active');
});

// 효과 옵션 클릭
document.querySelectorAll('.effect-option').forEach(option => {
    option.addEventListener('click', (e) => {
        const effectType = e.currentTarget.dataset.effect;
        addEffect(effectType);
        closeModal();
    });
});

// 적용 버튼
processBtn.addEventListener('click', () => {
    applyPipeline();
});

// 초기화 버튼
resetBtn.addEventListener('click', () => {
    pipeline = [];
    renderPipeline();
    if (uploadedImage) applyPipeline();
});

// PNG 다운로드 버튼
downloadBtn.addEventListener('click', () => {
    resultCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'icon_edited.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/png');
});

// ICNS 준비 파일 다운로드 버튼 (모달 표시)
downloadIcnsBtn.addEventListener('click', () => {
    icnsModal.classList.add('active');
});

// 모달 외부 클릭시 닫기
effectModal.addEventListener('click', (e) => {
    if (e.target === effectModal) {
        closeModal();
    }
});

icnsModal.addEventListener('click', (e) => {
    if (e.target === icnsModal) {
        closeIcnsModal();
    }
});

// ==================== 이미지 처리 ====================

// 이미지 로드
function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            uploadedImage = img;
            originalImage.src = e.target.result;
            addEffectBtn.disabled = false;
            processBtn.disabled = false;
            resetBtn.disabled = false;
            downloadBtn.disabled = false;
            downloadIcnsBtn.disabled = false;
            applyPipeline();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ==================== 파이프라인 관리 ====================

// 효과 추가
function addEffect(type) {
    const effect = {
        id: effectIdCounter++,
        type: type,
        params: getDefaultParams(type)
    };
    pipeline.push(effect);
    renderPipeline();
    applyPipeline();
}


// 파이프라인 렌더링
function renderPipeline() {
    if (pipeline.length === 0) {
        pipelineContainer.innerHTML = `
            <div class="empty-pipeline">
                <p>📝 효과를 추가하여 파이프라인을 구성하세요</p>
                <p style="font-size: 12px; margin-top: 8px;">위에서 아래로 순서대로 적용됩니다</p>
            </div>
        `;
        return;
    }

    pipelineContainer.innerHTML = pipeline.map((effect, index) => {
        const config = getEffectConfig(effect.type);
        return `
            <div class="pipeline-step" data-effect-id="${effect.id}">
                <div class="step-header">
                    <div class="step-info">
                        <div class="step-number">${index + 1}</div>
                        <div class="step-title">${config.icon} ${config.title}</div>
                    </div>
                    <div class="step-controls">
                        ${index > 0 ? `<button class="step-btn" onclick="moveEffect(${effect.id}, -1)">↑</button>` : ''}
                        ${index < pipeline.length - 1 ? `<button class="step-btn" onclick="moveEffect(${effect.id}, 1)">↓</button>` : ''}
                        <button class="step-btn danger" onclick="removeEffect(${effect.id})">삭제</button>
                    </div>
                </div>
                <div class="effect-controls">
                    ${renderEffectControls(effect)}
                </div>
            </div>
        `;
    }).join('');
}


// 효과 파라미터 업데이트
window.updateEffectParam = function(effectId, param, value) {
    const effect = pipeline.find(e => e.id === effectId);
    if (effect) {
        effect.params[param] = parseInt(value);
        renderPipeline();
        applyPipeline();
    }
};

// 효과 이동
window.moveEffect = function(effectId, direction) {
    const index = pipeline.findIndex(e => e.id === effectId);
    if (index === -1) return;

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= pipeline.length) return;

    [pipeline[index], pipeline[newIndex]] = [pipeline[newIndex], pipeline[index]];
    renderPipeline();
    applyPipeline();
};

// 효과 제거
window.removeEffect = function(effectId) {
    pipeline = pipeline.filter(e => e.id !== effectId);
    renderPipeline();
    applyPipeline();
};

// ==================== 효과 적용 ====================

// 파이프라인 적용
function applyPipeline() {
    if (!uploadedImage) {
        // 초기 상태 정보 표시
        info.innerHTML = '<p><span class="emoji">💡</span> 이미지를 업로드하여 시작하세요</p>';
        return;
    }

    const originalWidth = uploadedImage.width;
    const originalHeight = uploadedImage.height;

    // 임시 캔버스 생성 (현재 이미지 상태)
    let currentCanvas = document.createElement('canvas');
    currentCanvas.width = originalWidth;
    currentCanvas.height = originalHeight;
    let currentCtx = currentCanvas.getContext('2d');
    currentCtx.drawImage(uploadedImage, 0, 0);

    // 각 효과를 순차적으로 적용
    for (const effect of pipeline) {
        currentCanvas = applyEffect(currentCanvas, effect);
    }

    // 최종 결과를 resultCanvas에 그리기
    resultCanvas.width = originalWidth;
    resultCanvas.height = originalHeight;
    const ctx = resultCanvas.getContext('2d');
    ctx.clearRect(0, 0, originalWidth, originalHeight);
    ctx.drawImage(currentCanvas, 0, 0);

    updateInfo();
}

// ==================== ICNS 생성 ====================

// ICNS용 아이콘셋 생성 (ZIP)
async function generateIconset() {
    if (!uploadedImage) return;

    // JSZip 인스턴스 생성
    const zip = new JSZip();
    const iconsetFolder = zip.folder('icon.iconset');

    // macOS ICNS에 필요한 크기들
    const sizes = [
        { size: 16, name: 'icon_16x16.png' },
        { size: 32, name: 'icon_16x16@2x.png' },
        { size: 32, name: 'icon_32x32.png' },
        { size: 64, name: 'icon_32x32@2x.png' },
        { size: 128, name: 'icon_128x128.png' },
        { size: 256, name: 'icon_128x128@2x.png' },
        { size: 256, name: 'icon_256x256.png' },
        { size: 512, name: 'icon_256x256@2x.png' },
        { size: 512, name: 'icon_512x512.png' },
        { size: 1024, name: 'icon_512x512@2x.png' }
    ];

    // 각 크기별 PNG 생성
    for (const {size, name} of sizes) {
        const resizedBlob = await resizeCanvas(resultCanvas, size, size);
        iconsetFolder.file(name, resizedBlob);
    }

    // README 파일 추가
    const readmeContent = `# macOS ICNS 생성 방법

이 폴더를 사용하여 .icns 파일을 생성하세요:

1. 터미널을 열고 이 폴더가 있는 위치로 이동
2. 다음 명령어 실행:
   iconutil -c icns icon.iconset

3. icon.icns 파일이 생성됩니다!

또는 png_to_icns.sh 스크립트를 사용할 수도 있습니다.
`;
    iconsetFolder.file('README.txt', readmeContent);

    // ZIP 생성 및 다운로드
    const content = await zip.generateAsync({type: 'blob'});
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'icon.iconset.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Canvas 리사이즈 함수
function resizeCanvas(sourceCanvas, width, height) {
    return new Promise((resolve) => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const ctx = tempCanvas.getContext('2d');

        // 고품질 리샘플링
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(sourceCanvas, 0, 0, width, height);

        tempCanvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/png');
    });
}

// ==================== UI 업데이트 ====================

// 모달 닫기
function closeModal() {
    effectModal.classList.remove('active');
}

// ICNS 모달 닫기
window.closeIcnsModal = function() {
    icnsModal.classList.remove('active');
};

// 스크립트 복사
window.copyScript = function() {
    const scriptText = document.getElementById('icnsScript').textContent;
    navigator.clipboard.writeText(scriptText).then(() => {
        // 복사 성공 피드백
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ 복사됨';
        btn.style.background = '#28a745';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '#667eea';
        }, 2000);
    });
};

// ICNS 다운로드 확인
window.confirmIcnsDownload = async function() {
    closeIcnsModal();
    await generateIconset();
};

// 정보 업데이트
function updateInfo() {
    const width = uploadedImage.width;
    const height = uploadedImage.height;

    let infoHTML = '<p><span class="emoji">✅</span> 편집 완료</p>';
    infoHTML += `<p><span class="emoji">📐</span> 캔버스 크기: ${width}×${height}px</p>`;

    if (pipeline.length === 0) {
        infoHTML += '<p><span class="emoji">💡</span> 효과를 추가하여 적용해보세요</p>';
    } else {
        infoHTML += `<p><span class="emoji">🔧</span> 적용된 효과: ${pipeline.length}개</p>`;

        pipeline.forEach((effect, index) => {
            const config = getEffectConfig(effect.type);
            if (effect.type === 'padding') {
                const padding = Math.floor(Math.min(width, height) * effect.params.percent / 100);
                infoHTML += `<p><span class="emoji">${config.icon}</span> ${index + 1}. ${config.title}: ${padding}px (${effect.params.percent}%)</p>`;
            } else if (effect.type === 'rounded') {
                const radius = Math.floor(Math.min(width, height) * effect.params.percent / 100);
                infoHTML += `<p><span class="emoji">${config.icon}</span> ${index + 1}. ${config.title}: ${radius}px (${effect.params.percent}%)</p>`;
            } else if (effect.type === 'invert') {
                infoHTML += `<p><span class="emoji">${config.icon}</span> ${index + 1}. ${config.title}</p>`;
            } else if (effect.type === 'border') {
                infoHTML += `<p><span class="emoji">${config.icon}</span> ${index + 1}. ${config.title}: ${effect.params.width}px</p>`;
            }
        });
    }

    info.innerHTML = infoHTML;
}

// ==================== 초기화 ====================

// 초기 정보 표시
applyPipeline();
