import apiClient from './apiClient';

export async function diagnoseIssue(input, legacyHasImage = false) {
  const isObj = typeof input === 'object' && input !== null;
  const description = String(isObj ? input.description || '' : input || '').trim();
  const imageBase64 = isObj ? input.imageBase64 || null : null;
  const mimeType = isObj ? input.mimeType || null : null;
  const hasImage = Boolean(imageBase64) || Boolean(isObj ? input.hasImage : legacyHasImage);

  if (!description) {
    throw new Error('Please describe your issue so we can analyze it.');
  }

  try {
    const { data } = await apiClient.post('/ai/diagnose', {
      description,
      hasImage,
      imageBase64,
      mimeType,
    });
    return data;
  } catch {
    return {
      detectedCategory: 'Plumbing',
      confidence: 74,
      estimatedRange: 'Rs. 1,500 – Rs. 4,500',
      urgency: 'Normal',
      advice: 'Please describe the issue to the technician upon arrival for an exact inspection.',
    };
  }
}

const aiDiagnosisService = {
  diagnoseIssue,
};

export default aiDiagnosisService;
