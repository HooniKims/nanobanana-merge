
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { Spinner } from './components/Spinner';
import { mergeImages } from './services/geminiService';
import { fileToGenerativePart } from './utils/fileUtils';

type ImageData = {
  file: File | null;
  previewUrl: string | null;
};

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const App: React.FC = () => {
  const [portrait, setPortrait] = useState<ImageData>({ file: null, previewUrl: null });
  const [background, setBackground] = useState<ImageData>({ file: null, previewUrl: null });
  const [mergedImage, setMergedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePortraitSelect = useCallback((file: File | null, previewUrl: string | null) => {
    setPortrait({ file, previewUrl });
    setMergedImage(null);
    setError(null);
  }, []);

  const handleBackgroundSelect = useCallback((file: File | null, previewUrl: string | null) => {
    setBackground({ file, previewUrl });
    setMergedImage(null);
    setError(null);
  }, []);

  const handleMerge = async () => {
    if (!portrait.file || !background.file) {
      setError('인물 사진과 배경 사진을 모두 업로드해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMergedImage(null);

    try {
      const portraitPart = await fileToGenerativePart(portrait.file);
      const backgroundPart = await fileToGenerativePart(background.file);

      const resultImage = await mergeImages(backgroundPart, portraitPart);
      setMergedImage(resultImage);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : '이미지 합성 중 알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!mergedImage) return;

    const link = document.createElement('a');
    link.href = mergedImage;
    link.download = 'gemini-merged-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const canMerge = portrait.file && background.file && !isLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Header />
        <main>
          <p className="text-center text-gray-400 mt-4 mb-8 max-w-2xl mx-auto">
            인물 사진과 대학교 배경 사진을 업로드하세요. AI가 인물을 추출하여 배경 장면에 자연스럽게 배치해 드립니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <ImageUploader
              id="portrait-uploader"
              title="1. 인물 사진 업로드"
              onImageChange={handlePortraitSelect}
              previewUrl={portrait.previewUrl}
            />
            <ImageUploader
              id="background-uploader"
              title="2. 배경 사진 업로드"
              onImageChange={handleBackgroundSelect}
              previewUrl={background.previewUrl}
            />
          </div>
          <div className="text-center mb-8">
            <button
              onClick={handleMerge}
              disabled={!canMerge}
              className="relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
            >
              {isLoading && <Spinner className="w-6 h-6 mr-3" />}
              {isLoading ? '이미지 합성 중...' : '이미지 합성하기'}
            </button>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 min-h-[300px] flex justify-center items-center flex-col">
            <h2 className="text-2xl font-bold mb-4 text-white">결과</h2>
            {isLoading && (
              <div className="text-center">
                <Spinner className="w-12 h-12 mx-auto mb-4"/>
                <p className="text-lg text-gray-300">AI가 마법을 부리고 있어요... 잠시만 기다려 주세요.</p>
              </div>
            )}
            {error && (
              <div className="text-center text-red-400 bg-red-900/30 p-4 rounded-lg">
                <p className="font-bold">오류가 발생했습니다:</p>
                <p>{error}</p>
              </div>
            )}
            {mergedImage && (
              <div className="w-full max-w-2xl mx-auto text-center">
                <img 
                  src={mergedImage} 
                  alt="Merged result" 
                  className="rounded-lg shadow-2xl object-contain w-full h-auto"
                />
                 <button
                  onClick={handleDownload}
                  className="mt-6 inline-flex items-center justify-center px-6 py-2 text-base font-medium text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900"
                >
                  <DownloadIcon className="w-5 h-5 mr-2" />
                  이미지 다운로드
                </button>
              </div>
            )}
            {!isLoading && !error && !mergedImage && (
              <p className="text-gray-400">생성된 이미지가 여기에 표시됩니다.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
