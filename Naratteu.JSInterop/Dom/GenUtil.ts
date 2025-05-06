export const GenBlob = async (gen: () => AsyncGenerator<string>) => await new Response(GenStream(gen)).blob();
export const GenStream = (gen: () => AsyncGenerator<string>) => new ReadableStream({
	async start(ctrl) {
		for await (const chunk of gen()) {
			ctrl.enqueue(chunk);
			ctrl.enqueue('\n');
		}
		ctrl.close();
	}
});