// Main wizard controller
// Updated: 2025-07-19 Performance Optimization - Removed excessive console logging
// User: jharrvis

// Global wizard data object with complete structure
window.wizardData = {
  storeInfo: {
    name: "",
    timestamp: null,
  },
  platform: {
    selected: "",
    version: "",
    dependencies: null,
    timestamp: null,
  },
  theme: "",
  styling: {
    colors: {
      primary: "#4e54c8",
      secondary: "#8f94fb",
      tertiary: "#19b78a",
    },
    fonts: {
      useDefault: true,
      customFont: "",
      family: "default",
    },
    logos: {
      desktop: null,
      mobile: null,
      desktopName: null,
      mobileName: null,
    },
    timestamp: null,
  },
  plugins: {},
  licenseKeys: {},
  sampleData: "with_sample",
  installationMeta: {
    created: new Date().toISOString(),
    lastModified: null,
    version: "1.0",
  },
};

// Save wizard data to localStorage with validation
window.saveWizardData = function () {
  try {
    // Update last modified timestamp
    window.wizardData.installationMeta.lastModified = new Date().toISOString();

    // Save to localStorage
    localStorage.setItem("wizardData", JSON.stringify(window.wizardData));

    // Update summary if we're on step 6
    if (getCurrentStep() === 6 && window.step6SummaryInstallation) {
      setTimeout(() => {
        window.step6SummaryInstallation.loadWizardData();
        window.step6SummaryInstallation.generateSummary();
      }, 100);
    }

    // Only log in development mode
    if (window.DEBUG_MODE) {
      console.log("Wizard data saved:", window.wizardData);
    }
  } catch (error) {
    console.error("Error saving wizard data:", error);
  }
};

// Load wizard data from localStorage
window.loadWizardData = function () {
  try {
    const saved = localStorage.getItem("wizardData");
    if (saved) {
      const parsedData = JSON.parse(saved);
      // Merge with default structure to ensure all properties exist
      window.wizardData = mergeDeep(window.wizardData, parsedData);

      // Only log in development mode
      if (window.DEBUG_MODE) {
        console.log("Wizard data loaded:", window.wizardData);
      }
    }
  } catch (error) {
    console.error("Error loading wizard data:", error);
  }
};

// Deep merge utility function
function mergeDeep(target, source) {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

// Update specific section of wizard data
window.updateWizardData = function (section, data, saveImmediately = true) {
  try {
    if (section && data) {
      // Add timestamp to the section
      if (typeof data === "object" && data !== null) {
        data.timestamp = new Date().toISOString();
      }

      // Update the specific section
      window.wizardData[section] = { ...window.wizardData[section], ...data };

      if (saveImmediately) {
        window.saveWizardData();
      }

      // Only log in development mode
      if (window.DEBUG_MODE) {
        console.log(`Updated ${section}:`, window.wizardData[section]);
      }
    }
  } catch (error) {
    console.error(`Error updating ${section}:`, error);
  }
};

// Get current step number
function getCurrentStep() {
  const activeStep = document.querySelector(".step-content.active");
  return activeStep ? parseInt(activeStep.dataset.step) : 1;
}

// Update next button state based on current step validation
window.updateNextButton = function () {
  const nextBtn = document.getElementById("nextBtn");
  const currentStep = getCurrentStep();

  let isValid = false;

  // Check validation for current step
  switch (currentStep) {
    case 1:
      if (window.step1StoreInfo) {
        isValid = window.step1StoreInfo.validateStep();
      }
      break;
    case 2:
      if (window.step2PlatformSelection) {
        isValid = window.step2PlatformSelection.validateStep();
      }
      break;
    case 3:
      if (window.step3StylesDesign) {
        isValid = window.step3StylesDesign.validateStep();
      }
      break;
    case 4:
      // Step 4 is always valid - plugin selection is optional
      isValid = true;
      break;
    case 5:
      if (window.step5SampleData) {
        isValid = window.step5SampleData.validateStep();
      }
      break;
    case 6:
      // Step 6 validation: check if all required data is present
      if (window.step6SummaryInstallation) {
        isValid = window.step6SummaryInstallation.validateStep();
      }
      break;
  }

  if (nextBtn) {
    nextBtn.disabled = !isValid;

    // Add visual feedback
    if (isValid) {
      nextBtn.classList.remove("disabled");
    } else {
      nextBtn.classList.add("disabled");
    }
  }
};

// Initialize wizard when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Set debug mode based on URL parameter or environment
  window.DEBUG_MODE =
    new URLSearchParams(window.location.search).has("debug") ||
    window.location.hostname === "localhost";

  // Load saved wizard data first
  window.loadWizardData();

  // Set up navigation buttons
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      if (!this.disabled) {
        nextStep();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      if (!this.disabled) {
        prevStep();
      }
    });
  }

  // Force reload of all step data after DOM is ready
  setTimeout(() => {
    // Load data for each step based on localStorage
    if (window.step1StoreInfo) {
      window.step1StoreInfo.loadStoredData();
    }
    if (window.step2PlatformSelection) {
      window.step2PlatformSelection.loadStoredData();
    }
    if (window.step3StylesDesign) {
      window.step3StylesDesign.loadStoredData();
      window.step3StylesDesign.updateThemeOptions();
    }
    if (window.step4PluginSettings) {
      window.step4PluginSettings.loadStoredData();
      window.step4PluginSettings.renderPluginSections();
    }
    if (window.step5SampleData) {
      window.step5SampleData.loadStoredData();
    }
    if (window.step6SummaryInstallation) {
      window.step6SummaryInstallation.loadWizardData();
      window.step6SummaryInstallation.generateSummary();
    }

    // Update button state for current step
    window.updateNextButton();
  }, 500);

  // Optimized auto-save - reduced frequency
  setInterval(() => {
    window.saveWizardData();
  }, 60000); // Changed from 30s to 60s
});

// Navigation functions
function nextStep() {
  const currentStep = getCurrentStep();
  const maxStep = 6;

  // Save data before moving to next step
  window.saveWizardData();

  if (currentStep < maxStep) {
    showStep(currentStep + 1);
  } else {
    // Last step - trigger installation via Step6SummaryInstallation instance
    if (window.step6SummaryInstallation) {
      // Validate step 6 before starting installation
      if (window.step6SummaryInstallation.validateStep()) {
        window.step6SummaryInstallation.startInstallation();
      } else {
        console.warn(
          "Installation cannot start: Missing required configuration."
        );
      }
    } else {
      console.error("Step6SummaryInstallation not initialized.");
    }
  }
}

function prevStep() {
  const currentStep = getCurrentStep();

  if (currentStep > 1) {
    showStep(currentStep - 1);
  }
}

function showStep(stepNumber) {
  // Save current step data before moving
  window.saveWizardData();

  // Hide all steps
  const allSteps = document.querySelectorAll(".step-content");
  allSteps.forEach((step) => step.classList.remove("active"));

  // Show target step
  const targetStep = document.querySelector(
    `.step-content[data-step="${stepNumber}"]`
  );
  if (targetStep) {
    targetStep.classList.add("active");
  }

  // Update sidebar
  const sidebarItems = document.querySelectorAll(".step-item");
  sidebarItems.forEach((item) => {
    item.classList.remove("active");
    if (parseInt(item.dataset.step) === stepNumber) {
      item.classList.add("active");
    }
  });

  // Update progress bar
  updateProgressBar(stepNumber);

  // Update navigation buttons
  updateNavigationButtons(stepNumber);

  // Update button state for new step with delay
  setTimeout(() => {
    // Special handling for each step
    switch (stepNumber) {
      case 1:
        if (window.step1StoreInfo) {
          window.step1StoreInfo.loadStoredData();
        }
        break;
      case 2:
        if (window.step2PlatformSelection) {
          window.step2PlatformSelection.loadStoredData();
        }
        break;
      case 3:
        if (window.step3StylesDesign) {
          window.step3StylesDesign.loadStoredData();
          window.step3StylesDesign.updateThemeOptions();
        }
        break;
      case 4:
        if (window.step4PluginSettings) {
          window.step4PluginSettings.loadStoredData();
          window.step4PluginSettings.updatePluginStates();
        }
        break;
      case 5:
        if (window.step5SampleData) {
          window.step5SampleData.loadStoredData();
          window.step5SampleData.updateSelectionState();
        }
        break;
      case 6:
        if (window.step6SummaryInstallation) {
          window.step6SummaryInstallation.loadWizardData();
          window.step6SummaryInstallation.generateSummary();
        }
        break;
    }

    window.updateNextButton();
  }, 150);
}

function updateProgressBar(stepNumber) {
  const progressFill = document.querySelector(".progress-fill");
  const progressText = document.querySelector(".progress-text");

  if (progressFill) {
    const percentage = (stepNumber / 6) * 100;
    progressFill.style.width = percentage + "%";
  }

  if (progressText) {
    const stepNames = [
      "Store Info",
      "Platform",
      "Styles",
      "Plugin Settings",
      "Sample Data",
      "Summary",
    ];
    progressText.textContent = `Step ${stepNumber} of 6 - ${
      stepNames[stepNumber - 1]
    }`;
  }
}

function updateNavigationButtons(stepNumber) {
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const navInfo = document.querySelector(".current-step");

  if (prevBtn) {
    prevBtn.disabled = stepNumber === 1;
  }

  if (nextBtn) {
    if (stepNumber === 6) {
      nextBtn.innerHTML = '<i class="fas fa-rocket"></i> Install Now';
    } else {
      nextBtn.innerHTML = 'Next Step <i class="fas fa-arrow-right"></i>';
    }
  }

  if (navInfo) {
    navInfo.textContent = `Step ${stepNumber} of 6`;
  }
}

// Export configuration with complete data
window.exportConfiguration = function () {
  if (window.step6SummaryInstallation) {
    window.step6SummaryInstallation.exportConfiguration();
  } else {
    console.error("Step6SummaryInstallation not initialized for export.");
  }
};

// License modal functions (these are still used by step4.js, so keep them)
function openLicenseModal(pluginName) {
  const modal = document.getElementById("licenseModal");
  const title = document.getElementById("licenseModalTitle");

  if (modal && title) {
    title.textContent = `Enter License Key for ${pluginName}`;
    modal.style.display = "flex";
    modal.dataset.plugin = pluginName;
  }
}

function closeLicenseModal() {
  const modal = document.getElementById("licenseModal");
  if (modal) {
    modal.style.display = "none";
    document.getElementById("licenseKeyInput").value = "";
  }
}

function saveLicenseKey() {
  const modal = document.getElementById("licenseModal");
  const input = document.getElementById("licenseKeyInput");
  const pluginName = modal.dataset.plugin;

  if (input.value.trim()) {
    // Save license key to wizard data
    if (!window.wizardData.licenseKeys) {
      window.wizardData.licenseKeys = {};
    }
    window.wizardData.licenseKeys[pluginName] = input.value.trim();
    window.saveWizardData();

    closeLicenseModal();

    // Update UI to show license key is saved
    const plugin = document.querySelector(`[data-plugin="${pluginName}"]`);
    if (plugin) {
      const licenseIndicator = plugin.querySelector(".plugin-license-status");
      if (licenseIndicator) {
        licenseIndicator.textContent = "✓ License key configured";
      }
    }
  }
}

// Update user profile
function updateUserProfile() {
  const userNameElement = document.querySelector(".user-name");
  if (userNameElement) {
    userNameElement.textContent = "John Doe";
  }

  const userAvatar = document.querySelector(".avatar-image");
  if (userAvatar) {
    userAvatar.src = "https://placehold.co/40x40/009bde/ffffff?text=JD";
    userAvatar.alt = "John Doe Avatar";
  }
}

// Debug function - only available in debug mode
window.debugWizardData = function () {
  if (!window.DEBUG_MODE) {
    console.warn("Debug mode is disabled. Add ?debug to URL to enable.");
    return;
  }

  console.log("=== Wizard Data Debug ===");
  console.log("Global wizard data:", window.wizardData);

  const localStorageData = localStorage.getItem("wizardData");
  console.log("LocalStorage raw:", localStorageData);

  if (localStorageData) {
    try {
      const parsed = JSON.parse(localStorageData);
      console.log("LocalStorage parsed:", parsed);
    } catch (e) {
      console.error("Error parsing localStorage data:", e);
    }
  }

  // Check each step's current state
  console.log("--- Step States ---");
  if (window.step1StoreInfo) {
    console.log("Step 1 data:", window.step1StoreInfo.getStepData());
  }
  if (window.step2PlatformSelection) {
    console.log("Step 2 data:", window.step2PlatformSelection.getStepData());
  }
  if (window.step3StylesDesign) {
    console.log("Step 3 data:", window.step3StylesDesign.getStepData());
  }
  if (window.step4PluginSettings) {
    console.log("Step 4 data:", window.step4PluginSettings.getStepData());
  }
  if (window.step5SampleData) {
    console.log("Step 5 data:", window.step5SampleData.getStepData());
  }
  if (window.step6SummaryInstallation) {
    console.log("Step 6 data:", window.step6SummaryInstallation.getStepData());
  }
  console.log("========================");
};

// Function to force reload all step data - only in debug mode
window.reloadAllStepData = function () {
  if (!window.DEBUG_MODE) {
    console.warn("Debug mode is disabled. Add ?debug to URL to enable.");
    return;
  }

  console.log("=== Force Reloading All Step Data ===");

  // Reload data for each step
  if (window.step1StoreInfo) {
    window.step1StoreInfo.loadStoredData();
    console.log("Step 1 reloaded");
  }
  if (window.step2PlatformSelection) {
    window.step2PlatformSelection.loadStoredData();
    console.log("Step 2 reloaded");
  }
  if (window.step3StylesDesign) {
    window.step3StylesDesign.loadStoredData();
    window.step3StylesDesign.updateThemeOptions();
    console.log("Step 3 reloaded");
  }
  if (window.step4PluginSettings) {
    window.step4PluginSettings.loadStoredData();
    window.step4PluginSettings.updatePluginStates();
    console.log("Step 4 reloaded");
  }
  if (window.step5SampleData) {
    window.step5SampleData.loadStoredData();
    console.log("Step 5 reloaded");
  }
  if (window.step6SummaryInstallation) {
    window.step6SummaryInstallation.loadWizardData();
    window.step6SummaryInstallation.generateSummary();
    console.log("Step 6 reloaded");
  }

  // Update button state
  window.updateNextButton();
  console.log("===================================");
};

// Function to clear all wizard data
window.clearWizardData = function () {
  if (
    confirm(
      "Are you sure you want to clear all wizard data? This cannot be undone."
    )
  ) {
    localStorage.removeItem("wizardData");
    localStorage.removeItem("wizardBackup");
    localStorage.removeItem("finalInstallationConfig");

    // Reset global data
    window.wizardData = {
      storeInfo: { name: "", timestamp: null },
      platform: {
        selected: "",
        version: "",
        dependencies: null,
        timestamp: null,
      },
      theme: "",
      styling: {
        colors: {
          primary: "#4e54c8",
          secondary: "#8f94fb",
          tertiary: "#19b78a",
        },
        fonts: { useDefault: true, customFont: "", family: "default" },
        logos: {
          desktop: null,
          mobile: null,
          desktopName: null,
          mobileName: null,
        },
        timestamp: null,
      },
      plugins: {},
      licenseKeys: {},
      sampleData: "with_sample",
      installationMeta: {
        created: new Date().toISOString(),
        lastModified: null,
        version: "1.0",
      },
    };

    console.log("All wizard data cleared");

    // Reload the page to reset everything
    if (confirm("Reload the page to reset the wizard?")) {
      location.reload();
    }
  }
};

// Initialize user profile update
document.addEventListener("DOMContentLoaded", function () {
  updateUserProfile();
});
