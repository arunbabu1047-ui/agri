import { apiRequest, isApiConfigured } from '../lib/api';

export async function translateText(text, sourceLanguage, targetLanguage) {
  if (!isApiConfigured) throw new Error('Translation requires the Python API connection.');
  return apiRequest('/translate', {
    method: 'POST',
    body: JSON.stringify({ text, source_language: sourceLanguage, target_language: targetLanguage }),
  });
}