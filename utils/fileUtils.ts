import { Part } from '@google/genai';

export const fileToGenerativePart = async (file: File): Promise<Part> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("파일을 데이터 URL로 읽는 데 실패했습니다."));
      }
      const [header, data] = reader.result.split(';base64,');
      if (!header || !data) {
        return reject(new Error("잘못된 데이터 URL 형식입니다."));
      }
      const mimeType = header.split(':')[1];
      if (!mimeType) {
        return reject(new Error("데이터 URL에서 MIME 유형을 확인할 수 없습니다."));
      }
      resolve({ inlineData: { mimeType, data } });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};