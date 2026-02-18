import { supabase } from './supabase';

const STORAGE_KEY = 'numpy-play-anon-id';

function getAnonymousId(): string {
	let id = localStorage.getItem(STORAGE_KEY);
	if (!id) {
		id = crypto.randomUUID();
		localStorage.setItem(STORAGE_KEY, id);
	}
	return id;
}

/**
 * Records one completed round in Supabase (fire-and-forget).
 * Expects table: play_counts (anonymous_id text, total_rounds integer).
 */
export function recordPlayCount(): void {
	const anonymousId = getAnonymousId();
	supabase
		.from('play_counts')
		.select('total_rounds')
		.eq('anonymous_id', anonymousId)
		.maybeSingle()
		.then(({ data, error: selectError }) => {
			if (selectError) {
				console.error('[playCount] select error:', selectError);
				return;
			}
			if (data != null) {
				return supabase
					.from('play_counts')
					.update({ total_rounds: data.total_rounds + 1 })
					.eq('anonymous_id', anonymousId)
					.then(({ error }) => {
						if (error) console.error('[playCount] update error:', error);
					});
			}
			return supabase
				.from('play_counts')
				.insert({ anonymous_id: anonymousId, total_rounds: 1 })
				.then(({ error }) => {
					if (error) console.error('[playCount] insert error:', error);
				});
		});
}
