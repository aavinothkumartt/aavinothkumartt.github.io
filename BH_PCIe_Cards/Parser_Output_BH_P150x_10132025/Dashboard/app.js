/* BH PCIe Cards Dashboard JavaScript - PERFECT VERSION */

// Global chart instances
let statusChart, yieldHittersAffectedUnitsChart, yieldHittersFailureCountsChart;
let modelDistributionChart, modelYieldChart, categoryDistributionChart;
let jiraCharts = {};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing BH PCIe Cards Dashboard - PERFECT VERSION...');

    if (typeof window.dashboardData === 'undefined') {
        console.error('Dashboard data not available!');
        return;
    }

    console.log('Dashboard data:', window.dashboardData);

    try {
        initializeCharts();
        populateJiraAnalysis();
        console.log('Dashboard initialization complete!');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
});

function initializeCharts() {
    console.log('Initializing charts...');

    createStatusChart();
    createYieldHittersAffectedUnitsChart();
    createYieldHittersFailureCountsChart();
    createModelDistributionChart();
    createModelYieldChart();
    createCategoryDistributionChart();
}

function createStatusChart() {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;

    const statusData = window.dashboardData.status_distribution;

    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusData),
            datasets: [{
                data: Object.values(statusData),
                backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
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
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    position: 'bottom',
                    labels: { font: { size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label;
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} units (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '50%'
        }
    });
}

function createYieldHittersAffectedUnitsChart() {
    const ctx = document.getElementById('yieldHittersAffectedUnitsChart');
    if (!ctx) return;

    const data = window.dashboardData.yield_hitters;
    const labels = data.map(item => item.jira_entry);
    const values = data.map(item => item.affected_units);

    yieldHittersAffectedUnitsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Affected Units',
                data: values,
                backgroundColor: '#0066cc',
                borderColor: '#004499',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: 'Yield Hitters - Affected Units (Yield Impact)',
                    font: { size: 14, weight: 'bold' }
                },
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: { display: true, text: 'Number of Affected Units' }
                }
            }
        }
    });
}

function createYieldHittersFailureCountsChart() {
    const ctx = document.getElementById('yieldHittersFailureCountsChart');
    if (!ctx) return;

    const data = window.dashboardData.yield_hitters;
    const labels = data.map(item => item.jira_entry);
    const values = data.map(item => item.failure_counts);

    yieldHittersFailureCountsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Failure Counts',
                data: values,
                backgroundColor: '#dc3545',
                borderColor: '#c82333',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: 'Yield Hitters - Failure Counts (JIRA-Specific Analysis)',
                    font: { size: 14, weight: 'bold' }
                },
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: { display: true, text: 'Number of JIRA-Specific Failures' }
                }
            }
        }
    });
}

function createModelDistributionChart() {
    const ctx = document.getElementById('modelDistributionChart');
    if (!ctx) return;

    const modelData = window.dashboardData.overall_distributions.model_distribution;
    console.log('Model distribution data:', modelData);

    modelDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(modelData),
            datasets: [{
                data: Object.values(modelData),
                backgroundColor: ['#0066cc', '#28a745', '#ffc107', '#dc3545'],
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
                    text: 'Model Distribution (All Units)',
                    font: { size: 14, weight: 'bold' }
                },
                legend: { position: 'bottom' }
            }
        }
    });
}

function createModelYieldChart() {
    const ctx = document.getElementById('modelYieldChart');
    if (!ctx) return;

    const modelStatusData = window.dashboardData.overall_distributions.model_status_distribution;
    const models = Object.keys(modelStatusData);
    const yieldRates = models.map(model => modelStatusData[model].yield_rate);

    modelYieldChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: models,
            datasets: [{
                label: 'Yield Rate (%)',
                data: yieldRates,
                backgroundColor: '#28a745',
                borderColor: '#1e7e34',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Yield Rate by Model',
                    font: { size: 14, weight: 'bold' }
                },
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: { display: true, text: 'Yield Rate (%)' }
                }
            }
        }
    });
}

function createCategoryDistributionChart() {
    const ctx = document.getElementById('categoryDistributionChart');
    if (!ctx) return;

    const categoryData = window.dashboardData.overall_distributions.category_distribution;

    categoryDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                data: Object.values(categoryData),
                backgroundColor: ['#0066cc', '#dc3545', '#ffc107', '#28a745', '#6f42c1'],
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
                    text: 'Failure Category Distribution',
                    font: { size: 14, weight: 'bold' }
                },
                legend: { position: 'bottom' }
            },
            cutout: '40%'
        }
    });
}

function populateJiraAnalysis() {
    const container = document.getElementById('jiraAnalysisContainer');
    const yieldHitters = window.dashboardData.yield_hitters;

    console.log('Populating JIRA analysis with PERFECT support:', yieldHitters);

    if (!yieldHitters || yieldHitters.length === 0) {
        container.innerHTML = '<p>No JIRA analysis data available.</p>';
        return;
    }

    let html = '';
    yieldHitters.forEach((item, index) => {
        if (item.has_test_data && item.affected_units > 0) {
            html += createJiraAnalysisCard(item, index);
        }
    });

    container.innerHTML = html;

    // Initialize charts for each JIRA item
    setTimeout(() => {
        yieldHitters.forEach((item, index) => {
            if (item.has_test_data && item.affected_units > 0) {
                createJiraCharts(item, index);
            }
        });
    }, 100);
}

function createJiraAnalysisCard(item, index) {
    const insightsHtml = createInsightsHtml(item.summary_insights || []);
    const issueDescriptionHtml = item.issue_description ? 
        `<div class="jira-issue-description"><strong>Issue Description:</strong> ${item.issue_description}</div>` : '';

    return `
        <div class="jira-analysis-card">
            <div class="jira-card-header" onclick="toggleJiraCard(${index})">
                <div class="jira-header-content">
                    <h3 class="jira-title">${item.jira_entry}</h3>
                    <div class="jira-stats">
                        <div class="jira-stat units">Units: ${item.affected_units}</div>
                        <div class="jira-stat failures">Failures: ${item.failure_counts}</div>
                        <div class="jira-stat rate">Rate: ${item.failure_rate}</div>
                    </div>
                </div>
            </div>

            <div class="jira-card-content" id="jiraContent${index}">
                <div class="jira-content-inner">
                    ${issueDescriptionHtml}
                    <div class="jira-description">${item.description}</div>

                    <div class="jira-charts-grid">
                        <div class="mini-chart-container">
                            <canvas id="modelChart${index}"></canvas>
                        </div>
                        <div class="mini-chart-container">
                            <canvas id="asicChart${index}"></canvas>
                        </div>
                        <div class="mini-chart-container">
                            <canvas id="ethChart${index}"></canvas>
                        </div>
                        <div class="mini-chart-container">
                            <canvas id="controllerChart${index}"></canvas>
                        </div>
                    </div>

                    ${createHeatmapsHtml(item, index)}

                    ${insightsHtml}
                </div>
            </div>
        </div>
    `;
}

function createHeatmapsHtml(item, index) {
    let html = '';

    console.log(`Creating heatmaps for ${item.jira_entry}:`, {
        asic_eth: item.asic_eth_heatmap,
        asic_controller: item.asic_controller_heatmap
    });

    // ASIC-ETH Heatmap - PERFECT condition
    if (item.asic_eth_heatmap && item.asic_eth_heatmap.row_labels && item.asic_eth_heatmap.row_labels.length > 0) {
        html += `
            <div class="heatmap-container">
                <div class="heatmap-title">ASIC vs ETH Port Failure Counts (${item.jira_entry} Specific)</div>
                <div id="asicEthHeatmap${index}"></div>
            </div>
        `;
    } else {
        console.log(`No ASIC-ETH heatmap data for ${item.jira_entry} (expected for non-ETH issues)`);
    }

    // ASIC-Controller Heatmap - PERFECT condition with DDR support
    if (item.asic_controller_heatmap && item.asic_controller_heatmap.row_labels && item.asic_controller_heatmap.row_labels.length > 0) {
        html += `
            <div class="heatmap-container">
                <div class="heatmap-title">ASIC vs DDR Controller Failure Counts (${item.jira_entry} Specific)</div>
                <div id="asicControllerHeatmap${index}"></div>
            </div>
        `;
    } else {
        console.log(`No ASIC-Controller heatmap data for ${item.jira_entry} (expected for non-DDR issues)`);
    }

    return html;
}

function createJiraCharts(item, index) {
    console.log(`Creating PERFECT charts for ${item.jira_entry}:`, {
        model_data: item.model_chart_data,
        asic_data: item.asic_chart_data,
        eth_data: item.eth_chart_data,
        controller_data: item.controller_chart_data
    });

    // Model Chart - PERFECT labels (just P300a, P300b, P300c)
    if (item.model_chart_data && item.model_chart_data.labels && item.model_chart_data.labels.length > 0) {
        const ctx = document.getElementById(`modelChart${index}`);
        if (ctx) {
            jiraCharts[`model${index}`] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: item.model_chart_data.labels,
                    datasets: [{
                        label: 'Count',
                        data: item.model_chart_data.data,
                        backgroundColor: '#0066cc'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: { display: true, text: `Model Distribution (${item.jira_entry})` },
                        legend: { display: false }
                    }
                }
            });
        }
    } else {
        console.log(`No model chart data for ${item.jira_entry}`);
    }

    // ASIC Chart - PERFECT with fixed pattern support
    if (item.asic_chart_data && item.asic_chart_data.labels && item.asic_chart_data.labels.length > 0) {
        const ctx = document.getElementById(`asicChart${index}`);
        if (ctx) {
            jiraCharts[`asic${index}`] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: item.asic_chart_data.labels,
                    datasets: [{
                        label: 'Count',
                        data: item.asic_chart_data.data,
                        backgroundColor: '#28a745'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: { display: true, text: `ASIC Distribution (${item.jira_entry})` },
                        legend: { display: false }
                    }
                }
            });
        }
    } else {
        console.log(`No ASIC chart data for ${item.jira_entry} (this was the fixed issue)`);
    }

    // ETH Chart
    if (item.eth_chart_data && item.eth_chart_data.labels && item.eth_chart_data.labels.length > 0) {
        const ctx = document.getElementById(`ethChart${index}`);
        if (ctx) {
            jiraCharts[`eth${index}`] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: item.eth_chart_data.labels,
                    datasets: [{
                        label: 'Count',
                        data: item.eth_chart_data.data,
                        backgroundColor: '#ffc107'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: { display: true, text: `ETH Port Distribution (${item.jira_entry})` },
                        legend: { display: false }
                    }
                }
            });
        }
    } else {
        console.log(`No ETH chart data for ${item.jira_entry} (expected for non-ETH issues)`);
    }

    // Controller Chart - PERFECT with DDR support
    if (item.controller_chart_data && item.controller_chart_data.labels && item.controller_chart_data.labels.length > 0) {
        const ctx = document.getElementById(`controllerChart${index}`);
        if (ctx) {
            jiraCharts[`controller${index}`] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: item.controller_chart_data.labels,
                    datasets: [{
                        label: 'Count',
                        data: item.controller_chart_data.data,
                        backgroundColor: '#dc3545'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: { display: true, text: `DDR Controller Distribution (${item.jira_entry})` },
                        legend: { display: false }
                    }
                }
            });
        }
    } else {
        console.log(`No controller chart data for ${item.jira_entry} (expected for non-DDR issues)`);
    }

    // Create Heatmaps
    setTimeout(() => {
        createHeatmap(item.asic_eth_heatmap, `asicEthHeatmap${index}`);
        createHeatmap(item.asic_controller_heatmap, `asicControllerHeatmap${index}`);
    }, 50);
}

function createHeatmap(heatmapData, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !heatmapData || !heatmapData.row_labels || heatmapData.row_labels.length === 0) {
        console.log(`Heatmap skipped for ${containerId}: No data (expected for non-matching issue types)`);
        return;
    }

    const { row_labels, col_labels, matrix, max_value } = heatmapData;

    console.log(`Creating PERFECT heatmap ${containerId}:`, { row_labels, col_labels, matrix, max_value });

    // Create heatmap HTML
    let html = '<div class="heatmap">';

    // Header row
    html += '<div class="heatmap-cell header"></div>'; // Top-left empty cell
    col_labels.forEach(col => {
        html += `<div class="heatmap-cell header">${col}</div>`;
    });

    // Data rows
    matrix.forEach((row, rowIndex) => {
        html += `<div class="heatmap-cell header">${row_labels[rowIndex]}</div>`;
        row.forEach(value => {
            const intensity = max_value > 0 ? (value / max_value) : 0;
            const bgColor = intensity > 0 ? `rgba(0, 102, 204, ${0.2 + intensity * 0.8})` : '#f8f9fa';
            html += `<div class="heatmap-cell value" style="background-color: ${bgColor}">${value}</div>`;
        });
    });

    html += '</div>';

    // Set grid template columns
    const gridCols = 1 + col_labels.length; // +1 for row headers
    container.innerHTML = html;
    const heatmapEl = container.querySelector('.heatmap');
    if (heatmapEl) {
        heatmapEl.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
    }

    console.log(`PERFECT heatmap ${containerId} created successfully`);
}

function createInsightsHtml(insights) {
    if (!insights || insights.length === 0) return '';

    let html = '<div class="insights">';
    insights.forEach(insight => {
        html += `
            <div class="insight-card severity-${insight.severity}">
                <div class="insight-title">${insight.title}</div>
                <div class="insight-description">${insight.description}</div>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

function toggleJiraCard(index) {
    const content = document.getElementById(`jiraContent${index}`);
    if (content) {
        content.classList.toggle('expanded');
    }
}
