// Yield Analysis Dashboard JavaScript v4.5 FAILURES ONLY (NO UNITS TOGGLE)
// Removed "Units" toggle button, showing only failures in bar charts

// Global chart instances
let statusChart;
let yieldHittersChart;
        let apyAffectedUnitsChart;
let yieldHittersAffectedUnitsChart;
let jiraCharts = {};


// Simple Intelligent Default Tab Selection
function getIntelligentDefaultTab(insights) {
    if (!insights || insights.length === 0) return 'summary';
    for (const insight of insights) {
        if (insight.severity === 'critical') {
            const title = insight.title.toLowerCase();
            if (title.includes('ubb')) return 'ubb';
            if (title.includes('asic')) return 'asic';
            if (title.includes('ctrl') || title.includes('controller')) return 'controller';  
            if (title.includes('eth')) return 'eth';
        }
    }
    return 'summary';
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    populateFailuresOnlyJiraAnalysis();
});

function initializeCharts() {
    createStatusChart();
    createYieldHittersAffectedUnitsChart();
            createAPYAffectedUnitsChart();  // New chart for affected units
    createYieldHittersChart();
}

function createStatusChart() {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;
    
    const statusData = window.dashboardData.status_distribution;
    
    statusChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(statusData),
            datasets: [{
                data: Object.values(statusData),
                backgroundColor: [
                    '#2ecc71',  // Passed - Green
                    '#f1c40f',  // Fixed - Yellow  
                    '#e74c3c'   // Failed - Red
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Test Status Distribution',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} units (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createYieldHittersChart() {
    const ctx = document.getElementById('yieldHittersChart');
    if (!ctx) return;
    
    const chartData = prepareYieldHittersChartData();
    
    yieldHittersChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Failure Count',
                data: chartData.values,
                backgroundColor: '#e74c3c',  // Red color for failure counts
                borderWidth: 1,
                borderColor: '#c0392b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: 'FPY Hitters - Failure Counts',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.x;
                            return `Failure Count: ${value}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Failure Count'
                    }
                }
            }
        }
    });
}
function createYieldHittersAffectedUnitsChart() {
    const ctx = document.getElementById('yieldHittersAffectedUnitsChart');
    if (!ctx) return;

    const chartData = prepareYieldHittersAffectedUnitsChartData();

    yieldHittersAffectedUnitsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Affected Units',
                data: chartData.values,
                backgroundColor: '#3498db',  // Blue color for affected units
                borderWidth: 1,
                borderColor: '#2980b9'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: 'FPY Hitters - Affected Units',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.x;
                            return `Affected Units: ${value}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Affected Units'
                    }
                }
            }
        }
    });
}

        function createAPYAffectedUnitsChart() {
            const ctx = document.getElementById('apyAffectedUnitsChart');
            if (!ctx) return;

            const chartData = prepareAPYAffectedUnitsChartData();

            apyAffectedUnitsChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Failed Units (Affecting APY)',
                        data: chartData.values,
                        backgroundColor: '#e74c3c',
                        borderWidth: 1,
                        borderColor: '#c0392b'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        title: {
                            display: true,
                            text: 'APY - Affected Units (Failed Only)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed.x;
                                    return `Failed Units: ${value}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Failed Units'
                            }
                        },
                        y: {
                            ticks: {
                                autoSkip: false
                            }
                        }
                    }
                }
            });
        }

        function prepareAPYAffectedUnitsChartData() {
            const yieldHitters = dashboardData.yield_hitters;

            const sortedHitters = yieldHitters
                .filter(h => h.has_test_data && h.apy_affected_units > 0)
                .sort((a, b) => b.apy_affected_units - a.apy_affected_units);

            return {
                labels: sortedHitters.map(h => h.jira_entry || 'Unknown'),
                values: sortedHitters.map(h => h.apy_affected_units)
            };
        }



function prepareYieldHittersAffectedUnitsChartData() {
    const data = window.dashboardData.yield_hitters || [];
    const labels = [];
    const values = [];

    data.forEach((item) => {
        if (item.affected_units > 0) {
            labels.push(item.jira_entry);
            values.push(item.affected_units);  // Use affected_units
        }
    });

    return { labels, values };
}

function prepareYieldHittersChartData() {
    const data = window.dashboardData.yield_hitters || [];
    const labels = [];
    const values = [];
    
    data.forEach((item) => {
        if (item.failure_counts > 0) {
            labels.push(item.jira_entry);
            values.push(item.failure_counts);  // Use failure_counts
        }
    });
    
    return { labels, values };
}

// FAILURES ONLY JIRA ANALYSIS
function populateFailuresOnlyJiraAnalysis() {
    const container = document.getElementById('jiraCorrelationContainer');
    const yieldHitters = window.dashboardData.yield_hitters || [];
    
    if (yieldHitters.length === 0) {
        container.innerHTML = '<p>No JIRA correlation data available.</p>';
        return;
    }
    
    let html = '';
    
    yieldHitters.forEach((item, index) => {
        if (item.has_test_data && item.affected_units > 0) {
            html += createFailuresOnlyJiraCard(item, index);
        }
    });
    
    container.innerHTML = html;
    
    // Add click event listeners for dropdown functionality
    addDropdownListeners();
    
    // Initialize failure charts for each card (no units toggle)
    yieldHitters.forEach((item, index) => {
        if (item.has_test_data && item.affected_units > 0) {
            setTimeout(() => {
                initializeFailuresOnlyChartsForCard(item, index);
            }, 100);
        }
    });
}

function createFailuresOnlyJiraCard(item, index) {
    const tabsHtml = createFailuresOnlyTabsHtml(index);
    const tabContentHtml = createFailuresOnlyTabContentHtml(item, index);
    const insightsHtml = createFailuresOnlyInsightsHtml(item);
    
    return `
        <div class="jira-correlation-card">
            <div class="jira-card-header" onclick="toggleJiraCard(${index})" id="jiraHeader${index}">
                <div class="jira-header-content">
                    <h3 class="jira-title">${item.jira_entry}</h3>
                    <div class="jira-header-right">
                        <div class="jira-stats">
                            <div class="jira-stat units">Units: ${item.affected_units}</div>
                            <div class="jira-stat failures">Failures: ${item.failure_counts}</div>
                            <div class="jira-stat rate">Rate: ${item.failure_rate}</div>
                        </div>
                        <div class="jira-dropdown-arrow" id="jiraArrow${index}">▼</div>
                    </div>
                </div>
            </div>
            
            <div class="jira-card-content" id="jiraContent${index}">
                <div class="jira-content-inner">
                    <div class="jira-description">
                        ${item.description}
                    </div>
                    
                    ${tabsHtml}
                    ${tabContentHtml}
                    ${insightsHtml}
                    
                    <div class="jira-error-types">
                        <h4>Error Types</h4>
                        <div class="jira-error-badge">
                            ${item.error_types.join(', ')}
                        </div>
                    </div>
                    
                    ${item.notes ? `
                    <div class="jira-notes">
                        ${item.notes}
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function createFailuresOnlyTabsHtml(index) {
    return `
        <div class="dual-metrics-tabs">
            <button class="dual-metrics-tab active" onclick="switchFailuresOnlyTab(${index}, 'summary')">📊 Cards</button>
            <button class="dual-metrics-tab" onclick="switchFailuresOnlyTab(${index}, 'ubb')">🔷 UBB</button>
            <button class="dual-metrics-tab" onclick="switchFailuresOnlyTab(${index}, 'asic')">🔶 ASIC</button>
            <button class="dual-metrics-tab" onclick="switchFailuresOnlyTab(${index}, 'controller')">🎛️ Ctrl</button>
            <button class="dual-metrics-tab" onclick="switchFailuresOnlyTab(${index}, 'eth')">🌐 ETH</button>
            <button class="dual-metrics-tab" onclick="switchFailuresOnlyTab(${index}, 'heat-ubb-asic')">🔥 UBB-ASIC</button>
            <button class="dual-metrics-tab" onclick="switchFailuresOnlyTab(${index}, 'heat-asic-eth')">🔥 ASIC-ETH</button>
            <button class="dual-metrics-tab" onclick="switchFailuresOnlyTab(${index}, 'heat-asic-ctrl')">🔥 ASIC-CTRL</button>
            <button class="dual-metrics-tab" onclick="switchFailuresOnlyTab(${index}, 'heat-ubb-ctrl')">🔥 UBB-CTRL</button>
            <button class="dual-metrics-tab" onclick="switchFailuresOnlyTab(${index}, 'heat-ubb-eth')">🔥 UBB-ETH</button>
            <button class="dual-metrics-tab" onclick="switchFailuresOnlyTab(${index}, 'heat-ctrl-eth')"></button>
        </div>
    `;
}

function createFailuresOnlyTabContentHtml(item, index) {
    let html = '';
    
    // Summary Tab (Default Active)
    const defaultTab = getIntelligentDefaultTab(item.summaryinsights || item.insights);
    html += `<div class="dual-metrics-tab-content ${defaultTab === 'summary' ? 'active' : ''}" id="summary-${index}">`;
    html += createFailuresOnlyVisualCardsHtml(item.visual_cards || []);
    html += '</div>';
    
    // UBB Distribution Tab - FAILURES ONLY (NO TOGGLE)
    html += `<div class="dual-metrics-tab-content" id="ubb-${index}">`;
    html += `<div class="dual-chart-container">
                <h4>UBB Distribution - Failures</h4>
                <canvas id="ubbChart${index}" width="280" height="200"></canvas>
             </div>`;
    html += '</div>';
    
    // ASIC Distribution Tab - FAILURES ONLY (NO TOGGLE)
    html += `<div class="dual-metrics-tab-content" id="asic-${index}">`;
    html += `<div class="dual-chart-container">
                <h4>ASIC Distribution - Failures</h4>
                <canvas id="asicChart${index}" width="280" height="200"></canvas>
             </div>`;
    html += '</div>';
    
    // Controller Distribution Tab - FAILURES ONLY (NO TOGGLE)
    html += `<div class="dual-metrics-tab-content" id="controller-${index}">`;
    html += `<div class="dual-chart-container">
                <h4>Controller Distribution - Failures</h4>
                <canvas id="controllerChart${index}" width="280" height="200"></canvas>
             </div>`;
    html += '</div>';
    
    // ETH Distribution Tab - FAILURES ONLY (NO TOGGLE)
    html += `<div class="dual-metrics-tab-content" id="eth-${index}">`;
    html += `<div class="dual-chart-container">
                <h4>Ethernet Distribution - Failures</h4>
                <canvas id="ethChart${index}" width="280" height="200"></canvas>
             </div>`;
    html += '</div>';
    
    // Heat Map Tabs with dual metrics still available (Units vs Failures)
    html += `<div class="dual-metrics-tab-content" id="heat-ubb-asic-${index}">`;
    html += createHeatMapToggleHtml(index, 'ubb-asic', item.heat_map_ubb_asic_units || {}, item.heat_map_ubb_asic_failures || {});
    html += '</div>';
    
    html += `<div class="dual-metrics-tab-content" id="heat-asic-eth-${index}">`;
    html += createHeatMapToggleHtml(index, 'asic-eth', item.heat_map_asic_eth_units || {}, item.heat_map_asic_eth_failures || {});
    html += '</div>';
    
    html += `<div class="dual-metrics-tab-content" id="heat-asic-ctrl-${index}">`;
    html += createHeatMapToggleHtml(index, 'asic-ctrl', item.heat_map_asic_controller_units || {}, item.heat_map_asic_controller_failures || {});
    html += '</div>';
    
    html += `<div class="dual-metrics-tab-content" id="heat-ubb-ctrl-${index}">`;
    html += createHeatMapToggleHtml(index, 'ubb-ctrl', item.heat_map_ubb_controller_units || {}, item.heat_map_ubb_controller_failures || {});
    html += '</div>';

    html += `<div class="dual-metrics-tab-content" id="heat-ubb-eth-${index}">`;
    html += createHeatMapToggleHtml(index, 'ubb-eth', item.heat_map_ubb_eth_units || {}, item.heat_map_ubb_eth_failures || {});
    html += '</div>';

    html += `<div class="dual-metrics-tab-content" id="heat-ctrl-eth-${index}">`;
    html += createHeatMapToggleHtml(index, 'ctrl-eth', item.heat_map_ctrl_eth_units || {}, item.heat_map_ctrl_eth_failures || {});
    html += '</div>';
    
    return html;
}

function createHeatMapToggleHtml(index, type, unitsData, failuresData) {
    // Heat maps still have toggle functionality
    return `
        <div class="dual-heat-map-container">
            
            <div id="${index}" style="display: none;">${createHeatMapHtml(unitsData)}</div>
            <div id="heatMap${type}-failures-${index}">${createHeatMapHtml(failuresData)}</div>
        </div>
    `;
}

function createFailuresOnlyVisualCardsHtml(item) {
    return '';
}

function createHeatMapHtml(heatMapData) {
    if (!heatMapData.matrix || heatMapData.matrix.length === 0 || heatMapData.row_count === 0) {
        return '<div class="dual-heat-map-container"><p>No data available for this heat map</p></div>';
    }
    
    let html = `
        <div class="dual-heat-map-title">${heatMapData.title}</div>
        <div class="heat-map-with-labels">
            <div class="heat-map-row-labels">
    `;
    
    // Add row labels
    heatMapData.row_labels.forEach(label => {
        html += `<div class="heat-map-row-label">${label}</div>`;
    });
    
    html += `
            </div>
            <div class="heat-map-matrix-container">
                <div class="heat-map-col-labels">
    `;
    
    // Add column labels
    const colLabels = heatMapData.clean_col_labels || heatMapData.col_labels || [];
    colLabels.forEach(label => {
        html += `<div class="heat-map-col-label">${label}</div>`;
    });
    
    html += `
                </div>
                <div class="heat-map-grid">
    `;
    
    // Add matrix cells
    heatMapData.matrix.forEach(row => {
        html += '<div class="heat-map-row">';
        row.forEach(cell => {
            const intensity = Math.floor(cell.intensity * 5);
            const tooltip = `${cell.row_label} + ${cell.col_label}: ${cell.value}`;
            html += `
                <div class="heat-map-cell intensity-${intensity}" 
                     title="${tooltip}"
                     data-value="${cell.value}">
                    ${cell.value > 0 ? cell.value : ''}
                </div>
            `;
        });
        html += '</div>';
    });
    
    html += `
                </div>
            </div>
        </div>
        <div class="heat-map-legend">
            <span>0</span>
            <span>Max: ${heatMapData.max_value}</span>
        </div>
    `;
    
    return html;
}

function createFailuresOnlyInsightsHtml(item) {
    if (!item.summary_insights || item.summary_insights.length === 0) {
        return '';
    }
    
    let html = '<div class="dual-summary-insights">';
    
    item.summary_insights.forEach(insight => {
        html += `
            <div class="dual-insight-card severity-${insight.severity}">
                <div class="dual-insight-header">
                    <span class="dual-insight-icon">${insight.icon}</span>
                    <span class="dual-insight-title">${insight.title}</span>
                </div>
                <div class="dual-insight-description">${insight.description}</div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

function switchFailuresOnlyTab(cardIndex, tabType) {
    // Remove active class from all tabs and content for this card
    const tabs = document.querySelectorAll(`#jiraContent${cardIndex} .dual-metrics-tab`);
    const contents = document.querySelectorAll(`#jiraContent${cardIndex} .dual-metrics-tab-content`);
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    event.target.classList.add('active');
    document.getElementById(`${tabType}-${cardIndex}`).classList.add('active');
}

function toggleHeatMap(type, index, metricType) {
    // Simplified: Only show failures heat maps (Units toggle removed)
    const failuresMap = document.getElementById(`heatMap${type}-failures-${index}`);

    if (failuresMap) {
        // Always show failures map (no toggle needed)
        failuresMap.style.display = 'block';
    }

    // Update any remaining toggle buttons to show active state for failures
    const toggleBtns = document.querySelectorAll(`#heat-${type}-toggle-${index} .dual-toggle-btn`);
    toggleBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes('Failures')) {
            btn.classList.add('active');
        }
    });
}

function initializeFailuresOnlyChartsForCard(item, index) {
    // Create all FAILURES-ONLY charts for the card
    setTimeout(() => {
        createFailuresOnlyUBBChart(index, item);
        createFailuresOnlyASICChart(index, item);
        createFailuresOnlyControllerChart(index, item);
        createFailuresOnlyETHChart(index, item);
    }, 200);
}

function createFailuresOnlyUBBChart(index, item) {
    const ctx = document.getElementById(`ubbChart${index}`);
    if (!ctx) return;
    
    const labels = item.ubb_sorted_keys || [];
    
    // Always use failures (no toggle)
    const dataValues = labels.map(key => item.ubb_distribution_failures[key] || 0);
    const percentageValues = labels.map(key => item.ubb_percentages_failures[key] || 0);
    
    // Calculate flexible max for Y-axis
    const maxPercentage = Math.max(...percentageValues);
    const flexiblePercentageMax = Math.ceil(maxPercentage * 1.1) || 1;
    
    // Destroy existing chart if it exists
    if (jiraCharts[`ubb${index}`]) {
        jiraCharts[`ubb${index}`].destroy();
    }
    
    jiraCharts[`ubb${index}`] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Percentage (%)',
                data: percentageValues,
                backgroundColor: '#e74c3c',  // Red for failures
                borderColor: '#c0392b',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const count = dataValues[index];
                            const percentage = percentageValues[index];
                            return `${context.label}: ${count} failures (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: flexiblePercentageMax,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    }
                }
            }
        }
    });
}

function createFailuresOnlyASICChart(index, item) {
    const ctx = document.getElementById(`asicChart${index}`);
    if (!ctx) return;
    
    const labels = item.asic_sorted_keys || [];
    
    // Always use failures (no toggle)
    const dataValues = labels.map(key => item.asic_distribution_failures[key] || 0);
    const percentageValues = labels.map(key => item.asic_percentages_failures[key] || 0);
    
    // Calculate flexible max for Y-axis
    const maxPercentage = Math.max(...percentageValues);
    const flexiblePercentageMax = Math.ceil(maxPercentage * 1.1) || 1;
    
    // Destroy existing chart if it exists
    if (jiraCharts[`asic${index}`]) {
        jiraCharts[`asic${index}`].destroy();
    }
    
    jiraCharts[`asic${index}`] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Percentage (%)',
                data: percentageValues,
                backgroundColor: '#e74c3c',  // Red for failures
                borderColor: '#c0392b',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const count = dataValues[index];
                            const percentage = percentageValues[index];
                            return `${context.label}: ${count} failures (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: flexiblePercentageMax,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    }
                }
            }
        }
    });
}

function createFailuresOnlyControllerChart(index, item) {
    const ctx = document.getElementById(`controllerChart${index}`);
    if (!ctx) return;
    
    const labels = item.controller_sorted_keys || [];
    
    if (labels.length === 0) {
        ctx.parentElement.innerHTML = '<div style="text-align: center; padding: 60px 0; color: #666;">No controller data available</div>';
        return;
    }
    
    // Always use failures (no toggle)
    const dataValues = labels.map(key => item.controller_distribution_failures[key] || 0);
    const percentageValues = labels.map(key => item.controller_percentages_failures[key] || 0);
    
    // Calculate flexible max for Y-axis
    const maxPercentage = Math.max(...percentageValues);
    const flexiblePercentageMax = Math.ceil(maxPercentage * 1.1) || 1;
    
    // Destroy existing chart if it exists
    if (jiraCharts[`controller${index}`]) {
        jiraCharts[`controller${index}`].destroy();
    }
    
    jiraCharts[`controller${index}`] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Percentage (%)',
                data: percentageValues,
                backgroundColor: '#e74c3c',  // Red for failures
                borderColor: '#c0392b',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const count = dataValues[index];
                            const percentage = percentageValues[index];
                            return `${context.label}: ${count} failures (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: flexiblePercentageMax,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    }
                }
            }
        }
    });
}

function createFailuresOnlyETHChart(index, item) {
    const ctx = document.getElementById(`ethChart${index}`);
    if (!ctx) return;
    
    const labels = item.eth_sorted_keys || [];
    
    if (labels.length === 0) {
        ctx.parentElement.innerHTML = '<div style="text-align: center; padding: 60px 0; color: #666;">No ethernet data available</div>';
        return;
    }
    
    // Always use failures (no toggle)
    const dataValues = labels.map(key => item.eth_distribution_failures[key] || 0);
    const percentageValues = labels.map(key => item.eth_percentages_failures[key] || 0);
    
    // Calculate flexible max for Y-axis
    const maxPercentage = Math.max(...percentageValues);
    const flexiblePercentageMax = Math.ceil(maxPercentage * 1.1) || 1;
    
    // Destroy existing chart if it exists
    if (jiraCharts[`eth${index}`]) {
        jiraCharts[`eth${index}`].destroy();
    }
    
    jiraCharts[`eth${index}`] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Percentage (%)',
                data: percentageValues,
                backgroundColor: '#e74c3c',  // Red for failures
                borderColor: '#c0392b',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const count = dataValues[index];
                            const percentage = percentageValues[index];
                            return `${context.label}: ${count} failures (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: flexiblePercentageMax,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    }
                }
            }
        }
    });
}

function addDropdownListeners() {
    // Initially all cards are collapsed
    const yieldHitters = window.dashboardData.yield_hitters || [];
    yieldHitters.forEach((item, index) => {
        if (item.has_test_data && item.affected_units > 0) {
            const content = document.getElementById(`jiraContent${index}`);
            if (content) {
                content.classList.remove('expanded');
            }
        }
    });
}

function toggleJiraCard(index) {
    const content = document.getElementById(`jiraContent${index}`);
    const arrow = document.getElementById(`jiraArrow${index}`);
    const header = document.getElementById(`jiraHeader${index}`);
    
    if (!content || !arrow || !header) return;
    
    const isExpanded = content.classList.contains('expanded');
    
    if (isExpanded) {
        // Collapse
        content.classList.remove('expanded');
        arrow.classList.remove('expanded');
        header.classList.remove('active');
    } else {
        // Expand
        content.classList.add('expanded');
        arrow.classList.add('expanded');
        header.classList.add('active');
    }
}

// Utility functions
function formatPercentage(value, total) {
    return total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
}

function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}