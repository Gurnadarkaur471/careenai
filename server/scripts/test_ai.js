require('dotenv').config();
const ai = require('../src/services/aiService');

(async () => {
  try {
    console.log('[test_ai] calling generateSkillGapExplanation...');
    const res = await ai.generateSkillGapExplanation({ missing: ['JS'] }, 'Frontend Developer');
    console.log('[test_ai] success:', res);
  } catch (err) {
    console.error('[test_ai] error message:', err.message);
    if (err.providerError) console.error('[test_ai] providerError:', err.providerError);
    if (err.providerCode) console.error('[test_ai] providerCode:', err.providerCode);
    process.exit(1);
  }
})();
