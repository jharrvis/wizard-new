// Step 5: Sample Data JavaScript Module - Updated for new structure
// Updated: 2025-07-20 - Updated for new card-style layout
// User: jharrvis

class Step5SampleData {
  constructor() {
    this.selectedSample = "with_sample"; // Default selection
    this.isProduction = true; // Production mode flag
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadStoredData();
    this.updateSelectionState();
    this.updateNextButton();
  }

  // Debug logging only when explicitly enabled
  debugLog(message, data = null) {
    if (!this.isProduction && window.DEBUG_MODE) {
      if (data) {
        console.log(`[Step5] ${message}:`, data);
      } else {
        console.log(`[Step5] ${message}`);
      }
    }
  }

  // Error logging (always enabled for critical issues)
  errorLog(message, error = null) {
    console.error(`[Step5 Error] ${message}`, error || "");
  }

  bindEvents() {
    // Radio button changes - optimized event handling
    document.addEventListener("change", (e) => {
      if (e.target.name === "sample-data") {
        this.debugLog("Radio button changed", e.target.value);
        this.selectSample(e.target.value);
      }
    });

    // Click on option container - optimized click handling
    document.addEventListener("click", (e) => {
      const optionContainer = e.target.closest(".sample-data-option");
      if (optionContainer) {
        const radioInput = optionContainer.querySelector(
          'input[name="sample-data"]'
        );
        if (radioInput && !radioInput.checked) {
          radioInput.checked = true;
          this.debugLog(
            "Option container clicked, selecting",
            radioInput.value
          );
          this.selectSample(radioInput.value);
        }
      }
    });

    // Prevent label click from bubbling - updated for new structure
    document.addEventListener("click", (e) => {
      if (
        e.target.classList.contains("sample-option-label") ||
        e.target.classList.contains("sample-data-description")
      ) {
        e.preventDefault();
        const optionContainer = e.target.closest(".sample-data-option");
        if (optionContainer) {
          const radioInput = optionContainer.querySelector(
            'input[name="sample-data"]'
          );
          if (radioInput) {
            radioInput.checked = true;
            this.debugLog(
              "Label/description clicked, selecting",
              radioInput.value
            );
            this.selectSample(radioInput.value);
          }
        }
      }
    });
  }

  loadStoredData() {
    // Always load from localStorage first for persistence across refreshes
    const savedData = this.getWizardData();

    if (savedData && savedData.sampleData) {
      this.debugLog(
        "Loading sample data from localStorage",
        savedData.sampleData
      );
      this.selectedSample = savedData.sampleData;
    } else {
      this.debugLog("No saved data found, using default", this.selectedSample);
    }

    // Also update global wizard data if it exists
    if (window.wizardData) {
      window.wizardData.sampleData = this.selectedSample;
    }
  }

  selectSample(sampleType) {
    this.debugLog("Selecting sample type", sampleType);
    this.selectedSample = sampleType;
    this.updateSelectionState();
    this.saveData();
    this.updateNextButton();
  }

  updateSelectionState() {
    this.debugLog("Updating selection state to", this.selectedSample);

    // Update radio buttons and visual states
    const radioButtons = document.querySelectorAll('input[name="sample-data"]');
    radioButtons.forEach((radio) => {
      const isChecked = radio.value === this.selectedSample;
      radio.checked = isChecked;

      // Update the visual state of parent elements
      const parentOption = radio.closest(".sample-data-option");
      if (parentOption) {
        if (isChecked) {
          parentOption.classList.add("selected");
          this.debugLog("Added selected class to", radio.value);
        } else {
          parentOption.classList.remove("selected");
        }
      }
    });

    // Update info panel
    this.updateSampleDataInfo();
  }

  updateSampleDataInfo() {
    // Add or update information based on selection
    let infoContainer = document.querySelector(".sample-data-info");

    if (!infoContainer) {
      infoContainer = document.createElement("div");
      infoContainer.className = "sample-data-info";

      const sampleDataSelection = document.querySelector(
        ".sample-data-selection"
      );
      if (sampleDataSelection) {
        sampleDataSelection.appendChild(infoContainer);
      }
    }

    const infoContent = this.getSampleDataInfo();
    infoContainer.innerHTML = `
        <h4><i class="fas fa-info-circle"></i> ${infoContent.title}</h4>
        <p>${infoContent.description}</p>
      `;
  }

  getSampleDataInfo() {
    if (this.selectedSample === "with_sample") {
      return {
        title: "Sample Data Included",
        description:
          "Your installation will include demo products, categories, customers, and orders. This helps you see how your store will look and function. Remember to remove sample data before going live.",
      };
    } else {
      return {
        title: "Clean Installation",
        description:
          "Your store will start with a clean database containing only the essential structure. You'll need to add your own products, categories, and content after installation.",
      };
    }
  }

  saveData() {
    try {
      this.debugLog("Saving sample data", this.selectedSample);

      // Update global wizard data
      if (window.wizardData) {
        window.updateWizardData("sampleData", this.selectedSample);
      }

      // Also save directly to localStorage for backward compatibility
      const wizardData = this.getWizardData() || {};
      wizardData.sampleData = this.selectedSample;
      wizardData.sampleDataTimestamp = new Date().toISOString();
      localStorage.setItem("wizardData", JSON.stringify(wizardData));

      this.debugLog("Sample data saved successfully", this.selectedSample);
    } catch (error) {
      this.errorLog("Error saving sample data selection", error);
    }
  }

  getWizardData() {
    try {
      const saved = localStorage.getItem("wizardData");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      this.errorLog("Error loading wizard data", error);
      return null;
    }
  }

  updateNextButton() {
    if (typeof window.updateNextButton === "function") {
      window.updateNextButton();
    }
  }

  // Public methods for validation and data access
  validateStep() {
    const isValid = !!this.selectedSample;
    this.debugLog("Step 5 validation", {
      isValid: isValid,
      selected: this.selectedSample,
    });

    // Save data when validating
    if (isValid) {
      this.saveData();
    }

    return isValid;
  }

  getStepData() {
    const stepData = {
      sampleData: this.selectedSample,
      useSampleData: this.selectedSample === "with_sample",
      timestamp: new Date().toISOString(),
      isValid: this.validateStep(),
    };

    this.debugLog("Step 5 data", stepData);

    // Save data when requested
    this.saveData();

    return stepData;
  }

  resetStep() {
    this.selectedSample = "with_sample";
    this.updateSelectionState();

    // Clear saved data
    if (window.wizardData) {
      window.updateWizardData("sampleData", "with_sample");
    }

    this.saveData();
  }

  // Method to get sample data summary
  getSampleDataSummary() {
    return {
      selected: this.selectedSample,
      usingSampleData: this.selectedSample === "with_sample",
      description:
        this.selectedSample === "with_sample"
          ? "Sample data will be installed for demonstration purposes"
          : "No sample data will be installed - you'll start with a clean store",
      recommendation:
        this.selectedSample === "with_sample"
          ? "Remember to remove sample data before going live"
          : "You can add your own products and content after installation",
    };
  }

  // Method to get estimated impact on installation
  getInstallationImpact() {
    return {
      additionalTime:
        this.selectedSample === "with_sample" ? "2-3 minutes" : "0 minutes",
      additionalSize:
        this.selectedSample === "with_sample" ? "50-100 MB" : "0 MB",
      includes:
        this.selectedSample === "with_sample"
          ? [
              "Sample products and categories",
              "Demo customer accounts",
              "Example orders and transactions",
              "Sample CMS pages and blocks",
              "Default store configuration",
            ]
          : ["Clean database structure", "Basic store configuration only"],
    };
  }

  // Force update method for debugging
  forceUpdate() {
    this.debugLog("Force updating Step 5...");
    this.loadStoredData();
    this.updateSelectionState();
    this.updateNextButton();
  }

  // Method to cleanup resources when component is destroyed
  cleanup() {
    // Remove any bound event listeners if they were stored
    if (this.boundEventHandlers) {
      this.boundEventHandlers.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
    }

    // Clear any pending operations
    if (this.pendingOperations) {
      this.pendingOperations.forEach((operation) => {
        if (operation.cancel) {
          operation.cancel();
        }
      });
    }

    this.debugLog("Step 5 cleanup completed");
  }
}

// Initialize Step 5 when DOM is ready - Production optimized
document.addEventListener("DOMContentLoaded", function () {
  const step5Content = document.querySelector('.step-content[data-step="5"]');
  if (step5Content) {
    window.step5SampleData = new Step5SampleData();

    // Force reload data after initialization with reduced timeout
    setTimeout(() => {
      if (window.step5SampleData) {
        window.step5SampleData.loadStoredData();
        window.step5SampleData.updateSelectionState();
        window.step5SampleData.updateNextButton();

        // Debug: Check if radio buttons exist (only in debug mode)
        if (window.DEBUG_MODE) {
          const radioButtons = document.querySelectorAll(
            'input[name="sample-data"]'
          );
          console.log("Found radio buttons:", radioButtons.length);
          radioButtons.forEach((radio, index) => {
            console.log(
              `Radio ${index}:`,
              radio.value,
              "checked:",
              radio.checked
            );
          });

          // Verify step 5 data is accessible
          const stepData = window.step5SampleData.getStepData();
          console.log("Step 5 current data:", stepData);
        }
      }
    }, 200); // Reduced timeout

    // Observer for when step 5 becomes visible - optimized
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const step5 = document.querySelector('.step-content[data-step="5"]');
          if (step5 && step5.classList.contains("active")) {
            // Use shorter timeout for better performance
            setTimeout(() => {
              if (window.step5SampleData) {
                // Reload data when step becomes active
                window.step5SampleData.loadStoredData();
                window.step5SampleData.updateSelectionState();
                window.step5SampleData.updateNextButton();

                // Clean up any unwanted elements (performance optimization)
                const unwantedElements = step5.querySelectorAll(
                  '[class*="install"], [id*="install"], [class*="progress"]'
                );
                unwantedElements.forEach((el) => {
                  if (!el.closest(".sample-data-selection")) {
                    el.style.display = "none";
                  }
                });
              }
            }, 50); // Reduced from 100ms
          }
        }
      });
    });

    // Start observing with optimized settings
    const step5Element = document.querySelector('.step-content[data-step="5"]');
    if (step5Element) {
      observer.observe(step5Element, {
        attributes: true,
        attributeFilter: ["class"], // Only watch for class changes
      });
    }
  }
});

// Cleanup on page unload to prevent memory leaks
window.addEventListener("beforeunload", function () {
  if (
    window.step5SampleData &&
    typeof window.step5SampleData.cleanup === "function"
  ) {
    window.step5SampleData.cleanup();
  }
});

// Export for global access
window.Step5SampleData = Step5SampleData;

// Global function to force update step 5 (for debugging only)
window.forceUpdateStep5 = function () {
  if (!window.DEBUG_MODE) {
    console.warn("Debug mode is disabled. Add ?debug to URL to enable.");
    return;
  }

  if (window.step5SampleData) {
    console.log("Force updating Step 5...");
    window.step5SampleData.forceUpdate();

    // Also trigger summary update if we're on step 6
    if (window.step6SummaryInstallation) {
      window.step6SummaryInstallation.updateSampleDataSummary();
    }
  } else {
    console.warn("Step 5 not initialized yet");
  }
};
