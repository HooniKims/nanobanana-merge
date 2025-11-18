import React, { useRef, useCallback } from 'react';

interface ImageUploaderProps {
  id: string;
  title: string;
  onImageChange: (file: File | null, previewUrl: string | null) => void;
  previewUrl: string | null;
}

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, onImageChange, previewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        onImageChange(null, null);
    }
  };

  const handleRemoveImage = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    onImageChange(null, null);
  }, [onImageChange]);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4 text-center text-white">{title}</h3>
      <div 
        className="flex-grow flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-4 cursor-pointer hover:border-indigo-500 hover:bg-gray-700/50 transition-all duration-300"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          id={id}
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        {previewUrl ? (
          <div className="relative w-full h-full">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-md" />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1.5 hover:bg-opacity-80 transition-opacity"
              aria-label="이미지 제거"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <UploadIcon className="w-12 h-12 mx-auto mb-2" />
            <p className="font-semibold">클릭하여 업로드</p>
            <p className="text-sm">또는 파일을 끌어다 놓으세요</p>
          </div>
        )}
      </div>
    </div>
  );
};