import styled from 'styled-components';

import { useEffect, useRef } from 'react';

import { CodeRunnerButton } from './CodeRunnerButton';
import { CodeRunnerInput } from './CodeRunnerInput';
import { Leaderboard } from './Leaderboard';
import { MatrixDisplay } from './MatrixDisplay';
import { FEEDBACK_CORRECT, useCodeRunner } from './useCodeRunner';

const Feedback = styled.p<{ $success: boolean }>`
	margin: 0;
	font-size: 1rem;
	font-weight: 600;
	color: ${p => (p.$success ? '#0a6b0a' : '#c00')};
`;

export function CodeRunner() {
	const inputRef = useRef<HTMLInputElement>(null);
	const {
		matrix,
		challenge,
		code,
		setCode,
		output,
		expectedOutput,
		isRunning,
		runCode,
		feedback,
		isRoundReady,
	} = useCodeRunner();

	useEffect(() => {
		if (isRoundReady) inputRef.current?.focus();
	}, [isRoundReady]);

	return (
		<Wrapper>
			<Leaderboard />
			<Section>
				<MatrixCenteringWrap>
					<MatrixDisplay matrix={matrix} highlight={challenge} />
				</MatrixCenteringWrap>
			</Section>

			{feedback && (
				<Feedback $success={feedback === FEEDBACK_CORRECT}>{feedback}</Feedback>
			)}

			<Section>
				<InputWrap>
					<CodeRunnerInput
						ref={inputRef}
						code={code}
						setCode={setCode}
						disabled={isRunning || !isRoundReady}
					/>
				</InputWrap>
				<Row>
					<CodeRunnerButton
						runCode={runCode}
						isRunning={isRunning}
						disabled={!isRoundReady}
					/>
				</Row>
			</Section>

			{output && (
				<Section>
					<Label as="span">Your Output</Label>
					<Output aria-live="polite">{output}</Output>
					<Label as="span">Expected</Label>
					<Output aria-live="polite">{expectedOutput}</Output>
				</Section>
			)}
		</Wrapper>
	);
}

const Wrapper = styled.div`
	max-width: 500px;
	margin: 0 auto;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1.5rem;
`;

const Section = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	width: 100%;
`;

const InputWrap = styled.div`
	max-width: 22rem;
	width: 100%;
	margin: 0 auto;
`;

const MatrixCenteringWrap = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
	margin-top: 1rem;
`;

const Row = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 1rem;
`;

const Label = styled.label`
	font-size: 0.875rem;
	font-weight: 600;
	color: #555;
`;

const Output = styled.pre`
	margin: 0;
	padding: 1.25rem;
	min-height: 80px;
	font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
	font-size: 0.875rem;
	line-height: 1.5;
	background: #1e1e1e;
	color: #d4d4d4;
	border-radius: 12px;
	overflow: auto;
	white-space: pre-wrap;
	word-break: break-word;
`;
