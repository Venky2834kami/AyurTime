/**
 * Assessment Model — AyurTime API
 * Represents a single Prakriti questionnaire submission.
 */

const { v4: uuidv4 } = require('uuid');

/**
 * @typedef {Object} Answer
 * @property {string} questionId   - ID of the question (e.g. 'body_frame')
 * @property {string} value        - Selected answer value (e.g. 'slim')
 *
 * @typedef {Object} Assessment
 * @property {string}   assessmentId   - UUID primary key
 * @property {string}   userId         - ID of the submitting user (or 'anonymous')
 * @property {Answer[]} answers        - Array of questionnaire answers
 * @property {string}   status         - 'pending' | 'scored'
 * @property {string}   createdAt      - ISO8601 creation timestamp
 */

function createAssessment({ userId = 'anonymous', answers }) {
  const errors = validateAssessment({ answers });
  if (errors.length) throw new Error(errors.join('; '));

  return {
    assessmentId: uuidv4(),
    userId,
    answers,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

function validateAssessment({ answers }) {
  const errors = [];
  if (!Array.isArray(answers) || answers.length === 0)
    errors.push('answers must be a non-empty array');
  else {
    answers.forEach((ans, i) => {
      if (!ans.questionId) errors.push(`answers[${i}]: questionId is required`);
      if (ans.value === undefined || ans.value === null)
        errors.push(`answers[${i}]: value is required`);
    });
  }
  return errors;
}

module.exports = { createAssessment, validateAssessment };
