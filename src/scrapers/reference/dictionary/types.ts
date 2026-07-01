export interface WordPhonetic {
  text: string | null;
  audioUrl: string | null;
}

export interface WordDefinition {
  definition: string;
  example: string | null;
  synonyms: string[];
  antonyms: string[];
}

export interface WordMeaning {
  partOfSpeech: string;
  definitions: WordDefinition[];
  synonyms: string[];
  antonyms: string[];
}

export interface DictionaryEntry {
  word: string;
  phonetic: string | null;
  phonetics: WordPhonetic[];
  meanings: WordMeaning[];
  sourceUrls: string[];
}
