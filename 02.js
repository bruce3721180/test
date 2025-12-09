document.addEventListener('DOMContentLoaded', () => {
    const ROWS = 7;
    const COLS = 10;
    const GRID_SIZE = ROWS * COLS;
    const CALENDAR_GRID = document.getElementById('calendarGrid');
    const STREAK_COUNT_ELEMENT = document.getElementById('streakCount');
    const FILL_DURATION = 1500; // 整個直行填充時間 (1.5秒)

    // 1. 隨機生成日曆數據 (初始生成，包含所有方格)
    const calendarData = Array(GRID_SIZE).fill(0).map(() => Math.random() < 0.6); 
    
    
    // --- 處理未來的日子 ---
    const today = new Date();
    // 獲取今天是星期幾 (0=日, 1=一, ..., 6=六)
    let todayDayOfWeek = today.getDay(); 
    
    // 將 JS 的星期索引 (0=日, 1=一) 轉換為我們日曆的 Row 索引 (0=一, ..., 6=日)
    let todayRowIndex; // 0 到 6
    if (todayDayOfWeek === 0) { // 星期日 (JS=0)
        todayRowIndex = 6;
    } else { // 星期一到星期六 (JS=1..6)
        todayRowIndex = todayDayOfWeek - 1; 
    }
    
    // *** 修正點 1: todayCellIndex 邏輯修正 ***
    // '今天' 的單元格索引。將 col 從 0 改為 COLS - 1 (9)，使其出現在最右邊一欄。
    const todayCellIndex = (COLS - 1) * ROWS + todayRowIndex; 

    // 將所有在今天之後的方格強制設為 false (灰色/未登入)
    // 由於現在 '今天' 被放在最右邊一欄 (col=9)，我們只須遍歷 col=9
    
    // 遍歷今天所在的最後一列 (col=9)
    for (let row = 0; row < ROWS; row++) {
        const index = (COLS - 1) * ROWS + row;
        
        // 判斷是否為今天之後的日子 (在同一欄中，索引大於今天的 row 索引)
        if (row > todayRowIndex) {
            // 今天之後的方格，強制設為灰色
            calendarData[index] = false;
        } 
        // 今天或今天之前的方格保持隨機狀態 (歷史紀錄中的所有方格也保持隨機)
    }
    // --- END NEW LOGIC ---

    
    // 2. 計算連續登入天數 (保持不變 - 仍使用 Column-Major 順序計算)
    function calculateMaxStreak(data) {
        let currentStreak = 0;
        let maxStreak = 0; 
        
        for (let i = 0; i < data.length; i++) {
            if (data[i]) {
                currentStreak++;
            } else {
                if (currentStreak > maxStreak) {
                    maxStreak = currentStreak;
                }
                currentStreak = 0; 
            }
        }
        
        if (currentStreak > maxStreak) {
            maxStreak = currentStreak;
        }

        return maxStreak;
    }

    const finalStreak = calculateMaxStreak(calendarData);

    // 3. 生成日曆方格並設置初始樣式 (保持不變)
    function generateCalendar() {
        for (let i = 0; i < GRID_SIZE; i++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            
            if (calendarData[i]) {
                cell.classList.add('filled');
            }
            
            const row = i % ROWS;       
            const col = Math.floor(i / ROWS); // 這裡 i=0 仍在左邊 (col=0)
            
            cell.style.gridRow = row + 1;
            cell.style.gridColumn = col + 2; 

            CALENDAR_GRID.appendChild(cell);
        }
    }

    // 4. 更新月份標籤並標記當天日期 
    function updateCalendarElements() {
        const today = new Date();
        const formatter = new Intl.DateTimeFormat('zh-TW', { month: 'numeric' });
        
        // --- 4.1. 更新月份標籤 (修正賦值順序) ---
        
        const currentMonth = formatter.format(today);
        const previousMonthDate = new Date(today);
        previousMonthDate.setMonth(today.getMonth() - 1);
        const previousMonth = formatter.format(previousMonthDate);
        const twoMonthsAgoDate = new Date(today);
        twoMonthsAgoDate.setMonth(today.getMonth() - 2);
        const twoMonthsAgo = formatter.format(twoMonthsAgoDate);

        // *** 關鍵修正: 月份順序由 左➡️右 改為: 兩個月前, 上個月, 這個月 ***
        // 由於 HTML 結構是：monthLabelLeft, monthLabelMiddle, monthLabelRight
        // 月份標籤應該是：9月, 10月, 11月 (最舊到最新)
        document.getElementById('monthLabelLeft').textContent = `${twoMonthsAgo}`;
        document.getElementById('monthLabelMiddle').textContent = `${previousMonth}`;
        document.getElementById('monthLabelRight').textContent = `${currentMonth}`;


        // --- 4.2. 標記今天的方格 (黃色背景) ---
        
        // 直接使用前面計算的 todayCellIndex (現在它指向最右邊的格子)
        const todayIndex = todayCellIndex; 
        
        const cells = CALENDAR_GRID.querySelectorAll('.calendar-cell');
        if (cells.length > todayIndex) {
            cells[todayIndex].classList.add('today');
        }
    }
    
    // 5. 實現動畫效果 (由左至右，整個直行逐漸填滿) (保持不變)
    function animateFill() {
        const cells = Array.from(CALENDAR_GRID.querySelectorAll('.calendar-cell'));
        
        const columnDelay = FILL_DURATION / COLS; 
        const cellDelay = 50; 

        for (let col = 0; col < COLS; col++) {
            const columnStartTime = col * columnDelay;

            for (let row = 0; row < ROWS; row++) {
                const index = col * ROWS + row;
                const cell = cells[index];
                
                const totalDelay = columnStartTime + (row * cellDelay);
                
                setTimeout(() => {
                    cell.classList.add('visible');
                }, totalDelay);
            }
        }
    }

    // 6. 連續登入天數漸進增加動畫 (保持不變)
    function animateStreakCount(finalCount) {
        let currentCount = 0;
        const duration = FILL_DURATION; 
        const startTime = performance.now();

        function updateCount(timestamp) {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            currentCount = Math.round(progress * finalCount);

            STREAK_COUNT_ELEMENT.textContent = currentCount;

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            }
        }

        requestAnimationFrame(updateCount);
    }


    // --- 啟動函式 ---
    generateCalendar();
    updateCalendarElements(); 

    setTimeout(() => {
        animateFill();
        animateStreakCount(finalStreak);
    }, 100); 
});