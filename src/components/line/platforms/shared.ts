/** Anchor id shared by the departure board links and each platform band. */
export const platformAnchor = (index: number) => `pf-${index + 1}`;

/** "PF 01" style platform number, so the board and the signs always agree. */
export const platformNumber = (index: number) => String(index + 1).padStart(2, "0");
