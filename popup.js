document.getElementById("groupTabs").addEventListener("click", () => {
  chrome.runtime.sendMessage({ command: "groupTabs" });
});

document.getElementById("groupTabsWithName").addEventListener("click", () => {
  chrome.runtime.sendMessage({ command: "groupTabsWithName" });
});

document.getElementById("ungroupTabs").addEventListener("click", () => {
  chrome.runtime.sendMessage({ command: "ungroupTabs" });
});

document.getElementById("saveSession").addEventListener("click", () => {
  chrome.tabs.query({}, (tabs) => {
      const session = tabs.map((tab) => ({ url: tab.url, title: tab.title }));
      chrome.storage.local.set({ session });
      alert("Session saved!");
  });
});

document.getElementById("restoreSession").addEventListener("click", () => {
  chrome.storage.local.get("session", (data) => {
      if (data.session) {
          data.session.forEach((tab) => {
              chrome.tabs.create({ url: tab.url });
          });
      }
  });
});

document.getElementById("clearSession").addEventListener("click", () => {
  chrome.storage.local.remove("session");
  alert("Session cleared!");
});

document.getElementById("searchInput").addEventListener("input", (event) => {
  const query = event.target.value.toLowerCase();

  chrome.tabs.query({}, (tabs) => {
      const results = tabs.filter(
          (tab) =>
              tab.title.toLowerCase().includes(query) ||
              tab.url.toLowerCase().includes(query)
      );

      const resultsList = document.getElementById("searchResults");
      resultsList.innerHTML = "";
      results.forEach((tab) => {
          const listItem = document.createElement("li");
          listItem.textContent = tab.title;
          listItem.addEventListener("click", () => chrome.tabs.update(tab.id, { active: true }));
          resultsList.appendChild(listItem);
      });
  });

  document.getElementById("clearSearch").addEventListener("click", () => {
    searchInput.value = "";
    searchResults.innerHTML = "";
  });
});

document.getElementById("addFavorite").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([currentTab]) => {
      chrome.storage.local.get("favorites", (data) => {
          const favorites = data.favorites || [];

          const isDuplicate = favorites.some((fav) => fav.url === currentTab.url);

          if (!isDuplicate) {
              favorites.push({ title: currentTab.title, url: currentTab.url });
              chrome.storage.local.set({ favorites });

              // Update the DOM with the new favorite tab
              const favoritesList = document.getElementById("favoriteTabs");

              const listItem = document.createElement("li");
              listItem.style.display = "flex";
              listItem.style.alignItems = "center";
              listItem.style.justifyContent = "space-between";

              // Create a container for the title and close button
              const listItemContent = document.createElement("span");
              listItemContent.textContent = currentTab.title;
              listItemContent.style.cursor = "pointer";
              listItemContent.style.textAlign = "start";
              listItemContent.addEventListener("click", () => chrome.tabs.create({ url: currentTab.url }));

              // Create a close button
              const closeButton = document.createElement("button");
              closeButton.textContent = "✖";
              closeButton.style.marginLeft = "10px";
              closeButton.style.cursor = "pointer";
              closeButton.addEventListener("click", (event) => {
                  event.stopPropagation(); // Prevent triggering the list item click
                  favoritesList.removeChild(listItem);
                  const updatedFavorites = favorites.filter(fav => fav.url !== currentTab.url);
                  chrome.storage.local.set({ favorites: updatedFavorites });
              });

              listItem.appendChild(listItemContent);
              listItem.appendChild(closeButton);
              favoritesList.appendChild(listItem);
          } else {
              alert("This tab is already in your favorites.");
          }
      });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("favorites", (data) => {
      const favorites = data.favorites || [];
      const favoritesList = document.getElementById("favoriteTabs");
      favorites.forEach(({ title, url }) => {
          const listItem = document.createElement("li");
          listItem.style.display = "flex";
          listItem.style.alignItems = "center";
          listItem.style.justifyContent = "space-between";

          const listItemContent = document.createElement("span");
          listItemContent.textContent = title;
          listItemContent.style.cursor = "pointer";
          listItemContent.style.textAlign = "start";
          listItemContent.addEventListener("click", () => chrome.tabs.create({ url }));

          const closeButton = document.createElement("button");
          closeButton.textContent = "✖";
          closeButton.style.marginLeft = "10px";
          closeButton.style.display = "flex";
          closeButton.style.alignItems = "center";
          closeButton.style.justifyContent = "space-between";
          closeButton.style.cursor = "pointer";
          closeButton.addEventListener("click", (event) => {
              event.stopPropagation(); // Prevent triggering the list item click
              favoritesList.removeChild(listItem);
              const updatedFavorites = favorites.filter(fav => fav.url !== url);
              chrome.storage.local.set({ favorites: updatedFavorites });
          });

          listItem.appendChild(listItemContent);
          listItem.appendChild(closeButton);
          favoritesList.appendChild(listItem);
      });
  });
});

document.getElementById("closeDuplicates").addEventListener("click", () => {
  chrome.runtime.sendMessage({ command: "closeDuplicates" });
});