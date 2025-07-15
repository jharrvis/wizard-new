// Step 5: Sample Data JavaScript Module
// Updated: 2025-07-15 Clean Version - No Syntax Errors
// User: jharrvis

class Step5SampleData {
  constructor() {
    this.selectedSample = "with_sample"; // Default selection
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadStoredData();
    this.updateSelectionState();
    this.updateNextButton();
  }

  bindEvents() {
    // Radio button changes - Fixed event handling
    document.addEventListener("change", (e) => {
      if (e.target.name === "sample-data") {
        console.log("Radio button changed:", e.target.value);
        this.selectSample(e.target.value);
      }
    });

    // Click on option container - Fixed click handling
    document.addEventListener("click", (e) => {
      const optionContainer = e.target.closest(".sample-data-option");
      if (optionContainer) {
        const radioInput = optionContainer.querySelector(
          'input[name="sample-data"]'
        );
        if (radioInput && !radioInput.checked) {
          radioInput.checked = true;
          console.log("Option container clicked, selecting:", radioInput.value);
          this.selectSample(radioInput.value);
        }
      }
    });

    // Prevent label click from bubbling
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("sample-option-label")) {
        e.preventDefault();
        const optionContainer = e.target.closest(".sample-data-option");
        if (optionContainer) {
          const radioInput = optionContainer.querySelector(
            'input[name="sample-data"]'
          );
          if (radioInput) {
            radioInput.checked = true;
            console.log("Label clicked, selecting:", radioInput.value);
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
      console.log(
        "Loading sample data from localStorage:",
        savedData.sampleData
      );
      this.selectedSample = savedData.sampleData;
    } else {
      console.log("No saved data found, using default:", this.selectedSample);
    }

    // Also update global wizard data if it exists
    if (window.wizardData) {
      window.wizardData.sampleData = this.selectedSample;
    }
  }

  selectSample(sampleType) {
    console.log("Selecting sample type:", sampleType);
    this.selectedSample = sampleType;
    this.updateSelectionState();
    this.saveData();
    this.updateNextButton();
  }

  updateSelectionState() {
    console.log("Updating selection state to:", this.selectedSample);

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
          console.log("Added selected class to:", radio.value);
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
      console.log("Saving sample data:", this.selectedSample);

      // Update global wizard data
      if (window.wizardData) {
        window.updateWizardData("sampleData", this.selectedSample);
      }

      // Also save directly to localStorage for backward compatibility
      const wizardData = this.getWizardData() || {};
      wizardData.sampleData = this.selectedSample;
      wizardData.sampleDataTimestamp = new Date().toISOString();
      localStorage.setItem("wizardData", JSON.stringify(wizardData));

      console.log("Sample data saved successfully:", this.selectedSample);
    } catch (error) {
      console.error("Error saving sample data selection:", error);
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
    if (typeof window.updateNextButton === "function") {
      window.updateNextButton();
    }
  }

  // Public methods for validation and data access
  validateStep() {
    const isValid = !!this.selectedSample;
    console.log(
      "Step 5 validation:",
      isValid,
      "Selected:",
      this.selectedSample
    );

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

    console.log("Step 5 data:", stepData);

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
    console.log("Force updating Step 5...");
    this.loadStoredData();
    this.updateSelectionState();
    this.updateNextButton();
  }
}

// Initialize Step 5 when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const step5Content = document.querySelector('.step-content[data-step="5"]');
  if (step5Content) {
    window.step5SampleData = new Step5SampleData();

    // Force reload data after initialization
    setTimeout(() => {
      if (window.step5SampleData) {
        console.log("Initializing Step 5 with forced data reload...");
        window.step5SampleData.loadStoredData();
        window.step5SampleData.updateSelectionState();
        window.step5SampleData.updateNextButton();

        // Debug: Check if radio buttons exist
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
    }, 300);

    // Also initialize when step 5 becomes visible
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const step5 = document.querySelector('.step-content[data-step="5"]');
          if (step5 && step5.classList.contains("active")) {
            console.log("Step 5 became active, reloading data...");
            setTimeout(() => {
              if (window.step5SampleData) {
                // Reload data when step becomes active
                window.step5SampleData.loadStoredData();
                window.step5SampleData.updateSelectionState();
                window.step5SampleData.updateNextButton();

                // Clean up any unwanted elements
                const unwantedElements = step5.querySelectorAll(
                  '[class*="install"], [id*="install"], [class*="progress"]'
                );
                unwantedElements.forEach((el) => {
                  if (!el.closest(".sample-data-selection")) {
                    el.style.display = "none";
                  }
                });

                console.log("Step 5 data reloaded on activation");
              }
            }, 100);
          }
        }
      });
    });

    // Start observing
    const step5Element = document.querySelector('.step-content[data-step="5"]');
    if (step5Element) {
      observer.observe(step5Element, { attributes: true });
    }
  }
});

// Export for global access
window.Step5SampleData = Step5SampleData;

// Global function to force update step 5 (for debugging)
window.forceUpdateStep5 = function () {
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
