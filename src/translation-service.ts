import fetch from 'node-fetch';

export interface TranslationService {
    translate(text: string, targetLang: string): Promise<string>;
}

export class GoogleTranslationService implements TranslationService {
    private cache: Map<string, string> = new Map();

    constructor(private apiKey: string) { }

    async translate(text: string, targetLang: string): Promise<string> {
        const cacheKey = `${text}:${targetLang}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        try {
            const response = await fetch(
                `https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        q: text,
                        target: targetLang,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Translation failed: ${response.statusText}`);
            }

            const result = await response.json();
            const translatedText = result.data.translations[0].translatedText;

            // 캐시에 저장
            this.cache.set(cacheKey, translatedText);

            return translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            return text; // 에러 발생 시 원본 텍스트 반환
        }
    }
} 