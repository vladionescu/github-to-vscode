(function() {
    // Check if the button already exists
    if (document.getElementById('open-in-vscode-button')) {
        return;
    }
    // Check if we are on a file page (simple check, background script does detailed validation)
    if (!window.location.pathname.includes('/blob/')) {
        console.log("Open in VSCode (Content Script): Not a file blob URL path.");
        return;
    }

    // --- Configuration ---
    const BUTTON_ID = 'open-in-vscode-button';
    const BUTTON_TEXT = 'Open in VSCode';

    // This selector targets the button group area in GitHub's file view.
    // Note: GitHub's structure can change, this might need updates.
    const GITHUB_BUTTON_GROUP_SELECTOR = '#repos-sticky-header div:first-of-type + div > div:last-of-type';
    const GITHUB_BUTTON_GROUP_SELECTOR_FALLBACK = '#StickyHeader'; 


    // --- DOM Manipulation ---
    const targetButtonGroup = document.querySelector(GITHUB_BUTTON_GROUP_SELECTOR);

    if (!targetButtonGroup) {
        console.error("Open in VSCode: Could not find target button group using selector:", GITHUB_BUTTON_GROUP_SELECTOR);
        const fallbackTarget = document.querySelector(GITHUB_BUTTON_GROUP_SELECTOR_FALLBACK);
        if (fallbackTarget) {
            console.log("Open in VSCode: Using fallback insertion point.");
            insertButton(fallbackTarget, true);
        } else {
            console.error("Open in VSCode: Could not find fallback insertion point either.");
        }
        return;
    }

    insertButton(targetButtonGroup, false);

    function insertButton(targetElement, isFallback) {
        const button = document.createElement('a');
        button.id = BUTTON_ID;
        button.href = '#';
        button.textContent = BUTTON_TEXT;

        // Add click listener to send message to background script
        button.addEventListener('click', (event) => {
            event.preventDefault();
            console.log("Open in VSCode button clicked. Sending message to background.");
            chrome.runtime.sendMessage({
                action: "openInVSCode",
                url: window.location.href
            }, (_response) => {
                if (chrome.runtime.lastError) {
                    console.error("Open in VSCode: Message sending failed:", chrome.runtime.lastError);
                } else {
                    // Optional: handle response from background if needed
                    // console.log("Background script response:", response);
                }
            });
        });

        button.classList.add('btn', 'btn-sm');
        if (isFallback) {
            button.style.marginTop = '0.5em';
        }

        const icon = document.createElement('img');
        try {
            icon.src = chrome.runtime.getURL('images/icons/vscode.svg');
            icon.style.width = '16px';
            icon.style.height = '16px';
            icon.style.marginRight = '4px';
            icon.style.verticalAlign = 'text-bottom';
            button.insertBefore(icon, button.firstChild);
        } catch (e) {
            console.error("Open in VSCode: Failed to get icon URL.", e);
        }

        targetElement.appendChild(button);
        console.log("Open in VSCode: Button added.");
    }

})();