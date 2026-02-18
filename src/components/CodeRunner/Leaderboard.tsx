import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';

import { supabase } from '../../lib/supabase';

type LeaderboardEntry = {
	anonymous_id: string;
	total_rounds: number;
};

// async funciton to retrieve leaderboard information
async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
	const { data, error } = await supabase
		.from('play_counts')
		.select('anonymous_id, total_rounds')
		.order('total_rounds', { ascending: false })
		.limit(10);
	if (error) throw error;
	return data ?? [];
}

export function Leaderboard() {
	const { data: entries = [] } = useQuery({
		queryKey: ['leaderboard'],
		queryFn: fetchLeaderboard,
		refetchInterval: 20_000,
		refetchIntervalInBackground: true,
	});

	return (
		<LeaderboardCard>
			<Title>Leaderboards</Title>
			<List>
				{entries.map((entry, i) => (
					<Row key={entry.anonymous_id}>
						#{i + 1} -- Rounds: {entry.total_rounds}
					</Row>
				))}
			</List>
		</LeaderboardCard>
	);
}

const Title = styled.div`
	gap: 0.5rem;
	font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
	font-size: 1.25rem;
	line-height: 1.4;
`;

const List = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	margin-top: 0.5rem;
`;

const Row = styled.div`
	display: flex;
	padding: 0 1rem;
	flex-direction: row;
	gap: 0.5rem;
	border-radius: 12px;
	background: rgba(0, 102, 204, 0.2);
`;

const BREAKPOINT = 768;

const LeaderboardCard = styled.div`
	padding: 1.5rem;
	background: rgb(232, 232, 232);
	border: 1px solid #eee;
	border-radius: 12px;
	margin-top: 1.5rem;
	width: 100%;
	max-width: 100%;

	@media (min-width: ${BREAKPOINT}px) {
		position: fixed;
		top: 4rem;
		right: 2rem;
		margin-top: 0;
		width: auto;
		max-width: 280px;
	}
`;
