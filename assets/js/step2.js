// Step 2: Platform Selection JavaScript Module
// Updated: 2025-07-19 Performance Optimization - Reduced console logging
// User: jharrvis

class Step2PlatformSelection {
  constructor() {
    // Initialize platformData as an empty object; it will be loaded asynchronously.
    this.platformData = {};

    this.dependencyIcons = {
      php: "fab fa-php",
      mariadb: "fas fa-database",
      redis: "fas fa-memory",
      opensearch: "fas fa-search",
    };

    this.selectedPlatform = null;
    this.selectedVersion = null;

    this.init();
  }

  async init() {
    await this.loadPlatformData(); // Load platform data first
    this.bindEvents();
    this.loadStoredData();

    // Initial button state update
    setTimeout(() => {
      this.updateNextButton();
    }, 100);
  }

  // New method to load platform data from JSON
  async loadPlatformData() {
    try {
      const response = await fetch("assets/data/platform-data.json");
      if (!response.ok) {
        throw new Error("Failed to load platform-data.json");
      }
      this.platformData = await response.json();

      // Only log in debug mode
      if (window.DEBUG_MODE) {
        console.log("Platform data loaded from file:", this.platformData);
      }
    } catch (error) {
      console.error("Error loading platform data from file:", error);
      // Fallback or display error message if data cannot be loaded
      this.platformData = {};
    }
  }

  bindEvents() {
    // Platform card selection
    document.querySelectorAll(".platform-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        const platform = card.dataset.platform;
        this.selectPlatform(platform);
      });
    });

    // Version selection
    const versionSelect = document.getElementById("versionSelect");
    if (versionSelect) {
      versionSelect.addEventListener("change", (e) => {
        this.selectVersion(e.target.value);
      });
    }
  }

  loadStoredData() {
    // Always load from localStorage first for persistence across refreshes
    const savedData = this.getWizardData();

    if (savedData && savedData.platform) {
      // Only log in debug mode
      if (window.DEBUG_MODE) {
        console.log(
          "Loading platform data from localStorage:",
          savedData.platform
        );
      }

      // Load platform first
      if (savedData.platform.selected) {
        this.selectedPlatform = savedData.platform.selected;
        this.updatePlatformUI(savedData.platform.selected);

        // Show version section immediately
        const versionSection = document.getElementById("versionSection");
        if (versionSection) {
          versionSection.classList.add("show");
        }

        // Populate version dropdown
        this.populateVersionSelect(savedData.platform.selected);

        // Load version after platform is set
        if (savedData.platform.version) {
          setTimeout(() => {
            this.selectedVersion = savedData.platform.version;
            this.updateVersionUI(savedData.platform.version);
            this.showDependencies(this.selectedPlatform, this.selectedVersion);
          }, 200);
        }
      }
    }

    // Also update global wizard data if it exists
    if (window.wizardData && savedData) {
      window.wizardData.platform = savedData.platform;
    }
  }

  updatePlatformUI(platform) {
    // Update UI to show selected platform
    document.querySelectorAll(".platform-card").forEach((card) => {
      card.classList.remove("selected");
    });

    const selectedCard = document.querySelector(
      `[data-platform="${platform}"]`
    );
    if (selectedCard) {
      selectedCard.classList.add("selected");
    }
  }

  updateVersionUI(version) {
    // Update version dropdown to show selected version
    const versionSelect = document.getElementById("versionSelect");
    if (versionSelect) {
      // Find and select the correct option
      const options = versionSelect.querySelectorAll("option");
      options.forEach((option) => {
        if (option.value === version) {
          option.selected = true;
        }
      });
      versionSelect.value = version;
    }
  }

  selectPlatform(platform) {
    // Reset version when platform changes
    if (this.selectedPlatform !== platform) {
      this.selectedVersion = null;
      this.hideDependencies();
    }

    // Update UI
    document.querySelectorAll(".platform-card").forEach((card) => {
      card.classList.remove("selected");
    });

    const selectedCard = document.querySelector(
      `[data-platform="${platform}"]`
    );
    if (selectedCard) {
      selectedCard.classList.add("selected");
    }

    // Update data
    this.selectedPlatform = platform;
    this.saveToWizardData();

    // Reset and populate version dropdown
    this.resetVersionSelect();
    this.populateVersionSelect(platform);

    // Show version section
    const versionSection = document.getElementById("versionSection");
    if (versionSection) {
      versionSection.classList.add("show");
    }

    // Update theme options in step 3 if available
    if (typeof window.updateThemeGrid === "function") {
      window.updateThemeGrid(platform);
    }

    // Update next button state
    this.updateNextButton();
  }

  selectVersion(version) {
    if (!version || !this.selectedPlatform) {
      this.selectedVersion = null;
      this.hideDependencies();
      this.updateNextButton();
      return;
    }

    this.selectedVersion = version;
    this.saveToWizardData();

    // Show dependencies
    this.showDependencies(this.selectedPlatform, version);

    // Update next button state
    this.updateNextButton();
  }

  resetVersionSelect() {
    const versionSelect = document.getElementById("versionSelect");
    if (versionSelect) {
      versionSelect.innerHTML = '<option value="">Choose version...</option>';
      versionSelect.value = "";
    }
  }

  populateVersionSelect(platform) {
    const versionSelect = document.getElementById("versionSelect");
    if (!versionSelect || !this.platformData[platform]) return;

    // Clear existing options
    versionSelect.innerHTML = '<option value="">Choose version...</option>';

    // Get versions for the platform
    const versions = Object.keys(this.platformData[platform].versions);

    // Add all version options
    versions.forEach((version) => {
      const option = document.createElement("option");
      option.value = version;
      option.textContent = version;
      versionSelect.appendChild(option);
    });

    // If we have a selected version, set it
    if (this.selectedVersion) {
      versionSelect.value = this.selectedVersion;
    }

    // Update button state after versions are loaded
    this.updateNextButton();
  }

  showDependencies(platform, version) {
    const dependenciesContainer = document.getElementById("dependenciesList");
    const dependenciesDisplay = document.getElementById("dependenciesDisplay");

    if (!dependenciesContainer || !dependenciesDisplay) return;

    const dependencies = this.platformData[platform]?.versions[version];
    if (!dependencies) return;

    // Clear existing dependencies
    dependenciesContainer.innerHTML = "";

    // Create dependency items
    Object.entries(dependencies).forEach(([dep, depVersion]) => {
      if (depVersion !== "N/A") {
        const dependencyItem = this.createDependencyItem(dep, depVersion);
        dependenciesContainer.appendChild(dependencyItem);
      }
    });

    // Show dependencies section with animation
    dependenciesDisplay.classList.add("show");
  }

  hideDependencies() {
    const dependenciesDisplay = document.getElementById("dependenciesDisplay");
    if (dependenciesDisplay) {
      dependenciesDisplay.classList.remove("show");
    }
  }

  createDependencyItem(dependency, version) {
    const item = document.createElement("div");
    item.className = "dependency-item";

    const iconClass = this.dependencyIcons[dependency] || "fas fa-cog";

    item.innerHTML = `
              <div class="dependency-icon ${dependency}">
                <i class="${iconClass}"></i>
              </div>
              <div class="dependency-details">
                <div class="dependency-name">${dependency.toUpperCase()}</div>
                <div class="dependency-version">v${version}</div>
              </div>
            `;

    // Add hover effect
    item.addEventListener("mouseenter", () => {
      item.style.transform = "translateY(-2px)";
    });

    item.addEventListener("mouseleave", () => {
      item.style.transform = "translateY(0)";
    });

    return item;
  }

  saveToWizardData() {
    try {
      const dependencies =
        this.selectedPlatform && this.selectedVersion
          ? this.platformData[this.selectedPlatform]?.versions[
              this.selectedVersion
            ]
          : null;

      const platformData = {
        selected: this.selectedPlatform,
        version: this.selectedVersion,
        dependencies: dependencies,
        timestamp: new Date().toISOString(),
      };

      // Update global wizard data
      if (window.wizardData) {
        window.updateWizardData("platform", platformData);
      }

      // Also save directly to localStorage for backward compatibility
      const wizardData = this.getWizardData() || {};
      wizardData.platform = platformData;
      localStorage.setItem("wizardData", JSON.stringify(wizardData));

      // Only log in debug mode
      if (window.DEBUG_MODE) {
        console.log("Platform data saved:", platformData);
      }
    } catch (error) {
      console.error("Error saving platform data:", error);
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
    // Update button state immediately
    const nextBtn = document.getElementById("nextBtn");
    const isValid = this.validateStep();

    if (nextBtn) {
      nextBtn.disabled = !isValid;

      // Add visual feedback
      if (isValid) {
        nextBtn.classList.remove("disabled");
      } else {
        nextBtn.classList.add("disabled");
      }
    }

    // Also call global update function if available
    if (typeof window.updateNextButton === "function") {
      window.updateNextButton();
    }
  }

  // Public methods for validation and data access
  validateStep() {
    const isValid = !!(this.selectedPlatform && this.selectedVersion);

    // Only log in debug mode
    if (window.DEBUG_MODE) {
      console.log("Step 2 validation:", {
        platform: this.selectedPlatform,
        version: this.selectedVersion,
        isValid: isValid,
      });
    }

    // Save data when validating
    if (isValid) {
      this.saveToWizardData();
    }

    return isValid;
  }

  getStepData() {
    const stepData = {
      platform: this.selectedPlatform,
      version: this.selectedVersion,
      dependencies:
        this.selectedPlatform && this.selectedVersion
          ? this.platformData[this.selectedPlatform]?.versions[
              this.selectedVersion
            ]
          : null,
      timestamp: new Date().toISOString(),
      isValid: this.validateStep(),
    };

    // Save data when requested
    if (stepData.isValid) {
      this.saveToWizardData();
    }

    return stepData;
  }

  resetStep() {
    // Clear selections
    this.selectedPlatform = null;
    this.selectedVersion = null;

    // Reset UI
    document.querySelectorAll(".platform-card").forEach((card) => {
      card.classList.remove("selected");
    });

    const versionSelect = document.getElementById("versionSelect");
    if (versionSelect) {
      versionSelect.innerHTML = '<option value="">Choose version...</option>';
      versionSelect.value = "";
    }

    const versionSection = document.getElementById("versionSection");
    if (versionSection) {
      versionSection.classList.remove("show");
    }

    this.hideDependencies();

    // Clear saved data
    if (window.wizardData) {
      window.updateWizardData("platform", {
        selected: "",
        version: "",
        dependencies: null,
        timestamp: new Date().toISOString(),
      });
    }

    // Update button state
    this.updateNextButton();
  }

  // Method to get available versions for a platform
  getVersionsForPlatform(platform) {
    return this.platformData[platform]
      ? Object.keys(this.platformData[platform].versions)
      : [];
  }

  // Method to get dependencies for a specific platform/version
  getDependencies(platform, version) {
    return this.platformData[platform]?.versions[version] || null;
  }

  // Method to check if a platform supports a specific feature
  platformSupports(platform, feature) {
    const featureMap = {
      ecommerce: ["magento"],
      cms: ["wordpress"],
      framework: ["laravel"],
      plugins: ["magento", "wordpress"],
      themes: ["magento", "wordpress"],
      multistore: ["magento"],
    };

    return featureMap[feature]?.includes(platform) || false;
  }
}

// Initialize Step 2 when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const step2Content = document.querySelector('.step-content[data-step="2"]');
  if (step2Content) {
    window.step2PlatformSelection = new Step2PlatformSelection();

    // Force reload data after initialization
    setTimeout(() => {
      if (window.step2PlatformSelection) {
        window.step2PlatformSelection.loadStoredData();
        window.step2PlatformSelection.updateNextButton();
      }
    }, 200);

    // Also initialize when step 2 becomes visible
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const step2 = document.querySelector('.step-content[data-step="2"]');
          if (step2 && step2.classList.contains("active")) {
            setTimeout(() => {
              if (window.step2PlatformSelection) {
                // Reload data when step becomes active
                window.step2PlatformSelection.loadStoredData();
                window.step2PlatformSelection.updateNextButton();
              }
            }, 100);
          }
        }
      });
    });

    // Start observing
    const step2Element = document.querySelector('.step-content[data-step="2"]');
    if (step2Element) {
      observer.observe(step2Element, { attributes: true });
    }
  }
});

// Export for global access
window.Step2PlatformSelection = Step2PlatformSelection;
