/// <reference types="vite/client" />

interface PyodideInterface {
	runPythonAsync(code: string): Promise<void>;
	loadPackage(names: string | string[]): Promise<void>;
	setStdout(options: { batched: (msg: string) => void }): void;
	setStderr(options: { batched: (msg: string) => void }): void;
}

declare function loadPyodide(config?: {
	indexURL?: string;
}): Promise<PyodideInterface>;

declare global {
	interface Window {
		loadPyodide: typeof loadPyodide;
	}
}
