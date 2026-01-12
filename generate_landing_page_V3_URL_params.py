#!/usr/bin/env python3
"""
Manufacturing Yield Dashboard Hub Generator - V7.0
Feature: TWO-WAY Sync
- Loads deep links (Parent -> Child)
- Detects clicks inside Iframe and updates Parent URL (Child -> Parent)
"""

from pathlib import Path
import re
import json

# ==============================================================================
# 1. DATA CONFIGURATION
# ==============================================================================

# A. Trend Summaries
MAIN_TREND_DASHBOARDS = [
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/BH/Manufacturing_yield_dashboard_UBB_since_0903.html', 'BH UBB Trends'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/WH/Manufacturing_yield_dashboard_UBB_only_since_0625.html', 'WH UBB Trends'),
]

# B. UBB Single Builds (Newest first)
UBB_SINGLE_BUILDS = [
    # BlackHole UBB
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/BH/UBB_Builds/Parser_Output_BH_UBB_1210/Dashboard/dashboard.html', 'BH UBB Build 1210'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/BH/UBB_Builds/Parser_Output_BH_UBB_1022/Dashboard/dashboard.html', 'BH UBB Build 1022'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/BH/UBB_Builds/Parser_Output_BH_UBB_1015/Dashboard/dashboard.html', 'BH UBB Build 1015'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/BH/UBB_Builds/Parser_Output_BH_UBB_1001/Dashboard/dashboard.html', 'BH UBB Build 1001'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/BH/UBB_Builds/Parser_Output_BH_UBB_0924/Dashboard/dashboard.html', 'BH UBB Build 0924'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/BH/UBB_Builds/Parser_Output_BH_UBB_0917/Dashboard/dashboard.html', 'BH UBB Build 0917'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/BH/UBB_Builds/Parser_Output_BH_UBB_0903/Dashboard/dashboard.html', 'BH UBB Build 0903'),
    # WormHole UBB
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/WH/UBB_Builds/Parser_Output_WH_UBB_1225/Dashboard/dashboard.html', 'WH UBB Build 1225'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/WH/UBB_Builds/Parser_Output_WH_UBB_1223_DDR_Retest/Dashboard/dashboard.html', 'WH UBB Build 1223 DDR Retest'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/WH/UBB_Builds/Parser_Output_WH_UBB_1217/Dashboard/dashboard.html', 'WH UBB Build 1217'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/WH/UBB_Builds/Parser_Output_WH_UBB_1210/Dashboard/dashboard.html', 'WH UBB Build 1210'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/WH/UBB_Builds/Parser_Output_WH_UBB_1203/Dashboard/dashboard.html', 'WH UBB Build 1203'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/WH/UBB_Builds/Parser_Output_WH_UBB_1126/Dashboard/dashboard.html', 'WH UBB Build 1126'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/WH/UBB_Builds/Parser_Output_WH_UBB_1119/Dashboard/dashboard.html', 'WH UBB Build 1119'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/WH/UBB_Builds/Parser_Output_WH_UBB_1114/Dashboard/dashboard.html', 'WH UBB Build 1114'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/WH/UBB_Builds/Parser_Output_WH_UBB_1029/Dashboard/dashboard.html', 'WH UBB Build 1029'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/WH/UBB_Builds/Parser_Output_WH_UBB_1007_RetestIncluded/Dashboard/dashboard.html', 'WH Build 1007 (Retest Included)'),
]

# C. System Assembly Single Builds (Newest first)
SYSTEM_ASSEMBLY_SINGLE_BUILDS = [
    # WormHole System
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/WH/SystemAssembly/Parser_Output_WH_System_20260105/test_station_dashboard.html#timeline-view', 
    'WH System Build 20260105'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/WH/SystemAssembly/Parser_Output_WH_System_1217/test_station_dashboard.html', 'WH System Build 1217'),   
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/WH/SystemAssembly/Parser_Output_WH_System_1210/test_station_dashboard.html', 'WH System Build 1210'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/WH/SystemAssembly/Parser_Output_WH_System_1203/test_station_dashboard.html', 'WH System Build 1203'),
    ('https://kchoutt.github.io/Dashboard-Test/Dashboard/WH/SystemAssembly/Parser_Output_WH_System_1125/test_station_dashboard.html', 'WH System Build 1125'),
]

# D. Latest Link Rules
LATEST_RULES = {
    'latest_wh_ubb':    {'source': 'ubbBuilds', 'keywords': ['WH', 'UBB']},
    'latest_bh_ubb':    {'source': 'ubbBuilds', 'keywords': ['BH', 'UBB']},
    'latest_wh_system': {'source': 'sysBuilds', 'keywords': ['WH', 'System']},
    'latest_bh_system': {'source': 'sysBuilds', 'keywords': ['BH', 'System']},
}

# ==============================================================================
# 2. HELPER FUNCTIONS
# ==============================================================================

def generate_id(title):
    id_str = re.sub(r'[^a-zA-Z0-9]+', '_', title.lower())
    return id_str.strip('_')

def convert_to_config(dashboard_list, type_name):
    config = []
    for url, title in dashboard_list:
        clean_url = url.split('#')[0] # Clean hash
        config.append({
            'id': generate_id(title),
            'title': title,
            'url': clean_url,
            'type': type_name
        })
    return config

def find_latest_ids(config, rules):
    latest_map = {}
    for shortcut, rule in rules.items():
        source_list = config.get(rule['source'], [])
        keywords = [k.lower() for k in rule['keywords']]
        for dash in source_list:
            title_lower = dash['title'].lower()
            if all(k in title_lower for k in keywords):
                latest_map[shortcut] = dash['id']
                break 
    return latest_map

dashboard_config = {
    'mainTrends': convert_to_config(MAIN_TREND_DASHBOARDS, 'Trend'),
    'ubbBuilds': convert_to_config(UBB_SINGLE_BUILDS, 'UBB Single'),
    'sysBuilds': convert_to_config(SYSTEM_ASSEMBLY_SINGLE_BUILDS, 'System Single')
}

# ==============================================================================
# 3. HTML GENERATION
# ==============================================================================

def generate_grouped_options(dashboards):
    if not dashboards: return ""
    bh_items, wh_items, other_items = [], [], []
    for dash in dashboards:
        item_html = f'<option value="{dash["url"]}" data-id="{dash["id"]}" data-title="{dash["title"]}">{dash["title"]}</option>'
        if 'BH' in dash['title'] or 'BlackHole' in dash['title']: bh_items.append(item_html)
        elif 'WH' in dash['title'] or 'WormHole' in dash['title']: wh_items.append(item_html)
        else: other_items.append(item_html)
    
    html = ""
    if bh_items: html += '<optgroup label="BlackHole (BH)">\n' + "\n".join(bh_items) + '\n</optgroup>\n'
    if wh_items: html += '<optgroup label="WormHole (WH)">\n' + "\n".join(wh_items) + '\n</optgroup>\n'
    if other_items: html += '<optgroup label="Other">\n' + "\n".join(other_items) + '\n</optgroup>\n'
    return html

def generate_main_tabs(dashboards):
    if not dashboards: return ""
    tabs = ""
    for i, dash in enumerate(dashboards):
        tabs += f'        <button class="tab-button" data-dashboard-id="{dash["id"]}">{dash["title"]}</button>\n'
    return tabs

def generate_iframes(all_dashboards):
    iframes = ""
    for dash in all_dashboards:
        iframes += f'    <div id="tab-{dash["id"]}" class="iframe-container" style="display: none;">\n'
        iframes += f'        <iframe id="frame-{dash["id"]}" src="about:blank" data-original-src="{dash["url"]}" loading="lazy" style="width: 100%; height: 100%; border: none;"></iframe>\n'
        iframes += f'    </div>\n'
    return iframes

def generate_landing_page():
    trend_tabs = generate_main_tabs(dashboard_config['mainTrends'])
    ubb_options = generate_grouped_options(dashboard_config['ubbBuilds'])
    sys_options = generate_grouped_options(dashboard_config['sysBuilds'])
    all_dashboards = dashboard_config['mainTrends'] + dashboard_config['ubbBuilds'] + dashboard_config['sysBuilds']
    iframes = generate_iframes(all_dashboards)
    
    config_json = json.dumps(dashboard_config, indent=4)
    latest_map_json = json.dumps(find_latest_ids(dashboard_config, LATEST_RULES), indent=4)
    
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yield Dashboard Hub</title>
    <style>
        :root {{ --primary: #2563eb; --bg: #f1f5f9; --text: #1e293b; --border: #e2e8f0; }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, system-ui, sans-serif; background: var(--bg); color: var(--text); height: 100vh; display: flex; flex-direction: column; overflow: hidden; }}
        
        #control-panel {{ background: white; padding: 10px 20px; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 10px; z-index: 10; }}
        .top-row {{ display: flex; justify-content: space-between; align-items: center; gap: 20px; }}
        .section-label {{ font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 4px; }}
        .tab-button {{ padding: 8px 14px; background: #f8fafc; border: 1px solid var(--border); border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; color: #475569; }}
        .tab-button.active {{ background: var(--primary); color: white; border-color: var(--primary); }}
        .controls-right {{ display: flex; gap: 10px; align-items: flex-end; }}
        select {{ padding: 7px; border: 1px solid var(--border); border-radius: 6px; width: 180px; font-size: 13px; }}
        .action-btn {{ padding: 7px 12px; background: white; border: 1px solid var(--primary); color: var(--primary); border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; }}
        .action-btn:hover {{ background: #eff6ff; }}
        #content {{ flex-grow: 1; position: relative; background: white; }}
        .iframe-container {{ width: 100%; height: 100%; position: absolute; top: 0; left: 0; }}
        #current-info {{ text-align: center; font-size: 13px; color: var(--primary); background: #eff6ff; padding: 5px; border-radius: 4px; border: 1px solid #dbeafe; }}
    </style>
</head>
<body>
    <div id="control-panel">
        <div class="top-row">
            <div><span class="section-label">Accumulated Trends</span><div style="display:flex; gap:5px;">{trend_tabs}</div></div>
            <div class="controls-right">
                <div><span class="section-label">UBB Build</span><select id="ubb-dropdown"><option value="">Select...</option>{ubb_options}</select></div>
                <div><span class="section-label">System Build</span><select id="sys-dropdown"><option value="">Select...</option>{sys_options}</select></div>
                <div><span class="section-label">&nbsp;</span><button class="action-btn" id="copy-btn">🔗 Share</button></div>
            </div>
        </div>
        <div id="current-info">Current: <strong id="dash-title">Loading...</strong></div>
    </div>
    <div id="content">{iframes}</div>

    <script>
        const config = {config_json};
        const latestMap = {latest_map_json};
        const allDashboards = [...config.mainTrends, ...config.ubbBuilds, ...config.sysBuilds];
        
        let activeDashboardId = null;
        let syncInterval = null;

        function getParams() {{
            const p = new URLSearchParams(window.location.search);
            return {{ page: p.get('page'), view: p.get('view') }};
        }}

        function updateUrl(id, view) {{
            const url = new URL(window.location);
            url.searchParams.set('page', id);
            if (view && view.length > 0) url.searchParams.set('view', view);
            else url.searchParams.delete('view');
            window.history.replaceState({{}}, '', url);
        }}

        // --- NEW: MONITOR IFRAME FOR CHANGES ---
        function startMonitoring(dashId) {{
            if (syncInterval) clearInterval(syncInterval);
            
            syncInterval = setInterval(() => {{
                const iframe = document.getElementById('frame-' + dashId);
                if (!iframe || !iframe.contentWindow) return;

                try {{
                    // Try to read internal hash (Only works on Same-Domain)
                    const internalHash = iframe.contentWindow.location.hash;
                    
                    if (internalHash) {{
                        const viewName = internalHash.replace('#', '');
                        const currentParams = getParams();
                        
                        // Only update if it's different to prevent loops
                        if (currentParams.view !== viewName) {{
                            console.log("Syncing Parent URL to Iframe state:", viewName);
                            updateUrl(dashId, viewName);
                        }}
                    }}
                }} catch (e) {{
                    // Cross-Origin Block (Should not happen on same github.io)
                    console.warn("Cannot read iframe URL due to security restrictions.");
                    clearInterval(syncInterval);
                }}
            }}, 800); // Check every 0.8 seconds
        }}

        function loadDashboard(dash, viewParam) {{
            if (!dash) return;
            activeDashboardId = dash.id;

            // UI Updates
            document.querySelectorAll('.iframe-container').forEach(e => e.style.display = 'none');
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.getElementById('dash-title').textContent = dash.title;
            document.title = dash.title;

            // Iframe Logic
            const container = document.getElementById('tab-' + dash.id);
            const iframe = document.getElementById('frame-' + dash.id);
            
            if (container && iframe) {{
                container.style.display = 'block';
                let targetSrc = iframe.getAttribute('data-original-src');
                
                // If we have a viewParam, append it as hash
                if (viewParam) targetSrc += "#" + viewParam;
                
                // Load if blank or force hash change
                if (iframe.src === 'about:blank') {{
                   iframe.src = targetSrc;
                }} else if (viewParam) {{
                    // Force internal hash update without reload
                    iframe.contentWindow.location.hash = viewParam;
                }}
                
                // Start listening for clicks inside
                startMonitoring(dash.id);
            }}

            updateUrl(dash.id, viewParam);
            
            // Sync Controls (Tabs/Dropdowns)
            if (dash.type === 'Trend') {{
                const btn = document.querySelector(`button[data-dashboard-id="${{dash.id}}"]`);
                if (btn) btn.classList.add('active');
            }}
            
            const ubb = document.getElementById('ubb-dropdown');
            const sys = document.getElementById('sys-dropdown');
            ubb.value = ""; sys.value = "";
            
            if (dash.type === 'Single') {{
                if (ubb.querySelector(`option[data-id="${{dash.id}}"]`)) ubb.value = dash.url;
                else if (sys.querySelector(`option[data-id="${{dash.id}}"]`)) sys.value = dash.url;
            }}
        }}

        document.addEventListener('DOMContentLoaded', () => {{
            const params = getParams();
            let startId = params.page;
            
            if (latestMap[startId]) startId = latestMap[startId];
            
            let dash = allDashboards.find(d => d.id === startId);
            if (!dash && config.mainTrends.length) dash = config.mainTrends[0];
            
            if (dash) loadDashboard(dash, params.view);

            // Event Listeners
            document.querySelectorAll('.tab-button').forEach(btn => {{
                btn.addEventListener('click', () => {{
                    loadDashboard(allDashboards.find(x => x.id === btn.dataset.dashboardId), null);
                }});
            }});

            const handleSelect = (e) => {{
                if (!e.target.value) return;
                const opt = e.target.selectedOptions[0];
                loadDashboard(allDashboards.find(x => x.id === opt.dataset.id), null);
            }};

            document.getElementById('ubb-dropdown').addEventListener('change', handleSelect);
            document.getElementById('sys-dropdown').addEventListener('change', handleSelect);
            
            document.getElementById('copy-btn').addEventListener('click', function() {{
                navigator.clipboard.writeText(window.location.href).then(() => {{
                    const orig = this.textContent;
                    this.textContent = '✓ Copied';
                    this.style.color = 'green';
                    setTimeout(() => {{ this.textContent = orig; this.style.color = ''; }}, 2000);
                }});
            }});
        }});

        window.addEventListener('popstate', () => {{
            const p = getParams();
            const d = allDashboards.find(x => x.id === p.page);
            if (d) loadDashboard(d, p.view);
        }});
    </script>
</body>
</html>
'''
    return html

if __name__ == "__main__":
    print("Generating V7.0 (Two-Way Sync)...")
    Path(__file__).parent.joinpath('Landing_page.html').write_text(generate_landing_page(), encoding='utf-8')
    print("Done. Saved to Landing_page.html")