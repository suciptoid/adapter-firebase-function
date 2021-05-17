import '@sveltejs/kit/install-fetch'; // eslint-disable-line import/no-unresolved

// TODO hardcoding the relative location makes this brittle
import { render } from '../output/server/app.js'; // eslint-disable-line import/no-unresolved

export const ssr = async (req, res) => {
	const host = `${req.headers['x-forwarded-proto']}://${req.headers.host}`;
	const { pathname, searchParams } = new URL(req.url || '', host);

	const rendered = await render({
		method: req.method,
		headers: req.headers,
		path: pathname,
		query: searchParams,
		rawBody: req.rawBody
	});

	if (rendered) {
		const { status, headers, body } = rendered;
		return res.writeHead(status, headers).end(body);
	}

	return res.writeHead(404).end();
};

export default ssr