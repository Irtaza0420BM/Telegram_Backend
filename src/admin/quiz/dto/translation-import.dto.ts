// Updated TranslationImportDto interface
export interface TranslationImportDto {
  languageCode: string;
  translations: TranslationData[] | string; 
}

interface TranslationData {
  category: number;  
  tier: number;   
  questions: TranslationQuestionData[];
}

interface TranslationQuestionData {
  questionId: number;
  questionText: string;
  options: string[];  
}