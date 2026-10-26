// Task 3: Character creator and live form validation
const REQUIRED_SKILL_POINTS = 20;
const MIN_SKILL_VALUE = 1;
const MAX_SKILL_VALUE = 10;
const MIN_CLASS_SKILL_VALUE = 5;
const MIN_CHARACTER_NAME_LENGTH = 3;
const MAX_CHARACTER_NAME_LENGTH = 18;
const TAKEN_CHARACTER_NAMES = ["Nova Starling", "Pixel", "Astra Vale"];
const SKILLS = ["strength", "agility", "intelligence", "charisma"];
const CLASS_SKILL_RULES = {
  mage: { skill: "intelligence", display: "Intelligence" },
  ranger: { skill: "agility", display: "Agility" },
  guardian: { skill: "strength", display: "Strength" },
};
const CLASS_LABELS = { mage: "Mage", ranger: "Ranger", guardian: "Guardian" };
const CLASS_ICONS = { mage: "✧", ranger: "➶", guardian: "⬟" };
const CLASS_TAGLINES = {
  mage: "A little magic goes a long way.",
  ranger: "Quick feet. Clear aim. Big heart.",
  guardian: "Steady, brave, and hard to move.",
};

const characterForm = document.querySelector("#character-form");
characterForm.noValidate = true;
const formSummary = document.querySelector("#form-summary");
const pointsUsedElement = document.querySelector("#points-used");
const pointsChip = document.querySelector(".points-chip");
const pointsErrorElement = document.querySelector("#skill-points-error");
const colorInput = document.querySelector("#character-color");
const colorValueElement = document.querySelector("#color-value");
const touchedFields = new Set();
let submitAttempted = false;

const fields = {
  characterName: { input: document.querySelector("#character-name"), error: document.querySelector("#name-error"), wrapper: document.querySelector("#character-name").closest(".field") },
  characterClass: { input: document.querySelector("#character-class"), error: document.querySelector("#class-error"), wrapper: document.querySelector("#character-class").closest(".field") },
  strength: { input: document.querySelector("#skill-strength"), error: document.querySelector("#strength-error"), wrapper: document.querySelector("#skill-strength").closest(".field") },
  agility: { input: document.querySelector("#skill-agility"), error: document.querySelector("#agility-error"), wrapper: document.querySelector("#skill-agility").closest(".field") },
  intelligence: { input: document.querySelector("#skill-intelligence"), error: document.querySelector("#intelligence-error"), wrapper: document.querySelector("#skill-intelligence").closest(".field") },
  charisma: { input: document.querySelector("#skill-charisma"), error: document.querySelector("#charisma-error"), wrapper: document.querySelector("#skill-charisma").closest(".field") },
};

function readFormValues() {
  return {
    name: fields.characterName.input.value.trim(),
    className: fields.characterClass.input.value,
    color: colorInput.value,
    strength: Number(fields.strength.input.value),
    agility: Number(fields.agility.input.value),
    intelligence: Number(fields.intelligence.input.value),
    charisma: Number(fields.charisma.input.value),
  };
}

function updateLivePreview() {
  const values = readFormValues();
  const total = SKILLS.reduce((sum, skill) => sum + values[skill], 0);
  pointsUsedElement.textContent = String(total);
  pointsChip.classList.toggle("is-valid", total === REQUIRED_SKILL_POINTS);
  pointsChip.classList.toggle("is-invalid", total !== REQUIRED_SKILL_POINTS);

  colorValueElement.textContent = values.color.toUpperCase();
  document.querySelector("#preview-art").style.setProperty("--avatar-color", values.color);
  document.querySelector("#preview-name").textContent = values.name || "Your hero starts here";
  document.querySelector("#preview-class-label").textContent = values.className ? CLASS_LABELS[values.className].toUpperCase() : "UNCLASSIFIED";
  document.querySelector("#preview-class-icon").textContent = values.className ? CLASS_ICONS[values.className] : "✧";
  document.querySelector("#preview-tagline").textContent = values.className ? CLASS_TAGLINES[values.className] : "A new adventure awaits.";
  SKILLS.forEach((skill) => {
    document.querySelector(`#preview-${skill}`).textContent = String(values[skill]);
  });
}

function validateName(value) {
  if (!value) return "Enter a character name.";
  if (value.length < MIN_CHARACTER_NAME_LENGTH || value.length > MAX_CHARACTER_NAME_LENGTH) {
    return `Use ${MIN_CHARACTER_NAME_LENGTH}–${MAX_CHARACTER_NAME_LENGTH} characters.`;
  }
  const nameIsTaken = TAKEN_CHARACTER_NAMES.some((takenName) => takenName.toLowerCase() === value.toLowerCase());
  if (nameIsTaken) return "That name is already taken. Try a different one.";
  return "";
}

function validateClass(value) {
  return CLASS_SKILL_RULES[value] ? "" : "Choose a character class.";
}

function validateSkill(skill, value, className) {
  if (!Number.isInteger(value) || value < MIN_SKILL_VALUE || value > MAX_SKILL_VALUE) {
    return `Enter a whole number from ${MIN_SKILL_VALUE} to ${MAX_SKILL_VALUE}.`;
  }
  const classRule = CLASS_SKILL_RULES[className];
  if (classRule?.skill === skill && value < MIN_CLASS_SKILL_VALUE) {
    return `${CLASS_LABELS[className]} needs at least ${MIN_CLASS_SKILL_VALUE} ${classRule.display} points.`;
  }
  return "";
}

function getValidation() {
  const values = readFormValues();
  const errors = {
    characterName: validateName(values.name),
    characterClass: validateClass(values.className),
    strength: validateSkill("strength", values.strength, values.className),
    agility: validateSkill("agility", values.agility, values.className),
    intelligence: validateSkill("intelligence", values.intelligence, values.className),
    charisma: validateSkill("charisma", values.charisma, values.className),
  };
  const allSkillsValid = SKILLS.every((skill) => errors[skill] === "");
  const totalPoints = SKILLS.reduce((sum, skill) => sum + values[skill], 0);
  const pointsError = allSkillsValid && totalPoints !== REQUIRED_SKILL_POINTS
    ? `Spend exactly ${REQUIRED_SKILL_POINTS} points. You currently have ${totalPoints}.`
    : "";
  return { values, errors, pointsError };
}

function renderFieldValidation(fieldName, message, shouldShow) {
  const field = fields[fieldName];
  if (!shouldShow) {
    field.error.textContent = "";
    field.wrapper.classList.remove("is-invalid", "is-valid");
    field.input.removeAttribute("aria-invalid");
    return;
  }
  field.error.textContent = message;
  field.wrapper.classList.toggle("is-invalid", Boolean(message));
  field.wrapper.classList.toggle("is-valid", !message);
  field.input.setAttribute("aria-invalid", String(Boolean(message)));
}

function renderValidation({ all = false } = {}) {
  const { errors, pointsError } = getValidation();
  Object.entries(errors).forEach(([fieldName, message]) => {
    const shouldShow = all || submitAttempted || touchedFields.has(fieldName);
    renderFieldValidation(fieldName, message, shouldShow);
  });
  const skillsTouched = SKILLS.some((skill) => touchedFields.has(skill));
  pointsErrorElement.textContent = all || submitAttempted || skillsTouched ? pointsError : "";
  return { errors, pointsError };
}

function showSubmitErrors(errors, pointsError) {
  const allMessages = [...Object.values(errors).filter(Boolean), pointsError].filter(Boolean);
  formSummary.replaceChildren();
  formSummary.className = "form-summary is-error";
  const heading = document.createElement("strong");
  heading.textContent = `${allMessages.length} ${allMessages.length === 1 ? "issue" : "issues"} to fix before creating your character.`;
  const errorList = document.createElement("ul");
  allMessages.forEach((message) => {
    const listItem = document.createElement("li");
    listItem.textContent = message;
    errorList.append(listItem);
  });
  formSummary.append(heading, errorList);

  const firstInvalidField = Object.keys(errors).find((fieldName) => errors[fieldName]);
  (firstInvalidField ? fields[firstInvalidField].input : fields.strength.input).focus();
}

function showCreatedCharacter(values) {
  const resultCard = document.createElement("div");
  resultCard.className = "created-character-card";
  const resultHeading = document.createElement("strong");
  resultHeading.textContent = `${values.name} the ${CLASS_LABELS[values.className]} is ready!`;
  const resultStats = document.createElement("span");
  resultStats.textContent = `STR ${values.strength} · AGI ${values.agility} · INT ${values.intelligence} · CHA ${values.charisma}`;
  resultCard.append(resultHeading, resultStats);
  formSummary.replaceChildren(resultCard);
  formSummary.className = "form-summary is-success";
  document.querySelector("#preview-success").textContent = "Character created successfully.";
}

function resetValidationState() {
  touchedFields.clear();
  submitAttempted = false;
  Object.values(fields).forEach((field) => {
    field.error.textContent = "";
    field.wrapper.classList.remove("is-invalid", "is-valid");
    field.input.removeAttribute("aria-invalid");
  });
  pointsErrorElement.textContent = "";
  document.querySelector("#preview-success").textContent = "";
  updateLivePreview();
}

Object.entries(fields).forEach(([fieldName, field]) => {
  field.input.addEventListener("blur", () => {
    touchedFields.add(fieldName);
    renderValidation();
  });
  field.input.addEventListener("input", () => {
    updateLivePreview();
    if (submitAttempted || touchedFields.has(fieldName)) renderValidation();
  });
  field.input.addEventListener("change", () => {
    updateLivePreview();
    if (submitAttempted || touchedFields.has(fieldName)) renderValidation();
  });
});

colorInput.addEventListener("input", updateLivePreview);
colorInput.addEventListener("change", updateLivePreview);

characterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitAttempted = true;
  const { values, errors, pointsError } = renderValidation({ all: true });
  const hasErrors = Object.values(errors).some(Boolean) || Boolean(pointsError);
  if (hasErrors) {
    showSubmitErrors(errors, pointsError);
    return;
  }

  characterForm.reset();
  resetValidationState();
  showCreatedCharacter(values);
});

characterForm.addEventListener("reset", () => {
  window.setTimeout(resetValidationState, 0);
});

updateLivePreview();
