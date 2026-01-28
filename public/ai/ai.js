/* Modern Market Analysis Tool - JavaScript */
let derivWs;
let tickHistory = [];
let currentSymbol = 'R_100';
let tickCount = 1000;
let decimalPlaces = 3;
let connectionStatus = 'disconnected';
let reconnectAttempts = 0;
let maxReconnectAttempts = 5;

// Initialize WebSocket connection
function startWebSocket() {
    if (derivWs) {
        derivWs.close();
    }

    updateConnectionStatus('connecting');
    console.log('Connecting to Deriv WebSocket...');

    derivWs = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=122836');

    derivWs.onopen = function () {
        console.log('WebSocket connected successfully');
        updateConnectionStatus('connected');
        reconnectAttempts = 0;
        requestTickHistory();
    };

    derivWs.onmessage = function (event) {
        try {
            const data = JSON.parse(event.data);
            console.log('Received data:', data);

            if (data.history) {
                console.log(`Received ${data.history.prices.length} historical ticks`);
                tickHistory = data.history.prices.map((price, index) => {
                    const epoch = data.history.times[index];
                    const quote = parseFloat(price);
                    return { time: epoch, quote: quote };
                });
                detectDecimalPlaces();
                updateUI();
                updateConnectionStatus('receiving_data');
            } else if (data.tick) {
                let tickQuote = parseFloat(data.tick.quote);
                tickHistory.push({ time: data.tick.epoch, quote: tickQuote });
                if (tickHistory.length > tickCount) tickHistory.shift();
                updateUI();
                updateConnectionStatus('live_data');
            } else if (data.error) {
                console.error('WebSocket error:', data.error);
                updateConnectionStatus('error');
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };

    derivWs.onerror = function (error) {
        console.error('WebSocket error:', error);
        updateConnectionStatus('error');
    };

    derivWs.onclose = function (event) {
        console.log('WebSocket connection closed:', event.code, event.reason);
        updateConnectionStatus('disconnected');
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
            setTimeout(startWebSocket, delay);
        } else {
            console.error('Max reconnection attempts reached');
            updateConnectionStatus('failed');
        }
    };
}

// Update connection status display
function updateConnectionStatus(status) {
    connectionStatus = status;
    const statusElement = document.getElementById('connection-status');
    if (!statusElement) return;

    let statusText = '';
    let statusClass = '';

    switch (status) {
        case 'connecting':
            statusText = 'Connecting...';
            statusClass = 'status-connecting';
            break;
        case 'connected':
            statusText = 'Connected';
            statusClass = 'status-connected';
            break;
        case 'receiving_data':
            statusText = 'Loading data...';
            statusClass = 'status-loading';
            break;
        case 'live_data':
            statusText = 'Live data';
            statusClass = 'status-live';
            break;
        case 'error':
            statusText = 'Connection error';
            statusClass = 'status-error';
            break;
        case 'disconnected':
            statusText = 'Disconnected';
            statusClass = 'status-disconnected';
            break;
        case 'failed':
            statusText = 'Connection failed';
            statusClass = 'status-failed';
            break;
        default:
            statusText = 'Unknown';
            statusClass = 'status-unknown';
    }

    statusElement.textContent = statusText;
    statusElement.className = `connection-status ${statusClass}`;
}

// Request tick history
function requestTickHistory() {
    const request = {
        ticks_history: currentSymbol,
        count: tickCount,
        end: 'latest',
        style: 'ticks',
        subscribe: 1,
    };
    
    console.log('Requesting tick history:', request);
    derivWs.send(JSON.stringify(request));
}

// Detect decimal places
function detectDecimalPlaces() {
    if (tickHistory.length === 0) return;

    let decimalCounts = tickHistory.map(tick => {
        let decimalPart = tick.quote.toString().split('.')[1] || '';
        return decimalPart.length;
    });

    decimalPlaces = Math.max(...decimalCounts, 2);
    console.log(`Detected ${decimalPlaces} decimal places`);
}

// Get last digit from price
function getLastDigit(price) {
    let priceStr = price.toString();
    let priceParts = priceStr.split('.');
    let decimals = priceParts[1] || '';

    while (decimals.length < decimalPlaces) {
        decimals += '0';
    }

    return Number(decimals.slice(-1));
}

// Update all UI elements
function updateUI() {
    if (tickHistory.length === 0) {
        console.log('No tick data available yet');
        return;
    }

    console.log(`Updating UI with ${tickHistory.length} ticks`);
    updatePriceDisplay();
    updateDigitDisplay();
    updateAnalysisRows();
    updateTickCount();
}

// Update price display
function updatePriceDisplay() {
    const currentPriceElement = document.getElementById('current-price');
    if (tickHistory.length > 0) {
        const currentPrice = tickHistory[tickHistory.length - 1].quote.toFixed(decimalPlaces);
        currentPriceElement.textContent = currentPrice;
    } else {
        currentPriceElement.textContent = 'Loading...';
    }
}

// Update tick count display
function updateTickCount() {
    const tickCountElement = document.getElementById('tick-count');
    if (tickCountElement) {
        tickCountElement.textContent = `${tickHistory.length}/${tickCount}`;
    }
}

// Update digit display
function updateDigitDisplay() {
    const digitCounts = new Array(10).fill(0);
    tickHistory.forEach(tick => {
        const lastDigit = getLastDigit(tick.quote);
        digitCounts[lastDigit]++;
    });

    const digitPercentages = digitCounts.map(count => (count / tickHistory.length) * 100);
    const currentDigit = tickHistory.length > 0 ? getLastDigit(tickHistory[tickHistory.length - 1].quote) : null;

    // Create array of digits with their percentages for sorting
    const digitData = digitPercentages.map((percentage, digit) => ({
        digit,
        percentage,
        count: digitCounts[digit]
    }));

    // Sort by percentage to find rankings
    const sortedByPercentage = [...digitData].sort((a, b) => b.percentage - a.percentage);
    
    // Find the digits for each ranking
    const mostAppearing = sortedByPercentage[0].digit;           // Green
    const secondMostAppearing = sortedByPercentage[1].digit;    // Blue
    const leastAppearing = sortedByPercentage[9].digit;         // Red
    const secondLeastAppearing = sortedByPercentage[8].digit;   // Orange

    const digitDisplayContainer = document.getElementById('digit-display-container');
    if (!digitDisplayContainer) {
        console.error('Digit display container not found');
        return;
    }

    digitDisplayContainer.innerHTML = '';

    digitPercentages.forEach((percentage, digit) => {
        const digitContainer = document.createElement('div');
        digitContainer.classList.add('digit-container');

        const digitCircle = document.createElement('div');
        digitCircle.classList.add('digit-circle');
        digitCircle.textContent = digit;

        // Apply current digit indicator (red triangle only, no green circle)
        if (digit === currentDigit) {
            const indicator = document.createElement('div');
            indicator.classList.add('current-indicator');
            digitContainer.appendChild(indicator);
        }

        // Apply frequency-based color coding (independent of current digit)
        if (digit === mostAppearing) {
            digitCircle.classList.add('most-appearing');        // Green
        } else if (digit === secondMostAppearing) {
            digitCircle.classList.add('second-most-appearing'); // Blue
        } else if (digit === leastAppearing) {
            digitCircle.classList.add('least-appearing');       // Red
        } else if (digit === secondLeastAppearing) {
            digitCircle.classList.add('second-least-appearing'); // Orange
        }

        const percentageText = document.createElement('div');
        percentageText.classList.add('digit-percentage');
        percentageText.textContent = `${percentage.toFixed(1)}%`;

        digitContainer.appendChild(digitCircle);
        digitContainer.appendChild(percentageText);
        digitDisplayContainer.appendChild(digitContainer);
    });
}

// Update analysis rows
function updateAnalysisRows() {
    updateEvenOddAnalysis();
    updateOverUnderAnalysis();
    updateMatchesDiffersAnalysis();
}

// Update Even/Odd analysis
function updateEvenOddAnalysis() {
    const digitCounts = new Array(10).fill(0);
    tickHistory.forEach(tick => {
        const lastDigit = getLastDigit(tick.quote);
        digitCounts[lastDigit]++;
    });

    const evenCount = digitCounts.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);
    const oddCount = digitCounts.filter((_, i) => i % 2 !== 0).reduce((a, b) => a + b, 0);
    const total = tickHistory.length;

    if (total === 0) return;

    const evenPercentage = ((evenCount / total) * 100).toFixed(1);
    const oddPercentage = ((oddCount / total) * 100).toFixed(1);

    // Update progress bars
    const evenProgress = document.getElementById('even-progress');
    const oddProgress = document.getElementById('odd-progress');
    if (evenProgress) evenProgress.style.width = `${evenPercentage}%`;
    if (oddProgress) oddProgress.style.width = `${oddPercentage}%`;

    // Update values
    const evenValue = document.getElementById('even-value');
    const oddValue = document.getElementById('odd-value');
    const evenPercent = document.getElementById('even-percent');
    const oddPercent = document.getElementById('odd-percent');
    
    if (evenValue) evenValue.textContent = evenCount;
    if (oddValue) oddValue.textContent = oddCount;
    if (evenPercent) evenPercent.textContent = `(${evenPercentage}%)`;
    if (oddPercent) oddPercent.textContent = `(${oddPercentage}%)`;

    // Update recent indicators
    updateRecentEvenOdd();
}

// Update recent Even/Odd indicators
function updateRecentEvenOdd() {
    const recentContainer = document.getElementById('recent-even-odd');
    if (!recentContainer) return;

    const recentTicks = tickHistory.slice(-20); // Show last 20
    recentContainer.innerHTML = '';

    recentTicks.forEach(tick => {
        const digit = getLastDigit(tick.quote);
        const dot = document.createElement('div');
        dot.classList.add('indicator-dot');
        dot.classList.add(digit % 2 === 0 ? 'even' : 'odd');
        recentContainer.appendChild(dot);
    });
}

// Update Over/Under analysis
function updateOverUnderAnalysis() {
    if (tickHistory.length < 2) return;

    let underCount = 0;
    let overCount = 0;
    let equalCount = 0;

    for (let i = 1; i < tickHistory.length; i++) {
        const current = tickHistory[i].quote;
        const previous = tickHistory[i - 1].quote;

        if (current > previous) {
            overCount++;
        } else if (current < previous) {
            underCount++;
        } else {
            equalCount++;
        }
    }

    const total = tickHistory.length - 1;
    const underPercentage = ((underCount / total) * 100).toFixed(1);
    const overPercentage = ((overCount / total) * 100).toFixed(1);
    const equalPercentage = ((equalCount / total) * 100).toFixed(1);

    // Update progress bars
    const underProgress = document.getElementById('under-progress');
    const overProgress = document.getElementById('over-progress');
    if (underProgress) underProgress.style.width = `${underPercentage}%`;
    if (overProgress) overProgress.style.width = `${overPercentage}%`;

    // Update values
    const underValue = document.getElementById('under-value');
    const overValue = document.getElementById('over-value');
    const equalValue = document.getElementById('equal-value');
    const underPercent = document.getElementById('under-percent');
    const overPercent = document.getElementById('over-percent');
    const equalPercent = document.getElementById('equal-percent');
    
    if (underValue) underValue.textContent = underCount;
    if (overValue) overValue.textContent = overCount;
    if (equalValue) equalValue.textContent = equalCount;
    if (underPercent) underPercent.textContent = `(${underPercentage}%)`;
    if (overPercent) overPercent.textContent = `(${overPercentage}%)`;
    if (equalPercent) equalPercent.textContent = `(${equalPercentage}%)`;
}

// Update Matches/Differs analysis
function updateMatchesDiffersAnalysis() {
    if (tickHistory.length < 2) return;

    let matchesCount = 0;
    let differsCount = 0;

    for (let i = 1; i < tickHistory.length; i++) {
        const currentDigit = getLastDigit(tickHistory[i].quote);
        const previousDigit = getLastDigit(tickHistory[i - 1].quote);

        if (currentDigit === previousDigit) {
            matchesCount++;
        } else {
            differsCount++;
        }
    }

    const total = tickHistory.length - 1;
    const matchesPercentage = ((matchesCount / total) * 100).toFixed(1);
    const differsPercentage = ((differsCount / total) * 100).toFixed(1);

    // Update progress bars
    const matchesProgress = document.getElementById('matches-progress');
    const differsProgress = document.getElementById('differs-progress');
    if (matchesProgress) matchesProgress.style.width = `${matchesPercentage}%`;
    if (differsProgress) differsProgress.style.width = `${differsPercentage}%`;

    // Update values
    const matchesValue = document.getElementById('matches-value');
    const differsValue = document.getElementById('differs-value');
    const matchesPercent = document.getElementById('matches-percent');
    const differsPercent = document.getElementById('differs-percent');
    
    if (matchesValue) matchesValue.textContent = matchesCount;
    if (differsValue) differsValue.textContent = differsCount;
    if (matchesPercent) matchesPercent.textContent = `(${matchesPercentage}%)`;
    if (differsPercent) differsPercent.textContent = `(${differsPercentage}%)`;
}

// Copy functionality for analysis rows
function setupCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            let textToCopy = '';

            switch (index) {
                case 0: // Even/Odd
                    const evenValue = document.getElementById('even-value')?.textContent || '0';
                    const oddValue = document.getElementById('odd-value')?.textContent || '0';
                    const evenPercent = document.getElementById('even-percent')?.textContent || '(0%)';
                    const oddPercent = document.getElementById('odd-percent')?.textContent || '(0%)';
                    textToCopy = `Even/Odd Analysis:\nEven: ${evenValue} ${evenPercent}\nOdd: ${oddValue} ${oddPercent}`;
                    break;
                case 1: // Over/Under
                    const underValue = document.getElementById('under-value')?.textContent || '0';
                    const overValue = document.getElementById('over-value')?.textContent || '0';
                    const equalValue = document.getElementById('equal-value')?.textContent || '0';
                    const underPercent = document.getElementById('under-percent')?.textContent || '(0%)';
                    const overPercent = document.getElementById('over-percent')?.textContent || '(0%)';
                    const equalPercent = document.getElementById('equal-percent')?.textContent || '(0%)';
                    textToCopy = `Over/Under Analysis:\nUnder: ${underValue} ${underPercent}\nEqual: ${equalValue} ${equalPercent}\nOver: ${overValue} ${overPercent}`;
                    break;
                case 2: // Matches/Differs
                    const matchesValue = document.getElementById('matches-value')?.textContent || '0';
                    const differsValue = document.getElementById('differs-value')?.textContent || '0';
                    const matchesPercent = document.getElementById('matches-percent')?.textContent || '(0%)';
                    const differsPercent = document.getElementById('differs-percent')?.textContent || '(0%)';
                    textToCopy = `Matches/Differs Analysis:\nMatches: ${matchesValue} ${matchesPercent}\nDiffers: ${differsValue} ${differsPercent}`;
                    break;
            }

            if (navigator.clipboard) {
                navigator.clipboard
                    .writeText(textToCopy)
                    .then(() => {
                        button.textContent = 'Copied!';
                        setTimeout(() => {
                            button.textContent = 'Copy';
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy text: ', err);
                        // Fallback for older browsers
                        fallbackCopyTextToClipboard(textToCopy, button);
                    });
            } else {
                // Fallback for older browsers
                fallbackCopyTextToClipboard(textToCopy, button);
            }
        });
    });
}

// Fallback copy function for older browsers
function fallbackCopyTextToClipboard(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = 'Copy';
            }, 2000);
        }
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }
    
    document.body.removeChild(textArea);
}

// Event listeners for controls
function setupEventListeners() {
    // Symbol selection
    const symbolSelect = document.getElementById('symbol-select');
    if (symbolSelect) {
        symbolSelect.addEventListener('change', function (event) {
            currentSymbol = event.target.value;
            tickHistory = [];
            console.log(`Switching to symbol: ${currentSymbol}`);
            startWebSocket();
        });
    }

    // Tick count input
    const tickCountInput = document.getElementById('tick-count-input');
    if (tickCountInput) {
        tickCountInput.addEventListener('change', function (event) {
            const newTickCount = parseInt(event.target.value, 10);
            if (newTickCount > 0 && newTickCount <= 5000) {
                tickCount = newTickCount;
                tickHistory = [];
                console.log(`Changing tick count to: ${tickCount}`);
                startWebSocket();
            } else {
                console.warn('Tick count must be between 1 and 5000');
                event.target.value = tickCount; // Reset to current value
            }
        });
    }

    // Setup copy buttons
    setupCopyButtons();
    
    // Manual reconnect button
    const reconnectBtn = document.getElementById('reconnect-btn');
    if (reconnectBtn) {
        reconnectBtn.addEventListener('click', () => {
            console.log('Manual reconnect requested');
            reconnectAttempts = 0;
            startWebSocket();
        });
    }
}

// Initialize the application
function init() {
    console.log('Initializing Market Analysis Tool...');
    setupEventListeners();
    startWebSocket();
    
    // Add periodic health check
    setInterval(() => {
        if (derivWs && derivWs.readyState === WebSocket.OPEN) {
            // Send a ping to keep connection alive
            derivWs.send(JSON.stringify({ ping: 1 }));
        }
    }, 30000); // Every 30 seconds
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);