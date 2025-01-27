document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  lucide.createIcons()

  const grid = document.getElementById("grid")
  const newFolderBtn = document.getElementById("newFolderBtn")
  const uploadVideoBtn = document.getElementById("uploadVideoBtn")
  const fileInput = document.getElementById("fileInput")
  const searchInput = document.getElementById("searchInput")
  const contentTitle = document.querySelector(".content h1")
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle")
  const sidebar = document.querySelector(".sidebar")

  const items = []
  let currentFolder = null

  // Function to create grid items
  function createGridItem(item) {
    const gridItem = document.createElement("div")
    gridItem.className = "grid-item"
    gridItem.dataset.type = item.type
    gridItem.dataset.name = item.name.toLowerCase()

    let media
    if (item.type === "folder") {
      media = document.createElement("img")
      media.src = "https://via.placeholder.com/200x150.png?text=Folder"
    } else {
      media = document.createElement("video")
      media.src = URL.createObjectURL(item.file)
    }
    media.alt = item.name

    const info = document.createElement("div")
    info.className = "info"

    const name = document.createElement("h3")
    name.textContent = item.name

    const details = document.createElement("p")
    details.textContent =
      item.type === "folder" ? `${item.items.length} items` : `Size: ${formatFileSize(item.file.size)}`

    const deleteBtn = document.createElement("button")
    deleteBtn.className = "delete-btn"
    deleteBtn.innerHTML = '<i data-lucide="trash-2"></i>'
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      deleteItem(item)
    })

    info.appendChild(name)
    info.appendChild(details)

    gridItem.appendChild(media)
    gridItem.appendChild(info)
    gridItem.appendChild(deleteBtn)

    if (item.type === "folder") {
      gridItem.addEventListener("click", () => openFolder(item))
    } else {
      gridItem.addEventListener("click", () => playVideo(item))
    }

    return gridItem
  }

  // Function to add a new item
  function addItem(item) {
    if (currentFolder) {
      currentFolder.items.push(item)
    } else {
      items.push(item)
    }
    renderGrid()
  }

  // Function to delete an item
  function deleteItem(item) {
    const itemArray = currentFolder ? currentFolder.items : items
    const index = itemArray.findIndex((i) => i.name === item.name && i.type === item.type)
    if (index !== -1) {
      itemArray.splice(index, 1)
      renderGrid()
    }
  }

  // Function to render the grid
  function renderGrid() {
    grid.innerHTML = ""
    const itemsToRender = currentFolder ? currentFolder.items : items
    itemsToRender.forEach((item) => {
      grid.appendChild(createGridItem(item))
    })
    lucide.createIcons()
  }

  // New Folder button click event
  newFolderBtn.addEventListener("click", () => {
    const folderName = prompt("Enter folder name:")
    if (folderName) {
      addItem({ type: "folder", name: folderName, items: [] })
    }
  })

  // Upload Video button click event
  uploadVideoBtn.addEventListener("click", () => {
    fileInput.click()
  })

  // File input change event
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith("video/")) {
      addItem({ type: "video", name: file.name, file: file })
    } else {
      alert("Please select a valid video file.")
    }
    fileInput.value = ""
  })

  // Search input event
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase()
    const allItems = getAllItems(items)
    const filteredItems = allItems.filter((item) => item.name.toLowerCase().includes(searchTerm))

    grid.innerHTML = ""
    filteredItems.forEach((item) => {
      grid.appendChild(createGridItem(item))
    })
    lucide.createIcons()
  })

  function getAllItems(items) {
    let allItems = []
    items.forEach((item) => {
      if (item.type === "folder") {
        allItems = allItems.concat(getAllItems(item.items))
      } else {
        allItems.push(item)
      }
    })
    return allItems
  }

  // Function to format file size
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB"
    else return (bytes / 1073741824).toFixed(1) + " GB"
  }

  // Function to open a folder
  function openFolder(folder) {
    currentFolder = folder
    contentTitle.textContent = folder.name
    renderGrid()
    updateBreadcrumb()
  }

  // Function to play a video
  function playVideo(video) {
    const videoPlayer = document.createElement("div")
    videoPlayer.className = "video-player"
    videoPlayer.innerHTML = `
        <video controls>
            <source src="${URL.createObjectURL(video.file)}" type="${video.file.type}">
            Your browser does not support the video tag.
        </video>
        <button class="close-btn"><i data-lucide="x"></i></button>
        <a href="${URL.createObjectURL(video.file)}" download="${video.name}" class="download-btn"><i data-lucide="download"></i></a>
    `
    document.body.appendChild(videoPlayer)

    const closeBtn = videoPlayer.querySelector(".close-btn")
    closeBtn.addEventListener("click", () => {
      document.body.removeChild(videoPlayer)
    })

    lucide.createIcons()
  }

  // Function to update breadcrumb
  function updateBreadcrumb() {
    const breadcrumb = document.createElement("div")
    breadcrumb.className = "breadcrumb"

    const homeLink = document.createElement("a")
    homeLink.textContent = "Home"
    homeLink.href = "#"
    homeLink.addEventListener("click", (e) => {
      e.preventDefault()
      currentFolder = null
      contentTitle.textContent = "My Videos"
      renderGrid()
      updateBreadcrumb()
    })

    breadcrumb.appendChild(homeLink)

    if (currentFolder) {
      const separator = document.createElement("span")
      separator.textContent = " > "
      breadcrumb.appendChild(separator)

      const folderLink = document.createElement("span")
      folderLink.textContent = currentFolder.name
      breadcrumb.appendChild(folderLink)
    }

    const existingBreadcrumb = document.querySelector(".breadcrumb")
    if (existingBreadcrumb) {
      existingBreadcrumb.replaceWith(breadcrumb)
    } else {
      contentTitle.parentNode.insertBefore(breadcrumb, contentTitle)
    }
  }

  // Sidebar navigation
  const navItems = document.querySelectorAll("nav ul li")
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navItems.forEach((i) => i.classList.remove("active"))
      item.classList.add("active")

      const section = item.textContent.trim()
      switch (section) {
        case "Home":
          currentFolder = null
          contentTitle.textContent = "My Videos"
          renderGrid()
          updateBreadcrumb()
          break
        case "My Folders":
          contentTitle.textContent = "My Folders"
          currentFolder = null
          renderGrid()
          updateBreadcrumb()
          grid.innerHTML = ""
          items
            .filter((item) => item.type === "folder")
            .forEach((folder) => {
              grid.appendChild(createGridItem(folder))
            })
          break
        case "All Videos":
          contentTitle.textContent = "All Videos"
          currentFolder = null
          const allVideos = getAllItems(items).filter((item) => item.type === "video")
          grid.innerHTML = ""
          allVideos.forEach((video) => {
            grid.appendChild(createGridItem(video))
          })
          updateBreadcrumb()
          break
      }
    })
  })

  // Mobile menu toggle
  mobileMenuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active")
  })

  // Close sidebar when clicking outside
  document.addEventListener("click", (e) => {
    if (sidebar.classList.contains("active") && !sidebar.contains(e.target) && e.target !== mobileMenuToggle) {
      sidebar.classList.remove("active")
    }
  })

  // Initial render
  renderGrid()
  updateBreadcrumb()
})

