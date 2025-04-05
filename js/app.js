// 当DOM加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const uploadArea = document.getElementById('upload-area');
    const uploadPreview = document.getElementById('upload-preview');
    const watermarkPanel = document.getElementById('watermark-panel');
    const previewSection = document.getElementById('preview-section');
    const downloadSection = document.getElementById('download-section');
    const previewGallery = document.getElementById('preview-gallery');
    const watermarkedGallery = document.getElementById('watermarked-gallery');
    const applyWatermarkBtn = document.getElementById('apply-watermark');
    const resetSettingsBtn = document.getElementById('reset-settings');
    const downloadAllBtn = document.getElementById('download-all');
    
    // 水印设置控件
    const watermarkText = document.getElementById('watermark-text');
    const textOpacity = document.getElementById('text-opacity');
    const opacityValue = document.getElementById('opacity-value');
    const textColor = document.getElementById('text-color');
    const fontSize = document.getElementById('font-size');
    const textRotation = document.getElementById('text-rotation');
    const rotationValue = document.getElementById('rotation-value');
    const densityOptions = document.querySelectorAll('input[name="density"]');
    
    // 全局变量
    let uploadedFiles = []; // 存储上传的文件
    let watermarkedImages = []; // 存储加水印后的图像
    
    // 隐藏初始化时不需要显示的部分
    watermarkPanel.style.display = 'none';
    previewSection.style.display = 'none';
    downloadSection.style.display = 'none';
    
    // 初始化事件监听器
    initEventListeners();
    
    // 设置事件监听器
    function initEventListeners() {
        // 文件选择按钮点击事件
        selectFilesBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        // 文件选择变更事件
        fileInput.addEventListener('change', handleFileSelect);
        
        // 拖放区域事件
        setupDragAndDrop();
        
        // 水印应用按钮事件
        applyWatermarkBtn.addEventListener('click', applyWatermark);
        
        // 重置设置按钮事件
        resetSettingsBtn.addEventListener('click', resetSettings);
        
        // 下载所有按钮事件
        downloadAllBtn.addEventListener('click', downloadAllImages);
        
        // 不透明度滑块事件
        textOpacity.addEventListener('input', () => {
            opacityValue.textContent = `${Math.round(textOpacity.value * 100)}%`;
        });
        
        // 旋转角度滑块事件
        textRotation.addEventListener('input', () => {
            rotationValue.textContent = `${textRotation.value}°`;
        });
    }
    
    // 设置拖放区域
    function setupDragAndDrop() {
        // 阻止默认拖放行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });
        
        // 高亮拖放区域
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('drag-over');
            }, false);
        });
        
        // 取消高亮拖放区域
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('drag-over');
            }, false);
        });
        
        // 处理文件拖放
        uploadArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        }, false);
    }
    
    // 阻止默认行为
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // 处理文件选择
    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }
    
    // 处理文件
    function handleFiles(files) {
        // 限制一次最多上传5个文件
        const filesToProcess = Array.from(files).slice(0, 5);
        
        // 验证文件类型
        const validFiles = filesToProcess.filter(file => {
            const fileType = file.type.toLowerCase();
            return fileType === 'image/jpeg' || fileType === 'image/jpg' || fileType === 'image/png';
        });
        
        if (validFiles.length === 0) {
            alert('Please select valid image files (JPG, JPEG, PNG).');
            return;
        }
        
        if (filesToProcess.length > validFiles.length) {
            alert('Some files were skipped because they are not in a supported format.');
        }
        
        // 清空上传预览和选中文件
        uploadPreview.innerHTML = '';
        uploadedFiles = [];
        
        // 处理每个有效文件
        validFiles.forEach(file => {
            uploadedFiles.push(file);
            displayUploadedImage(file);
        });
        
        // 显示水印面板
        watermarkPanel.style.display = 'block';
        
        // 重置预览和下载区域
        previewGallery.innerHTML = '';
        watermarkedGallery.innerHTML = '';
        previewSection.style.display = 'none';
        downloadSection.style.display = 'none';
        
        // 重置文件输入以允许再次选择相同的文件
        fileInput.value = '';
    }
    
    // 显示上传的图片
    function displayUploadedImage(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const uploadItem = document.createElement('div');
            uploadItem.className = 'upload-item';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = file.name;
            
            const actions = document.createElement('div');
            actions.className = 'upload-item-actions';
            
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.title = 'Remove image';
            removeBtn.addEventListener('click', () => {
                uploadItem.remove();
                uploadedFiles = uploadedFiles.filter(f => f !== file);
                
                // 如果没有文件了，隐藏水印面板
                if (uploadedFiles.length === 0) {
                    watermarkPanel.style.display = 'none';
                    previewSection.style.display = 'none';
                    downloadSection.style.display = 'none';
                }
            });
            
            actions.appendChild(removeBtn);
            uploadItem.appendChild(img);
            uploadItem.appendChild(actions);
            uploadPreview.appendChild(uploadItem);
        };
        
        reader.readAsDataURL(file);
    }
    
    // 应用水印
    function applyWatermark() {
        if (uploadedFiles.length === 0) {
            alert('Please upload images first.');
            return;
        }
        
        // 获取水印设置
        const text = watermarkText.value || 'WatermarkLab.top';
        const opacity = parseFloat(textOpacity.value);
        const color = textColor.value;
        const size = parseInt(fontSize.value);
        const rotation = parseInt(textRotation.value);
        let density = 'single';
        
        // 获取选中的密度
        densityOptions.forEach(option => {
            if (option.checked) {
                density = option.value;
            }
        });
        
        // 清空预览和水印图库
        previewGallery.innerHTML = '';
        watermarkedGallery.innerHTML = '';
        watermarkedImages = [];
        
        // 处理每个上传的文件
        uploadedFiles.forEach((file, index) => {
            processImage(file, index, text, opacity, color, size, rotation, density);
        });
        
        // 显示预览和下载区域
        previewSection.style.display = 'block';
        downloadSection.style.display = 'block';
    }
    
    // 处理图像并应用水印
    function processImage(file, index, text, opacity, color, size, rotation, density) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            
            img.onload = () => {
                // 创建画布
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                
                // 获取绘图上下文
                const ctx = canvas.getContext('2d');
                
                // 绘制原始图像
                ctx.drawImage(img, 0, 0);
                
                // 计算水印数量和位置
                let positions = [];
                
                if (density === 'single') {
                    positions.push({ x: img.width / 2, y: img.height / 2 });
                } else if (density === 'medium') {
                    // 3x3网格
                    const stepX = img.width / 4;
                    const stepY = img.height / 4;
                    
                    for (let y = stepY; y < img.height; y += stepY * 2) {
                        for (let x = stepX; x < img.width; x += stepX * 2) {
                            positions.push({ x, y });
                        }
                    }
                } else if (density === 'dense') {
                    // 密集网格
                    const stepX = img.width / 6;
                    const stepY = img.height / 6;
                    
                    for (let y = stepY; y < img.height; y += stepY) {
                        for (let x = stepX; x < img.width; x += stepX) {
                            // 交错布局
                            if ((Math.floor(y / stepY) % 2 === 0) === (Math.floor(x / stepX) % 2 === 0)) {
                                positions.push({ x, y });
                            }
                        }
                    }
                }
                
                // 设置字体和水印样式
                ctx.font = `${size}px 'SF Pro Display', sans-serif`;
                ctx.fillStyle = color;
                ctx.globalAlpha = opacity;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // 对每个位置应用水印
                positions.forEach(pos => {
                    ctx.save();
                    ctx.translate(pos.x, pos.y);
                    ctx.rotate(rotation * Math.PI / 180);
                    ctx.fillText(text, 0, 0);
                    ctx.restore();
                });
                
                // 恢复全局透明度
                ctx.globalAlpha = 1.0;
                
                // 获取带水印的图像数据
                const watermarkedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
                
                // 存储水印图像
                watermarkedImages.push({
                    original: e.target.result,
                    watermarked: watermarkedImageUrl,
                    name: file.name
                });
                
                // 创建预览项
                createPreviewItem(e.target.result, watermarkedImageUrl, file.name, index);
                
                // 创建水印图库项
                createWatermarkedItem(watermarkedImageUrl, file.name, index);
            };
        };
        
        reader.readAsDataURL(file);
    }
    
    // 创建预览项
    function createPreviewItem(originalSrc, watermarkedSrc, fileName, index) {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        
        const header = document.createElement('div');
        header.className = 'preview-item-header';
        header.innerHTML = `<div class="filename">${fileName}</div>`;
        
        const previewImages = document.createElement('div');
        previewImages.className = 'preview-images';
        
        // 原始图像
        const originalContainer = document.createElement('div');
        originalContainer.className = 'preview-image';
        
        const originalImg = document.createElement('img');
        originalImg.src = originalSrc;
        originalImg.alt = 'Original';
        
        const originalLabel = document.createElement('div');
        originalLabel.className = 'preview-label';
        originalLabel.textContent = 'Original';
        
        originalContainer.appendChild(originalImg);
        originalContainer.appendChild(originalLabel);
        
        // 水印图像
        const watermarkedContainer = document.createElement('div');
        watermarkedContainer.className = 'preview-image';
        
        const watermarkedImg = document.createElement('img');
        watermarkedImg.src = watermarkedSrc;
        watermarkedImg.alt = 'Watermarked';
        
        const watermarkedLabel = document.createElement('div');
        watermarkedLabel.className = 'preview-label';
        watermarkedLabel.textContent = 'Watermarked';
        
        watermarkedContainer.appendChild(watermarkedImg);
        watermarkedContainer.appendChild(watermarkedLabel);
        
        // 组装预览项
        previewImages.appendChild(originalContainer);
        previewImages.appendChild(watermarkedContainer);
        previewItem.appendChild(header);
        previewItem.appendChild(previewImages);
        
        previewGallery.appendChild(previewItem);
    }
    
    // 创建水印图库项
    function createWatermarkedItem(src, fileName, index) {
        const watermarkedItem = document.createElement('div');
        watermarkedItem.className = 'watermarked-item';
        
        const img = document.createElement('img');
        img.src = src;
        img.alt = fileName;
        
        const footer = document.createElement('div');
        footer.className = 'watermarked-item-footer';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'filename';
        nameSpan.textContent = fileName;
        
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'btn secondary';
        downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
        downloadBtn.title = 'Download image';
        downloadBtn.addEventListener('click', () => {
            downloadImage(src, fileName);
        });
        
        footer.appendChild(nameSpan);
        footer.appendChild(downloadBtn);
        
        watermarkedItem.appendChild(img);
        watermarkedItem.appendChild(footer);
        
        watermarkedGallery.appendChild(watermarkedItem);
    }
    
    // 下载单个图像
    function downloadImage(src, fileName) {
        const link = document.createElement('a');
        link.href = src;
        link.download = `watermarked_${fileName}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // 下载所有图像
    function downloadAllImages() {
        if (watermarkedImages.length === 0) {
            alert('No watermarked images to download.');
            return;
        }
        
        // 依次下载每个图像
        watermarkedImages.forEach(img => {
            downloadImage(img.watermarked, img.name);
        });
    }
    
    // 重置设置
    function resetSettings() {
        watermarkText.value = 'WatermarkLab.top';
        textOpacity.value = 0.5;
        opacityValue.textContent = '50%';
        textColor.value = '#ffffff';
        fontSize.value = 30;
        textRotation.value = -30;
        rotationValue.textContent = '-30°';
        document.getElementById('density-single').checked = true;
    }
}); 