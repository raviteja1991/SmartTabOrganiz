
chrome.runtime.onInstalled.addListener(() => {
    console.log("Smart Tab Organizer installed!");
});

// Group tabs by domain, close duplicates, and group tabs with a custom name
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received:', message);

    if (message.command === "groupTabs") {
        chrome.tabs.query({}, (tabs) => {
            const groups = {};
            tabs.forEach((tab) => {
                const url = new URL(tab.url);
                if (!groups[url.hostname]) {
                    groups[url.hostname] = [];
                }
                groups[url.hostname].push(tab.id);
            });

            Object.values(groups).forEach((group) => {
                chrome.tabs.group({ tabIds: group }, (groupId) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error creating group:', chrome.runtime.lastError.message);
                    }
                });
            });
        });
    }

    if (message.command === "closeDuplicates") {
        if (chrome.runtime.lastError) {
            console.error('SendMessage Error:', chrome.runtime.lastError.message);
        }

        chrome.tabs.query({}, (tabs) => {
            const uniqueTabs = {};
            const duplicates = [];

            tabs.forEach((tab) => {
                const key = tab.url;
                if (uniqueTabs[key]) {
                    duplicates.push(tab.id);
                } else {
                    uniqueTabs[key] = true;
                }
            });

            if (duplicates.length === 0) {
                console.log("No duplicate tabs found. Exiting.");
                return;
            }

            duplicates.forEach((tabId) => chrome.tabs.remove(tabId));
            chrome.runtime.sendMessage({ action: "notify", message: `${duplicates.length} duplicates closed.` });
        });
    }

    if (message.command === "groupTabsWithName") {
        chrome.tabs.query({}, (tabs) => {
            const groups = {};
            tabs.forEach((tab) => {
                const url = new URL(tab.url);
                if (!groups[url.hostname]) {
                    groups[url.hostname] = [];
                }
                groups[url.hostname].push(tab.id);
            });

            Object.entries(groups).forEach(([hostname, group]) => {
                chrome.tabs.group({ tabIds: group }, (groupId) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error creating group:', chrome.runtime.lastError.message);
                        return;
                    }

                    // Use the domain name as the group title
                    chrome.tabGroups.update(groupId, { title: hostname }, (updatedGroup) => {
                        if (chrome.runtime.lastError) {
                            console.error('Error updating group:', chrome.runtime.lastError.message);
                        } else {
                            console.log('Group updated successfully:', updatedGroup);
                        }
                    });
                });
            });
        });
    }

    if (message.command === "ungroupTabs") {
        chrome.tabs.query({}, (tabs) => {
          const groupedTabIds = tabs
            .filter((tab) => tab.groupId !== -1) // Check if the tab is part of a group
            .map((tab) => tab.id); // Collect the IDs of grouped tabs
      
          if (groupedTabIds.length > 0) {
            chrome.tabs.ungroup(groupedTabIds, () => {
              if (chrome.runtime.lastError) {
                console.error("Error ungrouping tabs:", chrome.runtime.lastError.message);
              } else {
                console.log("All grouped tabs have been ungrouped successfully.");
              }
            });
          } else {
            console.log("No grouped tabs found.");
          }
        });
      }
});

// Auto-save session every 1 minute
setInterval(() => {
    chrome.tabs.query({}, (tabs) => {
        const session = tabs.map((tab) => ({ url: tab.url, title: tab.title }));
        chrome.storage.local.set({ autoSavedSession: session });
    });
}, 60000); // Save every 1 minute
