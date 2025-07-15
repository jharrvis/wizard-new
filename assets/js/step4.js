// Step 4: Plugin Settings JavaScript Module
// Updated: 2025-07-15 Enhanced Data Management - Data loaded from JSON
// User: jharrvis

class Step4PluginSettings {
  constructor() {
    this.selectedPlugins = {};
    this.licenseKeys = {};
    this.currentLicensePlugin = null;
    this.pluginData = {}; // Will be populated from JSON
    this.isDataLoaded = false;

    this.init();
  }

  async init() {
    await this.loadPluginData(); // Load plugin data first
    this.bindEvents();
    this.loadStoredData();
    this.renderPluginSections();

    // Force button update after initialization
    setTimeout(() => {
      this.updateNextButton();
    }, 100);
  }

  // Method to load plugin data from JSON
  async loadPluginData() {
    try {
      const response = await fetch("assets/data/plugins-data.json");
      if (!response.ok) {
        throw new Error("Failed to load plugins-data.json");
      }
      this.pluginData = await response.json();
      this.isDataLoaded = true;
      console.log("Plugin data loaded from file:", this.pluginData);
    } catch (error) {
      console.error("Error loading plugin data from file:", error);
      // Fallback to a default structure or display an error to the user
      // For now, we'll just log the error and proceed with empty data.
      this.pluginData = {};
      this.isDataLoaded = true;
    }
  }

  bindEvents() {
    // Plugin toggle events
    document.addEventListener("change", (e) => {
      if (e.target.classList.contains("plugin-checkbox")) {
        this.handlePluginToggle(e.target);
      }
    });

    // License button events
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("license-btn")) {
        e.preventDefault();
        const pluginId = e.target.getAttribute("data-plugin");
        if (pluginId) {
          this.openLicenseModal(pluginId);
        }
      }
    });

    // Modal close events
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        this.closeLicenseModal();
      }
    });

    // Keyboard events
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeLicenseModal();
      }
    });
  }

  loadStoredData() {
    // Always load from localStorage first for persistence across refreshes
    const savedData = this.getWizardData();

    if (savedData) {
      console.log("Loading plugin data from localStorage:", savedData);

      if (savedData.plugins) {
        this.selectedPlugins = { ...savedData.plugins };
      }
      if (savedData.licenseKeys) {
        this.licenseKeys = { ...savedData.licenseKeys };
      }
    }

    // Also update global wizard data if it exists
    if (window.wizardData && savedData) {
      if (savedData.plugins) window.wizardData.plugins = savedData.plugins;
      if (savedData.licenseKeys)
        window.wizardData.licenseKeys = savedData.licenseKeys;
    }
  }

  renderPluginSections() {
    const container = document.getElementById("pluginSections");
    if (!container) {
      console.error("Plugin sections container not found");
      return;
    }

    container.innerHTML = "";

    if (!this.isDataLoaded || Object.keys(this.pluginData).length === 0) {
      container.innerHTML =
        '<div class="plugin-loading">Loading plugins or no plugin data available...</div>';
      return;
    }

    try {
      Object.entries(this.pluginData).forEach(([sectionKey, section]) => {
        const sectionElement = this.createPluginSection(sectionKey, section);
        container.appendChild(sectionElement);
      });

      this.updatePluginStates();
    } catch (error) {
      console.error("Error rendering plugin sections:", error);
      container.innerHTML =
        '<div class="plugin-error">Error loading plugins</div>';
    }
  }

  createPluginSection(sectionKey, section) {
    const sectionDiv = document.createElement("div");
    sectionDiv.className = "plugin-section";
    sectionDiv.setAttribute("data-section", sectionKey);

    sectionDiv.innerHTML = `
            <div class="plugin-category-header">
              <i class="fas fa-puzzle-piece"></i>
              ${section.title}
            </div>
            
            <div class="plugin-section-description">
              ${section.description}
            </div>
      
            <div class="plugin-list">
              ${section.plugins
                .map((plugin) => this.createPluginItem(plugin))
                .join("")}
            </div>
          `;

    return sectionDiv;
  }

  createPluginItem(plugin) {
    const isSelected = this.selectedPlugins[plugin.id] || false;
    const hasLicense = this.licenseKeys[plugin.id];
    const needsLicense = plugin.needsLicense || false;

    return `
            <div class="plugin-item ${
              isSelected ? "selected" : ""
            }" data-plugin="${plugin.id}">
              <div class="plugin-info">
                <div class="plugin-name">
                  ${this.getPluginIcon(plugin)}
                  ${plugin.name}
                  ${
                    needsLicense
                      ? '<span class="plugin-status premium">Premium</span>'
                      : '<span class="plugin-status free">Free</span>'
                  }
                </div>
                <div class="plugin-description">${plugin.description}</div>
                ${
                  needsLicense && hasLicense
                    ? '<div class="plugin-license-status">✓ License key configured</div>'
                    : ""
                }
              </div>
              <div class="plugin-controls">
                <div class="plugin-toggle">
                  <input type="checkbox" id="${
                    plugin.id
                  }" class="plugin-checkbox" ${isSelected ? "checked" : ""}>
                  <label for="${plugin.id}" class="toggle-switch"></label>
                </div>
                ${
                  needsLicense
                    ? `
                  <button class="license-btn" data-plugin="${plugin.id}">
                    <i class="fas ${hasLicense ? "fa-edit" : "fa-key"}"></i>
                    ${hasLicense ? "Edit License" : "Add License"}
                  </button>
                `
                    : ""
                }
              </div>
            </div>
          `;
  }

  getPluginIcon(plugin) {
    // If the icon is a URL, use it directly
    if (plugin.icon && plugin.icon.startsWith("http")) {
      return `<div class="plugin-icon" style="background: none;"><img src="${plugin.icon}" alt="${plugin.name} icon" style="max-width: 100%; max-height: 100%; object-fit: contain;"></div>`;
    }
    // If the icon is a letter, extract the letter and use it
    if (plugin.icon && plugin.icon.startsWith("letter:")) {
      const letter = plugin.icon.split(":")[1];
      let bgColor = "#009bde"; // Default background color
      // Assign different colors based on the letter for variety
      if (letter === "F" || letter === "M" || letter === "S")
        bgColor = "#ff7101";
      if (letter === "A" || letter === "T" || letter === "SG")
        bgColor = "#32be7d";
      return `<div class="plugin-icon" style="background: ${bgColor};">${letter}</div>`;
    }
    // Fallback if no specific icon is provided
    return `<div class="plugin-icon" style="background: #0f488a;">${plugin.name
      .substring(0, 2)
      .toUpperCase()}</div>`;
  }

  handlePluginToggle(checkbox) {
    const pluginId = checkbox.id;
    const isChecked = checkbox.checked;

    this.selectedPlugins[pluginId] = isChecked;
    this.updatePluginItem(pluginId);
    this.saveData();
  }

  updatePluginItem(pluginId) {
    const pluginItem = document.querySelector(`[data-plugin="${pluginId}"]`);
    if (!pluginItem) return;

    const isSelected = this.selectedPlugins[pluginId];
    const hasLicense = this.licenseKeys[pluginId];
    const needsLicense = this.checkIfPluginNeedsLicense(pluginId);

    // Update selected state
    pluginItem.classList.toggle("selected", isSelected);

    // Update checkbox
    const checkbox = pluginItem.querySelector(".plugin-checkbox");
    if (checkbox) {
      checkbox.checked = isSelected;
    }

    // Update license button
    const licenseBtn = pluginItem.querySelector(".license-btn");
    if (licenseBtn && needsLicense) {
      const icon = licenseBtn.querySelector("i");
      if (hasLicense) {
        icon.className = "fas fa-edit";
        licenseBtn.innerHTML = `<i class="fas fa-edit"></i> Edit License`;
      } else {
        icon.className = "fas fa-key";
        licenseBtn.innerHTML = `<i class="fas fa-key"></i> Add License`;
      }
    }

    // Update license status
    const existingStatus = pluginItem.querySelector(".plugin-license-status");
    if (needsLicense && hasLicense && !existingStatus) {
      const statusDiv = document.createElement("div");
      statusDiv.className = "plugin-license-status";
      statusDiv.innerHTML = "✓ License key configured";
      pluginItem
        .querySelector(".plugin-description")
        .insertAdjacentElement("afterend", statusDiv);
    } else if (!hasLicense && existingStatus) {
      existingStatus.remove();
    }
  }

  updatePluginStates() {
    Object.keys(this.selectedPlugins).forEach((pluginId) => {
      this.updatePluginItem(pluginId);
    });
  }

  checkIfPluginNeedsLicense(pluginId) {
    for (const section of Object.values(this.pluginData)) {
      if (section && section.plugins) {
        const plugin = section.plugins.find((p) => p && p.id === pluginId);
        if (plugin) {
          return plugin.needsLicense || false;
        }
      }
    }
    return false;
  }

  getPluginName(pluginId) {
    for (const section of Object.values(this.pluginData)) {
      if (section && section.plugins) {
        const plugin = section.plugins.find((p) => p && p.id === pluginId);
        if (plugin) {
          return plugin.name || pluginId;
        }
      }
    }
    return pluginId;
  }

  openLicenseModal(pluginId) {
    const pluginName = this.getPluginName(pluginId);
    const modal = document.getElementById("licenseModal");
    const titleElement = document.getElementById("licenseModalTitle");
    const inputElement = document.getElementById("licenseKeyInput");

    if (!modal || !titleElement || !inputElement) {
      console.error("License modal elements not found");
      return;
    }

    this.currentLicensePlugin = pluginId;
    titleElement.textContent = `License Key for ${pluginName}`;
    inputElement.value = this.licenseKeys[pluginId] || "";
    inputElement.placeholder = `Enter your ${pluginName} license key...`;

    modal.style.display = "flex";
    document.body.classList.add("modal-open");

    setTimeout(() => inputElement.focus(), 100);
  }

  closeLicenseModal() {
    const modal = document.getElementById("licenseModal");
    if (!modal) return;

    modal.style.display = "none";
    document.body.classList.remove("modal-open");
    this.currentLicensePlugin = null;
  }

  saveLicenseKey() {
    const inputElement = document.getElementById("licenseKeyInput");
    if (!inputElement || !this.currentLicensePlugin) return;

    const licenseKey = inputElement.value.trim();
    if (!licenseKey) {
      // Use a custom message box instead of alert()
      this.showNotification("Please enter a license key", "error");
      return;
    }

    // Save license key
    this.licenseKeys[this.currentLicensePlugin] = licenseKey;
    this.updatePluginItem(this.currentLicensePlugin);
    this.saveData();
    this.closeLicenseModal();

    // Show success message
    this.showNotification("License key saved successfully!", "success");
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
            <i class="fas ${
              type === "success"
                ? "fa-check-circle"
                : type === "error"
                ? "fa-exclamation-circle"
                : "fa-info-circle"
            }"></i>
            ${message}
          `;

    Object.assign(notification.style, {
      position: "fixed",
      top: "2rem",
      right: "2rem",
      background:
        type === "success"
          ? "#32be7d"
          : type === "error"
          ? "#e91e64"
          : "#009bde",
      color: "#fff",
      padding: "1rem 2rem",
      borderRadius: "0.5rem",
      boxShadow: "0 0.5rem 1rem rgba(0,0,0,0.2)",
      zIndex: "9999",
      fontSize: "1.4rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    });

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  saveData() {
    try {
      const pluginData = {
        selectedPlugins: this.selectedPlugins,
        licenseKeys: this.licenseKeys,
        timestamp: new Date().toISOString(),
      };

      // Update global wizard data
      if (window.wizardData) {
        window.updateWizardData("plugins", this.selectedPlugins);
        window.updateWizardData("licenseKeys", this.licenseKeys);
      }

      // Also save directly to localStorage for backward compatibility
      const wizardData = this.getWizardData() || {};
      wizardData.plugins = this.selectedPlugins;
      wizardData.licenseKeys = this.licenseKeys;
      localStorage.setItem("wizardData", JSON.stringify(wizardData));

      console.log("Plugin data saved:", pluginData);
    } catch (error) {
      console.error("Error saving plugin data:", error);
    }
  }

  getWizardData() {
    try {
      const saved = localStorage.getItem("wizardData");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Error loading wizard data:", error);
      return null;
    }
  }

  updateNextButton() {
    console.log("Step 4: Updating next button state");

    const nextBtn = document.getElementById("nextBtn");
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.classList.remove("disabled");
      console.log("Step 4: Next button enabled");
    } else {
      console.warn("Step 4: Next button not found");
    }

    // Also call global update function
    if (typeof window.updateNextButton === "function") {
      window.updateNextButton();
    }
  }

  // Public methods
  validateStep() {
    console.log("Step 4: Validating step - always returns true");

    // Save data when validating
    this.saveData();

    return true; // Always valid - plugin selection is optional
  }

  getStepData() {
    const selectedPluginIds = Object.keys(this.selectedPlugins).filter(
      (id) => this.selectedPlugins[id]
    );

    const stepData = {
      selectedPlugins: this.selectedPlugins,
      licenseKeys: this.licenseKeys,
      pluginDetails: selectedPluginIds.map((id) => ({
        id,
        name: this.getPluginName(id),
        needsLicense: this.checkIfPluginNeedsLicense(id),
        hasLicense: !!this.licenseKeys[id],
      })),
      timestamp: new Date().toISOString(),
      isValid: true,
    };

    // Save data when requested
    this.saveData();

    return stepData;
  }

  resetStep() {
    this.selectedPlugins = {};
    this.licenseKeys = {};

    document.querySelectorAll(".plugin-checkbox").forEach((checkbox) => {
      checkbox.checked = false;
    });

    document.querySelectorAll(".plugin-item").forEach((item) => {
      item.classList.remove("selected");
    });

    // Clear saved data
    if (window.wizardData) {
      window.updateWizardData("plugins", {});
      window.updateWizardData("licenseKeys", {});
    }

    this.saveData();
    this.updateNextButton();
  }

  // Method to get plugin summary for display
  getPluginSummary() {
    const selectedPluginIds = Object.keys(this.selectedPlugins || {}).filter(
      (id) => this.selectedPlugins[id]
    );

    if (selectedPluginIds.length === 0) {
      return {
        count: 0,
        list: [],
        categories: {},
      };
    }

    const summary = {
      count: selectedPluginIds.length,
      list: [],
      categories: {},
    };

    // Group plugins by category
    Object.entries(this.pluginData).forEach(([categoryKey, category]) => {
      const categoryPlugins = category.plugins.filter((plugin) =>
        selectedPluginIds.includes(plugin.id)
      );

      if (categoryPlugins.length > 0) {
        summary.categories[categoryKey] = {
          title: category.title,
          plugins: categoryPlugins.map((plugin) => ({
            id: plugin.id,
            name: plugin.name,
            needsLicense: plugin.needsLicense,
            hasLicense: !!this.licenseKeys[plugin.id],
          })),
        };
      }
    });

    // Create flat list
    selectedPluginIds.forEach((id) => {
      summary.list.push({
        id,
        name: this.getPluginName(id),
        needsLicense: this.checkIfPluginNeedsLicense(id),
        hasLicense: !!this.licenseKeys[id],
      });
    });

    return summary;
  }

  // Method to validate all required licenses are provided
  validateLicenses() {
    const selectedPluginIds = Object.keys(this.selectedPlugins).filter(
      (id) => this.selectedPlugins[id]
    );

    const missingLicenses = [];

    selectedPluginIds.forEach((id) => {
      if (this.checkIfPluginNeedsLicense(id) && !this.licenseKeys[id]) {
        missingLicenses.push({
          id,
          name: this.getPluginName(id),
        });
      }
    });

    return {
      isValid: missingLicenses.length === 0,
      missingLicenses,
    };
  }
}

// Global functions for modal
window.saveLicenseKey = function () {
  if (window.step4PluginSettings) {
    window.step4PluginSettings.saveLicenseKey();
  }
};

window.closeLicenseModal = function () {
  if (window.step4PluginSettings) {
    window.step4PluginSettings.closeLicenseModal();
  }
};

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  const step4Content = document.querySelector('.step-content[data-step="4"]');
  if (step4Content) {
    window.step4PluginSettings = new Step4PluginSettings();

    // Force reload data after initialization
    setTimeout(() => {
      if (window.step4PluginSettings) {
        window.step4PluginSettings.loadStoredData();
        window.step4PluginSettings.renderPluginSections();
        window.step4PluginSettings.updateNextButton();
      }
    }, 300);

    // Observer untuk memantau ketika step 4 menjadi aktif
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const step4 = document.querySelector('.step-content[data-step="4"]');
          if (step4 && step4.classList.contains("active")) {
            console.log("Step 4 is now active, updating button state");
            setTimeout(() => {
              if (window.step4PluginSettings) {
                // Reload data when step becomes active
                window.step4PluginSettings.loadStoredData();
                window.step4PluginSettings.updatePluginStates();
                window.step4PluginSettings.updateNextButton();
              }
            }, 100);
          }
        }
      });
    });

    // Start observing
    observer.observe(step4Content, { attributes: true });
  }
});

// Export
window.Step4PluginSettings = Step4PluginSettings;
