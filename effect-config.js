// ==================== 효과 설정 및 메타데이터 ====================

// 기본 파라미터
export function getDefaultParams(type) {
    switch(type) {
        case 'padding':
            return { percent: 10 };
        case 'rounded':
            return { percent: 18 };
        case 'invert':
            return {};
        case 'border':
            return { width: 3 };
        default:
            return {};
    }
}

// 효과 설정
export function getEffectConfig(type) {
    const configs = {
        padding: { icon: '📏', title: '내부 여백', unit: '%', min: 0, max: 30 },
        rounded: { icon: '⭕', title: '라운드 코너', unit: '%', min: 0, max: 50 },
        invert: { icon: '🔄', title: '색상 반전', unit: '', min: 0, max: 0 },
        border: { icon: '🖼️', title: '테두리 추가', unit: 'px', min: 1, max: 10 }
    };
    return configs[type];
}

// 효과 컨트롤 렌더링
export function renderEffectControls(effect) {
    const config = getEffectConfig(effect.type);

    if (effect.type === 'padding') {
        return `
            <div class="control-group">
                <label>여백:</label>
                <span class="value-display">${effect.params.percent}${config.unit}</span>
                <input type="range"
                    min="${config.min}"
                    max="${config.max}"
                    value="${effect.params.percent}"
                    oninput="updateEffectParam(${effect.id}, 'percent', this.value)">
            </div>
        `;
    } else if (effect.type === 'rounded') {
        return `
            <div class="control-group">
                <label>반경:</label>
                <span class="value-display">${effect.params.percent}${config.unit}</span>
                <input type="range"
                    min="${config.min}"
                    max="${config.max}"
                    value="${effect.params.percent}"
                    oninput="updateEffectParam(${effect.id}, 'percent', this.value)">
            </div>
        `;
    } else if (effect.type === 'invert') {
        return `
            <div class="control-group">
                <label style="color: #667eea;">RGB 반전, 투명도 유지</label>
            </div>
        `;
    } else if (effect.type === 'border') {
        return `
            <div class="control-group">
                <label>두께:</label>
                <span class="value-display">${effect.params.width}${config.unit}</span>
                <input type="range"
                    min="${config.min}"
                    max="${config.max}"
                    value="${effect.params.width}"
                    oninput="updateEffectParam(${effect.id}, 'width', this.value)">
            </div>
        `;
    }
}
