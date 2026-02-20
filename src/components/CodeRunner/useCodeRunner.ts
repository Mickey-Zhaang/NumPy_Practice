import { useCallback, useEffect, useRef, useState } from 'react';

import { recordPlayCount } from '../../lib/playCount';
import { CODE_RUNNER_PREAMBLE, PYODIDE_INDEX } from './CodeRunner.constants';
import type { Challenge } from './CodeRunner.utils';
import { generateIntegerMatrix, pickRandomChallenge } from './CodeRunner.utils';

const MIN_MATRIX_SIZE = 2;
const MAX_MATRIX_SIZE = 5;

function randomMatrixSize(): number {
	return (
		MIN_MATRIX_SIZE +
		Math.floor(Math.random() * (MAX_MATRIX_SIZE - MIN_MATRIX_SIZE + 1))
	);
}

const INITIAL_MATRIX = generateIntegerMatrix(
	randomMatrixSize(),
	randomMatrixSize(),
	0,
	9
);

export const FEEDBACK_CORRECT = 'Correct!';
export const FEEDBACK_WRONG = 'Not quite';

/**
 * Normalize output for comparison: collapse whitespace, trim, and strip
 * spaces next to brackets so NumPy's "[6 4 5 9]" and "[ 6 4 5 9 ]" match.
 */
function normalizeOutput(s: string): string {
	return s
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\s+\]/g, ']')
		.replace(/\[\s+/g, '[');
}

/**
 * Compare user output to expected: normalize whitespace, treat numeric values
 * as equal when they match (e.g. "3" vs "3.0"), and only consider the first
 * line of user output when expected is single-line (avoids stderr/buffer noise).
 */
const NUMERIC_TOLERANCE = 1e-10;

function outputsMatch(userOut: string, expected: string): boolean {
	const expectedNorm = normalizeOutput(expected);
	const firstLine = userOut.split(/\r?\n/)[0] ?? '';
	const userNorm = normalizeOutput(firstLine);
	const userFullNorm = normalizeOutput(userOut);
	if (userFullNorm === expectedNorm || userNorm === expectedNorm) return true;
	const numUser = Number(userNorm);
	const numExpected = Number(expectedNorm);
	return (
		Number.isFinite(numUser) &&
		Number.isFinite(numExpected) &&
		Math.abs(numUser - numExpected) < NUMERIC_TOLERANCE
	);
}

export function useCodeRunner() {
	const [matrix, setMatrix] = useState<number[][]>(() => INITIAL_MATRIX);
	const [challenge, setChallenge] = useState<Challenge | null>(null);
	const [expectedOutput, setExpectedOutput] = useState('');
	const [code, setCode] = useState('');
	const [output, setOutput] = useState('');
	const [feedback, setFeedback] = useState('');
	const [isRunning, setIsRunning] = useState(false);
	const runIdRef = useRef(0);
	const roundIdRef = useRef(0);

	const startNewRound = useCallback((matrixToUse?: number[][]) => {
		const isFirstRound = matrixToUse != null;
		const rows = isFirstRound ? matrixToUse!.length : randomMatrixSize();
		const cols = isFirstRound ? matrixToUse![0].length : randomMatrixSize();
		const newMatrix = isFirstRound
			? matrixToUse!
			: generateIntegerMatrix(rows, cols, 0, 9);
		const newChallenge = pickRandomChallenge(
			newMatrix.length,
			newMatrix[0].length
		);
		const thisRoundId = ++roundIdRef.current;
		setFeedback('');
		setOutput('');
		setCode('');
		setChallenge(null);
		setExpectedOutput('');
		if (!isFirstRound) {
			setMatrix(newMatrix);
		}
		getPyodide()
			.then(pyodide => runChallengeExpected(pyodide, newMatrix, newChallenge))
			.then(expected => {
				if (thisRoundId !== roundIdRef.current) return;
				setChallenge(newChallenge);
				setExpectedOutput(expected);
			})
			.catch(() => {
				if (thisRoundId !== roundIdRef.current) return;
				setExpectedOutput('');
			});
	}, []);

	useEffect(() => {
		startNewRound(INITIAL_MATRIX);
	}, [startNewRound]);

	const runCode = useCallback(() => {
		if (!expectedOutput) return;
		setOutput('');
		setFeedback('');
		setIsRunning(true);
		const thisRunId = ++runIdRef.current;

		getPyodide()
			.then(pyodide => runPython(pyodide, code, matrix))
			.then(({ stdout, error }) => {
				if (thisRunId !== runIdRef.current) return;
				if (error) {
					setOutput(`Error: ${error}`);
					setFeedback(FEEDBACK_WRONG);
					return;
				}
				const userOut = (stdout ?? '').trim();
				const displayOut = stdout?.trim() ? stdout : '(no output)';
				setOutput(displayOut);
				const isCorrect = outputsMatch(userOut, expectedOutput.trim());
				setFeedback(isCorrect ? FEEDBACK_CORRECT : FEEDBACK_WRONG);
				if (isCorrect) {
					recordPlayCount();
					setTimeout(() => startNewRound(), 900);
				}
			})
			.catch(err => {
				if (thisRunId !== runIdRef.current) return;
				setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
				setFeedback(FEEDBACK_WRONG);
			})
			.finally(() => {
				if (thisRunId === runIdRef.current) setIsRunning(false);
			});
	}, [code, matrix, expectedOutput, startNewRound]);

	return {
		matrix,
		challenge,
		expectedOutput,
		code,
		setCode,
		output,
		isRunning,
		runCode,
		feedback,
		isRoundReady: expectedOutput.length > 0,
	};
}

function getPyodide(): Promise<Awaited<ReturnType<typeof loadPyodide>>> {
	if (typeof window === 'undefined' || !window.loadPyodide) {
		return Promise.reject(
			new Error('Pyodide failed to load. Refresh the page.')
		);
	}
	if (!getPyodide.cache) {
		getPyodide.cache = window
			.loadPyodide({ indexURL: PYODIDE_INDEX })
			.then(py => py.loadPackage('numpy').then(() => py))
			.then(py => py.runPythonAsync(CODE_RUNNER_PREAMBLE).then(() => py));
	}
	return getPyodide.cache;
}
getPyodide.cache = null as Promise<
	Awaited<ReturnType<typeof loadPyodide>>
> | null;

if (typeof window !== 'undefined') {
	getPyodide();
}

function buildChallengePrintCode(
	matrix: number[][],
	challenge: Challenge
): string {
	const arr = `np.array(${JSON.stringify(matrix)})`;
	if (challenge.type === 'row') {
		return `arr = ${arr}\nprint(arr[${challenge.index}, :])`;
	}
	if (challenge.type === 'column') {
		return `arr = ${arr}\nprint(arr[:, ${challenge.index}])`;
	}
	const { rowStart, rowEnd, colStart, colEnd } = challenge;
	const singleColumn = colEnd - colStart === 1;
	const singleRow = rowEnd - rowStart === 1;
	if (singleColumn && singleRow) {
		return `arr = ${arr}\nprint(arr[${rowStart}, ${colStart}])`;
	}
	if (singleColumn) {
		return `arr = ${arr}\nprint(arr[${rowStart}:${rowEnd}, ${colStart}])`;
	}
	if (singleRow) {
		return `arr = ${arr}\nprint(arr[${rowStart}, ${colStart}:${colEnd}])`;
	}
	return `arr = ${arr}\nprint(arr[${rowStart}:${rowEnd}, ${colStart}:${colEnd}])`;
}

export function runChallengeExpected(
	pyodide: Awaited<ReturnType<typeof loadPyodide>>,
	matrix: number[][],
	challenge: Challenge
): Promise<string> {
	const code = buildChallengePrintCode(matrix, challenge);
	return runPython(pyodide, code).then(({ stdout, error }) => {
		if (error) throw new Error(error);
		const lines = stdout.trim().split(/\r?\n/).filter(Boolean);
		return lines.at(-1) ?? stdout.trim();
	});
}

export function runPython(
	pyodide: Awaited<ReturnType<typeof loadPyodide>>,
	code: string,
	matrix?: number[][]
): Promise<{ stdout: string; error?: string }> {
	const outLines: string[] = [];
	pyodide.setStdout({ batched: (msg: string) => outLines.push(msg) });
	pyodide.setStderr({ batched: () => {} });
	let userCode = code.trim();
	if (matrix != null && !userCode.startsWith('print(')) {
		userCode = `__result = (${userCode})\nprint(__result)`;
	}
	const fullCode =
		matrix != null
			? `arr = np.array(${JSON.stringify(matrix)})\n\n${userCode}`
			: userCode;
	return pyodide
		.runPythonAsync(fullCode)
		.then(() => ({ stdout: outLines.join('\n') }))
		.catch((err: unknown) => ({
			stdout: outLines.join('\n'),
			error: err instanceof Error ? err.message : String(err),
		}));
}
