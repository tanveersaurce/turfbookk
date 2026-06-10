import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';

export const ImageUpload = ({ maxImages = 5, onFilesSelected, initialImages = [] }) => {
  const [previews, setPreviews] = useState(initialImages);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const processFiles = (filesList) => {
    const validFiles = Array.from(filesList).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isUnder5MB = file.size <= 5 * 1024 * 1024;
      if (!isImage) toast.error(`${file.name} is not an image file.`);
      if (!isUnder5MB) toast.error(`${file.name} exceeds 5MB size limit.`);
      return isImage && isUnder5MB;
    });

    if (previews.length + validFiles.length > maxImages) {
      toast.error(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);

    if (onFilesSelected) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const removeImage = (indexToRemove) => {
    setPreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
    // Callback should propagate the removal state. If files are uploaded sequentially we handle it in form page.
    if (onFilesSelected) {
      onFilesSelected([], indexToRemove); // Send remove index signal
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      {previews.length < maxImages && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 flex flex-col items-center justify-center min-h-[180px] ${
            dragActive ? 'border-primary bg-primary/5' : 'border-[#c2caae] hover:border-primary hover:bg-[#edeeef]/30'
          }`}
          onClick={onButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={maxImages > 1}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <span className="material-symbols-outlined text-[40px] text-primary mb-3">cloud_upload</span>
          <p className="font-inter font-bold text-[16px] text-secondary mb-1">
            Drag and drop your images here
          </p>
          <p className="font-inter text-[13px] text-[#5f5e5e] mb-3">
            Supports JPEG, JPG, PNG, WEBP (Max 5MB)
          </p>
          <button
            type="button"
            className="px-4 py-2 bg-secondary text-white font-bold text-[14px] rounded-lg hover:bg-secondary-light transition-colors"
          >
            Select Files
          </button>
        </div>
      )}

      {/* Image Preview Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {previews.map((preview, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-secondary shadow-lg">
              <img
                src={preview}
                alt={`Upload preview ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(idx);
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
