export function mountUploadPanel(root, analysisService) {
  // Create main panel container
  const panel = document.createElement('div');
  panel.className = 'panel upload-panel';
  panel.style.position = 'relative';
  panel.style.inset = 'auto';

  // File input (hidden, accessed via dropzone/button)
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*,video/*';
  fileInput.style.display = 'none';

  // Dropzone area
  const dropzone = document.createElement('div');
  dropzone.className = 'upload-dropzone';
  dropzone.innerHTML = `
    <div style="text-align: center; pointer-events: none;">
      <div style="font-size: 32px; margin-bottom: 8px;">📤</div>
      <div style="color: var(--text-primary); font-size: 14px; font-weight: 600; margin-bottom: 4px;">
        Click to upload or drag and drop
      </div>
      <div style="color: var(--text-muted); font-size: 12px;">
        Supported formats: images (PNG, JPG, etc.) and videos (MP4, WebM, etc.)
      </div>
    </div>
  `;

  // File preview area
  const previewArea = document.createElement('div');
  previewArea.className = 'upload-preview';
  previewArea.style.display = 'none';
  previewArea.style.marginTop = '12px';

  // Analyze button
  const analyzeBtn = document.createElement('button');
  analyzeBtn.className = 'upload-analyze-btn';
  analyzeBtn.textContent = 'Analyze';
  analyzeBtn.disabled = true;
  analyzeBtn.style.marginTop = '12px';

  // Results section
  const resultsSection = document.createElement('div');
  resultsSection.className = 'upload-results';
  resultsSection.style.display = 'none';
  resultsSection.style.marginTop = '12px';

  // Append all elements to panel
  panel.appendChild(fileInput);
  panel.appendChild(dropzone);
  panel.appendChild(previewArea);
  panel.appendChild(analyzeBtn);
  panel.appendChild(resultsSection);

  // State
  let selectedFile = null;
  let isAnalyzing = false;

  // Handle file selection
  function handleFileSelect(file) {
    if (!file || !file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return;
    }

    selectedFile = file;
    dropzone.style.display = 'none';
    previewArea.style.display = 'block';
    analyzeBtn.disabled = false;
    resultsSection.style.display = 'none';
    resultsSection.innerHTML = '';

    // Clear previous preview
    previewArea.innerHTML = '';

    // Show preview based on file type
    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.className = 'upload-preview-img';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.borderRadius = '8px';
      img.style.maxHeight = '300px';
      img.style.objectFit = 'cover';
      previewArea.appendChild(img);
    } else {
      // For video/unsupported, show filename chip
      const chip = document.createElement('div');
      chip.className = 'upload-file-chip';
      chip.style.display = 'inline-block';
      chip.style.padding = '8px 12px';
      chip.style.borderRadius = '6px';
      chip.style.background = 'rgba(56, 189, 248, 0.15)';
      chip.style.color = 'var(--accent-blue)';
      chip.style.fontSize = '13px';
      chip.style.fontWeight = '600';
      chip.textContent = `📹 ${file.name}`;
      previewArea.appendChild(chip);
    }
  }

  // Handle analyze button click
  analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile || isAnalyzing) return;

    isAnalyzing = true;
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
    resultsSection.style.display = 'none';
    resultsSection.innerHTML = '';

    try {
      const response = await analysisService.analyzeMedia(selectedFile);
      const { results } = response;

      isAnalyzing = false;
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = 'Analyze';

      // Display results
      resultsSection.innerHTML = '';
      resultsSection.style.display = 'block';

      if (results.length === 0) {
        const noResultsMsg = document.createElement('div');
        noResultsMsg.style.padding = '16px';
        noResultsMsg.style.textAlign = 'center';
        noResultsMsg.style.color = 'var(--text-muted)';
        noResultsMsg.textContent = '✓ No issues detected';
        resultsSection.appendChild(noResultsMsg);
      } else {
        const resultsList = document.createElement('div');
        resultsList.style.display = 'flex';
        resultsList.style.flexDirection = 'column';
        resultsList.style.gap = '8px';

        for (const result of results) {
          const item = document.createElement('div');
          item.className = 'detection-item';
          item.style.display = 'flex';
          item.style.gap = '8px';
          item.style.alignItems = 'center';
          item.style.padding = '8px';
          item.style.borderRadius = '8px';
          item.style.background = 'rgba(255,255,255,0.03)';

          // Color swatch
          const swatch = document.createElement('div');
          swatch.className = 'detection-thumb';
          swatch.style.width = '48px';
          swatch.style.height = '32px';
          swatch.style.borderRadius = '4px';
          swatch.style.flexShrink = '0';
          swatch.style.border = '1px solid var(--panel-border)';
          swatch.style.background = `#${result.color.toString(16).padStart(6, '0')}`;

          // Info section
          const info = document.createElement('div');
          info.className = 'detection-info';
          info.style.fontSize = '11px';
          info.style.color = 'var(--text-muted)';
          info.innerHTML = `
            <strong style="display: block; color: var(--text-primary); font-size: 12px; margin-bottom: 2px;">
              ${result.label}
            </strong>
            <span>Confidence: ${result.confidence}%</span>
          `;

          item.appendChild(swatch);
          item.appendChild(info);
          resultsList.appendChild(item);
        }

        resultsSection.appendChild(resultsList);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      isAnalyzing = false;
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = 'Analyze';
      resultsSection.innerHTML = '<div style="color: #ef4444; padding: 8px;">Error during analysis. Please try again.</div>';
      resultsSection.style.display = 'block';
    }
  });

  // File input change handler
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  });

  // Dropzone click handler
  dropzone.addEventListener('click', () => {
    fileInput.click();
  });

  // Drag and drop handlers
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.background = 'rgba(56, 189, 248, 0.08)';
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.style.background = '';
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.background = '';
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  });

  root.appendChild(panel);
}
