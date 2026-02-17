import styled from 'styled-components';

import { CodeRunner } from './components';

function App() {
	return (
		<AppWrapper>
			<Title>NumPy Playground</Title>
			<CodeRunner />
		</AppWrapper>
	);
}

const AppWrapper = styled.div`
	padding: 2rem 1.5rem;
	max-width: 640px;
	margin: 0 auto;
`;

const Title = styled.h1`
	text-align: center;
	margin-bottom: 1rem;
`;

export default App;
