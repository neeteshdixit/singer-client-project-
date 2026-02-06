class ContentUploader {
  constructor() {
    this.initializeUploadZone();
  }

  initializeUploadZone() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');

    if (!uploadZone || !fileInput) return;

    // Click to upload
    uploadZone.addEventListener('click', () => fileInput.click());

    // Drag & drop
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileSelect(files[0]);
      }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileSelect(e.target.files[0]);
      }
    });

    // Form submit
    document.getElementById('uploadForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.uploadContent();
    });
  }

  handleFileSelect(file) {
    // Validate file
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert('File size exceeds 100MB limit');
      return;
    }

    // Show file info
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = this.formatFileSize(file.size);
    document.getElementById('filePreview').style.display = 'block';

    // Store file for upload
    this.selectedFile = file;
  }

  async uploadContent() {
    if (!this.selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('title', document.getElementById('contentTitle').value);
    formData.append('type', document.getElementById('contentType').value);
    formData.append('description', document.getElementById('contentDescription').value);

    try {
      // Show progress
      this.showUploadProgress(0);

      const response = await api.upload('/content', formData);

      // Success
      this.showUploadProgress(100);
      alert('Content uploaded successfully!');
      
      // Reset form
      document.getElementById('uploadForm').reset();
      document.getElementById('filePreview').style.display = 'none';
      this.selectedFile = null;

      // Reload content list
      if (window.loadContentList) {
        window.loadContentList();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error.message}`);
      this.hideUploadProgress();
    }
  }

  showUploadProgress(percent) {
    const progressBar = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('uploadProgressFill');
    
    if (progressBar && progressFill) {
      progressBar.style.display = 'block';
      progressFill.style.width = `${percent}%`;
    }
  }

  hideUploadProgress() {
    const progressBar = document.getElementById('uploadProgress');
    if (progressBar) {
      progressBar.style.display = 'none';
    }
  }

  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}

// Initialize uploader on admin dashboard
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('uploadZone')) {
    new ContentUploader();
  }
});