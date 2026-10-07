// Session-only random choice for the comparison mockup; no product assessment.
export function createPairSuggestion(random: () => number = Math.random) {
  const choices = new Map<string, string>();
  return (ids: readonly string[]): { id: string; slot: 'A' | 'B' } | null => {
    if (ids.length !== 2 || !ids[0] || !ids[1] || ids[0] === ids[1]) return null;
    const key = JSON.stringify([...ids].sort());
    let id = choices.get(key);
    if (!id) {
      id = ids[random() < .5 ? 0 : 1];
      choices.set(key, id);
    }
    return { id, slot: id === ids[0] ? 'A' : 'B' };
  };
}
