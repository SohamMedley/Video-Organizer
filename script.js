document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  lucide.createIcons();

  const grid = document.getElementById("grid");
  const newFolderBtn = document.getElementById("newFolderBtn");
  const uploadVideoBtn = document.getElementById("uploadVideoBtn");
  const fileInput = document.getElementById("fileInput");
  // If you keep the search bar uncommented in HTML, uncomment next line:
  // const searchInput = document.getElementById("searchInput");

  const contentTitle = document.querySelector(".content h1");
  const sidebarNavItems = document.querySelectorAll(".sidebar nav ul li");

  // Our data
  const items = [];
  let currentFolder = null;

  // Example folder with some videos
  const marathiMoviesFolder = {
    type: "folder",
    name: "Shivraj Ashtak",
    items: [
      {
        type: "video",
        name: "Farzand.mkv",
        src: "Shivraj Ashtak/Farzand.mkv",
        mime: "video/x-matroska",
      },
      {
        type: "video",
        name: "Pawankhind.mp4",
        src: "Shivraj Ashtak/Pawankhind.mp4",
        mime: "video/mp4",
      },
      {
        type: "video",
        name: "Sher Shivraj.mp4",
        src: "Shivraj Ashtak/Sher Shivraj.mp4",
        mime: "video/mp4",
      },
    ],
  };
  items.push(marathiMoviesFolder);

  // Create a grid-item DOM element
  function createGridItem(item) {
    const gridItem = document.createElement("div");
    gridItem.className = "grid-item";
    gridItem.dataset.type = item.type;
    gridItem.dataset.name = item.name.toLowerCase();

    let media;
    if (item.type === "folder") {
      // Folders use an image
      media = document.createElement("img");
       media.src = "D:/Video Organizer/Maharaj.png";
    } else {
      // Videos get a small autoplay preview
      media = document.createElement("video");
      if (item.src) {
        media.src = item.src;
      } else if (item.file) {
        media.src = URL.createObjectURL(item.file);
      }
      media.controls = false;
      media.muted = true;
      media.loop = true;
      media.autoplay = true;
    }
    media.alt = item.name;

    // Info container
    const info = document.createElement("div");
    info.className = "info";

    const nameEl = document.createElement("h3");
    nameEl.textContent = item.name;

    const details = document.createElement("p");
    if (item.type === "folder") {
      details.textContent = `${item.items.length} items`;
    } else {
      // If it’s a video with a File object, show file size
      if (item.file) {
        details.textContent = `Size: ${formatFileSize(item.file.size)}`;
      } else {
        details.textContent = "";
      }
    }

    info.appendChild(nameEl);
    info.appendChild(details);

    // Action buttons container
    const actionContainer = document.createElement("div");
    actionContainer.className = "action-container";

    // If it's a video, add a Download button
    if (item.type === "video") {
      const downloadBtn = document.createElement("a");
      downloadBtn.className = "download-btn";
      downloadBtn.innerHTML = '<i data-lucide="download"></i> Download';
      const videoSrc = item.src || (item.file ? URL.createObjectURL(item.file) : "");
      downloadBtn.href = videoSrc;
      downloadBtn.download = item.name;
      actionContainer.appendChild(downloadBtn);
    }

    // "Delete" button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = '<i data-lucide="trash-2"></i>';
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteItem(item);
    });

    gridItem.appendChild(media);
    gridItem.appendChild(info);
    gridItem.appendChild(deleteBtn);
    gridItem.appendChild(actionContainer);

    // Only folders open on click
    if (item.type === "folder") {
      gridItem.addEventListener("click", () => openFolder(item));
    }

    return gridItem;
  }

  // Add a new item (folder or video) to the current folder or root
  function addItem(item) {
    if (currentFolder) {
      currentFolder.items.push(item);
    } else {
      items.push(item);
    }
    renderGrid();
  }

  // Delete an item
  function deleteItem(item) {
    const itemArray = currentFolder ? currentFolder.items : items;
    const index = itemArray.findIndex(
      (i) => i.name === item.name && i.type === item.type
    );
    if (index !== -1) {
      itemArray.splice(index, 1);
      renderGrid();
    }
  }

  // Render the current folder or root items
  function renderGrid() {
    grid.innerHTML = "";
    const itemsToRender = currentFolder ? currentFolder.items : items;
    itemsToRender.forEach((item) => {
      grid.appendChild(createGridItem(item));
    });
    lucide.createIcons();
  }

  // Open a folder
  function openFolder(folder) {
    currentFolder = folder;
    contentTitle.textContent = folder.name;
    renderGrid();
  }

  // Format file size
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
    else return (bytes / 1073741824).toFixed(1) + " GB";
  }

  // “Upload Video” button
  uploadVideoBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("video/")) {
      addItem({ type: "video", name: file.name, file: file });
    } else {
      alert("Please select a valid video file.");
    }
    fileInput.value = "";
  });

  // “New Folder” button
  newFolderBtn.addEventListener("click", () => {
    const folderName = prompt("Enter folder name:");
    if (folderName) {
      addItem({ type: "folder", name: folderName, items: [] });
    }
  });

  // Sidebar nav logic
  sidebarNavItems.forEach((navItem) => {
    navItem.addEventListener("click", () => {
      // Remove active from all
      sidebarNavItems.forEach((i) => i.classList.remove("active"));
      navItem.classList.add("active");

      const section = navItem.textContent.trim();
      switch (section) {
        case "Home":
          currentFolder = null;
          contentTitle.textContent = "My Videos";
          renderGrid();
          break;

        case "My Folders":
          currentFolder = null;
          contentTitle.textContent = "My Folders";
          // Show only top-level folders
          grid.innerHTML = "";
          items
            .filter((it) => it.type === "folder")
            .forEach((folder) => {
              grid.appendChild(createGridItem(folder));
            });
          lucide.createIcons();
          break;

        case "All Videos":
          currentFolder = null;
          contentTitle.textContent = "All Videos";
          // Flatten all items, show only videos
          const allVideos = getAllItems(items).filter((it) => it.type === "video");
          grid.innerHTML = "";
          allVideos.forEach((vid) => {
            grid.appendChild(createGridItem(vid));
          });
          lucide.createIcons();
          break;
      }
    });
  });

  // If you want a search feature, uncomment below plus the search bar in HTML
  /*
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const all = getAllItems(items);
    const filtered = all.filter((it) => it.name.toLowerCase().includes(searchTerm));
    grid.innerHTML = "";
    filtered.forEach((item) => {
      grid.appendChild(createGridItem(item));
    });
    lucide.createIcons();
  });
  */

  // Recursively gather all items
  function getAllItems(folderItems) {
    let allItems = [];
    folderItems.forEach((item) => {
      if (item.type === "folder") {
        allItems = allItems.concat(getAllItems(item.items));
      } else {
        allItems.push(item);
      }
    });
    return allItems;
  }

  // Initial render
  renderGrid();
});
