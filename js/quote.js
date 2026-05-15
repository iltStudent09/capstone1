// --- Form Validation ---
function validateForm(form) {
    let isValid = true;
    let firstInvalid = null;
    let messages = [];
    // Remove previous errors
    form.querySelectorAll('.input-error').forEach(el => {
        el.classList.remove('input-error');
        el.removeAttribute('aria-invalid');
    });
    form.querySelectorAll('.error-message').forEach(el => el.remove());

    // Validate required fields
    form.querySelectorAll('input, select, textarea').forEach(field => {
        if (field.type === 'hidden' || field.disabled) return;
        const isRequired = field.hasAttribute('required');
        let error = '';
        // Log field being validated
        console.log(`Validating field: ${field.id || field.name} in form: ${form.id}`);
        if (isRequired && !field.value.trim()) {
            error = 'This field is required.';
        } else if (field.type === 'email' && field.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(field.value)) {
            error = 'Please enter a valid email address.';
                } else if (field.type === 'number' && field.value) {
                    const min = field.getAttribute('min');
                    const max = field.getAttribute('max');
                    const val = parseFloat(field.value);
                    if (min && val < parseFloat(min)) error = `Must be at least ${min}.`;
                    if (max && val > parseFloat(max)) error = `Must be no more than ${max}.`;
                } else if (field.hasAttribute('pattern') && field.value) {
                    const pattern = new RegExp(field.getAttribute('pattern'));
                    if (!pattern.test(field.value)) error = 'Invalid format.';
                }
                if (error) {
                    isValid = false;
                    field.classList.add('input-error');
                    field.setAttribute('aria-invalid', 'true');
                    const msg = document.createElement('div');
                    msg.className = 'error-message';
                    msg.textContent = error;
                    if (field.parentNode) field.parentNode.appendChild(msg);
                    if (!firstInvalid) firstInvalid = field;
                    messages.push(field.labels && field.labels[0] ? field.labels[0].textContent : field.name || field.id || 'Field');
                }
            });
            if (!isValid && firstInvalid) {
                firstInvalid.focus();
                showValidationSummary(form, messages);
            } else {
                hideValidationSummary(form);
            }
            return isValid;
        }
        
        // --- Validation summary helpers ---
        function showValidationSummary(form, messages) {
            let summary = form.querySelector('.validation-summary');
            if (!summary) {
                summary = document.createElement('div');
                summary.className = 'validation-summary';
                form.insertBefore(summary, form.firstChild);
            }
            summary.innerHTML = '<strong>Please fix the following:</strong><ul>' + messages.map(m => `<li>${m}</li>`).join('') + '</ul>';
            summary.style.display = 'block';
        }
        
        function hideValidationSummary(form) {
            let summary = form.querySelector('.validation-summary');
            if (summary) summary.style.display = 'none';
        }
        
        function clearValidationAllForms() {
            ['auto-form', 'home-form', 'life-form'].forEach(formId => {
                const form = document.getElementById(formId);
                if (!form) return;
                // Remove error classes and messages
                form.querySelectorAll('.input-error').forEach(el => {
                    el.classList.remove('input-error');
                    el.removeAttribute('aria-invalid');
                });
                form.querySelectorAll('.error-message').forEach(el => el.remove());
                // Hide validation summary
                let summary = form.querySelector('.validation-summary');
                if (summary) summary.style.display = 'none';
            });
        }
        
        function setupValidation(formId) {
            const form = document.getElementById(formId);
            if (!form) return;
            form.addEventListener('submit', function(e) {
                if (!validateForm(form)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
            // Optional: validate on input/change
            form.querySelectorAll('input, select, textarea').forEach(field => {
                field.addEventListener('focus', () => {
                    console.log(`Focused field: ${field.id || field.name} in form: ${formId}`);
                });
                field.addEventListener('input', () => validateForm(form));
                field.addEventListener('change', () => validateForm(form));
            });
        }
        
        // --- Show/hide form fields based on insurance type radio selection ---
        function updateFormVisibility() {
            const autoFormContainer = document.getElementById('auto-form-container');
            const homeFormContainer = document.getElementById('home-form-container');
            const lifeFormContainer = document.getElementById('life-form-container');
            const selected = document.querySelector('input[name="insuranceType"]:checked').value;
            [autoFormContainer, homeFormContainer, lifeFormContainer].forEach(container => {
                if (container) container.classList.remove('active-form');
            });
            if (selected === 'auto' && autoFormContainer) autoFormContainer.classList.add('active-form');
            if (selected === 'home' && homeFormContainer) homeFormContainer.classList.add('active-form');
            if (selected === 'life' && lifeFormContainer) {
                lifeFormContainer.classList.add('active-form');
                console.log('Life insurance form shown');
            }
            clearValidationAllForms();
        }
        
        // --- DOMContentLoaded: Setup validation and form visibility ---
        document.addEventListener('DOMContentLoaded', function () {
            setupValidation('auto-form');
            setupValidation('home-form');
            setupValidation('life-form');
        
            document.querySelectorAll('input[name="insuranceType"]').forEach(radio => {
                radio.addEventListener('change', function(e) {
                    if (e.target.value === 'life') {
                        console.log('Life insurance radio button pressed');
                    }
                    updateFormVisibility();
                });
            });
            updateFormVisibility();
        });
        
        // --- Anchor smooth scroll ---
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                var target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // --- Active nav highlighting based on scroll position ---
        document.addEventListener('DOMContentLoaded', function () {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
            function onScroll() {
                let scrollPos = window.scrollY || window.pageYOffset;
                let found = false;
                sections.forEach(section => {
                    const rect = section.getBoundingClientRect();
                    const sectionTop = rect.top + window.scrollY - 80;
                    const sectionBottom = sectionTop + section.offsetHeight;
                    if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                        navLinks.forEach(link => {
                            link.classList.remove('active');
                            if (link.getAttribute('href').replace('#', '') === section.id) {
                                link.classList.add('active');
                                found = true;
                            }
                        });
                    }
                });
                // If no section is found, highlight Home
                if (!found) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#') {
                            link.classList.add('active');
                        }
                    });
                }
            }
        
            window.addEventListener('scroll', onScroll);
            onScroll(); // Initial call
        });