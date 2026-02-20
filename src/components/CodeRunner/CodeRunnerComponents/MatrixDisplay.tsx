import styled from 'styled-components';

import type { HighlightRegion } from './CodeRunner.utils';

function isHighlighted(
	i: number,
	j: number,
	highlight: HighlightRegion
): boolean {
	if (highlight.type === 'row') return i === highlight.index;
	if (highlight.type === 'column') return j === highlight.index;
	const { rowStart, rowEnd, colStart, colEnd } = highlight;
	return i >= rowStart && i < rowEnd && j >= colStart && j < colEnd;
}

type MatrixDisplayProps = {
	matrix: number[][];
	highlight?: HighlightRegion | null;
};

export function MatrixDisplay({ matrix, highlight }: MatrixDisplayProps) {
	if (!matrix?.length || !matrix[0]?.length) {
		return (
			<Card>
				<Grid aria-label="No matrix">—</Grid>
			</Card>
		);
	}
	return (
		<Card>
			<Grid role="img" aria-label="Given matrix">
				{matrix.map((row, i) => (
					<Row key={i}>
						{row.map((cell, j) => (
							<Cell
								key={j}
								$highlighted={
									highlight != null && isHighlighted(i, j, highlight)
								}>
								{cell}
							</Cell>
						))}
					</Row>
				))}
			</Grid>
		</Card>
	);
}

const Card = styled.div`
	padding: 1.5rem;
	background: rgb(232, 232, 232);
	border: 1px solid #eee;
	border-radius: 12px;
	display: inline-block;
`;

const Grid = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
	font-size: 1.25rem;
	line-height: 1.4;
`;

const Row = styled.div`
	display: flex;
	gap: 0.75rem;
	justify-content: flex-start;
`;

const Cell = styled.span<{ $highlighted?: boolean }>`
	min-width: 2.75rem;
	padding: 0.35em 0.5em;
	text-align: center;
	${p =>
		p.$highlighted
			? `
		background: rgba(0, 102, 204, 0.2);
		border-radius: 8px;
	`
			: ''}
`;
