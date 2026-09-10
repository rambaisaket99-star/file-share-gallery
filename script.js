// File Gallery Management System
class FileGallery {
    constructor() {
        this.files = [];
        this.loadFilesFromStorage();
        this.initializeEventListeners();
        this.renderGallery();
    }

    // Initialize event listeners
    initializeEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const modal = document.getElementById('previewModal');
        const closeBtn = document.querySelector('.close');

        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        closeBtn.addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    // Handle file upload
    handleFileUpload(event) {
        const uploadedFiles = event.target.files;

        Array.from(uploadedFiles).forEach((file) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const fileData = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: e.target.result,
                    uploadDate: new Date().toLocaleString(),
                    extension: this.getFileExtension(file.name)
                };

                this.files.push(fileData);
                this.saveFilesToStorage();
                this.renderGallery();
            };

            reader.readAsDataURL(file);
        });

        // Reset input
        event.target.value = '';
    }

    // Get file extension
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    // Get file icon based on type
    getFileIcon(extension) {
        const icons = {
            'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'webp': '🖼️',
            'mp4': '🎬', 'avi': '🎬', 'mov': '🎬', 'mkv': '🎬', 'webm': '🎬',
            'pdf': '📄', 'doc': '📝', 'docx': '📝', 'txt': '📝',
            'zip': '📦', 'rar': '📦', '7z': '📦',
            'mp3': '🎵', 'wav': '🎵', 'flac': '🎵'
        };
        return icons[extension] || '📁';
    }

    // Render gallery
    renderGallery() {
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';

        if (this.files.length === 0) {
            gallery.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">Click + to upload files</p>';
            return;
        }

        this.files.forEach((file) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.style.cursor = 'pointer';

            let content = '';

            if (file.type.startsWith('image/')) {
                content = `<img src="${file.data}" alt="${file.name}">`;
            } else if (file.type.startsWith('video/')) {
                content = `<video src="${file.data}"></video>`;
            } else {
                const icon = this.getFileIcon(file.extension);
                content = `<div class="gallery-item-icon">${icon}</div>`;
            }

            galleryItem.innerHTML = content + `<div class="gallery-item-info">${file.name}</div>`;
            galleryItem.addEventListener('click', () => this.showPreview(file));

            gallery.appendChild(galleryItem);
        });
    }

    // Show preview in modal
    showPreview(file) {
        const modal = document.getElementById('previewModal');
        const modalBody = document.getElementById('modalBody');
        const downloadBtn = document.getElementById('downloadBtn');
        const deleteBtn = document.getElementById('deleteBtn');

        modalBody.innerHTML = '';

        if (file.type.startsWith('image/')) {
            modalBody.innerHTML = `<img src="${file.data}" alt="${file.name}">`;
        } else if (file.type.startsWith('video/')) {
            modalBody.innerHTML = `<video src="${file.data}" controls style="width: 100%; max-height: 60vh;"></video>`;
        } else if (file.type === 'application/pdf') {
            modalBody.innerHTML = `<iframe src="${file.data}"></iframe>`;
        } else {
            const icon = this.getFileIcon(file.extension);
            modalBody.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">${icon}</div>
                    <p style="font-size: 1.2rem; margin-bottom: 10px;">${file.name}</p>
                    <p style="color: #666;">Size: ${this.formatFileSize(file.size)}</p>
                    <p style="color: #666;">Uploaded: ${file.uploadDate}</p>
                </div>
            `;
        }

        downloadBtn.onclick = () => this.downloadFile(file);
        deleteBtn.onclick = () => this.deleteFile(file);

        modal.classList.add('show');
    }

    // Close modal
    closeModal() {
        const modal = document.getElementById('previewModal');
        modal.classList.remove('show');
    }

    // Download file
    downloadFile(file) {
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        link.click();
    }

    // Delete file
    deleteFile(file) {
        if (confirm(`Delete "${file.name}"?`)) {
            this.files = this.files.filter(f => f.id !== file.id);
            this.saveFilesToStorage();
            this.renderGallery();
            this.closeModal();
        }
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Save files to localStorage
    saveFilesToStorage() {
        try {
            localStorage.setItem('galleryFiles', JSON.stringify(this.files));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                alert('Storage limit exceeded. Please delete some files.');
            }
        }
    }

    // Load files from localStorage
    loadFilesFromStorage() {
        const stored = localStorage.getItem('galleryFiles');
        if (stored) {
            try {
                this.files = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading files:', e);
                this.files = [];
            }
        }
    }
}

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FileGallery();
});