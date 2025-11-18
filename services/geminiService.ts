import { GoogleGenAI, Modality, Part } from "@google/genai";

// 사용자가 제공한 API 키를 여기에 직접 설정합니다.
// 경고: 이 방법은 보안에 취약하므로, 단기적이고 개인적인 용도로만 사용해야 합니다.
// 절대 이 코드를 공개적인 곳에 배포하거나 공유하지 마세요.
const API_KEY = "AIzaSyAR70GZ5geXXtvezWXtCdLdFiNNzn9_rNY";

let ai: GoogleGenAI | null = null;

const getAi = () => {
    if (!ai) {
        if (!API_KEY) {
            throw new Error("API 키가 services/geminiService.ts 파일에 설정되지 않았습니다.");
        }
        ai = new GoogleGenAI({ apiKey: API_KEY });
    }
    return ai;
};

export const mergeImages = async (backgroundPart: Part, portraitPart: Part): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const prompt = '두 번째 이미지(인물 사진)에서 주요 인물을 추출하여 첫 번째 이미지(배경)에 사실적으로 배치해 주세요. 조명, 스케일, 위치가 자연스럽고 매끄럽게 어우러지도록 해주세요. 최종 결과물은 합성된 이미지만 포함해야 합니다.';

    try {
        const gemini = getAi();
        const response = await gemini.models.generateContent({
            model: model,
            contents: {
                parts: [
                    backgroundPart,
                    portraitPart,
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (!imagePart || !imagePart.inlineData) {
            throw new Error("API가 이미지를 반환하지 않았습니다. 다른 이미지로 다시 시도해 주세요.");
        }

        const { data: base64ImageData, mimeType } = imagePart.inlineData;
        return `data:${mimeType};base64,${base64ImageData}`;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // 사용자가 볼 수 있도록 오류 메시지를 더 구체적으로 전달
        if (error instanceof Error && error.message.includes('RESOURCE_EXHAUSTED')) {
             throw new Error("API 사용량 한도를 초과했습니다. 잠시 후 다시 시도하거나 다른 API 키를 사용해 주세요.");
        }
        if (error instanceof Error) {
            throw new Error(`API 오류: ${error.message}`);
        }
        throw new Error("API 오류로 인해 이미지 합성에 실패했습니다. 자세한 내용은 콘솔을 확인하세요.");
    }
};