import styled from 'styled-components';

type CodeRunnerButtonProps = {
	runCode: () => void;
	isRunning: boolean;
	disabled?: boolean;
};

export function CodeRunnerButton({
	runCode,
	isRunning,
	disabled = false,
}: CodeRunnerButtonProps) {
	return (
		<RunButton
			type="button"
			onClick={runCode}
			disabled={isRunning || disabled}
			aria-busy={isRunning}>
			{isRunning ? 'Running...' : disabled ? 'Loading…' : 'Run'}
		</RunButton>
	);
}

const RunButton = styled.button`
	padding: 0.6rem 1.5rem;
	font-size: 0.9rem;
	font-weight: 600;
	color: #fff;
	background: #0066cc;
	border: none;
	border-radius: 9999px;
	cursor: pointer;
	transition: background 0.2s ease, opacity 0.2s ease;

	&:hover:not(:disabled) {
		background: #0052a3;
	}

	&:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}
`;
