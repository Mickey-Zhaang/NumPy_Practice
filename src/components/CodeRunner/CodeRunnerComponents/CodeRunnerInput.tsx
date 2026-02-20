import styled from 'styled-components';

import { forwardRef } from 'react';

type CodeRunnerInputProps = {
	code: string;
	setCode: (value: string) => void;
	disabled?: boolean;
};

export const CodeRunnerInput = forwardRef<
	HTMLInputElement,
	CodeRunnerInputProps
>(function CodeRunnerInput({ code, setCode, disabled = false }, ref) {
	return (
		<Input
			ref={ref}
			id="code-input"
			type="text"
			placeholder="e.g. arr[1, :]"
			value={code}
			onChange={e => setCode(e.target.value)}
			spellCheck={false}
			autoComplete="off"
			disabled={disabled}
			aria-label="Python code (one line)"
		/>
	);
});

const Input = styled.input`
	width: 100%;
	padding: 0.875rem 1rem;
	font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
	font-size: 0.9rem;
	line-height: 1.5;
	border: 1px solid #e0e0e0;
	border-radius: 12px;
	background: #fff;
	transition:
		border-color 0.2s ease,
		box-shadow 0.2s ease;

	&:focus {
		outline: 2px solid #0066cc;
		outline-offset: 2px;
		box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.12);
	}

	&:disabled {
		opacity: 0.8;
		cursor: not-allowed;
	}
`;
