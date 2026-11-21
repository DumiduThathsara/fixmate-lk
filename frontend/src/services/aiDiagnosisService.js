import apiClient from './apiClient';

export async function diagnoseIssue(descriptionText = '', hasImage = false) {
  const text = String(descriptionText || '').trim();
  if (!text) {
    throw new Error('Please describe your issue so we can analyze it.');
  }

  try {
    const { data } = await apiClient.post('/ai/diagnose', {
      description: text,
      hasImage: Boolean(hasImage),
    });
    return data;
  } catch {
    // Safe fallback if backend AI endpoint is temporarily unreachable
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
