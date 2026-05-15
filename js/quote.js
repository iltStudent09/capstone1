// --- Sync card selection with dropdown ---
document.addEventListener('DOMContentLoaded', function () {
  const autoCard = document.querySelector('label[for="radio-auto"]');
  const homeCard = document.querySelector('label[for="radio-home"]');
  const lifeCard = document.querySelector('label[for="radio-life"]');
    if (autoCard) autoCard.addEventListener('click', function () {
      document.getElementById('radio-auto').checked = true;
      insuranceType.value = 'auto';
      insuranceType.dispatchEvent(new Event('change', { bubbles: true }));
    });
    if (homeCard) homeCard.addEventListener('click', function () {
      document.getElementById('radio-home').checked = true;
      insuranceType.value = 'home';
      insuranceType.dispatchEvent(new Event('change', { bubbles: true }));
    });
    if (lifeCard) lifeCard.addEventListener('click', function () {
      document.getElementById('radio-life').checked = true;
      insuranceType.value = 'life';
      insuranceType.dispatchEvent(new Event('change', { bubbles: true }));
    });
});
const quoteForm = document.getElementById('quoteForm');
const insuranceType = document.getElementById('insuranceType');
const autoFields = document.getElementById('autoFields');
const homeFields = document.getElementById('homeFields');
const lifeFields = document.getElementById('lifeFields');
const results = document.getElementById('results');
const validationSummary = document.getElementById('validationSummary');

const currentYear = new Date().getFullYear();
const vehicleYearInput = document.getElementById('vehicleYear');
vehicleYearInput.max = currentYear + 1;

const planMultipliers = {
  Basic: 0.85,
  Standard: 1.0,
  Premium: 1.25
};

const planCoverages = {
  Basic: ['State minimum liability', 'Standard deductible', 'Online policy documents'],
  Standard: ['Higher liability limits', 'Lower deductible', 'Roadside or property assistance'],
  Premium: ['Highest liability limits', 'Lowest deductible', 'Enhanced replacement coverage']
};

const fieldRules = {
  insuranceType: { label: 'Insurance type', required: true },
  fullName: { label: 'Full name', required: true, minLength: 2, pattern: /^[a-zA-Z .'-]+$/ },
  age: { label: 'Age', required: true, min: 18, max: 100 },
  zipCode: { label: 'ZIP code', required: true, pattern: /^\d{5}$/ },
  creditRating: { label: 'Credit rating', required: true },
  claims: { label: 'Claims in last 5 years', required: true, min: 0, max: 10 },
  vehicleYear: { label: 'Vehicle year', required: true, min: 1990, max: currentYear + 1, type: 'number' },
  vehicleValue: { label: 'Vehicle value', required: true, min: 1000, max: 250000, type: 'number' },
  annualMileage: { label: 'Annual mileage', required: true, min: 1000, max: 100000, type: 'number' },
  drivingRecord: { label: 'Driving record', required: true },
  homeValue: { label: 'Home value', required: true, min: 50000, max: 5000000, type: 'number' },
  homeAge: { label: 'Home age', required: true, min: 0, max: 150, type: 'number' },
  constructionType: { label: 'Construction type', required: true },
  securitySystem: { label: 'Security system', required: true },
  smoker: { label: 'Smoker', required: true },
  coverageAmount: { label: 'Coverage amount', required: true },
  exerciseFrequency: { label: 'Exercise frequency', required: true },
  preexistingConditions: { label: 'Preexisting conditions', required: false },
  lifeCoverageLevel: { label: 'Coverage level', required: true }
};

const commonFields = ['insuranceType', 'fullName', 'age', 'zipCode', 'creditRating', 'claims'];
const autoSpecificFields = ['vehicleYear', 'vehicleValue', 'annualMileage', 'drivingRecord'];
const homeSpecificFields = ['homeValue', 'homeAge', 'constructionType', 'securitySystem'];
const lifeSpecificFields = ['smoker', 'coverageAmount', 'exerciseFrequency', 'preexistingConditions', 'lifeCoverageLevel'];

insuranceType.addEventListener('change', () => {
  const isAuto = insuranceType.value === 'auto';
  const isHome = insuranceType.value === 'home';
  const isLife = insuranceType.value === 'life';
  autoFields.classList.toggle('hidden', !isAuto);
  homeFields.classList.toggle('hidden', !isHome);
  lifeFields.classList.toggle('hidden', !isLife);
  clearValidation();
  results.classList.add('hidden');
});

quoteForm.addEventListener('input', (event) => {
  const field = event.target;
  if (field.id && fieldRules[field.id]) validateField(field.id);
});

quoteForm.addEventListener('change', (event) => {
  const field = event.target;
  if (field.id && fieldRules[field.id]) validateField(field.id);
});

quoteForm.addEventListener('submit', (event) => {
  event.preventDefault();
  clearValidation();

  const validation = validateForm();
  if (!validation.isValid) {
    renderValidationSummary(validation.errors);
    results.classList.add('hidden');
    focusFirstInvalidField(validation.errors);
    return;
  }

  const type = insuranceType.value;
  const name = getValue('fullName');
  let summary = {};
  let basePremium = 0;
  let breakdown = [];

  if (type === 'auto') {
    ({ basePremium, breakdown } = calculateAutoBreakdown());
  } else if (type === 'home') {
    ({ basePremium, breakdown } = calculateHomeBreakdown());
  } else if (type === 'life') {
    ({ basePremium, breakdown } = calculateLifeBreakdown());
  }

  renderQuoteSummary(name, type, basePremium, breakdown);
});

function getActiveFieldIds() {
  if (insuranceType.value === 'auto') {
    return [...commonFields, ...autoSpecificFields];
  } else if (insuranceType.value === 'home') {
    return [...commonFields, ...homeSpecificFields];
  } else if (insuranceType.value === 'life') {
    return [...commonFields, ...lifeSpecificFields];
  }
  return commonFields;
}

function validateForm() {
  const errors = [];
  getActiveFieldIds().forEach((id) => {
    const message = validateField(id);
    if (message) errors.push({ id, message });
  });
  return { isValid: errors.length === 0, errors };
}

function validateField(id) {
  const field = document.getElementById(id);
  const rules = fieldRules[id];
  const value = field.value.trim();
  let message = '';

  if (rules.required && !value) {
    message = `${rules.label} is required.`;
  } else if (rules.type === 'number' || field.type === 'number') {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
      message = `${rules.label} must be a valid number.`;
    } else if (rules.min !== undefined && numberValue < rules.min) {
      message = `${rules.label} must be at least ${formatPlainNumber(rules.min)}.`;
    } else if (rules.max !== undefined && numberValue > rules.max) {
      message = `${rules.label} must be no more than ${formatPlainNumber(rules.max)}.`;
    }
  } else if (rules.minLength && value.length < rules.minLength) {
    message = `${rules.label} must be at least ${rules.minLength} characters.`;
  } else if (rules.pattern && !rules.pattern.test(value)) {
    message = getPatternMessage(id, rules.label);
  }

  setFieldError(field, message);
  return message;
}

function getPatternMessage(id, label) {
  const messages = {
    fullName: 'Full name can only include letters, spaces, periods, apostrophes, and hyphens.',
    zipCode: 'ZIP code must be exactly 5 digits.'
  };
  return messages[id] || `${label} is not in the expected format.`;
}

function setFieldError(field, message) {
  const label = field.closest('label');
  let errorElement = label.querySelector('.error-message');

  if (!errorElement) {
    errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    label.appendChild(errorElement);
  }

  field.classList.toggle('input-error', Boolean(message));
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  errorElement.textContent = message;
}

function renderValidationSummary(errors) {
  validationSummary.innerHTML = `
    <strong>Please fix the following before calculating your quote:</strong>
    <ul>${errors.map((error) => `<li>${escapeHtml(error.message)}</li>`).join('')}</ul>
  `;
  validationSummary.classList.remove('hidden');
}

function focusFirstInvalidField(errors) {
  const firstInvalid = errors[0] && document.getElementById(errors[0].id);
  if (firstInvalid) firstInvalid.focus();
}

function clearValidation() {
  validationSummary.classList.add('hidden');
  validationSummary.innerHTML = '';
  document.querySelectorAll('.input-error').forEach((field) => {
    field.classList.remove('input-error');
    field.removeAttribute('aria-invalid');
  });
  document.querySelectorAll('.error-message').forEach((error) => {
    error.textContent = '';
  });
}


function calculateAutoBreakdown() {
  const age = getNumber('age');
  const vehicleYear = getNumber('vehicleYear');
  const vehicleValue = getNumber('vehicleValue');
  const annualMileage = getNumber('annualMileage');
  const drivingRecord = getValue('drivingRecord');
  const claims = getNumber('claims');
  const creditRating = getValue('creditRating');
  // Coverage level: use Standard for now (could add UI for this)
  const coverageLevel = 'Standard';

  let breakdown = [];
  let base = 75;
  breakdown.push({ factor: 'Base monthly rate', info: '$75', impact: '$75' });

  // Vehicle value
  const vehicleValueImpact = vehicleValue * 0.004;
  base += vehicleValueImpact;
  breakdown.push({ factor: 'Vehicle value', info: formatCurrency(vehicleValue), impact: '+' + formatCurrency(vehicleValueImpact) });

  // Age factor
  let ageFactor = 1.0;
  if (age < 25) ageFactor = 1.5;
  else if (age > 65) ageFactor = 1.3;
  breakdown.push({ factor: 'Age', info: age, impact: `×${ageFactor}` });

  // Vehicle age
  const vehicleAge = currentYear - vehicleYear;
  let vehicleAgeFactor = 1.0;
  if (vehicleAge < 3) vehicleAgeFactor = 1.3;
  else if (vehicleAge > 10) vehicleAgeFactor = 0.8;
  breakdown.push({ factor: 'Vehicle age', info: vehicleAge + ' years', impact: `×${vehicleAgeFactor}` });

  // Mileage factor
  let mileageFactor = 1.0;
  if (annualMileage < 5000) mileageFactor = 0.8;
  else if (annualMileage < 10000) mileageFactor = 1.0;
  else if (annualMileage < 15000) mileageFactor = 1.1;
  else if (annualMileage < 20000) mileageFactor = 1.3;
  else mileageFactor = 1.5;
  breakdown.push({ factor: 'Annual mileage', info: annualMileage, impact: `×${mileageFactor}` });

  // Driving record
  let drivingRecordFactor = 1.0;
  if (drivingRecord === 'clean') drivingRecordFactor = 1.0;
  else if (drivingRecord === 'minor') drivingRecordFactor = 1.2;
  else if (drivingRecord === 'major') drivingRecordFactor = 1.5;
  breakdown.push({ factor: 'Driving record', info: drivingRecord, impact: `×${drivingRecordFactor}` });

  // Claims
  let claimsImpact = claims > 0 ? `+${formatCurrency(claims * 30)}` : '$0';
  breakdown.push({ factor: 'Claims in last 5 years', info: claims, impact: claimsImpact });
  base += claims * 30;

  // Coverage level
  let coverageLevelFactor = 1.0;
  if (coverageLevel === 'Basic') coverageLevelFactor = 0.8;
  else if (coverageLevel === 'Standard') coverageLevelFactor = 1.0;
  else if (coverageLevel === 'Premium') coverageLevelFactor = 1.4;
  breakdown.push({ factor: 'Coverage level', info: coverageLevel, impact: `×${coverageLevelFactor}` });

  // Credit rating
  let creditFactor = 1.0;
  if (creditRating === 'excellent') creditFactor = 0.9;
  else if (creditRating === 'good') creditFactor = 1.0;
  else if (creditRating === 'fair') creditFactor = 1.12;
  else if (creditRating === 'poor') creditFactor = 1.28;
  breakdown.push({ factor: 'Credit rating', info: creditRating, impact: `×${creditFactor}` });

  // Calculate total
  let premium = base;
  premium *= ageFactor;
  premium *= vehicleAgeFactor;
  premium *= mileageFactor;
  premium *= drivingRecordFactor;
  premium *= coverageLevelFactor;
  premium *= creditFactor;
  premium = Math.max(40, premium);

  return { basePremium: premium, breakdown };
}


function calculateHomeBreakdown() {
  const homeValue = getNumber('homeValue');
  const homeAge = getNumber('homeAge');
  const constructionType = getValue('constructionType');
  const securitySystem = getValue('securitySystem');
  const claims = getNumber('claims');
  const age = getNumber('age');
  const creditRating = getValue('creditRating');
  // Coverage level: use Standard for now
  const coverageLevel = 'Standard';

  let breakdown = [];
  // Base monthly rate
  const base = (homeValue * 0.003) / 12;
  breakdown.push({ factor: 'Base monthly rate', info: formatCurrency(homeValue), impact: formatCurrency(base) });

  // Year built factor
  let yearBuiltFactor = 1.0;
  if (homeAge > (currentYear - 1970)) yearBuiltFactor = 1.4;
  else if (homeAge > (currentYear - 1999)) yearBuiltFactor = 1.1;
  breakdown.push({ factor: 'Year built', info: currentYear - homeAge, impact: `×${yearBuiltFactor}` });

  // Construction factor
  let constructionFactor = 1.0;
  if (constructionType === 'frame') constructionFactor = 1.2;
  else if (constructionType === 'brick') constructionFactor = 1.0;
  else if (constructionType === 'mixed') constructionFactor = 0.9;
  breakdown.push({ factor: 'Construction type', info: constructionType, impact: `×${constructionFactor}` });

  // Security discount
  let securityFactor = 1.0;
  if (securitySystem === 'yes') securityFactor = 0.95;
  breakdown.push({ factor: 'Security system', info: securitySystem, impact: `×${securityFactor}` });

  // Claims
  let claimsImpact = claims > 0 ? `+${formatCurrency(claims * 40)}` : '$0';
  breakdown.push({ factor: 'Claims in last 5 years', info: claims, impact: claimsImpact });

  // Coverage level
  let coverageLevelFactor = 1.0;
  if (coverageLevel === 'Basic') coverageLevelFactor = 0.8;
  else if (coverageLevel === 'Standard') coverageLevelFactor = 1.0;
  else if (coverageLevel === 'Premium') coverageLevelFactor = 1.4;
  breakdown.push({ factor: 'Coverage level', info: coverageLevel, impact: `×${coverageLevelFactor}` });

  // Credit rating
  let creditFactor = 1.0;
  if (creditRating === 'excellent') creditFactor = 0.9;
  else if (creditRating === 'good') creditFactor = 1.0;
  else if (creditRating === 'fair') creditFactor = 1.12;
  else if (creditRating === 'poor') creditFactor = 1.28;
  breakdown.push({ factor: 'Credit rating', info: creditRating, impact: `×${creditFactor}` });

  // Calculate total
  let premium = base;
  premium *= yearBuiltFactor;
  premium *= constructionFactor;
  premium *= securityFactor;
  premium *= coverageLevelFactor;
  premium *= creditFactor;
  premium = Math.max(40, premium);

  return { basePremium: premium, breakdown };
}
function calculateLifeBreakdown() {
  const age = getNumber('age');
  const coverageAmount = Number(document.getElementById('coverageAmount').value);
  const smoker = document.querySelector('input[name="smoker"]:checked')?.value || 'no';
  const exerciseFrequency = document.getElementById('exerciseFrequency').value;
  const preexistingConditions = document.getElementById('preexistingConditions').checked;
  // Gender not in form, so default to 'Female' for now
  const gender = 'Female';
  // Coverage level: use Standard for now
  const coverageLevel = document.querySelector('input[name="lifeCoverageLevel"]:checked')?.value || 'Standard';

  let breakdown = [];
  // Base monthly rate
  const base = (coverageAmount * 0.0005) / 12;
  breakdown.push({ factor: 'Base monthly rate', info: formatCurrency(coverageAmount), impact: formatCurrency(base) });

  // Age factor
  let ageFactor = 1.0;
  if (age >= 18 && age <= 30) ageFactor = 1.0;
  else if (age >= 31 && age <= 45) ageFactor = 1.5;
  else if (age >= 46 && age <= 60) ageFactor = 2.5;
  else if (age >= 61 && age <= 85) ageFactor = 4.0;
  breakdown.push({ factor: 'Age', info: age, impact: `×${ageFactor}` });

  // Smoker factor
  let smokerFactor = smoker === 'yes' ? 2.0 : 1.0;
  breakdown.push({ factor: 'Smoker', info: smoker, impact: `×${smokerFactor}` });

  // Exercise frequency
  let exerciseFactor = 1.3;
  if (exerciseFrequency === 'none') exerciseFactor = 1.3;
  else if (exerciseFrequency === 'sometimes') exerciseFactor = 1.1;
  else if (exerciseFrequency === 'regular') exerciseFactor = 1.0;
  else if (exerciseFrequency === 'daily') exerciseFactor = 0.9;
  breakdown.push({ factor: 'Exercise frequency', info: exerciseFrequency, impact: `×${exerciseFactor}` });

  // Pre-existing conditions
  let preexistingFactor = preexistingConditions ? 1.5 : 1.0;
  breakdown.push({ factor: 'Preexisting conditions', info: preexistingConditions ? 'Yes' : 'No', impact: `×${preexistingFactor}` });

  // Gender factor
  let genderFactor = 1.0;
  if (gender === 'Male') genderFactor = 1.1;
  else if (gender === 'Female') genderFactor = 1.0;
  else if (gender === 'Non-binary') genderFactor = 1.05;
  breakdown.push({ factor: 'Gender', info: gender, impact: `×${genderFactor}` });

  // Coverage level
  let coverageLevelFactor = 1.0;
  if (coverageLevel === 'Basic') coverageLevelFactor = 0.8;
  else if (coverageLevel === 'Standard') coverageLevelFactor = 1.0;
  else if (coverageLevel === 'Premium') coverageLevelFactor = 1.4;
  breakdown.push({ factor: 'Coverage level', info: coverageLevel, impact: `×${coverageLevelFactor}` });

  // Calculate total
  let premium = base;
  premium *= ageFactor;
  premium *= smokerFactor;
  premium *= exerciseFactor;
  premium *= preexistingFactor;
  premium *= genderFactor;
  premium *= coverageLevelFactor;
  premium = Math.max(20, premium);

  return { basePremium: premium, breakdown };
}

function applyCreditAdjustment(premium, rating) {
  const adjustments = {
    excellent: 0.9,
    good: 1,
    fair: 1.12,
    poor: 1.28
  };

  return Math.max(40, premium * adjustments[rating]);
}


function renderQuoteSummary(name, type, basePremium, breakdown) {
  let typeLabel = '';
  if (type === 'auto') typeLabel = 'Auto Insurance';
  else if (type === 'home') typeLabel = 'Home Insurance';
  else if (type === 'life') typeLabel = 'Life Insurance';

  let tableRows = breakdown.map(row => `
    <tr>
      <td>${escapeHtml(row.factor)}</td>
      <td>${escapeHtml(row.info)}</td>
      <td>${escapeHtml(row.impact)}</td>
    </tr>
  `).join('');

  results.innerHTML = `
    <div class="card mb-4">
      <h2 class="mb-2">Quote Summary</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Insurance Type:</strong> ${escapeHtml(typeLabel)}</p>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Factor</th>
            <th>Your Info</th>
            <th>Impact</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <div class="alert alert-success mt-3">
        <strong>Estimated Monthly Premium: ${formatCurrency(basePremium)}</strong>
      </div>
      <p class="disclaimer mt-2">
        This is a sample estimate for demo purposes only and is not a binding insurance offer.
      </p>
    </div>
  `;
  results.classList.remove('hidden');
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function getValue(id) {
  return document.getElementById(id).value.trim();
}

function getNumber(id) {
  return Number(document.getElementById(id).value) || 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

function formatPlainNumber(value) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
