import styled from 'styled-components';

import { CodeRunnerButton } from './CodeRunnerButton';
import { CodeRunnerinput } from './CodeRunnerInput';
import { MatrixDisplay } from './MatrixDisplay';
import { useCodeRunner } from './useCodeRunner';

const Feedback = styled.p<{ $success: boolean }>`
	margin: 0;
	font-size: 1rem;
	font-weight: 600;
	color: ${p => (p.$success ? '#0a6b0a' : '#c00')};
`;

export function CodeRunner() {
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

	return (
		<Wrapper>
			<Section>
				<Label as="span">Retrieve...</Label>
				<MatrixDisplay matrix={matrix} highlight={challenge} />
			</Section>

			{feedback ? (
				<Feedback $success={feedback === 'Correct!'}>{feedback}</Feedback>
			) : null}

			<Section>
				<Label htmlFor="code-input">Code</Label>
				<CodeRunnerinput
					code={code}
					setCode={setCode}
					isRunning={isRunning || !isRoundReady}
				/>
				<Row>
					<CodeRunnerButton
						runCode={runCode}
						isRunning={isRunning}
						disabled={!isRoundReady}
					/>
				</Row>
			</Section>

			{output ? (
				<Section>
					<Label as="span">Output</Label>
					<Output aria-live="polite">{output}</Output>
					<Label as="span">Expected</Label>
					<Output aria-live="polite">{expectedOutput}</Output>
				</Section>
			) : null}
		</Wrapper>
	);
}

const Wrapper = styled.div`
	max-width: 640px;
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

const Row = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 1rem;
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
