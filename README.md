<p align="center">
  <img width="128" src="https://i.imgur.com/t3MTsVm.png">
</p>

# GitHub to Local VSCode

Chrome extension to quickly open GitHub repos/files inside a locally installed VSCode.

## How to use

Click the extension icon in your toolbar to open the options popup. Set your code base path here. This is where you clone repos locally.

This extension assumes files exist at `{basepath}/{org}/{repo}/{filepath}` where basepath is what you set, and the rest are from the current GitHub URL. As a result, there is a limitation where your local clones must follow the dir structure `{org}/{repo}`.

<table>
  <tr>
    <td width="50%" valign="top">
      <img src="https://i.imgur.com/VNV30OX.png">
    </td>
    <td width="50%" valign="middle">
      <img src="https://i.imgur.com/NVJqQ6s.png">
      <br/>
      <img src="https://i.imgur.com/ADfwZ4s.png">
    </td>
  </tr>
</table>

## Keyboard shortcuts:

- Open current file in VSCode: `Ctrl/Command + Comma (,)`
- Clone in VSCode: `Ctrl/Command + Shift + Down Arrow`

## How to install

You can install github-to-local-vscode [directly from Chrome's Web Store](https://chrome.google.com/webstore/detail/github-to-local-vscode/bkcmnjhiempdiihdhlifcagkmkdjjlhk).

Otherwise, you can manually install the extension by following the instructions below:

1. Clone this repo
2. Open Chrome (or your preferred Chromium based browser) and navigate to the extensions page (`chrome://extensions` on Chrome)
3. Enable developer mode (upper right corner) and click the "Load unpacked" button
4. Find the cloned repo on your computer and select it, then press "Open"

The extension is loaded into your browser and ready to be used!
