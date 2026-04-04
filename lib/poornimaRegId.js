/**
 * Maps Poornima Google email local parts to college registration IDs.
 * 2023pietcsaaditya003 -> PIET23CS003
 * Unmatched values (e.g. teacher usernames) are returned unchanged.
 */

const BRANCH_ALT = "cs|cr|ca|cd|ad|ci|ec";

const OLD_LOCAL_PART_RE = new RegExp(
  `^(\\d{4})piet(${BRANCH_ALT})([a-z]+)(\\d{3})$`,
  "i"
);

/**
 * @param {string} localPart — part before @ in the email
 * @returns {string} College regId when pattern matches; otherwise the trimmed local part
 */
export function resolveRegIdFromPoornimaEmailLocalPart(localPart) {
  const trimmed = (localPart || "").trim();
  if (!trimmed) return trimmed;

  const m = trimmed.match(OLD_LOCAL_PART_RE);
  if (!m) return trimmed;

  const [, year4, branch, , roll3] = m;
  const yy = String(year4).slice(-2);
  const br = branch.toUpperCase();
  const roll = String(roll3).padStart(3, "0");
  return `PIET${yy}${br}${roll}`;
}
