/**
 * 更新圓環的進度顯示 (靜態設置)
 * @param {number} percentage - 0 到 100 之間的百分比值
 */
function updateProgressRing(percentage) {
    // 更改 ID: 現在控制的是 progressRingFill
    const ringFill = document.getElementById('progressRingFill');
    const text = document.getElementById('progressText');

    // 1. 更新百分比文字 (確保顯示的百分比沒有小數點)
    text.textContent = `${Math.round(percentage)}%`; 

    // 2. 計算 conic-gradient 需要的角度
    const angle = (percentage / 100) * 360;

    // 3. 透過 CSS 變數更新角度
    ringFill.style.setProperty('--progress-percentage', `${angle}deg`);
}

/**
 * 執行進度條動畫 (函數邏輯不變)
 * @param {number} targetPercentage - 目標百分比 (0-100)
 * @param {number} duration - 動畫持續時間 (毫秒), 預設 1500 毫秒 (1.5 秒)
 */
function animateProgress(targetPercentage, duration = 1500) {
    let startTime = null;
    const startPercentage = 0; 

    function step(currentTime) {
        if (!startTime) {
            startTime = currentTime;
        }
        
        const elapsed = currentTime - startTime; 
        const progress = Math.min(elapsed / duration, 1); 
        const currentPercentage = startPercentage + (targetPercentage - startPercentage) * progress;
        
        updateProgressRing(currentPercentage);

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}


// --- 範例: 啟動動畫 ---

let randomPercent=Math.ceil(Math.random()*100)
const target = randomPercent; 


// 執行動畫：從 0% 動畫到 70%，持續 2000 毫秒 (2 秒)
animateProgress(target, 1000);