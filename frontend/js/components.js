// js/components.js

async function loadComponents() {
    try {
        console.log('📦 Step 1: Loading sidebar...');
        const sidebarResponse = await fetch('components/sidebar.html');
        if (!sidebarResponse.ok) {
            throw new Error(`Sidebar HTTP ${sidebarResponse.status}`);
        }
        const sidebarHTML = await sidebarResponse.text();
        console.log('✅ Sidebar loaded:', sidebarHTML.length, 'characters');
        
        const sidebarContainer = document.getElementById('app-sidebar');
        if (!sidebarContainer) {
            console.error('❌ app-sidebar container not found!');
            return false;
        }
        sidebarContainer.innerHTML = sidebarHTML;
        console.log('✅ Sidebar inserted into app-sidebar');
        
        console.log('📦 Step 2: Loading topbar...');
        const topbarResponse = await fetch('components/topbar.html');
        if (!topbarResponse.ok) {
            throw new Error(`Topbar HTTP ${topbarResponse.status}`);
        }
        const topbarHTML = await topbarResponse.text();
        console.log('✅ Topbar loaded:', topbarHTML.length, 'characters');
        
        const topbarContainer = document.getElementById('app-topbar');
        if (!topbarContainer) {
            console.error('❌ app-topbar container not found!');
            return false;
        }
        topbarContainer.innerHTML = topbarHTML;
        console.log('✅ Topbar inserted into app-topbar');
        
        // Verify elements exist
        setTimeout(() => {
            console.log('🔍 Verification:');
            console.log('  - Sidebar element:', document.querySelector('#app-sidebar > *') ? 'EXISTS' : 'MISSING');
            console.log('  - Topbar element:', document.querySelector('#app-topbar > *') ? 'EXISTS' : 'MISSING');
            console.log('  - navigationMenu:', document.getElementById('navigationMenu') ? 'EXISTS' : 'MISSING');
            console.log('  - pageTitle:', document.getElementById('pageTitle') ? 'EXISTS' : 'MISSING');
        }, 100);
        
        return true;
    } catch (error) {
        console.error('❌ Failed to load components:', error);
        return false;
    }
}

async function loadComponentsFromPages() {
    try {
        console.log('📦 Loading from pages folder...');
        
        const sidebarResponse = await fetch('../components/sidebar.html');
        const sidebarHTML = await sidebarResponse.text();
        document.getElementById('app-sidebar').innerHTML = sidebarHTML;
        
        const topbarResponse = await fetch('../components/topbar.html');
        const topbarHTML = await topbarResponse.text();
        document.getElementById('app-topbar').innerHTML = topbarHTML;
        
        console.log('✅ Components loaded from pages folder');
        return true;
    } catch (error) {
        console.error('❌ Failed to load components from pages:', error);
        return false;
    }
}
