// Base path is now configured via the options page and stored in chrome.storage.sync


chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage()
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
    // Use URL constructor for easier parsing of path and hash
    const parsedUrl = new URL(fileUrl);
    const urlPattern = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/;
    // Match against the URL without the hash
    const match = (parsedUrl.origin + parsedUrl.pathname).match(urlPattern);

    if (!match) {
        console.warn("Open in VSCode command: Not a file blob URL.", fileUrl);
        return; // Not a file page or pattern mismatch
    }

    // Extract org, repo, and filePath from the pathname match
    const [, org, repo, /* branch */ , rawFilePath] = match;
    // filePath should not include the hash, which is handled separately
    const filePath = rawFilePath;

    if (!repo || !filePath) {
        console.error("Open in VSCode command: Could not parse repo or file path from URL:", fileUrl);
        return;
    }

    // Extract line number from hash (#L<start> or #L<start>-L<end>)
    let lineNumber = '';
    const hashMatch = parsedUrl.hash.match(/^#L(\d+)/);
    if (hashMatch && hashMatch[1]) {
        lineNumber = `:${hashMatch[1]}`; // Format as :line
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
        const vscodeUri = `vscode://file/${basePath}${org}/${repo}/${filePath}${lineNumber}`; // Append line number if found

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