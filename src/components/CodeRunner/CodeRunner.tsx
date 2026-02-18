import styled, { keyframes } from 'styled-components';

import { useEffect, useRef } from 'react';

import { CodeRunnerButton } from './CodeRunnerButton';
import { CodeRunnerInput } from './CodeRunnerInput';
import { Leaderboard } from './Leaderboard';
import { MatrixDisplay } from './MatrixDisplay';
import {
	FEEDBACK_CORRECT,
	FEEDBACK_WRONG,
	useCodeRunner,
} from './useCodeRunner';

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

	const showNotContainsArrWarning =
		code.trim().length > 0 && !code.includes('a');

	useEffect(() => {
		if (isRoundReady) inputRef.current?.focus();
	}, [isRoundReady]);

	return (
		<Wrapper>
			{feedback === FEEDBACK_CORRECT && <CorrectPulseOverlay />}
			<Section>
				<MatrixCenteringWrap>
					<MatrixDisplay matrix={matrix} highlight={challenge} />
				</MatrixCenteringWrap>
			</Section>

			<InputSection>
				<InputWrap>
					{showNotContainsArrWarning && (
						<WarningMessage>
							Use <code>arr</code> to play
						</WarningMessage>
					)}
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
			</InputSection>

			<Leaderboard />

			{output && feedback === FEEDBACK_WRONG && (
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

const correctPulse = keyframes`
	0% { opacity: 0; }
	35% { opacity: 0.5; }
	100% { opacity: 0; }
`;

const CorrectPulseOverlay = styled.div`
	position: fixed;
	inset: 0;
	background: #22c55e;
	pointer-events: none;
	z-index: 9999;
	animation: ${correctPulse} 0.9s ease-out forwards;
`;

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

const InputSection = styled(Section)`
	margin-top: 1rem;
`;

const InputWrap = styled.div`
	position: relative;
	max-width: 22rem;
	width: 100%;
	margin: 0 auto;
`;

const WarningMessage = styled.span`
	position: absolute;
	bottom: 100%;
	left: 0;
	margin-bottom: 0.25rem;
	font-size: 0.875rem;
	color: #b45309;

	code {
		font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
	}
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
