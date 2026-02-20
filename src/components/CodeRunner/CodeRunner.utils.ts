export type Challenge =
	| { type: 'row'; index: number }
	| { type: 'column'; index: number }
	| {
			type: 'submatrix';
			rowStart: number;
			rowEnd: number;
			colStart: number;
			colEnd: number;
	  };

export type HighlightRegion = Challenge;

/**
 * Picks a random challenge type with valid indices for the given matrix size.
 */
export function pickRandomChallenge(rows: number, cols: number): Challenge {
	const safeRows = Math.max(1, rows);
	const safeCols = Math.max(1, cols);

	const kind = Math.floor(Math.random() * 4);
	if (kind === 0) {
		return { type: 'row', index: Math.floor(Math.random() * safeRows) };
	}
	if (kind === 1) {
		return { type: 'column', index: Math.floor(Math.random() * safeCols) };
	}
	/*
	 * Submatrix: half-open ranges [rowStart, rowEnd) and [colStart, colEnd),
	 * matching NumPy slicing. We pick a random:
	 * - top-left (rowStart, colStart)
	 * - rowEnd [rowStart+1, safeRows]
	 * - colEnd [colStart+1, safeCols]
	 */
	const rowStart = Math.floor(Math.random() * safeRows);
	const colStart = Math.floor(Math.random() * safeCols);
	const rowEnd =
		rowStart +
		1 +
		Math.floor(Math.random() * Math.max(0, safeRows - rowStart - 1));
	const colEnd =
		colStart +
		1 +
		Math.floor(Math.random() * Math.max(0, safeCols - colStart - 1));
	return {
		type: 'submatrix',
		rowStart,
		rowEnd: Math.max(rowEnd, rowStart + 1),
		colStart,
		colEnd: Math.max(colEnd, colStart + 1),
	};
}

/**
 * Returns a rows×cols matrix of random integers in [min, max] (inclusive).
 */
export function generateIntegerMatrix(
	rows: number,
	cols: number,
	min = 0,
	max = 9
): number[][] {
	const safeRows = Math.max(0, Math.floor(rows));
	const safeCols = Math.max(0, Math.floor(cols));
	return Array.from({ length: safeRows }, () =>
		Array.from(
			{ length: safeCols },
			() => Math.floor(Math.random() * (max - min + 1)) + min
		)
	);
}
