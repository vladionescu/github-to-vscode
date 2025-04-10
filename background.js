// Base path is now configured via the options page and stored in chrome.storage.sync

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        title: `Open with vscode.dev`,
        id: 'open-with-vscode-dev',
        documentUrlPatterns: ["https://github.com/*/*"],
    })
})

chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage()
})

chrome.contextMenus.onClicked.addListener(() => {
    getCurrentTab()
        .then(tab => {
            openWithVScodeDev(tab.url)
        })
        .catch(err => console.error(err))
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete') return

    if (!isGithubPage(tab.url)) return

    chrome.scripting.executeScript({
        target: {
            tabId: tabId
        },
        files: [
            './clone-in-vscode.js'
        ],
    })
})

chrome.commands.onCommand.addListener((command) => {
    getCurrentTab()
        .then(tab => {
            if (!isGithubPage(tab.url)) return

            if (command === "open-with-vscodedev") {
                openWithVScodeDev(tab.url)
            }

            if (command === "clone-in-vscode") {
                let repoUrl = tab.url
                    .replace(/\/blob\/.{0,255}/g, '')
                    .replace(/\/tree\/.{0,255}/g, '')
                    .replace(/\/commit\/.{0,255}/g, '')

                repoUrl += '.git'

                cloneRepo(repoUrl);
            }

            if (command === "open-file-in-vscode") {
                // Check specifically for blob URLs here, as the command should only work on file pages
                if (tab.url.includes('/blob/')) {
                     openFileInVSCode(tab.url);
                } else {
                    console.log("Open in VSCode command: Not on a file page.");
                }
            }
        })
        .catch(err => console.error(err));

});

const getCurrentTab = async () => {
    const queryOptions = { active: true, currentWindow: true }
    const [tab] = await chrome.tabs.query(queryOptions)

    return tab
}

const isGithubPage = (url) => {
    const githubPageRegex = new RegExp(/^(https?:\/\/[www.]*github\.com\/.{1,255})$/g)

    return githubPageRegex.test(url)
}

const openWithVScodeDev = (repoUrl) => {
    chrome.tabs.create({
        url: `https://vscode.dev/${repoUrl}`
    });
}

// Function to handle opening a specific file URL in VS Code
function openFileInVSCode(fileUrl) {
    const urlPattern = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/;
    const match = fileUrl.match(urlPattern);

    if (!match) {
        console.warn("Open in VSCode command: Not a file blob URL.", fileUrl);
        return; // Not a file page or pattern mismatch
    }

    const [, org, repo, /* branch */ , filePath] = match;

    if (!repo || !filePath) {
        console.error("Open in VSCode command: Could not parse repo or file path from URL:", fileUrl);
        return;
    }

    // Fetch base path from storage with a default value
    chrome.storage.sync.get({ vscBasePath: '/Users/user/workspace/' }, (items) => {
        let storedBasePath = items.vscBasePath;

        // Use default if stored path is invalid or empty
        if (!storedBasePath || typeof storedBasePath !== 'string' || storedBasePath.trim() === '') {
             console.warn("Open in VSCode command: Invalid or missing base path in storage. Using default '/Users/user/workspace/'.");
             storedBasePath = '/Users/user/workspace/'; // Fallback default
        }

        // Ensure base path ends with a slash
        const basePath = storedBasePath.trim().endsWith('/') ? storedBasePath.trim() : storedBasePath.trim() + '/';
        const vscodeUri = `vscode://file/${basePath}${org}/${repo}/${filePath}`;

        console.log(`Attempting to open VS Code URI: ${vscodeUri}`);

        // Open the VS Code URI link
        chrome.tabs.create({
            url: vscodeUri
        });
    });
}

const cloneRepo = (repoUrl) => {
    chrome.tabs.create({
        url: `vscode://vscode.git/clone?url=${repoUrl}`
    });
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "openInVSCode" && message.url) {
        console.log("Background script received openInVSCode message for URL:", message.url);
        openFileInVSCode(message.url);
        // Optional: send a response back if needed, though not required here
        // sendResponse({ status: "success" });
        return true; // Indicates you might send a response asynchronously (good practice)
    }
    // Handle other potential messages here if needed
});