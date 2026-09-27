export function requireFields(body, fields) {
  const missing = fields.filter(
    (field) =>
      body[field] === undefined ||
      body[field] === null ||
      body[field] === ""
  );

  return missing;
}

export function isValidLevel(level) {
  return ["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(level);
}

export function isValidSkillStatus(status) {
  return ["ACTIVE", "PAUSED", "COMPLETED"].includes(status);
}