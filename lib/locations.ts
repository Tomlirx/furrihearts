// Canonical list of all Malaysian states/federal territories. The actual set
// shown in location dropdowns is the subset marked launched in the
// `state_rollouts` table (admin-managed at /admin/locations), so a state can
// go live without a deploy.
export const ALL_MALAYSIA_STATES = [
  'Kuala Lumpur', 'Selangor', 'Penang', 'Johor', 'Perak', 'Melaka',
  'Negeri Sembilan', 'Pahang', 'Terengganu', 'Kelantan', 'Kedah', 'Perlis',
  'Sabah', 'Sarawak', 'Putrajaya', 'Labuan',
];

export async function getLaunchedStates(supabase?: any): Promise<string[]> {
  if (supabase?.from && !supabase.__isMock) {
    try {
      const { data, error } = await supabase
        .from('state_rollouts')
        .select('state_name')
        .eq('is_launched', true);
      if (!error && data) {
        const launched = new Set(data.map((row: any) => row.state_name));
        return ALL_MALAYSIA_STATES.filter((state) => launched.has(state));
      }
    } catch {
      // Falls back to the full list if the table hasn't been migrated yet.
    }
  }

  return ALL_MALAYSIA_STATES;
}
