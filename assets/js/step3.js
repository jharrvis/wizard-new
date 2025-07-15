// Step 3: Styles & Design JavaScript Module
// Updated: 2025-07-15 Enhanced Data Management
// User: jharrvis

class Step3StylesDesign {
  constructor() {
    this.currentTab = "theme";
    this.selectedTheme = null;
    this.useDefaultFont = true;
    this.customFont = null;
    this.colors = {
      primary: "#4e54c8",
      secondary: "#8f94fb",
      tertiary: "#19b78a",
    };
    this.logos = {
      desktop: null,
      mobile: null,
      desktopName: null,
      mobileName: null,
    };

    this.popularGoogleFonts = [
      "Open Sans",
      "Roboto",
      "Lato",
      "Montserrat",
      "Poppins",
      "Source Sans Pro",
      "Oswald",
      "Raleway",
      "Nunito",
      "Playfair Display",
      "Merriweather",
      "Ubuntu",
      "Roboto Condensed",
      "Roboto Slab",
      "PT Sans",
      "Noto Sans",
      "Libre Baskerville",
      "Crimson Text",
      "Work Sans",
      "Fira Sans",
      "Inter",
      "Rubik",
      "Quicksand",
      "Barlow",
      "Titillium Web",
    ];

    this.themePreviewData = {
      luma: {
        name: "Luma Theme",
        desktop:
          "https://placehold.co/800x600/f8f9fa/6c757d?text=Luma+Desktop+Preview",
        mobile:
          "https://placehold.co/400x600/f8f9fa/6c757d?text=Luma+Mobile+Preview",
      },
      hyva: {
        name: "Hyvä Theme",
        desktop:
          "https://placehold.co/800x600/e3f2fd/1976d2?text=Hyva+Desktop+Preview",
        mobile:
          "https://placehold.co/400x600/e3f2fd/1976d2?text=Hyva+Mobile+Preview",
      },
      default: {
        name: "Default Theme",
        desktop:
          "https://placehold.co/800x600/ffffff/666666?text=Default+Desktop+Preview",
        mobile:
          "https://placehold.co/400x600/ffffff/666666?text=Default+Mobile+Preview",
      },
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadStoredData();
    this.initializeColorGuide();
    this.updateThemeOptions();
  }

  bindEvents() {
    // Tab navigation
    document.querySelectorAll(".style-tabs .tab-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        const tab = button.getAttribute("data-tab");
        this.switchTab(tab);
      });
    });

    // Theme selection
    document.querySelectorAll(".theme-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        const theme = item.getAttribute("data-theme");
        this.selectTheme(theme);
      });
    });

    // Logo uploads
    const desktopLogoFile = document.getElementById("desktopLogoFile");
    const mobileLogoFile = document.getElementById("mobileLogoFile");

    if (desktopLogoFile) {
      desktopLogoFile.addEventListener("change", (e) => {
        this.handleLogoUpload(e.target, "desktop");
      });
    }

    if (mobileLogoFile) {
      mobileLogoFile.addEventListener("change", (e) => {
        this.handleLogoUpload(e.target, "mobile");
      });
    }

    // Color inputs
    ["primary", "secondary", "tertiary"].forEach((colorType) => {
      const picker = document.getElementById(`${colorType}ColorPicker`);
      const input = document.getElementById(`${colorType}ColorValue`);

      if (picker) {
        picker.addEventListener("input", (e) => {
          this.updateColor(colorType, e.target.value);
        });
      }

      if (input) {
        input.addEventListener("input", (e) => {
          this.updateColorFromText(colorType, e.target.value);
        });
      }
    });

    // Font selection
    const useDefaultFont = document.getElementById("useDefaultFont");
    if (useDefaultFont) {
      useDefaultFont.addEventListener("change", (e) => {
        this.toggleFontSelection(e.target.checked);
      });
    }

    const fontSearchInput = document.getElementById("fontSearchInput");
    if (fontSearchInput) {
      fontSearchInput.addEventListener("input", (e) => {
        this.searchGoogleFonts(e.target.value);
      });
    }

    // Theme preview button
    const previewBtn = document.querySelector(".theme-preview-section button");
    if (previewBtn) {
      previewBtn.addEventListener("click", () => {
        this.openThemePreview();
      });
    }

    // Click outside to close font suggestions
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".font-search-container")) {
        this.hideFontSuggestions();
      }
    });
  }

  loadStoredData() {
    // Always load from localStorage first for persistence across refreshes
    const savedData = this.getWizardData();

    if (savedData) {
      console.log("Loading styling data from localStorage:", savedData);

      // Load theme
      if (savedData.theme) {
        this.selectedTheme = savedData.theme;
        this.updateThemeUI(savedData.theme);
      }

      // Load styling data
      if (savedData.styling) {
        const styling = savedData.styling;

        // Colors
        if (styling.colors) {
          Object.assign(this.colors, styling.colors);
          this.updateColorInputs();
        }

        // Fonts
        if (styling.fonts) {
          if (styling.fonts.useDefault !== undefined) {
            this.useDefaultFont = styling.fonts.useDefault;
            this.toggleFontSelection(this.useDefaultFont);
          }

          if (styling.fonts.customFont && !this.useDefaultFont) {
            this.customFont = styling.fonts.customFont;
            const fontInput = document.getElementById("fontSearchInput");
            if (fontInput) {
              fontInput.value = this.customFont;
              this.loadGoogleFont(this.customFont);
              this.updateFontPreview(this.customFont);
            }
          }
        }

        // Logos - restore from base64 data
        if (styling.logos) {
          Object.assign(this.logos, styling.logos);
          this.displayLogos();
        }
      }
    }

    // Also update global wizard data if it exists
    if (window.wizardData && savedData) {
      if (savedData.theme) window.wizardData.theme = savedData.theme;
      if (savedData.styling) window.wizardData.styling = savedData.styling;
    }
  }

  updateThemeUI(themeName) {
    // Update UI to show selected theme
    document.querySelectorAll(".theme-item").forEach((item) => {
      item.classList.remove("selected");
    });

    const selectedItem = document.querySelector(`[data-theme="${themeName}"]`);
    if (selectedItem) {
      selectedItem.classList.add("selected");
    }

    // Update radio buttons if they exist
    const radioInput = document.querySelector(`input[value="${themeName}"]`);
    if (radioInput) {
      radioInput.checked = true;
    }
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update tab buttons
    document.querySelectorAll(".style-tabs .tab-button").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

    // Update tab panels
    document.querySelectorAll(".style-tabs .tab-panel").forEach((panel) => {
      panel.classList.remove("active");
    });
    document
      .querySelector(`.style-tabs .tab-panel[data-tab="${tabName}"]`)
      .classList.add("active");
  }

  selectTheme(themeName) {
    this.selectedTheme = themeName;

    // Update UI
    document.querySelectorAll(".theme-item").forEach((item) => {
      item.classList.remove("selected");
    });

    const selectedItem = document.querySelector(`[data-theme="${themeName}"]`);
    if (selectedItem) {
      selectedItem.classList.add("selected");
    }

    // Update radio buttons
    const radioInput = document.querySelector(`input[value="${themeName}"]`);
    if (radioInput) {
      radioInput.checked = true;
    }

    // Save data
    this.saveThemeData();
    this.updateNextButton();
  }

  updateThemeOptions() {
    // Get platform from wizard data
    const platform =
      window.wizardData?.platform?.selected ||
      this.getWizardData()?.platform?.selected;

    const magentoThemes = document.querySelectorAll(".magento-themes");
    const defaultThemes = document.querySelectorAll(".default-themes");

    if (platform === "magento") {
      magentoThemes.forEach((theme) => (theme.style.display = "block"));
      defaultThemes.forEach((theme) => (theme.style.display = "none"));

      // Select default Magento theme if none selected
      if (
        !this.selectedTheme ||
        !["luma", "hyva"].includes(this.selectedTheme)
      ) {
        this.selectTheme("luma");
      }
    } else {
      magentoThemes.forEach((theme) => (theme.style.display = "none"));
      defaultThemes.forEach((theme) => (theme.style.display = "block"));

      // Select default theme if none selected
      if (
        !this.selectedTheme ||
        ["luma", "hyva"].includes(this.selectedTheme)
      ) {
        this.selectTheme("default");
      }
    }
  }

  handleLogoUpload(input, type) {
    const file = input.files[0];
    if (!file) return;

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }

    if (!file.type.match(/^image\/(png|jpg|jpeg|svg\+xml)$/)) {
      alert("Please upload a valid image file (PNG, JPG, SVG)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.logos[type] = e.target.result;
      this.logos[`${type}Name`] = file.name;
      this.displayLogo(type, e.target.result);
      this.saveStylingData();
    };
    reader.readAsDataURL(file);
  }

  displayLogo(type, src) {
    const previewId =
      type === "desktop" ? "desktopLogoPreview" : "mobileLogoPreview";
    const imageId = type === "desktop" ? "desktopLogoImage" : "mobileLogoImage";

    const preview = document.getElementById(previewId);
    const image = document.getElementById(imageId);

    if (preview && image) {
      image.src = src;
      preview.style.display = "block";
    }
  }

  displayLogos() {
    if (this.logos.desktop) {
      this.displayLogo("desktop", this.logos.desktop);
    }
    if (this.logos.mobile) {
      this.displayLogo("mobile", this.logos.mobile);
    }
  }

  updateColor(colorType, value) {
    this.colors[colorType] = value;

    // Update text input
    const textInput = document.getElementById(`${colorType}ColorValue`);
    if (textInput) {
      textInput.value = value;
    }

    this.saveStylingData();
    this.updateColorGuide();
  }

  updateColorFromText(colorType, value) {
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      this.colors[colorType] = value;

      // Update color picker
      const picker = document.getElementById(`${colorType}ColorPicker`);
      if (picker) {
        picker.value = value;
      }

      this.saveStylingData();
      this.updateColorGuide();
    }
  }

  updateColorInputs() {
    Object.entries(this.colors).forEach(([type, value]) => {
      const picker = document.getElementById(`${type}ColorPicker`);
      const input = document.getElementById(`${type}ColorValue`);

      if (picker) picker.value = value;
      if (input) input.value = value;
    });

    this.updateColorGuide();
  }

  updateColorGuide() {
    const primaryDemo = document.querySelector(".primary-demo");
    const secondaryDemo = document.querySelector(".secondary-demo");
    const tertiaryDemo = document.querySelector(".tertiary-demo");

    if (primaryDemo) primaryDemo.style.backgroundColor = this.colors.primary;
    if (secondaryDemo)
      secondaryDemo.style.backgroundColor = this.colors.secondary;
    if (tertiaryDemo) tertiaryDemo.style.backgroundColor = this.colors.tertiary;
  }

  initializeColorGuide() {
    setTimeout(() => {
      this.updateColorGuide();
    }, 100);
  }

  toggleFontSelection(useDefault = true) {
    this.useDefaultFont = useDefault;

    const customSelection = document.getElementById("customFontSelection");
    const useDefaultCheckbox = document.getElementById("useDefaultFont");
    const fontPreviewText = document.getElementById("fontPreviewText");

    if (useDefaultCheckbox) {
      useDefaultCheckbox.checked = useDefault;
    }

    if (customSelection) {
      customSelection.style.display = useDefault ? "none" : "block";
    }

    if (fontPreviewText) {
      if (useDefault) {
        fontPreviewText.style.fontFamily = "Montserrat, sans-serif";
      } else if (this.customFont) {
        this.updateFontPreview(this.customFont);
      }
    }

    this.saveStylingData();
  }

  searchGoogleFonts(query) {
    const suggestionsContainer = document.getElementById("fontSuggestions");
    if (!suggestionsContainer) return;

    if (!query || query.trim().length < 2) {
      this.hideFontSuggestions();
      return;
    }

    const filteredFonts = this.popularGoogleFonts.filter((font) =>
      font.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredFonts.length === 0) {
      this.hideFontSuggestions();
      return;
    }

    this.showFontSuggestions(filteredFonts.slice(0, 8));
  }

  showFontSuggestions(fonts) {
    const suggestionsContainer = document.getElementById("fontSuggestions");
    if (!suggestionsContainer) return;

    const suggestionsHTML = fonts
      .map(
        (font) => `
          <div class="font-suggestion-item" onclick="window.step3StylesDesign.selectGoogleFont('${font}')">
            <div class="font-suggestion-name">${font}</div>
            <div class="font-suggestion-preview" style="font-family: '${font}', sans-serif;">Sample Text</div>
          </div>
        `
      )
      .join("");

    suggestionsContainer.innerHTML = suggestionsHTML;
    suggestionsContainer.classList.add("show");
  }

  hideFontSuggestions() {
    const suggestionsContainer = document.getElementById("fontSuggestions");
    if (suggestionsContainer) {
      suggestionsContainer.classList.remove("show");
    }
  }

  selectGoogleFont(fontName) {
    const fontInput = document.getElementById("fontSearchInput");

    if (fontInput) {
      fontInput.value = fontName;
    }

    this.hideFontSuggestions();
    this.customFont = fontName;
    this.useDefaultFont = false;

    // Load the font
    this.loadGoogleFont(fontName);
    this.updateFontPreview(fontName);
    this.saveStylingData();
  }

  loadGoogleFont(fontName) {
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(
      /\s+/g,
      "+"
    )}:wght@300;400;500;600;700&display=swap`;

    // Check if font is already loaded
    const existingLink = document.querySelector(
      `link[href*="${fontName.replace(/\s+/g, "+")}"]`
    );
    if (!existingLink) {
      document.head.appendChild(fontLink);
    }
  }

  updateFontPreview(fontName) {
    const previewText = document.getElementById("fontPreviewText");
    if (previewText) {
      previewText.style.fontFamily = `'${fontName}', sans-serif`;
    }
  }

  saveThemeData() {
    try {
      // Update global wizard data
      if (window.wizardData) {
        window.updateWizardData("theme", this.selectedTheme);
      }

      // Also save directly to localStorage for backward compatibility
      const wizardData = this.getWizardData() || {};
      wizardData.theme = this.selectedTheme;
      localStorage.setItem("wizardData", JSON.stringify(wizardData));

      console.log("Theme data saved:", this.selectedTheme);
    } catch (error) {
      console.error("Error saving theme data:", error);
    }
  }

  saveStylingData() {
    try {
      const stylingData = {
        colors: this.colors,
        fonts: {
          useDefault: this.useDefaultFont,
          customFont: this.customFont,
          family: this.useDefaultFont ? "default" : this.customFont,
        },
        logos: this.logos,
        timestamp: new Date().toISOString(),
      };

      // Update global wizard data
      if (window.wizardData) {
        window.updateWizardData("styling", stylingData);
      }

      // Also save directly to localStorage for backward compatibility
      const wizardData = this.getWizardData() || {};
      wizardData.styling = stylingData;
      localStorage.setItem("wizardData", JSON.stringify(wizardData));

      console.log("Styling data saved:", stylingData);
    } catch (error) {
      console.error("Error saving styling data:", error);
    }
  }

  openThemePreview() {
    if (!this.selectedTheme) return;

    const themeData = this.themePreviewData[this.selectedTheme];
    if (!themeData) return;

    // This would typically open a modal - for now just show an alert
    console.log("Opening preview for:", themeData.name);

    // You can implement the modal logic here or call a global function
    if (typeof window.openThemePreview === "function") {
      window.openThemePreview(this.selectedTheme);
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
    const isValid = this.selectedTheme !== null;

    // Save data when validating
    if (isValid) {
      this.saveThemeData();
      this.saveStylingData();
    }

    return isValid;
  }

  getStepData() {
    const stepData = {
      theme: this.selectedTheme,
      styling: {
        colors: this.colors,
        fonts: {
          useDefault: this.useDefaultFont,
          customFont: this.customFont,
          family: this.useDefaultFont ? "default" : this.customFont,
        },
        logos: this.logos,
        timestamp: new Date().toISOString(),
      },
      isValid: this.validateStep(),
    };

    // Save data when requested
    if (stepData.isValid) {
      this.saveThemeData();
      this.saveStylingData();
    }

    return stepData;
  }

  resetStep() {
    // Reset selections
    this.selectedTheme = null;
    this.useDefaultFont = true;
    this.customFont = null;
    this.colors = {
      primary: "#4e54c8",
      secondary: "#8f94fb",
      tertiary: "#19b78a",
    };
    this.logos = {
      desktop: null,
      mobile: null,
      desktopName: null,
      mobileName: null,
    };

    // Reset UI
    document.querySelectorAll(".theme-item").forEach((item) => {
      item.classList.remove("selected");
    });

    // Reset color inputs
    this.updateColorInputs();

    // Reset font selection
    this.toggleFontSelection(true);

    // Clear logo previews
    ["desktop", "mobile"].forEach((type) => {
      const preview = document.getElementById(`${type}LogoPreview`);
      if (preview) {
        preview.style.display = "none";
      }
    });

    // Switch to theme tab
    this.switchTab("theme");

    // Clear saved data
    if (window.wizardData) {
      window.updateWizardData("theme", null);
      window.updateWizardData("styling", {
        colors: this.colors,
        fonts: {
          useDefault: true,
          customFont: null,
          family: "default",
        },
        logos: {
          desktop: null,
          mobile: null,
          desktopName: null,
          mobileName: null,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Method to get theme options based on platform
  getThemeOptions(platform) {
    if (platform === "magento") {
      return ["luma", "hyva"];
    }
    return ["default", "ecommerce"];
  }

  // Method to check if theme requires license
  themeRequiresLicense(theme) {
    return theme === "hyva";
  }

  // Method to get current styling summary
  getStylingSummary() {
    return {
      theme: this.selectedTheme,
      hasDesktopLogo: !!this.logos.desktop,
      hasMobileLogo: !!this.logos.mobile,
      desktopLogoName: this.logos.desktopName,
      mobileLogoName: this.logos.mobileName,
      primaryColor: this.colors.primary,
      secondaryColor: this.colors.secondary,
      tertiaryColor: this.colors.tertiary,
      fontType: this.useDefaultFont
        ? "Default Theme Font"
        : this.customFont || "Custom Font",
      customizations: {
        hasCustomColors:
          this.colors.primary !== "#4e54c8" ||
          this.colors.secondary !== "#8f94fb" ||
          this.colors.tertiary !== "#19b78a",
        hasCustomFont: !this.useDefaultFont,
        hasLogos: this.logos.desktop || this.logos.mobile,
      },
    };
  }
}

// Global function to update theme grid based on platform
window.updateThemeGrid = function (platform) {
  if (window.step3StylesDesign) {
    window.step3StylesDesign.updateThemeOptions();
  }
};

// Initialize Step 3 when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const step3Content = document.querySelector('.step-content[data-step="3"]');
  if (step3Content) {
    window.step3StylesDesign = new Step3StylesDesign();

    // Force reload data after initialization
    setTimeout(() => {
      if (window.step3StylesDesign) {
        window.step3StylesDesign.loadStoredData();
        window.step3StylesDesign.updateThemeOptions();
        window.step3StylesDesign.updateNextButton();
      }
    }, 200);

    // Also initialize when step 3 becomes visible
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const step3 = document.querySelector('.step-content[data-step="3"]');
          if (step3 && step3.classList.contains("active")) {
            setTimeout(() => {
              if (window.step3StylesDesign) {
                // Reload data when step becomes active
                window.step3StylesDesign.loadStoredData();
                window.step3StylesDesign.updateThemeOptions();
                window.step3StylesDesign.updateNextButton();
              }
            }, 100);
          }
        }
      });
    });

    // Start observing
    const step3Element = document.querySelector('.step-content[data-step="3"]');
    if (step3Element) {
      observer.observe(step3Element, { attributes: true });
    }
  }
});

// Export for global access
window.Step3StylesDesign = Step3StylesDesign;
