(function() {
    // Check if the button already exists
    if (document.getElementById('open-in-vscode-button')) {
        return;
    }

    // --- Configuration ---
    const VSC_BASE_PATH = '/Users/user/workspace'; // Hardcoded base path
    const BUTTON_ID = 'open-in-vscode-button';
    const BUTTON_TEXT = 'Open in VSCode';
    // Attempt to find the button group next to Raw/Blame/History
    // This selector might need adjustment based on GitHub's current structure
    const GITHUB_BUTTON_GROUP_SELECTOR = '#repos-sticky-header div .react-blob-sticky-header div div';

    // --- URL Parsing ---
    const url = window.location.href;
    const urlPattern = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/;
    const match = url.match(urlPattern);

    if (!match) {
        console.log("Open in VSCode: Not a file blob URL.");
        return; // Not a file page
    }

    const [, org, repo, /* branch */ , filePath] = match;

    if (!repo || !filePath) {
        console.error("Open in VSCode: Could not parse repo or file path from URL:", url);
        return;
    }

    // --- URI Construction ---
    // Ensure base path ends with a slash
    const basePath = VSC_BASE_PATH.endsWith('/') ? VSC_BASE_PATH : VSC_BASE_PATH + '/';
    const vscodeUri = `vscode://file/${basePath}${org}/${repo}/${filePath}`;

    // --- DOM Manipulation ---
    const targetButtonGroup = document.querySelector(GITHUB_BUTTON_GROUP_SELECTOR);

    if (!targetButtonGroup) {
        console.error("Open in VSCode: Could not find target button group using selector:", GITHUB_BUTTON_GROUP_SELECTOR);
        // As a fallback, try inserting into the file header actions container
        const fallbackTarget = document.querySelector('.file-header .d-flex');
        if (fallbackTarget) {
             console.log("Open in VSCode: Using fallback insertion point.");
             insertButton(fallbackTarget, vscodeUri, true); // Insert as a standalone button
        } else {
            console.error("Open in VSCode: Could not find fallback insertion point either.");
        }
        return;
    }

    insertButton(targetButtonGroup, vscodeUri, false); // Insert into the button group

    function insertButton(targetElement, uri, isFallback) {
        const button = document.createElement('a');
        button.id = BUTTON_ID;
        button.href = uri;
        button.textContent = BUTTON_TEXT;

        // Apply GitHub's button styles
        button.classList.add('btn', 'btn-sm');
        // if (!isFallback) {
        //     button.classList.add('BtnGroup-item');
        // } else {
        //      button.style.marginLeft = '8px'; // Add some space if it's a fallback
        // }


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